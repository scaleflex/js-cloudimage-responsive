import {
  getPresets, filterImages, getImageProps, getParentWidth, checkOnMedia, checkIfRelativeUrlPath,
  getImgSrc, getSizeAccordingToPixelRatio, generateUrl, generateSources, insertSource, addClass, getRatioBySize,
  isResponsiveAndLoaded
} from './ci.utils';
import { debounce } from 'throttle-debounce';


export default class CIResponsive {
  constructor(config) {
    const {
      token = '',
      container = 'cloudimg.io',
      ultraFast = false,
      lazyLoading = false,
      imgLoadingAnimation = true,
      lazyLoadOffset = 100,
      width = '400',
      height = '300',
      operation = 'width',
      filters = 'n',
      placeholderBackground = '#f4f4f4',
      baseUrl = '/',
      ratio = 1.5,
      presets,
      queryString = ''
    } = config;

    this.head = document.head || document.getElementsByTagName('head')[0];
    this.backgroundImgIndex = 0;
    this.forceUpdate = false;
    this.config = {
      token,
      container,
      ultraFast,
      lazyLoading,
      imgLoadingAnimation,
      lazyLoadOffset,
      width,
      height,
      operation,
      filters,
      placeholderBackground,
      baseUrl,
      ratio,
      presets: presets ? getPresets(presets, 'presets') :
        {
          xs: 575,  // up to 576    PHONE
          sm: 767,  // 577 - 768    PHABLET
          md: 991,  // 769 - 992    TABLET
          lg: 1199, // 993 - 1200   SMALL_LAPTOP_SCREEN
          xl: 3000  // from 1200    USUALSCREEN
        },
      order: presets ? getPresets(presets, 'order') : ['xl', 'lg', 'md', 'sm', 'xs'],
      queryString,
      innerWidth: window.innerWidth,
      //isChrome: /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)
    };

    this.updateDimensions = debounce(100, () => {
      const { innerWidth } = this.config;

      this.process(true);

      if (this.config.innerWidth < window.innerWidth)
        this.config.innerWidth = window.innerWidth;
    });

    window.addEventListener('resize', this.updateDimensions);
  }

  init() {
    this.process();
  }

  setForceUpdate() {
    this.forceUpdate = value;

    if (value) this.process(true);
  }

  process(isUpdate) {
    const images = filterImages(document.querySelectorAll('img[ci-src]'), 'ci-src');
    // in progress
    //const backgroundImages = filterImages(document.querySelectorAll('[ci-background]'), 'ci-background');

    images.forEach((image) => { this.processImage(image, isUpdate); });
    // in progress
    //backgroundImages.forEach((image) => { this.processBackgroundImage(image); });
  }

  processImage(image, isUpdate) {
    if (isResponsiveAndLoaded(image) && !(this.config.innerWidth < window.innerWidth)) return;
    addClass(image, 'ci-image');

    if (this.config.lazyLoading)
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
    const ratioBySize = getRatioBySize(size, this.config);
    const imageHeight = Math.floor(parentContainerWidth / (ratioBySize || ratio));
    const isRatio = !!(ratioBySize || ratio);
    let wrapper = null;

    ratio = ratio || this.config.ratio;
    size = isAdaptive ? eval('(' + size + ')') : size;

    const isRelativeUrlPath = checkIfRelativeUrlPath(src);
    const imgSrc = getImgSrc(src, isRelativeUrlPath, this.config.baseUrl);
    const resultSize = isAdaptive ? size : getSizeAccordingToPixelRatio(size);
    //const isPreview = !this.config.isChrome && (parentContainerWidth > 400) && this.config.lazyLoading;
    const isPreview = (parentContainerWidth > 400) && this.config.lazyLoading;
    const cloudimageUrl = isAdaptive ?
      generateUrl('width', parentContainerWidth, filters, imgSrc, this.config) :
      generateUrl(operation, resultSize, filters, imgSrc, this.config);

    if (this.config.imgLoadingAnimation) {
      this.setAnimation(image, parentContainerWidth);
    }

    if (!isUpdate) {
      wrapper = this.wrap(image, null, isRatio, ratioBySize, ratio, isPreview);
    } else {
      wrapper = this.getWrapper(image);

      if (isRatio) {
        wrapper.style.paddingBottom = (100 / (ratioBySize || ratio)) + '%';
      }

      if (isAdaptive) return;
    }

    if (isRatio) {
      addClass(image, 'ci-image-ratio');
    }

    if (isAdaptive && !isPreview) {
      this.wrapWithPicture(image);

      const sources = generateSources(operation, resultSize, filters, imgSrc, isAdaptive, this.config);

      this.addSources(image, sources);
      this.setSrc(image, cloudimageUrl);

      if (this.config.imgLoadingAnimation) {
        image.onload = () => {
          wrapper.style.background = 'transparent';
          this.finishAnimation(image);
        }
      }
    }

    else if (isAdaptive && isPreview && isRatio) {
      this.wrapWithPicture(image);

      let previewImg = null;
      const container = image.parentNode.parentNode;
      const isPreviewImg = container.className.indexOf('ci-with-preview-image') > -1;

      if (isPreviewImg) {
        previewImg = container.querySelector('img.ci-image-preview');
      } else {
        const pictureElem = container.querySelector('picture');

        previewImg = document.createElement('img');
        previewImg.className = `${isRatio ? 'ci-image-ratio ' : ''}ci-image-preview lazyload`;
        container.classList.add("ci-with-preview-image");
        container.insertBefore(previewImg, pictureElem);
      }

      this.wrapWithPicture(previewImg);

      this.setAnimation(previewImg, parentContainerWidth);

      const config = { ...this.config, queryString: '' };
      const url = generateUrl('width', (parentContainerWidth / 5), 'q5.foil1', imgSrc, config);
      const sources = generateSources(operation, resultSize, filters, imgSrc, isAdaptive, this.config);
      const previewSources = generateSources(operation, resultSize, 'q5.foil1', imgSrc, isAdaptive, config, true);

      this.addSources(previewImg, previewSources);
      this.addSources(image, sources);

      this.setSrc(previewImg, url);
      this.setSrc(image, cloudimageUrl);

      image.onload = () => {
        wrapper.style.background = 'transparent';
        previewImg.style.display = 'none';
        this.finishAnimation(image);
      }
    }

    else if (isPreview && isRatio) {
      const container = image.parentNode;
      const isPreviewImg = container.className.indexOf('ci-with-preview-image') > -1;
      const config = { ...this.config, queryString: '' };
      const size = resultSize.split('x').map(size => size / 5).join('x');
      const url = generateUrl(operation, size, 'q5.foil1', imgSrc, config);
      let previewImg = null;

      if (isPreviewImg) {
        previewImg = container.querySelector('img.ci-image-preview');
      } else {
        previewImg = document.createElement('img');
        previewImg.className = `${isRatio ? 'ci-image-ratio ' : ''} ci-image-preview lazyload`;
        container.classList.add("ci-with-preview-image");
        image.parentNode.insertBefore(previewImg, image);
      }

      this.setAnimation(previewImg, parentContainerWidth);
      this.setSrc(previewImg, url, 'data-src');

      this.setSrc(image, cloudimageUrl, 'data-src');

      image.onload = () => {
        wrapper.style.background = 'transparent';
        previewImg.style.display = 'none';
        this.finishAnimation(image);
      }
    }

    else {
      image.onload = () => {
        wrapper.style.background = 'transparent';
        this.finishAnimation(image);
      };
      this.setSrc(image, cloudimageUrl);
    }
  }

