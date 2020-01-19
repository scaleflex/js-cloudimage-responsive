import {
  addClass,
  checkIfRelativeUrlPath,
  filterImages,
  finishAnimation,
  generateUrl,
  getBackgroundImageProps,
  getContainerWidth,
  getImageInlineProps,
  getImageProps,
  getImgSrc,
  getInitialConfigBlurHash,
  getParentWidth,
  getRatioBySizeAdaptive,
  getRatioBySizeSimple,
  getWrapper,
  isOldBrowsers,
  isResponsiveAndLoaded,
  updateSizeWithPixelRatio,
  setWrapperAlignment
} from '../common/ci.utils';
import { decode } from './blurHash';
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

  onImageLoad = ({ wrapper, image, canvas, ratio, fill }) => {
    wrapper.style.background = 'transparent';

    if (!ratio) {
      wrapper.style.paddingBottom = ((fill || 100) / ((image.width / image.height) || 1)) + '%';
    }

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
      const imageData = ctx.getImageData(0, 0, 32, 32);
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
    const {
      ratio, params, image, isUpdate, imgSrc, parentContainerWidth, imageWidth, imageHeight, blurHash, fill, alignment,
      isLazy
    } = props;
    const [ratioBySize, isRatio] = this.getRatio(ratio || this.config.ratio, params);
    let wrapper = this.applyOrUpdateWrapper(
      { isUpdate, image, isRatio, ratioBySize, ratio, imageWidth, imageHeight, fill, alignment }
    );

    const canvas = this.applyOrUpdateBlurHashCanvas(wrapper, blurHash);

    const cloudimageUrl = generateUrl(imgSrc, params, this.config, updateSizeWithPixelRatio(parentContainerWidth));

    image.onload = () => { this.onImageLoad({ wrapper, image, canvas: blurHash && canvas, ratio, fill }) };
    this.setSrc(image, cloudimageUrl, null , isLazy);
  }

  processImage(image, isUpdate) {
    let isLazy = this.config.lazyLoading;
    const isSavedWindowInnerWidthMoreThanCurrent = this.innerWidth < window.innerWidth;

    if (isResponsiveAndLoaded(image) && !isSavedWindowInnerWidthMoreThanCurrent) return;

    let { imageWidth, imageHeight, imageRatio } = getImageInlineProps(image);
    let parentContainerWidth = getParentWidth(image, this.config, imageRatio && imageWidth);
    let { params = {}, ratio, blurHash, src, fill, alignment, isLazyCanceled } = getImageProps(image);

    if (isLazyCanceled && isLazy) {
      isLazy = false;
    }

    if (fill !== 100) {
      parentContainerWidth = parentContainerWidth * (isUpdate ? 1 : fill / 100);
    }

    if (!src) return;

    const isRelativeUrlPath = checkIfRelativeUrlPath(src);
    const imgSrc = getImgSrc(src, isRelativeUrlPath, this.config.baseUrl);

    if (!isOldBrowsers(true)) {
      image.src = imgSrc;

      return;
    }

    this.initImageClasses(image, isLazy);
    this.initImageStyles(image);

    const processProps = {
      ratio, params, image, isUpdate, imgSrc, parentContainerWidth, imageWidth, imageHeight, isLazy, blurHash, fill,
      alignment
    };

    this.processImageResponsive(processProps);
  }

  applyOrUpdateWrapper = props => {
    const { isUpdate, image, isRatio, ratioBySize, ratio, imageWidth, imageHeight, fill, alignment } = props;
    let wrapper = null;
    let imageRatio = imageWidth && imageHeight && (parseInt(imageWidth) / parseInt(imageHeight));

    if (!isUpdate) {
      wrapper = this.wrap(
        image, null, isRatio, ratioBySize, ratio || this.config.ratio, imageRatio, imageWidth, imageHeight, fill,
        alignment
      );
    } else {
      wrapper = getWrapper(image);

      if (isRatio && !imageRatio) {
        wrapper.style.paddingBottom = ((fill || 100) / (ratioBySize || ratio || this.config.ratio)) + '%';
      } else if (imageRatio) {
        wrapper.style.height = imageHeight + 'px';
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

    this.setBackgroundSrc(image, cloudimageUrl, isLazy);
  }

  processBackgroundImage(image) {
    let isLazy = this.config.lazyLoading;
    const isSavedWindowInnerWidthMoreThanCurrent = this.innerWidth < window.innerWidth;

    if (isResponsiveAndLoaded(image) && !isSavedWindowInnerWidthMoreThanCurrent) return;

    let containerWidth = getContainerWidth(image, this.config);
    let { params = {}, ratio, blurHash, src, isLazyCanceled } = getBackgroundImageProps(image);

    if (isLazyCanceled && isLazy) {
      isLazy = false;
    }

    if (!src) return;

    const isRelativeUrlPath = checkIfRelativeUrlPath(src);
    const imgSrc = getImgSrc(src, isRelativeUrlPath, this.config.baseUrl);

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

  setSrc(image, url, propertyName, isLazy) {
    const { dataSrcAttr } = this.config;

    image.setAttribute(
      propertyName ? propertyName : (isLazy ? 'data-src' : dataSrcAttr ? dataSrcAttr : 'src'),
      url
    );
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
      wrapper.style.display = 'block';
      wrapper.style.width = imageRatio ? imageWidth + 'px' : '100%';
      wrapper.style.overflow = 'hidden';
      wrapper.style.position = 'relative';

      if (imageRatio && imageHeight) {
        wrapper.style.height = imageHeight + 'px';
      }

      setWrapperAlignment(wrapper, alignment);

      if (fill !== 100 && !imageRatio) {
        wrapper.style.width = `${fill}%`;
      }

      return;
    }

    wrapper = wrapper || document.createElement('div');

    addClass(wrapper, 'ci-image-wrapper');
    wrapper.style.background = this.config.placeholderBackground;
    wrapper.style.display = 'block';
    wrapper.style.width = imageRatio ? imageWidth + 'px' : '100%';
    wrapper.style.overflow = 'hidden';
    wrapper.style.position = 'relative';

    if (imageRatio && imageHeight) {
      wrapper.style.height = imageHeight + 'px';
    }

    if (isRatio && !imageRatio) {
      wrapper.style.paddingBottom = ((fill || 100) / (ratioBySize || ratio || this.config.ratio)) + '%';
    }

    if (image.nextSibling) {
      image.parentNode.insertBefore(wrapper, image.nextSibling);
    } else {
      image.parentNode.appendChild(wrapper);
    }

    setWrapperAlignment(wrapper, alignment);

    if (fill !== 100 && !imageRatio) {
      wrapper.style.width = `${fill}%`;
    }

    wrapper.appendChild(image);

    return wrapper;
  }
}