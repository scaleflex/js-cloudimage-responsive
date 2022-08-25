import { bgContentAttr } from '../common/ci.constants';
import { addClass, getWrapper, getCommonImageProps, attr } from '../common/ci.utils';


export const wrapBackgroundContainer = (imgNode) => {
  let previewBox = document.createElement('div');
  let contentBox = document.createElement('div');

  if (imgNode.children && imgNode.children.length > 0) {
    wrapAll(contentBox, imgNode.children);
  }

  imgNode.prepend(previewBox);

  return [previewBox, contentBox]
};

export const applyBackgroundStyles = ({ imgNode, previewBox, contentBox, lazy, width }) => {
  imgNode.style.position = 'relative';

  contentBox.style.position = 'relative';
  contentBox.setAttribute(bgContentAttr, true);

  previewBox.className = `${imgNode.className}${lazy ? ' lazyload' : ''}`;
  previewBox.setAttribute('ci-preview', true);
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
    wrapper.style.paddingBottom = preserveSize ? 'none' : (100 / (width / height)) + '%';
  }

  finishAnimation(imgNode);
};

export const onPreviewImageLoad = (wrapper, previewImg, ratio, preserveSize) => {
  const { naturalWidth, naturalHeight } = previewImg;

  wrapper.style.background = 'transparent';

  if (!ratio) {
    wrapper.style.paddingBottom = preserveSize ? 'none' : (100 / (naturalWidth / naturalHeight)) + '%';
  }
};

export const onLazyBeforeUnveil = (event) => {
  const bgContainer = event.target;
  const bg = bgContainer.getAttribute('data-bg');
  const isPreview = bgContainer.getAttribute('ci-preview') === 'true';
  const ciOptimizedUrl = (isPreview ? bgContainer.parentNode : bgContainer).getAttribute('ci-optimized-url');

  loadBackgroundImage(bg, isPreview, bgContainer, ciOptimizedUrl);
}

export const galleryMainImage = (imgSelector, imgNodeSRC) => {
  const image = new Image();

  image.setAttribute(imgSelector, imgNodeSRC);

  return image;
}

const createGalleryMainImg = (imgSelector, imgProps) => {
  const {imgNodeSRC } = imgProps;

  const imageWrapper = document.createElement('div');
  const image = galleryMainImage(imgSelector, imgNodeSRC);

  imageWrapper.style.width = '85%';
  imageWrapper.style.height = '100%';

  imageWrapper.classList.add('ci-gallery-main-image-wrapper');

  imageWrapper.append(image);

  return imageWrapper;
}

const createGalleryImgs = (images, imgSelector, galleryName) => {
  const galleryImgs = [];

  images.forEach((img) => {
    const { gallery } = getCommonImageProps(img);

    if (gallery === galleryName){
      galleryImgs.push(img);
    }
  });

  const galleryImgsContainer = document.createElement('div');
  galleryImgsContainer.classList.add('ci-gallery-images-wrapper');

  galleryImgs.forEach((img) => {
    const imgWrapper = document.createElement('div');
    const image = new Image();

    image.setAttribute(imgSelector, attr(img, imgSelector));

    imgWrapper.classList.add('ci-gallery-bottom-img');
    imgWrapper.append(image);

    galleryImgsContainer.append(imgWrapper);
  })

  return galleryImgsContainer;
}

export const createGalleryModal = (imgSelector, imgProps, images, galleryName) => {
  const galleryModal = document.createElement('div');
  const upperPart = document.createElement('div');

  const galleryMainImg = createGalleryMainImg(imgSelector, imgProps);
  const galleryImgs = createGalleryImgs(images, imgSelector, galleryName);

  upperPart.classList.add('gallery-upper-part');
  galleryModal.classList.add('ci-gallery-modal');

  upperPart.append(galleryMainImg);

  galleryModal.append(upperPart);
  galleryModal.append(galleryImgs);

  return galleryModal;
}

