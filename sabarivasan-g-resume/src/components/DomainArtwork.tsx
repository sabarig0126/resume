import { PortfolioCategory } from '../types/portfolio';

interface DomainArtworkProps {
  category: PortfolioCategory;
  indexNumber: string;
  isLead?: boolean;
}

export function DomainArtwork({
  category,
  indexNumber,
  isLead = false,
}: DomainArtworkProps) {
  return (
    <div
      aria-hidden="true"
      className={`relative w-full overflow-hidden border-b border-white/10 ${
        isLead ? 'h-44 sm:h-52' : 'h-36'
      } bg-[#071028]`}
    >
      {/* Radial depth glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            category === 'Achievements'
              ? 'radial-gradient(circle at 80% 25%, rgba(245, 158, 11, 0.16), transparent 60%), radial-gradient(circle at 20% 80%, rgba(37, 99, 235, 0.2), transparent 55%)'
              : 'radial-gradient(circle at 75% 25%, rgba(37, 99, 235, 0.24), transparent 60%), radial-gradient(circle at 20% 80%, rgba(14, 165, 233, 0.12), transparent 55%)',
        }}
      />

      {/* Domain-specific crisp geometric vector plate */}
      {category === 'Achievements' && (
        <svg
          viewBox="0 0 400 160"
          className="h-full w-full opacity-80 transition-transform duration-500 ease-out group-hover:scale-105"
          fill="none"
        >
          <circle
            cx="290"
            cy="80"
            r="58"
            stroke="rgba(245, 158, 11, 0.35)"
            strokeWidth="1"
          />
          <circle
            cx="290"
            cy="80"
            r="38"
            stroke="rgba(59, 130, 246, 0.45)"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          <circle cx="290" cy="80" r="5" fill="#F59E0B" />
          <path
            d="M40 120 C 110 120, 140 35, 210 60 C 260 78, 290 80, 360 35"
            stroke="rgba(96, 165, 250, 0.55)"
            strokeWidth="1.5"
          />
          <path
            d="M40 135 C 120 110, 175 95, 240 105 C 295 113, 330 75, 370 65"
            stroke="rgba(255, 255, 255, 0.16)"
            strokeWidth="1"
          />
          <circle cx="210" cy="60" r="3" fill="#60A5FA" />
          <circle cx="360" cy="35" r="3" fill="#60A5FA" />
        </svg>
      )}

      {category === 'Certifications' && (
        <svg
          viewBox="0 0 400 160"
          className="h-full w-full opacity-80 transition-transform duration-500 ease-out group-hover:scale-105"
          fill="none"
        >
          <g stroke="rgba(148, 163, 184, 0.16)" strokeWidth="1">
            <line x1="60" y1="24" x2="60" y2="136" />
            <line x1="140" y1="24" x2="140" y2="136" />
            <line x1="220" y1="24" x2="220" y2="136" />
            <line x1="300" y1="24" x2="300" y2="136" />
            <line x1="40" y1="52" x2="360" y2="52" />
            <line x1="40" y1="108" x2="360" y2="108" />
          </g>
          <polyline
            points="60,108 140,80 220,92 300,44 355,34"
            stroke="#3B82F6"
            strokeWidth="2"
          />
          <circle cx="60" cy="108" r="3.5" fill="#60A5FA" />
          <circle cx="140" cy="80" r="3.5" fill="#60A5FA" />
          <circle cx="220" cy="92" r="3.5" fill="#60A5FA" />
          <circle cx="300" cy="44" r="4" fill="#F59E0B" />
          <circle cx="355" cy="34" r="3.5" fill="#60A5FA" />
        </svg>
      )}

      {category === 'Academic' && (
        <svg
          viewBox="0 0 400 160"
          className="h-full w-full opacity-80 transition-transform duration-500 ease-out group-hover:scale-105"
          fill="none"
        >
          <rect
            x="60"
            y="34"
            width="92"
            height="92"
            rx="8"
            stroke="rgba(59, 130, 246, 0.38)"
            strokeWidth="1"
          />
          <rect
            x="168"
            y="34"
            width="92"
            height="92"
            rx="8"
            stroke="rgba(255, 255, 255, 0.16)"
            strokeWidth="1"
          />
          <rect
            x="276"
            y="34"
            width="64"
            height="92"
            rx="8"
            stroke="rgba(245, 158, 11, 0.35)"
            strokeWidth="1"
          />
          <line
            x1="152"
            y1="80"
            x2="168"
            y2="80"
            stroke="rgba(96, 165, 250, 0.7)"
            strokeWidth="1.5"
          />
          <line
            x1="260"
            y1="80"
            x2="276"
            y2="80"
            stroke="rgba(245, 158, 11, 0.7)"
            strokeWidth="1.5"
          />
          <circle cx="106" cy="80" r="14" stroke="#60A5FA" strokeWidth="1.5" />
          <circle cx="214" cy="80" r="14" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
          <circle cx="308" cy="80" r="10" fill="rgba(245, 158, 11, 0.25)" stroke="#F59E0B" strokeWidth="1.5" />
        </svg>
      )}

      {category === 'Projects' && (
        <svg
          viewBox="0 0 400 160"
          className="h-full w-full opacity-80 transition-transform duration-500 ease-out group-hover:scale-105"
          fill="none"
        >
          <path
            d="M40 105 Q 110 25, 200 80 T 360 55"
            stroke="#3B82F6"
            strokeWidth="1.75"
          />
          <path
            d="M40 120 Q 120 55, 210 95 T 360 80"
            stroke="rgba(245, 158, 11, 0.45)"
            strokeWidth="1.25"
          />
          <circle cx="200" cy="80" r="4.5" fill="#F59E0B" />
          <circle cx="360" cy="55" r="3.5" fill="#60A5FA" />
        </svg>
      )}

      {/* Corner Index Tag */}
      <div className="absolute left-5 top-4 font-kalam text-xs font-bold text-blue-300/90 tabular-nums">
        {indexNumber}
      </div>
    </div>
  );
}
