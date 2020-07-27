import { getParamsFromURL } from 'cloudimage-responsive-utils/dist/utils/get-params-from-url';


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

export const getImageProps = (image, imgSelector) => {
  const props = {
    ...getCommonImageProps(image),
    imgNodeSRC: attr(image, imgSelector) || undefined
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

export const getBackgroundImageProps = (image, bgSelector) => {
  const props = {
    ...getCommonImageProps(image),
    imgNodeSRC: attr(image, bgSelector)|| undefined,
    minWindowWidth: attr(image, 'ci-min-window-width') || attr(image, 'data-min-window-width') || undefined
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

const getURLWithoutQueryParams = (url = '') => url.split('?')[0];

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

export const isLazy = (lazyLoading, isLazyCanceled, isUpdate) => {
  if ((isLazyCanceled && lazyLoading) || isUpdate) {
    lazyLoading = false;
  }

  return lazyLoading;
};

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