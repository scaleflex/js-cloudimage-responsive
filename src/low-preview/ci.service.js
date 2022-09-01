import { isLowQualityPreview } from 'cloudimage-responsive-utils/dist/utils/is-low-quality-preview';
import { determineContainerProps } from 'cloudimage-responsive-utils/dist/utils/determine-container-props';
import { getImgSRC } from 'cloudimage-responsive-utils/dist/utils/get-img-src';
import { generateURL } from 'cloudimage-responsive-utils/dist/utils/generate-url';
import { getPreviewSRC } from 'cloudimage-responsive-utils/dist/utils/get-preview-src';
import { getBreakpoint } from 'cloudimage-responsive-utils/dist/utils/get-breakpoint';
import { isSupportedInBrowser } from 'cloudimage-responsive-utils/dist/utils/is-supported-in-browser';
import { generateAlt } from 'cloudimage-responsive-utils/dist/utils/generate-alt';
import { debounce } from 'throttle-debounce';
import {
  destroyNodeImgSize,
  getBackgroundImageProps,
  getFreshCIElements,
  getImageProps,
  isLazy,
  removeClassNames,
  setAlt,
  setBackgroundSrc,
  setOptions,
  setSrc,
  setSrcset,
  createGalleryModal,
  createThmbnailsModule,
  displayZoomIcon,
  destroyZoomIcon,
  getGalleryImages,
  createGalleryArrows,
  getGalleryLengthAndIndex,
  setGalleryIndex,
  getGalleryPreviewModule,
} from '../common/ci.utils';
import { getInitialConfigLowPreview } from './ci.config';
import {
  applyBackgroundStyles,
  applyOrUpdateWrapper,
  initImageClasses,
  loadBackgroundImage,
  onImageLoad,
  onLazyBeforeUnveil,
  onPreviewImageLoad,
  setAnimation,
  wrapBackgroundContainer,
  updateSizeWithPixelRatio,
} from './ci.utis';
import { bgContentAttr, loadedImageClassNames, processedAttr } from '../common/ci.constants';


export default class CIResponsive {
  constructor(config) {
    this.config = getInitialConfigLowPreview(config);

    if (this.config.init) this.init();

    this.innerWidth = window.innerWidth;
  }

  init() {
    document.addEventListener('lazybeforeunveil', onLazyBeforeUnveil);
    window.addEventListener('resize', debounce(100, this.onUpdateDimensions.bind(this)));

    this.process();
  }

  onUpdateDimensions() {
    this.process(true);

    if (this.innerWidth < window.innerWidth) {
      this.innerWidth = window.innerWidth;
    }
  }

  process(isUpdate, rootElement = document) {
    const { imgSelector, bgSelector } = this.config;
    const windowScreenBecomesBigger = this.innerWidth < window.innerWidth;
    const [images, backgroundImages] = getFreshCIElements(isUpdate, rootElement, imgSelector, bgSelector);

    if (images.length > -1) {
      images.forEach((imgNode) => {
        this.getBasicInfo(imgNode, isUpdate, windowScreenBecomesBigger, 'image', images);
      });
    }

    if (backgroundImages.length > -1) {
      backgroundImages.forEach((imgNode) => {
        this.getBasicInfo(imgNode, isUpdate, windowScreenBecomesBigger, 'background');
      });
    }
  }

  getBasicInfo = (imgNode, isUpdate, windowScreenBecomesBigger, type, images) => {
    const isImage = type === 'image';
    const { config } = this;
    const {
      baseURL, lazyLoading, presets, devicePixelRatioList, minLowQualityWidth, imgSelector, bgSelector,
    } = config;
    const imgProps = isImage
      ? getImageProps(imgNode, imgSelector) : getBackgroundImageProps(imgNode, bgSelector);
    const {
      params, imgNodeSRC, isLazyCanceled, sizes, isAdaptive, preserveSize, minWindowWidth, alt,
    } = imgProps;

    if (!imgNodeSRC) return;

    let [src, isSVG] = getImgSRC(imgNodeSRC, baseURL);
    const lazy = isLazy(lazyLoading, isLazyCanceled, isUpdate);
    let size;

    if (!isSupportedInBrowser(true)) {
      if (isImage) {
        imgNode.src = src;
      } else {
        imgNode.style.backgroundImage = `url(${src})`;
      }

      return;
    }

    if (window.innerWidth < minWindowWidth && !isImage) {
      imgNode.style.backgroundImage = 'none';
      return;
    }

    if (isAdaptive) {
      size = getBreakpoint(sizes, presets);

      if (size) {
        if (size.params.src) {
          [src, isSVG] = getImgSRC(size.params.src, baseURL);
        }
      }
    } else if (isUpdate && !windowScreenBecomesBigger) return;

    const containerProps = determineContainerProps({
      ...imgProps, size, imgNode, config,
    });
    const { width } = containerProps;
    const isPreview = isLowQualityPreview(isAdaptive, width, isSVG, minLowQualityWidth);
    const generateURLbyDPR = (devicePixelRatio) => generateURL({
      src, params, config, containerProps, devicePixelRatio,
    });
    const cloudimageUrl = generateURLbyDPR();
    const cloudimageSrcset = devicePixelRatioList.map((dpr) => ({ dpr: dpr.toString(), url: generateURLbyDPR(dpr) }));
    const props = {
      imgNode, isUpdate, imgProps, lazy, isPreview, containerProps, isSVG, cloudimageUrl, src, preserveSize, isAdaptive, imgSelector, alt: alt || generateAlt(src),
    };

    if (isImage) {
      this.processImage({
        ...props, cloudimageUrl: generateURLbyDPR(1), cloudimageSrcset, images,
      });
    } else {
      this.processBackgroundImage(props);
    }
  };

