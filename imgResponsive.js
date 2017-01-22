var jScaler = {};

jScaler.config = {
  TOKEN: 'cej9drin',  // for test
  PROTOCOL: 'https://',
  SERVER_NAME: '.cloudimg.io',
  DEFAULT_WIDTH: '400',
  DEFAULT_HEIGHT: '300',
  DEFAULT_TYPE: 'width',
  DEFAULT_PARAMS: 'none',
  BASE_URL: 'http://my-site.com/', // For local images

  presets: {
    xs: 576,  // 0 - 576      PHONE
    sm: 768,  // 577 - 768    PHABLET
    md: 992,  // 769 - 992    TABLET
    lg: 1200, // 993 - 1200   SMALL_LAPTOP_SCREEN
    xl: 1920  // 1200 - 1920  USUALSCREEN
  }
};

jScaler.init = function() {
  this.backgroundImgIndex = 0;
  this.head = document.head || document.getElementsByTagName('head')[0];

  if (!('trunc' in Math)) {   //IE Patch
		Math.trunc = Math.floor;
	}
};

jScaler.wrap = function(toWrap, wrapper) {
  wrapper = wrapper || document.createElement('picture');

  if (toWrap.nextSibling) {
    toWrap.parentNode.insertBefore(wrapper, toWrap.nextSibling);
  } else {
    toWrap.parentNode.appendChild(wrapper);
  }
  return wrapper.appendChild(toWrap);
};

