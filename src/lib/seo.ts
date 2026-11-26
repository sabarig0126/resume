import {
  ACADEMIC_SUBJECTS,
  CERTIFICATION_TRACKS,
  INITIAL_PORTFOLIO_ITEMS,
  PORTFOLIO_PDF_PATH,
  PROFILE,
  RESUME_PDF_PATH,
  TECHNICAL_SKILLS,
} from '../data/projects';
import { FeatureId } from '../types/portfolio';

export interface FeatureSeoMeta {
  title: string;
  description: string;
  robots?: string;
  path: string;
}

export const FEATURE_PATHS: Record<Exclude<FeatureId, 'notFound'>, string> = {
  overview: '/',
  achievements: '/achievements',
  skills: '/skills',
  certifications: '/certifications',
  education: '/education',
  projects: '/projects',
  resume: '/resume',
  portfolioPdf: '/portfolio-deck',
  contact: '/contact',
  privacy: '/privacy',
  terms: '/terms',
};

export const FEATURE_SEO_META: Record<FeatureId, FeatureSeoMeta> = {
  overview: {
    title: 'Sabarivasan G — AI & Data Science Portfolio',
    description:
      'Portfolio of Sabarivasan G, a 2nd-year B.Tech Artificial Intelligence & Data Science student at Sri Ramakrishna Institute of Technology, learning Python, C, SQL, MongoDB, MATLAB, and data analysis.',
    path: '/',
  },
  achievements: {
    title: 'Achievements — Sabarivasan G | AI & Data Science',
    description:
      'Achievements and participation of Sabarivasan G: NPTEL IIT Madras Design Thinking Elite (63%), Smart India Hackathon internal round, IIT Bombay Illuminate Bootcamp, and TEDxSRIT.',
    path: '/achievements',
  },
  skills: {
    title: 'Technical Skills — Sabarivasan G | AI & Data Science',
    description:
      'Technical skills of Sabarivasan G covering Python, C, SQL, DBMS, MongoDB, MATLAB, Excel, Data Analysis, AI Fundamentals, and Data Structures & Algorithms.',
    path: '/skills',
  },
  certifications: {
    title: 'Certifications — Sabarivasan G | AI & Data Science',
    description:
      'Explore 7 learning tracks and 25+ completed courses by Sabarivasan G across NPTEL, IBM, MathWorks MATLAB, Python, MySQL, MongoDB, Data Analysis, and Cybersecurity.',
    path: '/certifications',
  },
  education: {
    title: 'Education — Sabarivasan G | B.Tech AI & Data Science',
    description:
      'Academic background of Sabarivasan G: 2nd-year B.Tech Artificial Intelligence & Data Science at SRIT Coimbatore, Higher Secondary (85.5%), SSLC (81%), and academic learning subjects.',
    path: '/education',
  },
  projects: {
    title: 'Projects — Sabarivasan G | AI & Data Science',
    description:
      'Projects section for Sabarivasan G, B.Tech Artificial Intelligence & Data Science student. Upcoming academic and hands-on projects will be published once completed.',
    path: '/projects',
  },
  resume: {
    title: 'Resume — Sabarivasan G | AI & Data Science',
    description:
      'View the single-page resume of Sabarivasan G, 2nd-year B.Tech AI & Data Science student skilled in Python, C, SQL, MongoDB, and MATLAB.',
    path: '/resume',
  },
  portfolioPdf: {
    title: 'Portfolio — Sabarivasan G | AI & Data Science',
    description:
      'Browse the 13-slide portfolio presentation of Sabarivasan G covering education, technical skills, NPTEL Elite certification, technical courses, and participation milestones.',
    path: '/portfolio-deck',
  },
  contact: {
    title: 'Contact — Sabarivasan G | AI & Data Science',
    description:
      'Direct contact details for Sabarivasan G, B.Tech Artificial Intelligence & Data Science student in Coimbatore.',
    path: '/contact',
  },
  privacy: {
    title: 'Privacy Policy — Sabarivasan G | AI & Data Science Portfolio',
    description:
      'Privacy Policy explaining data handling, direct contact channels, cookie consent preferences, and PEARL AI / Groq API chat processing on Sabarivasan G portfolio.',
    path: '/privacy',
  },
  terms: {
    title: 'Terms & Conditions — Sabarivasan G | AI & Data Science Portfolio',
    description:
      'Terms and Conditions governing use of Sabarivasan G portfolio website, downloadable documents, intellectual property, and the PEARL AI conversational assistant.',
    path: '/terms',
  },
  notFound: {
    title: 'Page Not Found (404) — Sabarivasan G Portfolio',
    description:
      'The requested portfolio page could not be found. Return to Sabarivasan G AI & Data Science Portfolio overview or explore sections from the menu.',
    robots: 'noindex, follow',
    path: '/404',
  },
};

