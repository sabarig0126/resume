import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MotionConfig } from 'motion/react';
import { CinematicTransition } from './components/CinematicTransition';
import { CursorGlow } from './components/CursorGlow';
import { Header } from './components/Header';
import { IntroLoader } from './components/IntroLoader';
import { ParticleBackground } from './components/ParticleBackground';
import { ProjectLightbox } from './components/ProjectLightbox';
import { AchievementsView } from './components/views/AchievementsView';
import { CertificationsView } from './components/views/CertificationsView';
import { ContactView } from './components/views/ContactView';
import { EducationView } from './components/views/EducationView';
import { OverviewView } from './components/views/OverviewView';
import { PortfolioPdfView } from './components/views/PortfolioPdfView';
import { ProjectsView } from './components/views/ProjectsView';
import { ResumeView } from './components/views/ResumeView';
import { SkillsView } from './components/views/SkillsView';
import { INITIAL_PORTFOLIO_ITEMS } from './data/projects';
import { FeatureId, PortfolioItem } from './types/portfolio';

const VALID_FEATURES: ReadonlySet<FeatureId> = new Set<FeatureId>([
  'overview',
  'achievements',
  'skills',
  'certifications',
  'education',
  'projects',
  'resume',
  'portfolioPdf',
  'contact',
]);

function readFeatureFromHash(): FeatureId {
  if (typeof window === 'undefined') return 'overview';
  const raw = window.location.hash.replace(/^#\/?/, '').trim() as FeatureId;
  return VALID_FEATURES.has(raw) ? raw : 'overview';
}

export default function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [activeFeature, setActiveFeature] = useState<FeatureId>(readFeatureFromHash);
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
  const shellRef = useRef<HTMLDivElement | null>(null);

  const handleIntroComplete = useCallback(() => {
    setShowIntro(false);
  }, []);

  useEffect(() => {
    if (!showIntro) return;
    // Outer hard fail-safe so the main portfolio is never blocked indefinitely
    const outerFailSafe = window.setTimeout(() => {
      setShowIntro(false);
    }, 5000);

    return () => {
      window.clearTimeout(outerFailSafe);
    };
  }, [showIntro]);

  // Support browser back/forward navigation cleanly via URL hash
  useEffect(() => {
    const handleHashOrPop = () => {
      setActiveFeature(readFeatureFromHash());
    };
    window.addEventListener('hashchange', handleHashOrPop);
    window.addEventListener('popstate', handleHashOrPop);
    return () => {
      window.removeEventListener('hashchange', handleHashOrPop);
      window.removeEventListener('popstate', handleHashOrPop);
    };
  }, []);

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
    setActiveFeature(feature);
    if (typeof window !== 'undefined') {
      const nextHash = `#${feature}`;
      if (window.location.hash !== nextHash) {
        try {
          window.history.pushState(null, '', nextHash);
        } catch {
          window.location.hash = nextHash;
        }
      }
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, []);

  const allItems = INITIAL_PORTFOLIO_ITEMS;

  const achievementsList = useMemo(
    () => allItems.filter((item) => item.category === 'Achievements'),
    [allItems]
  );

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative flex min-h-screen flex-col bg-[#071B1B] text-[#FFFFFF]">
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
          />

          <main className="relative z-10 flex-1">
            <CinematicTransition routeKey={activeFeature}>
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

              {activeFeature === 'portfolioPdf' && <PortfolioPdfView />}

              {activeFeature === 'contact' && <ContactView />}
            </CinematicTransition>
          </main>
        </div>

        <ProjectLightbox
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      </div>
    </MotionConfig>
  );
}
