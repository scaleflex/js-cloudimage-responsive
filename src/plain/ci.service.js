import {
  addClass,
  determineContainerProps,
  filterImages,
  generateUrl,
  getBackgroundImageProps,
  getBreakPoint,
  getImageProps,
  getImgSrc,
  isLazy,
  isOldBrowsers,
  setBackgroundSrc,
  setSrc,
  setSrcset,
  destroyNodeImgSize
} from '../common/ci.utils';
import { getInitialConfigPlain } from './ci.config';
import { initImageClasses, loadBackgroundImage } from './ci.utils';
import { debounce } from 'throttle-debounce';


export default class CIResponsive {
  constructor(config) {
    this.config = getInitialConfigPlain(config);

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
      images = document.querySelectorAll('img[ci-src]');
      backgroundImages = document.querySelectorAll('[ci-bg-url]');
    } else {
      images = filterImages(document.querySelectorAll('img[ci-src]'), 'ci-image');
      backgroundImages = filterImages(document.querySelectorAll('[ci-bg-url]'), 'ci-bg');
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
    const { baseURL, lazyLoading, presets, devicePixelRatioList } = config;
    const imgProps = isImage ? getImageProps(imgNode) : getBackgroundImageProps(imgNode);
    const { params, imageNodeSRC, isLazyCanceled, sizes, isAdaptive, preserveSize } = imgProps;

    if (!imageNodeSRC) return;

    const [src, isSVG] = getImgSrc(imageNodeSRC, baseURL);
    const lazy = isLazy(lazyLoading, isLazyCanceled, isUpdate);
    let size

    if (!isOldBrowsers(true)) {
      if (isImage) {
        imgNode.src = src;
      } else {
        imgNode.style.backgroundImage = 'url(' + src + ')';
      }

      return;
    }

    if (isAdaptive) {
      size = getBreakPoint(sizes, presets);
    } else {
      if (isUpdate && !windowScreenBecomesBigger) return;
    }

    const containerProps = determineContainerProps({ ...imgProps, size, imgNode, config });
    const generateURLbyDPR = devicePixelRatio => generateUrl({ src, params, config, containerProps, devicePixelRatio })
    const cloudimageUrl = generateURLbyDPR();
    const cloudimageSrcset = devicePixelRatioList.map(dpr => ({ dpr: dpr.toString(), url: generateURLbyDPR(dpr) }));
    const props = { imgNode, isUpdate, imgProps, lazy, containerProps, isSVG, cloudimageUrl, src, preserveSize };

    if (isImage) {
      this.processImage({ ...props, cloudimageUrl: generateURLbyDPR(1), cloudimageSrcset });
    } else {
      this.processBackgroundImage(props);
    }
  }

  processImage(props) {
    const { imgNode, isUpdate, lazy, isSVG, cloudimageUrl, src, cloudimageSrcset } = props;
    const { config } = this;
    const { dataSrcAttr, onImageLoad } = config;

    if (!isUpdate) {
      initImageClasses({ imgNode, lazy });
    }

    if (config.destroyNodeImgSize) {
      destroyNodeImgSize(imgNode);
    }

    if (config.processOnlyWidth) {
      imgNode.removeAttribute("height");
    }

    imgNode.onload = () => {
      if (onImageLoad && typeof onImageLoad === 'function') {
        onImageLoad(imgNode);
      }
      addClass(imgNode, 'ci-image-loaded');
    };

    setSrcset(imgNode, cloudimageSrcset, 'data-srcset', lazy, src, isSVG, dataSrcAttr);
    setSrc(imgNode, cloudimageUrl, 'data-src', lazy, src, isSVG, dataSrcAttr);
  }

  processBackgroundImage(props) {
    const { imgNode, isUpdate, lazy, isSVG, cloudimageUrl, src } = props;
    const { config } = this;
    const { dataSrcAttr } = config;

    if (!isUpdate) {
      imgNode.className = `${imgNode.className}${lazy ? ' lazyload' : ''}`;
    }

    setBackgroundSrc(imgNode, cloudimageUrl, lazy, src, isSVG, dataSrcAttr);
  }
}