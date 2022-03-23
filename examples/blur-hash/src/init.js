window.ciResponsive = new window.CIResponsive({
  token: "scaleflex",
  baseURL: "https://scaleflex.cloudimg.io/v7/demo/cloudimage-responsive-demo/",
  params: 'org_if_sml=1&version=16.04.2020',
  lazyLoadOffset: 100,
  apiVersion: 'v7',
  lazyLoading: true,
});

setTimeout(() => {
  window.ciResponsive.process();
}, 1000)
setTimeout(() => {
  window.ciResponsive.process();
}, 2000)
setTimeout(() => {
  window.ciResponsive.process();
}, 4000)

window.lazySizes.init();
