import {
  determineContainerProps,
  filterImages,
  generateUrl,
  getBackgroundImageProps,
  getBreakPoint,
  getImageProps,
  getImgSrc,
  getInitialConfigLowPreview,
  getPreviewSRC,
  isApplyLowQualityPreview,
  isLazy,
  isOldBrowsers,
  setBackgroundSrc,
  setSrc,
  setSrcset,
  updateSizeWithPixelRatio
} from '../common/ci.utils';
import {
  applyBackgroundStyles,
  applyOrUpdateWrapper,
  initImageClasses,
  loadBackgroundImage,
  onImageLoad,
  onLazyBeforeUnveil,
  onPreviewImageLoad,
  setAnimation,
  wrapBackgroundContainer
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
    let size;

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
    const { width, height } = containerProps;
    const isPreview = isApplyLowQualityPreview(isAdaptive, width, isSVG);
    const generateURLbyDPR = devicePixelRatio => generateUrl({ src, params, config, width, height, devicePixelRatio })
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
      { isUpdate, imgNode, ratio, lazy, placeholderBackground, preserveSize, ...imgProps }
    );

    if (!isUpdate) {
      initImageClasses({ imgNode, lazy });

      if (isPreview) {
        const previewImgURL = getPreviewSRC({ src, params, config, ...containerProps });

        setAnimation(previewWrapper, previewImgNode, updateSizeWithPixelRatio(width));
        setSrc(previewImgNode, previewImgURL, 'data-src', lazy, src, isSVG, dataSrcAttr);

        previewImgNode.onload = () => {
          onPreviewImageLoad(wrapper, previewImgNode, ratio, preserveSize);
        }
      }
    }

    imgNode.onload = () => {
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
        const previewImgURL = getPreviewSRC({ src, params, config, ...containerProps });
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