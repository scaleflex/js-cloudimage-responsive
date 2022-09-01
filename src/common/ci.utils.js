/* eslint-disable no-empty */
import { getParamsFromURL } from 'cloudimage-responsive-utils/dist/utils/get-params-from-url';


const attr = (element, attribute) => element.getAttribute(attribute);

const getURLWithoutQueryParams = (url = '') => url.split('?')[0];

const isTrue = (element, attribute) => {
  const imgProp = attr(element, attribute);
  const imgDataProp = attr(element, `data-${attribute}`);

  return (imgProp !== null && imgProp !== 'false') || (imgDataProp !== null && imgDataProp !== 'false');
};

const getSize = (sizes) => {
  let resultSizes = null;

  try {
    // add quotes around params
    let temp = sizes.replace(/(\w+:)|(\w+ :)/g, (matchedStr) => {
      if (matchedStr === 'https:' || matchedStr === 'http:') {
        return matchedStr;
      }
      return `"${matchedStr.substring(0, matchedStr.length - 1)}":`;
    });
    // change single quotes to double quotes
    temp = temp.replace(/'/g, '"').replace(/-"width":/g, '-width:');
    resultSizes = JSON.parse(temp);
  } catch (e) { }

  if (resultSizes) {
    Object.keys(resultSizes).forEach((key) => {
      if (typeof resultSizes[key] === 'string') {
        try {
          resultSizes[key] = JSON.parse(`{"${decodeURI(resultSizes[key].replace(/&/g, '","').replace(/=/g, '":"'))}"}`);
        } catch (e) { }
      }
    });
  }

  return resultSizes;
};

const getParams = (params) => {
  let resultParams;

  try {
    const temp = params.replace(/(\w+:)|(\w+ :)/g, (matchedStr) => `"${matchedStr.substring(0, matchedStr.length - 1)}":`);

    resultParams = JSON.parse(temp);
  } catch (e) { }

  if (!resultParams) {
    try {
      resultParams = JSON.parse(`{"${decodeURI(params.replace(/&/g, '","').replace(/=/g, '":"'))}"}`);
    } catch (e) { }
  }

  return resultParams;
};

const getCommonImageProps = (image) => ({
  sizes: getSize(attr(image, 'ci-sizes') || attr(image, 'data-ci-size') || {}) || undefined,
  params: getParams(attr(image, 'ci-params') || attr(image, 'data-ci-params') || {}),
  imgNodeRatio: attr(image, 'ci-ratio') || attr(image, 'data-ci-ratio') || undefined,
  blurHash: attr(image, 'ci-blur-hash') || attr(image, 'data-ci-blur-hash') || undefined,
  isLazyCanceled: (attr(image, 'ci-not-lazy') !== null || attr(image, 'data-ci-not-lazy') !== null) || undefined,
  preserveSize: (attr(image, 'ci-preserve-size') !== null || attr(image, 'data-preserve-size') !== null) || undefined,
  imgNodeWidth: attr(image, 'width'),
  imgNodeHeight: attr(image, 'height'),
  doNotReplaceImageUrl: isTrue(image, 'ci-do-not-replace-url'),
  alt: attr(image, 'alt'),
  zoom: attr(image, 'ci-zoom') || undefined,
  gallery: attr(image, 'ci-gallery') || undefined,
});

const filterImages = (images, type) => {
  const filtered = [];

  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    const isProcessed = image.className.includes(type);

    if (!isProcessed) {
      filtered.push(image);
    }
  }

  return filtered;
};

const getImageProps = (image, imgSelector) => {
  const props = {
    ...getCommonImageProps(image),
    imgNodeSRC: attr(image, imgSelector) || undefined,
    isProcessedByGallery: isTrue(image, 'data-ci-processed-gallery'),
  };

  const params = {
    ...getParamsFromURL(props.imgNodeSRC || ''),
    ...props.params,
  };

  return {
    ...props,
    params,
    isAdaptive: !!props.sizes,
    imgNodeSRC: getURLWithoutQueryParams(props.imgNodeSRC),
  };
};

const getBackgroundImageProps = (image, bgSelector) => {
  const props = {
    ...getCommonImageProps(image),
    imgNodeSRC: attr(image, bgSelector) || undefined,
    minWindowWidth: attr(image, 'ci-min-window-width') || attr(image, 'data-min-window-width') || undefined,
  };
  const params = {
    ...getParamsFromURL(props.imgNodeSRC || ''),
    ...props.params,
  };

  return {
    ...props,
    params,
    isAdaptive: !!props.sizes,
    imgNodeSRC: getURLWithoutQueryParams(props.imgNodeSRC),
  };
};

const addClass = (elem, className) => {
  if (!(elem.className.indexOf(className) > -1)) {
    elem.className += ` ${className}`;
  }
};

const getWrapper = (image) => {
  if ((image.parentNode.className || '').indexOf('ci-image-wrapper') > -1) {
    return image.parentNode;
  } if ((image.parentNode.parentNode.className || '').indexOf('ci-image-wrapper') > -1) {
    return image.parentNode.parentNode;
  }

  return image.parentNode.parentNode;
};

