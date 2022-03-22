[![Release](https://img.shields.io/badge/release-v4.8.5-blue.svg)](https://github.com/scaleflex/js-cloudimage-responsive/releases)
[![Free plan](https://img.shields.io/badge/price-includes%20free%20plan-green.svg)](https://www.cloudimage.io/en/home#b38181a6-b9c8-4015-9742-7b1a1ad382d5)
[![Contributions welcome](https://img.shields.io/badge/contributions-welcome-orange.svg)](#contributing)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Scaleflex team](https://img.shields.io/badge/%3C%2F%3E%20with%20%E2%99%A5%20by-the%20Scaleflex%20team-6986fa.svg)](https://www.scaleflex.com/en/home)

## VERSIONS

* [__Low Quality Preview__](https://github.com/scaleflex/js-cloudimage-responsive/blob/master/README.md)
* __Blur Hash__
* [__Plain (CSS free)__](https://github.com/scaleflex/js-cloudimage-responsive/blob/master/README-PLAIN.md)

<p align="center">
	<img
		height="175"
		alt="The Lounge"
		src="https://demo.cloudimg.io/height/350/n/https://scaleflex.airstore.io/filerobot/filerobot-cloudimage.png?sanitize=true">
</p>

<h1 align="center">
   JS Cloudimage Responsive | Cloudimage v7
</h1>

<h3 align="center">
   (blur-hash version)
</h3>

[Documentation for v2 | Cloudimage v6](https://github.com/scaleflex/js-cloudimage-responsive/blob/v7/README_v6.md)

<p align="center">
	<strong>
		<a href="#table_of_contents">Docs</a>
		•
		<a href="https://scaleflex.cloudimg.io/v7/plugins/js-cloudimage-responsive/demo/blur-hash/index.html?vh=1a9a51&func=proxy" target="_blank">Demo</a>
		•
		<a href="https://codesandbox.io/s/js-cloudimage-responsive-blur-hash-lopvu" target="_blank">Code Sandbox</a>
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
* [Step 4: Prevent seeing broken images](#prevent_styles)
* [Configuration](#configuration)
* [Image properties](#image_properties)
* [Lazy loading](#lazy_loading)
* [Process dynamically loaded images](#dynamically-loaded)
* [Examples & workarounds](#examples_workarounds)
* [Browser support](#browser_support)
* [Filerobot UI Family](#ui_family)
* [Contributing](#contributing)
* [License](#license)


## <a name="demo"></a> Demo

To see the Cloudimage Responsive plugin in action, please check out the
[Demo page](https://cdn.scaleflex.it/plugins/js-cloudimage-responsive/demo/blur-hash/index.html?v=28.04.2020_2).
Play with your browser's window size and observe your
Inspector's Network tab to see how Cloudimage delivers the optimal
image size to your browser, hence accelerating the overall page
loading time.

## <a name="requirements"/> Requirements

### Cloudimage account

To use the Cloudimage Responsive plugin, you will need a
Cloudimage token to deliver your images over CDN. Don't worry, it only takes seconds to get one by
registering [here](https://www.cloudimage.io/en/register_page).
Once your token is created, you can configure it as described below.
This token allows you to use 25GB of image cache and 25GB of worldwide
CDN traffic per month for free.

### Layout/CSS

In order to use smooth transition between preview image and good quality and size image, the plugin uses absolute positioning for images and wraps an image tag with div element with relative positioning. 

You have to pay attention on the following things:

- the plugin sets 100% width for img tag and position absolute (You should not apply other sizes or change position property. If you need to change width of image or position, you have to set it to wrapper)

## <a name="installation"></a>Step 1: Installation

Add script tag with CDN link to js-cloudimage-responsive

```javascript
<script src="https://cdn.scaleflex.it/plugins/js-cloudimage-responsive/4.8.5/blur-hash/js-cloudimage-responsive.min.js"></script>
```

or using npm

```
$ npm install --save js-cloudimage-responsive
```

## <a name="initialize"></a>Step 2: Initialize

After adding the js-cloudimage-responsive lib, simply iniatialize it with your **token** and the **baseURL** of your image storage:

```javascript
<script>
    const ciResponsive = new window.CIResponsive({
      token: 'demo',
      baseURL: 'https://cloudimage.public.airstore.io/demo/' // optional
    });
</script>
```

or in new style with npm:

```javascript

import 'js-cloudimage-responsive/blur-hash';

const ciResponsive = new window.CIResponsive({
  token: 'demo',
  baseURL: 'https://cloudimage.public.airstore.io/demo/' // optional
});
```

**NOTE**: You should put the scripts below all your content in the body tag and above all other scripts. After inserting the scripts the plugin starts immediately processing all images with ci-src, ci-bg-url attributes. (If the scripts are put into the head tag, no images will be detected and processed. If the scripts are put below all other scripts on your page, the images will be not showed until all the scripts downloaded.)

## <a name="implement"></a>Step 3: Implement in img tag or use it as background image

### img tag

Finally, just use the `ci-src` instead of the `src` attribute in image tag:

```html
<img ci-src="magnus-lindvall.jpg" ci-ratio="1.5" ci-blur-hash="LNAyTi9ZVsQ,.TM{WAkW4T%2WBt7"/>
```

NOTE:

"ci-ratio" is recommended to prevent page layout jumping. The parameter is used to calculate image height to hold the image position while image is loading.

"ci-blur-hash" is A very compact representation of a placeholder for an image. <a href="https://github.com/woltapp/blurhash">read more</a>

<a href="https://codesandbox.io/s/js-cloudimage-responsive-blur-hash-lopvu"><img src="https://codesandbox.io/static/img/play-codesandbox.svg" alt="edeit in codesandbox"/></a>

### background image

Use the `ci-bg-url` instead of CSS background-image property `background-image: url(...)`:

```html
<div ci-bg-url="magnus-lindvall.jpg"></div>
```

<a href="https://codesandbox.io/s/js-cloudimage-responsive-background-imxdm"><img src="https://codesandbox.io/static/img/play-codesandbox.svg" alt="edeit in codesandbox"/></a>

## <a name="prevent_styles"></a>Step 4: Prevent seeing broken images

Add the following styles in the head of your site

```html
<style>
  img[ci-src] {
    opacity: 0;
  }
</style>
```

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

### imgSelector

###### Type: **String** | Default: **"ci-src"**

Cloudimage Responsive Selector for images.

### bgSelector

###### Type: **String** | Default: **"ci-bg-url"**

Cloudimage Responsive Selector for background images.

### doNotReplaceURL

###### Type: **bool** | Default: **false**

If set to **true** the plugin will only add query params to the given source of image.

### baseURL

###### Type: **String** | _optional_

Your image folder on server, this alows to shorten your origin image URLs.

### apiVersion

###### Type: **String** |Default: **'v7'** | _optional_
Allow to use a specific version of API.

- set a specific version of API
```javascript
<script>
    const ciResponsive = new window.CIResponsive({
      token: 'demo',
      baseURL: 'https://cloudimage.public.airstore.io/demo/', // optional
      apiVersion: 'v7'                                       // optional
    });
</script>
```
- disable API version
```javascript
<script>
    const ciResponsive = new window.CIResponsive({
      token: 'demo',
      baseURL: 'https://cloudimage.public.airstore.io/demo/', // optional
      apiVersion: null                                       // optional
    });
</script>
```

### <a name="lazy_loading_config"></a>lazyLoading

###### Type: **Bool** | Default: **false** | _optional_

Only images close to the client's viewport will be loaded, hence accelerating the page loading time. If set to **true**, an additional script must be included, see [Lazy loading](#lazy_loading)

### params

###### Type: **String** | Default: **'org_if_sml=1'** | _optional_

Applies default Cloudimage operations/ filters to your image, e.g. brightness, contrast, rotation...
Multiple params can be applied, separated by "```&```" e.g. wat_scale=35&wat_gravity=northeast&wat_pad=10&grey=1

```javascript
{
 ...,
 params: 'org_if_sml=1'
}
```

#### alternative syntax: type: **Object**

```javascript
{
 ...,
 params: {
    org_if_sml: 1,
    grey: 1,
    ...
 }
}
```

[Full cloudimage v7 documentation here.](https://docs.cloudimage.io/go/cloudimage-documentation-v7/en/introduction)

### exactSize

###### Type: **Bool** | Default: **false** | _optional_

Forces to load exact size of images.
By default the plugin rounds container width to next possible value which can be divided by 100 without the remainder.
It’s done for cache reasons so that not all images are cached by 1px, but only 100px, 200px, 300px …

### limitFactor

###### Type: **Number** | Default: **100** | _optional_

Rounds up size of an image to nearest limitFactor value.

For example
* for an image with width **358px** and limitFactor equals **100** the plugin will round up to 400px
* for an image with width **358px** and limitFactor equals **5** the plugin will round up to 360px

### presets

###### Type: **Object**

Default:

```javascript
const cloudimageConfig = {
  token: 'demo',
  baseURL: 'https://jolipage.airstore.io/',
  ...
  presets: {
      xs: '(max-width: 575px)', // up to 575    PHONE
      sm: '(min-width: 576px)', // 576 - 767    PHABLET
      md: '(min-width: 768px)', // 768 - 991    TABLET
      lg: '(min-width: 992px)', // 992 - 1199   SMALL_LAPTOP_SCREEN
      xl: '(min-width: 1200px)' // from 1200    USUALSCREEN
  }
};
```

### devicePixelRatioList

###### Type: **[Number,...]** | Default: **[1, 1.5, 2]** | _optional_

List of supported device pixel ratios. If there is no need to support retina devices, you should set empty array `devicePixelRatioList: []`

### imageSizeAttributes

###### Type: **String** | possible values: 'use', 'ignore', 'take-ratio' | Default: **'use'** 

If width and height attributes are set:

**use** - width & height attributes values will be used to calculate image size (according to user's DPR) and **ratio**. 

**take-ratio** - width & height attributes values will be used only to calculate **ratio**.

**ignore** - width & height attributes will be ignored.

If width and height attributes are NOT set, image container size will be detected to calculate result image size (according to user's DPR)

*Note*: If only width or height attributes is set, ratio is going to be taken from ci-ratio image attribute


## <a name="image_properties"></a> Image properties

Cloudimage responsive plugin will make image on your page responsive if you replace the `src` with `ci-src` attribute in the `<img>` tag:

### ci-src

###### Type: **String** | Default: **undefined** | _required_

Original image hosted on your web server. You can use absolute path or
relative to baseURL in your config.

**NOTES:** 
* The plugin uses a special algorithm to detect the width of image container and set the image size accordingly. This is the recommended way of using the Cloudimage Responsive plugin.
* Images where `ci-src` is not used will be delivered in a standard, non-responsive way.
* Parameters after "?" question mark will be added at the end of result URL after processing by the plugin.

### width

###### Type: **String** (e.g. 300px, 20vw) | Default: **undefined**

If it's set the plugin will use width as fixed value and change only according device pixel ratio.

### height

###### Type: **String** (e.g. 300px, 20vh) | Default: **undefined**

If it's set the plugin will use height as fixed value and change only according device pixel ratio.

### ci-blur-hash

###### Type: **String** | Default: **undefined** | _required_

BlurHash is a very compact representation of a placeholder for an image. <a href="https://github.com/woltapp/blurhash">read more</a>

```javascript
ci-blur-hash="LNAyTi9ZVsQ,.TM{WAkW4T%2WBt7"
```
### ci-params

###### Type: **String** | Default: **undefined** | _optional_

You can apply any Cloudimage operations/ filters to your image, e.g. brightness, contrast, rotation...
Multiple params can be applied, separated by "```&```" e.g. **wat_scale=35&wat_gravity=northeast&wat_pad=10&grey=1**

```javascript
ci-params="gray=1&bright=10"
```

#### alternative syntax: type: **Object**

```javascript
ci-params="{
    bright: 10,
    grey: 1,
    ...
}"
```

[Full cloudimage v7 documentation here.](https://docs.cloudimage.io/go/cloudimage-documentation-v7/en/introduction)

### ci-sizes

###### Type: **Object** | Default: **undefined**

**{ preset breakpoint | 'media query': imageProps }**:

preset breakpoints: **xs, sm, md, lg, xl** ([can be changed with](#presets))
imageProps: **{ w, h, r, src }** where 

* **w** - width, 
* **h** - height, 
* **r** - ratio, 
* **src** - original image hosted on your web server. You can use absolute path or relative to the baseURL in your config.

```jsx
<img
  ci-src="dino-reichmuth-1.jpg"
  ci-sizes="{
     '(max-width: 575px)': { w: 400, h: 150 },
     '(min-width): 576px)': { src: 'dino-reichmuth-square.jpg', r: 1 },
     '(min-width: 620px)': { h: 560 },
     '(min-width: 768px)': { w: '50vw' },
     lg: { w: '55vw', h: 300 },
     xl: { w: 1200 }
 }"/>
```

You can drop some breakpoints, for example:

```jsx
<img
  ci-src="dino-reichmuth-1.jpg"
  ci-sizes="{
      sm: { w: 400, h: 200 },
      '(min-width: 620px)': { w: 200, h: 60 }
 }"/>
```

##### new experimental syntax

md: { w: '40vw', h: 350 } or md: { w: 250, h: '20vh' }

adds possibility to use fixed height or width and change dynamically other dimension

**NOTE:** if size is not set, the plugin uses a special algorithm to
detect the width of image container and set the image size accordingly. This is the recommended way of using the Cloudimage Responsive plugin.

### ci-ratio (or data-ci-ratio)

###### Type: **Number** | _optional_

It is recommended to prevent page layout jumping. The parameter is used to calculate image height to hold the image position while image is loading.

To see the full cloudimage documentation [click here](https://docs.cloudimage.io/go/cloudimage-documentation)

### ci-not-lazy (or data-ci-not-lazy)

###### Type: **Bool**

Switch off lazyload per image.

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
<script src="https://cdn.scaleflex.it/plugins/js-cloudimage-responsive/4.8.5/blur-hash/js-cloudimage-responsive.min.js"></script>
<script src="https://cdn.scaleflex.it/filerobot/js-cloudimage-responsive/lazysizes.min.js"></script>
```

the initialization script

```javascript
<script>
    const ciResponsive = new window.CIResponsive({
      token: 'demo',
      baseURL: 'https://cloudimage.public.airstore.io/demo/', // optional
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
   baseURL: 'https://cloudimage.public.airstore.io/demo/', // optional
   lazyLoading: true                                       // optional
});

window.lazySizes.init();

ciResponsive.process(); -> call when you need to process dynamically loaded images
</script>
```

## <a name="examples_workarounds"></a> Examples & workarounds
* [See all](https://github.com/scaleflex/js-cloudimage-responsive/blob/master/examples/EXAMPLES.md)
* [Cropping](https://github.com/scaleflex/js-cloudimage-responsive/blob/master/examples/EXAMPLES.md#cropping)


## <a name="browser_support"></a> Browser support

Tested in all modern browsers and IE 11,10,9.

If you want to address the use case where your visitors disable JS. You have to add noscript tag.

```html
<noscript><img src="path-to-original-image"/></noscript>
```

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

