const checkIfRelativeUrlPath = src => {
  if (src.indexOf('//') === 0) {
    src = window.location.protocol + src;
  }
  return (src.indexOf('http://') !== 0 && src.indexOf('https://') !== 0 && src.indexOf('//') !== 0);
};

const getImgSrc = (src, isRelativeUrlPath = false, baseUrl = '') => {
  if (isRelativeUrlPath)
    return baseUrl + src;

  return src;
};

/*
* possible size values: 200 | 200x400
* */
export const updateSizeWithPixelRatio = (size) => {
  const splittedSizes = size.toString().split('x');
  const result = [];

  [].forEach.call(splittedSizes, size => {
    size ? result.push(size * Math.round(window.devicePixelRatio || 1)) : '';
  });

  return result.join('x');
};

const generateUrl = (imgSrc, params = {}, config, parentContainerWidth) => {
  const { token, domain } = config;
  const configParams = getParams(config.params);
  const cloudUrl = `https://${token}.${domain}/v7/`;

  return [
    cloudUrl,
    imgSrc,
    imgSrc.includes('?') ? '&' : '?',
    getQueryString({ ...configParams, ...params }, configParams, parentContainerWidth)
  ].join('');
};


const getQueryString = (params = {}, configParams, parentContainerWidth) => {
  const { w, h, width, height, ...restParams } = params;
  const isCustom = w || width || h || height;
  const customWidth = w || width ? updateSizeWithPixelRatio(w || width) : null;
  const widthQ = isCustom ? customWidth : parentContainerWidth;
  const heightQ = h || height ? updateSizeWithPixelRatio(h || height) : null;
  const restParamsQ = Object.keys(restParams).map(function(k) {
    return encodeURIComponent(k) + "=" + encodeURIComponent(restParams[k]);
  }).join('&')

  return [
    widthQ ? `w=${widthQ}` : '',
    heightQ ? ((widthQ ? '&' : '') + `h=${heightQ}`) : '',
    restParamsQ ? '&' + restParamsQ : ''
  ].join('');
};

const getParentWidth = (img, config) => {
  if (!(img && img.parentElement && img.parentElement.getBoundingClientRect) && !(img && img.width))
    return config.width;

  const parentContainerWidth = getParentContainerWithWidth(img);
  const currentWidth = parseInt(parentContainerWidth, 10);
  const computedWidth = getComputedWidthOfImage(img);

  if ((computedWidth && (computedWidth < currentWidth && computedWidth > 15) || !currentWidth)) {
    return getSizeLimit(computedWidth, config.exactSize);
  } else {
    if (!currentWidth) return img.width || config.width;

    return getSizeLimit(currentWidth, config.exactSize);
  }
};

const getComputedWidthOfImage = (img) => {
  const computedWidth = window.getComputedStyle(img).width;

  if (computedWidth.indexOf('px') > -1 || (parseInt(computedWidth).toString() === computedWidth))
    return parseInt(computedWidth);

  return null;
};

const getContainerWidth = (elem, config) => {
  if (!(elem && elem.getBoundingClientRect))
    return config.width;

  const elementWidth = getContainerWithWidth(elem);
  const currentWidth = parseInt(elementWidth, 10);
  const computedWidth = parseInt(window.getComputedStyle(elem).width);

  if ((computedWidth && (computedWidth < currentWidth && computedWidth > 15) || !currentWidth)) {
    return getSizeLimit(computedWidth, config.exactSize);
  } else {
    if (!currentWidth) return elem.width || config.width;

    return getSizeLimit(currentWidth, config.exactSize);
  }
};

const getParentContainerWithWidth = img => {
  let parentNode = null;
  let width = 0;

  do {
    parentNode = (parentNode && parentNode.parentNode) || img.parentNode;
    width = parentNode.getBoundingClientRect().width;
  } while (parentNode && !width)

  const leftPadding = width && parentNode && parseInt(window.getComputedStyle(parentNode).paddingLeft);
  const rightPadding = parseInt(window.getComputedStyle(parentNode).paddingRight)

  return width + (width ? (- leftPadding - rightPadding) : 0);
};

const getContainerWithWidth = elem => {
  const computedStyles = window.getComputedStyle(elem);
  const width = elem.getBoundingClientRect().width;
  const leftPadding = parseInt(computedStyles.paddingLeft);
  const rightPadding = parseInt(computedStyles.paddingRight);

  return width + (width ? (- leftPadding - rightPadding) : 0);
};

