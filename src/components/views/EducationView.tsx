import { motion } from 'motion/react';
import {
  ACADEMIC_SUBJECTS,
  AREAS_OF_INTEREST,
  PROFILE,
} from '../../data/projects';
import { AnimatedCounter } from '../AnimatedCounter';
import { SectionReveal } from '../SectionReveal';
import { TiltCard } from '../TiltCard';

export function EducationView() {
  return (
    <section className="mx-auto max-w-[1280px] px-6 py-12 md:px-10 md:py-16">
      <div className="border-b border-white/10 pb-8">
        <p className="font-mono text-xs text-amber-400 tabular-nums">
          05 · Educational Qualification &amp; Academic Learning
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl [text-wrap:balance]">
          Degree progress, school scores, and core subjects
        </h1>
      </div>

      {/* Undergraduate & School Education */}
      <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="h-full"
        >
          <TiltCard
            maxTiltDeg={3}
            glowColor="blue"
            className="h-full rounded-2xl border border-blue-500/40 bg-gradient-to-br from-[#0D1E4B]/90 to-[#081028]/90 p-6 sm:p-8 text-white backdrop-blur-md transition-colors hover:border-blue-400/60"
          >
            <p className="text-xs font-medium text-blue-300">
              Undergraduate Education
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold">
              {PROFILE.degree}
            </h2>
            <p className="mt-2 text-sm text-slate-300">{PROFILE.college}</p>
            <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-white/15 pt-5 text-xs">
              <div>
                <dt className="text-slate-400">Current Year</dt>
                <dd className="mt-1 font-semibold text-amber-400">
                  {PROFILE.yearLabel}
                </dd>
              </div>
              <div>
                <dt className="text-slate-400">Academic Year</dt>
                <dd className="mt-1 font-mono font-semibold text-white tabular-nums">
                  {PROFILE.academicYear}
                </dd>
              </div>
            </dl>
          </TiltCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
          className="h-full"
        >
          <TiltCard
            maxTiltDeg={3}
            glowColor="amber"
            className="glass-surface glass-interactive h-full rounded-2xl p-6 sm:p-8"
          >
            <p className="text-xs font-medium text-blue-300">School Education</p>
            <div className="mt-4 space-y-5">
              <div>
                <div className="flex items-baseline justify-between gap-2">
                  <h2 className="font-display text-lg font-bold text-white">
                    Higher Secondary (HSC)
                  </h2>
                  <span className="font-mono text-lg font-bold text-amber-400 tabular-nums">
                    <AnimatedCounter value={85.5} decimals={1} suffix="%" />
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-400">
                  Thanappa Gounder Matric Higher Secondary School, Dharmapuri
                </p>
              </div>

              <div className="border-t border-white/10 pt-5">
                <div className="flex items-baseline justify-between gap-2">
                  <h2 className="font-display text-lg font-bold text-white">
                    SSLC
                  </h2>
                  <span className="font-mono text-lg font-bold text-amber-400 tabular-nums">
                    <AnimatedCounter value={81} suffix="%" />
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-400">
                  Thanappa Gounder Matric Higher Secondary School, Dharmapuri
                </p>
              </div>
            </div>
          </TiltCard>
        </motion.div>
      </div>

      {/* Areas of Interest & Academic Learning */}
      <SectionReveal>
      <div className="mt-12 grid grid-cols-1 gap-10 border-t border-white/10 pt-10 lg:grid-cols-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-6"
        >
          <h2 className="font-display text-xl font-bold text-white">
            Areas of Interest
          </h2>
          <div className="mt-5 grid grid-cols-1 divide-y divide-white/10 border-y border-white/10 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
            <div className="divide-y divide-white/10 sm:pr-6">
              {AREAS_OF_INTEREST.slice(0, 4).map((area) => (
                <div
                  key={area.number}
                  className="flex items-center gap-3 py-3 text-sm"
                >
                  <span className="font-mono text-xs font-medium text-amber-400 tabular-nums">
                    {area.number}
                  </span>
                  <span className="font-medium text-slate-100">
                    {area.label}
                  </span>
                </div>
              ))}
            </div>
            <div className="divide-y divide-white/10 sm:pl-6">
              {AREAS_OF_INTEREST.slice(4, 8).map((area) => (
                <div
                  key={area.number}
                  className="flex items-center gap-3 py-3 text-sm"
                >
                  <span className="font-mono text-xs font-medium text-amber-400 tabular-nums">
                    {area.number}
                  </span>
                  <span className="font-medium text-slate-100">
                    {area.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.3, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-6"
        >
          <h2 className="font-display text-xl font-bold text-white">
            Academic Learning Subjects
          </h2>
          <div className="mt-5 grid grid-cols-1 gap-x-8 gap-y-3 border-y border-white/10 py-5 sm:grid-cols-2">
            {ACADEMIC_SUBJECTS.map((subject) => (
              <div
                key={subject}
                className="flex items-start gap-2.5 text-sm font-medium text-slate-200"
              >
                <span aria-hidden="true" className="text-blue-400">
                  ·
                </span>
                <span>{subject}</span>
              </div>
            ))}
          </div>

          <div className="glass-surface mt-6 rounded-xl p-5">
            <p className="text-xs font-semibold text-blue-300">
              Learning Goal
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-200">
              {PROFILE.learningGoal}
            </p>
          </div>
        </motion.div>
      </div>
      </SectionReveal>
    </section>
  );
}
