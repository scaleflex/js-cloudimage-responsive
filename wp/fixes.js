window.onload = function() {
  var carousels = $('.carousel');
  var number = $('.carousel').length;

  if (number > 0) {
    carousels.on('slide.bs.carousel', function () {
      window.dispatchEvent(new Event('resize'));
    });
  }
};