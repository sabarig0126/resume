import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { PortfolioItem } from '../../types/portfolio';
import { DomainArtwork } from '../DomainArtwork';
import { ProjectImageReveal } from '../ProjectImageReveal';
import { ResilientImage } from '../ResilientImage';
import { TiltCard } from '../TiltCard';

interface AchievementsViewProps {
  achievements: PortfolioItem[];
  onSelectItem: (item: PortfolioItem) => void;
}

export function AchievementsView({
  achievements,
  onSelectItem,
}: AchievementsViewProps) {
  return (
    <section className="mx-auto max-w-[1280px] px-6 py-12 md:px-10 md:py-16">
      <div className="border-b border-white/10 pb-8">
        <div>
          <p className="font-kalam text-xs text-amber-400 tabular-nums">
            02 · Achievements &amp; Milestones
          </p>
          <h1 className="mt-2 font-road-rage text-4xl font-normal tracking-wide text-[#FF0000] sm:text-5xl [text-wrap:balance]">
            Academic honors, hackathons, and entrepreneurship milestones
          </h1>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-5">
        {achievements.map((item, idx) => {
          const isLead = idx === 0;
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.28,
                delay: idx * 0.05,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <TiltCard
                maxTiltDeg={2.5}
                glowColor={isLead ? 'amber' : 'cyan'}
                className="glass-surface glass-interactive glass-accent-cyan-gold group overflow-hidden rounded-2xl"
              >
                <article>
                  <button
                    type="button"
                    onClick={() => onSelectItem(item)}
                    className="touch-press flex w-full flex-col text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-400 md:flex-row md:items-stretch"
                  >
                    {/* Left-side Subject-Matched Visual Panel with Top-Left Index Number */}
                    <div className="relative flex w-full shrink-0 flex-col overflow-hidden border-b border-white/10 bg-gradient-to-br from-[#06112E]/92 via-[#040B1F]/96 to-[#0B193D]/90 md:w-80 md:border-b-0 md:border-r md:border-cyan-300/15">
                      <span
                        className={`pointer-events-none absolute left-3.5 top-3.5 z-20 inline-flex items-center rounded-md border px-2 py-0.5 font-kalam text-xs tabular-nums tracking-wider backdrop-blur-md ${
                          isLead
                            ? 'border-amber-300/45 bg-[#07112B]/85 text-amber-200 shadow-[0_0_16px_-4px_rgba(251,191,36,0.45)]'
                            : 'border-cyan-300/35 bg-[#07112B]/85 text-cyan-200 shadow-[0_0_16px_-4px_rgba(34,211,238,0.4)]'
                        }`}
                      >
                        {item.indexNumber}
                      </span>

                      <ProjectImageReveal
                        delayMs={idx * 50}
                        className="aspect-[16/10] w-full flex-1 md:aspect-auto md:min-h-[214px]"
                      >
                        {item.imageUrl ? (
                          <div className="relative h-full w-full overflow-hidden bg-[#050C20]">
                            <ResilientImage
                              src={item.imageUrl}
                              alt={item.imageAlt ?? item.title}
                              fallbackTitle={item.title}
                              className="h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                            />
                            <div
                              aria-hidden="true"
                              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#040A1C]/45 via-transparent to-[#071330]/25"
                            />
                          </div>
                        ) : (
                          <DomainArtwork
                            category={item.category}
                            indexNumber={item.indexNumber}
                            isLead={isLead}
                          />
                        )}
                      </ProjectImageReveal>
                    </div>

                    {/* Right-side Achievement Details */}
                    <div className="flex flex-1 flex-col justify-between p-6">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 font-kalam text-xs text-slate-400">
                          <span className="text-slate-300">{item.organization}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-kalam text-amber-400 tabular-nums">
                            {item.timeframe}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{item.location}</span>
                        </div>

                        <div className="mt-2.5 flex items-start justify-between gap-4">
                          <h2
                            className={`font-road-rage font-normal tracking-wide text-[#FF0000] ${
                              isLead ? 'text-3xl sm:text-[2rem]' : 'text-2xl sm:text-[1.65rem]'
                            }`}
                          >
                            {item.title}
                          </h2>
                          <ArrowUpRight
                            aria-hidden="true"
                            className="mt-1 h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-cyan-300"
                          />
                        </div>

                        <p className="mt-2.5 font-kalam text-sm leading-relaxed text-slate-300">
                          {item.summary}
                        </p>
                      </div>

                      <div className="mt-5 border-t border-white/10 pt-3.5 font-kalam text-xs text-blue-200">
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
