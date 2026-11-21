import type { ComponentType, SVGProps } from 'react';

export type NextGenIconProps = SVGProps<SVGSVGElement> & {
  strokeWidth?: number | string;
};

export type NextGenIconComponent = ComponentType<NextGenIconProps>;

/** 01 · Overview — Architectural Astrolabe Compass */
export function OverviewIcon({
  strokeWidth = 1.75,
  ...props
}: NextGenIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="9.25" strokeOpacity="0.9" />
      <circle cx="12" cy="12" r="6" strokeDasharray="2 3" strokeOpacity="0.45" />
      <path
        d="M15.8 8.2L13.5 13.5L8.2 15.8L10.5 10.5L15.8 8.2Z"
        fill="currentColor"
        fillOpacity="0.16"
      />
      <circle cx="12" cy="12" r="1.15" fill="currentColor" stroke="none" />
      <path d="M12 2.75V4.25M12 19.75V21.25M2.75 12H4.25M19.75 12H21.25" strokeOpacity="0.55" />
    </svg>
  );
}

/** 02 · Achievements — Faceted Apex Trophy with Floating Crest */
export function TrophyIcon({
  strokeWidth = 1.75,
  ...props
}: NextGenIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M7 5.5H17V10.2C17 13.1 14.8 15.3 12 15.3C9.2 15.3 7 13.1 7 10.2V5.5Z"
        fill="currentColor"
        fillOpacity="0.14"
      />
      <path d="M7 7H4.75C4.05 7 3.5 7.55 3.5 8.25V9.5C3.5 11.15 4.75 12.45 6.4 12.6L7 12.65" />
      <path d="M17 7H19.25C19.95 7 20.5 7.55 20.5 8.25V9.5C20.5 11.15 19.25 12.45 17.6 12.6L17 12.65" />
      <path d="M12 15.3V19" />
      <path d="M8.25 20.5H15.75M9.75 18.75H14.25" />
      <path d="M12 8.2L12.9 10L14.7 10.3L13.3 11.5L13.6 13.2L12 12.3L10.4 13.2L10.7 11.5L9.3 10.3L11.1 10L12 8.2Z" strokeWidth="1.25" strokeOpacity="0.85" />
      <circle cx="12" cy="2.9" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** 03 · Technical Skills — Quantum Neural Silicon Core */
export function CpuIcon({
  strokeWidth = 1.75,
  ...props
}: NextGenIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M7.5 5.5H16.5L18.5 7.5V16.5L16.5 18.5H7.5L5.5 16.5V7.5L7.5 5.5Z"
        fill="currentColor"
        fillOpacity="0.12"
      />
      <rect x="9" y="9" width="6" height="6" rx="1.4" strokeOpacity="0.85" />
      <circle cx="12" cy="12" r="1.25" fill="currentColor" stroke="none" />
      <path d="M9.5 2.75V5.5M14.5 2.75V5.5M9.5 18.5V21.25M14.5 18.5V21.25" strokeOpacity="0.8" />
      <path d="M2.75 9.5H5.5M2.75 14.5H5.5M18.5 9.5H21.25M18.5 14.5H21.25" strokeOpacity="0.8" />
    </svg>
  );
}

/** 04 · Certifications — Octagonal Rosette Seal & Ribbons */
export function AwardIcon({
  strokeWidth = 1.75,
  ...props
}: NextGenIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <polygon
        points="12,3 15.2,4.3 17.7,6.8 19,10 17.7,13.2 15.2,15.7 12,17 8.8,15.7 6.3,13.2 5,10 6.3,6.8 8.8,4.3"
        fill="currentColor"
        fillOpacity="0.14"
      />
      <path d="M12 7.2L12.8 9.2L14.8 10L12.8 10.8L12 12.8L11.2 10.8L9.2 10L11.2 9.2L12 7.2Z" fill="currentColor" fillOpacity="0.35" strokeWidth="1.3" />
      <path d="M8.5 15.6L7.3 21.2L12 19.1L16.7 21.2L15.5 15.6" />
    </svg>
  );
}

/** 05 · Education — Isometric Academic Mortarboard & Crest */
export function EducationIcon({
  strokeWidth = 1.75,
  ...props
}: NextGenIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M12 4.5L21.5 9.25L12 14L2.5 9.25L12 4.5Z"
        fill="currentColor"
        fillOpacity="0.16"
      />
      <path d="M6.25 11.4V16.1C6.25 17.6 8.8 19.25 12 19.25C15.2 19.25 17.75 17.6 17.75 16.1V11.4" />
      <path d="M20.25 10.2V15.5" />
      <circle cx="20.25" cy="17" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="9.25" r="0.95" fill="currentColor" stroke="none" opacity="0.7" />
    </svg>
  );
}

