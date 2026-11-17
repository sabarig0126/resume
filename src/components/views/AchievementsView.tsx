import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { PortfolioItem } from '../../types/portfolio';
import { DomainArtwork } from '../DomainArtwork';
import { ProjectImageReveal } from '../ProjectImageReveal';
import { TiltCard } from '../TiltCard';

interface AchievementsViewProps {
  achievements: PortfolioItem[];
  onSelectItem: (item: PortfolioItem) => void;
  onStartSlideshow?: () => void;
}

export function AchievementsView({
  achievements,
  onSelectItem,
}: AchievementsViewProps) {
  return (
    <section className="mx-auto max-w-[1280px] px-6 py-12 md:px-10 md:py-16">
      <div className="border-b border-white/10 pb-8">
        <div>
          <p className="font-mono text-xs text-amber-400 tabular-nums">
            02 · Achievements &amp; Participation
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl [text-wrap:balance]">
            Honors, bootcamps, and hackathons
          </h1>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-5">
        {achievements.map((item, idx) => {
          const isLead = idx === 0;
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.25,
                delay: idx * 0.04,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <TiltCard
                maxTiltDeg={2.5}
                glowColor={isLead ? 'amber' : 'cyan'}
                className={`glass-surface glass-interactive group overflow-hidden rounded-2xl ${
                  isLead
                    ? 'border-amber-400/40 bg-gradient-to-br from-[#0D1B44]/85 to-[#081028]/85 hover:border-amber-400/70'
                    : 'hover:border-cyan-400/45'
                }`}
              >
              <article>
              <button
                type="button"
                onClick={() => onSelectItem(item)}
                className="touch-press flex w-full flex-col text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 md:flex-row md:items-stretch"
              >
                <ProjectImageReveal
                  delayMs={idx * 50}
                  className="w-full shrink-0 md:w-64 md:border-r md:border-white/10 [&>div>div]:h-36 [&>div>div]:md:h-full [&>div>div]:md:border-b-0"
                >
                  <DomainArtwork
                    category={item.category}
                    indexNumber={item.indexNumber}
                    isLead={isLead}
                  />
                </ProjectImageReveal>

                <div className="flex flex-1 flex-col justify-between p-6">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                      <span className="text-slate-300">{item.organization}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono text-amber-400 tabular-nums">
                        {item.timeframe}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{item.location}</span>
                    </div>

                    <div className="mt-2.5 flex items-start justify-between gap-4">
                      <h2
                        className={`font-display font-bold tracking-tight text-white transition-colors group-hover:text-blue-300 ${
                          isLead ? 'text-2xl sm:text-[1.6rem]' : 'text-xl'
                        }`}
                      >
                        {item.title}
                      </h2>
                      <ArrowUpRight
                        aria-hidden="true"
                        className="mt-1 h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-blue-300"
                      />
                    </div>

                    <p className="mt-2.5 text-sm leading-relaxed text-slate-300">
                      {item.summary}
                    </p>
                  </div>

                  <div className="mt-5 border-t border-white/10 pt-3.5 text-xs text-blue-200">
                    {item.highlights.join(' · ')}
                  </div>
                </div>
              </button>
              </article>
              </TiltCard>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
