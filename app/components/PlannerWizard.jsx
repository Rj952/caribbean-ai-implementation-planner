'use client';

import { useState, useEffect, useRef } from 'react';
import {
  ChevronRight, ChevronLeft, Compass, Eye, Users, GraduationCap, Database, Search,
  BookOpen, Building2, Briefcase, Factory, FileText, AlertTriangle, CheckCircle2,
  Circle, ArrowRight, Loader2, Sparkles, Copy, Printer, RotateCcw, Download, FileDown
} from 'lucide-react';

import {
  COUNTRIES, COUNTRY_LIST, PRINCIPLES, GDP_SECTORS, COMMITMENTS, SUGGESTED_RISKS
} from '@/lib/data';
import { streamClaude } from '@/lib/claude-client';
import { generateMarkdown } from '@/lib/document-generator';
import { exportDocx } from '@/lib/docx-generator';
import { exportPdf } from '@/lib/pdf-generator';
import { Field, RangeField, StepHeader, Callout } from './FormHelpers';

const ICON_MAP = { Compass, Eye, Users, GraduationCap, Database, Search, BookOpen };

const STEPS = [
  { label: 'Welcome', short: 'Start' },
  { label: 'Country Profile', short: 'Country' },
  { label: 'National AI Vision', short: 'Vision' },
  { label: 'Seven Principles', short: 'Principles' },
  { label: 'Three-Sector Pathway', short: 'Sectors' },
  { label: 'University Compact', short: 'Compact' },
  { label: 'Roadmap', short: 'Roadmap' },
  { label: 'Risk Register', short: 'Risks' },
  { label: 'Generate Document', short: 'Generate' }
];

const initialData = () => ({
  country: '', population: '', leadAgency: '', preparedBy: '',
  date: new Date().toISOString().slice(0, 10), version: '1.0',
  vision: '', priorities: ['', '', ''], anchors: '', languages: '',
  constitutional: '', existing: '', institutions: '',
  principles: PRINCIPLES.reduce((acc, p) => {
    acc[p.id] = { current: 2, target: 4, lead: '', actions: '' };
    return acc;
  }, {}),
  publicSector: { lead: '', priorities: '' },
  privateSector: { lead: '', priorities: '' },
  gdpSelected: [], gdpPriorities: '',
  compact: {
    leadUni: '', signatories: '',
    selected: COMMITMENTS.reduce((acc, c) => { acc[c.id] = false; return acc; }, {})
  },
  phase1: '', phase2: '', phase3: '',
  risks: [{ risk: '', mitigation: '' }, { risk: '', mitigation: '' }, { risk: '', mitigation: '' }]
});

const STORAGE_KEY = 'caribbean-ai-implementation-draft';

