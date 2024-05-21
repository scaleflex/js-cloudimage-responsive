window.ciResponsive = new window.CIResponsive({
  token: 'scaleflex',
  baseURL: 'demo/cloudimage-responsive-demo/',
  params: 'org_if_sml=1',
  lazyLoadOffset: 100,
  apiVersion: 'v7',
  lazyLoading: true,
  exactSize: false,
  limitFactor: 10,
  doNotReplaceURL: false,
});

window.lazySizes.init();
