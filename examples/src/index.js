import '../../src';
import './style.css';

const ciResponsive = new window.CIResponsive({
  token: 'demo',
  baseUrl: 'https://cloudimage.public.airstore.io/demo/',
  filters: 'q35.foil1',
  queryString: '?&size_info=1',
  lazyLoadOffset: 100,
  lazyLoading: true
});


ciResponsive.init();

window.lazySizes.init();
