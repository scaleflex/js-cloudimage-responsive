import {
  addClass, checkIfRelativeUrlPath, filterImages, finishAnimation, generateUrl, getBackgroundImageProps,
  getContainerWidth, getImageProps, getImgSrc, getInitialConfigBlurHash, getParentWidth, getRatioBySizeAdaptive,
  getRatioBySizeSimple, getWrapper, isResponsiveAndLoaded, updateSizeWithPixelRatio, isOldBrowsers
} from '../common/ci.utils';
import { decode }  from './blurHash';
import { debounce } from 'throttle-debounce';


export default class CIResponsive {
  bgImageIndex = 0;

  constructor(config) {
    this.config = getInitialConfigBlurHash(config);

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
    const ciBlurHash = bgContainer.getAttribute('ci-blur-hash');
    const responsiveCss = bgContainer.getAttribute('ci-responsive-css');

    if (bg) {
      let optimizedImage = new Image();

      optimizedImage.onload = () => {
        const bgCanvas = bgContainer.querySelector('canvas');

        finishAnimation(bgContainer, true, ciBlurHash && bgCanvas);
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

  onImageLoad = ({ wrapper, image, canvas }) => {
    wrapper.style.background = 'transparent';

    if (canvas) {
      finishAnimation(image, false, canvas)
    }
  };

  applyOrUpdateBlurHashCanvas = (wrapper, blurHash) => {
    let canvas = wrapper.querySelector('canvas');

    if (!canvas && blurHash) {
      canvas = document.createElement("canvas");

      const pixels = decode(blurHash, 32, 32);
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext("2d");
      const imageData = ctx.getImageData(0,0,32,32);
      imageData.data.set(pixels);
      ctx.putImageData(imageData, 0, 0);
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.position = 'absolute';
      canvas.style.top = '0';
      canvas.style.bottom = '0';
      canvas.style.left = '0';
      canvas.style.right = '0';
      canvas.style.opacity = '1';
      canvas.style.transition = 'opacity 0.3s ease-in-out';

      wrapper.prepend(canvas);
    }

    return canvas;
  }

  processImageResponsive = (props) => {
    const { ratio, params, image, isUpdate, imgSrc, parentContainerWidth, blurHash } = props;
    const [ratioBySize, isRatio] = this.getRatio(ratio, params);
    let wrapper = this.applyOrUpdateWrapper({ isUpdate, image, isRatio, ratioBySize, ratio });

    const canvas = this.applyOrUpdateBlurHashCanvas(wrapper, blurHash);

    const cloudimageUrl = generateUrl(imgSrc, params, this.config, updateSizeWithPixelRatio(parentContainerWidth));

    image.onload = () => { this.onImageLoad({ wrapper, image, canvas: blurHash && canvas }) };
    this.setSrc(image, cloudimageUrl);
  }

  processImage(image, isUpdate) {
    const isLazy = this.config.lazyLoading;
    const isSavedWindowInnerWidthMoreThanCurrent = this.innerWidth < window.innerWidth;

    if (isResponsiveAndLoaded(image) && !isSavedWindowInnerWidthMoreThanCurrent) return;

    let parentContainerWidth = getParentWidth(image, this.config);
    let { params = {}, ratio = this.config.ratio, blurHash, src } = getImageProps(image);
    const isRelativeUrlPath = checkIfRelativeUrlPath(src);
    const imgSrc = getImgSrc(src, isRelativeUrlPath, this.config.baseUrl);

    if (!src) return;

    if (!isOldBrowsers(true)) {
      image.src = imgSrc;

      return;
    }

    this.initImageClasses(image, isLazy);
    this.initImageStyles(image);

    const processProps = { ratio, params, image, isUpdate, imgSrc, parentContainerWidth, isLazy, blurHash };

    this.processImageResponsive(processProps);
  }

  applyOrUpdateWrapper = ({ isUpdate, image, isRatio, ratioBySize, ratio }) => {
    let wrapper = null;

    if (!isUpdate) {
      wrapper = this.wrap(image, null, isRatio, ratioBySize, ratio);
    } else {
      wrapper = getWrapper(image);

      if (isRatio) {
        wrapper.style.paddingBottom = (100 / (ratioBySize || ratio)) + '%';
      }
    }

    return wrapper;
  }

  initImageClasses = (image, isLazy) => {
    addClass(image, 'ci-image');

    if (isLazy) {
      addClass(image, 'lazyload');
    }
  }

  initImageStyles = image => {
    image.style.display = 'block';
    image.style.width = '100%';
    image.style.padding = '0';
    image.style.position = 'absolute';
    image.style.top = '0';
    image.style.left = '0';
    image.style.height = 'auto';
  }

  getRatio = (ratio, params, adaptiveSize) => {
    const ratioBySize = adaptiveSize ?
      getRatioBySizeAdaptive(params, adaptiveSize) :
      getRatioBySizeSimple(params);

    return [ratioBySize, !!(ratioBySize || ratio)];
  }

  initImageBackgroundClasses = (image, isLazy) => {
    addClass(image, 'ci-bg');

    if (isLazy) {
      addClass(image, 'lazyload');
    }
  }

  initImageBackgroundAttributes = (image) => {
    image.setAttribute('ci-bg-index', this.bgImageIndex);
  }

  initImageBackgroundStyles = (image) => {
    image.style.position = (!image.style.position || image.style.position === 'static') ?
      'relative' : image.style.position;
  }

  processBackgroundImageResponsive = (props) => {
    const { params, image, imgSrc, containerWidth, isLazy, blurHash } = props;

    const canvas = this.applyOrUpdateBlurHashCanvas(image, blurHash);

    const cloudimageUrl = generateUrl(imgSrc, params, this.config, updateSizeWithPixelRatio(containerWidth));

    if (!isLazy) {
      let tempImage = new Image();

      tempImage.src = cloudimageUrl;

      tempImage.onload = () => {
        finishAnimation(image, true, blurHash && canvas);
      };
    }

    this.setBackgroundSrc(image, cloudimageUrl);
  }

  processBackgroundImage(image) {
    const isLazy = this.config.lazyLoading;
    const isSavedWindowInnerWidthMoreThanCurrent = this.innerWidth < window.innerWidth;

    if (isResponsiveAndLoaded(image) && !isSavedWindowInnerWidthMoreThanCurrent) return;

    let containerWidth = getContainerWidth(image, this.config);
    let { params = {}, ratio = this.config.ratio, blurHash, src } = getBackgroundImageProps(image);

    const isRelativeUrlPath = checkIfRelativeUrlPath(src);
    const imgSrc = getImgSrc(src, isRelativeUrlPath, this.config.baseUrl);

    if (!src) return;

    if (!isOldBrowsers(true)) {
      image.style.backgroundImage = 'url(' + imgSrc + ')';

      return;
    }

    this.initImageBackgroundClasses(image, isLazy);
    this.initImageBackgroundAttributes(image);
    this.initImageBackgroundStyles(image);

    const processProps = { ratio, params, image, imgSrc, isLazy, containerWidth, blurHash };

    this.processBackgroundImageResponsive(processProps);

    this.bgImageIndex += 1;
  }

  setSrc(image, url, propertyName) {
    const { lazyLoading, dataSrcAttr } = this.config;

    image.setAttribute(
      propertyName ? propertyName : (lazyLoading ? 'data-src' : dataSrcAttr ? dataSrcAttr : 'src'),
      url
    );
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
      wrapper.style.display = 'block';
      wrapper.style.width = '100%';
      wrapper.style.overflow = 'hidden';
      wrapper.style.position = 'relative';

      return;
    }

    wrapper = wrapper || document.createElement('div');

    addClass(wrapper, 'ci-image-wrapper');
    wrapper.style.background = this.config.placeholderBackground;
    wrapper.style.display = 'block';
    wrapper.style.width = '100%';
    wrapper.style.overflow = 'hidden';
    wrapper.style.position = 'relative';

    if (isRatio) {
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
}