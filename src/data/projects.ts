import {
  CertificationTrack,
  PortfolioItem,
  ProofMetric,
} from '../types/portfolio';

export const RESUME_PDF_PATH =
  '/assets/aistudio/Sabarivasan_G_Resume_Creative__1_-1_e4404cec.pdf';
export const PORTFOLIO_PDF_PATH = '/assets/aistudio/my_resume_86a39148.pdf';

export const PROFILE = {
  name: 'Sabarivasan G',
  department: 'Department of Artificial Intelligence & Data Science',
  degree: 'B.Tech in Artificial Intelligence & Data Science',
  yearLabel: '2nd Year Student',
  academicYear: '2026–2027',
  college: 'Sri Ramakrishna Institute of Technology',
  location: 'Coimbatore',
  email: 'gsabarivasan007@gmail.com',
  mobile: '9688283942',
  linkedinUrl: 'https://www.linkedin.com/in/sabarivasan-g-774ba6375',
  aboutLead:
    'Second-year B.Tech Artificial Intelligence & Data Science undergraduate at Sri Ramakrishna Institute of Technology, focused on software engineering, statistical modeling, and data-driven problem solving, with strong technical depth in Python and C programming, relational and NoSQL databases, and mathematical computing in MATLAB, supported by 25+ industry-recognized certifications.',
  careerObjective:
    'Aspiring AI and Data Science engineer seeking opportunities to apply strong foundations in algorithms, data analysis, statistical inference, and mathematical modeling to real-world engineering challenges, while advancing practical production skills through collaborative builds, hackathons, and technical internships.',
  learningGoal:
    'Translating core academic foundations in algorithms, probability, linear algebra, and database systems into structured, applied engineering workflows.',
};

export const PROOF_METRICS: ProofMetric[] = [
  {
    value: '25+',
    label: 'Certified Modules',
    context: 'Completed across MathWorks, IBM, NPTEL, Python, SQL & Data Science',
  },
  {
    value: '85.5%',
    label: 'Higher Secondary (HSC)',
    context: 'Thanappa Gounder Matric Higher Secondary School, Dharmapuri',
  },
  {
    value: '63%',
    label: 'NPTEL Elite Score',
    context: 'Design Thinking – A Primer, IIT Madras',
  },
  {
    value: '81%',
    label: 'SSLC Qualification',
    context: 'Thanappa Gounder Matric Higher Secondary School, Dharmapuri',
  },
];

