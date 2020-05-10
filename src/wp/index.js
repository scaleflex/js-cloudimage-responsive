import 'core-js/features/array/find';
import 'core-js/es/math/trunc';
import CIResponsive from '../plain/ci.service';


window.CIResponsive = CIResponsive;

if (window.CIResponsiveConfig) {
  window.ciResponsive = new window.CIResponsive(window.CIResponsiveConfig);
}

if (window.CIResponsiveConfig && window.lazySizes) {
  window.lazySizes.init();
}