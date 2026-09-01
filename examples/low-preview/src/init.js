window.ciResponsive = new window.CIResponsive({
  token: 'scaleflex',
  baseURL: 'demo/cloudimage-responsive-demo/',
  params: 'org_if_sml=1',
  lazyLoading: true,
  apiVersion: 'v7',
  lowQualityPreview: {
    minImgWidth: 180,
  },
  doNotReplaceURL: false,
});

window.lazySizes.init();
