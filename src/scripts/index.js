const codeTabs = document.querySelectorAll("[code-tab]");
const accordions = document.querySelectorAll("[data-accordion]");

const jsCode = document.getElementById("js-code");
const jsCodeWrapper = document.getElementById("js-code-block");
const reactCode = document.getElementById("react-code");
const reactCodeWrapper = document.getElementById("react-code-block");
const angularCode = document.getElementById("angular-code");
const angularCodeWrapper = document.getElementById("angular-code-block");
const vueCode = document.getElementById("vue-code");
const vueCodeWrapper = document.getElementById("vue-code-block");

const bgCode = document.getElementById("bg-code");
const bgCopyButton = document.getElementById("bg-copy-button");
const copyButtons = document.querySelectorAll(".copy-button");

const leftColumnImage = document.getElementById("left-column-image");
const leftColumnImageSize = document.getElementById("left-column-image-size");

const carImage = document.getElementById("car-image");
const carImageSize = document.getElementById("car-image-size");
const secondCarImage = document.getElementById("second-car-image");
const secondCarImageSize = document.getElementById("second-car-image-size");
const thirdCarImage = document.getElementById("third-car-image");
const thirdCarImageSize = document.getElementById("third-car-image-size");

const firstCodeBlockWidth = document.getElementById("first-code-block-width");
const firstCodeBlockHeight = document.getElementById("first-code-block-height");
const secondCodeBlockWidth = document.getElementById("second-code-block-width");
const secondCodeBlockHeight = document.getElementById(
  "second-code-block-height",
);
const thirdCodeBlockWidth = document.getElementById("third-code-block-width");
const thirdCodeBlockHeight = document.getElementById("third-code-block-height");

const firstHorizontalImage = document.getElementById("first-horizontal-image");
const firstHorizontalImageSize = document.getElementById(
  "first-horizontal-image-size",
);
const secondHorizontalImage = document.getElementById(
  "second-horizontal-image",
);
const secondHorizontalImageSize = document.getElementById(
  "second-horizontal-image-size",
);

const rightColumnFirstImage = document.getElementById(
  "right-column-first-image",
);
const rightColumnFirstImageSize = document.getElementById(
  "right-column-first-image-size",
);
const rightColumnSecondImage = document.getElementById(
  "right-column-second-image",
);
const rightColumnSecondImageSize = document.getElementById(
  "right-column-second-image-size",
);

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

  accordionContent.style.display = !accordionContent.offsetWidth
    ? "block"
    : "none";
}

function updateImageSize() {
  firstCodeBlockWidth.innerHTML = carImage.offsetWidth;
  firstCodeBlockHeight.innerHTML = carImage.offsetHeight;
  secondCodeBlockWidth.innerHTML = secondCarImage.offsetWidth;
  secondCodeBlockHeight.innerHTML = secondCarImage.offsetHeight;
  thirdCodeBlockWidth.innerHTML = thirdCarImage.offsetWidth;
  thirdCodeBlockHeight.innerHTML = thirdCarImage.offsetHeight;

  carImageSize.innerHTML = carImage.offsetWidth;
  secondCarImageSize.innerHTML = secondCarImage.offsetWidth;
  thirdCarImageSize.innerHTML = thirdCarImage.offsetWidth;

  leftColumnImageSize.innerHTML = leftColumnImage.offsetWidth;
  rightColumnFirstImageSize.innerHTML = rightColumnFirstImage.offsetWidth;
  rightColumnSecondImageSize.innerHTML = rightColumnSecondImage.offsetWidth;

  firstHorizontalImageSize.innerHTML = firstHorizontalImage.offsetWidth;
  secondHorizontalImageSize.innerHTML = secondHorizontalImage.offsetWidth;
}

function updateImageSizeOnLoad() {
  firstCodeBlockWidth.innerHTML = carImage.offsetWidth;
  firstCodeBlockHeight.innerHTML = carImage.offsetHeight;
  secondCodeBlockWidth.innerHTML = secondCarImage.offsetWidth;
  secondCodeBlockHeight.innerHTML = secondCarImage.offsetHeight;
  thirdCodeBlockWidth.innerHTML = thirdCarImage.offsetWidth;
  thirdCodeBlockHeight.innerHTML = thirdCarImage.offsetHeight;

  carImageSize.innerHTML = carImage.offsetWidth;
  secondCarImageSize.innerHTML = secondCarImage.offsetWidth;
  thirdCarImageSize.innerHTML = thirdCarImage.offsetWidth;

  leftColumnImageSize.innerHTML = leftColumnImage.offsetWidth;
  rightColumnFirstImageSize.innerHTML = rightColumnFirstImage.offsetWidth;
  rightColumnSecondImageSize.innerHTML = rightColumnSecondImage.offsetWidth;

  firstHorizontalImageSize.innerHTML = firstHorizontalImage.offsetWidth;
  secondHorizontalImageSize.innerHTML = secondHorizontalImage.offsetWidth;
}

window.addEventListener("resize", updateImageSize);
window.addEventListener("load", updateImageSizeOnLoad);
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
