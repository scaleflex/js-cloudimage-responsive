import {
  addClass,
  checkIfRelativeUrlPath,
  createCSSSource,
  filterImages,
  generateSources,
  generateUrl,
  getAdaptiveSize,
  getBackgroundImageProps,
  getBreakPoint,
  getContainerWidth, getImageInlineProps,
  getImageProps,
  getImgSrc,
  getInitialConfigPlain,
  getParentWidth,
  insertSource,
  isOldBrowsers,
  isResponsiveAndLoaded,
  updateSizeWithPixelRatio,
  wrapWithPicture
} from '../common/ci.utils';
import { debounce } from 'throttle-debounce';


export default class CIResponsive {
  bgImageIndex = 0;

  constructor(config) {
    this.config = getInitialConfigPlain(config);

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
    const responsiveCss = bgContainer.getAttribute('ci-responsive-css');

    if (bg) {
      let optimizedImage = new Image();

      optimizedImage.onload = () => {
        addClass(image, 'ci-image-loaded');
        bgContainer.removeAttribute('data-bg');
        bgContainer.removeAttribute('ci-preview');

        if (responsiveCss) {
          this.styleElem.appendChild(document.createTextNode(responsiveCss));
        }
      }

      optimizedImage.src = bg;

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

  processImageAdaptive = (props) => {
    const { params, image, isUpdate, imgSrc, parentContainerWidth, sizes } = props;
    const adaptiveSizes = getAdaptiveSize(sizes, this.config);

    if (isUpdate) return;

    const fallbackImageUrl = generateUrl(imgSrc, params, this.config, parentContainerWidth);

    wrapWithPicture(image);

    const sources = generateSources(imgSrc, params, adaptiveSizes, this.config, parentContainerWidth);

    image.onload = () => { addClass(image, 'ci-image-loaded'); };

    this.addSources(image, sources);
    this.setSrc(image, fallbackImageUrl);
  }

  processImageResponsive = (props) => {
    const { params, image, imgSrc, resultImageWidth } = props;
    const cloudimageUrl = generateUrl(imgSrc, params, this.config, updateSizeWithPixelRatio(resultImageWidth));

    image.onload = () => { addClass(image, 'ci-image-loaded'); };
    this.setSrc(image, cloudimageUrl);
  }

  processImage(image, isUpdate) {
    const isLazy = this.config.lazyLoading;
    const isSavedWindowInnerWidthMoreThanCurrent = this.innerWidth < window.innerWidth;

    if (isResponsiveAndLoaded(image) && !isSavedWindowInnerWidthMoreThanCurrent) {
      return;
    }

    let { imageWidth, imageHeight } = getImageInlineProps(image);
    let parentContainerWidth = getParentWidth(image, this.config, imageWidth);
    let {
      params = {},
      sizes = this.config.sizes,
      src
    } = getImageProps(image);

    if (!src) return;

    const isRelativeUrlPath = checkIfRelativeUrlPath(src);
    const resultImageWidth = imageWidth || parentContainerWidth;
    const imgSrc = getImgSrc(src, isRelativeUrlPath, this.config.baseUrl);

    if (!isOldBrowsers()) {
      image.src = imgSrc;

      return;
    }

    const isAdaptive = !!sizes;

    if (isAdaptive && isUpdate) return;

    this.initImageClasses({ image, isLazy });

    const processProps = {
      params, image, isUpdate, imgSrc, parentContainerWidth, resultImageWidth, isLazy, imageWidth, imageHeight
    };

    if (!isAdaptive) {
      this.processImageResponsive(processProps);
    } else {
      this.processImageAdaptive({ ...processProps, sizes });
    }
  }

  initImageClasses = ({ image, isLazy }) => {
    addClass(image, 'ci-image');

    if (isLazy) {
      addClass(image, 'lazyload');
    }
  }

  initImageBackgroundClasses = ({ image, isLazy }) => {
    addClass(image, 'ci-bg');

    if (isLazy) {
      addClass(image, 'lazyload');
    }
  }

  initImageBackgroundAttributes = ({ image }) => {
    image.setAttribute('ci-bg-index', this.bgImageIndex);
  }

  processBackgroundImageResponsive = (props) => {
    const { params, image, imgSrc, containerWidth, isLazy } = props;

    const cloudimageUrl = generateUrl(imgSrc, params, this.config, updateSizeWithPixelRatio(containerWidth));

    if (!isLazy) {
      let tempImage = new Image();

      tempImage.src = cloudimageUrl;
      tempImage.onload = () => { addClass(image, 'ci-image-loaded'); };
    }

    this.setBackgroundSrc(image, cloudimageUrl);
  }

  processBackgroundImageAdaptive = ({ imgSrc, sizes, params, containerWidth, isLazy, image }) => {
    const adaptiveSizes = getAdaptiveSize(sizes, this.config);
    const sources = generateSources(imgSrc, params, adaptiveSizes, this.config, containerWidth);
    const currentBreakpoint = getBreakPoint(adaptiveSizes) || adaptiveSizes[0];
    const imageToLoad = sources.find(breakPoint => breakPoint.mediaQuery === currentBreakpoint.media).srcSet;

    if (!isLazy) {
      this.addBackgroundSources(this.bgImageIndex, sources);

      let tempImage = new Image();

      tempImage.src = imageToLoad;

      tempImage.onload = () => { addClass(image, 'ci-image-loaded'); };
    } else {
      const responsiveCSS = this.addBackgroundSources(this.bgImageIndex, sources, true);

      image.setAttribute('ci-responsive-css', responsiveCSS);
      this.setBackgroundSrc(image, imageToLoad);
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
      src
    } = getBackgroundImageProps(image);

    if (!src) return;

    const isRelativeUrlPath = checkIfRelativeUrlPath(src);
    const imgSrc = getImgSrc(src, isRelativeUrlPath, this.config.baseUrl);

    if (!isOldBrowsers()) {
      image.style.backgroundImage = 'url(' + imgSrc + ')';

      return;
    }

    const isAdaptive = !!sizes;

    if (isAdaptive && isUpdate) return;

    this.initImageBackgroundClasses({ image, isLazy });

    this.initImageBackgroundAttributes({ image });

    const processProps = { params, image, isUpdate, imgSrc, containerWidth, isLazy };

    if (!isAdaptive) {
      this.processBackgroundImageResponsive(processProps);
    } else {
      this.processBackgroundImageAdaptive({ ...processProps, sizes });
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