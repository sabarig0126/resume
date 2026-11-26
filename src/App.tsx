import {
  lazy,
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
import { FeatureId, PortfolioItem } from './types/portfolio';

// Code-split secondary views, modals, and assistant so initial overview payload loads swiftly
const AchievementsView = lazy(() =>
  import('./components/views/AchievementsView').then((m) => ({
    default: m.AchievementsView,
  }))
);
const SkillsView = lazy(() =>
  import('./components/views/SkillsView').then((m) => ({
    default: m.SkillsView,
  }))
);
const CertificationsView = lazy(() =>
  import('./components/views/CertificationsView').then((m) => ({
    default: m.CertificationsView,
  }))
);
const EducationView = lazy(() =>
  import('./components/views/EducationView').then((m) => ({
    default: m.EducationView,
  }))
);
const ProjectsView = lazy(() =>
  import('./components/views/ProjectsView').then((m) => ({
    default: m.ProjectsView,
  }))
);
const ResumeView = lazy(() =>
  import('./components/views/ResumeView').then((m) => ({
    default: m.ResumeView,
  }))
);
const PortfolioPdfView = lazy(() =>
  import('./components/views/PortfolioPdfView').then((m) => ({
    default: m.PortfolioPdfView,
  }))
);
const ContactView = lazy(() =>
  import('./components/views/ContactView').then((m) => ({
    default: m.ContactView,
  }))
);
const PrivacyPolicyView = lazy(() =>
  import('./components/views/PrivacyPolicyView').then((m) => ({
    default: m.PrivacyPolicyView,
  }))
);
const TermsView = lazy(() =>
  import('./components/views/TermsView').then((m) => ({
    default: m.TermsView,
  }))
);
const NotFoundView = lazy(() =>
  import('./components/views/NotFoundView').then((m) => ({
    default: m.NotFoundView,
  }))
);
const ProjectLightbox = lazy(() =>
  import('./components/ProjectLightbox').then((m) => ({
    default: m.ProjectLightbox,
  }))
);
const AboutMeHighlightModal = lazy(() =>
  import('./components/AboutMeHighlightModal').then((m) => ({
    default: m.AboutMeHighlightModal,
  }))
);
const PortfolioChatbot = lazy(() =>
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
    setAboutCardOpen(true);
  }, []);

  const closeAboutCard = useCallback(() => {
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

  // Update SEO metadata + consent-gated analytics page view on navigation
  useEffect(() => {
    updateFeatureSeo(activeFeature);
    if (!showIntro) {
      trackConsentAwarePageView(activeFeature, Boolean(consentPrefs?.analytics));
    }
  }, [activeFeature, showIntro, consentPrefs?.analytics]);

  // Lightweight delegated touch feedback for mobile/pen taps with instant release
  useEffect(() => {
    let activeTapEl: HTMLElement | null = null;
    let startX = 0;
    let startY = 0;

    const clearTap = () => {
      if (activeTapEl) {
        activeTapEl.removeAttribute('data-tap');
        activeTapEl = null;
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') return;
      const target = e.target instanceof Element ? e.target.closest('.touch-press') : null;
      if (!(target instanceof HTMLElement)) return;
      if (target.hasAttribute('disabled') || target.getAttribute('aria-disabled') === 'true') {
        return;
      }
      clearTap();
      activeTapEl = target;
      startX = e.clientX;
      startY = e.clientY;
      target.setAttribute('data-tap', 'true');
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!activeTapEl || e.pointerType === 'mouse') return;
      if (Math.hypot(e.clientX - startX, e.clientY - startY) > 8) {
        clearTap();
      }
    };

    const noopTouch = () => {};

    document.addEventListener('touchstart', noopTouch, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerup', clearTap, { passive: true });
    window.addEventListener('pointercancel', clearTap, { passive: true });
    window.addEventListener('blur', clearTap);

    return () => {
      clearTap();
      document.removeEventListener('touchstart', noopTouch);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', clearTap);
      window.removeEventListener('pointercancel', clearTap);
      window.removeEventListener('blur', clearTap);
    };
  }, []);

  const navigateToFeature = useCallback((feature: FeatureId) => {
    setActiveFeature((current) => {
      if (current !== feature && current !== 'notFound') {
        previousFeatureRef.current = current;
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
              <Suspense
                fallback={
                  <div className="flex flex-1 items-center justify-center p-12 font-kalam text-sm text-[#B8C7C7]">
                    Loading section...
                  </div>
                }
              >
                {activeFeature === 'overview' && (
                  <OverviewView onNavigateFeature={navigateToFeature} />
                )}

                {activeFeature === 'achievements' && (
                  <AchievementsView
                    achievements={achievementsList}
                    onSelectItem={(item) => setSelectedItem(item)}
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
            </CinematicTransition>
          </main>

          <SiteFooter
            activeFeature={activeFeature}
            onNavigateFeature={navigateToFeature}
          />
        </div>

        <Suspense fallback={null}>
          {selectedItem && (
            <ProjectLightbox
              item={selectedItem}
              onClose={() => setSelectedItem(null)}
            />
          )}

          {aboutCardOpen && (
            <AboutMeHighlightModal
              isOpen={aboutCardOpen}
              onClose={closeAboutCard}
            />
          )}

          {!showIntro && <PortfolioChatbot />}
        </Suspense>

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
