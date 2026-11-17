import { useEffect, useRef } from 'react';

interface CursorGlowProps {
  disabled?: boolean;
}

const GLOW_RADIUS_PX = 210;
const RING_RADIUS_PX = 18;
const DOT_RADIUS_PX = 4;

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

export function CursorGlow({ disabled = false }: CursorGlowProps) {
  const glowRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const ringVisualRef = useRef<HTMLSpanElement | null>(null);
  const dotRef = useRef<HTMLDivElement | null>(null);
  const dotVisualRef = useRef<HTMLSpanElement | null>(null);
  const disabledRef = useRef(disabled);
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
    let ringX = targetX;
    let ringY = targetY;
    let glowX = targetX;
    let glowY = targetY;

    let isVisible = false;
    let isNativeCursorMode = false;
    let isHoveringInteractive = false;
    let isPressed = false;
    let lastTargetEl: Element | null = null;
    let rafId = 0;

    const setHtmlCursorClass = (active: boolean) => {
      document.documentElement.classList.toggle('has-custom-cursor', active);
    };

    const applyVisualStates = () => {
      const showCursor =
        canUseCustomCursor && isVisible && !isNativeCursorMode && !document.hidden;

      dotEl.style.opacity = showCursor ? '1' : '0';
      ringEl.style.opacity = showCursor ? '1' : '0';

      const showGlow =
        canAnimateAmbientGlow &&
        !disabledRef.current &&
        isVisible &&
        !document.hidden;

      glowEl.style.opacity = showGlow
        ? isHoveringInteractive
          ? '0.32'
          : '0.82'
        : '0';

      if (prefersReducedMotion) {
        ringVisualEl.style.transition = 'none';
        dotVisualEl.style.transition = 'none';
      } else {
        ringVisualEl.style.transition =
          'transform 180ms cubic-bezier(0.16, 1, 0.3, 1), border-color 180ms ease, background-color 180ms ease, box-shadow 180ms ease';
        dotVisualEl.style.transition =
          'transform 140ms cubic-bezier(0.16, 1, 0.3, 1)';
      }

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
        ringVisualEl.style.borderColor = 'rgba(34, 211, 238, 0.82)';
        ringVisualEl.style.backgroundColor = 'rgba(37, 99, 235, 0.12)';
        ringVisualEl.style.boxShadow =
          '0 0 20px rgba(34, 211, 238, 0.32), inset 0 0 10px rgba(59, 130, 246, 0.16)';
      } else {
        ringVisualEl.style.borderColor = 'rgba(56, 189, 248, 0.54)';
        ringVisualEl.style.backgroundColor = 'rgba(37, 99, 235, 0.05)';
        ringVisualEl.style.boxShadow =
          '0 0 14px rgba(34, 211, 238, 0.18), inset 0 0 8px rgba(59, 130, 246, 0.1)';
      }
    };

    const tick = () => {
      rafId = 0;
      if (!canUseCustomCursor || !isVisible || document.hidden) {
        applyVisualStates();
        return;
      }

      const ringDx = targetX - ringX;
      const ringDy = targetY - ringY;
      ringX += ringDx * 0.28;
      ringY += ringDy * 0.28;
      ringEl.style.transform = `translate3d(${(ringX - RING_RADIUS_PX).toFixed(1)}px, ${(ringY - RING_RADIUS_PX).toFixed(1)}px, 0)`;

      let glowMoving = false;
      if (canAnimateAmbientGlow && !disabledRef.current) {
        const glowDx = targetX - glowX;
        const glowDy = targetY - glowY;
        glowX += glowDx * 0.18;
        glowY += glowDy * 0.18;
        glowEl.style.transform = `translate3d(${(glowX - GLOW_RADIUS_PX).toFixed(1)}px, ${(glowY - GLOW_RADIUS_PX).toFixed(1)}px, 0)`;
        glowMoving = Math.abs(glowDx) > 0.35 || Math.abs(glowDy) > 0.35;
      }

      const ringMoving = Math.abs(ringDx) > 0.25 || Math.abs(ringDy) > 0.25;
      if (ringMoving || glowMoving) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    const scheduleTick = () => {
      if (prefersReducedMotion) {
        ringX = targetX;
        ringY = targetY;
        ringEl.style.transform = `translate3d(${(ringX - RING_RADIUS_PX).toFixed(1)}px, ${(ringY - RING_RADIUS_PX).toFixed(1)}px, 0)`;
        return;
      }
      if (!rafId && canUseCustomCursor && isVisible && !document.hidden) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    const inspectTarget = (target: EventTarget | null) => {
      const el = target instanceof Element ? target : null;
      if (el === lastTargetEl) return;
      lastTargetEl = el;

      if (!el) {
        isNativeCursorMode = false;
        isHoveringInteractive = false;
        return;
      }

      const isTextTarget = Boolean(el.closest(NATIVE_TEXT_SELECTOR));
      if (isTextTarget) {
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

    const deactivateForTouch = () => {
      setHtmlCursorClass(false);
      isVisible = false;
      isPressed = false;
      isHoveringInteractive = false;
      isNativeCursorMode = false;
      lastTargetEl = null;
      if (rafId) {
        window.cancelAnimationFrame(rafId);
        rafId = 0;
      }
      applyVisualStates();
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || !canUseCustomCursor) {
        if (isVisible || document.documentElement.classList.contains('has-custom-cursor')) {
          deactivateForTouch();
        }
        return;
      }

      setHtmlCursorClass(true);

      targetX = e.clientX;
      targetY = e.clientY;

      // Keep core dot 1:1 responsive with zero lag
      dotEl.style.transform = `translate3d(${(targetX - DOT_RADIUS_PX).toFixed(1)}px, ${(targetY - DOT_RADIUS_PX).toFixed(1)}px, 0)`;

      if (!isVisible) {
        ringX = targetX;
        ringY = targetY;
        glowX = targetX;
        glowY = targetY;
        ringEl.style.transform = `translate3d(${(ringX - RING_RADIUS_PX).toFixed(1)}px, ${(ringY - RING_RADIUS_PX).toFixed(1)}px, 0)`;
        glowEl.style.transform = `translate3d(${(glowX - GLOW_RADIUS_PX).toFixed(1)}px, ${(glowY - GLOW_RADIUS_PX).toFixed(1)}px, 0)`;
        isVisible = true;
      }

      inspectTarget(e.target);
      applyVisualStates();
      scheduleTick();
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') {
        deactivateForTouch();
        return;
      }
      if (!canUseCustomCursor || isNativeCursorMode) return;
      isPressed = true;
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
      lastTargetEl = null;
      if (rafId) {
        window.cancelAnimationFrame(rafId);
        rafId = 0;
      }
      applyVisualStates();
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
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setHtmlCursorClass(false);
        if (rafId) {
          window.cancelAnimationFrame(rafId);
          rafId = 0;
        }
      }
      applyVisualStates();
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('pointerup', handlePointerUp, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('blur', handleMouseLeave);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    hoverQuery.addEventListener('change', handleCapabilityChange);
    motionQuery.addEventListener('change', handleCapabilityChange);

    return () => {
      setHtmlCursorClass(false);
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('blur', handleMouseLeave);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      hoverQuery.removeEventListener('change', handleCapabilityChange);
      motionQuery.removeEventListener('change', handleCapabilityChange);
    };
  }, []);

  useEffect(() => {
    const glowEl = glowRef.current;
    if (!glowEl) return;
    if (disabled) {
      glowEl.style.opacity = '0';
    }
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
          willChange: 'transform, opacity',
          background:
            'radial-gradient(circle, rgba(34, 211, 238, 0.11) 0%, rgba(59, 130, 246, 0.08) 34%, rgba(139, 92, 246, 0.04) 58%, transparent 74%)',
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
          willChange: 'transform, opacity',
        }}
      >
        <span
          ref={ringVisualRef}
          className="block h-full w-full rounded-full border-[1.5px] border-sky-400/55 bg-blue-600/5"
        />
      </div>

      {/* Zero-lag 1:1 glowing blue/cyan precision cursor dot */}
      <div
        ref={dotRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[70] opacity-0 transition-opacity duration-100 select-none"
        style={{
          width: `${DOT_RADIUS_PX * 2}px`,
          height: `${DOT_RADIUS_PX * 2}px`,
          willChange: 'transform, opacity',
        }}
      >
        <span
          ref={dotVisualRef}
          className="block h-full w-full rounded-full bg-gradient-to-br from-cyan-300 via-sky-400 to-blue-500 shadow-[0_0_10px_rgba(34,211,238,0.85),0_0_20px_rgba(59,130,246,0.5)]"
        />
      </div>
    </>
  );
}
