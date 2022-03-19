import '../../../src/plain';
import './init';
import { getElementById } from "../../low-preview/src/utils";

const codeTabs = document.querySelectorAll("[code-tab]");
const accordions = document.querySelectorAll("[data-accordion]");
const copyButtons = document.querySelectorAll(".copy-button");

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

const carImage = getElementById("car-image");
const originalCarImageSize = getElementById("original-car-image-size");
const cropCarImageSize = getElementById("crop-car-image-size");
const autoCropCarImageSize = getElementById("auto-crop-car-image-size");

const firstHorizontalImage = getElementById("first-horizontal-image");
const firstHorizontalImageSize = getElementById("first-horizontal-image-size");
const secondHorizontalImage = getElementById("second-horizontal-image");
const secondHorizontalImageSize = getElementById("second-horizontal-image-size");

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

  navigator.clipboard.writeText(currentCodeToCopy.innerText);

  copyButton.innerHTML = "copied";

  setTimeout(() => {
    copyButton.innerHTML = "copy";
  }, 500);
}

function copyBackgroundCodeHandler(event) {
  const copyButton = event.currentTarget.getElementsByTagName("p")[0];

  navigator.clipboard.writeText(bgCode.innerText);

  copyButton.innerHTML = "copied";

  setTimeout(() => {
    copyButton.innerHTML = "copy";
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

  Object.values(EXAMPLE_CODE_TABS).forEach((codeTab) => {
    codeTab.style.display = "none";
  });

  selectedCodeBlock.style.display = "unset";

  selectedTab.setAttribute("selected-tab", "");
}

function showAccordionContent(event) {
  const contentID = event.target.getAttribute("data-accordion");
  const accordionContent = document.querySelector(
    ` [data-accordion-content="${contentID}"]`,
  );

  accordionContent.style.display = !accordionContent.offsetWidth ? "block" : "none";
}

function updateImageSize() {
  originalCarImageSize.innerHTML = carImage.offsetWidth;
  cropCarImageSize.innerHTML = carImage.offsetWidth;
  autoCropCarImageSize.innerHTML = carImage.offsetWidth;

  leftColumnImageSize.innerHTML = leftColumnImage.offsetWidth;
  rightColumnFirstImageSize.innerHTML = rightColumnFirstImage.offsetWidth;
  rightColumnSecondImageSize.innerHTML = rightColumnSecondImage.offsetWidth;

  firstHorizontalImageSize.innerHTML = firstHorizontalImage.offsetWidth;
  secondHorizontalImageSize.innerHTML = secondHorizontalImage.offsetWidth;
}

window.addEventListener("resize", updateImageSize);
window.addEventListener("load", updateImageSize);
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