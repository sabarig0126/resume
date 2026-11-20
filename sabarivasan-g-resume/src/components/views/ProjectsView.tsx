import { motion } from 'motion/react';
import { ArrowRight, FolderKanban } from 'lucide-react';
import { FeatureId } from '../../types/portfolio';
import { TiltCard } from '../TiltCard';

interface ProjectsViewProps {
  onNavigateFeature: (feature: FeatureId) => void;
}

export function ProjectsView({ onNavigateFeature }: ProjectsViewProps) {
  return (
    <section className="mx-auto max-w-[1280px] px-6 py-12 md:px-10 md:py-16">
      <div className="border-b border-white/10 pb-8">
        <p className="font-kalam text-xs text-amber-400 tabular-nums">
          06 · Projects &amp; Applied Builds
        </p>
        <h1 className="mt-2 font-road-rage text-4xl font-normal tracking-wide text-[#FF0000] sm:text-5xl [text-wrap:balance]">
          Engineering projects &amp; applied builds in development
        </h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="mt-10"
      >
        <TiltCard
          maxTiltDeg={2.5}
          glowColor="cyan"
          scaleOnHover={1.006}
          className="glass-surface-strong glass-interactive rounded-2xl px-6 py-12 sm:p-10"
        >
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-400/25 bg-blue-500/10 text-blue-300 shadow-inner">
            <FolderKanban className="h-6 w-6" />
          </div>
          <h2 className="mt-4 font-road-rage text-3xl font-normal tracking-wide text-[#FF0000] sm:text-4xl">
            In Active Development — Publishing Soon
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-slate-300">
            Currently advancing second-year B.Tech Artificial Intelligence &amp; Data Science coursework, completing certified technical tracks across Python, MATLAB, and databases, and competing in campus hackathons. Full project case studies will be published here upon completion.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => onNavigateFeature('certifications')}
            className="touch-press inline-flex min-h-[44px] sm:min-h-[40px] items-center gap-2 rounded-lg bg-[#2563EB] px-5 py-2 text-xs font-semibold text-white hover:bg-blue-500 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span>View Certifications</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onNavigateFeature('achievements')}
            className="touch-press inline-flex min-h-[44px] sm:min-h-[40px] items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-5 py-2 text-xs font-semibold text-white hover:border-cyan-400/50 hover:bg-white/10 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span>View Achievements</span>
          </button>
        </div>
        </TiltCard>
      </motion.div>
    </section>
  );
}
