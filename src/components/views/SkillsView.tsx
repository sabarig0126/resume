import { motion } from 'motion/react';
import {
  HOBBIES,
  SOFT_SKILLS,
  STRENGTHS,
  TECHNICAL_SKILLS,
} from '../../data/projects';
import { AnimatedCounter } from '../AnimatedCounter';
import { TiltCard } from '../TiltCard';

export function SkillsView() {
  return (
    <section className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col justify-between px-4 py-6 sm:px-6 sm:py-10 md:px-10 md:py-12">
      <div className="shrink-0 border-b border-white/10 pb-5 sm:pb-7">
        <div>
          <p className="font-kalam text-xs text-[#F05BEA] tabular-nums">
            03 · Skills, Strengths &amp; Hobbies
          </p>
          <h1 className="mt-2 font-road-rage text-[2.2rem] font-normal leading-[1.06] tracking-wide text-[#FF4D4D] sm:text-5xl lg:text-[3.35rem] [text-wrap:balance]">
            Technical skills, soft skills, strengths, and hobbies
          </h1>
        </div>
      </div>

      <div className="mt-7 sm:mt-9">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 className="font-road-rage text-2xl font-normal tracking-wide text-[#FF4D4D] sm:text-3xl">
            Technical Skills
          </h2>
          <span className="font-kalam text-xs text-[#A0B2B2] tabular-nums sm:text-sm">
            <AnimatedCounter value={TECHNICAL_SKILLS.length} /> Categories
          </span>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:mt-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {TECHNICAL_SKILLS.map((group, idx) => (
            <motion.div
              key={group.category}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.28,
                delay: idx * 0.05,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="h-full"
            >
              <TiltCard
                maxTiltDeg={4.5}
                glowColor={idx % 2 === 0 ? 'pink' : 'lime'}
                className="glass-surface glass-interactive flex h-full flex-col justify-between rounded-2xl p-6 sm:p-7"
              >
                <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3.5">
                  <h3 className="font-caveat text-xl font-normal tracking-wide text-[#FFFF00] sm:text-2xl">
                    {group.category}
                  </h3>
                  <span className="font-kalam text-xs text-[#C8FF27] tabular-nums sm:text-sm">
                    <AnimatedCounter value={group.items.length} padZero={2} />
                  </span>
                </div>
                <ul className="mt-5 flex-1 space-y-3 font-kalam text-[15px] font-normal text-[#FFFFFF] sm:text-base">
                  {group.items.map((skill) => (
                    <li key={skill} className="flex items-start gap-2.5">
                      <span aria-hidden="true" className="text-[#C8FF27]">
                        —
                      </span>
                      <span>{skill}</span>
                    </li>
                  ))}
                </ul>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="mt-8 border-t border-white/10 pt-7 sm:mt-10 sm:pt-9">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 className="font-road-rage text-2xl font-normal tracking-wide text-[#FF4D4D] sm:text-3xl">
            Professional &amp; Soft Skills
          </h2>
          <span className="font-kalam text-xs text-[#A0B2B2] tabular-nums sm:text-sm">
            <AnimatedCounter value={SOFT_SKILLS.length} /> Core Competencies
          </span>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3.5 sm:mt-5 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          {SOFT_SKILLS.map((skill, idx) => (
            <motion.div
              key={skill}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.24,
                delay: 0.08 + idx * 0.03,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="h-full"
            >
              <TiltCard
                maxTiltDeg={4.5}
                glowColor={idx % 2 === 0 ? 'lime' : 'pink'}
                className="glass-surface glass-interactive flex h-full items-center gap-3.5 rounded-xl px-5 py-4 font-kalam text-[15px] font-normal text-[#FFFFFF] sm:py-4.5 sm:text-base"
              >
                <span className="font-kalam text-xs font-bold text-[#C8FF27] tabular-nums sm:text-sm">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <span>{skill}</span>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 border-t border-white/10 pt-7 sm:mt-10 sm:gap-8 sm:pt-9 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="h-full"
        >
          <TiltCard
            maxTiltDeg={3}
            glowColor="pink"
            className="glass-surface glass-interactive glass-accent-pink flex h-full flex-col justify-between rounded-2xl p-6 sm:p-8 lg:p-9"
          >
            <h2 className="font-caveat text-2xl font-normal tracking-wide text-[#FFFF00] sm:text-3xl">
              My Strengths
            </h2>
            <ul className="mt-5 grid grid-cols-1 gap-3.5 font-kalam text-[15px] text-[#A0B2B2] sm:grid-cols-2 sm:text-base">
              {STRENGTHS.map((item) => (
                <li key={item} className="flex items-center gap-2.5">
                  <span aria-hidden="true" className="text-[#C8FF27]">
                    —
                  </span>
                  <span className="text-[#FFFFFF]">{item}</span>
                </li>
              ))}
            </ul>
          </TiltCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.3, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
          className="h-full"
        >
          <TiltCard
            maxTiltDeg={3}
            glowColor="lime"
            className="glass-surface glass-interactive glass-accent-lime flex h-full flex-col justify-between rounded-2xl p-6 sm:p-8 lg:p-9"
          >
            <h2 className="font-caveat text-2xl font-normal tracking-wide text-[#FFFF00] sm:text-3xl">
              My Hobbies
            </h2>
            <ul className="mt-5 grid grid-cols-1 gap-3.5 font-kalam text-[15px] text-[#A0B2B2] sm:grid-cols-2 sm:text-base">
              {HOBBIES.map((item) => (
                <li key={item} className="flex items-center gap-2.5">
                  <span aria-hidden="true" className="text-[#F05BEA]">
                    —
                  </span>
                  <span className="text-[#FFFFFF]">{item}</span>
                </li>
              ))}
            </ul>
          </TiltCard>
        </motion.div>
      </div>
    </section>
  );
}
