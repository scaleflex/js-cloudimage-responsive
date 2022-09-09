import { getCommonImageProps, addClass } from '../common/ci.utils';
import { ATTRIBUTES, CLASSNAMES, ICONS_STYLES } from '../common/ci.constants';


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
  const galleryModal = document.createElement('div');
  const previewModule = document.createElement('div');
  const closeIcon = createIcon(closeIconSrc, 'ci-gallery-close-button', ICONS_STYLES.COLOR);

  galleryModal.tabIndex = 0;
  galleryModal.classList.add(CLASSNAMES.GALLERY_MODAL);
  previewModule.classList.add(CLASSNAMES.PREVIEW_MODULE);
  galleryModal.setAttribute(ATTRIBUTES.GALLERY, true);
  galleryModal.append(previewModule);
  galleryModal.append(closeIcon);
  closeIcon.onclick = destroyGallery;

  if (isGallery) {
    const thumbnailsModule = document.createElement('div');
    thumbnailsModule.classList.add(CLASSNAMES.THUMBNAIL_MODULE);
    galleryModal.setAttribute(ATTRIBUTES.GALLERY_LENGTH, galleryLength);
    galleryModal.setAttribute(ATTRIBUTES.GALLERY_INDEX, 0);
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

const toggleActiveThumbnail = (galleryModal, imageIndex) => {
  const thumbnailsModule = galleryModal.querySelector('.ci-gallery-thumbnail-module');

  [...thumbnailsModule.children].forEach((thumbnailContainer) => {
    thumbnailContainer.removeAttribute(ATTRIBUTES.ACTIVE_THUMBNAIL);
    const thumbnailContainerIndex = thumbnailContainer.getAttribute(ATTRIBUTES.GALLERY_INDEX);

    if (+imageIndex === +thumbnailContainerIndex) {
      thumbnailContainer.setAttribute(ATTRIBUTES.ACTIVE_THUMBNAIL, true);
    }
  });
};

const getGalleryPreviewModule = () => {
  const galleryModal = document.body.querySelector('[data-ci-gallery]');

  return galleryModal.querySelector('.ci-gallery-preview-module');
};

const setGalleryIndex = (index) => {
  const galleryModal = document.body.querySelector('[data-ci-gallery]');

  galleryModal.setAttribute(ATTRIBUTES.GALLERY_INDEX, index);
};

const createGalleryArrows = (leftArrowIcon, rightArrowIcon, onClick) => {
  const leftArrow = createIcon(leftArrowIcon, 'ci-gallery-left-arrow-button', ICONS_STYLES.COLOR);
  const rightArrow = createIcon(rightArrowIcon, 'ci-gallery-right-arrow-button', ICONS_STYLES.COLOR);

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

const swapArrayPositions = (array = [], a = 0, b = 0) => {
  const clonedArray = [...array];
  if (clonedArray[a] && clonedArray[b]) {
    [clonedArray[a], clonedArray[b]] = [clonedArray[b], clonedArray[a]];
  }

  return clonedArray;
};

const adaptGalleryThumbnails = (images = [], onClick) => {
  const lowPreviewImages = images.map((image) => image.previousSibling.firstChild);

  return lowPreviewImages.map((thumbnail, index) => {
    const thmbnailContainer = document.createElement('div');
    const image = thumbnail.cloneNode();

    image.classList.remove('ci-image');
    image.style = {};
    image.style.width = '100%';
    image.style.height = '100%';

    thmbnailContainer.classList.add(CLASSNAMES.THUMBNAIL_CONTAINER);
    thmbnailContainer.setAttribute(ATTRIBUTES.GALLERY_THUMBNAIL_INDEX, index);
    thmbnailContainer.setAttribute(ATTRIBUTES.GALLERY_INDEX, index);
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

const createThmbnailsModule = (images, galleryModal, onClick) => {
  const thumbnailsModule = galleryModal.querySelector('.ci-gallery-thumbnail-module');
  const adaptedGalleryThumbnails = adaptGalleryThumbnails(images, onClick);

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
  createThmbnailsModule,
  getGalleryImages,
  getZoomImages,
  getImageFitStyles,
  galleryPreviewImage,
  getDimAndFit,
  swapArrayPositions,
  toggleActiveThumbnail,
};
