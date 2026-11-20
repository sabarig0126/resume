import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { PortfolioItem } from '../types/portfolio';
import { ProjectImageReveal } from './ProjectImageReveal';
import { ResilientImage } from './ResilientImage';

interface ProjectLightboxProps {
  item: PortfolioItem | null;
  items: PortfolioItem[];
  onClose: () => void;
  onNavigate: (item: PortfolioItem) => void;
}

export function ProjectLightbox({
  item,
  items,
  onClose,
  onNavigate,
}: ProjectLightboxProps) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const currentIndex = item
    ? items.findIndex((p) => p.id === item.id)
    : -1;

  useEffect(() => {
    if (!item) return;

    previousFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusTimer = window.requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' && items.length > 1 && currentIndex >= 0) {
        const nextIdx = (currentIndex + 1) % items.length;
        onNavigate(items[nextIdx]);
      } else if (e.key === 'ArrowLeft' && items.length > 1 && currentIndex >= 0) {
        const prevIdx = (currentIndex - 1 + items.length) % items.length;
        onNavigate(items[prevIdx]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.cancelAnimationFrame(focusTimer);
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
      previousFocusRef.current?.focus?.();
    };
  }, [item, items, currentIndex, onClose, onNavigate]);

  if (!item) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="lightbox-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm sm:p-6 md:p-10"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-surface-strong relative flex max-h-[92dvh] w-full max-w-[1120px] flex-col overflow-y-auto overscroll-contain rounded-2xl text-white lg:grid lg:grid-cols-12 lg:overflow-hidden"
      >
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label="Close item viewer"
          className="touch-press absolute right-4 top-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/55 text-white hover:border-cyan-400/60 hover:bg-white hover:text-[#08122E] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Left Plate: Uploaded Image OR Typographic Slide Plate */}
        <div className="flex flex-col justify-between bg-gradient-to-br from-[#0A1A44] via-[#0E245E] to-[#133280] p-6 sm:p-10 lg:col-span-6">
          {item.imageUrl ? (
            <ProjectImageReveal
              overlayTitle={item.title}
              overlaySubtitle={item.organization}
              className="aspect-[4/3] w-full rounded-xl border border-white/15 bg-black/30"
            >
              <ResilientImage
                src={item.imageUrl}
                alt={item.imageAlt ?? item.title}
                fallbackTitle={item.title}
                className="h-full w-full object-cover"
              />
            </ProjectImageReveal>
          ) : (
            <div className="flex h-full flex-col justify-between py-2">
              <div className="flex items-center justify-between border-b border-white/15 pb-4">
                <span className="font-kalam text-xs text-blue-200 tabular-nums">
                  Record {item.indexNumber}
                </span>
                <span className="font-caveat text-sm font-normal tracking-wide text-[#FFFF00]">
                  {item.category}
                </span>
              </div>

              <div className="my-8">
                <p className="font-caveat text-sm font-normal tracking-wide text-[#FFFF00]">
                  {item.organization}
                </p>
                <h3 className="mt-2 font-road-rage text-4xl font-normal tracking-wide text-[#FF0000] sm:text-5xl [text-wrap:balance]">
                  {item.title}
                </h3>
                <p className="mt-4 font-kalam text-sm leading-relaxed text-blue-100/90">
                  {item.summary}
                </p>
              </div>

              <div className="border-t border-white/15 pt-4 font-kalam text-xs text-blue-200 tabular-nums">
                {item.specs.credentialOrOutcome} · {item.location}
              </div>
            </div>
          )}
        </div>

        {/* Right: Structured Details */}
        <div className="flex min-h-0 flex-col justify-between bg-[#070E24] p-6 sm:p-8 lg:col-span-6 lg:overflow-y-auto">
          <div>
            <div className="flex flex-wrap items-center gap-2 pr-10 font-kalam text-xs text-slate-400">
              <span className="font-kalam tabular-nums text-blue-300">
                {item.indexNumber}
              </span>
              <span aria-hidden="true">·</span>
              <span>{item.category}</span>
              <span aria-hidden="true">·</span>
              <span className="font-kalam tabular-nums">{item.timeframe}</span>
            </div>

            <h2
              id="lightbox-title"
              className="mt-3 font-road-rage text-3xl font-normal tracking-wide text-[#FF0000] sm:text-4xl [text-wrap:balance]"
            >
              {item.title}
            </h2>

            <p className="mt-1 font-kalam text-sm text-slate-400">
              {item.organization} — {item.location}
            </p>

            <p className="mt-6 font-kalam text-sm leading-relaxed text-slate-200">
              {item.details}
            </p>

            {/* Key Highlights */}
            <div className="mt-6 border-t border-white/10 pt-5">
              <h3 className="font-caveat text-base font-normal tracking-wide text-[#FFFF00]">
                Key Highlights
              </h3>
              <ul className="mt-3 space-y-2 font-kalam text-sm text-slate-100">
                {item.highlights.map((hl) => (
                  <li key={hl} className="flex items-start gap-2.5">
                    <span aria-hidden="true" className="text-blue-400">
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
                  <dt className="font-kalam text-slate-500">Issuer / Institution</dt>
                  <dd className="mt-0.5 font-kalam text-slate-200">
                    {item.specs.issuerOrContext}
                  </dd>
                </div>
                <div>
                  <dt className="font-kalam text-slate-500">Focus Area</dt>
                  <dd className="mt-0.5 font-kalam text-slate-200">
                    {item.specs.focusArea}
                  </dd>
                </div>
                <div>
                  <dt className="font-kalam text-slate-500">Outcome / Scope</dt>
                  <dd className="mt-0.5 font-kalam text-slate-200 tabular-nums">
                    {item.specs.credentialOrOutcome}
                  </dd>
                </div>
                <div>
                  <dt className="font-kalam text-slate-500">Location</dt>
                  <dd className="mt-0.5 font-kalam text-slate-200">
                    {item.specs.location}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="mt-8 border-t border-white/10 pt-5 font-kalam text-xs text-slate-400">
            <span>Verified Portfolio Record</span>
          </div>
        </div>
      </div>
    </div>
  );
}
