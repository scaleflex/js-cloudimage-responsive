const getElementById =(id) => {
  return document.getElementById(id)
}

const copyTextToClipboard = (text) => {
  navigator.clipboard.writeText(text);
}

const checkElementVisibility = (boundryElement) => {
  const rect = boundryElement.getBoundingClientRect();
  const offset = 250;

  return rect.bottom - offset <= window.innerHeight;
}

export {
  getElementById,
  copyTextToClipboard,
  checkElementVisibility
}