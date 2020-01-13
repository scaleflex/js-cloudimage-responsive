import {
  addClass,
  checkIfRelativeUrlPath,
  createCSSSource,
  filterImages,
  finishAnimation,
  generateSources,
  generateUrl,
  getAdaptiveSize,
  getBackgroundImageProps,
  getBreakPoint,
  getContainerWidth, getImageInlineProps,
  getImageProps,
  getImgSrc,
  getInitialConfigLowPreview,
  getLowQualitySize,
  getParentWidth,
  getRatioBySizeAdaptive,
  getRatioBySizeSimple,
  getWrapper,
  insertSource,
  isOldBrowsers,
  isResponsiveAndLoaded,
  removeClass,
  setAnimation,
  updateSizeWithPixelRatio,
  wrapWithPicture,
  setWrapperAlignment
} from '../common/ci.utils';
import { debounce } from 'throttle-debounce';


export default class CIResponsive {
  bgImageIndex = 0;

  constructor(config) {
    this.config = getInitialConfigLowPreview(config);

    if (this.config.init) this.init();

    this.innerWidth = window.innerWidth;
  }

  init() {
    document.addEventListener('lazybeforeunveil', this.onLazyBeforeUnveil.bind(this));

    this.process();

    window.addEventListener('resize', debounce(100, this.onUpdateDimensions.bind(this)));
  }

  onUpdateDimensions() {
    this.process(true);

    if (this.innerWidth < window.innerWidth) {
      this.innerWidth = window.innerWidth;
    }
  }

  loadBackgroundImage = (bg, isPreview, bgContainer, ciOptimizedUrl, responsiveCss) => {
    if (bg) {
      let optimizedImage = new Image();

      if (isPreview) {
        let previewImage = new Image();

        optimizedImage.onload = () => {
          if (this.config.imgLoadingAnimation) {
            finishAnimation(bgContainer, true);
          }

          bgContainer.style.backgroundImage = 'url(' + ciOptimizedUrl + ')';
          bgContainer.removeAttribute('ci-optimized-url');
          bgContainer.removeAttribute('data-bg');
          bgContainer.removeAttribute('ci-preview');

          if (responsiveCss) {
            this.styleElem.appendChild(document.createTextNode(responsiveCss));
          }
        }

        optimizedImage.src = ciOptimizedUrl;
        previewImage.src = bg;
      } else {
        optimizedImage.onload = () => {
          if (this.config.imgLoadingAnimation) {
            finishAnimation(bgContainer, true);
          }
          bgContainer.removeAttribute('data-bg');
          bgContainer.removeAttribute('ci-preview');

          if (responsiveCss) {
            this.styleElem.appendChild(document.createTextNode(responsiveCss));
          }
        }

        optimizedImage.src = bg;
      }

      bgContainer.style.backgroundImage = 'url(' + bg + ')';
    }
  }

  onLazyBeforeUnveil(event) {
    const bgContainer = event.target;
    const bg = bgContainer.getAttribute('data-bg');
    const ciOptimizedUrl = bgContainer.getAttribute('ci-optimized-url');
    const isPreview = bgContainer.getAttribute('ci-preview') === 'true';
    const responsiveCss = bgContainer.getAttribute('ci-responsive-css');

    this.loadBackgroundImage(bg, isPreview, bgContainer, ciOptimizedUrl, responsiveCss);
  }

  process(isUpdate) {
    const images = filterImages(document.querySelectorAll('img[ci-src]'), 'ci-src');
    const backgroundImages = filterImages(document.querySelectorAll('[ci-bg-url]'), 'ci-bg-url');

    if (images.length > -1) {
      images.forEach(image => { this.processImage(image, isUpdate); });
    }

    if (backgroundImages.length > -1) {
      this.styleElem = document.createElement('style');

      document.head.appendChild(this.styleElem);

      backgroundImages.forEach(image => { this.processBackgroundImage(image, isUpdate); });
    }
  }

