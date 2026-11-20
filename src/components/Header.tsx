import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowRight,
  Award,
  Compass,
  Cpu,
  FileText,
  GraduationCap,
  Layers,
  LucideIcon,
  Menu,
  Rocket,
  Send,
  Trophy,
  X,
} from 'lucide-react';
import { FeatureId } from '../types/portfolio';

export interface MenuFeatureItem {
  id: FeatureId;
  number: string;
  label: string;
  icon: LucideIcon;
  badgeStyle: string;
  hoverStyle: string;
  iconColor: string;
  iconHoverMotion: string;
  activeIconGlow: string;
}

export const MENU_FEATURES: MenuFeatureItem[] = [
  {
    id: 'overview',
    number: '01',
    label: 'Overview',
    icon: Compass,
    badgeStyle:
      'border-blue-400/25 bg-gradient-to-br from-blue-500/20 via-cyan-400/10 to-transparent',
    hoverStyle:
      'group-hover:border-cyan-300/55 group-hover:shadow-[0_0_14px_-2px_rgba(56,189,248,0.48)]',
    iconColor: 'text-cyan-300',
    iconHoverMotion: 'group-hover:rotate-12 group-hover:scale-110',
    activeIconGlow: 'drop-shadow-[0_0_8px_rgba(103,232,249,0.85)]',
  },
  {
    id: 'achievements',
    number: '02',
    label: 'Achievements',
    icon: Trophy,
    badgeStyle:
      'border-amber-400/30 bg-gradient-to-br from-amber-400/20 via-yellow-500/10 to-transparent',
    hoverStyle:
      'group-hover:border-amber-300/60 group-hover:shadow-[0_0_14px_-2px_rgba(251,191,36,0.48)]',
    iconColor: 'text-amber-300',
    iconHoverMotion: 'group-hover:-translate-y-0.5 group-hover:scale-110',
    activeIconGlow: 'drop-shadow-[0_0_8px_rgba(252,211,77,0.85)]',
  },
  {
    id: 'skills',
    number: '03',
    label: 'Technical Skills',
    icon: Cpu,
    badgeStyle:
      'border-cyan-400/25 bg-gradient-to-br from-cyan-400/20 via-blue-500/10 to-transparent',
    hoverStyle:
      'group-hover:border-cyan-300/60 group-hover:shadow-[0_0_14px_-2px_rgba(34,211,238,0.5)]',
    iconColor: 'text-cyan-300',
    iconHoverMotion: 'group-hover:-rotate-6 group-hover:scale-110',
    activeIconGlow: 'drop-shadow-[0_0_8px_rgba(34,211,238,0.85)]',
  },
  {
    id: 'certifications',
    number: '04',
    label: 'Certifications',
    icon: Award,
    badgeStyle:
      'border-violet-400/30 bg-gradient-to-br from-violet-500/22 via-fuchsia-500/10 to-transparent',
    hoverStyle:
      'group-hover:border-violet-300/60 group-hover:shadow-[0_0_14px_-2px_rgba(167,139,250,0.5)]',
    iconColor: 'text-violet-300',
    iconHoverMotion: 'group-hover:rotate-6 group-hover:scale-110',
    activeIconGlow: 'drop-shadow-[0_0_8px_rgba(196,181,253,0.85)]',
  },
  {
    id: 'education',
    number: '05',
    label: 'Education',
    icon: GraduationCap,
    badgeStyle:
      'border-blue-400/30 bg-gradient-to-br from-indigo-500/22 via-blue-500/10 to-transparent',
    hoverStyle:
      'group-hover:border-blue-300/60 group-hover:shadow-[0_0_14px_-2px_rgba(96,165,250,0.5)]',
    iconColor: 'text-blue-300',
    iconHoverMotion: 'group-hover:-translate-y-0.5 group-hover:-rotate-6 group-hover:scale-105',
    activeIconGlow: 'drop-shadow-[0_0_8px_rgba(147,197,253,0.85)]',
  },
  {
    id: 'projects',
    number: '06',
    label: 'Projects',
    icon: Rocket,
    badgeStyle:
      'border-cyan-400/25 bg-gradient-to-br from-cyan-500/20 via-violet-500/15 to-transparent',
    hoverStyle:
      'group-hover:border-violet-300/55 group-hover:shadow-[0_0_14px_-2px_rgba(56,189,248,0.45)]',
    iconColor: 'text-sky-300',
    iconHoverMotion: 'group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:scale-110',
    activeIconGlow: 'drop-shadow-[0_0_8px_rgba(125,211,252,0.85)]',
  },
  {
    id: 'resume',
    number: '07',
    label: 'Resume PDF',
    icon: FileText,
    badgeStyle:
      'border-yellow-400/25 bg-gradient-to-br from-yellow-400/20 via-amber-500/10 to-transparent',
    hoverStyle:
      'group-hover:border-yellow-300/55 group-hover:shadow-[0_0_14px_-2px_rgba(250,204,21,0.44)]',
    iconColor: 'text-yellow-300',
    iconHoverMotion: 'group-hover:-rotate-6 group-hover:scale-105',
    activeIconGlow: 'drop-shadow-[0_0_8px_rgba(253,224,71,0.85)]',
  },
  {
    id: 'portfolioPdf',
    number: '08',
    label: 'Portfolio PDF',
    icon: Layers,
    badgeStyle:
      'border-violet-400/30 bg-gradient-to-br from-violet-500/20 via-blue-500/15 to-transparent',
    hoverStyle:
      'group-hover:border-violet-300/60 group-hover:shadow-[0_0_14px_-2px_rgba(139,92,246,0.5)]',
    iconColor: 'text-violet-300',
    iconHoverMotion: 'group-hover:rotate-3 group-hover:scale-110',
    activeIconGlow: 'drop-shadow-[0_0_8px_rgba(196,181,253,0.85)]',
  },
  {
    id: 'contact',
    number: '09',
    label: 'Contact',
    icon: Send,
    badgeStyle:
      'border-cyan-400/30 bg-gradient-to-br from-blue-500/22 via-cyan-400/15 to-transparent',
    hoverStyle:
      'group-hover:border-cyan-300/60 group-hover:shadow-[0_0_14px_-2px_rgba(34,211,238,0.5)]',
    iconColor: 'text-cyan-300',
    iconHoverMotion: 'group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:scale-105',
    activeIconGlow: 'drop-shadow-[0_0_8px_rgba(103,232,249,0.85)]',
  },
];

