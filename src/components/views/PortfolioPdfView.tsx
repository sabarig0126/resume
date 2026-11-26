import {
  type MouseEvent,
  type PointerEvent,
  type TouchEvent,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { PORTFOLIO_PDF_PATH, PROFILE } from '../../data/projects';
import {
  ChevronNextIcon,
  ChevronPrevIcon,
  ExternalPortalIcon,
} from '../NextGenIcons';

interface PortfolioPdfViewProps {
  onReturnPreviousView?: () => void;
}

const TOTAL_SLIDES = 13;
const TV_STAGE_WIDTH = 960;
const TV_STAGE_HEIGHT = 540;
const AUTO_ADVANCE_INTERVAL_MS = 4500;
const REMOTE_DIGIT_TIMEOUT_MS = 2500;
const REMOTE_FEEDBACK_TIMEOUT_MS = 1500;

const REMOTE_KEYPAD_ROWS: ReadonlyArray<ReadonlyArray<string>> = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
];

const SLIDE_MOTION_VARIANTS = {
  enter: (direction: number) => ({
    opacity: 0,
    x: direction >= 0 ? 32 : -32,
  }),
  center: {
    opacity: 1,
    x: 0,
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction >= 0 ? -32 : 32,
  }),
};

interface TvViewportState {
  isPortrait: boolean;
  isMobile: boolean;
  isDesktop: boolean;
}

function readTvViewportState(): TvViewportState {
  if (typeof window === 'undefined') {
    return { isPortrait: false, isMobile: false, isDesktop: true };
  }

  const width = window.innerWidth;
  const height = window.innerHeight;
  const shortSide = Math.min(width, height);

  const portraitMql = window.matchMedia?.('(orientation: portrait)');
  const fineHoverMql = window.matchMedia?.('(hover: hover) and (pointer: fine)');
  const desktopWidthMql = window.matchMedia?.('(min-width: 1024px)');

  const isPortrait = portraitMql ? portraitMql.matches : height >= width;
  const hasFineHover = fineHoverMql ? fineHoverMql.matches : width >= 1024;
  const meetsDesktopWidth = desktopWidthMql
    ? desktopWidthMql.matches
    : width >= 1024;

  const isDesktop = hasFineHover && meetsDesktopWidth;
  const isMobile = !isDesktop && shortSide < 600;

  return { isPortrait, isMobile, isDesktop };
}

function useTvViewport(): TvViewportState {
  const [viewport, setViewport] = useState<TvViewportState>(() =>
    readTvViewportState()
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const update = () => {
      const next = readTvViewportState();
      setViewport((prev) =>
        prev.isPortrait === next.isPortrait &&
        prev.isMobile === next.isMobile &&
        prev.isDesktop === next.isDesktop
          ? prev
          : next
      );
    };

    const queries = [
      window.matchMedia?.('(orientation: portrait)'),
      window.matchMedia?.('(hover: hover) and (pointer: fine)'),
      window.matchMedia?.('(min-width: 1024px)'),
    ].filter((q): q is MediaQueryList => Boolean(q));

    update();

    queries.forEach((mql) => {
      if (typeof mql.addEventListener === 'function') {
        mql.addEventListener('change', update);
      } else if (typeof mql.addListener === 'function') {
        mql.addListener(update);
      }
    });

    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);

    return () => {
      queries.forEach((mql) => {
        if (typeof mql.removeEventListener === 'function') {
          mql.removeEventListener('change', update);
        } else if (typeof mql.removeListener === 'function') {
          mql.removeListener(update);
        }
      });
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
    };
  }, []);

  return viewport;
}

