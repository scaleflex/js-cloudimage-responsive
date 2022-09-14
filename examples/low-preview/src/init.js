window.ciResponsive = new window.CIResponsive({
  baseURL: 'https://scaleflex.cloudimg.io/v7/demo/cloudimage-responsive-demo/',
  params: 'org_if_sml=1',
  lazyLoading: true,
  apiVersion: null,
  lowQualityPreview: {
    minImgWidth: 180,
  },
  doNotReplaceURL: true,
});

window.lazySizes.init();
