import { useEffect, useRef } from 'react';

interface AnimatedCounterProps {
  value: number | string;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  padZero?: number;
  durationMs?: number;
  className?: string;
}

interface ParsedMetric {
  target: number;
  decimals: number;
  prefix: string;
  suffix: string;
  exactText: string;
}

function parseMetricValue(
  rawValue: number | string,
  explicitDecimals?: number,
  explicitPrefix = '',
  explicitSuffix = '',
  padZero = 0
): ParsedMetric {
  if (typeof rawValue === 'number') {
    const decimals = explicitDecimals ?? (Number.isInteger(rawValue) ? 0 : 1);
    const numStr = decimals > 0 ? rawValue.toFixed(decimals) : String(rawValue);
    const padded = padZero > 0 && decimals === 0 ? numStr.padStart(padZero, '0') : numStr;
    return {
      target: rawValue,
      decimals,
      prefix: explicitPrefix,
      suffix: explicitSuffix,
      exactText: `${explicitPrefix}${padded}${explicitSuffix}`,
    };
  }

  const trimmed = rawValue.trim();
  const match = trimmed.match(/^([^0-9.-]*)(-?\d+(?:\.\d+)?)(.*)$/);
  if (!match) {
    return {
      target: 0,
      decimals: 0,
      prefix: '',
      suffix: '',
      exactText: trimmed,
    };
  }

  const [, parsedPrefix, numberPart, parsedSuffix] = match;
  const decimalIdx = numberPart.indexOf('.');
  const inferredDecimals =
    explicitDecimals ?? (decimalIdx >= 0 ? numberPart.length - decimalIdx - 1 : 0);

  return {
    target: Number(numberPart),
    decimals: inferredDecimals,
    prefix: explicitPrefix || parsedPrefix,
    suffix: explicitSuffix || parsedSuffix,
    exactText: trimmed,
  };
}

function formatCounterValue(
  current: number,
  decimals: number,
  prefix: string,
  suffix: string,
  padZero: number
): string {
  const numStr = decimals > 0 ? current.toFixed(decimals) : String(Math.round(current));
  const padded = padZero > 0 && decimals === 0 ? numStr.padStart(padZero, '0') : numStr;
  return `${prefix}${padded}${suffix}`;
}

export function AnimatedCounter({
  value,
  decimals,
  prefix = '',
  suffix = '',
  padZero = 0,
  durationMs = 950,
  className = '',
}: AnimatedCounterProps) {
  const spanRef = useRef<HTMLSpanElement | null>(null);
  const hasAnimatedRef = useRef(false);
  const rafRef = useRef(0);

  const parsed = parseMetricValue(value, decimals, prefix, suffix, padZero);

  useEffect(() => {
    const el = spanRef.current;
    if (!el) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Update immediately if already animated or if reduced motion is active
    if (hasAnimatedRef.current || prefersReducedMotion || typeof IntersectionObserver === 'undefined') {
      hasAnimatedRef.current = true;
      el.textContent = parsed.exactText;
      return;
    }

    el.textContent = formatCounterValue(
      0,
      parsed.decimals,
      parsed.prefix,
      parsed.suffix,
      padZero
    );

    const startAnimation = () => {
      if (hasAnimatedRef.current) return;
      hasAnimatedRef.current = true;

      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
      }

      const startTime = performance.now();
      const totalDuration = Math.max(300, durationMs);

      const step = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / totalDuration);
        // Smooth ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const currentVal = parsed.target * eased;

        if (spanRef.current) {
          spanRef.current.textContent =
            progress >= 1
              ? parsed.exactText
              : formatCounterValue(
                  currentVal,
                  parsed.decimals,
                  parsed.prefix,
                  parsed.suffix,
                  padZero
                );
        }

        if (progress < 1) {
          rafRef.current = window.requestAnimationFrame(step);
        } else {
          rafRef.current = 0;
        }
      };

      el.textContent = formatCounterValue(
        0,
        parsed.decimals,
        parsed.prefix,
        parsed.suffix,
        padZero
      );
      rafRef.current = window.requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            startAnimation();
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
    };
  }, [parsed.exactText, parsed.target, parsed.decimals, parsed.prefix, parsed.suffix, padZero, durationMs]);

  return (
    <span
      ref={spanRef}
      aria-label={parsed.exactText}
      className={`tabular-nums ${className}`.trim()}
    >
      {parsed.exactText}
    </span>
  );
}