export default function PlannerWizard() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState(initialData);
  const [loaded, setLoaded] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle');
  const [showOutput, setShowOutput] = useState(false);
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(null);
  const saveTimer = useRef(null);
  const announceRef = useRef(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setData(prev => ({ ...prev, ...JSON.parse(raw) }));
    } catch { /* ignore */ }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaveStatus('saving');
    saveTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 1500);
      } catch { setSaveStatus('error'); }
    }, 800);
    return () => saveTimer.current && clearTimeout(saveTimer.current);
  }, [data, loaded]);

  const updateField = (k, v) => setData(p => ({ ...p, [k]: v }));
  const updateNested = (parent, k, v) =>
    setData(p => ({ ...p, [parent]: { ...p[parent], [k]: v } }));

  const handleCountrySelect = country => {
    if (!country) return;
    const d = COUNTRIES[country];
    setData(prev => ({
      ...prev, country,
      population: prev.population || d.population,
      institutions: prev.institutions || d.institutions,
      existing: prev.existing || d.existing,
      languages: prev.languages || d.languages,
      constitutional: prev.constitutional || d.constitutional
    }));
  };

  const resetAll = () => {
    if (typeof window !== 'undefined' && !window.confirm('Reset all data? This cannot be undone.')) return;
    setData(initialData());
    setStep(0);
    setShowOutput(false);
  };

  const announce = msg => { if (announceRef.current) announceRef.current.textContent = msg; };
  const next = () => setStep(s => {
    const n = Math.min(s + 1, STEPS.length - 1);
    announce(`Step ${n + 1} of ${STEPS.length}: ${STEPS[n].label}`);
    return n;
  });
  const prev = () => setStep(s => {
    const n = Math.max(s - 1, 0);
    announce(`Step ${n + 1} of ${STEPS.length}: ${STEPS[n].label}`);
    return n;
  });

  const docText = generateMarkdown(data);
  const slug = (data.country || 'caribbean').toLowerCase().replace(/[^a-z0-9]+/g, '-');

  const copyDocument = async () => {
    try {
      await navigator.clipboard.writeText(docText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.alert('Copy failed. You can manually select and copy the document text.');
    }
  };

  const handleDocxExport = async () => {
    setExporting('docx');
    try { await exportDocx(data, `${slug}-ai-implementation-plan.docx`); }
    catch (e) { window.alert('Word export failed: ' + (e.message || 'unknown error')); }
    finally { setExporting(null); }
  };

  const handlePdfExport = () => {
    setExporting('pdf');
    try { exportPdf(data, `${slug}-ai-implementation-plan.pdf`); }
    catch (e) { window.alert('PDF export failed: ' + (e.message || 'unknown error')); }
    finally { setExporting(null); }
  };

  if (!loaded) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-cb-sea" aria-label="Loading" />
      </div>
    );
  }

  return (
    <>
      <div ref={announceRef} aria-live="polite" aria-atomic="true" className="sr-only" />

      {/* Save status bar */}
      <div className="border-b" style={{ borderColor: 'var(--cb-line)', background: 'var(--cb-paper)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-end">
          <div className="flex items-center gap-2 text-xs font-mono text-cb-mute" aria-live="polite">
            {saveStatus === 'saving' && (<><Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" /><span>Saving</span></>)}
            {saveStatus === 'saved' && (<><CheckCircle2 className="w-3 h-3 text-cb-palm" aria-hidden="true" /><span>Saved</span></>)}
            {saveStatus === 'error' && <span className="text-cb-red">Save error</span>}
          </div>
        </div>
      </div>

      {/* Step indicator */}
      <nav aria-label="Wizard steps" className="border-b" style={{ borderColor: '#E5DFC8', background: 'var(--cb-paper)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 overflow-x-auto">
          <ol className="flex items-center gap-1 min-w-max list-none p-0 m-0">
            {STEPS.map((s, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => setStep(i)}
                  aria-current={i === step ? 'step' : undefined}
                  aria-label={`Step ${i + 1} of ${STEPS.length}: ${s.label}${i < step ? ' (completed)' : ''}`}
                  className="flex items-center gap-2 px-3 py-2 transition-all"
                  style={{
                    background: i === step ? 'var(--cb-sea)' : 'transparent',
                    color: i === step ? '#FFFFFF' : i < step ? 'var(--cb-teal)' : 'var(--cb-mute)',
                    fontSize: '12px',
                    fontFamily: '"IBM Plex Mono", monospace',
                    letterSpacing: '0.05em',
                    borderRadius: '2px',
                    minHeight: '36px',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <span style={{ opacity: 0.6 }}>{String(i).padStart(2, '0')}</span>
                  <span className="hidden sm:inline">{s.label}</span>
                  <span className="sm:hidden">{s.short}</span>
                  {i < step && <CheckCircle2 className="w-3 h-3" aria-hidden="true" />}
                </button>
              </li>
            ))}
          </ol>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 animate-fade-up">
        {step === 0 && <StepWelcome onNext={next} onReset={resetAll} />}

        {step === 1 && (
          <StepCountry data={data} updateField={updateField} handleCountrySelect={handleCountrySelect} />
        )}

        {step === 2 && (
          <StepVision data={data} updateField={updateField} />
        )}

        {step === 3 && (
          <StepPrinciples data={data} setData={setData} />
        )}

        {step === 4 && (
          <StepSectors data={data} updateField={updateField} updateNested={updateNested} />
        )}

        {step === 5 && (
          <StepCompact data={data} setData={setData} updateNested={updateNested} />
        )}

        {step === 6 && (
          <StepRoadmap data={data} updateField={updateField} />
        )}

        {step === 7 && (
          <StepRisks data={data} updateField={updateField} />
        )}

        {step === 8 && (
          <StepGenerate
            data={data}
            docText={docText}
            showOutput={showOutput}
            setShowOutput={setShowOutput}
            copied={copied}
            copyDocument={copyDocument}
            handleDocxExport={handleDocxExport}
            handlePdfExport={handlePdfExport}
            exporting={exporting}
          />
        )}

        {/* Navigation */}
        <hr className="rule" />
        <div className="flex items-center justify-between flex-wrap gap-3">
          <button
            type="button"
            onClick={prev}
            disabled={step === 0}
            className="btn btn-secondary"
          >
            <ChevronLeft className="w-4 h-4" aria-hidden="true" /> Previous
          </button>
          <div className="font-mono text-xs uppercase tracking-wider text-cb-mute">
            Step {step + 1} of {STEPS.length}
          </div>
          {step < STEPS.length - 1 ? (
            <button type="button" onClick={next} className="btn btn-primary">
              Next <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
          ) : (
            <button type="button" onClick={() => setStep(0)} className="btn btn-secondary">
              <RotateCcw className="w-4 h-4" aria-hidden="true" /> Start over
            </button>
          )}
        </div>
      </div>
    </>
  );
}

// ============================================================================
// STEP COMPONENTS
// ============================================================================

function StepWelcome({ onNext, onReset }) {
  return (
    <section aria-labelledby="step-welcome">
      <div className="step-pill text-cb-sun-deep mb-3">Step 00 · Begin</div>
      <h2 id="step-welcome" className="font-display mb-6 text-cb-sea"
          style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 500, lineHeight: 1.05, letterSpacing: '-0.02em' }}>
        From blueprint<br />to working policy.
      </h2>
      <hr className="rule" />
      <div className="space-y-5 font-body text-cb-ink" style={{ fontSize: '17px', lineHeight: 1.65 }}>
        <p>This planner walks you through every section of the <em>Caribbean AI Deployment Blueprint</em> and produces a working implementation document specific to your country.</p>
        <p>You will work through eight stages: country profile, national vision, the seven guiding principles, the three-sector pathway, the University Compact, the implementation roadmap, the risk register, and finally document generation.</p>
        <p>Defaults are pre-populated for known Caribbean countries — every field is editable. Your work is saved automatically to this device.</p>
      </div>
      <div className="mt-8">
        <Callout title="What This Tool Is Not">
          A drafting tool, not a substitute for cabinet review, public consultation, legal advice, or parliamentary scrutiny. The output is a working draft to inform your formal national policy process — not a finished policy document.
        </Callout>
      </div>
      <div className="mt-10 flex items-center justify-between flex-wrap gap-3">
        <button type="button" onClick={onReset} className="btn btn-secondary">
          <RotateCcw className="w-4 h-4" aria-hidden="true" /> Reset
        </button>
        <button type="button" onClick={onNext} className="btn btn-primary">
          Begin Planning <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}

function StepCountry({ data, updateField, handleCountrySelect }) {
  return (
    <section aria-labelledby="step-country">
      <h2 id="step-country" className="sr-only">Country Profile</h2>
      <StepHeader n="01" title="Country Profile" h2="Tell the planner about your country.">
        Selecting a country pre-populates known institutions, languages, and existing initiatives. Every field stays editable.
      </StepHeader>
      <div className="space-y-5">
        <Field label="Country" htmlFor="f-country">
          <select id="f-country" value={data.country} onChange={e => handleCountrySelect(e.target.value)}>
            <option value="">— Select a country —</option>
            {COUNTRY_LIST.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="Population" htmlFor="f-pop">
            <input id="f-pop" type="text" value={data.population} onChange={e => updateField('population', e.target.value)} placeholder="e.g. 2.8 million" />
          </Field>
          <Field label="Document Date" htmlFor="f-date">
            <input id="f-date" type="date" value={data.date} onChange={e => updateField('date', e.target.value)} />
          </Field>
        </div>
        <Field label="Lead Drafting Agency" htmlFor="f-lead">
          <input id="f-lead" type="text" value={data.leadAgency} onChange={e => updateField('leadAgency', e.target.value)} placeholder="e.g. Ministry of Science, Energy, Telecommunications and Transport" />
        </Field>
        <Field label="Prepared By" htmlFor="f-prep">
          <input id="f-prep" type="text" value={data.preparedBy} onChange={e => updateField('preparedBy', e.target.value)} placeholder="Names and titles of drafting team" />
        </Field>
        <Field label="Constitutional & Legal Foundations" htmlFor="f-const">
          <textarea id="f-const" value={data.constitutional} onChange={e => updateField('constitutional', e.target.value)} rows={2} placeholder="Constitution and key statutes anchoring AI policy" />
        </Field>
        <Field label="Languages" htmlFor="f-lang">
          <textarea id="f-lang" value={data.languages} onChange={e => updateField('languages', e.target.value)} rows={2} placeholder="Primary and secondary languages" />
        </Field>
        <Field label="Existing AI Initiatives" htmlFor="f-exist">
          <textarea id="f-exist" value={data.existing} onChange={e => updateField('existing', e.target.value)} rows={2} placeholder="Programmes, taskforces, or strategies already underway" />
        </Field>
        <Field label="Higher Education Institutions" htmlFor="f-inst">
          <textarea id="f-inst" value={data.institutions} onChange={e => updateField('institutions', e.target.value)} rows={2} placeholder="Major universities and colleges in the country" />
        </Field>
      </div>
    </section>
  );
}

function StepVision({ data, updateField }) {
  return (
    <section aria-labelledby="step-vision">
      <h2 id="step-vision" className="sr-only">National AI Vision</h2>
      <StepHeader n="02" title="National AI Vision" h2="State the strategic horizon.">
        The vision should articulate your country&apos;s aspiration for AI deployment over a 5–10 year horizon, grounded in regional moral and constitutional traditions.
      </StepHeader>
      <div className="space-y-5">
        <Field label="Vision Statement" htmlFor="f-vision">
          <textarea id="f-vision" value={data.vision} onChange={e => updateField('vision', e.target.value)} rows={5} placeholder="By 2031, [country] will have established a sovereign, inclusive AI ecosystem that..." />
          <ClaudeSuggestButton
            field="Vision Statement"
            data={data}
            existing={data.vision}
            onAccept={txt => updateField('vision', txt)}
          />
        </Field>
        <fieldset>
          <legend className="font-mono text-xs uppercase tracking-wider block mb-2 text-cb-mute">Strategic Priorities (up to 3)</legend>
          {data.priorities.map((p, i) => (
            <input
              key={i}
              type="text"
              value={p}
              onChange={e => {
                const next = [...data.priorities];
                next[i] = e.target.value;
                updateField('priorities', next);
              }}
              placeholder={`Priority ${i + 1}`}
              aria-label={`Strategic priority ${i + 1}`}
              className="mb-3"
            />
          ))}
          <ClaudeSuggestButton
            field="Strategic Priorities"
            data={data}
            existing={data.priorities.filter(Boolean).join('\n')}
            onAccept={txt => {
              const lines = txt.split(/\n+/).map(l => l.replace(/^[-*\d.\s]+/, '').trim()).filter(Boolean).slice(0, 3);
              const next = ['', '', ''];
              lines.forEach((l, i) => { if (i < 3) next[i] = l; });
              updateField('priorities', next);
            }}
          />
        </fieldset>
        <Field label="Cultural & Moral Anchors" htmlFor="f-anchors">
          <textarea id="f-anchors" value={data.anchors} onChange={e => updateField('anchors', e.target.value)} rows={3} placeholder="e.g. CARICOM Charter of Civil Society; reparations advocacy; climate-justice leadership; Indigenous Peoples' rights" />
          <ClaudeSuggestButton
            field="Cultural & Moral Anchors"
            data={data}
            existing={data.anchors}
            onAccept={txt => updateField('anchors', txt)}
          />
        </Field>
      </div>
    </section>
  );
}

function StepPrinciples({ data, setData }) {
  return (
    <section aria-labelledby="step-princ">
      <h2 id="step-princ" className="sr-only">Seven Principles</h2>
      <StepHeader n="03" title="Seven Principles" h2={<>Assess current state.<br />Set the target.</>}>
        For each of the seven principles from the Jowallah Governance Wheel, rate where your country stands today (1–5), where you intend to be (1–5), assign a lead agency, and outline implementation actions. The gap defines the work.
      </StepHeader>
      <div className="space-y-5">
        {PRINCIPLES.map((p, idx) => {
          const Icon = ICON_MAP[p.iconName];
          const pd = data.principles[p.id];
          const updatePrinciple = (patch) =>
            setData(prev => ({
              ...prev,
              principles: { ...prev.principles, [p.id]: { ...pd, ...patch } }
            }));
          return (
            <details key={p.id} className="principle-card" open={idx === 0}>
              <summary className="flex items-start gap-4">
                <div style={{
                  width: '40px', height: '40px', background: 'var(--cb-sand)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }} aria-hidden="true">
                  <Icon className="w-5 h-5 text-cb-sea" />
                </div>
                <div className="flex-1">
                  <div className="font-mono text-xs uppercase tracking-wider text-cb-sun-deep">Principle {idx + 1}</div>
                  <div className="font-display text-cb-sea" style={{ fontSize: '20px', fontWeight: 600, marginTop: '2px' }}>{p.name}</div>
                  <div className="font-body text-sm mt-1 text-cb-mute leading-snug">{p.desc}</div>
                </div>
                <ChevronRight className="w-5 h-5 flex-shrink-0 text-cb-mute" aria-hidden="true" />
              </summary>
              <div className="mt-5 pt-5 space-y-4" style={{ borderTop: '1px solid #E5DFC8' }}>
                <div className="grid sm:grid-cols-2 gap-5">
                  <RangeField label="Current State" id={`${p.id}-cur`} value={pd.current} color="var(--cb-sea)"
                    onChange={v => updatePrinciple({ current: v })} />
                  <RangeField label="Target State" id={`${p.id}-tgt`} value={pd.target} color="var(--cb-teal)"
                    onChange={v => updatePrinciple({ target: v })} />
                </div>
                <Field label="Lead Agency or Body" htmlFor={`${p.id}-lead`}>
                  <input id={`${p.id}-lead`} type="text" value={pd.lead}
                    onChange={e => updatePrinciple({ lead: e.target.value })}
                    placeholder="Ministry, taskforce, or council responsible" />
                </Field>
                <Field label="Implementation Actions" htmlFor={`${p.id}-act`}>
                  <textarea id={`${p.id}-act`} value={pd.actions}
                    onChange={e => updatePrinciple({ actions: e.target.value })}
                    rows={3} placeholder="What will be done, by whom, and by when" />
                </Field>
                <div className="p-4" style={{ background: 'var(--cb-sand)', borderLeft: '3px solid var(--cb-sun)' }}>
                  <div className="font-mono text-xs uppercase tracking-wider mb-1 text-cb-sea">
                    Suggested from the Blueprint
                  </div>
                  <p className="font-body text-sm text-cb-ink leading-relaxed">{p.suggest}</p>
                </div>
              </div>
            </details>
          );
        })}
      </div>
    </section>
  );
}

function StepSectors({ data, updateField, updateNested }) {
  return (
    <section aria-labelledby="step-sectors">
      <h2 id="step-sectors" className="sr-only">Three-Sector Pathway</h2>
      <StepHeader n="04" title="Three-Sector Pathway" h2={<>Public. Private.<br />GDP-critical.</>}>
        Each sector requires tailored AI deployment, but all three operate under one coherent governance framework. Education sits across all three as the strategic anchor.
      </StepHeader>
      <div className="space-y-6">
        <SectorCard
          n="One"
          title="Public Sector"
          icon={Building2}
          leadValue={data.publicSector.lead}
          onLead={v => updateNested('publicSector', 'lead', v)}
          prioritiesValue={data.publicSector.priorities}
          onPriorities={v => updateNested('publicSector', 'priorities', v)}
          prioritiesPlaceholder="Implementation priorities — government services, public sector productivity, decision support, climate response, procurement"
        />
        <SectorCard
          n="Two"
          title="Private Sector"
          icon={Briefcase}
          leadValue={data.privateSector.lead}
          onLead={v => updateNested('privateSector', 'lead', v)}
          prioritiesValue={data.privateSector.priorities}
          onPriorities={v => updateNested('privateSector', 'priorities', v)}
          prioritiesPlaceholder="Implementation priorities — SME adoption, large-enterprise governance, sectoral hubs, workforce transition, innovation funding"
        />

        <div className="principle-card">
          <div className="flex items-center gap-3 mb-4">
            <div style={{
              width: '40px', height: '40px', background: 'var(--cb-sand)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }} aria-hidden="true">
              <Factory className="w-5 h-5 text-cb-sea" />
            </div>
            <div>
              <div className="font-mono text-xs uppercase tracking-wider text-cb-sun-deep">Sector Three</div>
              <div className="font-display text-cb-sea" style={{ fontSize: '20px', fontWeight: 600 }}>GDP-Critical Production</div>
            </div>
          </div>
          <fieldset className="mb-4">
            <legend className="font-mono text-xs uppercase tracking-wider block mb-2 text-cb-mute">
              Select sectors for priority deployment
            </legend>
            <div className="flex flex-wrap gap-2" role="group">
              {GDP_SECTORS.map(s => {
                const active = data.gdpSelected.includes(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => {
                      const next = active
                        ? data.gdpSelected.filter(x => x !== s.id)
                        : [...data.gdpSelected, s.id];
                      updateField('gdpSelected', next);
                    }}
                    className={`gdp-tag ${active ? 'active' : ''}`}
                  >
                    <span aria-hidden="true">{s.icon}</span> {s.label}
                  </button>
                );
              })}
            </div>
          </fieldset>
          <Field label="Cross-Sectoral Priorities" htmlFor="f-gdp-pri">
            <textarea
              id="f-gdp-pri"
              placeholder="Climate integration, linguistic recognition, AI-Workforce Compact, standards harmonisation"
              value={data.gdpPriorities}
              onChange={e => updateField('gdpPriorities', e.target.value)}
              rows={4}
            />
          </Field>
        </div>
      </div>
    </section>
  );
}

function SectorCard({ n, title, icon: Icon, leadValue, onLead, prioritiesValue, onPriorities, prioritiesPlaceholder }) {
  const idLead = `f-${title.replace(/\s+/g, '-').toLowerCase()}-lead`;
  const idPri = `f-${title.replace(/\s+/g, '-').toLowerCase()}-pri`;
  return (
    <div className="principle-card">
      <div className="flex items-center gap-3 mb-4">
        <div style={{
          width: '40px', height: '40px', background: 'var(--cb-sand)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }} aria-hidden="true">
          <Icon className="w-5 h-5 text-cb-sea" />
        </div>
        <div>
          <div className="font-mono text-xs uppercase tracking-wider text-cb-sun-deep">Sector {n}</div>
          <div className="font-display text-cb-sea" style={{ fontSize: '20px', fontWeight: 600 }}>{title}</div>
        </div>
      </div>
      <div className="space-y-3">
        <Field label="Lead coordinating body" htmlFor={idLead}>
          <input id={idLead} type="text" value={leadValue} onChange={e => onLead(e.target.value)} placeholder="Lead coordinating body" />
        </Field>
        <Field label="Implementation Priorities" htmlFor={idPri}>
          <textarea id={idPri} placeholder={prioritiesPlaceholder} value={prioritiesValue} onChange={e => onPriorities(e.target.value)} rows={4} />
        </Field>
      </div>
    </div>
  );
}

function StepCompact({ data, setData, updateNested }) {
  return (
    <section aria-labelledby="step-compact">
      <h2 id="step-compact" className="sr-only">University Compact</h2>
      <StepHeader n="05" title="University Compact" h2={<>Universities are<br />the engine room.</>}>
        Designate the lead university as your country&apos;s node in the Caribbean University AI Compact, name additional signatories, and indicate which of the six commitments your institutions are prepared to make.
      </StepHeader>
      <div className="space-y-5">
        <Field label="Lead University" htmlFor="f-leaduni">
          <input id="f-leaduni" type="text" value={data.compact.leadUni} onChange={e => updateNested('compact', 'leadUni', e.target.value)} placeholder="The institution that will convene and report" />
        </Field>
        <Field label="Additional Signatories" htmlFor="f-signs">
          <textarea id="f-signs" value={data.compact.signatories} onChange={e => updateNested('compact', 'signatories', e.target.value)} rows={3} placeholder="Other universities and tertiary institutions joining the Compact" />
        </Field>
        <fieldset>
          <legend className="font-mono text-xs uppercase tracking-wider block mb-3 text-cb-mute">Six Commitments</legend>
          <div className="space-y-2" role="group" aria-label="Compact commitments">
            {COMMITMENTS.map(c => {
              const checked = data.compact.selected[c.id];
              return (
                <button
                  key={c.id}
                  type="button"
                  role="checkbox"
                  aria-checked={checked}
                  onClick={() =>
                    setData(prev => ({
                      ...prev,
                      compact: {
                        ...prev.compact,
                        selected: { ...prev.compact.selected, [c.id]: !checked }
                      }
                    }))
                  }
                  className={`checkbox-row w-full text-left ${checked ? 'selected' : ''}`}
                  style={{ background: checked ? 'var(--cb-aqua-soft)' : 'var(--cb-paper)' }}
                >
                  {checked
                    ? <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-cb-teal" aria-hidden="true" />
                    : <Circle className="w-5 h-5 flex-shrink-0 mt-0.5 text-cb-mute" aria-hidden="true" />}
                  <div>
                    <div className="font-display font-semibold text-cb-sea" style={{ fontSize: '15px' }}>{c.label}</div>
                    <div className="font-body text-sm mt-1 text-cb-mute leading-snug">{c.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </fieldset>
      </div>
    </section>
  );
}

function StepRoadmap({ data, updateField }) {
  const phases = [
    { k: 'phase1', n: '01', t: 'Foundation', y: '2026 – 2027', s: 'Policy Statement adopted, AI Council established, Compact convened, Community AI Centres opened.' },
    { k: 'phase2', n: '02', t: 'Expansion', y: '2028 – 2029', s: 'Sectoral Hubs operational, Caribbean Data Trust participation, doctoral programme, first State-of-AI report.' },
    { k: 'phase3', n: '03', t: 'Consolidation', y: '2030 – 2031', s: 'Investment share improvements, talent retention, second-cycle policy reviews, Caribbean voice in international fora.' }
  ];
  return (
    <section aria-labelledby="step-roadmap">
      <h2 id="step-roadmap" className="sr-only">Implementation Roadmap</h2>
      <StepHeader n="06" title="Implementation Roadmap" h2={<>Three phases.<br />Five years.</>}>
        The phasing is suggestive, not rigid. Specific countries will move faster or slower in particular elements based on existing conditions. The principle is alignment, not uniformity.
      </StepHeader>
      <div className="space-y-6">
        {phases.map(ph => (
          <div key={ph.k} className="principle-card">
            <div className="flex items-baseline gap-3 mb-3">
              <span className="font-display text-cb-sun" style={{ fontSize: '28px', fontWeight: 600 }}>{ph.n}</span>
              <div>
                <div className="font-display text-cb-sea" style={{ fontSize: '20px', fontWeight: 600 }}>Phase {ph.n} — {ph.t}</div>
                <div className="font-mono text-xs uppercase tracking-wider text-cb-mute">{ph.y}</div>
              </div>
            </div>
            <p className="font-body text-sm mb-3 text-cb-mute italic">{ph.s}</p>
            <Field label={`Phase ${ph.n} milestones`} htmlFor={`f-${ph.k}`}>
              <textarea id={`f-${ph.k}`} value={data[ph.k]} onChange={e => updateField(ph.k, e.target.value)} rows={4}
                placeholder={`Milestones for Phase ${ph.n} in your country`} />
            </Field>
          </div>
        ))}
      </div>
    </section>
  );
}

function StepRisks({ data, updateField }) {
  return (
    <section aria-labelledby="step-risks">
      <h2 id="step-risks" className="sr-only">Risk Register</h2>
      <StepHeader n="07" title="Risk Register" h2={<>Name what could<br />go wrong.</>}>
        Identify your top three to five country-specific risks and a credible mitigation for each. Click a suggested risk from the Blueprint library to insert it as a starting point.
      </StepHeader>

      <div className="mb-6 p-5" style={{ background: 'var(--cb-sand)', borderLeft: '3px solid var(--cb-sun)' }}>
        <div className="font-mono text-xs uppercase tracking-wider mb-3 text-cb-sea">
          Risk Library — click to insert
        </div>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_RISKS.map((r, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                const empty = data.risks.findIndex(x => !x.risk && !x.mitigation);
                const idx = empty >= 0 ? empty : data.risks.length;
                const next = [...data.risks];
                if (idx >= next.length) next.push({ risk: '', mitigation: '' });
                next[idx] = { risk: r.risk, mitigation: r.mitigation };
                updateField('risks', next);
              }}
              className="gdp-tag"
            >
              <AlertTriangle className="w-3 h-3" aria-hidden="true" />
              {r.risk.length > 40 ? r.risk.slice(0, 40) + '…' : r.risk}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {data.risks.map((r, i) => (
          <div key={i} className="principle-card">
            <div className="flex items-center justify-between mb-3">
              <div className="font-mono text-xs uppercase tracking-wider text-cb-sun-deep">Risk {i + 1}</div>
              {data.risks.length > 1 && (
                <button
                  type="button"
                  onClick={() => updateField('risks', data.risks.filter((_, x) => x !== i))}
                  className="font-mono text-xs uppercase tracking-wider text-cb-mute"
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', minHeight: '32px' }}
                  aria-label={`Remove risk ${i + 1}`}
                >Remove</button>
              )}
            </div>
            <Field label="Risk description" htmlFor={`f-risk-${i}`}>
              <input
                id={`f-risk-${i}`}
                type="text"
                value={r.risk}
                placeholder="Risk description"
                onChange={e => {
                  const next = [...data.risks];
                  next[i] = { ...next[i], risk: e.target.value };
                  updateField('risks', next);
                }}
              />
            </Field>
            <div className="mt-3">
              <Field label="Mitigation strategy" htmlFor={`f-mit-${i}`}>
                <textarea
                  id={`f-mit-${i}`}
                  value={r.mitigation}
                  placeholder="Mitigation strategy"
                  rows={2}
                  onChange={e => {
                    const next = [...data.risks];
                    next[i] = { ...next[i], mitigation: e.target.value };
                    updateField('risks', next);
                  }}
                />
              </Field>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() => updateField('risks', [...data.risks, { risk: '', mitigation: '' }])}
          className="btn btn-secondary w-full justify-center"
        >+ Add another risk</button>
      </div>
    </section>
  );
}

function StepGenerate({ data, docText, showOutput, setShowOutput, copied, copyDocument, handleDocxExport, handlePdfExport, exporting }) {
  return (
    <section aria-labelledby="step-gen">
      <h2 id="step-gen" className="sr-only">Generate Document</h2>
      <StepHeader n="08" title="Generate" h2={<>Your working<br />document is ready.</>}>
        Below is your country&apos;s working AI implementation document, generated from your inputs and the Caribbean AI Deployment Blueprint. Download as Word or PDF, copy as Markdown, or print directly.
      </StepHeader>

      <div className="flex flex-wrap gap-3 mb-6 no-print">
        <button onClick={handleDocxExport} disabled={!!exporting} className="btn btn-primary" type="button">
          {exporting === 'docx'
            ? <><Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> Building Word…</>
            : <><FileDown className="w-4 h-4" aria-hidden="true" /> Download Word</>
          }
        </button>
        <button onClick={handlePdfExport} disabled={!!exporting} className="btn btn-gold" type="button">
          {exporting === 'pdf'
            ? <><Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> Building PDF…</>
            : <><Download className="w-4 h-4" aria-hidden="true" /> Download PDF</>
          }
        </button>
        <button onClick={copyDocument} className="btn btn-secondary" type="button">
          {copied
            ? <><CheckCircle2 className="w-4 h-4" aria-hidden="true" /> Copied</>
            : <><Copy className="w-4 h-4" aria-hidden="true" /> Copy as Markdown</>
          }
        </button>
        <button onClick={() => window.print()} className="btn btn-secondary" type="button">
          <Printer className="w-4 h-4" aria-hidden="true" /> Print
        </button>
        <button onClick={() => setShowOutput(s => !s)} className="btn btn-secondary" type="button"
          aria-expanded={showOutput} aria-controls="output-preview">
          <FileText className="w-4 h-4" aria-hidden="true" /> {showOutput ? 'Hide preview' : 'Show preview'}
        </button>
      </div>

      <Callout icon={Sparkles} title="What you have just produced" tone="teal">
        A working draft national AI implementation plan for {data.country || '[your country]'}, ready for review by your National AI Council, ministry leadership, and university partners. Treat it as a substrate for formal policy development — not a finished policy.
      </Callout>

      {showOutput && (
        <div
          id="output-preview"
          className="mt-6"
          style={{ background: 'var(--cb-paper)', border: '1px solid #E5DFC8', padding: '24px', maxHeight: '600px', overflowY: 'auto' }}
        >
          <pre className="font-body" style={{
            whiteSpace: 'pre-wrap', wordBreak: 'break-word',
            fontSize: '13px', lineHeight: 1.6, color: 'var(--cb-ink)', margin: 0
          }}>{docText}</pre>
        </div>
      )}
    </section>
  );
}


// =====================================================================
// Claude AI suggestion button
// =====================================================================

function ClaudeSuggestButton({ field, data, existing, onAccept }) {
  const [streaming, setStreaming] = useState(false);
  const [draft, setDraft] = useState('');
  const [err, setErr] = useState('');

  const run = async () => {
    setErr('');
    setDraft('');
    setStreaming(true);
    try {
      const ctx = {
        country: data.country,
        countryName: data.country,
        population: data.population,
        languages: data.languages,
        priorities: (data.priorities || []).filter(Boolean).join('; '),
        sectors: (data.gdpSectors || []).join(', '),
      };
      await streamClaude(
        { mode: 'draft', field, context: ctx, existingText: existing || '' },
        (_chunk, full) => setDraft(full),
      );
    } catch (e) {
      setErr(e.message || 'Suggestion failed.');
    } finally {
      setStreaming(false);
    }
  };

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={run}
        disabled={streaming}
        className="btn btn-secondary"
        style={{ minHeight: '34px', padding: '5px 12px', fontSize: '13px' }}
        aria-busy={streaming}
      >
        {streaming ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
            Drafting…
          </>
        ) : (
          <>
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            Suggest with Claude
          </>
        )}
      </button>
      {err && (
        <div className="font-body text-sm text-cb-red mt-2" role="alert">{err}</div>
      )}
      {draft && (
        <div className="mt-2">
          <div
            className="font-body text-cb-ink leading-relaxed"
            aria-live="polite"
            style={{
              fontSize: '14px',
              background: 'var(--jm-green-soft)',
              padding: '12px 14px',
              borderLeft: '3px solid var(--jm-green)',
              whiteSpace: 'pre-wrap',
            }}
          >
            {draft}
          </div>
          {!streaming && (
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => { onAccept(draft); setDraft(''); }}
                className="btn btn-primary"
                style={{ minHeight: '32px', padding: '4px 12px', fontSize: '12px' }}
              >
                Use this draft
              </button>
              <button
                type="button"
                onClick={() => setDraft('')}
                className="btn btn-secondary"
                style={{ minHeight: '32px', padding: '4px 12px', fontSize: '12px' }}
              >
                Discard
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