const generateSources = (imgSrc, params, adaptiveSizes, config, parentContainerWidth, isPreview) => {
  const sources = [];

  adaptiveSizes.forEach(({ params: breakpointParams, media: mediaQuery}) => {
    let lowQualitySize = null;
    let containerWidth = parentContainerWidth;

    if (isPreview) {
      lowQualitySize = getLowQualitySize({ ...params, ...breakpointParams }, config.previewQualityFactor);
      containerWidth = parentContainerWidth / config.previewQualityFactor;
    }

    sources.push({
      mediaQuery,
      srcSet: generateUrl(
        imgSrc, { ...params, ...breakpointParams, ...lowQualitySize }, config, updateSizeWithPixelRatio(containerWidth)
      )
    });
  });

  return sources;
};

const getLowQualitySize = (params = {}, factor) => {
  let { width, height } = params;

  width = width ? Math.floor(width / factor) : null;
  height = height ? Math.floor(height / factor) : null;

  return { width, w: width, height, h: height };
};

const getAdaptiveSize = (sizes, config) => {
  const resultSizes = [];

  Object.keys(sizes).forEach(key => {
    const isCustomMedia = key.indexOf(':') > -1;
    const media = isCustomMedia ? key : config.presets[key];

    resultSizes.push({ media, params: sizes[key] });
  });

  return resultSizes;
};

const getRatioBySizeSimple = (params = {}) => {
  let { width, w, height, h } = params;

  if ((width || w) && (height || h))
    return (width || w) / (height || h);

  return null;
}

const getRatioBySizeAdaptive = (params = {}, adaptiveSize) => {
  const breakpoint = getBreakPoint(adaptiveSize) || adaptiveSize[0];
  const ratioSizeByBreakpoint = getRatioBySizeSimple(breakpoint.params);

  if (!ratioSizeByBreakpoint) {
    return getRatioBySizeSimple(params);
  } else {
    return ratioSizeByBreakpoint;
  }
}

const getBreakPoint = (size) => [...size].reverse().find(item => window.matchMedia(item.media).matches);

const getSizeLimit = (currentSize, exactSize) => {
  if (currentSize <= 25) return '25';
  if (currentSize <= 50) return '50';
  if (exactSize) return currentSize.toString();

  return (Math.ceil(currentSize / 100) * 100).toString();
};

const filterImages = (images, type) => {
  const filtered = [];

  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    const url = image.getAttribute(type) || '';
    const isProcessed = image.getAttribute('data-is-ci-processed') === 'true';

    // todo don't rely on file extension
    if (url.slice(-4).toLowerCase() !== '.svg' && !isProcessed) {
      filtered.push(image);
    }
  }

  return filtered;
};

const getCommonImageProps = (image) => ({
  sizes: getSize(attr(image, 'ci-sizes') || attr(image, 'data-ci-size') || {}) || undefined,
  params: getParams(attr(image, 'ci-params') || attr(image, 'data-ci-params') || {}),
  ratio: attr(image, 'ci-ratio') || attr(image, 'data-ci-ratio') || undefined,
});

const getParams = (params) => {
  let resultParams = undefined;

  try {
    let temp = params.replace(/(\w+:)|(\w+ :)/g, function(matchedStr) {
      return '"' + matchedStr.substring(0, matchedStr.length - 1) + '":';
    });

    resultParams = JSON.parse(temp);
  }
  catch (e) {}

  if (!resultParams) {
    try {
      resultParams = JSON.parse('{"' + decodeURI(params.replace(/&/g, "\",\"").replace(/=/g,"\":\"")) + '"}');
    }
    catch (e) {}
  }

  return resultParams;
}

