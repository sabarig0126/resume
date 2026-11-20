import { ReactNode } from 'react';
import { motion } from 'motion/react';

interface CinematicTransitionProps {
  routeKey: string;
  children: ReactNode;
  className?: string;
}

export function CinematicTransition({
  routeKey,
  children,
  className = '',
}: CinematicTransitionProps) {
  return (
    <motion.div
      key={routeKey}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.24,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