jScaler.before = function(elmnt, value) {
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

jScaler.attr = function(elmnt, attrb) {
  return elmnt.getAttribute(attrb);
};

jScaler.addSources = function(img, imgType, imgSize, imgParams, imgSrc, isResponsive) {
  if(isResponsive) {
    for (var size in imgSize) {
      if (imgSize.hasOwnProperty(size)) {
        var srcSet = this.generateSrcset(imgType, imgSize[size], imgParams, imgSrc),
            mediaQuery = '(max-width:' + this.config.presets[size] + 'px)';
        this.before(img, '<source media="' + mediaQuery + '" srcset="' + srcSet + '">');
      }
    }
  } else {
    this.before(img, '<source srcset="' + this.generateSrcset(imgType, imgSize, imgParams, imgSrc) + '">');
  }
};

jScaler.isLocalURL = function(elem, sourceUrl) {
  var val = this.attr(elem, sourceUrl) || '';
  if (val.indexOf('//') === 0) {
    val = window.location.protocol + val;
    elem.setAttribute(sourceUrl, val);
  }
  return (val.indexOf('http://') !== 0 && val.indexOf('https://') !== 0);
};

jScaler.getImgSrc = function(img, sourceUrl, isLocalUrl) {
  var imgSrc = this.attr(img, sourceUrl);
  if (isLocalUrl && this.config.BASE_URL !== '') {
    img.setAttribute('ci-local-url', imgSrc); //TODO: ask for redo to 404 and send default picture
    imgSrc = this.config.BASE_URL + imgSrc;
  }
  return imgSrc;
};

jScaler.processImage = function(img) {
  var sourceUrl = 'ci-src',
      imgType = this.attr(img, 'ci-type') || this.config.DEFAULT_TYPE || '',
      imgSize = this.attr(img, 'ci-size') || this.getDefaultSize(imgType) || '',
      imgParams = this.attr(img, 'ci-params') || this.config.DEFAULT_PARAMS || '',
      isLocalUrl = this.isLocalURL(img, sourceUrl),
      isResponsive = this.attr(img, 'ci-responsive') !== null, //TODO: need to check in all browsers
      imgSrc = this.getImgSrc(img, sourceUrl, isLocalUrl),
      cloudimageUrl;

  this.wrap(img);

  if (isResponsive) {
    imgSize = eval('(' + imgSize + ')');
    cloudimageUrl = this.generateUrl('cdn', 'x', 'none', imgSrc);
    img.setAttribute('src', cloudimageUrl);
    this.addSources(img, imgType, imgSize, imgParams, imgSrc, isResponsive);
  } else {
    cloudimageUrl = this.generateUrl(imgType, imgSize, imgParams, imgSrc);
    img.setAttribute('src', cloudimageUrl);
    this.addSources(img, imgType, imgSize, imgParams, imgSrc, isResponsive);
  }

};

jScaler.generateUrl = function(imgType, imgSize, imgParams, imgSrc) {
  var cloudUrl = this.config.PROTOCOL + this.config.TOKEN + this.config.SERVER_NAME + '/';
  return cloudUrl + imgType + '/' + imgSize + '/' + imgParams + '/' + imgSrc;
};

jScaler.generateImgSrc = function(imgType, imgParams, imgSrc, imgWidth, imgHeight, factor) {
  var imgSize = Math.trunc(imgWidth * factor);
  if (imgHeight) {
    imgSize += 'x' + Math.trunc(imgHeight * factor);
  }
  return this.generateUrl(imgType, imgSize, imgParams, imgSrc);
};

jScaler.generateSrcset = function(imgType, imgSize, imgParams, imgSrc) {
  var imgWidth = imgSize.toString().split('x')[0],
      imgHeight = imgSize.toString().split('x')[1];
  return this.generateImgSrc(imgType, imgParams, imgSrc, imgWidth, imgHeight, 1) + ' 1x, ' +
         this.generateImgSrc(imgType, imgParams, imgSrc, imgWidth, imgHeight, 1.5) + ' 1.5x, ' +
         this.generateImgSrc(imgType, imgParams, imgSrc, imgWidth, imgHeight, 2) + ' 2x, ' +
         this.generateImgSrc(imgType, imgParams, imgSrc, imgWidth, imgHeight, 3) + ' 3x';
};

jScaler.getDefaultSize = function(imgType) {
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

jScaler.processBackgroundImage = function(elem, sfBackgroundProperty) {
  var startUrlSource = this.startUrlSource,
      endUrlSource,
      actualUrl,
      fullUrl,
      j,
      t;

  elem.setAttribute('data-sf-img-index', this.backgroundImgIndex.toString());
  this.backgroundImgIndex++;

  if (!this.isLocalURL(elem, '', sfBackgroundProperty)) {
    if (this.isHostedOnCloudImg(elem, '', sfBackgroundProperty)) {
      //TODO: make a function
      for (j = 0; j < 4; j++) {
        t = sfBackgroundProperty.indexOf('/', startUrlSource);
        startUrlSource = t + 1;
      }
      endUrlSource = sfBackgroundProperty.length;
      actualUrl = sfBackgroundProperty.substring(startUrlSource, endUrlSource);
      if (actualUrl.indexOf('//') === 0) {
        actualUrl = window.location.protocol + actualUrl;
      }
      fullUrl = sfBackgroundProperty.substring(0, startUrlSource) + actualUrl;
    } else {
      fullUrl = 'https://' + this.config.TOKEN + '.cloudimg.io/cdn/x/n/' + sfBackgroundProperty;
    }
  } else {
    if (this.config.BASE_URL === '') {
      fullUrl = sfBackgroundProperty;
    } else {
      fullUrl = 'https://' + this.config.TOKEN + '.cloudimg.io/cdn/x/n/' + this.config.BASE_URL + sfBackgroundProperty;
    }
  }
  this.addCss(elem, fullUrl);
};

jScaler.addCss = function(elem, fullUrl) {

};

jScaler.process = function() {
  var imgs = document.querySelectorAll('img[ci-src]'),
      backgroundImgs = document.querySelectorAll('[ci-img-background]'),
      css = '';

  if (imgs.length > 0) {
    imgs = Array.prototype.slice.call(imgs);
    imgs.forEach(function(img, index, ar) {
      img.addEventListener('error', onerrorImg, false);  //TODO: check if it works well
      this.processImage(img);
    }, this);
  }

  if (backgroundImgs.length > 0) {
    backgroundImgs = Array.prototype.slice.call(backgroundImgs);
    backgroundImgs.forEach(function(img, index, ar) {
      var sfBackgroundProperty = img.getAttribute('sf-img-background');
      if (sfBackgroundProperty === '') {
        console.log(window.getComputedStyle(img).backgroundImage);
      } else {
        this.processBackgroundImage(img, sfBackgroundProperty);
      }
      //img.style.backgroundImage = 'url(' + img.getAttribute('sf-img-background') + ')';

      //this.processImage(img);
    }, this);
    //this.addStyles('div[sf-img-background] { background-image: url(\'' + img.getAttribute('sf-img-background') +'\');}');
  }
};

jScaler.addStyles = function(css) {
  var style = document.createElement('style');

  style.type = 'text/css';
  if (style.styleSheet){
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
  this.head.appendChild(style);
};

function onerrorImg(event) {
  this.removeEventListener('error', onerrorImg, false);
  this.addEventListener('error', onerrorImgStep2, false);
  this.src = this.getAttribute('ci-local-url');
}

function onerrorImgStep2() {
  this.removeEventListener('error', onerrorImgStep2, false);
  this.src = 'https://placeimg.com/500/500/animals'; //TODO: ask for default picture
}

jScaler.init();

document.addEventListener('DOMContentLoaded', function(event) {
  jScaler.process();
});
