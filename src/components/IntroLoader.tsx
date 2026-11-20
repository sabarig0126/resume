import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { usePortfolioInit } from '../lib/usePortfolioInit';

interface IntroLoaderProps {
  isVisible: boolean;
  onComplete: () => void;
}

interface ParticleConfig {
  id: number;
  color: 'blue' | 'purple' | 'pink';
  desktopOnly?: boolean;
}

const SEGMENT_COUNT = 25;
const SEGMENTS = Array.from({ length: SEGMENT_COUNT }, (_, index) => index);

const PARTICLES: ParticleConfig[] = [
  { id: 1, color: 'blue' },
  { id: 2, color: 'purple' },
  { id: 3, color: 'pink' },
  { id: 4, color: 'blue' },
  { id: 5, color: 'purple' },
  { id: 6, color: 'pink' },
  { id: 7, color: 'blue' },
  { id: 8, color: 'pink' },
  { id: 9, color: 'purple' },
  { id: 10, color: 'blue' },
  { id: 11, color: 'pink', desktopOnly: true },
  { id: 12, color: 'purple', desktopOnly: true },
  { id: 13, color: 'blue', desktopOnly: true },
  { id: 14, color: 'pink', desktopOnly: true },
  { id: 15, color: 'purple', desktopOnly: true },
  { id: 16, color: 'blue', desktopOnly: true },
];

