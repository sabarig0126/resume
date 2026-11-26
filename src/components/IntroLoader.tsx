import { type RefObject, useCallback, useEffect, useRef, useState } from 'react';
import { usePortfolioInit } from '../lib/usePortfolioInit';
import {
  type PortalCanvasHandle,
  PortalHyperspaceCanvas,
} from './PortalHyperspaceCanvas';

interface IntroLoaderProps {
  isVisible: boolean;
  targetShellRef?: RefObject<HTMLDivElement | null>;
  onComplete: () => void;
}

interface ParticleConfig {
  id: number;
  color: 'teal' | 'pink' | 'lime';
  desktopOnly?: boolean;
}

interface FloatingCharConfig {
  id: string;
  char: string;
  tone: 'cyan' | 'pink' | 'blue' | 'purple' | 'sky' | 'magenta';
  slotClass: string;
}

const SEGMENT_COUNT = 25;
const SEGMENTS = Array.from({ length: SEGMENT_COUNT }, (_, index) => index);
const ENTRANCE_DURATION_MS = 500; // 2.3s -> 2.8s
const REDUCED_ENTRANCE_DURATION_MS = 500; // 2.3s -> 2.8s

const FLOATING_CHARACTERS: readonly FloatingCharConfig[] = [
  { id: 'en-l', char: 'l', tone: 'cyan', slotClass: 'portal-float-char--1' },
  { id: 'ta-sa', char: 'ச', tone: 'pink', slotClass: 'portal-float-char--2' },
  { id: 'ta-ko', char: 'கோ', tone: 'blue', slotClass: 'portal-float-char--3' },
  { id: 'ta-va', char: 'வா', tone: 'purple', slotClass: 'portal-float-char--4' },
  { id: 'en-g', char: 'g', tone: 'sky', slotClass: 'portal-float-char--5' },
  { id: 'ta-la', char: 'ல', tone: 'magenta', slotClass: 'portal-float-char--6' },
];

const PARTICLES: ParticleConfig[] = [
  { id: 1, color: 'teal' },
  { id: 2, color: 'pink' },
  { id: 3, color: 'lime' },
  { id: 4, color: 'pink' },
  { id: 5, color: 'teal' },
  { id: 6, color: 'pink' },
  { id: 7, color: 'lime' },
  { id: 8, color: 'pink' },
  { id: 9, color: 'teal' },
  { id: 10, color: 'pink' },
  { id: 11, color: 'lime', desktopOnly: true },
  { id: 12, color: 'pink', desktopOnly: true },
  { id: 13, color: 'teal', desktopOnly: true },
  { id: 14, color: 'pink', desktopOnly: true },
  { id: 15, color: 'lime', desktopOnly: true },
  { id: 16, color: 'teal', desktopOnly: true },
];

