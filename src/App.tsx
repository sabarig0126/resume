import {
  Component,
  type ComponentType,
  type ErrorInfo,
  lazy,
  type ReactNode,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { MotionConfig } from 'motion/react';
import { CinematicTransition } from './components/CinematicTransition';
import { CookieConsentBanner } from './components/CookieConsentBanner';
import { CursorGlow } from './components/CursorGlow';
import { Header } from './components/Header';
import { IntroLoader } from './components/IntroLoader';
import { ParticleBackground } from './components/ParticleBackground';
import { SiteFooter } from './components/SiteFooter';
import { OverviewView } from './components/views/OverviewView';
import { INITIAL_PORTFOLIO_ITEMS } from './data/projects';
import {
  initializeAnalyticsWithConsent,
  trackConsentAwarePageView,
} from './lib/analytics';
import {
  type ConsentPreferences,
  readConsent,
  subscribeConsent,
} from './lib/consent';
import { FEATURE_PATHS, updateFeatureSeo } from './lib/seo';
import { scheduleBackgroundPrewarm } from './lib/assetPreloader';
import { triggerCrystalBurst, triggerGlassRipple } from './lib/glassEffects';
import { soundEffects } from './lib/soundEffects';
import { FeatureId, PortfolioItem } from './types/portfolio';

const CHUNK_RELOAD_STORAGE_KEY = 'sabari_chunk_reload_ts';
const CHUNK_RELOAD_COOLDOWN_MS = 15_000;

function lazyWithRetry<T extends ComponentType<any>>(
  importer: () => Promise<{ default: T }>,
  retries = 2,
  delayMs = 300
) {
  return lazy(async () => {
    let lastError: unknown;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await importer();
      } catch (err) {
        lastError = err;
        if (attempt < retries) {
          await new Promise((resolve) =>
            window.setTimeout(resolve, delayMs * (attempt + 1))
          );
        }
      }
    }

    if (typeof window !== 'undefined') {
      try {
        const lastReload = Number(
          window.sessionStorage.getItem(CHUNK_RELOAD_STORAGE_KEY) || '0'
        );
        const now = Date.now();
        if (!lastReload || now - lastReload > CHUNK_RELOAD_COOLDOWN_MS) {
          window.sessionStorage.setItem(CHUNK_RELOAD_STORAGE_KEY, String(now));
          window.location.reload();
          return await new Promise<{ default: T }>(() => {});
        }
      } catch {
        // Ignore sessionStorage errors in restricted iframes
      }
    }

    throw lastError;
  });
}

interface LazyErrorBoundaryProps {
  children: ReactNode;
  resetKey?: string;
  silentFallback?: boolean;
}

interface LazyErrorBoundaryState {
  hasError: boolean;
}

class LazyErrorBoundary extends Component<
  LazyErrorBoundaryProps,
  LazyErrorBoundaryState
