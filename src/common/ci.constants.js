const loadedImageClassNames = ['ci-image-loaded', 'lazyloaded', 'ci-image'];

const ATTRIBUTES = {
  CANVAS: 'data-ci-canvas',
  PROCESSED_GALLERY: 'data-ci-processed-gallery',
  ACTIVE_IMAGE_INDEX: 'data-ci-active-image-index',
  PROCESSED: 'data-ci-processed',
  OPTIMIZED_URL: 'ci-optimized-url',
  BG_CONTAINER: 'data-ci-bg-container',
  PREVIEW: 'ci-preview',
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
  GALLERY_DATA: 'data-ci-gallery',
  GALLERY_LENGTH: 'data-ci-gallery-length',
  GALLERY_INDEX: 'data-ci-gallery-index',
  ACTIVE_IMAGE_INDEX: 'data-ci-active-image-index',
  THUMBNAIL_MODULE: 'ci-gallery-thumbnail-module',
  THUMBNAIL_CONTAINER: 'ci-gallery-thmbnail-container',
  CLOSE_BTN: 'ci-gallery-close-button',
  LEFT_ARROW_BTN: 'ci-gallery-left-arrow-button',
  RIGHT_ARROW_BTN: 'ci-gallery-right-arrow-button',
  ZOOM_BTN: 'ci-gallery-zoom-button',
  IMAGE: 'ci-image',
  IMAGE_NAME: 'ci-gallery-image-name',
  IMAGE_LOADED: 'ci-image-loaded',
};

const ICONS_STYLES = {
  ZOOM: { width: 35, height: 35 },
  COLOR: { color: 'rgba(255,255,255,0.5)' },
};

export {
  loadedImageClassNames,
  ATTRIBUTES,
  CLASSNAMES,
  ICONS_STYLES,
};