  // processNextImage = (nextIndex, galleryThmbnailsModule, imgSelector, galleryModal) => {
  //   const nextImageSrc = galleryThmbnailsModule[nextIndex].querySelector('[ci-src]').getAttribute('ci-src');
  //   const nextImage = galleryPreviewImage(imgSelector, nextImageSrc);

  //   const previewModule = galleryModal.querySelector('.ci-gallery-preview-module');

  //   previewModule.removeChild(previewModule.firstElementChild);
  //   previewModule.append(nextImage);

  //   markCurrentImage(galleryThmbnailsModule, nextIndex);

  //   this.process(false, previewModule);
  // }

  handleArrowClick(galleryImages, direction) {
    let nextIndex = 0;
    const [length, index] = getGalleryLengthAndIndex();

    nextIndex = +index;

    if (direction === 'left') {
      nextIndex -= 1;

      if ((length - 1 + nextIndex) <= 0) { // left button
        nextIndex = length - 1;
      }
    } else {
      nextIndex += 1;

      if ((length - 1 + nextIndex) > length) { // right button
        nextIndex = 0;
      }
    }

    this.processGalleryPreviewImage(galleryImages[nextIndex]);
    setGalleryIndex(nextIndex);
  }

  processGalleryPreviewImage(imgNode) {
    const _imgNode = imgNode.cloneNode();
    const adaptedImageNode = removeClassNames(_imgNode, loadedImageClassNames);
    const previewModule = getGalleryPreviewModule();

    adaptedImageNode.style = {};
    adaptedImageNode.setAttribute('data-ci-processed-gallery', true);
    previewModule.innerHTML = '';
    previewModule.appendChild(adaptedImageNode);

    this.process(false, previewModule);
  }

  handleClickThumbnail(galleryImages, event) {
    const thumbnail = event.currentTarget;
    const thumbnailIndex = thumbnail.getAttribute('data-ci-gallery-index');
    const [, index] = getGalleryLengthAndIndex();

    if (thumbnailIndex !== index) {
      setGalleryIndex(thumbnailIndex);
      this.processGalleryPreviewImage(galleryImages[thumbnailIndex]);
    }
  }

  handleClickWrapper(imgProps, images, event) {
    const { gallery, zoom, isProcessedByGallery } = imgProps;

    if (isProcessedByGallery) return;

    if (gallery) {
      const clickedImage = event.currentTarget.lastChild;
      const galleryImages = getGalleryImages(images, gallery);
      const clickedImageIndex = galleryImages.indexOf(clickedImage);

      const galleryModal = createGalleryModal(galleryImages.length);
      const previewModule = galleryModal.querySelector('.ci-gallery-preview-module');
      const thumbnailsModule = createThmbnailsModule(
        galleryImages,
        galleryModal,
        this.handleClickThumbnail.bind(this, galleryImages),
      );

      const galleryArrows = createGalleryArrows(this.handleArrowClick.bind(this, galleryImages));

      galleryModal.appendChild(previewModule);
      galleryModal.appendChild(thumbnailsModule);
      galleryModal.append(...galleryArrows);
      document.body.appendChild(galleryModal);

      this.processGalleryPreviewImage(galleryImages[clickedImageIndex]);
      setGalleryIndex(clickedImageIndex);
    }

    if (zoom && !gallery) {
      const galleryModal = createGalleryModal();
      const previewModule = galleryModal.querySelector('.ci-gallery-preview-module');

      galleryModal.appendChild(previewModule);

      document.body.appendChild(galleryModal);

      this.process(false, previewModule);
    }
  }

