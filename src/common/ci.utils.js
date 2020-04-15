const checkIfRelativeUrlPath = src => {
  if (!src) return false;

  if (src.indexOf('//') === 0) {
    src = window.location.protocol + src;
  }

  return (src.indexOf('http://') !== 0 && src.indexOf('https://') !== 0 && src.indexOf('//') !== 0);
};

const getImgSrc = (src, baseURL = '') => {
  const isRelativeURLPath = checkIfRelativeUrlPath(src);

  if (src.indexOf('//') === 0) {
    src = window.location.protocol + src;
  }

  if (isRelativeURLPath) {
    src = relativeToAbsolutePath(baseURL, src);
  }

  return [src, isImageSVG(src)];
};

const getBaseURL = (isRoot, base) => {
  if (isRoot) {
    return (base ? extractBaseURLFromString(base) : window.location.origin) + '/';
  } else {
    return base ? base : document.baseURI;
  }
}

const extractBaseURLFromString = (path = '') => {
  const pathArray = path.split('/');
  const protocol = pathArray[0];
  const host = pathArray[2];

  return protocol + '//' + host;
}

const relativeToAbsolutePath = (base, relative) => {
  const isRoot = relative[0] === '/';
  const resultBaseURL = getBaseURL(isRoot, base);
  const stack = resultBaseURL.split("/");
  const parts = relative.split("/");

  stack.pop(); // remove current file name (or empty string)
               // (omit if "base" is the current folder without trailing slash)
  if (isRoot) {
    parts.shift();
  }

  for (let i = 0; i < parts.length; i++) {
    if (parts[i] === ".")
      continue;
    if (parts[i] === "..")
      stack.pop();
    else
      stack.push(parts[i]);
  }

  return stack.join("/");
}

/*
* possible size values: 200 | 200x400
* */
export const updateSizeWithPixelRatio = (size, devicePixelRatio) => {
  const splittedSizes = size.toString().split('x');
  const result = [];

  [].forEach.call(splittedSizes, size => {
    size ? result.push(Math.floor(size * ((devicePixelRatio || window.devicePixelRatio).toFixed(1) || 1))) : '';
  });

  return result.join('x');
};

const generateUrl = props => {
  const { src, params, config, containerProps, devicePixelRatio = 1 } = props;
  const size = containerProps && containerProps.sizes[DEVICE_PIXEL_RATIO_LIST.indexOf(devicePixelRatio)];
  const { width, height } = size || {};
  const { token, domain, doNotReplaceURL } = config;

  return [
    doNotReplaceURL ? '' : `https://${token}.${domain}/v7/`,
    src,
    src.includes('?') ? '&' : '?',
    getQueryString({ params: { ...config.params, ...params }, width, height })
  ].join('');
};

export const getPreviewSRC = ({ config, containerProps, params, src, devicePixelRatio }) => {
  const { width, height } = containerProps;
  const { previewQualityFactor } = config;
  const previewParams = { ...params, ci_info: '' };
  const lowQualitySize = getLowQualitySize({ width, height }, previewQualityFactor);

  return generateUrl({ src, config, params: { ...previewParams, ...lowQualitySize }, devicePixelRatio });
};

const getQueryString = props => {
  const { params = {}, width, height } = props;
  const [restParams, widthFromParam = null, heightFromParam] = getParamsExceptSizeRelated(params);
  const widthQ = width ? width : widthFromParam;
  const heightQ = height ? height : heightFromParam;
  const restParamsQ = Object
    .keys(restParams)
    .map((key) => encodeURIComponent(key) + "=" + encodeURIComponent(restParams[key]))
    .join('&');

  return [
    widthQ ? `w=${widthQ}` : '',
    heightQ ? ((widthQ ? '&' : '') + `h=${heightQ}`) : '',
    restParamsQ ? '&' + restParamsQ : ''
  ].join('');
};

const getParamsExceptSizeRelated = params => {
  const { w, h, width, height, ...restParams } = params;

  return [restParams, w || width, h || height];
};

const getLowQualitySize = (params = {}, factor) => {
  let { width, height } = params;

  width = width ? Math.floor(width / factor) : null;
  height = height ? Math.floor(height / factor) : null;

  return { width, w: width, height, h: height };
};

const getAdaptiveSize = (sizes, presets) => {
  const resultSizes = [];

  Object.keys(sizes).forEach(key => {
    const isCustomMedia = key.indexOf(':') > -1;
    const media = isCustomMedia ? key : presets[key];

    resultSizes.push({ media, params: normalizeSize(sizes[key]) });
  });

  return resultSizes;
};