  getPreviewWithRatioParams = ({ imgSrc, params, image, parentContainerWidth }) => {
    const cloudimageUrl = generateUrl(imgSrc, params, this.config, updateSizeWithPixelRatio(parentContainerWidth));
    const container = image.parentNode;
    const isPreviewImg = container.className.indexOf('ci-with-preview-image') > -1;
    const config = { ...this.config };
    const { previewQualityFactor } = config;
    const lowQualitySize = getLowQualitySize(params, previewQualityFactor);
    const url = generateUrl(
      imgSrc,
      { ...params, ...lowQualitySize },
      config,
      updateSizeWithPixelRatio(parentContainerWidth / previewQualityFactor)
    );

    return { isPreviewImg, container, cloudimageUrl, url };
  }

  onImageLoad = ({ wrapper, image, ratio, fill }) => {
    wrapper.style.background = 'transparent';

    if (!ratio) {
      wrapper.style.paddingBottom = ((fill || 100) / ((image.width / image.height) || 1.5)) + '%';
    }

    if (this.config.imgLoadingAnimation) {
      finishAnimation(image);
    }
  };

  onPreviewWithRatioImageLoad = (wrapper, previewImg, image, ratio, fill) => {
    wrapper.style.background = 'transparent';
    previewImg.style.display = 'none';

    if (!ratio) {
      wrapper.style.paddingBottom = ((fill || 100) / ((image.width / image.height) || 1.5)) + '%';
    }

    if (this.config.imgLoadingAnimation) {
      finishAnimation(image);
    }
  }

  getPreviewImg = ({ isPreviewImg, container, isRatio, isLazy, image }) => {
    let previewImg = null;

    if (isPreviewImg) {
      previewImg = container.querySelector('img.ci-image-preview');
    } else {
      previewImg = document.createElement('img');
      previewImg.className = `${isRatio ? 'ci-image-ratio ' : ''} ci-image-preview${isLazy ? ' lazyload' : ''}`;
      addClass(container, 'ci-with-preview-image')
      image.parentNode.insertBefore(previewImg, image);
    }

    return previewImg;
  }

  processImageAdaptive = (props) => {
    const {
      ratio, params, image, isUpdate, isPreview, imgSrc, parentContainerWidth, isLazy, sizes, fill, alignment
    } = props;
    const adaptiveSizes = getAdaptiveSize(sizes, this.config);
    const [ratioBySize, isRatio] = this.getRatio(ratio, params, adaptiveSizes);
    let wrapper = null;

    wrapper = this.applyOrUpdateWrapper({ isUpdate, image, isRatio, ratioBySize, ratio, isPreview, fill, alignment });

    if (isUpdate) return;

    if (isRatio) addClass(image, 'ci-image-ratio');

    // todo do we need it?
    const fallbackImageUrl = generateUrl(imgSrc, params, this.config, parentContainerWidth);

    wrapWithPicture(image);

    const onImageLoad = () => {
      wrapper.style.background = 'transparent';
      wrapper.style.paddingBottom = '0';
      removeClass(image, 'ci-image-ratio');
      removeClass(wrapper, 'ci-image-wrapper-ratio')

      if (this.config.imgLoadingAnimation) {
        finishAnimation(image);
      }
    }

    if (!isPreview) {
      const sources = generateSources(imgSrc, params, adaptiveSizes, this.config, parentContainerWidth);

      this.addSources(image, sources, isLazy);
      this.setSrc(image, fallbackImageUrl, null, isLazy);

      if (this.config.imgLoadingAnimation) {
        image.onload = onImageLoad;
      }
    } else {
      let previewImg = null;
      const container = image.parentNode.parentNode;
      const pictureElem = container.querySelector('picture');

      previewImg = document.createElement('img');
      previewImg.className = `${isRatio ? 'ci-image-ratio ' : ''}ci-image-preview${isLazy ? ' lazyload' : ''}`;
      addClass(container, 'ci-with-preview-image');
      container.insertBefore(previewImg, pictureElem);

      wrapWithPicture(previewImg);

      if (this.config.imgLoadingAnimation && !isUpdate) {
        setAnimation(previewImg, parentContainerWidth);
      }

      const config = { ...this.config };
      const { previewQualityFactor } = config;

      // todo check if it's correct
      const url = generateUrl(imgSrc, params, this.config, Math.floor(parentContainerWidth / previewQualityFactor));
      const sources = generateSources(imgSrc, params, adaptiveSizes, this.config, parentContainerWidth);
      const previewSources = generateSources(imgSrc, params, adaptiveSizes, this.config, parentContainerWidth, true);

      this.addSources(previewImg, previewSources, isLazy);
      this.addSources(image, sources, isLazy);
      this.setSrc(previewImg, url, null, isLazy);
      this.setSrc(image, fallbackImageUrl, null, isLazy);

      image.onload = () => {
        onImageLoad();
        previewImg.style.display = 'none';
      }
    }
  }

