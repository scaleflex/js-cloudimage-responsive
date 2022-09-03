import { getCommonImageProps, swapArrayPositions } from '../common/ci.utils';
import { previewContainer } from '../common/ci.constants';


const createIcon = (iconSrc, className, iconStyles) => {
  const { color, width = 15, height = 15 } = iconStyles;

  const iconWrapper = document.createElement('div');
  const icon = new Image();

  icon.src = iconSrc;
  icon.width = width;
  icon.height = height;

  if (className) {
    iconWrapper.classList.add(className);
  }

  if (color) {
    iconWrapper.style.backgroundColor = color;
  }

  iconWrapper.appendChild(icon);

  return iconWrapper;
};

const destroyGallery = (galleryModal) => {
  galleryModal.style.animation = 'fadeOut 0.7s';

  setTimeout(() => {
    galleryModal.parentNode.removeChild(galleryModal);
  }, 700);
};

const createGalleryModal = (galleryLength, closeIconSrc, isGallery) => {
  const iconStyles = { color: 'rgba(255,255,255,0.5)' };

  const galleryModal = document.createElement('div');
  const previewModule = document.createElement('div');
  const closeIcon = createIcon(closeIconSrc, 'ci-gallery-close-button', iconStyles);

  galleryModal.classList.add('ci-gallery-modal');
  previewModule.classList.add('ci-gallery-preview-module');

  if (isGallery) {
    const thumbnailsModule = document.createElement('div');
    thumbnailsModule.classList.add('ci-gallery-thumbnail-module');
    galleryModal.setAttribute('data-ci-gallery-length', galleryLength);
    galleryModal.setAttribute('data-ci-gallery-index', 0);
    galleryModal.append(thumbnailsModule);
  }

  galleryModal.setAttribute('data-ci-gallery', true);
  galleryModal.append(previewModule);
  galleryModal.append(closeIcon);

  closeIcon.onclick = destroyGallery.bind(this, galleryModal);

  return galleryModal;
};

const handleHoveringWrapper = (wrapper, imgProps, zoomIconSrc) => {
  const isPreviewWrapper = wrapper.parentNode.className === previewContainer;

  if (!isPreviewWrapper) {
    const { zoom, gallery } = imgProps;

    if (zoom && !gallery) {
      const iconStyles = { width: 35, height: 35 };
      const zoomIcon = createIcon(zoomIconSrc, 'ci-gallery-zoom-button', iconStyles);

      zoomIcon.style.animation = 'fadeIn 0.3s';

      wrapper.append(zoomIcon);
    }

    if (gallery) {
      wrapper.style.transform = 'scale(1.05)';
      wrapper.style.transition = 'transform 0.5s ease';
      wrapper.style.zIndex = '2';
    }
  }
};

const handleUnHoveringWrapper = (wrapper, imgProps) => {
  const isPreviewWrapper = wrapper.parentNode.className === previewContainer;

  if (!isPreviewWrapper) {
    const { zoom, gallery } = imgProps;

    if (zoom && !gallery) {
      const zoomIcon = wrapper.querySelector('.ci-gallery-zoom-button');
      zoomIcon.style.animation = 'fadeOut 0.4s';

      setTimeout(() => {
        if (zoomIcon) {
          zoomIcon.parentNode.removeChild(zoomIcon);
        }
      }, 300);
    }

    if (gallery) {
      wrapper.style.transform = 'scale(1)';
      wrapper.style.zIndex = '1';
    }
  }
};

const getGalleryPreviewModule = () => {
  const galleryModal = document.body.querySelector('[data-ci-gallery]');

  return galleryModal.querySelector('.ci-gallery-preview-module');
};

const setGalleryIndex = (index) => {
  const galleryModal = document.body.querySelector('[data-ci-gallery]');

  galleryModal.setAttribute('data-ci-gallery-index', index);
};

const markCurrentImage = (galleryThmbnails, currentIndex) => {
  galleryThmbnails.forEach((imgWrapper, index) => {
    imgWrapper.querySelector('img').style.border = '1px solid grey';

    if (index === currentIndex) {
      imgWrapper.querySelector('img').style.border = '1px solid white';
    }
  });
};

const createGalleryArrows = (leftArrowIcon, rightArrowIcon, onClick) => {
  const iconStyles = { color: 'rgba(255,255,255,0.5)' };

  const leftArrow = createIcon(leftArrowIcon, 'ci-gallery-left-arrow-button', iconStyles);
  const rightArrow = createIcon(rightArrowIcon, 'ci-gallery-right-arrow-button', iconStyles);

  if (onClick) {
    leftArrow.onclick = onClick.bind(this, 'left');
    rightArrow.onclick = onClick.bind(this, 'right');
  }

  return [leftArrow, rightArrow];
};

