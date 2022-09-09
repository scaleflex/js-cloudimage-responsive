import { ATTRIBUTES, CLASSNAMES } from '../common/ci.constants';
import { addClass, getWrapper } from '../common/ci.utils';


const wrapAll = (wrapper, elms) => {
  const el = elms.length ? elms[0] : elms;
  const parent = el.parentNode;
  const sibling = el.nextSibling;

  wrapper.appendChild(el);

  while (elms.length) {
    wrapper.appendChild(elms[0]);
  }

  if (sibling) {
    parent.insertBefore(wrapper, sibling);
  } else {
    parent.appendChild(wrapper);
  }
};

export const wrapBackgroundContainer = (imgNode) => {
  const previewBox = document.createElement('div');
  const contentBox = document.createElement('div');

  if (imgNode.children && imgNode.children.length > 0) {
    wrapAll(contentBox, imgNode.children);
  }

  imgNode.prepend(previewBox);

  return [previewBox, contentBox];
};

export const applyBackgroundStyles = ({
  imgNode, previewBox, contentBox, lazy, width,
}) => {
  imgNode.style.position = 'relative';

  contentBox.style.position = 'relative';
  contentBox.setAttribute(ATTRIBUTES.BG_CONTAINER, true);

  previewBox.className = `${imgNode.className}${lazy ? ' lazyload' : ''}`;
  previewBox.setAttribute(CLASSNAMES.PREVIEW, true);
  previewBox.style.background = 'inherit';
  previewBox.style.position = 'absolute';
  previewBox.style.left = '0';
  previewBox.style.top = '0';
  previewBox.style.width = '100%';
  previewBox.style.height = '100%';

  imgNode.style.transform = 'translateZ(0)';
  imgNode.style.overflow = 'hidden';

  previewBox.style.transform = 'scale(1.1)';
  previewBox.style.filter = `blur(${Math.floor(width / 100)}px)`;
  previewBox.style.transition = 'opacity 400ms ease 0ms';
};

export const setAnimation = (wrapper, image, parentContainerWidth, isBackground) => {
  if (!isBackground) {
    if (wrapper) {
      wrapper.style.transition = 'opacity 400ms ease 0ms';
    }

    image.style.transform = 'scale(1.1)';
    image.style.filter = `blur(${Math.floor(parentContainerWidth / 100)}px)`;
  } else {
    image.style.overflow = 'hidden';
    addClass(image, 'ci-bg-animation');
  }
};

export const finishAnimation = (image, isBackground) => {
  if (!isBackground) {
    const previewImg = image.parentNode.querySelector('img.ci-image-preview');
    const previewImgWrapper = previewImg && previewImg.parentNode;

    if (previewImgWrapper) {
      previewImgWrapper.style.opacity = 0;
    }
  } else {
    image.style.opacity = '0';
  }

  addClass(image, 'ci-image-loaded');
};

export const onImageLoad = (wrapper, previewImg, imgNode, ratio, preserveSize, isAdaptive) => {
  const { width, height } = imgNode;

  wrapper.style.background = 'transparent';

  if (!ratio || isAdaptive) {
    wrapper.style.paddingBottom = preserveSize ? 'none' : `${100 / (width / height)}%`;
  }

  finishAnimation(imgNode);
};

export const onPreviewImageLoad = (wrapper, previewImg, ratio, preserveSize) => {
  const { naturalWidth, naturalHeight } = previewImg;

  wrapper.style.background = 'transparent';

  if (!ratio) {
    wrapper.style.paddingBottom = preserveSize ? 'none' : `${100 / (naturalWidth / naturalHeight)}%`;
  }
};

