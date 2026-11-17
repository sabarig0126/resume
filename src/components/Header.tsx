import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, Menu, X } from 'lucide-react';
import { PROFILE } from '../data/projects';
import { FeatureId } from '../types/portfolio';

export interface MenuFeatureItem {
  id: FeatureId;
  number: string;
  label: string;
}

export const MENU_FEATURES: MenuFeatureItem[] = [
  { id: 'overview', number: '01', label: 'Overview' },
  { id: 'achievements', number: '02', label: 'Achievements' },
  { id: 'skills', number: '03', label: 'Technical Skills' },
  { id: 'certifications', number: '04', label: 'Certifications' },
  { id: 'education', number: '05', label: 'Education' },
  { id: 'projects', number: '06', label: 'Projects' },
  { id: 'resume', number: '07', label: 'Resume PDF' },
  { id: 'portfolioPdf', number: '08', label: 'Portfolio PDF' },
  { id: 'contact', number: '09', label: 'Contact' },
];

interface HeaderProps {
  activeFeature: FeatureId;
  onSelectFeature: (feature: FeatureId) => void;
}

export function Header({ activeFeature, onSelectFeature }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const currentFeature =
    MENU_FEATURES.find((f) => f.id === activeFeature) ?? MENU_FEATURES[0];

  useEffect(() => {
    setMenuOpen(false);
  }, [activeFeature]);

  useEffect(() => {
    if (!menuOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen]);

  const handleChooseFeature = (id: FeatureId) => {
    onSelectFeature(id);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#050A18]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-6 px-6 py-3.5 sm:py-4 md:px-10">
          {/* Left: Wordmark + Active Feature Context */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => handleChooseFeature('overview')}
              className="touch-press inline-flex min-h-[44px] sm:min-h-0 items-center font-display text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 cursor-pointer hover:text-blue-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm"
            >
              {PROFILE.name}
            </button>
            <span
              aria-hidden="true"
              className="text-slate-600 hidden sm:inline"
            >
              /
            </span>
            <span className="hidden sm:inline truncate text-xs font-medium text-blue-300">
              {currentFeature.label}
            </span>
          </div>

          {/* Right: Single Menu Button */}
          <div className="shrink-0">
            <motion.button
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={() => setMenuOpen(true)}
              aria-expanded={menuOpen}
              aria-controls="top-right-feature-menu"
              className="touch-press inline-flex min-h-[44px] sm:min-h-[40px] items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-xs font-semibold text-white hover:border-cyan-400/60 hover:bg-[#2563EB] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            >
              <Menu className="h-4 w-4" />
              <span>Menu</span>
            </motion.button>
          </div>
        </div>
      </header>

      {/* Full-Window Blur Backdrop & Animated Menu Overlay */}
      <AnimatePresence>
        {menuOpen && (
          <div className="fixed inset-0 z-50">
            {/* Full-viewport blurred backdrop behind all menu options */}
            <motion.div
              aria-hidden="true"
              onClick={() => setMenuOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-0 bg-[#040814]/70 backdrop-blur-xl cursor-pointer"
            />

            {/* Aligned Overlay Layer */}
            <div className="pointer-events-none relative z-10 mx-auto max-w-[1280px] px-6 py-3.5 sm:py-4 md:px-10">
              {/* Top-Right Close Button aligned with Header Menu button */}
              <div className="flex justify-end">
                <motion.button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  aria-label="Close menu"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
                  className="touch-press pointer-events-auto inline-flex min-h-[44px] sm:min-h-[40px] items-center gap-2 rounded-lg border border-blue-400 bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white shadow-lg hover:bg-blue-500 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
                >
                  <X className="h-4 w-4" />
                  <span>Close</span>
                </motion.button>
              </div>

              {/* Animated Glass Menu Panel */}
              <div className="mt-3 flex justify-end">
                <motion.nav
                  id="top-right-feature-menu"
                  aria-label="Portfolio sections menu"
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                  className="glass-surface-strong pointer-events-auto max-h-[calc(100dvh-6rem)] w-full max-w-sm overflow-y-auto overscroll-contain rounded-2xl p-2.5"
                >
                  <div className="border-b border-white/10 px-3 py-2.5">
                    <p className="text-xs font-semibold text-slate-400">
                      Portfolio Sections
                    </p>
                  </div>

                  <ul className="mt-1.5 space-y-1">
                    {MENU_FEATURES.map((item) => {
                      const isActive = activeFeature === item.id;
                      return (
                        <li key={item.id}>
                          <button
                            type="button"
                            onClick={() => handleChooseFeature(item.id)}
                            aria-current={isActive ? 'page' : undefined}
                            className={`touch-press group flex min-h-[48px] sm:min-h-[44px] w-full items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                              isActive
                                ? 'bg-[#2563EB] text-white shadow-md shadow-blue-900/40'
                                : 'text-slate-200 hover:bg-white/10 hover:text-white'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span
                                className={`font-mono text-xs tabular-nums ${
                                  isActive ? 'text-blue-100' : 'text-amber-400'
                                }`}
                              >
                                {item.number}
                              </span>
                              <div className="min-w-0">
                                <div className="font-display text-sm font-bold leading-tight">
                                  {item.label}
                                </div>
                              </div>
                            </div>

                            <ArrowRight
                              className={`h-4 w-4 shrink-0 transition-transform ${
                                isActive
                                  ? 'text-white'
                                  : 'text-slate-400 group-hover:translate-x-0.5 group-hover:text-cyan-300'
                              }`}
                            />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </motion.nav>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
