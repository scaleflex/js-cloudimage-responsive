[![Release](https://img.shields.io/badge/release-v1.0.0-blue.svg)](https://github.com/scaleflex/js-cloudimage-responsive/releases)
[![Free plan](https://img.shields.io/badge/price-includes%20free%20plan-green.svg)](https://www.cloudimage.io/en/home#b38181a6-b9c8-4015-9742-7b1a1ad382d5)
[![Contributions welcome](https://img.shields.io/badge/contributions-welcome-orange.svg)](#contributing)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Scaleflex team](https://img.shields.io/badge/%3C%2F%3E%20with%20%E2%99%A5%20by-the%20Scaleflex%20team-6986fa.svg)](https://www.scaleflex.it/en/home)

[![Tweet](https://img.shields.io/twitter/url/http/shields.io.svg?style=social)](https://twitter.com/intent/tweet?text=Responsive%20images,%20now%20easier%20than%20ever&url=https://scaleflex.github.io/js-cloudimage-responsive/&via=cloudimage&hashtags=images,cloudimage,responsive_images,lazy_loading,web_acceleration,image_managementimage_resizing,image_compression,image_optimization,image_CDN,image_CDNwebp,jpeg_xr,jpg_optimization,image_resizing_and_CDN,cropresize)

<p align="center">
	<img
		height="175"
		alt="The Lounge"
		src="https://demo.cloudimg.io/height/350/n/https://scaleflex.airstore.io/filerobot/filerobot-cloudimage.png?sanitize=true">
</p>

<h1 align="center">
   JS Cloudimage Responsive
</h1>

<p align="center">
	<strong>
		<a href="#table_of_contents">Docs</a>
		•
		<a href="https://scaleflex.github.io/js-cloudimage-responsive/" target="_blank">Demo</a>
		•
		<a href="#" target="_blank">Why?</a>
	</strong>
</p>

The plugin detects the width of image's container and pixel ratio
density of your device to load the exact image size you need.
It processes images via Cloudimage.io service which offers comprehensive
automated image optimization solutions.

When an image is first loaded on your website or mobile app,
Cloudimage's resizing servers will download your origin image from
your origin server, resize it and deliver to your user via lightning-fast
Content Delivery Networks (CDNs). Once the image is resized
in the format of your choice, Cloudimage will send it to a Content
Delivery Network, which will in turn deliver it rocket fast to
your visitors, responsively across various screen sizes.

**NOTE:** Your original (master) images should be stored on a server
or storage bucket (S3, Google Cloud, Azure Blob...) reachable over
HTTP or HTTPS by Cloudimage. If you want to upload your master images to
Cloudimage, contact us at
[hello@cloudimage.io](mailto:hello@cloudimage.io).

<p align="center">
	<img
		alt="The Lounge"
		src="https://demo.cloudimg.io/width/1400/n/https://demo.cloudimg.io/width/800/none/sample.li/Cloudimage_diagram.jpeg?sanitize=true">
</p>

powered by [Cloudimage](https://www.cloudimage.io/)
([Watch the video here](https://www.youtube.com/watch?time_continue=2&v=JFZSE1vYb0k))

## Table of contents

* [Demo](#demo)
* [Installation](#installation)
* [Simple Usage](#quick_start)
* [Requirements](#requirements)
* [Configuration](#configuration)
* [Image properties](#image_properties)
* [Lazy Loading](#lazy_loading)
* [Browser support](#browser_support)
* [Filerobot UI Family](#ui_family)
* [Contributing](#contributing)
* [License](#license)


## <a name="demo"></a> Demo

To see the Cloudimage Responsive plugin in action, please check out the
[Demo page](https://scaleflex.github.io/js-cloudimage-responsive/).
Play with your browser's window size and observe your
Inspector's Network tab to see how Cloudimage delivers the optimal
image size to your browser, hence accelerating the overall page
loading time.

## <a name="installation"></a> Installation

Add script tag with link to js-cloudimage-responsive

```javascript
<script src="https://scaleflex.airstore.io/filerobot/js-cloudimage-responsive/v1.0.0.min.js"></script>
```

or using npm

```
$ npm install --save js-cloudimage-responsive
```

## <a name="quick_start"></a> Simple Usage

```javascript
<script>
    const ciResponsive = new window.CIResponsive({
      token: 'demo',
      baseUrl: 'https://cloudimage.public.airstore.io/demo/'
    });

    ciResponsive.init();
</script>
```

or in new style with npm

```javascript

import 'js-cloudimage-responsive';

const ciResponsive = new window.CIResponsive({
  token: 'demo',
  baseUrl: 'https://cloudimage.public.airstore.io/demo/'
});

ciResponsive.init();
```

and just use the `ci-src` instead of the `src` attribute in image tag.

```html
<img ci-src="magnus-lindvall.jpg" ratio="1.5"/>
```

NOTE: "ratio" is recommended to prevent page layout jumping and to
leverage visibility checking and thus lazy loading.

## <a name="requirements"/> Requirements

To use the Cloudimage Responsive plugin, you will need a
Cloudimage token. Don't worry, it only takes seconds to get one by
registering [here](https://www.cloudimage.io/en/register_page).
Once your token is created, you can configure it as described below.
This token allows you to use 25GB of image cache and 25GB of worldwide
CDN traffic per month for free.

## <a name="configuration"></a> Config

### token

###### Type: **String** | Default: **"demo"** | _required_

Your Cloudimage customer token.
[Subscribe](https://www.cloudimage.io/en/register_page) for a
Cloudimage account to get one. The subscription takes less than a
minute and is totally free

### lazyLoading

###### Type: **Bool** | Default: **true** | _required_

Only load images close to the viewport

### imgLoadingAnimation

###### Type: **Bool** | Default: **true** | _required_

Nice effect for preview transition

### filters

###### Type: **String** | Default: **'n'** | _optional_

Parameters like fcontrast, fpixelate, fgaussian, backtransparent,
rotation to apply filters on your image by default
[see doc](https://docs.cloudimage.io/go/cloudimage-documentation/en/filters/)


### placeholderBackground

###### Type: **String** | Default: **'#f4f4f4'** | _optional_

Placeholder background while the image or preview image is loading

### baseUrl

###### Type: **String** | Default: **"/"** | _optional_

Your image folder on server.

### presets

###### Type: **Object**

Default:

```javascript
{
    xs: '(max-width: 575px)', // to 575       PHONE
    sm: '(min-width: 576px)', // 576 - 767    PHABLET
    md: '(min-width: 768px)', // 768 - 991    TABLET
    lg: '(min-width: 992px)', // 992 - 1199   SMALL_LAPTOP_SCREEN
    xl: '(min-width: 1200px)' // from 1200    USUALSCREEN
}
```

Breakpoints shortcuts to use in image size property.

## <a name="image_properties"></a> Image properties

### src

###### Type: **String** | Default: **undefined** | _required_

Original image hosted on your web server. You can use absolute path or
relative to baseUrl in your config.

### operation/o

[see doc](https://docs.cloudimage.io/go/cloudimage-documentation/en/operations/)

###### Type: **String** | Default: **width** | _optional_

**width** - to resize with a specific width

**height** - to resize with a specific height

**crop** - to crop the image at the center

**fit** - to resize the image in a box and keeping the proportions of the source image

**cover** - to resize the image in a box without keeping the proportions of the source image

### size/s

###### Type: **String** | Default: **undefined** | _optional_

Size of an image which is used as a base for creating retina ready and responsive image element.

Examples (PR - stands for your device Pixel Ratio):

**[width]**: s="250" => width: 250 * PR (px); height: auto;

**[width x height]**: s="125x200" => width: 125 * PR (px); height: 200 * PR (px);

**[Width and height for different screen resolutions]**:

s="sm 800x400, (min-width: 620px) 200x20, md 1000x1350, lg 1400x1200, xl 1600x1000"

*You can drop some breakpoints, for example s="md 1000x1350, lg 1400x1200

**NOTE:** if size is not set, the plugin uses a special algorithm to
detect the width of image container and set the image size accordingly.

### filters/f

[see doc](https://docs.cloudimage.io/go/cloudimage-documentation/en/filters/)

###### Type: **String** | Default: **none** | _optional_

Filters allow you to modify the image's apperance and can be added on top of the resizing features above.

**fgrey** - apply a greyscale filter on the image

**fgaussian[0..10]** - apply a gaussian blur filter on the image

**fcontrast[-100..100]** - apply a contrast filter on the image

**fbright[0..255]** - apply a brightness filter on the image

**fpixelate[0..100]** - apply a pixelate filter on the image

**fradius[0..500]** - create a radius on the corners

### ratio/r

###### Type: **Number** | _optional_

it is recommended to prevent page layout jumping and to leverage
visibility checking and thus lazy loading.

To see the full cloudimage documentation [click here](https://docs.cloudimage.io/go/cloudimage-documentation)

## <a name="lazy_loading"></a> Lazy Loading

Lazy loading is not included into js-cloudimage-responsive by default.
There are a few great libraries to do it.

The example below uses [lazysizes](https://github.com/aFarkas/lazysizes)
library using Intersection Observer API.

add the following scripts right after js-cloudimage-responsive script

```javascript
<script src="https://scaleflex.airstore.io/filerobot/plugins/js-cloudimage-responsive.v0.0.5.min.js"></script>
<script>
  window.lazySizesConfig = window.lazySizesConfig || {};
  window.lazySizesConfig.init = false;
</script>
<script src="https://scaleflex.airstore.io/filerobot/plugins/lazysizes-intersection.min.js"></script>
```

the initialization script

```javascript
<script>
    const ciResponsive = new window.CIResponsive({
      token: 'demo',
      baseUrl: 'https://cloudimage.public.airstore.io/demo/',
      filters: 'q35.foil1',
      lazyLoading: true
    });


    ciResponsive.init();
    lazySizes.init();
</script>
 ```

## <a name="browser_support"></a> Browser support

Tested in all modern browsers and IE 11.

NOTE: If you use lazy loading with IntersectionObserver, you must
manually add the [IntersectionObserver polyfill](https://github.com/w3c/IntersectionObserver/tree/master/polyfill)
for cross-browser support.

## <a name="ui_family"></a>Filerobot UI Familiy

* [React Cloudimage Responsive](https://github.com/scaleflex/react-cloudimage-responsive)
* [Angular Cloudimage Responsive](https://github.com/scaleflex/ng-cloudimage-responsive)
* [Image Editor](https://github.com/scaleflex/filerobot-image-editor)
* [Uploader](https://github.com/scaleflex/filerobot-uploader)

## <a name="contributing"></a>Contributing!

All contributions are super welcome!


## <a name="license"></a>License
Filerobot Uploader is provided under the [MIT License](https://opensource.org/licenses/MIT)

