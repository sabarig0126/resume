import { ReactNode, useEffect, useRef } from 'react';
import { motion } from 'motion/react';

export const PORTAL_SEQUENCE_TOTAL_S = 2.8;
export const VIEW_TRANSITION_DURATION_S = 0.09;

interface CinematicTransitionProps {
  routeKey: string;
  children: ReactNode;
  className?: string;
  introActive?: boolean;
}

export function CinematicTransition({
  routeKey,
  children,
  className = '',
  introActive = false,
}: CinematicTransitionProps) {
  const isInitialMountRef = useRef(true);

  useEffect(() => {
    isInitialMountRef.current = false;
  }, []);

  const skipInitialMotion = introActive || isInitialMountRef.current;

  return (
    <motion.div
      key={routeKey}
      initial={skipInitialMotion ? false : { opacity: 0, y: 10, scale: 0.992 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: introActive ? 0 : VIEW_TRANSITION_DURATION_S,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