export function IntroLoader({ isVisible, onComplete }: IntroLoaderProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  );

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setPrefersReducedMotion(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const { progress } = usePortfolioInit({
    enabled: isVisible,
    prefersReducedMotion,
    onComplete,
  });

  useEffect(() => {
    if (!isVisible && rootRef.current) {
      rootRef.current.style.pointerEvents = 'none';
      rootRef.current.style.touchAction = 'auto';
    }
  }, [isVisible]);

  const litSegments =
    progress >= 100
      ? SEGMENT_COUNT
      : progress > 0
        ? Math.min(SEGMENT_COUNT - 1, Math.max(1, Math.floor(progress / 4)))
        : 0;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          ref={rootRef}
          key="intro-loader"
          role="status"
          aria-live="polite"
          initial={{ opacity: 1, scale: 1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={
            prefersReducedMotion
              ? { opacity: 0 }
              : { opacity: 0, scale: 1.025 }
          }
          transition={{
            duration: prefersReducedMotion ? 0.25 : 0.55,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="loader-sans pointer-events-auto fixed inset-0 z-50 flex h-dvh w-full touch-none flex-col items-center justify-center overflow-hidden bg-[#000000] px-5 py-6 pt-[env(safe-area-inset-top)] pr-[env(safe-area-inset-right)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] select-none"
        >
          <div className="relative flex w-full max-w-md flex-col items-center justify-center">
            {/* Liquid Glass Orb + Surrounding Particle System */}
            <motion.div
              initial={
                prefersReducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.9 }
              }
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: prefersReducedMotion ? 0.2 : 0.8,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="orb-stage"
              aria-hidden="true"
            >
              {/* Soft Cinematic Atmospheric Glow */}
              <div className="orb-ambient-glow" />

              {/* Drifting Multi-Speed Glowing Particles */}
              <div className="orb-particle-field">
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
                {/* Flowing Blue / Purple / Pink Circumferential Light */}
                <div className="portal-energy-flow" />
                <div className="portal-outer-halo" />

                {/* Small Glowing Particles Orbiting the Portal Frame */}
                <div className="portal-orbit-track portal-orbit-track--a">
                  <span className="portal-orbit-dot portal-orbit-dot--cyan" />
                  <span className="portal-orbit-dot portal-orbit-dot--magenta" />
                </div>
                <div className="portal-orbit-track portal-orbit-track--b">
                  <span className="portal-orbit-dot portal-orbit-dot--purple" />
                  <span className="portal-orbit-dot portal-orbit-dot--blue" />
                </div>

                {/* Dark Transparent Center with Neon Glass Reflections */}
                <div className="portal-center-void">
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
                      <stop offset="0%" stopColor="#94A3B8" />
                      <stop offset="28%" stopColor="#1E293B" />
                      <stop offset="52%" stopColor="#E2E8F0" />
                      <stop offset="76%" stopColor="#334155" />
                      <stop offset="100%" stopColor="#0F172A" />
                    </linearGradient>

                    <linearGradient
                      id="portal-metal-dark"
                      x1="100%"
                      y1="0%"
                      x2="0%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#475569" />
                      <stop offset="50%" stopColor="#0F172A" />
                      <stop offset="100%" stopColor="#64748B" />
                    </linearGradient>

                    <linearGradient
                      id="portal-neon-cyan"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#67E8F9" />
                      <stop offset="50%" stopColor="#22D3EE" />
                      <stop offset="100%" stopColor="#3B82F6" />
                    </linearGradient>

                    <linearGradient
                      id="portal-neon-magenta"
                      x1="0%"
                      y1="100%"
                      x2="100%"
                      y2="0%"
                    >
                      <stop offset="0%" stopColor="#A855F7" />
                      <stop offset="50%" stopColor="#EC4899" />
                      <stop offset="100%" stopColor="#60A5FA" />
                    </linearGradient>

                    <linearGradient
                      id="portal-arc-cyan"
                      gradientUnits="userSpaceOnUse"
                      x1="210"
                      y1="120"
                      x2="185.5"
                      y2="181.7"
                    >
                      <stop offset="0%" stopColor="#22D3EE" stopOpacity="0" />
                      <stop offset="60%" stopColor="#38BDF8" stopOpacity="0.85" />
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
                      <stop offset="0%" stopColor="#A855F7" stopOpacity="0" />
                      <stop offset="60%" stopColor="#EC4899" stopOpacity="0.85" />
                      <stop offset="100%" stopColor="#FCE7F3" stopOpacity="1" />
                    </linearGradient>
                  </defs>

                  {/* Outer Purple / Magenta Rotating Energy Ring & Ticks */}
                  <g className="portal-ring-cw">
                    <circle
                      cx="120"
                      cy="120"
                      r="112"
                      stroke="url(#portal-neon-magenta)"
                      strokeWidth="1.6"
                      strokeDasharray="42 12 16 12"
                      strokeLinecap="round"
                      opacity="0.88"
                    />
                    <circle
                      cx="120"
                      cy="120"
                      r="107"
                      stroke="#C084FC"
                      strokeWidth="1.2"
                      strokeDasharray="1.5 11.06"
                      opacity="0.6"
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
                      stroke="#050814"
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
                      stroke="#E2E8F0"
                      strokeWidth="0.9"
                      strokeDasharray="40 120.22"
                      opacity="0.55"
                    />
                    <circle
                      cx="120"
                      cy="120"
                      r="97"
                      stroke="#F472B6"
                      strokeWidth="2.4"
                      strokeDasharray="3 149.38"
                      strokeLinecap="round"
                      opacity="0.9"
                    />
                  </g>

                  {/* Traveling Rim Energy Sparks & Light Trails */}
                  <g className="portal-spark-cw">
                    <circle
                      cx="120"
                      cy="120"
                      r="90"
                      stroke="url(#portal-arc-cyan)"
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
                    <circle cx="231" cy="120" r="2.1" fill="#FCE7F3" />
                  </g>

                  {/* Pulsing Electric Blue & Cyan Inner Ring */}
                  <g className="portal-inner-pulse">
                    <circle
                      cx="120"
                      cy="120"
                      r="76"
                      stroke="#3B82F6"
                      strokeWidth="5.5"
                      opacity="0.38"
                    />
                    <circle
                      cx="120"
                      cy="120"
                      r="76"
                      stroke="url(#portal-neon-cyan)"
                      strokeWidth="2.4"
                    />
                    <circle
                      cx="120"
                      cy="120"
                      r="76"
                      stroke="#E0F2FE"
                      strokeWidth="0.8"
                      opacity="0.7"
                    />
                  </g>

                  {/* Inner Cyan Telemetry Arcs */}
                  <g className="portal-inner-spin">
                    <circle
                      cx="120"
                      cy="120"
                      r="70"
                      stroke="#38BDF8"
                      strokeWidth="1.1"
                      strokeDasharray="14 7 3 7"
                      strokeLinecap="round"
                      opacity="0.68"
                    />
                  </g>
                </svg>
              </div>
            </motion.div>

            {/* Personal Branding Typography */}
            <motion.div
              initial={
                prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 12 }
              }
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: prefersReducedMotion ? 0.2 : 0.7,
                delay: prefersReducedMotion ? 0 : 0.14,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="mt-7 flex w-full flex-col items-center text-center sm:mt-9"
            >
              <p className="loader-sans text-[clamp(1.25rem,min(5.2vw,3.4dvh),1.85rem)] font-semibold tracking-[0.26em] text-white uppercase drop-shadow-[0_0_20px_rgba(168,85,247,0.32)]">
                SABARIVASAN G
              </p>

              <p className="loader-sans mt-1.5 text-[11px] font-normal tracking-[0.34em] text-slate-400 sm:text-xs">
                portfolio website
              </p>

              {/* 25-Segment Real Progress Bar */}
              <div className="mt-6 w-full max-w-[320px] sm:mt-7 sm:max-w-[380px]">
                <div className="mb-2.5 flex items-center justify-between text-[10px] font-medium tracking-[0.24em] sm:text-[11px]">
                  <span className="text-slate-300/90 uppercase">
                    INITIALIZING...
                  </span>
                  <span className="text-slate-200 tabular-nums">
                    {progress}%
                  </span>
                </div>

                <div
                  role="progressbar"
                  aria-label="Portfolio initialization progress"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={progress}
                  className="loader-segments-grid"
                >
                  {SEGMENTS.map((segmentIndex) => {
                    const isLit = segmentIndex < litSegments;
                    const isHead =
                      isLit && segmentIndex === litSegments - 1 && progress < 100;

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
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
