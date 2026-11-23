import { type PointerEvent, useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { PORTFOLIO_PDF_PATH, PROFILE } from '../../data/projects';
import {
  ChevronNextIcon,
  ChevronPrevIcon,
  ExternalPortalIcon,
} from '../NextGenIcons';

interface PortfolioPdfViewProps {
  onReturnPreviousView?: () => void;
}

const TOTAL_SLIDES = 13;

const SLIDE_MOTION_VARIANTS = {
  enter: (direction: number) => ({
    opacity: 0,
    x: direction >= 0 ? 28 : -28,
  }),
  center: {
    opacity: 1,
    x: 0,
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction >= 0 ? -28 : 28,
  }),
};

export function PortfolioPdfView(_props: PortfolioPdfViewProps) {
  const [slideIndex, setSlideIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const swipeStartRef = useRef<{ x: number; y: number } | null>(null);
  const screenRef = useRef<HTMLDivElement | null>(null);

  const goNextSlide = useCallback(() => {
    setDirection(1);
    setSlideIndex((prev) => (prev + 1) % TOTAL_SLIDES);
  }, []);

  const goPrevSlide = useCallback(() => {
    setDirection(-1);
    setSlideIndex((prev) => (prev - 1 + TOTAL_SLIDES) % TOTAL_SLIDES);
  }, []);

  // Keyboard navigation: Left/Right slides
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not intercept keys when a modal dialog (Menu or Highlight Card) is open
      if (document.querySelector('[role="dialog"]')) return;

      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        goNextSlide();
        return;
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goPrevSlide();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goNextSlide, goPrevSlide]);

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse') return;
    swipeStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' || swipeStartRef.current === null) return;
    const deltaX = e.clientX - swipeStartRef.current.x;
    const deltaY = e.clientY - swipeStartRef.current.y;
    swipeStartRef.current = null;
    if (Math.abs(deltaX) > 42 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
      if (deltaX < 0) {
        goNextSlide();
      } else {
        goPrevSlide();
      }
    }
  };

  const handlePointerCancel = () => {
    swipeStartRef.current = null;
  };

  return (
    <section className="mx-auto max-w-[1180px] overflow-x-clip px-3 py-4 font-kalam sm:px-6 md:px-10 md:py-5">
      {/* Compact Outer Utility Bar (Preserves Portfolio PDF Links) */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2.5 sm:gap-3">
        <p className="font-kalam text-xs text-[#F05BEA] tabular-nums">
          08 · Portfolio Presentation
        </p>

        <div className="flex flex-wrap items-center gap-2.5">
          <a
            href={PORTFOLIO_PDF_PATH}
            target="_blank"
            rel="noopener noreferrer"
            className="touch-press inline-flex min-h-[44px] sm:min-h-[36px] items-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.04] px-3.5 py-1.5 font-kalam text-xs font-semibold text-[#FFFFFF] transition-colors duration-200 hover:border-[#F05BEA]/65 hover:bg-[#F05BEA]/15 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8FF27]"
          >
            <ExternalPortalIcon className="h-3.5 w-3.5 text-[#F05BEA]" />
            <span>View Portfolio</span>
          </a>
        </div>
      </div>

      {/* Physical 55-Inch OLED Smart TV Display Stage */}
      <div className="relative mx-auto flex max-w-[980px] flex-col items-center">
        {/* Ambient Wall Backlight Glow Behind TV */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 -top-4 bottom-12 -z-10 rounded-[48px] bg-[radial-gradient(ellipse_at_center,rgba(34,211,238,0.14)_0%,rgba(240,91,234,0.07)_44%,transparent_72%)] blur-2xl sm:-inset-x-6"
        />

        {/* Desktop Flanking Prev/Next Controls (Outside TV Frame) */}
        <div className="flex w-full items-center gap-2.5 sm:gap-4">
          <button
            type="button"
            onClick={goPrevSlide}
            aria-label="Previous slide"
            className="touch-press hidden md:inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-[#071B1B]/90 text-[#A0B2B2] shadow-lg transition-colors duration-200 hover:border-[#C8FF27]/70 hover:text-[#C8FF27] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8FF27]"
          >
            <ChevronPrevIcon className="h-5 w-5" />
          </button>

          {/* Realistic OLED Television Chassis + Slim Black Bezels + Stand */}
          <div className="flex w-full flex-col items-center">
            {/* Outer Precision Metallic Rim & Slim Black Bezel */}
            <div className="relative w-full rounded-[10px] bg-gradient-to-b from-[#343a3e] via-[#121618] to-[#050607] p-[2px] shadow-[0_32px_70px_-16px_rgba(0,0,0,0.96),0_0_0_1px_rgba(255,255,255,0.06)]">
              <div className="relative overflow-hidden rounded-[8px] bg-[#040607] p-[6px] sm:p-[9px]">
                {/* OLED Display Panel (16:9 on tablet/desktop, comfortable min-height on mobile) */}
                <div
                  ref={screenRef}
                  onPointerDown={handlePointerDown}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerCancel}
                  className="relative flex min-h-[360px] w-full touch-pan-y flex-col overflow-hidden rounded-[3px] bg-gradient-to-br from-[#082020] via-[#071B1B] to-[#041212] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)] sm:min-h-[410px] md:aspect-[16/9] md:min-h-0"
                >
                  {/* Realistic Anti-Reflective OLED Screen Glass Sheen */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 z-20 bg-[linear-gradient(122deg,rgba(255,255,255,0.045)_0%,rgba(255,255,255,0.015)_26%,transparent_50%)]"
                  />
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 top-0 z-20 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"
                  />

                  {/* Fixed TV Channel Watermark Overlay (Upper-Right Inside TV Screen) */}
                  <img
                    src="/assets/portal-logo.png"
                    alt=""
                    aria-hidden="true"
                    draggable={false}
                    className="pointer-events-none absolute top-3 right-3 z-20 h-8 w-8 select-none object-contain opacity-55 sm:top-4 sm:right-5 sm:h-10 sm:w-10 md:top-5 md:right-6 md:h-12 md:w-12"
                  />

                  {/* Single Active Content Slide */}
                  <div className="relative z-10 flex h-full w-full flex-1 flex-col overflow-x-hidden overflow-y-auto overscroll-contain touch-pan-y px-4 py-4 font-kalam sm:px-8 sm:py-6 md:px-11 md:py-7">
                    <AnimatePresence mode="wait" custom={direction}>
                      <motion.article
                        key={slideIndex}
                        custom={direction}
                        variants={SLIDE_MOTION_VARIANTS}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                          duration: 0.24,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                        className="flex h-full w-full flex-col justify-between font-kalam"
                      >
                        {renderSlideContent(slideIndex)}
                      </motion.article>
                    </AnimatePresence>
                  </div>
                </div>

                {/* Slim Bottom Bezel Chin + Hardware Power LED */}
                <div className="relative flex h-[14px] items-center justify-center bg-gradient-to-b from-[#0b0e10] to-[#050607] sm:h-[17px]">
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 rounded-full bg-[#C8FF27]/75 shadow-[0_0_8px_rgba(200,255,39,0.75)]"
                  />
                </div>
              </div>
            </div>

            {/* Physical Pedestal Neck & Brushed-Metal Stand Base */}
            <div
              aria-hidden="true"
              className="relative flex w-full flex-col items-center"
            >
              {/* Neck */}
              <div className="h-6 w-20 border-x border-white/[0.08] bg-gradient-to-r from-[#101416] via-[#2b3135] to-[#101416] shadow-[inset_0_4px_10px_rgba(0,0,0,0.8)] sm:h-8 sm:w-28" />
              {/* Flat Sculpted Pedestal Base */}
              <div className="relative z-10 h-2.5 w-[44%] min-w-[180px] max-w-[380px] rounded-t-[5px] rounded-b-[2px] border-t border-white/25 bg-gradient-to-b from-[#343b3f] via-[#171b1d] to-[#090b0c] shadow-[0_14px_24px_-4px_rgba(0,0,0,0.95)] sm:h-3" />
              {/* Realistic Tabletop Contact Shadow */}
              <div className="-mt-1 h-3.5 w-[64%] max-w-[540px] rounded-full bg-black/80 blur-md" />
            </div>
          </div>

          <button
            type="button"
            onClick={goNextSlide}
            aria-label="Next slide"
            className="touch-press hidden md:inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-[#071B1B]/90 text-[#A0B2B2] shadow-lg transition-colors duration-200 hover:border-[#C8FF27]/70 hover:text-[#C8FF27] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8FF27]"
          >
            <ChevronNextIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Mobile/Tablet Touch Arrow Controls + Subtle Navigation Hint Beneath TV Stand */}
        <div className="mt-3 flex w-full max-w-[360px] items-center justify-between gap-3 text-xs text-[#A0B2B2] md:mt-2 md:max-w-none md:justify-center md:gap-4">
          <button
            type="button"
            onClick={goPrevSlide}
            aria-label="Previous slide"
            className="touch-press inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-[#071B1B]/90 text-[#FFFFFF] hover:border-[#C8FF27]/70 hover:text-[#C8FF27] md:hidden cursor-pointer"
          >
            <ChevronPrevIcon className="h-4 w-4" />
          </button>

          <p className="text-center font-kalam text-[11px] text-[#A0B2B2] md:hidden">
            Swipe or Tap Arrows to Navigate
          </p>
          <p className="hidden font-kalam text-xs text-[#A0B2B2] md:block">
            Left / Right Arrow: Navigate
          </p>

          <button
            type="button"
            onClick={goNextSlide}
            aria-label="Next slide"
            className="touch-press inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-[#071B1B]/90 text-[#FFFFFF] hover:border-[#C8FF27]/70 hover:text-[#C8FF27] md:hidden cursor-pointer"
          >
            <ChevronNextIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

function SlideHeading({ children }: { children: string }) {
  return (
    <header className="shrink-0 border-b border-white/15 pb-2 sm:pb-3">
      <h1 className="font-kalam text-xl font-bold tracking-wide text-[#FFFF00] sm:text-3xl lg:text-[2.05rem]">
        {children}
      </h1>
    </header>
  );
}

function renderSlideContent(index: number) {
  switch (index) {
    case 0:
      return (
        <div className="flex h-full flex-col justify-center">
          <p className="font-kalam text-xs font-bold tracking-[0.14em] text-[#C8FF27] uppercase sm:text-sm sm:tracking-[0.16em]">
            Department of Artificial Intelligence &amp; Data Science
          </p>
          <h1 className="mt-2 font-kalam text-3xl font-bold tracking-wide text-[#FFFF00] sm:text-5xl lg:text-[3.5rem]">
            Resume
          </h1>
          <div className="my-4 h-px w-full bg-white/15 sm:my-5" />
          <p className="font-kalam text-xl font-bold text-[#FFFFFF] sm:text-2xl lg:text-3xl">
            {PROFILE.name}
          </p>
          <p className="mt-1.5 font-kalam text-sm text-[#A0B2B2] sm:text-base lg:text-lg">
            {PROFILE.college}
          </p>
          <p className="mt-4 font-kalam text-xs font-bold text-[#C8FF27] sm:text-sm">
            {PROFILE.yearLabel} · Academic Year {PROFILE.academicYear}
          </p>
        </div>
      );

    case 1:
      return (
        <div className="flex h-full flex-col">
          <SlideHeading>About Me</SlideHeading>
          <div className="mt-4 grid flex-1 grid-cols-1 items-start gap-6 sm:mt-6 md:grid-cols-12">
            <div className="space-y-4 font-kalam text-sm leading-relaxed text-[#FFFFFF] sm:text-base md:col-span-7 lg:text-[1.08rem]">
              <p>
                I am Sabarivasan G, a second-year B.Tech student in Artificial Intelligence and Data Science at Sri Ramakrishna Institute of Technology.
              </p>
              <p className="text-[#A0B2B2]">
                I am passionate about programming, data and innovation. I keep building my skills through certified courses, hands-on practice and new technologies.
              </p>
            </div>

            <div className="border-t border-white/15 pt-4 md:col-span-5 md:border-l md:border-t-0 md:pl-6 md:pt-0">
              <h2 className="font-kalam text-sm font-bold tracking-[0.12em] text-[#C8FF27] uppercase sm:text-base">
                Personal Details
              </h2>
              <dl className="mt-3 space-y-2.5 font-kalam text-xs sm:text-sm">
                <div>
                  <dt className="text-[#A0B2B2]">Name</dt>
                  <dd className="font-bold text-[#FFFFFF]">{PROFILE.name}</dd>
                </div>
                <div>
                  <dt className="text-[#A0B2B2]">Department</dt>
                  <dd className="font-bold text-[#FFFFFF]">
                    Artificial Intelligence &amp; Data Science
                  </dd>
                </div>
                <div>
                  <dt className="text-[#A0B2B2]">Year</dt>
                  <dd className="font-bold text-[#C8FF27]">{PROFILE.yearLabel}</dd>
                </div>
                <div>
                  <dt className="text-[#A0B2B2]">College</dt>
                  <dd className="font-bold text-[#FFFFFF]">{PROFILE.college}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      );

    case 2:
      return (
        <div className="flex h-full flex-col">
          <SlideHeading>Career Objective</SlideHeading>
          <div className="my-auto space-y-4 py-4 font-kalam sm:space-y-5">
            <p className="text-base leading-relaxed text-[#FFFFFF] sm:text-xl lg:text-[1.45rem]">
              To build a successful career in technology by applying my knowledge of programming, data analysis and mathematics to Artificial Intelligence and Data Science.
            </p>
            <div className="h-px w-full bg-white/15" />
            <p className="text-sm leading-relaxed text-[#A0B2B2] sm:text-base lg:text-lg">
              I aim to grow into a skilled professional through continuous learning, dedication and hands-on practice.
            </p>
          </div>
        </div>
      );

    case 3:
      return (
        <div className="flex h-full flex-col">
          <SlideHeading>Educational Qualification</SlideHeading>
          <div className="mt-4 grid flex-1 grid-cols-1 gap-6 sm:mt-6 md:grid-cols-2">
            <div>
              <h2 className="font-kalam text-base font-bold text-[#C8FF27] sm:text-lg">
                Undergraduate Education
              </h2>
              <dl className="mt-3 space-y-2.5 font-kalam text-xs sm:text-sm">
                <div>
                  <dt className="text-[#A0B2B2]">Degree</dt>
                  <dd className="font-bold text-[#FFFFFF]">B.Tech</dd>
                </div>
                <div>
                  <dt className="text-[#A0B2B2]">Department</dt>
                  <dd className="font-bold text-[#FFFFFF]">
                    Artificial Intelligence &amp; Data Science
                  </dd>
                </div>
                <div>
                  <dt className="text-[#A0B2B2]">Institution</dt>
                  <dd className="font-bold text-[#FFFFFF]">{PROFILE.college}</dd>
                </div>
                <div>
                  <dt className="text-[#A0B2B2]">Current Year</dt>
                  <dd className="font-bold text-[#C8FF27]">{PROFILE.yearLabel}</dd>
                </div>
              </dl>
            </div>

            <div className="border-t border-white/15 pt-4 md:border-l md:border-t-0 md:pl-6 md:pt-0">
              <h2 className="font-kalam text-base font-bold text-[#C8FF27] sm:text-lg">
                School Education
              </h2>
              <ul className="mt-3 space-y-4 font-kalam text-xs sm:text-sm">
                <li className="flex items-start gap-2">
                  <span aria-hidden="true" className="text-[#FFFF00]">
                    •
                  </span>
                  <div>
                    <p className="font-bold text-[#FFFFFF]">
                      Higher Secondary -{' '}
                      <span className="text-[#C8FF27] tabular-nums">85.5%</span>
                    </p>
                    <p className="mt-0.5 text-[#A0B2B2]">
                      Thanappa Gounder Matric Higher Secondary School, Dharmapuri
                    </p>
                  </div>
                </li>
                <li className="border-t border-white/10 pt-3 flex items-start gap-2">
                  <span aria-hidden="true" className="text-[#FFFF00]">
                    •
                  </span>
                  <div>
                    <p className="font-bold text-[#FFFFFF]">
                      SSLC –{' '}
                      <span className="text-[#C8FF27] tabular-nums">81%</span>
                    </p>
                    <p className="mt-0.5 text-[#A0B2B2]">
                      Thanappa Gounder Matric Higher Secondary School, Dharmapuri
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      );

    case 4:
      return (
        <div className="flex h-full flex-col">
          <SlideHeading>Technical Skills</SlideHeading>
          <div className="mt-4 grid flex-1 grid-cols-1 gap-x-8 gap-y-5 sm:mt-6 sm:grid-cols-2">
            <div className="border-b border-white/10 pb-3">
              <h2 className="font-kalam text-base font-bold text-[#C8FF27] sm:text-lg">
                Programming Languages
              </h2>
              <ul className="mt-2 space-y-1 font-kalam text-sm text-[#FFFFFF] sm:text-base">
                <li>• Python Programming</li>
                <li>• C Programming</li>
              </ul>
            </div>

            <div className="border-b border-white/10 pb-3">
              <h2 className="font-kalam text-base font-bold text-[#C8FF27] sm:text-lg">
                Database Technologies
              </h2>
              <ul className="mt-2 space-y-1 font-kalam text-sm text-[#FFFFFF] sm:text-base">
                <li>• SQL</li>
                <li>• DBMS</li>
                <li>• MongoDB</li>
              </ul>
            </div>

            <div>
              <h2 className="font-kalam text-base font-bold text-[#C8FF27] sm:text-lg">
                Technical Tools
              </h2>
              <ul className="mt-2 space-y-1 font-kalam text-sm text-[#FFFFFF] sm:text-base">
                <li>• MATLAB</li>
                <li>• Microsoft Excel</li>
              </ul>
            </div>

            <div>
              <h2 className="font-kalam text-base font-bold text-[#C8FF27] sm:text-lg">
                Technical Knowledge
              </h2>
              <ul className="mt-2 space-y-1 font-kalam text-sm text-[#FFFFFF] sm:text-base">
                <li>• Data Analysis · AI Fundamentals</li>
                <li>• Data Structures and Algorithms · Mathematical Computing</li>
              </ul>
            </div>
          </div>
        </div>
      );

    case 5:
      return (
        <div className="flex h-full flex-col">
          <SlideHeading>Soft Skills</SlideHeading>
          <div className="mt-4 grid flex-1 grid-cols-1 gap-x-8 gap-y-2.5 sm:mt-6 sm:grid-cols-2">
            {[
              'Communication Skills',
              'Problem-Solving Skills',
              'Teamwork and Collaboration',
              'Time Management',
              'Critical Thinking',
              'Adaptability',
              'Quick Learning',
              'Self-Motivation',
            ].map((skill) => (
              <div
                key={skill}
                className="flex items-center gap-2.5 border-b border-white/10 py-2 font-kalam text-sm text-[#FFFFFF] sm:text-base"
              >
                <span aria-hidden="true" className="text-[#C8FF27]">
                  •
                </span>
                <span>{skill}</span>
              </div>
            ))}
          </div>
        </div>
      );

    case 6:
      return (
        <div className="flex h-full flex-col">
          <SlideHeading>Areas of Interest</SlideHeading>
          <div className="mt-4 grid flex-1 grid-cols-1 gap-x-8 gap-y-2.5 sm:mt-6 sm:grid-cols-2">
            {[
              ['01', 'Artificial Intelligence'],
              ['02', 'Machine Learning'],
              ['03', 'Data Science'],
              ['04', 'Python Programming'],
              ['05', 'Data Analytics'],
              ['06', 'Database Management'],
              ['07', 'Mathematical Computing'],
              ['08', 'Emerging Technologies'],
            ].map(([num, label]) => (
              <div
                key={num}
                className="flex items-center gap-3 border-b border-white/10 py-2 font-kalam text-sm sm:text-base"
              >
                <span className="font-bold text-[#C8FF27] tabular-nums">{num}</span>
                <span className="text-[#FFFFFF]">{label}</span>
              </div>
            ))}
          </div>
        </div>
      );

    case 7:
      return (
        <div className="flex h-full flex-col justify-between">
          <div>
            <SlideHeading>Academic Learning</SlideHeading>
            <ul className="mt-4 grid grid-cols-1 gap-x-6 gap-y-2 font-kalam text-xs text-[#FFFFFF] sm:mt-5 sm:grid-cols-2 sm:text-sm md:grid-cols-4">
              {[
                'Programming Fundamentals',
                'Database Management Systems',
                'Data Structures and Algorithms',
                'Linear Algebra',
                'Probability and Statistics',
                'Python for Scientific Computing',
                'Fundamentals of Artificial Intelligence',
                'Data Analysis Techniques',
              ].map((subject) => (
                <li
                  key={subject}
                  className="flex items-start gap-2 border-b border-white/10 pb-2"
                >
                  <span aria-hidden="true" className="text-[#C8FF27]">
                    •
                  </span>
                  <span>{subject}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4 border-t border-white/15 pt-3 sm:pt-4">
            <h2 className="font-kalam text-xs font-bold tracking-[0.12em] text-[#C8FF27] uppercase sm:text-sm">
              Learning Goal
            </h2>
            <p className="mt-1 font-kalam text-sm leading-relaxed text-[#A0B2B2] sm:text-base">
              To strengthen my theoretical foundation and turn it into practical technical skills through continuous, hands-on learning.
            </p>
          </div>
        </div>
      );

    case 8:
      return (
        <div className="flex h-full flex-col">
          <SlideHeading>Certifications &amp; Technical Courses</SlideHeading>
          <div className="mt-4 grid flex-1 grid-cols-1 gap-6 sm:mt-5 md:grid-cols-12">
            <div className="space-y-4 md:col-span-5">
              <div>
                <h2 className="font-kalam text-sm font-bold text-[#C8FF27] sm:text-base">
                  1. NPTEL – IIT Madras
                </h2>
                <ul className="mt-1.5 font-kalam text-xs text-[#FFFFFF] sm:text-sm">
                  <li>• Design Thinking – A Primer (Elite, 63%)</li>
                </ul>
              </div>

              <div className="border-t border-white/10 pt-3">
                <h2 className="font-kalam text-sm font-bold text-[#C8FF27] sm:text-base">
                  2. IBM Career Education Program
                </h2>
                <ul className="mt-1.5 space-y-1 font-kalam text-xs text-[#FFFFFF] sm:text-sm">
                  <li>• Clean Coding</li>
                  <li>• DevOps, Agile &amp; Design Thinking</li>
                </ul>
              </div>
            </div>

            <div className="border-t border-white/15 pt-4 md:col-span-7 md:border-l md:border-t-0 md:pl-6 md:pt-0">
              <h2 className="font-kalam text-sm font-bold text-[#C8FF27] sm:text-base">
                3. MATLAB – MathWorks
              </h2>
              <ul className="mt-1.5 grid grid-cols-1 gap-x-4 gap-y-1 font-kalam text-xs text-[#FFFFFF] sm:grid-cols-2 sm:text-[13px]">
                <li>• MATLAB Onramp</li>
                <li>• Symbolic Math Onramp</li>
                <li>• MATLAB Coder Onramp</li>
                <li>• The How and Why of Writing Functions</li>
                <li>• Introduction to Linear Algebra with MATLAB</li>
                <li>• Calculations with Vectors and Matrices</li>
                <li>• Statistics Onramp</li>
                <li>• Data Analysis Courses</li>
              </ul>
            </div>
          </div>
        </div>
      );

    case 9:
      return (
        <div className="flex h-full flex-col">
          <SlideHeading>Technical Courses &amp; Data Specializations</SlideHeading>
          <div className="mt-3 grid flex-1 grid-cols-1 gap-5 sm:mt-4 md:grid-cols-3 md:divide-x md:divide-white/15">
            <div className="md:pr-4">
              <h2 className="font-kalam text-sm font-bold text-[#C8FF27] sm:text-[15px]">
                4. Python &amp; Data Science
              </h2>
              <ul className="mt-1.5 space-y-1 font-kalam text-[11.5px] leading-snug text-[#FFFFFF] sm:text-xs">
                <li>• Python for Data Science and Machine Learning Bootcamp</li>
                <li>• Introduction to Data Science</li>
                <li>• Data Science Foundation</li>
                <li>• Basics of Linear Algebra using Python</li>
                <li>• Probability and Statistics using Python</li>
                <li>• Statistical Inference using Python</li>
                <li>• Probability Distribution using Python</li>
              </ul>
            </div>

            <div className="border-t border-white/15 pt-3 md:border-t-0 md:px-4 md:pt-0">
              <h2 className="font-kalam text-sm font-bold text-[#C8FF27] sm:text-[15px]">
                5. Database &amp; Programming
              </h2>
              <ul className="mt-1.5 space-y-1 font-kalam text-[11.5px] leading-snug text-[#FFFFFF] sm:text-xs">
                <li>• Project on MySQL</li>
                <li>• MongoDB Courses</li>
                <li>• Unix Linux OS – Unix Fundamentals</li>
                <li>• Ethical AI</li>
                <li>• Excel Macros &amp; VBA for Beginners</li>
              </ul>

              <div className="mt-3 border-t border-white/10 pt-2.5">
                <h2 className="font-kalam text-sm font-bold text-[#C8FF27] sm:text-[15px]">
                  7. Cybersecurity
                </h2>
                <p className="mt-1 font-kalam text-[11.5px] leading-snug text-[#A0B2B2] sm:text-xs">
                  • Tech Mahindra Foundation (Skill India Digital Hub, 10 Hours)
                </p>
              </div>
            </div>

            <div className="border-t border-white/15 pt-3 md:border-t-0 md:pl-4 md:pt-0">
              <h2 className="font-kalam text-sm font-bold text-[#C8FF27] sm:text-[15px]">
                6. Data Analysis
              </h2>
              <ul className="mt-1.5 space-y-1 font-kalam text-[11.5px] leading-snug text-[#FFFFFF] sm:text-xs">
                <li>• Common Data Analysis Techniques</li>
                <li>• Calculations on Grouped Data</li>
                <li>• Find and Extract Subsets of Data</li>
                <li>• Clean and Prepare Data for Analysis</li>
                <li>• Tables</li>
              </ul>
            </div>
          </div>
        </div>
      );

    case 10:
      return (
        <div className="flex h-full flex-col">
          <SlideHeading>Achievements &amp; Participation</SlideHeading>
          <ul className="mt-4 grid flex-1 grid-cols-1 gap-x-8 gap-y-3 font-kalam text-xs sm:mt-5 sm:grid-cols-2 sm:text-sm">
            <li className="border-b border-white/10 pb-2.5">
              <h2 className="font-kalam font-bold text-[#C8FF27]">
                • NPTEL Elite Certification
              </h2>
              <p className="mt-0.5 text-[#A0B2B2]">
                Earned the Elite certificate for Design Thinking – A Primer, scoring 63%.
              </p>
            </li>

            <li className="border-b border-white/10 pb-2.5">
              <h2 className="font-kalam font-bold text-[#C8FF27]">
                • TEDxSRIT Participation
              </h2>
              <p className="mt-0.5 text-[#A0B2B2]">
                Participated in TEDxSRIT on the theme “Human in the Loop”.
              </p>
            </li>

            <li className="border-b border-white/10 pb-2.5">
              <h2 className="font-kalam font-bold text-[#C8FF27]">
                • Technical Learning
              </h2>
              <p className="mt-0.5 text-[#A0B2B2]">
                Completed MATLAB, Python and Data Science courses, building a strong base in databases and programming.
              </p>
            </li>

            <li className="border-b border-white/10 pb-2.5">
              <h2 className="font-kalam font-bold text-[#C8FF27]">
                • Entrepreneurship Participation
              </h2>
              <p className="mt-0.5 text-[#A0B2B2]">
                Took part in the Illuminate Entrepreneurship Bootcamp at IIT Bombay.
              </p>
            </li>

            <li className="sm:col-span-2">
              <h2 className="font-kalam font-bold text-[#C8FF27]">
                • Smart India Hackathon (SIH)
              </h2>
              <p className="mt-0.5 text-[#A0B2B2]">
                Participated in the internal round of the Smart India Hackathon at college.
              </p>
            </li>
          </ul>
        </div>
      );

    case 11:
      return (
        <div className="flex h-full flex-col">
          <SlideHeading>Strengths &amp; Hobbies</SlideHeading>
          <div className="mt-4 grid flex-1 grid-cols-1 gap-6 sm:mt-6 md:grid-cols-2">
            <div>
              <h2 className="font-kalam text-base font-bold text-[#C8FF27] sm:text-lg">
                My Strengths
              </h2>
              <ul className="mt-3 space-y-2 font-kalam text-sm text-[#FFFFFF] sm:text-base">
                <li>• Self-Motivated</li>
                <li>• Hardworking</li>
                <li>• Quick Learner</li>
                <li>• Positive Attitude</li>
                <li>• Adaptability</li>
                <li>• Willingness to Learn</li>
              </ul>
            </div>

            <div className="border-t border-white/15 pt-4 md:border-l md:border-t-0 md:pl-6 md:pt-0">
              <h2 className="font-kalam text-base font-bold text-[#C8FF27] sm:text-lg">
                My Hobbies
              </h2>
              <ul className="mt-3 space-y-2 font-kalam text-sm text-[#FFFFFF] sm:text-base">
                <li>• Exploring New Technologies</li>
                <li>• Learning Programming</li>
                <li>• Listening to Music</li>
                <li>• Improving Technical Knowledge</li>
                <li>• Exploring New Ideas</li>
              </ul>
            </div>
          </div>
        </div>
      );

    case 12:
    default:
      return (
        <div className="flex h-full flex-col justify-center">
          <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-12">
            <div className="md:col-span-7">
              <h1 className="font-kalam text-3xl font-bold tracking-wide text-[#FFFF00] sm:text-5xl lg:text-[3.5rem]">
                Thank You!
              </h1>
              <div className="my-4 h-px w-full bg-white/15" />
              <p className="font-kalam text-xl font-bold text-[#FFFFFF] sm:text-2xl">
                {PROFILE.name}
              </p>
              <p className="mt-1 font-kalam text-xs text-[#A0B2B2] sm:text-sm">
                {PROFILE.degree} · {PROFILE.college}
              </p>
            </div>

            <div className="border-t border-white/15 pt-4 md:col-span-5 md:border-l md:border-t-0 md:pl-6 md:pt-0">
              <h2 className="font-kalam text-sm font-bold tracking-[0.14em] text-[#C8FF27] uppercase sm:text-base">
                Contact Details
              </h2>
              <dl className="mt-3 space-y-3 font-kalam text-xs sm:text-sm">
                <div>
                  <dt className="text-[#A0B2B2]">Email</dt>
                  <dd className="mt-0.5">
                    <span className="break-all font-bold text-[#FFFFFF]">
                      {PROFILE.email}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-[#A0B2B2]">Mobile</dt>
                  <dd className="mt-0.5 tabular-nums">
                    <span className="font-bold text-[#FFFFFF]">
                      {PROFILE.mobile}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-[#A0B2B2]">Location</dt>
                  <dd className="mt-0.5 font-bold text-[#FFFFFF]">
                    {PROFILE.location}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      );
  }
}