export const INITIAL_PORTFOLIO_ITEMS: PortfolioItem[] = [
  {
    id: 'nptel-design-thinking',
    indexNumber: '01',
    title: 'Design Thinking – A Primer (Elite)',
    category: 'Achievements',
    organization: 'NPTEL – IIT Madras',
    timeframe: 'Elite · 63%',
    location: 'IIT Madras (Online)',
    imageUrl: '/assets/achievements/nptel-design-thinking.svg',
    imageAlt: 'NPTEL IIT Madras Design Thinking Elite certification visual emblem and iterative process diagram',
    summary:
      'Earned the NPTEL Elite Certification in Design Thinking – A Primer (IIT Madras) with a proctored evaluation score of 63%.',
    details:
      'Completed structured coursework and a proctored national assessment under IIT Madras, covering human-centered problem framing, iterative ideation, rapid prototyping, and the translation of user insights into practical, engineering-ready solutions.',
    highlights: [
      'NPTEL Elite Certification Tier (63% Proctored Score)',
      'Human-Centered Problem Framing & Ideation',
      'Iterative Prototyping & Solution Validation',
    ],
    featured: true,
    specs: {
      issuerOrContext: 'NPTEL – IIT Madras',
      focusArea: 'Design Thinking & Innovation',
      credentialOrOutcome: 'Elite Certificate (63%)',
      location: 'Coimbatore / Online',
    },
  },
  {
    id: 'smart-india-hackathon',
    indexNumber: '02',
    title: 'Smart India Hackathon (SIH) Internal Round',
    category: 'Achievements',
    organization: 'Sri Ramakrishna Institute of Technology',
    timeframe: '2026',
    location: 'Coimbatore',
    imageUrl: '/assets/achievements/sih-hackathon-srit.svg',
    imageAlt: 'Smart India Hackathon 2026 SRIT internal qualifier circuit emblem and solution workflow schematic',
    summary:
      'Competed in the institution’s internal selection round for the Smart India Hackathon (SIH), scoping technical solutions for national problem statements.',
    details:
      'Collaborated in a multidisciplinary team to deconstruct national-level hackathon problem statements, assess technical feasibility, structure solution architectures, and deliver technical pitches during the institutional SIH screening round.',
    highlights: [
      'Collaborative Problem Framing & Technical Pitching',
      'Technical Feasibility Scoping & Workflow Design',
      'Institutional National Hackathon Qualifier Round',
    ],
    specs: {
      issuerOrContext: 'Smart India Hackathon (SIH)',
      focusArea: 'Applied Problem Solving',
      credentialOrOutcome: 'College Internal Round Participant',
      location: 'Coimbatore',
    },
  },
  {
    id: 'illuminate-iit-bombay',
    indexNumber: '03',
    title: 'Illuminate Entrepreneurship Bootcamp',
    category: 'Achievements',
    organization: 'IIT Bombay',
    timeframe: 'Bootcamp',
    location: 'IIT Bombay',
    imageUrl: '/assets/achievements/illuminate-iit-bombay.svg',
    imageAlt: 'IIT Bombay Illuminate Entrepreneurship Bootcamp beacon prism and venture growth trajectory graphic',
    summary:
      'Completed the Illuminate Entrepreneurship Bootcamp organized by IIT Bombay, focused on technology venture ideation and product validation.',
    details:
      'Engaged in structured entrepreneurship and product strategy workshops through IIT Bombay’s Illuminate initiative, covering market opportunity discovery, value proposition design, early-stage validation, and technology-driven product thinking.',
    highlights: [
      'Technology Venture Ideation & Opportunity Discovery',
      'Value Proposition & Product-Validation Frameworks',
      'Team-Based Workshop Execution',
    ],
    specs: {
      issuerOrContext: 'IIT Bombay (Illuminate)',
      focusArea: 'Entrepreneurship & Product Strategy',
      credentialOrOutcome: 'Bootcamp Participant',
      location: 'Mumbai / Campus',
    },
  },
  {
    id: 'tedxsrit-human-in-the-loop',
    indexNumber: '04',
    title: 'TEDxSRIT — Human in the Loop',
    category: 'Achievements',
    organization: 'Sri Ramakrishna Institute of Technology',
    timeframe: 'Event',
    location: 'Coimbatore',
    imageUrl: '/assets/achievements/tedxsrit-human-in-the-loop.svg',
    imageAlt: 'TEDxSRIT Human in the Loop AI ethics and human oversight orbital diagram',
    summary:
      'Participated in TEDxSRIT, centered on “Human in the Loop,” examining ethical governance and human-centered oversight in AI systems.',
    details:
      'Explored cross-disciplinary perspectives at the intersection of artificial intelligence, responsible decision-making, and human-in-the-loop supervision across modern autonomous and data-driven architectures.',
    highlights: [
      'Theme: Human in the Loop',
      'Responsible AI & Human-Centered Oversight',
      'Interdisciplinary Technical Exchange',
    ],
    specs: {
      issuerOrContext: 'TEDxSRIT',
      focusArea: 'AI Ethics & Human Oversight',
      credentialOrOutcome: 'Active Participant',
      location: 'Coimbatore',
    },
  },
  {
    id: 'mathworks-matlab-track',
    indexNumber: '05',
    title: 'MATLAB & Mathematical Computing Track',
    category: 'Certifications',
    organization: 'MathWorks',
    timeframe: '8 Modules',
    location: 'Online Certification',
    summary:
      'Completed eight MathWorks modules spanning MATLAB Onramp, Symbolic Math, MATLAB Coder, Linear Algebra, and Statistical Analysis.',
    details:
      'Developed hands-on fluency in matrix and vector computation, symbolic math workflows, modular function authoring, statistical analysis, and algorithmic prototyping within the MATLAB environment.',
    highlights: [
      'MATLAB, Symbolic Math & Coder Onramps',
      'Linear Algebra & Vector/Matrix Computation',
      'Statistics & Applied Data Analysis Modules',
    ],
    specs: {
      issuerOrContext: 'MathWorks',
      focusArea: 'Scientific & Mathematical Computing',
      credentialOrOutcome: '8 Completed Courses',
      location: 'Online',
    },
  },
  {
    id: 'python-data-science-track',
    indexNumber: '06',
    title: 'Python, Machine Learning & Statistics Track',
    category: 'Certifications',
    organization: 'Data Science & Python Curriculum',
    timeframe: '7 Modules',
    location: 'Online Certification',
    summary:
      'Completed seven foundational courses covering Python for Data Science & Machine Learning, Linear Algebra, Probability, and Statistical Inference.',
    details:
      'Strengthened applied Python programming alongside probability distributions, statistical inference, and linear algebra fundamentals that underpin machine learning and analytical pipelines.',
    highlights: [
      'Python for Data Science & ML Bootcamp',
      'Linear Algebra & Probability Distributions',
      'Statistical Inference Using Python',
    ],
    specs: {
      issuerOrContext: 'Python & Data Science Track',
      focusArea: 'Data Science & Statistical Modeling',
      credentialOrOutcome: '7 Completed Courses',
      location: 'Online',
    },
  },
  {
    id: 'ibm-clean-coding-devops',
    indexNumber: '07',
    title: 'Clean Coding, DevOps & Agile Practice',
    category: 'Certifications',
    organization: 'IBM Career Education Program',
    timeframe: '2 Modules',
    location: 'Online Certification',
    summary:
      'Certified in “Clean Coding” and “DevOps, Agile & Design Thinking” through the IBM Career Education Program.',
    details:
      'Built disciplined software engineering practices centered on maintainable code architecture, modular design principles, Agile iteration cycles, and collaborative DevOps delivery workflows.',
    highlights: [
      'Clean Coding & Maintainable Architecture',
      'DevOps & Agile Delivery Workflows',
      'Design Thinking Integration',
    ],
    specs: {
      issuerOrContext: 'IBM Career Education Program',
      focusArea: 'Software Engineering Practices',
      credentialOrOutcome: '2 Verified Modules',
      location: 'Online',
    },
  },
  {
    id: 'databases-linux-cyber',
    indexNumber: '08',
    title: 'MySQL, MongoDB, Unix/Linux & Cybersecurity',
    category: 'Certifications',
    organization: 'Databases, Systems & Tech Mahindra Foundation',
    timeframe: '6 Modules',
    location: 'Skill India Digital Hub',
    summary:
      'Completed hands-on coursework spanning MySQL, MongoDB, Unix/Linux fundamentals, Ethical AI, Excel VBA, and a 10-hour Cybersecurity certification.',
    details:
      'Combined relational (MySQL) and document-oriented (MongoDB) database modeling with Unix/Linux shell fundamentals, Ethical AI principles, Excel automation, and a 10-hour Cybersecurity credential through Tech Mahindra Foundation.',
    highlights: [
      'Applied MySQL & MongoDB Database Coursework',
      'Unix/Linux OS Fundamentals & Ethical AI',
      'Cybersecurity — Tech Mahindra Foundation (10 Hours)',
    ],
    specs: {
      issuerOrContext: 'IBM / Tech Mahindra / Database Track',
      focusArea: 'Databases, OS & Security',
      credentialOrOutcome: '6 Completed Modules',
      location: 'Skill India Digital Hub',
    },
  },
  {
    id: 'btech-ai-ds-curriculum',
    indexNumber: '09',
    title: 'Core AI & Data Science Academic Foundation',
    category: 'Academic',
    organization: 'Sri Ramakrishna Institute of Technology',
    timeframe: '2025–2027',
    location: 'Coimbatore',
    summary:
      'Includes core undergraduate engineering coursework in Data Structures, DBMS, Linear Algebra, Probability, and Artificial Intelligence Fundamentals.',
    details:
      'Pursuing a four-year B.Tech degree in Artificial Intelligence & Data Science (2nd Year), bridging mathematical and algorithmic theory with practical programming and analytical problem solving.',
    highlights: [
      'Data Structures & Algorithms / DBMS',
      'Linear Algebra, Probability & Statistics',
      'Python for Scientific Computing & AI',
    ],
    specs: {
      issuerOrContext: 'Sri Ramakrishna Institute of Technology',
      focusArea: 'B.Tech AI & Data Science',
      credentialOrOutcome: '2nd Year (2026–2027)',
      location: 'Coimbatore',
    },
  },
];

