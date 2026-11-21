import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowRightIcon,
  AwardIcon,
  CloseIcon,
  CpuIcon,
  EducationIcon,
  FileDossierIcon,
  LayersDeckIcon,
  MenuGridIcon,
  NextGenIconComponent,
  OverviewIcon,
  RocketIcon,
  SendVectorIcon,
  TrophyIcon,
} from './NextGenIcons';
import { FeatureId } from '../types/portfolio';

export interface MenuFeatureItem {
  id: FeatureId;
  number: string;
  label: string;
  icon: NextGenIconComponent;
  badgeStyle: string;
  hoverStyle: string;
  iconColor: string;
  iconHoverMotion: string;
  activeIconGlow: string;
}

const PINK_BADGE =
  'border-[#F05BEA]/30 bg-gradient-to-br from-[#F05BEA]/20 via-white/[0.04] to-transparent';
const PINK_HOVER =
  'group-hover:border-[#F05BEA]/65 group-hover:shadow-[0_0_14px_-2px_rgba(240,91,234,0.48)]';
const LIME_BADGE =
  'border-[#C8FF27]/30 bg-gradient-to-br from-[#C8FF27]/18 via-white/[0.04] to-transparent';
const LIME_HOVER =
  'group-hover:border-[#C8FF27]/65 group-hover:shadow-[0_0_14px_-2px_rgba(200,255,39,0.45)]';

