import { addClass, checkIfRelativeUrlPath, createCSSSource, filterImages, finishAnimation, generateSources, generateUrl,
  getAdaptiveSize, getBackgroundImageProps, getBreakPoint, getContainerWidth, getImageProps, getImgSrc,
  getLowQualitySize, getParentWidth, getRatioBySizeAdaptive, getRatioBySizeSimple, getWrapper, insertSource,
  isResponsiveAndLoaded, setAnimation, updateSizeWithPixelRatio, wrapWithPicture, removeClass, isOldBrowsers,
  getInitialConfigLowPreview
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

  onLazyBeforeUnveil(event) {
    const bgContainer = event.target;
    const bg = bgContainer.getAttribute('data-bg');
    const ciOptimizedUrl = bgContainer.getAttribute('ci-optimized-url');
    const isPreview = bgContainer.getAttribute('ci-preview') === 'true';
    const responsiveCss = bgContainer.getAttribute('ci-responsive-css');

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

  onImageLoad = ({ wrapper, image }) => {
    wrapper.style.background = 'transparent';

    if (this.config.imgLoadingAnimation) {
      finishAnimation(image);
    }
  };

  onPreviewWithRatioImageLoad =  (wrapper, previewImg, image) => {
    wrapper.style.background = 'transparent';
    previewImg.style.display = 'none';

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
    const { ratio, params, image, isUpdate, isPreview, imgSrc, parentContainerWidth, isLazy, sizes } = props;
    const adaptiveSizes = getAdaptiveSize(sizes, this.config);
    const [ratioBySize, isRatio] = this.getRatio(ratio, params, adaptiveSizes);
    let wrapper = null;

    wrapper = this.applyOrUpdateWrapper({ isUpdate, image, isRatio, ratioBySize, ratio, isPreview });

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
      finishAnimation(image);
    }

    if (!isPreview) {
      const sources = generateSources(imgSrc, params, adaptiveSizes, this.config, parentContainerWidth);

      this.addSources(image, sources);
      this.setSrc(image, fallbackImageUrl);

      if (this.config.imgLoadingAnimation) {
        image.onload = onImageLoad;
      }
    }

    else {
      let previewImg = null;
      const container = image.parentNode.parentNode;
      const pictureElem = container.querySelector('picture');

      previewImg = document.createElement('img');
      previewImg.className = `${isRatio ? 'ci-image-ratio ' : ''}ci-image-preview${isLazy ? ' lazyload' : ''}`;
      addClass(container, 'ci-with-preview-image');
      container.insertBefore(previewImg, pictureElem);

      wrapWithPicture(previewImg);

      if (!isUpdate) {
        setAnimation(previewImg, parentContainerWidth);
      }

      const config = { ...this.config };
      const { previewQualityFactor } = config;

      // todo check if it's correct
      const url = generateUrl(imgSrc, params, this.config,  Math.floor(parentContainerWidth / previewQualityFactor));
      const sources = generateSources(imgSrc, params, adaptiveSizes, this.config, parentContainerWidth);
      const previewSources = generateSources(imgSrc, params, adaptiveSizes, this.config, parentContainerWidth, true);

      this.addSources(previewImg, previewSources);
      this.addSources(image, sources);
      this.setSrc(previewImg, url);
      this.setSrc(image, fallbackImageUrl);

      image.onload = () => {
        onImageLoad();
        previewImg.style.display = 'none';
      }
    }
  }

  processImageResponsive = (props) => {
    const { ratio, params, image, isUpdate, isPreview, imgSrc, parentContainerWidth, isLazy } = props;
    const [ratioBySize, isRatio] = this.getRatio(ratio, params);
    let wrapper = this.applyOrUpdateWrapper({ isUpdate, image, isRatio, ratioBySize, ratio, isPreview });

    if (isRatio) addClass(image, 'ci-image-ratio');

    if (isPreview && isRatio) {
      const { isPreviewImg, container, cloudimageUrl, url } = this.getPreviewWithRatioParams(
        { imgSrc, image, params, parentContainerWidth }
      );
      let previewImg = this.getPreviewImg({ isPreviewImg, container, isRatio, isLazy, image });

      if (!isUpdate) {
        setAnimation(previewImg, updateSizeWithPixelRatio(parentContainerWidth));
      }

      this.setSrc(previewImg, url, 'data-src');
      this.setSrc(image, cloudimageUrl, 'data-src');

      image.onload = this.onPreviewWithRatioImageLoad.bind(this, wrapper, previewImg, image);

    } else {
      const cloudimageUrl = generateUrl(imgSrc, params, this.config, updateSizeWithPixelRatio(parentContainerWidth));

      image.onload = () => { this.onImageLoad({ wrapper, image }); };
      this.setSrc(image, cloudimageUrl);
    }
  }

  processImage(image, isUpdate) {
    const isLazy = this.config.lazyLoading;
    const isSavedWindowInnerWidthMoreThanCurrent = this.innerWidth < window.innerWidth;

    if (isResponsiveAndLoaded(image) && !isSavedWindowInnerWidthMoreThanCurrent) {
      return;
    }

    let parentContainerWidth = getParentWidth(image, this.config);
    let {
      params = {},
      sizes = this.config.sizes,
      ratio = this.config.ratio,
      src
    } = getImageProps(image);
    const isRelativeUrlPath = checkIfRelativeUrlPath(src);
    const imgSrc = getImgSrc(src, isRelativeUrlPath, this.config.baseUrl);
    // const isPreview = !this.config.isChrome && (parentContainerWidth > 400) && this.config.lazyLoading;
    const isPreview = (parentContainerWidth > 400) && this.config.lazyLoading;

    if (!src) return;

    if (!isOldBrowsers()) {
      image.src = imgSrc;

      return;
    }

    const isAdaptive = !!sizes;

    if (isAdaptive && isUpdate) return;

    this.initImageClasses({ image, isLazy });

    if (this.config.imgLoadingAnimation && !isUpdate) {
      setAnimation(image, parentContainerWidth);
    }

    const processProps = { ratio, params, image, isUpdate, isPreview, imgSrc, parentContainerWidth, isLazy };

    if (!isAdaptive) {
      this.processImageResponsive(processProps);
    } else {
      this.processImageAdaptive({ ...processProps, sizes });
    }
  }

  applyOrUpdateWrapper = ({ isUpdate, image, isRatio, ratioBySize, ratio, isPreview }) => {
    let wrapper = null;

    if (!isUpdate) {
      wrapper = this.wrap(image, null, isRatio, ratioBySize, ratio, isPreview);
    } else {
      wrapper = getWrapper(image);

      if (isRatio) {
        wrapper.style.paddingBottom = (100 / (ratioBySize || ratio)) + '%';
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

    return [ratioBySize, !!(ratioBySize || ratio)];
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

      if (!isUpdate) {
        setAnimation(image, containerWidth, true);
      }

      image.setAttribute('ci-optimized-url', cloudimageUrl);
      this.setBackgroundSrc(image, lowQualityUrl);
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

      this.setBackgroundSrc(image, cloudimageUrl);
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
        this.setBackgroundSrc(image, imageToLoad);
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
        this.setBackgroundSrc(image, imagePreviewToLoad);
      }
    }
  }

  processBackgroundImage(image, isUpdate) {
    const isLazy = this.config.lazyLoading;
    const isSavedWindowInnerWidthMoreThanCurrent = this.innerWidth < window.innerWidth;

    if (isResponsiveAndLoaded(image) && !isSavedWindowInnerWidthMoreThanCurrent) {
      return;
    }

    let containerWidth = getContainerWidth(image, this.config);
    let {
      params = {},
      sizes = this.config.sizes,
      ratio = this.config.ratio,
      src
    } = getBackgroundImageProps(image);
    const isRelativeUrlPath = checkIfRelativeUrlPath(src);
    const imgSrc = getImgSrc(src, isRelativeUrlPath, this.config.baseUrl);
    // const isPreview = !this.config.isChrome && (parentContainerWidth > 400) && this.config.lazyLoading;
    const isPreview = (containerWidth > 400) && this.config.lazyLoading;

    if (!src) return;

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
      this.processBackgroundImageAdaptive({...processProps, sizes});
    }

    this.bgImageIndex += 1;
  }

  setSrc(image, url, propertyName) {
    const { lazyLoading, dataSrcAttr } = this.config;

    image.setAttribute(
      propertyName ? propertyName : (lazyLoading ? 'data-src' : dataSrcAttr ? dataSrcAttr : 'src'),
      url
    );
  }

  setSrcset(source, url) {
    const { lazyLoading, dataSrcsetAttr } = this.config;

    source.setAttribute(lazyLoading ? 'data-srcset' : dataSrcsetAttr ? dataSrcsetAttr : 'srcset', url);
  }

  setBackgroundSrc(image, url) {
    const { lazyLoading, dataSrcAttr } = this.config;

    if (lazyLoading) {
      image.setAttribute((dataSrcAttr ? dataSrcAttr : 'data-bg'), url);
    } else {
      image.style.backgroundImage = `url('${url}')`
    }
  }

  wrap(image, wrapper, isRatio, ratioBySize, ratio) {
    if ((image.parentNode.className || '').indexOf('ci-image-wrapper') > -1 ||
      (image.parentNode.parentNode.className || '').indexOf('ci-image-wrapper') > -1) {
      wrapper = image.parentNode;

      addClass(wrapper, 'ci-image-wrapper');
      wrapper.style.background = this.config.placeholderBackground;

      if (isRatio) {
        addClass(wrapper, 'ci-image-wrapper-ratio');
      }

      return;
    }

    wrapper = wrapper || document.createElement('div');

    addClass(wrapper, 'ci-image-wrapper');
    wrapper.style.background = this.config.placeholderBackground;

    if (isRatio) {
      addClass(wrapper, 'ci-image-wrapper-ratio');
      wrapper.style.paddingBottom = (100 / (ratioBySize || ratio)) + '%';
    }

    if (image.nextSibling) {
      image.parentNode.insertBefore(wrapper, image.nextSibling);
    } else {
      image.parentNode.appendChild(wrapper);
    }

    wrapper.appendChild(image);

    return wrapper;
  }

  addSources(image, previewSources) {
    [...previewSources.slice(1).reverse()].forEach(({ mediaQuery, srcSet }) => {
      const source = this.createSource(mediaQuery, srcSet);

      insertSource(image, source);
    });

    insertSource(image, this.createSource(null, previewSources[0].srcSet));
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

  createSource(mediaQuery, srcSet) {
    const source = document.createElement('source');

    if (mediaQuery) {
      source.media = mediaQuery;
    }

    this.setSrcset(source, srcSet)

    return source;
  }

  updateSources(image, previewSources, sources) {
    const sourcesElems = image.parentNode.querySelectorAll('source');

    sourcesElems.forEach((elem, index) => {
      this.setSrcset(elem, sources[index].srcSet);
    })
  }
}