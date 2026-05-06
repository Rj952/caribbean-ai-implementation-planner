// Browser-side .docx generation using the `docx` library.
// Renders the same canonical content as document-generator.js, but as a
// properly structured Word document with styles.

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle
} from 'docx';
import { saveAs } from 'file-saver';
import { PRINCIPLES, GDP_SECTORS, COMMITMENTS } from './data';

// Caribbean palette in hex (no leading #)
// Jamaica-primary palette for Word export
// (hex without leading # because docx accepts that format)
const SEA = '0B0B0B';        // Jamaica black — display headings
const TEAL = '009B3A';       // Jamaica green — section headers, accents
const SUN = 'D6A800';        // Jamaica gold (slightly muted for AA on white)
const INK = '1A1A1A';
const MUTE = '5C6873';

const h1 = (text) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 200 },
    children: [
      new TextRun({ text, bold: true, color: SEA, size: 36, font: 'Georgia' })
    ]
  });

const h2 = (text) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 320, after: 160 },
    children: [
      new TextRun({ text, bold: true, color: SEA, size: 28, font: 'Georgia' })
    ]
  });

const h3 = (text) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 240, after: 120 },
    children: [
      new TextRun({ text, bold: true, color: TEAL, size: 24, font: 'Georgia' })
    ]
  });

const p = (text, opts = {}) =>
  new Paragraph({
    spacing: { after: 120 },
    children: [
      new TextRun({
        text: text || '',
        color: opts.color || INK,
        size: opts.size || 22,
        bold: opts.bold || false,
        italics: opts.italic || false,
        font: 'Calibri'
      })
    ]
  });

const small = (text, opts = {}) =>
  new Paragraph({
    spacing: { after: 80 },
    children: [
      new TextRun({
        text: text || '',
        color: opts.color || MUTE,
        size: 18,
        italics: opts.italic || false,
        bold: opts.bold || false,
        font: 'Calibri'
      })
    ]
  });

const bullet = (text) =>
  new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 80 },
    children: [new TextRun({ text, color: INK, size: 22, font: 'Calibri' })]
  });

const accentBar = () =>
  new Paragraph({
    spacing: { before: 200, after: 200 },
    children: [
      new TextRun({
        text: '— — — — — — — — — — — — — — — — — — — —',
        color: SUN,
        size: 18
      })
    ]
  });

function metaTable(rows) {
  const tr = (label, value) =>
    new TableRow({
      children: [
        new TableCell({
          width: { size: 30, type: WidthType.PERCENTAGE },
          shading: { fill: 'F2EEDF' },
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: label, bold: true, color: SEA, size: 20 })
              ]
            })
          ]
        }),
        new TableCell({
          width: { size: 70, type: WidthType.PERCENTAGE },
          children: [
            new Paragraph({
              children: [new TextRun({ text: value || '—', color: INK, size: 20 })]
            })
          ]
        })
      ]
    });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: 'D8D2BD' },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: 'D8D2BD' },
      left: { style: BorderStyle.SINGLE, size: 4, color: 'D8D2BD' },
      right: { style: BorderStyle.SINGLE, size: 4, color: 'D8D2BD' },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: 'D8D2BD' },
      insideVertical: { style: BorderStyle.SINGLE, size: 4, color: 'D8D2BD' }
    },
    rows: rows.map(([l, v]) => tr(l, v))
  });
}

/**
 * Convert a multi-line string to a sequence of paragraphs.
 * Empty lines become spacing paragraphs.
 */
function multiline(text) {
  if (!text) return [p('[To be drafted]')];
  return text.split(/\r?\n/).map(line => p(line));
}

