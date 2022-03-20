const getElementById =(id) => {
  return document.getElementById(id)
}

const copyTextToClipboard = (text) => {
  navigator.clipboard.writeText(text);
}

export {
  getElementById,
  copyTextToClipboard
}