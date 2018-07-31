;(function (window, document) {
  window.jScaler = window.jScaler || {};

  jScaler.setConfig = function (config) {
    config = config || {};

    jScaler.config = {
      TOKEN:          config.TOKEN || '',
      CONTAINER:      config.CONTAINER || '.cloudimg.io',
      DEFAULT_WIDTH:  config.DEFAULT_WIDTH || '400',
      DEFAULT_HEIGHT: config.DEFAULT_HEIGHT || '300',
      DEFAULT_TYPE:   config.DEFAULT_TYPE || 'width',
      DEFAULT_PARAMS: config.DEFAULT_PARAMS || 'none',
      BASE_URL:       config.BASE_URL || '',         // For local images
      PRESETS:        config.PRESETS ||
                      {
                        xs: 576,  // 0 - 576      PHONE
                        sm: 768,  // 577 - 768    PHABLET
                        md: 992,  // 769 - 992    TABLET
                        lg: 1200, // 993 - 1200   SMALL_LAPTOP_SCREEN
                        xl: 1920  // 1200 - 1920  USUALSCREEN
                      },
      ORDER:          config.ORDER || ['xl', 'lg', 'md', 'sm', 'xs'],
      AUTO:           config.AUTO || [1920, 1200, 992, 768, 576]
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

    var imgs           = document.querySelectorAll('img[ci-src]'),
        backgroundImgs = document.querySelectorAll('[ci-img-background]');

    if (imgs.length > 0) {
      imgs = Array.prototype.slice.call(imgs);
      imgs.forEach(function (img) {
        img.addEventListener('error', onerrorImg, false);  //TODO: check if it works well
        if (!this.attr(img, 'src')) { //TODO: find better way
          this.processImage(img);
        }
      }, this);
    }

    if (backgroundImgs.length > 0) {
      backgroundImgs = Array.prototype.slice.call(backgroundImgs);
      backgroundImgs.forEach(function (img) {
        if (this.attr(img, 'ci-img-index') >= 0) {  //TODO: find better way
          this.processBackgroundImage(img);
        }
      }, this);
    }
  };

  jScaler.processImage = function (img) {
    var sourceUrl    = 'ci-src',
        imgType      = this.attr(img, 'ci-type') || this.config.DEFAULT_TYPE || '',
        imgSize      = this.attr(img, 'ci-size') || this.getDefaultSize(imgType) || '',
        imgParams    = this.attr(img, 'ci-params') || this.config.DEFAULT_PARAMS || '',
        isLocalUrl   = this.isLocalURL(img, sourceUrl),
        isResponsive = this.attr(img, 'ci-responsive') !== null, //TODO: need to check in all browsers
        imgSrc       = this.getImgSrc(img, sourceUrl, isLocalUrl),
        cloudimageUrl;

    this.wrap(img);

    if (isResponsive) {
      imgSize = eval('(' + imgSize + ')');
      cloudimageUrl = this.generateUrl('cdn', 'x', 'none', imgSrc);
    } else {
      cloudimageUrl = this.generateUrl(imgType, imgSize, imgParams, imgSrc);
    }
    img.setAttribute('src', cloudimageUrl);
    this.addSources(img, imgType, imgSize, imgParams, imgSrc, isResponsive);
  };

  jScaler.processBackgroundImage = function (elem) {
    var sourceUrl    = 'ci-img-background',
        isResponsive = this.attr(elem, 'ci-responsive') !== null, //TODO: need to check in all browsers
        imgType      = this.attr(elem, 'ci-type') || this.config.DEFAULT_TYPE || '',
        imgSize      = this.getBackgroundImgSize(elem, imgType, isResponsive),
        imgParams    = this.attr(elem, 'ci-params') || this.config.DEFAULT_PARAMS || '',
        imgSrc       = this.getBackgroundImgUrl(elem, sourceUrl);

    elem.setAttribute('ci-img-index', this.backgroundImgIndex.toString());
    this.backgroundImgIndex++;

    this.addCss(elem, imgType, imgSize, imgParams, imgSrc, isResponsive);
  };

  jScaler.generateUrl = function (imgType, imgSize, imgParams, imgSrc) {
    var cloudUrl = '//' + this.config.TOKEN + this.config.CONTAINER + '/';

    return cloudUrl + imgType + '/' + imgSize + '/' + imgParams + '/' + imgSrc;
  };

  jScaler.addSources = function (img, imgType, imgSize, imgParams, imgSrc, isResponsive) {
    if (isResponsive) {
      for (var size in imgSize) {
        if (imgSize.hasOwnProperty(size)) {
          var srcSet     = this.generateSrcset(imgType, imgSize[size], imgParams, imgSrc),
              mediaQuery = '(max-width:' + this.config.PRESETS[size] + 'px)';
          this.before(img, '<source media="' + mediaQuery + '" srcset="' + srcSet + '">');
        }
      }
    } else {
      this.before(img, '<source srcset="' + this.generateSrcset(imgType, imgSize, imgParams, imgSrc) + '">');
    }
  };

  jScaler.getImgSrc = function (img, sourceUrl, isLocalUrl) {
    var imgSrc = this.attr(img, sourceUrl);
    if (isLocalUrl) {
      img.setAttribute('ci-local-url', imgSrc); //TODO: ask for redo to 404 and send default picture
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
    return this.generateUrl(imgType, imgSize, imgParams, imgSrc);
  };

  jScaler.generateSrcset = function (imgType, imgSize, imgParams, imgSrc) {
    var imgWidth  = imgSize.toString().split('x')[0],
        imgHeight = imgSize.toString().split('x')[1];
    return this.generateImgSrc(imgType, imgParams, imgSrc, imgWidth, imgHeight, 1) + ' 1x, ' +
      this.generateImgSrc(imgType, imgParams, imgSrc, imgWidth, imgHeight, 1.5) + ' 1.5x, ' +
      this.generateImgSrc(imgType, imgParams, imgSrc, imgWidth, imgHeight, 2) + ' 2x, ' +
      this.generateImgSrc(imgType, imgParams, imgSrc, imgWidth, imgHeight, 3) + ' 3x';
  };

  jScaler.generateMediaQueries = function (elem, imgType, imgSize, imgParams, imgSrc, isResponsive, mediaQuery) {
    var selector_suffix = this.attr(elem, 'ci-selector-suffix') || '',
        selector            = '[ci-img-index="' + this.attr(elem, 'ci-img-index') + '"]' + selector_suffix,
        importantStr     = !!this.attr(elem, 'ci-important') ? ' !important' : '',
        imgWidth            = imgSize.toString().split('x')[0],
        imgHeight           = imgSize.toString().split('x')[1],
        mediaQueryComplex   = isResponsive ? ' (max-width: ' + mediaQuery + 'px) and ' : '',
        mediaQuerySingle    = isResponsive ? '@media (max-width: ' + mediaQuery + 'px) {' : '',
        singleCloseBrackets = isResponsive ? '} ' : '';

    return mediaQuerySingle + selector + ' { background-image: url(' +
      this.generateImgSrc(imgType, imgParams, imgSrc, imgWidth, imgHeight, 1) + ')' + importantStr + '; } ' + singleCloseBrackets +
      '@media' + mediaQueryComplex + '(-webkit-min-device-pixel-ratio: 1.5) { ' + selector + ' { background-image: url(' +
      this.generateImgSrc(imgType, imgParams, imgSrc, imgWidth, imgHeight, 1.5) + ')' + importantStr + '; } } ' +
      '@media' + mediaQueryComplex + '(-webkit-min-device-pixel-ratio: 2) { ' + selector + ' { background-image: url(' +
      this.generateImgSrc(imgType, imgParams, imgSrc, imgWidth, imgHeight, 2) + ')' + importantStr + '; } } ' +
      '@media' + mediaQueryComplex + '(-webkit-min-device-pixel-ratio: 3) { ' + selector + ' { background-image: url(' +
      this.generateImgSrc(imgType, imgParams, imgSrc, imgWidth, imgHeight, 3) + ')' + importantStr + '; } } ';
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
    //TODO: rectify
    var width  = parseInt(window.getComputedStyle(elem).width),
        height = parseInt(window.getComputedStyle(elem).height);
    if (width && imgType === 'width') {
      return width;
    } else if (height && imgType === 'width') {
      return height;
    } else if (width && height) {
      return width + 'x' + height;
    }
  };

  jScaler.getBackgroundImgSize = function (elem, imgType, isResponsive) {
    var imgSize = this.attr(elem, 'ci-size') || '';
    if (!imgSize && !isResponsive) {
      imgSize = this.setSizeFromElemProperty(elem, imgType) || this.getDefaultSize(imgType);
    }
    return imgSize || '';
  };

  jScaler.addCss = function (elem, imgType, imgSize, imgParams, imgSrc, isResponsive) {
    var i, size, mediaQuery;
    if (isResponsive) {
      var cssQueries = '';
      if (imgSize === 'full_screen' || imgSize === '' || this.attr(elem, 'ci-size') === null) {
        //TODO: make it possible to use special config for auto mode
        for (i = 0; i < this.config.AUTO.length; i++) {
          //TODO: for now only width method
          imgSize = this.config.AUTO[i];
          cssQueries += this.generateMediaQueries(elem, 'width', imgSize, imgParams, imgSrc, isResponsive, imgSize);
        }
      } else if (isImgSizeIsObject(imgSize)) {
        imgSize = eval('(' + imgSize + ')');
        for (i = 0; i < this.config.ORDER.length; i++) {
          size = imgSize[this.config.ORDER[i]];
          mediaQuery = this.config.PRESETS[this.config.ORDER[i]];
          if (size) {
            cssQueries += this.generateMediaQueries(
              elem, imgType, size, imgParams, imgSrc, isResponsive, mediaQuery
            );
          }
        }
      } else if (imgSize) {

      }
      this.addStyles(cssQueries);
    } else {
      this.addStyles(this.generateMediaQueries(elem, imgType, imgSize, imgParams, imgSrc, isResponsive));
    }
  };

  jScaler.addStyles = function (css) {
    var style = document.createElement('style');

    style.type = 'text/css';
    if (style.styleSheet) {
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(document.createTextNode(css));
    }
    this.head.appendChild(style);
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

  function isImgSizeIsObject(imgSize) {
    return imgSize.length > 2 && imgSize.indexOf('{') === 0 && imgSize.indexOf('}') === imgSize.length - 1; // TODO:
                                                                                                            // rectify
  }

  function onerrorImg(event) {
    this.removeEventListener('error', onerrorImg, false);
    this.addEventListener('error', onerrorImgStep2, false);
    this.src = this.getAttribute('ci-local-url');
  }

  function onerrorImgStep2() {
    this.removeEventListener('error', onerrorImgStep2, false);
    this.src = 'https://placeimg.com/500/500/animals'; //TODO: ask for default picture
  }
})(window, document);