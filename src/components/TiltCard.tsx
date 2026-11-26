import { PointerEvent, ReactNode, useEffect, useRef } from 'react';

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  maxTiltDeg?: number;
  glowColor?: 'pink' | 'lime' | 'teal';
  scaleOnHover?: number;
}

const GLOW_STYLES: Record<NonNullable<TiltCardProps['glowColor']>, string> = {
  pink: 'radial-gradient(360px circle at var(--tilt-mx, 50%) var(--tilt-my, 50%), rgba(240, 91, 234, 0.17), rgba(200, 255, 39, 0.05) 48%, transparent 76%)',
  lime: 'radial-gradient(360px circle at var(--tilt-mx, 50%) var(--tilt-my, 50%), rgba(200, 255, 39, 0.14), rgba(240, 91, 234, 0.08) 46%, transparent 76%)',
  teal: 'radial-gradient(360px circle at var(--tilt-mx, 50%) var(--tilt-my, 50%), rgba(240, 91, 234, 0.13), rgba(255, 255, 255, 0.05) 48%, transparent 76%)',
};

const TOUCH_INDENT_STYLES: Record<NonNullable<TiltCardProps['glowColor']>, string> = {
  pink: [
    'radial-gradient(54px circle at var(--touch-mx, 50%) var(--touch-my, 50%), rgba(2, 10, 10, 0.3) 0%, rgba(2, 10, 10, 0.12) 56%, transparent 100%)',
    'radial-gradient(112px circle at var(--touch-mx, 50%) var(--touch-my, 50%), transparent 30%, rgba(255, 255, 255, 0.16) 52%, rgba(240, 91, 234, 0.18) 68%, transparent 86%)',
    'radial-gradient(300px circle at var(--touch-mx, 50%) var(--touch-my, 50%), rgba(240, 91, 234, 0.2), rgba(200, 255, 39, 0.06) 48%, transparent 76%)',
  ].join(', '),
  lime: [
    'radial-gradient(54px circle at var(--touch-mx, 50%) var(--touch-my, 50%), rgba(2, 10, 10, 0.3) 0%, rgba(2, 10, 10, 0.12) 56%, transparent 100%)',
    'radial-gradient(112px circle at var(--touch-mx, 50%) var(--touch-my, 50%), transparent 30%, rgba(255, 255, 255, 0.16) 52%, rgba(200, 255, 39, 0.18) 68%, transparent 86%)',
    'radial-gradient(300px circle at var(--touch-mx, 50%) var(--touch-my, 50%), rgba(200, 255, 39, 0.18), rgba(240, 91, 234, 0.08) 46%, transparent 76%)',
  ].join(', '),
  teal: [
    'radial-gradient(54px circle at var(--touch-mx, 50%) var(--touch-my, 50%), rgba(2, 10, 10, 0.3) 0%, rgba(2, 10, 10, 0.12) 56%, transparent 100%)',
    'radial-gradient(112px circle at var(--touch-mx, 50%) var(--touch-my, 50%), transparent 30%, rgba(255, 255, 255, 0.16) 52%, rgba(94, 234, 212, 0.16) 68%, transparent 86%)',
    'radial-gradient(300px circle at var(--touch-mx, 50%) var(--touch-my, 50%), rgba(240, 91, 234, 0.15), rgba(255, 255, 255, 0.06) 48%, transparent 76%)',
  ].join(', '),
};

const HOVER_TRANSITION =
  'transform 110ms cubic-bezier(0.16, 1, 0.3, 1), border-color 220ms ease, box-shadow 240ms ease, background 220ms ease';
const RESET_TRANSITION =
  'transform 340ms cubic-bezier(0.16, 1, 0.3, 1), border-color 220ms ease, box-shadow 240ms ease, background 220ms ease';

const TOUCH_PRESS_TRANSITION =
  'transform 95ms cubic-bezier(0.22, 1, 0.36, 1), border-color 180ms ease, box-shadow 180ms ease, background 180ms ease';
const TOUCH_RELEASE_TRANSITION =
  'transform 320ms cubic-bezier(0.16, 1, 0.3, 1), border-color 220ms ease, box-shadow 240ms ease, background 220ms ease';

