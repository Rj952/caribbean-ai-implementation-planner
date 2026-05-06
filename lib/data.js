// ============================================================================
// CARIBBEAN AI IMPLEMENTATION PLANNER — REFERENCE DATA
// Source: Caribbean AI Deployment Blueprint (Jowallah, 2026)
// ============================================================================

// ---------------------------------------------------------------------------
// Caribbean / CARICOM countries with reasonable defaults.
// Every field stays editable in the UI; defaults only pre-populate.
// ---------------------------------------------------------------------------
export const COUNTRIES = {
  Jamaica: {
    population: '2.8 million',
    institutions:
      'University of the West Indies (Mona); University of Technology, Jamaica; Northern Caribbean University; University College of the Caribbean',
    existing: 'National AI Task Force (2025); Jamaica Learning Assistant initiative',
    languages: 'English; Jamaican Patois',
    constitutional:
      'Constitution of Jamaica (1962); Charter of Fundamental Rights and Freedoms (2011)'
  },
  'Trinidad and Tobago': {
    population: '1.4 million',
    institutions:
      'University of the West Indies (St Augustine); University of Trinidad and Tobago; COSTAATT',
    existing: 'Government digital transformation programmes',
    languages: 'English; Trinidadian Creole; Tobagonian Creole',
    constitutional: 'Constitution of the Republic of Trinidad and Tobago (1976)'
  },
  Barbados: {
    population: '282,000',
    institutions: 'University of the West Indies (Cave Hill)',
    existing: 'Bridgetown Initiative leadership; Government digital strategy',
    languages: 'English; Bajan Creole',
    constitutional: 'Constitution of Barbados (1966); Republic Act (2021)'
  },
  Guyana: {
    population: '800,000',
    institutions: 'University of Guyana',
    existing: 'Guyana Digital School; Spark programmes',
    languages: 'English; Guyanese Creole; Indigenous languages',
    constitutional: 'Constitution of the Co-operative Republic of Guyana (1980)'
  },
  'The Bahamas': {
    population: '412,000',
    institutions: 'University of The Bahamas',
    existing: 'National Digital Strategy',
    languages: 'English; Bahamian Creole',
    constitutional: 'Constitution of The Bahamas (1973)'
  },
  Haiti: {
    population: '11.7 million',
    institutions: 'State University of Haiti (UEH); Quisqueya University',
    existing: '',
    languages: 'French; Haitian Kreyòl',
    constitutional: 'Constitution of the Republic of Haiti (1987, amended)'
  },
  Suriname: {
    population: '617,000',
    institutions: 'Anton de Kom University of Suriname',
    existing: '',
    languages: 'Dutch; Sranan Tongo; Indigenous and Maroon languages',
    constitutional: 'Constitution of the Republic of Suriname (1987)'
  },
  Curaçao: {
    population: '155,000',
    institutions: 'University of Curaçao Dr. Moises da Costa Gomez',
    existing: 'UNESCO AI Readiness Assessment',
    languages: 'Dutch; Papiamento; English',
    constitutional: 'Constitution of Curaçao (2010)'
  },
  'Sint Maarten': {
    population: '44,000',
    institutions: 'University of St. Martin',
    existing: 'National AI in Education Policy',
    languages: 'Dutch; English; Papiamento',
    constitutional: 'Constitution of Sint Maarten (2010)'
  },
  'Dominican Republic': {
    population: '11 million',
    institutions:
      'Universidad Autónoma de Santo Domingo; INTEC; Pontificia Universidad Católica Madre y Maestra',
    existing: 'MESCyT AI English pilot',
    languages: 'Spanish',
    constitutional: 'Constitution of the Dominican Republic (2015)'
  },
  'Antigua and Barbuda': {
    population: '93,000',
    institutions: 'University of the West Indies (Five Islands)',
    existing: '',
    languages: 'English; Antiguan Creole',
    constitutional: 'Constitution of Antigua and Barbuda (1981)'
  },
  Belize: {
    population: '410,000',
    institutions: 'University of Belize; Galen University',
    existing: '',
    languages: 'English; Belizean Kriol; Spanish; Mayan languages; Garifuna',
    constitutional: 'Constitution of Belize (1981)'
  },
  Dominica: {
    population: '73,000',
    institutions: 'UWI Open Campus',
    existing: '',
    languages: 'English; Kwéyòl',
    constitutional: 'Constitution of the Commonwealth of Dominica (1978)'
  },
  Grenada: {
    population: '125,000',
    institutions: 'St George’s University; T.A. Marryshow Community College',
    existing: '',
    languages: 'English; Grenadian Creole',
    constitutional: 'Constitution of Grenada (1973)'
  },
  'Saint Kitts and Nevis': {
    population: '53,000',
    institutions: 'UWI Open Campus; Clarence Fitzroy Bryant College',
    existing: '',
    languages: 'English; Saint Kitts Creole',
    constitutional: 'Constitution of Saint Christopher and Nevis (1983)'
  },
  'Saint Lucia': {
    population: '180,000',
    institutions: 'UWI Open Campus; Sir Arthur Lewis Community College',
    existing: '',
    languages: 'English; Saint Lucian Kwéyòl',
    constitutional: 'Constitution of Saint Lucia (1978)'
  },
  'Saint Vincent and the Grenadines': {
    population: '104,000',
    institutions: 'UWI Open Campus; SVG Community College',
    existing: '',
    languages: 'English; Vincentian Creole',
    constitutional: 'Constitution of Saint Vincent and the Grenadines (1979)'
  },
  Aruba: {
    population: '106,000',
    institutions: 'University of Aruba',
    existing: '',
    languages: 'Dutch; Papiamento; English',
    constitutional: 'Staatsregeling van Aruba (1986)'
  },
  'Other (custom)': {
    population: '',
    institutions: '',
    existing: '',
    languages: '',
    constitutional: ''
  }
};

