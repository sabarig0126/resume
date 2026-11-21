import { useEffect, useRef } from 'react';

interface CursorGlowProps {
  disabled?: boolean;
}

const GLOW_RADIUS_PX = 210;
const RING_RADIUS_PX = 18;
const DOT_RADIUS_PX = 4;

// Frame-rate-independent exponential smoothing speeds (1/s)
const DOT_FOLLOW_SPEED = 60;
const RING_FOLLOW_SPEED = 20;
const GLOW_FOLLOW_SPEED = 11;

const INTERACTIVE_SELECTOR =
  'button:not(:disabled), a[href], [role="button"]:not([aria-disabled="true"]), label[for], [data-cursor-dim="true"], .glass-interactive, .cursor-pointer';

const NATIVE_TEXT_SELECTOR =
  'input:not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="checkbox"]):not([type="radio"]):not([type="range"]), textarea, [contenteditable="true"], .select-all, .select-text, [data-cursor="text"]';

const SPECIAL_NATIVE_CURSORS = new Set([
  'text',
  'vertical-text',
  'grab',
  'grabbing',
  'col-resize',
  'row-resize',
  'ew-resize',
  'ns-resize',
  'nesw-resize',
  'nwse-resize',
  'all-scroll',
  'move',
  'crosshair',
  'not-allowed',
  'wait',
  'progress',
  'zoom-in',
  'zoom-out',
]);

function formatTranslate(x: number, y: number, offset: number): string {
  return `translate3d(${(x - offset).toFixed(2)}px, ${(y - offset).toFixed(2)}px, 0)`;
}

