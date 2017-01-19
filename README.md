<cloud**image**.io>


**This documentation is for imgResponsive.js version `1.2`**




_imgResponsive.js_ is an Open Source Javascript library developed by [<cloud**image**.io/>](https://cloudimage.io), allowing developers to easily generate responsive and resized images using the `picture` element and `srcset` attribute in HTLM5. To make your images responsive, define the target size of your different images and let _imgResponsive.js_ and [cloudimage.io](https://cloudimage.io) do the magic. In addition, all images will be cached on a global Content Delivery Network allowing your images to be delivered at the speed of light to your users.

* [Overview / Resources](#overview-and-resources)
* [Installation](#installation)
* [Setup](#setup)
* [Usage](#usage)
* [Browser Support](#browser-support)
* [Meta](#meta)


<a name="overview-and-resources"></a>
## Overview / Resources

Before you get started, we highly recommend that you read the Mozila developer Network article on [Responsive images](https://developer.mozilla.org/en-US/Learn/HTML/Multimedia_and_embedding/Responsive_images). It will help you understand how the Javascript library works and what is injected in the DOM of your page.

<a name="installation"></a>
## Installation

Copy and paste _imgResponsive.js_  in a folder of your web server and include following lines in your header.
 
	<script src="{PATH}/imgResponsive.js"></script>

_NOTE_: Adapt {PATH} to your folder structure.

At the end of your DOM, before the `<\body>` item add the following lines:
	<script>
	jScaler.config.TOKEN = 'YOUR_TOKEN';
	jScaler.config.BASE_URL= 'PATH-TO-LOCAL-FOLDER-IMAGES';
	</script>



<a name="setup"></a>
## Setup

Follow the steps outlined below by editing _imgResponsive.js_:

	
1. The library comes with a set of pre-defined screen resolutions thresholds which cover most of the devices out there. Devices will select the next larger width resolution available. Feel free to adapt these values if you need higher granularity but we do not advise having more than 10 screen widths. 
	
		var PHONE = 668;
		var PHABLET = 720;
		var TABLET = 940;
		var SMALL_LAPTOP_SCREEN = 1140;
		var USUALSCREEN = 1367;
		var MAXSCREEN = 1920;
		//YOUR_CUSTOM_SCREEN_1 = W1;
		
	Note: If the screen width is larger than 1920 pixels, the origin image will be displayed.

2. Set `imgWidth` and `imgHeight` inside the `default_vector`. These represent the default image **width** and **height** applied in case no CSS class names match or there is no class name inside the the `<img>` tags.

		var vector_default = 
					[{"screenWidth": YOUR_CUSTOM_SCREEN_1, "imgWidth": 0, "imgHeight": 0},
					{"screenWidth": PHONE, "imgWidth": 0, "imgHeight": 0},
                    {"screenWidth": PHABLET, "imgWidth": 0, "imgHeight": 0},
                    {"screenWidth": TABLET, "imgWidth": 0, "imgHeight": 0)},
                    {"screenWidth": SMALL_LAPTOP_SCREEN, "imgWidth": 0, "imgHeight": 0},
                    {"screenWidth": USUALSCREEN, "imgWidth":0, "imgHeight": 0},
                    {"screenWidth": MAXSCREEN, "imgWidth": 0, "imgHeight": 0}];
                    
      _Note_: if you use the Cloudimage **width** width transformation you only need to set `imgWidth`. 

3. `vector_classname` allows you to define different image formats in case you need multiple images sizes (thumbnail1, thumbnail2, large, ...) across your web site or web application. You can define as many `vector_classname` as you have different image sizes. See example in _imgResponsive.js_

4. Add all `vector_classname` to the array `config` by referencing the `VECTOR` , the `OPERATION` for this class as well as it's `PARAMETERS`:

		var config = [{
		    "CLASSNAME": "thumbnail", "VECTOR": vector_thumbnail, "OPERATION":"crop", "PARAMETER": "n"
		},{
		    "CLASSNAME": "", "VECTOR": vector_default,"OPERATION": DEFAULT_OPERATION,"PARAMETER": "n"
		}];

5. _(Optional) BUT HIGHLY RECOMANDED_ Make your website load even faster!
As the DOM is interpreted before the _imgResponsive.js_ JavaScript library, small parts of the origin images are loaded before the `<picture>` tags are injected in the code. This results in a performance hit which you can address by finding and replacing all `src` with `data-src` attributes withing the `<img>` tags of your page.

####Congratulations! 

By carefully following these 5 steps, you made your images become responsive and delivered via a superfast CDN!

<a name="usage"></a>
## Usage

If you want _imgResponsive.js_ to ignore some of your images and not process them, simply add the class `cloudimg_ignore` to the `<img>` tag.


<a name="browser-support"></a>
## Browser Support

* By default, browsers that don't support [`srcset`](http://caniuse.com/#feat=srcset) or [`picture`](http://caniuse.com/#feat=picture) will gracefully fall back to the default `img` `src`. 
* If you have implemented `data-src` browers need to support JavaScript

<a name="meta"></a>
## Meta
Cloudimage JavaScript imgResponsive.js was made by [cloudimage.io](https://cloudimage.io) and is availalbe

## Licence

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
