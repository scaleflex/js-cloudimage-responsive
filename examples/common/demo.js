import { debounce } from "throttle-debounce";
import { copyTextToClipboard, getElementById, checkElementVisibility} from "./utils";

const codeTabs = document.querySelectorAll("[code-tab]");
const accordions = document.querySelectorAll("[data-accordion]");
const copyButtons = document.querySelectorAll(".copy-button");
const containerBox = document.querySelectorAll('.container-width-box:not(.custom)');
const windowBox = document.querySelectorAll('.window-width-box:not(.custom)');
const devicePixelRatio = document.querySelector('#device-pixel-ratio span');
const devicePixelRatioContainer = getElementById('device-pixel-ratio');

const jsCode = getElementById("js-code");
const jsCodeWrapper = getElementById("js-code-block");
const reactCode = getElementById("react-code");
const reactCodeWrapper = getElementById("react-code-block");
const angularCode = getElementById("angular-code");
const angularCodeWrapper = getElementById("angular-code-block");
const vueCode = getElementById("vue-code");
const vueCodeWrapper = getElementById("vue-code-block");

const bgCode = getElementById("bg-code");
const bgCopyButton = getElementById("bg-copy-button");

const leftColumnImage = getElementById("left-column-image");
const leftColumnImageSize = getElementById("left-column-image-size");

const heroSectionImage = getElementById("hero-section-image");
const heroSectionImageSize = getElementById("hero-section-image-size");

const firstHorizontalImage = getElementById("first-horizontal-image");
const firstHorizontalImageSize = getElementById("first-horizontal-image-size");
const secondHorizontalImage = getElementById("second-horizontal-image");
const secondHorizontalImageSize = getElementById("second-horizontal-image-size");
const footerSection = getElementById("footer-section");

const rightColumnFirstImage = getElementById("right-column-first-image");
const rightColumnFirstImageSize = getElementById("right-column-first-image-size");
const rightColumnSecondImage = getElementById("right-column-second-image");
const rightColumnSecondImageSize = getElementById("right-column-second-image-size");

const EXAMPLE_CODE_TABS = {
  js: jsCodeWrapper,
  react: reactCodeWrapper,
  angular: angularCodeWrapper,
  vue: vueCodeWrapper,
};

const EXAMPLE_CODE = {
  js: jsCode,
  react: reactCode,
  angular: angularCode,
  vue: vueCode,
};

function copyVersionCodeHandler(event) {
  const copyButton = event.currentTarget.getElementsByTagName("p")[0];
  const currentCodeTab = document.querySelector("[selected-tab]");
  const currentCodeToCopy = EXAMPLE_CODE[currentCodeTab.id];

  copyTextToClipboard(currentCodeToCopy.innerText);
  copyButton.innerHTML = "Copied";

  setTimeout(() => {
    copyButton.innerHTML = "Copy";
  }, 500);
}

function copyBackgroundCodeHandler(event) {
  const copyButton = event.currentTarget.getElementsByTagName("p")[0];

  copyTextToClipboard(bgCode.innerText);
  copyButton.innerHTML = "Copied";

  setTimeout(() => {
    copyButton.innerHTML = "Copy";
  }, 500);
}

function changeCodeTabHandler(event) {
  const selectedTab = event.target;
  const selectedTabId = event.target.id;
  const selectedCodeBlock = EXAMPLE_CODE_TABS[selectedTabId];

  const prevCodeTab = document.querySelector("[selected-tab]");

  if (prevCodeTab) {
    prevCodeTab.removeAttribute("selected-tab");
  }

  Object.values(EXAMPLE_CODE_TABS)
    .forEach((codeTab) => {
      codeTab.style.display = "none";
    });

  selectedCodeBlock.style.display = "unset";

  selectedTab.setAttribute("selected-tab", "");
}

function showAccordionContent(event) {
  const contentID = event.target.getAttribute("data-accordion");
  const accordionContent = document.querySelector(`[data-accordion-content="${contentID}"]`);

  accordionContent.style.display = !accordionContent.offsetWidth ? "block" : "none";
}

function updateImageAndBoxSize() {
  setBoxSizes();
  setWindowBoxes();

  devicePixelRatio.innerText = window.devicePixelRatio.toFixed(1);
  heroSectionImageSize.innerHTML = heroSectionImage.offsetWidth;

  leftColumnImageSize.innerHTML = leftColumnImage.offsetWidth;
  rightColumnFirstImageSize.innerHTML = rightColumnFirstImage.offsetWidth;
  rightColumnSecondImageSize.innerHTML = rightColumnSecondImage.offsetWidth;

  firstHorizontalImageSize.innerHTML = firstHorizontalImage.offsetWidth;
  secondHorizontalImageSize.innerHTML = secondHorizontalImage.offsetWidth;
}

const setBoxSizes = () => {
  [].slice.call(containerBox).forEach((box) => {
    box.querySelector('span').innerText = box.offsetWidth;
  });
}

const setWindowBoxes = () => {
  [].slice.call(windowBox).forEach((box) => {
    box.querySelector('span').innerText = window.innerWidth.toString() + 'px';
  });
}

const hideWindowBoxSize = () => {
  const isFooterSectionVisible = checkElementVisibility(footerSection);

  if(isFooterSectionVisible) {
    devicePixelRatioContainer.style.transform  = "translateX(336px)"
  }else {
    devicePixelRatioContainer.style.transform  = "translate(0)"
  }
}

window.addEventListener("resize", debounce(400, () => updateImageAndBoxSize()));
window.addEventListener("load", updateImageAndBoxSize);
window.addEventListener('scroll', hideWindowBoxSize);

bgCopyButton.addEventListener("click", copyBackgroundCodeHandler);

copyButtons.forEach((copyButton) =>
  copyButton.addEventListener("click", copyVersionCodeHandler),
);

codeTabs.forEach((tab) => {
  tab.addEventListener("click", changeCodeTabHandler);
});

accordions.forEach((accordion) => {
  accordion.addEventListener("click", showAccordionContent);
});