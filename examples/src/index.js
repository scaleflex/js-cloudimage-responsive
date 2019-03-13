import '../../src';
import './style.css';
import './assets/fonts/helvetica-neue.css';
import hljs from 'highlight.js/lib/highlight';
import javascript from 'highlight.js/lib/languages/javascript';
import 'highlight.js/styles/github.css';
hljs.registerLanguage('javascript', javascript);
hljs.initHighlightingOnLoad();

const spinner = document.getElementById('spinner');
const wrapper = document.getElementById('main');
const ciResponsive = new window.CIResponsive({
  token: 'demo',
  baseUrl: 'https://cloudimage.public.airstore.io/demo/',
  filters: 'q35.foil1',
  queryString: '?&size_info=1&v2',
  lazyLoadOffset: 100,
  lazyLoading: true
});


ciResponsive.init();

window.lazySizes.init();

wrapper.classList.add('active');
spinner.style.display = 'none';
