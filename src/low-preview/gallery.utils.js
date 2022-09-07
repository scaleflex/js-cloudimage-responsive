import { getCommonImageProps, swapArrayPositions, addClass } from '../common/ci.utils';


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

const destroyGallery = () => {
  const galleryModal = document.querySelector('.ci-gallery-modal');

  if (galleryModal) {
    galleryModal.parentElement.removeChild(galleryModal);
  }
};

const createGalleryModal = (closeIconSrc, galleryLength, isGallery) => {
  const iconStyles = { color: 'rgba(255,255,255,0.5)' };
  const galleryModal = document.createElement('div');
  const previewModule = document.createElement('div');
  const closeIcon = createIcon(closeIconSrc, 'ci-gallery-close-button', iconStyles);

  galleryModal.tabIndex = 0;
  galleryModal.classList.add('ci-gallery-modal');
  previewModule.classList.add('ci-gallery-preview-module');
  galleryModal.setAttribute('data-ci-gallery', true);
  galleryModal.append(previewModule);
  galleryModal.append(closeIcon);
  closeIcon.onclick = destroyGallery;

  if (isGallery) {
    const thumbnailsModule = document.createElement('div');
    thumbnailsModule.classList.add('ci-gallery-thumbnail-module');
    galleryModal.setAttribute('data-ci-gallery-length', galleryLength);
    galleryModal.setAttribute('data-ci-gallery-index', 0);
    galleryModal.append(thumbnailsModule);
  }

  return galleryModal;
};

const createImageNameWrapper = (imageName, galleryModal) => {
  const imageNameContainer = document.createElement('p');

  imageNameContainer.innerHTML = imageName;
  addClass(imageNameContainer, 'ci-gallery-image-name');

  galleryModal.appendChild(imageNameContainer);
};

const updateOrCreateImageNameWrapper = (imageName, galleryModal) => {
  const imageNameContainer = galleryModal.querySelector('.ci-gallery-image-name');

  if (imageNameContainer) {
    imageNameContainer.innerHTML = imageName;
  } else {
    createImageNameWrapper(imageName, galleryModal);
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

  return [+galleryLength, galleryIndex];
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

  const loadedThmbnails = _thumbnails.filter((thmbnail) => thmbnail.naturalWidth !== 0);

  return loadedThmbnails.map((thumbnail, index) => {
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

const getZoomImages = (images) => [...images].filter((image) => {
  const { zoom } = getCommonImageProps(image);

  return zoom;
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
  createIcon,
  createGalleryModal,
  destroyGallery,
  updateOrCreateImageNameWrapper,
  getGalleryPreviewModule,
  setGalleryIndex,
  createGalleryArrows,
  getGalleryLengthAndIndex,
  removeClassNames,
  createThmbnailsModule,
  getGalleryImages,
  getZoomImages,
  getImageFitStyles,
  galleryPreviewImage,
  getDimAndFit,
};
