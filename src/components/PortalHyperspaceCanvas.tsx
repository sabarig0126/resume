import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

export interface PortalCanvasHandle {
  renderFrame: (
    elapsedMs: number,
    durationMs: number,
    originX: number,
    originY: number
  ) => void;
  clear: () => void;
}

interface WarpStreak {
  angle: number;
  radiusNorm: number;
  z: number;
  prevZ: number;
  speed: number;
  width: number;
  color: string;
}

interface BurstSpark {
  angle: number;
  speed: number;
  size: number;
  color: string;
  alpha: number;
}

interface LightRay {
  angle: number;
  angularWidth: number;
  lengthFactor: number;
  phaseOffset: number;
  color: string;
}

interface TunnelRing {
  z: number;
  speed: number;
  rotation: number;
  rotSpeed: number;
  color: string;
  dashed: boolean;
}

const PORTAL_COLORS = [
  '#22D3EE', // Cyan
  '#38BDF8', // Sky cyan
  '#3B82F6', // Electric blue
  '#A855F7', // Purple
  '#F05BEA', // Electric pink
  '#C8FF27', // Subtle Neon Lime accent
];

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

export const PortalHyperspaceCanvas = forwardRef<PortalCanvasHandle>(
  function PortalHyperspaceCanvas(_, ref) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
    const sizeRef = useRef({ width: 0, height: 0, dpr: 1 });
    const prevElapsedRef = useRef(0);

    // Pre-seeded particles & tunnel rings (allocated once at mount -> 0 allocation stall at t=3.0s)
    const sceneDataRef = useRef<{
      streaks: WarpStreak[];
      sparks: BurstSpark[];
      rays: LightRay[];
      rings: TunnelRing[];
    } | null>(null);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d', { alpha: true });
      if (!ctx) return;
      ctxRef.current = ctx;

      const updateSize = () => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        // Cap DPR at 1.5 during full-screen warp for locked 60fps across mobile & 4K screens
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        if (
          width === sizeRef.current.width &&
          height === sizeRef.current.height &&
          dpr === sizeRef.current.dpr
        ) {
          return;
        }
        sizeRef.current = { width, height, dpr };
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      };

      updateSize();

      if (!sceneDataRef.current) {
        sceneDataRef.current = {
          streaks: Array.from({ length: 120 }, (_, i) => {
            const z = 0.14 + Math.random() * 0.92;
            return {
              angle: (i / 120) * Math.PI * 2 + (Math.random() - 0.5) * 0.22,
              radiusNorm: 0.16 + Math.random() * 0.88,
              z,
              prevZ: z,
              speed: 1.85 + Math.random() * 2.35,
              width: 1.2 + Math.random() * 2.1,
              color: PORTAL_COLORS[i % PORTAL_COLORS.length],
            };
          }),
          sparks: Array.from({ length: 36 }, (_, i) => ({
            angle: (i / 36) * Math.PI * 2 + (Math.random() - 0.5) * 0.14,
            speed: 0.45 + Math.random() * 1.0,
            size: 1.8 + Math.random() * 2.6,
            color: PORTAL_COLORS[i % 5],
            alpha: 0.75 + Math.random() * 0.25,
          })),
          rays: Array.from({ length: 22 }, (_, i) => ({
            angle: (i / 22) * Math.PI * 2 + (Math.random() - 0.5) * 0.08,
            angularWidth: 0.018 + Math.random() * 0.036,
            lengthFactor: 0.48 + Math.random() * 0.62,
            phaseOffset: Math.random() * Math.PI * 2,
            color: PORTAL_COLORS[i % 5],
          })),
          rings: [
            { z: 0.28, speed: 2.1, rotation: 0.2, rotSpeed: 1.6, color: '#22D3EE', dashed: false },
            { z: 0.48, speed: 2.2, rotation: 1.1, rotSpeed: -2.0, color: '#3B82F6', dashed: true },
            { z: 0.7, speed: 2.3, rotation: 2.3, rotSpeed: 2.2, color: '#A855F7', dashed: false },
            { z: 0.92, speed: 2.4, rotation: 0.6, rotSpeed: -1.8, color: '#F05BEA', dashed: true },
            { z: 1.14, speed: 2.5, rotation: 3.1, rotSpeed: 1.7, color: '#22D3EE', dashed: true },
          ],
        };
      }

      window.addEventListener('resize', updateSize, { passive: true });
      return () => {
        window.removeEventListener('resize', updateSize);
      };
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        clear() {
          const ctx = ctxRef.current;
          const { width, height } = sizeRef.current;
          if (!ctx || width <= 0 || height <= 0) return;
          ctx.clearRect(0, 0, width, height);
          prevElapsedRef.current = 0;
        },

        renderFrame(
          elapsedMs: number,
          durationMs: number,
          originX: number,
          originY: number
        ) {
          const ctx = ctxRef.current;
          const scene = sceneDataRef.current;
          const { width, height } = sizeRef.current;
          if (!ctx || !scene || width <= 0 || height <= 0) return;

          const dt = Math.min(
            0.036,
            Math.max(0.004, (elapsedMs - prevElapsedRef.current) / 1000)
          );
          prevElapsedRef.current = elapsedMs;

          const t = clamp01(elapsedMs / durationMs);
          const maxDim = Math.hypot(width, height);
          const minDim = Math.min(width, height);

          // Center focal anchor smoothly moves from portal center to screen center
          const centerLerp = easeOutCubic(clamp01(t / 0.42));
          const cx = originX + (width * 0.5 - originX) * centerLerp;
          const cy = originY + (height * 0.5 - originY) * centerLerp;

          const maxCornerDist = Math.hypot(
            Math.max(cx, width - cx),
            Math.max(cy, height - cy)
          );
          const maxApertureRadius = maxCornerDist * 1.18;

          ctx.clearRect(0, 0, width, height);

          // ==================================================================
          // LAYER A: DARK TEAL BACKDROP + HARDWARE COMPOSITED PORTAL APERTURE
          // Opens smoothly across 2.55s-2.70s (t = 0.50 -> 0.80) and clears by 2.80s (t = 1.00)
          // ==================================================================
          const openP = clamp01((t - 0.44) / 0.48);
          const apertureEased =
            openP <= 0 ? 0 : 0.16 * openP + 0.84 * Math.pow(openP, 1.65);
          const apertureRadius = maxApertureRadius * apertureEased;
          const feather = Math.max(24, Math.min(120, 30 + apertureRadius * 0.16));

          const veilAlpha = 1 - easeOutCubic(clamp01((t - 0.78) / 0.22));
          if (veilAlpha > 0.005) {
            ctx.save();
            ctx.globalCompositeOperation = 'source-over';
            ctx.globalAlpha = veilAlpha;
            ctx.fillStyle = '#071B1B';
            ctx.fillRect(0, 0, width, height);

            if (openP > 0 && apertureRadius > 1) {
              const outerR = Math.max(4, apertureRadius + feather);
              const innerRatio = clamp01(
                Math.max(0, apertureRadius - feather * 0.5) / outerR
              );
              const midRatio = clamp01(
                Math.max(0, apertureRadius + feather * 0.2) / outerR
              );

              const cutGrad = ctx.createRadialGradient(
                cx,
                cy,
                0,
                cx,
                cy,
                outerR
              );
              cutGrad.addColorStop(0, 'rgba(0, 0, 0, 1)');
              cutGrad.addColorStop(innerRatio, 'rgba(0, 0, 0, 1)');
              cutGrad.addColorStop(midRatio, 'rgba(0, 0, 0, 0.55)');
              cutGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

              ctx.globalCompositeOperation = 'destination-out';
              ctx.globalAlpha = 1;
              ctx.fillStyle = cutGrad;
              ctx.beginPath();
              ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
              ctx.fill();
            }
            ctx.restore();
          }

          // Smooth tail fade in 2.69s-2.80s (t = 0.78 -> 1.00) for clean Overview reveal
          const tailFade = 1 - easeInOutQuad(clamp01((t - 0.78) / 0.22));
          if (tailFade <= 0.005) return;

          ctx.save();
          ctx.globalCompositeOperation = 'lighter';

          // ==================================================================
          // LAYER B: EXPANDING LUMINOUS PORTAL APERTURE RIM (2.52s -> 2.76s)
          // ==================================================================
          if (openP > 0.01 && apertureRadius > 4) {
            const rimAlpha =
              easeOutCubic(clamp01(openP / 0.14)) *
              (1 - easeOutCubic(clamp01((openP - 0.68) / 0.32))) *
              tailFade;
            if (rimAlpha > 0.01) {
              const rimGrad = ctx.createRadialGradient(
                cx,
                cy,
                Math.max(0, apertureRadius - 28),
                cx,
                cy,
                apertureRadius + 46
              );
              rimGrad.addColorStop(0, 'rgba(240, 91, 234, 0)');
              rimGrad.addColorStop(
                0.35,
                `rgba(240, 91, 234, ${(0.38 * rimAlpha).toFixed(3)})`
              );
              rimGrad.addColorStop(
                0.5,
                `rgba(34, 211, 238, ${(0.72 * rimAlpha).toFixed(3)})`
              );
              rimGrad.addColorStop(
                0.68,
                `rgba(168, 85, 247, ${(0.34 * rimAlpha).toFixed(3)})`
              );
              rimGrad.addColorStop(1, 'rgba(59, 130, 246, 0)');

              ctx.fillStyle = rimGrad;
              ctx.beginPath();
              ctx.arc(cx, cy, apertureRadius + 46, 0, Math.PI * 2);
              ctx.fill();
            }
          }

          // ==================================================================
          // LAYER C: CENTRAL PORTAL FLASH & VOLUMETRIC RADIANT RAYS (2.30s -> 2.60s)
          // Begins at t=0.0 (2.30s) during final 99% stage, peaks cleanly at t=0.20 (2.40s)
          // ==================================================================
          const flashRise = easeOutCubic(clamp01(t / 0.18));
          const flashDecay = 1 - easeInOutQuad(clamp01((t - 0.18) / 0.44));
          const flashStrength = flashRise * flashDecay * tailFade;

          if (flashStrength > 0.01) {
            const rayRadius = maxDim * (0.28 + flashRise * 0.56);
            const { rays } = scene;
            for (let i = 0; i < rays.length; i++) {
              const ray = rays[i];
              const rot = ray.angle + elapsedMs * 0.00075 * (i % 2 === 0 ? 1 : -1);
              const len = rayRadius * ray.lengthFactor;
              const halfW =
                ray.angularWidth *
                (0.85 + 0.35 * Math.sin(elapsedMs * 0.02 + ray.phaseOffset));

              const grad = ctx.createRadialGradient(
                cx,
                cy,
                minDim * 0.02,
                cx,
                cy,
                len
              );
              const rayAlphaByte = Math.min(
                255,
                Math.max(0, Math.round(0.48 * flashStrength * 255))
              );
              grad.addColorStop(
                0,
                `rgba(255, 255, 255, ${(0.45 * flashStrength).toFixed(3)})`
              );
              grad.addColorStop(
                0.28,
                `${ray.color}${rayAlphaByte.toString(16).padStart(2, '0')}`
              );
              grad.addColorStop(1, 'rgba(7, 27, 27, 0)');

              ctx.beginPath();
              ctx.moveTo(cx, cy);
              ctx.lineTo(
                cx + Math.cos(rot - halfW) * len,
                cy + Math.sin(rot - halfW) * len
              );
              ctx.lineTo(
                cx + Math.cos(rot + halfW) * len,
                cy + Math.sin(rot + halfW) * len
              );
              ctx.closePath();
              ctx.fillStyle = grad;
              ctx.fill();
            }

            const flashR = minDim * (0.34 + (1 - flashDecay) * 0.48);
            const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, flashR);
            coreGrad.addColorStop(
              0,
              `rgba(232, 253, 255, ${(0.92 * flashStrength).toFixed(3)})`
            );
            coreGrad.addColorStop(
              0.2,
              `rgba(34, 211, 238, ${(0.86 * flashStrength).toFixed(3)})`
            );
            coreGrad.addColorStop(
              0.44,
              `rgba(59, 130, 246, ${(0.62 * flashStrength).toFixed(3)})`
            );
            coreGrad.addColorStop(
              0.68,
              `rgba(168, 85, 247, ${(0.42 * flashStrength).toFixed(3)})`
            );
            coreGrad.addColorStop(
              0.86,
              `rgba(240, 91, 234, ${(0.24 * flashStrength).toFixed(3)})`
            );
            coreGrad.addColorStop(1, 'rgba(7, 27, 27, 0)');

            ctx.fillStyle = coreGrad;
            ctx.beginPath();
            ctx.arc(cx, cy, flashR, 0, Math.PI * 2);
            ctx.fill();
          }

          // Burst plasma sparks emitted directly from central flash (0.0 -> 0.56)
          const sparkP = clamp01(t / 0.56);
          if (sparkP < 1) {
            const sparkFade = (1 - easeInOutQuad(sparkP)) * tailFade;
            const { sparks } = scene;
            ctx.lineCap = 'round';
            for (let i = 0; i < sparks.length; i++) {
              const s = sparks[i];
              const dist = maxDim * 0.54 * easeOutCubic(sparkP) * s.speed;
              const sx = cx + Math.cos(s.angle) * dist;
              const sy = cy + Math.sin(s.angle) * dist;
              const tailDist = Math.max(0, dist - 26 * (1 - sparkP * 0.45));
              const tx = cx + Math.cos(s.angle) * tailDist;
              const ty = cy + Math.sin(s.angle) * tailDist;

              ctx.strokeStyle = s.color;
              ctx.globalAlpha = s.alpha * sparkFade;
              ctx.lineWidth = s.size * (1 - sparkP * 0.4);
              ctx.beginPath();
              ctx.moveTo(tx, ty);
              ctx.lineTo(sx, sy);
              ctx.stroke();
            }
            ctx.globalAlpha = 1;
          }

          // ==================================================================
          // LAYER D: HYPERSPACE TUNNEL RINGS & 3D LIGHT STREAKS (2.36s -> 2.80s)
          // ==================================================================
          const tunnelStrength = easeOutCubic(clamp01((t - 0.12) / 0.16)) * tailFade;
          if (tunnelStrength > 0.01) {
            const warpSpeedBoost = 1.45 + 2.4 * Math.sin(t * Math.PI);
            const projScale = maxDim * 0.24;
            const { rings, streaks } = scene;

            for (let i = 0; i < rings.length; i++) {
              const ring = rings[i];
              ring.z -= ring.speed * warpSpeedBoost * dt;
              ring.rotation += ring.rotSpeed * dt;
              if (ring.z < 0.05) {
                ring.z += 1.25;
              }

              const radius = projScale / Math.max(0.06, ring.z);
              if (radius > maxDim * 1.05 || radius < 12) continue;

              const depthAlpha =
                clamp01((1.25 - ring.z) * 1.1) *
                clamp01((ring.z - 0.05) * 4.5) *
                0.56 *
                tunnelStrength;

              if (depthAlpha <= 0.01) continue;

              ctx.save();
              ctx.translate(cx, cy);
              ctx.rotate(ring.rotation);
              ctx.strokeStyle = ring.color;
              ctx.globalAlpha = depthAlpha;
              ctx.lineWidth = Math.max(1.2, 3.2 * (1 - ring.z * 0.6));
              if (ring.dashed) {
                const seg = Math.max(18, radius * 0.26);
                ctx.setLineDash([seg, seg * 0.55, seg * 0.3, seg * 0.55]);
              }
              ctx.beginPath();
              ctx.arc(0, 0, radius, 0, Math.PI * 2);
              ctx.stroke();
              ctx.restore();
            }

            ctx.lineCap = 'round';
            for (let i = 0; i < streaks.length; i++) {
              const s = streaks[i];
              s.prevZ = s.z;
              s.z -= s.speed * warpSpeedBoost * dt;

              if (s.z <= 0.04) {
                s.z = 0.92 + Math.random() * 0.25;
                s.prevZ = s.z;
                s.angle = Math.random() * Math.PI * 2;
                s.radiusNorm = 0.16 + Math.random() * 0.88;
                continue;
              }

              const spread = projScale * s.radiusNorm;
              const r1 = spread / s.z;
              const r0 = spread / Math.min(1.4, s.prevZ + 0.08 * warpSpeedBoost);

              if (r0 > maxDim * 0.95) continue;

              const cosA = Math.cos(s.angle);
              const sinA = Math.sin(s.angle);
              const x0 = cx + cosA * r0;
              const y0 = cy + sinA * r0;
              const x1 = cx + cosA * r1;
              const y1 = cy + sinA * r1;

              const nearWeight = clamp01(1.15 - s.z);
              const lineAlpha = nearWeight * 0.88 * tunnelStrength;
              if (lineAlpha <= 0.01) continue;

              ctx.strokeStyle = s.color;
              ctx.globalAlpha = lineAlpha;
              ctx.lineWidth = s.width * (0.7 + nearWeight * 1.45);
              ctx.beginPath();
              ctx.moveTo(x0, y0);
              ctx.lineTo(x1, y1);
              ctx.stroke();
            }
            ctx.globalAlpha = 1;
          }

          ctx.restore();
        },
      }),
      []
    );

    return (
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-20 block h-full w-full"
      />
    );
  }
);
