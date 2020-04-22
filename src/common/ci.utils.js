import { getSizeLimit, getParamsFromURL, getRatio, getWidth, getHeight, isCrop, CONSTANTS } from 'cloudimage-responsive-utils';


export const filterImages = (images, type) => {
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
  imgNodeRatio: attr(image, 'ci-ratio') || attr(image, 'data-ci-ratio') || undefined,
  blurHash: attr(image, 'ci-blur-hash') || attr(image, 'data-ci-blur-hash') || undefined,
  isLazyCanceled: (attr(image, 'ci-not-lazy') !== null || attr(image, 'data-ci-not-lazy') !== null) || undefined,
  preserveSize: (attr(image, 'ci-preserve-size') !== null || attr(image, 'data-preserve-size') !== null) || undefined,
  imgNodeWidth: attr(image, 'width'),
  imgNodeHeight: attr(image, 'height')
});

export const getParams = (params) => {
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

export const getImageProps = (image) => {
  const props = {
    ...getCommonImageProps(image),
    alignment: attr(image, 'ci-align') || attr(image, 'data-ci-align') || 'auto',
    imgNodeSRC: attr(image, 'ci-src') || attr(image, 'data-ci-src') || undefined
  };
  const params = {
    ...getParamsFromURL(props.imgNodeSRC || ''),
    ...props.params
  };

  return {
    ...props,
    params,
    isAdaptive: !!props.sizes,
    imgNodeSRC: getURLWithoutQueryParams(props.imgNodeSRC)
  };
};

export const getBackgroundImageProps = (image) => {
  const props = {
    ...getCommonImageProps(image),
    imgNodeSRC: attr(image, 'ci-bg-url') || attr(image, 'data-ci-bg-url') || undefined
  };
  const params = {
    ...getParamsFromURL(props.imgNodeSRC || ''),
    ...props.params
  };

  return {
    ...props,
    params,
    isAdaptive: !!props.sizes,
    imgNodeSRC: getURLWithoutQueryParams(props.imgNodeSRC)
  };
};

const getURLWithoutQueryParams = url => url.split('?')[0];

const attr = (element, attribute) => element.getAttribute(attribute);

export const addClass = (elem, className) => {
  if (!(elem.className.indexOf(className) > -1)) {
    elem.className += ' ' + className;
  }
};

export const getWrapper = (image) => {
  if ((image.parentNode.className || '').indexOf('ci-image-wrapper') > -1) {
    return image.parentNode;
  } else if ((image.parentNode.parentNode.className || '').indexOf('ci-image-wrapper') > -1) {
    return image.parentNode.parentNode;
  }
};

export const setWrapperAlignment = (wrapper, alignment) => {
  switch (alignment) {
    case 'auto':
      break;
    case 'center':
      wrapper.style.margin = 'auto';
  }
}

export const determineContainerProps = props => {
  const { imgNode, config = {}, imgNodeWidth, imgNodeHeight, imgNodeRatio, params, size } = props;
  const { ignoreNodeImgSize } = config;
  let ratio = null;
  const crop = isCrop(params.func || config.params.func);
  const { exactSize, limitFactor } = config;
  let [width, isLimit] = getWidth({
    imgNode, config, exactSize, imgNodeWidth, params: { ...config.params, ...params }, size
  });
  let height = getHeight({
    imgNode,
    config,
    exactSize,
    imgNodeHeight,
    imgNodeWidth,
    imgNodeRatio,
    params: { ...config.params, ...params },
    size,
    width
  });
  ratio = getRatio({ imgNodeRatio, width, height, size, config, imgNodeWidth, imgNodeHeight });

  const sizes = CONSTANTS.DEVICE_PIXEL_RATIO_LIST.map(dpr => {
    let widthWithDPR, heightWithDRP;

    widthWithDPR = width && (width * dpr);

    widthWithDPR = crop ?
      widthWithDPR
      :
      isLimit ?
        getSizeLimit(widthWithDPR, exactSize, limitFactor)
        :
        widthWithDPR;

    heightWithDRP = height && (height * dpr);

    if (!heightWithDRP && widthWithDPR && ratio) {
      heightWithDRP = Math.floor(widthWithDPR / ratio);
    }

    if (!widthWithDPR && heightWithDRP && ratio) {
      widthWithDPR = Math.floor(heightWithDRP * ratio);
    }

    return { width: widthWithDPR, height: heightWithDRP, ratio };
  });


  return { sizes, ratio, width, height };
}

export const isLazy = (lazyLoading, isLazyCanceled, isUpdate) => {
  if ((isLazyCanceled && lazyLoading) || isUpdate) {
    lazyLoading = false;
  }

  return lazyLoading;
};

export const isApplyLowQualityPreview = (isAdaptive, width, isSVG, minLowQualityWidth) =>
  isAdaptive ? width > minLowQualityWidth : width > minLowQualityWidth && !isSVG;

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

export const destroyNodeImgSize = imgNode => {
  imgNode.removeAttribute("height");
  imgNode.removeAttribute("width");
};