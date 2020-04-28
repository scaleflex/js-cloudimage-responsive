import '../../../src/blur-hash';
import './style.css';
import './assets/fonts/helvetica-neue.css';
import javascript from 'highlight.js/lib/languages/javascript';
import 'highlight.js/styles/github.css';
import { debounce } from 'throttle-debounce';
window.hljs.registerLanguage('javascript', javascript);
window.hljs.initHighlightingOnLoad();

const spinner = document.getElementById('spinner');
const wrapper = document.getElementById('main');

window.ciResponsive = new window.CIResponsive({
  token: 'demo',
  baseURL: 'https://cloudimage.public.airstore.io/demo/',
  params: 'ci_info=1&org_if_sml=1&version=16.04.2020',
  lazyLoadOffset: 100,
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

wrapper.classList.add('active');
spinner.style.display = 'none';

/*
*  logic for image containers;
*/

const containerBox = document.querySelectorAll('.container-width-box:not(.custom)');
const windowBox = document.querySelectorAll('.window-width-box:not(.custom)');
const devicePixelRatio = document.querySelector('#device-pixel-ratio span');
const setBoxSizes = () => {
  [].slice.call(containerBox).forEach(box => {
    box.querySelector('span').innerText = box.offsetWidth;
  });
};
const setWindowBoxes = () => {
  [].slice.call(windowBox).forEach(box => {
    box.querySelector('span').innerText = window.innerWidth.toString() + 'px';
  });
}

setBoxSizes();
setWindowBoxes();

devicePixelRatio.innerText = window.devicePixelRatio.toFixed(1);
window.onresize = debounce(400, () => {
  setBoxSizes();
  setWindowBoxes();
});