  processImageResponsive = (props) => {
    const {
      ratio, params, image, isUpdate, isPreview, imgSrc, resultImageWidth, isLazy, imageWidth, imageHeight, imageRatio,
      fill, alignment
    } = props;
    const [ratioBySize, isRatio] = this.getRatio(ratio, params);
    let wrapper = this.applyOrUpdateWrapper({
      isUpdate, image, isRatio, ratioBySize, ratio, isPreview, imageWidth, imageHeight, imageRatio, fill, alignment
    });

    if (isRatio) addClass(image, 'ci-image-ratio');

    if (isPreview && isRatio) {
      const { isPreviewImg, container, cloudimageUrl, url } = this.getPreviewWithRatioParams(
        { imgSrc, image, params, parentContainerWidth: resultImageWidth }
      );
      let previewImg = this.getPreviewImg({ isPreviewImg, container, isRatio, isLazy, image });

      if (this.config.imgLoadingAnimation && !isUpdate) {
        setAnimation(previewImg, updateSizeWithPixelRatio(resultImageWidth));
      }

      this.setSrc(previewImg, url, 'data-src', isLazy);
      this.setSrc(image, cloudimageUrl, 'data-src', isLazy);

      image.onload = this.onPreviewWithRatioImageLoad.bind(this, wrapper, previewImg, image, ratio, fill);

    } else {
      const cloudimageUrl = generateUrl(imgSrc, params, this.config, updateSizeWithPixelRatio(resultImageWidth));

      image.onload = () => { this.onImageLoad({ wrapper, image, ratio, fill }); };
      this.setSrc(image, cloudimageUrl, null, isLazy);
    }
  }

  processImage(image, isUpdate) {
    let isLazy = this.config.lazyLoading;
    const isSavedWindowInnerWidthMoreThanCurrent = this.innerWidth < window.innerWidth;

    if (isResponsiveAndLoaded(image) && !isSavedWindowInnerWidthMoreThanCurrent) {
      return;
    }

    let { imageWidth, imageHeight, imageRatio } = getImageInlineProps(image);
    let parentContainerWidth = getParentWidth(image, this.config, imageRatio && imageWidth);
    let {
      params = {},
      sizes = this.config.sizes,
      ratio,
      src,
      fill,
      alignment,
      isLazyCanceled
    } = getImageProps(image);

    if (isLazyCanceled && isLazy) {
      isLazy = false;
    }

    if (!src) return;

    const isRelativeUrlPath = checkIfRelativeUrlPath(src);
    let resultImageWidth = (imageRatio && imageWidth) || parentContainerWidth;
    const imgSrc = getImgSrc(src, isRelativeUrlPath, this.config.baseUrl);

    if (fill !== 100) {
      resultImageWidth = resultImageWidth * (isUpdate ? 1 : fill / 100);
    }

    const isPreview = (resultImageWidth > 400);

    if (!isOldBrowsers()) {
      image.src = imgSrc;

      return;
    }

    const isAdaptive = !!sizes;

    if (isAdaptive && isUpdate) return;

    this.initImageClasses({ image, isLazy });

    if (this.config.imgLoadingAnimation && !isUpdate) {
      setAnimation(image, resultImageWidth);
    }

    const processProps = {
      ratio, params, image, isUpdate, isPreview, imgSrc, parentContainerWidth, resultImageWidth, isLazy, imageWidth,
      imageHeight, imageRatio, fill, alignment
    };

    if (!isAdaptive) {
      this.processImageResponsive(processProps);
    } else {
      this.processImageAdaptive({ ...processProps, sizes });
    }
  }

