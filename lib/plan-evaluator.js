// Heuristic evaluation of an uploaded plan against the Caribbean AI Deployment Blueprint.
// No API key required — runs fully in the browser.
//
// Approach:
//   1. Lower-case + tokenise the uploaded plan text.
//   2. For each section (seven principles + sectors + structural elements),
//      check coverage of "must" and "should" indicator phrases.
//   3. Score each section: must-coverage carries 60% weight, should-coverage 40%.
//   4. Map the score to a band: Strong / Partial / Absent.
//   5. Aggregate to an overall coverage score and band.
//   6. Generate strengths, gaps, and a prioritised action plan.

import {
  PRINCIPLES,
  EVAL_INDICATORS,
  SECTOR_INDICATORS,
  STRUCTURAL_INDICATORS
} from './data';

function normalise(text) {
  // Replace various unicode dashes / quotes / accents with simpler equivalents,
  // then lowercase. We keep accented characters (Creole, Kreyòl, Curaçao) so
  // exact-match indicators like "kreyòl" still find them.
  return (text || '')
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .toLowerCase();
}

function present(haystack, needle) {
  // Simple substring check, but also try a "stem-light" match by stripping
  // common suffixes (s, es, ing, ed) from the indicator if not found verbatim.
  const n = needle.toLowerCase();
  if (haystack.includes(n)) return true;
  // Also accept "s" plural / "ing" / "ed" forms (don't be too aggressive)
  const variants = [
    n + 's',
    n.replace(/y$/, 'ies'),
    n.endsWith('e') ? n + 'd' : n + 'ed',
    n.endsWith('e') ? n.slice(0, -1) + 'ing' : n + 'ing'
  ];
  return variants.some(v => haystack.includes(v));
}

function scoreSection(haystack, indicators) {
  const must = indicators.must || [];
  const should = indicators.should || [];

  const mustHits = must.filter(t => present(haystack, t));
  const shouldHits = should.filter(t => present(haystack, t));
  const mustMissing = must.filter(t => !present(haystack, t));
  const shouldMissing = should.filter(t => !present(haystack, t));

  // If no "must" indicators, the should score is the section score.
  let mustRatio = must.length === 0 ? 1 : mustHits.length / must.length;
  let shouldRatio = should.length === 0 ? 1 : shouldHits.length / should.length;

  // Weighted: must 60%, should 40%
  let raw = must.length === 0 ? shouldRatio : mustRatio * 0.6 + shouldRatio * 0.4;
  const score = Math.round(raw * 100);

  let status;
  if (score >= 70) status = 'Strong';
  else if (score >= 35) status = 'Partial';
  else status = 'Absent';

  return {
    score,
    status,
    mustHits,
    shouldHits,
    mustMissing,
    shouldMissing
  };
}

function buildNotes(section) {
  const { status, mustHits, shouldHits, mustMissing, shouldMissing } = section;
  if (status === 'Strong') {
    const totalHits = mustHits.length + shouldHits.length;
    return `Plan addresses this principle in depth — ${totalHits} indicator concept${totalHits === 1 ? '' : 's'} detected, including the core must-have terms. Continue with refinement.`;
  }
  if (status === 'Partial') {
    const missing = [...mustMissing, ...shouldMissing.slice(0, 4)].slice(0, 5);
    return `Plan touches this principle but coverage is uneven. Concepts most worth strengthening: ${missing.join(', ')}.`;
  }
  // Absent
  const missing = mustMissing.length ? mustMissing : shouldMissing.slice(0, 4);
  return `Plan does not substantively address this principle. Required Blueprint concepts not detected: ${missing.join(', ')}.`;
}