export const loadBackgroundImage = (bg, isPreview, bgContainer, ciOptimizedUrl) => {
  if (bg) {
    const optimizedImage = new Image();

    if (isPreview) {
      const previewImage = new Image();

      optimizedImage.onload = () => {
        finishAnimation(bgContainer, true);
        bgContainer.parentNode.removeAttribute('ci-optimized-url');
        bgContainer.removeAttribute('data-bg');
        bgContainer.removeAttribute('ci-preview');
      };

      bgContainer.parentNode.style.backgroundImage = `url(${ciOptimizedUrl})`;
      optimizedImage.src = ciOptimizedUrl;
      previewImage.src = bg;
    } else {
      optimizedImage.onload = () => {
        bgContainer.removeAttribute('data-bg');
        bgContainer.removeAttribute('ci-preview');
      };

      optimizedImage.src = bg;
    }

    bgContainer.style.backgroundImage = `url(${bg})`;
  }
};

export const onLazyBeforeUnveil = (event) => {
  const bgContainer = event.target;
  const bg = bgContainer.getAttribute('data-bg');
  const isPreview = bgContainer.getAttribute('ci-preview') === 'true';
  const ciOptimizedUrl = (isPreview ? bgContainer.parentNode : bgContainer).getAttribute('ci-optimized-url');

  loadBackgroundImage(bg, isPreview, bgContainer, ciOptimizedUrl);
};

export const wrapImage = (props) => {
  const {
    imgNode, ratio, imgNodeWidth, imgNodeHeight, preserveSize, placeholderBackground, isGalleryImg,
  } = props;
  let { wrapper } = props;

  wrapper = wrapper || document.createElement('div');

  addClass(wrapper, 'ci-image-wrapper');

  wrapper.style.background = placeholderBackground;
  wrapper.style.display = 'block';
  wrapper.style.width = preserveSize ? imgNodeWidth : '100%';
  wrapper.style.height = preserveSize ? imgNodeHeight : 'auto';
  wrapper.style.overflow = 'hidden';
  wrapper.style.position = 'relative';

  if (isGalleryImg) {
    wrapper.style.height = '100%';
    wrapper.style.background = '';
  } else if (ratio) {
    wrapper.style.paddingBottom = preserveSize ? 'none' : `${100 / ratio}%`;
  }

  if (imgNode.nextSibling) {
    imgNode.parentNode.insertBefore(wrapper, imgNode.nextSibling);
  } else {
    imgNode.parentNode.appendChild(wrapper);
  }

  wrapper.appendChild(imgNode);

  return wrapper;
};

export const applyOrUpdateWrapper = (props) => {
  const {
    isUpdate, imgNode, isPreview, lazy, alt,
  } = props;
  let wrapper; let previewImgNode = null; let
    previewWrapper = null;

  if (!isUpdate) {
    wrapper = wrapImage(props);

    if (isPreview) {
      previewWrapper = document.createElement('div');
      previewImgNode = document.createElement('img');

      previewImgNode.className = `ci-image-ratio ci-image-preview${lazy ? ' lazyload' : ''}`;
      previewWrapper.style.transform = 'translateZ(0)';
      previewWrapper.style.zIndex = '1';
      previewWrapper.style.height = '100%';
      previewWrapper.style.width = '100%';
      previewWrapper.style.position = 'absolute';
      previewWrapper.style.top = '0';
      previewWrapper.style.left = '0';
      previewImgNode.alt = `Low quality preview for ${alt}`;
      previewWrapper.appendChild(previewImgNode);
      wrapper.insertBefore(previewWrapper, imgNode);
      addClass(wrapper, 'ci-with-preview-image');
    }
  } else {
    wrapper = getWrapper(imgNode);
  }

  return { wrapper, previewImgNode, previewWrapper };
};

export const initImageClasses = ({ imgNode, lazy }) => {
  addClass(imgNode, 'ci-image');

  if (lazy) {
    addClass(imgNode, 'lazyload');
  }
};

/*
* possible size values: 200 | 200x400
* */
export const updateSizeWithPixelRatio = (size, devicePixelRatio) => {
  const splittedSizes = size.toString().split('x');
  const result = [];

  [].forEach.call(splittedSizes, (_size) => {
    // eslint-disable-next-line no-unused-expressions
    _size ? result.push(Math.floor(_size * ((devicePixelRatio || window.devicePixelRatio).toFixed(1) || 1))) : '';
  });

  return result.join('x');
};
