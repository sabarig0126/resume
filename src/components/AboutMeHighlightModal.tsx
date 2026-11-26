import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { PROFILE } from '../data/projects';
import {
  CloseIcon,
  CpuIcon,
  EducationIcon,
  GitHubOctoIcon,
  LinkedInModernIcon,
  MailEnvelopeIcon,
  RocketIcon,
  TrophyIcon,
} from './NextGenIcons';

interface AboutMeHighlightModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HIGHLIGHT_CARDS = [
  {
    id: 'education',
    title: 'Education',
    value: 'B.Tech AI & DS | 2nd Year',
    accent: 'text-[#C8FF27]',
    iconTone: 'text-[#C8FF27]',
    Icon: EducationIcon,
  },
  {
    id: 'skills',
    title: 'Technical Skills',
    value: 'Python, C, SQL, DBMS, MongoDB, MATLAB, Excel',
    accent: 'text-[#FFFFFF]/90',
    iconTone: 'text-[#F05BEA]',
    Icon: CpuIcon,
  },
  {
    id: 'achievements',
    title: 'Achievements',
    value: 'NPTEL Elite (63%), Smart India Hackathon (Internal Round), IIT Bombay Bootcamp, TEDxSRIT',
    accent: 'text-[#FFFFFF]/90',
    iconTone: 'text-[#C8FF27]',
    Icon: TrophyIcon,
  },
  {
    id: 'projects',
    title: 'Projects',
    value: 'Coming soon — no completed projects published yet.',
    accent: 'text-[#A0B2B2]',
    iconTone: 'text-[#F05BEA]',
    Icon: RocketIcon,
  },
] as const;

export function AboutMeHighlightModal({
  isOpen,
  onClose,
}: AboutMeHighlightModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    previousFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    const focusTimer = window.requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Tab' && dialogRef.current) {
        const focusables = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(
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
      window.removeEventListener('keydown', handleKeyDown);
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
      previousFocusRef.current?.focus?.();
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="about-highlight-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#041010]/80 p-3 backdrop-blur-md sm:p-6"
        >
          <motion.div
            ref={dialogRef}
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="glass-surface-strong glass-accent-pink relative flex max-h-[90dvh] w-full max-w-[740px] flex-col overflow-hidden rounded-2xl text-[#FFFFFF] shadow-[0_32px_80px_-18px_rgba(2,10,10,0.95),0_0_46px_-14px_rgba(240,91,234,0.34)]"
          >
            {/* Subtle Ambient Glow */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-[#F05BEA]/10 blur-3xl"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-[#C8FF27]/8 blur-3xl"
            />

            {/* Scrollable Body Containing Repositioned Hero Header, About Me & 2x2 Grid */}
            <div className="relative z-10 min-h-0 flex-1 overflow-y-auto overscroll-contain touch-pan-y px-4 pt-4 pb-4 sm:px-7 sm:pt-5 sm:pb-6">
              {/* Top Utility Row: Quiet Kicker + Close Button */}
              <div className="flex items-center justify-between gap-4">
                <p className="font-kalam text-xs tracking-[0.14em] text-[#C8FF27] uppercase">
                  Profile Highlight
                </p>

                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={onClose}
                  aria-label="Close About Me Highlight Card"
                  className="touch-press inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#F05BEA]/45 bg-[#071B1B]/85 text-[#FFFFFF] transition-colors duration-200 hover:border-[#C8FF27] hover:bg-[#C8FF27] hover:text-[#071B1B] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8FF27] sm:h-11 sm:w-11"
                >
                  <CloseIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Hero Identity Row: Enlarged App Logo Left + SABARIVASAN G Right */}
              <div className="mt-3 flex flex-row items-center gap-3.5 border-b border-white/10 pb-4 sm:mt-4 sm:gap-6 sm:pb-6">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-[#F05BEA]/45 bg-gradient-to-br from-[#082020]/95 via-[#071B1B]/95 to-[#051414]/95 shadow-[0_0_28px_-6px_rgba(240,91,234,0.48),inset_0_1px_0_rgba(255,255,255,0.2)] sm:h-24 sm:w-24 md:h-28 md:w-28">
                  <img
                    src="/assets/portal-logo.png"
                    alt="Sabarivasan G geometric portal emblem"
                    width={84}
                    height={84}
                    decoding="async"
                    draggable={false}
                    className="h-11 w-11 object-contain drop-shadow-[0_0_14px_rgba(34,211,238,0.6)] sm:h-16 sm:w-16 md:h-20 md:w-20"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <h2
                    id="about-highlight-title"
                    className="font-road-rage text-[1.75rem] font-normal tracking-[0.05em] text-[#FF4D4D] uppercase leading-none sm:text-4xl sm:tracking-[0.06em]"
                  >
                    SABARIVASAN G
                  </h2>
                  <p className="mt-1 font-kalam text-[13px] font-bold leading-snug text-[#FFFFFF]/90 sm:mt-1.5 sm:text-base">
                    {PROFILE.degree}
                  </p>
                  <p className="mt-0.5 font-kalam text-xs leading-snug text-[#A0B2B2] sm:text-sm">
                    {PROFILE.college} · {PROFILE.yearLabel}
                  </p>
                </div>
              </div>

              {/* Open About Me Section */}
              <section
                aria-labelledby="highlight-about-heading"
                className="mt-5"
              >
                <h3
                  id="highlight-about-heading"
                  className="font-caveat text-lg font-normal tracking-wide text-[#FFFF00]"
                >
                  About Me
                </h3>
                <p className="mt-1 font-kalam text-sm leading-relaxed text-[#FFFFFF]/90 sm:text-[15px]">
                  Second-year B.Tech AI &amp; Data Science student passionate about programming, data, and innovation.
                </p>
              </section>

              {/* 2x2 Highlight Cards Grid */}
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-3.5">
                {HIGHLIGHT_CARDS.map((card) => {
                  const CardIcon = card.Icon;
                  return (
                    <section
                      key={card.id}
                      aria-labelledby={`highlight-${card.id}-heading`}
                      className="rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-3 transition-colors duration-200 hover:border-white/20 sm:px-4 sm:py-3.5"
                    >
                      <CardIcon className={`h-4.5 w-4.5 ${card.iconTone}`} />
                      <h3
                        id={`highlight-${card.id}-heading`}
                        className="mt-2 font-caveat text-base font-normal tracking-wide text-[#FFFF00]"
                      >
                        {card.title}
                      </h3>
                      <p
                        className={`mt-1 font-kalam text-sm leading-snug ${card.accent}`}
                      >
                        {card.value}
                      </p>
                    </section>
                  );
                })}
              </div>
            </div>

            {/* Footer: Simple Decorative Social Icons Only (GitHub, LinkedIn, Email) */}
            <div className="relative z-10 flex shrink-0 items-center justify-center border-t border-white/10 bg-[#051414]/65 px-5 py-3.5 sm:px-7">
              <div
                aria-hidden="true"
                className="pointer-events-none flex select-none items-center gap-5 text-[#A0B2B2]"
              >
                <GitHubOctoIcon className="h-4.5 w-4.5 text-[#FFFFFF]/80" />
                <LinkedInModernIcon className="h-4.5 w-4.5 text-[#F05BEA]" />
                <MailEnvelopeIcon className="h-4.5 w-4.5 text-[#C8FF27]" />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
