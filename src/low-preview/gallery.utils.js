import { getCommonImageProps, addClass } from '../common/ci.utils';
import { ATTRIBUTES, CLASSNAMES } from '../common/ci.constants';


const createIcon = (iconSrc, className, iconStyles) => {
  const iconWrapper = document.createElement('div');

  const icon = new Image();
  icon.src = iconSrc;

  icon.style.width = `${iconStyles ? iconStyles.width : '15'}px`;
  icon.style.height = `${iconStyles ? iconStyles.height : '15'}px`;

  iconWrapper.classList.add(className, CLASSNAMES.GALLERY_ICON_BUTTON);

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
  const galleryModal = document.createElement('div');
  const previewModule = document.createElement('div');
  const loader = document.createElement('div');

  galleryModal.tabIndex = 0;
  addClass(galleryModal, CLASSNAMES.GALLERY_MODAL);
  addClass(previewModule, CLASSNAMES.PREVIEW_MODULE);
  galleryModal.setAttribute(ATTRIBUTES.GALLERY, true);
  addClass(loader, CLASSNAMES.GALLERY_LOADER);
  galleryModal.append(previewModule);
  galleryModal.append(loader);

  if (isGallery) {
    const {
      modalClassName, previewClassName, thumbnailsClassName, closeIcon, close, onClose,
    } = galleryConfigs;

    const thumbnailsModule = document.createElement('div');

    if (close) {
      let _closeIcon = closeIcon || closeIconSrc;

      if (typeof _closeIcon === 'string') {
        _closeIcon = createIcon(_closeIcon, CLASSNAMES.CLOSE_BUTTON);
      }

      _closeIcon.onclick = destroyGallery.bind(this, onClose);
      galleryModal.append(_closeIcon);
    }

    addClass(galleryModal, modalClassName);
    addClass(previewModule, previewClassName);
    addClass(thumbnailsModule, CLASSNAMES.THUMBNAIL_MODULE);
    addClass(thumbnailsModule, thumbnailsClassName);

    galleryModal.setAttribute(ATTRIBUTES.GALLERY_LENGTH, galleryLength);
    galleryModal.setAttribute(ATTRIBUTES.GALLERY_INDEX, 0);
    galleryModal.append(thumbnailsModule);
  } else {
    const closeIcon = createIcon(closeIconSrc, CLASSNAMES.CLOSE_BUTTON);
    closeIcon.onclick = destroyGallery.bind(this);
    galleryModal.append(closeIcon);
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

  let leftArrow = arrowPrevIcon || leftArrowIcon;
  if (typeof leftArrow === 'string') {
    leftArrow = createIcon(leftArrow, CLASSNAMES.LEFT_ARROW_BUTTON);
  }

  let rightArrow = arrowNextIcon || rightArrowIcon;
  if (typeof rightArrow === 'string') {
    rightArrow = createIcon(rightArrow, CLASSNAMES.RIGHT_ARROW_BUTTON);
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

    addClass(thmbnailContainer, CLASSNAMES.THUMBNAIL_CONTAINER);
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
