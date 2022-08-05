[![Release](https://img.shields.io/github/v/release/scaleflex/js-cloudimage-responsive)](https://github.com/scaleflex/js-cloudimage-responsive/releases)
[![Free plan](https://img.shields.io/badge/price-includes%20free%20plan-green.svg)](https://www.cloudimage.io/en/home#b38181a6-b9c8-4015-9742-7b1a1ad382d5)
[![Contributions welcome](https://img.shields.io/badge/contributions-welcome-orange.svg)](#contributing)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Scaleflex team](https://img.shields.io/badge/%3C%2F%3E%20with%20%E2%99%A5%20by-the%20Scaleflex%20team-6986fa.svg)](https://www.scaleflex.com/en/home)
[![Cloudimage](https://img.shields.io/badge/Powered%20by-cloudimage-blue)](https://www.cloudimage.io/en/home)
## VERSIONS

* __Low Quality Preview__
* [__Blur Hash__](https://github.com/scaleflex/js-cloudimage-responsive/blob/master/README-BLUR-HASH.md)
* [__Plain (CSS free)__](https://github.com/scaleflex/js-cloudimage-responsive/blob/master/README-PLAIN.md)

<p align="center">
<a href="https://www.cloudimage.io/#gh-light-mode-only">
		<img
			alt="cloudimage logo"
			src="https://scaleflex.cloudimg.io/v7/cloudimage.io/LOGO+WITH+SCALEFLEX-01.png?vh=f6080d&w=350">
	</a>
		<a href="https://www.cloudimage.io/#gh-dark-mode-only">
		<img
			alt="cloudimage logo"
			src="https://scaleflex.cloudimg.io/v7/cloudimage.io/cloudimage-logo-light.png?vh=b798ab&w=350">
	</a>
</p>

<h1 align="center">
   JS Cloudimage Responsive | Cloudimage v7
</h1>

<h3 align="center">
   (low quality image placeholder)
</h3>

<p align="center">
	<strong>
		<a href="#table_of_contents">Docs</a>
		•
    <a href="https://github.com/scaleflex/js-cloudimage-responsive/blob/v7/README_v6.md" target="_blank">Documentation for v2 | Cloudimage v6</a>
    •
		<a href="https://scaleflex.github.io/js-cloudimage-responsive/" target="_blank">Demo</a>
		•
		<a href="https://codesandbox.io/s/js-cloudimage-responsive-example-2kkbz4" target="_blank">Code Sandbox</a>
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

**NOTE:** Your original (master) images have to be stored on a server
or storage bucket (S3, Google Cloud, Azure Blob...) reachable over
HTTP or HTTPS by Cloudimage. If you want to store your master images with us,
you can check our all-in-one Digital Asset Management solution
[Filerobot](https://www.filerobot.com/).

<p align="center">
	<img
		alt="The Lounge"
		src="https://cdn.scaleflex.it/filerobot/cloudimage-process.jpg">
</p>

## <a name="table_of_contents"></a> Table of contents

* [Demo](#demo)
* [Responsive plugins family](#plugin_family)
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

## <a name="plugin_family"></a> Responsive plugins family
In order to use Cloudimage responsive plugins on your single-page application, please check out Cloudimage responsive plugins for the most popular Javascript frameworks.

<details>
<summary>React</summary>
<a href="https://github.com/scaleflex/react-cloudimage-responsive">React Cloudimage Responsive (Low Quality Preview)</a><br/>
<a href="https://github.com/scaleflex/react-cloudimage-responsive-blur-hash">React Cloudimage Responsive (Blur-hash)</a><br/>
<a href="https://github.com/scaleflex/react-cloudimage-responsive-plain">React Cloudimage Responsive (Plain)</a>
</details>

<details>
<summary>Vue.js</summary>
<a href="https://github.com/scaleflex/vue-cloudimage-responsive">Vue Cloudimage Responsive (Low Quality Preview)</a><br/>
<a href="https://github.com/scaleflex/vue-cloudimage-responsive-blur-hash">Vue Cloudimage Responsive (Blur-hash)</a><br/>
<a href="https://github.com/scaleflex/vue-cloudimage-responsive-plain">Vue Cloudimage Responsive (Plain)</a>
</details>

<details>
<summary>Angular</summary>
<a href="https://github.com/scaleflex/ng-cloudimage-responsive">Angular Cloudimage Responsive (Low Quality Preview)</a><br/>
</details>

## <a name="requirements"/> Requirements

### Cloudimage account

To use the Cloudimage Responsive plugin, you will need a
Cloudimage token to deliver your images over CDN. Don't worry, it only takes seconds to get one by
registering [here](https://www.cloudimage.io/en/register_page).
Once your token is created, you can configure it as described below.
This token allows you to use 25GB of image cache and 25GB of worldwide
CDN traffic per month for free.

### Layout/CSS

In order to use smooth transition between preview image and good quality and size image, the plugin uses absolute positioning for images and wraps an image tag with a div element with relative positioning. 

You have to pay attention to the following things:

- the plugin sets 100% width for the img tag and position:absolute (You should not apply other sizes or change position property. If you need to change the width of an image or its position, you have to set it to the wrapper element)

## <a name="installation"></a>Step 1: Installation

Add a style tag with CDN link to js-cloudimage-responsive in the head of your site

```javascript
<link rel="stylesheet" href="https://cdn.scaleflex.it/plugins/js-cloudimage-responsive/latest/js-cloudimage-responsive.min.css?vh=a076ef&func=proxy"></link>
```

Add a script tag with CDN link to js-cloudimage-responsive

```javascript
<script src="https://cdn.scaleflex.it/plugins/js-cloudimage-responsive/latest/js-cloudimage-responsive.min.js"></script>
```

or using npm

```
$ npm install --save js-cloudimage-responsive
```

## <a name="initialize"></a>Step 2: Initialize

After adding the js-cloudimage-responsive library, simply iniatialise it with your **token** and the **baseURL** of your image storage:

```javascript
<script>
    const ciResponsive = new window.CIResponsive({
      token: 'demo',
      baseURL: 'https://cdn.scaleflex.it/demo/' // optional
    });
</script>
```

or in new style with npm:

```javascript

import 'js-cloudimage-responsive';

const ciResponsive = new window.CIResponsive({
  token: 'demo',
  baseURL: 'https://cdn.scaleflex.it/demo/' // optional
});
```

**NOTE**: You should put the scripts below all your content in the body tag and above all other scripts. After inserting the scripts, the plugin immediately starts processing all images with ci-src and ci-bg-url attributes. (If the scripts are put into the head tag, no images will be detected and processed. If the scripts are put below all other scripts on your page, the images will be not showed until all the scripts are downloaded.)

## <a name="implement"></a>Step 3: Implement in an img tag or use it as a background image

### img tag

Finally, just use `ci-src` instead of the `src` attribute in image tag:

```html
<img ci-src="magnus-lindvall.jpg" ci-ratio="1.5"/>
```

NOTE: setting "ci-ratio" is recommended to prevent page layout jumping. The parameter is used to calculate the image height to hold the image position while the image is loading.

<a href="https://codesandbox.io/s/js-cloudimage-responsive-example-05jw0k?file=/index.html"><img src="https://codesandbox.io/static/img/play-codesandbox.svg" alt="edit in codesandbox"/></a>

### background image

Use `ci-bg-url` instead of the CSS background-image property `background-image: url(...)`:

```html
<div ci-bg-url="magnus-lindvall.jpg"></div>
```

<a href="https://codesandbox.io/s/js-cloudimage-responsive-example-8mk13l"><img src="https://codesandbox.io/static/img/play-codesandbox.svg" alt="edit in codesandbox"/></a>

## <a name="configuration"></a> Configuration

### token

###### Type: **String** | Default: **"demo"** | _required_

Your Cloudimage customer token.
[Subscribe](https://www.cloudimage.io/en/register_page) for a
Cloudimage account to get one. The subscription takes less than a
minute and is totally free.

### domain

###### Type: **String** | Default: **"cloudimg.io"**

Use your custom domain.

### customDomain

###### Type: **boolean** | Default: **false** | _optional_

If you use a custom CNAME for your cloudimage integration, set it to true.

Note: this will disregard your token above as this should be built into the CNAME entry.


### imgSelector

###### Type: **String** | Default: **"ci-src"**

Cloudimage Responsive Selector for images.

### bgSelector

###### Type: **String** | Default: **"ci-bg-url"**

Cloudimage Responsive Selector for background images.

### doNotReplaceURL

###### Type: **bool** | Default: **false**

If set to **true**, the plugin will only add query parameters to the provided image source URL.

### baseURL

###### Type: **String** | _optional_

Your image folder on server; this alows to shorten your origin image URLs.

### apiVersion

###### Type: **String** |Default: **'v7'** | _optional_
Allow to use a specific version of API.

- set a specific version of API
```javascript
<script>
    const ciResponsive = new window.CIResponsive({
      token: 'demo',
      baseURL: 'https://cdn.scaleflex.it/demo/', // optional
      apiVersion: 'v7'                                       // optional
    });
</script>
```
- disable API version
```javascript
<script>
    const ciResponsive = new window.CIResponsive({
      token: 'demo',
      baseURL: 'https://cdn.scaleflex.it/demo/', // optional
      apiVersion: null                                       // optional
    });
</script>
```


### <a name="lazy_loading_config"></a>lazyLoading

###### Type: **Bool** | Default: **false** | _optional_

Only images close to the client's viewport will be loaded, hence accelerating the page loading time. If set to **true**, an additional script must be included, see [Lazy loading](#lazy_loading)

### params

###### Type: **String** | Default: **'org_if_sml=1'** | _optional_

Applies default Cloudimage operations/filters to your image like brightness, contrast, rotation, etc.
Multiple params can be applied, separated by "```&```" e.g. wat_scale=35&wat_gravity=northeast&wat_pad=10&grey=1

```javascript
{
 ...,
 params: 'org_if_sml=1'
}
```

#### alternative syntax 

###### Type: **Object**

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


### placeholderBackground

###### Type: **String** | Default: **'#f4f4f4'** | _optional_

Placeholder coloured background while the image is loading


### exactSize

###### Type: **Bool** | Default: **false** | _optional_

Forces to load exact size of images.
By default, the plugin rounds the container width to next possible value which can be divided by 100 without the remainder.
This is done for caching reasons so that not all images are cached by 1px, but only 100px, 200px, 300px...

### limitFactor

###### Type: **Number** | Default: **100** | _optional_

Rounds up the size of the image to the nearest limitFactor value.

For example:
* for an image with width **358px** and limitFactor equal to **100**, the plugin will round up to 400px;
* for an image with width **358px** and limitFactor equal to **5**, the plugin will round up to 360px.


### devicePixelRatioList

###### Type: **[Number,...]** | Default: **[1, 1.5, 2]** | _optional_

List of supported device pixel ratios. If there is no need to support retina devices, you should set empty array `devicePixelRatioList: []`


### lowQualityPreview

###### Type: **Object**

* `lowQualityPreview.minImgWidth` number (default: 400) - minimal width of an image to load a low-quality preview image

Example:

```javascript
lowQualityPreview: {
  minImgWidth = 400
}
```

### <a name="presets"></a> presets

###### Type: **Object**

Default:

```javascript
{
    ...,
    presets: {
	xs: '(max-width: 575px)', // up to 575    PHONE
	sm: '(min-width: 576px)', // 576 - 767    PHABLET
	md: '(min-width: 768px)', // 768 - 991    TABLET
	lg: '(min-width: 992px)', // 992 - 1199   SMALL_LAPTOP_SCREEN
	xl: '(min-width: 1200px)' // from 1200    USUALSCREEN
    }
}
```

Breakpoints shortcuts to use in image size property, can be overridden.

### imageSizeAttributes

###### Type: **String** | possible values: 'use', 'ignore', 'take-ratio' | Default: **'use'** 

If width and height attributes are set:

**use** - width & height attributes values will be used to calculate image size (according to user's DPR) and **ratio**. 

**take-ratio** - width & height attributes values will be used only to calculate **ratio**.

**ignore** - width & height attributes will be ignored.

If width and height attributes are NOT set, image container size will be detected to calculate result image size (according to user's DPR)

*Note*: If only width or height attributes is set, ratio is going to be taken from ci-ratio image attribute

## <a name="image_properties"></a> Image properties

The Cloudimage responsive plugin will make an image on your page responsive if you replace the `src` with a `ci-src` attribute in the `<img>` tag:

### ci-src

###### Type: **String** | Default: **undefined** | _required_

Original image hosted on your web server. You can use absolute path or
relative to the baseURL in your config.

**NOTES:**
* The plugin uses a special algorithm to detect the width of the image container and set the image size accordingly. This is the recommended way of using the Cloudimage Responsive plugin.
* Images where `ci-src` is not used will be delivered in a standard, non-responsive way.
* Parameters after "?" question mark will be added at the end of result URL after processing by the plugin.

### width

###### Type: **String** (e.g. 300px, 20vw) | Default: **undefined**

If it's set, the plugin will use width as a fixed value and change only according device pixel ratio.

### height

###### Type: **String** (e.g. 300px, 20vh) | Default: **undefined**

If it's set, the plugin will use height as fixed value and change only according device pixel ratio.

### ci-params

###### Type: **String** | Default: **undefined** | _optional_

You can apply any Cloudimage operations/filters to your image, e.g. brightness, contrast, rotation...
Multiple parameters can be applied, separated by "```&```" e.g. **wat_scale=35&wat_gravity=northeast&wat_pad=10&grey=1**

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

adds a possibility to use fixed height or width and change the other dimension dynamically

**NOTE:** if size is not set, the plugin uses a special algorithm to
detect the width of image container and set the image size accordingly. This is the recommended way of using the Cloudimage Responsive plugin.

### ci-ratio (or data-ci-ratio)

###### Type: **Number** | _optional_

It is recommended to set this parameter to prevent page layout jumping. It is used to calculate the image height to hold the image position while the image is loading.

To see the full Cloudimage documentation, [click here](https://docs.cloudimage.io/go/cloudimage-documentation).

### ci-do-not-replace-url (or data-ci-do-not-replace-url)

###### Type: **Boolean** | Default: **false** | _optional_

If set to true, the plugin will only add query parameters to the provided image source URL.

<a href="https://codesandbox.io/s/js-cloudimage-responsive-wflh27"><img src="https://codesandbox.io/static/img/play-codesandbox.svg" alt="edit in codesandbox"/></a>

### ci-not-lazy (or data-ci-not-lazy)

###### Type: **Bool**

Switch off lazy loading on a per-image basis.

## <a name="lazy_loading"></a> Lazy Loading

Lazy loading is not included into js-cloudimage-responsive by default. If you [enable lazy loading](#lazy_loading_config) in the configuration, you need to add an additional library.

The example below uses the [lazysizes](https://github.com/aFarkas/lazysizes)
library using Intersection Observer API.

[Code Sandbox example](https://codesandbox.io/s/js-cloudimage-responsive-example-2kkbz4)

add the following scripts right after js-cloudimage-responsive script

```javascript
<script>
  window.lazySizesConfig = window.lazySizesConfig || {};
  window.lazySizesConfig.init = false;
</script>
<script src="https://cdn.scaleflex.it/plugins/js-cloudimage-responsive/latest/js-cloudimage-responsive.min.js"></script>
<script src="https://cdn.scaleflex.it/filerobot/js-cloudimage-responsive/lazysizes.min.js"></script>
```

the initialization script

```javascript
<script>
    const ciResponsive = new window.CIResponsive({
      token: 'demo',
      baseURL: 'https://cdn.scaleflex.it/demo/', // optional
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
   baseURL: 'https://cdn.scaleflex.it/demo/', // optional
   lazyLoading: true                                       // optional
});

window.lazySizes.init();

ciResponsive.process(); // -> call when you need to process dynamically loaded images
</script>
```

The process function accepts a second argument. It expects an [HTML Element](https://developer.mozilla.org/fr/docs/Web/API/HTMLElement), if provided it will be used as the root for the images lookup.

## <a name="browser_support"></a> Browser support

Tested in all modern browsers and IE 11,10,9.

If you want to address the use case where your visitors disable JS, You have to add a noscript tag:

```html
<noscript><img src="path-to-original-image"/></noscript>
```

NOTE: If you use lazy loading with IntersectionObserver, you must
manually add the [IntersectionObserver polyfill](https://github.com/w3c/IntersectionObserver/tree/master/polyfill)
for cross-browser support.

## <a name="ui_family"></a>Filerobot UI Familiy
* [Cloudimage Responsive](https://github.com/scaleflex/js-cloudimage-responsive)
* [JS Cloudimage 360 view](https://github.com/scaleflex/js-cloudimage-360-view)
* [Image Editor](https://github.com/scaleflex/filerobot-image-editor)
* [Filerobot Media Asset Widget](https://scaleflex.cloudimg.io/v7/plugins/filerobot-widget/demo/index.html?vh=d6c246&func=proxy)

## <a name="contributing"></a>Contributing!

All contributions are super welcome!


## <a name="license"></a>License
JS Cloudimage Responsive is provided under the [MIT License](https://opensource.org/licenses/MIT).

