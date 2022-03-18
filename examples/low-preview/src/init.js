window.ciResponsive = new window.CIResponsive({
  token: "scaleflex",
  baseURL: "https://scaleflex.cloudimg.io/v7/demo/cloudimage-responsive-demo/",
  params: 'org_if_sml=1&version=16.04.2020',
  lazyLoading: true,
  exactSize: false,
  limitFactor: 10,
  apiVersion: 'v7',
  lowQualityPreview: {
    minImgWidth: 180
  }
});

window.lazySizes.init();
