window.ciResponsive = new window.CIResponsive({
  baseURL: "https://scaleflex.cloudimg.io/v7/demo/cloudimage-responsive-demo/",
  params: 'org_if_sml=1&version=16.04.2020',
  lazyLoadOffset: 100,
  apiVersion: 'v7',
  lazyLoading: true,
  exactSize: false,
  limitFactor: 10,
  doNotReplaceURL: true,
});

window.lazySizes.init();
