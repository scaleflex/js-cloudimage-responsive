import {
  destroyNodeImgSize,
  filterImages,
  getBackgroundImageProps,
  getImageProps,
  isLazy,
  setBackgroundSrc,
  setSrc,
  setSrcset
} from '../common/ci.utils';
import { determineContainerProps } from 'cloudimage-responsive-utils/dist/utils/determine-container-props';
import { getImgSRC } from 'cloudimage-responsive-utils/dist/utils/get-img-src';
import { generateURL } from 'cloudimage-responsive-utils/dist/utils/generate-url';
import { getBreakpoint } from 'cloudimage-responsive-utils/dist/utils/get-breakpoint';
import { isSupportedInBrowser } from 'cloudimage-responsive-utils/dist/utils/is-supported-in-browser';
import { getInitialConfigBlurHash } from './ci.config';
import {
  applyOrUpdateBlurHashCanvas,
  applyOrUpdateWrapper,
  finishAnimation,
  initImageBackgroundClasses,
  initImageBackgroundStyles,
  initImageClasses,
  initImageStyles,
  loadBackgroundImage,
  onImageLoad
} from './ci.utils';
import { debounce } from 'throttle-debounce';


export default class CIResponsive {
  constructor(config) {
    this.config = getInitialConfigBlurHash(config);

    if (this.config.init) this.init();

    this.innerWidth = window.innerWidth;
  }

  init() {
    document.addEventListener('lazybeforeunveil', loadBackgroundImage);
    window.addEventListener('resize', debounce(100, this.onUpdateDimensions.bind(this)));

    this.process();
  }

  onUpdateDimensions() {
    this.process(true);

    if (this.innerWidth < window.innerWidth) {
      this.innerWidth = window.innerWidth;
    }
  }

  process(isUpdate) {
    let images, backgroundImages;
    const windowScreenBecomesBigger = this.innerWidth < window.innerWidth;

    if (isUpdate) {
      images = document.querySelectorAll(`img[${this.config.imgSelector}]`);
      backgroundImages = document.querySelectorAll(`[${this.config.imgSelector}]`);
    } else {
      images = filterImages(document.querySelectorAll(`img[${this.config.imgSelector}]`), 'ci-image');
      backgroundImages = filterImages(document.querySelectorAll(`[${this.config.imgSelector}]`), 'ci-bg');
    }

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
  }

  getBasicInfo = (imgNode, isUpdate, windowScreenBecomesBigger, type) => {
    const isImage = type === 'image';
    const { config } = this;
    const { baseURL, lazyLoading, presets, devicePixelRatioList, imgSelector, bgSelector } = config;
    const imgProps = isImage ?
        getImageProps(imgNode, imgSelector) : getBackgroundImageProps(imgNode, bgSelector);
    const { params, imgNodeSRC, blurHash, isLazyCanceled, sizes, isAdaptive, preserveSize, minWindowWidth } = imgProps;

    if (!imgNodeSRC) return;

    const [src, isSVG] = getImgSRC(imgNodeSRC, baseURL);
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
    } else {
      if (isUpdate && !windowScreenBecomesBigger) return;
    }

    const containerProps = determineContainerProps({ ...imgProps, imgNode, config, size });
    const generateURLbyDPR = devicePixelRatio => generateURL({ src, params, config, containerProps, devicePixelRatio })
    const cloudimageUrl = generateURLbyDPR();
    const cloudimageSrcset = devicePixelRatioList.map(dpr => ({ dpr: dpr.toString(), url: generateURLbyDPR(dpr) }));
    const props = {
      config,
      isUpdate,
      imgNode,
      containerProps,
      imgProps,
      lazy,
      blurHash,
      cloudimageUrl,
      isSVG,
      src,
      preserveSize,
      isAdaptive
    };

    if (isImage) {
      this.processImage({ ...props, cloudimageUrl: generateURLbyDPR(1), cloudimageSrcset });
    } else {
      this.processBackgroundImage(props);
    }
  }

  processImage(props) {
    const { config, isUpdate, imgNode, containerProps, imgProps, lazy, blurHash, cloudimageUrl, isSVG, src, preserveSize, cloudimageSrcset, isAdaptive } = props;
    const { ratio } = containerProps;
    const { dataSrcAttr } = config;
    const wrapper = applyOrUpdateWrapper({ isUpdate, imgNode, ratio, ...imgProps });

    if (!isUpdate) {
      initImageClasses(imgNode, lazy);
      initImageStyles(imgNode);

      if (config.destroyNodeImgSize) {
        destroyNodeImgSize(imgNode);
      }

      const canvas = applyOrUpdateBlurHashCanvas(wrapper, blurHash);

      imgNode.onload = () => {
        if (config.onImageLoad && typeof config.onImageLoad === 'function') {
          config.onImageLoad(imgNode);
        }
        onImageLoad({ wrapper, imgNode, canvas: blurHash && canvas, ratio, preserveSize, isAdaptive })
      };
    }

    setSrcset(imgNode, cloudimageSrcset, 'data-srcset', lazy, src, isSVG, dataSrcAttr);
    setSrc(imgNode, cloudimageUrl, null, lazy, src, isSVG, dataSrcAttr);
  }

  processBackgroundImage(props) {
    const { config, isUpdate, imgNode, lazy, blurHash, cloudimageUrl, isSVG, src } = props;
    const { dataSrcAttr } = config;

    if (!isUpdate) {
      initImageBackgroundClasses(imgNode, lazy);
      initImageBackgroundStyles(imgNode);

      const canvas = applyOrUpdateBlurHashCanvas(imgNode, blurHash);

      if (!lazy) {
        let tempImage = new Image();

        tempImage.src = cloudimageUrl;

        tempImage.onload = () => {
          finishAnimation(imgNode, blurHash && canvas);
        };
      }
    }

    setBackgroundSrc(imgNode, cloudimageUrl, lazy, src, isSVG, dataSrcAttr);
  }
}