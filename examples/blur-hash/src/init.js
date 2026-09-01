window.ciResponsive = new window.CIResponsive({
  token: 'scaleflex',
  baseURL: 'demo/cloudimage-responsive-demo/',
  params: 'org_if_sml=1',
  lazyLoadOffset: 100,
  apiVersion: 'v7',
  doNotReplaceURL: false,
  lazyLoading: true,
});

setTimeout(() => {
  window.ciResponsive.process();
}, 1000);
setTimeout(() => {
  window.ciResponsive.process();
}, 2000);
setTimeout(() => {
  window.ciResponsive.process();
}, 4000);

window.lazySizes.init();