function getSyncedSegments(progress: number): number {
  if (progress >= 99) return SEGMENT_COUNT; // 25 segments at 99%
  if (progress >= 60) return 15; // 60% of 25
  if (progress >= 50) return 13; // 50% of 25
  if (progress >= 10) return 3; // 10% of 25
  if (progress >= 1) return 1; // 1% -> 1st segment
  return 0;
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function easeInExpo(t: number): number {
  return t <= 0 ? 0 : Math.pow(2, 10 * t - 10);
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

export function IntroLoader({
  isVisible,
  targetShellRef,
  onComplete,
}: IntroLoaderProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const staticVeilRef = useRef<HTMLDivElement | null>(null);
  const canvasHandleRef = useRef<PortalCanvasHandle | null>(null);
  const floatingCharsRef = useRef<HTMLDivElement | null>(null);
  const zoomWrapRef = useRef<HTMLDivElement | null>(null);
  const orbStageRef = useRef<HTMLDivElement | null>(null);
  const particleFieldRef = useRef<HTMLDivElement | null>(null);
  const centerVoidRef = useRef<HTMLDivElement | null>(null);
  const logoDissolveRef = useRef<HTMLDivElement | null>(null);
  const brandingRef = useRef<HTMLDivElement | null>(null);

  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  );

  const prefersReducedMotionRef = useRef(prefersReducedMotion);
  prefersReducedMotionRef.current = prefersReducedMotion;

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const targetShellRefLatest = useRef(targetShellRef);
  targetShellRefLatest.current = targetShellRef;

  const startedEntranceRef = useRef(false);
  const finishedEntranceRef = useRef(false);
  const entranceRafRef = useRef<number>(0);
  const entranceTimerRef = useRef<number>(0);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setPrefersReducedMotion(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Lock page scrolling cleanly while the loader & portal entrance are active
  useEffect(() => {
    if (!isVisible || typeof document === 'undefined') return;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    return () => {
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
    };
  }, [isVisible]);

  // Cleanup active entrance RAF/timers if unmounted early
  useEffect(() => {
    return () => {
      if (entranceRafRef.current) {
        window.cancelAnimationFrame(entranceRafRef.current);
        entranceRafRef.current = 0;
      }
      if (entranceTimerRef.current) {
        window.clearTimeout(entranceTimerRef.current);
        entranceTimerRef.current = 0;
      }
    };
  }, []);

  // Launch unified 60 FPS portal entrance directly at 3.0s without triggering any React re-render
  const startEntrance = useCallback(() => {
    if (startedEntranceRef.current) return;
    startedEntranceRef.current = true;

    const finishEntrance = () => {
      if (finishedEntranceRef.current) return;
      finishedEntranceRef.current = true;
      if (entranceRafRef.current) {
        window.cancelAnimationFrame(entranceRafRef.current);
        entranceRafRef.current = 0;
      }
      if (entranceTimerRef.current) {
        window.clearTimeout(entranceTimerRef.current);
        entranceTimerRef.current = 0;
      }
      const shellEl = targetShellRefLatest.current?.current;
      if (shellEl) {
        shellEl.style.transform = '';
        shellEl.style.willChange = '';
      }
      canvasHandleRef.current?.clear();
      onCompleteRef.current();
    };

    if (prefersReducedMotionRef.current) {
      const shellEl = targetShellRefLatest.current?.current;
      if (shellEl) {
        shellEl.style.transition = `transform ${REDUCED_ENTRANCE_DURATION_MS}ms ease-out`;
        shellEl.style.transform = 'scale(1)';
      }
      if (rootRef.current) {
        rootRef.current.style.transition = `opacity ${REDUCED_ENTRANCE_DURATION_MS}ms ease-out`;
        rootRef.current.style.opacity = '0';
      }
      entranceTimerRef.current = window.setTimeout(
        finishEntrance,
        REDUCED_ENTRANCE_DURATION_MS
      );
      return;
    }

    // Ensure CSS mount fade cannot override imperative entrance opacity
    if (zoomWrapRef.current) {
      zoomWrapRef.current.style.animation = 'none';
      zoomWrapRef.current.style.opacity = '1';
    }
    if (brandingRef.current) {
      brandingRef.current.style.animation = 'none';
      brandingRef.current.style.opacity = '1';
    }

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let ox = vw * 0.5;
    let oy = vh * 0.36;

    if (zoomWrapRef.current) {
      const rect = zoomWrapRef.current.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        ox = rect.left + rect.width * 0.5;
        oy = rect.top + rect.height * 0.5;
      }
    }

    const dxCenter = vw * 0.5 - ox;
    const dyCenter = vh * 0.5 - oy;

    orbStageRef.current?.classList.add('orb-stage--entering');

    // Frame 0 atomic handoff: paint opaque canvas backdrop BEFORE dropping static veil -> 0 flicker
    canvasHandleRef.current?.renderFrame(0, ENTRANCE_DURATION_MS, ox, oy);
    if (staticVeilRef.current) {
      staticVeilRef.current.style.opacity = '0';
    }

    // Emergency fallback guard if the browser tab suspends RAF mid-entrance
    entranceTimerRef.current = window.setTimeout(
      finishEntrance,
      ENTRANCE_DURATION_MS + 90
    );

    let startMs: number | null = null;

    const step = (nowMs: number) => {
      if (finishedEntranceRef.current) return;
      if (startMs === null) {
        startMs = nowMs;
      }

      const elapsed = Math.max(0, nowMs - startMs);
      const t = clamp01(elapsed / ENTRANCE_DURATION_MS);

      // 1. Unified canvas pass: radial aperture + rim + chromatic flash + rays + sparks + hyperspace tunnel
      canvasHandleRef.current?.renderFrame(
        elapsed,
        ENTRANCE_DURATION_MS,
        ox,
        oy
      );

      // 2. Keep 99% peripheral floating characters active across initial flash, then dissolve smoothly (2.35s -> 2.45s)
      if (floatingCharsRef.current) {
        const p = clamp01((t - 0.1) / 0.2);
        if (p >= 1) {
          floatingCharsRef.current.style.opacity = '0';
        } else {
          const eased = easeOutCubic(p);
          floatingCharsRef.current.style.opacity = `${(1 - eased).toFixed(3)}`;
          floatingCharsRef.current.style.transform = `scale(${(1 + 0.06 * eased).toFixed(4)})`;
        }
      }

      // 3. Keep 99% progress & branding visible as Portal Flash ignites at 2.3s, then exit smoothly (2.36s -> 2.46s)
      if (brandingRef.current) {
        const p = clamp01((t - 0.12) / 0.2);
        if (p >= 1) {
          brandingRef.current.style.opacity = '0';
        } else {
          const eased = easeOutCubic(p);
          brandingRef.current.style.opacity = `${(1 - eased).toFixed(3)}`;
          brandingRef.current.style.transform = `translate3d(0, ${(14 * eased).toFixed(2)}px, 0) scale(${(1 - 0.04 * eased).toFixed(4)})`;
        }
      }

      // 4. Disperse outer portal particles cleanly as zoom begins (2.34s -> 2.44s)
      if (particleFieldRef.current) {
        const p = clamp01((t - 0.08) / 0.2);
        if (p >= 1) {
          particleFieldRef.current.style.opacity = '0';
        } else {
          const eased = easeOutCubic(p);
          particleFieldRef.current.style.opacity = `${(1 - eased).toFixed(3)}`;
          particleFieldRef.current.style.transform = `scale(${(1 + 0.34 * eased).toFixed(4)})`;
        }
      }

      // 5. Dissolve center logo into the central flash (2.32s -> 2.42s)
      if (logoDissolveRef.current) {
        const p = clamp01((t - 0.04) / 0.2);
        if (p >= 1) {
          logoDissolveRef.current.style.opacity = '0';
        } else {
          const eased = easeOutCubic(p);
          logoDissolveRef.current.style.opacity = `${(1 - eased).toFixed(3)}`;
          logoDissolveRef.current.style.transform = `scale(${(1 + 0.85 * eased).toFixed(4)})`;
        }
      }

      // 6. Open dark portal center void immediately so central flash erupts from portal core (2.30s -> 2.40s)
      if (centerVoidRef.current) {
        const p = clamp01(t / 0.2);
        centerVoidRef.current.style.opacity = `${(1 - easeOutCubic(p)).toFixed(3)}`;
      }

      // 7. Continuous camera zoom-in (2.40s -> 2.55s) into portal ring expansion & dissolve (2.55s -> 2.70s)
      if (zoomWrapRef.current) {
        const centerMix = easeOutCubic(clamp01((t - 0.14) / 0.34));
        const tx = dxCenter * centerMix;
        const ty = dyCenter * centerMix;

        const zoomP = clamp01((t - 0.14) / 0.64);
        const scale = 1 + 5.8 * (0.22 * zoomP + 0.78 * easeInExpo(zoomP));
        const ringAlpha = 1 - easeOutCubic(clamp01((t - 0.48) / 0.32));

        zoomWrapRef.current.style.transform = `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`;
        zoomWrapRef.current.style.opacity = `${ringAlpha.toFixed(3)}`;
      }

      // 8. Pull Overview page smoothly forward across portal expansion into final 2.8s reveal (2.55s -> 2.80s)
      const shellEl = targetShellRefLatest.current?.current;
      if (shellEl) {
        const emergeP = easeOutCubic(clamp01((t - 0.5) / 0.5));
        const shellScale = 0.94 + 0.06 * emergeP;
        shellEl.style.transform = `scale(${shellScale.toFixed(4)})`;
      }

      if (t < 1) {
        entranceRafRef.current = window.requestAnimationFrame(step);
      } else {
        finishEntrance();
      }
    };

    entranceRafRef.current = window.requestAnimationFrame(step);
  }, []);

  const { progress } = usePortfolioInit({
    enabled: isVisible,
    prefersReducedMotion,
    onComplete: startEntrance,
  });

  if (!isVisible) return null;

  const isInitialBlackout = progress === 0;
  const litSegments = getSyncedSegments(progress);
  const isActivating = progress >= 99;

  return (
    <div
      ref={rootRef}
      role="status"
      aria-live="polite"
      className="font-kalam pointer-events-auto fixed inset-0 z-50 flex h-dvh w-full touch-none flex-col items-center justify-center overflow-hidden pt-[max(1.5rem,env(safe-area-inset-top))] pr-[max(1.25rem,env(safe-area-inset-right))] pb-[max(1.5rem,env(safe-area-inset-bottom))] pl-[max(1.25rem,env(safe-area-inset-left))] select-none"
    >
      {/* Initial 0.2s completely empty black screen */}
      {isInitialBlackout && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-40 bg-[#000000]"
        />
      )}

      {/* Solid opaque backdrop during active load; dropped atomically on canvas Frame 0 */}
      <div ref={staticVeilRef} className="portal-static-veil" aria-hidden="true" />

      {/* Pre-mounted GPU Warp Canvas (zero allocation spike when entrance begins at 3.0s) */}
      <PortalHyperspaceCanvas ref={canvasHandleRef} />

      {/* Six Decorative Floating English & Tamil Portal Characters */}
      <div
        ref={floatingCharsRef}
        aria-hidden="true"
        className="portal-floating-chars"
      >
        {FLOATING_CHARACTERS.map((item) => (
          <span
            key={item.id}
            className={`portal-float-char portal-float-char--${item.tone} ${item.slotClass}`}
          >
            {item.char}
          </span>
        ))}
      </div>

      <div className="relative z-30 flex w-full max-w-md flex-col items-center justify-center">
        {/* Isolated Camera Zoom Transform Container */}
        <div ref={zoomWrapRef} className="portal-zoom-wrap" aria-hidden="true">
          <div
            ref={orbStageRef}
            className={`orb-stage${isActivating ? ' orb-stage--activating' : ''}`}
          >
            {/* Drifting Multi-Speed Glowing Particles */}
            <div ref={particleFieldRef} className="orb-particle-field">
              {PARTICLES.map((particle) => (
                <span
                  key={particle.id}
                  className={`orb-particle orb-particle--${particle.color} orb-particle--${particle.id}${
                    particle.desktopOnly ? ' hidden sm:block' : ''
                  }`}
                />
              ))}
            </div>

            {/* Futuristic Circular Digital Portal */}
            <div className="portal-breathe-wrap">
              {/* Flowing Deep Teal / Electric Pink / Neon Lime Circumferential Light */}
              <div className="portal-energy-flow" />
              <div className="portal-outer-halo" />

              {/* Small Glowing Particles Orbiting the Portal Frame */}
              <div className="portal-orbit-track portal-orbit-track--a">
                <span className="portal-orbit-dot portal-orbit-dot--lime" />
                <span className="portal-orbit-dot portal-orbit-dot--pink" />
              </div>
              <div className="portal-orbit-track portal-orbit-track--b">
                <span className="portal-orbit-dot portal-orbit-dot--teal" />
                <span className="portal-orbit-dot portal-orbit-dot--white" />
              </div>

              {/* Deep Teal Center with Centered Luminous Logo & Glass Reflections */}
              <div ref={centerVoidRef} className="portal-center-void">
                <div className="portal-logo-aura" />
                <div ref={logoDissolveRef} className="portal-logo-dissolve-wrap">
                  <div className="portal-logo-float">
                    <img
                      src="/assets/portal-logo.png"
                      alt=""
                      aria-hidden="true"
                      width={158}
                      height={154}
                      loading="eager"
                      decoding="sync"
                      draggable={false}
                      className="portal-logo-img"
                    />
                  </div>
                </div>
                <div className="portal-logo-sheen" />
                <div className="portal-glass-glint-top" />
                <div className="portal-glass-glint-bottom" />
              </div>

              {/* Precision Mechanical & Neon Ring Assembly */}
              <svg
                viewBox="0 0 240 240"
                className="portal-svg"
                fill="none"
              >
                <defs>
                  <linearGradient
                    id="portal-metal-grad"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#A0B2B2" />
                    <stop offset="28%" stopColor="#0D2B2B" />
                    <stop offset="52%" stopColor="#E2EEEE" />
                    <stop offset="76%" stopColor="#143D3D" />
                    <stop offset="100%" stopColor="#071B1B" />
                  </linearGradient>

                  <linearGradient
                    id="portal-metal-dark"
                    x1="100%"
                    y1="0%"
                    x2="0%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#5D7878" />
                    <stop offset="50%" stopColor="#071B1B" />
                    <stop offset="100%" stopColor="#A0B2B2" />
                  </linearGradient>

                  <linearGradient
                    id="portal-neon-core"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#C8FF27" />
                    <stop offset="50%" stopColor="#22D3EE" />
                    <stop offset="100%" stopColor="#F05BEA" />
                  </linearGradient>

                  <linearGradient
                    id="portal-neon-pink"
                    x1="0%"
                    y1="100%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor="#F05BEA" />
                    <stop offset="55%" stopColor="#A855F7" />
                    <stop offset="100%" stopColor="#22D3EE" />
                  </linearGradient>

                  <linearGradient
                    id="portal-arc-lime"
                    gradientUnits="userSpaceOnUse"
                    x1="210"
                    y1="120"
                    x2="185.5"
                    y2="181.7"
                  >
                    <stop offset="0%" stopColor="#C8FF27" stopOpacity="0" />
                    <stop offset="60%" stopColor="#22D3EE" stopOpacity="0.88" />
                    <stop offset="100%" stopColor="#FFFFFF" stopOpacity="1" />
                  </linearGradient>

                  <linearGradient
                    id="portal-arc-pink"
                    gradientUnits="userSpaceOnUse"
                    x1="216.2"
                    y1="175.4"
                    x2="231"
                    y2="120"
                  >
                    <stop offset="0%" stopColor="#F05BEA" stopOpacity="0" />
                    <stop offset="60%" stopColor="#F05BEA" stopOpacity="0.88" />
                    <stop offset="100%" stopColor="#FFFFFF" stopOpacity="1" />
                  </linearGradient>
                </defs>

                {/* Outer Rotating Energy Ring & Ticks */}
                <g className="portal-ring-cw">
                  <circle
                    cx="120"
                    cy="120"
                    r="112"
                    stroke="url(#portal-neon-pink)"
                    strokeWidth="1.6"
                    strokeDasharray="42 12 16 12"
                    strokeLinecap="round"
                    opacity="0.9"
                  />
                  <circle
                    cx="120"
                    cy="120"
                    r="107"
                    stroke="#F05BEA"
                    strokeWidth="1.2"
                    strokeDasharray="1.5 11.06"
                    opacity="0.62"
                  />
                </g>

                {/* Segmented Metallic Mechanical Frame */}
                <g className="portal-ring-ccw">
                  <circle
                    cx="120"
                    cy="120"
                    r="97"
                    stroke="url(#portal-metal-grad)"
                    strokeWidth="11"
                  />
                  <circle
                    cx="120"
                    cy="120"
                    r="97"
                    stroke="#051313"
                    strokeWidth="12"
                    strokeDasharray="4 72.18"
                  />
                  <circle
                    cx="120"
                    cy="120"
                    r="102"
                    stroke="url(#portal-metal-dark)"
                    strokeWidth="4.5"
                    strokeDasharray="44 116.22"
                  />
                  <circle
                    cx="120"
                    cy="120"
                    r="104.2"
                    stroke="#FFFFFF"
                    strokeWidth="0.9"
                    strokeDasharray="40 120.22"
                    opacity="0.48"
                  />
                  <circle
                    cx="120"
                    cy="120"
                    r="97"
                    stroke="#F05BEA"
                    strokeWidth="2.4"
                    strokeDasharray="3 149.38"
                    strokeLinecap="round"
                    opacity="0.92"
                  />
                </g>

                {/* Traveling Rim Energy Sparks & Light Trails */}
                <g className="portal-spark-cw">
                  <circle
                    cx="120"
                    cy="120"
                    r="90"
                    stroke="url(#portal-arc-lime)"
                    strokeWidth="2.2"
                    strokeDasharray="68 497.5"
                    strokeLinecap="round"
                  />
                  <circle cx="185.5" cy="181.7" r="2.2" fill="#FFFFFF" />
                </g>

                <g className="portal-spark-ccw">
                  <circle
                    cx="120"
                    cy="120"
                    r="111"
                    stroke="url(#portal-arc-pink)"
                    strokeWidth="2"
                    strokeDasharray="58 639.4"
                    strokeLinecap="round"
                  />
                  <circle cx="231" cy="120" r="2.1" fill="#F05BEA" />
                </g>

                {/* Pulsing Electric Pink, Cyan & Neon Lime Inner Ring */}
                <g className="portal-inner-pulse">
                  <circle
                    cx="120"
                    cy="120"
                    r="76"
                    stroke="#F05BEA"
                    strokeWidth="5.5"
                    opacity="0.32"
                  />
                  <circle
                    cx="120"
                    cy="120"
                    r="76"
                    stroke="url(#portal-neon-core)"
                    strokeWidth="2.4"
                  />
                  <circle
                    cx="120"
                    cy="120"
                    r="76"
                    stroke="#FFFFFF"
                    strokeWidth="0.8"
                    opacity="0.6"
                  />
                </g>

                {/* Inner Neon Telemetry Arcs */}
                <g className="portal-inner-spin">
                  <circle
                    cx="120"
                    cy="120"
                    r="70"
                    stroke="#C8FF27"
                    strokeWidth="1.1"
                    strokeDasharray="14 7 3 7"
                    strokeLinecap="round"
                    opacity="0.58"
                  />
                </g>
              </svg>
            </div>
          </div>
        </div>

        {/* Personal Branding Typography & 25-Segment Progress Bar */}
        <div
          ref={brandingRef}
          className="portal-branding-wrap mt-7 flex w-full flex-col items-center text-center sm:mt-9"
        >
          <p className="font-road-rage text-[clamp(1.55rem,min(6.4vw,4.2dvh),2.75rem)] font-normal tracking-[0.1em] text-[#FF4D4D] uppercase drop-shadow-[0_0_20px_rgba(240,91,234,0.34)] sm:tracking-[0.16em]">
            SABARIVASAN G
          </p>

          <p className="font-caveat mt-1 text-sm font-normal tracking-[0.18em] text-[#FFFF00] sm:text-base sm:tracking-[0.26em]">
            portfolio website
          </p>

          {/* 25-Segment Synchronized Progress Bar (1% -> 10% -> 50% -> 60% -> 99%) */}
          <div className="mt-6 w-full max-w-[320px] sm:mt-7 sm:max-w-[380px]">
            <div className="mb-2.5 flex items-center justify-between font-kalam text-[11px] font-bold tracking-[0.2em] sm:text-xs">
              <span className="text-[#A0B2B2] uppercase">
                INITIALIZING...
              </span>
              <span className="font-bold text-[#C8FF27] tabular-nums">
                {progress}%
              </span>
            </div>

            <div
              role="progressbar"
              aria-label="Portfolio initialization progress"
              aria-valuemin={0}
              aria-valuemax={99}
              aria-valuenow={progress}
              className="loader-segments-grid"
            >
              {SEGMENTS.map((segmentIndex) => {
                const isLit = segmentIndex < litSegments;
                const isHead = isLit && segmentIndex === litSegments - 1;

                return (
                  <div
                    key={segmentIndex}
                    className={`loader-segment${
                      isLit ? ' loader-segment--lit' : ''
                    }${isHead ? ' loader-segment--head' : ''}`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