  applyOrUpdateWrapper = props => {
    const {
      isUpdate, image, isRatio, ratioBySize, ratio, imageWidth, imageHeight, imageRatio, fill, alignment
    } = props;
    let wrapper = null;

    if (!isUpdate) {
      wrapper = this.wrap(
        image, null, isRatio, ratioBySize, ratio || this.config.ratio,  imageRatio, imageWidth, imageHeight, fill,
        alignment
      );
    } else {
      wrapper = getWrapper(image);

      if (isRatio && !imageRatio) {
        wrapper.style.paddingBottom = ((fill || 100) / (ratioBySize || ratio || this.config.ratio)) + '%';
      } else if (imageRatio) {
        wrapper.style.width = imageWidth + 'px';
        wrapper.style.height = imageHeight + 'px';
      }
    }

    return wrapper;
  }

  initImageClasses = ({ image, isLazy }) => {
    addClass(image, 'ci-image');

    if (isLazy) {
      addClass(image, 'lazyload');
    }
  }

  getRatio = (ratio, params, adaptiveSize) => {
    const ratioBySize = adaptiveSize ?
      getRatioBySizeAdaptive(params, adaptiveSize) :
      getRatioBySizeSimple(params);

    return [ratioBySize, !!(ratioBySize || ratio || this.config.ratio)];
  }

  initImageBackgroundClasses = ({ image, isLazy }) => {
    addClass(image, 'ci-bg');

    if (isLazy) {
      addClass(image, 'lazyload');
    }
  }

  initImageBackgroundAttributes = ({ image, isPreview }) => {
    if (isPreview) {
      image.setAttribute('ci-preview', true);
    }

    image.setAttribute('ci-bg-index', this.bgImageIndex);
  }

  processBackgroundImageResponsive = (props) => {
    const { params, image, isUpdate, isPreview, imgSrc, containerWidth, isLazy } = props;

    if (isPreview) {
      const config = { ...this.config };

      const cloudimageUrl = generateUrl(imgSrc, params, this.config, updateSizeWithPixelRatio(containerWidth));
      const { previewQualityFactor } = config;
      const lowQualitySize = getLowQualitySize(params, previewQualityFactor);
      const lowQualityUrl = generateUrl(
        imgSrc,
        { ...params, ...lowQualitySize },
        config,
        updateSizeWithPixelRatio(containerWidth / previewQualityFactor)
      );

      image.className = `${image.className}${isLazy ? ' lazyload' : ''}`;

      if (this.config.imgLoadingAnimation && !isUpdate) {
        setAnimation(image, containerWidth, true);
      }

      if (isLazy) {
        image.setAttribute('ci-optimized-url', cloudimageUrl);
        this.setBackgroundSrc(image, lowQualityUrl, isLazy);
      } else {
        const responsiveCss = image.getAttribute('ci-responsive-css');

        this.loadBackgroundImage(lowQualityUrl, isPreview, image, cloudimageUrl, responsiveCss);
      }
    }

    /* Not Adaptive and No Preview */
    else {
      const cloudimageUrl = generateUrl(imgSrc, params, this.config, updateSizeWithPixelRatio(containerWidth));

      if (!isLazy) {
        let tempImage = new Image();

        tempImage.src = cloudimageUrl;

        tempImage.onload = () => {
          if (this.config.imgLoadingAnimation) {
            finishAnimation(image, true);
          }
        };
      }

      this.setBackgroundSrc(image, cloudimageUrl, isLazy);
    }
  }

