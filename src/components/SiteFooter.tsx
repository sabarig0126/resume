import { PROFILE } from '../data/projects';
import { prefetchViewChunk } from '../lib/assetPreloader';
import { requestOpenCookiePreferences } from '../lib/consent';
import { FeatureId } from '../types/portfolio';

interface SiteFooterProps {
  activeFeature: FeatureId;
  onNavigateFeature: (feature: FeatureId) => void;
}

export function SiteFooter({ activeFeature, onNavigateFeature }: SiteFooterProps) {
  const linkClass = (feature: FeatureId) =>
    `font-kalam text-xs transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8FF27] rounded px-1 py-0.5 ${
      activeFeature === feature
        ? 'font-bold text-[#C8FF27]'
        : 'text-[#B8C7C7] hover:text-white'
    }`;

  return (
    <footer className="relative z-10 mt-auto border-t border-white/10 bg-[#051515]/80">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-3 px-4 pt-4 pb-20 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:pb-6 md:px-10 lg:pr-64">
        <p className="font-kalam text-xs text-[#B8C7C7]">
          © {new Date().getFullYear()} {PROFILE.name} · AI &amp; Data Science Portfolio
        </p>

        <nav aria-label="Footer navigation" className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
          <button
            type="button"
            data-sfx="custom"
            onPointerEnter={() => prefetchViewChunk('overview')}
            onFocus={() => prefetchViewChunk('overview')}
            onClick={() => onNavigateFeature('overview')}
            className={linkClass('overview')}
          >
            Overview
          </button>
          <button
            type="button"
            data-sfx="custom"
            onPointerEnter={() => prefetchViewChunk('projects')}
            onFocus={() => prefetchViewChunk('projects')}
            onClick={() => onNavigateFeature('projects')}
            className={linkClass('projects')}
          >
            Projects
          </button>
          <button
            type="button"
            data-sfx="custom"
            onPointerEnter={() => prefetchViewChunk('contact')}
            onFocus={() => prefetchViewChunk('contact')}
            onClick={() => onNavigateFeature('contact')}
            className={linkClass('contact')}
          >
            Contact
          </button>
          <button
            type="button"
            data-sfx="custom"
            onPointerEnter={() => prefetchViewChunk('privacy')}
            onFocus={() => prefetchViewChunk('privacy')}
            onClick={() => onNavigateFeature('privacy')}
            className={linkClass('privacy')}
          >
            Privacy Policy
          </button>
          <button
            type="button"
            data-sfx="custom"
            onPointerEnter={() => prefetchViewChunk('terms')}
            onFocus={() => prefetchViewChunk('terms')}
            onClick={() => onNavigateFeature('terms')}
            className={linkClass('terms')}
          >
            Terms &amp; Conditions
          </button>
          <button
            type="button"
            data-sfx="custom"
            onClick={requestOpenCookiePreferences}
            className="font-kalam text-xs text-[#B8C7C7] transition-colors hover:text-[#F05BEA] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8FF27] rounded px-1 py-0.5"
          >
            Cookie Preferences
          </button>
        </nav>
      </div>
    </footer>
  );
}