export const TECHNICAL_SKILLS = [
  {
    category: 'Programming Languages',
    items: ['Python Programming', 'C Programming'],
  },
  {
    category: 'Database Technologies',
    items: ['SQL', 'DBMS', 'MongoDB'],
  },
  {
    category: 'Analytical & Computing Tools',
    items: ['MATLAB', 'Microsoft Excel'],
  },
  {
    category: 'Core Technical Foundations',
    items: [
      'Data Analysis',
      'AI Fundamentals',
      'Data Structures and Algorithms',
      'Mathematical Computing',
    ],
  },
];

export const AREAS_OF_INTEREST = [
  { number: '01', label: 'Artificial Intelligence' },
  { number: '02', label: 'Machine Learning' },
  { number: '03', label: 'Data Science' },
  { number: '04', label: 'Python Programming' },
  { number: '05', label: 'Data Analytics' },
  { number: '06', label: 'Database Management' },
  { number: '07', label: 'Mathematical Computing' },
  { number: '08', label: 'Emerging Technologies' },
];

export const ACADEMIC_SUBJECTS = [
  'Programming Fundamentals',
  'Database Management Systems',
  'Data Structures and Algorithms',
  'Linear Algebra',
  'Probability and Statistics',
  'Python for Scientific Computing',
  'Fundamentals of Artificial Intelligence',
  'Data Analysis Techniques',
];

