import { addClass } from '../common/ci.utils';


export const loadBackgroundImage = (event) => {
  const bgContainer = event.target;
  const bg = bgContainer.getAttribute('data-bg');

  if (bg) {
    let optimizedImage = new Image();

    optimizedImage.onload = () => {
      addClass(bgContainer, 'ci-image-loaded');
      bgContainer.removeAttribute('data-bg');
      bgContainer.removeAttribute('ci-preview');
    }

    optimizedImage.src = bg;

    bgContainer.style.backgroundImage = 'url(' + bg + ')';
  }
};

export const initImageClasses = ({ imgNode, lazy }) => {
  addClass(imgNode, 'ci-image');

  if (lazy) {
    addClass(imgNode, 'lazyload');
  }
};

export const initImageBackgroundClasses = ({ imgNode, lazy }) => {
  addClass(imgNode, 'ci-bg');

  if (lazy) {
    addClass(imgNode, 'lazyload');
  }
};