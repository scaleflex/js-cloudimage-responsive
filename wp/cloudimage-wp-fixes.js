window.onload = function() {
  var carousels = $('.carousel');
  var number = $('.carousel').length;

  if (number > 0) {
    carousels.on('slide.bs.carousel', function () {
      window.dispatchEvent(new Event('resize'));
    });
  }
};


(function() {
  window.ciResponsive = window.ciResponsive || {};
  window.cloudimgResponsive = window.cloudimgResponsive || {};
  window.ciResponsive.getImages = function () {
    return [].slice.call(document.images ? document.images : document.getElementsByTagName('img'), 0);
  };

  setInterval(function() {
    var imageList = window.ciResponsive.getImages(), process = false;
    imageList.forEach(function(image) {
      if (!image.src && image.getAttribute('ci-src') && !image.getAttribute('data-src')) { process = true; }
    });
    if (process) { window.cloudimgResponsive.process && window.cloudimgResponsive.process(); }
  }, 1000)
})();