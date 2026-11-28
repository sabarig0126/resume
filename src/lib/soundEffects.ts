interface ToneSpec {
  freq: number;
  endFreq?: number;
  duration: number;
  gain: number;
  type: OscillatorType;
  delay: number;
}

interface WhooshSpec {
  startFreq: number;
  endFreq: number;
  duration: number;
  gain: number;
  delay: number;
  q?: number;
}

type SfxName =
  | 'click'
  | 'glassInteract'
  | 'navigate'
  | 'modalOpen'
  | 'modalClose'
  | 'sparkle'
  | 'dissolve'
  | 'send'
  | 'receive'
  | 'copy';

interface SfxDefinition {
  tones: ToneSpec[];
  whoosh?: WhooshSpec;
}

const SFX_DEFINITIONS: Record<SfxName, SfxDefinition> = {
  click: {
    tones: [
      { freq: 860, endFreq: 540, duration: 0.028, gain: 0.032, type: 'sine', delay: 0 },
      { freq: 1720, endFreq: 1320, duration: 0.022, gain: 0.011, type: 'triangle', delay: 0.004 },
    ],
  },
  glassInteract: {
    tones: [
      { freq: 1174.66, endFreq: 1318.51, duration: 0.048, gain: 0.016, type: 'sine', delay: 0 },
      { freq: 1760, duration: 0.045, gain: 0.008, type: 'sine', delay: 0.014 },
    ],
  },
  navigate: {
    tones: [
      { freq: 523.25, duration: 0.052, gain: 0.024, type: 'sine', delay: 0.018 },
      { freq: 783.99, endFreq: 880, duration: 0.088, gain: 0.026, type: 'sine', delay: 0.058 },
    ],
    whoosh: { startFreq: 420, endFreq: 1250, duration: 0.13, gain: 0.018, delay: 0, q: 1.8 },
  },
  modalOpen: {
    tones: [
      { freq: 659.25, duration: 0.048, gain: 0.024, type: 'sine', delay: 0.01 },
      { freq: 987.77, endFreq: 1046.5, duration: 0.085, gain: 0.026, type: 'sine', delay: 0.048 },
    ],
    whoosh: { startFreq: 520, endFreq: 1450, duration: 0.115, gain: 0.016, delay: 0, q: 2.1 },
  },
  modalClose: {
    tones: [
      { freq: 783.99, duration: 0.045, gain: 0.022, type: 'sine', delay: 0.006 },
      { freq: 523.25, endFreq: 440, duration: 0.075, gain: 0.022, type: 'sine', delay: 0.04 },
    ],
    whoosh: { startFreq: 1180, endFreq: 380, duration: 0.11, gain: 0.016, delay: 0, q: 2.0 },
  },
  sparkle: {
    tones: [
      { freq: 1046.5, duration: 0.04, gain: 0.02, type: 'sine', delay: 0 },
      { freq: 1318.51, duration: 0.048, gain: 0.022, type: 'sine', delay: 0.032 },
      { freq: 1567.98, duration: 0.068, gain: 0.018, type: 'sine', delay: 0.064 },
    ],
  },
  dissolve: {
    tones: [
      { freq: 1567.98, duration: 0.036, gain: 0.022, type: 'sine', delay: 0 },
      { freq: 1174.66, duration: 0.045, gain: 0.02, type: 'sine', delay: 0.028 },
      { freq: 880, endFreq: 659.25, duration: 0.075, gain: 0.018, type: 'sine', delay: 0.056 },
    ],
    whoosh: { startFreq: 1600, endFreq: 480, duration: 0.12, gain: 0.015, delay: 0.008, q: 2.6 },
  },
  send: {
    tones: [
      { freq: 540, endFreq: 860, duration: 0.065, gain: 0.034, type: 'triangle', delay: 0 },
      { freq: 1080, duration: 0.045, gain: 0.016, type: 'sine', delay: 0.024 },
    ],
    whoosh: { startFreq: 620, endFreq: 1480, duration: 0.08, gain: 0.012, delay: 0, q: 2.4 },
  },
  receive: {
    tones: [
      { freq: 783.99, duration: 0.052, gain: 0.028, type: 'sine', delay: 0 },
      { freq: 1046.5, duration: 0.088, gain: 0.032, type: 'sine', delay: 0.048 },
    ],
  },
  copy: {
    tones: [
      { freq: 987.77, duration: 0.038, gain: 0.024, type: 'sine', delay: 0 },
      { freq: 1318.51, duration: 0.062, gain: 0.026, type: 'sine', delay: 0.034 },
    ],
  },
};