export function PortfolioPdfView(_props: PortfolioPdfViewProps) {
  const [slideIndex, setSlideIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isDesktopAutoPlay, setIsDesktopAutoPlay] = useState(true);

  const [digitBuffer, setDigitBuffer] = useState('');
  const [remoteError, setRemoteError] = useState<string | null>(null);

  const { isPortrait, isMobile, isDesktop } = useTvViewport();
  const isTablet = !isMobile && !isDesktop;

  // Automatic playback policy per device:
  // - Mobile & Tablet: ON continuously
  // - Desktop/Laptop: ON by default until stopped/interacted with via remote
  const isAutoPlayActive = isDesktop ? isDesktopAutoPlay : true;

  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const lastSwipeAtRef = useRef(0);
  const screenRef = useRef<HTMLDivElement | null>(null);
  const stageHostRef = useRef<HTMLDivElement | null>(null);
  const remoteContainerRef = useRef<HTMLDivElement | null>(null);

  const slideIndexRef = useRef(slideIndex);
  slideIndexRef.current = slideIndex;
  const digitBufferRef = useRef(digitBuffer);
  digitBufferRef.current = digitBuffer;
  const remoteErrorRef = useRef(remoteError);
  remoteErrorRef.current = remoteError;
  const digitTimerRef = useRef<number | null>(null);
  const errorTimerRef = useRef<number | null>(null);

  // Measure actual inner TV screen dimensions and fit canonical 960x540 stage cleanly (object-fit: contain)
  useLayoutEffect(() => {
    const screenEl = screenRef.current;
    const stageEl = stageHostRef.current;
    if (!screenEl || !stageEl) return;

    const applyContainScale = () => {
      const innerWidth = screenEl.clientWidth;
      const innerHeight = screenEl.clientHeight;
      if (innerWidth <= 0 || innerHeight <= 0) return;
      const scale = Math.min(
        innerWidth / TV_STAGE_WIDTH,
        innerHeight / TV_STAGE_HEIGHT
      );
      stageEl.style.setProperty('--tv-scale', scale.toFixed(6));
    };

    applyContainScale();

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(() => {
        applyContainScale();
      });
      observer.observe(screenEl);
      return () => observer.disconnect();
    }

    window.addEventListener('resize', applyContainScale);
    window.addEventListener('orientationchange', applyContainScale);
    return () => {
      window.removeEventListener('resize', applyContainScale);
      window.removeEventListener('orientationchange', applyContainScale);
    };
  }, [isPortrait, isMobile, isDesktop]);

  const clearDigitTimer = useCallback(() => {
    if (digitTimerRef.current !== null) {
      window.clearTimeout(digitTimerRef.current);
      digitTimerRef.current = null;
    }
  }, []);

  const clearErrorTimer = useCallback(() => {
    if (errorTimerRef.current !== null) {
      window.clearTimeout(errorTimerRef.current);
      errorTimerRef.current = null;
    }
  }, []);

  const clearRemoteState = useCallback(() => {
    clearDigitTimer();
    clearErrorTimer();
    digitBufferRef.current = '';
    remoteErrorRef.current = null;
    setDigitBuffer('');
    setRemoteError(null);
  }, [clearDigitTimer, clearErrorTimer]);

  const showRemoteFeedback = useCallback(
    (message: string) => {
      clearErrorTimer();
      remoteErrorRef.current = message;
      setRemoteError(message);
      errorTimerRef.current = window.setTimeout(() => {
        errorTimerRef.current = null;
        remoteErrorRef.current = null;
        setRemoteError(null);
      }, REMOTE_FEEDBACK_TIMEOUT_MS);
    },
    [clearErrorTimer]
  );

  const commitSlideNumber = useCallback(
    (rawBuffer: string) => {
      clearDigitTimer();
      const trimmed = rawBuffer.trim();
      digitBufferRef.current = '';
      setDigitBuffer('');

      if (!trimmed) return;

      const parsed = Number.parseInt(trimmed, 10);
      if (Number.isNaN(parsed) || parsed < 1 || parsed > TOTAL_SLIDES) {
        showRemoteFeedback(`1–${TOTAL_SLIDES} ONLY`);
        return;
      }

      clearErrorTimer();
      remoteErrorRef.current = null;
      setRemoteError(null);

      // Selecting a slide manually stops automatic playback until PLAY is pressed
      if (isDesktop) {
        setIsDesktopAutoPlay(false);
      }

      const targetIndex = parsed - 1;
      if (targetIndex !== slideIndexRef.current) {
        setDirection(targetIndex > slideIndexRef.current ? 1 : -1);
        setSlideIndex(targetIndex);
      }
    },
    [clearDigitTimer, clearErrorTimer, isDesktop, showRemoteFeedback]
  );

  const scheduleDigitAutoCommit = useCallback(
    (nextBuffer: string) => {
      clearDigitTimer();
      if (!nextBuffer) return;
      digitTimerRef.current = window.setTimeout(() => {
        digitTimerRef.current = null;
        commitSlideNumber(digitBufferRef.current);
      }, REMOTE_DIGIT_TIMEOUT_MS);
    },
    [clearDigitTimer, commitSlideNumber]
  );

  const handleDigitInput = useCallback(
    (digit: string) => {
      if (!/^[0-9]$/.test(digit)) return;
      clearErrorTimer();
      remoteErrorRef.current = null;
      setRemoteError(null);

      if (isDesktop) {
        setIsDesktopAutoPlay(false);
      }

      const prev = digitBufferRef.current;
      const next = prev.length >= 2 ? digit : `${prev}${digit}`;
      digitBufferRef.current = next;
      setDigitBuffer(next);
      scheduleDigitAutoCommit(next);
    },
    [clearErrorTimer, isDesktop, scheduleDigitAutoCommit]
  );

  const handleBackspaceRemote = useCallback(() => {
    const prev = digitBufferRef.current;
    if (!prev) return;
    const next = prev.slice(0, -1);
    digitBufferRef.current = next;
    setDigitBuffer(next);
    if (next) {
      scheduleDigitAutoCommit(next);
    } else {
      clearDigitTimer();
    }
  }, [clearDigitTimer, scheduleDigitAutoCommit]);

  const handleEnterRemote = useCallback(() => {
    if (!digitBufferRef.current) return;
    commitSlideNumber(digitBufferRef.current);
  }, [commitSlideNumber]);

  const handlePlayRemote = useCallback(() => {
    clearRemoteState();
    setIsDesktopAutoPlay(true);
  }, [clearRemoteState]);

  const handlePauseRemote = useCallback(() => {
    clearRemoteState();
    setIsDesktopAutoPlay(false);
  }, [clearRemoteState]);

  const goNextSlide = useCallback(() => {
    clearRemoteState();
    if (isDesktop) {
      setIsDesktopAutoPlay(false);
    }
    setDirection(1);
    setSlideIndex((prev) => (prev + 1) % TOTAL_SLIDES);
  }, [clearRemoteState, isDesktop]);

  const goPrevSlide = useCallback(() => {
    clearRemoteState();
    if (isDesktop) {
      setIsDesktopAutoPlay(false);
    }
    setDirection(-1);
    setSlideIndex((prev) => (prev - 1 + TOTAL_SLIDES) % TOTAL_SLIDES);
  }, [clearRemoteState, isDesktop]);

  // Continuous automatic slideshow loop when active for current device/mode
  useEffect(() => {
    if (!isAutoPlayActive) return;

    const intervalId = window.setInterval(() => {
      setDirection(1);
      setSlideIndex((prev) => (prev + 1) % TOTAL_SLIDES);
    }, AUTO_ADVANCE_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [isAutoPlayActive]);

  // Clear pending timers when leaving desktop layout or unmounting
  useEffect(() => {
    if (!isDesktop) {
      clearRemoteState();
    }
    return () => {
      clearDigitTimer();
      clearErrorTimer();
    };
  }, [isDesktop, clearRemoteState, clearDigitTimer, clearErrorTimer]);

  // Keyboard navigation: Left/Right arrows + Smart TV Remote keys on Desktop/Laptop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not intercept keys when a modal dialog (Menu, Lightbox, or Highlight Card) is open
      if (document.querySelector('[role="dialog"]')) return;

      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        goNextSlide();
        return;
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goPrevSlide();
        return;
      }

      if (!isDesktop) return;

      if (!e.ctrlKey && !e.metaKey && !e.altKey && /^[0-9]$/.test(e.key)) {
        e.preventDefault();
        handleDigitInput(e.key);
        return;
      }

      if (e.key === 'Backspace' && digitBufferRef.current.length > 0) {
        e.preventDefault();
        handleBackspaceRemote();
        return;
      }

      if (e.key === 'Escape') {
        if (digitBufferRef.current.length > 0 || remoteErrorRef.current !== null) {
          e.preventDefault();
          clearRemoteState();
        }
        return;
      }

      if (e.key === 'Enter' && digitBufferRef.current.length > 0) {
        const focusedInteractiveOtherThanRemote =
          target &&
          (target.tagName === 'A' || target.tagName === 'BUTTON') &&
          !remoteContainerRef.current?.contains(target);

        if (!focusedInteractiveOtherThanRemote) {
          e.preventDefault();
          handleEnterRemote();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isDesktop,
    goNextSlide,
    goPrevSlide,
    handleDigitInput,
    handleBackspaceRemote,
    handleEnterRemote,
    clearRemoteState,
  ]);

  const finishSwipe = useCallback(
    (start: { x: number; y: number } | null, endX: number, endY: number) => {
      if (!start) return;
      const now = Date.now();
      if (now - lastSwipeAtRef.current < 160) return;
      const deltaX = endX - start.x;
      const deltaY = endY - start.y;
      if (Math.abs(deltaX) > 36 && Math.abs(deltaX) > Math.abs(deltaY) * 1.1) {
        lastSwipeAtRef.current = now;
        if (deltaX < 0) {
          goNextSlide();
        } else {
          goPrevSlide();
        }
      }
    },
    [goNextSlide, goPrevSlide]
  );

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse') return;
    pointerStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse') return;
    const start = pointerStartRef.current;
    pointerStartRef.current = null;
    finishSwipe(start, e.clientX, e.clientY);
  };

  const handlePointerCancel = () => {
    pointerStartRef.current = null;
  };

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    if (e.changedTouches.length !== 1) return;
    const touch = e.changedTouches[0];
    const start = touchStartRef.current;
    touchStartRef.current = null;
    finishSwipe(start, touch.clientX, touch.clientY);
  };

  const handleTouchCancel = () => {
    touchStartRef.current = null;
  };

  const handleRemoteButtonClick = (
    e: MouseEvent<HTMLButtonElement>,
    action: () => void
  ) => {
    if (e.detail > 0) {
      e.currentTarget.blur();
    }
    if (
      typeof navigator !== 'undefined' &&
      typeof navigator.vibrate === 'function'
    ) {
      try {
        navigator.vibrate(12);
      } catch {
        // Safely ignore vibration restrictions on unsupported browsers/contexts
      }
    }
    action();
  };

  const currentSlideHuman = String(slideIndex + 1).padStart(2, '0');

  return (
    <section className="tv-stage-section mx-auto flex w-full max-w-[1280px] flex-1 flex-col justify-between overflow-x-clip px-3 py-3 font-kalam sm:px-6 md:px-10 md:py-4">
      {/* Compact Outer Utility Bar (Preserves Portfolio PDF Links) */}
      <div className="tv-utility-bar mb-2.5 flex shrink-0 flex-wrap items-center justify-between gap-2 sm:mb-3 sm:gap-3">
        <p className="font-kalam text-xs text-[#F05BEA] tabular-nums">
          08 · Portfolio Presentation
        </p>

        <div className="flex flex-wrap items-center gap-2.5">
          <a
            href={PORTFOLIO_PDF_PATH}
            target="_blank"
            rel="noopener noreferrer"
            className="touch-press inline-flex min-h-[38px] sm:min-h-[36px] items-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.04] px-3 py-1.5 font-kalam text-xs font-semibold text-[#FFFFFF] transition-colors duration-200 hover:border-[#F05BEA]/65 hover:bg-[#F05BEA]/15 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8FF27]"
          >
            <ExternalPortalIcon className="h-3.5 w-3.5 text-[#F05BEA]" />
            <span>View Portfolio</span>
          </a>
        </div>
      </div>

      {/* Physical 55-Inch OLED Smart TV Display Stage (+ Compact SL TV Remote Beside the Right Side on Desktop/Laptop) */}
      <div
        className={`relative mx-auto my-auto flex w-full flex-col items-center ${
          isDesktop
            ? 'lg:flex-row lg:items-center lg:justify-center lg:gap-5 xl:gap-7'
            : 'max-w-[980px]'
        }`}
      >
        {/* TV Column (Ambient Glow + Flanking Arrows + TV Chassis/Stand + Hint) */}
        <div
          className={`relative flex w-full flex-col items-center ${
            isDesktop ? 'min-w-0 flex-1' : ''
          }`}
        >
          {/* Ambient Wall Backlight Glow Behind TV */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 -top-4 bottom-12 -z-10 rounded-[48px] bg-[radial-gradient(ellipse_at_center,rgba(34,211,238,0.14)_0%,rgba(240,91,234,0.07)_44%,transparent_72%)] blur-2xl sm:-inset-x-6"
          />

          {/* TV Row + Flanking Prev/Next Controls */}
          <div className="flex w-full items-center justify-center gap-2 sm:gap-3.5 md:gap-4">
          {/* Flanking Left Arrow (Visible on Tablet and Desktop; hidden on Mobile) */}
          {!isMobile && (
            <button
              type="button"
              onClick={goPrevSlide}
              aria-label="Previous slide"
              className="touch-press inline-flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-[#071B1B]/90 text-[#A0B2B2] shadow-lg transition-colors duration-200 hover:border-[#C8FF27]/70 hover:text-[#C8FF27] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8FF27]"
            >
              <ChevronPrevIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          )}

          {/* Realistic OLED Television Chassis + Slim Black Bezels + Stand */}
          <div className="tv-stage-chassis flex flex-col items-center">
            {/* Outer Precision Metallic Rim & Slim Black Bezel */}
            <div className="tv-chassis-metal relative w-full overflow-hidden rounded-[10px] bg-gradient-to-b from-[#343a3e] via-[#121618] to-[#050607] p-[2px] shadow-[0_32px_70px_-16px_rgba(0,0,0,0.96),0_0_0_1px_rgba(255,255,255,0.06)]">
              <div className="tv-chassis-metal relative z-10 overflow-hidden rounded-[8px] bg-[#040607] p-[5px] sm:p-[8px] md:p-[9px]">
                {/* OLED Display Panel — Strict 16:9 Inner Stage Scaled via object-fit:contain Math */}
                <div
                  ref={screenRef}
                  onPointerDown={handlePointerDown}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerCancel}
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                  onTouchCancel={handleTouchCancel}
                  className="tv-screen-canvas relative z-10 flex touch-pan-y select-none flex-col rounded-[3px] bg-gradient-to-br from-[#082020] via-[#071B1B] to-[#041212] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]"
                >
                  {/* Realistic Anti-Reflective OLED Screen Glass Sheen */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 z-20 bg-[linear-gradient(122deg,rgba(255,255,255,0.045)_0%,rgba(255,255,255,0.015)_26%,transparent_50%)]"
                  />
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 top-0 z-20 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"
                  />

                  {/* Fixed TV Channel Watermark Overlay (Upper-Right Inside TV Screen) */}
                  <img
                    src="/assets/portal-logo.png"
                    alt=""
                    aria-hidden="true"
                    draggable={false}
                    className="pointer-events-none absolute top-2.5 right-2.5 z-20 h-6 w-6 select-none object-contain opacity-55 sm:top-4 sm:right-5 sm:h-10 sm:w-10 md:top-5 md:right-6 md:h-12 md:w-12"
                  />

                  {/* Scaled 960x540 Canonical TV Broadcast Stage (Zero Clipping / Zero Scroll) */}
                  <div
                    ref={stageHostRef}
                    className="tv-slide-stage z-10 flex flex-col px-11 py-8 font-kalam"
                  >
                    <AnimatePresence mode="wait" custom={direction}>
                      <motion.article
                        key={slideIndex}
                        custom={direction}
                        variants={SLIDE_MOTION_VARIANTS}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                          duration: 0.28,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                        className="flex h-full w-full flex-col justify-between font-kalam"
                      >
                        {renderSlideContent(slideIndex)}
                      </motion.article>
                    </AnimatePresence>
                  </div>
                </div>

                {/* Slim Bottom Bezel Chin + Hardware Power LED + Sharp Metallic SL TV Logo & Standby LED */}
                <div className="tv-chassis-metal relative z-10 flex h-[16px] items-center justify-center overflow-hidden bg-gradient-to-b from-[#0b0e10] to-[#050607] sm:h-[19px] md:h-[22px]">
                  <span
                    aria-hidden="true"
                    className={`relative z-10 h-1.5 w-1.5 rounded-full transition-colors duration-300 ${
                      isAutoPlayActive
                        ? 'bg-[#C8FF27]/85 shadow-[0_0_8px_rgba(200,255,39,0.8)]'
                        : 'bg-[#C8FF27]/40 shadow-[0_0_5px_rgba(200,255,39,0.4)]'
                    }`}
                  />
                  <div className="pointer-events-none absolute right-2 z-10 flex items-center gap-1.5 sm:right-3 sm:gap-2">
                    <span
                      aria-live="polite"
                      aria-label={`TV Channel ${currentSlideHuman}`}
                      className="tv-bezel-led-readout inline-flex items-center rounded-[3px] px-1.5 py-[1px] text-[9.5px] font-bold sm:px-2 sm:py-[1.5px] sm:text-[11.5px] md:px-2 md:py-[2px] md:text-[13px]"
                    >
                      {digitBuffer
                        ? `CH ${digitBuffer}_`
                        : `CH ${currentSlideHuman}`}
                    </span>
                    <SlTvEmblemLogo className="tv-brand-sl-logo h-[12px] w-auto sm:h-[15px] md:h-[17px]" />
                    <span
                      aria-hidden="true"
                      title="Standby"
                      className="tv-standby-led h-1 w-1 rounded-full bg-red-400/90 shadow-[0_0_8px_rgba(248,113,113,0.9)] sm:h-1.5 sm:w-1.5"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Physical Pedestal Neck & Brushed-Metal Stand Base with Gentle Floating/Breathing Rhythm */}
            <div
              aria-hidden="true"
              className="relative flex w-full flex-col items-center"
            >
              <div className="tv-stand-breathe flex w-full flex-col items-center">
                {/* Neck */}
                <div className="tv-stand-neck h-4 w-16 border-x border-white/[0.08] bg-gradient-to-r from-[#101416] via-[#2b3135] to-[#101416] shadow-[inset_0_4px_10px_rgba(0,0,0,0.8)] sm:h-6 sm:w-24 md:h-7 md:w-28" />
                {/* Flat Sculpted Pedestal Base */}
                <div className="tv-stand-base relative z-10 h-2 w-[44%] min-w-[140px] max-w-[360px] rounded-t-[5px] rounded-b-[2px] border-t border-white/25 bg-gradient-to-b from-[#343b3f] via-[#171b1d] to-[#090b0c] shadow-[0_14px_24px_-4px_rgba(0,0,0,0.95)] sm:h-2.5 sm:min-w-[180px] md:h-3" />
              </div>
              {/* Realistic Tabletop Contact Shadow */}
              <div className="tv-stand-shadow tv-stand-shadow-breathe -mt-1 h-2.5 w-[64%] max-w-[520px] rounded-full bg-black/80 blur-md sm:h-3.5" />
            </div>
          </div>

          {/* Flanking Right Arrow (Visible on Tablet and Desktop; hidden on Mobile) */}
          {!isMobile && (
            <button
              type="button"
              onClick={goNextSlide}
              aria-label="Next slide"
              className="touch-press inline-flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-[#071B1B]/90 text-[#A0B2B2] shadow-lg transition-colors duration-200 hover:border-[#C8FF27]/70 hover:text-[#C8FF27] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8FF27]"
            >
              <ChevronNextIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          )}
          </div>

          {/* Tablet (Portrait & Landscape): Existing Keyboard/Swipe Hint, No Remote */}
          {isTablet && (
            <p className="mt-2.5 text-center font-kalam text-xs text-[#A0B2B2]">
              {isPortrait
                ? 'Swipe or Tap Arrows to Navigate'
                : 'Tap Arrows or Swipe to Navigate'}
            </p>
          )}

          {/* Desktop / Laptop: Subtle Hint Centered Below TV Stand */}
          {isDesktop && (
            <p className="mt-1.5 text-center font-kalam text-xs text-[#A0B2B2]">
              Left / Right Arrow: Navigate · Keys 0–9: Jump to Slide
            </p>
          )}
        </div>

        {/* Desktop / Laptop: Compact Anodized SL TV Wand Remote Aligned Beside the Right Side of TV */}
        {isDesktop && (
          <div
            ref={remoteContainerRef}
            aria-label="SL TV Remote Control"
            className="tv-remote-desktop tv-remote-wand w-[164px] shrink-0 select-none xl:w-[172px]"
          >
            {/* Upper Obsidian Glass Panel + SL TV OLED Display */}
            <div className="tv-remote-glass flex h-[118px] w-full flex-col justify-between rounded-t-[14px] px-2.5 pt-2 pb-1">
              <div className="tv-remote-glass-oled flex flex-1 flex-col justify-between overflow-hidden rounded-[6px] px-2 py-1">
                {/* Top-Right Green Battery Indicator */}
                <div className="flex items-center justify-end">
                  <RemoteBatteryIcon className="h-[7px] w-[14px]" />
                </div>

                {/* Center Channel Readout + Sub-label + Status Pill */}
                <div className="my-auto flex flex-col items-center text-center">
                  <output
                    aria-live="polite"
                    className={`block text-[20px] leading-none font-light tracking-[-0.02em] tabular-nums ${
                      remoteError
                        ? 'text-[13px] font-medium text-[#F05BEA]'
                        : digitBuffer
                          ? 'text-[#C8FF27]'
                          : 'text-[#FFFFFF]'
                    }`}
                  >
                    {remoteError ??
                      (digitBuffer
                        ? `CH ${digitBuffer}_`
                        : `CH ${currentSlideHuman}`)}
                  </output>
                  <span className="mt-0.5 block text-[9px] font-normal tracking-wide text-[#c5c9d1] tabular-nums">
                    {remoteError
                      ? 'Valid range 01–13'
                      : digitBuffer
                        ? 'Entering slide'
                        : `Slide ${currentSlideHuman} of ${TOTAL_SLIDES}`}
                  </span>

                  <button
                    type="button"
                    onClick={(e) =>
                      handleRemoteButtonClick(
                        e,
                        isDesktopAutoPlay
                          ? handlePauseRemote
                          : handlePlayRemote
                      )
                    }
                    aria-pressed={isDesktopAutoPlay}
                    aria-label={
                      isDesktopAutoPlay
                        ? 'Pause automatic slideshow playback'
                        : 'Resume automatic slideshow playback'
                    }
                    className="mt-1 inline-flex h-[16px] items-center justify-center rounded-full border border-white/10 bg-[#25272b] px-2.5 text-[8px] font-medium tracking-[0.06em] text-[#e5e7eb] uppercase shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-all duration-150 hover:scale-[0.97] hover:border-white/25 hover:text-white active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C8FF27]"
                  >
                    {isDesktopAutoPlay ? 'AUTO PLAY' : 'PAUSED'}
                  </button>
                </div>
              </div>

              {/* SL TV Metallic Emblem on Lower Gloss Bezel */}
              <div className="flex items-center justify-center pt-1">
                <SlTvEmblemLogo className="tv-brand-sl-logo h-[22px] w-auto" />
              </div>
            </div>

            {/* Crisp Physical Seam Between Black Glass and Brushed Anodized Metal */}
            <div aria-hidden="true" className="tv-remote-seam w-full" />

            {/* Lower Brushed Dark Gunmetal Hardware Plate with Required Tactile Controls */}
            <div className="tv-remote-metal rounded-b-[14px] px-3 pt-2.5 pb-2.5">
              <div className="relative z-10 flex flex-col">
                {/* 0–9 Numeric Keypad + CLEAR + ENTER */}
                <div className="grid grid-cols-3 gap-[5px]">
                  {REMOTE_KEYPAD_ROWS.flat().map((digit) => (
                    <button
                      key={digit}
                      type="button"
                      onClick={(e) =>
                        handleRemoteButtonClick(e, () =>
                          handleDigitInput(digit)
                        )
                      }
                      aria-label={`Slide digit ${digit}`}
                      className="tv-remote-key inline-flex h-[24px] items-center justify-center rounded-[4px] text-[11.5px] font-medium text-[#e5e7eb] tabular-nums cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C8FF27]"
                    >
                      {digit}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={(e) =>
                      handleRemoteButtonClick(e, clearRemoteState)
                    }
                    aria-label="Clear entered slide number"
                    className="tv-remote-key inline-flex h-[24px] items-center justify-center rounded-[4px] text-[8px] font-semibold tracking-wider text-[#F05BEA] cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#F05BEA]"
                  >
                    CLEAR
                  </button>

                  <button
                    type="button"
                    onClick={(e) =>
                      handleRemoteButtonClick(e, () => handleDigitInput('0'))
                    }
                    aria-label="Slide digit 0"
                    className="tv-remote-key inline-flex h-[24px] items-center justify-center rounded-[4px] text-[11.5px] font-medium text-[#e5e7eb] tabular-nums cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C8FF27]"
                  >
                    0
                  </button>

                  <button
                    type="button"
                    onClick={(e) =>
                      handleRemoteButtonClick(e, handleEnterRemote)
                    }
                    aria-label="Enter to confirm slide selection"
                    className="tv-remote-key inline-flex h-[24px] items-center justify-center rounded-[4px] text-[8px] font-semibold tracking-wider text-[#C8FF27] cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C8FF27]"
                  >
                    ENTER
                  </button>
                </div>

                {/* Playback & Slide Navigation Buttons */}
                <div className="mt-2 grid grid-cols-2 gap-[5px] border-t border-black/45 pt-2">
                  <button
                    type="button"
                    onClick={(e) =>
                      handleRemoteButtonClick(e, handlePlayRemote)
                    }
                    aria-pressed={isDesktopAutoPlay}
                    aria-label="Play automatic slideshow"
                    className={`tv-remote-key inline-flex h-[24px] items-center justify-center gap-1 rounded-[4px] text-[8.5px] font-semibold tracking-wider cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C8FF27] ${
                      isDesktopAutoPlay
                        ? 'border-[#C8FF27]/50 text-[#C8FF27]'
                        : 'text-[#d1d5db]'
                    }`}
                  >
                    <RemotePlaySolidIcon className="h-2.5 w-2.5" />
                    <span>PLAY</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) =>
                      handleRemoteButtonClick(e, handlePauseRemote)
                    }
                    aria-pressed={!isDesktopAutoPlay}
                    aria-label="Pause automatic slideshow"
                    className={`tv-remote-key inline-flex h-[24px] items-center justify-center gap-1 rounded-[4px] text-[8.5px] font-semibold tracking-wider cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#F05BEA] ${
                      !isDesktopAutoPlay
                        ? 'border-[#F05BEA]/50 text-[#F05BEA]'
                        : 'text-[#d1d5db]'
                    }`}
                  >
                    <RemotePauseSolidIcon className="h-2.5 w-2.5" />
                    <span>PAUSE</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleRemoteButtonClick(e, goPrevSlide)}
                    aria-label="Previous slide"
                    className="tv-remote-key inline-flex h-[24px] items-center justify-center gap-1 rounded-[4px] text-[8.5px] font-semibold tracking-wider text-[#e5e7eb] cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C8FF27]"
                  >
                    <RemotePrevIcon className="h-2.5 w-2.5" />
                    <span>PREV</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleRemoteButtonClick(e, goNextSlide)}
                    aria-label="Next slide"
                    className="tv-remote-key inline-flex h-[24px] items-center justify-center gap-1 rounded-[4px] text-[8.5px] font-semibold tracking-wider text-[#e5e7eb] cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C8FF27]"
                  >
                    <span>NEXT</span>
                    <RemoteNextIcon className="h-2.5 w-2.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function SlideHeading({ children }: { children: string }) {
  return (
    <header className="shrink-0 border-b border-white/15 pb-3 pr-14">
      <h1 className="font-kalam text-[2.25rem] leading-tight font-bold tracking-wide text-[#FFFF00]">
        {children}
      </h1>
    </header>
  );
}

function renderSlideContent(index: number) {
  switch (index) {
    case 0:
      return (
        <div className="flex h-full flex-col justify-center px-2">
          <p className="pr-14 font-kalam text-[1.05rem] font-bold tracking-[0.16em] text-[#C8FF27] uppercase">
            Department of Artificial Intelligence &amp; Data Science
          </p>
          <h1 className="mt-3 font-kalam text-[4.35rem] leading-[1.05] font-bold tracking-wide text-[#FFFF00]">
            Resume
          </h1>
          <div className="my-6 h-px w-full bg-white/15" />
          <p className="font-kalam text-[2.25rem] leading-tight font-bold text-[#FFFFFF]">
            {PROFILE.name}
          </p>
          <p className="mt-2 font-kalam text-[1.35rem] text-[#A0B2B2]">
            {PROFILE.college}
          </p>
          <p className="mt-5 font-kalam text-[1.05rem] font-bold tracking-wide text-[#C8FF27]">
            {PROFILE.yearLabel} · Academic Year {PROFILE.academicYear}
          </p>
        </div>
      );

    case 1:
      return (
        <div className="flex h-full flex-col">
          <SlideHeading>About Me</SlideHeading>
          <div className="mt-6 grid flex-1 grid-cols-12 items-center gap-8 py-2">
            <div className="col-span-7 space-y-6 font-kalam text-[1.32rem] leading-[1.65] text-[#FFFFFF]">
              <p>
                I am Sabarivasan G, a second-year B.Tech student in Artificial Intelligence and Data Science at Sri Ramakrishna Institute of Technology.
              </p>
              <p className="text-[#A0B2B2]">
                I am passionate about programming, data and innovation. I keep building my skills through certified courses, hands-on practice and new technologies.
              </p>
            </div>

            <div className="col-span-5 flex h-full flex-col justify-center border-l border-white/15 pl-8">
              <h2 className="font-kalam text-[1.15rem] font-bold tracking-[0.12em] text-[#C8FF27] uppercase">
                Personal Details
              </h2>
              <dl className="mt-4 space-y-4 font-kalam text-[1.08rem]">
                <div>
                  <dt className="text-sm text-[#A0B2B2]">Name</dt>
                  <dd className="font-bold text-[#FFFFFF]">{PROFILE.name}</dd>
                </div>
                <div>
                  <dt className="text-sm text-[#A0B2B2]">Department</dt>
                  <dd className="font-bold text-[#FFFFFF]">
                    Artificial Intelligence &amp; Data Science
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-[#A0B2B2]">Year</dt>
                  <dd className="font-bold text-[#C8FF27]">{PROFILE.yearLabel}</dd>
                </div>
                <div>
                  <dt className="text-sm text-[#A0B2B2]">College</dt>
                  <dd className="font-bold text-[#FFFFFF]">{PROFILE.college}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      );

    case 2:
      return (
        <div className="flex h-full flex-col">
          <SlideHeading>Career Objective</SlideHeading>
          <div className="my-auto space-y-7 py-4 font-kalam">
            <p className="text-[1.85rem] leading-[1.52] text-[#FFFFFF]">
              To build a successful career in technology by applying my knowledge of programming, data analysis and mathematics to Artificial Intelligence and Data Science.
            </p>
            <div className="h-px w-full bg-white/15" />
            <p className="text-[1.35rem] leading-[1.6] text-[#A0B2B2]">
              I aim to grow into a skilled professional through continuous learning, dedication and hands-on practice.
            </p>
          </div>
        </div>
      );

    case 3:
      return (
        <div className="flex h-full flex-col">
          <SlideHeading>Educational Qualification</SlideHeading>
          <div className="mt-6 grid flex-1 grid-cols-2 items-stretch gap-8 py-2">
            <div className="flex flex-col justify-between">
              <h2 className="font-kalam text-[1.45rem] font-bold text-[#C8FF27]">
                Undergraduate Education
              </h2>
              <dl className="mt-4 flex flex-1 flex-col justify-evenly font-kalam text-[1.15rem]">
                <div>
                  <dt className="text-[0.95rem] text-[#A0B2B2]">Degree</dt>
                  <dd className="font-bold text-[#FFFFFF]">B.Tech</dd>
                </div>
                <div>
                  <dt className="text-[0.95rem] text-[#A0B2B2]">Department</dt>
                  <dd className="font-bold text-[#FFFFFF]">
                    Artificial Intelligence &amp; Data Science
                  </dd>
                </div>
                <div>
                  <dt className="text-[0.95rem] text-[#A0B2B2]">Institution</dt>
                  <dd className="font-bold text-[#FFFFFF]">{PROFILE.college}</dd>
                </div>
                <div>
                  <dt className="text-[0.95rem] text-[#A0B2B2]">Current Year</dt>
                  <dd className="font-bold text-[#C8FF27]">{PROFILE.yearLabel}</dd>
                </div>
              </dl>
            </div>

            <div className="flex flex-col justify-between border-l border-white/15 pl-8">
              <h2 className="font-kalam text-[1.45rem] font-bold text-[#C8FF27]">
                School Education
              </h2>
              <ul className="mt-4 flex flex-1 flex-col justify-evenly font-kalam text-[1.15rem]">
                <li className="flex items-start gap-2.5">
                  <span aria-hidden="true" className="text-[#FFFF00]">
                    •
                  </span>
                  <div>
                    <p className="font-bold text-[#FFFFFF]">
                      Higher Secondary -{' '}
                      <span className="text-[#C8FF27] tabular-nums">85.5%</span>
                    </p>
                    <p className="mt-1.5 text-[1.02rem] leading-relaxed text-[#A0B2B2]">
                      Thanappa Gounder Matric Higher Secondary School, Dharmapuri
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-2.5 border-t border-white/10 pt-6">
                  <span aria-hidden="true" className="text-[#FFFF00]">
                    •
                  </span>
                  <div>
                    <p className="font-bold text-[#FFFFFF]">
                      SSLC –{' '}
                      <span className="text-[#C8FF27] tabular-nums">81%</span>
                    </p>
                    <p className="mt-1.5 text-[1.02rem] leading-relaxed text-[#A0B2B2]">
                      Thanappa Gounder Matric Higher Secondary School, Dharmapuri
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      );

    case 4:
      return (
        <div className="flex h-full flex-col">
          <SlideHeading>Technical Skills</SlideHeading>
          <div className="mt-6 grid flex-1 grid-cols-2 grid-rows-2 items-stretch gap-x-10 gap-y-6 py-2">
            <div className="flex flex-col justify-center border-b border-white/10 pb-4">
              <h2 className="font-kalam text-[1.4rem] font-bold text-[#C8FF27]">
                Programming Languages
              </h2>
              <ul className="mt-2.5 space-y-2 font-kalam text-[1.18rem] text-[#FFFFFF]">
                <li>• Python Programming</li>
                <li>• C Programming</li>
              </ul>
            </div>

            <div className="flex flex-col justify-center border-b border-white/10 pb-4">
              <h2 className="font-kalam text-[1.4rem] font-bold text-[#C8FF27]">
                Database Technologies
              </h2>
              <ul className="mt-2.5 space-y-1.5 font-kalam text-[1.18rem] text-[#FFFFFF]">
                <li>• SQL</li>
                <li>• DBMS</li>
                <li>• MongoDB</li>
              </ul>
            </div>

            <div className="flex flex-col justify-center">
              <h2 className="font-kalam text-[1.4rem] font-bold text-[#C8FF27]">
                Technical Tools
              </h2>
              <ul className="mt-2.5 space-y-2 font-kalam text-[1.18rem] text-[#FFFFFF]">
                <li>• MATLAB</li>
                <li>• Microsoft Excel</li>
              </ul>
            </div>

            <div className="flex flex-col justify-center">
              <h2 className="font-kalam text-[1.4rem] font-bold text-[#C8FF27]">
                Technical Knowledge
              </h2>
              <ul className="mt-2.5 space-y-2 font-kalam text-[1.15rem] leading-snug text-[#FFFFFF]">
                <li>• Data Analysis · AI Fundamentals</li>
                <li>• Data Structures and Algorithms · Mathematical Computing</li>
              </ul>
            </div>
          </div>
        </div>
      );

    case 5:
      return (
        <div className="flex h-full flex-col">
          <SlideHeading>Soft Skills</SlideHeading>
          <div className="mt-6 grid flex-1 grid-cols-2 grid-rows-4 gap-x-10 gap-y-4 py-2">
            {[
              'Communication Skills',
              'Problem-Solving Skills',
              'Teamwork and Collaboration',
              'Time Management',
              'Critical Thinking',
              'Adaptability',
              'Quick Learning',
              'Self-Motivation',
            ].map((skill) => (
              <div
                key={skill}
                className="flex items-center gap-3 border-b border-white/10 py-2 font-kalam text-[1.32rem] text-[#FFFFFF]"
              >
                <span aria-hidden="true" className="text-[#C8FF27]">
                  •
                </span>
                <span>{skill}</span>
              </div>
            ))}
          </div>
        </div>
      );

    case 6:
      return (
        <div className="flex h-full flex-col">
          <SlideHeading>Areas of Interest</SlideHeading>
          <div className="mt-6 grid flex-1 grid-cols-2 grid-rows-4 gap-x-10 gap-y-4 py-2">
            {[
              ['01', 'Artificial Intelligence'],
              ['02', 'Machine Learning'],
              ['03', 'Data Science'],
              ['04', 'Python Programming'],
              ['05', 'Data Analytics'],
              ['06', 'Database Management'],
              ['07', 'Mathematical Computing'],
              ['08', 'Emerging Technologies'],
            ].map(([num, label]) => (
              <div
                key={num}
                className="flex items-center gap-3.5 border-b border-white/10 py-2 font-kalam text-[1.32rem]"
              >
                <span className="font-bold text-[#C8FF27] tabular-nums">{num}</span>
                <span className="text-[#FFFFFF]">{label}</span>
              </div>
            ))}
          </div>
        </div>
      );

    case 7:
      return (
        <div className="flex h-full flex-col justify-between">
          <SlideHeading>Academic Learning</SlideHeading>

          <ul className="my-auto grid grid-cols-4 gap-x-6 gap-y-8 py-4 font-kalam text-[1.08rem] leading-snug text-[#FFFFFF]">
            {[
              'Programming Fundamentals',
              'Database Management Systems',
              'Data Structures and Algorithms',
              'Linear Algebra',
              'Probability and Statistics',
              'Python for Scientific Computing',
              'Fundamentals of Artificial Intelligence',
              'Data Analysis Techniques',
            ].map((subject) => (
              <li
                key={subject}
                className="flex items-start gap-2.5 border-b border-white/10 pb-4"
              >
                <span aria-hidden="true" className="text-[#C8FF27]">
                  •
                </span>
                <span>{subject}</span>
              </li>
            ))}
          </ul>

          <div className="border-t border-white/15 pt-4">
            <h2 className="font-kalam text-[1rem] font-bold tracking-[0.12em] text-[#C8FF27] uppercase">
              Learning Goal
            </h2>
            <p className="mt-1.5 font-kalam text-[1.22rem] leading-relaxed text-[#A0B2B2]">
              To strengthen my theoretical foundation and turn it into practical technical skills through continuous, hands-on learning.
            </p>
          </div>
        </div>
      );

    case 8:
      return (
        <div className="flex h-full flex-col">
          <SlideHeading>Certifications &amp; Technical Courses</SlideHeading>
          <div className="mt-6 grid flex-1 grid-cols-12 items-stretch gap-8 py-2">
            <div className="col-span-5 flex flex-col justify-evenly">
              <div>
                <h2 className="font-kalam text-[1.3rem] font-bold text-[#C8FF27]">
                  1. NPTEL – IIT Madras
                </h2>
                <ul className="mt-2.5 font-kalam text-[1.1rem] text-[#FFFFFF]">
                  <li>• Design Thinking – A Primer (Elite, 63%)</li>
                </ul>
              </div>

              <div className="border-t border-white/10 pt-5">
                <h2 className="font-kalam text-[1.3rem] font-bold text-[#C8FF27]">
                  2. IBM Career Education Program
                </h2>
                <ul className="mt-2.5 space-y-2 font-kalam text-[1.1rem] text-[#FFFFFF]">
                  <li>• Clean Coding</li>
                  <li>• DevOps, Agile &amp; Design Thinking</li>
                </ul>
              </div>
            </div>

            <div className="col-span-7 flex flex-col justify-center border-l border-white/15 pl-8">
              <h2 className="font-kalam text-[1.3rem] font-bold text-[#C8FF27]">
                3. MATLAB – MathWorks
              </h2>
              <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-4 font-kalam text-[1.06rem] leading-snug text-[#FFFFFF]">
                <li>• MATLAB Onramp</li>
                <li>• Symbolic Math Onramp</li>
                <li>• MATLAB Coder Onramp</li>
                <li>• The How and Why of Writing Functions</li>
                <li>• Introduction to Linear Algebra with MATLAB</li>
                <li>• Calculations with Vectors and Matrices</li>
                <li>• Statistics Onramp</li>
                <li>• + 5 Data Analysis Courses (Slide 10)</li>
              </ul>
            </div>
          </div>
        </div>
      );

    case 9:
      return (
        <div className="flex h-full flex-col">
          <SlideHeading>Technical Courses &amp; Data Specializations</SlideHeading>
          <div className="mt-5 grid flex-1 grid-cols-3 items-stretch gap-6 divide-x divide-white/15 py-1">
            <div className="flex flex-col justify-between pr-4">
              <h2 className="font-kalam text-[1.15rem] font-bold text-[#C8FF27]">
                4. Python &amp; Data Science (Infosys)
              </h2>
              <ul className="mt-3 flex flex-1 flex-col justify-evenly font-kalam text-[0.98rem] leading-snug text-[#FFFFFF]">
                <li>• Python for Data Science and Machine Learning Bootcamp</li>
                <li>• Introduction to Data Science</li>
                <li>• Data Science Foundation</li>
                <li>• Basics of Linear Algebra using Python</li>
                <li>• Probability and Statistics using Python</li>
                <li>• Statistical Inference using Python</li>
                <li>• Probability Distribution using Python</li>
              </ul>
            </div>

            <div className="flex flex-col justify-between px-4">
              <div className="flex flex-1 flex-col">
                <h2 className="font-kalam text-[1.15rem] font-bold text-[#C8FF27]">
                  5. Databases &amp; Systems
                </h2>
                <ul className="mt-3 flex flex-1 flex-col justify-evenly font-kalam text-[0.96rem] leading-snug text-[#FFFFFF]">
                  <li>• Project on MySQL</li>
                  <li>
                    • MongoDB: Basics, AI Agents, RAG, Vector Search &amp; AI Data Strategy
                  </li>
                  <li>• Unix Linux OS – Unix Fundamentals</li>
                  <li>• Ethical AI (Infosys Springboard)</li>
                  <li>• Excel Macros &amp; VBA for Beginners</li>
                </ul>
              </div>

              <div className="mt-3 border-t border-white/10 pt-3">
                <h2 className="font-kalam text-[1.15rem] font-bold text-[#C8FF27]">
                  7. Cybersecurity
                </h2>
                <p className="mt-1.5 font-kalam text-[0.96rem] leading-snug text-[#A0B2B2]">
                  • Tech Mahindra Foundation (Skill India Digital Hub, 10 Hours)
                </p>
              </div>
            </div>

            <div className="flex flex-col justify-between pl-4">
              <h2 className="font-kalam text-[1.15rem] font-bold text-[#C8FF27]">
                6. Data Analysis (MathWorks)
              </h2>
              <ul className="mt-3 flex flex-1 flex-col justify-evenly font-kalam text-[0.98rem] leading-snug text-[#FFFFFF]">
                <li>• Common Data Analysis Techniques</li>
                <li>• Calculations on Grouped Data</li>
                <li>• Find and Extract Subsets of Data</li>
                <li>• Clean and Prepare Data for Analysis</li>
                <li>• Tables</li>
              </ul>
            </div>
          </div>
        </div>
      );

    case 10:
      return (
        <div className="flex h-full flex-col">
          <SlideHeading>Achievements &amp; Participation</SlideHeading>
          <ul className="mt-5 grid flex-1 grid-cols-2 content-evenly gap-x-10 gap-y-5 font-kalam text-[1.08rem] leading-snug">
            <li className="border-b border-white/10 pb-3.5">
              <h2 className="font-kalam text-[1.18rem] font-bold text-[#C8FF27]">
                • NPTEL Elite Certification
              </h2>
              <p className="mt-1 text-[#A0B2B2]">
                Earned the Elite certificate for Design Thinking – A Primer, scoring 63%.
              </p>
            </li>

            <li className="border-b border-white/10 pb-3.5">
              <h2 className="font-kalam text-[1.18rem] font-bold text-[#C8FF27]">
                • TEDxSRIT Participation
              </h2>
              <p className="mt-1 text-[#A0B2B2]">
                Participated in TEDxSRIT on the theme “Human in the Loop”.
              </p>
            </li>

            <li className="border-b border-white/10 pb-3.5">
              <h2 className="font-kalam text-[1.18rem] font-bold text-[#C8FF27]">
                • Technical Learning
              </h2>
              <p className="mt-1 text-[#A0B2B2]">
                Completed 32 technical courses across MathWorks, Infosys Springboard, MongoDB, IBM, Simplilearn &amp; Tech Mahindra Foundation.
              </p>
            </li>

            <li className="border-b border-white/10 pb-3.5">
              <h2 className="font-kalam text-[1.18rem] font-bold text-[#C8FF27]">
                • Entrepreneurship Participation
              </h2>
              <p className="mt-1 text-[#A0B2B2]">
                Completed the Illuminate Entrepreneurship Bootcamp at SRIT in association with E-Cell, IIT Bombay.
              </p>
            </li>

            <li className="col-span-2 pt-1">
              <h2 className="font-kalam text-[1.18rem] font-bold text-[#C8FF27]">
                • Smart India Hackathon (SIH)
              </h2>
              <p className="mt-1 text-[#A0B2B2]">
                Participated in the internal round of the Smart India Hackathon at college.
              </p>
            </li>
          </ul>
        </div>
      );

    case 11:
      return (
        <div className="flex h-full flex-col">
          <SlideHeading>Strengths &amp; Hobbies</SlideHeading>
          <div className="mt-6 grid flex-1 grid-cols-2 items-stretch gap-8 py-2">
            <div className="flex flex-col justify-between">
              <h2 className="font-kalam text-[1.45rem] font-bold text-[#C8FF27]">
                My Strengths
              </h2>
              <ul className="mt-4 flex flex-1 flex-col justify-evenly font-kalam text-[1.24rem] text-[#FFFFFF]">
                <li>• Self-Motivated</li>
                <li>• Hardworking</li>
                <li>• Quick Learner</li>
                <li>• Positive Attitude</li>
                <li>• Adaptability</li>
                <li>• Willingness to Learn</li>
              </ul>
            </div>

            <div className="flex flex-col justify-between border-l border-white/15 pl-8">
              <h2 className="font-kalam text-[1.45rem] font-bold text-[#C8FF27]">
                My Hobbies
              </h2>
              <ul className="mt-4 flex flex-1 flex-col justify-evenly font-kalam text-[1.24rem] text-[#FFFFFF]">
                <li>• Exploring New Technologies</li>
                <li>• Learning Programming</li>
                <li>• Listening to Music</li>
                <li>• Improving Technical Knowledge</li>
                <li>• Exploring New Ideas</li>
              </ul>
            </div>
          </div>
        </div>
      );

    case 12:
    default:
      return (
        <div className="flex h-full flex-col justify-center px-2">
          <div className="grid grid-cols-12 items-center gap-8">
            <div className="col-span-7">
              <h1 className="font-kalam text-[4.35rem] leading-[1.05] font-bold tracking-wide text-[#FFFF00]">
                Thank You!
              </h1>
              <div className="my-5 h-px w-full bg-white/15" />
              <p className="font-kalam text-[2rem] font-bold text-[#FFFFFF]">
                {PROFILE.name}
              </p>
              <p className="mt-2 font-kalam text-[1.12rem] text-[#A0B2B2]">
                {PROFILE.degree} · {PROFILE.college}
              </p>
            </div>

            <div className="col-span-5 border-l border-white/15 pl-8">
              <h2 className="font-kalam text-[1.18rem] font-bold tracking-[0.14em] text-[#C8FF27] uppercase">
                Contact Details
              </h2>
              <dl className="mt-4 space-y-4 font-kalam text-[1.08rem]">
                <div>
                  <dt className="text-sm text-[#A0B2B2]">Email</dt>
                  <dd className="mt-0.5">
                    <span className="break-all font-bold text-[#FFFFFF]">
                      {PROFILE.email}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-[#A0B2B2]">Mobile</dt>
                  <dd className="mt-0.5 tabular-nums">
                    <span className="font-bold text-[#FFFFFF]">
                      {PROFILE.mobile}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-[#A0B2B2]">Location</dt>
                  <dd className="mt-0.5 font-bold text-[#FFFFFF]">
                    {PROFILE.location}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      );
  }
}

function RemoteBatteryIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 22 11"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <rect
        x="1"
        y="1"
        width="17"
        height="9"
        rx="1.6"
        stroke="#4ade80"
        strokeWidth="1.2"
      />
      <rect x="2.8" y="2.8" width="11.5" height="5.4" rx="0.6" fill="#22c55e" />
      <rect x="19" y="3.5" width="2" height="4" rx="0.7" fill="#4ade80" />
    </svg>
  );
}

function RemotePrevIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path
        d="M11.5 6.5 5.5 12l6 5.5v-11ZM18.5 6.5 12.5 12l6 5.5v-11Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function RemoteNextIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path
        d="M5.5 6.5 11.5 12l-6 5.5v-11ZM12.5 6.5 18.5 12l-6 5.5v-11Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function RemotePlaySolidIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M7.5 5.5 18.5 12l-11 6.5V5.5Z" />
    </svg>
  );
}

function RemotePauseSolidIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <rect x="6.5" y="5.5" width="4" height="13" rx="1" />
      <rect x="13.5" y="5.5" width="4" height="13" rx="1" />
    </svg>
  );
}