export async function exportDocx(data, filename = 'national-ai-implementation-plan.docx') {
  const c = data.country || '[Country Name]';
  const today = data.date || new Date().toISOString().slice(0, 10);

  const children = [
    // Title block
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { after: 120 },
      children: [
        new TextRun({
          text: 'CARIBBEAN AI IMPLEMENTATION PLAN',
          bold: true,
          color: SUN,
          size: 18,
          font: 'Calibri'
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { after: 120 },
      children: [
        new TextRun({
          text: 'National AI Implementation Plan',
          bold: true,
          color: SEA,
          size: 44,
          font: 'Georgia'
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { after: 280 },
      children: [
        new TextRun({
          text: c,
          color: TEAL,
          size: 32,
          font: 'Georgia',
          italics: true
        })
      ]
    }),
    p(`Working Document — Version ${data.version || '1.0'}`, { color: MUTE, italic: true }),
    accentBar(),
    metaTable([
      ['Country', c],
      ['Population', data.population],
      ['Lead Agency', data.leadAgency],
      ['Prepared By', data.preparedBy],
      ['Date', today],
      ['Status', 'Working Draft']
    ]),
    accentBar(),

    // 1. Executive Summary
    h1('1. Executive Summary'),
    p(
      `This implementation plan operationalises the Caribbean AI Deployment Blueprint (Jowallah, 2026) for the specific institutional, constitutional, and economic conditions of ${c}. It is structured around the seven guiding principles drawn from the Jowallah Governance Wheel and the three-sector pathway (public, private, and GDP-critical industries), with education positioned as the strategic anchor.`
    ),
    p(
      'The plan is a working document. It is intended to be reviewed by the National AI Council, contextualised through public consultation, and revised through scheduled iteration cycles. It is not a finished policy. It is the substrate from which a finished policy can be built.'
    ),

    // 2. Vision
    h1('2. National AI Vision'),
    h2('2.1 Vision Statement'),
    ...multiline(data.vision),
    h2('2.2 Strategic Priorities'),
    ...(data.priorities.filter(Boolean).length
      ? data.priorities.filter(Boolean).map((pr, i) => p(`${i + 1}. ${pr}`))
      : [p('[Priorities to be drafted — typically 3–5 high-level commitments.]')]),
    h2('2.3 Constitutional and Cultural Anchors'),
    ...multiline(data.constitutional),
    ...(data.anchors ? [p('Additional Anchors:', { bold: true }), ...multiline(data.anchors)] : []),
    h2('2.4 Linguistic Context'),
    ...multiline(data.languages),
    h2('2.5 Existing AI Initiatives'),
    ...multiline(data.existing),
    h2('2.6 Higher Education Landscape'),
    ...multiline(data.institutions),

    // 3. Seven Principles
    h1('3. The Seven Principles — Implementation Plan'),
    p(
      'The seven guiding principles are drawn from the Jowallah Governance Wheel (Jowallah, 2026, forthcoming). They are operational, not ornamental. None of them works alone.',
      { italic: true, color: MUTE }
    ),
    ...PRINCIPLES.flatMap((pr, i) => {
      const pd = data.principles[pr.id] || {};
      const gap = (pd.target || 0) - (pd.current || 0);
      return [
        h2(`Principle ${i + 1} — ${pr.name}`),
        p(`Current: ${pd.current ?? '—'} of 5    Target: ${pd.target ?? '—'} of 5    Gap: ${gap >= 0 ? '+' + gap : gap}`, { bold: true, color: TEAL }),
        p(`Lead Agency: ${pd.lead || '[To be assigned]'}`, { bold: true }),
        p(pr.desc, { italic: true, color: MUTE }),
        p('Implementation Actions:', { bold: true }),
        ...multiline(pd.actions),
        small(`Suggested from the Blueprint: ${pr.suggest}`, { italic: true })
      ];
    }),

    // 4. Three Sectors
    h1('4. The Three-Sector Pathway'),
    h2('4.1 Public Sector'),
    p(`Lead Coordinating Body: ${data.publicSector.lead || '[To be assigned]'}`, { bold: true }),
    p('Implementation Priorities:', { bold: true }),
    ...multiline(data.publicSector.priorities),
    h2('4.2 Private Sector'),
    p(`Lead Coordinating Body: ${data.privateSector.lead || '[To be assigned]'}`, { bold: true }),
    p('Implementation Priorities:', { bold: true }),
    ...multiline(data.privateSector.priorities),
    h2('4.3 GDP-Critical Production Sectors'),
    p('Sectors Selected for Priority Deployment:', { bold: true }),
    ...(data.gdpSelected.length
      ? data.gdpSelected.map(id => {
          const s = GDP_SECTORS.find(x => x.id === id);
          return bullet(s ? s.label : id);
        })
      : [p('[No sectors selected]')]),
    p('Cross-Sectoral Priorities:', { bold: true }),
    ...multiline(data.gdpPriorities),

    // 5. University Compact
    h1('5. The University Compact'),
    h2('5.1 Lead University'),
    p(data.compact.leadUni || '[Lead university to be designated as the national node of the Caribbean University AI Compact.]'),
    h2('5.2 Additional Signatories'),
    ...multiline(data.compact.signatories),
    h2('5.3 Six Commitments'),
    ...COMMITMENTS.map(co =>
      p(`${data.compact.selected[co.id] ? '☑' : '☐'}  ${co.label} — ${co.desc}`)
    ),

    // 6. Roadmap
    h1('6. Implementation Roadmap'),
    h2('6.1 Phase 1 — Foundation (2026–2027)'),
    ...multiline(data.phase1),
    h2('6.2 Phase 2 — Expansion (2028–2029)'),
    ...multiline(data.phase2),
    h2('6.3 Phase 3 — Consolidation (2030–2031)'),
    ...multiline(data.phase3),

    // 7. Risks
    h1('7. Risk Register'),
    ...(data.risks.filter(r => r.risk || r.mitigation).length
      ? data.risks
          .filter(r => r.risk || r.mitigation)
          .flatMap((r, i) => [
            p(`Risk ${i + 1}: ${r.risk || '[Risk]'}`, { bold: true }),
            p(`Mitigation: ${r.mitigation || '[Mitigation]'}`),
            p('')
          ])
      : [p('[Top risks and mitigations to be specified.]')]),

    // 8. Accountability
    h1('8. Accountability and Reporting'),
    p('This plan adopts the accountability commitments of the Caribbean AI Deployment Blueprint:'),
    bullet('Annual State of AI in the Nation report, tabled in Parliament, accessible in plain language.'),
    bullet('Public register of government AI deployments, updated quarterly.'),
    bullet('Independent academic evaluation funded as a line item, not a discretionary grant.'),
    bullet('Civil society audit rights, including for unions, consumer organisations, and disability advocacy bodies.'),
    bullet('Twenty-four-month policy review cycle.'),

    // 9. References
    h1('9. References'),
    bullet('Jowallah, R. (2026). Caribbean AI Deployment Blueprint. Working paper.'),
    bullet('Jowallah, R. (Ed.). (forthcoming). Sovereign Intelligence: A Caribbean Framework for AI Leadership in Education and Policy. IGI Global.'),
    bullet('Simmons, E., Ramsewak, D., Kissoon, P., & Bissessar, C. (2024). Caribbean Artificial Intelligence Policy Roadmap. Caribbean Telecommunications Union.'),
    bullet('UNESCO. (2021). Recommendation on the Ethics of Artificial Intelligence.'),
    bullet('OECD. (2024). OECD Principles on Artificial Intelligence (revised).'),
    bullet('NIST. (2023). AI Risk Management Framework (AI RMF 1.0).'),
    bullet('Carroll, S. R. et al. (2020). The CARE Principles for Indigenous Data Governance. Data Science Journal, 19(1), 43.'),
    bullet('Heeks, R. (2022). Digital inequality beyond the digital divide. Information Technology for Development, 28(4), 688–704.'),
    bullet('Mohamed, S., Png, M.-T., & Isaac, W. (2020). Decolonial AI. Philosophy & Technology, 33(4), 659–684.'),

    accentBar(),
    small('Working document prepared using the Caribbean AI Implementation Planner.', { italic: true }),
    small('Based on the Caribbean AI Deployment Blueprint by Dr. Rohan Jowallah (2026).', { italic: true })
  ];

  const doc = new Document({
    creator: 'Caribbean AI Implementation Planner',
    title: `${c} — National AI Implementation Plan`,
    description: 'Working draft generated from the Caribbean AI Deployment Blueprint (Jowallah, 2026).',
    styles: {
      default: {
        document: {
          run: { font: 'Calibri', size: 22, color: INK }
        }
      }
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 }
          }
        },
        children
      }
    ]
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, filename);
}

/**
 * Export an evaluation report as .docx.
 * `report` is the structured object returned by lib/plan-evaluator.js.
 */
export async function exportEvaluationDocx(report, filename = 'plan-evaluation-report.docx') {
  const overall = report.overall;
  const dateStr = new Date().toISOString().slice(0, 10);

  const children = [
    new Paragraph({
      children: [
        new TextRun({
          text: 'PLAN EVALUATION REPORT',
          bold: true,
          color: SUN,
          size: 18
        })
      ]
    }),
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: 'Evaluation Against the Caribbean AI Deployment Blueprint',
          bold: true,
          color: SEA,
          size: 40,
          font: 'Georgia'
        })
      ]
    }),
    p(`Source file: ${report.sourceName || '—'}`, { color: MUTE }),
    p(`Word count: ${report.wordCount?.toLocaleString() || '—'}`, { color: MUTE }),
    p(`Evaluation date: ${dateStr}`, { color: MUTE }),

    accentBar(),
    h1('Overall Score'),
    p(`Coverage: ${overall.score}% (${overall.band})`, { bold: true, color: TEAL }),
    p(overall.summary),

    h1('Strengths'),
    ...(report.strengths.length
      ? report.strengths.map(s => bullet(s))
      : [p('— No clear strengths identified above the threshold.', { color: MUTE })]),

    h1('Critical Gaps'),
    ...(report.gaps.length
      ? report.gaps.map(g => bullet(g))
      : [p('— No critical gaps identified.', { color: MUTE })]),

    h1('Section-by-Section Findings'),
    ...report.sections.flatMap(s => [
      h2(`${s.name}`),
      p(`Status: ${s.status} (${s.score}%)`, { bold: true, color: TEAL }),
      p(s.notes),
      ...(s.missing && s.missing.length
        ? [
            p('Concepts not detected in the uploaded plan:', { bold: true }),
            ...s.missing.map(m => bullet(m))
          ]
        : [])
    ]),

    h1('Recommended Action Plan'),
    p(
      'These actions are prioritised by the size of the gap between what your uploaded plan addresses and what the Blueprint specifies. Treat them as amendment hooks for the next revision cycle.',
      { italic: true, color: MUTE }
    ),
    ...report.actions.flatMap((a, i) => {
      const priorityColor =
        a.priority === 'Critical' ? '0B0B0B' :
        a.priority === 'High'     ? 'C8102E' :
        a.priority === 'Medium'   ? 'C9A100' : '009B3A';
      return [
        h3(`Action ${i + 1} — ${a.title}`),
        ...(a.principle
          ? [p(a.principle + ' · ' + (a.score ?? 0) + '% coverage', { italic: true, color: MUTE })]
          : []),
        p(`Priority: ${a.priority}`, { bold: true, color: priorityColor }),
        p(`Rationale: ${a.rationale}`),
        p('Recommended steps:', { bold: true }),
        ...a.steps.map(st => bullet(st))
      ];
    }),

    accentBar(),
    small('Evaluation generated by the Caribbean AI Implementation Planner.', { italic: true }),
    small('Heuristic indicators are derived from the Caribbean AI Deployment Blueprint (Jowallah, 2026).', { italic: true })
  ];

  const doc = new Document({
    creator: 'Caribbean AI Implementation Planner',
    title: 'Plan Evaluation Report',
    sections: [
      {
        properties: {
          page: { margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 } }
        },
        children
      }
    ]
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, filename);
}
