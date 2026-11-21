import { useEffect, useRef, useState } from 'react';
import { PORTFOLIO_PDF_PATH, RESUME_PDF_PATH } from '../data/projects';

interface UsePortfolioInitOptions {
  enabled: boolean;
  prefersReducedMotion: boolean;
  onComplete: () => void;
}

interface UsePortfolioInitResult {
  progress: number;
}

interface DiscreteMilestone {
  atMs: number;
  value: number;
}

/**
 * Exact 2.4-second discrete loading schedule with overlapping 2.3s flash start:
 * - 0.0s -> 0.2s (0ms -> 200ms)   : completely empty black screen (0)
 * - 0.2s -> 0.7s (200ms -> 700ms) : hold at 10%
 * - 0.7s -> 1.2s (700ms -> 1200ms): hold at 50%
 * - 1.2s -> 1.9s (1200ms -> 1900ms): hold at 60%
 * - 1.9s -> 2.4s (1900ms -> 2400ms): hold at 99% (never shows 100%)
 * - 2.3s (2300ms): Portal Flash overlaps final 0.1s of 99% stage -> finishes at 2.8s
 */
export const OVERLAP_TRANSITION_START_MS = 2300;
export const TOTAL_LOADING_DURATION_MS = 2400;

const DISCRETE_MILESTONES: readonly DiscreteMilestone[] = [
  { atMs: 0, value: 0 },
  { atMs: 200, value: 10 },
  { atMs: 700, value: 50 },
  { atMs: 1200, value: 60 },
  { atMs: 1900, value: 99 },
];

function getMilestoneAtElapsed(elapsedMs: number): number {
  let current = DISCRETE_MILESTONES[0].value;
  for (let i = 0; i < DISCRETE_MILESTONES.length; i++) {
    if (elapsedMs >= DISCRETE_MILESTONES[i].atMs) {
      current = DISCRETE_MILESTONES[i].value;
    } else {
      break;
    }
  }
  return current;
}

export function usePortfolioInit({
  enabled,
  prefersReducedMotion: _prefersReducedMotion,
  onComplete,
}: UsePortfolioInitOptions): UsePortfolioInitResult {
  const [progress, setProgress] = useState<number>(0);

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const hasFinishedRef = useRef(false);

  useEffect(() => {
    if (!enabled || hasFinishedRef.current) return;

    let cancelled = false;
    const timers: number[] = [];
    const controllers = new Set<AbortController>();

    const startTime =
      typeof performance !== 'undefined' ? performance.now() : Date.now();
    setProgress(0);

    // Warm critical assets silently in the background without altering the 2.4s timeline
    const warmAsset = (url: string) => {
      const controller = new AbortController();
      controllers.add(controller);
      fetch(url, {
        method: 'HEAD',
        cache: 'force-cache',
        signal: controller.signal,
      })
        .catch(() => {})
        .finally(() => {
          controllers.delete(controller);
        });
    };

    warmAsset(RESUME_PDF_PATH);
    warmAsset(PORTFOLIO_PDF_PATH);
    if (document.fonts?.ready) {
      void document.fonts.ready.catch(() => {});
    }

    const triggerTransitionOverlap = () => {
      if (cancelled || hasFinishedRef.current) return;
      hasFinishedRef.current = true;
      onCompleteRef.current();
    };

    // Schedule each exact discrete milestone without intermediate interpolation
    for (let i = 1; i < DISCRETE_MILESTONES.length; i++) {
      const milestone = DISCRETE_MILESTONES[i];
      const timerId = window.setTimeout(() => {
        if (cancelled || hasFinishedRef.current) return;
        setProgress(milestone.value);
      }, milestone.atMs);
      timers.push(timerId);
    }

    // Start overlapping Portal Flash early at 2.3s while 99% loading stage (1.9s -> 2.4s) is active
    const overlapTimerId = window.setTimeout(
      triggerTransitionOverlap,
      OVERLAP_TRANSITION_START_MS
    );
    timers.push(overlapTimerId);

    // If tab was backgrounded, snap cleanly to exact elapsed milestone or trigger transition
    const handleVisibilityChange = () => {
      if (cancelled || hasFinishedRef.current || document.hidden) return;
      const now =
        typeof performance !== 'undefined' ? performance.now() : Date.now();
      const elapsedMs = Math.max(0, now - startTime);
      if (elapsedMs >= OVERLAP_TRANSITION_START_MS) {
        setProgress(99);
        triggerTransitionOverlap();
      } else {
        setProgress(getMilestoneAtElapsed(elapsedMs));
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      timers.forEach((id) => window.clearTimeout(id));
      controllers.forEach((ctrl) => ctrl.abort());
      controllers.clear();
    };
  }, [enabled]);

  return { progress };
}
