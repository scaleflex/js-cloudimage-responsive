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
  setAlt,
  setBackgroundSrc,
  setOptions,
  setSrc,
  setSrcset,
  removeClassNames,
} from '../common/ci.utils';
import {
  createIcon,
  destroyGallery,
  createGalleryModal,
  getGalleryPreviewModule,
  setGalleryIndex,
  createGalleryArrows,
  getGalleryLengthAndIndex,
  createThmbnailsModule,
  getGalleryImages,
  getZoomImages,
  getDimAndFit,
  updateOrCreateImageNameWrapper,
  swapArrayPositions,
  toggleActiveThumbnail,
} from './gallery.utils';
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
import {
  loadedImageClassNames, ATTRIBUTES, CLASSNAMES, ICONS_STYLES,
} from '../common/ci.constants';
import closeIconSvg from '../public/close-icon.svg';
import rightArrowSvg from '../public/right-arrow-icon.svg';
import leftArrowSvg from '../public/left-arrow-icon.svg';
import zoomIconSvg from '../public/zoom-icon.svg';


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

  handleModalKeydown(galleryImages, event) {
    const { keyCode } = event;
    const leftKeyCodes = [37, 40]; // left and down
    const rightKeyCodes = [39, 38]; // right and up

    if (galleryImages) {
      if (leftKeyCodes.includes(keyCode)) {
        this.handleClickArrows(galleryImages, 'left');
      }

      if (rightKeyCodes.includes(keyCode)) {
        this.handleClickArrows(galleryImages, 'right');
      }
    }

    if (keyCode === 27) { // esc
      destroyGallery();
    }
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

  getBasicInfo = (
    imgNode,
    isUpdate,
    windowScreenBecomesBigger,
    type,
    images,
    isGalleryImg,
  ) => {
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
    } else if (isUpdate && !windowScreenBecomesBigger) {
      getDimAndFit(imgNode);

      return;
    }

    const containerProps = determineContainerProps({
      ...imgProps, size, imgNode, config,
    });
    const { width } = containerProps;
    const isPreview = !isGalleryImg && isLowQualityPreview(isAdaptive, width, isSVG, minLowQualityWidth);
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
        ...props,
        cloudimageUrl: generateURLbyDPR(1),
        cloudimageSrcset,
        images,
        isGalleryImg,
      });
    } else {
      this.processBackgroundImage(props);
    }
  };

  getImageIndex(currentIndex, direction, isLoaded = true) {
    let nextIndex = currentIndex;
    const [length, index] = getGalleryLengthAndIndex();
    const leftDirection = direction === 'left';

    if (isLoaded) {
      nextIndex = +index;
    }

    if (leftDirection) {
      nextIndex -= 1;

      if (nextIndex < 0) { // reached left-end
        nextIndex = length - 1;
      }
    } else {
      nextIndex += 1;

      if (nextIndex === length) { // reached right-end
        nextIndex = 0;
      }
    }

    return nextIndex;
  }

  handleClickArrows(galleryImages, direction) {
    let index = 0;
    index = this.getImageIndex(0, direction);

    const previewImage = galleryImages[index].previousSibling.firstChild;
    const isLoaded = previewImage.classList.contains(CLASSNAMES.PREVIEW_LOADED);

    if (!isLoaded) {
      index = this.getImageIndex(index, direction, false);
    }

    this.processGalleryPreviewImage(galleryImages[index], index, direction);
    setGalleryIndex(index);
  }

  animatePreviewModule(previewModule, nextIndex, direction) {
    const currentIndex = previewModule.getAttribute(CLASSNAMES.ACTIVE_IMAGE_INDEX);
    const leftDirection = direction === 'left';
    let transform = 1000;
    let scale = 0.8;

    if (leftDirection || (!direction && nextIndex < currentIndex)) {
      transform = -1000;
    }

    const scaleAnimation = setInterval(() => { // Scale preview image
      scale += 0.01;

      if (scale >= 1) {
        clearInterval(scaleAnimation);
      }

      previewModule.style.transform = `scale(${scale}) translate(${transform}px)`;
    }, 10);

    const transformAnimation = setInterval(() => { // Transform preview image
      if (leftDirection || (!direction && nextIndex < currentIndex)) {
        transform += 20;
      } else {
        transform -= 20;
      }

      if (transform === 0) {
        clearInterval(transformAnimation);
      }

      previewModule.style.transform = `scale(${scale}) translate(${transform}px)`;
    }, 5);
  }

  processZoomPreviewImage(imgNode) {
    const _imgNode = imgNode.cloneNode();
    const adaptedImageNode = removeClassNames(_imgNode, loadedImageClassNames);
    const previewModule = getGalleryPreviewModule();

    adaptedImageNode.style = {};
    adaptedImageNode.setAttribute(ATTRIBUTES.PROCESSED_GALLERY, true);
    previewModule.innerHTML = '';
    previewModule.appendChild(adaptedImageNode);

    this.getBasicInfo(adaptedImageNode, false, false, 'image', undefined, true);
  }

  processGalleryPreviewImage(imgNode, imageIndex, direction, intial) {
    const { imgSelector } = this.config;
    const { imageName, alt } = getImageProps(imgNode, imgSelector);
    const galleryModal = document.querySelector(`.${CLASSNAMES.GALLERY_MODAL}`);
    const _imgNode = imgNode.cloneNode();
    const adaptedImageNode = removeClassNames(_imgNode, loadedImageClassNames);
    const previewModule = getGalleryPreviewModule();
    const _imageName = imageName || alt || generateAlt(alt);

    updateOrCreateImageNameWrapper(_imageName, galleryModal);
    toggleActiveThumbnail(galleryModal, imageIndex);
    adaptedImageNode.style = {};
    adaptedImageNode.setAttribute(ATTRIBUTES.PROCESSED_GALLERY, true);
    previewModule.setAttribute(ATTRIBUTES.ACTIVE_IMAGE_INDEX, imageIndex);
    previewModule.innerHTML = '';
    previewModule.appendChild(adaptedImageNode);

    if (!intial) {
      this.animatePreviewModule(previewModule, imageIndex, direction);
    }

    this.getBasicInfo(adaptedImageNode, false, false, 'image', undefined, true);
  }

  handleClickThumbnail(galleryImages, event) {
    const thumbnail = event.currentTarget;
    const thumbnailIndex = thumbnail.getAttribute(CLASSNAMES.GALLERY_INDEX);
    const [, index] = getGalleryLengthAndIndex();

    if (thumbnailIndex !== index) {
      setGalleryIndex(thumbnailIndex);
      this.processGalleryPreviewImage(galleryImages[thumbnailIndex], thumbnailIndex);
    }
  }

  createGallery(imgProps, images, event) {
    const {
      gallery, zoom, isProcessedByGallery,
    } = imgProps;
    if (isProcessedByGallery) return;

    const galleryImages = getGalleryImages(images, gallery);

    if (gallery && galleryImages) {
      const clickedImage = event.currentTarget.lastChild;
      const clickedImageIndex = galleryImages.indexOf(clickedImage);
      const orderedImages = swapArrayPositions(galleryImages, clickedImageIndex, 0)
        .filter((image) => image.classList.contains(CLASSNAMES.IMAGE_LOADED));
      const galleryModal = createGalleryModal(closeIconSvg, orderedImages.length, true);
      const previewModule = galleryModal.querySelector(`.${CLASSNAMES.PREVIEW_MODULE}`);
      const thumbnailsModule = createThmbnailsModule(
        orderedImages,
        galleryModal,
        this.handleClickThumbnail.bind(this, orderedImages),
      );

      const galleryArrows = createGalleryArrows(
        leftArrowSvg,
        rightArrowSvg,
        this.handleClickArrows.bind(this, orderedImages),
      );

      galleryModal.appendChild(previewModule);
      galleryModal.appendChild(thumbnailsModule);
      galleryModal.append(...galleryArrows);
      galleryModal.onkeydown = debounce(250, this.handleModalKeydown.bind(this, orderedImages));

      document.body.appendChild(galleryModal);
      galleryModal.focus();
      this.processGalleryPreviewImage(galleryImages[clickedImageIndex], clickedImageIndex, undefined, true);
      setGalleryIndex(clickedImageIndex);
    }

    if (zoom && !gallery) {
      const clickedImage = event.currentTarget.querySelector('img[ci-src]');
      const zoomImages = getZoomImages(images);
      const clickedImageIndex = zoomImages.indexOf(clickedImage);

      const galleryModal = createGalleryModal(closeIconSvg);
      const previewModule = galleryModal.querySelector(`.${CLASSNAMES.PREVIEW_MODULE}`);

      galleryModal.tabIndex = 0;
      galleryModal.appendChild(previewModule);
      galleryModal.onkeydown = debounce(100, this.handleModalKeydown.bind(this, undefined));

      document.body.appendChild(galleryModal);
      galleryModal.focus();
      this.processZoomPreviewImage(zoomImages[clickedImageIndex]);
    }
  }

  handleClickWrapper(imgProps, images, event) {
    const { gallery, zoom, isProcessedByGallery } = imgProps;

    if ((gallery || zoom) && !isProcessedByGallery) {
      this.createGallery(imgProps, images, event);
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
      isGalleryImg,
    } = props;

    const {
      params, zoom, gallery, isProcessedByGallery,
    } = imgProps;
    const { width, ratio } = containerProps;
    const { config } = this;
    const { dataSrcAttr, placeholderBackground } = config;

    const { wrapper, previewImgNode, previewWrapper } = applyOrUpdateWrapper({
      isUpdate,
      imgNode,
      ratio,
      lazy,
      placeholderBackground,
      preserveSize,
      isPreview,
      isGalleryImg,
      ...imgProps,
      alt,
    });

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
          previewImgNode.classList.add(CLASSNAMES.PREVIEW_LOADED);
          onPreviewImageLoad(wrapper, previewImgNode, ratio, preserveSize);
        };
      }
    }

    getDimAndFit(imgNode);
    if ((gallery || zoom) && !isProcessedByGallery) {
      wrapper.style.cursor = 'pointer';
      if (gallery) {
        wrapper.classList.add(CLASSNAMES.GALLERY_ANIMATION);
      } else {
        const zoomIcon = createIcon(zoomIconSvg, CLASSNAMES.ZOOM_BTN, ICONS_STYLES.ZOOM);
        wrapper.append(zoomIcon);
      }
    }

    wrapper.onclick = this.handleClickWrapper.bind(this, imgProps, images);
    imgNode.onload = () => {
      if (config.onImageLoad && typeof config.onImageLoad === 'function') {
        config.onImageLoad(imgNode);
      }

      if (!isProcessedByGallery) {
        onImageLoad(wrapper, previewImgNode, imgNode, ratio, preserveSize, isAdaptive);
      }
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
      imgNode.setAttribute(ATTRIBUTES.PROCESSED, true);

      if (isPreview) {
        const previewImgURL = getPreviewSRC({
          src, params, config, containerProps,
        });
        const [previewBox, contentBox] = wrapBackgroundContainer(imgNode);

        applyBackgroundStyles({
          imgNode, previewBox, contentBox, lazy, width,
        });

        if (lazy) {
          imgNode.setAttribute(ATTRIBUTES.OPTIMIZED_URL, cloudimageUrl);

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
      const isProcessed = node.classList.contains(CLASSNAMES.IMAGE);

      if (src) {
        node.setAttribute(imgSelector, src);
      }

      if (isProcessed) {
        const adaptedImageNode = removeClassNames(node, loadedImageClassNames);

        elementParentNode.parentNode.replaceChild(adaptedImageNode, elementParentNode);
      }
    }

    if (isBackground) {
      const isProcessed = node.getAttribute(ATTRIBUTES.PROCESSED);
      const oldNode = node;

      if (src) {
        node.setAttribute(bgSelector, src);
      }

      if (isProcessed) {
        const contentBox = node.querySelector(`[${ATTRIBUTES.BG_CONTAINER}]`);

        if (contentBox) {
          const contentBoxInner = contentBox.firstChild;
          node.removeAttribute(ATTRIBUTES.PROCESSED);
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
