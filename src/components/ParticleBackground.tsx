import { useEffect, useRef } from 'react';

interface ParticleBackgroundProps {
  paused?: boolean;
}

interface Particle3D {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  baseRadius: number;
  color: 'teal' | 'pink' | 'lime';
  phase: number;
}

const COLOR_MAP: Record<Particle3D['color'], [number, number, number]> = {
  teal: [94, 234, 212],
  pink: [240, 91, 234],
  lime: [200, 255, 39],
};

export function ParticleBackground({ paused = false }: ParticleBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pausedRef = useRef(paused);
  const resumeRef = useRef<(() => void) | null>(null);
  pausedRef.current = paused;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let prefersReducedMotion = motionQuery.matches;

    const nav = navigator as Navigator & { deviceMemory?: number };
    const cores = nav.hardwareConcurrency ?? 4;
    const memory = nav.deviceMemory ?? 4;
    const isLowSpecDevice = cores <= 2 || memory <= 2;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = 1;
    let rafId = 0;
    let resizeRafId = 0;
    let isTabHidden = document.hidden;

    const TARGET_FRAME_MS = 1000 / 30;
    const FOV = 520;
    const Z_RANGE = 480;
    const activeBlurSources = new Set<string>();
    let overlayBlurred = false;

    const pointer = {
      targetX: 0,
      targetY: 0,
      x: 0,
      y: 0,
    };

    const getParticleCount = () => {
      if (prefersReducedMotion) return width < 640 ? 16 : 24;
      if (isLowSpecDevice) return width < 640 ? 18 : 26;
      if (width < 640) return 22;
      if (width < 1024) return 34;
      return 46;
    };

    const particles: Particle3D[] = [];

    const seedParticles = () => {
      const targetCount = getParticleCount();
      particles.length = 0;
      const palette: Particle3D['color'][] = ['pink', 'teal', 'pink', 'lime'];
      const spreadX = Math.max(width * 0.65, 360);
      const spreadY = Math.max(height * 0.65, 360);

      for (let i = 0; i < targetCount; i++) {
        particles.push({
          x: (Math.random() - 0.5) * 2 * spreadX,
          y: (Math.random() - 0.5) * 2 * spreadY,
          z: Math.random() * Z_RANGE - Z_RANGE * 0.35,
          vx: (Math.random() - 0.5) * 0.32,
          vy: (Math.random() - 0.5) * 0.28,
          vz: (Math.random() - 0.5) * 0.38,
          baseRadius: i % 5 === 0 ? 2.4 : 1.55,
          color: palette[i % palette.length],
          phase: Math.random() * Math.PI * 2,
        });
      }
    };

    const updateCanvasSize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const maxDpr = isLowSpecDevice || width < 640 ? 1.25 : 1.5;
      dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seedParticles();
    };

    updateCanvasSize();

    const projected: {
      sx: number;
      sy: number;
      scale: number;
      z: number;
      p: Particle3D;
    }[] = [];

    let lastDrawTime = 0;

    const drawFrame = (time: number, dtScale: number) => {
      ctx.clearRect(0, 0, width, height);

      const centerX = width * 0.5;
      const centerY = height * 0.5;

      // Ease camera parallax toward cursor (scaled for 30fps cadence)
      const easeFactor = Math.min(0.18, 0.045 * dtScale);
      pointer.x += (pointer.targetX - pointer.x) * easeFactor;
      pointer.y += (pointer.targetY - pointer.y) * easeFactor;

      const spreadX = Math.max(width * 0.65, 360);
      const spreadY = Math.max(height * 0.65, 360);
      const halfZ = Z_RANGE * 0.65;

      projected.length = 0;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (!prefersReducedMotion && dtScale > 0) {
          p.x += p.vx * dtScale;
          p.y += (p.vy + Math.sin(time * 0.0008 + p.phase) * 0.05) * dtScale;
          p.z += p.vz * dtScale;

          if (p.x < -spreadX) p.x = spreadX;
          else if (p.x > spreadX) p.x = -spreadX;

          if (p.y < -spreadY) p.y = spreadY;
          else if (p.y > spreadY) p.y = -spreadY;

          if (p.z < -Z_RANGE * 0.35) p.z = halfZ;
          else if (p.z > halfZ) p.z = -Z_RANGE * 0.35;
        }

        const depth = FOV + p.z;
        if (depth <= 40) continue;

        const scale = FOV / depth;
        const parallaxX = pointer.x * (scale * 26);
        const parallaxY = pointer.y * (scale * 20);
        const sx = centerX + p.x * scale + parallaxX;
        const sy = centerY + p.y * scale + parallaxY;

        if (sx < -60 || sx > width + 60 || sy < -60 || sy > height + 60) {
          continue;
        }

        projected.push({ sx, sy, scale, z: p.z, p });
      }

      // Draw connecting lines between nearby projected particles
      if (!isLowSpecDevice) {
        const maxDist = width < 640 ? 110 : 145;
        const maxDistSq = maxDist * maxDist;

        ctx.lineWidth = 1;
        for (let i = 0; i < projected.length; i++) {
          const a = projected[i];
          for (let j = i + 1; j < projected.length; j++) {
            const b = projected[j];
            const dx = a.sx - b.sx;
            const dy = a.sy - b.sy;
            const distSq = dx * dx + dy * dy;
            if (distSq < maxDistSq) {
              const distRatio = 1 - Math.sqrt(distSq) / maxDist;
              const depthFade = Math.min(a.scale, b.scale, 1.1);
              const alpha = Math.round(distRatio * depthFade * 20) / 100;
              if (alpha > 0.01) {
                const rgb =
                  a.p.color === 'pink' || b.p.color === 'pink'
                    ? '240,91,234'
                    : a.p.color === 'lime'
                      ? '200,255,39'
                      : '160,178,178';
                ctx.strokeStyle = `rgba(${rgb},${alpha})`;
                ctx.beginPath();
                ctx.moveTo(a.sx, a.sy);
                ctx.lineTo(b.sx, b.sy);
                ctx.stroke();
              }
            }
          }
        }
      }

      // Draw 3D particles with subtle depth glow
      const allowHalo = !isLowSpecDevice && width >= 640;
      for (let i = 0; i < projected.length; i++) {
        const item = projected[i];
        const [r, g, b] = COLOR_MAP[item.p.color];
        const radius = Math.max(0.8, item.p.baseRadius * item.scale);
        const alpha = Math.round(Math.min(0.82, Math.max(0.16, item.scale * 0.54)) * 100) / 100;

        ctx.beginPath();
        ctx.arc(item.sx, item.sy, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
        ctx.fill();

        if (allowHalo && item.scale > 0.9) {
          const haloAlpha = Math.round(alpha * 14) / 100;
          ctx.beginPath();
          ctx.arc(item.sx, item.sy, radius * 2.4, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r},${g},${b},${haloAlpha})`;
          ctx.fill();
        }
      }
    };

    const tick = (time: number) => {
      if (isTabHidden || pausedRef.current || overlayBlurred || prefersReducedMotion) {
        rafId = 0;
        lastDrawTime = 0;
        return;
      }

      if (lastDrawTime === 0 || time - lastDrawTime >= TARGET_FRAME_MS) {
        const elapsedMs = lastDrawTime === 0 ? TARGET_FRAME_MS : Math.min(time - lastDrawTime, 64);
        lastDrawTime = time;
        drawFrame(time, elapsedMs / 16.667);
      }
      rafId = window.requestAnimationFrame(tick);
    };

    const startOrRenderStatic = () => {
      if (rafId) {
        window.cancelAnimationFrame(rafId);
        rafId = 0;
      }
      lastDrawTime = 0;
      if (prefersReducedMotion || pausedRef.current) {
        drawFrame(0, 0);
        return;
      }
      if (overlayBlurred) {
        return;
      }
      if (!isTabHidden) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    resumeRef.current = startOrRenderStatic;
    startOrRenderStatic();

    const handleOverlayBlur = (e: Event) => {
      const detail = (e as CustomEvent<{ source?: string; active?: boolean }>).detail;
      if (!detail?.source) return;
      if (detail.active) {
        activeBlurSources.add(detail.source);
      } else {
        activeBlurSources.delete(detail.source);
      }
      const nextBlurred = activeBlurSources.size > 0;
      if (nextBlurred !== overlayBlurred) {
        overlayBlurred = nextBlurred;
        startOrRenderStatic();
      }
    };

    const handleVisibilityChange = () => {
      isTabHidden = document.hidden;
      if (isTabHidden && rafId) {
        window.cancelAnimationFrame(rafId);
        rafId = 0;
        lastDrawTime = 0;
      } else {
        startOrRenderStatic();
      }
    };

    const handleMotionChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion = e.matches;
      seedParticles();
      startOrRenderStatic();
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch' || overlayBlurred) return;
      pointer.targetX = (e.clientX / Math.max(width, 1) - 0.5) * 2;
      pointer.targetY = (e.clientY / Math.max(height, 1) - 0.5) * 2;
    };

    const handlePointerLeave = () => {
      pointer.targetX = 0;
      pointer.targetY = 0;
    };

    const handleResize = () => {
      if (resizeRafId) {
        window.cancelAnimationFrame(resizeRafId);
      }
      resizeRafId = window.requestAnimationFrame(() => {
        resizeRafId = 0;
        if (Math.abs(window.innerWidth - width) > 20 || Math.abs(window.innerHeight - height) > 80) {
          updateCanvasSize();
          if (prefersReducedMotion || pausedRef.current || overlayBlurred) {
            drawFrame(0, 0);
          }
        }
      });
    };

    window.addEventListener('portfolio:overlay-blur', handleOverlayBlur);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    motionQuery.addEventListener('change', handleMotionChange);
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    document.addEventListener('pointerleave', handlePointerLeave);
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      resumeRef.current = null;
      if (rafId) window.cancelAnimationFrame(rafId);
      if (resizeRafId) window.cancelAnimationFrame(resizeRafId);
      window.removeEventListener('portfolio:overlay-blur', handleOverlayBlur);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      motionQuery.removeEventListener('change', handleMotionChange);
      window.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerleave', handlePointerLeave);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    pausedRef.current = paused;
    resumeRef.current?.();
  }, [paused]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
    >
      {/* Subtle Electric Pink ambient radial glows (10%–22% opacity) over Deep Teal */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 18% 15%, rgba(240, 91, 234, 0.15), transparent 45%), radial-gradient(circle at 82% 24%, rgba(20, 88, 88, 0.22), transparent 44%), radial-gradient(circle at 55% 85%, rgba(240, 91, 234, 0.11), transparent 48%), radial-gradient(circle at 75% 78%, rgba(200, 255, 39, 0.045), transparent 36%)',
        }}
      />
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