const MAX_CONCURRENT_SOURCES = 4;
const IDLE_SAMPLE_RATE = 44100;

const KEY_SFX_NAMES: readonly SfxName[] = [
  'click',
  'navigate',
  'glassInteract',
  'modalOpen',
  'modalClose',
];

const SECONDARY_SFX_NAMES: readonly SfxName[] = [
  'sparkle',
  'dissolve',
  'send',
  'receive',
  'copy',
];

interface IdleDeadlineLike {
  timeRemaining?: () => number;
}

function sampleWave(type: OscillatorType, phase: number): number {
  const norm = phase - Math.floor(phase);
  if (type === 'triangle') {
    return 1 - 4 * Math.abs(Math.round(norm - 0.25) - (norm - 0.25));
  }
  return Math.sin(norm * Math.PI * 2);
}

function synthesizePcm(def: SfxDefinition, sampleRate: number): Float32Array {
  let totalSec = 0.04;
  for (let i = 0; i < def.tones.length; i += 1) {
    const tone = def.tones[i];
    const end = tone.delay + tone.duration;
    if (end > totalSec) totalSec = end;
  }
  if (def.whoosh) {
    const wEnd = def.whoosh.delay + def.whoosh.duration;
    if (wEnd > totalSec) totalSec = wEnd;
  }

  const length = Math.max(1, Math.ceil((totalSec + 0.008) * sampleRate));
  const data = new Float32Array(length);

  if (def.whoosh) {
    const w = def.whoosh;
    const startSample = Math.max(0, Math.floor(w.delay * sampleRate));
    const endSample = Math.min(length, Math.ceil((w.delay + w.duration) * sampleRate));
    const span = Math.max(1, endSample - startSample);
    const q = w.q ?? 2.2;
    const startFreq = Math.max(80, w.startFreq);
    const endFreq = Math.max(80, w.endFreq);
    const freqRatio = endFreq / startFreq;

    let seed = 0x13579bdf;
    let x1 = 0;
    let x2 = 0;
    let y1 = 0;
    let y2 = 0;

    for (let i = startSample; i < endSample; i += 1) {
      const localIdx = i - startSample;
      const tNorm = localIdx / span;
      const f = startFreq * Math.pow(freqRatio, tNorm);
      const omega = (2 * Math.PI * Math.min(f, sampleRate * 0.42)) / sampleRate;
      const sinW = Math.sin(omega);
      const cosW = Math.cos(omega);
      const alpha = sinW / (2 * q);

      const b0 = alpha;
      const b2 = -alpha;
      const invA0 = 1 / (1 + alpha);
      const a1 = -2 * cosW;
      const a2 = 1 - alpha;

      seed = (seed * 1664525 + 1013904223) >>> 0;
      const noise = (seed / 0xffffffff) * 2 - 1;

      const filtered =
        (b0 * noise + b2 * x2 - a1 * y1 - a2 * y2) * invA0;

      x2 = x1;
      x1 = noise;
      y2 = y1;
      y1 = filtered;

      let env: number;
      if (tNorm < 0.35) {
        env = w.gain * (tNorm / 0.35);
      } else {
        const decayProgress = (tNorm - 0.35) / 0.65;
        env = w.gain * Math.pow(0.001, decayProgress);
      }

      data[i] += filtered * env;
    }
  }

  for (let n = 0; n < def.tones.length; n += 1) {
    const note = def.tones[n];
    const startSample = Math.max(0, Math.floor(note.delay * sampleRate));
    const endSample = Math.min(length, Math.ceil((note.delay + note.duration) * sampleRate));
    const span = Math.max(1, endSample - startSample);
    const attackSec = Math.min(0.007, note.duration * 0.25);
    const attackSamples = Math.max(1, Math.floor(attackSec * sampleRate));
    const f0 = Math.max(40, note.freq);
    const f1 = note.endFreq ? Math.max(40, note.endFreq) : f0;
    const ratio = f1 / f0;

    let phase = 0;
    for (let i = startSample; i < endSample; i += 1) {
      const localIdx = i - startSample;
      const tNorm = localIdx / span;
      const freq = f0 === f1 ? f0 : f0 * Math.pow(ratio, tNorm);
      phase += freq / sampleRate;

      let env: number;
      if (localIdx < attackSamples) {
        env = note.gain * (localIdx / attackSamples);
      } else {
        const decayProgress = (localIdx - attackSamples) / Math.max(1, span - attackSamples);
        env = note.gain * Math.pow(0.001, decayProgress);
      }

      data[i] += sampleWave(note.type, phase) * env;
    }
  }

  for (let i = 0; i < length; i += 1) {
    if (data[i] > 0.85) data[i] = 0.85;
    else if (data[i] < -0.85) data[i] = -0.85;
  }

  return data;
}