const getSize = (sizes) => {
  let resultSizes = null;

  try {
    // add quotes around params
    let temp = sizes.replace(/(\w+:)|(\w+ :)/g, function(matchedStr) {
      return '"' + matchedStr.substring(0, matchedStr.length - 1) + '":';
    });
    // change single quotes to double quotes
    temp = temp.replace(/'/g, '"').replace(/-"width":/g, '-width:');
    resultSizes = JSON.parse(temp);
  }
  catch (e) {}

  if (resultSizes) {
    Object.keys(resultSizes).forEach(key => {
      if (typeof resultSizes[key] === 'string') {
        try {
          resultSizes[key] = JSON.parse('{"' + decodeURI(resultSizes[key].replace(/&/g, "\",\"").replace(/=/g,"\":\"")) + '"}');
        }
        catch (e) {}
      }
    });
  }

  return resultSizes;
}

const getImageProps = (image) => ({
  ...getCommonImageProps(image),
  src: attr(image, 'ci-src') || attr(image, 'data-ci-src') || undefined,
});

const getBackgroundImageProps = (image) => ({
  ...getCommonImageProps(image),
  src: attr(image, 'ci-bg-url') || attr(image, 'data-ci-bg-url') || undefined,
});

const attr = (element, attribute) => element.getAttribute(attribute);

export const isResponsiveAndLoaded = image => (
  !(attr(image, 'ci-sizes') || attr(image, 'data-ci-sizes')) && image.className.includes('ci-image-loaded')
);

const insertSource = (element, source) => {
  element.parentNode.insertBefore(source, element);
};

const addClass = (elem, className) => {
  if (!elem.classList.contains(className)) {
    elem.classList.add(className);
  }
};

const removeClass = (elem, className) => {
  if (elem.classList.contains(className)) {
    elem.classList.remove(className);
  }
};

const getInitialConfig = (config) => {
  const {
    token = '',
    domain = 'cloudimg.io',
    lazyLoading = false,
    imgLoadingAnimation = true,
    lazyLoadOffset = 100,
    width = '400',
    height = '300',
    placeholderBackground = '#f4f4f4',
    baseUrl, // to support old name
    baseURL = '/',
    ratio = 1.5,
    presets,
    params = 'org_if_sml=1',
    init = true,
    exactSize = false
  } = config;

  return {
    token,
    domain,
    lazyLoading,
    imgLoadingAnimation,
    lazyLoadOffset,
    width,
    height,
    placeholderBackground,
    baseUrl: baseUrl || baseURL,
    ratio,
    exactSize,
    presets: presets ? presets :
      {
        xs: '(max-width: 575px)',  // to 575       PHONE
        sm: '(min-width: 576px)',  // 576 - 767    PHABLET
        md: '(min-width: 768px)',  // 768 - 991    TABLET
        lg: '(min-width: 992px)',  // 992 - 1199   SMALL_LAPTOP_SCREEN
        xl: '(min-width: 1200px)'  // from 1200    USUALSCREEN
      },
    params,
    innerWidth: window.innerWidth,
    init,
    previewQualityFactor: 10
    //isChrome: /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)
  };
};

const createCSSSource = (mediaQuery, srcSet, bgImageIndex) => {
  if (mediaQuery) {
    return `@media all and ${mediaQuery} { [ci-bg-index="${bgImageIndex}"] { background-image: url('${srcSet}') !important; } }`
  } else {
    return `[ci-bg-index="${bgImageIndex}"] { background-image: url('${srcSet}') !important; }`;
  }
};

const wrapWithPicture = (image, wrapper) => {
  if ((image.parentNode.nodeName || '').toLowerCase() !== 'picture') {
    wrapper = wrapper || document.createElement('picture');

    if (image.nextSibling) {
      image.parentNode.insertBefore(wrapper, image.nextSibling);
    } else {
      image.parentNode.appendChild(wrapper);
    }

    wrapper.appendChild(image);
  }
};

const setAnimation = (image, parentContainerWidth, isBackground) => {
  if (!isBackground) {
    image.style.transform = 'scale3d(1.1, 1.1, 1)';
    image.style.filter = `blur(${Math.floor(parentContainerWidth / 100)}px)`;

    setTimeout(() => {
      image.style.transition = 'all 0.3s ease-in-out';
    })
  } else {
    image.style.overflow = 'hidden';
    addClass(image, 'ci-bg-animation');
  }
};

const finishAnimation = (image, isBackground) => {
  if (!isBackground) {
    image.style.filter = 'blur(0px)';
    image.style.transform = 'translateZ(0) scale3d(1, 1, 1)';
  } else {
    removeClass(image, 'ci-bg-animation');

    setTimeout(() => {
      image.style.removeProperty('overflow');
    }, 300)
  }

  addClass(image, 'ci-image-loaded');
};

const getWrapper = (image) => {
  if ((image.parentNode.className || '').indexOf('ci-image-wrapper') > -1) {
    return image.parentNode;
  }
  else if ((image.parentNode.parentNode.className || '').indexOf('ci-image-wrapper') > -1) {
    return image.parentNode.parentNode;
  }
};

export {
  checkIfRelativeUrlPath,
  getImgSrc,
  generateUrl,
  getParentWidth,
  getContainerWidth,
  generateSources,
  getRatioBySizeSimple,
  getRatioBySizeAdaptive,
  getBreakPoint,
  filterImages,
  getImageProps,
  getBackgroundImageProps,
  insertSource,
  addClass,
  removeClass,
  getAdaptiveSize,
  getLowQualitySize,
  getInitialConfig,
  createCSSSource,
  wrapWithPicture,
  setAnimation,
  finishAnimation,
  getWrapper
}