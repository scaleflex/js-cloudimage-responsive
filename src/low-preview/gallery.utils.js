import { getCommonImageProps, addClass } from '../common/ci.utils';
import { ATTRIBUTES, CLASSNAMES, ICONS_STYLES } from '../common/ci.constants';


const createIcon = (iconSrc, className, iconStyles) => {
  const { color, width = 15, height = 15 } = iconStyles;

  const iconWrapper = document.createElement('div');
  let icon;

  if (iconSrc.tagName === 'IMG') {
    icon = iconSrc;
  } else {
    icon = new Image();
    icon.src = iconSrc;
  }

  icon.style.width = `${width}px`;
  icon.style.height = `${height}px`;

  if (className) {
    iconWrapper.classList.add(className);
  }

  if (color) {
    iconWrapper.style.backgroundColor = color;
  }

  iconWrapper.appendChild(icon);

  return iconWrapper;
};

const destroyGallery = (onClose, event) => {
  if (typeof onClose === 'function') {
    onClose(event);
  }

  const galleryModal = document.querySelector(`.${CLASSNAMES.GALLERY_MODAL}`);

  if (galleryModal) {
    galleryModal.parentElement.removeChild(galleryModal);
  }
};

const createGalleryModal = (closeIconSrc, galleryConfigs, galleryLength, isGallery) => {
  const {
    modalClassName, previewClassName, thumbnailsClassName, closeIcon, close, onClose,
  } = galleryConfigs;

  let closeIcn = null;

  const galleryModal = document.createElement('div');
  const previewModule = document.createElement('div');
  const loader = document.createElement('div');

  if (closeIcon) {
    closeIcn = createIcon(closeIcon, CLASSNAMES.CLOSE_BUTTON, ICONS_STYLES.COLOR);
  } else {
    closeIcn = createIcon(closeIconSrc, CLASSNAMES.CLOSE_BUTTON, ICONS_STYLES.COLOR);
  }

  galleryModal.tabIndex = 0;
  galleryModal.classList.add(CLASSNAMES.GALLERY_MODAL);
  previewModule.classList.add(CLASSNAMES.PREVIEW_MODULE);
  galleryModal.setAttribute(ATTRIBUTES.GALLERY, true);
  loader.classList.add('ci-gallery-loader');
  galleryModal.append(previewModule);
  galleryModal.append(loader);

  if (close) {
    galleryModal.append(closeIcn);
  }

  closeIcn.onclick = destroyGallery.bind(this, onClose);

  if (modalClassName) {
    galleryModal.classList.add(modalClassName);
  }

  if (previewClassName) {
    previewModule.classList.add(previewClassName);
  }

  if (isGallery) {
    const thumbnailsModule = document.createElement('div');
    thumbnailsModule.classList.add(CLASSNAMES.THUMBNAIL_MODULE);

    if (thumbnailsClassName) {
      thumbnailsModule.classList.add(thumbnailsClassName);
    }
    galleryModal.setAttribute(ATTRIBUTES.GALLERY_LENGTH, galleryLength);
    galleryModal.setAttribute(ATTRIBUTES.GALLERY_INDEX, 0);
    galleryModal.append(thumbnailsModule);
  }

  return galleryModal;
};

const createImageNameWrapper = (imageName, galleryModal) => {
  const imageNameContainer = document.createElement('p');

  imageNameContainer.innerHTML = imageName;
  addClass(imageNameContainer, CLASSNAMES.IMAGE_NAME);

  galleryModal.appendChild(imageNameContainer);
};

const updateOrCreateImageNameWrapper = (imageName, galleryModal) => {
  const imageNameContainer = galleryModal.querySelector(`.${CLASSNAMES.IMAGE_NAME}`);

  if (imageNameContainer) {
    imageNameContainer.innerHTML = imageName;
  } else {
    createImageNameWrapper(imageName, galleryModal);
  }
};

const toggleActiveThumbnail = (galleryModal, imageIndex) => {
  const thumbnailsModule = galleryModal.querySelector(`.${CLASSNAMES.THUMBNAIL_MODULE}`);

  [...thumbnailsModule.children].forEach((thumbnailContainer) => {
    thumbnailContainer.removeAttribute(ATTRIBUTES.ACTIVE_THUMBNAIL);
    const thumbnailContainerIndex = thumbnailContainer.getAttribute(ATTRIBUTES.GALLERY_INDEX);

    if (+imageIndex === +thumbnailContainerIndex) {
      thumbnailContainer.setAttribute(ATTRIBUTES.ACTIVE_THUMBNAIL, true);
    }
  });
};

