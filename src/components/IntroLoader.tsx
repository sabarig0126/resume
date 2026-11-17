import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';

interface IntroLoaderProps {
  isVisible: boolean;
  durationMs?: number;
}

export function IntroLoader({
  isVisible,
  durationMs = 3600,
}: IntroLoaderProps) {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isVisible) return;
    const container = canvasMountRef.current;
    if (!container) return;

    let cancelled = false;
    let cleanup: (() => void) | undefined;

    import('../lib/introThreeScene')
      .then(({ mountIntroThreeScene }) => {
        if (cancelled) return;
        try {
          cleanup = mountIntroThreeScene({
            container,
            durationMs,
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
          key="intro-loader"
          role="status"
          aria-live="polite"
          initial={{ opacity: 1, scale: 1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.06 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-50 overflow-hidden bg-[#030714]"
        >
          {/* Isolated WebGL 3D Scene Container */}
          <div ref={canvasMountRef} className="absolute inset-0" />

          {/* Soft Depth Vignette for Crisp Typography Contrast (No backdrop-blur over WebGL) */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(3,7,20,0.62)_0%,rgba(3,7,20,0.22)_52%,rgba(3,7,20,0.75)_100%)]"
          />

          {/* 3D Perspective Holographic Text Reveal */}
          <div
            className="pointer-events-none relative z-10 flex h-full w-full flex-col items-center justify-center px-6 text-center"
            style={{ perspective: '1000px' }}
          >
            <motion.div
              initial={{
                opacity: 0,
                rotateX: 24,
                z: -140,
                filter: 'blur(8px)',
              }}
              animate={{
                opacity: 1,
                rotateX: 0,
                z: 0,
                filter: 'blur(0px)',
              }}
              exit={{
                opacity: 0,
                rotateX: -12,
                z: 160,
                filter: 'blur(6px)',
              }}
              transition={{
                duration: 1.05,
                delay: 0.3,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="relative flex max-w-2xl flex-col items-center"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Holographic Scanline Sweep */}
              <motion.div
                aria-hidden="true"
                initial={{ x: '-65%', opacity: 0 }}
                animate={{ x: '65%', opacity: [0, 0.9, 0] }}
                transition={{
                  duration: 1.5,
                  delay: 0.55,
                  ease: 'easeInOut',
                }}
                className="pointer-events-none absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-cyan-300/25 to-transparent"
              />

              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.4 }}
                className="text-[16px] font-medium tracking-[0.22em] text-cyan-300 uppercase"
              >
                Created by
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, letterSpacing: '0.26em', scale: 0.94 }}
                animate={{ opacity: 1, letterSpacing: '0.1em', scale: 1 }}
                transition={{
                  duration: 0.95,
                  delay: 0.52,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="mt-2 font-display text-[36px] font-bold leading-tight text-white [text-shadow:0_0_28px_rgba(34,211,238,0.55),0_0_10px_rgba(37,99,235,0.65)]"
              >
                SABARIVASAN G
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.85 }}
                className="mt-2.5 text-[14px] font-medium tracking-wide text-cyan-100 [text-shadow:0_2px_14px_rgba(3,7,20,0.95)]"
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
