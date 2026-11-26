export interface ConsentPreferences {
  essential: true;
  analytics: boolean;
  updatedAt: string;
}

const CONSENT_STORAGE_KEY = 'pearl_portfolio_cookie_consent_v1';
const CONSENT_EVENT_NAME = 'portfolio-consent-updated';
const OPEN_PREFS_EVENT_NAME = 'portfolio-open-cookie-preferences';

export function readConsent(): ConsentPreferences | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ConsentPreferences>;
    if (typeof parsed.analytics !== 'boolean' || typeof parsed.updatedAt !== 'string') {
      return null;
    }
    return {
      essential: true,
      analytics: parsed.analytics,
      updatedAt: parsed.updatedAt,
    };
  } catch {
    return null;
  }
}

export function saveConsent(analytics: boolean): ConsentPreferences {
  const next: ConsentPreferences = {
    essential: true,
    analytics: Boolean(analytics),
    updatedAt: new Date().toISOString(),
  };
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Safe fallback when storage is restricted in private browsing
    }
    window.dispatchEvent(new CustomEvent<ConsentPreferences>(CONSENT_EVENT_NAME, { detail: next }));
  }
  return next;
}

export function subscribeConsent(
  listener: (prefs: ConsentPreferences | null) => void
): () => void {
  if (typeof window === 'undefined') return () => {};
  const handler = () => listener(readConsent());
  window.addEventListener(CONSENT_EVENT_NAME, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(CONSENT_EVENT_NAME, handler);
    window.removeEventListener('storage', handler);
  };
}

export function requestOpenCookiePreferences(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(OPEN_PREFS_EVENT_NAME));
}

export function subscribeOpenCookiePreferences(listener: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(OPEN_PREFS_EVENT_NAME, listener);
  return () => {
    window.removeEventListener(OPEN_PREFS_EVENT_NAME, listener);
  };
}