/** 06 · Projects — Aerodynamic Orbital Shuttle */
export function RocketIcon({
  strokeWidth = 1.75,
  ...props
}: NextGenIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M14.2 15.8C17.8 12.2 20 7.4 20.2 3.8C16.6 4 11.8 6.2 8.2 9.8L6.2 13.8L10.2 17.8L14.2 15.8Z"
        fill="currentColor"
        fillOpacity="0.15"
      />
      <path d="M9 10.2L5.2 9.4L3.6 11.8L6.4 13.6" />
      <path d="M13.8 15L14.6 18.8L12.2 20.4L10.4 17.6" />
      <circle cx="14.5" cy="9.5" r="1.65" />
      <path d="M4.2 19.8L6.8 17.2M3 16.5L4.8 14.7M7.5 21L9.3 19.2" strokeOpacity="0.75" />
    </svg>
  );
}

/** 07 · Resume / Documents — Beveled Glass Dossier */
export function FileDossierIcon({
  strokeWidth = 1.75,
  ...props
}: NextGenIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M6.25 3.25H14L18.75 8V19C18.75 20.1 17.85 21 16.75 21H6.25C5.15 21 4.25 20.1 4.25 19V5.25C4.25 4.15 5.15 3.25 6.25 3.25Z"
        fill="currentColor"
        fillOpacity="0.12"
      />
      <path d="M13.75 3.5V7.5C13.75 8.05 14.2 8.5 14.75 8.5H18.5" />
      <path d="M8 9.25H10.75" strokeOpacity="0.7" />
      <path d="M8 13H15M8 16.5H12.75" />
    </svg>
  );
}

/** 08 · Portfolio PDF — Isometric Stacked Glass Decks */
export function LayersDeckIcon({
  strokeWidth = 1.75,
  ...props
}: NextGenIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M12 3.25L20.75 8L12 12.75L3.25 8L12 3.25Z"
        fill="currentColor"
        fillOpacity="0.18"
      />
      <path d="M3.75 12.25L12 16.75L20.25 12.25" strokeOpacity="0.88" />
      <path d="M3.75 16.5L12 21L20.25 16.5" strokeOpacity="0.58" />
    </svg>
  );
}

/** 09 · Contact — Sleek Stealth Telemetry Dart */
export function SendVectorIcon({
  strokeWidth = 1.75,
  ...props
}: NextGenIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M21 3.5L14.1 20.5L10.8 13.2L3.5 9.9L21 3.5Z"
        fill="currentColor"
        fillOpacity="0.15"
      />
      <path d="M21 3.5L10.8 13.2" />
      <path d="M4.5 18.5L7.5 15.5" strokeOpacity="0.55" />
    </svg>
  );
}

/** Header Menu Trigger — Kinetic Asymmetric Lines with Precision Node */
export function MenuGridIcon({
  strokeWidth = 1.9,
  ...props
}: NextGenIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M4 6.75H20" />
      <path d="M7.5 12H20" />
      <path d="M4 17.25H15.5" />
      <circle cx="4.3" cy="12" r="1.15" fill="currentColor" stroke="none" />
      <circle cx="19.3" cy="17.25" r="1.15" fill="currentColor" stroke="none" opacity="0.7" />
    </svg>
  );
}

/** Close — Precision Chamfered Cross with Center Aperture Node */
export function CloseIcon({
  strokeWidth = 1.9,
  ...props
}: NextGenIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M6.25 6.25L10.2 10.2M13.8 13.8L17.75 17.75" />
      <path d="M17.75 6.25L13.8 10.2M10.2 13.8L6.25 17.75" />
      <polygon
        points="12,10.25 13.75,12 12,13.75 10.25,12"
        fill="currentColor"
        fillOpacity="0.35"
        strokeWidth="1.2"
      />
    </svg>
  );
}

/** Directional Kinetic Right Arrow */
export function ArrowRightIcon({
  strokeWidth = 1.85,
  ...props
}: NextGenIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M4.5 12H18.5" />
      <path d="M13 6.25L19.25 12L13 17.75" />
      <circle cx="4.5" cy="12" r="1.1" fill="currentColor" stroke="none" opacity="0.75" />
    </svg>
  );
}

