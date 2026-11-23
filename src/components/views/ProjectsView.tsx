import { motion } from 'motion/react';
import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  KanbanBoardIcon,
} from '../NextGenIcons';
import { FeatureId, PortfolioItem } from '../../types/portfolio';
import { TiltCard } from '../TiltCard';

interface ProjectsViewProps {
  items: PortfolioItem[];
  onSelectItem: (item: PortfolioItem) => void;
  onNavigateFeature: (feature: FeatureId) => void;
}

export function ProjectsView({
  items,
  onSelectItem,
  onNavigateFeature,
}: ProjectsViewProps) {
  const portfolioRecords = items.filter(
    (item) =>
      item.category === 'Projects' ||
      item.category === 'Certifications' ||
      item.category === 'Academic'
  );

  return (
    <section className="mx-auto max-w-[1280px] overflow-x-clip px-4 py-8 sm:px-6 sm:py-12 md:px-10 md:py-16">
      <div className="border-b border-white/10 pb-6 sm:pb-8">
        <p className="font-kalam text-xs text-[#F05BEA] tabular-nums">
          06 · Projects
        </p>
        <h1 className="mt-2 font-road-rage text-[2rem] font-normal leading-[1.08] tracking-wide text-[#FF0000] sm:text-5xl [text-wrap:balance]">
          Projects Coming Soon
        </h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="mt-8 sm:mt-10"
      >
        <TiltCard
          maxTiltDeg={2.5}
          glowColor="pink"
          scaleOnHover={1.006}
          className="glass-surface-strong glass-interactive glass-accent-pink rounded-2xl px-4 py-8 sm:p-10"
        >
          <div className="relative z-20 mx-auto max-w-2xl text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-[#F05BEA]/35 bg-[#F05BEA]/12 text-[#F05BEA] shadow-inner">
              <KanbanBoardIcon className="h-6 w-6" />
            </div>
            <h2 className="mt-4 font-road-rage text-3xl font-normal tracking-wide text-[#FF0000] sm:text-4xl">
              Projects Coming Soon
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-[#A0B2B2]">
              No completed projects have been published yet. As I continue my 2nd-year B.Tech studies in Artificial Intelligence and Data Science, upcoming academic and hands-on projects will be shared here once completed.
            </p>
          </div>

          <div className="relative z-20 mt-6 flex flex-col items-stretch justify-center gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center">
            <button
              type="button"
              onClick={() => onNavigateFeature('certifications')}
              className="touch-press inline-flex min-h-[44px] w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-[#C8FF27] px-5 py-2 text-xs font-bold text-[#071B1B] shadow-[0_0_24px_-6px_rgba(200,255,39,0.55)] hover:bg-[#d5ff52] hover:shadow-[0_0_28px_-4px_rgba(200,255,39,0.7)] whitespace-nowrap sm:min-h-[40px] sm:w-auto cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F05BEA]"
            >
              <span>View Certifications</span>
              <ArrowRightIcon className="h-3.5 w-3.5 text-[#071B1B]" />
            </button>
            <button
              type="button"
              onClick={() => onNavigateFeature('achievements')}
              className="touch-press inline-flex min-h-[44px] w-full shrink-0 items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/[0.04] px-5 py-2 text-xs font-semibold text-[#FFFFFF] hover:border-[#F05BEA]/60 hover:bg-[#F05BEA]/10 whitespace-nowrap sm:min-h-[40px] sm:w-auto cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8FF27]"
            >
              <span>View Achievements</span>
            </button>
          </div>
        </TiltCard>
      </motion.div>

      {/* Portfolio Item Records & Details Viewer */}
      {portfolioRecords.length > 0 && (
        <div className="mt-10 border-t border-white/10 pt-8 sm:mt-12 sm:pt-10">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-kalam text-xs text-[#C8FF27]">
                Verified Portfolio Records
              </p>
              <h2 className="mt-1 font-road-rage text-2xl font-normal tracking-wide text-[#FF0000] sm:text-3xl">
                Certifications &amp; Academic Learning Details
              </h2>
            </div>
            <p className="font-kalam text-xs text-[#A0B2B2] tabular-nums">
              {portfolioRecords.length} Records Available
            </p>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:mt-6 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
            {portfolioRecords.map((item, idx) => {
              const isLime = idx % 2 === 0;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.26,
                    delay: idx * 0.04,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="h-full"
                >
                  <TiltCard
                    maxTiltDeg={3}
                    glowColor={isLime ? 'lime' : 'pink'}
                    className={`glass-surface glass-interactive ${
                      isLime ? 'glass-accent-lime' : 'glass-accent-pink'
                    } group flex h-full flex-col justify-between rounded-2xl p-5 sm:p-6`}
                  >
                    <div className="relative z-20">
                      <div className="flex items-center justify-between gap-2 font-kalam text-xs">
                        <span className="font-bold text-[#C8FF27] tabular-nums">
                          {item.indexNumber}
                        </span>
                        <span className="text-[#F05BEA]">{item.category}</span>
                      </div>

                      <h3 className="mt-2.5 font-caveat text-xl font-normal tracking-wide text-[#FFFF00] sm:text-2xl">
                        {item.title}
                      </h3>

                      <p className="mt-1 font-kalam text-xs text-[#A0B2B2]">
                        {item.organization} · {item.timeframe}
                      </p>

                      <p className="mt-3 font-kalam text-sm leading-relaxed text-[#FFFFFF]/85">
                        {item.summary}
                      </p>
                    </div>

                    <div className="relative z-20 mt-5 border-t border-white/10 pt-4">
                      <button
                        type="button"
                        onClick={() => onSelectItem(item)}
                        aria-label={`View details for ${item.title}`}
                        className="touch-press inline-flex min-h-[44px] sm:min-h-[38px] w-full items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/[0.04] px-4 py-2 font-kalam text-xs font-bold text-[#FFFFFF] transition-colors duration-200 hover:border-[#C8FF27]/70 hover:bg-[#C8FF27]/15 hover:text-[#C8FF27] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8FF27]"
                      >
                        <span>View Details</span>
                        <ArrowUpRightIcon className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </TiltCard>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
