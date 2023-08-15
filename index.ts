//import { init } from './scripts/main';

const vevet = new Vevet.Application({
  tablet: 1199,
  phone: 899,
  prefix: 'v-',
  viewportResizeTimeout: 100,
  easing: [0.25, 0.1, 0.25, 1],
});

vevet.pageLoad.onLoaded(() => {
  //init();
  //scrollBarInit
  let scrollBar;
  if (!vevet.isMobile) {
    scrollBar = new Vevet.ScrollBar({ container: window });
  }

  //CONFIG
  //clearScrollListener
  const clearScrollListener = (listener: () => void) => {
    window.removeEventListener('scroll', listener);
  };

  //debounce
  type TDebounceCallback = () => void;

  interface IDebounce {
    callback: TDebounceCallback;
    wait?: number;
    isImmediate?: boolean;
  }

  const debounce = ({
    callback,
    wait = 250,
    isImmediate = false,
  }: IDebounce) => {
    let timeout: any;

    return () => {
      const later = () => {
        timeout = undefined;
        callback();
      };

      const isCallNow = isImmediate && !timeout;
      clearTimeout(timeout);

      timeout = setTimeout(later, wait);

      if (isCallNow) {
        callback();
      }
    };
  };

  //useObserver
  type TObserverCallback = (element: Element) => void;

  interface IUseObserverProps {
    target: HTMLElement | null;
    callbackIn?: TObserverCallback;
    callbackOut?: TObserverCallback;
    isCallOnce?: boolean;
  }

  const useObserver: (
    props: IUseObserverProps
  ) => IntersectionObserver | undefined = ({
    target,
    callbackIn,
    callbackOut,
    isCallOnce = false,
  }) => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(
        (entry) => {
          const element = entry.target;

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
  const listMarquee = document.querySelectorAll(
    '.marquee'
  ) as NodeListOf<HTMLDivElement>;

  if (listMarquee.length !== 0) {
    listMarquee.forEach((item) => {
      nodeMarquee({
        parent: item,
        resize: 'w',
        prependWhitespace: false,
        speed: item.classList.contains('reversed') ? -1 : 1,
      });
    });
  }

  //marquee rotateItem
  interface IMarqueeProgress {
    current: number;
    target: number;
  }

  const rotateItem = (itemProps: HTMLElement, section: HTMLElement) => {
    const item = itemProps;
    const progress: IMarqueeProgress = {
      current: 0,
      target: 0,
    };

    const frame = new Vevet.AnimationFrame({ fps: 60 });
    const render = () => {
      progress.current = Vevet.utils.math.lerp(
        progress.current,
        progress.target,
        0.1
      );
      item.style.transform = `rotate(${(progress.current - 0.5) * 10}deg)`;

      if (progress.target === progress.current && frame.isPlaying) {
        frame.pause();
      }
    };

    frame.addCallback('frame', () => {
      render();
    });

    frame.play();

    const listener = () => {
      const rect = section.getBoundingClientRect();
      const startY = -1 * (rect.top - window.innerHeight);
      const y = Math.max(0, Math.min(startY, rect.height));

      progress.target = y / rect.height;

      // console.log((y / rect.height - 0.5) * 30);

      if (progress.target !== progress.current && !frame.isPlaying) {
        frame.play();
      }
    };

    window.addEventListener('scroll', listener);

    return { listener, frame };
  };

  //marqueeRotate
  const marqueeRotate = () => {
    const sectionArray = document.querySelectorAll(
      'section.dark'
    ) as NodeListOf<HTMLElement>;

    if (sectionArray.length === 0) {
      return;
    }

    sectionArray.forEach((section) => {
      const marqueeArray = section.querySelectorAll(
        '.marquee'
      ) as NodeListOf<HTMLElement>;

      if (marqueeArray.length === 0) {
        return;
      }

      let listenerArray: Array<() => void> = [];
      let frameArray: Array<Vevet.AnimationFrame> = [];

      useObserver({
        target: section,
        callbackIn: () => {
          marqueeArray.forEach((item) => {
            if (!item) {
              return;
            }

            const { listener, frame } = rotateItem(item, section);
            listenerArray.push(listener);
            frameArray.push(frame);
          });
        },
        callbackOut: () => {
          marqueeArray.forEach((itemProp) => {
            const item = itemProp;

            if (!item) {
              return;
            }
            item.style.transform = '';
          });

          listenerArray.forEach((listener) => {
            clearScrollListener(listener);
          });

          frameArray.forEach((frame) => {
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

  //makeSlider
  interface IMakeSlider {
    container: HTMLElement | null;
    className: string;
    isThumb?: boolean;
    thumb?: Swiper | undefined;
    config?: SwiperOptions | undefined;
  }
  const makeSlider = ({
    container,
    className,
    isThumb = false,
    thumb = undefined,
    config,
  }: IMakeSlider) => {
    if (!container || !className) {
      return undefined;
    }

    const slider =
      (container.querySelector(
        `.${className}-slider${isThumb ? '-thumb' : ''}.swiper`
      ) as HTMLElement) || null;

    if (!slider) {
      return undefined;
    }

    const arrowPrev = container.querySelector(
      `.${className}-slider${
        isThumb ? '-thumb' : ''
      }-controls .${className}-slider-prev`
    ) as HTMLElement | null;

    const arrowNext = container.querySelector(
      `.${className}-slider${
        isThumb ? '-thumb' : ''
      }-controls .${className}-slider-next`
    ) as HTMLElement | null;

    const sliderInit = new Swiper(slider, {
      thumbs: {
        swiper: thumb,
      },
      navigation: {
        nextEl: arrowNext,
        prevEl: arrowPrev,
      },

      slidesPerView: 1,
      spaceBetween: 30,

      ...config,
    });

    return sliderInit;
  };

  //slidersInit
  interface IInitializedSlider {
    name: string;
    slider: Swiper | undefined;
  }

  const sliders: Array<IInitializedSlider> = [];

  const resultsArray = document.querySelectorAll(
    '.results'
  ) as NodeListOf<HTMLElement>;

  if (resultsArray.length !== 0) {
    resultsArray.forEach((item) => {
      const slider = makeSlider({
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

      sliders.push({ name: 'results', slider });
    });
  }

  //moveHoverImageInit
  interface IMoveHoverImageInit {
    containerClass: string;
    labelClass: string;
    isReverse?: boolean;
  }
  const moveHoverImageInit: (props: IMoveHoverImageInit) => void = ({
    containerClass,
    labelClass,
    isReverse = false,
  }) => {
    if (!containerClass || !labelClass || vevet.isMobile) {
      return;
    }

    const containerArray = document.querySelectorAll(
      `.${containerClass}`
    ) as NodeListOf<HTMLElement>;

    if (containerArray.length === 0) {
      return;
    }

    containerArray.forEach((container) => {
      const label = container.querySelector(
        `.${labelClass}`
      ) as HTMLElement | null;

      if (!label) {
        return;
      }

      const progressX = {
        current: 0,
        target: 0,
      };
      const progressY = {
        current: 0,
        target: 0,
      };

      const frame = new Vevet.AnimationFrame();
      frame.addCallback('frame', () => {
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

        label.style.transform = `translate(${progressX.current * 30}px, ${
          progressY.current * 30
        }px)`;

        if (
          progressX.current === progressX.target &&
          progressY.current === progressY.target
        ) {
          frame.pause();
        }
      });

      container.addEventListener('mousemove', (evt) => {
        const rect = container.getBoundingClientRect();
        const startY = rect.top;
        const startX = rect.left;

        const y =
          Math.min(Math.max(evt.clientY - startY, 0), rect.height) /
          rect.height;
        const x =
          Math.min(Math.max(evt.clientX - startX, 0), rect.width) / rect.width;

        progressX.target = isReverse ? -1 * (x - 0.5) : x - 0.5;
        progressY.target = isReverse ? -1 * (y - 0.5) : y - 0.5;

        if (!frame.isPlaying) {
          frame.play();
        }
      });

      container.addEventListener('mouseleave', () => {
        progressX.target = 0;
        progressY.target = 0;
      });
    });
  };

  moveHoverImageInit({
    containerClass: 'results-slider__img',
    labelClass: 'results-slider__img__content',
  });
  moveHoverImageInit({
    containerClass: 'statistic__img',
    labelClass: 'statistic__img__content',
  });
  moveHoverImageInit({
    containerClass: 'details',
    labelClass: 'details__img__content',
    isReverse: true,
  });

  //APPEAR ANIMATION
  type TAppearAnimation = 'opacity' | 'clip-path' | 'translateY' | 'split';

  type TRender = (props: {
    progress: number;
    itemDom: HTMLElement;
    additionalItemDom?: HTMLElement;
  }) => void;

  type TScrollCallback = (props: {
    progress: number;
    hidden: IUppearElement;
    shown: IUppearElement;
  }) => void;

  interface IUseScrollEventProps {
    target: HTMLElement | null;
    callback?: TScrollCallback;
    isImmediate?: boolean;
  }

  interface IUppearElement {
    dom: HTMLElement;
    height: number;
  }

  interface IMakeAppearAnimation {
    container: HTMLElement;
    renderFunc?: TRender;
    animateElement?: HTMLElement | null;
  }

  //useScrollEvent
  const useScrollEvent: (props: IUseScrollEventProps) => {
    hidden: IUppearElement | undefined;
    shown: IUppearElement | undefined;
  } = ({ target, callback, isImmediate = true }) => {
    if (!target) {
      return {
        hidden: undefined,
        shown: undefined,
      };
    }

    const container = target;

    const hiddenDom = container.querySelector(
      '.appear-hidden'
    ) as HTMLElement | null;
    const shownDom = container.querySelector(
      '.appear-shown'
    ) as HTMLElement | null;

    if (!hiddenDom || !shownDom) {
      return {
        hidden: undefined,
        shown: undefined,
      };
    }

    const hidden: IUppearElement = {
      dom: hiddenDom,
      height: Math.ceil(hiddenDom.getBoundingClientRect().height),
    };

    const shown: IUppearElement = {
      dom: shownDom,
      height: Math.ceil(shownDom.getBoundingClientRect().height),
    };

    let isFirstTime = true;

    container.style.minHeight = `${hidden.height * 1.5 + shown.height}px`;

    const listener = () => {
      const rect = container.getBoundingClientRect();

      const startY = -1 * rect.top;
      const endY = rect.height - shown.height;
      const y = Math.min(startY, endY);
      const progress = y / endY;

      if ((progress === 1 || progress === 0) && !isFirstTime) {
        return;
      }

      if (!callback) {
        return;
      }
      isFirstTime = false;
      // console.log(startY, endY, progress);

      callback({ progress, hidden, shown });
    };

    if (isImmediate) {
      listener();
    }

    window.addEventListener('scroll', listener);

    window.addEventListener(
      'resize',
      debounce({
        callback: () => {
          const newHiddenHeight = Math.ceil(
            hidden.dom.getBoundingClientRect().height
          );
          const newShownHeight = Math.ceil(
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
          container.style.minHeight = `${hidden.height * 2 + shown.height}px`;

          clearScrollListener(listener);
          window.addEventListener('scroll', listener);
        },
      })
    );

    return { hidden, shown };
  };

  //render appear functions
  const opacityRender: TRender = ({ progress, itemDom }) => {
    const item = itemDom;
    item.style.opacity = `${1 - progress}`;
  };

  const clipPathRender: TRender = ({ progress, itemDom }) => {
    const item = itemDom;

    item.style.clipPath = `inset(0% ${progress * 100}% ${
      progress * 100
    }% 0 round 0 0 ${vevet.isPhone ? 16 : 30 + progress * 20}% 0)`;
  };

  const splitRender: TRender = ({ progress, itemDom, additionalItemDom }) => {
    if (!additionalItemDom) {
      return;
    }

    const item = itemDom;
    const additional = additionalItemDom;

    item.style.transform = `translate(0, ${-1 * progress * 100}%)`;

    additional.style.transform = `scale(${0.8 + progress * 0.2})`;
  };

  const translateYRender: TRender = ({ progress, itemDom }) => {
    const item = itemDom;

    item.style.transform = `translate(0, ${-1 * progress * 100}%)`;
  };

  //makeAppearAnimation
  const makeAppearAnimation: (props: IMakeAppearAnimation) => void = ({
    container,
    renderFunc,
    animateElement = null,
  }) => {
    const frame = new Vevet.AnimationFrame({ fps: 60 });

    frame.play();

    const progressAnimation = {
      current: 0,
      target: 0,
    };

    const { hidden, shown } = useScrollEvent({
      target: container,
      callback: ({ progress }) => {
        progressAnimation.target = progress;

        if (
          (progressAnimation.target < 1 || progressAnimation.target > 0) &&
          !frame.isPlaying
        ) {
          frame.play();
        }
      },
    });

    if (!hidden || !shown) {
      return;
    }

    const render = () => {
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

    frame.addCallback('frame', () => {
      render();
    });
  };

  //appearInit
  const appearInit = () => {
    const containerArray = document.querySelectorAll(
      '.appear'
    ) as NodeListOf<HTMLElement>;

    if (containerArray.length === 0) {
      return;
    }

    containerArray.forEach((container) => {
      const isIncludeMobile =
        container.dataset.includeMobile === 'include' || false;

      if (!isIncludeMobile && vevet.isMobile) {
        return;
      }

      const animateElement = container.querySelector(
        '[data-animate]'
      ) as HTMLElement | null;

      let animationType: TAppearAnimation = 'opacity';
      let renderFunc: TRender | undefined;

      if (animateElement) {
        animationType =
          (animateElement.dataset.animate as TAppearAnimation | undefined) ||
          'opacity';
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

      makeAppearAnimation({ container, renderFunc, animateElement });
    });
  };

  appearInit();

  //POPUPS
  //utils popup
  type TClickOutsideEvent = MouseEvent | TouchEvent;
  const useOutsideClick = (element: HTMLElement, callback: () => void) => {
    const listener = (event: TClickOutsideEvent) => {
      if (!element.contains(event?.target as Node) && event.which === 1) {
        callback();
      }
    };

    document.addEventListener('mousedown', listener);
  };

  const useOnEscape = (callback: () => void) => {
    window.addEventListener('keydown', (evt) => {
      if (evt.keyCode === 27) {
        callback();
      }
    });
  };

  //makeTimeline popup
  interface IRenderModalAnimationProps {
    progress: number;
    easing: number;
    parent: HTMLElement;
    scroll: HTMLElement;
    overlay: HTMLElement;
    additional: HTMLElement | null;
  }

  const renderModalAnimation = ({
    progress,
    easing,
    parent,
    overlay,
    scroll,
    additional,
  }: IRenderModalAnimationProps) => {
    if (parent) {
      const element = parent;
      element.style.display = `${progress > 0 ? 'flex' : 'none'}`;
      element.style.opacity = `${progress > 0 ? 1 : 0}`;
    }

    if (overlay) {
      // const element = overlay;
      // element.style.opacity = `${easing}`;
    }

    if (scroll) {
      const element = scroll;
      element.style.opacity = `${easing}`;
      if (parent.classList.contains('popup-menu')) {
        element.style.transform = `translateX(${(easing - 1) * 100}%)`;
      } else {
        element.style.transform = `translateY(${(1 - easing) * 2}rem)`;
      }
    }

    if (additional) {
      const element = additional;
      element.style.opacity = `${easing}`;
      if (parent.classList.contains('popup-menu')) {
        element.style.transform = `translateX(${(easing - 1) * 100}%)`;
      } else {
        element.style.transform = `translateY(${(1 - easing) * 2}rem)`;
      }
    }
  };

  const makeTimeline = (
    parent: HTMLElement,
    scroll: HTMLElement | null,
    overlay: HTMLElement | null,
    additional: HTMLElement | null,
    video?: HTMLVideoElement | null
  ) => {
    if (!parent || !scroll || !overlay) {
      return undefined;
    }

    const timeline = new Vevet.Timeline({
      duration: 600,
      easing: [0.25, 0.1, 0.25, 1],
    });
    timeline.addCallback('start', () => {
      if (!timeline.isReversed) {
        document.querySelector('html')?.classList.add('lock');
        document.querySelector('body')?.classList.add('lock');
        parent.classList.add('_opened');

        if (video) {
          video.play();
        }
      }
    });

    timeline.addCallback('progress', ({ progress, easing }) => {
      renderModalAnimation({
        parent,
        scroll,
        overlay,
        progress,
        easing,
        additional,
      });
    });

    timeline.addCallback('end', () => {
      if (timeline.isReversed) {
        document.querySelector('html')?.classList.remove('lock');
        document.querySelector('body')?.classList.remove('lock');
        parent.classList.remove('_opened');

        if (video) {
          video.pause();
        }
      }
    });

    return timeline;
  };

  //Popup class
  class Popup {
    get parent() {
      return this._parent;
    }

    private _parent: HTMLElement;

    get name() {
      return this._name;
    }

    private _name: string | undefined;

    get isThanks() {
      return this._isThanks;
    }

    private _isThanks: boolean = false;

    get isError() {
      return this._isError;
    }

    private _isError: boolean = false;

    get scroll() {
      return this._scroll;
    }

    private _scroll: HTMLElement | null;

    get overlay() {
      return this._overlay;
    }

    private _overlay: HTMLElement | null;

    get additional() {
      return this._additional;
    }

    private _additional: HTMLElement | null;

    get wrapper() {
      return this._wrapper;
    }

    private _wrapper: HTMLElement | null;

    get video() {
      return this._video;
    }

    private _video: HTMLVideoElement | null;

    get timeline() {
      return this._timeline;
    }

    private _timeline: Vevet.Timeline | undefined;

    get closeButtons() {
      return this._closeButtons;
    }

    private _closeButtons: Array<HTMLElement | null> = [];

    get openButtons() {
      return this._openButtons;
    }

    private _openButtons: HTMLElement[] = [];

    constructor(domElement: HTMLElement) {
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
        document.querySelectorAll(`[data-popup="${this._name}"]`)
      );
      this._closeButtons = Array.from(
        this._parent.querySelectorAll(
          '.popup__close, .popup__button'
        ) as NodeListOf<HTMLElement>
      );

      if (this._closeButtons.length !== 0) {
        this._closeButtons.forEach((button) => {
          if (!button) {
            return;
          }

          button.addEventListener('click', () => {
            this._timeline?.reverse();
          });
        });
      }

      useOutsideClick(this._wrapper, () => {
        if (this._parent.classList.contains('_opened')) {
          this._timeline?.reverse();
          document.querySelector('html')?.classList.remove('lock');
          document.querySelector('body')?.classList.remove('lock');

          this._video?.pause();
        }
      });

      useOnEscape(() => {
        if (this._parent.classList.contains('_opened')) {
          this._timeline?.reverse();

          document.querySelector('html')?.classList.remove('lock');
          document.querySelector('body')?.classList.remove('lock');

          this._video?.pause();
        }
      });
    }

    initOpen(popupArr: Popup[]) {
      if (popupArr.length === 0 || !this._openButtons) {
        return;
      }
      this._openButtons.forEach((openBtn) => {
        openBtn.addEventListener('click', (evt) => {
          evt.preventDefault();

          popupArr.forEach((popup) => {
            if (
              popup.parent.classList.contains('_opened') &&
              popup.name !== this._name
            ) {
              popup.timeline?.reverse();
            }
          });

          this._timeline?.play();
        });
      });
    }
  }

  //initPopups
  const initPopups = (): Popup[] => {
    const popupDomArr = document.querySelectorAll('.popup');

    if (popupDomArr.length === 0) {
      return [];
    }

    const popupArr: Popup[] = [];

    popupDomArr.forEach((element) => {
      const popup = new Popup(element as HTMLElement);
      popupArr.push(popup);
    });

    popupArr.forEach((popup) => {
      popup.initOpen(popupArr);
    });

    return popupArr;
  };

  const popups = initPopups();

  const formArr = document.querySelectorAll('form');
  if (formArr.length !== 0) {
    formArr.forEach((form) => {
      form.addEventListener('submit', (evt) => {
        evt.preventDefault();
        const inputs = Array.from(
          form.querySelectorAll('input, textarea') as NodeListOf<
            HTMLInputElement | HTMLTextAreaElement
          >
        );

        popups.forEach(({ timeline, isThanks, isError }) => {
          if (isThanks) {
            timeline?.play();

            if (inputs.length !== 0) {
              inputs.forEach((inputProp) => {
                const input = inputProp;
                input.value = '';
              });
            }
          } else if (isError) {
            timeline?.play();
          } else {
            timeline?.reverse();
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