  processImage(props) {
    const {
      imgNode,
      isUpdate,
      imgProps,
      lazy,
      isPreview,
      containerProps,
      isSVG,
      cloudimageUrl,
      src,
      preserveSize,
      cloudimageSrcset,
      isAdaptive,
      images,
      alt,
    } = props;
    const { params, gallery, isProcessedByGallery } = imgProps;
    const { width, ratio } = containerProps;
    const { config } = this;
    const { dataSrcAttr, placeholderBackground } = config;
    const { wrapper, previewImgNode, previewWrapper } = applyOrUpdateWrapper(
      {
        isUpdate, imgNode, ratio, lazy, placeholderBackground, preserveSize, isPreview, ...imgProps, alt,
      },
    );

    if (!isUpdate) {
      initImageClasses({ imgNode, lazy });
      setAlt(imgNode, alt);

      if (config.destroyNodeImgSize) {
        destroyNodeImgSize(imgNode);
      }

      if (isPreview) {
        const previewImgURL = getPreviewSRC({
          src, params, config, containerProps,
        });

        setAnimation(previewWrapper, previewImgNode, updateSizeWithPixelRatio(width));
        setSrc(previewImgNode, previewImgURL, 'data-src', lazy, src, isSVG, dataSrcAttr);

        previewImgNode.onload = () => {
          onPreviewImageLoad(wrapper, previewImgNode, ratio, preserveSize);
        };
      }
    }

    imgNode.onload = () => {
      if (config.onImageLoad && typeof config.onImageLoad === 'function') {
        config.onImageLoad(imgNode);
      }

      if (gallery && !isProcessedByGallery) {
        wrapper.style.cursor = 'pointer';
      }

      wrapper.onclick = this.handleClickWrapper.bind(this, imgProps, images);
      wrapper.onmouseenter = () => displayZoomIcon(wrapper, imgProps);
      wrapper.onmouseout = () => destroyZoomIcon(wrapper);

      onImageLoad(wrapper, previewImgNode, imgNode, ratio, preserveSize, isAdaptive);
    };

    setSrcset(imgNode, cloudimageSrcset, 'data-srcset', lazy, src, isSVG, dataSrcAttr);
    setSrc(imgNode, cloudimageUrl, 'data-src', lazy, src, isSVG, dataSrcAttr);
  }

  processBackgroundImage(props) {
    const {
      imgNode, isUpdate, imgProps, lazy, isPreview, containerProps, isSVG, cloudimageUrl, src,
    } = props;
    const { params } = imgProps;
    const { width } = containerProps;
    const { config } = this;
    const { dataSrcAttr } = config;

    if (!isUpdate) {
      imgNode.setAttribute(processedAttr, true);

      if (isPreview) {
        const previewImgURL = getPreviewSRC({
          src, params, config, containerProps,
        });
        const [previewBox, contentBox] = wrapBackgroundContainer(imgNode);

        applyBackgroundStyles({
          imgNode, previewBox, contentBox, lazy, width,
        });

        if (lazy) {
          imgNode.setAttribute('ci-optimized-url', cloudimageUrl);

          setBackgroundSrc(previewBox, previewImgURL, lazy, src, isSVG, dataSrcAttr);
        } else {
          loadBackgroundImage(previewImgURL, isPreview, previewBox, cloudimageUrl);
        }
      } else {
        imgNode.className = `${imgNode.className}${lazy ? ' lazyload' : ''}`;
        loadBackgroundImage(cloudimageUrl, false, imgNode, null);
      }
    } else {
      setBackgroundSrc(imgNode, cloudimageUrl, lazy, src, isSVG, dataSrcAttr);
    }
  }

  updateImage(node, src, options) {
    if (!node) return;

    const { imgSelector, bgSelector } = this.config;

    const isImage = node.hasAttribute(imgSelector);
    const isBackground = node.hasAttribute(bgSelector);
    const elementParentNode = node.parentNode;

    if (options && typeof options === 'object') {
      node = setOptions(node, options);
    }

    if (isImage) {
      const isProcessed = node.classList.contains('ci-image');

      if (src) {
        node.setAttribute(imgSelector, src);
      }

      if (isProcessed) {
        const adaptedImageNode = removeClassNames(node, loadedImageClassNames);

        elementParentNode.parentNode.replaceChild(adaptedImageNode, elementParentNode);
      }
    }

    if (isBackground) {
      const isProcessed = node.getAttribute(processedAttr);
      const oldNode = node;

      if (src) {
        node.setAttribute(bgSelector, src);
      }

      if (isProcessed) {
        const contentBox = node.querySelector(`[${bgContentAttr}]`);

        if (contentBox) {
          const contentBoxInner = contentBox.firstChild;
          node.removeAttribute(processedAttr);
          node.innerHTML = '';
          node.appendChild(contentBoxInner);
        } else {
          node.parentNode.replaceChild(node, oldNode); // replace the old node if isPreview is false
        }
      }
    }

    this.getBasicInfo(node, false, false, isImage ? 'image' : 'background');
  }

  addImage(node) {
    if (!node) return;

    const { imgSelector } = this.config;
    const isImage = node.hasAttribute(imgSelector);

    this.getBasicInfo(node, false, false, isImage ? 'image' : 'background');
  }
}