const JSONLD_SCRIPT_ID = 'feature-jsonld';

function resolveOrigin(): string {
  const configured = (import.meta.env.VITE_SITE_URL || '').trim().replace(/\/+$/, '');
  if (configured) return configured;
  if (typeof window !== 'undefined') return window.location.origin;
  return '';
}

function resolvePageUrl(activeFeature: FeatureId): string {
  const origin = resolveOrigin();
  const meta = FEATURE_SEO_META[activeFeature] ?? FEATURE_SEO_META.overview;
  if (activeFeature === 'notFound' && typeof window !== 'undefined') {
    return `${origin}${window.location.pathname}`;
  }
  return origin ? `${origin}${meta.path}` : meta.path;
}

function buildPersonAuthor(pageOrigin: string) {
  return {
    '@type': 'Person',
    name: PROFILE.name,
    jobTitle: 'B.Tech Artificial Intelligence & Data Science Student',
    email: `mailto:${PROFILE.email}`,
    sameAs: [PROFILE.linkedinUrl],
    url: pageOrigin || '/',
    affiliation: {
      '@type': 'CollegeOrUniversity',
      name: PROFILE.college,
    },
  };
}

export function buildFeatureJsonLd(
  activeFeature: FeatureId
): Record<string, unknown> {
  const meta = FEATURE_SEO_META[activeFeature] ?? FEATURE_SEO_META.overview;
  const origin = resolveOrigin();
  const pageOrigin = origin ? `${origin}/` : '/';
  const pageUrl = resolvePageUrl(activeFeature);
  const author = buildPersonAuthor(pageOrigin);

  switch (activeFeature) {
    case 'achievements': {
      const achievementItems = INITIAL_PORTFOLIO_ITEMS.filter(
        (item) => item.category === 'Achievements'
      );
      return {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: meta.title,
        description: meta.description,
        url: pageUrl,
        about: author,
        mainEntity: {
          '@type': 'ItemList',
          numberOfItems: achievementItems.length,
          itemListElement: achievementItems.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            item: {
              '@type': 'CreativeWork',
              name: item.title,
              description: item.details,
              creator: author,
              publisher: {
                '@type': 'Organization',
                name: item.organization,
              },
              about: item.specs.focusArea,
              keywords: item.highlights.join(', '),
            },
          })),
        },
      };
    }

    case 'skills': {
      const flatSkills = TECHNICAL_SKILLS.flatMap((group) => group.items);
      return {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: meta.title,
        description: meta.description,
        url: pageUrl,
        mainEntity: {
          '@type': 'Person',
          name: PROFILE.name,
          knowsAbout: flatSkills,
          hasOccupation: {
            '@type': 'Occupation',
            name: 'Artificial Intelligence & Data Science Undergraduate',
            skills: flatSkills.join(', '),
          },
        },
      };
    }

    case 'certifications': {
      return {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: meta.title,
        description: meta.description,
        url: pageUrl,
        about: author,
        mainEntity: {
          '@type': 'ItemList',
          numberOfItems: CERTIFICATION_TRACKS.length,
          itemListElement: CERTIFICATION_TRACKS.map((track, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            item: {
              '@type': 'EducationalOccupationalCredential',
              name: `${track.provider} — ${track.category}`,
              credentialCategory: track.category,
              recognizedBy: {
                '@type': 'Organization',
                name: track.provider,
              },
              about: track.courses,
            },
          })),
        },
      };
    }

    case 'education': {
      return {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: meta.title,
        description: meta.description,
        url: pageUrl,
        mainEntity: {
          '@type': 'EducationalOccupationalCredential',
          name: PROFILE.degree,
          credentialCategory: 'Bachelor of Technology',
          recognizedBy: {
            '@type': 'CollegeOrUniversity',
            name: PROFILE.college,
          },
          teaches: ACADEMIC_SUBJECTS,
          holder: author,
        },
      };
    }

    case 'projects': {
      return {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: meta.title,
        description: meta.description,
        url: pageUrl,
        about: author,
      };
    }

    case 'resume': {
      return {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: meta.title,
        description: meta.description,
        url: pageUrl,
        mainEntity: {
          '@type': 'DigitalDocument',
          name: `${PROFILE.name} — Resume`,
          description: meta.description,
          encodingFormat: 'application/pdf',
          contentUrl: `${origin}${RESUME_PDF_PATH}`,
          author,
        },
      };
    }

    case 'portfolioPdf': {
      return {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: meta.title,
        description: meta.description,
        url: pageUrl,
        mainEntity: {
          '@type': 'DigitalDocument',
          name: `${PROFILE.name} — 13-Page Portfolio`,
          description: meta.description,
          encodingFormat: 'application/pdf',
          numberOfPages: 13,
          contentUrl: `${origin}${PORTFOLIO_PDF_PATH}`,
          author,
        },
      };
    }

    case 'contact': {
      return {
        '@context': 'https://schema.org',
        '@type': 'ContactPage',
        name: meta.title,
        description: meta.description,
        url: pageUrl,
        mainEntity: {
          '@type': 'Person',
          name: PROFILE.name,
          email: `mailto:${PROFILE.email}`,
          sameAs: [PROFILE.linkedinUrl],
          homeLocation: {
            '@type': 'Place',
            name: `${PROFILE.location}, Tamil Nadu, India`,
          },
        },
      };
    }

    case 'privacy':
    case 'terms':
    case 'notFound': {
      return {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: meta.title,
        description: meta.description,
        url: pageUrl,
        author,
      };
    }

    case 'overview':
    default: {
      return {
        '@context': 'https://schema.org',
        '@type': 'ProfilePage',
        name: meta.title,
        description: meta.description,
        url: pageUrl,
        mainEntity: author,
      };
    }
  }
}

