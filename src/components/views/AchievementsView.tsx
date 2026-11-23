import { motion } from 'motion/react';
import { ArrowUpRightIcon } from '../NextGenIcons';
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
    <section className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 sm:py-12 md:px-10 md:py-16">
      <div className="border-b border-white/10 pb-6 sm:pb-8">
        <div>
          <p className="font-kalam text-xs text-[#F05BEA] tabular-nums">
            02 · Achievements &amp; Participation
          </p>
          <h1 className="mt-2 font-road-rage text-[2rem] font-normal leading-[1.08] tracking-wide text-[#FF0000] sm:text-5xl [text-wrap:balance]">
            Certifications, campus participation, and bootcamp milestones
          </h1>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4 sm:mt-8 sm:gap-5">
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
                glowColor={isLead ? 'lime' : 'pink'}
                className={`glass-surface glass-interactive ${
                  isLead ? 'glass-accent-lime' : 'glass-accent-pink'
                } group overflow-hidden rounded-2xl`}
              >
                <article>
                  <button
                    type="button"
                    onClick={() => onSelectItem(item)}
                    className="touch-press flex w-full flex-col text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#C8FF27] md:flex-row md:items-stretch"
                  >
                    {/* Left-side Subject-Matched Visual Panel with Top-Left Index Number */}
                    <div className="relative flex w-full shrink-0 flex-col overflow-hidden border-b border-white/10 bg-gradient-to-br from-[#071B1B]/95 via-[#051414]/98 to-[#0B2525]/92 md:w-80 md:border-b-0 md:border-r md:border-[#F05BEA]/20">
                      <span
                        className={`pointer-events-none absolute left-3.5 top-3.5 z-20 inline-flex items-center rounded-md border px-2 py-0.5 font-kalam text-xs tabular-nums tracking-wider backdrop-blur-md ${
                          isLead
                            ? 'border-[#C8FF27]/55 bg-[#071B1B]/90 text-[#C8FF27] shadow-[0_0_16px_-4px_rgba(200,255,39,0.5)]'
                            : 'border-[#F05BEA]/45 bg-[#071B1B]/90 text-[#F05BEA] shadow-[0_0_16px_-4px_rgba(240,91,234,0.45)]'
                        }`}
                      >
                        {item.indexNumber}
                      </span>

                      <ProjectImageReveal
                        delayMs={idx * 50}
                        className="aspect-[16/10] w-full flex-1 md:aspect-auto md:min-h-[214px]"
                      >
                        {item.imageUrl ? (
                          <div className="relative h-full w-full overflow-hidden bg-[#051414]">
                            <ResilientImage
                              src={item.imageUrl}
                              alt={item.imageAlt ?? item.title}
                              fallbackTitle={item.title}
                              className="h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                            />
                            <div
                              aria-hidden="true"
                              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#051414]/45 via-transparent to-[#071B1B]/25"
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
                    <div className="flex flex-1 flex-col justify-between p-4 sm:p-6">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 font-kalam text-xs text-[#A0B2B2]">
                          <span className="text-[#FFFFFF]/90">{item.organization}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-kalam text-[#C8FF27] tabular-nums">
                            {item.timeframe}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{item.location}</span>
                        </div>

                        <div className="mt-2.5 flex items-start justify-between gap-3 sm:gap-4">
                          <h2
                            className={`font-road-rage font-normal tracking-wide text-[#FF0000] ${
                              isLead ? 'text-3xl sm:text-[2rem]' : 'text-2xl sm:text-[1.65rem]'
                            }`}
                          >
                            {item.title}
                          </h2>
                          <ArrowUpRightIcon
                            aria-hidden="true"
                            className="mt-1 h-4 w-4 shrink-0 text-[#A0B2B2] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#C8FF27]"
                          />
                        </div>

                        <p className="mt-2.5 font-kalam text-sm leading-relaxed text-[#A0B2B2]">
                          {item.summary}
                        </p>
                      </div>

                      <div className="mt-5 border-t border-white/10 pt-3.5 font-kalam text-xs text-[#F05BEA]">
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
