import { motion } from 'motion/react';
import { PROFILE } from '../../data/projects';
import { FeatureId } from '../../types/portfolio';
import { GlassCard } from '../GlassCard';

interface TermsViewProps {
  onNavigateFeature: (feature: FeatureId) => void;
}

export function TermsView({ onNavigateFeature }: TermsViewProps) {
  return (
    <section className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col px-4 py-6 sm:px-6 sm:py-10 md:px-10 md:py-12">
      <div className="shrink-0 border-b border-white/10 pb-5 sm:pb-7">
        <p className="font-kalam text-xs text-[#F05BEA] tabular-nums">
          Legal · Terms &amp; Conditions
        </p>
        <h1 className="mt-2 font-road-rage text-[2.2rem] font-normal leading-[1.06] tracking-wide text-[#FF4D4D] sm:text-5xl lg:text-[3.35rem]">
          Terms &amp; Conditions
        </h1>
        <p className="mt-2 font-kalam text-sm text-[#A0B2B2] sm:text-base">
          Effective Date: November 26, 2026 · Portfolio of {PROFILE.name}
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        className="mt-6 space-y-6 sm:mt-8"
      >
        <GlassCard strong accent="lime" className="rounded-2xl p-6 sm:p-8 lg:p-10">
          <div className="space-y-7 font-kalam text-sm leading-relaxed text-[#E2ECEC] sm:text-[15.5px]">
            <section>
              <h2 className="font-caveat text-2xl font-normal tracking-wide text-[#FFFF00] sm:text-3xl">
                1. Acceptance of Terms
              </h2>
              <p className="mt-2 text-[#C8D4D4]">
                By accessing or using this portfolio website, you agree to comply with these Terms &amp; Conditions and applicable laws. If you do not agree, please discontinue use of the site.
              </p>
            </section>

            <section className="border-t border-white/10 pt-6">
              <h2 className="font-caveat text-2xl font-normal tracking-wide text-[#FFFF00] sm:text-3xl">
                2. Intellectual Property &amp; Portfolio Content
              </h2>
              <p className="mt-2 text-[#C8D4D4]">
                All original portfolio copy, layout design, branding assets, resume documents, and presentation materials displayed on this website belong to {PROFILE.name} unless attributed to third-party educational or certification organizations (such as NPTEL, IIT Madras, E-Cell IIT Bombay, IBM, MathWorks, Infosys Springboard, MongoDB, Simplilearn SkillUP, or Tech Mahindra Foundation). You may view or download the resume and portfolio PDF solely for legitimate academic, internship, or recruitment evaluation.
              </p>
            </section>

            <section className="border-t border-white/10 pt-6">
              <h2 className="font-caveat text-2xl font-normal tracking-wide text-[#FFFF00] sm:text-3xl">
                3. Use of PEARL AI Assistant
              </h2>
              <ul className="mt-2 space-y-2.5 text-[#C8D4D4]">
                <li>
                  <strong className="text-white">Informational Purpose:</strong> PEARL AI is provided to help visitors explore Sabari&apos;s academic profile and ask general technical questions. While answers are grounded in verified portfolio details, AI-generated responses may occasionally be incomplete.
                </li>
                <li>
                  <strong className="text-white">Acceptable Conduct:</strong> Automated scraping, spam flooding, prompt injection abuse, or attempts to bypass server rate limits on <code className="text-[#C8FF27]">/api/chat</code> are prohibited and may be blocked automatically.
                </li>
              </ul>
            </section>

            <section className="border-t border-white/10 pt-6">
              <h2 className="font-caveat text-2xl font-normal tracking-wide text-[#FFFF00] sm:text-3xl">
                4. External Links &amp; Disclaimer
              </h2>
              <p className="mt-2 text-[#C8D4D4]">
                This site is provided on an &ldquo;as is&rdquo; basis without warranties of uninterrupted availability. Outbound links to LinkedIn, WhatsApp, Google Maps, or certificate references open external third-party platforms whose terms apply independently.
              </p>
            </section>

            <section className="border-t border-white/10 pt-6">
              <h2 className="font-caveat text-2xl font-normal tracking-wide text-[#FFFF00] sm:text-3xl">
                5. Privacy &amp; Contact
              </h2>
              <p className="mt-2 text-[#C8D4D4]">
                Your use of this website is also governed by our{' '}
                <button
                  type="button"
                  onClick={() => onNavigateFeature('privacy')}
                  className="underline decoration-[#C8FF27]/70 underline-offset-4 text-[#C8FF27] hover:text-white cursor-pointer"
                >
                  Privacy Policy
                </button>
                . Questions regarding these terms may be sent to{' '}
                <a
                  href={`mailto:${PROFILE.email}`}
                  className="underline decoration-[#F05BEA]/70 underline-offset-4 text-[#F05BEA] hover:text-white"
                >
                  {PROFILE.email}
                </a>
                .
              </p>
            </section>
          </div>
        </GlassCard>
      </motion.div>
    </section>
  );
}
