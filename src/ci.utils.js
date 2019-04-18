const MEDIA_QUERY_REGEX = /^\s*(?:([a-z_][a-z_]*)|(\([\S\s]*\)))\s*(?:(?:(?:["'])([0-9xp,-]*)(?:["']))|([0-9xp]*))/;
const MEDIA_QUERY_REGEX_G = /\s*(?:([a-z_][a-z_]*)|(\([\S\s]*\)))\s*(?:(?:(?:["'])([0-9xp,-]*)(?:["']))|([0-9xp]*))/g;

const checkOnMedia = size => {
  try {
    return MEDIA_QUERY_REGEX.test(size);
  }
  catch (e) {
    return false;
  }
};

const checkIfRelativeUrlPath = src => {
  if (src.indexOf('//') === 0) {
    src = window.location.protocol + src;
  }
  return (src.indexOf('http://') !== 0 && src.indexOf('https://') !== 0 && src.indexOf('//') !== 0);
}

const getImgSrc = (src, isRelativeUrlPath = false, baseUrl = '') => {
  if (isRelativeUrlPath)
    return baseUrl + src;

  return src;
}

const getSizeAccordingToPixelRatio = (size, operation) => {
  if (operation === 'crop_px') {
    let [ cropSize, finalSize ] = size.split('-');

    finalSize = updateSizeWithPixelRatio(finalSize);

    return cropSize + '-' +  finalSize;
  } else {
    return updateSizeWithPixelRatio(size);
  }
}

/*
* possible size values: 200 | 200x400
* */
const updateSizeWithPixelRatio = (size) => {
  const splittedSizes = size.toString().split('x');
  const result = [];

  [].forEach.call(splittedSizes, size => {
    size ? result.push(size * Math.round(window.devicePixelRatio || 1)) : '';
  });

  return result.join('x');
}

const generateUrl = (operation, size, filters, imgSrc, config) => {
  const { ultraFast, token, container, queryString } = config;
  const isUltraFast = ultraFast ? 'https://scaleflex.ultrafast.io/' : 'https://';
  const cloudUrl = isUltraFast + token + '.' + container + '/';

  return cloudUrl + operation + '/' + size + '/' + filters + '/' + imgSrc + queryString;
}

const getParentWidth = (img, config) => {
  if (!(img && img.parentElement && img.parentElement.getBoundingClientRect) && !(img && img.width))
    return config.width;

  const parentContainer = getParentContainerWithWidth(img);
  const currentWidth = parseInt(parentContainer, 10);
  const computedWidth = parseInt(window.getComputedStyle(img).width);

  if ((computedWidth && (computedWidth < currentWidth && computedWidth > 15) || !currentWidth)) {
    return getSizeLimit(computedWidth);
  } else {
    if (!currentWidth) return img.width || config.width;

    return getSizeLimit(currentWidth);
  }
}

const getParentContainerWithWidth = img => {
  let parentNode = null;
  let width = 0;

  do {
    parentNode = (parentNode && parentNode.parentNode) || img.parentNode;
    width = parentNode.getBoundingClientRect().width;
  } while (parentNode && !width)

  const letPadding = width && parentNode && parseInt(window.getComputedStyle(parentNode).paddingLeft);
  const rightPadding = parseInt(window.getComputedStyle(parentNode).paddingRight)

  return width + (width ? (- letPadding - rightPadding) : 0);
}

const generateSources = (operation, size, filters, imgSrc, isAdaptive, config, isPreview) => {
  const sources = [];

  if (isAdaptive) {
    size.forEach(({ size: nextSize, media: mediaQuery}) => {
      const isPositionableCrop = operation === 'crop' && nextSize.split(',').length > 1;
      const nextOperation = isPositionableCrop ? 'crop_px' : operation;

      if (isPreview) {
        nextSize = getLowQualitySize(nextSize, nextOperation, 5);
        filters = 'q10.foil1';
      }

      sources.push({ mediaQuery, srcSet: generateSrcset(nextOperation, nextSize, filters, imgSrc, config) });
    })
  } else {
    if (isPreview) {
      size = getLowQualitySize(size, operation, 5);
      filters = 'q10.foil1';
    }

    sources.push({
      srcSet: generateSrcset(operation, size, filters, imgSrc, config)
    });
  }
  return sources;
}

const getLowQualitySize = (size, operation, factor) => {
  if (operation === 'crop_px') {
    let [ cropSize, finalSize ] = size.split('-');

    finalSize = finalSize.split('x').map(size => size ? size / factor : '').join('x');

    return cropSize + '-' +  finalSize;
  } else {
   return size.split('x').map(size => size / factor).join('x');
  }
}

const generateSrcset = (operation, size, filters, imgSrc, config) => {
  let cropParams = '';
  let imgWidth = '';
  let imgHeight = '';

  if (operation === 'crop_px') {
    let [ cropSize, finalSize ] = size.split('-');

    cropParams = cropSize + '-';

    imgWidth = finalSize.toString().split('x')[0];
    imgHeight = finalSize.toString().split('x')[1];
  } else {
    imgWidth = size.toString().split('x')[0];
    imgHeight = size.toString().split('x')[1];
  }

  return generateImgSrc(operation, filters, imgSrc, imgWidth, imgHeight, 1, config, cropParams);
}

const getAdaptiveSize = (size, config) => {
  const arrayOfSizes = size.match(MEDIA_QUERY_REGEX_G);
  const sizes = [];

  arrayOfSizes.forEach(string => {
    const groups = string.match(MEDIA_QUERY_REGEX);
    const media = groups[2] ? groups[2] : config.presets[groups[1]];

    sizes.push({ media, size: groups[4] || groups[3] });
  });

  return sizes;
}

const getRatioBySize = (size, operation) => {
  let width, height;

  if (typeof size === 'object') {
    const breakPointSource = getBreakPoint(size);
    let breakPointSize = breakPointSource ? breakPointSource.size : size[0].size;

    width = breakPointSize.toString().split('x')[0]
    height = breakPointSize.toString().split('x')[1];
  } else if (operation === 'crop_px') {
    const sizeParams = size.split('-')[0].split(',');

    width = sizeParams[2] - sizeParams[0];
    height = sizeParams[3] - sizeParams[1];
  } else {
    width = size.toString().split('x')[0]
    height = size.toString().split('x')[1];
  }

  if (width && height)
    return width / height;

  return null;
}

const getBreakPoint = (size) => [...size].reverse().find(item => window.matchMedia(item.media).matches);

const generateImgSrc = (operation, filters, imgSrc, imgWidth, imgHeight, factor, config, cropParams = '') => {
  let imgSize = imgWidth ? Math.trunc(imgWidth * factor) : '';

  if (imgHeight)
    imgSize += 'x' + Math.trunc(imgHeight * factor);

  if (cropParams)
    imgSize = cropParams + imgSize;

  return generateUrl(operation, getSizeAccordingToPixelRatio(imgSize, operation), filters, imgSrc, config)
    .replace('http://scaleflex.ultrafast.io/', '')
    .replace('https://scaleflex.ultrafast.io/', '')
    .replace('//scaleflex.ultrafast.io/', '')
    .replace('///', '/');
}

const getSizeLimit = (currentSize) => {
  if (currentSize <= 25) return '25';
  if (currentSize <= 50) return '50';

  return (Math.ceil(currentSize / 100) * 100).toString();
}

const filterImages = (images, type) => {
  const filtered = [];

  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    const size = image.getAttribute(type) || '';
    const isProcessed = image.getAttribute('data-is-ci-processed') === 'true';

    if (size.slice(-4).toLowerCase() !== '.svg' && !isProcessed) {
      filtered.push(image);
    }
  }

  return filtered;
}

const getImageProps = (image) => ({
  operation: attr(image, 'o') || attr(image, 'operation') || attr(image, 'data-operation') || undefined,
  size: attr(image, 's') || attr(image, 'size') || attr(image, 'data-size') || undefined,
  filters: attr(image, 'f') || attr(image, 'filters') || attr(image, 'data-filters') || undefined,
  ratio: attr(image, 'r') || attr(image, 'ratio') || attr(image, 'data-ratio') || undefined,
  src: attr(image, 'ci-src') || attr(image, 'data-src') || undefined,
});

const attr = (element, attribute) => element.getAttribute(attribute);

export const isResponsiveAndLoaded = image => (
  !(attr(image, 's') || attr(image, 'size') || attr(image, 'data-size')) && image.className.includes('ci-image-loaded')
);

const insertSource = (element, source) => {
  element.parentNode.insertBefore(source, element);
};

const addClass = (elem, className) => {
  if (!elem.classList.contains(className)) {
    elem.classList.add(className);
  }
}

const removeClass = (elem, className) => {
  if (elem.classList.contains(className)) {
    elem.classList.remove(className);
  }
}

export {
  checkOnMedia,
  checkIfRelativeUrlPath,
  getImgSrc,
  getSizeAccordingToPixelRatio,
  generateUrl,
  getParentWidth,
  generateSources,
  getRatioBySize,
  getBreakPoint,
  filterImages,
  getImageProps,
  insertSource,
  addClass,
  removeClass,
  getAdaptiveSize,
  getLowQualitySize
}