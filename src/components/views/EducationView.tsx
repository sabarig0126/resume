import { motion } from 'motion/react';
import {
  ACADEMIC_SUBJECTS,
  AREAS_OF_INTEREST,
  PROFILE,
} from '../../data/projects';
import { AnimatedCounter } from '../AnimatedCounter';
import { GlassCard } from '../GlassCard';
import { SectionReveal } from '../SectionReveal';
import { TiltCard } from '../TiltCard';

export function EducationView() {
  return (
    <section className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col justify-between px-4 py-6 sm:px-6 sm:py-10 md:px-10 md:py-12">
      <div className="shrink-0 border-b border-white/10 pb-5 sm:pb-7">
        <p className="font-kalam text-xs text-[#F05BEA] tabular-nums">
          05 · Academic Background &amp; Core Coursework
        </p>
        <h1 className="mt-2 font-road-rage text-[2.2rem] font-normal leading-[1.06] tracking-wide text-[#FF4D4D] sm:text-5xl lg:text-[3.35rem] [text-wrap:balance]">
          Undergraduate degree progress, academic record, and core AI/DS foundations
        </h1>
      </div>

      {/* Undergraduate & School Education */}
      <div className="mt-6 grid grid-cols-1 gap-5 sm:mt-8 sm:gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="h-full"
        >
          <TiltCard
            maxTiltDeg={3}
            glowColor="pink"
            className="glass-surface-strong glass-interactive glass-accent-pink flex h-full flex-col justify-between rounded-2xl p-6 text-[#FFFFFF] sm:p-8 lg:p-9"
          >
            <div>
              <p className="font-caveat text-lg font-normal tracking-wide text-[#FFFF00]">
                Undergraduate Degree
              </p>
              <h2 className="mt-2.5 font-road-rage text-[2rem] font-normal leading-tight tracking-wide text-[#FF4D4D] sm:text-4xl">
                {PROFILE.degree}
              </h2>
              <p className="mt-2.5 font-kalam text-base text-[#A0B2B2]">{PROFILE.college}</p>
            </div>
            <dl className="mt-7 grid grid-cols-2 gap-4 border-t border-white/10 pt-6 text-sm sm:text-[15px]">
              <div>
                <dt className="text-xs text-[#A0B2B2] sm:text-[13px]">Current Year</dt>
                <dd className="mt-1 font-bold text-[#C8FF27]">
                  {PROFILE.yearLabel}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[#A0B2B2] sm:text-[13px]">Academic Year</dt>
                <dd className="mt-1 font-kalam font-bold text-[#FFFFFF] tabular-nums">
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
            glowColor="lime"
            className="glass-surface glass-interactive glass-accent-lime flex h-full flex-col justify-between rounded-2xl p-6 sm:p-8 lg:p-9"
          >
            <p className="font-caveat text-lg font-normal tracking-wide text-[#FFFF00]">
              Secondary &amp; Higher Secondary Record
            </p>
            <div className="mt-5 space-y-6">
              <div>
                <div className="flex items-baseline justify-between gap-2">
                  <h2 className="font-caveat text-2xl font-normal tracking-wide text-[#FFFF00] sm:text-[1.7rem]">
                    Higher Secondary (HSC)
                  </h2>
                  <span className="font-kalam text-xl font-bold text-[#C8FF27] tabular-nums">
                    <AnimatedCounter value={85.5} decimals={1} suffix="%" />
                  </span>
                </div>
                <p className="mt-1.5 font-kalam text-[15px] text-[#A0B2B2]">
                  Thanappa Gounder Matric Higher Secondary School, Dharmapuri
                </p>
              </div>

              <div className="border-t border-white/10 pt-6">
                <div className="flex items-baseline justify-between gap-2">
                  <h2 className="font-caveat text-2xl font-normal tracking-wide text-[#FFFF00] sm:text-[1.7rem]">
                    SSLC
                  </h2>
                  <span className="font-kalam text-xl font-bold text-[#C8FF27] tabular-nums">
                    <AnimatedCounter value={81} suffix="%" />
                  </span>
                </div>
                <p className="mt-1.5 font-kalam text-[15px] text-[#A0B2B2]">
                  Thanappa Gounder Matric Higher Secondary School, Dharmapuri
                </p>
              </div>
            </div>
          </TiltCard>
        </motion.div>
      </div>

      {/* Areas of Interest & Academic Learning */}
      <SectionReveal>
      <div className="mt-8 grid flex-1 grid-cols-1 gap-8 border-t border-white/10 pt-8 sm:mt-10 sm:gap-10 sm:pt-10 lg:grid-cols-12 lg:items-stretch">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col lg:col-span-6"
        >
          <h2 className="font-road-rage text-2xl font-normal tracking-wide text-[#FF4D4D] sm:text-3xl">
            Areas of Interest
          </h2>
          <div className="mt-5 grid flex-1 grid-cols-1 divide-y divide-white/10 border-y border-white/10 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
            <div className="flex flex-col justify-between divide-y divide-white/10 sm:pr-6">
              {AREAS_OF_INTEREST.slice(0, 4).map((area) => (
                <div
                  key={area.number}
                  className="flex flex-1 items-center gap-3 py-3.5 font-kalam text-sm sm:py-4 sm:text-[15px]"
                >
                  <span className="font-kalam text-xs font-bold text-[#C8FF27] tabular-nums sm:text-sm">
                    {area.number}
                  </span>
                  <span className="font-normal text-[#FFFFFF]">
                    {area.label}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex flex-col justify-between divide-y divide-white/10 sm:pl-6">
              {AREAS_OF_INTEREST.slice(4, 8).map((area) => (
                <div
                  key={area.number}
                  className="flex flex-1 items-center gap-3 py-3.5 font-kalam text-sm sm:py-4 sm:text-[15px]"
                >
                  <span className="font-kalam text-xs font-bold text-[#C8FF27] tabular-nums sm:text-sm">
                    {area.number}
                  </span>
                  <span className="font-normal text-[#FFFFFF]">
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
          className="flex flex-col justify-between lg:col-span-6"
        >
          <div>
            <h2 className="font-road-rage text-2xl font-normal tracking-wide text-[#FF4D4D] sm:text-3xl">
              Academic Learning
            </h2>
            <div className="mt-5 grid grid-cols-1 gap-x-8 gap-y-3.5 border-y border-white/10 py-5 sm:grid-cols-2 sm:py-6">
              {ACADEMIC_SUBJECTS.map((subject) => (
                <div
                  key={subject}
                  className="flex items-start gap-2.5 text-sm font-medium text-[#A0B2B2] sm:text-[15px]"
                >
                  <span aria-hidden="true" className="text-[#F05BEA]">
                    ·
                  </span>
                  <span className="text-[#FFFFFF]">{subject}</span>
                </div>
              ))}
            </div>
          </div>

          <GlassCard interactive accent="pink" className="mt-6 rounded-xl p-5 sm:p-6">
            <p className="font-caveat text-lg font-normal tracking-wide text-[#FFFF00]">
              Learning Goal
            </p>
            <p className="mt-1.5 font-kalam text-[15px] leading-relaxed text-[#A0B2B2] sm:text-base">
              {PROFILE.learningGoal}
            </p>
          </GlassCard>
        </motion.div>
      </div>
      </SectionReveal>
    </section>
  );
}