const isLazy = (lazyLoading, isLazyCanceled, isUpdate) => {
  if ((isLazyCanceled && lazyLoading) || isUpdate) {
    lazyLoading = false;
  }

  return lazyLoading;
};

const setSrc = (image, url, propertyName, lazy, imgSrc, isSVG, dataSrcAttr) => {
  image.setAttribute(
    lazy ? (propertyName || 'data-src') : (dataSrcAttr || 'src'),
    isSVG ? imgSrc : url,
  );
};

const setSrcset = (image, urls, propertyName, lazy, imgSrc, isSVG, dataSrcAttr) => {
  if (isSVG) return;

  image.setAttribute(
    lazy ? (propertyName || 'data-srcset') : (dataSrcAttr || 'srcset'),
    urls.map(({ dpr, url }) => `${url} ${dpr}x`).join(', '),
  );
};

const setBackgroundSrc = (image, url, lazy, imgSrc, isSVG, dataSrcAttr) => {
  const resultLink = isSVG ? imgSrc : url;

  if (lazy) {
    image.setAttribute((dataSrcAttr || 'data-bg'), resultLink);
  } else {
    image.style.backgroundImage = `url('${resultLink}')`;
  }
};

const getFreshCIElements = (isUpdate, rootElement, imgSelector, bgSelector) => {
  let images; let
    backgroundImages;

  if (rootElement !== document && !(rootElement instanceof HTMLElement)) {
    throw new TypeError('rootElement should be an HTMLElement');
  }

  if (isUpdate) {
    images = rootElement.querySelectorAll(`img[${imgSelector}]`);
    backgroundImages = rootElement.querySelectorAll(`[${bgSelector}]`);
  } else {
    images = filterImages(rootElement.querySelectorAll(`img[${imgSelector}]`), 'ci-image');
    backgroundImages = filterImages(rootElement.querySelectorAll(`[${bgSelector}]`), 'ci-bg');
  }

  return [images, backgroundImages];
};

const destroyNodeImgSize = (imgNode) => {
  imgNode.removeAttribute('height');
  imgNode.removeAttribute('width');
};

const setAlt = (imgNode, alt) => {
  imgNode.setAttribute('alt', alt);
};

const removeClassNames = (node, classNames) => {
  classNames.forEach((className) => {
    if (node.classList.contains(className)) {
      node.classList.remove(className);
    }
  });

  return node;
};

const setOptions = (node, options) => {
  Object.entries(options).forEach(([key, value]) => {
    node.setAttribute(key, value);
  });

  return node;
};

const getZoomImage = (images, imgSrc) => images.filter((image) => imgSrc === image.getAttribute('ci-src'));

const getGalleryImages = (images, galleryName) => images && images.filter((image) => {
  const { gallery } = getCommonImageProps(image);

  return gallery === galleryName;
});

const createIcon = (iconSrc, className, iconStyles) => {
  const { color, width = 15, height = 15 } = iconStyles;

  const iconWrapper = document.createElement('div');
  const icon = new Image();

  icon.src = iconSrc;
  icon.width = width;
  icon.height = height;

  if (className) {
    iconWrapper.classList.add(className);
  }

  if (color) {
    iconWrapper.style.backgroundColor = color;
  }

  iconWrapper.appendChild(icon);

  return iconWrapper;
};

const destroyGallery = (galleryModal) => {
  galleryModal.parentNode.removeChild(galleryModal);
};

const galleryPreviewImage = (imgSelector, imgNodeSRC) => {
  const image = new Image();

  image.setAttribute(imgSelector, imgNodeSRC);

  return image;
};

const adaptGalleryThumbnails = (thumbnails = [], onClick) => thumbnails.map((thumbnail, index) => {
  const thmbnailContainer = document.createElement('div');
  const image = thumbnail.cloneNode();

  image.classList.remove('ci-image');
  image.style = {};
  image.style.width = '100%';
  image.style.height = '100%';

  thmbnailContainer.classList.add('ci-gallery-thmbnail-container');
  thmbnailContainer.setAttribute('data-ci-gallery-index', index);
  thmbnailContainer.append(image);

  if (onClick) {
    thmbnailContainer.onclick = onClick;
  }

  return thmbnailContainer;
});

const appendGalleryThumbnails = (thumbnails = [], thumbnailsContainer) => {
  thumbnails.forEach((thumbnail) => {
    thumbnailsContainer.append(thumbnail);
  });
};

const createThmbnailsModule = (images, galleryModal, onClick) => {
  const thumbnailsModule = galleryModal.querySelector('.ci-gallery-thumbnail-module');
  const adaptedGalleryThumbnails = adaptGalleryThumbnails(images, onClick);

  appendGalleryThumbnails(adaptedGalleryThumbnails, thumbnailsModule);

  return thumbnailsModule;
};

const createGalleryArrows = (leftArrowIcon, rightArrowIcon, onClick) => {
  const iconStyles = { color: 'rgba(255,255,255,0.5)' };

  const leftArrow = createIcon(leftArrowIcon, 'ci-gallery-left-arrow-button', iconStyles);
  const rightArrow = createIcon(rightArrowIcon, 'ci-gallery-right-arrow-button', iconStyles);

  if (onClick) {
    leftArrow.onclick = onClick.bind(this, 'left');
    rightArrow.onclick = onClick.bind(this, 'right');
  }

  return [leftArrow, rightArrow];
};