const ACTION_TEMPLATES = {
  p1: {
    title: 'Strengthen Policy and Ethics foundation',
    rationale:
      'A plan without a clear policy and ethics anchor is read as procurement, not policy. The Blueprint requires constitutional and values-based grounding.',
    steps: [
      'Add a National AI Policy Statement section with cabinet-ratification language and a tabling commitment to Parliament.',
      'Establish a multi-stakeholder National AI Council with named seats for government, universities, private sector, civil society, and youth.',
      'Specify a procurement-threshold ethics review trigger for public sector AI buying.',
      'Reference national constitutional and CARICOM-wide ethical instruments (UNESCO 2021, OECD AI Principles, CARICOM Charter of Civil Society).'
    ]
  },
  p2: {
    title: 'Build out Transparency and Accountability mechanisms',
    rationale:
      'Disclosure and accountability are the bedrock of public trust. Without them, every other commitment is unverifiable.',
    steps: [
      'Commit to a public AI Register modelled on the UK Algorithmic Transparency Recording Standard.',
      'Set a national disclosure standard requiring labelling of AI-generated content in government communications.',
      'Define independent audit rights for civil society and academic researchers.',
      'Specify accountability lines and recourse mechanisms BEFORE deployment — not after harm.'
    ]
  },
  p3: {
    title: 'Centre Equity and Inclusion as the architecture, not a bolt-on',
    rationale:
      'Inclusion is the test of legitimacy in the Blueprint. A plan that addresses AI without explicit equity dimensions risks reproducing existing divides.',
    steps: [
      'Mandate Inclusion Impact Assessments for every public sector AI deployment (analogous to environmental impact assessment).',
      'Commit public investment to Caribbean Creole language datasets (Patois, Kreyòl, Sranan Tongo, Papiamento, Bajan, etc.).',
      'Subsidise or provide free AI tools for SMEs, women-led, youth-led, and rural enterprises.',
      'Adopt UNCRPD-aligned accessibility standards as mandatory for any government-funded AI deployment.',
      'Address generational and geographic equity (older adults, rural communities) explicitly in the design phase.'
    ]
  },
  p4: {
    title: 'Layer in a national Capacity Building strategy',
    rationale:
      'A society cannot govern what it does not understand. AI literacy must be funded, ongoing, and tiered — not a one-off training event.',
    steps: [
      'Launch a National AI Literacy Initiative reaching every parish/district through Community AI Centres and public libraries.',
      'Make AI literacy modules mandatory in public service induction with biennial refresher cycles.',
      'Ring-fence funding for faculty AI development across all higher education institutions.',
      'Coordinate with the Caribbean Examinations Council on schools curriculum integration from primary level upwards.',
      'Add targeted programmes for older adults, persons with disabilities, and rural communities.'
    ]
  },
  p5: {
    title: 'Redesign Assessment and Integrity for an AI-integrated workforce',
    rationale:
      'Detecting AI use is the wrong frame. The right frame is redesigning assessment to measure judgement, reasoning, contextual application, and ethical reflection.',
    steps: [
      'Convene a regional Assessment Redesign Initiative through CXC and the regional university councils.',
      'Adopt authentic, context-rich assessment models — oral defence, portfolio review, problem-based assessment.',
      'Establish scaffolded AI disclosure norms for student work (rather than binary detection).',
      'Align industry credential frameworks with the new assessment models.'
    ]
  },
  p6: {
    title: 'Establish Data and Privacy architecture with regional sovereignty',
    rationale:
      'Whoever controls Caribbean data controls the parameters of Caribbean AI. The Blueprint draws on Indigenous Data Sovereignty (Carroll et al., 2020) as the foundation.',
    steps: [
      'Specify data residency requirements for sensitive categories: health, education, biometric data.',
      'Commit to the Caribbean Data Trust — a regional body negotiating data-sharing agreements with foreign providers.',
      'Invest in regional cloud and compute infrastructure with regional development bank partnership.',
      'Publish open public datasets for non-sensitive data, fee-free for Caribbean researchers and entrepreneurs.',
      'Mandate Data Protection Impact Assessments for high-risk public sector deployments.'
    ]
  },
  p7: {
    title: 'Build Evaluation and Iteration into governance',
    rationale:
      'AI is not static — governance must therefore be iterative. Without scheduled review, every other provision calcifies.',
    steps: [
      'Establish a National AI Evaluation Office reporting to the National AI Council.',
      'Commit to annual State of AI in the Nation reports tabled in Parliament in plain language.',
      'Contribute to the biennial Caribbean AI Outlook coordinated through CARICOM.',
      'Insert sunset clauses on policy provisions related to fast-changing technical conditions.'
    ]
  },
  publicSector: {
    title: 'Develop the Public Sector pathway',
    rationale: 'A Blueprint-aligned plan operationalises the public sector as both regulator and exemplar.',
    steps: [
      'Identify 3-5 citizen-facing services for AI-supported modernisation (passport, tax, social security, permits).',
      'Adopt a national AI procurement standard (NIST RMF + EU AI Act risk-classification, contextualised).',
      'Commit to public sector productivity AI as augmentation, with workforce transition agreed with unions.',
      'Specify climate and disaster response as a priority deployment domain (post-Hurricane Melissa lesson).'
    ]
  },
  privateSector: {
    title: 'Develop the Private Sector pathway',
    rationale: 'A strategy designed only for large enterprises deepens the productivity gap. The Blueprint requires SME centrality.',
    steps: [
      'Subsidise or provide free AI tools to the SME sector — particularly women-led, youth-led, rural.',
      'Mandate AI governance disclosure for listed companies above a market-cap threshold.',
      'Establish sector-specific AI Hubs (Tourism, Agriculture, Financial Services, Creative Industries) at universities.',
      'Capitalise an AI Investment Fund with national, regional development bank, and diaspora capital.',
      'Plan the BPO workforce transition NOW, before disruption arrives.'
    ]
  },
  gdpSectors: {
    title: 'Address the GDP-Critical Production Sectors',
    rationale: 'These sectors anchor regional output. AI deployment in each requires sector-specific design under coordinated regional governance.',
    steps: [
      'Identify priority sectors among Tourism, Agriculture & Fisheries, Financial Services, Energy, BPO, Creative Industries, Health, Education.',
      'Add a Climate Integration requirement: every productive-sector AI deployment evaluated against climate vulnerability.',
      'Add a Linguistic Recognition requirement: deployments work in regional languages, not only Standard English.',
      'Sign the regional AI-Workforce Compact among governments, employers, and trade unions.'
    ]
  },
  universityCompact: {
    title: 'Position universities as the engine room',
    rationale: 'A national AI strategy that treats universities as recipients rather than authors of policy is, in a precise sense, not a sovereign strategy.',
    steps: [
      'Designate a lead university as your country\'s node in the Caribbean University AI Compact.',
      'Commit to faculty AI development at a defined annual investment level (recommended floor: 0.5% of operating budget).',
      'Adopt the CARE Framework or an equivalent inclusive pedagogical framework.',
      'Host or co-host a Community AI Centre with intentional outreach to underserved populations.',
      'Publish an annual State of AI report at institutional level.'
    ]
  },
  roadmap: {
    title: 'Phase the Implementation Roadmap',
    rationale: 'Plans without phasing collapse into priority lists. The Blueprint specifies Foundation (2026-27), Expansion (2028-29), Consolidation (2030-31).',
    steps: [
      'Phase 1 (Foundation): National AI Policy Statement; AI Council; AI Public Register; Compact convened; Community AI Centres opened.',
      'Phase 2 (Expansion): Sectoral AI Hubs operational; Caribbean Data Trust participation; doctoral programme; first State-of-AI reports.',
      'Phase 3 (Consolidation): Measurable improvement in regional AI investment share; documented talent retention; Caribbean voice in international fora.'
    ]
  },
  riskRegister: {
    title: 'Add a substantive Risk Register',
    rationale: 'Risks named are risks that can be mitigated. Vendor lock-in, brain drain, climate disruption, workforce displacement, linguistic erasure — name them.',
    steps: [
      'Add at least 5 country-specific risks with credible mitigations.',
      'Cover at minimum: vendor lock-in, brain drain, climate disruption, foreign acquisition, public legitimacy collapse, workforce displacement, linguistic erasure.',
      'For each risk, define an early-warning indicator and a designated owner.'
    ]
  },
  sovereignty: {
    title: 'Strengthen the sovereignty / decolonial framing',
    rationale: 'Without explicit sovereignty framing, a plan can replicate dependency through framework imitation — adopting Northern instruments unmodified.',
    steps: [
      'Frame the plan explicitly as a sovereign Caribbean strategy, not a localised import.',
      'Cite Mohamed, Png & Isaac (2020) on decolonial AI and Heeks (2022) on adverse digital incorporation.',
      'Adopt the position that sovereignty is a spectrum, and progress along that spectrum is the measure of strategic success.',
      'Commit to mandatory contextualisation review for any imported framework — UNESCO, OECD, NIST, EU AI Act all retained but recontextualised.'
    ]
  }
};

