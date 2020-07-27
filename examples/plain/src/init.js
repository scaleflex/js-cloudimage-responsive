window.ciResponsive = new window.CIResponsive({
  token: 'demo',
  baseURL: 'https://cloudimage.public.airstore.io/demo/',
  params: 'ci_info=1&org_if_sml=1&version=16.04.2020',
  lazyLoadOffset: 100,
  lazyLoading: true,
  exactSize: false,
  limitFactor: 10,

  // imgSelector: 'data-src',
  // bgSelector: 'data-bg-src'

  //ignoreNodeImgSize: false,
  //saveNodeImgRatio: false,
  //ignoreStyleImgSize: false,
  //destroyNodeImgSize: false,
  //detectImageNodeCSS: false,
  //processOnlyWidth: false,
  //
  //onImageLoad: function (image) {
  //  console.log(image.width, image.height);
  //}
});

window.lazySizes.init();