/* eslint-disable */
(function (window, factory) {
  window.lazySizes = factory(window, window.document);
}(window, (window, document) => {
  /* jshint eqnull:true */
  if (!window.IntersectionObserver || !document.getElementsByClassName || !window.MutationObserver) { return; }

  let lazysizes; let
    lazySizesConfig;

  const docElem = document.documentElement;

  const { Date } = window;

  const supportPicture = window.HTMLPictureElement;

  const _addEventListener = 'addEventListener';

  const _getAttribute = 'getAttribute';

  const addEventListener = window[_addEventListener];

  const { setTimeout } = window;

  const requestAnimationFrame = window.requestAnimationFrame || setTimeout;

  const requestIdleCallback = window.requestIdleCallback || setTimeout;

  const regPicture = /^picture$/i;

  const loadEvents = ['load', 'error', 'lazyincluded', '_lazyloaded'];

  const { forEach } = Array.prototype;

  const hasClass = function (ele, cls) {
    return ele.classList.contains(cls);
  };

  const addClass = function (ele, cls) {
    ele.classList.add(cls);
  };

  const removeClass = function (ele, cls) {
    ele.classList.remove(cls);
  };

  var addRemoveLoadEvents = function (dom, fn, add) {
    const action = add ? _addEventListener : 'removeEventListener';
    if (add) {
      addRemoveLoadEvents(dom, fn);
    }
    loadEvents.forEach((evt) => {
      dom[action](evt, fn);
    });
  };

  const triggerEvent = function (elem, name, detail, noBubbles, noCancelable) {
    const event = document.createEvent('CustomEvent');

    if (!detail) {
      detail = {};
    }

    detail.instance = lazysizes;

    event.initCustomEvent(name, !noBubbles, !noCancelable, detail);

    elem.dispatchEvent(event);
    return event;
  };

  const updatePolyfill = function (el, full) {
    let polyfill;
    if (!supportPicture && (polyfill = (window.picturefill || lazySizesConfig.pf))) {
      polyfill({ reevaluate: true, elements: [el] });
    } else if (full && full.src) {
      el.src = full.src;
    }
  };

  const getWidth = function (elem, parent, width) {
    width = width || elem.offsetWidth;

    while (width < lazySizesConfig.minSize && parent && !elem._lazysizesWidth) {
      width = parent.offsetWidth;
      parent = parent.parentNode;
    }

    return width;
  };

  const rAF = (function () {
    let running; let
      waiting;
    const fns = [];

    const run = function () {
      let fn;
      running = true;
      waiting = false;
      while (fns.length) {
        fn = fns.shift();
        fn[0].apply(fn[1], fn[2]);
      }
      running = false;
    };

    return function (fn) {
      if (running) {
        fn.apply(this, arguments);
      } else {
        fns.push([fn, this, arguments]);

        if (!waiting) {
          waiting = true;
          (document.hidden ? setTimeout : requestAnimationFrame)(run);
        }
      }
    };
  }());

  const rAFIt = function (fn, simple) {
    return simple
      ? function () {
        rAF(fn);
      }
      : function () {
        const that = this;
        const args = arguments;
        rAF(() => {
          fn.apply(that, args);
        });
      };
  };

  // based on http://modernjavascript.blogspot.de/2013/08/building-better-debounce.html
  const debounce = function (func) {
    let timeout; let
      timestamp;
    const wait = 99;
    const run = function () {
      timeout = null;
      func();
    };
    var later = function () {
      const last = Date.now() - timestamp;

      if (last < wait) {
        setTimeout(later, wait - last);
      } else {
        (requestIdleCallback || run)(run);
      }
    };

    return function () {
      timestamp = Date.now();

      if (!timeout) {
        timeout = setTimeout(later, wait);
      }
    };
  };


  const loader = (function () {
    let inviewObserver; let
      preloadObserver;

    let lazyloadElems; let isCompleted; let resetPreloadingTimer; let
      started;

    const regImg = /^img$/i;
    const regIframe = /^iframe$/i;

    const supportScroll = ('onscroll' in window) && !(/glebot/.test(navigator.userAgent));

    let isLoading = 0;
    let isPreloadLoading = 0;

    var resetPreloading = function (e) {
      isLoading--;

      if (isPreloadLoading) {
        isPreloadLoading--;
      }

      if (e && e.target) {
        addRemoveLoadEvents(e.target, resetPreloading);
      }

      if (!e || isLoading < 0 || !e.target) {
        isLoading = 0;
        isPreloadLoading = 0;
      }

      if (lazyQuedElements.length && (isLoading - isPreloadLoading) < 1 && isLoading < 3) {
        setTimeout(() => {
          while (lazyQuedElements.length && (isLoading - isPreloadLoading) < 1 && isLoading < 4) {
            lazyUnveilElement({ target: lazyQuedElements.shift() });
          }
        });
      }
    };

    const switchLoadingClass = function (e) {
      addClass(e.target, lazySizesConfig.loadedClass);
      removeClass(e.target, lazySizesConfig.loadingClass);
      addRemoveLoadEvents(e.target, rafSwitchLoadingClass);
    };
    const rafedSwitchLoadingClass = rAFIt(switchLoadingClass);
    var rafSwitchLoadingClass = function (e) {
      rafedSwitchLoadingClass({ target: e.target });
    };

    const changeIframeSrc = function (elem, src) {
      try {
        elem.contentWindow.location.replace(src);
      } catch (e) {
        elem.src = src;
      }
    };

    const handleSources = function (source) {
      let customMedia;

      const sourceSrcset = source[_getAttribute](lazySizesConfig.srcsetAttr);

      if ((customMedia = lazySizesConfig.customMedia[source[_getAttribute]('data-media') || source[_getAttribute]('media')])) {
        source.setAttribute('media', customMedia);
      }

      if (sourceSrcset) {
        source.setAttribute('srcset', sourceSrcset);
      }
    };

    const lazyUnveil = rAFIt((elem, detail, isAuto, sizes, isImg) => {
      let src; let srcset; let parent; let isPicture; let event; let
        firesLoad;

      if (!(event = triggerEvent(elem, 'lazybeforeunveil', detail)).defaultPrevented) {
        if (sizes) {
          if (isAuto) {
            addClass(elem, lazySizesConfig.autosizesClass);
          } else {
            elem.setAttribute('sizes', sizes);
          }
        }

        srcset = elem[_getAttribute](lazySizesConfig.srcsetAttr);
        src = elem[_getAttribute](lazySizesConfig.srcAttr);

        if (isImg) {
          parent = elem.parentNode;
          isPicture = parent && regPicture.test(parent.nodeName || '');
        }

        firesLoad = detail.firesLoad || (('src' in elem) && (srcset || src || isPicture));

        event = { target: elem };

        if (firesLoad) {
          addRemoveLoadEvents(elem, resetPreloading, true);
          clearTimeout(resetPreloadingTimer);
          resetPreloadingTimer = setTimeout(resetPreloading, 2500);

          addClass(elem, lazySizesConfig.loadingClass);
          addRemoveLoadEvents(elem, rafSwitchLoadingClass, true);
        }

        if (isPicture) {
          forEach.call(parent.getElementsByTagName('source'), handleSources);
        }

        if (srcset) {
          elem.setAttribute('srcset', srcset);
        } else if (src && !isPicture) {
          if (regIframe.test(elem.nodeName)) {
            changeIframeSrc(elem, src);
          } else {
            elem.src = src;
          }
        }

        if (srcset || isPicture) {
          updatePolyfill(elem, { src });
        }
      }

      rAF(() => {
        if (elem._lazyRace) {
          delete elem._lazyRace;
        }
        removeClass(elem, lazySizesConfig.lazyWaitClass);

        if (!firesLoad || elem.complete) {
          if (firesLoad) {
            resetPreloading(event);
          } else {
            isLoading--;
          }
          switchLoadingClass(event);
        }
      });
    });

    const unveilElement = function (elem) {
      let detail; let
        index;
      const isImg = regImg.test(elem.nodeName);

      // allow using sizes="auto", but don't use. it's invalid. Use data-sizes="auto" or a valid value for sizes instead (i.e.: sizes="80vw")
      const sizes = isImg && (elem[_getAttribute](lazySizesConfig.sizesAttr) || elem[_getAttribute]('sizes'));
      const isAuto = sizes == 'auto';

      if ((isAuto || !isCompleted) && isImg && (elem.src || elem.srcset) && !elem.complete && !hasClass(elem, lazySizesConfig.errorClass)) { return; }

      detail = triggerEvent(elem, 'lazyunveilread').detail;

      if (isAuto) {
        autoSizer.updateElem(elem, true, elem.offsetWidth);
      }

      isLoading++;

      if ((index = lazyQuedElements.indexOf(elem)) != -1) {
        lazyQuedElements.splice(index, 1);
      }

      inviewObserver.unobserve(elem);
      preloadObserver.unobserve(elem);

      lazyUnveil(elem, detail, isAuto, sizes, isImg);
    };
    const unveilElements = function (change) {
      let i; let
        len;
      for (i = 0, len = change.length; i < len; i++) {
        if (change[i].isIntersecting === false) {
          continue;
        }
        unveilElement(change[i].target);
      }
    };

    var lazyQuedElements = [];

    var lazyUnveilElement = function (change) {
      let index; let i; let len; let
        element;

      for (i = 0, len = change.length; i < len; i++) {
        element = change[i].target;
        if ((isLoading - isPreloadLoading) < 1 && isLoading < 4) {
          isPreloadLoading++;
          unveilElement(element);
        } else if ((index = lazyQuedElements.indexOf(element)) == -1) {
          lazyQuedElements.push(element);
        } else {
          lazyQuedElements.splice(index, 1);
        }
      }
    };

    const removeLazyClassElements = [];

    const removeLazyClass = rAFIt(() => {
      let element;

      while (removeLazyClassElements.length) {
        element = removeLazyClassElements.shift();
        addClass(element, lazySizesConfig.lazyWaitClass);
        removeClass(element, lazySizesConfig.lazyClass);

        if (element._lazyAdd) {
          delete element._lazyAdd;
        }
      }
    }, true);

    const addElements = function () {
      let i; let len; let
        runLazyRemove;
      for (i = 0, len = lazyloadElems.length; i < len; i++) {
        if (!lazyloadElems[i]._lazyAdd) {
          lazyloadElems[i]._lazyAdd = true;

          inviewObserver.observe(lazyloadElems[i]);
          preloadObserver.observe(lazyloadElems[i]);

          removeLazyClassElements.push(lazyloadElems[i]);
          runLazyRemove = true;

          if (!supportScroll) {
            unveilElement(lazyloadElems[i]);
          }
        }
      }

      if (runLazyRemove) {
        removeLazyClass();
      }
    };

    return {
      _() {
        started = Date.now();

        lazyloadElems = document.getElementsByClassName(lazySizesConfig.lazyClass);

        inviewObserver = new IntersectionObserver(unveilElements);
        preloadObserver = new IntersectionObserver(lazyUnveilElement, {
          rootMargin: `${lazySizesConfig.expand}px ${lazySizesConfig.expand * lazySizesConfig.hFac}px`,
        });

        new MutationObserver(addElements).observe(docElem, { childList: true, subtree: true, attributes: true });

        addElements();
      },
      unveil: unveilElement,
    };
  }());


  var autoSizer = (function () {
    let autosizesElems;

    const sizeElement = rAFIt((elem, parent, event, width) => {
      let sources; let i; let
        len;
      elem._lazysizesWidth = width;
      width += 'px';

      elem.setAttribute('sizes', width);

      if (regPicture.test(parent.nodeName || '')) {
        sources = parent.getElementsByTagName('source');
        for (i = 0, len = sources.length; i < len; i++) {
          sources[i].setAttribute('sizes', width);
        }
      }

      if (!event.detail.dataAttr) {
        updatePolyfill(elem, event.detail);
      }
    });
    const getSizeElement = function (elem, dataAttr, width) {
      let event;
      const parent = elem.parentNode;

      if (parent) {
        width = getWidth(elem, parent, width);
        event = triggerEvent(elem, 'lazybeforesizes', { width, dataAttr: !!dataAttr });

        if (!event.defaultPrevented) {
          width = event.detail.width;

          if (width && width !== elem._lazysizesWidth) {
            sizeElement(elem, parent, event, width);
          }
        }
      }
    };

    const updateElementsSizes = function () {
      let i;
      const len = autosizesElems.length;
      if (len) {
        i = 0;

        for (; i < len; i++) {
          getSizeElement(autosizesElems[i]);
        }
      }
    };

    const debouncedUpdateElementsSizes = debounce(updateElementsSizes);

    return {
      _() {
        autosizesElems = document.getElementsByClassName(lazySizesConfig.autosizesClass);
        addEventListener('resize', debouncedUpdateElementsSizes);
      },
      checkElems: debouncedUpdateElementsSizes,
      updateElem: getSizeElement,
    };
  }());

  var init = function () {
    if (!init.i) {
      init.i = true;
      autoSizer._();
      loader._();
    }
  };

  (function () {
    let prop;

    const lazySizesDefaults = {
      lazyClass: 'lazyload',
      lazyWaitClass: 'lazyloadwait',
      loadedClass: 'lazyloaded',
      loadingClass: 'lazyloading',
      preloadClass: 'lazypreload',
      errorClass: 'lazyerror',
      // strictClass: 'lazystrict',
      autosizesClass: 'lazyautosizes',
      srcAttr: 'data-src',
      srcsetAttr: 'data-srcset',
      sizesAttr: 'data-sizes',
      minSize: 40,
      customMedia: {},
      init: true,
      hFac: 0.8,
      loadMode: 2,
      expand: 400,
    };

    lazySizesConfig = window.lazySizesConfig || window.lazysizesConfig || {};

    for (prop in lazySizesDefaults) {
      if (!(prop in lazySizesConfig)) {
        lazySizesConfig[prop] = lazySizesDefaults[prop];
      }
    }

    window.lazySizesConfig = lazySizesConfig;

    setTimeout(() => {
      if (lazySizesConfig.init) {
        init();
      }
    });
  }());

  lazysizes = {
    cfg: lazySizesConfig,
    autoSizer,
    loader,
    init,
    uP: updatePolyfill,
    aC: addClass,
    rC: removeClass,
    hC: hasClass,
    fire: triggerEvent,
    gW: getWidth,
    rAF,
  };

  return lazysizes;
}));
