if(window.CanvasPixelArray) {
  CanvasPixelArray.prototype.set = function(arr) {
    var l=this.length, i=0;

    for(;i<l;i++) {
      this[i] = arr[i];
    }
  };
}
(() => {
  try {
    new window.ImageData(new Uint8ClampedArray([0, 0, 0, 0]), 1, 1);
  } catch (e) {
    function ImageDataPolyfill () {
      let args = [...arguments], data;

      if (args.length < 2) {
        throw new TypeError(`
          Failed to construct 'ImageData': 2 arguments required, but only ${args.length} present.
        `);
      }

      if (args.length > 2) {
        data = args.shift();

        if (!(data instanceof Uint8ClampedArray)) {
          throw new TypeError(`
            Failed to construct 'ImageData': parameter 1 is not of type 'Uint8ClampedArray'
          `);
        }

        if (data.length !== 4 * args[0] * args[1]) {
          throw new Error(`
            Failed to construct 'ImageData': The input data byte length is not a multiple of (4 * width * height)
          `);
        }
      }

      const width = args[0],
        height = args[1],
        canvas = document.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        imageData = ctx.createImageData(width, height);

      if (data) imageData.data.set(data);
      return imageData;
    };

    window.ImageData = ImageDataPolyfill;
  }
})();