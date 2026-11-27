import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  GitHubOctoIcon,
  LinkedInModernIcon,
  LocationBeaconIcon,
  MailEnvelopeIcon,
  PhoneSignalIcon,
} from '../NextGenIcons';
import { PROFILE } from '../../data/projects';
import { GlassCard } from '../GlassCard';

function detectMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  const isMobileUA =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  const hasCoarsePrimaryPointer = window.matchMedia(
    '(hover: none) and (pointer: coarse)'
  ).matches;
  return isMobileUA || hasCoarsePrimaryPointer;
}

export function ContactView() {
  const dragStartRef = useRef<{ x: number; y: number; hadSelection: string } | null>(null);
  const [isMobileDevice, setIsMobileDevice] = useState<boolean>(detectMobileDevice);

  useEffect(() => {
    const pointerQuery = window.matchMedia('(hover: none) and (pointer: coarse)');
    const syncDeviceType = () => setIsMobileDevice(detectMobileDevice());
    syncDeviceType();
    pointerQuery.addEventListener('change', syncDeviceType);
    return () => pointerQuery.removeEventListener('change', syncDeviceType);
  }, []);

  const mobileDigits = PROFILE.mobile.replace(/\D/g, '');
  const whatsappNumber = mobileDigits.length === 10 ? `91${mobileDigits}` : mobileDigits;
  const phoneHref = isMobileDevice
    ? `tel:${PROFILE.mobile}`
    : `https://web.whatsapp.com/send?phone=${whatsappNumber}`;

  return (
    <section className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col px-4 py-6 sm:px-6 sm:py-10 md:px-10 md:py-12">
      <div className="shrink-0 border-b border-white/10 pb-5 sm:pb-7">
        <p className="font-kalam text-xs text-[#F05BEA] tabular-nums">
          09 · Contact &amp; Networking
        </p>
        <h1 className="mt-2 font-road-rage text-[2.2rem] font-normal leading-[1.06] tracking-[0.02em] text-[#FF4D4D] sm:text-5xl lg:text-[3.35rem]">
          Connect with {PROFILE.name}
        </h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="mt-6 flex flex-1 flex-col sm:mt-8"
      >
        <GlassCard
          strong
          accent="pink"
          className="flex flex-1 flex-col justify-between rounded-2xl p-5 sm:p-8 lg:p-10"
        >
          <div className="shrink-0 border-b border-white/10 pb-5 sm:pb-7">
            <h2 className="font-caveat text-3xl font-normal tracking-wide text-[#FFFF00] sm:text-4xl">
              Direct Channels
            </h2>
            <p className="mt-2 max-w-2xl font-kalam text-base leading-relaxed text-[#A0B2B2] sm:text-lg">
              Direct contact details for academic and technical communication.
            </p>
          </div>

          <dl className="mt-6 grid flex-1 grid-cols-1 gap-4 text-sm sm:mt-8 sm:grid-cols-2 sm:gap-6 lg:gap-7">
            <div className="glass-surface glass-interactive flex flex-col justify-between rounded-2xl p-5 sm:p-7 lg:p-8">
              <dt className="flex items-center gap-2.5 font-kalam text-sm text-[#A0B2B2] sm:text-base">
                <MailEnvelopeIcon className="h-4.5 w-4.5 text-[#F05BEA] sm:h-5 sm:w-5" />
                <span>Email</span>
              </dt>
              <dd className="mt-4 sm:mt-6">
                <a
                  href={`mailto:${PROFILE.email}`}
                  draggable={false}
                  onMouseDown={(e) => {
                    dragStartRef.current = {
                      x: e.clientX,
                      y: e.clientY,
                      hadSelection: window.getSelection()?.toString() ?? '',
                    };
                  }}
                  onClick={(e) => {
                    const start = dragStartRef.current;
                    dragStartRef.current = null;
                    if (!start) return;
                    const moved = Math.hypot(e.clientX - start.x, e.clientY - start.y) > 4;
                    const currentSelection = window.getSelection()?.toString() ?? '';
                    if (moved || (currentSelection.length > 0 && currentSelection !== start.hadSelection)) {
                      e.preventDefault();
                    }
                  }}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-white/12 bg-white/[0.05] px-4 py-2.5 break-all font-kalam text-base font-bold text-[#FFFFFF] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-1px_2px_rgba(0,0,0,0.45)] transition-all duration-150 ease-out hover:scale-[0.97] hover:border-[#C8FF27]/55 hover:bg-white/[0.11] hover:text-[#C8FF27] hover:shadow-[inset_0_2px_6px_rgba(0,0,0,0.75),inset_0_0_10px_rgba(200,255,39,0.14),inset_0_1px_0_rgba(255,255,255,0.1)] active:scale-95 active:shadow-[inset_0_3px_8px_rgba(0,0,0,0.92)] motion-reduce:hover:scale-100 motion-reduce:active:scale-100 select-text [-webkit-user-drag:none] [-webkit-touch-callout:default] sm:px-5 sm:text-lg lg:text-xl cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8FF27]"
                >
                  {PROFILE.email}
                </a>
              </dd>
            </div>

            <div className="glass-surface glass-interactive flex flex-col justify-between rounded-2xl p-5 sm:p-7 lg:p-8">
              <dt className="flex items-center gap-2.5 font-kalam text-sm text-[#A0B2B2] sm:text-base">
                <PhoneSignalIcon className="h-4.5 w-4.5 text-[#C8FF27] sm:h-5 sm:w-5" />
                <span>Mobile</span>
              </dt>
              <dd className="mt-4 sm:mt-6">
                <a
                  href={phoneHref}
                  target={isMobileDevice ? undefined : '_blank'}
                  rel={isMobileDevice ? undefined : 'noopener noreferrer'}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-white/12 bg-white/[0.05] px-4 py-2.5 font-kalam text-base font-bold text-[#FFFFFF] tabular-nums shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-1px_2px_rgba(0,0,0,0.45)] transition-all duration-150 ease-out hover:scale-[0.97] hover:border-[#C8FF27]/55 hover:bg-white/[0.11] hover:text-[#C8FF27] hover:shadow-[inset_0_2px_6px_rgba(0,0,0,0.75),inset_0_0_10px_rgba(200,255,39,0.14),inset_0_1px_0_rgba(255,255,255,0.1)] active:scale-95 active:shadow-[inset_0_3px_8px_rgba(0,0,0,0.92)] motion-reduce:hover:scale-100 motion-reduce:active:scale-100 sm:px-5 sm:text-lg lg:text-xl cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8FF27]"
                >
                  {PROFILE.mobile}
                </a>
              </dd>
            </div>

            <div className="glass-surface glass-interactive flex flex-col justify-between rounded-2xl p-5 sm:p-7 lg:p-8">
              <dt className="flex items-center gap-2.5 font-kalam text-sm text-[#A0B2B2] sm:text-base">
                <LocationBeaconIcon className="h-4.5 w-4.5 text-[#F05BEA] sm:h-5 sm:w-5" />
                <span>Location</span>
              </dt>
              <dd className="mt-4 sm:mt-6">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(PROFILE.location)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-white/12 bg-white/[0.05] px-4 py-2.5 font-kalam text-base font-bold text-[#FFFFFF] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-1px_2px_rgba(0,0,0,0.45)] transition-all duration-150 ease-out hover:scale-[0.97] hover:border-[#C8FF27]/55 hover:bg-white/[0.11] hover:text-[#C8FF27] hover:shadow-[inset_0_2px_6px_rgba(0,0,0,0.75),inset_0_0_10px_rgba(200,255,39,0.14),inset_0_1px_0_rgba(255,255,255,0.1)] active:scale-95 active:shadow-[inset_0_3px_8px_rgba(0,0,0,0.92)] motion-reduce:hover:scale-100 motion-reduce:active:scale-100 sm:px-5 sm:text-lg lg:text-xl cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8FF27]"
                >
                  {PROFILE.location}
                </a>
              </dd>
            </div>

            <div className="glass-surface glass-interactive flex flex-col justify-between rounded-2xl p-5 sm:p-7 lg:p-8">
              <dt className="flex items-center gap-2.5 font-kalam text-sm text-[#A0B2B2] sm:text-base">
                <LinkedInModernIcon className="h-4.5 w-4.5 text-[#C8FF27] sm:h-5 sm:w-5" aria-hidden="true" />
                <span>LinkedIn</span>
              </dt>
              <dd className="mt-4 sm:mt-6">
                <a
                  href={PROFILE.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-white/12 bg-white/[0.05] px-4 py-2.5 font-kalam text-base font-bold text-[#FFFFFF] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-1px_2px_rgba(0,0,0,0.45)] transition-all duration-150 ease-out hover:scale-[0.97] hover:border-[#C8FF27]/55 hover:bg-white/[0.11] hover:text-[#C8FF27] hover:shadow-[inset_0_2px_6px_rgba(0,0,0,0.75),inset_0_0_10px_rgba(200,255,39,0.14),inset_0_1px_0_rgba(255,255,255,0.1)] active:scale-95 active:shadow-[inset_0_3px_8px_rgba(0,0,0,0.92)] motion-reduce:hover:scale-100 motion-reduce:active:scale-100 sm:px-5 sm:text-lg lg:text-xl cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8FF27]"
                >
                  Sabarivasan
                </a>
              </dd>
            </div>
            <div className="glass-surface glass-interactive flex flex-col justify-between rounded-2xl p-5 sm:p-7 lg:p-8">
              <dt className="flex items-center gap-2.5 font-kalam text-sm text-[#A0B2B2] sm:text-base">
                <GitHubOctoIcon className="h-4.5 w-4.5 text-[#F05BEA] sm:h-5 sm:w-5" aria-hidden="true" />
                <span>GitHub</span>
              </dt>
              <dd className="mt-4 sm:mt-6">
                <span className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-white/12 bg-white/[0.05] px-4 py-2.5 font-kalam text-base font-bold text-[#A0B2B2] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-1px_2px_rgba(0,0,0,0.45)] select-none sm:px-5 sm:text-lg lg:text-xl">
                  GitHub (Coming Soon)
                </span>
              </dd>
            </div>
          </dl>
        </GlassCard>
      </motion.div>
    </section>
  );
}
