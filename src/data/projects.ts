import {
  CertificationTrack,
  PortfolioItem,
  ProofMetric,
} from '../types/portfolio';

export const RESUME_PDF_PATH = '/assets/aistudio/sabarivasan_resume.pdf';
export const PORTFOLIO_PDF_PATH = '/assets/aistudio/sabarivasan_portfolio.pdf';

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
    'Second-year B.Tech Artificial Intelligence and Data Science student at Sri Ramakrishna Institute of Technology, passionate about programming, data analysis, and emerging technologies, building skills through certified courses and hands-on practice.',
  careerObjective:
    'To build a successful career in technology by applying my knowledge of programming, data analysis, and mathematics to Artificial Intelligence and Data Science, growing through continuous learning, dedication, and hands-on practice.',
  learningGoal:
    'To strengthen my theoretical foundation and turn it into practical technical skills through continuous, hands-on learning.',
};

export const PROOF_METRICS: ProofMetric[] = [
  {
    value: '25+',
    label: 'Completed Courses',
    context:
      'Completed across NPTEL, IBM, MathWorks, Python, Databases, Data Analysis & Cybersecurity',
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
    imageAlt: 'NPTEL IIT Madras Design Thinking Elite certificate emblem',
    summary:
      'Earned the NPTEL Elite certificate in Design Thinking – A Primer offered by IIT Madras with a score of 63%.',
    details:
      'Earned the NPTEL Elite certification for Design Thinking – A Primer through IIT Madras, scoring 63%.',
    highlights: [
      'NPTEL Elite Certification',
      'Course: Design Thinking – A Primer (IIT Madras)',
      'Score: 63%',
    ],
    featured: true,
    specs: {
      issuerOrContext: 'NPTEL – IIT Madras',
      focusArea: 'Design Thinking',
      credentialOrOutcome: 'Elite Certificate (63%)',
      location: 'Online (IIT Madras)',
    },
  },
  {
    id: 'smart-india-hackathon',
    indexNumber: '02',
    title: 'Smart India Hackathon (SIH) Internal Round',
    category: 'Achievements',
    organization: 'Sri Ramakrishna Institute of Technology',
    timeframe: 'College Level',
    location: 'Coimbatore',
    imageUrl: '/assets/achievements/sih-hackathon-srit.svg',
    imageAlt: 'Smart India Hackathon internal round participation visual emblem',
    summary:
      'Participated in the internal round of the Smart India Hackathon (SIH) at Sri Ramakrishna Institute of Technology.',
    details:
      'Participated in the college-level internal round of the Smart India Hackathon at Sri Ramakrishna Institute of Technology.',
    highlights: [
      'Event: Smart India Hackathon (SIH)',
      'Level: Internal Round (College Level)',
      'Institution: Sri Ramakrishna Institute of Technology',
    ],
    specs: {
      issuerOrContext: 'Smart India Hackathon (SIH)',
      focusArea: 'Hackathon Participation',
      credentialOrOutcome: 'Internal Round Participant',
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
    imageAlt: 'Illuminate Entrepreneurship Bootcamp IIT Bombay visual emblem',
    summary:
      'Took part in the Illuminate Entrepreneurship Bootcamp at IIT Bombay.',
    details:
      'Participated in the Illuminate Entrepreneurship Bootcamp organized under IIT Bombay.',
    highlights: [
      'Program: Illuminate Entrepreneurship Bootcamp',
      'Institution: IIT Bombay',
      'Role: Bootcamp Participant',
    ],
    specs: {
      issuerOrContext: 'IIT Bombay (Illuminate)',
      focusArea: 'Entrepreneurship Bootcamp',
      credentialOrOutcome: 'Participant',
      location: 'IIT Bombay',
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
    imageAlt: 'TEDxSRIT Human in the Loop participation visual emblem',
    summary:
      'Participated in TEDxSRIT on the theme “Human in the Loop”.',
    details:
      'Participated in the TEDxSRIT event centered on the theme “Human in the Loop” at Sri Ramakrishna Institute of Technology.',
    highlights: [
      'Event: TEDxSRIT',
      'Theme: Human in the Loop',
      'Role: Participant',
    ],
    specs: {
      issuerOrContext: 'TEDxSRIT',
      focusArea: 'Conference / Event Participation',
      credentialOrOutcome: 'Participant',
      location: 'Coimbatore',
    },
  },
  {
    id: 'mathworks-matlab-track',
    indexNumber: '05',
    title: 'MATLAB – MathWorks Track',
    category: 'Certifications',
    organization: 'MathWorks',
    timeframe: '8 Courses',
    location: 'Online Certification',
    summary:
      'Completed eight MathWorks courses covering MATLAB Onramp, Symbolic Math, MATLAB Coder, writing functions, linear algebra, vectors and matrices, statistics, and data analysis.',
    details:
      'Completed MATLAB Onramp, Symbolic Math Onramp, MATLAB Coder Onramp, The How and Why of Writing Functions, Introduction to Linear Algebra with MATLAB, Calculations with Vectors and Matrices, Statistics Onramp, and Data Analysis Courses.',
    highlights: [
      'MATLAB, Symbolic Math & MATLAB Coder Onramp',
      'Linear Algebra & Calculations with Vectors and Matrices',
      'Writing Functions, Statistics Onramp & Data Analysis Courses',
    ],
    specs: {
      issuerOrContext: 'MathWorks',
      focusArea: 'MATLAB & Mathematical Computing',
      credentialOrOutcome: '8 Completed Courses',
      location: 'Online',
    },
  },
  {
    id: 'python-data-science-track',
    indexNumber: '06',
    title: 'Python & Data Science Track',
    category: 'Certifications',
    organization: 'Python & Data Science Courses',
    timeframe: '7 Courses',
    location: 'Online Certification',
    summary:
      'Completed seven courses covering Python for Data Science and Machine Learning Bootcamp, Introduction to Data Science, Data Science Foundation, Linear Algebra, Probability, and Statistical Inference using Python.',
    details:
      'Completed Python for Data Science and Machine Learning Bootcamp, Introduction to Data Science, Data Science Foundation, Basics of Linear Algebra using Python, Probability and Statistics using Python, Statistical Inference using Python, and Probability Distribution using Python.',
    highlights: [
      'Python for Data Science and Machine Learning Bootcamp',
      'Introduction to Data Science & Data Science Foundation',
      'Linear Algebra, Probability & Statistical Inference using Python',
    ],
    specs: {
      issuerOrContext: 'Python & Data Science Track',
      focusArea: 'Python & Data Science',
      credentialOrOutcome: '7 Completed Courses',
      location: 'Online',
    },
  },
  {
    id: 'ibm-clean-coding-devops',
    indexNumber: '07',
    title: 'IBM Career Education Program',
    category: 'Certifications',
    organization: 'IBM Career Education Program',
    timeframe: '2 Courses',
    location: 'Online Certification',
    summary:
      'Completed Clean Coding and DevOps, Agile & Design Thinking under the IBM Career Education Program.',
    details:
      'Completed Clean Coding as well as DevOps, Agile & Design Thinking through the IBM Career Education Program.',
    highlights: [
      'Clean Coding',
      'DevOps, Agile & Design Thinking',
    ],
    specs: {
      issuerOrContext: 'IBM Career Education Program',
      focusArea: 'Software Practices & Design Thinking',
      credentialOrOutcome: '2 Completed Courses',
      location: 'Online',
    },
  },
  {
    id: 'databases-linux-cyber',
    indexNumber: '08',
    title: 'Database, Programming & Cybersecurity Courses',
    category: 'Certifications',
    organization: 'Database, Systems & Tech Mahindra Foundation',
    timeframe: '6 Courses',
    location: 'Online / Skill India Digital Hub',
    summary:
      'Completed coursework covering Project on MySQL, MongoDB Courses, Unix Linux OS – Unix Fundamentals, Ethical AI, Excel Macros & VBA for Beginners, and Cybersecurity (Tech Mahindra Foundation, 10 Hours).',
    details:
      'Completed structured learning modules covering Project on MySQL, MongoDB Courses, Unix Linux OS – Unix Fundamentals, Ethical AI, Excel Macros & VBA for Beginners, and the 10-hour Cybersecurity course from Tech Mahindra Foundation on Skill India Digital Hub.',
    highlights: [
      'Project on MySQL & MongoDB Courses',
      'Unix Linux OS Fundamentals, Ethical AI & Excel Macros/VBA',
      'Cybersecurity — Tech Mahindra Foundation (10 Hours)',
    ],
    specs: {
      issuerOrContext: 'Databases, Systems & Tech Mahindra Foundation',
      focusArea: 'Databases, OS, AI Ethics & Cybersecurity',
      credentialOrOutcome: '6 Completed Courses',
      location: 'Online / Skill India Digital Hub',
    },
  },
  {
    id: 'btech-ai-ds-curriculum',
    indexNumber: '09',
    title: 'B.Tech AI & Data Science Academic Learning',
    category: 'Academic',
    organization: 'Sri Ramakrishna Institute of Technology',
    timeframe: '2nd Year · 2026–2027',
    location: 'Coimbatore',
    summary:
      'Academic coursework spanning Programming Fundamentals, Database Management Systems, Data Structures and Algorithms, Linear Algebra, Probability and Statistics, Python for Scientific Computing, Fundamentals of AI, and Data Analysis Techniques.',
    details:
      'Pursuing a B.Tech degree in Artificial Intelligence & Data Science (2nd Year) at Sri Ramakrishna Institute of Technology, focused on strengthening theoretical foundations and turning them into practical technical skills through continuous, hands-on learning.',
    highlights: [
      'Programming Fundamentals, DBMS & Data Structures and Algorithms',
      'Linear Algebra & Probability and Statistics',
      'Python for Scientific Computing, AI Fundamentals & Data Analysis Techniques',
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
    category: 'Software & Design Practices',
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
    category: 'Python, Math & Statistics',
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
    category: 'Databases, OS & Tools',
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
    category: 'Data Preparation & Analysis',
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
