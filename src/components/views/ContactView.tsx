import { motion } from 'motion/react';
import { Mail, MapPin, Phone } from 'lucide-react';
import { PROFILE } from '../../data/projects';
import { GlassCard } from '../GlassCard';

export function ContactView() {
  return (
    <section className="mx-auto max-w-[1280px] px-6 py-12 md:px-10 md:py-16">
      <div className="border-b border-white/10 pb-8">
        <p className="font-mono text-xs text-amber-400 tabular-nums">
          09 · Contact Details
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Connect with {PROFILE.name}
        </h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="mt-10"
      >
        <GlassCard strong className="rounded-2xl p-6 sm:p-8">
        <div className="border-b border-white/10 pb-6">
          <h2 className="font-display text-xl font-bold text-white">
            Direct Channels
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300">
            Open to internships, AI &amp; Data Science student collaborations, and technical hackathons.
          </p>
        </div>

        <dl className="mt-6 grid grid-cols-1 gap-6 text-sm md:grid-cols-3">
          <div className="glass-surface glass-interactive rounded-xl p-5">
            <dt className="flex items-center gap-2 text-xs text-slate-400">
              <Mail className="h-3.5 w-3.5 text-blue-400" />
              <span>Email</span>
            </dt>
            <dd className="mt-2">
              <span className="break-all font-mono text-sm font-medium text-blue-300 select-all">
                {PROFILE.email}
              </span>
            </dd>
          </div>

          <div className="glass-surface glass-interactive rounded-xl p-5">
            <dt className="flex items-center gap-2 text-xs text-slate-400">
              <Phone className="h-3.5 w-3.5 text-blue-400" />
              <span>Mobile</span>
            </dt>
            <dd className="mt-2">
              <a
                href={`tel:${PROFILE.mobile}`}
                className="touch-press inline-flex min-h-[44px] sm:min-h-0 items-center font-mono text-sm font-medium text-white tabular-nums hover:text-blue-300"
              >
                {PROFILE.mobile}
              </a>
            </dd>
          </div>

          <div className="glass-surface glass-interactive rounded-xl p-5">
            <dt className="flex items-center gap-2 text-xs text-slate-400">
              <MapPin className="h-3.5 w-3.5 text-amber-400" />
              <span>Location</span>
            </dt>
            <dd className="mt-2 font-medium text-white">
              {PROFILE.location}
            </dd>
          </div>
        </dl>
        </GlassCard>
      </motion.div>
    </section>
  );
}
