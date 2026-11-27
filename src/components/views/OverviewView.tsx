import { motion } from 'motion/react';
import {
  FileDossierIcon,
  LocationBeaconIcon,
} from '../NextGenIcons';
import { PROFILE, PROOF_METRICS } from '../../data/projects';
import { FeatureId } from '../../types/portfolio';
import { AnimatedCounter } from '../AnimatedCounter';
import { GlassCard } from '../GlassCard';
import { SectionReveal } from '../SectionReveal';
import { TiltCard } from '../TiltCard';

interface OverviewViewProps {
  onNavigateFeature: (feature: FeatureId) => void;
}

export function OverviewView({ onNavigateFeature }: OverviewViewProps) {
  return (
    <section className="relative flex w-full flex-1 flex-col overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-[#071B1B]/25 to-[#071B1B]/55"
      />

      <div className="relative mx-auto flex w-full max-w-[1280px] flex-1 flex-col justify-between px-4 py-6 sm:px-6 sm:py-10 md:px-10 md:py-12">
        <div className="grid flex-1 grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-12 lg:items-center lg:gap-12">
          {/* Left: About Me & Career Objective */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col justify-center lg:col-span-7"
          >
            <div>
              <h1 className="font-road-rage text-[2.85rem] font-normal leading-[1.04] tracking-[0.02em] text-[#FF4D4D] sm:text-6xl lg:text-[4.6rem] [text-wrap:balance]">
                Sabarivasan&apos;s Profile
              </h1>

              <div className="mt-7 space-y-6 sm:mt-8 sm:space-y-7">
                <div>
                  <h2 className="font-caveat text-xl font-normal tracking-wide text-[#FFFF00] sm:text-2xl">
                    About Me
                  </h2>
                  <p className="mt-2 max-w-[64ch] text-base leading-relaxed text-[#B8C7C7] sm:text-[1.1rem]">
                    {PROFILE.aboutLead}
                  </p>
                </div>

                <div className="border-t border-white/10 pt-6">
                  <h2 className="font-caveat text-xl font-normal tracking-wide text-[#FFFF00] sm:text-2xl">
                    Career Objective
                  </h2>
                  <p className="mt-2 max-w-[64ch] text-[15px] leading-relaxed text-[#B8C7C7] sm:text-[1.05rem]">
                    {PROFILE.careerObjective}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: Personal Details Card */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
            className="flex justify-start lg:col-span-5 lg:justify-end"
          >
            <TiltCard
              maxTiltDeg={2.4}
              glowColor="pink"
              className="w-full max-w-[520px] rounded-2xl"
            >
            <GlassCard
              strong
              interactive
              accent="pink"
              className="flex w-full flex-col justify-between rounded-2xl p-6 text-[#FFFFFF] sm:p-8 lg:min-h-[450px] lg:p-9"
            >
              <div>
                <p className="font-caveat text-lg font-normal tracking-wide text-[#FFFF00]">
                  Candidate Profile
                </p>
                <h2 className="mt-1 font-caveat text-3xl font-normal tracking-wide text-[#FFFF00] sm:text-[2.2rem]">
                  {PROFILE.name}
                </h2>

                <dl className="mt-6 space-y-4.5 border-t border-white/10 pt-6 text-sm sm:text-[15px]">
                  <div>
                    <dt className="text-xs text-[#A0B2B2] sm:text-[13px]">Department</dt>
                    <dd className="mt-0.5 font-medium text-[#FFFFFF]">
                      Artificial Intelligence &amp; Data Science
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs text-[#A0B2B2] sm:text-[13px]">College</dt>
                    <dd className="mt-0.5 font-medium text-[#FFFFFF]">
                      {PROFILE.college}
                    </dd>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <dt className="text-xs text-[#A0B2B2] sm:text-[13px]">Year</dt>
                      <dd className="mt-0.5 font-medium text-[#C8FF27]">
                        {PROFILE.yearLabel}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-[#A0B2B2] sm:text-[13px]">Location</dt>
                      <dd className="mt-0.5 flex items-center gap-1.5 font-medium text-[#FFFFFF]">
                        <LocationBeaconIcon className="h-3.5 w-3.5 text-[#F05BEA]" />
                        <span>{PROFILE.location}</span>
                      </dd>
                    </div>
                  </div>
                </dl>
              </div>

              <div className="mt-7 border-t border-white/10 pt-6">
                <div className="grid grid-cols-1 gap-2.5 sm:flex sm:flex-wrap sm:items-center">
                  <button
                    type="button"
                    onClick={() => onNavigateFeature('resume')}
                    className="touch-press inline-flex min-h-[46px] w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-[#C8FF27] px-4 py-2.5 text-sm font-bold text-[#071B1B] shadow-[0_0_24px_-6px_rgba(200,255,39,0.55)] hover:bg-[#d5ff52] hover:shadow-[0_0_28px_-4px_rgba(200,255,39,0.7)] whitespace-nowrap sm:w-auto sm:flex-1 cursor-pointer"
                  >
                    <FileDossierIcon className="h-4 w-4 text-[#071B1B]" />
                    <span>Open Resume</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigateFeature('portfolioPdf')}
                    className="touch-press inline-flex min-h-[46px] w-full shrink-0 items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-[#FFFFFF] hover:border-[#F05BEA]/65 hover:bg-[#F05BEA]/10 whitespace-nowrap sm:w-auto sm:flex-1 cursor-pointer"
                  >
                    <FileDossierIcon className="h-4 w-4 text-[#F05BEA]" />
                    <span>Open Portfolio</span>
                  </button>
                </div>
              </div>
            </GlassCard>
            </TiltCard>
          </motion.div>
        </div>

        {/* 4-Column Academic & Credential Summary Boxes */}
        <SectionReveal>
        <div className="mt-8 grid grid-cols-1 gap-3.5 border-t border-white/10 pt-6 sm:mt-10 sm:grid-cols-2 sm:gap-5 sm:pt-8 lg:grid-cols-4">
          {PROOF_METRICS.map((metric, idx) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.32,
                delay: 0.1 + idx * 0.05,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="h-full"
            >
              <TiltCard
                maxTiltDeg={4}
                glowColor={idx % 2 === 1 ? 'lime' : 'pink'}
                className="glass-surface glass-interactive flex h-full flex-col justify-between space-y-2 rounded-xl p-5 sm:p-6"
              >
                <div className="font-road-rage text-4xl font-normal tracking-wide text-[#FF4D4D] tabular-nums sm:text-[2.65rem]">
                  <AnimatedCounter value={metric.value} />
                </div>
                <div className="font-kalam text-base font-bold text-[#FFFFFF]">
                  {metric.label}
                </div>
                <p className="font-kalam text-[13.5px] leading-relaxed text-[#A0B2B2]">
                  {metric.context}
                </p>
              </TiltCard>
            </motion.div>
          ))}
        </div>
        </SectionReveal>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:mt-7 md:grid-cols-2">
          <p className="nav-hint-glass relative flex h-full w-full items-center justify-center rounded-xl px-4 py-3.5 text-center text-xs leading-relaxed text-[#FFF7ED] sm:px-6 sm:py-4 sm:text-[13.5px]">
            <span aria-hidden="true" className="nav-hint-sweep" />
            <span className="relative z-10">
              Use the <span className="nav-hint-menu">Menu</span> at the top right to explore Achievements, Technical Skills, Certifications, Education, Projects, Resume, Portfolio, and Contact.
            </span>
          </p>

          <p className="nav-hint-glass relative flex h-full w-full items-center justify-center rounded-xl px-4 py-3.5 text-center text-xs leading-relaxed text-[#FFF7ED] sm:px-6 sm:py-4 sm:text-[13.5px]">
            <span aria-hidden="true" className="nav-hint-sweep" />
            <span className="relative z-10">
              Use the <span className="nav-hint-menu">App Logo</span> at the top left to explore my About Me Highlight Card.
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
