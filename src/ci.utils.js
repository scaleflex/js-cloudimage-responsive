const checkOnMedia = size => {
  try {
    const array = size.split(',');

    return array.length > 1;
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

const getSizeAccordingToPixelRatio = size => {
  const splittedSizes = size.toString().split('x');
  const result = [];

  [].forEach.call(splittedSizes, size => {
    result.push(size * Math.round(window.devicePixelRatio || 1));
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
      if (isPreview) {
        nextSize = nextSize.split('x').map(size => size / 5).join('x');
        filters = 'q10.foil1';
      }

      sources.push({ mediaQuery, srcSet: generateSrcset(operation, nextSize, filters, imgSrc, config) });
    })
  } else {
    if (isPreview) {
      size = size.split('x').map(size => size / 5).join('x');
      filters = 'q10.foil1';
    }

    sources.push({
      srcSet: generateSrcset(operation, size, filters, imgSrc, config)
    });
  }
  return sources;
}

const generateSrcset = (operation, size, filters, imgSrc, config) => {
  const imgWidth = size.toString().split('x')[0]
  const imgHeight = size.toString().split('x')[1];

  return generateImgSrc(operation, filters, imgSrc, imgWidth, imgHeight, 1, config);
}

const getAdaptiveSize = (size, config) => {
  const arrayOfSizes = size.split(',');
  const sizes = [];

  arrayOfSizes.forEach(string => {
    const groups = string.match(/(([a-z_][a-z_]*)|(\([\S\s]*\)))\s*([0-9xp]*)/);
    const media = groups[3] ? groups[3] : config.presets[groups[2]];

    sizes.push({ media, size: groups[4] });
  });

  return sizes;
}

const getRatioBySize = (size, config) => {
  let width, height;

  if (typeof size === 'object') {
    const breakPointSource = getBreakPoint(size);
    let breakPointSize = breakPointSource ? breakPointSource.size : size[0].size;

    width = breakPointSize.toString().split('x')[0]
    height = breakPointSize.toString().split('x')[1];
  } else {
    width = size.toString().split('x')[0]
    height = size.toString().split('x')[1];
  }

  if (width && height)
    return width / height;

  return null;
}

const getBreakPoint = (size) => [...size].reverse().find(item => window.matchMedia(item.media).matches);

const generateImgSrc = (operation, filters, imgSrc, imgWidth, imgHeight, factor, config) => {
  let imgSize = Math.trunc(imgWidth * factor);

  if (imgHeight)
    imgSize += 'x' + Math.trunc(imgHeight * factor);

  return generateUrl(operation, getSizeAccordingToPixelRatio(imgSize), filters, imgSrc, config)
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
  getAdaptiveSize
}