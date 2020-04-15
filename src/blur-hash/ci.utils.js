import { addClass, getWrapper, setWrapperAlignment } from '../common/ci.utils'
import { decode } from './blurHash';


export const loadBackgroundImage = (event) => {
  const bgContainer = event.target;
  const bg = bgContainer.getAttribute('data-bg');
  const ciBlurHash = bgContainer.getAttribute('ci-blur-hash');

  if (bg) {
    let optimizedImage = new Image();

    optimizedImage.onload = () => {
      const bgCanvas = bgContainer.querySelector('canvas');

      finishAnimation(bgContainer, ciBlurHash && bgCanvas);
      bgContainer.removeAttribute('data-bg');
      bgContainer.removeAttribute('ci-preview');
    }

    optimizedImage.src = bg;

    bgContainer.style.backgroundImage = 'url(' + bg + ')';
  }
};

export const applyOrUpdateWrapper = props => {
  const { isUpdate, imgNode, ratio, imageNodeWidth, imageNodeHeight, alignment, preserveSize, placeholderBackground } = props;
  let wrapper;

  if (!isUpdate) {
    wrapper = wrapImage({ imgNode, ratio, imageNodeWidth, imageNodeHeight, alignment, preserveSize, placeholderBackground });
  } else {
    wrapper = getWrapper(imgNode);

    // TODO: remove in next release
    // if (ratio) {
    //   wrapper.style.paddingBottom = preserveSize ? 'none' : (100 / ratio) + '%';
    // }
  }

  return wrapper;
}

export const wrapImage = (props) => {
  const { imgNode, ratio, imageNodeWidth, imageNodeHeight, alignment, preserveSize, placeholderBackground } = props;
  let { wrapper } = props;

  wrapper = wrapper || document.createElement('div');

  addClass(wrapper, 'ci-image-wrapper');
  wrapper.style.background = placeholderBackground;
  wrapper.style.display = 'block';
  wrapper.style.width = preserveSize ? imageNodeWidth : '100%';
  wrapper.style.height = preserveSize ? imageNodeHeight : 'auto';
  wrapper.style.overflow = 'hidden';
  wrapper.style.position = 'relative';

  if (ratio) {
    wrapper.style.paddingBottom = preserveSize ? 'none' : (100 / ratio) + '%';
  }

  if (imgNode.nextSibling) {
    imgNode.parentNode.insertBefore(wrapper, imgNode.nextSibling);
  } else {
    imgNode.parentNode.appendChild(wrapper);
  }

  setWrapperAlignment(wrapper, alignment);

  wrapper.appendChild(imgNode);

  return wrapper;
};

export const finishAnimation = (image, canvas) => {
  if (canvas && canvas.style) {
    canvas.style.opacity = '0';
  }

  addClass(image, 'ci-image-loaded');
};

export const initImageBackgroundClasses = (image, lazy) => {
  addClass(image, 'ci-bg');

  if (lazy) {
    addClass(image, 'lazyload');
  }
};

export const initImageBackgroundStyles = (image) => {
  image.style.position = (!image.style.position || image.style.position === 'static') ?
    'relative' : image.style.position;
};

export const initImageClasses = (imgNode, lazy) => {
  addClass(imgNode, 'ci-image');

  if (lazy) {
    addClass(imgNode, 'lazyload');
  }
};

export const initImageStyles = imgNode => {
  imgNode.style.display = 'block';
  imgNode.style.width = '100%';
  imgNode.style.padding = '0';
  imgNode.style.position = 'absolute';
  imgNode.style.top = '0';
  imgNode.style.left = '0';
  imgNode.style.height = 'auto';
  imgNode.style.opacity = 1;
};

export const applyOrUpdateBlurHashCanvas = (wrapper, blurHash) => {
  let canvas = wrapper.querySelector('canvas');

  if (!canvas && blurHash) {
    canvas = document.createElement("canvas");

    const pixels = decode(blurHash, 32, 32);
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext("2d");
    const imageData = ctx.getImageData(0, 0, 32, 32);
    imageData.data.set(pixels);
    ctx.putImageData(imageData, 0, 0);
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.bottom = '0';
    canvas.style.left = '0';
    canvas.style.right = '0';
    canvas.style.opacity = '1';
    canvas.style.zIndex = '1';
    canvas.style.transition = 'opacity 400ms ease 0ms';

    wrapper.prepend(canvas);
  }

  return canvas;
};

export const onImageLoad = ({ wrapper, imgNode, canvas, preserveSize, ratio, isAdaptive }) => {
  wrapper.style.background = 'transparent';

  if (!ratio || isAdaptive) {
    wrapper.style.paddingBottom = preserveSize ? 'none' : (100 / ((imgNode.width / imgNode.height) || 1)) + '%';
  }

  finishAnimation(imgNode, canvas)
};