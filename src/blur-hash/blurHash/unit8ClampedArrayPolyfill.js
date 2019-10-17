if (!window.Uint8ClampedArray && window.Uint8Array && window.ImageData) {
  window.Uint8ClampedArray = function(input,arg1,arg2) {
    var len = 0;
    if (typeof input == "undefined") { }
    else if (!isNaN(parseInt(input.length))) { //an array, yay
      len = input.length;
    }
    else if (input instanceof ArrayBuffer) {
      return new Uint8ClampedArray(new Uint8Array(input,arg1,arg2));
    }
    else {
      len = parseInt(input);
      if (isNaN(len) || len < 0) {
        throw new RangeError();
      }
      input = undefined;
    }
    len = Math.ceil(len / 4);

    if (len == 0) len = 1;

    var array = document.createElement("canvas")
      .getContext("2d")
      .createImageData(len, 1)
      .data;

    if (typeof input != "undefined") {
      for (var i=0;i<input.length;i++) {
        array[i] = input[i];
      }
    }
    try {
      Object.defineProperty(array,"buffer",{
        get: function() {
          return new Uint8Array(this).buffer;
        }
      });
    } catch(e) { try {
      array.__defineGetter__("buffer",function() {
        return new Uint8Array(this).buffer;
      });
    } catch(e) {} }
    return array;
  }
}