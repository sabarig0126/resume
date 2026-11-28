import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { isAnalyticsConfigured } from '../lib/analytics';
import {
  type ConsentPreferences,
  readConsent,
  saveConsent,
  subscribeOpenCookiePreferences,
} from '../lib/consent';
import { soundEffects } from '../lib/soundEffects';
import { FeatureId } from '../types/portfolio';

interface CookieConsentBannerProps {
  onNavigateFeature: (feature: FeatureId) => void;
  onConsentChange: (prefs: ConsentPreferences) => void;
}

export function CookieConsentBanner({
  onNavigateFeature,
  onConsentChange,
}: CookieConsentBannerProps) {
  const [visible, setVisible] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);

  useEffect(() => {
    const existing = readConsent();
    if (!existing) {
      setVisible(true);
      setAnalyticsEnabled(false);
    } else {
      setAnalyticsEnabled(existing.analytics);
    }

    return subscribeOpenCookiePreferences(() => {
      const latest = readConsent();
      setAnalyticsEnabled(latest?.analytics ?? false);
      setShowPrefs(true);
      setVisible(true);
      soundEffects.playModalOpen();
    });
  }, []);

  const handleAcceptAll = () => {
    soundEffects.playSparkle();
    const saved = saveConsent(true);
    setAnalyticsEnabled(true);
    setVisible(false);
    setShowPrefs(false);
    onConsentChange(saved);
  };

  const handleRejectNonEssential = () => {
    soundEffects.playModalClose();
    const saved = saveConsent(false);
    setAnalyticsEnabled(false);
    setVisible(false);
    setShowPrefs(false);
    onConsentChange(saved);
  };

  const handleSavePreferences = () => {
    soundEffects.playSparkle();
    const saved = saveConsent(analyticsEnabled);
    setVisible(false);
    setShowPrefs(false);
    onConsentChange(saved);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.aside
          role="region"
          aria-label="Cookie consent preferences"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-20 left-3 right-3 z-30 sm:bottom-6 sm:left-6 sm:right-auto sm:max-w-md"
        >
          <div className="glass-surface-strong glass-accent-pink rounded-2xl border border-teal-300/25 bg-[#061D1D]/95 p-4 text-xs text-white shadow-[0_20px_50px_-14px_rgba(0,0,0,0.9)] backdrop-blur-xl sm:p-5">
            <div className="flex items-start justify-between gap-2">
              <p className="font-caveat text-lg tracking-wide text-[#FFFF00]">
                Cookie &amp; Privacy Choices
              </p>
            </div>
            <p className="mt-1.5 font-kalam text-[13px] leading-relaxed text-[#C8D4D4]">
              Essential browser storage keeps your preferences working. Optional analytics stays disabled unless you choose Accept or enable it in Preferences.{' '}
              <button
                type="button"
                data-sfx="custom"
                onClick={() => onNavigateFeature('privacy')}
                className="underline decoration-[#C8FF27]/70 underline-offset-2 text-[#C8FF27] hover:text-white cursor-pointer"
              >
                Privacy Policy
              </button>
            </p>

            {showPrefs && (
              <div className="mt-3 space-y-2 rounded-xl border border-white/10 bg-[#041414]/80 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-bold text-white">Essential Storage</p>
                    <p className="text-[11.5px] text-[#A0B2B2]">
                      Always active for consent &amp; session security
                    </p>
                  </div>
                  <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[11px] font-bold text-[#C8FF27]">
                    Active
                  </span>
                </div>

                <label className="flex items-center justify-between gap-3 border-t border-white/10 pt-2 cursor-pointer">
                  <div>
                    <span className="block font-bold text-white">
                      Optional Analytics
                    </span>
                    <span className="block text-[11.5px] text-[#A0B2B2]">
                      {isAnalyticsConfigured()
                        ? 'Privacy-conscious page view metrics'
                        : 'Ready when analytics ID is configured'}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={analyticsEnabled}
                    onChange={(e) => setAnalyticsEnabled(e.target.checked)}
                    aria-label="Enable optional analytics cookies"
                    className="h-4 w-4 accent-[#C8FF27] cursor-pointer"
                  />
                </label>
              </div>
            )}

            <div className="mt-3.5 flex flex-wrap items-center gap-2">
              <button
                type="button"
                data-sfx="custom"
                onClick={handleAcceptAll}
                className="touch-press inline-flex min-h-[38px] flex-1 items-center justify-center rounded-lg bg-[#C8FF27] px-3 py-1.5 font-kalam text-xs font-bold text-[#071B1B] hover:bg-[#d5ff52] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F05BEA]"
              >
                Accept
              </button>
              <button
                type="button"
                data-sfx="custom"
                onClick={handleRejectNonEssential}
                className="touch-press inline-flex min-h-[38px] flex-1 items-center justify-center rounded-lg border border-white/20 bg-white/[0.06] px-3 py-1.5 font-kalam text-xs font-semibold text-white hover:border-[#F05BEA]/65 hover:bg-[#F05BEA]/15 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8FF27]"
              >
                Reject
              </button>
              {showPrefs ? (
                <button
                  type="button"
                  data-sfx="custom"
                  onClick={handleSavePreferences}
                  className="touch-press inline-flex min-h-[38px] items-center justify-center rounded-lg border border-[#F05BEA]/55 bg-[#F05BEA]/20 px-3 py-1.5 font-kalam text-xs font-bold text-white hover:bg-[#F05BEA]/35 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8FF27]"
                >
                  Save
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowPrefs(true)}
                  className="touch-press inline-flex min-h-[38px] items-center justify-center rounded-lg border border-white/15 bg-transparent px-3 py-1.5 font-kalam text-xs font-semibold text-[#C8D4D4] hover:border-white/30 hover:text-white cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8FF27]"
                >
                  Preferences
                </button>
              )}
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