export function CursorGlow({ disabled = false }: CursorGlowProps) {
  const glowRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const ringVisualRef = useRef<HTMLSpanElement | null>(null);
  const dotRef = useRef<HTMLDivElement | null>(null);
  const dotVisualRef = useRef<HTMLSpanElement | null>(null);
  const disabledRef = useRef(disabled);
  const syncVisualRef = useRef<(() => void) | null>(null);
  disabledRef.current = disabled;

  useEffect(() => {
    const glowEl = glowRef.current;
    const ringEl = ringRef.current;
    const ringVisualEl = ringVisualRef.current;
    const dotEl = dotRef.current;
    const dotVisualEl = dotVisualRef.current;
    if (!glowEl || !ringEl || !ringVisualEl || !dotEl || !dotVisualEl) return;

    const hoverQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const nav = navigator as Navigator & { deviceMemory?: number };
    const lowSpecDevice =
      (nav.hardwareConcurrency ?? 4) <= 2 || (nav.deviceMemory ?? 4) <= 2;

    let canUseCustomCursor = hoverQuery.matches;
    let prefersReducedMotion = motionQuery.matches;
    let canAnimateAmbientGlow =
      canUseCustomCursor && !prefersReducedMotion && !lowSpecDevice;

    let targetX = window.innerWidth * 0.5;
    let targetY = window.innerHeight * 0.5;
    let dotX = targetX;
    let dotY = targetY;
    let ringX = targetX;
    let ringY = targetY;
    let glowX = targetX;
    let glowY = targetY;

    let isVisible = false;
    let isNativeCursorMode = false;
    let isHoveringInteractive = false;
    let isPressed = false;
    let hasCustomCursorClass = false;
    let pendingTarget: EventTarget | null = null;
    let lastInspectedEl: Element | null = null;
    let needsScrollInspect = false;

    let rafId = 0;
    let lastFrameTime = 0;

    // Cached visual state to avoid redundant DOM writes
    let prevShowCursor: boolean | null = null;
    let prevShowGlowOpacity: string | null = null;
    let prevReducedMotion: boolean | null = null;
    let prevInteractionState: string | null = null;

    const setHtmlCursorClass = (active: boolean) => {
      if (hasCustomCursorClass === active) return;
      hasCustomCursorClass = active;
      document.documentElement.classList.toggle('has-custom-cursor', active);
    };

    const applyVisualStates = () => {
      const showCursor =
        canUseCustomCursor && isVisible && !isNativeCursorMode && !document.hidden;

      if (prevShowCursor !== showCursor) {
        prevShowCursor = showCursor;
        const opacityStr = showCursor ? '1' : '0';
        dotEl.style.opacity = opacityStr;
        ringEl.style.opacity = opacityStr;
      }

      const showGlow =
        canAnimateAmbientGlow &&
        !disabledRef.current &&
        isVisible &&
        !document.hidden;

      const nextGlowOpacity = showGlow
        ? isHoveringInteractive
          ? '0.32'
          : '0.82'
        : '0';

      if (prevShowGlowOpacity !== nextGlowOpacity) {
        prevShowGlowOpacity = nextGlowOpacity;
        glowEl.style.opacity = nextGlowOpacity;
      }

      if (prevReducedMotion !== prefersReducedMotion) {
        prevReducedMotion = prefersReducedMotion;
        if (prefersReducedMotion) {
          ringVisualEl.style.transition = 'none';
          dotVisualEl.style.transition = 'none';
        } else {
          ringVisualEl.style.transition =
            'transform 180ms cubic-bezier(0.16, 1, 0.3, 1), border-color 180ms ease, background-color 180ms ease, box-shadow 180ms ease';
          dotVisualEl.style.transition =
            'transform 140ms cubic-bezier(0.16, 1, 0.3, 1)';
        }
      }

      const interactionKey = `${isPressed ? 1 : 0}:${isHoveringInteractive ? 1 : 0}`;
      if (prevInteractionState !== interactionKey) {
        prevInteractionState = interactionKey;

        if (isPressed) {
          ringVisualEl.style.transform = 'scale(0.84)';
          dotVisualEl.style.transform = 'scale(1.22)';
        } else if (isHoveringInteractive) {
          ringVisualEl.style.transform = 'scale(1.42)';
          dotVisualEl.style.transform = 'scale(0.82)';
        } else {
          ringVisualEl.style.transform = 'scale(1)';
          dotVisualEl.style.transform = 'scale(1)';
        }

        if (isHoveringInteractive) {
          ringVisualEl.style.borderColor = 'rgba(200, 255, 39, 0.85)';
          ringVisualEl.style.backgroundColor = 'rgba(200, 255, 39, 0.08)';
          ringVisualEl.style.boxShadow =
            '0 0 20px rgba(200, 255, 39, 0.34), inset 0 0 10px rgba(240, 91, 234, 0.16)';
        } else {
          ringVisualEl.style.borderColor = 'rgba(240, 91, 234, 0.56)';
          ringVisualEl.style.backgroundColor = 'rgba(240, 91, 234, 0.05)';
          ringVisualEl.style.boxShadow =
            '0 0 14px rgba(240, 91, 234, 0.22), inset 0 0 8px rgba(200, 255, 39, 0.08)';
        }
      }
    };

    syncVisualRef.current = () => {
      if (!disabledRef.current && isVisible && canAnimateAmbientGlow) {
        glowX = targetX;
        glowY = targetY;
        glowEl.style.transform = formatTranslate(glowX, glowY, GLOW_RADIUS_PX);
      }
      applyVisualStates();
    };

    const inspectElement = (el: Element | null) => {
      if (el === lastInspectedEl) return;
      lastInspectedEl = el;

      if (!el) {
        isNativeCursorMode = false;
        isHoveringInteractive = false;
        return;
      }

      if (el.closest(NATIVE_TEXT_SELECTOR)) {
        isNativeCursorMode = true;
        isHoveringInteractive = false;
        return;
      }

      if (el.closest('button:disabled, [aria-disabled="true"]')) {
        isNativeCursorMode = true;
        isHoveringInteractive = false;
        return;
      }

      const inlineCursor =
        el instanceof HTMLElement ? el.style.cursor : '';
      if (inlineCursor && SPECIAL_NATIVE_CURSORS.has(inlineCursor)) {
        isNativeCursorMode = true;
        isHoveringInteractive = false;
        return;
      }

      const computedCursor = window.getComputedStyle(el).cursor;
      if (SPECIAL_NATIVE_CURSORS.has(computedCursor)) {
        isNativeCursorMode = true;
        isHoveringInteractive = false;
        return;
      }

      isNativeCursorMode = false;
      isHoveringInteractive = Boolean(el.closest(INTERACTIVE_SELECTOR));
    };

    const snapAllToTarget = () => {
      dotX = targetX;
      dotY = targetY;
      ringX = targetX;
      ringY = targetY;
      glowX = targetX;
      glowY = targetY;

      dotEl.style.transform = formatTranslate(dotX, dotY, DOT_RADIUS_PX);
      ringEl.style.transform = formatTranslate(ringX, ringY, RING_RADIUS_PX);
      glowEl.style.transform = formatTranslate(glowX, glowY, GLOW_RADIUS_PX);
    };

    const stopLoop = () => {
      if (rafId) {
        window.cancelAnimationFrame(rafId);
        rafId = 0;
      }
      lastFrameTime = 0;
    };

    const tick = (now: number) => {
      rafId = 0;

      if (!canUseCustomCursor || !isVisible || document.hidden) {
        lastFrameTime = 0;
        applyVisualStates();
        return;
      }

      if (needsScrollInspect) {
        needsScrollInspect = false;
        pendingTarget = document.elementFromPoint(targetX, targetY);
      }

      if (pendingTarget !== undefined) {
        const el = pendingTarget instanceof Element ? pendingTarget : null;
        inspectElement(el);
      }

      applyVisualStates();

      if (prefersReducedMotion) {
        snapAllToTarget();
        lastFrameTime = 0;
        return;
      }

      const rawDt = lastFrameTime ? (now - lastFrameTime) / 1000 : 1 / 60;
      const dt = Math.min(Math.max(rawDt, 0.001), 0.05);
      lastFrameTime = now;

      // Smooth frame-rate-independent interpolation for dot, ring, and glow
      const dotFactor = 1 - Math.exp(-DOT_FOLLOW_SPEED * dt);
      const ringFactor = 1 - Math.exp(-RING_FOLLOW_SPEED * dt);

      const dotDx = targetX - dotX;
      const dotDy = targetY - dotY;
      const dotSettled = Math.abs(dotDx) <= 0.04 && Math.abs(dotDy) <= 0.04;
      if (dotSettled) {
        dotX = targetX;
        dotY = targetY;
      } else {
        dotX += dotDx * dotFactor;
        dotY += dotDy * dotFactor;
      }
      dotEl.style.transform = formatTranslate(dotX, dotY, DOT_RADIUS_PX);

      const ringDx = targetX - ringX;
      const ringDy = targetY - ringY;
      const ringSettled = Math.abs(ringDx) <= 0.06 && Math.abs(ringDy) <= 0.06;
      if (ringSettled) {
        ringX = targetX;
        ringY = targetY;
      } else {
        ringX += ringDx * ringFactor;
        ringY += ringDy * ringFactor;
      }
      ringEl.style.transform = formatTranslate(ringX, ringY, RING_RADIUS_PX);

      let glowSettled = true;
      if (canAnimateAmbientGlow) {
        if (disabledRef.current) {
          glowX = targetX;
          glowY = targetY;
        } else {
          const glowFactor = 1 - Math.exp(-GLOW_FOLLOW_SPEED * dt);
          const glowDx = targetX - glowX;
          const glowDy = targetY - glowY;
          glowSettled = Math.abs(glowDx) <= 0.1 && Math.abs(glowDy) <= 0.1;
          if (glowSettled) {
            glowX = targetX;
            glowY = targetY;
          } else {
            glowX += glowDx * glowFactor;
            glowY += glowDy * glowFactor;
          }
          glowEl.style.transform = formatTranslate(glowX, glowY, GLOW_RADIUS_PX);
        }
      }

      if (!dotSettled || !ringSettled || !glowSettled) {
        rafId = window.requestAnimationFrame(tick);
      } else {
        lastFrameTime = 0;
      }
    };

    const scheduleTick = () => {
      if (!canUseCustomCursor || !isVisible || document.hidden) return;
      if (!rafId) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    const deactivateForTouch = () => {
      setHtmlCursorClass(false);
      isVisible = false;
      isPressed = false;
      isHoveringInteractive = false;
      isNativeCursorMode = false;
      lastInspectedEl = null;
      pendingTarget = null;
      stopLoop();
      applyVisualStates();
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || !canUseCustomCursor) {
        if (isVisible || hasCustomCursorClass) {
          deactivateForTouch();
        }
        return;
      }

      setHtmlCursorClass(true);

      targetX = e.clientX;
      targetY = e.clientY;
      pendingTarget = e.target;

      if (!isVisible) {
        isVisible = true;
        snapAllToTarget();
      }

      scheduleTick();
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') {
        deactivateForTouch();
        return;
      }
      if (!canUseCustomCursor) return;

      targetX = e.clientX;
      targetY = e.clientY;
      pendingTarget = e.target;
      if (!isVisible) {
        isVisible = true;
        snapAllToTarget();
      }
      inspectElement(e.target instanceof Element ? e.target : null);

      if (!isNativeCursorMode) {
        isPressed = true;
      }
      applyVisualStates();
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      if (isPressed) {
        isPressed = false;
        applyVisualStates();
      }
    };

    const handleMouseLeave = () => {
      setHtmlCursorClass(false);
      isVisible = false;
      isPressed = false;
      lastInspectedEl = null;
      pendingTarget = null;
      stopLoop();
      applyVisualStates();
    };

    const handlePointerOut = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' && e.relatedTarget === null) {
        handleMouseLeave();
      }
    };

    const handleScroll = () => {
      if (!canUseCustomCursor || !isVisible || document.hidden) return;
      needsScrollInspect = true;
      scheduleTick();
    };

    const handleResize = () => {
      if (!isVisible) return;
      targetX = Math.min(Math.max(targetX, 0), window.innerWidth);
      targetY = Math.min(Math.max(targetY, 0), window.innerHeight);
      scheduleTick();
    };

    const handleCapabilityChange = () => {
      canUseCustomCursor = hoverQuery.matches;
      prefersReducedMotion = motionQuery.matches;
      canAnimateAmbientGlow =
        canUseCustomCursor && !prefersReducedMotion && !lowSpecDevice;

      if (!canUseCustomCursor) {
        deactivateForTouch();
      } else {
        applyVisualStates();
        if (isVisible) scheduleTick();
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setHtmlCursorClass(false);
        stopLoop();
      }
      applyVisualStates();
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('pointerup', handlePointerUp, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('blur', handleMouseLeave);
    document.addEventListener('pointerout', handlePointerOut, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    hoverQuery.addEventListener('change', handleCapabilityChange);
    motionQuery.addEventListener('change', handleCapabilityChange);

    return () => {
      syncVisualRef.current = null;
      setHtmlCursorClass(false);
      stopLoop();
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('blur', handleMouseLeave);
      document.removeEventListener('pointerout', handlePointerOut);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      hoverQuery.removeEventListener('change', handleCapabilityChange);
      motionQuery.removeEventListener('change', handleCapabilityChange);
    };
  }, []);

  useEffect(() => {
    syncVisualRef.current?.();
  }, [disabled]);

  return (
    <>
      {/* Subtle ambient background glow behind foreground UI */}
      <div
        ref={glowRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-20 opacity-0 transition-opacity duration-300 select-none"
        style={{
          width: `${GLOW_RADIUS_PX * 2}px`,
          height: `${GLOW_RADIUS_PX * 2}px`,
          transform: 'translate3d(-999px, -999px, 0)',
          willChange: 'transform, opacity',
          backfaceVisibility: 'hidden',
          background:
            'radial-gradient(circle, rgba(240, 91, 234, 0.11) 0%, rgba(20, 88, 88, 0.12) 38%, rgba(200, 255, 39, 0.03) 58%, transparent 74%)',
        }}
      />

      {/* Smooth trailing transparent outer ring */}
      <div
        ref={ringRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[70] opacity-0 transition-opacity duration-150 select-none"
        style={{
          width: `${RING_RADIUS_PX * 2}px`,
          height: `${RING_RADIUS_PX * 2}px`,
          transform: 'translate3d(-999px, -999px, 0)',
          willChange: 'transform, opacity',
          backfaceVisibility: 'hidden',
        }}
      >
        <span
          ref={ringVisualRef}
          className="block h-full w-full rounded-full border-[1.5px] border-[#F05BEA]/55 bg-[#F05BEA]/5"
        />
      </div>

      {/* Smooth precision glowing Neon Lime / Electric Pink cursor dot */}
      <div
        ref={dotRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[70] opacity-0 transition-opacity duration-100 select-none"
        style={{
          width: `${DOT_RADIUS_PX * 2}px`,
          height: `${DOT_RADIUS_PX * 2}px`,
          transform: 'translate3d(-999px, -999px, 0)',
          willChange: 'transform, opacity',
          backfaceVisibility: 'hidden',
        }}
      >
        <span
          ref={dotVisualRef}
          className="block h-full w-full rounded-full bg-gradient-to-br from-[#C8FF27] via-[#F05BEA] to-[#F05BEA] shadow-[0_0_10px_rgba(200,255,39,0.85),0_0_20px_rgba(240,91,234,0.5)]"
        />
      </div>
    </>
  );
}
