import { motion } from 'motion/react';
import { ArrowUpRightIcon } from '../NextGenIcons';
import { prefetchModalChunk, warmImage } from '../../lib/assetPreloader';
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
    <section className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col justify-between px-4 py-6 sm:px-6 sm:py-10 md:px-10 md:py-12">
      <div className="shrink-0 border-b border-white/10 pb-5 sm:pb-7">
        <div>
          <p className="font-kalam text-xs text-[#F05BEA] tabular-nums">
            02 · Achievements &amp; Participation
          </p>
          <h1 className="mt-2 font-road-rage text-[2.2rem] font-normal leading-[1.06] tracking-wide text-[#FF4D4D] sm:text-5xl lg:text-[3.35rem] [text-wrap:balance]">
            Certifications, campus participation, and bootcamp milestones
          </h1>
        </div>
      </div>

      <div className="mt-6 flex flex-1 flex-col justify-evenly gap-5 sm:mt-8 sm:gap-6">
        {achievements.map((item, idx) => {
          const isLead = idx === 0;
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.09,
                delay: idx * 0.015,
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
                    data-sfx="custom"
                    onPointerEnter={() => {
                      prefetchModalChunk('projectLightbox');
                      if (item.imageUrl) {
                        warmImage(item.imageUrl, { decode: true, priority: 'high' });
                      }
                    }}
                    onFocus={() => {
                      prefetchModalChunk('projectLightbox');
                      if (item.imageUrl) {
                        warmImage(item.imageUrl, { decode: true, priority: 'high' });
                      }
                    }}
                    onClick={() => onSelectItem(item)}
                    className="touch-press flex w-full flex-col text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#C8FF27] md:flex-row md:items-stretch"
                  >
                    {/* Left-side Subject-Matched Visual Panel with Top-Left Index Number */}
                    <div className="relative flex w-full shrink-0 flex-col overflow-hidden border-b border-white/10 bg-gradient-to-br from-[#071B1B]/95 via-[#051414]/98 to-[#0B2525]/92 md:w-88 lg:w-96 md:border-b-0 md:border-r md:border-[#F05BEA]/20">
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
                        delayMs={idx * 15}
                        className="aspect-[16/10] w-full flex-1 md:aspect-auto md:min-h-[228px]"
                      >
                        {item.imageUrl ? (
                          item.preserveFullImage ? (
                            <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[#051414]">
                              <div className="relative aspect-[16/9] max-h-full w-full max-w-full overflow-hidden">
                                <ResilientImage
                                  src={item.imageUrl}
                                  alt={item.imageAlt ?? item.title}
                                  fallbackTitle={item.title}
                                  loading="eager"
                                  fetchPriority={isLead ? 'high' : undefined}
                                  className="h-full w-full object-contain transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                                />
                                <div
                                  aria-hidden="true"
                                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#051414]/35 via-transparent to-[#071B1B]/15"
                                />
                                {item.badgeLogoUrl && (
                                  <span className="pointer-events-none absolute right-2.5 top-2.5 z-20 flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-white/85 bg-white p-1 shadow-[0_6px_18px_rgba(0,0,0,0.55),0_0_0_2px_rgba(7,27,27,0.4)] sm:h-10 sm:w-10">
                                    <img
                                      src={item.badgeLogoUrl}
                                      alt={item.badgeLogoAlt ?? `${item.title} logo`}
                                      className="h-full w-full object-contain"
                                      loading="eager"
                                      decoding="async"
                                    />
                                  </span>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div
                              className={`relative h-full w-full overflow-hidden ${
                                item.imageUrl.includes('/assets/certificates/') ||
                                item.imageUrl.includes('/assets/organizations/')
                                  ? 'bg-white p-3'
                                  : 'bg-[#051414]'
                              }`}
                            >
                              <ResilientImage
                                src={item.imageUrl}
                                alt={item.imageAlt ?? item.title}
                                fallbackTitle={item.title}
                                loading="eager"
                                fetchPriority={isLead ? 'high' : undefined}
                                className={`h-full w-full transition-transform duration-500 ease-out ${
                                  item.imageUrl.includes('/assets/certificates/') ||
                                  item.imageUrl.includes('/assets/organizations/')
                                    ? 'object-contain group-hover:scale-[1.02]'
                                    : 'object-cover object-center group-hover:scale-[1.03]'
                                }`}
                              />
                              {!item.imageUrl.includes('/assets/certificates/') &&
                                !item.imageUrl.includes('/assets/organizations/') && (
                                  <div
                                    aria-hidden="true"
                                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#051414]/45 via-transparent to-[#071B1B]/25"
                                  />
                                )}
                            </div>
                          )
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
                    <div className="flex flex-1 flex-col justify-between p-5 sm:p-7">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 font-kalam text-xs text-[#A0B2B2] sm:text-[13px]">
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
                            className={`font-road-rage font-normal tracking-wide text-[#FF4D4D] ${
                              isLead ? 'text-3xl sm:text-[2.15rem]' : 'text-2xl sm:text-[1.85rem]'
                            }`}
                          >
                            {item.title}
                          </h2>
                          <ArrowUpRightIcon
                            aria-hidden="true"
                            className="mt-1 h-4.5 w-4.5 shrink-0 text-[#A0B2B2] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#C8FF27]"
                          />
                        </div>

                        <p className="mt-3 font-kalam text-sm leading-relaxed text-[#A0B2B2] sm:text-[15.5px]">
                          {item.summary}
                        </p>
                      </div>

                      <div className="mt-5 border-t border-white/10 pt-3.5 font-kalam text-xs text-[#F05BEA] sm:text-[13px]">
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
