;(function (window, document) {
  // Production steps of ECMA-262, Edition 5, 15.4.4.18
  // Reference: http://es5.github.io/#x15.4.4.18
  if (!Array.prototype.forEach) {

    Array.prototype.forEach = function(callback/*, thisArg*/) {

      var T, k;

      if (this == null) {
        throw new TypeError('this is null or not defined');
      }

      var O = Object(this);

      var len = O.length >>> 0;

      if (typeof callback !== 'function') {
        throw new TypeError(callback + ' is not a function');
      }

      if (arguments.length > 1) {
        T = arguments[1];
      }

      k = 0;

      while (k < len) {
        var kValue;
        if (k in O) {
          kValue = O[k];
          callback.call(T, kValue, k, O);
        }
        k++;
      }
    };
  }

  // from:https://github.com/jserz/js_piece/blob/master/DOM/ChildNode/remove()/remove().md
  (function (arr) {
    arr.forEach(function (item) {
      if (item.hasOwnProperty('remove')) {
        return;
      }
      Object.defineProperty(item, 'remove', {
        configurable: true,
        enumerable: true,
        writable: true,
        value: function remove() {
          if (this.parentNode !== null)
            this.parentNode.removeChild(this);
        }
      });
    });
  })([Element.prototype, CharacterData.prototype, DocumentType.prototype]);

  window.jScaler = window.jScaler || {};

  jScaler.forceUpdate = false;

  jScaler.setForceUpdate = function(value) {
    jScaler.forceUpdate = value;

    if (value) jScaler.process(jScaler.config);
  }

  jScaler.setConfig = function (config) {
    config = config || {};

    jScaler.config = {
      IS_ULTRA_FAST: config.IS_ULTRA_FAST || false,
      TOKEN: config.TOKEN || '',
      CONTAINER: config.CONTAINER || '.cloudimg.io',
      DEFAULT_WIDTH: config.DEFAULT_WIDTH || '400',
      DEFAULT_HEIGHT: config.DEFAULT_HEIGHT || '300',
      DEFAULT_TYPE: config.DEFAULT_TYPE || 'width',
      DEFAULT_PARAMS: config.DEFAULT_PARAMS || 'none',
      BASE_URL: config.BASE_URL || '/',
      RESULT_PRESETS: config.PRESETS ? getPresets(config.PRESETS, 'presets') :
      {
        xs: 576,  // 0 - 576      PHONE
        sm: 768,  // 577 - 768    PHABLET
        md: 992,  // 769 - 992    TABLET
        lg: 1200, // 993 - 1200   SMALL_LAPTOP_SCREEN
        xl: 1920  // 1200 - 1920  USUALSCREEN
      },
      ORDER: config.PRESETS ? getPresets(config.PRESETS, 'order') : ['xl', 'lg', 'md', 'sm', 'xs'],
      AUTO: config.AUTO || [1920, 1200, 992, 768, 576],
      QUERY_STRING: config.QUERY_STRING || ''
    };
  };

  jScaler.init = function () {
    this.backgroundImgIndex = 0;
    this.head = document.head || document.getElementsByTagName('head')[0];

    if (!('trunc' in Math)) {   //IE Patch
      Math.trunc = Math.floor;
    }
  };

  jScaler.process = function (config) {
    this.setConfig(config);

    var imgs = filterImages(document.querySelectorAll('img[ci-src]'), 'ci-src'),
      backgroundImgs = filterImages(document.querySelectorAll('[ci-background]'), 'ci-background');

    if (imgs.length > 0) {
      imgs = Array.prototype.slice.call(imgs);
      [].forEach.call(imgs, function (img) {
        //img.addEventListener('error', onerrorImg, false);  //TODO: check if it works well

        if (!this.attr(img, 'src')) { //TODO: find better way
          this.processImage(img);
        } else {
          this.processImage(img, true)
        }
      }, this);
    }

    if (backgroundImgs.length > 0) {
      backgroundImgs = Array.prototype.slice.call(backgroundImgs);
      [].forEach.call(backgroundImgs, function (img) {
        if (this.attr(img, 'ci-img-index') >= 0) {  //TODO: find better way
          this.processBackgroundImage(img);
        }
      }, this);
    }
  };

  jScaler.getParentWidth = function (img) {
    if (!(img && img.parentElement && img.parentElement.getBoundingClientRect) && !(img && img.width))
      return jScaler.config.DEFAULT_WIDTH;

    var parentContainer = getParentContainerWithWidth(img);
    var currentWidth = parseInt(parentContainer, 10);
    var computedWidth = Number(window.getComputedStyle(img).width);

    if ((computedWidth && (computedWidth < currentWidth && computedWidth > 15) || !currentWidth)) {
      return getSizeLimit(computedWidth);
    } else {
      if (!currentWidth) return img.width || jScaler.config.DEFAULT_WIDTH;

      return getSizeLimit(currentWidth);
    }
  }

  jScaler.getElementSize = function (element, size) {
    if (!element || !element.getBoundingClientRect)
      return null;

    var currentSize = parseInt(element.getBoundingClientRect()[size], 10);

    return getSizeLimit(currentSize);
  }

  function getSizeLimit(currentSize) {
    return currentSize <= 25 ? '25':
      currentSize <= 50 ? '50':
        currentSize <= 100 ? '100'
          : currentSize <= 200 ? '200'
          : currentSize <= 300 ? '300'
            : currentSize <= 400 ? '400'
              : currentSize <= 500 ? '500'
                : currentSize <= 600 ? '600'
                  : currentSize <= 700 ? '700'
                    : currentSize <= 800 ? '800'
                      : currentSize <= 900 ? '900'
                        : currentSize <= 1000 ? '1000'
                          : currentSize <= 1100 ? '1100'
                            : currentSize <= 1200 ? '1200'
                              : currentSize <= 1300 ? '1300'
                                : currentSize <= 1400 ? '1400'
                                  : currentSize <= 1500 ? '1500'
                                    : currentSize <= 1600 ? '1600'
                                      : currentSize <= 1700 ? '1700'
                                        : currentSize <= 1800 ? '1800'
                                          : currentSize <= 1900 ? '1900'
                                            : currentSize <= 2400 ? '2400'
                                              : currentSize <= 2800 ? '2800'
                                                : '3600';
  }

  jScaler.checkOnMedia = function (size) {
    try {
      var object = eval('(' + size + ')');

      return object && typeof object === "object";
    }
    catch (e) {
      return false;
    }
  }

  jScaler.processImage = function (img, isUpdate) {

    var sourceUrl = 'ci-src',
      imgTypeFromAttr = this.attr(img, 'ci-type') || this.attr(img, 'ci-operation') || this.attr(img, 'ci-o'),
      imgType = imgTypeFromAttr || this.config.DEFAULT_TYPE || '',
      imgSizeFromAttr = this.attr(img, 'ci-size') || this.attr(img, 'ci-s'),
      imgSize = imgSizeFromAttr || this.getParentWidth(img) || '',
      imgParamsFromAttr = this.attr(img, 'ci-params') || this.attr(img, 'ci-filter') || this.attr(img, 'ci-f'),
      imgParams = imgParamsFromAttr || this.config.DEFAULT_PARAMS || '',
      isLocalUrl = this.isLocalURL(img, sourceUrl),
      isResponsive = this.checkOnMedia(imgSize),
      imgSrc = this.getImgSrc(img, sourceUrl, isLocalUrl),
      cloudimageUrl,
      oldSize = img.getAttribute('data-old-ci-size');

    if (!imgTypeFromAttr && !imgSizeFromAttr) {
      if (!this.forceUpdate && (oldSize && isUpdate && imgSize && (parseInt(imgSize) <= parseInt(oldSize)))) return ;

      img.setAttribute('data-old-ci-size', imgSize);
    }

    if (isResponsive) {
      imgSize = eval('(' + imgSize + ')');
      cloudimageUrl = this.generateUrl('width', this.updateSizeWithPixelRatio(imgSize), imgParams, imgSrc);
    } else {
      cloudimageUrl = this.generateUrl(imgType, this.updateSizeWithPixelRatio(imgSize), imgParams, imgSrc);
    }
    if (!isUpdate) {
      this.wrap(img);

      img.setAttribute('src', cloudimageUrl);
      this.addSources(img, imgType, imgSize, imgParams, imgSrc, isResponsive);
    } else {
      var wrapper = img.parentNode.parentNode;
      var sources = wrapper.querySelectorAll('source');

      [].forEach.call(sources, function (item) { item.remove(); })

      img.setAttribute('src', cloudimageUrl);
      this.addSources(img, imgType, imgSize, imgParams, imgSrc, isResponsive);
    }
  };

  jScaler.updateSizeWithPixelRatio = function(size) {
    var splittedSizes = size.toString().split('x');
    var result = [];

    [].forEach.call(splittedSizes, function(size) {
      result.push(size * Math.round(window.devicePixelRatio || 1));
    });

    return result.join('x');
  };

  jScaler.processBackgroundImage = function(elem) {
    var sourceUrl = 'ci-background',
      imgTypeFromAttr = this.attr(elem, 'ci-type') || this.attr(elem, 'ci-operation') || this.attr(elem, 'ci-o'),
      imgType = imgTypeFromAttr || this.config.DEFAULT_TYPE || '',
      imgSizeFromAttr = this.attr(elem, 'ci-size') || this.attr(elem, 'ci-s'),
      imgSize = imgSizeFromAttr || this.setSizeFromElemProperty(elem, imgType) || this.getDefaultSize(imgType),
      isResponsive = this.checkOnMedia(imgSize),
      imgParamsFromAttr = this.attr(elem, 'ci-params') || this.attr(elem, 'ci-filter') || this.attr(elem, 'ci-f'),
      imgParams = imgParamsFromAttr || this.config.DEFAULT_PARAMS || '',
      imgSrc = this.getBackgroundImgUrl(elem, sourceUrl),
      oldIndex = elem.getAttribute('ci-img-index'),
      nextIndex = null,
      oldSize = elem.getAttribute('data-old-ci-size');

    if (!this.forceUpdate && (oldSize && imgSize && (parseInt(imgSize) <= parseInt(oldSize)))) return ;

    elem.setAttribute('data-old-ci-size', imgSize);


    if (!(oldIndex >= 0 && oldIndex !== null)) {
      nextIndex = this.backgroundImgIndex.toString();
      elem.setAttribute('ci-img-index', nextIndex);
      this.backgroundImgIndex++;
    } else {
      nextIndex = oldIndex;
    }

    this.addCss(elem, imgType, imgSize, imgParams, imgSrc, isResponsive, nextIndex);
  };

  jScaler.generateUrl = function (imgType, imgSize, imgParams, imgSrc) {
    var ultraFast = this.config.IS_ULTRA_FAST ? 'https://scaleflex.ultrafast.io/' : 'https://';
    var cloudUrl = ultraFast + this.config.TOKEN + this.config.CONTAINER + '/';

    return cloudUrl + imgType + '/' + imgSize + '/' + imgParams + '/' + imgSrc + this.config.QUERY_STRING;
  };

  jScaler.addSources = function (img, imgType, imgSize, imgParams, imgSrc, isResponsive) {
    if (isResponsive) {
      var orderFiltered = [];


      for (i = 0; i < this.config.ORDER.length; i++) {
        var size = imgSize[this.config.ORDER[i]];

        if (size)
          orderFiltered.unshift(this.config.ORDER[i]);
      }

      for (var i = 0; i < orderFiltered.length; i++) {
        var isLast = !(i < orderFiltered.length - 1);
        var nextSizeType = isLast ? orderFiltered[i - 1] : orderFiltered[i];
        var nextSize = imgSize[orderFiltered[i]];

        var srcSet = this.generateSrcset(imgType, nextSize, imgParams, imgSrc);
        var mediaQuery = '(' + (isLast ? 'min' : 'max') +'-width: ' + (this.config.RESULT_PRESETS[nextSizeType] + (isLast ? 1 : 0)) + 'px)';

        this.before(img, '<source media="' + mediaQuery + '" srcset="' + srcSet + '">');
      }
    } else {
      this.before(img, '<source srcset="' + this.generateSrcset(imgType, imgSize, imgParams, imgSrc) + '">');
    }
  };

  jScaler.getImgSrc = function (img, sourceUrl, isLocalUrl) {
    var imgSrc = this.attr(img, sourceUrl);
    if (isLocalUrl) {
      img.setAttribute('ci-local-url', imgSrc);
      imgSrc = this.config.BASE_URL + imgSrc;
    }
    return imgSrc;
  };

  jScaler.getBackgroundImgUrl = function (elem, sourceUrl) {
    var imgSrc = this.attr(elem, sourceUrl) || '',
      isLocalUrl;
    if (!imgSrc) {
      this.setUrlFromElemProperty(elem, sourceUrl);
    }
    isLocalUrl = this.isLocalURL(elem, sourceUrl);
    imgSrc = this.getImgSrc(elem, sourceUrl, isLocalUrl);
    return imgSrc;
  };

  jScaler.generateImgSrc = function (imgType, imgParams, imgSrc, imgWidth, imgHeight, factor) {
    var imgSize = Math.trunc(imgWidth * factor);
    if (imgHeight) {
      imgSize += 'x' + Math.trunc(imgHeight * factor);
    }
    return this.generateUrl(imgType, this.updateSizeWithPixelRatio(imgSize), imgParams, imgSrc)
      .replace('http://scaleflex.ultrafast.io/', '')
      .replace('https://scaleflex.ultrafast.io/', '')
      .replace('//scaleflex.ultrafast.io/', '')
      .replace('///', '/');
  };

  jScaler.generateSrcset = function (imgType, imgSize, imgParams, imgSrc) {
    var imgWidth = imgSize.toString().split('x')[0],
      imgHeight = imgSize.toString().split('x')[1];
    return this.generateImgSrc(imgType, imgParams, imgSrc, imgWidth, imgHeight, 1);
  };

  jScaler.generateMediaQueries = function (elem, imgType, imgSize, imgParams, imgSrc, isResponsive, mediaQuery, isFirst, prevMediaQuery) {
    var selector_suffix = this.attr(elem, 'ci-selector-suffix') || '',
      selector = '[ci-img-index="' + this.attr(elem, 'ci-img-index') + '"]' + selector_suffix,
      importantStr = !!this.attr(elem, 'ci-important') ? ' !important' : '',
      imgWidth = imgSize.toString().split('x')[0],
      imgHeight = imgSize.toString().split('x')[1],
      query = isFirst ? prevMediaQuery : mediaQuery,
      mediaQuerySingle = isResponsive ? '@media (' + (!isFirst ? 'max' : 'min') + '-width: ' + query + 'px) {' : '',
      singleCloseBrackets = isResponsive ? '} ' : '';

    return mediaQuerySingle + selector + ' { background-image: url(' +
      this.generateImgSrc(imgType, imgParams, imgSrc, imgWidth, imgHeight, 1) + ')' + importantStr + '; } ' + singleCloseBrackets;
  };

  jScaler.getDefaultSize = function (imgType) {
    var size = '';
    switch (imgType) {
      case "width":
        size = this.config.DEFAULT_WIDTH;
        break;
      case "height":
        size = this.config.DEFAULT_HEIGHT;
        break;
      case "crop":
      case "fit":
      case "cover":
      case "bound":
        size = this.config.DEFAULT_WIDTH + 'x' + this.config.DEFAULT_HEIGHT;
        break;
      default:
        size = this.config.DEFAULT_WIDTH + 'x' + this.config.DEFAULT_HEIGHT;
        break;
    }
    return size;
  };

  jScaler.setUrlFromElemProperty = function (elem, sourceUrl) {
    elem.setAttribute(sourceUrl, window.getComputedStyle(elem).backgroundImage.slice(5, -2));    //TODO: need to check
                                                                                                 // for all browsers
  };

  jScaler.setSizeFromElemProperty = function (elem, imgType) {
    var width  = Number(window.getComputedStyle(elem).width),
      height = Number(window.getComputedStyle(elem).height);

    if (!width) width = this.getParentWidth(elem);

    if (imgType === 'width') {
      return this.getElementSize(elem, 'width');
    } else if (imgType === 'width') {
      return this.getElementSize(elem, 'height');
    } else if (width && height) {
      return width + 'x' + height;
    }
  };

  jScaler.addCss = function (elem, imgType, imgSize, imgParams, imgSrc, isResponsive, nextIndex) {
    var i, size, mediaQuery;
    if (isResponsive) {
      var cssQueries = '';
      var imgSizeFromAttr = this.attr(elem, 'ci-size') || this.attr(elem, 'ci-s') || null;
      if (imgSize === 'full_screen' || imgSize === '' || imgSizeFromAttr === null) {
        //TODO: make it possible to use special config for auto mode
        for (i = 0; i < this.config.AUTO.length; i++) {
          //TODO: for now only width method
          imgSize = this.config.AUTO[i];
          cssQueries += this.generateMediaQueries(elem, 'width', imgSize, imgParams, imgSrc, isResponsive, imgSize);
        }
      } else if (this.checkOnMedia(imgSize)) {
        imgSize = eval('(' + imgSize + ')');
        var orderFiltered = [];

        for (i = 0; i < this.config.ORDER.length; i++) {
          size = imgSize[this.config.ORDER[i]];

          if (size)
            orderFiltered.push(this.config.ORDER[i]);
        }

        for (i = 0; i < orderFiltered.length; i++) {
          var isFirst = i === 0;
          var prevSize = isFirst && orderFiltered[i + 1];
          var prevMediaQuery = isFirst && this.config.RESULT_PRESETS[prevSize]
          size = imgSize[orderFiltered[i]];
          mediaQuery = this.config.RESULT_PRESETS[this.config.ORDER[i]];

          cssQueries += this.generateMediaQueries(
            elem, imgType, size, imgParams, imgSrc, isResponsive, mediaQuery, isFirst, prevMediaQuery
          );
        }
      } else if (imgSize) {

      }
      this.addStyles(cssQueries, nextIndex);
    } else {
      this.addStyles(this.generateMediaQueries(elem, imgType, imgSize, imgParams, imgSrc, isResponsive), nextIndex);
    }
  };

  jScaler.addStyles = function (css, nextIndex) {
    var style = document.querySelector('.ci-img-index_' + nextIndex);

    if (!style) {
      style = document.createElement('style');
      style.classList.add('ci-img-index_' + nextIndex);
      style.type = 'text/css';

      if (style.styleSheet) {
        style.styleSheet.cssText = css;
      } else {
        style.appendChild(document.createTextNode(css));
      }
      this.head.appendChild(style);
    }

    style.innerHTML = css;
  };

  jScaler.isLocalURL = function (elem, sourceUrl) {
    var val = this.attr(elem, sourceUrl) || '';
    if (val.indexOf('//') === 0) {
      val = window.location.protocol + val;
      elem.setAttribute(sourceUrl, val);
    }
    return (val.indexOf('http://') !== 0 && val.indexOf('https://') !== 0 && val.indexOf('//') !== 0);
  };

  jScaler.wrap = function (toWrap, wrapper) {
    wrapper = wrapper || document.createElement('picture');

    if (toWrap.nextSibling) {
      toWrap.parentNode.insertBefore(wrapper, toWrap.nextSibling);
    } else {
      toWrap.parentNode.appendChild(wrapper);
    }
    return wrapper.appendChild(toWrap);
  };

  jScaler.before = function (elmnt, value) {
    var template = document.createElement('template'), d;

    if ('content' in template) {
      template.innerHTML = value;
      elmnt.parentNode.insertBefore(template.content.firstChild, elmnt);
    } else {
      d = document.createElement('div');
      d.innerHTML = value;
      elmnt.parentNode.insertBefore(d.firstChild, elmnt);
    }
  };

  jScaler.attr = function (elmnt, attrb) {
    return elmnt.getAttribute(attrb);
  };

  jScaler.init();

  function onerrorImg(event) {
    // set default picture
    //this.src = 'https://placeimg.com/500/500/animals';
  }

  function getParentContainerWithWidth(img) {
    var parentNode = null;
    var width = 0;

    do {
      parentNode = (parentNode && parentNode.parentNode) || img.parentNode;
      width = parentNode.getBoundingClientRect().width;
    } while (parentNode && !width)

    return width;
  }

  function filterImages(images, type) {
    var filtered = [];

    for (var j = 0; j < images.length; j++) {
      var image = images[j];
      var size = image.getAttribute(type) || '';

      if (size.slice(-4).toLowerCase() !== '.svg')
        filtered.push(image);
    }

    return filtered;
  }

  function getPresets(value, type) {
    value = value || '';
    var splittedValues = value.split('|');
    var result = { presets: {}, order: [] };

    for (var i = 0; i < splittedValues.length; i++) {
      var splittedParam = splittedValues[i] && splittedValues[i].split(':');
      var prop = splittedParam[0] && splittedParam[0].trim();
      var val = splittedParam[1] && splittedParam[1].trim();

      if (prop && val) {
        result.presets[prop] = val;
        result.order.unshift(prop);
      }
    }

    return result[type];
  }

  var resizeTimer;

  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      jScaler.process(jScaler.config);
    }, 350);
  });

})(window, document);