// 4-tier priority scale used by the prioritised gap list / action plan.
// Critical: section is effectively missing from the plan.
// High:     section is named but materially under-developed.
// Medium:   section is partially covered; targeted strengthening required.
// Low:      section is well covered; refinement only.
function priorityFor(score) {
  if (score < 15) return 'Critical';
  if (score < 35) return 'High';
  if (score < 70) return 'Medium';
  return 'Low';
}

// Map each section key back to the Blueprint principle / domain it
// belongs to, so the action plan can show "→ Principle 3 · Equity & Inclusion"
// rather than only the section title.
const SECTION_TO_PRINCIPLE = {
  p1: 'Principle 1 · Policy & Ethics',
  p2: 'Principle 2 · Transparency & Accountability',
  p3: 'Principle 3 · Equity & Inclusion',
  p4: 'Principle 4 · Capacity Building',
  p5: 'Principle 5 · Assessment & Integrity',
  p6: 'Principle 6 · Data & Privacy',
  p7: 'Principle 7 · Evaluation & Iteration',
  publicSector: 'Public Sector pathway',
  privateSector: 'Private Sector pathway',
  gdpSectors: 'GDP-Critical Production Sectors',
  universityCompact: 'Caribbean University AI Compact',
  roadmap: 'Implementation Roadmap',
  riskRegister: 'Risk Register',
  sovereignty: 'Sovereignty & Decolonial Framing'
};