function SlTvEmblemLogo({ className }: { className?: string }) {
  const uid = useId().replace(/:/g, '');
  const chromeGradId = `sl-chrome-${uid}`;
  const bevelGradId = `sl-bevel-${uid}`;

  return (
    <svg
      viewBox="0 0 92 78"
      fill="none"
      role="img"
      aria-label="SL TV"
      shapeRendering="geometricPrecision"
      className={className}
    >
      <defs>
        <linearGradient id={chromeGradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="28%" stopColor="#E6EDF4" />
          <stop offset="52%" stopColor="#94A3B8" />
          <stop offset="72%" stopColor="#F8FAFC" />
          <stop offset="100%" stopColor="#CBD5E1" />
        </linearGradient>
        <linearGradient id={bevelGradId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="48%" stopColor="#D8E2EC" />
          <stop offset="100%" stopColor="#8292A3" />
        </linearGradient>
      </defs>

      {/* Twin Antennas + Top Antenna Mount Bridge */}
      <path
        d="M39.5 18 30.5 4.5M52.5 18 61.5 4.5"
        stroke={`url(#${chromeGradId})`}
        strokeWidth="2.8"
        strokeLinecap="round"
      />
      <circle cx="30.5" cy="4.5" r="1.7" fill="#FFFFFF" />
      <circle cx="61.5" cy="4.5" r="1.7" fill="#FFFFFF" />
      <path
        d="M28 19.5c3-2.4 7-3 18-3s15 .6 18 3"
        stroke={`url(#${bevelGradId})`}
        strokeWidth="2.4"
        strokeLinecap="round"
      />

      {/* Crisp Curved-Screen Outer Metallic TV Chassis */}
      <rect
        x="8"
        y="19.5"
        width="76"
        height="43"
        rx="5"
        fill="#05080A"
        fillOpacity="0.88"
        stroke={`url(#${chromeGradId})`}
        strokeWidth="3.6"
      />

      {/* Top Bezel Indicator Dash + Status Dots */}
      <rect
        x="26.5"
        y="22.8"
        width="7.5"
        height="2.1"
        rx="1"
        fill={`url(#${chromeGradId})`}
      />
      <circle cx="39" cy="23.85" r="1.25" fill="#F8FAFC" />
      <circle cx="44" cy="23.85" r="1.25" fill="#F8FAFC" />
      <circle cx="49" cy="23.85" r="1.25" fill="#F8FAFC" />
      <circle cx="54" cy="23.85" r="1.25" fill="#F8FAFC" />
      <circle cx="59" cy="23.85" r="1.25" fill="#F8FAFC" />

      {/* Subtle Curved Inner Bezel Outline */}
      <path
        d="M14 28.5Q46 31.2 78 28.5V56.5Q46 53.8 14 56.5Z"
        stroke={`url(#${bevelGradId})`}
        strokeOpacity="0.72"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* High-Contrast Stylized Metallic "S" */}
      <path
        d="M41.5 34.4c-3.4-1.7-8.7-1.5-10.5 1.8-1.4 2.6 1 4.6 5.2 5.6 4.4 1.1 6.7 2.8 5.6 5.8-1.1 3-6 4.2-11.2 2.4"
        stroke={`url(#${chromeGradId})`}
        strokeWidth="4.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* High-Contrast Stylized Metallic "L" */}
      <path
        d="M50.5 32.5v18.8c3.6 0 7.7-.5 11-1.3"
        stroke={`url(#${chromeGradId})`}
        strokeWidth="4.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Sculpted Pedestal Stand */}
      <rect
        x="43.5"
        y="62.5"
        width="5"
        height="7"
        fill={`url(#${bevelGradId})`}
      />
      <path
        d="M27.5 73.8c5.5-3.2 12-4.6 18.5-4.6s13 1.4 18.5 4.6c-11.5-1.2-25.5-1.2-37 0Z"
        fill={`url(#${chromeGradId})`}
        stroke="#FFFFFF"
        strokeWidth="0.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}
