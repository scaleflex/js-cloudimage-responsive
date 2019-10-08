[![Release](https://img.shields.io/badge/release-v2.3.0-blue.svg)](https://github.com/scaleflex/js-cloudimage-responsive/releases)
[![Free plan](https://img.shields.io/badge/price-includes%20free%20plan-green.svg)](https://www.cloudimage.io/en/home#b38181a6-b9c8-4015-9742-7b1a1ad382d5)
[![Contributions welcome](https://img.shields.io/badge/contributions-welcome-orange.svg)](#contributing)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Scaleflex team](https://img.shields.io/badge/%3C%2F%3E%20with%20%E2%99%A5%20by-the%20Scaleflex%20team-6986fa.svg)](https://www.scaleflex.it/en/home)

<p align="center">
	<img
		height="175"
		alt="The Lounge"
		src="https://demo.cloudimg.io/height/350/n/https://scaleflex.airstore.io/filerobot/filerobot-cloudimage.png?sanitize=true">
</p>

<h1 align="center">
   JS Cloudimage Responsive | Cloudimage v6
</h1>

<p align="center">
	<strong>
		<a href="#table_of_contents">Docs</a>
		•
		<a href="https://scaleflex.github.io/js-cloudimage-responsive/" target="_blank">Demo</a>
		•
		<a href="https://codesandbox.io/s/6jkovjvkxz" target="_blank">Code Sandbox</a>
		•
		<a href="https://medium.com/@dmitry_82269/responsive-images-in-2019-now-easier-than-ever-b76e5a43c074" target="_blank">Why?</a>
	</strong>
</p>

This plugin detects the width of any image container as well as the device pixel ratio
density to load the optimal image size needed.
Images are resized on-the-fly via the <a href="https://cloudimage.io" target="_blank">Cloudimage service</a>, thus offering a comprehensive
automated image optimization service.

When an image is first loaded on your website or mobile app,
Cloudimage's resizing servers will download the origin image from
the source, resize it for the client's screen size and deliver to your users through one or multiple
Content Delivery Networks (CDNs). The generated image formats are cached in the CDN and will be delivered rocket fast on any subsequent request.

**NOTE:** Your original (master) images should be stored on a server
or storage bucket (S3, Google Cloud, Azure Blob...) reachable over
HTTP or HTTPS by Cloudimage. If you want to upload your master images to
Cloudimage, contact us at
[hello@cloudimage.io](mailto:hello@cloudimage.io).

<p align="center">
	<img
		alt="The Lounge"
		src="https://demo.cloudimg.io/width/1400/n/https://scaleflex.airstore.io/filerobot/cloudimage-process.jpg?sanitize=true">
</p>

powered by [Cloudimage](https://www.cloudimage.io/)
([Watch the video here](https://www.youtube.com/watch?time_continue=2&v=JFZSE1vYb0k))

## <a name="table_of_contents"></a> Table of contents

* [Demo](#demo)
* [Requirements](#requirements)
* [Step 1: Installation](#installation)
* [Step 2: Initialize](#initialize)
* [Step 3: Implement](#implement)
* [Configuration](#configuration)
* [Image properties](#image_properties)
* [Lazy loading](#lazy_loading)
* [Process dynamically loaded images](#dynamically-loaded)
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

## <a name="requirements"/> Requirements

To use the Cloudimage Responsive plugin, you will need a
Cloudimage token to deliver your images over CDN. Don't worry, it only takes seconds to get one by
registering [here](https://www.cloudimage.io/en/register_page).
Once your token is created, you can configure it as described below.
This token allows you to use 25GB of image cache and 25GB of worldwide
CDN traffic per month for free.

## <a name="installation"></a>Step 1: Installation

Add script tag with CDN link to js-cloudimage-responsive

```javascript
<script src="https://cdn.scaleflex.it/plugins/js-cloudimage-responsive/2.3.0/js-cloudimage-responsive.min.js"></script>
```

You may also use major version number instead of fixed version to have the latest version available.

```javascript
<script src="https://cdn.scaleflex.it/plugins/js-cloudimage-responsive/2/js-cloudimage-responsive.min.js"></script>
```

or using npm

```
$ npm install --save js-cloudimage-responsive
```

## <a name="initialize"></a>Step 2: Initialize

After adding the js-cloudimage-responsive lib, simply iniatialize it with your **token** and the **baseUrl** of your image storage:

```javascript
<script>
    const ciResponsive = new window.CIResponsive({
      token: 'demo',
      baseUrl: 'https://cloudimage.public.airstore.io/demo/' // optional
    });
</script>
```

or in new style with npm:

```javascript

import 'js-cloudimage-responsive';

const ciResponsive = new window.CIResponsive({
  token: 'demo',
  baseUrl: 'https://cloudimage.public.airstore.io/demo/' // optional
});
```

## <a name="implement"></a>Step 3: Implement in img tag or use it as background image

### img tag

Finally, just use the `ci-src` instead of the `src` attribute in image tag:

```html
<img ci-src="magnus-lindvall.jpg" ratio="1.5"/>
```

NOTE: "ratio" is recommended to prevent page layout jumping. The parameter is used to calculate image height to hold the image position while image is loading.

<a href="https://codesandbox.io/s/6jkovjvkxz"><img src="https://codesandbox.io/static/img/play-codesandbox.svg" alt="edeit in codesandbox"/></a>

### background image

Use the `ci-bg` instead of CSS background-image property `background-image: url(...)`:

```html
<div ci-bg="magnus-lindvall.jpg"></div>
```

<a href="https://codesandbox.io/s/js-cloudimage-responsive-background-imxdm"><img src="https://codesandbox.io/static/img/play-codesandbox.svg" alt="edeit in codesandbox"/></a>

## <a name="configuration"></a> Config

### token

###### Type: **String** | Default: **"demo"** | _required_

Your Cloudimage customer token.
[Subscribe](https://www.cloudimage.io/en/register_page) for a
Cloudimage account to get one. The subscription takes less than a
minute and is totally free.

### domain

###### Type: **String** | Default: **"cloudimg.io"**

Use your custom domain.

### baseUrl

###### Type: **String** | Default: **"/"** | _optional_

Your image folder on server, this alows to shorten your origin image URLs.

### <a name="lazy_loading_config"></a>lazyLoading

###### Type: **Bool** | Default: **false** | _optional_

Only images close to the client's viewport will be loaded, hence accelerating the page loading time. If set to **true**, an additional script must be included, see [Lazy loading](#lazy_loading)

### imgLoadingAnimation

###### Type: **Bool** | Default: **true** | _optional_

Applies a nice interlacing effect for preview transition

### filters

###### Type: **String** | Default: **'foil1'** | _optional_

Applies default Cloudimage filters to your image, e.g. fcontrast, fpixelate, fgaussian, backtransparent,
rotation...  Multiple filters can be applied, separated by "```.```" (dot).

[Full documentation here.](https://docs.cloudimage.io/go/cloudimage-documentation/en/filters/)


### placeholderBackground

###### Type: **String** | Default: **'#f4f4f4'** | _optional_

Placeholder colored background while the image is loading


### exactSize

###### Type: **Bool** | Default: **false** | _optional_

Forces to load exact size of images.
By default the plugin rounds container width to next possible value which can be divided by 100 without the remainder.
It’s done for cache reasons so that not all images are cached by 1px, but only 100px, 200px, 300px …

### presets

###### Type: **Object**

Default:

```javascript

<script>
const ciResponsive = new window.CIResponsive({
    token: 'demo',
    baseUrl: 'https://cloudimage.public.airstore.io/demo/',
    presets: {
	xs: '(max-width: 575px)', // up to 575    PHONE
	sm: '(min-width: 576px)', // 576 - 767    PHABLET
	md: '(min-width: 768px)', // 768 - 991    TABLET
	lg: '(min-width: 992px)', // 992 - 1199   SMALL_LAPTOP_SCREEN
	xl: '(min-width: 1200px)' // from 1200    USUALSCREEN
    }
});

ciResponsive.init();
</script>
```

Breakpoints shortcuts to use in image size property, can be overwridden.

## <a name="image_properties"></a> Image properties

Cloudimage responsive plugin will make image on your page responsive if you replace the `src` with `ci-src` attribute in the `<img>` tag:

### ci-src

###### Type: **String** | Default: **undefined** | _required_

Original image hosted on your web server. You can use absolute path or
relative to baseUrl in your config.

**NOTES:** 

The plugin uses a special algorithm to detect the width of image container and set the image size accordingly. This is the recommended way of using the Cloudimage Responsive plugin.

Images where `ci-src` is not used will be delivered in a standard, non-responsive way. 

### operation (or o) 

###### Type: **String** | Default: **width** | _optional_

Operation allows to customize the behaviour of the plugin for specific images:

**width** - to resize with a specific width. This is useful when you want to have a fixed width, regardless of screen size.

**height** - to resize with a specific height. This is useful when you want to have a fixed height, regardless of screen size.

**crop** - to crop the image around the center

**crop_px** - to crop an image with a non-centered focal point [doc](https://docs.cloudimage.io/go/cloudimage-documentation/en/operations/crop/positionable-crop)

[see example in Code Sandbox](https://codesandbox.io/s/l530w827lq)

**fit** - to resize the image in a box and keeping the proportions of the source image

**cover** - to resize the image in a box without keeping the proportions of the source image

**NOTES:** 

When you use an operation, you must specify the size for each screen size, see below

Full documentation of all operations available [here](https://docs.cloudimage.io/go/cloudimage-documentation/en/operations/)

### size (or s) 

###### Type: **String** | Default: **undefined** | _optional_ but _required_ when using operation

Size of an image which is used as a base for creating retina ready and responsive image element.

Examples (PR - stands for your device Pixel Ratio):

**[width]**: 

```jsx
<img
  operation="width"
  ci-src="dino-reichmuth-1.jpg"
  size="250"/>
```
=> width: 250 * PR (px); height: auto;

**[width x height]**: 

```jsx
<img
  operation="width"
  ci-src="dino-reichmuth-1.jpg"
  size="125x200"/>
```

=> width: 125 * PR (px); height: 200 * PR (px);

**[x1, y1, x2, y2, -final_size]**:

_final_size_ can be [width], [width x height], [x height]

```jsx
<img
  operation="crop_px"
  ci-src="dino-reichmuth-1.jpg"
  size="0,0,500,500-300x300"/>
```

=> will crop the top-left 500 x 500px square and resize to 300 x 300px;

[see example in Code Sandbox](https://codesandbox.io/s/l530w827lq)

**[preset breakpoint (xs,sm, md,lg,xl) or media query + ' ' + image size]**:

```jsx
<img
  operation="crop"
  ci-src="dino-reichmuth-1.jpg"
  size="
    sm 800x400,
    (min-width: 620px) 200x20,
    md 1000x1350,
    lg 1400x1200,
    xl 1600x1000
"/>
```

You can drop some breakpoints, for example:

```jsx
<img
  operation="crop"
  ci-src="dino-reichmuth-1.jpg"
  size="md 1000x1350, lg 1400x1200"/>
```

**NOTE:** if size is not set, the plugin uses a special algorithm to
detect the width of image container and set the image size accordingly. This is the recommended way of using the Cloudimage Responsive plugin.

For example:

```jsx
<img ci-src="dino-reichmuth-1.jpg"/>
```

### filters (or f)

###### Type: **String** | Default: **none** | _optional_

Filters allow you to modify the image's apperance and can be added on top of the resizing features above.

**fgrey** - apply a greyscale filter on the image

**fgaussian[0..10]** - apply a gaussian blur filter on the image

**fcontrast[-100..100]** - apply a contrast filter on the image

**fbright[0..255]** - apply a brightness filter on the image

**fpixelate[0..100]** - apply a pixelate filter on the image

**fradius[0..500]** - create a radius on the corners

Full documentation of all filters available [here](https://docs.cloudimage.io/go/cloudimage-documentation/en/filters/)

### ratio (or r)

###### Type: **Number** | _optional_

It is recommended to prevent page layout jumping. The parameter is used to calculate image height to hold the image position while image is loading.

To see the full cloudimage documentation [click here](https://docs.cloudimage.io/go/cloudimage-documentation)

## <a name="lazy_loading"></a> Lazy Loading

Lazy loading is not included into js-cloudimage-responsive by default. If you [enable lazy loading](#lazy_loading_config) in the configuration, you need to add an additional library.

The example below uses [lazysizes](https://github.com/aFarkas/lazysizes)
library using Intersection Observer API.

[Code Sandbox example](https://codesandbox.io/s/6jkovjvkxz)

add the following scripts right after js-cloudimage-responsive script

```javascript
<script>
  window.lazySizesConfig = window.lazySizesConfig || {};
  window.lazySizesConfig.init = false;
</script>
<script src="https://cdn.scaleflex.it/plugins/js-cloudimage-responsive/2/js-cloudimage-responsive.min.js"></script>
<script src="https://cdn.scaleflex.it/filerobot/js-cloudimage-responsive/lazysizes.min.js"></script>
```

the initialization script

```javascript
<script>
    const ciResponsive = new window.CIResponsive({
      token: 'demo',
      baseUrl: 'https://cloudimage.public.airstore.io/demo/', // optional
      lazyLoading: true                                       // optional
    });

    window.lazySizes.init();
</script>
 ```

## <a name="dynamically-loaded"></a>Process dynamically loaded images!

In case you load some images dynamically you need to trigger `ciResponsive.process()` manually.

```javascript
<script>
const ciResponsive = new window.CIResponsive({
   token: 'demo',
   baseUrl: 'https://cloudimage.public.airstore.io/demo/', // optional
   lazyLoading: true                                       // optional
});

window.lazySizes.init();

ciResponsive.process(); -> call when you need to process dynamically loaded images
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
* [JS Cloudimage 360 view](https://github.com/scaleflex/js-cloudimage-360-view)
* [Image Editor](https://github.com/scaleflex/filerobot-image-editor)
* [Uploader](https://github.com/scaleflex/filerobot-uploader)

## <a name="contributing"></a>Contributing!

All contributions are super welcome!


## <a name="license"></a>License
JS Cloudimage Responsive is provided under the [MIT License](https://opensource.org/licenses/MIT)