export const COUNTRY_LIST = Object.keys(COUNTRIES);

// ---------------------------------------------------------------------------
// THE SEVEN GUIDING PRINCIPLES (Jowallah Governance Wheel)
// ---------------------------------------------------------------------------
export const PRINCIPLES = [
  {
    id: 'p1',
    iconName: 'Compass',
    name: 'Policy and Ethics',
    desc: 'Values-aligned policy frameworks rooted in regional moral and constitutional traditions.',
    suggest:
      'Cabinet-ratified National AI Policy Statement; multi-stakeholder National AI Council; mandatory ethics review for procurement above threshold; plain-language public guidelines in regional Creole languages.'
  },
  {
    id: 'p2',
    iconName: 'Eye',
    name: 'Transparency and Accountability',
    desc: 'Disclosure of AI use is the baseline of public trust.',
    suggest:
      'National disclosure standard; AI Public Register modelled on the UK Algorithmic Transparency Recording Standard; independent audit rights for civil society; clear pre-deployment accountability lines.'
  },
  {
    id: 'p3',
    iconName: 'Users',
    name: 'Equity and Inclusion',
    desc: 'AI must not deepen the divides it claims to bridge.',
    suggest:
      'Inclusion Impact Assessments for all public deployments; investment in Creole language datasets; subsidised AI tools for SMEs and informal sector; UNCRPD-aligned accessibility standards.'
  },
  {
    id: 'p4',
    iconName: 'GraduationCap',
    name: 'Capacity Building',
    desc: 'AI literacy across faculty, students, public servants, business owners, and the wider citizenry.',
    suggest:
      'National AI Literacy Initiative reaching every parish/district; mandatory public service AI literacy modules; faculty development with ring-fenced funding; CXC-aligned schools curriculum integration.'
  },
  {
    id: 'p5',
    iconName: 'BookOpen',
    name: 'Assessment and Integrity',
    desc: 'Redesigned assessment and quality assurance fit for an AI-integrated workforce.',
    suggest:
      'Regional Assessment Redesign Initiative led by CXC and university councils; authentic context-rich assessment models; scaffolded student AI disclosure norms; aligned industry credential frameworks.'
  },
  {
    id: 'p6',
    iconName: 'Database',
    name: 'Data and Privacy',
    desc: 'Regional data sovereignty, with protocols compliant with both regional and international standards.',
    suggest:
      'Data residency for sensitive categories; participation in a Caribbean Data Trust; investment in regional cloud and compute; open public datasets for non-sensitive data; mandatory DPIAs for high-risk deployments.'
  },
  {
    id: 'p7',
    iconName: 'Search',
    name: 'Evaluation and Iteration',
    desc: 'Regular review cycles ensuring governance evolves with the technology.',
    suggest:
      'National AI Evaluation Office; annual State of AI in the Nation reports tabled in Parliament; CARICOM biennial Caribbean AI Outlook contribution; sunset clauses on fast-changing provisions.'
  }
];