/** Achievement Card Action — Corner Launch Vector */
export function ArrowUpRightIcon({
  strokeWidth = 1.85,
  ...props
}: NextGenIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M6.5 17.5L17.5 6.5" />
      <path d="M9.25 6.25H17.75V14.75" />
      <path d="M5 12.5V17.75C5 18.45 5.55 19 6.25 19H11.5" strokeOpacity="0.4" strokeWidth="1.4" />
    </svg>
  );
}

/** Location — Geospatial Beacon Pin & Ground Telemetry Ring */
export function LocationBeaconIcon({
  strokeWidth = 1.75,
  ...props
}: NextGenIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M12 2.75C7.9 2.75 4.75 5.9 4.75 9.95C4.75 14.95 10.65 19.65 12 20.65C13.35 19.65 19.25 14.95 19.25 9.95C19.25 5.9 16.1 2.75 12 2.75Z"
        fill="currentColor"
        fillOpacity="0.14"
      />
      <circle cx="12" cy="9.85" r="2.75" />
      <circle cx="12" cy="9.85" r="0.8" fill="currentColor" stroke="none" />
      <path d="M7.25 21.5H16.75" strokeOpacity="0.4" strokeWidth="1.35" />
    </svg>
  );
}

/** Search — Precision Optical Reticle Loupe */
export function SearchLensIcon({
  strokeWidth = 1.8,
  ...props
}: NextGenIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <circle cx="10.75" cy="10.75" r="7.25" fill="currentColor" fillOpacity="0.1" />
      <path d="M7.6 8.2C8.35 7.2 9.5 6.6 10.75 6.6" strokeOpacity="0.55" strokeWidth="1.4" />
      <path d="M16.25 16.25L20.5 20.5" />
    </svg>
  );
}

/** Verified Check — Crisp Architectural Checkmark with Accent Spark */
export function CheckVerifiedIcon({
  strokeWidth = 2,
  ...props
}: NextGenIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="9" strokeOpacity="0.28" strokeWidth="1.35" fill="currentColor" fillOpacity="0.08" />
      <path d="M7.8 12.3L10.7 15.2L16.4 8.9" />
    </svg>
  );
}

/** Projects Workspace — Beveled Modular Kanban Studio */
export function KanbanBoardIcon({
  strokeWidth = 1.7,
  ...props
}: NextGenIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <rect
        x="3.25"
        y="4.25"
        width="17.5"
        height="15.5"
        rx="3.25"
        fill="currentColor"
        fillOpacity="0.12"
      />
      <rect x="6.5" y="7.75" width="3" height="8.5" rx="1" fill="currentColor" fillOpacity="0.22" />
      <rect x="10.5" y="7.75" width="3" height="5.25" rx="1" fill="currentColor" fillOpacity="0.22" />
      <rect x="14.5" y="7.75" width="3" height="7" rx="1" fill="currentColor" fillOpacity="0.22" />
    </svg>
  );
}

/** Contact Email — Precision Folded Glass Envelope */
export function MailEnvelopeIcon({
  strokeWidth = 1.75,
  ...props
}: NextGenIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="3"
        fill="currentColor"
        fillOpacity="0.12"
      />
      <path d="M4.25 7L10.7 11.95C11.45 12.55 12.55 12.55 13.3 11.95L19.75 7" />
      <path d="M6.5 16.25H9.25" strokeOpacity="0.45" strokeWidth="1.35" />
    </svg>
  );
}

/** Contact Phone — Sleek Acoustic Receiver with Signal Waves */
export function PhoneSignalIcon({
  strokeWidth = 1.75,
  ...props
}: NextGenIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M5.4 4.25H8.5C9.1 4.25 9.6 4.65 9.75 5.25L10.45 8.15C10.58 8.7 10.37 9.25 9.93 9.58L8.45 10.68C9.45 12.75 11.15 14.45 13.22 15.45L14.32 13.97C14.65 13.53 15.2 13.32 15.75 13.45L18.65 14.15C19.25 14.3 19.65 14.8 19.65 15.4V18.5C19.65 19.45 18.85 20.25 17.88 20.2C10.1 19.75 4.25 13.9 3.8 6.12C3.75 5.15 4.55 4.25 5.4 4.25Z"
        fill="currentColor"
        fillOpacity="0.14"
      />
      <path d="M14.25 5.25C16.75 5.55 18.45 7.25 18.75 9.75" strokeOpacity="0.7" />
      <path d="M14.25 8.35C15.2 8.55 15.45 8.8 15.65 9.75" strokeOpacity="0.9" />
    </svg>
  );
}

