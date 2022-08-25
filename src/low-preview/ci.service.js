import {
  destroyNodeImgSize,
  getBackgroundImageProps,
  getFreshCIElements,
  getImageProps,
  isLazy,
  setAlt,
  setBackgroundSrc,
  setSrc,
  setSrcset
} from '../common/ci.utils';
import { isLowQualityPreview } from 'cloudimage-responsive-utils/dist/utils/is-low-quality-preview';
import { determineContainerProps } from 'cloudimage-responsive-utils/dist/utils/determine-container-props';
import { getImgSRC } from 'cloudimage-responsive-utils/dist/utils/get-img-src';
import { generateURL } from 'cloudimage-responsive-utils/dist/utils/generate-url';
import { getPreviewSRC } from 'cloudimage-responsive-utils/dist/utils/get-preview-src';
import { getBreakpoint } from 'cloudimage-responsive-utils/dist/utils/get-breakpoint';
import { isSupportedInBrowser } from 'cloudimage-responsive-utils/dist/utils/is-supported-in-browser';
import { generateAlt } from 'cloudimage-responsive-utils/dist/utils/generate-alt';
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
  setGalleryAnimation,
  finishGalleryAnimation,
  createGalleryModal,
  galleryMainImage,
  markCurrentImage,
  updateDimensions,
  creatIcon,
} from './ci.utis';
import { debounce } from 'throttle-debounce';


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
    let [images, backgroundImages] = getFreshCIElements(isUpdate, rootElement, imgSelector, bgSelector);

    if (images.length > -1) {
      images.forEach(imgNode => {
        this.getBasicInfo(imgNode, isUpdate, windowScreenBecomesBigger, 'image', images);
      });
    }

    if (backgroundImages.length > -1) {
      backgroundImages.forEach(imgNode => {
        this.getBasicInfo(imgNode, isUpdate, windowScreenBecomesBigger, 'background', images);
      });
    }
  }

  getBasicInfo = (imgNode, isUpdate, windowScreenBecomesBigger, type, images) => {
    const isImage = type === 'image';
    const { config } = this;
    const { baseURL, lazyLoading, presets, devicePixelRatioList, minLowQualityWidth, imgSelector, bgSelector } = config;
    const imgProps = isImage ?
        getImageProps(imgNode, imgSelector) : getBackgroundImageProps(imgNode, bgSelector);
    const { params, imgNodeSRC, isLazyCanceled,
      sizes, isAdaptive, preserveSize, minWindowWidth, alt } = imgProps;

    if (!imgNodeSRC) return;

    let [src, isSVG] = getImgSRC(imgNodeSRC, baseURL);
    const lazy = isLazy(lazyLoading, isLazyCanceled, isUpdate);
    let size;

    if (!isSupportedInBrowser(true)) {
      if (isImage) {
        imgNode.src = src;
      } else {
        imgNode.style.backgroundImage = 'url(' + src + ')';
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
    } else {
      if (isUpdate && !windowScreenBecomesBigger) return;
    }

    const containerProps = determineContainerProps({ ...imgProps, size, imgNode, config });
    const { width } = containerProps;
    const isPreview = isLowQualityPreview(isAdaptive, width, isSVG, minLowQualityWidth);
    const generateURLbyDPR = devicePixelRatio => generateURL({ src, params, config, containerProps, devicePixelRatio })
    const cloudimageUrl = generateURLbyDPR();
    const cloudimageSrcset = devicePixelRatioList.map(dpr => ({ dpr: dpr.toString(), url: generateURLbyDPR(dpr) }));
    const props = {
      imgNode, isUpdate, imgProps, lazy, isPreview, containerProps, isSVG, cloudimageUrl, src, preserveSize, isAdaptive, imgSelector, imgNodeSRC, alt: alt || generateAlt(src)
    };

    if (isImage) {
      this.processImage({ ...props, cloudimageUrl: generateURLbyDPR(1), cloudimageSrcset, images });
    } else {
      this.processBackgroundImage(props);
    }
  }

  closeModal = (event) => {
    event.stopPropagation();
    const modal = document.querySelector('.ci-gallery-modal');
    if(modal) {
      modal.remove();
    }
  }

  openModal = (props, isGallery) => {
    const {
      wrapper,
      modal,
      imgSelector,
      imgNodeSRC,
      galleryWrapperChildren,
      imgProps,
    } = props;

    const mainImageWrapper = modal.querySelector('.ci-gallery-main-image-wrapper');
    const currentImage = galleryMainImage(imgSelector, imgNodeSRC);

    wrapper.append(modal);

    mainImageWrapper.removeChild(mainImageWrapper.firstElementChild);
    mainImageWrapper.append(currentImage);

    if(isGallery){
      const currentImageIndex = this.getCurrentImage(galleryWrapperChildren, mainImageWrapper);

      galleryWrapperChildren.forEach((imgWrapper, index) => {
        if(index === currentImageIndex) {
          markCurrentImage(galleryWrapperChildren, index);
        }

        this.process(false, imgWrapper);
      });
    }

    this.process(false, mainImageWrapper);
    updateDimensions(mainImageWrapper, imgProps);
  }

  getCurrentImage = (galleryWrapperChildren, mainImageWrapper) => {
    let currentIndex = null;

    galleryWrapperChildren.forEach((imgWrapper, index) => {
      const mainImg = mainImageWrapper.querySelector('[ci-src]').getAttribute('ci-src');
      const galleryImg = imgWrapper.querySelector('[ci-src]').getAttribute('ci-src');

      if(mainImg === galleryImg){
        currentIndex = index;
      }
    });

    return currentIndex;
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
      imgSelector,
      imgNodeSRC,
      images,
      alt
    } = props;
    const { params, gallery, zoom } = imgProps;
    const { width, ratio } = containerProps;
    const { config } = this;
    const { dataSrcAttr, placeholderBackground } = config;
    const { wrapper, previewImgNode, previewWrapper } = applyOrUpdateWrapper(
      { isUpdate, imgNode, ratio, lazy, placeholderBackground, preserveSize, isPreview, ...imgProps, alt }
    );

    if (!isUpdate) {
      initImageClasses({ imgNode, lazy });
      setAlt(imgNode, alt);

      if(zoom && !gallery){
        const zoomModal = createGalleryModal(imgSelector, imgProps, images);
      
        const closeIcon = creatIcon('ci-close-icon', 'https://icon-library.com/icon/svg-close-icon-4.html.html>Svg Close Icon # 150236');

        const zoomIcon = creatIcon('ci-zoom-icon-wrapper', 'https://icon-library.com/icon/svg-close-icon-4.html.html>Svg Close Icon # 150236');

        zoomModal.append(closeIcon);

        const props = { wrapper, modal: zoomModal, imgSelector, imgNodeSRC, imgNode, imgProps };

        const displayZoomIcon = () => {
          wrapper.append(zoomIcon);
        }

        const destroyZoomIcon = (event) => {
          event.stopPropagation();
          const zoomIcon = wrapper.querySelector('.ci-zoom-icon-wrapper');

          if (zoomIcon){
            zoomIcon.remove();
          }
        }
        
        wrapper.onclick = (event) => this.openModal(event, {...props});
        closeIcon.onclick = this.closeModal;
        wrapper.onmouseenter = displayZoomIcon;
        wrapper.onmouseout = destroyZoomIcon;
      }

      if(gallery){
        const galleryModal = createGalleryModal(imgSelector, imgProps, images, gallery);
      
        const closeIcon = creatIcon('ci-close-icon', 'https://icon-library.com/icon/svg-close-icon-4.html.html>Svg Close Icon # 150236');
      
        const rightArrow = creatIcon('ci-right-arrow-icon', 'https://icon-library.com/icon/svg-close-icon-4.html.html>Svg Close Icon # 150236');
      
        const leftArrow = creatIcon('ci-left-arrow-icon', 'https://icon-library.com/icon/svg-close-icon-4.html.html>Svg Close Icon # 150236');

        galleryModal.append(closeIcon, rightArrow, leftArrow);

        const mainImageWrapper = galleryModal.querySelector('.ci-gallery-main-image-wrapper');
        const galleryImagesWrapper = galleryModal.querySelector('.ci-gallery-images-wrapper');
        const galleryWrapperChildren = [...galleryImagesWrapper.children];

        const props = { wrapper, modal : galleryModal, imgSelector,
        imgNodeSRC, galleryWrapperChildren, imgNode, imgProps };

        const processNextImage = (nextIndex) => {
          const nextImageSrc = galleryWrapperChildren[nextIndex].querySelector('[ci-src]').getAttribute('ci-src');
          const nextImage = galleryMainImage(imgSelector, nextImageSrc);

          mainImageWrapper.removeChild(mainImageWrapper.firstElementChild);
          mainImageWrapper.append(nextImage);

          markCurrentImage(galleryWrapperChildren, nextIndex);

          this.process(false, mainImageWrapper);
          updateDimensions(mainImageWrapper, imgProps);
        }

        const arrowNavigation = (event, direction) => {
          event.stopPropagation(); 

          if(galleryWrapperChildren.length > 1){
            let nextIndex = null;
            const currentIndex = this.getCurrentImage(galleryWrapperChildren, mainImageWrapper);

            if(direction === 'right'){
              if(currentIndex < galleryWrapperChildren.length - 1){
                nextIndex = currentIndex + 1;
              } else {
                nextIndex = 0;
              }
            }
            else{
              if(currentIndex > 0){
                nextIndex = currentIndex - 1;
              } else {
                nextIndex = galleryWrapperChildren.length - 1;
              }
            }

            processNextImage(nextIndex);
          }
        }

        wrapper.onclick = () => this.openModal({...props}, true);
        wrapper.onmouseenter = () => setGalleryAnimation(imgNode);
        wrapper.onmouseout = () => finishGalleryAnimation(imgNode);
        closeIcon.onclick = this.closeModal;
        rightArrow.onclick = (event) => arrowNavigation(event, "right");
        leftArrow.onclick = (event) => arrowNavigation(event, "left");
      }

      if (config.destroyNodeImgSize) {
        destroyNodeImgSize(imgNode);
      }

      if (isPreview) {
        const previewImgURL = getPreviewSRC({ src, params, config, containerProps });

        setAnimation(previewWrapper, previewImgNode, updateSizeWithPixelRatio(width));
        setSrc(previewImgNode, previewImgURL, 'data-src', lazy, src, isSVG, dataSrcAttr);

        previewImgNode.onload = () => {
          onPreviewImageLoad(wrapper, previewImgNode, ratio, preserveSize);
        }
      }
    }

    imgNode.onload = () => {
      if (config.onImageLoad && typeof config.onImageLoad === 'function') {
        config.onImageLoad(imgNode);
      }
      onImageLoad(wrapper, previewImgNode, imgNode, ratio, preserveSize, isAdaptive);
    };

    setSrcset(imgNode, cloudimageSrcset, 'data-srcset', lazy, src, isSVG, dataSrcAttr);
    setSrc(imgNode, cloudimageUrl, 'data-src', lazy, src, isSVG, dataSrcAttr);
  }

  processBackgroundImage(props) {
    const { imgNode, isUpdate, imgProps, lazy, isPreview, containerProps, isSVG, cloudimageUrl, src } = props;
    const { params } = imgProps;
    const { width } = containerProps;
    const { config } = this;
    const { dataSrcAttr } = config;

    if (!isUpdate) {
      if (isPreview) {
        const previewImgURL = getPreviewSRC({ src, params, config, containerProps });
        const [previewBox, contentBox] = wrapBackgroundContainer(imgNode);

        applyBackgroundStyles({ imgNode, previewBox, contentBox, lazy, width });

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
}