// ---------------------------------------------------------------------------
// GDP-CRITICAL SECTORS
// ---------------------------------------------------------------------------
export const GDP_SECTORS = [
  { id: 'tourism', label: 'Tourism & Hospitality', icon: '🏝️' },
  { id: 'agriculture', label: 'Agriculture & Fisheries', icon: '🌾' },
  { id: 'finance', label: 'Financial Services', icon: '🏦' },
  { id: 'energy', label: 'Energy', icon: '⚡' },
  { id: 'mining', label: 'Mining & Extractives', icon: '⛏️' },
  { id: 'bpo', label: 'BPO & ITES', icon: '📞' },
  { id: 'creative', label: 'Creative Industries', icon: '🎵' },
  { id: 'health', label: 'Health Services', icon: '🏥' },
  { id: 'education', label: 'Education', icon: '🎓' }
];

// ---------------------------------------------------------------------------
// CARIBBEAN UNIVERSITY COMPACT — SIX COMMITMENTS
// ---------------------------------------------------------------------------
export const COMMITMENTS = [
  {
    id: 'c1',
    label: 'Curricular Leadership',
    desc: 'Publish a curricular AI strategy within twelve months of accession.'
  },
  {
    id: 'c2',
    label: 'Faculty Development',
    desc: 'Commit to faculty AI development at a defined annual investment level (recommended 0.5% of operating budget).'
  },
  {
    id: 'c3',
    label: 'Inclusive Pedagogy',
    desc: 'Adopt the CARE Framework or an equivalent inclusive pedagogical framework.'
  },
  {
    id: 'c4',
    label: 'Research and Knowledge Production',
    desc: 'Build Caribbean AI research capacity in regional languages, climate, health, and economic conditions.'
  },
  {
    id: 'c5',
    label: 'Public Service',
    desc: 'Host or co-host a Community AI Centre with intentional outreach to underserved populations.'
  },
  {
    id: 'c6',
    label: 'Accountability',
    desc: 'Publish an annual State of AI report documenting progress, challenges, and outcomes.'
  }
];

// ---------------------------------------------------------------------------
// SUGGESTED RISKS LIBRARY
// ---------------------------------------------------------------------------
export const SUGGESTED_RISKS = [
  {
    risk: 'Vendor lock-in to a single AI provider',
    mitigation:
      'Multi-provider procurement framework; portability requirements; open-standard preferences in public sector.'
  },
  {
    risk: 'Brain drain of technical AI talent',
    mitigation:
      'Doctoral pipeline; competitive remuneration in regional universities; diaspora engagement; remote-work residency incentives.'
  },
  {
    risk: 'Climate disruption to AI infrastructure',
    mitigation:
      'Resilience as design requirement; distributed infrastructure; integrated climate-AI planning.'
  },
  {
    risk: 'Foreign acquisition of local AI ventures',
    mitigation:
      'Patient capital frameworks; regional investment fund; conditional grant structures.'
  },
  {
    risk: 'Public legitimacy collapse',
    mitigation:
      'Mandatory transparency; accessible appeal mechanisms; honest evaluation reporting.'
  },
  {
    risk: 'Workforce displacement without transition',
    mitigation:
      'Sign and implement the regional AI-Workforce Compact; transition rights; lifelong learning entitlements.'
  },
  {
    risk: 'Linguistic erasure of Creole speakers',
    mitigation:
      'Public investment in Creole datasets; procurement requirements for regional language support.'
  },
  {
    risk: 'Replicated dependency through framework imitation',
    mitigation:
      'Mandatory contextualisation review for any imported framework; National AI Council scrutiny.'
  }
];

