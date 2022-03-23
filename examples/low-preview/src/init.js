window.ciResponsive = new window.CIResponsive({
  token: "scaleflex",
  baseURL: "https://scaleflex.cloudimg.io/v7/demo/cloudimage-responsive-demo/",
  params: 'org_if_sml=1',
  lazyLoading: true,
  apiVersion: 'v7',
  lowQualityPreview: {
    minImgWidth: 180
  }
});

window.lazySizes.init();
