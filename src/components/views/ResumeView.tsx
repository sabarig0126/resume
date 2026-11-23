import { motion } from 'motion/react';
import { RESUME_PDF_PATH } from '../../data/projects';
import { ExternalPortalIcon } from '../NextGenIcons';

const INTEREST_ITEMS = [
  'Artificial Intelligence',
  'Machine Learning',
  'Data Science',
  'Python',
  'Data Analytics',
  'Databases',
  'Math Computing',
  'Emerging Tech',
] as const;

const SOFT_SKILL_ITEMS = [
  'Communication',
  'Problem-Solving',
  'Teamwork',
  'Time Management',
  'Critical Thinking',
  'Adaptability',
  'Quick Learning',
] as const;

const STRENGTH_ITEMS = [
  'Self-Motivated',
  'Hardworking',
  'Positive Attitude',
  'Willingness to Learn',
] as const;

const HOBBY_ITEMS = [
  'Exploring new technologies',
  'Learning programming',
  'Listening to music',
] as const;

const EDUCATION_ITEMS = [
  {
    title: 'B.Tech Artificial Intelligence & Data Science',
    institution: 'Sri Ramakrishna Institute of Technology',
    score: '2nd Year',
  },
  {
    title: 'Higher Secondary',
    institution: 'Thanappa Gounder Matric Higher Secondary School, Dharmapuri',
    score: '85.5%',
  },
  {
    title: 'SSLC',
    institution: 'Thanappa Gounder Matric Higher Secondary School, Dharmapuri',
    score: '81%',
  },
] as const;

const ACHIEVEMENT_ITEMS = [
  {
    label: 'NPTEL Elite:',
    detail: 'Design Thinking – A Primer, IIT Madras (63%)',
  },
  {
    label: 'IIT Bombay:',
    detail: 'Illuminate Entrepreneurship Bootcamp',
  },
  {
    label: 'TEDxSRIT:',
    detail: 'Participant, theme “Human in the Loop”',
  },
  {
    label: 'Smart India Hackathon:',
    detail: 'Internal round, college level',
  },
] as const;

const CERTIFICATION_ITEMS = [
  {
    label: 'MATLAB MathWorks:',
    detail: 'Onramp, Symbolic Math, Coder, Linear Algebra, Statistics, Clean Coding',
  },
  {
    label: 'Python & Data Science:',
    detail:
      'ML Bootcamp, Intro to Data Science, Ethical AI, Probability and Statistics using Python',
  },
  {
    label: 'Database & Programming:',
    detail: 'MySQL Project, MongoDB, Unix Fundamentals, Excel Macros & VBA',
  },
  {
    label: 'Data Analysis:',
    detail: 'Analysis Techniques, Grouped Data, Subsets, Cleaning and Preparing Data',
  },
  {
    label: 'IBM Career Education:',
    detail: 'DevOps, Agile & Design Thinking',
  },
  {
    label: 'Cybersecurity:',
    detail: 'Tech Mahindra Foundation, Skill India Digital Hub (10 hrs)',
  },
] as const;

const ACADEMIC_LEARNING_TOPICS = [
  'Programming Fundamentals',
  'Database Management Systems',
  'Data Structures and Algorithms',
  'Linear Algebra',
  'Probability and Statistics',
  'Python for Scientific Computing',
  'Fundamentals of AI',
  'Data Analysis Techniques',
] as const;

