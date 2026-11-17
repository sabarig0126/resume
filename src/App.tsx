import { useCallback, useEffect, useMemo, useState } from 'react';
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
  const raw = window.location.hash.replace(/^#/, '') as FeatureId;
  return VALID_FEATURES.has(raw) ? raw : 'overview';
}

export default function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [activeFeature, setActiveFeature] = useState<FeatureId>(readFeatureFromHash);
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);

  const INTRO_DURATION_MS = 3600;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setShowIntro(false);
    }, INTRO_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, []);

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
    }
  }, []);

  const allItems = INITIAL_PORTFOLIO_ITEMS;

  const achievementsList = useMemo(
    () => allItems.filter((item) => item.category === 'Achievements'),
    [allItems]
  );

  const certificationsList = useMemo(
    () => allItems.filter((item) => item.category === 'Certifications'),
    [allItems]
  );

  const activeLightboxPool = useMemo(() => {
    if (activeFeature === 'achievements') return achievementsList;
    if (activeFeature === 'certifications') return certificationsList;
    return allItems;
  }, [activeFeature, achievementsList, certificationsList, allItems]);

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative flex min-h-screen flex-col bg-[#050A18] text-slate-50">
        <ParticleBackground paused={showIntro} />
        <CursorGlow disabled={showIntro} />

        <IntroLoader
          isVisible={showIntro}
          durationMs={INTRO_DURATION_MS}
        />

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

        <ProjectLightbox
          item={selectedItem}
          items={activeLightboxPool}
          onClose={() => setSelectedItem(null)}
          onNavigate={(item) => setSelectedItem(item)}
        />
      </div>
    </MotionConfig>
  );
}
