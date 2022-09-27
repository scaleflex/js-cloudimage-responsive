const loadedImageClassNames = ['ci-image-loaded', 'lazyloaded', 'ci-image'];

const ATTRIBUTES = {
  CANVAS: 'data-ci-canvas',
  OPTIMIZED_URL: 'ci-optimized-url',
  PREVIEW: 'ci-preview',
  PROCESSED_GALLERY: 'data-ci-processed-gallery',
  ACTIVE_IMAGE_INDEX: 'data-ci-active-image-index',
  PROCESSED: 'data-ci-processed',
  BG_CONTAINER: 'data-ci-bg-container',
  GALLERY: 'data-ci-gallery',
  GALLERY_LENGTH: 'data-ci-gallery-length',
  GALLERY_INDEX: 'data-ci-gallery-index',
  ACTIVE_THUMBNAIL: 'data-active-thumbnail',
};

const CLASSNAMES = {
  PREVIEW_LOADED: 'ci-preview-loaded',
  PREVIEW_MODULE: 'ci-gallery-preview-module',
  GALLERY_ANIMATION: 'ci-gallery-animation',
  GALLERY_MODAL: 'ci-gallery-modal',
  GALLERY_LOADER: 'ci-gallery-loader',
  THUMBNAIL_MODULE: 'ci-gallery-thumbnail-module',
  THUMBNAIL_CONTAINER: 'ci-gallery-thmbnail-container',
  GALLERY_ICON_BUTTON: 'ci-gallery-icon-button',
  CLOSE_BUTTON: 'ci-gallery-close-button',
  LEFT_ARROW_BUTTON: 'ci-gallery-left-arrow-button',
  RIGHT_ARROW_BUTTON: 'ci-gallery-right-arrow-button',
  ZOOM_BUTTON: 'ci-gallery-zoom-button',
  IMAGE: 'ci-image',
  IMAGE_NAME: 'ci-gallery-image-name',
  IMAGE_LOADED: 'ci-image-loaded',
};

export {
  loadedImageClassNames,
  ATTRIBUTES,
  CLASSNAMES,
};
