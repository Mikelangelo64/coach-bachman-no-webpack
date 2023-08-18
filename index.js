//import { init } from './scripts/main';
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s)
            if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
var vevet = new Vevet.Application({
  tablet: 1199,
  phone: 899,
  prefix: 'v-',
  viewportResizeTimeout: 100,
  easing: [0.25, 0.1, 0.25, 1],
});
vevet.pageLoad.onLoaded(function () {
  //init();
  //scrollBarInit
  var scrollBar;
  if (!vevet.isMobile) {
    scrollBar = new Vevet.ScrollBar({ container: window });
  }
  //CONFIG
  //clearScrollListener
  var clearScrollListener = function (listener) {
    window.removeEventListener('scroll', listener);
  };
  var debounce = function (_a) {
    var callback = _a.callback,
      _b = _a.wait,
      wait = _b === void 0 ? 250 : _b,
      _c = _a.isImmediate,
      isImmediate = _c === void 0 ? false : _c;
    var timeout;
    return function () {
      var later = function () {
        timeout = undefined;
        callback();
      };
      var isCallNow = isImmediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (isCallNow) {
        callback();
      }
    };
  };
  var useObserver = function (_a) {
    var target = _a.target,
      callbackIn = _a.callbackIn,
      callbackOut = _a.callbackOut,
      _b = _a.isCallOnce,
      isCallOnce = _b === void 0 ? false : _b;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(
        function (entry) {
          var element = entry.target;
          if (entry.isIntersecting) {
            // console.log(entry, element);
            if (!callbackIn) {
              return;
            }
            callbackIn(element);
            if (isCallOnce) {
              observer.unobserve(element);
            }
          } else {
            if (!callbackOut) {
              return;
            }
            callbackOut(element);
          }
        },
        {
          root: null,
          threshold: 0,
          rootMargin: '0px 0px 0px 0px',
        }
      );
    });
    if (!target) {
      return undefined;
    }
    observer.observe(target);
    return observer;
  };
  //marqueeInit
  var listMarquee = document.querySelectorAll('.marquee');
  if (listMarquee.length !== 0) {
    listMarquee.forEach(function (item) {
      nodeMarquee({
        parent: item,
        resize: 'w',
        prependWhitespace: false,
        speed: item.classList.contains('reversed') ? -1 : 1,
      });
    });
  }
  var rotateItem = function (itemProps, section) {
    var item = itemProps;
    var progress = {
      current: 0,
      target: 0,
    };
    var frame = new Vevet.AnimationFrame({ fps: 60 });
    var render = function () {
      progress.current = Vevet.utils.math.lerp(
        progress.current,
        progress.target,
        0.1
      );
      item.style.transform = 'rotate('.concat(
        (progress.current - 0.5) * 10,
        'deg)'
      );
      if (progress.target === progress.current && frame.isPlaying) {
        frame.pause();
      }
    };
    frame.addCallback('frame', function () {
      render();
    });
    frame.play();
    var listener = function () {
      var rect = section.getBoundingClientRect();
      var startY = -1 * (rect.top - window.innerHeight);
      var y = Math.max(0, Math.min(startY, rect.height));
      progress.target = y / rect.height;
      // console.log((y / rect.height - 0.5) * 30);
      if (progress.target !== progress.current && !frame.isPlaying) {
        frame.play();
      }
    };
    window.addEventListener('scroll', listener);
    return { listener: listener, frame: frame };
  };
  //marqueeRotate
  var marqueeRotate = function () {
    var sectionArray = document.querySelectorAll('section.dark');
    if (sectionArray.length === 0) {
      return;
    }
    sectionArray.forEach(function (section) {
      var marqueeArray = section.querySelectorAll('.marquee');
      if (marqueeArray.length === 0) {
        return;
      }
      var listenerArray = [];
      var frameArray = [];
      useObserver({
        target: section,
        callbackIn: function () {
          marqueeArray.forEach(function (item) {
            if (!item) {
              return;
            }
            var _a = rotateItem(item, section),
              listener = _a.listener,
              frame = _a.frame;
            listenerArray.push(listener);
            frameArray.push(frame);
          });
        },
        callbackOut: function () {
          marqueeArray.forEach(function (itemProp) {
            var item = itemProp;
            if (!item) {
              return;
            }
            item.style.transform = '';
          });
          listenerArray.forEach(function (listener) {
            clearScrollListener(listener);
          });
          frameArray.forEach(function (frame) {
            frame.destroy();
          });
          listenerArray = [];
          frameArray = [];
        },
      });
    });
  };
  if (!vevet.isMobile) {
    marqueeRotate();
  }
  var makeSlider = function (_a) {
    var container = _a.container,
      className = _a.className,
      _b = _a.isThumb,
      isThumb = _b === void 0 ? false : _b,
      _c = _a.thumb,
      thumb = _c === void 0 ? undefined : _c,
      config = _a.config;
    if (!container || !className) {
      return undefined;
    }
    var slider =
      container.querySelector(
        '.'
          .concat(className, '-slider')
          .concat(isThumb ? '-thumb' : '', '.swiper')
      ) || null;
    if (!slider) {
      return undefined;
    }
    var arrowPrev = container.querySelector(
      '.'
        .concat(className, '-slider')
        .concat(isThumb ? '-thumb' : '', '-controls .')
        .concat(className, '-slider-prev')
    );
    var arrowNext = container.querySelector(
      '.'
        .concat(className, '-slider')
        .concat(isThumb ? '-thumb' : '', '-controls .')
        .concat(className, '-slider-next')
    );
    var sliderInit = new Swiper(
      slider,
      __assign(
        {
          thumbs: {
            swiper: thumb,
          },
          navigation: {
            nextEl: arrowNext,
            prevEl: arrowPrev,
          },
          slidesPerView: 1,
          spaceBetween: 30,
        },
        config
      )
    );
    return sliderInit;
  };
  var sliders = [];
  var resultsArray = document.querySelectorAll('.results');
  if (resultsArray.length !== 0) {
    resultsArray.forEach(function (item) {
      var slider = makeSlider({
        container: item,
        className: 'results',
        config: {
          slidesPerView: 1,
          spaceBetween: 30,
          breakpoints: {
            660: {
              slidesPerView: 2,
            },
            899: {
              slidesPerView: 'auto',
              spaceBetween: 54,
            },
          },
        },
      });
      sliders.push({ name: 'results', slider: slider });
    });
  }
  var moveHoverImageInit = function (_a) {
    var containerClass = _a.containerClass,
      labelClass = _a.labelClass,
      _b = _a.isReverse,
      isReverse = _b === void 0 ? false : _b;
    if (!containerClass || !labelClass || vevet.isMobile) {
      return;
    }
    var containerArray = document.querySelectorAll('.'.concat(containerClass));
    if (containerArray.length === 0) {
      return;
    }
    containerArray.forEach(function (container) {
      var label = container.querySelector('.'.concat(labelClass));
      if (!label) {
        return;
      }
      var progressX = {
        current: 0,
        target: 0,
      };
      var progressY = {
        current: 0,
        target: 0,
      };
      var frame = new Vevet.AnimationFrame();
      frame.addCallback('frame', function () {
        progressX.current = Vevet.utils.math.lerp(
          progressX.current,
          progressX.target,
          0.1
        );
        progressY.current = Vevet.utils.math.lerp(
          progressY.current,
          progressY.target,
          0.1
        );
        label.style.transform = 'translate('
          .concat(progressX.current * 30, 'px, ')
          .concat(progressY.current * 30, 'px)');
        if (
          progressX.current === progressX.target &&
          progressY.current === progressY.target
        ) {
          frame.pause();
        }
      });
      container.addEventListener('mousemove', function (evt) {
        var rect = container.getBoundingClientRect();
        var startY = rect.top;
        var startX = rect.left;
        var y =
          Math.min(Math.max(evt.clientY - startY, 0), rect.height) /
          rect.height;
        var x =
          Math.min(Math.max(evt.clientX - startX, 0), rect.width) / rect.width;
        progressX.target = isReverse ? -1 * (x - 0.5) : x - 0.5;
        progressY.target = isReverse ? -1 * (y - 0.5) : y - 0.5;
        if (!frame.isPlaying) {
          frame.play();
        }
      });
      container.addEventListener('mouseleave', function () {
        progressX.target = 0;
        progressY.target = 0;
      });
    });
  };
  // moveHoverImageInit({
  //     containerClass: 'results-slider__img',
  //     labelClass: 'results-slider__img__content'
  // });
  moveHoverImageInit({
    containerClass: 'statistic__img',
    labelClass: 'statistic__img__content',
  });
  moveHoverImageInit({
    containerClass: 'details',
    labelClass: 'details__img__content',
    isReverse: true,
  });
  //useScrollEvent
  var useScrollEvent = function (_a) {
    var target = _a.target,
      callback = _a.callback,
      _b = _a.isImmediate,
      isImmediate = _b === void 0 ? true : _b;
    if (!target) {
      return {
        hidden: undefined,
        shown: undefined,
      };
    }
    var container = target;
    var hiddenDom = container.querySelector('.appear-hidden');
    var shownDom = container.querySelector('.appear-shown');
    if (!hiddenDom || !shownDom) {
      return {
        hidden: undefined,
        shown: undefined,
      };
    }
    var hidden = {
      dom: hiddenDom,
      height: Math.ceil(hiddenDom.getBoundingClientRect().height),
    };
    var shown = {
      dom: shownDom,
      height: Math.ceil(shownDom.getBoundingClientRect().height),
    };
    var isFirstTime = true;
    container.style.minHeight = ''.concat(
      hidden.height * 1.5 + shown.height,
      'px'
    );
    var listener = function () {
      var rect = container.getBoundingClientRect();
      var startY = -1 * rect.top;
      var endY = rect.height - shown.height;
      var y = Math.min(startY, endY);
      var progress = y / endY;
      if ((progress === 1 || progress === 0) && !isFirstTime) {
        return;
      }
      if (!callback) {
        return;
      }
      isFirstTime = false;
      // console.log(startY, endY, progress);
      callback({ progress: progress, hidden: hidden, shown: shown });
    };
    if (isImmediate) {
      listener();
    }
    window.addEventListener('scroll', listener);
    window.addEventListener(
      'resize',
      debounce({
        callback: function () {
          var newHiddenHeight = Math.ceil(
            hidden.dom.getBoundingClientRect().height
          );
          var newShownHeight = Math.ceil(
            shown.dom.getBoundingClientRect().height
          );
          if (
            hidden.height === newHiddenHeight &&
            newShownHeight === shown.height
          ) {
            return;
          }
          hidden.height = newHiddenHeight;
          shown.height = newShownHeight;
          container.style.minHeight = ''.concat(
            hidden.height * 2 + shown.height,
            'px'
          );
          clearScrollListener(listener);
          window.addEventListener('scroll', listener);
        },
      })
    );
    return { hidden: hidden, shown: shown };
  };
  //render appear functions
  var opacityRender = function (_a) {
    var progress = _a.progress,
      itemDom = _a.itemDom;
    var item = itemDom;
    item.style.opacity = ''.concat(1 - progress);
  };
  var clipPathRender = function (_a) {
    var progress = _a.progress,
      itemDom = _a.itemDom;
    var item = itemDom;
    item.style.clipPath = 'inset(0% '
      .concat(progress * 100, '% ')
      .concat(progress * 100, '% 0 round 0 0 ')
      .concat(vevet.isPhone ? 16 : 30 + progress * 20, '% 0)');
  };
  var splitRender = function (_a) {
    var progress = _a.progress,
      itemDom = _a.itemDom,
      additionalItemDom = _a.additionalItemDom;
    if (!additionalItemDom) {
      return;
    }
    var item = itemDom;
    var additional = additionalItemDom;
    item.style.transform = 'translate(0, '.concat(-1 * progress * 100, '%)');
    additional.style.transform = 'scale('.concat(0.8 + progress * 0.2, ')');
  };
  var translateYRender = function (_a) {
    var progress = _a.progress,
      itemDom = _a.itemDom;
    var item = itemDom;
    item.style.transform = 'translate(0, '.concat(-1 * progress * 100, '%)');
  };
  //makeAppearAnimation
  var makeAppearAnimation = function (_a) {
    var container = _a.container,
      renderFunc = _a.renderFunc,
      _b = _a.animateElement,
      animateElement = _b === void 0 ? null : _b;
    var frame = new Vevet.AnimationFrame({ fps: 60 });
    frame.play();
    var progressAnimation = {
      current: 0,
      target: 0,
    };
    var _c = useScrollEvent({
        target: container,
        callback: function (_a) {
          var progress = _a.progress;
          progressAnimation.target = progress;
          if (
            (progressAnimation.target < 1 || progressAnimation.target > 0) &&
            !frame.isPlaying
          ) {
            frame.play();
          }
        },
      }),
      hidden = _c.hidden,
      shown = _c.shown;
    if (!hidden || !shown) {
      return;
    }
    var render = function () {
      if (progressAnimation.target > 0.9) {
        progressAnimation.target = 1;
      }
      if (progressAnimation.target < 0.1) {
        progressAnimation.target = 0;
      }
      progressAnimation.current = Vevet.utils.math.lerp(
        progressAnimation.current,
        progressAnimation.target,
        0.4
      );
      // console.log(progressAnimation.current, progressAnimation.target);
      if (!renderFunc) {
        opacityRender({
          progress: progressAnimation.current,
          itemDom: animateElement || hidden.dom,
        });
      } else {
        renderFunc({
          progress: progressAnimation.current,
          itemDom: animateElement || hidden.dom,
          additionalItemDom: shown.dom,
        });
      }
      if (progressAnimation.current > 0.7) {
        hidden.dom.style.pointerEvents = 'none';
      } else {
        hidden.dom.style.pointerEvents = 'auto';
      }
      if (
        progressAnimation.current === 0 ||
        progressAnimation.current === 1 ||
        progressAnimation.current === progressAnimation.target
      ) {
        frame.pause();
      }
    };
    frame.addCallback('frame', function () {
      render();
    });
  };
  //appearInit
  var appearInit = function () {
    var containerArray = document.querySelectorAll('.appear');
    if (containerArray.length === 0) {
      return;
    }
    containerArray.forEach(function (container) {
      var isIncludeMobile =
        container.dataset.includeMobile === 'include' || false;
      if (!isIncludeMobile && vevet.isMobile) {
        return;
      }
      var animateElement = container.querySelector('[data-animate]');
      var animationType = 'opacity';
      var renderFunc;
      if (animateElement) {
        animationType = animateElement.dataset.animate || 'opacity';
      }
      switch (animationType) {
        case 'opacity':
          renderFunc = opacityRender;
          break;
        case 'clip-path':
          renderFunc = clipPathRender;
          break;
        case 'translateY':
          renderFunc = translateYRender;
          break;
        case 'split':
          renderFunc = splitRender;
          break;
        default:
          renderFunc = opacityRender;
          break;
      }
      makeAppearAnimation({
        container: container,
        renderFunc: renderFunc,
        animateElement: animateElement,
      });
    });
  };
  appearInit();
  var useOutsideClick = function (element, callback) {
    var listener = function (event) {
      if (
        !element.contains(
          event === null || event === void 0 ? void 0 : event.target
        ) &&
        event.which === 1
      ) {
        callback();
      }
    };
    document.addEventListener('mousedown', listener);
  };
  var useOnEscape = function (callback) {
    window.addEventListener('keydown', function (evt) {
      if (evt.keyCode === 27) {
        callback();
      }
    });
  };
  var renderModalAnimation = function (_a) {
    var progress = _a.progress,
      easing = _a.easing,
      parent = _a.parent,
      overlay = _a.overlay,
      scroll = _a.scroll,
      additional = _a.additional;
    if (parent) {
      var element = parent;
      element.style.display = ''.concat(progress > 0 ? 'flex' : 'none');
      element.style.opacity = ''.concat(progress > 0 ? 1 : 0);
    }
    if (overlay) {
      // const element = overlay;
      // element.style.opacity = `${easing}`;
    }
    if (scroll) {
      var element = scroll;
      element.style.opacity = ''.concat(easing);
      if (parent.classList.contains('popup-menu')) {
        element.style.transform = 'translateX('.concat(
          (easing - 1) * 100,
          '%)'
        );
      } else {
        element.style.transform = 'translateY('.concat(
          (1 - easing) * 2,
          'rem)'
        );
      }
    }
    if (additional) {
      var element = additional;
      element.style.opacity = ''.concat(easing);
      if (parent.classList.contains('popup-menu')) {
        element.style.transform = 'translateX('.concat(
          (easing - 1) * 100,
          '%)'
        );
      } else {
        element.style.transform = 'translateY('.concat(
          (1 - easing) * 2,
          'rem)'
        );
      }
    }
  };
  var makeTimeline = function (parent, scroll, overlay, additional, video) {
    if (!parent || !scroll || !overlay) {
      return undefined;
    }
    var timeline = new Vevet.Timeline({
      duration: 600,
      easing: [0.25, 0.1, 0.25, 1],
    });
    timeline.addCallback('start', function () {
      var _a, _b;
      if (!timeline.isReversed) {
        (_a = document.querySelector('html')) === null || _a === void 0
          ? void 0
          : _a.classList.add('lock');
        (_b = document.querySelector('body')) === null || _b === void 0
          ? void 0
          : _b.classList.add('lock');
        parent.classList.add('_opened');
        if (video) {
          video.play();
        }
      }
    });
    timeline.addCallback('progress', function (_a) {
      var progress = _a.progress,
        easing = _a.easing;
      renderModalAnimation({
        parent: parent,
        scroll: scroll,
        overlay: overlay,
        progress: progress,
        easing: easing,
        additional: additional,
      });
    });
    timeline.addCallback('end', function () {
      var _a, _b;
      if (timeline.isReversed) {
        (_a = document.querySelector('html')) === null || _a === void 0
          ? void 0
          : _a.classList.remove('lock');
        (_b = document.querySelector('body')) === null || _b === void 0
          ? void 0
          : _b.classList.remove('lock');
        parent.classList.remove('_opened');
        if (video) {
          video.pause();
        }
      }
    });
    return timeline;
  };
  //Popup class
  var Popup = /** @class */ (function () {
    function Popup(domElement) {
      var _this = this;
      this._isThanks = false;
      this._isError = false;
      this._closeButtons = [];
      this._openButtons = [];
      this._parent = domElement;
      this._name = domElement.dataset.popupname;
      this._scroll = this._parent.querySelector('.popup__scroll');
      this._overlay = this._parent.querySelector('.popup__overlay');
      this._wrapper = this._parent.querySelector('.popup__wrapper');
      this._additional = this._parent.querySelector('.popup__additional');
      this._video = this._parent.querySelector('.video');
      if (!this._name || !this._scroll || !this._overlay || !this._wrapper) {
        return;
      }
      this._isThanks = this._name === '_popup-thanks';
      this._isError = this._name === '_popup-error';
      this._timeline = makeTimeline(
        this._parent,
        this._scroll,
        this._overlay,
        this._additional,
        this._video
      );
      this._openButtons = Array.from(
        document.querySelectorAll('[data-popup="'.concat(this._name, '"]'))
      );
      this._closeButtons = Array.from(
        this._parent.querySelectorAll('.popup__close, .popup__button')
      );
      if (this._closeButtons.length !== 0) {
        this._closeButtons.forEach(function (button) {
          if (!button) {
            return;
          }
          button.addEventListener('click', function () {
            var _a;
            (_a = _this._timeline) === null || _a === void 0
              ? void 0
              : _a.reverse();
          });
        });
      }
      useOutsideClick(this._wrapper, function () {
        var _a, _b, _c, _d;
        if (_this._parent.classList.contains('_opened')) {
          (_a = _this._timeline) === null || _a === void 0
            ? void 0
            : _a.reverse();
          (_b = document.querySelector('html')) === null || _b === void 0
            ? void 0
            : _b.classList.remove('lock');
          (_c = document.querySelector('body')) === null || _c === void 0
            ? void 0
            : _c.classList.remove('lock');
          (_d = _this._video) === null || _d === void 0 ? void 0 : _d.pause();
        }
      });
      useOnEscape(function () {
        var _a, _b, _c, _d;
        if (_this._parent.classList.contains('_opened')) {
          (_a = _this._timeline) === null || _a === void 0
            ? void 0
            : _a.reverse();
          (_b = document.querySelector('html')) === null || _b === void 0
            ? void 0
            : _b.classList.remove('lock');
          (_c = document.querySelector('body')) === null || _c === void 0
            ? void 0
            : _c.classList.remove('lock');
          (_d = _this._video) === null || _d === void 0 ? void 0 : _d.pause();
        }
      });
    }
    Object.defineProperty(Popup.prototype, 'parent', {
      get: function () {
        return this._parent;
      },
      enumerable: false,
      configurable: true,
    });
    Object.defineProperty(Popup.prototype, 'name', {
      get: function () {
        return this._name;
      },
      enumerable: false,
      configurable: true,
    });
    Object.defineProperty(Popup.prototype, 'isThanks', {
      get: function () {
        return this._isThanks;
      },
      enumerable: false,
      configurable: true,
    });
    Object.defineProperty(Popup.prototype, 'isError', {
      get: function () {
        return this._isError;
      },
      enumerable: false,
      configurable: true,
    });
    Object.defineProperty(Popup.prototype, 'scroll', {
      get: function () {
        return this._scroll;
      },
      enumerable: false,
      configurable: true,
    });
    Object.defineProperty(Popup.prototype, 'overlay', {
      get: function () {
        return this._overlay;
      },
      enumerable: false,
      configurable: true,
    });
    Object.defineProperty(Popup.prototype, 'additional', {
      get: function () {
        return this._additional;
      },
      enumerable: false,
      configurable: true,
    });
    Object.defineProperty(Popup.prototype, 'wrapper', {
      get: function () {
        return this._wrapper;
      },
      enumerable: false,
      configurable: true,
    });
    Object.defineProperty(Popup.prototype, 'video', {
      get: function () {
        return this._video;
      },
      enumerable: false,
      configurable: true,
    });
    Object.defineProperty(Popup.prototype, 'timeline', {
      get: function () {
        return this._timeline;
      },
      enumerable: false,
      configurable: true,
    });
    Object.defineProperty(Popup.prototype, 'closeButtons', {
      get: function () {
        return this._closeButtons;
      },
      enumerable: false,
      configurable: true,
    });
    Object.defineProperty(Popup.prototype, 'openButtons', {
      get: function () {
        return this._openButtons;
      },
      enumerable: false,
      configurable: true,
    });
    Popup.prototype.initOpen = function (popupArr) {
      var _this = this;
      if (popupArr.length === 0 || !this._openButtons) {
        return;
      }
      this._openButtons.forEach(function (openBtn) {
        openBtn.addEventListener('click', function (evt) {
          var _a;
          evt.preventDefault();
          popupArr.forEach(function (popup) {
            var _a;
            if (
              popup.parent.classList.contains('_opened') &&
              popup.name !== _this._name
            ) {
              (_a = popup.timeline) === null || _a === void 0
                ? void 0
                : _a.reverse();
            }
          });
          (_a = _this._timeline) === null || _a === void 0 ? void 0 : _a.play();
        });
      });
    };
    return Popup;
  })();
  //initPopups
  var initPopups = function () {
    var popupDomArr = document.querySelectorAll('.popup');
    if (popupDomArr.length === 0) {
      return [];
    }
    var popupArr = [];
    popupDomArr.forEach(function (element) {
      var popup = new Popup(element);
      popupArr.push(popup);
    });
    popupArr.forEach(function (popup) {
      popup.initOpen(popupArr);
    });
    return popupArr;
  };
  var popups = initPopups();
  var formArr = document.querySelectorAll('form');
  if (formArr.length !== 0) {
    formArr.forEach(function (form) {
      form.addEventListener('submit', function (evt) {
        evt.preventDefault();
        var inputs = Array.from(form.querySelectorAll('input, textarea'));
        popups.forEach(function (_a) {
          var timeline = _a.timeline,
            isThanks = _a.isThanks,
            isError = _a.isError;
          if (isThanks) {
            timeline === null || timeline === void 0 ? void 0 : timeline.play();
            if (inputs.length !== 0) {
              inputs.forEach(function (inputProp) {
                var input = inputProp;
                input.value = '';
              });
            }
          } else if (isError) {
            timeline === null || timeline === void 0 ? void 0 : timeline.play();
          } else {
            timeline === null || timeline === void 0
              ? void 0
              : timeline.reverse();
          }
        });
      });
    });
    // document.addEventListener(
    //   'wpcf7mailsent',
    //   function () {
    //     popups.forEach(({ timeline, isThanksPopup }) => {
    //       if (isThanksPopup) {
    //         timeline.play();
    //       } else {
    //         timeline.reverse();
    //       }
    //     });
    //   },
    //   false
    // );
  }
});