interface HeaderProps {
  activeFeature: FeatureId;
  onSelectFeature: (feature: FeatureId) => void;
}

export function Header({ activeFeature, onSelectFeature }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const wasMenuOpenRef = useRef(false);

  const currentFeature =
    MENU_FEATURES.find((f) => f.id === activeFeature) ?? MENU_FEATURES[0];

  useEffect(() => {
    setMenuOpen(false);
  }, [activeFeature]);

  useEffect(() => {
    if (!menuOpen) {
      if (wasMenuOpenRef.current) {
        wasMenuOpenRef.current = false;
        menuButtonRef.current?.focus();
      }
      return;
    }

    wasMenuOpenRef.current = true;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusTimer = window.requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.cancelAnimationFrame(focusTimer);
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
          {/* Left: Active Feature Context */}
          <div className="flex items-center gap-3 min-w-0">
            <span className="hidden sm:inline truncate font-kalam text-sm font-normal text-blue-300">
              {currentFeature.label}
            </span>
          </div>

          {/* Right: Single Menu Button */}
          <div className="shrink-0">
            <motion.button
              ref={menuButtonRef}
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
                  ref={closeButtonRef}
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
                  className="glass-surface-strong glass-accent-blue pointer-events-auto flex max-h-[calc(100dvh-6rem)] w-full max-w-sm flex-col overflow-hidden rounded-2xl p-2.5"
                >
                  <div className="shrink-0 border-b border-white/10 px-3 py-2.5">
                    <p className="font-caveat text-sm font-normal tracking-wide text-[#FFFF00]">
                      Portfolio Sections
                    </p>
                  </div>

                  <div className="mt-1.5 min-h-0 flex-1 overflow-y-auto overscroll-contain">
                  <ul className="space-y-1">
                    {MENU_FEATURES.map((item, idx) => {
                      const isActive = activeFeature === item.id;
                      const IconComponent = item.icon;
                      return (
                        <motion.li
                          key={item.id}
                          initial={{ opacity: 0, x: 8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            duration: 0.18,
                            delay: idx * 0.018,
                            ease: [0.16, 1, 0.3, 1],
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => handleChooseFeature(item.id)}
                            aria-current={isActive ? 'page' : undefined}
                            className={`touch-press group relative flex min-h-[48px] sm:min-h-[44px] w-full items-center justify-between gap-3 rounded-xl border px-3 py-2 text-left transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                              isActive
                                ? 'border-cyan-300/40 bg-gradient-to-r from-[#2563EB] via-[#1D4ED8] to-[#1E3A8A] text-white shadow-[0_10px_26px_-8px_rgba(37,99,235,0.68),inset_0_1px_0_rgba(255,255,255,0.2)]'
                                : 'border-transparent text-slate-200 hover:border-white/10 hover:bg-white/[0.06] hover:text-white'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span
                                className={`w-5 shrink-0 font-kalam text-xs tabular-nums transition-colors duration-200 ${
                                  isActive
                                    ? 'text-cyan-200'
                                    : 'text-amber-400 group-hover:text-amber-300'
                                }`}
                              >
                                {item.number}
                              </span>

                              <span
                                aria-hidden="true"
                                className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border backdrop-blur-md transition-all duration-200 ${
                                  isActive
                                    ? 'scale-105 border-cyan-200/60 bg-white/15 shadow-[0_0_16px_-1px_rgba(56,189,248,0.68),inset_0_1px_0_rgba(255,255,255,0.3)]'
                                    : `${item.badgeStyle} ${item.hoverStyle} group-hover:scale-105`
                                }`}
                              >
                                <IconComponent
                                  className={`h-4 w-4 transition-transform duration-200 ${
                                    isActive
                                      ? `text-white ${item.activeIconGlow}`
                                      : `${item.iconColor} ${item.iconHoverMotion}`
                                  }`}
                                />
                              </span>

                              <div className="min-w-0">
                                <div className="truncate font-kalam text-sm font-bold leading-tight">
                                  {item.label}
                                </div>
                              </div>
                            </div>

                            <ArrowRight
                              className={`h-4 w-4 shrink-0 transition-all duration-200 ${
                                isActive
                                  ? 'translate-x-0.5 text-cyan-200'
                                  : 'text-slate-400 group-hover:translate-x-1 group-hover:text-cyan-300'
                              }`}
                            />
                          </button>
                        </motion.li>
                      );
                    })}
                  </ul>
                  </div>
                </motion.nav>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