export const MENU_FEATURES: MenuFeatureItem[] = [
  {
    id: 'overview',
    number: '01',
    label: 'Overview',
    icon: OverviewIcon,
    badgeStyle: PINK_BADGE,
    hoverStyle: PINK_HOVER,
    iconColor: 'text-[#F05BEA]',
    iconHoverMotion: 'group-hover:rotate-12 group-hover:scale-110',
    activeIconGlow: 'drop-shadow-[0_0_8px_rgba(240,91,234,0.85)]',
  },
  {
    id: 'achievements',
    number: '02',
    label: 'Achievements',
    icon: TrophyIcon,
    badgeStyle: LIME_BADGE,
    hoverStyle: LIME_HOVER,
    iconColor: 'text-[#C8FF27]',
    iconHoverMotion: 'group-hover:-translate-y-0.5 group-hover:scale-110',
    activeIconGlow: 'drop-shadow-[0_0_8px_rgba(240,91,234,0.85)]',
  },
  {
    id: 'skills',
    number: '03',
    label: 'Technical Skills',
    icon: CpuIcon,
    badgeStyle: PINK_BADGE,
    hoverStyle: PINK_HOVER,
    iconColor: 'text-[#F05BEA]',
    iconHoverMotion: 'group-hover:-rotate-6 group-hover:scale-110',
    activeIconGlow: 'drop-shadow-[0_0_8px_rgba(240,91,234,0.85)]',
  },
  {
    id: 'certifications',
    number: '04',
    label: 'Certifications',
    icon: AwardIcon,
    badgeStyle: LIME_BADGE,
    hoverStyle: LIME_HOVER,
    iconColor: 'text-[#C8FF27]',
    iconHoverMotion: 'group-hover:rotate-6 group-hover:scale-110',
    activeIconGlow: 'drop-shadow-[0_0_8px_rgba(240,91,234,0.85)]',
  },
  {
    id: 'education',
    number: '05',
    label: 'Education',
    icon: EducationIcon,
    badgeStyle: PINK_BADGE,
    hoverStyle: PINK_HOVER,
    iconColor: 'text-[#F05BEA]',
    iconHoverMotion: 'group-hover:-translate-y-0.5 group-hover:-rotate-6 group-hover:scale-105',
    activeIconGlow: 'drop-shadow-[0_0_8px_rgba(240,91,234,0.85)]',
  },
  {
    id: 'projects',
    number: '06',
    label: 'Projects',
    icon: RocketIcon,
    badgeStyle: LIME_BADGE,
    hoverStyle: LIME_HOVER,
    iconColor: 'text-[#C8FF27]',
    iconHoverMotion: 'group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:scale-110',
    activeIconGlow: 'drop-shadow-[0_0_8px_rgba(240,91,234,0.85)]',
  },
  {
    id: 'resume',
    number: '07',
    label: 'Resume PDF',
    icon: FileDossierIcon,
    badgeStyle: PINK_BADGE,
    hoverStyle: PINK_HOVER,
    iconColor: 'text-[#F05BEA]',
    iconHoverMotion: 'group-hover:-rotate-6 group-hover:scale-105',
    activeIconGlow: 'drop-shadow-[0_0_8px_rgba(240,91,234,0.85)]',
  },
  {
    id: 'portfolioPdf',
    number: '08',
    label: 'Portfolio PDF',
    icon: LayersDeckIcon,
    badgeStyle: LIME_BADGE,
    hoverStyle: LIME_HOVER,
    iconColor: 'text-[#C8FF27]',
    iconHoverMotion: 'group-hover:rotate-3 group-hover:scale-110',
    activeIconGlow: 'drop-shadow-[0_0_8px_rgba(240,91,234,0.85)]',
  },
  {
    id: 'contact',
    number: '09',
    label: 'Contact',
    icon: SendVectorIcon,
    badgeStyle: PINK_BADGE,
    hoverStyle: PINK_HOVER,
    iconColor: 'text-[#F05BEA]',
    iconHoverMotion: 'group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:scale-105',
    activeIconGlow: 'drop-shadow-[0_0_8px_rgba(240,91,234,0.85)]',
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
  const menuDialogRef = useRef<HTMLDivElement | null>(null);
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
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    const focusTimer = window.requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        return;
      }
      if (e.key === 'Tab' && menuDialogRef.current) {
        const focusables = Array.from(
          menuDialogRef.current.querySelectorAll<HTMLElement>(
            'button:not(:disabled), [href], [tabindex]:not([tabindex="-1"])'
          )
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.cancelAnimationFrame(focusTimer);
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
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
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#071B1B]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-6 px-6 py-3.5 sm:py-4 md:px-10">
          {/* Left: Active Feature Context */}
          <div className="flex items-center gap-2.5 min-w-0">
            <span
              aria-hidden="true"
              className="hidden sm:inline-block h-2 w-2 shrink-0 rounded-full bg-[#F05BEA] shadow-[0_0_8px_rgba(240,91,234,0.85)]"
            />
            <span className="hidden sm:inline truncate font-kalam text-sm font-normal text-[#FFFFFF]">
              {currentFeature.label}
            </span>
          </div>

          {/* Right: Primary Navigation CTA (Neon Lime + Deep Teal Text) */}
          <div className="shrink-0">
            <motion.button
              ref={menuButtonRef}
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={() => setMenuOpen(true)}
              aria-expanded={menuOpen}
              aria-controls="top-right-feature-menu"
              className="touch-press inline-flex min-h-[44px] sm:min-h-[40px] items-center gap-2 rounded-lg border border-[#C8FF27] bg-[#C8FF27] px-4 py-2 text-xs font-bold text-[#071B1B] shadow-[0_0_20px_-4px_rgba(200,255,39,0.5)] transition-all duration-200 hover:border-[#F05BEA] hover:bg-[#d5ff57] hover:shadow-[0_0_24px_-2px_rgba(240,91,234,0.55)] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F05BEA]"
            >
              <MenuGridIcon className="h-4 w-4 text-[#071B1B]" />
              <span>Menu</span>
            </motion.button>
          </div>
        </div>
      </header>

      {/* Full-Window Blur Backdrop & Animated Menu Overlay */}
      <AnimatePresence>
        {menuOpen && (
          <div
            ref={menuDialogRef}
            role="dialog"
            aria-modal="true"
            aria-label="Portfolio navigation menu"
            className="fixed inset-0 z-50"
          >
            {/* Full-viewport blurred backdrop behind all menu options */}
            <motion.div
              aria-hidden="true"
              onClick={() => setMenuOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-0 bg-[#041111]/75 backdrop-blur-xl cursor-pointer"
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
                  className="touch-press pointer-events-auto inline-flex min-h-[44px] sm:min-h-[40px] items-center gap-2 rounded-lg border border-[#F05BEA]/70 bg-[#F05BEA] px-4 py-2 text-xs font-bold text-[#071B1B] shadow-[0_0_22px_-3px_rgba(240,91,234,0.6)] transition-all duration-200 hover:border-[#C8FF27] hover:bg-[#C8FF27] hover:text-[#071B1B] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8FF27]"
                >
                  <CloseIcon className="h-4 w-4" />
                  <span>Close</span>
                </motion.button>
              </div>

              {/* Animated Liquid Glass Menu Panel */}
              <div className="mt-3 flex justify-end">
                <motion.nav
                  id="top-right-feature-menu"
                  aria-label="Portfolio sections menu"
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                  className="glass-surface-strong glass-accent-pink pointer-events-auto flex max-h-[calc(100dvh-6rem)] w-full max-w-sm flex-col overflow-hidden rounded-2xl p-2.5"
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
                              className={`touch-press group relative flex min-h-[48px] sm:min-h-[44px] w-full items-center justify-between gap-3 rounded-xl border px-3 py-2 text-left transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8FF27] ${
                                isActive
                                  ? 'border-[#F05BEA]/65 bg-gradient-to-r from-[#F05BEA]/22 via-[#F05BEA]/10 to-white/[0.04] text-[#FFFFFF] shadow-[0_10px_26px_-10px_rgba(240,91,234,0.48),inset_0_1px_0_rgba(255,255,255,0.16)]'
                                  : 'border-transparent text-[#A0B2B2] hover:border-white/10 hover:bg-white/[0.04] hover:text-[#FFFFFF]'
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <span
                                  className={`w-5 shrink-0 font-kalam text-xs tabular-nums transition-colors duration-200 ${
                                    isActive
                                      ? 'text-[#C8FF27] font-bold'
                                      : 'text-[#A0B2B2] group-hover:text-[#F05BEA]'
                                  }`}
                                >
                                  {item.number}
                                </span>

                                <span
                                  aria-hidden="true"
                                  className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border backdrop-blur-md transition-all duration-200 ${
                                    isActive
                                      ? 'scale-105 border-[#F05BEA]/70 bg-[#F05BEA]/20 shadow-[0_0_16px_-1px_rgba(240,91,234,0.6),inset_0_1px_0_rgba(255,255,255,0.24)]'
                                      : `${item.badgeStyle} ${item.hoverStyle} group-hover:scale-105`
                                  }`}
                                >
                                  <IconComponent
                                    className={`h-4 w-4 transition-transform duration-200 ${
                                      isActive
                                        ? `text-[#FFFFFF] ${item.activeIconGlow}`
                                        : `${item.iconColor} ${item.iconHoverMotion}`
                                    }`}
                                  />
                                </span>

                                <div className="min-w-0">
                                  <div className="truncate font-kalam text-sm font-bold leading-tight text-[#FFFFFF]">
                                    {item.label}
                                  </div>
                                </div>
                              </div>

                              <ArrowRightIcon
                                className={`h-4 w-4 shrink-0 transition-all duration-200 ${
                                  isActive
                                    ? 'translate-x-0.5 text-[#C8FF27]'
                                    : 'text-[#A0B2B2] group-hover:translate-x-1 group-hover:text-[#F05BEA]'
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
