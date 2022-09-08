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
};

const CLASSNAMES = {
  PREVIEW_LOADED: 'ci-preview-loaded',
  GALLERY_ANIMATION: 'ci-gallery-animation',
  GALLERY_TRANSITION: 'ci-gallery-transition',
  GALLERY_MODAL: 'ci-gallery-modal',
  PREVIEW_MODULE: 'ci-gallery-preview-module',
  THUMBNAIL_MODULE: 'ci-gallery-thumbnail-module',
  THUMBNAIL_CONTAINER: 'ci-gallery-thmbnail-container',
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