// ---------------------------------------------------------------------------
// EVALUATION KEYWORD MAPS
// Used by lib/plan-evaluator.js to score an uploaded plan against the Blueprint.
// Each section has a list of indicator phrases. Coverage is computed on phrase
// presence (case-insensitive, lemma-light) rather than naive single-word match.
// ---------------------------------------------------------------------------
export const EVAL_INDICATORS = {
  p1: {
    name: 'Policy and Ethics',
    must: ['ai policy', 'national ai', 'ai council', 'cabinet'],
    should: [
      'ethics',
      'constitutional',
      'values',
      'unesco',
      'oecd',
      'caricom',
      'multi-stakeholder',
      'parliament'
    ]
  },
  p2: {
    name: 'Transparency and Accountability',
    must: ['transparency', 'disclosure', 'accountability'],
    should: [
      'public register',
      'algorithmic',
      'audit',
      'oversight',
      'labelling',
      'explainability',
      'human-in-the-loop',
      'recourse'
    ]
  },
  p3: {
    name: 'Equity and Inclusion',
    must: ['equity', 'inclusion'],
    should: [
      'creole',
      'patois',
      'kreyòl',
      'kreyol',
      'patwa',
      'language',
      'disability',
      'accessibility',
      'rural',
      'sme',
      'small business',
      'gender',
      'older adults',
      'indigenous',
      'underserved'
    ]
  },
  p4: {
    name: 'Capacity Building',
    must: ['literacy', 'training'],
    should: [
      'faculty development',
      'curriculum',
      'public servant',
      'professional development',
      'community',
      'cxc',
      'reskilling',
      'upskilling',
      'workforce',
      'skills'
    ]
  },
  p5: {
    name: 'Assessment and Integrity',
    must: ['assessment'],
    should: [
      'integrity',
      'plagiarism',
      'authenticity',
      'rubric',
      'examination',
      'credential',
      'qualification',
      'cxc',
      'authentic assessment',
      'oral defence',
      'portfolio'
    ]
  },
  p6: {
    name: 'Data and Privacy',
    must: ['data', 'privacy'],
    should: [
      'data protection',
      'gdpr',
      'data residency',
      'data sovereignty',
      'data trust',
      'consent',
      'dpia',
      'cloud',
      'compute',
      'open data',
      'biometric',
      'cybersecurity'
    ]
  },
  p7: {
    name: 'Evaluation and Iteration',
    must: ['evaluation', 'review'],
    should: [
      'iteration',
      'monitoring',
      'kpi',
      'outcome',
      'sunset',
      'state of ai',
      'biennial',
      'annual report',
      'continuous improvement',
      'feedback loop'
    ]
  }
};

export const SECTOR_INDICATORS = {
  publicSector: {
    name: 'Public Sector Pathway',
    must: ['public sector', 'government'],
    should: [
      'ministry',
      'civil service',
      'public servant',
      'procurement',
      'service delivery',
      'e-government',
      'digital government',
      'public hospital',
      'public school',
      'climate response',
      'disaster'
    ]
  },
  privateSector: {
    name: 'Private Sector Pathway',
    must: ['private sector'],
    should: [
      'sme',
      'small and medium',
      'enterprise',
      'business',
      'innovation',
      'investment fund',
      'workforce',
      'cooperative',
      'industry',
      'employer'
    ]
  },
  gdpSectors: {
    name: 'GDP-Critical Production Sectors',
    must: [],
    should: [
      'tourism',
      'agriculture',
      'fisheries',
      'finance',
      'banking',
      'energy',
      'mining',
      'bpo',
      'creative industries',
      'music',
      'health services',
      'education sector'
    ]
  }
};

export const STRUCTURAL_INDICATORS = {
  universityCompact: {
    name: 'University Compact / Higher Education',
    must: ['university', 'higher education'],
    should: [
      'uwi',
      'utech',
      'compact',
      'faculty',
      'research',
      'doctoral',
      'curriculum',
      'community ai centre',
      'scholarship'
    ]
  },
  roadmap: {
    name: 'Implementation Roadmap',
    must: ['roadmap', 'phase'],
    should: [
      'foundation',
      'expansion',
      'consolidation',
      'milestone',
      'timeline',
      '2026',
      '2027',
      '2028',
      '2029',
      '2030',
      '2031',
      'short-term',
      'medium-term',
      'long-term'
    ]
  },
  riskRegister: {
    name: 'Risk Register',
    must: ['risk'],
    should: [
      'mitigation',
      'vendor lock-in',
      'brain drain',
      'climate',
      'displacement',
      'legitimacy',
      'foreign acquisition',
      'erasure',
      'dependency',
      'cybersecurity'
    ]
  },
  sovereignty: {
    name: 'Sovereignty / Decolonial Framing',
    must: [],
    should: [
      'sovereign',
      'sovereignty',
      'decolonial',
      'decoloni',
      'global south',
      'caribbean',
      'caricom',
      'data sovereignty',
      'cultural',
      'self-determination',
      'contextualis'
    ]
  }
};
