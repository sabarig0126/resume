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

const HOVER_TRANSITION =
  'transform 110ms cubic-bezier(0.16, 1, 0.3, 1), border-color 220ms ease, box-shadow 240ms ease, background 220ms ease';
const RESET_TRANSITION =
  'transform 340ms cubic-bezier(0.16, 1, 0.3, 1), border-color 220ms ease, box-shadow 240ms ease, background 220ms ease';

export function TiltCard({
  children,
  className = '',
  maxTiltDeg = 4,
  glowColor = 'pink',
  scaleOnHover = 1.01,
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const glowRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef(0);
  const resetTimerRef = useRef(0);
  const enabledRef = useRef(false);
  const lastCoordsRef = useRef({ clientX: 0, clientY: 0 });

  useEffect(() => {
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const nav = navigator as Navigator & { deviceMemory?: number };
    const lowSpec = (nav.hardwareConcurrency ?? 4) <= 2 || (nav.deviceMemory ?? 4) <= 2;

    enabledRef.current = canHover && !reducedMotion && !lowSpec;

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const hoverQuery = window.matchMedia('(hover: hover) and (pointer: fine)');

    const syncCapability = () => {
      enabledRef.current = hoverQuery.matches && !motionQuery.matches && !lowSpec;
      if (!enabledRef.current && cardRef.current) {
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

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!enabledRef.current || e.pointerType !== 'mouse') return;
    lastCoordsRef.current = { clientX: e.clientX, clientY: e.clientY };
    if (!rafRef.current) {
      rafRef.current = window.requestAnimationFrame(applyTilt);
    }
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
      data-cursor-dim="true"
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetTilt}
      onPointerCancel={resetTilt}
      className={`relative overflow-hidden ${className}`.trim()}
    >
      {children}
      <div
        ref={glowRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] opacity-0 transition-opacity duration-300"
        style={{
          background: GLOW_STYLES[glowColor],
        }}
      />
    </div>
  );
}
