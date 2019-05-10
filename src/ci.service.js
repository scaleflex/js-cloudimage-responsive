import {
  filterImages, getImageProps, getParentWidth, checkOnMedia, checkIfRelativeUrlPath, getImgSrc,
  getSizeAccordingToPixelRatio, generateUrl, generateSources, insertSource, addClass, getRatioBySize,
  isResponsiveAndLoaded, removeClass, getAdaptiveSize, getLowQualitySize, getContainerWidth, getBackgroundImageProps,
  getBreakPoint, getInitialConfig, createCSSSource, wrapWithPicture, finishAnimation, setAnimation, getWrapper
}
  from './ci.utils';
import { debounce } from 'throttle-debounce';


export default class CIResponsive {
  bgImageIndex = 0;

  constructor(config) {
    this.config = getInitialConfig(config);

    if (this.config.init) this.init();
  }

  init() {
    document.addEventListener('lazybeforeunveil', this.onLazyBeforeUnveil.bind(this));

    this.process();

    window.addEventListener('resize', debounce(100, this.onUpdateDimensions.bind(this)));
  }

  onUpdateDimensions() {
    const { innerWidth } = this.config;

    this.process(true);

    if (this.config.innerWidth < window.innerWidth) {
      this.config.innerWidth = window.innerWidth;
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
          console.log(ciOptimizedUrl)
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
    const backgroundImages = filterImages(document.querySelectorAll('[ci-bg]'), 'ci-bg');

    images.forEach(image => { this.processImage(image, isUpdate); });

    if (backgroundImages.length) {
      this.styleElem = document.createElement('style');

      document.head.appendChild(this.styleElem);

      backgroundImages.forEach(image => { this.processBackgroundImage(image, isUpdate); });
    }
  }

  processImage(image, isUpdate) {
    const isLazy = this.config.lazyLoading;

    if (isResponsiveAndLoaded(image) && !(this.config.innerWidth < window.innerWidth)) return;
    addClass(image, 'ci-image');

    if (isLazy)
      addClass(image, 'lazyload');

    let parentContainerWidth = getParentWidth(image, this.config);

    let {
      operation = this.config.operation,
      size = (this.config.size || parentContainerWidth),
      filters = this.config.filters,
      ratio,
      src
    } = getImageProps(image);
    const isAdaptive = checkOnMedia(size);
    size = isAdaptive ? getAdaptiveSize(size, this.config) : size;

    if (isAdaptive && isUpdate) return;

    const ratioBySize = getRatioBySize(size, operation);
    // const imageHeight = Math.floor(parentContainerWidth / (ratioBySize || ratio));
    const isRatio = !!(ratioBySize || ratio);
    let wrapper = null;

    ratio = ratio || this.config.ratio;

    const isRelativeUrlPath = checkIfRelativeUrlPath(src);
    const imgSrc = getImgSrc(src, isRelativeUrlPath, this.config.baseUrl);
    const resultSize = isAdaptive ? size : getSizeAccordingToPixelRatio(size, operation);
    // const isPreview = !this.config.isChrome && (parentContainerWidth > 400) && this.config.lazyLoading;
    const isPreview = (parentContainerWidth > 400) && this.config.lazyLoading;

    if (this.config.imgLoadingAnimation && !isUpdate) {
      setAnimation(image, parentContainerWidth);
    }

    if (!isUpdate) {
      wrapper = this.wrap(image, null, isRatio, ratioBySize, ratio, isPreview);
    } else {
      wrapper = getWrapper(image);

      if (isRatio) {
        wrapper.style.paddingBottom = (100 / (ratioBySize || ratio)) + '%';
      }

      if (isAdaptive) return;
    }

    if (isRatio) {
      addClass(image, 'ci-image-ratio');
    }

    if (isAdaptive) {
      const fallbackImageUrl =
        generateUrl('width', getSizeAccordingToPixelRatio(parentContainerWidth), filters, imgSrc, this.config);
      wrapWithPicture(image);
      const onImageLoad = () => {
        wrapper.style.background = 'transparent';
        wrapper.style.paddingBottom = '0';
        removeClass(image, 'ci-image-ratio');
        removeClass(wrapper, 'ci-image-wrapper-ratio')
        finishAnimation(image);
      }

      if (!isPreview) {
        const sources = generateSources(operation, resultSize, filters, imgSrc, isAdaptive, this.config);

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
        container.classList.add("ci-with-preview-image");
        container.insertBefore(previewImg, pictureElem);

        wrapWithPicture(previewImg);

        if (!isUpdate) {
          setAnimation(previewImg, parentContainerWidth);
        }

        const config = { ...this.config, queryString: '' };
        const url = generateUrl('width', (parentContainerWidth / 5), 'q5.foil1', imgSrc, config);
        const sources = generateSources(operation, resultSize, filters, imgSrc, isAdaptive, this.config);
        const previewSources = generateSources(operation, resultSize, 'q5.foil1', imgSrc, isAdaptive, config, true);

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

    else if (isPreview && isRatio) {
      const cloudimageUrl = generateUrl(operation, resultSize, filters, imgSrc, this.config);
      const container = image.parentNode;
      const isPreviewImg = container.className.indexOf('ci-with-preview-image') > -1;
      const config = { ...this.config, queryString: '' };
      const size = getLowQualitySize(resultSize, operation, 5);
      const url = generateUrl(operation, size, 'q5.foil1', imgSrc, config);
      let previewImg = null;

      if (isPreviewImg) {
        previewImg = container.querySelector('img.ci-image-preview');
      } else {
        previewImg = document.createElement('img');
        previewImg.className = `${isRatio ? 'ci-image-ratio ' : ''} ci-image-preview${isLazy ? ' lazyload' : ''}`;
        container.classList.add("ci-with-preview-image");
        image.parentNode.insertBefore(previewImg, image);
      }

      if (!isUpdate) {
        setAnimation(previewImg, parentContainerWidth);
      }
      this.setSrc(previewImg, url, 'data-src');

      this.setSrc(image, cloudimageUrl, 'data-src');

      image.onload = () => {
        wrapper.style.background = 'transparent';
        previewImg.style.display = 'none';

        if (this.config.imgLoadingAnimation) {
          finishAnimation(image);
        }
      }
    }

    else {
      const cloudimageUrl = generateUrl(operation, resultSize, filters, imgSrc, this.config);

      image.onload = () => {
        wrapper.style.background = 'transparent';

        if (this.config.imgLoadingAnimation) {
          finishAnimation(image);
        }
      };
      this.setSrc(image, cloudimageUrl);
    }
  }

  processBackgroundImage(image, isUpdate) {
    const isLazy = this.config.lazyLoading;

    if (isResponsiveAndLoaded(image) && !(this.config.innerWidth < window.innerWidth)) return;

    addClass(image, 'ci-bg');

    if (isLazy) {
      addClass(image, 'lazyload');
    }

    let containerWidth = getContainerWidth(image, this.config);

    let {
      operation = this.config.operation,
      size = (this.config.size || containerWidth),
      filters = this.config.filters,
      src
    } = getBackgroundImageProps(image);
    const isAdaptive = checkOnMedia(size);
    size = isAdaptive ? getAdaptiveSize(size, this.config) : size;

    if (isAdaptive && isUpdate) return;

    const isRelativeUrlPath = checkIfRelativeUrlPath(src);
    const imgSrc = getImgSrc(src, isRelativeUrlPath, this.config.baseUrl);
    const resultSize = isAdaptive ? size : getSizeAccordingToPixelRatio(size, operation);
    const isPreview = (containerWidth > 400) && this.config.lazyLoading;

    if (this.config.imgLoadingAnimation && !isUpdate) {
      setAnimation(image, containerWidth, true);
    }

    if (isPreview) {
      image.setAttribute('ci-preview', true);
    }

    image.setAttribute('ci-bg-index', this.bgImageIndex);

    if (isAdaptive) {
      const sources = generateSources(operation, resultSize, filters, imgSrc, isAdaptive, this.config);
      const currentBreakpoint = getBreakPoint(resultSize);
      const imageToLoad = sources.find(breakPoint => breakPoint.mediaQuery === currentBreakpoint.media).srcSet;

      /* Adaptive without Preview*/
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
      }
      /* Adaptive and Preview*/
      else {
        const config = { ...this.config, queryString: '' };
        const previewSources = generateSources(operation, resultSize, 'q5.foil1', imgSrc, isAdaptive, config, true);
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
    /* Not Adaptive, Preview and has Ratio*/
    else if (isPreview) {
      const cloudimageUrl = generateUrl(operation, resultSize, filters, imgSrc, this.config);

      const config = { ...this.config, queryString: '' };
      const lowQualitySize = getLowQualitySize(resultSize, operation, 5);
      const lowQualityUrl = generateUrl(operation, lowQualitySize, 'q5.foil1', imgSrc, config);

      image.className = `${image.className}${isLazy ? ' lazyload' : ''}`;

      if (!isUpdate) {
        setAnimation(image, containerWidth, true);
      }

      image.setAttribute('ci-optimized-url', cloudimageUrl);
      this.setBackgroundSrc(image, lowQualityUrl);
    }

    /* Not Adaptive and No Preview */
    else {
      const cloudimageUrl = generateUrl(operation, resultSize, filters, imgSrc, this.config);

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