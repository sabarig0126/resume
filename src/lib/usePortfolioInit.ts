import { useEffect, useRef, useState } from 'react';
import { PORTFOLIO_PDF_PATH, RESUME_PDF_PATH } from '../data/projects';

interface UsePortfolioInitOptions {
  enabled: boolean;
  prefersReducedMotion: boolean;
  onComplete: () => void;
}

interface UsePortfolioInitResult {
  progress: number;
  isComplete: boolean;
}

interface Milestone {
  timeMs: number;
  value: number;
}

const TOTAL_DURATION_MS = 3000;
const COMPLETE_REVEAL_DELAY_MS = 90;

const PROGRESS_MILESTONES: readonly Milestone[] = [
  { timeMs: 0, value: 1 },
  { timeMs: 500, value: 10 },
  { timeMs: 1000, value: 50 },
  { timeMs: 1500, value: 60 },
  { timeMs: 2000, value: 99 },
  { timeMs: TOTAL_DURATION_MS, value: 99 },
];

function evaluateMilestoneProgress(elapsedMs: number): number {
  if (elapsedMs <= 0) return 1;
  if (elapsedMs >= TOTAL_DURATION_MS) return 100;

  for (let i = 0; i < PROGRESS_MILESTONES.length - 1; i++) {
    const start = PROGRESS_MILESTONES[i];
    const end = PROGRESS_MILESTONES[i + 1];

    if (elapsedMs <= end.timeMs) {
      if (end.value === start.value || end.timeMs === start.timeMs) {
        return end.value;
      }
      const t = (elapsedMs - start.timeMs) / (end.timeMs - start.timeMs);
      const eased = t * t * (3 - 2 * t);
      return Math.round(start.value + (end.value - start.value) * eased);
    }
  }

  return 99;
}

export function usePortfolioInit({
  enabled,
  prefersReducedMotion: _prefersReducedMotion,
  onComplete,
}: UsePortfolioInitOptions): UsePortfolioInitResult {
  const [progress, setProgress] = useState<number>(1);
  const [isComplete, setIsComplete] = useState<boolean>(false);

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const hasFinishedRef = useRef(false);

  useEffect(() => {
    if (!enabled || hasFinishedRef.current) return;

    let cancelled = false;
    let rafId: number | null = null;
    let completionTimerId: number | null = null;
    let revealTimerId: number | null = null;
    const controllers = new Set<AbortController>();

    const startTime =
      typeof performance !== 'undefined' ? performance.now() : Date.now();
    let lastReportedProgress = 1;
    setProgress(1);

    // Warm critical assets silently in the background without altering the 3s timeline
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

    const finalizeAtThreeSeconds = () => {
      if (cancelled || hasFinishedRef.current) return;
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
        rafId = null;
      }
      lastReportedProgress = 100;
      setProgress(100);
      setIsComplete(true);

      revealTimerId = window.setTimeout(() => {
        if (cancelled || hasFinishedRef.current) return;
        hasFinishedRef.current = true;
        onCompleteRef.current();
      }, COMPLETE_REVEAL_DELAY_MS);
    };

    // Exact 3.0s completion timer (also guarantees completion if tab was backgrounded)
    completionTimerId = window.setTimeout(
      finalizeAtThreeSeconds,
      TOTAL_DURATION_MS
    );

    const tick = (now: number) => {
      if (cancelled || hasFinishedRef.current) return;

      const elapsedMs = Math.max(0, now - startTime);
      if (elapsedMs >= TOTAL_DURATION_MS) {
        finalizeAtThreeSeconds();
        return;
      }

      const nextProgress = Math.max(
        lastReportedProgress,
        evaluateMilestoneProgress(elapsedMs)
      );

      if (nextProgress !== lastReportedProgress) {
        lastReportedProgress = nextProgress;
        setProgress(nextProgress);
      }

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);

    const handleVisibilityChange = () => {
      const now =
        typeof performance !== 'undefined' ? performance.now() : Date.now();
      if (!document.hidden && now - startTime >= TOTAL_DURATION_MS) {
        finalizeAtThreeSeconds();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      if (completionTimerId !== null) window.clearTimeout(completionTimerId);
      if (revealTimerId !== null) window.clearTimeout(revealTimerId);
      controllers.forEach((ctrl) => ctrl.abort());
      controllers.clear();
    };
  }, [enabled]);

  return { progress, isComplete };
}
