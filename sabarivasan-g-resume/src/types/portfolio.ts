export type FeatureId =
  | 'overview'
  | 'achievements'
  | 'skills'
  | 'certifications'
  | 'education'
  | 'projects'
  | 'resume'
  | 'portfolioPdf'
  | 'contact';

export type PortfolioCategory =
  | 'Achievements'
  | 'Certifications'
  | 'Academic'
  | 'Projects';

export interface ShowcaseSpecs {
  issuerOrContext: string;
  focusArea: string;
  credentialOrOutcome: string;
  location: string;
}

export interface PortfolioItem {
  id: string;
  indexNumber: string;
  title: string;
  category: PortfolioCategory;
  organization: string;
  timeframe: string;
  location: string;
  summary: string;
  details: string;
  highlights: string[];
  imageUrl?: string;
  imageAlt?: string;
  featured?: boolean;
  specs: ShowcaseSpecs;
}

export interface CertificationTrack {
  number: string;
  provider: string;
  category: string;
  courses: string[];
}

export interface ProofMetric {
  value: string;
  label: string;
  context: string;
}