  getWrapper(image) {
    if ((image.parentNode.className || '').indexOf('ci-image-wrapper') > -1) {
      return image.parentNode;
    }
    else if ((image.parentNode.parentNode.className || '').indexOf('ci-image-wrapper') > -1) {
      return image.parentNode.parentNode;
    }
  }

  setSrc(image, url, propertyName) {
    const { lazyLoading, dataSrcAttr } = this.config;

    image.setAttribute(propertyName ? propertyName : (lazyLoading ? 'data-src' : dataSrcAttr ? dataSrcAttr : 'src'), url);
  }

  setSrcset(source, url) {
    const { lazyLoading, dataSrcsetAttr } = this.config;

    source.setAttribute(lazyLoading ? 'data-srcset' : dataSrcsetAttr ? dataSrcsetAttr : 'srcset', url);
  }

  setAnimation(image, parentContainerWidth) {
    image.style.filter = `blur(${Math.floor(parentContainerWidth / 100)}px)`;
    image.style.transform = 'scale3d(1.1, 1.1, 1)';

    setTimeout(() => {
      image.style.transition = 'all 0.3s ease-in-out';
    })
  }

  finishAnimation(image) {
    image.style.filter = 'blur(0px)';
    image.style.transform = 'translateZ(0) scale3d(1, 1, 1)';
    addClass(image, 'ci-image-loaded');
  }

  wrap(image, wrapper, isRatio, ratioBySize, ratio) {
    if ((image.parentNode.className || '').indexOf('ci-image-wrapper') > -1 ||
      (image.parentNode.parentNode.className || '').indexOf('ci-image-wrapper') > -1) {
      wrapper = image.parentNode;

      addClass(wrapper, 'ci-image-wrapper');
      wrapper.style.background =  this.config.placeholderBackground;

      if (isRatio) {
        addClass(wrapper, 'ci-image-wrapper-ratio');
      }

      return;
    }

    wrapper = wrapper || document.createElement('div');

    addClass(wrapper, 'ci-image-wrapper');
    wrapper.style.background =  this.config.placeholderBackground;

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

  wrapWithPicture(image, wrapper) {
    if ((image.parentNode.nodeName || '').toLowerCase() !== 'picture') {
      wrapper = wrapper || document.createElement('picture');

      if (image.nextSibling) {
        image.parentNode.insertBefore(wrapper, image.nextSibling);
      } else {
        image.parentNode.appendChild(wrapper);
      }

      wrapper.appendChild(image);
    }
  }

  addSources (image, previewSources) {
    previewSources.forEach((previewSources) => {
      const source = document.createElement('source');

      source.media = previewSources.mediaQuery;
      this.setSrcset(source, previewSources.srcSet)

      insertSource(image, source);
    });
  }

  updateSources(image, previewSources, sources) {
    const sourcesElems = image.parentNode.querySelectorAll('source');

    sourcesElems.forEach((elem, index) => {
      if (this.config.lazyLoading)
        this.setSrcset(elem, sources[index].srcSet);

      elem.srcset = sources[index].srcSet;
    })
  }

  processBackgroundImage() {
    // in progress
  }
}