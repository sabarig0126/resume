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
  color: 'blue' | 'cyan' | 'violet';
  phase: number;
}

const COLOR_MAP: Record<Particle3D['color'], [number, number, number]> = {
  blue: [59, 130, 246],
  cyan: [34, 211, 238],
  violet: [139, 92, 246],
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

    const FOV = 520;
    const Z_RANGE = 480;

    const pointer = {
      targetX: 0,
      targetY: 0,
      x: 0,
      y: 0,
    };

    const getParticleCount = () => {
      if (prefersReducedMotion) return width < 640 ? 18 : 28;
      if (isLowSpecDevice) return width < 640 ? 20 : 30;
      if (width < 640) return 26;
      if (width < 1024) return 38;
      return 54;
    };

    const particles: Particle3D[] = [];

    const seedParticles = () => {
      const targetCount = getParticleCount();
      particles.length = 0;
      const palette: Particle3D['color'][] = ['blue', 'cyan', 'blue', 'violet'];
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

    const drawFrame = (time: number) => {
      ctx.clearRect(0, 0, width, height);

      // Subtle atmospheric depth gradients (blue, cyan, violet)
      const centerX = width * 0.5;
      const centerY = height * 0.5;

      // Ease camera parallax toward cursor
      pointer.x += (pointer.targetX - pointer.x) * 0.045;
      pointer.y += (pointer.targetY - pointer.y) * 0.045;

      const spreadX = Math.max(width * 0.65, 360);
      const spreadY = Math.max(height * 0.65, 360);
      const halfZ = Z_RANGE * 0.65;

      projected.length = 0;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (!prefersReducedMotion) {
          p.x += p.vx;
          p.y += p.vy + Math.sin(time * 0.0008 + p.phase) * 0.05;
          p.z += p.vz;

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
        const maxDist = width < 640 ? 115 : 145;
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
              const alpha = distRatio * depthFade * 0.22;
              if (alpha > 0.015) {
                const rgb =
                  a.p.color === 'cyan' || b.p.color === 'cyan'
                    ? '34, 211, 238'
                    : a.p.color === 'violet'
                      ? '139, 92, 246'
                      : '59, 130, 246';
                ctx.strokeStyle = `rgba(${rgb}, ${alpha.toFixed(3)})`;
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
      for (let i = 0; i < projected.length; i++) {
        const item = projected[i];
        const [r, g, b] = COLOR_MAP[item.p.color];
        const radius = Math.max(0.8, item.p.baseRadius * item.scale);
        const alpha = Math.min(0.85, Math.max(0.18, item.scale * 0.58));

        ctx.beginPath();
        ctx.arc(item.sx, item.sy, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(3)})`;
        ctx.fill();

        if (item.scale > 0.9 && !isLowSpecDevice) {
          ctx.beginPath();
          ctx.arc(item.sx, item.sy, radius * 2.4, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${(alpha * 0.14).toFixed(3)})`;
          ctx.fill();
        }
      }
    };

    const tick = (time: number) => {
      if (isTabHidden || pausedRef.current || prefersReducedMotion) {
        rafId = 0;
        return;
      }
      drawFrame(time);
      rafId = window.requestAnimationFrame(tick);
    };

    const startOrRenderStatic = () => {
      if (rafId) {
        window.cancelAnimationFrame(rafId);
        rafId = 0;
      }
      if (prefersReducedMotion) {
        drawFrame(0);
        return;
      }
      if (!isTabHidden && !pausedRef.current) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    resumeRef.current = startOrRenderStatic;
    startOrRenderStatic();

    const handleVisibilityChange = () => {
      isTabHidden = document.hidden;
      if (isTabHidden && rafId) {
        window.cancelAnimationFrame(rafId);
        rafId = 0;
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
      if (e.pointerType === 'touch') return;
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
          if (prefersReducedMotion) {
            drawFrame(0);
          }
        }
      });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    motionQuery.addEventListener('change', handleMotionChange);
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    document.addEventListener('pointerleave', handlePointerLeave);
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      resumeRef.current = null;
      if (rafId) window.cancelAnimationFrame(rafId);
      if (resizeRafId) window.cancelAnimationFrame(resizeRafId);
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
      {/* Subtle ambient depth gradient behind particle canvas */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 18% 15%, rgba(37, 99, 235, 0.14), transparent 45%), radial-gradient(circle at 82% 24%, rgba(34, 211, 238, 0.08), transparent 42%), radial-gradient(circle at 55% 85%, rgba(139, 92, 246, 0.09), transparent 48%)',
        }}
      />
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
