//----------------------------------------------------------------------------------------------------------------------//
// Version 1.2
// Taking in consideration operation width, height, crop, cover, fit, bound, watermarking and all parameters
// https://cloudimage.io
//


var jScaler = {};

jScaler.config = {
  TOKEN: 'cej9drin',  // for test
  DEFAULT_WIDTH: 400,
  DEFAULT_HEIGHT: 300,
  BASE_URL: '', // For local images
  //DEFAULT_OPERATION: "width", // can only be widht and height for now !

  presets: {
    PHONE: 668,
    PHABLET: 720,
    TABLET: 940,
    SMALL_LAPTOP_SCREEN: 1140,
    USUALSCREEN: 1367,
    MAXSCREEN: 1920
  },

  forClassName: function(img) {
    for (var i = 0; i < this.vectors.length; i++)
      if (img.className === this.vectors[i].CLASSNAME) {
        return this.vectors[i];
      }
    return this.vectors[0];
  }
};

jScaler.init = function() {

  if (!('trunc' in Math)) { //IE Patch
		Math.trunc = Math.floor;
	}

  //this.config.DEFAULT_RESIZE = "https://" + this.config.TOKEN + ".cloudimg.io/" + this.config.DEFAULT_OPERATION + "/1000/n/";

  //You have to create as much vector that you have classes of images.

  this.config.DEFAULT_W_RATIO = this.config.DEFAULT_WIDTH / this.config.presets.MAXSCREEN;
  this.config.DEFAULT_H_RATIO = this.config.DEFAULT_HEIGHT / this.config.presets.MAXSCREEN;

  var vector_default = [
    {
      screenWidth: this.config.presets.PHONE,
      imgWidth: Math.trunc(this.config.presets.PHONE * this.config.DEFAULT_W_RATIO),
      imgHeight: Math.trunc(this.config.presets.PHONE * this.config.DEFAULT_H_RATIO)
    },
    {
      screenWidth: this.config.presets.PHABLET,
      imgWidth: Math.trunc(this.config.presets.PHABLET * this.config.DEFAULT_W_RATIO),
      imgHeight: Math.trunc(this.config.presets.PHABLET * this.config.DEFAULT_H_RATIO)
    },
    {
      screenWidth: this.config.presets.TABLET,
      imgWidth: Math.trunc(this.config.presets.TABLET * this.config.DEFAULT_W_RATIO),
      imgHeight: Math.trunc(this.config.presets.TABLET * this.config.DEFAULT_H_RATIO)
    },
    {
      screenWidth: this.config.presets.SMALL_LAPTOP_SCREEN,
      imgWidth: Math.trunc(this.config.presets.SMALL_LAPTOP_SCREEN * this.config.DEFAULT_W_RATIO),
      imgHeight: Math.trunc(this.config.presets.SMALL_LAPTOP_SCREEN * this.config.DEFAULT_H_RATIO)
    },
    {
      screenWidth: this.config.presets.USUALSCREEN,
      imgWidth: Math.trunc(this.config.presets.USUALSCREEN * this.config.DEFAULT_W_RATIO),
      imgHeight: Math.trunc(this.config.presets.USUALSCREEN * this.config.DEFAULT_H_RATIO)
    },
    {
      screenWidth: this.config.presets.MAXSCREEN,
      imgWidth: this.config.DEFAULT_WIDTH,
      imgHeight: this.config.DEFAULT_HEIGHT
    }
  ];

  /* Example of other vector

  var vector_thumbnails = [
    {
      "screenWidth": this.config.presets.PHONE,
      "imgWidth": 100,
      "imgHeight": 100
    },
    {
      "screenWidth": this.config.presets.PHABLET,
      "imgWidth": 150,
      "imgHeight": 150
    },
    {
      "screenWidth": this.config.presets.TABLET,
      "imgWidth": 200,
      "imgHeight": 200
    },
    {
      "screenWidth": this.config.presets.SMALL_LAPTOP_SCREEN,
      "imgWidth": 500,
      "imgHeight": 500
    },
    {
      "screenWidth": this.config.presets.USUALSCREEN,
      "imgWidth": 500,
      "imgHeight": 500
    },
    {
      "screenWidth": this.config.presets.MAXSCREEN,
      "imgWidth": 500,
      "imgHeight": 500
    }
  ];*/

  //you Have to repport here
  this.config.vectors = [
    {
      CLASSNAME: '',
      VECTOR: vector_default,
      OPERATION: 'width',
      PARAMETER: 'n'
    },
    /*{
	    CLASSNAME: 'thumbsnail',
      VECTOR: vector_thumbsnail,
      OPERATION: 'crop',
      PARAMETER : 'n'
    }*/
  ];

};

/*
WARNING : YOU SHOULD NOT MODIFY AFTER THIS LINE UNLESS YOU KNOW WHAT YOU ARE DOING
**********************************************************************************
*/

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