const getGalleryLengthAndIndex = () => {
  const galleryModal = document.body.querySelector('[data-ci-gallery]');
  const galleryLength = galleryModal.getAttribute('data-ci-gallery-length');
  const galleryIndex = galleryModal.getAttribute('data-ci-gallery-index');

  return [galleryLength, galleryIndex];
};

const removeClassNames = (node, classNames) => {
  classNames.forEach((className) => {
    if (node.classList.contains(className)) {
      node.classList.remove(className);
    }
  });

  return node;
};

const adaptGalleryThumbnails = (clickedImage, thumbnails = [], onClick) => {
  const indexOfClickedImage = thumbnails.indexOf(clickedImage);

  const _thumbnails = swapArrayPositions(thumbnails, indexOfClickedImage, 0);

  return _thumbnails.map((thumbnail, index) => {
    const thmbnailContainer = document.createElement('div');
    const image = thumbnail.cloneNode();

    image.classList.remove('ci-image');
    image.style = {};
    image.style.width = '100%';
    image.style.height = '100%';

    thmbnailContainer.classList.add('ci-gallery-thmbnail-container');
    thmbnailContainer.setAttribute('data-ci-gallery-index', index);
    thmbnailContainer.append(image);

    if (onClick) {
      thmbnailContainer.onclick = onClick;
    }

    return thmbnailContainer;
  });
};

const appendGalleryThumbnails = (thumbnails = [], thumbnailsContainer) => {
  thumbnails.forEach((thumbnail) => {
    thumbnailsContainer.append(thumbnail);
  });
};

const createThmbnailsModule = (clickedImage, images, galleryModal, onClick) => {
  const thumbnailsModule = galleryModal.querySelector('.ci-gallery-thumbnail-module');
  const adaptedGalleryThumbnails = adaptGalleryThumbnails(clickedImage, images, onClick);

  appendGalleryThumbnails(adaptedGalleryThumbnails, thumbnailsModule);

  return thumbnailsModule;
};

const getGalleryImages = (images, galleryName) => [...images].filter((image) => {
  const { gallery } = getCommonImageProps(image);

  return gallery === galleryName;
});

const getImageFitStyles = (naturalWidth, naturalHeight) => {
  let shouldFitHorizontally;
  const imageStyles = {};
  const previewModule = document.body.querySelector('.ci-gallery-preview-module');

  if (naturalWidth && previewModule) {
    const imageAspectRatio = naturalWidth / naturalHeight;
    const renderWidth = previewModule.offsetHeight * imageAspectRatio;
    shouldFitHorizontally = (imageAspectRatio <= 1)
        && (renderWidth < previewModule.offsetWidth);
  }

  if (shouldFitHorizontally) {
    imageStyles.width = 'auto';
    imageStyles.height = '100%';
  } else {
    imageStyles.width = '100%';
    imageStyles.height = 'auto';
  }

  return imageStyles;
};

const getCurrentImage = (mainImageWrapper, galleryModal) => {
  const galleryThmbnailsModule = galleryModal.querySelector('.ci-gallery-thumbnail-module');
  const galleryThmbnails = [...galleryThmbnailsModule.children];

  let currentIndex = null;

  galleryThmbnails.forEach((imgWrapper, index) => {
    const mainImg = mainImageWrapper.querySelector('[ci-src]').getAttribute('ci-src');
    const galleryImg = imgWrapper.querySelector('[ci-src]').getAttribute('ci-src');

    if (mainImg === galleryImg) {
      currentIndex = index;
      markCurrentImage(galleryThmbnails, index);
    }
  });

  return currentIndex;
};

const galleryPreviewImage = (imgSelector, imgNodeSRC) => {
  const image = new Image();

  image.setAttribute(imgSelector, imgNodeSRC);

  return image;
};

const getDimAndFit = (imgNode) => {
  const dimInterval = setInterval(() => {
    if (imgNode.naturalWidth) {
      clearInterval(dimInterval);
      const imageFitStyles = getImageFitStyles(imgNode.naturalWidth, imgNode.naturalHeight);

      imgNode.style.width = imageFitStyles.width;
      imgNode.style.height = imageFitStyles.height;
      imgNode.style.opacity = 1;
    }
  }, 10);
};

export {
  createGalleryModal,
  handleHoveringWrapper,
  handleUnHoveringWrapper,
  getGalleryPreviewModule,
  setGalleryIndex,
  createGalleryArrows,
  getGalleryLengthAndIndex,
  removeClassNames,
  createThmbnailsModule,
  getGalleryImages,
  getImageFitStyles,
  getCurrentImage,
  galleryPreviewImage,
  getDimAndFit,
};
