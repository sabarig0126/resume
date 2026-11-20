import { motion } from 'motion/react';
import { FileText, MapPin } from 'lucide-react';
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
    <section className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-[#050A18]/20 to-[#050A18]/50"
      />

      <div className="relative mx-auto max-w-[1280px] px-6 py-12 md:px-10 md:py-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-stretch lg:gap-12">
          {/* Left: About Me & Career Objective */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col justify-center lg:col-span-7"
          >
            <div>
              <h1 className="font-road-rage text-5xl font-normal tracking-[0.02em] leading-[1.05] text-[#FF0000] sm:text-6xl lg:text-[4rem] [text-wrap:balance]">
                Sabarivasan&apos;s Profile
              </h1>

              <div className="mt-6 space-y-5">
                <div>
                  <h2 className="font-caveat text-base font-normal tracking-wide text-[#FFFF00]">
                    About Me
                  </h2>
                  <p className="mt-1.5 max-w-[60ch] text-base leading-relaxed text-slate-200">
                    {PROFILE.aboutLead}
                  </p>
                </div>

                <div className="border-t border-white/10 pt-5">
                  <h2 className="font-caveat text-base font-normal tracking-wide text-[#FFFF00]">
                    Career Objective
                  </h2>
                  <p className="mt-1.5 max-w-[60ch] text-sm leading-relaxed text-slate-300">
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
              glowColor="blue"
              className="w-full max-w-[500px] rounded-2xl lg:w-[500px]"
            >
            <GlassCard
              strong
              interactive
              accent="blue"
              className="flex w-full flex-col justify-between rounded-2xl p-6 text-white sm:p-8 lg:min-h-[430px]"
            >
              <div>
                <p className="font-caveat text-base font-normal tracking-wide text-[#FFFF00]">
                  Candidate Profile
                </p>
                <h2 className="mt-1 font-caveat text-3xl font-normal tracking-wide text-[#FFFF00]">
                  {PROFILE.name}
                </h2>

                <dl className="mt-6 space-y-4 border-t border-white/10 pt-5 text-sm">
                  <div>
                    <dt className="text-xs text-slate-400">Department</dt>
                    <dd className="mt-0.5 font-medium text-white">
                      Artificial Intelligence &amp; Data Science
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs text-slate-400">College</dt>
                    <dd className="mt-0.5 font-medium text-white">
                      {PROFILE.college}
                    </dd>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <dt className="text-xs text-slate-400">Year</dt>
                      <dd className="mt-0.5 font-medium text-amber-400">
                        {PROFILE.yearLabel}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-400">Location</dt>
                      <dd className="mt-0.5 flex items-center gap-1.5 font-medium text-white">
                        <MapPin className="h-3.5 w-3.5 text-blue-400" />
                        <span>{PROFILE.location}</span>
                      </dd>
                    </div>
                  </div>
                </dl>
              </div>

              <div className="mt-6 border-t border-white/10 pt-5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => onNavigateFeature('resume')}
                    className="touch-press inline-flex min-h-[44px] flex-1 shrink-0 items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white hover:border-blue-400/60 hover:bg-white/10 whitespace-nowrap cursor-pointer"
                  >
                    <FileText className="h-4 w-4 text-blue-300" />
                    <span>Open Resume PDF</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigateFeature('portfolioPdf')}
                    className="touch-press inline-flex min-h-[44px] flex-1 shrink-0 items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white hover:border-cyan-400/60 hover:bg-white/10 whitespace-nowrap cursor-pointer"
                  >
                    <FileText className="h-4 w-4 text-amber-400" />
                    <span>Open Portfolio PDF</span>
                  </button>
                </div>
              </div>
            </GlassCard>
            </TiltCard>
          </motion.div>
        </div>

        {/* 4-Column Academic & Credential Summary Boxes */}
        <SectionReveal>
        <div className="mt-10 grid grid-cols-1 gap-4 border-t border-white/10 pt-8 sm:grid-cols-2 lg:grid-cols-4">
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
                glowColor={idx === 1 || idx === 2 ? 'amber' : 'cyan'}
                className="glass-surface glass-interactive h-full space-y-1.5 rounded-xl p-5"
              >
                <div className="font-road-rage text-4xl font-normal tracking-wide text-[#FF0000] tabular-nums">
                  <AnimatedCounter value={metric.value} />
                </div>
                <div className="font-kalam text-sm font-bold text-slate-100">
                  {metric.label}
                </div>
                <p className="font-kalam text-[13px] leading-relaxed text-slate-300">
                  {metric.context}
                </p>
              </TiltCard>
            </motion.div>
          ))}
        </div>
        </SectionReveal>

        <div className="mt-7 flex justify-center">
          <p className="nav-hint-glass relative mx-auto max-w-full rounded-xl px-4 py-3 text-center text-xs leading-relaxed text-amber-100/90 sm:px-6 sm:py-3.5 sm:text-[13px]">
            <span aria-hidden="true" className="nav-hint-sweep" />
            <span className="relative z-10">
              Use the <span className="nav-hint-menu">Menu</span> at the top right to explore Achievements, Technical Skills, Certifications, Education, Projects, Resume PDF, Portfolio PDF, and Contact.
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