const getGalleryLengthAndIndex = () => {
  const galleryModal = document.body.querySelector('[data-ci-gallery]');
  const galleryLength = galleryModal.getAttribute('data-ci-gallery-length');
  const galleryIndex = galleryModal.getAttribute('data-ci-gallery-index');

  return [galleryLength, galleryIndex];
};

const getGalleryPreviewModule = () => {
  const galleryModal = document.body.querySelector('[data-ci-gallery]');

  return galleryModal.querySelector('.ci-gallery-preview-module');
};

const setGalleryIndex = (index) => {
  const galleryModal = document.body.querySelector('[data-ci-gallery]');

  galleryModal.setAttribute('data-ci-gallery-index', index);
};

const createGalleryModal = (galleryLength, closeIconSrc, isGallery) => {
  const iconStyles = { color: 'rgba(255,255,255,0.5)' };

  const galleryModal = document.createElement('div');
  const previewModule = document.createElement('div');
  const closeIcon = createIcon(closeIconSrc, 'ci-gallery-close-button', iconStyles);

  galleryModal.classList.add('ci-gallery-modal');
  previewModule.classList.add('ci-gallery-preview-module');

  if (isGallery) {
    const thumbnailsModule = document.createElement('div');
    thumbnailsModule.classList.add('ci-gallery-thumbnail-module');
    galleryModal.setAttribute('data-ci-gallery-length', galleryLength);
    galleryModal.setAttribute('data-ci-gallery-index', 0);
    galleryModal.append(thumbnailsModule);
  }

  galleryModal.setAttribute('data-ci-gallery', true);
  galleryModal.append(previewModule);
  galleryModal.append(closeIcon);

  closeIcon.onclick = destroyGallery.bind(this, galleryModal);

  return galleryModal;
};

const markCurrentImage = (galleryThmbnails, currentIndex) => {
  galleryThmbnails.forEach((imgWrapper, index) => {
    imgWrapper.querySelector('img').style.border = '1px solid grey';

    if (index === currentIndex) {
      imgWrapper.querySelector('img').style.border = '1px solid white';
    }
  });
};

const getCurrentImage = (mainImageWrapper, galleryModal) => {
  const galleryThmbnailsModule = galleryModal.querySelector('.ci-gallery-thumbnail-module');
  const galleryThmbnails = [...galleryThmbnailsModule.children];

  let currentIndex = null;

  galleryThmbnails.forEach((imgWrapper, index) => {
    const mainImg = mainImageWrapper.querySelector('[ci-src]').getAttribute('ci-src');
    const galleryImg = imgWrapper.querySelector('[ci-src]').getAttribute('ci-src');

    if (mainImg === galleryImg) {
      currentIndex = index;
      markCurrentImage(galleryThmbnails, index);
    }
  });

  return currentIndex;
};

const displayZoomIcon = (wrapper, imgProps, zoomIconSrc) => {
  const { zoom, gallery } = imgProps;
  const iconStyles = { width: 35, height: 35 };

  if (zoom && !gallery) {
    const zoomIcon = createIcon(zoomIconSrc, 'ci-gallery-zoom-button', iconStyles);
    wrapper.append(zoomIcon);
  }
};

const destroyZoomIcon = (wrapper) => {
  const zoomIcon = wrapper.querySelector('.ci-gallery-zoom-button');

  if (zoomIcon) {
    zoomIcon.remove();
  }
};

const getImageFitStyles = (naturalWidth, naturalHeight) => {
  let shouldFitHorizontally;
  const imageStyles = {};
  const previewModule = document.body.querySelector('.ci-gallery-preview-module');

  if (naturalWidth && previewModule) {
    const imageAspectRatio = naturalWidth / naturalHeight;
    const renderWidth = previewModule.offsetHeight * imageAspectRatio;
    shouldFitHorizontally = (imageAspectRatio < 1)
      || (renderWidth <= previewModule.offsetWidth);
  }

  if (shouldFitHorizontally) {
    imageStyles.width = 'auto';
    imageStyles.height = '100%';
  } else {
    imageStyles.width = '100%';
    imageStyles.height = 'auto';
  }

  return imageStyles;
};

export {
  getParams,
  filterImages,
  getImageProps,
  getBackgroundImageProps,
  addClass,
  getWrapper,
  isLazy,
  setSrc,
  setSrcset,
  setBackgroundSrc,
  getFreshCIElements,
  destroyNodeImgSize,
  setAlt,
  removeClassNames,
  setOptions,
  createIcon,
  galleryPreviewImage,
  createThmbnailsModule,
  createGalleryModal,
  markCurrentImage,
  getCurrentImage,
  displayZoomIcon,
  destroyZoomIcon,
  getGalleryImages,
  createGalleryArrows,
  getGalleryLengthAndIndex,
  setGalleryIndex,
  getGalleryPreviewModule,
  getImageFitStyles,
  getZoomImage,
};
