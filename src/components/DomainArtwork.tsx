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
      } bg-[#071B1B]/75`}
    >
      {/* Radial depth glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            category === 'Achievements'
              ? 'radial-gradient(circle at 80% 25%, rgba(240, 91, 234, 0.18), transparent 60%), radial-gradient(circle at 20% 80%, rgba(200, 255, 39, 0.1), transparent 55%)'
              : 'radial-gradient(circle at 75% 25%, rgba(240, 91, 234, 0.2), transparent 60%), radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.05), transparent 55%)',
        }}
      />

      {/* Domain-specific crisp geometric vector plate */}
      {category === 'Achievements' && (
        <svg
          viewBox="0 0 400 160"
          className="h-full w-full opacity-85 transition-transform duration-500 ease-out group-hover:scale-105"
          fill="none"
        >
          <circle
            cx="290"
            cy="80"
            r="58"
            stroke="rgba(240, 91, 234, 0.4)"
            strokeWidth="1"
          />
          <circle
            cx="290"
            cy="80"
            r="38"
            stroke="rgba(200, 255, 39, 0.45)"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          <circle cx="290" cy="80" r="5" fill="#C8FF27" />
          <path
            d="M40 120 C 110 120, 140 35, 210 60 C 260 78, 290 80, 360 35"
            stroke="rgba(240, 91, 234, 0.65)"
            strokeWidth="1.5"
          />
          <path
            d="M40 135 C 120 110, 175 95, 240 105 C 295 113, 330 75, 370 65"
            stroke="rgba(255, 255, 255, 0.16)"
            strokeWidth="1"
          />
          <circle cx="210" cy="60" r="3" fill="#F05BEA" />
          <circle cx="360" cy="35" r="3" fill="#C8FF27" />
        </svg>
      )}

      {category === 'Certifications' && (
        <svg
          viewBox="0 0 400 160"
          className="h-full w-full opacity-85 transition-transform duration-500 ease-out group-hover:scale-105"
          fill="none"
        >
          <g stroke="rgba(160, 178, 178, 0.16)" strokeWidth="1">
            <line x1="60" y1="24" x2="60" y2="136" />
            <line x1="140" y1="24" x2="140" y2="136" />
            <line x1="220" y1="24" x2="220" y2="136" />
            <line x1="300" y1="24" x2="300" y2="136" />
            <line x1="40" y1="52" x2="360" y2="52" />
            <line x1="40" y1="108" x2="360" y2="108" />
          </g>
          <polyline
            points="60,108 140,80 220,92 300,44 355,34"
            stroke="#F05BEA"
            strokeWidth="2"
          />
          <circle cx="60" cy="108" r="3.5" fill="#F05BEA" />
          <circle cx="140" cy="80" r="3.5" fill="#F05BEA" />
          <circle cx="220" cy="92" r="3.5" fill="#F05BEA" />
          <circle cx="300" cy="44" r="4" fill="#C8FF27" />
          <circle cx="355" cy="34" r="3.5" fill="#C8FF27" />
        </svg>
      )}

      {category === 'Academic' && (
        <svg
          viewBox="0 0 400 160"
          className="h-full w-full opacity-85 transition-transform duration-500 ease-out group-hover:scale-105"
          fill="none"
        >
          <rect
            x="60"
            y="34"
            width="92"
            height="92"
            rx="8"
            stroke="rgba(240, 91, 234, 0.42)"
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
            stroke="rgba(200, 255, 39, 0.42)"
            strokeWidth="1"
          />
          <line
            x1="152"
            y1="80"
            x2="168"
            y2="80"
            stroke="rgba(240, 91, 234, 0.7)"
            strokeWidth="1.5"
          />
          <line
            x1="260"
            y1="80"
            x2="276"
            y2="80"
            stroke="rgba(200, 255, 39, 0.7)"
            strokeWidth="1.5"
          />
          <circle cx="106" cy="80" r="14" stroke="#F05BEA" strokeWidth="1.5" />
          <circle cx="214" cy="80" r="14" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
          <circle cx="308" cy="80" r="10" fill="rgba(200, 255, 39, 0.22)" stroke="#C8FF27" strokeWidth="1.5" />
        </svg>
      )}

      {category === 'Projects' && (
        <svg
          viewBox="0 0 400 160"
          className="h-full w-full opacity-85 transition-transform duration-500 ease-out group-hover:scale-105"
          fill="none"
        >
          <path
            d="M40 105 Q 110 25, 200 80 T 360 55"
            stroke="#F05BEA"
            strokeWidth="1.75"
          />
          <path
            d="M40 120 Q 120 55, 210 95 T 360 80"
            stroke="rgba(200, 255, 39, 0.5)"
            strokeWidth="1.25"
          />
          <circle cx="200" cy="80" r="4.5" fill="#C8FF27" />
          <circle cx="360" cy="55" r="3.5" fill="#F05BEA" />
        </svg>
      )}

      {/* Corner Index Tag */}
      <div className="absolute left-5 top-4 font-kalam text-xs font-bold text-[#C8FF27] tabular-nums">
        {indexNumber}
      </div>
    </div>
  );
}
