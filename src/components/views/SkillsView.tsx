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
          <p className="font-mono text-xs text-amber-400 tabular-nums">
            03 · Technical Skills, Strengths &amp; Hobbies
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl [text-wrap:balance]">
            Languages, databases, tools, and personal attributes
          </h1>
        </div>
      </div>

      <div className="mt-10">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-display text-xl font-bold text-white">
            Technical Skills
          </h2>
          <span className="font-mono text-xs text-slate-400 tabular-nums">
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
                glowColor="cyan"
                className="glass-surface glass-interactive h-full rounded-2xl p-6"
              >
                <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3">
                  <h3 className="text-xs font-semibold text-blue-300">
                    {group.category}
                  </h3>
                  <span className="font-mono text-[11px] text-slate-400 tabular-nums">
                    <AnimatedCounter value={group.items.length} padZero={2} />
                  </span>
                </div>
                <ul className="mt-4 space-y-2.5 text-sm font-medium text-white">
                  {group.items.map((skill) => (
                    <li key={skill} className="flex items-start gap-2.5">
                      <span aria-hidden="true" className="text-amber-400">
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
          <h2 className="font-display text-xl font-bold text-white">
            Soft Skills
          </h2>
          <span className="font-mono text-xs text-slate-400 tabular-nums">
            <AnimatedCounter value={SOFT_SKILLS.length} /> Core Traits
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
                glowColor="blue"
                className="glass-surface glass-interactive flex h-full items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium text-slate-100"
              >
                <span className="font-mono text-xs text-blue-400 tabular-nums">
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
            glowColor="blue"
            className="glass-surface glass-interactive h-full rounded-2xl p-6 sm:p-8"
          >
            <h2 className="font-display text-xl font-bold text-white">
              My Strengths
            </h2>
            <ul className="mt-5 grid grid-cols-1 gap-3 text-sm text-slate-200 sm:grid-cols-2">
              {STRENGTHS.map((item) => (
                <li key={item} className="flex items-center gap-2.5">
                  <span aria-hidden="true" className="text-amber-400">
                    —
                  </span>
                  <span>{item}</span>
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
            glowColor="cyan"
            className="glass-surface glass-interactive h-full rounded-2xl p-6 sm:p-8"
          >
            <h2 className="font-display text-xl font-bold text-white">
              My Hobbies
            </h2>
            <ul className="mt-5 space-y-3 text-sm text-slate-200">
              {HOBBIES.map((item) => (
                <li key={item} className="flex items-center gap-2.5">
                  <span aria-hidden="true" className="text-blue-400">
                    —
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </TiltCard>
        </motion.div>
      </div>
    </section>
  );
}
