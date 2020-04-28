import './style.css';
import './fonts/helvetica-neue.css';
import { debounce } from 'throttle-debounce';
import javascript from 'highlight.js/lib/languages/javascript';
import 'highlight.js/styles/github.css';

window.hljs.registerLanguage('javascript', javascript);
window.hljs.initHighlightingOnLoad();
/*
*  logic for image containers;
*/

const spinner = document.getElementById('spinner');
const wrapper = document.getElementById('main');
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




wrapper.classList.add('active');
spinner.style.display = 'none';
