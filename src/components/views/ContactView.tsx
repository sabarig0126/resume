import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Linkedin, Mail, MapPin, Phone } from 'lucide-react';
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
    <section className="mx-auto max-w-[1280px] px-6 py-12 md:px-10 md:py-16">
      <div className="border-b border-white/10 pb-8">
        <p className="font-kalam text-xs text-amber-400 tabular-nums">
          09 · Contact &amp; Networking
        </p>
        <h1 className="mt-2 font-road-rage text-4xl font-normal tracking-[0.02em] text-[#FF0000] sm:text-5xl">
          Connect with {PROFILE.name}
        </h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="mt-10"
      >
        <GlassCard strong accent="blue" className="rounded-2xl p-6 sm:p-8">
        <div className="border-b border-white/10 pb-6">
          <h2 className="font-caveat text-2xl font-normal tracking-wide text-[#FFFF00]">
            Direct Channels
          </h2>
          <p className="mt-2 max-w-2xl font-kalam text-base leading-relaxed text-slate-300">
            Available for AI &amp; Data Science internships, collaborative student engineering projects, and technical hackathons.
          </p>
        </div>

        <dl className="mt-6 grid grid-cols-1 gap-6 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div className="glass-surface glass-interactive rounded-xl p-5">
            <dt className="flex items-center gap-2 text-xs text-slate-400">
              <Mail className="h-3.5 w-3.5 text-blue-400" />
              <span>Email</span>
            </dt>
            <dd className="mt-2">
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
                className="break-all font-kalam text-sm font-normal text-blue-300 underline-offset-4 hover:text-blue-200 hover:underline select-text [-webkit-user-drag:none] [-webkit-touch-callout:default]"
              >
                {PROFILE.email}
              </a>
            </dd>
          </div>

          <div className="glass-surface glass-interactive rounded-xl p-5">
            <dt className="flex items-center gap-2 text-xs text-slate-400">
              <Phone className="h-3.5 w-3.5 text-blue-400" />
              <span>Mobile</span>
            </dt>
            <dd className="mt-2">
              <a
                href={phoneHref}
                target={isMobileDevice ? undefined : '_blank'}
                rel={isMobileDevice ? undefined : 'noopener noreferrer'}
                className="touch-press inline-flex min-h-[44px] sm:min-h-0 items-center font-kalam text-sm font-normal text-white tabular-nums hover:text-blue-300"
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

          <div className="glass-surface glass-interactive rounded-xl p-5">
            <dt className="flex items-center gap-2 text-xs text-slate-400">
              <Linkedin className="h-3.5 w-3.5 text-blue-400" aria-hidden="true" />
              <span>LinkedIn</span>
            </dt>
            <dd className="mt-2">
              <a
                href={PROFILE.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="touch-press inline-flex min-h-[44px] sm:min-h-0 items-center font-kalam text-sm font-normal text-blue-300 underline-offset-4 hover:text-blue-200 hover:underline"
              >
                Sabarivasan
              </a>
            </dd>
          </div>
        </dl>
        </GlassCard>
      </motion.div>
    </section>
  );
}