export const CERTIFICATION_TRACKS: CertificationTrack[] = [
  {
    number: '01.',
    provider: 'NPTEL – IIT Madras',
    category: 'National Certification',
    courses: ['Design Thinking – A Primer (Elite, 63%)'],
  },
  {
    number: '02.',
    provider: 'IBM Career Education Program',
    category: 'Software & Engineering Practices',
    courses: ['Clean Coding', 'DevOps, Agile & Design Thinking'],
  },
  {
    number: '03.',
    provider: 'MATLAB – MathWorks',
    category: 'Mathematical Computing',
    courses: [
      'MATLAB Onramp',
      'Symbolic Math Onramp',
      'MATLAB Coder Onramp',
      'The How and Why of Writing Functions',
      'Introduction to Linear Algebra with MATLAB',
      'Calculations with Vectors and Matrices',
      'Statistics Onramp',
      'Data Analysis Courses',
    ],
  },
  {
    number: '04.',
    provider: 'Python & Data Science',
    category: 'AI, ML & Statistical Modeling',
    courses: [
      'Python for Data Science and Machine Learning Bootcamp',
      'Introduction to Data Science',
      'Data Science Foundation',
      'Basics of Linear Algebra Using Python',
      'Probability and Statistics Using Python',
      'Statistical Inference Using Python',
      'Probability Distribution Using Python',
    ],
  },
  {
    number: '05.',
    provider: 'Database & Systems',
    category: 'Data Management & OS',
    courses: [
      'Project on MySQL',
      'MongoDB Courses',
      'Unix/Linux OS – Unix Fundamentals',
      'Ethical AI',
      'Excel Macros & VBA for Beginners',
    ],
  },
  {
    number: '06.',
    provider: 'Data Analysis',
    category: 'Analytical Workflows',
    courses: [
      'Common Data Analysis Techniques',
      'Calculations on Grouped Data',
      'Find and Extract Subsets of Data',
      'Clean and Prepare Data for Analysis',
      'Tables',
    ],
  },
  {
    number: '07.',
    provider: 'Cybersecurity',
    category: 'Security Foundations',
    courses: ['Tech Mahindra Foundation (Skill India Digital Hub, 10 Hours)'],
  },
];

export const SOFT_SKILLS = [
  'Technical Communication',
  'Analytical Problem Solving',
  'Team Collaboration',
  'Time Management',
  'Critical Thinking',
  'Technical Adaptability',
  'Rapid Skill Acquisition',
  'Self-Directed Execution',
];

export const STRENGTHS = [
  'Self-Motivated & Proactive',
  'Consistent Work Ethic',
  'Fast Technical Learner',
  'Solution-Oriented Mindset',
  'Cross-Tool Adaptability',
  'Continuous Improvement Focus',
];

export const HOBBIES = [
  'Exploring Emerging Technologies',
  'Practicing Programming & Problem Solving',
  'Listening to Music',
  'Advancing Core Technical Knowledge',
  'Researching Innovative Technical Ideas',
];