const getGalleryPreviewModule = () => {
  const galleryModal = document.body.querySelector(`[${ATTRIBUTES.GALLERY}]`);

  return galleryModal.querySelector(`.${CLASSNAMES.PREVIEW_MODULE}`);
};

const setGalleryIndex = (index) => {
  const galleryModal = document.body.querySelector(`[${ATTRIBUTES.GALLERY}]`);

  galleryModal.setAttribute(ATTRIBUTES.GALLERY_INDEX, index);
};

const createGalleryArrows = (leftArrowIcon, rightArrowIcon, galleryConfigs, onClick) => {
  const {
    arrowPrevIcon, arrowNextIcon, onPrev, onNext,
  } = galleryConfigs;
  let leftArrow;
  let rightArrow;

  if (arrowPrevIcon) {
    leftArrow = createIcon(arrowPrevIcon, CLASSNAMES.LEFT_ARROW_BUTTON, ICONS_STYLES.COLOR);
  } else {
    leftArrow = createIcon(leftArrowIcon, CLASSNAMES.LEFT_ARROW_BUTTON, ICONS_STYLES.COLOR);
  }

  if (arrowNextIcon) {
    rightArrow = createIcon(arrowNextIcon, CLASSNAMES.RIGHT_ARROW_BUTTON, ICONS_STYLES.COLOR);
  } else {
    rightArrow = createIcon(rightArrowIcon, CLASSNAMES.RIGHT_ARROW_BUTTON, ICONS_STYLES.COLOR);
  }

  if (onClick) {
    leftArrow.onclick = onClick.bind(this, 'left');
    rightArrow.onclick = onClick.bind(this, 'right');
  }

  if (typeof onPrev === 'function') {
    leftArrow.onclick = onPrev.bind(this);
  }

  if (typeof onNext === 'function') {
    rightArrow.onclick = onNext.bind(this);
  }

  return [leftArrow, rightArrow];
};

const getGalleryLengthAndIndex = () => {
  const galleryModal = document.body.querySelector(`[${ATTRIBUTES.GALLERY}]`);
  const galleryLength = galleryModal.getAttribute(ATTRIBUTES.GALLERY_LENGTH);
  const galleryIndex = galleryModal.getAttribute(ATTRIBUTES.GALLERY_INDEX);

  return [+galleryLength, galleryIndex];
};

const swapArrayPositions = (array = [], a = 0, b = 0) => {
  const clonedArray = [...array];
  if (clonedArray[a] && clonedArray[b]) {
    [clonedArray[a], clonedArray[b]] = [clonedArray[b], clonedArray[a]];
  }

  return clonedArray;
};

const getImageFitStyles = (naturalWidth, naturalHeight) => {
  let shouldFitHorizontally;
  const imageStyles = {};
  const previewModule = document.body.querySelector(`.${CLASSNAMES.PREVIEW_MODULE}`);

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

const adaptGalleryThumbnails = (images = [], onClickThumbnail, onClick) => {
  const lowPreviewImages = images.map((image) => image.previousSibling.firstChild);

  return lowPreviewImages.map((thumbnail, index) => {
    const thmbnailContainer = document.createElement('div');
    const imageFitStyles = getImageFitStyles(thumbnail.naturalWidth, thumbnail.naturalHeight);
    const image = thumbnail.cloneNode();

    image.classList.remove(CLASSNAMES.IMAGE);
    image.style = {};
    image.style.width = imageFitStyles.width;
    image.style.height = imageFitStyles.height;

    thmbnailContainer.classList.add(CLASSNAMES.THUMBNAIL_CONTAINER);
    thmbnailContainer.setAttribute(ATTRIBUTES.GALLERY_INDEX, index);
    thmbnailContainer.append(image);

    if (onClick) {
      thmbnailContainer.onclick = onClick;
    }

    if (typeof onClickThumbnail === 'function') {
      thmbnailContainer.onclick = onClickThumbnail.bind(this);
    }

    return thmbnailContainer;
  });
};

const appendGalleryThumbnails = (thumbnails = [], thumbnailsContainer) => {
  thumbnails.forEach((thumbnail) => {
    thumbnailsContainer.append(thumbnail);
  });
};

const createThmbnailsModule = (images, galleryModal, onClickThumbnail, onClick) => {
  const thumbnailsModule = galleryModal.querySelector(`.${CLASSNAMES.THUMBNAIL_MODULE}`);
  const adaptedGalleryThumbnails = adaptGalleryThumbnails(images, onClickThumbnail, onClick);

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
