import { motion } from 'motion/react';
import { PROFILE } from '../../data/projects';
import { requestOpenCookiePreferences } from '../../lib/consent';
import { FeatureId } from '../../types/portfolio';
import { GlassCard } from '../GlassCard';

interface PrivacyPolicyViewProps {
  onNavigateFeature: (feature: FeatureId) => void;
}

export function PrivacyPolicyView({ onNavigateFeature }: PrivacyPolicyViewProps) {
  return (
    <section className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col px-4 py-6 sm:px-6 sm:py-10 md:px-10 md:py-12">
      <div className="shrink-0 border-b border-white/10 pb-5 sm:pb-7">
        <p className="font-kalam text-xs text-[#F05BEA] tabular-nums">
          Legal · Privacy Policy
        </p>
        <h1 className="mt-2 font-road-rage text-[2.2rem] font-normal leading-[1.06] tracking-wide text-[#FF4D4D] sm:text-5xl lg:text-[3.35rem]">
          Privacy Policy
        </h1>
        <p className="mt-2 font-kalam text-sm text-[#A0B2B2] sm:text-base">
          Effective Date: November 26, 2026 · Owner: {PROFILE.name} ({PROFILE.location})
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.09, ease: [0.16, 1, 0.3, 1] }}
        className="mt-6 space-y-6 sm:mt-8"
      >
        <GlassCard strong accent="pink" className="rounded-2xl p-6 sm:p-8 lg:p-10">
          <div className="space-y-7 font-kalam text-sm leading-relaxed text-[#E2ECEC] sm:text-[15.5px]">
            <section>
              <h2 className="font-caveat text-2xl font-normal tracking-wide text-[#FFFF00] sm:text-3xl">
                1. Overview &amp; Scope
              </h2>
              <p className="mt-2 text-[#C8D4D4]">
                This Privacy Policy explains how personal and technical data is handled when you browse the portfolio website of {PROFILE.name}, view resume or portfolio documents, use direct contact links, or interact with PEARL AI.
              </p>
            </section>

            <section className="border-t border-white/10 pt-6">
              <h2 className="font-caveat text-2xl font-normal tracking-wide text-[#FFFF00] sm:text-3xl">
                2. Direct Contact Usage
              </h2>
              <p className="mt-2 text-[#C8D4D4]">
                This website does not collect, submit, or store messages through a server-side contact database. The{' '}
                <button
                  type="button"
                  data-sfx="custom"
                  onClick={() => onNavigateFeature('contact')}
                  className="underline decoration-[#C8FF27]/70 underline-offset-4 text-[#C8FF27] hover:text-white cursor-pointer"
                >
                  Contact page
                </button>{' '}
                provides direct communication channels (Email via{' '}
                <span className="text-white">{PROFILE.email}</span>, Mobile/WhatsApp, Google Maps location, and LinkedIn). When you click those links, your chosen email client or external platform governs the communication.
              </p>
            </section>

            <section className="border-t border-white/10 pt-6">
              <h2 className="font-caveat text-2xl font-normal tracking-wide text-[#FFFF00] sm:text-3xl">
                3. PEARL AI &amp; Groq Data Processing
              </h2>
              <ul className="mt-2 space-y-2.5 text-[#C8D4D4]">
                <li>
                  <strong className="text-white">Built-in FAQ Responses:</strong> Clicking any of the five built-in FAQ questions is answered locally inside your browser with zero external API transmission.
                </li>
                <li>
                  <strong className="text-white">Custom Chat Prompts:</strong> When you send a custom message in PEARL AI, your active conversation messages are transmitted securely over HTTPS to our backend endpoint (<code className="text-[#C8FF27]">/api/chat</code>), which forwards the prompt to the Groq API using server-side credentials.
                </li>
                <li>
                  <strong className="text-white">No Persistent Chat Database:</strong> Conversation history stays only in your browser&apos;s temporary memory for the active session and is erased when you click Clear Chat or reload the page. Temporary server IP rate-limit counters are held briefly in memory solely for automated spam and abuse protection.
                </li>
                <li>
                  <strong className="text-white">Avoid Sensitive Data:</strong> Please do not enter passwords, financial numbers, or confidential personal information into chat prompts.
                </li>
              </ul>
            </section>

            <section className="border-t border-white/10 pt-6">
              <h2 className="font-caveat text-2xl font-normal tracking-wide text-[#FFFF00] sm:text-3xl">
                4. Cookies, Consent &amp; Analytics
              </h2>
              <p className="mt-2 text-[#C8D4D4]">
                We store your essential cookie consent choice locally in browser storage (<code className="text-[#C8FF27]">localStorage</code>) so your Accept/Reject/Preferences selection is respected across visits. Non-essential analytics scripts remain completely disabled unless you explicitly opt in via the cookie banner or{' '}
                <button
                  type="button"
                  data-sfx="custom"
                  onClick={requestOpenCookiePreferences}
                  className="underline decoration-[#F05BEA]/70 underline-offset-4 text-[#F05BEA] hover:text-white cursor-pointer"
                >
                  Cookie Preferences
                </button>
                . Browser Global Privacy Control (GPC) and Do Not Track signals are automatically honored.
              </p>
            </section>

            <section className="border-t border-white/10 pt-6">
              <h2 className="font-caveat text-2xl font-normal tracking-wide text-[#FFFF00] sm:text-3xl">
                5. External Services &amp; Typography
              </h2>
              <p className="mt-2 text-[#C8D4D4]">
                Fonts are loaded via Google Fonts, and outbound links may lead to third-party sites such as LinkedIn, WhatsApp Web, or Google Maps. We have no control over third-party privacy practices once you leave this domain.
              </p>
            </section>

            <section className="border-t border-white/10 pt-6">
              <h2 className="font-caveat text-2xl font-normal tracking-wide text-[#FFFF00] sm:text-3xl">
                6. Questions or Removal Requests
              </h2>
              <p className="mt-2 text-[#C8D4D4]">
                For any privacy inquiry, contact {PROFILE.name} directly at{' '}
                <a
                  href={`mailto:${PROFILE.email}`}
                  className="underline decoration-[#C8FF27]/70 underline-offset-4 text-[#C8FF27] hover:text-white"
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
