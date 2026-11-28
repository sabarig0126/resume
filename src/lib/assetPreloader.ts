import type { FeatureId } from '../types/portfolio';
import { soundEffects } from './soundEffects';

type ChunkLoader = () => Promise<unknown>;

const VIEW_CHUNK_LOADERS: Partial<Record<FeatureId, ChunkLoader>> = {
  achievements: () => import('../components/views/AchievementsView'),
  skills: () => import('../components/views/SkillsView'),
  certifications: () => import('../components/views/CertificationsView'),
  education: () => import('../components/views/EducationView'),
  projects: () => import('../components/views/ProjectsView'),
  resume: () => import('../components/views/ResumeView'),
  portfolioPdf: () => import('../components/views/PortfolioPdfView'),
  contact: () => import('../components/views/ContactView'),
  privacy: () => import('../components/views/PrivacyPolicyView'),
  terms: () => import('../components/views/TermsView'),
  notFound: () => import('../components/views/NotFoundView'),
};

const MODAL_CHUNK_LOADERS = {
  aboutModal: () => import('../components/AboutMeHighlightModal'),
  projectLightbox: () => import('../components/ProjectLightbox'),
  chatbot: () => import('../components/PortfolioChatbot'),
} as const;

export type ModalChunkKey = keyof typeof MODAL_CHUNK_LOADERS;

export const PRIORITY_ORGANIZATION_LOGOS: readonly string[] = [
  '/assets/organizations/infosys-springboard.webp',
  '/assets/organizations/simplilearn-skillup.webp',
  '/assets/organizations/tech-mahindra-foundation.webp',
  '/assets/organizations/mongodb.webp',
  '/assets/organizations/ecell-iit-bombay.webp',
  '/assets/organizations/ibm-career-education.webp',
  '/assets/organizations/tedx-srit.webp',
  '/assets/organizations/mathworks.webp',
  '/assets/organizations/nptel-iit-madras.webp',
];

export const ACHIEVEMENT_ASSET_URLS: readonly string[] = [
  '/assets/organizations/nptel-iit-madras.webp',
  '/assets/aistudio/Watercolor_Dog-Filter_Group_Selfie_a2b3ea92.webp',
  '/assets/organizations/sih-logo.webp',
  '/assets/organizations/ecell-iit-bombay.webp',
  '/assets/organizations/tedx-srit.webp',
];

const prefetchedChunks = new Map<string, Promise<unknown>>();
const warmedImages = new Set<string>();
const decodedImages = new Set<string>();
let backgroundPrewarmStarted = false;

interface NetworkInformationLike {
  saveData?: boolean;
  effectiveType?: string;
}

function isConstrainedNetwork(): boolean {
  if (typeof navigator === 'undefined') return false;
  const conn = (navigator as Navigator & { connection?: NetworkInformationLike })
    .connection;
  if (!conn) return false;
  if (conn.saveData) return true;
  return conn.effectiveType === '2g' || conn.effectiveType === 'slow-2g';
}

function runLoaderOnce(key: string, loader: ChunkLoader): Promise<unknown> {
  const existing = prefetchedChunks.get(key);
  if (existing) return existing;

  const promise = loader().catch(() => {
    prefetchedChunks.delete(key);
  });
  prefetchedChunks.set(key, promise);
  return promise;
}

export function prefetchViewChunk(feature: FeatureId): void {
  const loader = VIEW_CHUNK_LOADERS[feature];
  if (!loader) return;
  void runLoaderOnce(`view:${feature}`, loader);
}

export function prefetchModalChunk(key: ModalChunkKey): void {
  const loader = MODAL_CHUNK_LOADERS[key];
  if (!loader) return;
  void runLoaderOnce(`modal:${key}`, loader);
}

export function prefetchAllNavigationChunks(): void {
  if (isConstrainedNetwork()) return;

  const primaryViews: readonly FeatureId[] = [
    'achievements',
    'skills',
    'certifications',
    'education',
    'projects',
    'resume',
    'portfolioPdf',
    'contact',
  ];

  for (const feature of primaryViews) {
    prefetchViewChunk(feature);
  }
  prefetchModalChunk('aboutModal');
  prefetchModalChunk('projectLightbox');
  prefetchModalChunk('chatbot');
}

export function warmImage(
  url: string,
  options?: { decode?: boolean; priority?: 'high' | 'low' | 'auto' }
): void {
  if (typeof window === 'undefined' || !url) return;

  const wantsDecode = Boolean(options?.decode);
  if (warmedImages.has(url) && (!wantsDecode || decodedImages.has(url))) {
    return;
  }

  warmedImages.add(url);
  if (wantsDecode) {
    decodedImages.add(url);
  }

  const img = new Image();
  img.decoding = 'async';
  img.referrerPolicy = 'no-referrer';
  if (options?.priority && 'fetchPriority' in img) {
    (img as HTMLImageElement & { fetchPriority?: string }).fetchPriority =
      options.priority;
  }

  img.onerror = () => {
    warmedImages.delete(url);
    decodedImages.delete(url);
  };

  img.src = url;
  if (wantsDecode && typeof img.decode === 'function') {
    void img.decode().catch(() => {
      // Fallback gracefully if image decode rejects before load
    });
  }
}

export function warmImageBatch(
  urls: readonly string[],
  options?: { decode?: boolean; limit?: number }
): void {
  if (typeof window === 'undefined' || isConstrainedNetwork()) return;

  const maxCount = options?.limit ?? urls.length;
  const targetUrls = urls.slice(0, maxCount);

  for (const url of targetUrls) {
    warmImage(url, { decode: options?.decode, priority: 'low' });
  }
}

function scheduleIdleTask(task: () => void, fallbackDelayMs: number): number {
  if (typeof window === 'undefined') return 0;
  const win = window as Window & {
    requestIdleCallback?: (
      cb: () => void,
      opts?: { timeout?: number }
    ) => number;
  };
  if (typeof win.requestIdleCallback === 'function') {
    return win.requestIdleCallback(task, { timeout: fallbackDelayMs + 600 });
  }
  return window.setTimeout(task, fallbackDelayMs);
}

export function scheduleBackgroundPrewarm(): void {
  if (
    typeof window === 'undefined' ||
    backgroundPrewarmStarted ||
    isConstrainedNetwork()
  ) {
    return;
  }
  backgroundPrewarmStarted = true;

  // Stage 1 (immediate idle): warm interactive modals, chatbot, top route chunks, and key audio buffers
  scheduleIdleTask(() => {
    soundEffects.preloadIdleBuffers();
    prefetchModalChunk('aboutModal');
    prefetchModalChunk('projectLightbox');
    prefetchModalChunk('chatbot');
    prefetchViewChunk('achievements');
    prefetchViewChunk('skills');
    prefetchViewChunk('certifications');
    prefetchViewChunk('education');
  }, 120);

  // Stage 2: warm remaining navigation views + compact achievement & org logo thumbnails (~74 KB total)
  scheduleIdleTask(() => {
    prefetchViewChunk('projects');
    prefetchViewChunk('resume');
    prefetchViewChunk('portfolioPdf');
    prefetchViewChunk('contact');
    prefetchViewChunk('privacy');
    prefetchViewChunk('terms');
    warmImageBatch(ACHIEVEMENT_ASSET_URLS, { decode: true });
    warmImageBatch(PRIORITY_ORGANIZATION_LOGOS, { decode: false });
  }, 450);
}
