import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, Search, X } from 'lucide-react';
import { CERTIFICATION_TRACKS, PROFILE } from '../../data/projects';
import { AnimatedCounter } from '../AnimatedCounter';
import { TiltCard } from '../TiltCard';

export function CertificationsView() {
  const [selectedTrackIndex, setSelectedTrackIndex] = useState(0);
  const [courseQuery, setCourseQuery] = useState('');

  const filteredTracks = useMemo(() => {
    const q = courseQuery.trim().toLowerCase();
    if (!q) return CERTIFICATION_TRACKS;
    return CERTIFICATION_TRACKS.filter(
      (t) =>
        t.provider.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.courses.some((c) => c.toLowerCase().includes(q))
    );
  }, [courseQuery]);

  const activeTrack =
    filteredTracks[selectedTrackIndex] ?? filteredTracks[0] ?? null;

  return (
    <section className="mx-auto max-w-[1280px] px-6 py-12 md:px-10 md:py-16">
      <div className="flex flex-col gap-6 border-b border-white/10 pb-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-mono text-xs text-amber-400 tabular-nums">
            04 · Certifications &amp; Technical Courses
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl [text-wrap:balance]">
            <AnimatedCounter value={7} /> verified learning tracks and{' '}
            <AnimatedCounter value={25} suffix="+" /> completed modules
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              value={courseQuery}
              onChange={(e) => {
                setCourseQuery(e.target.value);
                setSelectedTrackIndex(0);
              }}
              placeholder="Filter MATLAB, Python, MySQL..."
              aria-label="Search certification courses"
              className="h-10 w-full rounded-lg border border-white/15 bg-[#0A132C] pl-9 pr-8 text-xs text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/25"
            />
            {courseQuery && (
              <button
                type="button"
                aria-label="Clear course filter"
                onClick={() => {
                  setCourseQuery('');
                  setSelectedTrackIndex(0);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {filteredTracks.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-white/10 bg-[#0A132C] px-6 py-14 text-center">
          <p className="font-display text-lg font-semibold text-white">
            No matching certification track
          </p>
          <button
            type="button"
            onClick={() => setCourseQuery('')}
            className="mt-4 inline-flex min-h-[40px] items-center rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 cursor-pointer"
          >
            Show All 7 Tracks
          </button>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Track Selector */}
          <div className="flex flex-col gap-2.5 lg:col-span-5">
            {filteredTracks.map((track, idx) => {
              const isSelected = activeTrack?.number === track.number;
              return (
                <TiltCard
                  key={track.number}
                  maxTiltDeg={3.5}
                  glowColor={isSelected ? 'blue' : 'cyan'}
                  className="rounded-xl"
                >
                  <button
                    type="button"
                    onClick={() => setSelectedTrackIndex(idx)}
                    className={`touch-press flex min-h-[56px] w-full items-center justify-between gap-4 rounded-xl border px-4 py-3.5 text-left backdrop-blur-md cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                      isSelected
                        ? 'border-blue-400/70 bg-[#0E1E4A]/90 text-white shadow-lg shadow-blue-950/50'
                        : 'glass-surface text-slate-300 hover:border-cyan-400/40 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <span
                        className={`font-mono text-xs font-semibold tabular-nums ${
                          isSelected ? 'text-amber-400' : 'text-blue-400'
                        }`}
                      >
                        {track.number}
                      </span>
                      <div className="min-w-0">
                        <div className="truncate font-display text-sm font-bold">
                          {track.provider}
                        </div>
                        <div className="truncate text-xs text-slate-400">
                          {track.category}
                        </div>
                      </div>
                    </div>
                    <span className="font-mono text-xs text-slate-400 tabular-nums shrink-0">
                      <AnimatedCounter value={track.courses.length} />{' '}
                      {track.courses.length === 1 ? 'course' : 'courses'}
                    </span>
                  </button>
                </TiltCard>
              );
            })}
          </div>

          {/* Right Track Detail Panel */}
          {activeTrack && (
            <div className="lg:col-span-7">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTrack.number}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full"
                >
                  <TiltCard
                    maxTiltDeg={2.2}
                    glowColor="blue"
                    scaleOnHover={1.005}
                    className="glass-surface-strong flex h-full flex-col justify-between rounded-2xl bg-gradient-to-br from-[#0D1C46]/85 via-[#091434]/85 to-[#050A18]/85 p-6 sm:p-8"
                  >
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-5">
                        <div>
                          <p className="text-xs font-medium text-blue-300">
                            {activeTrack.category}
                          </p>
                          <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-white">
                            {activeTrack.provider}
                          </h2>
                        </div>
                        <span className="font-mono text-sm font-semibold text-amber-400 tabular-nums">
                          Track {activeTrack.number}
                        </span>
                      </div>

                      <div className="mt-6">
                        <p className="text-xs font-semibold text-slate-400">
                          Completed Courses &amp; Modules
                        </p>
                        <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                          {activeTrack.courses.map((course, courseIdx) => (
                            <motion.li
                              key={course}
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{
                                duration: 0.2,
                                delay: courseIdx * 0.025,
                                ease: [0.16, 1, 0.3, 1],
                              }}
                              className="flex items-start gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-3 text-sm text-slate-100 transition-colors hover:border-white/20"
                            >
                              <Check
                                aria-hidden="true"
                                className="mt-0.5 h-4 w-4 shrink-0 text-blue-400"
                              />
                              <span>{course}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5 text-xs text-slate-400">
                      <span>{PROFILE.learningGoal}</span>
                      <span className="font-mono text-blue-300 tabular-nums shrink-0">
                        <AnimatedCounter value={activeTrack.courses.length} /> Verified
                      </span>
                    </div>
                  </TiltCard>
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
