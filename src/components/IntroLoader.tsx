import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';

interface IntroLoaderProps {
  isVisible: boolean;
  durationMs?: number;
}

export function IntroLoader({
  isVisible,
  durationMs = 3600,
}: IntroLoaderProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const startedAtRef = useRef<number>(
    typeof performance !== 'undefined' ? performance.now() : Date.now()
  );
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

  useEffect(() => {
    if (!isVisible && rootRef.current) {
      rootRef.current.style.pointerEvents = 'none';
      rootRef.current.style.touchAction = 'auto';
    }
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;
    const container = canvasMountRef.current;
    if (!container) return;

    let cancelled = false;
    let cleanup: (() => void) | undefined;

    import('../lib/introThreeScene')
      .then(({ mountIntroThreeScene }) => {
        if (cancelled) return;
        const elapsedMs =
          (typeof performance !== 'undefined' ? performance.now() : Date.now()) -
          startedAtRef.current;
        const remainingMs = durationMs - elapsedMs;
        // On very slow connections, if loader is nearly finished, avoid stalling exit with WebGL shader init
        if (remainingMs < 750) return;

        try {
          cleanup = mountIntroThreeScene({
            container,
            durationMs,
            initialElapsedMs: Math.max(0, elapsedMs),
          });
        } catch {
          // Fallback cleanly to CSS/Motion holographic presentation if WebGL fails
        }
      })
      .catch(() => {
        // Fallback cleanly if chunk fails to load
      });

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [isVisible, durationMs]);

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
              : { opacity: 0, scale: 1.04 }
          }
          transition={{
            duration: prefersReducedMotion ? 0.25 : 0.45,
            ease: [0.22, 1, 0.36, 1],
          }}
          className={`fixed inset-0 z-50 h-dvh w-full overflow-hidden bg-[#030714] ${
            isVisible ? 'pointer-events-auto touch-none' : 'pointer-events-none'
          }`}
          style={{
            pointerEvents: isVisible ? 'auto' : 'none',
            paddingTop: 'env(safe-area-inset-top)',
            paddingBottom: 'env(safe-area-inset-bottom)',
            paddingLeft: 'env(safe-area-inset-left)',
            paddingRight: 'env(safe-area-inset-right)',
          }}
        >
          {/* Isolated WebGL 3D Scene Container */}
          <div
            ref={canvasMountRef}
            className="pointer-events-none absolute inset-0 overflow-hidden"
          />

          {/* Soft Depth Vignette for Crisp Typography Contrast (No backdrop-blur over WebGL) */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(3,7,20,0.62)_0%,rgba(3,7,20,0.22)_52%,rgba(3,7,20,0.75)_100%)]"
          />

          {/* 3D Perspective Holographic Text Reveal */}
          <div
            className="pointer-events-none relative z-10 flex h-full w-full flex-col items-center justify-center px-4 py-4 text-center sm:px-6 sm:py-6"
            style={prefersReducedMotion ? undefined : { perspective: '1000px' }}
          >
            <motion.div
              initial={
                prefersReducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, rotateX: 20, y: 18, scale: 0.94 }
              }
              animate={
                prefersReducedMotion
                  ? { opacity: 1 }
                  : { opacity: 1, rotateX: 0, y: 0, scale: 1 }
              }
              exit={
                prefersReducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, rotateX: -10, y: -12, scale: 1.04 }
              }
              transition={{
                duration: prefersReducedMotion ? 0.28 : 0.9,
                delay: prefersReducedMotion ? 0 : 0.22,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="relative flex w-full max-w-2xl flex-col items-center overflow-hidden px-2 py-2"
            >
              {/* Holographic Scanline Sweep (disabled under prefers-reduced-motion) */}
              {!prefersReducedMotion && (
                <motion.div
                  aria-hidden="true"
                  initial={{ x: '-75%', opacity: 0 }}
                  animate={{ x: '75%', opacity: [0, 0.9, 0] }}
                  transition={{
                    duration: 1.4,
                    delay: 0.45,
                    ease: 'easeInOut',
                  }}
                  className="pointer-events-none absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-cyan-300/25 to-transparent"
                />
              )}

              <motion.p
                initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: prefersReducedMotion ? 0.22 : 0.55,
                  delay: prefersReducedMotion ? 0 : 0.32,
                }}
                className="font-caveat text-[clamp(0.95rem,min(3.6vw,4.5dvh),1.25rem)] font-normal tracking-[0.16em] text-[#FFFF00] uppercase"
              >
                Created by
              </motion.p>

              <motion.h1
                initial={
                  prefersReducedMotion
                    ? { opacity: 0 }
                    : { opacity: 0, letterSpacing: '0.16em', scale: 0.95 }
                }
                animate={
                  prefersReducedMotion
                    ? { opacity: 1 }
                    : { opacity: 1, letterSpacing: '0.08em', scale: 1 }
                }
                transition={{
                  duration: prefersReducedMotion ? 0.25 : 0.85,
                  delay: prefersReducedMotion ? 0 : 0.42,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="mt-1 max-w-full font-road-rage text-[clamp(1.85rem,min(8.5vw,12dvh),3.35rem)] font-normal leading-tight text-[#FF0000] [text-shadow:0_0_24px_rgba(34,211,238,0.5),0_0_10px_rgba(37,99,235,0.6)]"
              >
                SABARIVASAN G
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: prefersReducedMotion ? 0 : -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: prefersReducedMotion ? 0.22 : 0.6,
                  delay: prefersReducedMotion ? 0.06 : 0.72,
                }}
                className="mt-1.5 max-w-[34ch] font-kalam text-[clamp(0.8rem,min(2.8vw,3.8dvh),0.9375rem)] font-normal tracking-wide text-cyan-100 [text-shadow:0_2px_14px_rgba(3,7,20,0.95)]"
              >
                Designed &amp; Developed with the Power of AI
              </motion.p>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