function createStandaloneAudioBuffer(pcm: Float32Array, sampleRate: number): AudioBuffer | null {
  if (typeof AudioBuffer !== 'function') return null;
  try {
    const buffer = new AudioBuffer({
      length: pcm.length,
      numberOfChannels: 1,
      sampleRate,
    });
    buffer.copyToChannel(pcm as Float32Array<ArrayBuffer>, 0);
    return buffer;
  } catch {
    return null;
  }
}

function createSilentAudioBuffer(sampleRate: number): AudioBuffer | null {
  if (typeof AudioBuffer !== 'function') return null;
  try {
    return new AudioBuffer({
      length: 1,
      numberOfChannels: 1,
      sampleRate,
    });
  } catch {
    return null;
  }
}

class SoundEffectsManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private buffers = new Map<SfxName, AudioBuffer>();
  private pcmCache = new Map<SfxName, Float32Array>();
  private silentPrimeBuffer: AudioBuffer | null = null;

  private hasUserGesture = false;
  private isUnlockedHooksInstalled = false;
  private isPrimed = false;
  private idlePreloadStarted = false;
  private readonly handleGestureUnlock = (): void => {
    this.unlockFromGesture();
  };

  // Fixed-size expiry timestamp slots avoid per-play `onended` closure allocations
  private readonly voiceEndTimesMs = new Float64Array(MAX_CONCURRENT_SOURCES);

  private lastAnyPlayAt = 0;
  private lastClickAt = 0;
  private lastGlassAt = 0;
  private lastTransitionAt = 0;
  private lastSparkleAt = 0;

  constructor() {
    this.installAutoUnlock();
    this.preloadIdleBuffers();
  }

  installAutoUnlock(): void {
    if (this.isUnlockedHooksInstalled || typeof window === 'undefined') return;
    this.isUnlockedHooksInstalled = true;

    window.addEventListener('pointerdown', this.handleGestureUnlock, { capture: true, passive: true });
    window.addEventListener('touchstart', this.handleGestureUnlock, { capture: true, passive: true });
    window.addEventListener('keydown', this.handleGestureUnlock, { capture: true, passive: true });
  }

  private uninstallAutoUnlock(): void {
    if (!this.isUnlockedHooksInstalled || typeof window === 'undefined') return;
    this.isUnlockedHooksInstalled = false;
    window.removeEventListener('pointerdown', this.handleGestureUnlock, { capture: true });
    window.removeEventListener('touchstart', this.handleGestureUnlock, { capture: true });
    window.removeEventListener('keydown', this.handleGestureUnlock, { capture: true });
  }

  /**
   * Pre-loads key UI/navigation AudioBuffers first, then remaining chat/FX buffers
   * during browser idle slices with zero AudioContext instantiation (no autoplay warnings).
   */
  preloadIdleBuffers(): void {
    if (this.idlePreloadStarted || typeof window === 'undefined') return;
    this.idlePreloadStarted = true;

    const scheduleIdle = (cb: (deadline?: IdleDeadlineLike) => void, timeoutMs: number) => {
      const win = window as Window & {
        requestIdleCallback?: (
          callback: (deadline: IdleDeadlineLike) => void,
          options?: { timeout?: number }
        ) => number;
      };
      if (typeof win.requestIdleCallback === 'function') {
        win.requestIdleCallback(cb, { timeout: timeoutMs });
      } else {
        window.setTimeout(() => cb(), Math.min(timeoutMs, 120));
      }
    };

    const warmBufferList = (
      names: readonly SfxName[],
      startIndex: number,
      onDone?: () => void,
      deadline?: IdleDeadlineLike
    ) => {
      let idx = startIndex;
      while (idx < names.length) {
        this.bakeStandaloneBuffer(names[idx]);
        idx += 1;
        if (
          idx < names.length &&
          deadline?.timeRemaining &&
          deadline.timeRemaining() <= 1.2
        ) {
          scheduleIdle((nextDeadline) => {
            warmBufferList(names, idx, onDone, nextDeadline);
          }, 180);
          return;
        }
      }
      if (!this.silentPrimeBuffer) {
        this.silentPrimeBuffer = createSilentAudioBuffer(IDLE_SAMPLE_RATE);
      }
      onDone?.();
    };

    // Priority tier 1: key click & navigation buffers
    scheduleIdle((deadline) => {
      warmBufferList(
        KEY_SFX_NAMES,
        0,
        () => {
          // Priority tier 2: secondary modal/chat effects
          scheduleIdle((nextDeadline) => {
            warmBufferList(SECONDARY_SFX_NAMES, 0, undefined, nextDeadline);
          }, 420);
        },
        deadline
      );
    }, 160);
  }

  private bakeStandaloneBuffer(name: SfxName): AudioBuffer | null {
    const existing = this.buffers.get(name);
    if (existing) return existing;

    let pcm = this.pcmCache.get(name);
    if (!pcm) {
      pcm = synthesizePcm(SFX_DEFINITIONS[name], IDLE_SAMPLE_RATE);
      this.pcmCache.set(name, pcm);
    }

    const standalone = createStandaloneAudioBuffer(pcm, IDLE_SAMPLE_RATE);
    if (standalone) {
      this.buffers.set(name, standalone);
      this.pcmCache.delete(name);
      return standalone;
    }

    return null;
  }

  private getOrCreateBuffer(ctx: AudioContext, name: SfxName): AudioBuffer | null {
    const cached = this.buffers.get(name);
    if (cached) return cached;

    const standalone = this.bakeStandaloneBuffer(name);
    if (standalone) return standalone;

    const sampleRate = ctx.sampleRate || IDLE_SAMPLE_RATE;
    let pcm = this.pcmCache.get(name);
    if (!pcm) {
      pcm = synthesizePcm(SFX_DEFINITIONS[name], sampleRate);
    }

    try {
      const buffer = ctx.createBuffer(1, pcm.length, sampleRate);
      buffer.copyToChannel(pcm as Float32Array<ArrayBuffer>, 0);
      this.buffers.set(name, buffer);
      this.pcmCache.delete(name);
      return buffer;
    } catch {
      return null;
    }
  }

  unlockFromGesture(): void {
    this.hasUserGesture = true;
    // Fast-path: if already unlocked and running, skip all context/priming work
    if (this.ctx && this.masterGain && this.ctx.state === 'running' && this.isPrimed) {
      this.uninstallAutoUnlock();
      return;
    }
    if (typeof window === 'undefined') return;

    const ctx = this.ensureContext();
    if (!ctx) return;

    this.primeSilentHardware(ctx);
    if (ctx.state === 'suspended') {
      void ctx
        .resume()
        .then(() => {
          if (ctx.state === 'running' && this.isPrimed) {
            this.uninstallAutoUnlock();
          }
        })
        .catch(() => {});
    } else if (ctx.state === 'running' && this.isPrimed) {
      this.uninstallAutoUnlock();
    }
  }

  private ensureContext(): AudioContext | null {
    if (this.ctx && this.ctx.state !== 'closed' && this.masterGain) {
      return this.ctx;
    }
    if (typeof window === 'undefined' || !this.hasUserGesture) return null;

    if (this.ctx?.state === 'closed') {
      this.ctx = null;
      this.masterGain = null;
      this.isPrimed = false;
    }

    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return null;

    try {
      let created: AudioContext;
      try {
        created = new AudioCtx({ latencyHint: 'interactive' });
      } catch {
        created = new AudioCtx();
      }
      const master = created.createGain();
      master.gain.value = 1;
      master.connect(created.destination);

      this.ctx = created;
      this.masterGain = master;
      return created;
    } catch {
      return null;
    }
  }

  private primeSilentHardware(ctx: AudioContext): void {
    if (this.isPrimed || !this.masterGain) return;
    this.isPrimed = true;
    try {
      const silent =
        this.silentPrimeBuffer ??
        (this.silentPrimeBuffer =
          createSilentAudioBuffer(ctx.sampleRate || IDLE_SAMPLE_RATE) ??
          ctx.createBuffer(1, 1, ctx.sampleRate || IDLE_SAMPLE_RATE));
      const src = ctx.createBufferSource();
      src.buffer = silent;
      src.connect(this.masterGain);
      src.start(0);
    } catch {
      // Ignore silent prime error in restricted environments
    }
  }

  private tryReserveVoiceSlot(nowMs: number, durationMs: number): boolean {
    for (let i = 0; i < MAX_CONCURRENT_SOURCES; i += 1) {
      if (this.voiceEndTimesMs[i] <= nowMs) {
        this.voiceEndTimesMs[i] = nowMs + durationMs;
        return true;
      }
    }
    return false;
  }

  private playBuffered(name: SfxName, bypassGlobalGap = false): void {
    if (!this.hasUserGesture) return;

    const nowMs = performance.now();
    if (!bypassGlobalGap && nowMs - this.lastAnyPlayAt < 26) {
      return;
    }

    const ctx =
      this.ctx && this.ctx.state !== 'closed' && this.masterGain
        ? this.ctx
        : this.ensureContext();
    const masterGain = this.masterGain;
    if (!ctx || !masterGain) return;

    if (ctx.state === 'suspended') {
      void ctx.resume().catch(() => {});
    }

    const buffer = this.buffers.get(name) ?? this.getOrCreateBuffer(ctx, name);
    if (!buffer) return;

    if (!bypassGlobalGap && !this.tryReserveVoiceSlot(nowMs, buffer.duration * 1000)) {
      return;
    }
    this.lastAnyPlayAt = nowMs;

    try {
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      src.connect(masterGain);
      src.start(0);
    } catch {
      // Ignore playback error in restricted audio contexts
    }
  }

  /** Soft futuristic digital tick synchronized with press + glass ripple */
  playClick(): void {
    if (!this.hasUserGesture || !this.isPrimed || this.ctx?.state !== 'running') {
      this.unlockFromGesture();
    }
    const now = performance.now();
    if (now - this.lastClickAt < 45) return;
    this.lastClickAt = now;
    this.playBuffered('click');
  }

  /** Subtle crystalline glass shimmer for card hover & touch refraction */
  playGlassInteract(): void {
    if (!this.hasUserGesture) return;
    const now = performance.now();
    if (now - this.lastGlassAt < 280) return;
    if (now - this.lastClickAt < 110 || now - this.lastTransitionAt < 150) return;
    this.lastGlassAt = now;
    this.playBuffered('glassInteract', true);
  }

  /** Smooth futuristic digital whoosh + soft crystalline settle for view transitions */
  playNavigate(): void {
    if (!this.hasUserGesture || !this.isPrimed || this.ctx?.state !== 'running') {
      this.unlockFromGesture();
    }
    const now = performance.now();
    if (now - this.lastTransitionAt < 120) return;
    this.lastTransitionAt = now;
    this.playBuffered('navigate', true);
  }

  /** Frosted glass reveal whoosh + ascending crystal chime for modals/overlays/chatbox open */
  playModalOpen(): void {
    if (!this.hasUserGesture || !this.isPrimed || this.ctx?.state !== 'running') {
      this.unlockFromGesture();
    }
    const now = performance.now();
    if (now - this.lastTransitionAt < 120) return;
    this.lastTransitionAt = now;
    this.playBuffered('modalOpen', true);
  }

  /** Smooth descending glass whoosh for modal/menu/lightbox/chatbox close */
  playModalClose(): void {
    if (!this.hasUserGesture || !this.isPrimed || this.ctx?.state !== 'running') {
      this.unlockFromGesture();
    }
    const now = performance.now();
    if (now - this.lastTransitionAt < 120) return;
    this.lastTransitionAt = now;
    this.playBuffered('modalClose', true);
  }

  /** Subtle crystal sparkle chime synchronized with sparkle particle accents */
  playSparkle(): void {
    if (!this.hasUserGesture || !this.isPrimed || this.ctx?.state !== 'running') {
      this.unlockFromGesture();
    }
    const now = performance.now();
    if (now - this.lastSparkleAt < 120) return;
    this.lastSparkleAt = now;
    this.playBuffered('sparkle', true);
  }

  /** Crystalline dissolve chime synced with selective clear/dismiss shard dispersal */
  playDissolve(): void {
    if (!this.hasUserGesture || !this.isPrimed || this.ctx?.state !== 'running') {
      this.unlockFromGesture();
    }
    const now = performance.now();
    if (now - this.lastTransitionAt < 120) return;
    this.lastTransitionAt = now;
    this.playBuffered('dissolve', true);
  }

  playSend(): void {
    if (!this.hasUserGesture || !this.isPrimed || this.ctx?.state !== 'running') {
      this.unlockFromGesture();
    }
    this.playBuffered('send', true);
  }

  playReceive(): void {
    this.playBuffered('receive', true);
  }

  playCopy(): void {
    if (!this.hasUserGesture || !this.isPrimed || this.ctx?.state !== 'running') {
      this.unlockFromGesture();
    }
    this.playBuffered('copy', true);
  }
}

export const soundEffects = new SoundEffectsManager();