export function TiltCard({
  children,
  className = '',
  maxTiltDeg = 4,
  glowColor = 'pink',
  scaleOnHover = 1.01,
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const glowRef = useRef<HTMLDivElement | null>(null);
  const touchIndentRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef(0);
  const resetTimerRef = useRef(0);
  const enabledRef = useRef(false);
  const lastCoordsRef = useRef({ clientX: 0, clientY: 0 });

  // Touch-only interaction refs (never alter desktop mouse behavior)
  const touchRafRef = useRef(0);
  const touchResetTimerRef = useRef(0);
  const touchMotionAllowedRef = useRef(true);
  const touchPressedRef = useRef(false);
  const activeTouchIdRef = useRef<number | null>(null);
  const touchCoordsRef = useRef({ clientX: 0, clientY: 0 });
  const touchWindowCleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const nav = navigator as Navigator & { deviceMemory?: number };
    const lowSpec = (nav.hardwareConcurrency ?? 4) <= 2 || (nav.deviceMemory ?? 4) <= 2;

    enabledRef.current = canHover && !reducedMotion && !lowSpec;
    touchMotionAllowedRef.current = !reducedMotion;

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const hoverQuery = window.matchMedia('(hover: hover) and (pointer: fine)');

    const syncCapability = () => {
      enabledRef.current = hoverQuery.matches && !motionQuery.matches && !lowSpec;
      touchMotionAllowedRef.current = !motionQuery.matches;
      if (!enabledRef.current && cardRef.current && !touchPressedRef.current) {
        cardRef.current.style.transform = '';
        cardRef.current.style.transition = '';
        cardRef.current.style.willChange = '';
        if (glowRef.current) {
          glowRef.current.style.opacity = '0';
        }
      }
    };

    motionQuery.addEventListener('change', syncCapability);
    hoverQuery.addEventListener('change', syncCapability);

    return () => {
      motionQuery.removeEventListener('change', syncCapability);
      hoverQuery.removeEventListener('change', syncCapability);
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
      }
      if (resetTimerRef.current) {
        window.clearTimeout(resetTimerRef.current);
      }
      if (touchRafRef.current) {
        window.cancelAnimationFrame(touchRafRef.current);
      }
      if (touchResetTimerRef.current) {
        window.clearTimeout(touchResetTimerRef.current);
      }
      touchWindowCleanupRef.current?.();
    };
  }, []);

  const applyTilt = () => {
    rafRef.current = 0;
    const el = cardRef.current;
    if (!el || !enabledRef.current) return;

    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const { clientX, clientY } = lastCoordsRef.current;
    const px = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const py = Math.min(1, Math.max(0, (clientY - rect.top) / rect.height));

    const rotateY = (px - 0.5) * 2 * maxTiltDeg;
    const rotateX = (0.5 - py) * 2 * maxTiltDeg;

    el.style.willChange = 'transform';
    el.style.transition = HOVER_TRANSITION;
    el.style.transform = `perspective(960px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(${scaleOnHover}, ${scaleOnHover}, 1)`;

    if (glowRef.current) {
      glowRef.current.style.setProperty('--tilt-mx', `${(px * 100).toFixed(1)}%`);
      glowRef.current.style.setProperty('--tilt-my', `${(py * 100).toFixed(1)}%`);
      glowRef.current.style.opacity = '1';
    }
  };

  const applyTouchIndent = () => {
    touchRafRef.current = 0;
    const el = cardRef.current;
    if (!el || !touchPressedRef.current) return;

    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const { clientX, clientY } = touchCoordsRef.current;
    const px = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const py = Math.min(1, Math.max(0, (clientY - rect.top) / rect.height));

    el.setAttribute('data-glass-touch-active', 'true');

    if (touchMotionAllowedRef.current) {
      const pressTiltDeg = Math.min(Math.max(maxTiltDeg, 2.2), 4.2);
      const rotateY = (px - 0.5) * 2 * pressTiltDeg;
      const rotateX = (0.5 - py) * 2 * pressTiltDeg;

      el.style.willChange = 'transform';
      el.style.transition = TOUCH_PRESS_TRANSITION;
      el.style.transform = `perspective(960px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(0.985, 0.985, 1)`;
    }

    if (touchIndentRef.current) {
      touchIndentRef.current.style.setProperty('--touch-mx', `${(px * 100).toFixed(1)}%`);
      touchIndentRef.current.style.setProperty('--touch-my', `${(py * 100).toFixed(1)}%`);
      touchIndentRef.current.style.opacity = '1';
    }
  };

  const resetTouchIndent = () => {
    if (touchRafRef.current) {
      window.cancelAnimationFrame(touchRafRef.current);
      touchRafRef.current = 0;
    }
    if (touchResetTimerRef.current) {
      window.clearTimeout(touchResetTimerRef.current);
      touchResetTimerRef.current = 0;
    }

    touchWindowCleanupRef.current?.();
    touchWindowCleanupRef.current = null;

    const wasPressed = touchPressedRef.current;
    touchPressedRef.current = false;
    activeTouchIdRef.current = null;

    const el = cardRef.current;
    if (el) {
      el.removeAttribute('data-glass-touch-active');
      if (wasPressed && touchMotionAllowedRef.current) {
        el.style.transition = TOUCH_RELEASE_TRANSITION;
        el.style.transform = 'perspective(960px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        touchResetTimerRef.current = window.setTimeout(() => {
          touchResetTimerRef.current = 0;
          if (cardRef.current && !touchPressedRef.current) {
            cardRef.current.style.transform = '';
            cardRef.current.style.transition = '';
            cardRef.current.style.willChange = '';
          }
        }, 340);
      }
    }

    if (touchIndentRef.current) {
      touchIndentRef.current.style.opacity = '0';
    }
  };

  const handleTouchDown = (e: PointerEvent<HTMLDivElement>) => {
    if (touchResetTimerRef.current) {
      window.clearTimeout(touchResetTimerRef.current);
      touchResetTimerRef.current = 0;
    }

    touchPressedRef.current = true;
    activeTouchIdRef.current = e.pointerId;
    touchCoordsRef.current = { clientX: e.clientX, clientY: e.clientY };

    if (!touchWindowCleanupRef.current) {
      const handleWindowScroll = () => {
        resetTouchIndent();
      };
      const handleWindowRelease = (ev: globalThis.PointerEvent) => {
        if (activeTouchIdRef.current === null || ev.pointerId === activeTouchIdRef.current) {
          resetTouchIndent();
        }
      };
      const handleWindowBlur = () => {
        resetTouchIndent();
      };

      window.addEventListener('scroll', handleWindowScroll, { capture: true, passive: true });
      window.addEventListener('pointerup', handleWindowRelease, { passive: true });
      window.addEventListener('pointercancel', handleWindowRelease, { passive: true });
      window.addEventListener('blur', handleWindowBlur);

      touchWindowCleanupRef.current = () => {
        window.removeEventListener('scroll', handleWindowScroll, { capture: true });
        window.removeEventListener('pointerup', handleWindowRelease);
        window.removeEventListener('pointercancel', handleWindowRelease);
        window.removeEventListener('blur', handleWindowBlur);
      };
    }

    if (touchRafRef.current) {
      window.cancelAnimationFrame(touchRafRef.current);
      touchRafRef.current = 0;
    }
    applyTouchIndent();
  };

  const handleTouchMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!touchPressedRef.current) return;
    if (activeTouchIdRef.current !== null && e.pointerId !== activeTouchIdRef.current) return;
    touchCoordsRef.current = { clientX: e.clientX, clientY: e.clientY };
    if (!touchRafRef.current) {
      touchRafRef.current = window.requestAnimationFrame(applyTouchIndent);
    }
  };

  const handlePointerEnter = (e: PointerEvent<HTMLDivElement>) => {
    if (!enabledRef.current || e.pointerType !== 'mouse') return;
    if (resetTimerRef.current) {
      window.clearTimeout(resetTimerRef.current);
      resetTimerRef.current = 0;
    }
    lastCoordsRef.current = { clientX: e.clientX, clientY: e.clientY };
    if (!rafRef.current) {
      rafRef.current = window.requestAnimationFrame(applyTilt);
    }
  };

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse') return;
    handleTouchDown(e);
  };

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse') {
      handleTouchMove(e);
      return;
    }
    if (!enabledRef.current) return;
    lastCoordsRef.current = { clientX: e.clientX, clientY: e.clientY };
    if (!rafRef.current) {
      rafRef.current = window.requestAnimationFrame(applyTilt);
    }
  };

  const handlePointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse') return;
    resetTouchIndent();
  };

  const handlePointerLeave = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse') {
      resetTouchIndent();
      return;
    }
    resetTilt();
  };

  const handlePointerCancel = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse') {
      resetTouchIndent();
      return;
    }
    resetTilt();
  };

  const resetTilt = () => {
    if (rafRef.current) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    if (resetTimerRef.current) {
      window.clearTimeout(resetTimerRef.current);
      resetTimerRef.current = 0;
    }
    const el = cardRef.current;
    if (el) {
      el.style.transition = RESET_TRANSITION;
      el.style.transform = 'perspective(960px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      resetTimerRef.current = window.setTimeout(() => {
        resetTimerRef.current = 0;
        if (cardRef.current) {
          cardRef.current.style.transform = '';
          cardRef.current.style.transition = '';
          cardRef.current.style.willChange = '';
        }
      }, 360);
    }
    if (glowRef.current) {
      glowRef.current.style.opacity = '0';
    }
  };

  return (
    <div
      ref={cardRef}
      data-tilt-card="true"
      data-cursor-dim="true"
      onPointerEnter={handlePointerEnter}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      onPointerCancel={handlePointerCancel}
      className={`relative overflow-hidden ${className}`.trim()}
    >
      {children}
      {/* Desktop cursor-following glow (unchanged) */}
      <div
        ref={glowRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] opacity-0 transition-opacity duration-300"
        style={{
          background: GLOW_STYLES[glowColor],
        }}
      />
      {/* Mobile/touch fingertip indentation dimple, refractive ring & dispersion glow */}
      <div
        ref={touchIndentRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] opacity-0 transition-opacity duration-200"
        style={{
          background: TOUCH_INDENT_STYLES[glowColor],
        }}
      />
    </div>
  );
}

