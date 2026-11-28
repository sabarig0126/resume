import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { triggerCrystalBurst } from '../lib/glassEffects';
import { CloseIcon } from './NextGenIcons';
import { PortfolioItem } from '../types/portfolio';
import { ProjectImageReveal } from './ProjectImageReveal';
import { ResilientImage } from './ResilientImage';

interface ProjectLightboxProps {
  item: PortfolioItem | null;
  onClose: () => void;
}

export function ProjectLightbox({ item, onClose }: ProjectLightboxProps) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!item) return;

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
        triggerCrystalBurst(closeButtonRef.current, 'dissolve');
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
  }, [item, onClose]);

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="lightbox-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.09, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#041010]/82 p-3 backdrop-blur-md sm:p-6 md:p-10"
          onClick={() => {
            triggerCrystalBurst(closeButtonRef.current, 'dissolve');
            onClose();
          }}
        >
          <motion.div
            ref={dialogRef}
            initial={{ opacity: 0, scale: 0.97, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 4 }}
            transition={{ duration: 0.1, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="glass-surface-strong glass-accent-pink relative flex max-h-[92dvh] w-full max-w-[1120px] flex-col overflow-hidden rounded-2xl text-[#FFFFFF]"
          >
            <button
              ref={closeButtonRef}
              type="button"
              data-sfx="custom"
              onClick={(e) => {
                triggerCrystalBurst(e.currentTarget, 'dissolve');
                onClose();
              }}
              aria-label="Close item viewer"
              className="touch-press absolute right-3 top-3 z-20 inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#F05BEA]/45 bg-[#071B1B]/85 text-[#FFFFFF] transition-colors duration-200 hover:border-[#C8FF27] hover:bg-[#C8FF27] hover:text-[#071B1B] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8FF27] sm:right-4 sm:top-4"
            >
              <CloseIcon className="h-5 w-5" />
            </button>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain touch-pan-y lg:grid lg:grid-cols-12 lg:overflow-hidden">
          {/* Left Plate: Uploaded Image OR Typographic Slide Plate */}
          <div
            className={`flex flex-col bg-gradient-to-br from-[#071B1B]/95 via-[#0B2626]/85 to-[#071B1B]/95 px-4 pt-16 pb-5 sm:px-8 sm:pt-16 sm:pb-8 lg:col-span-6 lg:p-10 ${
              item.imageUrl ? 'justify-center' : 'justify-between'
            }`}
          >
            {item.imageUrl ? (
              <ProjectImageReveal
                className={`aspect-[16/10] w-full rounded-xl border border-white/10 shadow-[0_20px_50px_-16px_rgba(2,10,10,0.88)] ${
                  item.imageUrl.includes('/assets/certificates/') ||
                  item.imageUrl.includes('/assets/organizations/')
                    ? 'bg-white p-3'
                    : 'bg-[#051414]'
                }`}
              >
                {item.badgeLogoUrl ? (
                  <div className="flex h-full w-full items-center justify-center">
                    <div className="relative aspect-[16/9] max-h-full w-full max-w-full overflow-hidden">
                      <ResilientImage
                        src={item.imageUrl}
                        alt={item.imageAlt ?? item.title}
                        fallbackTitle={item.title}
                        loading="eager"
                        fetchPriority="high"
                        className="h-full w-full object-contain"
                      />
                      <span className="pointer-events-none absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-white/85 bg-white p-1 shadow-[0_6px_18px_rgba(0,0,0,0.55),0_0_0_2px_rgba(7,27,27,0.4)] sm:h-11 sm:w-11">
                        <img
                          src={item.badgeLogoUrl}
                          alt={item.badgeLogoAlt ?? `${item.title} logo`}
                          className="h-full w-full object-contain"
                          loading="eager"
                          decoding="async"
                        />
                      </span>
                    </div>
                  </div>
                ) : (
                  <ResilientImage
                    src={item.imageUrl}
                    alt={item.imageAlt ?? item.title}
                    fallbackTitle={item.title}
                    loading="eager"
                    fetchPriority="high"
                    className="h-full w-full object-contain"
                  />
                )}
              </ProjectImageReveal>
            ) : (
              <div className="flex h-full flex-col justify-between py-2">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <span className="font-kalam text-xs text-[#C8FF27] tabular-nums">
                    Record {item.indexNumber}
                  </span>
                  <span className="font-caveat text-sm font-normal tracking-wide text-[#FFFF00]">
                    {item.category}
                  </span>
                </div>

                <div className="my-5 sm:my-8">
                  <p className="font-caveat text-sm font-normal tracking-wide text-[#FFFF00]">
                    {item.organization}
                  </p>
                  <h3 className="mt-2 font-road-rage text-3xl font-normal tracking-wide text-[#FF4D4D] sm:text-5xl [text-wrap:balance]">
                    {item.title}
                  </h3>
                  <p className="mt-4 font-kalam text-sm leading-relaxed text-[#A0B2B2]">
                    {item.summary}
                  </p>
                </div>

                <div className="border-t border-white/10 pt-4 font-kalam text-xs text-[#C8FF27] tabular-nums">
                  {item.specs.credentialOrOutcome} · {item.location}
                </div>
              </div>
            )}
          </div>

          {/* Right: Structured Details */}
          <div className="flex min-h-0 flex-col justify-between border-t border-white/10 bg-[#071B1B]/90 p-4 sm:p-8 lg:col-span-6 lg:overflow-y-auto lg:border-l lg:border-t-0">
            <div>
              <div className="flex flex-wrap items-center gap-2 font-kalam text-xs text-[#A0B2B2] lg:pr-12">
                <span className="font-kalam font-bold tabular-nums text-[#C8FF27]">
                  {item.indexNumber}
                </span>
                <span aria-hidden="true">·</span>
                <span className="text-[#F05BEA]">{item.category}</span>
                <span aria-hidden="true">·</span>
                <span className="font-kalam tabular-nums text-[#A0B2B2]">
                  {item.timeframe}
                </span>
              </div>

              <h2
                id="lightbox-title"
                className="mt-3 font-road-rage text-3xl font-normal tracking-wide text-[#FF4D4D] sm:text-4xl [text-wrap:balance]"
              >
                {item.title}
              </h2>

              <p className="mt-1 font-kalam text-sm text-[#A0B2B2]">
                {item.organization} — {item.location}
              </p>

              <p className="mt-6 font-kalam text-sm leading-relaxed text-[#FFFFFF]/90">
                {item.details}
              </p>

              {/* Key Highlights */}
              <div className="mt-6 border-t border-white/10 pt-5">
                <h3 className="font-caveat text-base font-normal tracking-wide text-[#FFFF00]">
                  Key Highlights
                </h3>
                <ul className="mt-3 space-y-2 font-kalam text-sm text-[#FFFFFF]">
                  {item.highlights.map((hl) => (
                    <li key={hl} className="flex items-start gap-2.5">
                      <span aria-hidden="true" className="text-[#C8FF27]">
                        —
                      </span>
                      <span>{hl}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Credential Metadata */}
              <div className="mt-6 border-t border-white/10 pt-5">
                <h3 className="font-caveat text-base font-normal tracking-wide text-[#FFFF00]">
                  Credential &amp; Context
                </h3>
                <dl className="mt-3 grid grid-cols-1 gap-3 font-kalam text-xs sm:grid-cols-2">
                  <div>
                    <dt className="font-kalam text-[#A0B2B2]">
                      Issuer / Institution
                    </dt>
                    <dd className="mt-0.5 font-kalam text-[#FFFFFF]">
                      {item.specs.issuerOrContext}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-kalam text-[#A0B2B2]">Focus Area</dt>
                    <dd className="mt-0.5 font-kalam text-[#FFFFFF]">
                      {item.specs.focusArea}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-kalam text-[#A0B2B2]">Outcome / Scope</dt>
                    <dd className="mt-0.5 font-kalam text-[#C8FF27] tabular-nums">
                      {item.specs.credentialOrOutcome}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-kalam text-[#A0B2B2]">Location</dt>
                    <dd className="mt-0.5 font-kalam text-[#FFFFFF]">
                      {item.specs.location}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="mt-8 border-t border-white/10 pt-5 font-kalam text-xs text-[#A0B2B2]">
              <span className="text-[#C8FF27]">Portfolio</span> Record
            </div>
          </div>
        </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
