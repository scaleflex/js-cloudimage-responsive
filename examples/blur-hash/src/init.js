window.ciResponsive = new window.CIResponsive({
  token: 'demo',
  baseURL: 'https://cloudimage.public.airstore.io/demo/',
  params: 'ci_info=1&org_if_sml=1&version=16.04.2020',
  lazyLoadOffset: 100,
  apiVersion: 'v7',
  lazyLoading: true,
  exactSize: false,
  limitFactor: 10
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
