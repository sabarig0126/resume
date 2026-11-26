import { type FormEvent, memo, useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  CheckVerifiedIcon,
  ChevronNextIcon,
  ChevronPrevIcon,
  CloseIcon,
  SearchLensIcon,
  ZoomInLensIcon,
} from '../NextGenIcons';
import { CERTIFICATES, type CertificateItem } from '../../data/certificates';
import { PROFILE } from '../../data/projects';
import { AnimatedCounter } from '../AnimatedCounter';
import { GlassCard } from '../GlassCard';
import { TiltCard } from '../TiltCard';

const MAX_FILTER_LENGTH = 80;
const INVALID_FILTER_PATTERN = /[<>{}$`]/;

interface CertificateCardProps {
  cert: CertificateItem;
  eager: boolean;
  highPriority: boolean;
  onSelect: (cert: CertificateItem) => void;
}

const CertificateCard = memo(function CertificateCard({
  cert,
  eager,
  highPriority,
  onSelect,
}: CertificateCardProps) {
  return (
    <TiltCard
      maxTiltDeg={2.4}
      glowColor="pink"
      scaleOnHover={1.008}
      className="cert-grid-card glass-surface glass-interactive flex flex-col rounded-2xl"
    >
      <button
        type="button"
        onClick={() => onSelect(cert)}
        aria-label={`Inspect ${cert.title} certificate issued by ${cert.issuer}`}
        className="group touch-press flex h-full w-full flex-col rounded-2xl p-3.5 text-left sm:p-4 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8FF27]"
      >
        <div className="relative aspect-[14/10] w-full overflow-hidden rounded-xl border border-white/15 bg-white p-1.5 shadow-inner">
          <img
            src={cert.imageUrl}
            alt={cert.alt}
            width={1400}
            height={1000}
            loading={eager ? 'eager' : 'lazy'}
            fetchPriority={highPriority ? 'high' : undefined}
            decoding="async"
            className="h-full w-full object-contain transition-transform duration-300 ease-out group-hover:scale-[1.02]"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-2.5 bottom-2.5 inline-flex h-7 w-7 items-center justify-center rounded-lg border border-white/20 bg-[#071B1B]/80 text-[#FFFFFF] opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100"
          >
            <ZoomInLensIcon className="h-3.5 w-3.5 text-[#C8FF27]" />
          </span>
        </div>

        <div className="mt-3.5 flex flex-1 flex-col justify-between gap-2.5 px-1 pb-0.5">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="font-kalam text-xs font-bold text-[#F05BEA] tabular-nums">
                {cert.number}
              </span>
              {cert.issuedDate && (
                <span className="font-kalam text-[11px] text-[#B8C7C7] tabular-nums">
                  {cert.issuedDate}
                </span>
              )}
            </div>
            <h2 className="mt-1 font-caveat text-[1.35rem] leading-snug font-normal tracking-wide text-[#FFFF00] transition-colors group-hover:text-[#FFF899]">
              {cert.title}
            </h2>
          </div>

          <div className="flex items-center gap-2 border-t border-white/10 pt-2.5">
            <CheckVerifiedIcon
              aria-hidden="true"
              className="h-4 w-4 shrink-0 text-[#C8FF27]"
            />
            <span className="font-kalam text-xs text-[#D5E2E2] sm:text-[13px]">
              {cert.issuer}
            </span>
          </div>
        </div>
      </button>
    </TiltCard>
  );
});

export function CertificationsView() {
  const [courseQuery, setCourseQuery] = useState('');
  const [filterError, setFilterError] = useState<string | null>(null);
  const [selectedCert, setSelectedCert] = useState<CertificateItem | null>(null);

  const issuerCount = useMemo(
    () => new Set(CERTIFICATES.map((cert) => cert.issuerShort)).size,
    []
  );

  const filteredCertificates = useMemo(() => {
    const q = courseQuery.trim().toLowerCase();
    if (!q) return CERTIFICATES;
    return CERTIFICATES.filter(
      (cert) =>
        cert.title.toLowerCase().includes(q) ||
        cert.issuer.toLowerCase().includes(q) ||
        cert.issuerShort.toLowerCase().includes(q) ||
        (cert.issuedDate?.toLowerCase().includes(q) ?? false)
    );
  }, [courseQuery]);

  const selectedIndex = useMemo(() => {
    if (!selectedCert) return -1;
    return filteredCertificates.findIndex((c) => c.id === selectedCert.id);
  }, [filteredCertificates, selectedCert]);

  useEffect(() => {
    if (!selectedCert) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedCert(null);
      } else if (e.key === 'ArrowRight' && filteredCertificates.length > 1) {
        const nextIdx = (selectedIndex + 1) % filteredCertificates.length;
        setSelectedCert(filteredCertificates[nextIdx]);
      } else if (e.key === 'ArrowLeft' && filteredCertificates.length > 1) {
        const prevIdx =
          (selectedIndex - 1 + filteredCertificates.length) %
          filteredCertificates.length;
        setSelectedCert(filteredCertificates[prevIdx]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCert, selectedIndex, filteredCertificates]);

  useEffect(() => {
    const isModalOpen = Boolean(selectedCert);
    window.dispatchEvent(
      new CustomEvent('portfolio:overlay-blur', {
        detail: { source: 'cert-lightbox', active: isModalOpen },
      })
    );
    return () => {
      if (isModalOpen) {
        window.dispatchEvent(
          new CustomEvent('portfolio:overlay-blur', {
            detail: { source: 'cert-lightbox', active: false },
          })
        );
      }
    };
  }, [selectedCert]);

  const handleSelectCert = useCallback((cert: CertificateItem) => {
    setSelectedCert(cert);
  }, []);

  const handleQueryChange = (rawValue: string) => {
    if (rawValue.length > MAX_FILTER_LENGTH) {
      setFilterError(`Filter query must be ${MAX_FILTER_LENGTH} characters or fewer.`);
      setCourseQuery(rawValue.slice(0, MAX_FILTER_LENGTH));
      return;
    }
    if (INVALID_FILTER_PATTERN.test(rawValue)) {
      setFilterError('Use letters, numbers, or basic punctuation only.');
    } else {
      setFilterError(null);
    }
    setCourseQuery(rawValue);
  };

  const handleFilterSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = courseQuery.trim();
    if (!trimmed) {
      setFilterError('Enter a keyword such as Python, MongoDB, MATLAB, or IBM to filter.');
      return;
    }
    if (INVALID_FILTER_PATTERN.test(trimmed)) {
      setFilterError('Special brackets or script symbols are not allowed in filters.');
      return;
    }
    setFilterError(null);
  };

  const handleStepPreview = (direction: -1 | 1) => {
    if (filteredCertificates.length <= 1 || selectedIndex === -1) return;
    const nextIdx =
      (selectedIndex + direction + filteredCertificates.length) %
      filteredCertificates.length;
    setSelectedCert(filteredCertificates[nextIdx]);
  };

  return (
    <section className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col px-4 py-6 sm:px-6 sm:py-10 md:px-10 md:py-12">
      <div className="flex shrink-0 flex-col gap-5 border-b border-white/10 pb-5 sm:gap-6 sm:pb-7 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-kalam text-xs text-[#F05BEA] tabular-nums">
            04 · Certifications &amp; Technical Courses
          </p>
          <h1 className="mt-2 font-road-rage text-[2.2rem] font-normal leading-[1.06] tracking-wide text-[#FF4D4D] sm:text-5xl lg:text-[3.35rem] [text-wrap:balance]">
            <AnimatedCounter value={CERTIFICATES.length} /> verified certificates across{' '}
            <AnimatedCounter value={issuerCount} /> issuing organizations
          </h1>
          <p className="mt-2 font-kalam text-xs text-[#B8C7C7] sm:text-sm">
            {PROFILE.learningGoal} · Select any certificate card to inspect full details
          </p>
        </div>

        <form
          onSubmit={handleFilterSubmit}
          noValidate
          className="flex flex-col items-start gap-1.5 sm:items-end"
        >
          <div className="relative w-full sm:w-72">
            <SearchLensIcon
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#C8D4D4]"
            />
            <input
              type="search"
              value={courseQuery}
              onChange={(e) => handleQueryChange(e.target.value)}
              maxLength={MAX_FILTER_LENGTH + 1}
              placeholder="Filter by Python, MongoDB, MATLAB, IBM..."
              aria-label="Search certificates by title or organization"
              aria-invalid={filterError ? true : undefined}
              aria-describedby={filterError ? 'cert-filter-error' : undefined}
              className="min-h-[44px] w-full rounded-lg border border-white/15 bg-[#071B1B] pl-9 pr-9 text-base text-[#FFFFFF] placeholder:text-xs placeholder:text-[#B8C7C7] focus:border-[#F05BEA] focus:outline-none focus:ring-2 focus:ring-[#F05BEA]/25 sm:h-10 sm:min-h-0 sm:pr-8 sm:text-xs [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
            />
            {courseQuery && (
              <button
                type="button"
                aria-label="Clear certificate filter"
                onClick={() => {
                  setCourseQuery('');
                  setFilterError(null);
                }}
                className="touch-press absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-[#C8D4D4] hover:text-[#FFFFFF] sm:right-2.5 sm:p-0.5 cursor-pointer"
              >
                <CloseIcon className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          {filterError && (
            <p
              id="cert-filter-error"
              role="alert"
              className="font-kalam text-xs text-[#FF8A8A]"
            >
              {filterError}
            </p>
          )}
        </form>
      </div>

      {filteredCertificates.length === 0 ? (
        <GlassCard
          accent="pink"
          className="mt-8 flex flex-1 flex-col items-center justify-center rounded-2xl px-6 py-16 text-center"
        >
          <p className="font-caveat text-3xl font-normal text-[#FFFF00]">
            No matching certificates found
          </p>
          <button
            type="button"
            onClick={() => {
              setCourseQuery('');
              setFilterError(null);
            }}
            className="touch-press mt-5 inline-flex min-h-[44px] items-center rounded-lg bg-[#C8FF27] px-5 py-2.5 text-xs font-bold text-[#071B1B] hover:bg-[#d5ff52] cursor-pointer"
          >
            Reset Filter — Show All {CERTIFICATES.length} Certificates
          </button>
        </GlassCard>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:mt-8 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredCertificates.map((cert, idx) => (
            <CertificateCard
              key={cert.id}
              cert={cert}
              eager={idx < 6}
              highPriority={idx < 3}
              onSelect={handleSelectCert}
            />
          ))}
        </div>
      )}

      <AnimatePresence>
        {selectedCert && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`${selectedCert.title} — ${selectedCert.issuer}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => setSelectedCert(null)}
            className="fixed inset-0 z-[120] flex items-center justify-center bg-[#041010]/85 p-4 backdrop-blur-md sm:p-6"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="glass-surface-strong glass-accent-pink relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl p-4 sm:p-6"
            >
              <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-3.5">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-kalam text-xs font-bold text-[#F05BEA] tabular-nums">
                      Certificate {selectedCert.number}
                    </span>
                    {selectedCert.issuedDate && (
                      <span className="font-kalam text-xs text-[#B8C7C7] tabular-nums">
                        · {selectedCert.issuedDate}
                      </span>
                    )}
                  </div>
                  <h2 className="mt-1 font-caveat text-2xl leading-tight font-normal tracking-wide text-[#FFFF00] sm:text-3xl">
                    {selectedCert.title}
                  </h2>
                  <p className="mt-0.5 flex items-center gap-1.5 font-kalam text-xs text-[#D5E2E2] sm:text-sm">
                    <CheckVerifiedIcon
                      aria-hidden="true"
                      className="h-4 w-4 shrink-0 text-[#C8FF27]"
                    />
                    <span>{selectedCert.issuer}</span>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedCert(null)}
                  aria-label="Close certificate preview"
                  className="touch-press inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-[#FFFFFF] transition-colors hover:border-[#F05BEA] hover:bg-white/10 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8FF27]"
                >
                  <CloseIcon className="h-4.5 w-4.5" />
                </button>
              </div>

              <div className="my-4 flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-xl border border-white/15 bg-white p-2 sm:p-3">
                <img
                  src={selectedCert.imageUrl}
                  alt={selectedCert.alt}
                  className="max-h-[65vh] w-auto max-w-full object-contain"
                />
              </div>

              {filteredCertificates.length > 1 && (
                <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-3">
                  <button
                    type="button"
                    onClick={() => handleStepPreview(-1)}
                    aria-label="Previous certificate"
                    className="touch-press inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3.5 py-2 font-kalam text-xs text-[#FFFFFF] transition-colors hover:border-[#F05BEA] hover:bg-white/10 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8FF27]"
                  >
                    <ChevronPrevIcon className="h-4 w-4 text-[#C8FF27]" />
                    <span>Previous</span>
                  </button>

                  <span className="font-kalam text-xs text-[#B8C7C7] tabular-nums">
                    {selectedIndex + 1} / {filteredCertificates.length}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleStepPreview(1)}
                    aria-label="Next certificate"
                    className="touch-press inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3.5 py-2 font-kalam text-xs text-[#FFFFFF] transition-colors hover:border-[#F05BEA] hover:bg-white/10 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8FF27]"
                  >
                    <span>Next</span>
                    <ChevronNextIcon className="h-4 w-4 text-[#C8FF27]" />
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