  processBackgroundImageAdaptive = ({ imgSrc, sizes, params, containerWidth, isPreview, isLazy, image }) => {
    const adaptiveSizes = getAdaptiveSize(sizes, this.config);
    const sources = generateSources(imgSrc, params, adaptiveSizes, this.config, containerWidth);
    const currentBreakpoint = getBreakPoint(adaptiveSizes) || adaptiveSizes[0];
    const imageToLoad = sources.find(breakPoint => breakPoint.mediaQuery === currentBreakpoint.media).srcSet;

    if (!isPreview) {
      if (!isLazy) {
        this.addBackgroundSources(this.bgImageIndex, sources);

        let tempImage = new Image();

        tempImage.src = imageToLoad;

        tempImage.onload = () => {
          if (this.config.imgLoadingAnimation) {
            finishAnimation(image, true);
          }
        };
      } else {
        const responsiveCSS = this.addBackgroundSources(this.bgImageIndex, sources, true);

        image.setAttribute('ci-responsive-css', responsiveCSS);
        this.setBackgroundSrc(image, imageToLoad, isLazy);
      }
    } else {
      const config = { ...this.config };
      const previewSources = generateSources(imgSrc, params, adaptiveSizes, config, containerWidth, true);
      const imagePreviewToLoad = previewSources
        .find(breakPoint => breakPoint.mediaQuery === currentBreakpoint.media).srcSet;

      if (!isLazy) {
        this.addBackgroundSources(this.bgImageIndex, sources);

        let tempImage = new Image();

        tempImage.src = imageToLoad;

        tempImage.onload = () => {
          if (this.config.imgLoadingAnimation) {
            finishAnimation(image, true);
          }
        };
      } else {
        const responsiveCSS = this.addBackgroundSources(this.bgImageIndex, sources, true);

        image.setAttribute('ci-responsive-css', responsiveCSS);
        image.setAttribute('ci-optimized-url', imageToLoad);
        this.setBackgroundSrc(image, imagePreviewToLoad, isLazy);
      }
    }
  }

  processBackgroundImage(image, isUpdate) {
    let isLazy = this.config.lazyLoading;
    const isSavedWindowInnerWidthMoreThanCurrent = this.innerWidth < window.innerWidth;

    if (isResponsiveAndLoaded(image) && !isSavedWindowInnerWidthMoreThanCurrent) {
      return;
    }

    let containerWidth = getContainerWidth(image, this.config);
    let {
      params = {},
      sizes = this.config.sizes,
      ratio,
      src,
      isLazyCanceled
    } = getBackgroundImageProps(image);

    if (isLazyCanceled && isLazy) {
      isLazy = false;
    }

    if (!src) return;

    const isRelativeUrlPath = checkIfRelativeUrlPath(src);
    const imgSrc = getImgSrc(src, isRelativeUrlPath, this.config.baseUrl);
    const isPreview = (containerWidth > 400);

    if (!isOldBrowsers()) {
      image.style.backgroundImage = 'url(' + imgSrc + ')';

      return;
    }

    const isAdaptive = !!sizes;

    if (isAdaptive && isUpdate) return;

    this.initImageBackgroundClasses({ image, isLazy });

    if (this.config.imgLoadingAnimation && !isUpdate) {
      setAnimation(image, containerWidth, true);
    }

    this.initImageBackgroundAttributes({ image, isPreview });

    const processProps = { ratio, params, image, isUpdate, isPreview, imgSrc, containerWidth, isLazy };

    if (!isAdaptive) {
      this.processBackgroundImageResponsive(processProps);
    } else {
      this.processBackgroundImageAdaptive({ ...processProps, sizes });
    }

    this.bgImageIndex += 1;
  }

  setSrc(image, url, propertyName, isLazy) {
    const { dataSrcAttr } = this.config;

    image.setAttribute(
      isLazy ? (propertyName ? propertyName : 'data-src') : (dataSrcAttr ? dataSrcAttr : 'src'),
      url
    );
  }