export function ResumeView() {
  return (
    <section className="mx-auto flex w-full max-w-[1340px] flex-1 flex-col justify-between overflow-x-clip px-3 py-4 sm:px-6 sm:py-6 md:px-8 lg:px-[clamp(1.25rem,2.6vw,2.5rem)] lg:py-[clamp(0.55rem,1.15dvh,1rem)] 2xl:max-w-[1400px]">
      {/* Top Section Header & Official Resume Link */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3 lg:mb-[clamp(0.45rem,0.95dvh,0.8rem)] lg:pb-[clamp(0.35rem,0.75dvh,0.65rem)]">
        <p className="font-kalam text-xs text-[#F05BEA] tabular-nums">
          07 · Official Resume
        </p>

        <div className="flex flex-wrap items-center gap-2.5">
          <a
            href={RESUME_PDF_PATH}
            target="_blank"
            rel="noopener noreferrer"
            className="touch-press inline-flex min-h-[44px] sm:min-h-[38px] lg:min-h-[34px] items-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.04] px-3.5 py-2 lg:py-1 font-kalam text-xs font-semibold text-[#FFFFFF] transition-colors duration-200 hover:border-[#F05BEA]/65 hover:bg-[#F05BEA]/15 whitespace-nowrap shrink-0"
          >
            <ExternalPortalIcon className="h-3.5 w-3.5 text-[#F05BEA]" />
            <span>View Resume</span>
          </a>
        </div>
      </div>

      {/* Authentic Vintage Broadsheet Newsprint Resume */}
      <motion.article
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
        aria-label="Sabarivasan G Vintage Newspaper Resume"
        className="relative overflow-hidden rounded-none border border-[#B5A480] bg-[#EAE0C5] p-3 text-[#1D1914] shadow-[inset_0_0_72px_rgba(92,70,34,0.34),inset_0_0_16px_rgba(62,44,18,0.22),0_26px_64px_-16px_rgba(0,0,0,0.82)] sm:p-5 md:p-7 lg:px-[clamp(1.25rem,2.4vw,2rem)] lg:py-[clamp(0.85rem,1.65dvh,1.4rem)]"
      >
        {/* Subtle Aged Newsprint Paper Fiber & Grain Texture */}
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 h-full w-full opacity-[0.22] mix-blend-multiply"
        >
          <filter id="vintage-newsprint-grain">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.82"
              numOctaves="4"
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect
            width="100%"
            height="100%"
            filter="url(#vintage-newsprint-grain)"
          />
        </svg>

        {/* Subtle Broadsheet Center Fold Crease on Desktop */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-1/2 z-0 hidden w-[3px] -translate-x-1/2 bg-[#4A3B22]/[0.07] lg:block"
        />

        {/* Printed Broadsheet Content */}
        <div className="relative z-10 border-t-[3px] border-[#1A1611] pt-[2px]">
          <div className="border-t border-[#1A1611] pt-2.5 sm:pt-3.5 lg:pt-[clamp(0.45rem,0.95dvh,0.75rem)]">
            {/* NEWSPAPER MASTHEAD */}
            <header className="text-center">
              <h1 className="font-['Playfair_Display',Georgia,'Times_New_Roman',Times,serif] text-[1.95rem] font-black tracking-[0.06em] text-[#17130E] uppercase leading-[0.95] sm:text-[3rem] md:text-[3.35rem] lg:text-[clamp(2.25rem,4.4dvh,3.4rem)]">
                SABARIVASAN G
              </h1>

              {/* Thin Double-Line Rule & Compact Newspaper Information Strip */}
              <div className="mt-2.5 border-t-[3px] border-double border-[#1A1611] border-b-[3px] py-1.5 sm:mt-3 sm:py-2 lg:mt-[clamp(0.4rem,0.85dvh,0.65rem)] lg:py-[clamp(0.28rem,0.6dvh,0.48rem)]">
                <div className="flex flex-col items-center justify-between gap-1.5 text-center md:flex-row md:gap-4 md:text-left">
                  <p className="font-['Libre_Baskerville',Georgia,'Times_New_Roman',Times,serif] text-[11px] font-bold tracking-[0.04em] text-[#1D1914] uppercase sm:text-xs lg:text-[clamp(0.7rem,1.38dvh,0.84rem)]">
                    B.Tech Artificial Intelligence &amp; Data Science
                    <span aria-hidden="true" className="mx-1.5 text-[#544A3C]">
                      ·
                    </span>
                    <span className="font-normal normal-case italic text-[#332C22]">
                      Sri Ramakrishna Institute of Technology · 2nd Year
                    </span>
                  </p>

                  <dl className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-0.5 font-['Libre_Baskerville',Georgia,'Times_New_Roman',Times,serif] text-[11px] text-[#241F18] sm:text-xs md:justify-end lg:gap-x-3 lg:text-[clamp(0.68rem,1.32dvh,0.8rem)]">
                    <div className="flex min-w-0 items-baseline gap-1">
                      <dt className="font-bold tracking-wider text-[#17130E] uppercase">
                        Email:
                      </dt>
                      <dd className="break-all">gsabarivasan007@gmail.com</dd>
                    </div>
                    <span aria-hidden="true" className="hidden text-[#5C5142] sm:inline">
                      |
                    </span>
                    <div className="flex items-baseline gap-1">
                      <dt className="font-bold tracking-wider text-[#17130E] uppercase">
                        Phone:
                      </dt>
                      <dd className="tabular-nums">9688283942</dd>
                    </div>
                    <span aria-hidden="true" className="hidden text-[#5C5142] sm:inline">
                      |
                    </span>
                    <div className="flex items-baseline gap-1">
                      <dt className="font-bold tracking-wider text-[#17130E] uppercase">
                        Location:
                      </dt>
                      <dd>Coimbatore</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </header>

            {/* EDITORIAL INTRODUCTION: CAREER OBJECTIVE */}
            <section
              aria-labelledby="resume-objective-heading"
              className="border-b-2 border-[#1A1611] py-2.5 sm:py-3 lg:py-[clamp(0.45rem,0.95dvh,0.72rem)]"
            >
              <div className="mb-1 flex items-center gap-3 lg:mb-[clamp(0.2rem,0.45dvh,0.35rem)]">
                <span
                  aria-hidden="true"
                  className="h-px flex-1 bg-[#1A1611]/45"
                />
                <h2
                  id="resume-objective-heading"
                  className="font-['Playfair_Display',Georgia,'Times_New_Roman',Times,serif] text-xs font-extrabold tracking-[0.18em] text-[#17130E] uppercase sm:text-[13px] lg:text-[clamp(0.72rem,1.42dvh,0.88rem)]"
                >
                  CAREER OBJECTIVE
                </h2>
                <span
                  aria-hidden="true"
                  className="h-px flex-1 bg-[#1A1611]/45"
                />
              </div>

              <p className="flow-root font-['Libre_Baskerville',Georgia,'Times_New_Roman',Times,serif] text-[13px] leading-[1.45] text-[#241F18] text-justify [hyphens:auto] first-letter:float-left first-letter:mr-2 first-letter:font-['Playfair_Display',Georgia,'Times_New_Roman',Times,serif] first-letter:text-[2.25rem] first-letter:font-black first-letter:leading-[0.82] first-letter:text-[#17130E] sm:text-sm sm:leading-[1.48] lg:text-[clamp(0.74rem,min(1.48dvh,0.98vw),0.9rem)] lg:leading-[1.38]">
                To build a successful career in technology by applying my knowledge of programming, data analysis and mathematics to Artificial Intelligence and Data Science, growing through continuous learning, dedication and hands-on practice.
              </p>
            </section>

            {/* TWO-COLUMN VINTAGE NEWSPAPER EDITORIAL BODY */}
            <div className="mt-3 grid grid-cols-1 gap-5 lg:mt-[clamp(0.5rem,1.05dvh,0.85rem)] lg:grid-cols-2 lg:items-stretch lg:gap-0">
              {/* COLUMN I: EDUCATION, TECHNICAL SKILLS & ACADEMIC LEARNING */}
              <div className="flex flex-col space-y-4 lg:border-r lg:border-[#1A1611]/70 lg:pr-[clamp(0.95rem,1.85vw,1.5rem)] lg:justify-between lg:space-y-[clamp(0.45rem,1dvh,0.8rem)]">
                {/* EDUCATION */}
                <section aria-labelledby="resume-education-heading">
                  <div className="border-b border-[#1A1611] pb-1">
                    <h2
                      id="resume-education-heading"
                      className="font-['Playfair_Display',Georgia,'Times_New_Roman',Times,serif] text-[15px] font-black tracking-[0.1em] text-[#17130E] uppercase sm:text-base lg:text-[clamp(0.84rem,1.68dvh,1.05rem)] lg:leading-tight"
                    >
                      EDUCATION
                    </h2>
                  </div>

                  <div className="mt-2 divide-y divide-dotted divide-[#292218]/45 lg:mt-[clamp(0.28rem,0.6dvh,0.45rem)]">
                    {EDUCATION_ITEMS.map((edu) => (
                      <div
                        key={edu.title}
                        className="flex flex-col gap-0.5 py-1.5 first:pt-0 last:pb-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3 lg:py-[clamp(0.22rem,0.48dvh,0.38rem)]"
                      >
                        <div className="min-w-0">
                          <h3 className="font-['Playfair_Display',Georgia,'Times_New_Roman',Times,serif] text-[13.5px] font-bold leading-snug text-[#17130E] sm:text-sm lg:text-[clamp(0.75rem,min(1.5dvh,0.98vw),0.92rem)] lg:leading-[1.25]">
                            {edu.title}
                          </h3>
                          <p className="font-['Libre_Baskerville',Georgia,'Times_New_Roman',Times,serif] text-[11.5px] italic leading-snug text-[#3D352A] sm:text-xs lg:text-[clamp(0.67rem,min(1.32dvh,0.86vw),0.8rem)] lg:leading-[1.28]">
                            {edu.institution}
                          </p>
                        </div>
                        <span className="shrink-0 font-['Libre_Baskerville',Georgia,'Times_New_Roman',Times,serif] text-xs font-bold text-[#17130E] tabular-nums lg:text-[clamp(0.71rem,min(1.4dvh,0.9vw),0.84rem)]">
                          {edu.score}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>

                {/* TECHNICAL SKILLS */}
                <section
                  aria-labelledby="resume-skills-heading"
                  className="border-t-2 border-[#1A1611] pt-3 lg:pt-[clamp(0.4rem,0.88dvh,0.7rem)]"
                >
                  <div className="border-b border-[#1A1611] pb-1">
                    <h2
                      id="resume-skills-heading"
                      className="font-['Playfair_Display',Georgia,'Times_New_Roman',Times,serif] text-[15px] font-black tracking-[0.1em] text-[#17130E] uppercase sm:text-base lg:text-[clamp(0.84rem,1.68dvh,1.05rem)] lg:leading-tight"
                    >
                      TECHNICAL SKILLS
                    </h2>
                  </div>

                  <div className="mt-2 grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2 lg:mt-[clamp(0.28rem,0.6dvh,0.45rem)] lg:gap-y-[clamp(0.24rem,0.52dvh,0.4rem)]">
                    <div className="border-b border-dotted border-[#292218]/35 pb-1.5">
                      <h3 className="font-['Playfair_Display',Georgia,'Times_New_Roman',Times,serif] text-[11px] font-extrabold tracking-[0.12em] text-[#3A3126] uppercase lg:text-[clamp(0.65rem,1.25dvh,0.76rem)]">
                        PROGRAMMING
                      </h3>
                      <p className="mt-0.5 font-['Libre_Baskerville',Georgia,'Times_New_Roman',Times,serif] text-[12.5px] leading-[1.35] text-[#1D1914] lg:text-[clamp(0.7rem,min(1.38dvh,0.9vw),0.84rem)] lg:leading-[1.3]">
                        Python · C
                      </p>
                    </div>

                    <div className="border-b border-dotted border-[#292218]/35 pb-1.5">
                      <h3 className="font-['Playfair_Display',Georgia,'Times_New_Roman',Times,serif] text-[11px] font-extrabold tracking-[0.12em] text-[#3A3126] uppercase lg:text-[clamp(0.65rem,1.25dvh,0.76rem)]">
                        DATABASES
                      </h3>
                      <p className="mt-0.5 font-['Libre_Baskerville',Georgia,'Times_New_Roman',Times,serif] text-[12.5px] leading-[1.35] text-[#1D1914] lg:text-[clamp(0.7rem,min(1.38dvh,0.9vw),0.84rem)] lg:leading-[1.3]">
                        SQL · DBMS · MongoDB
                      </p>
                    </div>

                    <div className="border-b border-dotted border-[#292218]/35 pb-1.5 sm:border-b-0 sm:pb-0">
                      <h3 className="font-['Playfair_Display',Georgia,'Times_New_Roman',Times,serif] text-[11px] font-extrabold tracking-[0.12em] text-[#3A3126] uppercase lg:text-[clamp(0.65rem,1.25dvh,0.76rem)]">
                        TOOLS
                      </h3>
                      <p className="mt-0.5 font-['Libre_Baskerville',Georgia,'Times_New_Roman',Times,serif] text-[12.5px] leading-[1.35] text-[#1D1914] lg:text-[clamp(0.7rem,min(1.38dvh,0.9vw),0.84rem)] lg:leading-[1.3]">
                        MATLAB · Excel
                      </p>
                    </div>

                    <div>
                      <h3 className="font-['Playfair_Display',Georgia,'Times_New_Roman',Times,serif] text-[11px] font-extrabold tracking-[0.12em] text-[#3A3126] uppercase lg:text-[clamp(0.65rem,1.25dvh,0.76rem)]">
                        KNOWLEDGE
                      </h3>
                      <p className="mt-0.5 font-['Libre_Baskerville',Georgia,'Times_New_Roman',Times,serif] text-[12.5px] leading-[1.35] text-[#1D1914] lg:text-[clamp(0.7rem,min(1.38dvh,0.9vw),0.84rem)] lg:leading-[1.3]">
                        Data Analysis · AI Fundamentals · DSA · Mathematical Computing
                      </p>
                    </div>
                  </div>
                </section>

                {/* ACADEMIC LEARNING */}
                <section
                  aria-labelledby="resume-learning-heading"
                  className="border-t-2 border-[#1A1611] pt-3 lg:pt-[clamp(0.4rem,0.88dvh,0.7rem)]"
                >
                  <div className="border-b border-[#1A1611] pb-1">
                    <h2
                      id="resume-learning-heading"
                      className="font-['Playfair_Display',Georgia,'Times_New_Roman',Times,serif] text-[15px] font-black tracking-[0.1em] text-[#17130E] uppercase sm:text-base lg:text-[clamp(0.84rem,1.68dvh,1.05rem)] lg:leading-tight"
                    >
                      ACADEMIC LEARNING
                    </h2>
                  </div>

                  <ul className="mt-2 grid grid-cols-1 gap-x-3 gap-y-1 font-['Libre_Baskerville',Georgia,'Times_New_Roman',Times,serif] text-[12px] leading-[1.35] text-[#241F18] sm:grid-cols-2 lg:mt-[clamp(0.28rem,0.6dvh,0.45rem)] lg:gap-y-[clamp(0.15rem,0.34dvh,0.28rem)] lg:text-[clamp(0.68rem,min(1.35dvh,0.88vw),0.82rem)] lg:leading-[1.28]">
                    {ACADEMIC_LEARNING_TOPICS.map((topic) => (
                      <li key={topic} className="flex items-start gap-1.5">
                        <span aria-hidden="true" className="text-[#453C30]">
                          ▪
                        </span>
                        <span>{topic}</span>
                      </li>
                    ))}
                  </ul>

                  <p className="mt-2.5 border-t border-dotted border-[#292218]/45 pt-2 font-['Libre_Baskerville',Georgia,'Times_New_Roman',Times,serif] text-[12px] leading-[1.4] text-[#2A231B] text-justify [hyphens:auto] lg:mt-[clamp(0.28rem,0.6dvh,0.45rem)] lg:pt-[clamp(0.22rem,0.48dvh,0.38rem)] lg:text-[clamp(0.69rem,min(1.36dvh,0.89vw),0.83rem)] lg:leading-[1.32]">
                    <strong className="font-bold text-[#17130E] uppercase tracking-wide">
                      Goal:
                    </strong>{' '}
                    to strengthen my theoretical foundation and turn it into practical technical skills through continuous, hands-on learning.
                  </p>
                </section>
              </div>

              {/* COLUMN II: ACHIEVEMENTS, CERTIFICATIONS & COURSES, SOFT SKILLS & STRENGTHS, INTERESTS & HOBBIES */}
              <div className="flex flex-col space-y-4 border-t-2 border-[#1A1611] pt-4 lg:border-t-0 lg:pt-0 lg:pl-[clamp(0.95rem,1.85vw,1.5rem)] lg:justify-between lg:space-y-[clamp(0.45rem,1dvh,0.8rem)]">
                {/* ACHIEVEMENTS */}
                <section aria-labelledby="resume-achievements-heading">
                  <div className="border-b border-[#1A1611] pb-1">
                    <h2
                      id="resume-achievements-heading"
                      className="font-['Playfair_Display',Georgia,'Times_New_Roman',Times,serif] text-[15px] font-black tracking-[0.1em] text-[#17130E] uppercase sm:text-base lg:text-[clamp(0.84rem,1.68dvh,1.05rem)] lg:leading-tight"
                    >
                      ACHIEVEMENTS
                    </h2>
                  </div>

                  <ul className="mt-2 space-y-1.5 font-['Libre_Baskerville',Georgia,'Times_New_Roman',Times,serif] text-[12.5px] leading-[1.38] text-[#241F18] lg:mt-[clamp(0.28rem,0.6dvh,0.45rem)] lg:space-y-[clamp(0.2rem,0.45dvh,0.36rem)] lg:text-[clamp(0.69rem,min(1.38dvh,0.9vw),0.84rem)] lg:leading-[1.3]">
                    {ACHIEVEMENT_ITEMS.map((item) => (
                      <li key={item.label} className="flex items-start gap-1.5">
                        <span aria-hidden="true" className="text-[#453C30]">
                          ▪
                        </span>
                        <span>
                          <strong className="font-bold text-[#17130E]">
                            {item.label}
                          </strong>{' '}
                          <span className="text-[#2D261D]">{item.detail}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>

                {/* CERTIFICATIONS & COURSES */}
                <section
                  aria-labelledby="resume-certifications-heading"
                  className="border-t-2 border-[#1A1611] pt-3 lg:pt-[clamp(0.4rem,0.88dvh,0.7rem)]"
                >
                  <div className="border-b border-[#1A1611] pb-1">
                    <h2
                      id="resume-certifications-heading"
                      className="font-['Playfair_Display',Georgia,'Times_New_Roman',Times,serif] text-[15px] font-black tracking-[0.1em] text-[#17130E] uppercase sm:text-base lg:text-[clamp(0.84rem,1.68dvh,1.05rem)] lg:leading-tight"
                    >
                      CERTIFICATIONS &amp; COURSES
                    </h2>
                  </div>

                  <ul className="mt-2 space-y-1.5 font-['Libre_Baskerville',Georgia,'Times_New_Roman',Times,serif] text-[12px] leading-[1.38] text-[#241F18] text-justify [hyphens:auto] lg:mt-[clamp(0.28rem,0.6dvh,0.45rem)] lg:space-y-[clamp(0.18rem,0.4dvh,0.32rem)] lg:text-[clamp(0.68rem,min(1.35dvh,0.88vw),0.82rem)] lg:leading-[1.28]">
                    {CERTIFICATION_ITEMS.map((cert) => (
                      <li key={cert.label} className="flex items-start gap-1.5 text-left">
                        <span aria-hidden="true" className="text-[#453C30]">
                          ▪
                        </span>
                        <span>
                          <strong className="font-bold text-[#17130E]">
                            {cert.label}
                          </strong>{' '}
                          <span className="text-[#2D261D]">{cert.detail}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>

                {/* SOFT SKILLS & STRENGTHS */}
                <div className="grid grid-cols-1 gap-4 border-t-2 border-[#1A1611] pt-3 sm:grid-cols-2 sm:gap-0 lg:pt-[clamp(0.4rem,0.88dvh,0.7rem)]">
                  <section
                    aria-labelledby="resume-soft-skills-heading"
                    className="sm:border-r sm:border-[#1A1611]/45 sm:pr-3.5"
                  >
                    <h2
                      id="resume-soft-skills-heading"
                      className="border-b border-[#1A1611] pb-0.5 font-['Playfair_Display',Georgia,'Times_New_Roman',Times,serif] text-[13px] font-black tracking-[0.1em] text-[#17130E] uppercase sm:text-sm lg:text-[clamp(0.76rem,1.5dvh,0.92rem)]"
                    >
                      SOFT SKILLS
                    </h2>
                    <ul className="mt-1.5 grid grid-cols-1 gap-x-2 gap-y-0.5 font-['Libre_Baskerville',Georgia,'Times_New_Roman',Times,serif] text-[11.5px] leading-[1.34] text-[#241F18] min-[375px]:grid-cols-2 sm:grid-cols-1 lg:grid-cols-2 lg:text-[clamp(0.66rem,min(1.3dvh,0.84vw),0.79rem)] lg:leading-[1.26]">
                      {SOFT_SKILL_ITEMS.map((item) => (
                        <li key={item} className="flex items-start gap-1">
                          <span aria-hidden="true" className="text-[#453C30]">
                            ·
                          </span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section
                    aria-labelledby="resume-strengths-heading"
                    className="border-t border-dotted border-[#292218]/45 pt-3 sm:border-t-0 sm:pt-0 sm:pl-3.5"
                  >
                    <h2
                      id="resume-strengths-heading"
                      className="border-b border-[#1A1611] pb-0.5 font-['Playfair_Display',Georgia,'Times_New_Roman',Times,serif] text-[13px] font-black tracking-[0.1em] text-[#17130E] uppercase sm:text-sm lg:text-[clamp(0.76rem,1.5dvh,0.92rem)]"
                    >
                      STRENGTHS
                    </h2>
                    <ul className="mt-1.5 space-y-0.5 font-['Libre_Baskerville',Georgia,'Times_New_Roman',Times,serif] text-[11.5px] leading-[1.34] text-[#241F18] lg:text-[clamp(0.66rem,min(1.3dvh,0.84vw),0.79rem)] lg:leading-[1.26]">
                      {STRENGTH_ITEMS.map((item) => (
                        <li key={item} className="flex items-start gap-1.5">
                          <span aria-hidden="true" className="text-[#453C30]">
                            ·
                          </span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                </div>

                {/* INTERESTS & HOBBIES (Newspaper Classifieds Box) */}
                <div className="border border-[#1A1611]/75 bg-[#E2D6B5]/60 p-2.5 sm:p-3 lg:p-[clamp(0.45rem,0.9dvh,0.72rem)]">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-12 sm:gap-0">
                    <section
                      aria-labelledby="resume-interests-heading"
                      className="sm:col-span-7 sm:border-r sm:border-[#1A1611]/40 sm:pr-3"
                    >
                      <h2
                        id="resume-interests-heading"
                        className="border-b border-[#1A1611]/60 pb-0.5 font-['Playfair_Display',Georgia,'Times_New_Roman',Times,serif] text-xs font-black tracking-[0.12em] text-[#17130E] uppercase lg:text-[clamp(0.7rem,1.38dvh,0.84rem)]"
                      >
                        INTERESTS
                      </h2>
                      <p className="mt-1.5 font-['Libre_Baskerville',Georgia,'Times_New_Roman',Times,serif] text-[11.5px] leading-[1.38] text-[#241F18] lg:text-[clamp(0.66rem,min(1.28dvh,0.82vw),0.78rem)] lg:leading-[1.3]">
                        {INTEREST_ITEMS.join(' · ')}
                      </p>
                    </section>

                    <section
                      aria-labelledby="resume-hobbies-heading"
                      className="border-t border-dotted border-[#292218]/45 pt-2 sm:col-span-5 sm:border-t-0 sm:pt-0 sm:pl-3"
                    >
                      <h2
                        id="resume-hobbies-heading"
                        className="border-b border-[#1A1611]/60 pb-0.5 font-['Playfair_Display',Georgia,'Times_New_Roman',Times,serif] text-xs font-black tracking-[0.12em] text-[#17130E] uppercase lg:text-[clamp(0.7rem,1.38dvh,0.84rem)]"
                      >
                        HOBBIES
                      </h2>
                      <ul className="mt-1.5 space-y-0.5 font-['Libre_Baskerville',Georgia,'Times_New_Roman',Times,serif] text-[11.5px] leading-[1.34] text-[#241F18] lg:text-[clamp(0.66rem,min(1.28dvh,0.82vw),0.78rem)] lg:leading-[1.26]">
                        {HOBBY_ITEMS.map((item) => (
                          <li key={item} className="flex items-start gap-1">
                            <span aria-hidden="true" className="text-[#453C30]">
                              ·
                            </span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </section>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Closing Double Ink Rule */}
            <div
              aria-hidden="true"
              className="mt-3 border-t border-[#1A1611] pt-[2px] lg:mt-[clamp(0.45rem,0.95dvh,0.75rem)]"
            >
              <div className="border-t-2 border-[#1A1611]" />
            </div>
          </div>
        </div>
      </motion.article>
    </section>
  );
}
