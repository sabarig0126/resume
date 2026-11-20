import { ReactNode, useEffect, useRef, useState } from 'react';

interface ProjectImageRevealProps {
  children: ReactNode;
  overlayTitle?: string;
  overlaySubtitle?: string;
  className?: string;
  delayMs?: number;
}

export function ProjectImageReveal({
  children,
  overlayTitle,
  overlaySubtitle,
  className = '',
  delayMs = 0,
}: ProjectImageRevealProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [revealed, setRevealed] = useState(() => {
    if (typeof window === 'undefined') return true;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (revealed) return;
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setRevealed(true);
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -16px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [revealed]);

  return (
    <div
      ref={containerRef}
      className={`group/reveal relative overflow-hidden ${className}`.trim()}
    >
      <div
        style={{
          transitionProperty: 'opacity, transform',
          transitionDuration: '560ms',
          transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
          transitionDelay: `${delayMs}ms`,
        }}
        className={`h-full w-full transition-transform duration-500 ease-out group-hover/reveal:scale-[1.035] group-active/reveal:scale-[0.985] ${
          revealed ? 'opacity-100 scale-100' : 'opacity-0 scale-[1.06]'
        }`}
      >
        {children}
      </div>

      {/* Subtle blue/cyan hover & tap glow sheen */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-blue-500/0 via-cyan-400/0 to-blue-400/20 opacity-0 transition-opacity duration-300 group-hover/reveal:opacity-100 group-active/reveal:opacity-100"
      />

      {/* Optional clean contrast scrim overlay */}
      {(overlayTitle || overlaySubtitle) && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#050A18]/90 via-[#050A18]/50 to-transparent px-4 py-3">
          {overlayTitle && (
            <p className="font-caveat text-sm font-normal tracking-wide text-[#FFFF00] truncate">
              {overlayTitle}
            </p>
          )}
          {overlaySubtitle && (
            <p className="font-kalam text-[11px] text-blue-200/90 truncate">
              {overlaySubtitle}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