  setSrcset(source, url, isLazy) {
    const { dataSrcsetAttr } = this.config;

    source.setAttribute(isLazy ? 'data-srcset' : dataSrcsetAttr ? dataSrcsetAttr : 'srcset', url);
  }

  setBackgroundSrc(image, url, isLazy) {
    const { dataSrcAttr } = this.config;

    if (isLazy) {
      image.setAttribute((dataSrcAttr ? dataSrcAttr : 'data-bg'), url);
    } else {
      image.style.backgroundImage = `url('${url}')`
    }
  }

  wrap(image, wrapper, isRatio, ratioBySize, ratio, imageRatio, imageWidth, imageHeight, fill, alignment) {
    if ((image.parentNode.className || '').indexOf('ci-image-wrapper') > -1 ||
      (image.parentNode.parentNode.className || '').indexOf('ci-image-wrapper') > -1) {
      wrapper = image.parentNode;

      addClass(wrapper, 'ci-image-wrapper');
      wrapper.style.background = this.config.placeholderBackground;

      setWrapperAlignment(wrapper, alignment);

      if (isRatio) {
        addClass(wrapper, 'ci-image-wrapper-ratio');
      }

      wrapper.style.width = imageRatio ? imageWidth + 'px' : '100%';

      if (imageRatio && imageHeight) {
        wrapper.style.height = imageHeight + 'px';
      }

      if (fill !== 100 && !imageRatio) {
        wrapper.style.width = `${fill}%`;
      }

      return;
    }

    wrapper = wrapper || document.createElement('div');

    addClass(wrapper, 'ci-image-wrapper');
    wrapper.style.background = this.config.placeholderBackground;
    wrapper.style.width = imageRatio ? imageWidth + 'px' : '100%';

    setWrapperAlignment(wrapper, alignment);

    if (imageRatio && imageHeight) {
      wrapper.style.height = imageHeight + 'px';
    }

    if (fill !== 100 && !imageRatio) {
      wrapper.style.width = `${fill}%`;
    }

    if (isRatio && !imageRatio) {
      addClass(wrapper, 'ci-image-wrapper-ratio');
      wrapper.style.paddingBottom = ((fill || 100) / (ratioBySize || ratio || this.config.ratio)) + '%';
    }

    if (image.nextSibling) {
      image.parentNode.insertBefore(wrapper, image.nextSibling);
    } else {
      image.parentNode.appendChild(wrapper);
    }

    wrapper.appendChild(image);

    return wrapper;
  }

  addSources(image, previewSources, isLazy) {
    [...previewSources.slice(1).reverse()].forEach(({ mediaQuery, srcSet }) => {
      const source = this.createSource(mediaQuery, srcSet, isLazy);

      insertSource(image, source);
    });

    insertSource(image, this.createSource(null, previewSources[0].srcSet, isLazy));
  }

  addBackgroundSources(bgImageIndex, sources, returnCSSString) {
    let cssStyle = '';

    cssStyle += createCSSSource(null, sources[0].srcSet, bgImageIndex);

    [...sources.slice(1)].forEach(({ mediaQuery, srcSet }) => {
      cssStyle += createCSSSource(mediaQuery, srcSet, bgImageIndex);
    });

    if (returnCSSString) {
      return cssStyle;
    }

    this.styleElem.appendChild(document.createTextNode(cssStyle));
  }

  createSource(mediaQuery, srcSet, isLazy) {
    const source = document.createElement('source');

    if (mediaQuery) {
      source.media = mediaQuery;
    }

    this.setSrcset(source, srcSet, isLazy)

    return source;
  }

  updateSources(image, previewSources, sources, isLazy) {
    const sourcesElems = image.parentNode.querySelectorAll('source');

    sourcesElems.forEach((elem, index) => {
      this.setSrcset(elem, sources[index].srcSet, isLazy);
    })
  }
}