const normalizeSize = (params = {}) => {
  let { w = params.width || '', h = params.height || '', r = params.r } = params;

  if ((w.toString()).indexOf('vw') > -1) {
    const percent = parseFloat(w);

    w = window.innerWidth * percent / 100;
  } else {
    w = parseFloat(w);
  }

  if ((h.toString()).indexOf('vh') > -1) {
    const percent = parseFloat(h);

    h = window.innerHeight * percent / 100;
  } else {
    h = parseFloat(h);
  }

  return { w, h, r };
}

const getBreakPoint = (sizes, presets) => {
  const size = getAdaptiveSize(sizes, presets);

  return [...size].reverse().find(item => window.matchMedia(item.media).matches);
}

export const getSizeLimit = (size, exactSize, limitFactor) => {
  if (exactSize) return Math.ceil(size);
  if (size <= 25) return 25;
  if (size <= 50) return 50;

  return Math.ceil(size / limitFactor) * limitFactor;
};

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

const getCommonImageProps = (image) => ({
  sizes: getSize(attr(image, 'ci-sizes') || attr(image, 'data-ci-size') || {}) || undefined,
  params: getParams(attr(image, 'ci-params') || attr(image, 'data-ci-params') || {}),
  imageNodeRatio: attr(image, 'ci-ratio') || attr(image, 'data-ci-ratio') || undefined,
  blurHash: attr(image, 'ci-blur-hash') || attr(image, 'data-ci-blur-hash') || undefined,
  isLazyCanceled: (attr(image, 'ci-not-lazy') !== null || attr(image, 'data-ci-not-lazy') !== null) || undefined,
  preserveSize: (attr(image, 'ci-preserve-size') !== null || attr(image, 'data-preserve-size') !== null) || undefined,
  imageNodeWidth: attr(image, 'width'),
  imageNodeHeight: attr(image, 'height')
});

const getParams = (params) => {
  let resultParams = undefined;

  try {
    let temp = params.replace(/(\w+:)|(\w+ :)/g, function (matchedStr) {
      return '"' + matchedStr.substring(0, matchedStr.length - 1) + '":';
    });

    resultParams = JSON.parse(temp);
  } catch (e) {}

  if (!resultParams) {
    try {
      resultParams = JSON.parse('{"' + decodeURI(params.replace(/&/g, "\",\"").replace(/=/g, "\":\"")) + '"}');
    } catch (e) {}
  }

  return resultParams;
}