export const creatIcon = (iconClassName, iconSRC) => {
  const iconWrapper = document.createElement('div');
  const icon = new Image();

  icon.setAttribute('src', iconSRC);
  icon.style.width = '30px';
  icon.style.height = '30px';

  iconWrapper.classList.add(iconClassName);
  iconWrapper.append(icon);

  return iconWrapper;
}

export const markCurrentImage = (galleryWrapperChildren, currentIndex) => {
  galleryWrapperChildren.forEach((imgWrapper, index) => {
    imgWrapper.querySelector('img').style.border= '1px solid grey';

    if(index === currentIndex) {
      imgWrapper.querySelector('img').style.border = '1px solid white';
    }
  });
}

export const setGalleryAnimation = (image) => {
  image.style.transform = 'scale(1.1)';
  image.style.transition = 'transform 0.5s ease';
  image.style.zIndex = '2';
}

export const finishGalleryAnimation = (image) => {
  image.style.transform = 'scale(1)';
  image.style.zIndex = '1';
}

export const updateDimensions = (wrapper, imgProps) => {
  const { imgNodeHeight, imgNodeWidth } = imgProps;

  const imageWrapper = wrapper.firstElementChild;
  const outerImage = imageWrapper.querySelector('.ci-image');
  const innerImage = imageWrapper.querySelector('.ci-image-ratio');

  imageWrapper.style.width = '100%';
  imageWrapper.style.height = '100%';

  outerImage.style.maxWidth = 'unset';
  outerImage.style.top = 'unset';

  if(innerImage){
    innerImage.style.maxWidth = 'unset';
  }

  if((imgNodeHeight / imgNodeWidth) > 1 || !imgNodeHeight){
    if(innerImage){
      innerImage.style.width = '100%';
      innerImage.style.height = 'auto';
    }

    outerImage.style.width = '100%';
    outerImage.style.height = 'auto';
  }
  else{
    if(innerImage){
      innerImage.style.width = 'auto';
      innerImage.style.height = '100%';
    }

    outerImage.style.width = 'auto';
    outerImage.style.height = '100%';
  }
}

export const loadBackgroundImage = (bg, isPreview, bgContainer, ciOptimizedUrl) => {
  if (bg) {
    let optimizedImage = new Image();

    if (isPreview) {
      let previewImage = new Image();

      optimizedImage.onload = () => {
        finishAnimation(bgContainer, true);
        bgContainer.parentNode.removeAttribute('ci-optimized-url');
        bgContainer.removeAttribute('data-bg');
        bgContainer.removeAttribute('ci-preview');
      }

      bgContainer.parentNode.style.backgroundImage = 'url(' + ciOptimizedUrl + ')';
      optimizedImage.src = ciOptimizedUrl;
      previewImage.src = bg;
    } else {
      optimizedImage.onload = () => {
        bgContainer.removeAttribute('data-bg');
        bgContainer.removeAttribute('ci-preview');
      }

      optimizedImage.src = bg;
    }

    bgContainer.style.backgroundImage = 'url(' + bg + ')';
  }
};

export const applyOrUpdateWrapper = props => {
  const { isUpdate, imgNode, isPreview, lazy, alt } = props;
  let wrapper, previewImgNode = null, previewWrapper = null;

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

export const wrapImage = (props) => {
  const { imgNode, ratio, imgNodeWidth, imgNodeHeight, preserveSize, placeholderBackground } = props;
  let { wrapper } = props;

  wrapper = wrapper || document.createElement('div');

  addClass(wrapper, 'ci-image-wrapper');
  wrapper.style.background = placeholderBackground;
  wrapper.style.display = 'block';
  wrapper.style.width = preserveSize ? imgNodeWidth : '100%';
  wrapper.style.height = preserveSize ? imgNodeHeight : 'auto';
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

  wrapper.appendChild(imgNode);

  return wrapper;
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

  [].forEach.call(splittedSizes, size => {
    size ? result.push(Math.floor(size * ((devicePixelRatio || window.devicePixelRatio).toFixed(1) || 1))) : '';
  });

  return result.join('x');
};

const wrapAll = function(wrapper, elms) {
  const el = elms.length ? elms[0] : elms;
  const parent  = el.parentNode;
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