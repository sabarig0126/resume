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
    <section className="mx-auto max-w-[1280px] px-6 py-12 md:px-10 md:py-16">
      <div className="border-b border-white/10 pb-8">
        <div>
          <p className="font-kalam text-xs text-[#F05BEA] tabular-nums">
            03 · Technical Stack, Strengths &amp; Interests
          </p>
          <h1 className="mt-2 font-road-rage text-4xl font-normal tracking-wide text-[#FF0000] sm:text-5xl [text-wrap:balance]">
            Core programming stack, databases, and analytical competencies
          </h1>
        </div>
      </div>

      <div className="mt-10">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-road-rage text-2xl sm:text-3xl font-normal tracking-wide text-[#FF0000]">
            Technical Skills
          </h2>
          <span className="font-kalam text-xs text-[#A0B2B2] tabular-nums">
            <AnimatedCounter value={TECHNICAL_SKILLS.length} /> Categories
          </span>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
                className="glass-surface glass-interactive h-full rounded-2xl p-6"
              >
                <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3">
                  <h3 className="font-caveat text-lg font-normal tracking-wide text-[#FFFF00]">
                    {group.category}
                  </h3>
                  <span className="font-kalam text-xs text-[#C8FF27] tabular-nums">
                    <AnimatedCounter value={group.items.length} padZero={2} />
                  </span>
                </div>
                <ul className="mt-4 space-y-2.5 font-kalam text-sm font-normal text-[#FFFFFF]">
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

      <div className="mt-12 border-t border-white/10 pt-10">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-road-rage text-2xl sm:text-3xl font-normal tracking-wide text-[#FF0000]">
            Professional &amp; Soft Skills
          </h2>
          <span className="font-kalam text-xs text-[#A0B2B2] tabular-nums">
            <AnimatedCounter value={SOFT_SKILLS.length} /> Core Competencies
          </span>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                className="glass-surface glass-interactive flex h-full items-center gap-3 rounded-xl px-4 py-3.5 font-kalam text-sm font-normal text-[#FFFFFF]"
              >
                <span className="font-kalam text-xs text-[#C8FF27] tabular-nums">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <span>{skill}</span>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-8 border-t border-white/10 pt-10 md:grid-cols-2">
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
            className="glass-surface glass-interactive glass-accent-pink h-full rounded-2xl p-6 sm:p-8"
          >
            <h2 className="font-caveat text-2xl font-normal tracking-wide text-[#FFFF00]">
              Core Strengths
            </h2>
            <ul className="mt-5 grid grid-cols-1 gap-3 text-sm text-[#A0B2B2] sm:grid-cols-2">
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
            className="glass-surface glass-interactive glass-accent-lime h-full rounded-2xl p-6 sm:p-8"
          >
            <h2 className="font-caveat text-2xl font-normal tracking-wide text-[#FFFF00]">
              Interests &amp; Hobbies
            </h2>
            <ul className="mt-5 space-y-3 font-kalam text-[15px] text-[#A0B2B2]">
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
