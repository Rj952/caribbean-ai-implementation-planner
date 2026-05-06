import { PRINCIPLES, GDP_SECTORS, COMMITMENTS } from './data';

/**
 * Generate the working National AI Implementation Plan as Markdown text.
 * This Markdown is the canonical content; the .docx and .pdf exporters consume
 * the same structured `data` object and render the same content.
 */
export function generateMarkdown(data) {
  const c = data.country || '[Country Name]';
  const today = data.date || new Date().toISOString().slice(0, 10);

  const principleText = PRINCIPLES.map((p, i) => {
    const pd = data.principles[p.id] || {};
    const gap = (pd.target || 0) - (pd.current || 0);
    return `### Principle ${i + 1} — ${p.name}

**Current State:** ${pd.current ?? '—'} of 5    **Target State:** ${pd.target ?? '—'} of 5    **Gap:** ${gap >= 0 ? '+' + gap : gap}

**Lead Agency:** ${pd.lead || '[To be assigned]'}

**Description:** ${p.desc}

**Implementation Actions:**
${pd.actions || '[To be drafted using the suggested actions below]'}

> **Suggested Actions from the Blueprint:** ${p.suggest}
`;
  }).join('\n\n');

  const gdpSectorText = data.gdpSelected.length
    ? data.gdpSelected
        .map(id => {
          const s = GDP_SECTORS.find(x => x.id === id);
          return `- ${s ? s.label : id}`;
        })
        .join('\n')
    : '- [No sectors selected]';

  const commitmentText = COMMITMENTS.map(co => {
    const checked = data.compact.selected[co.id];
    return `- ${checked ? '☑' : '☐'} **${co.label}** — ${co.desc}`;
  }).join('\n');

  const riskText = data.risks
    .filter(r => r.risk || r.mitigation)
    .map(
      (r, i) =>
        `**Risk ${i + 1}:** ${r.risk || '[Risk]'}\n**Mitigation:** ${r.mitigation || '[Mitigation]'}`
    )
    .join('\n\n');

  const prioritiesText = data.priorities
    .filter(Boolean)
    .map((p, i) => `${i + 1}. ${p}`)
    .join('\n');

  return `# National AI Implementation Plan

## ${c}

**Working Document — Version ${data.version || '1.0'}**

---

| Field | Value |
|---|---|
| **Country** | ${c} |
| **Population** | ${data.population || '[To be specified]'} |
| **Lead Agency** | ${data.leadAgency || '[Lead drafting agency]'} |
| **Prepared By** | ${data.preparedBy || '[Names / titles]'} |
| **Date** | ${today} |
| **Status** | Working Draft |

---

## 1. Executive Summary

This implementation plan operationalises the *Caribbean AI Deployment Blueprint* (Jowallah, 2026) for the specific institutional, constitutional, and economic conditions of ${c}. It is structured around the seven guiding principles drawn from the Jowallah Governance Wheel and the three-sector pathway (public, private, and GDP-critical industries), with education positioned as the strategic anchor.

The plan is a working document. It is intended to be reviewed by the National AI Council, contextualised through public consultation, and revised through scheduled iteration cycles. It is not a finished policy. It is the substrate from which a finished policy can be built.

---

## 2. National AI Vision

### 2.1 Vision Statement

${data.vision || '[National AI vision statement to be drafted. The vision should articulate the country’s aspiration for AI deployment over a 5–10 year horizon, grounded in regional moral and constitutional traditions.]'}

### 2.2 Strategic Priorities

${prioritiesText || '[Priorities to be drafted — typically 3-5 high-level commitments.]'}

### 2.3 Constitutional and Cultural Anchors

${data.constitutional || '[Constitutional and legal foundations to be cited.]'}

${data.anchors ? '\n**Additional Anchors:**\n' + data.anchors : ''}

### 2.4 Linguistic Context

${data.languages || '[Primary and secondary languages of the population.]'}

### 2.5 Existing AI Initiatives

${data.existing || '[Initiatives already underway, where relevant.]'}

### 2.6 Higher Education Landscape

${data.institutions || '[Major higher education institutions.]'}

---

## 3. The Seven Principles — Implementation Plan

The seven guiding principles are drawn from the Jowallah Governance Wheel (Jowallah, 2026, forthcoming). They are operational, not ornamental. None of them works alone.

${principleText}

---

## 4. The Three-Sector Pathway

### 4.1 Public Sector

**Lead Coordinating Body:** ${data.publicSector.lead || '[To be assigned]'}

**Implementation Priorities:**

${data.publicSector.priorities || '[Priorities to be drafted. Reference the Blueprint Section 3.1: Government Service Modernisation; Public Sector Productivity; Public Health and Education Decision Support; Climate and Disaster Response; Procurement and Standards.]'}

### 4.2 Private Sector

**Lead Coordinating Body:** ${data.privateSector.lead || '[To be assigned]'}

**Implementation Priorities:**

${data.privateSector.priorities || '[Priorities to be drafted. Reference the Blueprint Section 3.2: SME AI Adoption; Large Enterprise AI Governance; Sector-Specific AI Hubs; Workforce Transition; Innovation and Investment.]'}

### 4.3 GDP-Critical Production Sectors

**Sectors Selected for Priority Deployment:**

${gdpSectorText}

**Cross-Sectoral Priorities:**

${data.gdpPriorities || '[Cross-sectoral priorities to be drafted, addressing climate integration, linguistic recognition, the AI-Workforce Compact, and standards harmonisation.]'}

---

## 5. The University Compact

### 5.1 Lead University

${data.compact.leadUni || '[Lead university to be designated as the national node of the Caribbean University AI Compact.]'}

### 5.2 Additional Signatories

${data.compact.signatories || '[Other signatory institutions.]'}

### 5.3 Six Commitments

${commitmentText}

---

## 6. Implementation Roadmap

### 6.1 Phase 1 — Foundation (2026 – 2027)

${data.phase1 || '[Phase 1 milestones. Reference the Blueprint Section 6, Phase 1 — National AI Policy Statement adopted; National AI Council established; AI Public Register launched; University Compact convened; Community AI Centres opened in pilot districts.]'}

### 6.2 Phase 2 — Expansion (2028 – 2029)

${data.phase2 || '[Phase 2 milestones. Reference the Blueprint Section 6, Phase 2 — Sectoral AI Hubs operational; Caribbean Data Trust participation; regional doctoral programme launched; first State of AI in Education report.]'}

### 6.3 Phase 3 — Consolidation (2030 – 2031)

${data.phase3 || '[Phase 3 milestones. Reference the Blueprint Section 6, Phase 3 — measurable improvement in AI investment share; documented talent retention; second-cycle policy reviews; established Caribbean voice in international AI governance fora.]'}

---

## 7. Risk Register

${riskText || '[Top risks and mitigations to be specified.]'}

---

## 8. Accountability and Reporting

This plan adopts the accountability commitments of the Caribbean AI Deployment Blueprint:

- Annual *State of AI in the Nation* report, tabled in Parliament, accessible in plain language.
- Public register of government AI deployments, updated quarterly.
- Independent academic evaluation funded as a line item, not a discretionary grant.
- Civil society audit rights, including for unions, consumer organisations, and disability advocacy bodies.
- Twenty-four-month policy review cycle.

---

## 9. References

- Jowallah, R. (2026). *Caribbean AI Deployment Blueprint: A sovereign pathway for inclusive AI across public sector, private sector, and GDP-critical industries — anchored in education.* Working paper.
- Jowallah, R. (Ed.). (forthcoming). *Sovereign Intelligence: A Caribbean Framework for AI Leadership in Education and Policy.* IGI Global.
- Simmons, E., Ramsewak, D., Kissoon, P., & Bissessar, C. (2024). *Caribbean Artificial Intelligence Policy Roadmap.* Caribbean Telecommunications Union.
- UNESCO. (2021). *Recommendation on the Ethics of Artificial Intelligence.*
- OECD. (2024). *OECD Principles on Artificial Intelligence (revised).*
- NIST. (2023). *AI Risk Management Framework (AI RMF 1.0).*
- Carroll, S. R. et al. (2020). The CARE Principles for Indigenous Data Governance. *Data Science Journal*, 19(1), 43.
- Heeks, R. (2022). Digital inequality beyond the digital divide. *Information Technology for Development*, 28(4), 688–704.
- Mohamed, S., Png, M.-T., & Isaac, W. (2020). Decolonial AI. *Philosophy & Technology*, 33(4), 659–684.

---

*Working document prepared using the Caribbean AI Implementation Planner.*
*Based on the Caribbean AI Deployment Blueprint by Dr. Rohan Jowallah (2026).*
`;
}
