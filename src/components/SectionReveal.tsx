import { ReactNode, useEffect, useRef, useState } from 'react';

interface SectionRevealProps {
  children: ReactNode;
  className?: string;
  delayMs?: number;
}

export function SectionReveal({
  children,
  className = '',
  delayMs = 0,
}: SectionRevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(() => {
    if (typeof window === 'undefined') return true;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (visible) return;
    const node = ref.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -24px 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [visible]);

  return (
    <div
      ref={ref}
      style={{
        transitionProperty: 'opacity, transform, translate',
        transitionDuration: '480ms',
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
        transitionDelay: `${delayMs}ms`,
      }}
      className={`${
        visible ? 'opacity-100' : 'opacity-0 translate-y-3'
      } ${className}`.trim()}
    >
      {children}
    </div>
  );
}
