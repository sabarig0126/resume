import { ReactNode } from 'react';

export type GlassAccent = 'default' | 'blue' | 'amber';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
  strong?: boolean;
  accent?: GlassAccent;
}

const ACCENT_CLASSES: Record<GlassAccent, string> = {
  default: '',
  blue: 'glass-accent-blue',
  amber: 'glass-accent-amber',
};

export function GlassCard({
  children,
  className = '',
  interactive = false,
  strong = false,
  accent = 'default',
}: GlassCardProps) {
  const baseClass = strong ? 'glass-surface-strong' : 'glass-surface';
  const interactiveClass = interactive ? 'glass-interactive' : '';
  const accentClass = ACCENT_CLASSES[accent];

  return (
    <div
      className={`${baseClass} ${interactiveClass} ${accentClass} ${className}`.trim()}
    >
      {children}
    </div>
  );
}