jScaler.addSources = function(img) {
  var config = this.config.forClassName(img),
      origin = 'https://' + this.config.TOKEN + '.cloudimg.io/' + config.OPERATION + '/',
      originResize = 'https://' + this.config.TOKEN + '.cloudimg.io/s/resize/';

  config.VECTOR.forEach(function(vector, index, ar) {
    switch (config.OPERATION) {
      case "width":
        this.before(
          img,
          '<source media="(max-width:' + vector.screenWidth + 'px)"' + ' srcset="' +
          origin + vector.imgWidth + '/'+ config.PARAMETER +'/' + this.attr(img, 'data-src') + ' 1x, ' +
          origin + Math.trunc(1.5 * vector.imgWidth) + '/'+ config.PARAMETER + '/' + this.attr(img, 'data-src') + ' 1.5x, ' +
          origin + 2 * vector.imgWidth + '/'+ config.PARAMETER + '/' + this.attr(img, 'data-src') + ' 2x, ' +
          origin + 3 * vector.imgWidth + '/'+ config.PARAMETER + '/' + this.attr(img, 'data-src') + ' 3x">');
        break;
      case "height":
        this.before(
          img,
          '<source media="(max-height:' + vector.screenHeight + 'px)"' + ' srcset="' +
          origin + vector.imgHeight + '/'+ config.PARAMETER +'/' + this.attr(img, 'data-src') + ' 1x, ' +
          origin + Math.trunc(1.5 * vector.imgHeight) + '/'+ config.PARAMETER + '/' + this.attr(img, 'data-src') + ' 1.5x, ' +
          origin + 2 * vector.imgHeight + '/'+ config.PARAMETER + '/' + this.attr(img, 'data-src') + ' 2x, ' +
          origin + 3 * vector.imgHeight + '/'+ config.PARAMETER + '/' + this.attr(img, 'data-src') + ' 3x">');
        break;
      case "crop":
      case "fit":
      case "cover":
      case "bound":
        this.before(img, '<source media="(max-width:' + vector.screenWidth + 'px)"' + ' srcset="' +
          origin + vector.imgWidth + 'x' + vector.imgHeight + '/'+ config.PARAMETER + '/' + this.attr(img, 'data-src') + ' 1x, ' +
          origin + Math.trunc(1.5 * vector.imgWidth) + 'x' + Math.trunc(1.5 *vector.imgHeight) + '/'+ config.PARAMETER + '/' + this.attr(img, 'data-src') + ' 1.5x, ' +
          origin + 2 * vector.imgWidth + 'x' + 2 *vector.imgHeight + '/'+ config.PARAMETER + '/' + this.attr(img, 'data-src') + ' 2x, ' +
          origin + 3 * vector.imgWidth + 'x' + 3 *vector.imgHeight + '/'+ config.PARAMETER + '/' + this.attr(img, 'data-src') + ' 3x">');
        break;
      default:
        this.before(img, '<source media="(max-width:' + vector.screenWidth + 'px)"' + ' srcset="' +
          originResize + vector.imgWidth + '/' + this.attr(img, 'data-src') + ' 1x, ' +
          originResize + Math.trunc(1.5 * vector.imgWidth) + '/' + this.attr(img, 'data-src') + ' 1.5x, ' +
          originResize + 2 * vector.imgWidth + '/' + this.attr(img, 'data-src') + ' 2x, ' +
          originResize + 3 * vector.imgWidth + '/' + this.attr(img, 'data-src') + ' 3x">');
        break;
    }
  }, this)
};

jScaler.isLocalURL = function(img, attr) {
  var val = this.attr(img, attr);
  if (val.indexOf('//') === 0) {
    val = window.location.protocol + val;
    img.setAttribute('src', val);
  }
  return (val.indexOf('http://') !== 0 && val.indexOf('https://') !== 0);
};

jScaler.isHostedOnCloudImg = function(img, attr) {
  var val = this.attr(img, attr);
  return (val.indexOf('cloudimg.io') >= 0 || val.indexOf('cloudimage.io') >= 0);
};

jScaler.processImage = function(img) {
  var source_URL = 'src',
      startUrlSource = 8, // forget the https:// or http://
      t,
      j,
      endUrlSource,
      actualUrl;

  this.wrap(img);

  if (this.attr(img, 'data-src')) {
    source_URL = "data-src";
  }

  if (!this.isLocalURL(img, source_URL)) {
    if (this.isHostedOnCloudImg(img, source_URL)) {
      for (j = 0; j < 4; j++) { // search the original link of the image
        t = this.attr(img, source_URL).indexOf('/', startUrlSource);
        startUrlSource = t + 1;
      }
      endUrlSource = this.attr(img, source_URL).length;
      actualUrl = this.attr(img, source_URL).substring(startUrlSource, endUrlSource);
      if (actualUrl.indexOf('//') === 0) {
        actualUrl = window.location.protocol + actualUrl;
        img.setAttribute('src', this.attr(img, source_URL).substring(0, startUrlSource) + actualUrl);
      } else {
        img.setAttribute('src', this.attr(img, source_URL));
      }
      img.setAttribute('data-src', actualUrl);
    } else {
      img.setAttribute('data-src', this.attr(img, source_URL));
      img.setAttribute('src', 'https://' + this.config.TOKEN + '.cloudimg.io/cdn/x/n/' + this.attr(img, source_URL));
    }
    this.addSources(img);
  } else {
	  if (this.config.BASE_URL ==='') {
	    img.setAttribute('data-src',img.getAttribute(source_URL));
	    img.setAttribute('src', img.getAttribute(source_URL));
	  } else {
      img.setAttribute('data-src', this.config.BASE_URL + img.getAttribute(source_URL));
      img.setAttribute(
        'src',
        'https://' + this.config.TOKEN + '.cloudimg.io/cdn/x/n/' + this.config.BASE_URL + img.getAttribute(source_URL)
      );
	  }
  }
};

jScaler.process = function() {
  var imgs = document.getElementsByTagName('img');
  if (imgs.length > 0) {
    imgs = Array.prototype.slice.call(imgs);
    imgs.forEach(function(img, index, ar) {
      this.processImage(img);
    }, this);
  }
};

jScaler.init();

document.addEventListener('DOMContentLoaded', function(event) {
  jScaler.process();
});
