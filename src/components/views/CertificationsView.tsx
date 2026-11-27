import { type FormEvent, memo, useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowRightIcon,
  CheckVerifiedIcon,
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

const PRIORITY_ORGANIZATION_ORDER: readonly string[] = [
  'Infosys Springboard',
  'Simplilearn SkillUP',
  'Tech Mahindra Foundation',
  'MongoDB, Inc.',
  'E-Cell, IIT Bombay',
  'IBM Career Education Program',
  'TEDxSRIT',
  'MathWorks Training Services',
  'NPTEL – IIT Madras',
];

interface OrganizationLogoAsset {
  src: string;
  width: number;
  height: number;
  alt: string;
  bgClassName?: string;
}

const ORGANIZATION_LOGOS: Record<string, OrganizationLogoAsset> = {
  'infosys springboard': {
    src: '/assets/organizations/infosys-springboard.webp',
    width: 560,
    height: 280,
    alt: 'Infosys Springboard official logo',
  },
  'simplilearn skillup': {
    src: '/assets/organizations/simplilearn-skillup.webp',
    width: 560,
    height: 280,
    alt: 'Simplilearn SkillUP official logo',
  },
  'tech mahindra foundation': {
    src: '/assets/organizations/tech-mahindra-foundation.webp',
    width: 480,
    height: 240,
    alt: 'Tech Mahindra Foundation official logo',
  },
  'mongodb, inc.': {
    src: '/assets/organizations/mongodb.webp',
    width: 560,
    height: 280,
    alt: 'MongoDB, Inc. official logo',
    bgClassName: 'bg-[#3C674F]',
  },
  'e-cell, iit bombay': {
    src: '/assets/organizations/ecell-iit-bombay.webp',
    width: 480,
    height: 240,
    alt: 'E-Cell, IIT Bombay official logo',
  },
  'ibm career education program': {
    src: '/assets/organizations/ibm-career-education.webp',
    width: 520,
    height: 260,
    alt: 'IBM Career Education Program official logo',
  },
  tedxsrit: {
    src: '/assets/organizations/tedx-srit.webp',
    width: 560,
    height: 280,
    alt: 'TEDxSRIT official logo',
  },
  'mathworks training services': {
    src: '/assets/organizations/mathworks.webp',
    width: 820,
    height: 280,
    alt: 'MathWorks Training Services official logo',
  },
  'nptel – iit madras': {
    src: '/assets/organizations/nptel-iit-madras.webp',
    width: 560,
    height: 280,
    alt: 'NPTEL – IIT Madras official logo',
  },
};

function getOrganizationInitials(name: string): string {
  const words = name
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return 'ORG';
  if (words.length === 1) return words[0].slice(0, 3).toUpperCase();
  return words
    .slice(0, 3)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}

interface OrganizationGroup {
  name: string;
  certificates: CertificateItem[];
}

function normalizeOrganizationName(issuer: string): string {
  return issuer.replace(/\s*\|\s*/g, ' ').replace(/\s+/g, ' ').trim();
}

function buildOrganizationGroups(certificates: readonly CertificateItem[]): OrganizationGroup[] {
  const grouped = new Map<string, CertificateItem[]>();

  for (const cert of certificates) {
    const orgName = normalizeOrganizationName(cert.issuer || cert.issuerShort);
    const existing = grouped.get(orgName);
    if (existing) {
      existing.push(cert);
    } else {
      grouped.set(orgName, [cert]);
    }
  }

  const orderIndex = new Map<string, number>(
    PRIORITY_ORGANIZATION_ORDER.map((name, idx) => [name.toLowerCase(), idx])
  );

  return Array.from(grouped.entries())
    .sort(([nameA], [nameB]) => {
      const rankA = orderIndex.get(nameA.toLowerCase()) ?? Number.MAX_SAFE_INTEGER;
      const rankB = orderIndex.get(nameB.toLowerCase()) ?? Number.MAX_SAFE_INTEGER;
      if (rankA !== rankB) return rankA - rankB;
      return nameA.localeCompare(nameB);
    })
    .map(([name, orgCertificates]) => ({
      name,
      certificates: orgCertificates,
    }));
}

interface OrganizationCardProps {
  group: OrganizationGroup;
  orderNumber: string;
  matchingCount?: number;
  eager: boolean;
  isAccentLime: boolean;
  onSelect: (orgName: string) => void;
}

const OrganizationCard = memo(function OrganizationCard({
  group,
  orderNumber,
  matchingCount,
  eager,
  isAccentLime,
  onSelect,
}: OrganizationCardProps) {
  const totalCount = group.certificates.length;
  const logoAsset = ORGANIZATION_LOGOS[group.name.toLowerCase()];
  const countLabel =
    matchingCount !== undefined && matchingCount !== totalCount
      ? `${matchingCount} of ${totalCount} matching`
      : `${totalCount} ${totalCount === 1 ? 'Certificate' : 'Certificates'}`;

  return (
    <TiltCard
      maxTiltDeg={2.4}
      glowColor={isAccentLime ? 'lime' : 'pink'}
      scaleOnHover={1.008}
      className="cert-grid-card glass-surface glass-interactive flex flex-col rounded-2xl"
    >
      <button
        type="button"
        onClick={() => onSelect(group.name)}
        aria-label={`View ${totalCount} ${totalCount === 1 ? 'certificate' : 'certificates'} from ${group.name}`}
        className="group touch-press flex h-full w-full flex-col rounded-2xl p-3.5 text-left sm:p-4 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8FF27]"
      >
        <div
          className={`relative flex aspect-[14/10] w-full items-center justify-center overflow-hidden rounded-xl border border-white/15 p-4 shadow-inner sm:p-5 ${
            logoAsset
              ? logoAsset.bgClassName ?? 'bg-white'
              : 'bg-gradient-to-br from-[#0A2525] to-[#061515]'
          }`}
        >
          {logoAsset ? (
            <img
              src={logoAsset.src}
              alt={logoAsset.alt}
              width={logoAsset.width}
              height={logoAsset.height}
              loading={eager ? 'eager' : 'lazy'}
              decoding="async"
              className="max-h-full max-w-full object-contain transition-transform duration-300 ease-out group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#C8FF27]/35 bg-[#C8FF27]/10 font-road-rage text-2xl tracking-wider text-[#FFFF00]">
                {getOrganizationInitials(group.name)}
              </div>
              <span className="font-kalam text-xs text-[#D5E2E2]">{group.name}</span>
            </div>
          )}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-2.5 top-2.5 inline-flex items-center rounded-md border border-[#F05BEA]/45 bg-[#071B1B]/90 px-2.5 py-1 font-kalam text-[11px] font-bold text-[#C8FF27] tabular-nums backdrop-blur-md shadow-[0_4px_14px_rgba(0,0,0,0.45)]"
          >
            {countLabel}
          </span>
        </div>

        <div className="mt-3.5 flex flex-1 flex-col justify-between gap-2.5 px-1 pb-0.5">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="font-kalam text-xs font-bold text-[#F05BEA] tabular-nums">
                Organization {orderNumber}
              </span>
              <span className="font-kalam text-[11px] text-[#B8C7C7] tabular-nums">
                {totalCount} {totalCount === 1 ? 'Credential' : 'Credentials'}
              </span>
            </div>
            <h2 className="mt-1 font-caveat text-[1.45rem] leading-snug font-normal tracking-wide text-[#FFFF00] transition-colors group-hover:text-[#FFF899]">
              {group.name}
            </h2>
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-white/10 pt-2.5">
            <span className="flex items-center gap-2 font-kalam text-xs text-[#D5E2E2] sm:text-[13px]">
              <CheckVerifiedIcon
                aria-hidden="true"
                className="h-4 w-4 shrink-0 text-[#C8FF27]"
              />
              <span>View Certificates</span>
            </span>
            <ArrowRightIcon
              aria-hidden="true"
              className="h-4 w-4 shrink-0 text-[#A0B2B2] transition-transform duration-200 group-hover:translate-x-1 group-hover:text-[#C8FF27]"
            />
          </div>
        </div>
      </button>
    </TiltCard>
  );
});

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
  const [selectedOrgName, setSelectedOrgName] = useState<string | null>(null);
  const [selectedCert, setSelectedCert] = useState<CertificateItem | null>(null);

  const organizationGroups = useMemo(
    () => buildOrganizationGroups(CERTIFICATES),
    []
  );

  const selectedOrgGroup = useMemo(() => {
    if (!selectedOrgName) return null;
    return organizationGroups.find((group) => group.name === selectedOrgName) ?? null;
  }, [organizationGroups, selectedOrgName]);

  const normalizedQuery = courseQuery.trim().toLowerCase();

  const matchesQuery = useCallback(
    (cert: CertificateItem) => {
      if (!normalizedQuery) return true;
      const normalizedOrg = normalizeOrganizationName(cert.issuer || cert.issuerShort);
      return (
        cert.title.toLowerCase().includes(normalizedQuery) ||
        cert.issuer.toLowerCase().includes(normalizedQuery) ||
        cert.issuerShort.toLowerCase().includes(normalizedQuery) ||
        normalizedOrg.toLowerCase().includes(normalizedQuery) ||
        (cert.issuedDate?.toLowerCase().includes(normalizedQuery) ?? false)
      );
    },
    [normalizedQuery]
  );

  const filteredOrganizationEntries = useMemo(() => {
    return organizationGroups
      .map((group, originalIndex) => {
        const matchingCertificates = normalizedQuery
          ? group.certificates.filter(matchesQuery)
          : group.certificates;
        return {
          group,
          originalIndex,
          matchingCertificates,
        };
      })
      .filter((entry) => entry.matchingCertificates.length > 0);
  }, [organizationGroups, normalizedQuery, matchesQuery]);

  const activeCertificates = useMemo(() => {
    if (selectedOrgGroup) {
      return normalizedQuery
        ? selectedOrgGroup.certificates.filter(matchesQuery)
        : selectedOrgGroup.certificates;
    }
    if (normalizedQuery) {
      return filteredOrganizationEntries.flatMap((entry) => entry.matchingCertificates);
    }
    return CERTIFICATES;
  }, [selectedOrgGroup, normalizedQuery, matchesQuery, filteredOrganizationEntries]);

  useEffect(() => {
    if (!selectedCert) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedCert(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCert]);

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

  const handleSelectOrg = useCallback((orgName: string) => {
    setSelectedOrgName(orgName);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const handleBackToOrganizations = useCallback(() => {
    setSelectedOrgName(null);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

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

  return (
    <section className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col px-4 py-6 sm:px-6 sm:py-10 md:px-10 md:py-12">
      <div className="flex shrink-0 flex-col gap-5 border-b border-white/10 pb-5 sm:gap-6 sm:pb-7 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-kalam text-xs text-[#F05BEA] tabular-nums">
            04 · Certifications &amp; Technical Courses
          </p>
          <h1 className="mt-2 font-road-rage text-[2.2rem] font-normal leading-[1.06] tracking-wide text-[#FF4D4D] sm:text-5xl lg:text-[3.35rem] [text-wrap:balance]">
            <AnimatedCounter value={CERTIFICATES.length} /> verified certificates across{' '}
            <AnimatedCounter value={organizationGroups.length} /> issuing organizations
          </h1>
          <p className="mt-2 font-kalam text-xs text-[#B8C7C7] sm:text-sm">
            {selectedOrgGroup
              ? `Viewing ${selectedOrgGroup.name} · Select any certificate card to inspect full details`
              : `${PROFILE.learningGoal} · Select an issuing organization to view its certificates`}
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

      {selectedOrgGroup ? (
        <motion.div
          key={`org-${selectedOrgGroup.name}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 flex flex-1 flex-col sm:mt-8"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3.5 sm:px-5">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleBackToOrganizations}
                className="touch-press inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.05] px-3.5 py-2 font-kalam text-xs font-bold text-[#FFFFFF] transition-colors hover:border-[#C8FF27]/65 hover:bg-[#C8FF27]/12 hover:text-[#C8FF27] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8FF27]"
              >
                <ChevronPrevIcon className="h-4 w-4 text-[#C8FF27]" aria-hidden="true" />
                <span>All Organizations</span>
              </button>

              <div className="min-w-0">
                <h2 className="font-caveat text-2xl leading-tight font-normal tracking-wide text-[#FFFF00] sm:text-[1.7rem]">
                  {selectedOrgGroup.name}
                </h2>
              </div>
            </div>

            <span className="font-kalam text-xs font-bold text-[#F05BEA] tabular-nums">
              {activeCertificates.length}{' '}
              {activeCertificates.length === 1 ? 'Certificate' : 'Certificates'}
              {normalizedQuery ? ' matching filter' : ''}
            </span>
          </div>

          {activeCertificates.length === 0 ? (
            <GlassCard
              accent="pink"
              className="mt-6 flex flex-1 flex-col items-center justify-center rounded-2xl px-6 py-16 text-center"
            >
              <p className="font-caveat text-3xl font-normal text-[#FFFF00]">
                No matching certificates in {selectedOrgGroup.name}
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setCourseQuery('');
                    setFilterError(null);
                  }}
                  className="touch-press inline-flex min-h-[44px] items-center rounded-lg bg-[#C8FF27] px-5 py-2.5 text-xs font-bold text-[#071B1B] hover:bg-[#d5ff52] cursor-pointer"
                >
                  Clear Filter
                </button>
                <button
                  type="button"
                  onClick={handleBackToOrganizations}
                  className="touch-press inline-flex min-h-[44px] items-center rounded-lg border border-white/15 bg-white/[0.04] px-5 py-2.5 text-xs font-semibold text-[#FFFFFF] hover:border-[#F05BEA]/65 hover:bg-[#F05BEA]/15 cursor-pointer"
                >
                  Back to All Organizations
                </button>
              </div>
            </GlassCard>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
              {activeCertificates.map((cert, idx) => (
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
        </motion.div>
      ) : filteredOrganizationEntries.length === 0 ? (
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
            Reset Filter — Show All {organizationGroups.length} Organizations
          </button>
        </GlassCard>
      ) : (
        <motion.div
          key="org-overview"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 flex flex-1 flex-col sm:mt-8"
        >
          <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredOrganizationEntries.map(
              ({ group, originalIndex, matchingCertificates }, idx) => (
                <OrganizationCard
                  key={group.name}
                  group={group}
                  orderNumber={String(originalIndex + 1).padStart(2, '0')}
                  matchingCount={
                    normalizedQuery ? matchingCertificates.length : undefined
                  }
                  eager={idx < 6}
                  isAccentLime={idx % 2 === 1}
                  onSelect={handleSelectOrg}
                />
              )
            )}
          </div>

          {normalizedQuery && (
            <div className="mt-8 border-t border-white/10 pt-7">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-caveat text-2xl font-normal tracking-wide text-[#FFFF00] sm:text-3xl">
                  Matching Certificates
                </h2>
                <span className="font-kalam text-xs font-bold text-[#F05BEA] tabular-nums">
                  {activeCertificates.length}{' '}
                  {activeCertificates.length === 1 ? 'Certificate' : 'Certificates'}
                </span>
              </div>
              <div className="mt-5 grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
                {activeCertificates.map((cert, idx) => (
                  <CertificateCard
                    key={cert.id}
                    cert={cert}
                    eager={idx < 6}
                    highPriority={idx < 3}
                    onSelect={handleSelectCert}
                  />
                ))}
              </div>
            </div>
          )}
        </motion.div>
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
            className="fixed inset-0 z-[120] flex items-center justify-center bg-[#041010]/85 p-3 backdrop-blur-md sm:p-6"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="glass-surface-strong glass-accent-pink relative flex max-h-[92dvh] w-full max-w-4xl flex-col overflow-y-auto rounded-2xl p-3.5 sm:p-6"
            >
              <div className="flex shrink-0 items-start justify-between gap-3 border-b border-white/10 pb-3 sm:gap-4 sm:pb-3.5">
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
                  <h2 className="mt-1 font-caveat text-xl leading-tight font-normal tracking-wide text-[#FFFF00] sm:text-3xl">
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

              <div className="mt-3 flex min-h-0 flex-1 items-center justify-center rounded-xl border border-white/15 bg-white p-1.5 sm:mt-4 sm:p-3">
                <img
                  src={selectedCert.imageUrl}
                  alt={selectedCert.alt}
                  className="block h-auto max-h-[calc(92dvh-12rem)] w-auto max-w-full object-contain sm:max-h-[calc(92dvh-13.5rem)]"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
