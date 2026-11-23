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

      {/* Authentic Crisp Ash-White Broadsheet Newspaper Resume */}
      <motion.article
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
        aria-label="Sabarivasan G Broadsheet Newspaper Resume"
        className="relative overflow-hidden rounded-none border border-[#C6C6C0] bg-[#F3F3EF] p-3 text-[#121212] shadow-[inset_0_0_32px_rgba(0,0,0,0.06),0_26px_64px_-16px_rgba(0,0,0,0.85)] sm:p-5 md:p-6 lg:px-[clamp(1.2rem,2.3vw,1.9rem)] lg:py-[clamp(0.8rem,1.5dvh,1.25rem)]"
      >
        {/* Subtle Neutral Newsprint Paper Grain Texture (Zero Brown Tint) */}
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 h-full w-full opacity-[0.065] mix-blend-multiply"
        >
          <filter id="newsprint-paper-grain">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.88"
              numOctaves="3"
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect
            width="100%"
            height="100%"
            filter="url(#newsprint-paper-grain)"
          />
        </svg>

        {/* Subtle Vertical Broadsheet Fold Creases on Desktop */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-1/3 z-0 hidden w-px bg-black/[0.05] lg:block"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-2/3 z-0 hidden w-px bg-black/[0.05] lg:block"
        />

        {/* Printed Broadsheet Content */}
        <div className="relative z-10 border-t-[4px] border-[#111111] pt-[2px]">
          <div className="border-t border-[#111111] pt-2 sm:pt-2.5 lg:pt-[clamp(0.35rem,0.75dvh,0.6rem)]">
            {/* FRONT-PAGE NEWSPAPER MASTHEAD WITH CLASSIC SIDE EARS */}
            <header className="text-center">
              <div className="grid grid-cols-1 items-center gap-2 md:grid-cols-12 md:gap-3">
                {/* Left Newspaper Ear Box */}
                <div className="hidden border border-[#111111] bg-[#EAEAE5] px-2 py-1 text-left md:col-span-3 md:block">
                  <p className="font-['Playfair_Display',Georgia,'Times_New_Roman',Times,serif] text-[9.5px] font-black tracking-[0.12em] text-[#111111] uppercase lg:text-[10px]">
                    B.Tech · 2nd Year
                  </p>
                  <p className="font-['Libre_Baskerville',Georgia,'Times_New_Roman',Times,serif] text-[9px] italic leading-tight text-[#333333] lg:text-[9.5px]">
                    AI &amp; Data Science
                  </p>
                </div>

                {/* Bold Broadsheet Masthead Title */}
                <div className="md:col-span-6">
                  <h1 className="font-['Playfair_Display',Georgia,'Times_New_Roman',Times,serif] text-[2rem] font-black tracking-[0.06em] text-[#0E0E0E] uppercase leading-[0.95] sm:text-[2.85rem] md:text-[3.1rem] lg:text-[clamp(2.1rem,4.1dvh,3.15rem)]">
                    SABARIVASAN G
                  </h1>
                </div>

                {/* Right Newspaper Ear Box */}
                <div className="hidden border border-[#111111] bg-[#EAEAE5] px-2 py-1 text-right md:col-span-3 md:block">
                  <p className="font-['Playfair_Display',Georgia,'Times_New_Roman',Times,serif] text-[9.5px] font-black tracking-[0.12em] text-[#111111] uppercase lg:text-[10px]">
                    Coimbatore
                  </p>
                  <p className="font-['Libre_Baskerville',Georgia,'Times_New_Roman',Times,serif] text-[9px] italic leading-tight text-[#333333] lg:text-[9.5px]">
                    Sri Ramakrishna Inst. of Tech.
                  </p>
                </div>
              </div>

              {/* Newspaper Dateline & Contact Rule Strip */}
              <div className="mt-2 border-t-[3px] border-double border-[#111111] border-b-[2px] bg-[#ECECE7] px-2 py-1 sm:mt-2.5 sm:py-1.5 lg:mt-[clamp(0.35rem,0.7dvh,0.55rem)] lg:py-[clamp(0.24rem,0.5dvh,0.4rem)]">
                <div className="flex flex-col items-center justify-between gap-1 text-center md:flex-row md:gap-4 md:text-left">
                  <p className="font-['Libre_Baskerville',Georgia,'Times_New_Roman',Times,serif] text-[10.5px] font-bold tracking-[0.04em] text-[#121212] uppercase sm:text-[11px] lg:text-[clamp(0.68rem,1.3dvh,0.8rem)]">
                    B.Tech Artificial Intelligence &amp; Data Science
                    <span aria-hidden="true" className="mx-1.5 text-[#555555]">
                      ·
                    </span>
                    <span className="font-normal normal-case italic text-[#2B2B2B]">
                      Sri Ramakrishna Institute of Technology · 2nd Year
                    </span>
                  </p>

                  <dl className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-0.5 font-['Libre_Baskerville',Georgia,'Times_New_Roman',Times,serif] text-[10.5px] text-[#1C1C1C] sm:text-[11px] md:justify-end lg:gap-x-3 lg:text-[clamp(0.66rem,1.25dvh,0.78rem)]">
                    <div className="flex min-w-0 items-baseline gap-1">
                      <dt className="font-bold tracking-wider text-[#0E0E0E] uppercase">
                        Email:
                      </dt>
                      <dd className="break-all">gsabarivasan007@gmail.com</dd>
                    </div>
                    <span aria-hidden="true" className="hidden text-[#666666] sm:inline">
                      |
                    </span>
                    <div className="flex items-baseline gap-1">
                      <dt className="font-bold tracking-wider text-[#0E0E0E] uppercase">
                        Phone:
                      </dt>
                      <dd className="tabular-nums">9688283942</dd>
                    </div>
                    <span aria-hidden="true" className="hidden text-[#666666] sm:inline">
                      |
                    </span>
                    <div className="flex items-baseline gap-1">
                      <dt className="font-bold tracking-wider text-[#0E0E0E] uppercase">
                        Location:
                      </dt>
                      <dd>Coimbatore</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </header>

            {/* FRONT-PAGE LEAD STORY: CAREER OBJECTIVE */}
            <section
              aria-labelledby="resume-objective-heading"
              className="border-b-2 border-[#111111] py-2 sm:py-2.5 lg:py-[clamp(0.38rem,0.8dvh,0.62rem)]"
            >
              <div className="mb-1 flex items-center gap-3 lg:mb-[clamp(0.18rem,0.38dvh,0.3rem)]">
                <span
                  aria-hidden="true"
                  className="h-[2px] flex-1 bg-[#111111]"
                />
                <h2
                  id="resume-objective-heading"
                  className="bg-[#111111] px-2.5 py-0.5 font-['Playfair_Display',Georgia,'Times_New_Roman',Times,serif] text-[11px] font-black tracking-[0.18em] text-[#F3F3EF] uppercase sm:text-xs lg:text-[clamp(0.66rem,1.28dvh,0.8rem)]"
                >
                  CAREER OBJECTIVE
                </h2>
                <span
                  aria-hidden="true"
                  className="h-[2px] flex-1 bg-[#111111]"
                />
              </div>

              <p className="flow-root font-['Libre_Baskerville',Georgia,'Times_New_Roman',Times,serif] text-[12.5px] leading-[1.45] text-[#1A1A1A] text-justify [hyphens:auto] first-letter:float-left first-letter:mr-2 first-letter:font-['Playfair_Display',Georgia,'Times_New_Roman',Times,serif] first-letter:text-[2.2rem] first-letter:font-black first-letter:leading-[0.82] first-letter:text-[#0E0E0E] sm:text-[13.5px] sm:leading-[1.46] lg:text-[clamp(0.73rem,min(1.42dvh,0.94vw),0.88rem)] lg:leading-[1.36]">
                To build a successful career in technology by applying my knowledge of programming, data analysis and mathematics to Artificial Intelligence and Data Science, growing through continuous learning, dedication and hands-on practice.
              </p>
            </section>

            {/* THREE-COLUMN CLASSIC NEWSPAPER BROADSHEET GRID */}
            <div className="mt-2.5 grid grid-cols-1 gap-4 lg:mt-[clamp(0.45rem,0.95dvh,0.75rem)] lg:grid-cols-3 lg:items-stretch lg:gap-0 lg:divide-x lg:divide-[#111111]/65">
              {/* COLUMN I: EDUCATION, TECHNICAL SKILLS & SOFT SKILLS */}
              <div className="flex flex-col space-y-3.5 lg:justify-between lg:space-y-[clamp(0.4rem,0.9dvh,0.7rem)] lg:pr-[clamp(0.85rem,1.55vw,1.3rem)]">
                {/* EDUCATION */}
                <section aria-labelledby="resume-education-heading">
                  <div className="border-t-[2.5px] border-[#111111] border-b border-[#111111] py-0.5">
                    <h2
                      id="resume-education-heading"
                      className="font-['Playfair_Display',Georgia,'Times_New_Roman',Times,serif] text-[14.5px] font-black tracking-[0.1em] text-[#0E0E0E] uppercase sm:text-[15px] lg:text-[clamp(0.82rem,1.6dvh,1rem)] lg:leading-tight"
                    >
                      EDUCATION
                    </h2>
                  </div>

                  <div className="mt-1.5 divide-y divide-dotted divide-[#333333]/50 lg:mt-[clamp(0.24rem,0.5dvh,0.4rem)]">
                    {EDUCATION_ITEMS.map((edu) => (
                      <div
                        key={edu.title}
                        className="flex items-baseline justify-between gap-2 py-1.5 first:pt-0 last:pb-0 lg:py-[clamp(0.2rem,0.42dvh,0.34rem)]"
                      >
                        <div className="min-w-0">
                          <h3 className="font-['Playfair_Display',Georgia,'Times_New_Roman',Times,serif] text-[13px] font-bold leading-snug text-[#111111] sm:text-[13.5px] lg:text-[clamp(0.73rem,min(1.42dvh,0.92vw),0.88rem)] lg:leading-[1.22]">
                            {edu.title}
                          </h3>
                          <p className="font-['Libre_Baskerville',Georgia,'Times_New_Roman',Times,serif] text-[11px] italic leading-snug text-[#3A3A3A] sm:text-[11.5px] lg:text-[clamp(0.65rem,min(1.26dvh,0.82vw),0.77rem)] lg:leading-[1.25]">
                            {edu.institution}
                          </p>
                        </div>
                        <span className="shrink-0 border border-[#111111]/40 bg-[#EAEAE5] px-1.5 py-0.5 font-['Libre_Baskerville',Georgia,'Times_New_Roman',Times,serif] text-[10.5px] font-bold text-[#111111] tabular-nums lg:text-[clamp(0.66rem,min(1.28dvh,0.84vw),0.78rem)]">
                          {edu.score}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>

                {/* TECHNICAL SKILLS */}
                <section
                  aria-labelledby="resume-skills-heading"
                  className="pt-1"
                >
                  <div className="border-t-[2.5px] border-[#111111] border-b border-[#111111] py-0.5">
                    <h2
                      id="resume-skills-heading"
                      className="font-['Playfair_Display',Georgia,'Times_New_Roman',Times,serif] text-[14.5px] font-black tracking-[0.1em] text-[#0E0E0E] uppercase sm:text-[15px] lg:text-[clamp(0.82rem,1.6dvh,1rem)] lg:leading-tight"
                    >
                      TECHNICAL SKILLS
                    </h2>
                  </div>

                  <div className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-1.5 lg:mt-[clamp(0.24rem,0.5dvh,0.4rem)]">
                    <div className="border-b border-dotted border-[#333333]/40 pb-1">
                      <h3 className="font-['Playfair_Display',Georgia,'Times_New_Roman',Times,serif] text-[10.5px] font-extrabold tracking-[0.1em] text-[#333333] uppercase lg:text-[clamp(0.62rem,1.2dvh,0.74rem)]">
                        PROGRAMMING
                      </h3>
                      <p className="mt-0.5 font-['Libre_Baskerville',Georgia,'Times_New_Roman',Times,serif] text-[11.5px] leading-[1.3] text-[#141414] lg:text-[clamp(0.67rem,min(1.32dvh,0.86vw),0.8rem)]">
                        Python · C
                      </p>
                    </div>

                    <div className="border-b border-dotted border-[#333333]/40 pb-1">
                      <h3 className="font-['Playfair_Display',Georgia,'Times_New_Roman',Times,serif] text-[10.5px] font-extrabold tracking-[0.1em] text-[#333333] uppercase lg:text-[clamp(0.62rem,1.2dvh,0.74rem)]">
                        DATABASES
                      </h3>
                      <p className="mt-0.5 font-['Libre_Baskerville',Georgia,'Times_New_Roman',Times,serif] text-[11.5px] leading-[1.3] text-[#141414] lg:text-[clamp(0.67rem,min(1.32dvh,0.86vw),0.8rem)]">
                        SQL · DBMS · MongoDB
                      </p>
                    </div>

                    <div>
                      <h3 className="font-['Playfair_Display',Georgia,'Times_New_Roman',Times,serif] text-[10.5px] font-extrabold tracking-[0.1em] text-[#333333] uppercase lg:text-[clamp(0.62rem,1.2dvh,0.74rem)]">
                        TOOLS
                      </h3>
                      <p className="mt-0.5 font-['Libre_Baskerville',Georgia,'Times_New_Roman',Times,serif] text-[11.5px] leading-[1.3] text-[#141414] lg:text-[clamp(0.67rem,min(1.32dvh,0.86vw),0.8rem)]">
                        MATLAB · Excel
                      </p>
                    </div>

                    <div>
                      <h3 className="font-['Playfair_Display',Georgia,'Times_New_Roman',Times,serif] text-[10.5px] font-extrabold tracking-[0.1em] text-[#333333] uppercase lg:text-[clamp(0.62rem,1.2dvh,0.74rem)]">
                        KNOWLEDGE
                      </h3>
                      <p className="mt-0.5 font-['Libre_Baskerville',Georgia,'Times_New_Roman',Times,serif] text-[11.5px] leading-[1.3] text-[#141414] lg:text-[clamp(0.67rem,min(1.32dvh,0.86vw),0.8rem)]">
                        Data Analysis · AI Fundamentals · DSA · Mathematical Computing
                      </p>
                    </div>
                  </div>
                </section>

                {/* SOFT SKILLS */}
                <section
                  aria-labelledby="resume-soft-skills-heading"
                  className="pt-1"
                >
                  <div className="border-t-[2.5px] border-[#111111] border-b border-[#111111] py-0.5">
                    <h2
                      id="resume-soft-skills-heading"
                      className="font-['Playfair_Display',Georgia,'Times_New_Roman',Times,serif] text-[14.5px] font-black tracking-[0.1em] text-[#0E0E0E] uppercase sm:text-[15px] lg:text-[clamp(0.82rem,1.6dvh,1rem)] lg:leading-tight"
                    >
                      SOFT SKILLS
                    </h2>
                  </div>
                  <ul className="mt-1.5 grid grid-cols-2 gap-x-2 gap-y-0.5 font-['Libre_Baskerville',Georgia,'Times_New_Roman',Times,serif] text-[11.5px] leading-[1.34] text-[#1B1B1B] lg:mt-[clamp(0.24rem,0.5dvh,0.4rem)] lg:text-[clamp(0.66rem,min(1.28dvh,0.84vw),0.79rem)] lg:leading-[1.26]">
                    {SOFT_SKILL_ITEMS.map((item) => (
                      <li key={item} className="flex items-start gap-1">
                        <span aria-hidden="true" className="text-[#444444]">
                          ·
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              </div>

              {/* COLUMN II: CERTIFICATIONS & ACADEMIC LEARNING */}
              <div className="flex flex-col space-y-3.5 border-t-2 border-[#111111] pt-3.5 lg:border-t-0 lg:pt-0 lg:justify-between lg:space-y-[clamp(0.4rem,0.9dvh,0.7rem)] lg:px-[clamp(0.85rem,1.55vw,1.3rem)]">
                {/* CERTIFICATIONS & COURSES */}
                <section aria-labelledby="resume-certifications-heading">
                  <div className="bg-[#111111] px-2 py-0.5">
                    <h2
                      id="resume-certifications-heading"
                      className="font-['Playfair_Display',Georgia,'Times_New_Roman',Times,serif] text-[13.5px] font-black tracking-[0.1em] text-[#F3F3EF] uppercase sm:text-[14px] lg:text-[clamp(0.78rem,1.52dvh,0.95rem)] lg:leading-tight"
                    >
                      CERTIFICATIONS &amp; COURSES
                    </h2>
                  </div>

                  <ul className="mt-1.5 divide-y divide-dotted divide-[#333333]/40 font-['Libre_Baskerville',Georgia,'Times_New_Roman',Times,serif] text-[11.5px] leading-[1.36] text-[#1B1B1B] lg:mt-[clamp(0.24rem,0.5dvh,0.4rem)] lg:text-[clamp(0.67rem,min(1.32dvh,0.85vw),0.8rem)] lg:leading-[1.28]">
                    {CERTIFICATION_ITEMS.map((cert) => (
                      <li
                        key={cert.label}
                        className="flex items-start gap-1.5 py-1 first:pt-0 last:pb-0 text-left"
                      >
                        <span aria-hidden="true" className="text-[#333333]">
                          ▪
                        </span>
                        <span>
                          <strong className="font-bold text-[#0E0E0E]">
                            {cert.label}
                          </strong>{' '}
                          <span className="text-[#262626]">{cert.detail}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>

                {/* ACADEMIC LEARNING */}
                <section
                  aria-labelledby="resume-learning-heading"
                  className="pt-1"
                >
                  <div className="border-t-[2.5px] border-[#111111] border-b border-[#111111] py-0.5">
                    <h2
                      id="resume-learning-heading"
                      className="font-['Playfair_Display',Georgia,'Times_New_Roman',Times,serif] text-[14.5px] font-black tracking-[0.1em] text-[#0E0E0E] uppercase sm:text-[15px] lg:text-[clamp(0.82rem,1.6dvh,1rem)] lg:leading-tight"
                    >
                      ACADEMIC LEARNING
                    </h2>
                  </div>

                  <ul className="mt-1.5 grid grid-cols-1 gap-x-2.5 gap-y-0.5 font-['Libre_Baskerville',Georgia,'Times_New_Roman',Times,serif] text-[11.5px] leading-[1.34] text-[#1C1C1C] sm:grid-cols-2 lg:mt-[clamp(0.24rem,0.5dvh,0.4rem)] lg:text-[clamp(0.65rem,min(1.28dvh,0.82vw),0.78rem)] lg:leading-[1.26]">
                    {ACADEMIC_LEARNING_TOPICS.map((topic) => (
                      <li key={topic} className="flex items-start gap-1">
                        <span aria-hidden="true" className="text-[#444444]">
                          ▪
                        </span>
                        <span>{topic}</span>
                      </li>
                    ))}
                  </ul>

                  <p className="mt-2 border-l-2 border-[#111111] bg-[#EAEAE5] px-2.5 py-1.5 font-['Libre_Baskerville',Georgia,'Times_New_Roman',Times,serif] text-[11.5px] leading-[1.38] text-[#1A1A1A] text-justify [hyphens:auto] lg:mt-[clamp(0.28rem,0.55dvh,0.42rem)] lg:text-[clamp(0.66rem,min(1.3dvh,0.84vw),0.79rem)] lg:leading-[1.3]">
                    <strong className="font-bold text-[#0E0E0E] uppercase tracking-wide">
                      Goal:
                    </strong>{' '}
                    to strengthen my theoretical foundation and turn it into practical technical skills through continuous, hands-on learning.
                  </p>
                </section>
              </div>

              {/* COLUMN III: ACHIEVEMENTS, STRENGTHS & CLASSIFIEDS BOX */}
              <div className="flex flex-col space-y-3.5 border-t-2 border-[#111111] pt-3.5 lg:border-t-0 lg:pt-0 lg:justify-between lg:space-y-[clamp(0.4rem,0.9dvh,0.7rem)] lg:pl-[clamp(0.85rem,1.55vw,1.3rem)]">
                {/* ACHIEVEMENTS */}
                <section aria-labelledby="resume-achievements-heading">
                  <div className="border-t-[2.5px] border-[#111111] border-b border-[#111111] py-0.5">
                    <h2
                      id="resume-achievements-heading"
                      className="font-['Playfair_Display',Georgia,'Times_New_Roman',Times,serif] text-[14.5px] font-black tracking-[0.1em] text-[#0E0E0E] uppercase sm:text-[15px] lg:text-[clamp(0.82rem,1.6dvh,1rem)] lg:leading-tight"
                    >
                      ACHIEVEMENTS
                    </h2>
                  </div>

                  <ul className="mt-1.5 divide-y divide-dotted divide-[#333333]/40 font-['Libre_Baskerville',Georgia,'Times_New_Roman',Times,serif] text-[11.5px] leading-[1.36] text-[#1B1B1B] lg:mt-[clamp(0.24rem,0.5dvh,0.4rem)] lg:text-[clamp(0.67rem,min(1.32dvh,0.85vw),0.8rem)] lg:leading-[1.28]">
                    {ACHIEVEMENT_ITEMS.map((item) => (
                      <li
                        key={item.label}
                        className="flex items-start gap-1.5 py-1 first:pt-0 last:pb-0"
                      >
                        <span aria-hidden="true" className="text-[#333333]">
                          ▪
                        </span>
                        <span>
                          <strong className="font-bold text-[#0E0E0E]">
                            {item.label}
                          </strong>{' '}
                          <span className="text-[#262626]">{item.detail}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>

                {/* STRENGTHS */}
                <section
                  aria-labelledby="resume-strengths-heading"
                  className="pt-1"
                >
                  <div className="border-t-[2.5px] border-[#111111] border-b border-[#111111] py-0.5">
                    <h2
                      id="resume-strengths-heading"
                      className="font-['Playfair_Display',Georgia,'Times_New_Roman',Times,serif] text-[14.5px] font-black tracking-[0.1em] text-[#0E0E0E] uppercase sm:text-[15px] lg:text-[clamp(0.82rem,1.6dvh,1rem)] lg:leading-tight"
                    >
                      STRENGTHS
                    </h2>
                  </div>
                  <ul className="mt-1.5 grid grid-cols-2 gap-x-2 gap-y-0.5 font-['Libre_Baskerville',Georgia,'Times_New_Roman',Times,serif] text-[11.5px] leading-[1.34] text-[#1B1B1B] lg:mt-[clamp(0.24rem,0.5dvh,0.4rem)] lg:text-[clamp(0.66rem,min(1.28dvh,0.84vw),0.79rem)] lg:leading-[1.26]">
                    {STRENGTH_ITEMS.map((item) => (
                      <li key={item} className="flex items-start gap-1">
                        <span aria-hidden="true" className="text-[#444444]">
                          ·
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                {/* INTERESTS & HOBBIES (Crisp Double-Bordered Newspaper Classifieds Box) */}
                <div className="border-2 border-[#111111] bg-[#E8E8E3] p-[3px]">
                  <div className="border border-[#111111] p-2 sm:p-2.5 lg:p-[clamp(0.4rem,0.8dvh,0.65rem)]">
                    <section aria-labelledby="resume-interests-heading">
                      <h2
                        id="resume-interests-heading"
                        className="border-b border-[#111111] pb-0.5 font-['Playfair_Display',Georgia,'Times_New_Roman',Times,serif] text-xs font-black tracking-[0.12em] text-[#0E0E0E] uppercase lg:text-[clamp(0.7rem,1.35dvh,0.84rem)]"
                      >
                        INTERESTS
                      </h2>
                      <p className="mt-1 font-['Libre_Baskerville',Georgia,'Times_New_Roman',Times,serif] text-[11.5px] leading-[1.36] text-[#1A1A1A] lg:text-[clamp(0.65rem,min(1.26dvh,0.82vw),0.77rem)] lg:leading-[1.28]">
                        {INTEREST_ITEMS.join(' · ')}
                      </p>
                    </section>

                    <section
                      aria-labelledby="resume-hobbies-heading"
                      className="mt-2 border-t border-dotted border-[#333333]/55 pt-1.5"
                    >
                      <h2
                        id="resume-hobbies-heading"
                        className="border-b border-[#111111] pb-0.5 font-['Playfair_Display',Georgia,'Times_New_Roman',Times,serif] text-xs font-black tracking-[0.12em] text-[#0E0E0E] uppercase lg:text-[clamp(0.7rem,1.35dvh,0.84rem)]"
                      >
                        HOBBIES
                      </h2>
                      <ul className="mt-1 space-y-0.5 font-['Libre_Baskerville',Georgia,'Times_New_Roman',Times,serif] text-[11.5px] leading-[1.34] text-[#1A1A1A] lg:text-[clamp(0.65rem,min(1.26dvh,0.82vw),0.77rem)] lg:leading-[1.26]">
                        {HOBBY_ITEMS.map((item) => (
                          <li key={item} className="flex items-start gap-1">
                            <span aria-hidden="true" className="text-[#444444]">
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
              className="mt-2.5 border-t border-[#111111] pt-[2px] lg:mt-[clamp(0.4rem,0.85dvh,0.65rem)]"
            >
              <div className="border-t-2 border-[#111111]" />
            </div>
          </div>
        </div>
      </motion.article>
    </section>
  );
}
