import { FeatureId } from '../types/portfolio';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    plausible?: (eventName: string, options?: { u?: string; props?: Record<string, string> }) => void;
  }
}

const GA_MEASUREMENT_ID = (import.meta.env.VITE_GA_MEASUREMENT_ID || '').trim();
const PLAUSIBLE_DOMAIN = (import.meta.env.VITE_PLAUSIBLE_DOMAIN || '').trim();

let loadedProvider: 'none' | 'ga' | 'plausible' = 'none';

export function isAnalyticsConfigured(): boolean {
  return Boolean(GA_MEASUREMENT_ID || PLAUSIBLE_DOMAIN);
}

function isPrivacySignalActive(): boolean {
  if (typeof navigator === 'undefined') return false;
  const nav = navigator as Navigator & {
    globalPrivacyControl?: boolean;
    doNotTrack?: string | null;
  };
  const win = window as Window & { doNotTrack?: string };
  if (nav.globalPrivacyControl === true) return true;
  const dnt = nav.doNotTrack ?? win.doNotTrack ?? '';
  return dnt === '1' || dnt === 'yes';
}

function ensureGaLoaded(): void {
  if (loadedProvider !== 'none' || !GA_MEASUREMENT_ID || typeof document === 'undefined') {
    return;
  }
  loadedProvider = 'ga';
  window.dataLayer = window.dataLayer || [];
  window.gtag = (...args: unknown[]) => {
    window.dataLayer?.push(args);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    anonymize_ip: true,
    send_page_view: false,
  });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_MEASUREMENT_ID)}`;
  script.id = 'consent-ga-script';
  document.head.appendChild(script);
}

function ensurePlausibleLoaded(): void {
  if (loadedProvider !== 'none' || !PLAUSIBLE_DOMAIN || typeof document === 'undefined') {
    return;
  }
  loadedProvider = 'plausible';
  const script = document.createElement('script');
  script.defer = true;
  script.setAttribute('data-domain', PLAUSIBLE_DOMAIN);
  script.src = 'https://plausible.io/js/script.manual.js';
  script.id = 'consent-plausible-script';
  document.head.appendChild(script);
}

export function initializeAnalyticsWithConsent(analyticsAllowed: boolean): void {
  if (typeof window === 'undefined') return;
  if (!analyticsAllowed || isPrivacySignalActive()) {
    teardownAnalytics();
    return;
  }
  if (GA_MEASUREMENT_ID) {
    ensureGaLoaded();
  } else if (PLAUSIBLE_DOMAIN) {
    ensurePlausibleLoaded();
  }
}

export function teardownAnalytics(): void {
  if (typeof document === 'undefined') return;
  document.getElementById('consent-ga-script')?.remove();
  document.getElementById('consent-plausible-script')?.remove();
  loadedProvider = 'none';
}

export function trackConsentAwarePageView(
  feature: FeatureId,
  analyticsAllowed: boolean
): void {
  if (typeof window === 'undefined') return;
  if (!analyticsAllowed || isPrivacySignalActive() || feature === 'notFound') {
    return;
  }

  initializeAnalyticsWithConsent(true);

  const path = window.location.pathname + window.location.search;
  if (GA_MEASUREMENT_ID && typeof window.gtag === 'function') {
    window.gtag('event', 'page_view', {
      page_title: document.title,
      page_path: path,
      page_location: window.location.href,
    });
  } else if (PLAUSIBLE_DOMAIN && typeof window.plausible === 'function') {
    window.plausible('pageview', {
      u: window.location.href,
      props: { section: feature },
    });
  }
}
