import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
  strong?: boolean;
}

export function GlassCard({
  children,
  className = '',
  interactive = false,
  strong = false,
}: GlassCardProps) {
  const baseClass = strong ? 'glass-surface-strong' : 'glass-surface';
  const interactiveClass = interactive ? 'glass-interactive' : '';

  return (
    <div className={`${baseClass} ${interactiveClass} ${className}`.trim()}>
      {children}
    </div>
  );
}
