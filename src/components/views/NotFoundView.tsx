import { motion } from 'motion/react';
import { ArrowRightIcon } from '../NextGenIcons';
import { FeatureId } from '../../types/portfolio';
import { GlassCard } from '../GlassCard';

interface NotFoundViewProps {
  onNavigateFeature: (feature: FeatureId) => void;
}

export function NotFoundView({ onNavigateFeature }: NotFoundViewProps) {
  return (
    <section className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col justify-center px-4 py-10 sm:px-6 md:px-10">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      >
        <GlassCard
          strong
          accent="pink"
          className="mx-auto max-w-2xl rounded-2xl px-6 py-12 text-center sm:px-12 sm:py-16"
        >
          <p className="font-kalam text-xs tracking-[0.16em] text-[#C8FF27] uppercase tabular-nums">
            Error 404 · Route Not Found
          </p>
          <h1 className="mt-3 font-road-rage text-6xl font-normal tracking-wide text-[#FF4D4D] sm:text-7xl">
            404 — Lost in the Portal
          </h1>
          <p className="mx-auto mt-4 max-w-lg font-kalam text-base leading-relaxed text-[#C8D4D4] sm:text-lg">
            The portfolio page you requested doesn&apos;t exist or may have moved. Head back to the main profile overview or explore direct contact channels.
          </p>

          <div className="mt-8 flex flex-col items-stretch justify-center gap-3.5 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => onNavigateFeature('overview')}
              className="touch-press inline-flex min-h-[46px] items-center justify-center gap-2 rounded-lg bg-[#C8FF27] px-6 py-2.5 text-sm font-bold text-[#071B1B] shadow-[0_0_24px_-6px_rgba(200,255,39,0.55)] hover:bg-[#d5ff52] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F05BEA]"
            >
              <span>Return to Overview</span>
              <ArrowRightIcon className="h-4 w-4 text-[#071B1B]" />
            </button>
            <button
              type="button"
              onClick={() => onNavigateFeature('contact')}
              className="touch-press inline-flex min-h-[46px] items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/[0.05] px-6 py-2.5 text-sm font-semibold text-white hover:border-[#F05BEA]/65 hover:bg-[#F05BEA]/15 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8FF27]"
            >
              <span>Contact Sabarivasan</span>
            </button>
          </div>
        </GlassCard>
      </motion.div>
    </section>
  );
}
