import { useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckVerifiedIcon, CloseIcon, SearchLensIcon } from '../NextGenIcons';
import { CERTIFICATION_TRACKS, PROFILE } from '../../data/projects';
import { AnimatedCounter } from '../AnimatedCounter';
import { GlassCard } from '../GlassCard';
import { TiltCard } from '../TiltCard';

export function CertificationsView() {
  const [selectedTrackIndex, setSelectedTrackIndex] = useState(0);
  const [courseQuery, setCourseQuery] = useState('');
  const detailPanelRef = useRef<HTMLDivElement | null>(null);

  const handleSelectTrack = (idx: number) => {
    setSelectedTrackIndex(idx);
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      window.requestAnimationFrame(() => {
        detailPanelRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      });
    }
  };

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
    <section className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 sm:py-12 md:px-10 md:py-16">
      <div className="flex flex-col gap-5 border-b border-white/10 pb-6 sm:gap-6 sm:pb-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-kalam text-xs text-[#F05BEA] tabular-nums">
            04 · Certifications &amp; Technical Courses
          </p>
          <h1 className="mt-2 font-road-rage text-[2rem] font-normal leading-[1.08] tracking-wide text-[#FF0000] sm:text-5xl [text-wrap:balance]">
            <AnimatedCounter value={7} /> learning tracks across{' '}
            <AnimatedCounter value={25} suffix="+" /> completed courses
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-64">
            <SearchLensIcon
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#A0B2B2]"
            />
            <input
              type="search"
              value={courseQuery}
              onChange={(e) => {
                setCourseQuery(e.target.value);
                setSelectedTrackIndex(0);
              }}
              placeholder="Filter by MATLAB, Python, SQL, IBM..."
              aria-label="Search certification courses"
              className="min-h-[44px] w-full rounded-lg border border-white/10 bg-[#071B1B] pl-9 pr-9 text-base text-[#FFFFFF] placeholder:text-xs placeholder:text-[#A0B2B2]/65 focus:border-[#F05BEA] focus:outline-none focus:ring-2 focus:ring-[#F05BEA]/25 sm:h-10 sm:min-h-0 sm:pr-8 sm:text-xs [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
            />
            {courseQuery && (
              <button
                type="button"
                aria-label="Clear course filter"
                onClick={() => {
                  setCourseQuery('');
                  setSelectedTrackIndex(0);
                }}
                className="touch-press absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-[#A0B2B2] hover:text-[#FFFFFF] sm:right-2.5 sm:p-0.5 cursor-pointer"
              >
                <CloseIcon className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {filteredTracks.length === 0 ? (
        <GlassCard accent="pink" className="mt-10 rounded-2xl px-6 py-14 text-center">
          <p className="font-caveat text-2xl font-normal text-[#FFFF00]">
            No matching certification tracks found
          </p>
          <button
            type="button"
            onClick={() => {
              setCourseQuery('');
              setSelectedTrackIndex(0);
            }}
            className="touch-press mt-4 inline-flex min-h-[40px] items-center rounded-lg bg-[#C8FF27] px-4 py-2 text-xs font-bold text-[#071B1B] hover:bg-[#d5ff52] cursor-pointer"
          >
            Reset Filter — Show All 7 Tracks
          </button>
        </GlassCard>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:mt-8 sm:gap-6 lg:grid-cols-12">
          {/* Left Track Selector */}
          <div className="flex flex-col gap-2.5 lg:col-span-5">
            {filteredTracks.map((track, idx) => {
              const isSelected = activeTrack?.number === track.number;
              return (
                <TiltCard
                  key={track.number}
                  maxTiltDeg={3.5}
                  glowColor={isSelected ? 'pink' : 'teal'}
                  className="rounded-xl"
                >
                  <button
                    type="button"
                    onClick={() => handleSelectTrack(idx)}
                    className={`touch-press glass-surface flex min-h-[52px] w-full items-center justify-between gap-3 rounded-xl px-3.5 py-3 text-left sm:min-h-[56px] sm:gap-4 sm:px-4 sm:py-3.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8FF27] ${
                      isSelected
                        ? 'glass-accent-pink text-[#FFFFFF]'
                        : 'glass-interactive text-[#A0B2B2] hover:text-[#FFFFFF]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 sm:gap-3.5">
                      <span
                        className={`font-kalam text-xs font-bold tabular-nums ${
                          isSelected ? 'text-[#C8FF27]' : 'text-[#F05BEA]'
                        }`}
                      >
                        {track.number}
                      </span>
                      <div className="min-w-0">
                        <div className="truncate font-caveat text-base font-normal tracking-wide text-[#FFFF00] sm:text-lg">
                          {track.provider}
                        </div>
                        <div className="truncate font-kalam text-xs text-[#A0B2B2]">
                          {track.category}
                        </div>
                      </div>
                    </div>
                    <span className="font-kalam text-xs text-[#A0B2B2] tabular-nums shrink-0">
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
            <div ref={detailPanelRef} className="scroll-mt-20 lg:col-span-7">
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
                    glowColor="pink"
                    scaleOnHover={1.005}
                    className="glass-surface-strong glass-interactive glass-accent-pink flex h-full flex-col justify-between rounded-2xl p-4 sm:p-8"
                  >
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-5">
                        <div>
                          <p className="font-caveat text-base font-normal tracking-wide text-[#FFFF00]">
                            {activeTrack.category}
                          </p>
                          <h2 className="mt-1 font-road-rage text-3xl sm:text-4xl font-normal tracking-wide text-[#FF0000]">
                            {activeTrack.provider}
                          </h2>
                        </div>
                        <span className="font-kalam text-sm font-bold text-[#C8FF27] tabular-nums">
                          Track {activeTrack.number.replace(/\.$/, '')}
                        </span>
                      </div>

                      <div className="mt-6">
                        <p className="font-kalam text-xs font-bold text-[#A0B2B2]">
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
                              className="flex items-start gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-3 text-sm text-[#FFFFFF] transition-[border-color,background-color] duration-200 hover:border-[#F05BEA]/40 hover:bg-white/[0.08]"
                            >
                              <CheckVerifiedIcon
                                aria-hidden="true"
                                className="mt-0.5 h-4 w-4 shrink-0 text-[#C8FF27]"
                              />
                              <span>{course}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5 text-xs text-[#A0B2B2]">
                      <span className="font-kalam text-sm text-[#A0B2B2]">
                        {PROFILE.learningGoal}
                      </span>
                      <span className="font-kalam text-xs font-bold text-[#F05BEA] tabular-nums shrink-0">
                        <AnimatedCounter value={activeTrack.courses.length} /> Listed
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
