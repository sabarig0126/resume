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
  aboutLead:
    'I am Sabarivasan G, a second-year B.Tech student in Artificial Intelligence and Data Science at Sri Ramakrishna Institute of Technology. I am passionate about programming, data and innovation, continuously building my skills through certified courses, hands-on practice and new technologies.',
  careerObjective:
    'To build a successful career in technology by applying my knowledge of programming, data analysis and mathematics to Artificial Intelligence and Data Science. I aim to grow into a skilled professional through continuous learning, dedication and hands-on practice.',
  learningGoal:
    'To strengthen my theoretical foundation and turn it into practical technical skills through continuous, hands-on learning.',
};

export const PROOF_METRICS: ProofMetric[] = [
  {
    value: '25+',
    label: 'Certified Courses',
    context: 'Completed across MathWorks, IBM, NPTEL, Python & SQL',
  },
  {
    value: '85.5%',
    label: 'Higher Secondary',
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
    summary:
      'Earned the NPTEL Elite certificate in Design Thinking – A Primer with a verified score of 63%.',
    details:
      'Completed structured coursework and proctored evaluation from IIT Madras focused on human-centered problem framing, iterative ideation, prototyping, and translating user insights into practical technical solutions.',
    highlights: [
      'Elite Certification Tier (63% Score)',
      'Human-Centered Problem Framing',
      'Iterative Prototyping Methodology',
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
    summary:
      'Participated in the college-level internal selection round for the Smart India Hackathon.',
    details:
      'Collaborated on rapid problem analysis, technical feasibility scoping, and solution presentation for national-level hackathon problem statements during the institutional Smart India Hackathon screening.',
    highlights: [
      'Team Problem Framing & Pitching',
      'Technical Feasibility Scoping',
      'National Hackathon Qualifier Round',
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
    summary:
      'Took part in the Illuminate Entrepreneurship Bootcamp organized by IIT Bombay.',
    details:
      'Engaged in structured entrepreneurship workshops covering opportunity discovery, value proposition design, early-stage validation, and technology-driven product thinking.',
    highlights: [
      'Technology Venture Ideation',
      'Value Proposition & Validation',
      'Collaborative Workshop Execution',
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
    summary:
      'Participated in TEDxSRIT centered on the theme “Human in the Loop”.',
    details:
      'Explored perspectives at the intersection of artificial intelligence, ethical decision-making, and human oversight in modern autonomous and data-driven systems.',
    highlights: [
      'Theme: Human in the Loop',
      'AI & Human-Centered Systems',
      'Campus Knowledge Exchange',
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
      'Completed eight MathWorks courses spanning MATLAB Onramp, Symbolic Math, Coder, Linear Algebra, and Statistics.',
    details:
      'Built hands-on fluency in matrix operations, vector calculations, symbolic computation, custom function authoring, statistical workflows, and data analysis inside the MATLAB environment.',
    highlights: [
      'MATLAB, Symbolic Math & Coder Onramps',
      'Linear Algebra & Matrix Calculations',
      'Statistics & Data Analysis Modules',
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
      'Completed seven foundational courses covering Python for Data Science & ML, Linear Algebra, Probability, and Statistical Inference.',
    details:
      'Strengthened applied Python programming skills alongside probability distributions, statistical inference, and linear algebra foundations required for machine learning pipelines.',
    highlights: [
      'Python for Data Science & ML Bootcamp',
      'Linear Algebra & Probability Distributions',
      'Statistical Inference using Python',
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
      'Certified in Clean Coding and DevOps, Agile & Design Thinking under the IBM Career Education Program.',
    details:
      'Developed disciplined software craftsmanship habits including readable code structure, modular engineering practices, Agile iteration cycles, and DevOps collaboration workflows.',
    highlights: [
      'Clean Coding Principles',
      'DevOps & Agile Workflows',
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
    organization: 'Database, Systems & Tech Mahindra Foundation',
    timeframe: '6 Modules',
    location: 'Skill India Digital Hub',
    summary:
      'Hands-on coursework in MySQL projects, MongoDB, Unix/Linux fundamentals, Ethical AI, Excel VBA, and Cybersecurity (10 hrs).',
    details:
      'Combined relational (MySQL) and document (MongoDB) database fundamentals with Unix/Linux command-line operations, Ethical AI awareness, and a 10-hour Cybersecurity certification via Tech Mahindra Foundation.',
    highlights: [
      'Project on MySQL & MongoDB Courses',
      'Unix / Linux OS Fundamentals & Ethical AI',
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
      'Core undergraduate coursework in Data Structures, DBMS, Linear Algebra, Probability, and AI Fundamentals.',
    details:
      'Pursuing the 4-year B.Tech degree in Artificial Intelligence & Data Science (currently 2nd Year), turning theoretical mathematical and algorithmic coursework into practical code and analytical exercises.',
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
    category: 'Technical Tools',
    items: ['MATLAB', 'Microsoft Excel'],
  },
  {
    category: 'Technical Knowledge',
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
    category: 'Software & Engineering',
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
    category: 'AI, ML & Statistics',
    courses: [
      'Python for Data Science and Machine Learning Bootcamp',
      'Introduction to Data Science',
      'Data Science Foundation',
      'Basics of Linear Algebra using Python',
      'Probability and Statistics using Python',
      'Statistical Inference using Python',
      'Probability Distribution using Python',
    ],
  },
  {
    number: '05.',
    provider: 'Database & Programming',
    category: 'Systems & Data',
    courses: [
      'Project on MySQL',
      'MongoDB Courses',
      'Unix Linux OS – Unix Fundamentals',
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
  'Communication Skills',
  'Problem-Solving Skills',
  'Teamwork and Collaboration',
  'Time Management',
  'Critical Thinking',
  'Adaptability',
  'Quick Learning',
  'Self-Motivation',
];

export const STRENGTHS = [
  'Self-Motivated',
  'Hardworking',
  'Quick Learner',
  'Positive Attitude',
  'Adaptability',
  'Willingness to Learn',
];

export const HOBBIES = [
  'Exploring New Technologies',
  'Learning Programming',
  'Listening to Music',
  'Improving Technical Knowledge',
  'Exploring New Ideas',
];
