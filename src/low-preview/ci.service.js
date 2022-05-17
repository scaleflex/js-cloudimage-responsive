import {
  destroyNodeImgSize,
  getBackgroundImageProps,
  getFreshCIElements,
  getImageProps,
  isLazy,
  setBackgroundSrc,
  setSrc,
  setSrcset,
  createZoomIcons,
  displayModalImg
} from '../common/ci.utils';
import { isLowQualityPreview } from 'cloudimage-responsive-utils/dist/utils/is-low-quality-preview';
import { determineContainerProps } from 'cloudimage-responsive-utils/dist/utils/determine-container-props';
import { getImgSRC } from 'cloudimage-responsive-utils/dist/utils/get-img-src';
import { generateURL } from 'cloudimage-responsive-utils/dist/utils/generate-url';
import { getPreviewSRC } from 'cloudimage-responsive-utils/dist/utils/get-preview-src';
import { getBreakpoint } from 'cloudimage-responsive-utils/dist/utils/get-breakpoint';
import { isSupportedInBrowser } from 'cloudimage-responsive-utils/dist/utils/is-supported-in-browser';
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
  updateSizeWithPixelRatio
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
    const { imgSelector, bgSelector, imgZoomSelector } = this.config;
    const windowScreenBecomesBigger = this.innerWidth < window.innerWidth;
    let [images, backgroundImages, imagesToZoom] = getFreshCIElements(isUpdate, rootElement, imgSelector, bgSelector, imgZoomSelector);

    if (images.length > -1) {
      images.forEach(imgNode => {
        this.getBasicInfo(imgNode, isUpdate, windowScreenBecomesBigger, 'image');
      });
    }

    if (backgroundImages.length > -1) {
      backgroundImages.forEach(imgNode => {
        this.getBasicInfo(imgNode, isUpdate, windowScreenBecomesBigger, 'background');
      });
    }

    createZoomIcons(isUpdate, imagesToZoom);

    // Store every zoom icon in an array
    const zoomIconsArr = Array.from(document.getElementsByClassName("zoom-icon"));

    // EventListener for every zoom icon
    zoomIconsArr.forEach((icon, index) => {
      icon.addEventListener("click", () => {
        displayModalImg(imagesToZoom[index]);
      })
    })

    const modalEl = document.querySelector(".modal");

    // Close modal
    if (modalEl) {
      modalEl.addEventListener("click", (e) => {
        if (e.target.classList.contains("modal-img")) {
          return;
        }
        modalEl.close();
      })
    }
  }

  getBasicInfo = (imgNode, isUpdate, windowScreenBecomesBigger, type) => {
    const isImage = type === 'image';
    const { config } = this;
    const { baseURL, lazyLoading, presets, devicePixelRatioList, minLowQualityWidth, imgSelector, bgSelector } = config;
    const imgProps = isImage ?
        getImageProps(imgNode, imgSelector) : getBackgroundImageProps(imgNode, bgSelector);
    const { params, imgNodeSRC, isLazyCanceled, sizes, isAdaptive, preserveSize, minWindowWidth } = imgProps;

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
      imgNode, isUpdate, imgProps, lazy, isPreview, containerProps, isSVG, cloudimageUrl, src, preserveSize, isAdaptive
    };

    if (isImage) {
      this.processImage({ ...props, cloudimageUrl: generateURLbyDPR(1), cloudimageSrcset });
    } else {
      this.processBackgroundImage(props);
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
      isAdaptive
    } = props;
    const { params } = imgProps;
    const { width, ratio } = containerProps;
    const { config } = this;
    const { dataSrcAttr, placeholderBackground } = config;
    const { wrapper, previewImgNode, previewWrapper } = applyOrUpdateWrapper(
      { isUpdate, imgNode, ratio, lazy, placeholderBackground, preserveSize, isPreview, ...imgProps }
    );

    if (!isUpdate) {
      initImageClasses({ imgNode, lazy });

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