const getSize = (sizes) => {
  let resultSizes = null;

  try {
    // add quotes around params
    let temp = sizes.replace(/(\w+:)|(\w+ :)/g, function (matchedStr) {
      return '"' + matchedStr.substring(0, matchedStr.length - 1) + '":';
    });
    // change single quotes to double quotes
    temp = temp.replace(/'/g, '"').replace(/-"width":/g, '-width:');
    resultSizes = JSON.parse(temp);
  } catch (e) {}

  if (resultSizes) {
    Object.keys(resultSizes).forEach(key => {
      if (typeof resultSizes[key] === 'string') {
        try {
          resultSizes[key] = JSON.parse('{"' + decodeURI(resultSizes[key].replace(/&/g, "\",\"").replace(/=/g, "\":\"")) + '"}');
        } catch (e) {}
      }
    });
  }

  return resultSizes;
}

const getImageProps = (image) => {
  const props = {
    ...getCommonImageProps(image),
    alignment: attr(image, 'ci-align') || attr(image, 'data-ci-align') || 'auto',
    imageNodeSRC: attr(image, 'ci-src') || attr(image, 'data-ci-src') || undefined
  };
  const params = {
    ...getParamsFromURL(props.imageNodeSRC),
    ...props.params
  };

  return {
    ...props,
    params,
    isAdaptive: !!props.sizes,
    imageNodeSRC: getURLWithoutQueryParams(props.imageNodeSRC)
  };
};

const getBackgroundImageProps = (image) => {
  const props = {
    ...getCommonImageProps(image),
    imageNodeSRC: attr(image, 'ci-bg-url') || attr(image, 'data-ci-bg-url') || undefined
  };
  const params = {
    ...getParamsFromURL(props.imageNodeSRC),
    ...props.params
  };

  return {
    ...props,
    params,
    isAdaptive: !!props.sizes,
    imageNodeSRC: getURLWithoutQueryParams(props.imageNodeSRC)
  };
};

const getURLWithoutQueryParams = url => url.split('?')[0];

const getParamsFromURL = (url) => {
  const queryIndex = url.indexOf('?');

  if (queryIndex === -1) return;

  return getParams(url.slice(queryIndex + 1));
};

const attr = (element, attribute) => element.getAttribute(attribute);

export const isOldBrowsers = (isBlurHash) => {
  let support = true;

  if (isBlurHash) {
    try {
      new window.ImageData(new Uint8ClampedArray([0, 0, 0, 0]), 1, 1);
    } catch (e) {
      support = false
    }
  }

  return Element.prototype.hasOwnProperty('prepend') && support;
};

const addClass = (elem, className) => {
  if (!(elem.className.indexOf(className) > -1)) {
    elem.className += ' ' + className;
  }
};

const removeClass = (elem, className) => {
  if (elem.className.indexOf(className) > -1) {
    elem.className = elem.className.replace(new RegExp('\\b' + className + '\\b', 'g'), '');
  }
};

const DEVICE_PIXEL_RATIO_LIST = [1, 1.5, 2, 3, 4];

const getInitialConfigLowPreview = (config) => {
  const {
    token = '',
    domain = 'cloudimg.io',
    lazyLoading = false,
    imgLoadingAnimation = true,
    width = '400',
    height = '300',
    placeholderBackground = '#f4f4f4',
    baseUrl, // to support old name
    baseURL,
    ratio,
    presets,
    params = 'org_if_sml=1',
    init = true,
    exactSize = false,
    doNotReplaceURL = false,
    limitFactor = 100
  } = config;

  return {
    token,
    domain,
    lazyLoading,
    imgLoadingAnimation,
    width,
    height,
    placeholderBackground,
    baseURL: baseUrl || baseURL,
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
    params: getParams(params),
    innerWidth: window.innerWidth,
    init,
    previewQualityFactor: 10,
    doNotReplaceURL,
    devicePixelRatioList: DEVICE_PIXEL_RATIO_LIST,
    limitFactor
    //isChrome: /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)
  };
};

const getInitialConfigPlain = (config) => {
  const {
    token = '',
    domain = 'cloudimg.io',
    lazyLoading = false,
    width = '400',
    height = '300',
    baseUrl, // to support old name
    baseURL,
    presets,
    params = 'org_if_sml=1',
    init = true,
    exactSize = false,
    doNotReplaceURL = false,
    limitFactor = 100
  } = config;

  return {
    token,
    domain,
    lazyLoading,
    width,
    height,
    baseURL: baseUrl || baseURL,
    exactSize,
    presets: presets ? presets :
      {
        xs: '(max-width: 575px)',  // to 575       PHONE
        sm: '(min-width: 576px)',  // 576 - 767    PHABLET
        md: '(min-width: 768px)',  // 768 - 991    TABLET
        lg: '(min-width: 992px)',  // 992 - 1199   SMALL_LAPTOP_SCREEN
        xl: '(min-width: 1200px)'  // from 1200    USUALSCREEN
      },
    params: getParams(params),
    innerWidth: window.innerWidth,
    init,
    doNotReplaceURL,
    devicePixelRatioList: DEVICE_PIXEL_RATIO_LIST,
    limitFactor
    //isChrome: /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)
  };
};

const getInitialConfigBlurHash = (config) => {
  const {
    token = '',
    domain = 'cloudimg.io',
    lazyLoading = false,
    placeholderBackground = '#f4f4f4',
    baseUrl,
    baseURL,
    presets,
    ratio,
    params = 'org_if_sml=1',
    init = true,
    exactSize = false,
    doNotReplaceURL = false,
    limitFactor = 100
  } = config;

  return {
    token,
    domain,
    lazyLoading,
    placeholderBackground,
    baseURL: baseUrl || baseURL,
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
    params: getParams(params),
    innerWidth: window.innerWidth,
    init,
    previewQualityFactor: 10,
    doNotReplaceURL,
    devicePixelRatioList: DEVICE_PIXEL_RATIO_LIST,
    limitFactor
  };
};

const finishAnimation = (image, isBackground, canvas) => {
  if (canvas) {
    if (isBackground) {
      canvas.style.opacity = '0';
    } else {
      canvas.style.opacity = '0';
      image.style.opacity = '1';
    }
  } else if (!isBackground) {
    image.style.filter = 'blur(0px)';
    image.style.transform = 'translateZ(0) scale(1)';
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
  } else if ((image.parentNode.parentNode.className || '').indexOf('ci-image-wrapper') > -1) {
    return image.parentNode.parentNode;
  }
};

const setWrapperAlignment = (wrapper, alignment) => {
  switch (alignment) {
    case 'auto':
      break;
    case 'center':
      wrapper.style.margin = 'auto';
  }
}

const isImageSVG = url => url.slice(-4).toLowerCase() === '.svg';

export const determineContainerProps = props => {
  const {
    imgNode,
    config = {},
    imageNodeWidth,
    imageNodeHeight,
    imageNodeRatio,
    params,
    size
  } = props;
  let ratio = null, widthDPROne = null, heightDPROne = null;

  const sizes = DEVICE_PIXEL_RATIO_LIST.map(dpr => {
    const crop = isCrop(params.func || config.params.func);
    const { exactSize, limitFactor } = config;
    let [width, isLimit] = getWidth({
      imgNode, config, exactSize, imageNodeWidth, params: { ...config.params, ...params }, size
    });

    width = width && (width * dpr);
    width = crop ?
      width
      :
      isLimit ?
        getSizeLimit(width, exactSize, limitFactor)
        :
        width;

    let height = getHeight({
      imgNode,
      config,
      exactSize,
      imageNodeHeight,
      params: { ...config.params, ...params },
      size,
      width
    });

    height = height && (height * dpr);

    if (!height && width && ratio) {
      height = Math.floor(width / ratio);
    }

    if (!width && height && ratio) {
      width = Math.floor(height * ratio);
    }

    if (dpr === 1) {
      ratio = getRatio({ imageNodeRatio, width, height, size }); // ratio is the same for all sizes
      widthDPROne = width;
      heightDPROne = height;
    }

    return { width, height, ratio };
  });

  return { sizes, ratio, width: widthDPROne, height: heightDPROne };
}

export const getRatio = ({ imageNodeRatio, width, height, size }) => {
  if (size && size.params) {
    if (size.params.r || size.params.ratio) {
      return size.params.r || size.params.ratio;
    } else if ((size.params.w || size.params.width) && (size.params.h || size.params.height)) {
      return (size.params.w || size.params.width) / (size.params.h || size.params.height);
    } else {
      return null
    }
  }

  if (imageNodeRatio) {
    return imageNodeRatio;
  } else if (width && height) {
    return width / height;
  }

  return null;
}

/**
 * Get width for an image.
 *
 * Priority:
 * 1. image node param width
 * 2. image node image width
 * 3. image node inline styling
 * 4. parent node of image computed style width (up to body tag)
 *
 * @param {HTMLImageElement} props.imgNode - image node
 * @param {Boolean} props.exactSize - a flag to use exact width/height params
 * @param {Number} props.imageNodeWidth - width of image node
 * @param {String} props.params - params of image node
 * @return {Array} [with, isLimit]
 */
export const getWidth = props => {
  const { imgNode = null, imageNodeWidth = null, params = {}, size } = props;
  const sizeParamsWidth = size && size.params && (size.params.w || size.params.width);
  const paramsWidth = params.width || params.w;
  const imageNodeWidthPX = imageNodeWidth && convertToPX(imageNodeWidth);
  const imageContainerWidth = getImageContainerWidth(imgNode);

  if (size && size.params) {
    if (size.params.r) {
      if (params.width || params.w) {
        return [paramsWidth];
      }

      if (imageNodeWidth) {
        return [imageNodeWidthPX];
      }

      return [imageContainerWidth]
    }

    return [sizeParamsWidth];
  }

  if (paramsWidth) {
    return [paramsWidth];
  }

  if (imageNodeWidth) {
    return [imageNodeWidthPX];
  }

  return [imageContainerWidth, true];
}

/**
 * Get height for an image.
 *
 * Priority:
 * 1. image node param height
 * 2. image node image height
 * 3. image node inline styling
 * 4. parent node of image computed style height (up to body tag)
 *
 * @param {HTMLImageElement} props.imgNode - image node
 * @param {Object} props.config - plugin config
 * @param {Boolean} props.exactSize - a flag to use exact width/height params
 * @param {Number} props.imageNodeHeight - height of image node
 * @param {String} props.params - params of image node
 * @return {Number} height limit
 */
export const getHeight = props => {
  const { imgNode = null, config = {}, imageNodeHeight = null, params = {}, size, width } = props;
  const crop = isCrop(params.func || config.params.func);
  const sizeParamsHeight = size && size.params && (size.params.h || size.params.height);
  const paramsRatio = size && size.params && (size.params.ratio || size.params.r);
  const paramsHeight = params.height || params.h;
  const imageNodeHeightPX = imageNodeHeight && convertToPX(imageNodeHeight);
  const imageContainerHeight = getImageContainerHeight(imgNode);

  if (size && size.params) {
    if (paramsRatio && width) {
      return width / paramsRatio;
    }

    return sizeParamsHeight;
  }

  if (paramsHeight) {
    return paramsHeight;
  }

  if (imageNodeHeight) {
    return imageNodeHeightPX;
  }

  if (!crop) {
    return null;
  }

  return imageContainerHeight;
};

/**
 * Get container height for an image.
 *
 * Priority:
 * 1. inline styling
 * 2. parent node computed style width (up to body tag)
 *
 * @param {HTMLImageElement} img - image node
 * @return {Number} width of image container
 */
export const getImageContainerHeight = (img) => {
  const imageStyleHeight = img && img.style && img.style.height && !img.style.height.includes('%');
  const imageHeight = convertToPX(imageStyleHeight);

  if (imageHeight) return parseInt(imageHeight, 10);

  return parseInt(getParentContainerSize(img, 'height'), 10);
}

/**
 * Get container width for an image.
 *
 * Priority:
 * 1. inline styling
 * 2. parent node computed style width (up to body tag)
 *
 * @param {HTMLImageElement} img - image node
 * @return {Number} width of image container
 */
export const getImageContainerWidth = (img) => {
  const imageStyleWidth = img && img.style && img.style.width && !img.style.width.includes('%');
  const imageWidth = imageStyleWidth && convertToPX(imageStyleWidth);

  if (imageWidth) return parseInt(imageWidth, 10);

  return parseInt(getParentContainerSize(img), 10);
}

export const convertToPX = (size = '') => {
  size = size.toString();

  if (size.indexOf('px') > -1) {
    return parseInt(size);
  } else if (size.indexOf('%') > -1) {
    // todo calculate container width * %
  } else if (size.indexOf('vw') > -1) {
    return window.innerWidth * parseInt(size) / 100;
  } else if (size.indexOf('vh') > -1) {
    return window.innerHeight * parseInt(size) / 100;
  }

  return parseInt(size) || null;
}

const getParentContainerSize = (img, type = 'width') => {
  let parentNode = null;
  let size = 0;

  do {
    parentNode = (parentNode && parentNode.parentNode) || img.parentNode;
    size = parentNode.getBoundingClientRect()[type];
  } while (parentNode && !size)

  const leftPadding = size && parentNode && parseInt(window.getComputedStyle(parentNode).paddingLeft);
  const rightPadding = parseInt(window.getComputedStyle(parentNode).paddingRight)

  return size + (size ? (-leftPadding - rightPadding) : 0);
};

const isLazy = (lazyLoading, isLazyCanceled, isUpdate) => {
  if ((isLazyCanceled && lazyLoading) || isUpdate) {
    lazyLoading = false;
  }

  return lazyLoading;
};

export const isApplyLowQualityPreview = (isAdaptive, width, isSVG) => isAdaptive ? width > 400 : width > 400 && !isSVG;

export const setSrc = (image, url, propertyName, lazy, imgSrc, isSVG, dataSrcAttr) => {
  image.setAttribute(
    lazy ? (propertyName ? propertyName : 'data-src') : (dataSrcAttr ? dataSrcAttr : 'src'),
    isSVG ? imgSrc : url
  );
};

export const setSrcset = (image, urls, propertyName, lazy, imgSrc, isSVG, dataSrcAttr) => {
  if (isSVG) return;

  image.setAttribute(
    lazy ? (propertyName ? propertyName : 'data-srcset') : (dataSrcAttr ? dataSrcAttr : 'srcset'),
    urls.map(({ dpr, url }) => `${url} ${dpr}x`).join(', ')
  );
};

export const setBackgroundSrc = (image, url, lazy, imgSrc, isSVG, dataSrcAttr) => {
  const resultLink = isSVG ? imgSrc : url;

  if (lazy) {
    image.setAttribute((dataSrcAttr ? dataSrcAttr : 'data-bg'), resultLink);
  } else {
    image.style.backgroundImage = `url('${resultLink}')`
  }
};

export const isCrop = func => ['crop', 'fit', 'bound', 'cover'].includes(func);

export {
  checkIfRelativeUrlPath,
  getImgSrc,
  generateUrl,
  getBreakPoint,
  filterImages,
  getImageProps,
  getBackgroundImageProps,
  addClass,
  removeClass,
  getAdaptiveSize,
  getLowQualitySize,
  getInitialConfigLowPreview,
  getInitialConfigBlurHash,
  getInitialConfigPlain,
  finishAnimation,
  getWrapper,
  getParams,
  setWrapperAlignment,
  isImageSVG,
  isLazy
}