> {
  state: LazyErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): LazyErrorBoundaryState {
    return { hasError: true };
  }

  componentDidUpdate(prevProps: LazyErrorBoundaryProps) {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false });
    }
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    // Handled via fallback UI
  }

  render() {
    if (this.state.hasError) {
      if (this.props.silentFallback) {
        return null;
      }
      return (
        <div className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-6 py-16 text-center">
          <p className="font-kalam text-base text-[#FFFFFF]">
            This section took a moment to load.
          </p>
          <p className="mt-2 text-sm text-[#A0B2B2]">
            Please retry or refresh the page to load the latest view.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => this.setState({ hasError: false })}
              className="touch-press inline-flex min-h-[42px] items-center justify-center rounded-lg bg-[#C8FF27] px-5 py-2 text-sm font-bold text-[#071B1B] cursor-pointer"
            >
              Retry
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="touch-press inline-flex min-h-[42px] items-center justify-center rounded-lg border border-white/20 bg-white/[0.06] px-5 py-2 text-sm font-semibold text-[#FFFFFF] cursor-pointer"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Code-split secondary views, modals, and assistant so initial overview payload loads swiftly
const AchievementsView = lazyWithRetry(() =>
  import('./components/views/AchievementsView').then((m) => ({
    default: m.AchievementsView,
  }))
);
const SkillsView = lazyWithRetry(() =>
  import('./components/views/SkillsView').then((m) => ({
    default: m.SkillsView,
  }))
);
const CertificationsView = lazyWithRetry(() =>
  import('./components/views/CertificationsView').then((m) => ({
    default: m.CertificationsView,
  }))
);
const EducationView = lazyWithRetry(() =>
  import('./components/views/EducationView').then((m) => ({
    default: m.EducationView,
  }))
);
const ProjectsView = lazyWithRetry(() =>
  import('./components/views/ProjectsView').then((m) => ({
    default: m.ProjectsView,
  }))
);
const ResumeView = lazyWithRetry(() =>
  import('./components/views/ResumeView').then((m) => ({
    default: m.ResumeView,
  }))
);
const PortfolioPdfView = lazyWithRetry(() =>
  import('./components/views/PortfolioPdfView').then((m) => ({
    default: m.PortfolioPdfView,
  }))
);
const ContactView = lazyWithRetry(() =>
  import('./components/views/ContactView').then((m) => ({
    default: m.ContactView,
  }))
);
const PrivacyPolicyView = lazyWithRetry(() =>
  import('./components/views/PrivacyPolicyView').then((m) => ({
    default: m.PrivacyPolicyView,
  }))
);
const TermsView = lazyWithRetry(() =>
  import('./components/views/TermsView').then((m) => ({
    default: m.TermsView,
  }))
);
const NotFoundView = lazyWithRetry(() =>
  import('./components/views/NotFoundView').then((m) => ({
    default: m.NotFoundView,
  }))
);
const ProjectLightbox = lazyWithRetry(() =>
  import('./components/ProjectLightbox').then((m) => ({
    default: m.ProjectLightbox,
  }))
);
const AboutMeHighlightModal = lazyWithRetry(() =>
  import('./components/AboutMeHighlightModal').then((m) => ({
    default: m.AboutMeHighlightModal,
  }))
);
const PortfolioChatbot = lazyWithRetry(() =>
  import('./components/PortfolioChatbot').then((m) => ({
    default: m.PortfolioChatbot,
  }))
);

const ROUTE_SEGMENTS: Record<string, FeatureId> = {
  '': 'overview',
  overview: 'overview',
  achievements: 'achievements',
  skills: 'skills',
  certifications: 'certifications',
  education: 'education',
  projects: 'projects',
  resume: 'resume',
  'portfolio-deck': 'portfolioPdf',
  portfoliopdf: 'portfolioPdf',
  portfolio: 'portfolioPdf',
  contact: 'contact',
  privacy: 'privacy',
  'privacy-policy': 'privacy',
  terms: 'terms',
  'terms-and-conditions': 'terms',
};

function readFeatureFromLocation(): FeatureId {
  if (typeof window === 'undefined') return 'overview';

  const rawHash = window.location.hash.replace(/^#\/?/, '').trim().toLowerCase();
  if (rawHash) {
    return ROUTE_SEGMENTS[rawHash] ?? 'notFound';
  }

  const normalizedPath = window.location.pathname
    .replace(/^\/+|\/+$/g, '')
    .toLowerCase();

  if (!normalizedPath || normalizedPath === 'index.html') {
    return 'overview';
  }

  return ROUTE_SEGMENTS[normalizedPath] ?? 'notFound';
}

function isDirectSubrouteOrNotFound(): boolean {
  if (typeof window === 'undefined') return false;
  return readFeatureFromLocation() !== 'overview';
}

export default function App() {
  const initialFeature = useMemo(() => readFeatureFromLocation(), []);
  const [showIntro, setShowIntro] = useState<boolean>(
    () => !isDirectSubrouteOrNotFound()
  );
  const [activeFeature, setActiveFeature] = useState<FeatureId>(initialFeature);
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
  const [aboutCardOpen, setAboutCardOpen] = useState(false);
  const [consentPrefs, setConsentPrefs] = useState<ConsentPreferences | null>(
    () => readConsent()
  );

  const shellRef = useRef<HTMLDivElement | null>(null);
  const previousFeatureRef = useRef<FeatureId>('overview');
  const showIntroRef = useRef(showIntro);
  showIntroRef.current = showIntro;

  const handleIntroComplete = useCallback(() => {
    const targetFeature = readFeatureFromLocation();
    previousFeatureRef.current = 'overview';
    setActiveFeature(targetFeature);
    setSelectedItem(null);
    setAboutCardOpen(false);
    setShowIntro(false);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, []);

  const openAboutCard = useCallback(() => {
    soundEffects.playModalOpen();
    setAboutCardOpen(true);
  }, []);

  const closeAboutCard = useCallback(() => {
    soundEffects.playModalClose();
    setAboutCardOpen(false);
  }, []);

  useEffect(() => {
    if (!showIntro) return;
    // Outer hard fail-safe so the main portfolio is never blocked indefinitely
    const outerFailSafe = window.setTimeout(() => {
      handleIntroComplete();
    }, 5000);

    return () => {
      window.clearTimeout(outerFailSafe);
    };
  }, [showIntro, handleIntroComplete]);

  // Support browser back/forward navigation cleanly across pathname and legacy hashes
  useEffect(() => {
    const handleLocationChange = () => {
      if (showIntroRef.current) return;
      setActiveFeature(readFeatureFromLocation());
    };
    window.addEventListener('hashchange', handleLocationChange);
    window.addEventListener('popstate', handleLocationChange);
    return () => {
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  // Subscribe to consent changes & gate analytics initialization
  useEffect(() => {
    initializeAnalyticsWithConsent(Boolean(consentPrefs?.analytics));
    return subscribeConsent((updated) => {
      setConsentPrefs(updated);
      initializeAnalyticsWithConsent(Boolean(updated?.analytics));
    });
  }, [consentPrefs?.analytics]);

  // Update SEO metadata + consent-gated analytics page view on navigation & ensure background prewarm runs
  useEffect(() => {
    updateFeatureSeo(activeFeature);
    if (!showIntro) {
      scheduleBackgroundPrewarm();
      trackConsentAwarePageView(activeFeature, Boolean(consentPrefs?.analytics));
    }
  }, [activeFeature, showIntro, consentPrefs?.analytics]);

  // Lightweight delegated touch feedback for mobile/pen taps and interactive glass surfaces (never runs for mouse)
  useEffect(() => {
    let activeTapEl: HTMLElement | null = null;
    let startX = 0;
    let startY = 0;

    let activeGlassEl: HTMLElement | null = null;
    let activeGlassPointerId: number | null = null;
    let glassRafId = 0;
    let glassClientX = 0;
    let glassClientY = 0;

    const clearTap = () => {
      if (activeTapEl) {
        activeTapEl.removeAttribute('data-tap');
        activeTapEl = null;
      }
    };

    const updateGlassTouch = () => {
      glassRafId = 0;
      const el = activeGlassEl;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      const px = Math.min(1, Math.max(0, (glassClientX - rect.left) / rect.width));
      const py = Math.min(1, Math.max(0, (glassClientY - rect.top) / rect.height));
      const rotateY = (px - 0.5) * 5.2;
      const rotateX = (0.5 - py) * 5.2;

      el.style.setProperty('--glass-tx', `${(px * 100).toFixed(1)}%`);
      el.style.setProperty('--glass-ty', `${(py * 100).toFixed(1)}%`);
      el.style.setProperty('--glass-rx', `${rotateX.toFixed(2)}deg`);
      el.style.setProperty('--glass-ry', `${rotateY.toFixed(2)}deg`);
      el.setAttribute('data-glass-touch', 'true');
    };

    const clearGlassTouch = () => {
      if (glassRafId) {
        window.cancelAnimationFrame(glassRafId);
        glassRafId = 0;
      }
      if (activeGlassEl) {
        const el = activeGlassEl;
        el.removeAttribute('data-glass-touch');
        el.style.removeProperty('--glass-rx');
        el.style.removeProperty('--glass-ry');
        activeGlassEl = null;
      }
      activeGlassPointerId = null;
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') return;

      const rawTarget = e.target instanceof Element ? e.target : null;
      if (rawTarget) {
        const tapTarget = rawTarget.closest('.touch-press');
        if (
          tapTarget instanceof HTMLElement &&
          !tapTarget.hasAttribute('disabled') &&
          tapTarget.getAttribute('aria-disabled') !== 'true'
        ) {
          clearTap();
          activeTapEl = tapTarget;
          startX = e.clientX;
          startY = e.clientY;
          tapTarget.setAttribute('data-tap', 'true');
        }

        // Handle interactive glass surfaces that are not already managed by TiltCard
        const glassTarget = rawTarget.closest('.glass-interactive');
        if (
          glassTarget instanceof HTMLElement &&
          !glassTarget.closest('[data-tilt-card="true"]')
        ) {
          clearGlassTouch();
          activeGlassEl = glassTarget;
          activeGlassPointerId = e.pointerId;
          glassClientX = e.clientX;
          glassClientY = e.clientY;
          if (glassRafId) {
            window.cancelAnimationFrame(glassRafId);
            glassRafId = 0;
          }
          updateGlassTouch();
        }
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') return;

      if (activeTapEl && Math.hypot(e.clientX - startX, e.clientY - startY) > 8) {
        clearTap();
      }

      if (
        activeGlassEl &&
        (activeGlassPointerId === null || e.pointerId === activeGlassPointerId)
      ) {
        glassClientX = e.clientX;
        glassClientY = e.clientY;
        if (!glassRafId) {
          glassRafId = window.requestAnimationFrame(updateGlassTouch);
        }
      }
    };

    const handleReleaseAll = () => {
      clearTap();
      clearGlassTouch();
    };

    const noopTouch = () => {};

    document.addEventListener('touchstart', noopTouch, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerup', handleReleaseAll, { passive: true });
    window.addEventListener('pointercancel', handleReleaseAll, { passive: true });
    window.addEventListener('scroll', clearGlassTouch, { capture: true, passive: true });
    window.addEventListener('blur', handleReleaseAll);

    return () => {
      handleReleaseAll();
      document.removeEventListener('touchstart', noopTouch);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handleReleaseAll);
      window.removeEventListener('pointercancel', handleReleaseAll);
      window.removeEventListener('scroll', clearGlassTouch, { capture: true });
      window.removeEventListener('blur', handleReleaseAll);
    };
  }, []);

  // Website-wide synchronized glass click ripples, press feedback & futuristic sound effects
  useEffect(() => {
    let lastEnteredGlass: Element | null = null;
    let pressedEl: HTMLElement | null = null;

    const clearPressed = () => {
      if (pressedEl) {
        pressedEl.classList.remove('pearl-pressed');
        pressedEl = null;
      }
    };

    const handleGlobalPointerDown = (e: PointerEvent) => {
      if (showIntroRef.current) {
        soundEffects.unlockFromGesture();
        return;
      }

      const target = e.target instanceof Element ? e.target : null;
      if (!target) {
        soundEffects.unlockFromGesture();
        return;
      }

      const interactive = target.closest(
        'button, a[href], [role="button"], label[for]'
      );
      if (interactive instanceof HTMLElement) {
        if (
          interactive.hasAttribute('disabled') ||
          interactive.getAttribute('aria-disabled') === 'true'
        ) {
          return;
        }

        clearPressed();
        pressedEl = interactive;
        interactive.classList.add('pearl-pressed');
        triggerGlassRipple(interactive, e.clientX, e.clientY);

        if (!interactive.closest('[data-sfx="custom"], [data-sfx="none"]')) {
          soundEffects.playClick();
        } else {
          soundEffects.unlockFromGesture();
        }
        return;
      }

      soundEffects.unlockFromGesture();
      if (e.pointerType !== 'mouse') {
        const customOrMuted = target.closest('[data-sfx="custom"], [data-sfx="none"]');
        if (customOrMuted) return;
        const glassEl = target.closest('.glass-interactive, [data-tilt-card="true"]');
        if (glassEl) {
          triggerGlassRipple(glassEl, e.clientX, e.clientY);
          soundEffects.playGlassInteract();
        }
      }
    };

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (showIntroRef.current || e.repeat) return;
      if (e.key !== 'Enter' && e.key !== ' ') return;

      const target = e.target instanceof Element ? e.target : null;
      if (!target) return;

      if (
        target.matches('input, textarea, select, [contenteditable="true"]') &&
        e.key === ' '
      ) {
        return;
      }

      const interactive = target.closest('button, a[href], [role="button"]');
      if (interactive instanceof HTMLElement) {
        if (
          interactive.hasAttribute('disabled') ||
          interactive.getAttribute('aria-disabled') === 'true'
        ) {
          return;
        }
        triggerGlassRipple(interactive);
        if (!interactive.closest('[data-sfx="custom"], [data-sfx="none"]')) {
          soundEffects.playClick();
        } else {
          soundEffects.unlockFromGesture();
        }
      }
    };

    const handleGlobalPointerOver = (e: PointerEvent) => {
      if (showIntroRef.current || e.pointerType !== 'mouse') return;
      const target = e.target instanceof Element ? e.target : null;
      const glassEl = target?.closest('.glass-interactive, [data-tilt-card="true"]') ?? null;
      if (glassEl === lastEnteredGlass) return;
      lastEnteredGlass = glassEl;
      if (glassEl) {
        soundEffects.playGlassInteract();
      }
    };

    window.addEventListener('pointerdown', handleGlobalPointerDown, { capture: true, passive: true });
    window.addEventListener('pointerup', clearPressed, { passive: true });
    window.addEventListener('pointercancel', clearPressed, { passive: true });
    window.addEventListener('blur', clearPressed);
    window.addEventListener('keydown', handleGlobalKeyDown, { capture: true, passive: true });
    window.addEventListener('pointerover', handleGlobalPointerOver, { passive: true });

    return () => {
      clearPressed();
      window.removeEventListener('pointerdown', handleGlobalPointerDown, { capture: true });
      window.removeEventListener('pointerup', clearPressed);
      window.removeEventListener('pointercancel', clearPressed);
      window.removeEventListener('blur', clearPressed);
      window.removeEventListener('keydown', handleGlobalKeyDown, { capture: true });
      window.removeEventListener('pointerover', handleGlobalPointerOver);
    };
  }, []);

  const navigateToFeature = useCallback((feature: FeatureId) => {
    setActiveFeature((current) => {
      if (current !== feature && current !== 'notFound') {
        previousFeatureRef.current = current;
      }
      if (current !== feature && !showIntroRef.current) {
        soundEffects.playNavigate();
      }
      return feature;
    });
    if (typeof window !== 'undefined' && feature !== 'notFound') {
      const nextPath = FEATURE_PATHS[feature] ?? '/';
      if (window.location.pathname !== nextPath || window.location.hash) {
        try {
          window.history.pushState(null, '', nextPath);
        } catch {
          window.location.hash = `#${feature}`;
        }
      }
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, []);

  const returnToPreviousView = useCallback(() => {
    const target =
      previousFeatureRef.current && previousFeatureRef.current !== 'portfolioPdf'
        ? previousFeatureRef.current
        : 'overview';
    navigateToFeature(target);
  }, [navigateToFeature]);

  const allItems = INITIAL_PORTFOLIO_ITEMS;

  const achievementsList = useMemo(
    () => allItems.filter((item) => item.category === 'Achievements'),
    [allItems]
  );

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative flex min-h-dvh w-full flex-col overflow-x-clip bg-[#071B1B] text-[#FFFFFF]">
        {/* Pre-renders static starfield behind opaque portal veil, resumes smoothly once portal opens */}
        <ParticleBackground paused={showIntro} />
        <CursorGlow disabled={showIntro} />

        <IntroLoader
          isVisible={showIntro}
          targetShellRef={shellRef}
          onComplete={handleIntroComplete}
        />

        {/* Kept at full opacity behind IntroLoader's opaque veil so GPU GlassCards & fonts pre-warm at t=0 */}
        <div
          ref={shellRef}
          className={
            showIntro
              ? 'intro-active pointer-events-none flex flex-1 flex-col select-none'
              : 'flex flex-1 flex-col'
          }
          style={
            showIntro
              ? { transform: 'scale(0.94)', willChange: 'transform' }
              : undefined
          }
          aria-hidden={showIntro ? true : undefined}
          inert={showIntro ? true : undefined}
        >
          <Header
            activeFeature={activeFeature}
            onSelectFeature={navigateToFeature}
            isAboutOpen={aboutCardOpen}
            onOpenAboutCard={openAboutCard}
          />

          <main className="relative z-10 flex min-w-0 flex-1 flex-col overflow-x-clip">
            <CinematicTransition
              routeKey={activeFeature}
              introActive={showIntro}
              className="flex flex-1 flex-col"
            >
              <LazyErrorBoundary resetKey={activeFeature}>
                <Suspense fallback={<div className="flex-1" aria-hidden="true" />}>
                  {activeFeature === 'overview' && (
                    <OverviewView onNavigateFeature={navigateToFeature} />
                  )}

                  {activeFeature === 'achievements' && (
                    <AchievementsView
                      achievements={achievementsList}
                      onSelectItem={(item) => {
                        soundEffects.playModalOpen();
                        setSelectedItem(item);
                      }}
                    />
                  )}

                  {activeFeature === 'skills' && <SkillsView />}

                  {activeFeature === 'certifications' && <CertificationsView />}

                  {activeFeature === 'education' && <EducationView />}

                  {activeFeature === 'projects' && (
                    <ProjectsView onNavigateFeature={navigateToFeature} />
                  )}

                  {activeFeature === 'resume' && <ResumeView />}

                  {activeFeature === 'portfolioPdf' && (
                    <PortfolioPdfView onReturnPreviousView={returnToPreviousView} />
                  )}

                  {activeFeature === 'contact' && <ContactView />}

                  {activeFeature === 'privacy' && (
                    <PrivacyPolicyView onNavigateFeature={navigateToFeature} />
                  )}

                  {activeFeature === 'terms' && (
                    <TermsView onNavigateFeature={navigateToFeature} />
                  )}

                  {activeFeature === 'notFound' && (
                    <NotFoundView onNavigateFeature={navigateToFeature} />
                  )}
                </Suspense>
              </LazyErrorBoundary>
            </CinematicTransition>
          </main>

          <SiteFooter
            activeFeature={activeFeature}
            onNavigateFeature={navigateToFeature}
          />
        </div>

        <LazyErrorBoundary silentFallback>
          <Suspense fallback={null}>
            <ProjectLightbox
              item={selectedItem}
              onClose={() => {
                soundEffects.playModalClose();
                setSelectedItem(null);
              }}
            />

            {aboutCardOpen && (
              <AboutMeHighlightModal
                isOpen={aboutCardOpen}
                onClose={closeAboutCard}
              />
            )}

            {!showIntro && <PortfolioChatbot />}
          </Suspense>
        </LazyErrorBoundary>

        {!showIntro && (
          <CookieConsentBanner
            onNavigateFeature={navigateToFeature}
            onConsentChange={(prefs) => setConsentPrefs(prefs)}
          />
        )}
      </div>
    </MotionConfig>
  );
}