function upsertMetaTag(
  attributeName: 'name' | 'property',
  attributeValue: string,
  content: string
): void {
  let meta = document.head.querySelector<HTMLMetaElement>(
    `meta[${attributeName}="${attributeValue}"]`
  );
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(attributeName, attributeValue);
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', content);
}

function upsertCanonicalLink(url: string): void {
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', url);
}

function upsertJsonLdScript(schema: Record<string, unknown>): void {
  let script = document.head.querySelector<HTMLScriptElement>(
    `script#${JSONLD_SCRIPT_ID}[type="application/ld+json"]`
  );
  if (!script) {
    script = document.createElement('script');
    script.id = JSONLD_SCRIPT_ID;
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(schema);
}

export function updateFeatureSeo(activeFeature: FeatureId): void {
  if (typeof document === 'undefined') return;
  const meta = FEATURE_SEO_META[activeFeature] ?? FEATURE_SEO_META.overview;
  const pageUrl = resolvePageUrl(activeFeature);
  const origin = resolveOrigin();
  const ogImageUrl = origin ? `${origin}/assets/og-preview.jpg` : '/assets/og-preview.jpg';

  document.title = meta.title;
  upsertCanonicalLink(pageUrl);
  upsertMetaTag('name', 'description', meta.description);
  upsertMetaTag('name', 'robots', meta.robots ?? 'index, follow');
  upsertMetaTag('property', 'og:title', meta.title);
  upsertMetaTag('property', 'og:description', meta.description);
  upsertMetaTag('property', 'og:url', pageUrl);
  upsertMetaTag('property', 'og:image', ogImageUrl);
  upsertMetaTag('name', 'twitter:title', meta.title);
  upsertMetaTag('name', 'twitter:description', meta.description);
  upsertMetaTag('name', 'twitter:image', ogImageUrl);
  upsertJsonLdScript(buildFeatureJsonLd(activeFeature));
}