/** Contact LinkedIn — Precision Glass Crest & Connected Nodes */
export function LinkedInModernIcon({
  strokeWidth = 1.75,
  ...props
}: NextGenIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <rect
        x="3.25"
        y="3.25"
        width="17.5"
        height="17.5"
        rx="4.25"
        fill="currentColor"
        fillOpacity="0.12"
      />
      <path d="M8.25 10.75V16.25" />
      <circle cx="8.25" cy="7.75" r="1.05" fill="currentColor" stroke="none" />
      <path d="M11.75 16.25V10.75" />
      <path d="M11.75 12.6C11.75 11.2 12.85 10.5 14.1 10.5C15.4 10.5 16.25 11.35 16.25 12.8V16.25" />
    </svg>
  );
}

/** External Portal View — Open Glass Viewport with Launch Arrow */
export function ExternalPortalIcon({
  strokeWidth = 1.8,
  ...props
}: NextGenIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M12.5 5H6.75C5.23 5 4 6.23 4 7.75V17.25C4 18.77 5.23 20 6.75 20H16.25C17.77 20 19 18.77 19 17.25V11.5"
        fill="currentColor"
        fillOpacity="0.08"
      />
      <path d="M11.75 12.25L19.75 4.25" />
      <path d="M14.75 4.25H19.75V9.25" />
    </svg>
  );
}

/** Download Dock — Precision Tray with Kinetic Arrow */
export function DownloadTrayIcon({
  strokeWidth = 1.8,
  ...props
}: NextGenIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M12 4.25V14.75" />
      <path d="M7.75 10.75L12 15.25L16.25 10.75" />
      <path
        d="M4.25 15.25V17.75C4.25 19 5.25 20 6.5 20H17.5C18.75 20 19.75 19 19.75 17.75V15.25"
        fill="currentColor"
        fillOpacity="0.1"
      />
    </svg>
  );
}

/** Pagination Chevron Left — Dual-Faceted Precision Arrow */
export function ChevronPrevIcon({
  strokeWidth = 1.9,
  ...props
}: NextGenIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M14.5 6L8.5 12L14.5 18" />
      <path d="M17.5 8.5L14 12L17.5 15.5" strokeOpacity="0.38" strokeWidth="1.45" />
    </svg>
  );
}

/** Pagination Chevron Right — Dual-Faceted Precision Arrow */
export function ChevronNextIcon({
  strokeWidth = 1.9,
  ...props
}: NextGenIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M9.5 6L15.5 12L9.5 18" />
      <path d="M6.5 8.5L10 12L6.5 15.5" strokeOpacity="0.38" strokeWidth="1.45" />
    </svg>
  );
}

/** Zoom Out — Optical Loupe with Precision Minus */
export function ZoomOutLensIcon({
  strokeWidth = 1.8,
  ...props
}: NextGenIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <circle cx="10.75" cy="10.75" r="7.25" fill="currentColor" fillOpacity="0.1" />
      <path d="M8 10.75H13.5" />
      <path d="M16.25 16.25L20.5 20.5" />
    </svg>
  );
}

/** Zoom In — Optical Loupe with Precision Crosshair Plus */
export function ZoomInLensIcon({
  strokeWidth = 1.8,
  ...props
}: NextGenIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <circle cx="10.75" cy="10.75" r="7.25" fill="currentColor" fillOpacity="0.1" />
      <path d="M8 10.75H13.5M10.75 8V13.5" />
      <path d="M16.25 16.25L20.5 20.5" />
    </svg>
  );
}

/** Loading Orbital Spinner — Segmented Precision Arc */
export function SpinnerOrbitIcon({
  strokeWidth = 2,
  ...props
}: NextGenIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="9" strokeOpacity="0.22" />
      <path d="M12 3A9 9 0 0 1 21 12" />
      <circle cx="12" cy="3" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Image Fallback — Chamfered Horizon Frame Off */
export function ImageBrokenIcon({
  strokeWidth = 1.5,
  ...props
}: NextGenIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <rect
        x="3.5"
        y="4.5"
        width="17"
        height="15"
        rx="3"
        fill="currentColor"
        fillOpacity="0.1"
      />
      <path d="M4.5 16.25L9.2 11.75L12.6 15L15.8 12L19.5 15.75" strokeOpacity="0.6" />
      <circle cx="8.75" cy="8.5" r="1.2" fill="currentColor" stroke="none" opacity="0.7" />
      <path d="M3.25 3.25L20.75 20.75" />
    </svg>
  );
}