function bandFor(score) {
  if (score >= 75) return 'Comprehensive — strongly aligned with the Blueprint';
  if (score >= 55) return 'Substantial — most major elements present, gaps remain';
  if (score >= 35) return 'Partial — directionally aligned but materially incomplete';
  if (score >= 15) return 'Skeletal — limited engagement with Blueprint substance';
  return 'Nascent — significant rework required for Blueprint alignment';
}

function summaryFor(score, sourceName) {
  const opener = `The uploaded plan${sourceName ? ` (${sourceName})` : ''} `;
  if (score >= 75)
    return opener + 'demonstrates comprehensive engagement with the Caribbean AI Deployment Blueprint. Refinement, not reconstruction, is the next move.';
  if (score >= 55)
    return opener + 'covers most Blueprint pillars at a substantial level. Targeted strengthening of the weaker sections will close the remaining gap.';
  if (score >= 35)
    return opener + 'is directionally aligned with the Blueprint but materially incomplete. Multiple sections require substantive amendment before the plan can carry the weight of national policy.';
  if (score >= 15)
    return opener + 'engages the Blueprint at a skeletal level. The action plan below identifies the structural rework needed.';
  return opener + 'shows nascent alignment with the Blueprint. Substantial drafting effort is required across most sections; consider running the Planner from scratch to seed the next draft.';
}

/**
 * Main entry point.
 * Returns a structured report object consumed by the UI and by the docx/pdf exporters.
 */
export function evaluatePlan(text, meta = {}) {
  const haystack = normalise(text);

  // Score each principle
  const principleResults = PRINCIPLES.map(p => {
    const ind = EVAL_INDICATORS[p.id];
    const r = scoreSection(haystack, ind);
    return {
      key: p.id,
      name: `Principle ${PRINCIPLES.findIndex(x => x.id === p.id) + 1} — ${p.name}`,
      score: r.score,
      status: r.status,
      missing: [...r.mustMissing, ...r.shouldMissing].slice(0, 8),
      notes: buildNotes(r)
    };
  });

  // Score sectors
  const sectorResults = Object.entries(SECTOR_INDICATORS).map(([key, ind]) => {
    const r = scoreSection(haystack, ind);
    return {
      key,
      name: ind.name,
      score: r.score,
      status: r.status,
      missing: [...r.mustMissing, ...r.shouldMissing].slice(0, 8),
      notes: buildNotes(r)
    };
  });

  // Score structural elements
  const structResults = Object.entries(STRUCTURAL_INDICATORS).map(([key, ind]) => {
    const r = scoreSection(haystack, ind);
    return {
      key,
      name: ind.name,
      score: r.score,
      status: r.status,
      missing: [...r.mustMissing, ...r.shouldMissing].slice(0, 8),
      notes: buildNotes(r)
    };
  });

  const allSections = [...principleResults, ...sectorResults, ...structResults];

  // Overall score: weighted average. Principles weight 50%, sectors 25%, structural 25%.
  const principleAvg = avg(principleResults.map(s => s.score));
  const sectorAvg = avg(sectorResults.map(s => s.score));
  const structAvg = avg(structResults.map(s => s.score));
  const overallScore = Math.round(principleAvg * 0.5 + sectorAvg * 0.25 + structAvg * 0.25);

  // Strengths and gaps
  const strengths = allSections
    .filter(s => s.status === 'Strong')
    .map(s => `${s.name}: ${s.notes}`);
  const gaps = allSections
    .filter(s => s.status === 'Absent')
    .map(s => `${s.name} (${s.score}%): ${s.notes}`);

  // Action plan: take all Absent + lowest-scoring Partials, build action items
  const actionCandidates = allSections
    .filter(s => s.status !== 'Strong')
    .sort((a, b) => a.score - b.score);

  const PRIORITY_ORDER = { Critical: 0, High: 1, Medium: 2, Low: 3 };

  const actions = actionCandidates
    .map(s => {
      const tpl = ACTION_TEMPLATES[s.key];
      if (!tpl) return null;
      const priority = priorityFor(s.score);
      return {
        sectionKey: s.key,
        title: tpl.title,
        priority,
        priorityRank: PRIORITY_ORDER[priority],
        score: s.score,
        principle: SECTION_TO_PRINCIPLE[s.key] || s.key,
        rationale: `${tpl.rationale} The uploaded plan scored ${s.score}% on this section.`,
        steps: tpl.steps
      };
    })
    .filter(Boolean)
    // Sort Critical → High → Medium → Low, then by score ascending so the
    // weakest gap inside each tier appears first.
    .sort((a, b) => a.priorityRank - b.priorityRank || a.score - b.score);

  return {
    sourceName: meta.sourceName || '',
    wordCount: meta.wordCount || 0,
    overall: {
      score: overallScore,
      band: bandFor(overallScore),
      summary: summaryFor(overallScore, meta.sourceName)
    },
    sections: allSections,
    strengths,
    gaps,
    actions
  };
}

function avg(arr) {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}
