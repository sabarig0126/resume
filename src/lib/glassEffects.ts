const MAX_ACTIVE_RIPPLES = 4;
const MAX_ACTIVE_BURSTS = 2;

let effectsLayerEl: HTMLDivElement | null = null;
let activeRipples = 0;
let activeBursts = 0;
let lastRippleTarget: Element | null = null;
let lastRippleAt = 0;

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function getEffectsLayer(): HTMLDivElement | null {
  if (typeof document === 'undefined' || !document.body) return null;
  if (effectsLayerEl && effectsLayerEl.isConnected) {
    return effectsLayerEl;
  }

  const layer = document.createElement('div');
  layer.setAttribute('aria-hidden', 'true');
  layer.className = 'pearl-effects-layer';
  document.body.appendChild(layer);
  effectsLayerEl = layer;
  return layer;
}

export function triggerGlassRipple(
  target: Element,
  clientX?: number,
  clientY?: number
): void {
  if (prefersReducedMotion()) return;
  if (!(target instanceof HTMLElement)) return;
  if (target.closest('[data-glass-ripple="none"]')) return;

  const now = performance.now();
  if (target === lastRippleTarget && now - lastRippleAt < 90) {
    return;
  }
  if (activeRipples >= MAX_ACTIVE_RIPPLES) {
    return;
  }

  const rect = target.getBoundingClientRect();
  if (rect.width < 12 || rect.height < 12) return;

  const layer = getEffectsLayer();
  if (!layer) return;

  lastRippleTarget = target;
  lastRippleAt = now;
  activeRipples += 1;

  const hasCoords =
    typeof clientX === 'number' &&
    typeof clientY === 'number' &&
    (clientX !== 0 || clientY !== 0);

  const originX = hasCoords
    ? Math.min(rect.width, Math.max(0, clientX - rect.left))
    : rect.width / 2;
  const originY = hasCoords
    ? Math.min(rect.height, Math.max(0, clientY - rect.top))
    : rect.height / 2;

  const dx = Math.max(originX, rect.width - originX);
  const dy = Math.max(originY, rect.height - originY);
  const diameter = Math.ceil(Math.hypot(dx, dy) * 2.15);

  const computedStyle = window.getComputedStyle(target);
  const borderRadius = computedStyle.borderRadius || '12px';

  const host = document.createElement('span');
  host.className = 'pearl-glass-ripple-host';
  host.style.transform = `translate3d(${rect.left.toFixed(1)}px, ${rect.top.toFixed(1)}px, 0)`;
  host.style.width = `${rect.width.toFixed(1)}px`;
  host.style.height = `${rect.height.toFixed(1)}px`;
  host.style.borderRadius = borderRadius;

  const wave = document.createElement('span');
  wave.className = 'pearl-glass-ripple-wave';
  wave.style.width = `${diameter}px`;
  wave.style.height = `${diameter}px`;
  wave.style.left = `${(originX - diameter / 2).toFixed(1)}px`;
  wave.style.top = `${(originY - diameter / 2).toFixed(1)}px`;

  const sheen = document.createElement('span');
  sheen.className = 'pearl-glass-press-sheen';

  host.appendChild(wave);
  host.appendChild(sheen);
  layer.appendChild(host);

  let cleaned = false;
  const cleanup = () => {
    if (cleaned) return;
    cleaned = true;
    activeRipples = Math.max(0, activeRipples - 1);
    host.remove();
  };

  wave.addEventListener('animationend', cleanup, { once: true });
  window.setTimeout(cleanup, 460);
}

export type CrystalBurstVariant = 'sparkle' | 'dissolve';

const SPARKLE_OFFSETS = [
  { x: -18, y: -16, rot: -18, delay: 0, scale: 1.05, tone: 'cyan' },
  { x: 20, y: -14, rot: 22, delay: 30, scale: 0.9, tone: 'lime' },
  { x: -14, y: 18, rot: 14, delay: 50, scale: 0.85, tone: 'pink' },
  { x: 18, y: 16, rot: -24, delay: 20, scale: 1, tone: 'white' },
  { x: 0, y: -24, rot: 8, delay: 40, scale: 0.8, tone: 'cyan' },
] as const;

const DISSOLVE_SHARDS = [
  { x: -28, y: -20, rot: -48, delay: 0, scale: 1, tone: 'cyan' },
  { x: 26, y: -22, rot: 54, delay: 18, scale: 0.95, tone: 'pink' },
  { x: -30, y: 12, rot: -82, delay: 28, scale: 0.9, tone: 'white' },
  { x: 30, y: 14, rot: 76, delay: 12, scale: 1.05, tone: 'cyan' },
  { x: -10, y: -32, rot: -26, delay: 22, scale: 0.82, tone: 'lime' },
  { x: 12, y: 28, rot: 40, delay: 34, scale: 0.88, tone: 'pink' },
  { x: 0, y: 32, rot: -15, delay: 10, scale: 0.78, tone: 'white' },
] as const;

export function triggerCrystalBurst(
  targetOrPoint: Element | { x: number; y: number } | null | undefined,
  variant: CrystalBurstVariant = 'sparkle'
): void {
  if (prefersReducedMotion()) return;
  if (!targetOrPoint || activeBursts >= MAX_ACTIVE_BURSTS) return;

  const layer = getEffectsLayer();
  if (!layer) return;

  let cx = 0;
  let cy = 0;
  if (targetOrPoint instanceof Element) {
    const rect = targetOrPoint.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    cx = rect.left + rect.width / 2;
    cy = rect.top + rect.height / 2;
  } else {
    cx = targetOrPoint.x;
    cy = targetOrPoint.y;
  }

  activeBursts += 1;

  const container = document.createElement('span');
  container.className = 'pearl-crystal-burst';
  container.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0)`;

  const specs = variant === 'dissolve' ? DISSOLVE_SHARDS : SPARKLE_OFFSETS;
  for (const item of specs) {
    const particle = document.createElement('span');
    particle.className =
      variant === 'dissolve'
        ? `pearl-crystal-shard pearl-crystal-tone--${item.tone}`
        : `pearl-crystal-sparkle pearl-crystal-tone--${item.tone}`;
    particle.style.setProperty('--tx', `${item.x}px`);
    particle.style.setProperty('--ty', `${item.y}px`);
    particle.style.setProperty('--rot', `${item.rot}deg`);
    particle.style.setProperty('--s', String(item.scale));
    particle.style.animationDelay = `${item.delay}ms`;
    container.appendChild(particle);
  }

  layer.appendChild(container);

  let cleaned = false;
  const cleanup = () => {
    if (cleaned) return;
    cleaned = true;
    activeBursts = Math.max(0, activeBursts - 1);
    container.remove();
  };

  window.setTimeout(cleanup, 480);
}
