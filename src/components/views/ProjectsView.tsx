import { motion } from 'motion/react';
import {
  ArrowRightIcon,
  KanbanBoardIcon,
} from '../NextGenIcons';
import { prefetchViewChunk } from '../../lib/assetPreloader';
import { FeatureId } from '../../types/portfolio';
import { TiltCard } from '../TiltCard';

interface ProjectsViewProps {
  onNavigateFeature: (feature: FeatureId) => void;
}

export function ProjectsView({
  onNavigateFeature,
}: ProjectsViewProps) {
  return (
    <section className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col overflow-x-clip px-4 py-6 sm:px-6 sm:py-10 md:px-10 md:py-12">
      <div className="shrink-0 border-b border-white/10 pb-5 sm:pb-7">
        <p className="font-kalam text-xs text-[#F05BEA] tabular-nums">
          06 · Projects
        </p>
        <h1 className="mt-2 font-road-rage text-[2.2rem] font-normal leading-[1.06] tracking-wide text-[#FF4D4D] sm:text-5xl lg:text-[3.35rem] [text-wrap:balance]">
          Projects Coming Soon
        </h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.09, ease: [0.16, 1, 0.3, 1] }}
        className="mt-6 flex flex-1 flex-col sm:mt-8"
      >
        <TiltCard
          maxTiltDeg={2.5}
          glowColor="pink"
          scaleOnHover={1.006}
          className="glass-surface-strong glass-interactive glass-accent-pink flex flex-1 flex-col justify-center rounded-2xl px-6 py-12 sm:px-12 sm:py-16 md:py-20"
        >
          <div className="relative z-20 mx-auto max-w-2xl text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[#F05BEA]/35 bg-[#F05BEA]/12 text-[#F05BEA] shadow-inner sm:h-20 sm:w-20">
              <KanbanBoardIcon className="h-8 w-8 sm:h-10 sm:w-10" />
            </div>
            <h2 className="mt-6 font-road-rage text-4xl font-normal tracking-wide text-[#FF4D4D] sm:text-5xl lg:text-[3.25rem]">
              Projects Coming Soon
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-[#A0B2B2] sm:text-lg">
              No completed projects have been published yet. As I continue my 2nd-year B.Tech studies in Artificial Intelligence and Data Science, upcoming academic and hands-on projects will be shared here once completed.
            </p>
          </div>

          <div className="relative z-20 mt-8 flex flex-col items-stretch justify-center gap-3.5 sm:mt-10 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
            <button
              type="button"
              data-sfx="custom"
              onPointerEnter={() => prefetchViewChunk('certifications')}
              onFocus={() => prefetchViewChunk('certifications')}
              onClick={() => onNavigateFeature('certifications')}
              className="touch-press inline-flex min-h-[48px] w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-[#C8FF27] px-6 py-3 text-sm font-bold text-[#071B1B] shadow-[0_0_24px_-6px_rgba(200,255,39,0.55)] hover:bg-[#d5ff52] hover:shadow-[0_0_28px_-4px_rgba(200,255,39,0.7)] whitespace-nowrap sm:w-auto cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F05BEA]"
            >
              <span>View Certifications</span>
              <ArrowRightIcon className="h-4 w-4 text-[#071B1B]" />
            </button>
            <button
              type="button"
              data-sfx="custom"
              onPointerEnter={() => prefetchViewChunk('achievements')}
              onFocus={() => prefetchViewChunk('achievements')}
              onClick={() => onNavigateFeature('achievements')}
              className="touch-press inline-flex min-h-[48px] w-full shrink-0 items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/[0.04] px-6 py-3 text-sm font-semibold text-[#FFFFFF] hover:border-[#F05BEA]/60 hover:bg-[#F05BEA]/10 whitespace-nowrap sm:w-auto cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8FF27]"
            >
              <span>View Achievements</span>
            </button>
          </div>
        </TiltCard>
      </motion.div>
    </section>
  );
}
