window.ciResponsive = new window.CIResponsive({
  token: 'demo',
  baseURL: 'https://cloudimage.public.airstore.io/demo/',
  params: 'ci_info=1&org_if_sml=1&version=16.04.2020',
  lazyLoading: true,
  exactSize: false,
  limitFactor: 10,
  apiVersion: 'v7',
  lowQualityPreview: {
    minImgWidth: 180
  }
});

window.lazySizes.init();
