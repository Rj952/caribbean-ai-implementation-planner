'use client';

import { useState, useRef } from 'react';
import {
  Upload, FileText, Loader2, CheckCircle2, AlertTriangle, XCircle,
  Download, FileDown, RotateCcw, ChevronDown, ChevronRight, Sparkles,
  ClipboardPaste, Printer
} from 'lucide-react';
import { extractTextFromFile } from '@/lib/file-parser';
import { evaluatePlan } from '@/lib/plan-evaluator';
import { exportEvaluationDocx } from '@/lib/docx-generator';
import { exportEvaluationPdf } from '@/lib/pdf-generator';
import { Callout, StepHeader } from './FormHelpers';

const ACCEPT =
  '.docx,.pdf,.txt,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/markdown';

export default function PlanEvaluator() {
  const [file, setFile] = useState(null);
  const [stage, setStage] = useState('idle'); // idle | reading | evaluating | done | error
  const [error, setError] = useState('');
  const [report, setReport] = useState(null);
  const [pasteMode, setPasteMode] = useState(false);
  const [pastedText, setPastedText] = useState('');
  const [exporting, setExporting] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [openSection, setOpenSection] = useState(null);
  const inputRef = useRef(null);

  const handleFile = async f => {
    if (!f) return;
    setFile(f);
    setError('');
    setStage('reading');
    try {
      const { text, words } = await extractTextFromFile(f);
      if (!text || text.trim().length < 200) {
        throw new Error(
          'The uploaded file appears to contain very little text. If it is a scanned PDF, OCR the document first and try again.'
        );
      }
      setStage('evaluating');
      await new Promise(r => setTimeout(r, 350));
      const r = evaluatePlan(text, { sourceName: f.name, wordCount: words });
      setReport(r);
      setStage('done');
    } catch (e) {
      setError(e.message || 'Could not read this file.');
      setStage('error');
    }
  };

  const handlePastedEvaluate = () => {
    setError('');
    if (pastedText.trim().length < 200) {
      setError('Please paste at least a few paragraphs of plan text.');
      setStage('error');
      return;
    }
    setStage('evaluating');
    setTimeout(() => {
      const wc = (pastedText.trim().match(/\S+/g) || []).length;
      const r = evaluatePlan(pastedText, { sourceName: 'Pasted text', wordCount: wc });
      setReport(r);
      setStage('done');
    }, 350);
  };

  const onDrop = e => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const reset = () => {
    setFile(null);
    setReport(null);
    setStage('idle');
    setError('');
    setPastedText('');
    setOpenSection(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleDocxExport = async () => {
    if (!report) return;
    setExporting('docx');
    try {
      await exportEvaluationDocx(report, 'plan-evaluation-report.docx');
    } catch (e) {
      window.alert('Word export failed: ' + (e.message || 'unknown error'));
    } finally {
      setExporting(null);
    }
  };

  const handlePdfExport = () => {
    if (!report) return;
    setExporting('pdf');
    try {
      exportEvaluationPdf(report, 'plan-evaluation-report.pdf');
    } catch (e) {
      window.alert('PDF export failed: ' + (e.message || 'unknown error'));
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 animate-fade-up">
      <StepHeader n="•" title="Evaluate an Existing Plan" h2={<>Upload your plan.<br />Get a Blueprint-aligned reading.</>}>
        Upload a draft AI policy as <strong>.docx</strong>, <strong>.pdf</strong>, <strong>.txt</strong>, or <strong>.md</strong>. The tool runs a heuristic evaluation against the seven principles, three sectors, and structural elements of the Blueprint, then produces a prioritised action plan covering exactly what to amend.
      </StepHeader>

      {(stage === 'idle' || stage === 'error') && !report && (
        <UploadPanel
          inputRef={inputRef}
          onPickFile={handleFile}
          dragOver={dragOver}
          setDragOver={setDragOver}
          onDrop={onDrop}
          pasteMode={pasteMode}
          setPasteMode={setPasteMode}
          pastedText={pastedText}
          setPastedText={setPastedText}
          onPastedEvaluate={handlePastedEvaluate}
        />
      )}

      {error && (
        <div
          className="mt-6 p-5 flex items-start gap-3"
          style={{ background: 'rgba(200, 16, 46, 0.08)', borderLeft: '3px solid var(--cb-red)' }}
          role="alert"
        >
          <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-cb-red" aria-hidden="true" />
          <div className="flex-1">
            <div className="font-display font-semibold text-cb-sea mb-1">We could not process that input</div>
            <p className="font-body text-sm text-cb-ink leading-relaxed">{error}</p>
            <button onClick={reset} className="btn btn-secondary mt-3" type="button">
              <RotateCcw className="w-4 h-4" aria-hidden="true" /> Try again
            </button>
          </div>
        </div>
      )}

      {(stage === 'reading' || stage === 'evaluating') && (
        <div
          className="mt-8 p-10 text-center"
          style={{ background: 'var(--cb-paper)', border: '1px solid #E5DFC8' }}
          role="status"
          aria-live="polite"
        >
          <Loader2 className="w-10 h-10 animate-spin mx-auto text-cb-teal" aria-hidden="true" />
          <div className="font-display text-cb-sea mt-4" style={{ fontSize: '22px', fontWeight: 600 }}>
            {stage === 'reading' ? 'Reading the document…' : 'Evaluating against the Blueprint…'}
          </div>
          <p className="font-body text-sm text-cb-mute mt-2">
            {stage === 'reading'
              ? 'Extracting text — large PDFs may take a moment.'
              : 'Scoring the seven principles, three sectors, and structural elements.'}
          </p>
        </div>
      )}

      {stage === 'done' && report && (
        <ReportView
          report={report}
          openSection={openSection}
          setOpenSection={setOpenSection}
          onReset={reset}
          onDocx={handleDocxExport}
          onPdf={handlePdfExport}
          exporting={exporting}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Upload panel
// ---------------------------------------------------------------------------
function UploadPanel({
  inputRef, onPickFile, dragOver, setDragOver, onDrop,
  pasteMode, setPasteMode, pastedText, setPastedText, onPastedEvaluate
}) {
  return (
    <div className="space-y-5">
      {!pasteMode && (
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className="border-2 border-dashed p-10 sm:p-14 text-center transition-all"
          style={{
            borderColor: dragOver ? 'var(--cb-teal)' : 'var(--cb-line)',
            background: dragOver ? 'var(--cb-aqua-soft)' : 'var(--cb-paper)',
            borderRadius: '4px'
          }}
        >
          <div
            className="mx-auto w-16 h-16 flex items-center justify-center mb-4"
            style={{ background: 'var(--cb-sand)', borderRadius: '50%' }}
            aria-hidden="true"
          >
            <Upload className="w-7 h-7 text-cb-sea" />
          </div>
          <div className="font-display text-cb-sea mb-2" style={{ fontSize: '22px', fontWeight: 600 }}>
            Drop your plan here, or browse
          </div>
          <p className="font-body text-sm text-cb-mute mb-6 max-w-md mx-auto">
            Supports <code className="font-mono text-xs">.docx</code>, <code className="font-mono text-xs">.pdf</code>, <code className="font-mono text-xs">.txt</code>, and <code className="font-mono text-xs">.md</code>. Files are processed entirely in your browser — nothing is uploaded to a server.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="btn btn-primary"
            >
              <Upload className="w-4 h-4" aria-hidden="true" /> Choose file
            </button>
            <button
              type="button"
              onClick={() => setPasteMode(true)}
              className="btn btn-secondary"
            >
              <ClipboardPaste className="w-4 h-4" aria-hidden="true" /> Paste text instead
            </button>
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPT}
              className="sr-only"
              onChange={e => {
                const f = e.target.files?.[0];
                if (f) onPickFile(f);
              }}
              aria-label="Choose a plan file to upload"
            />
          </div>
        </div>
      )}

      {pasteMode && (
        <div>
          <label
            htmlFor="paste-area"
            className="font-mono text-xs uppercase tracking-wider block mb-2 text-cb-mute"
          >
            Paste your plan text
          </label>
          <textarea
            id="paste-area"
            value={pastedText}
            onChange={e => setPastedText(e.target.value)}
            rows={14}
            placeholder="Paste the full text of your draft AI policy here. The more text you provide, the more accurate the evaluation."
          />
          <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
            <button
              type="button"
              onClick={() => { setPasteMode(false); setPastedText(''); }}
              className="btn btn-secondary"
            >
              <Upload className="w-4 h-4" aria-hidden="true" /> Upload a file instead
            </button>
            <button
              type="button"
              onClick={onPastedEvaluate}
              disabled={pastedText.trim().length < 200}
              className="btn btn-primary"
            >
              <Sparkles className="w-4 h-4" aria-hidden="true" /> Evaluate
            </button>
          </div>
        </div>
      )}

      <Callout title="What the evaluation looks for">
        Coverage of the seven Blueprint principles (Policy & Ethics, Transparency, Equity, Capacity, Assessment, Data, Evaluation), the three-sector pathway (public, private, GDP-critical), and structural elements (university compact, roadmap phasing, risk register, sovereignty framing). Each section is scored Strong / Partial / Absent with a prioritised action plan covering exactly what to amend.
      </Callout>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Report view
// ---------------------------------------------------------------------------
function ReportView({ report, openSection, setOpenSection, onReset, onDocx, onPdf, exporting }) {
  const ringColor =
    report.overall.score >= 75
      ? 'var(--cb-palm)'
      : report.overall.score >= 35
        ? 'var(--cb-sun-deep)'
        : 'var(--cb-red)';

  return (
    <div className="space-y-8">
      {/* Header / Score */}
      <div
        className="p-6 sm:p-8"
        style={{ background: 'var(--cb-paper)', border: '1px solid #E5DFC8' }}
      >
        <div className="step-pill text-cb-sun-deep mb-3">Evaluation Complete</div>
        <div className="flex items-start justify-between flex-wrap gap-6">
          <div className="flex-1 min-w-[220px]">
            <h2
              className="font-display text-cb-sea mb-2"
              style={{ fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 600, lineHeight: 1.15, letterSpacing: '-0.01em' }}
            >
              Overall Coverage
            </h2>
            <p className="font-body text-cb-ink leading-relaxed">{report.overall.summary}</p>
            <p className="font-body text-sm mt-2 text-cb-mute">
              Source: <strong className="text-cb-ink">{report.sourceName}</strong>{' '}
              · {report.wordCount.toLocaleString()} words
            </p>
          </div>
          <div className="flex flex-col items-center">
            <ScoreRing score={report.overall.score} color={ringColor} />
            <div
              className="font-mono text-xs uppercase tracking-wider mt-3 text-center max-w-[180px]"
              style={{ color: ringColor }}
            >
              {report.overall.band}
            </div>
          </div>
        </div>

        <hr className="rule" />

        <div className="flex flex-wrap gap-3">
          <button onClick={onDocx} disabled={!!exporting} className="btn btn-primary" type="button">
            {exporting === 'docx'
              ? <><Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> Building Word…</>
              : <><FileDown className="w-4 h-4" aria-hidden="true" /> Download Word</>
            }
          </button>
          <button onClick={onPdf} disabled={!!exporting} className="btn btn-gold" type="button">
            {exporting === 'pdf'
              ? <><Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> Building PDF…</>
              : <><Download className="w-4 h-4" aria-hidden="true" /> Download PDF</>
            }
          </button>
          <button onClick={() => window.print()} className="btn btn-secondary" type="button">
            <Printer className="w-4 h-4" aria-hidden="true" /> Print
          </button>
          <button onClick={onReset} className="btn btn-secondary" type="button">
            <RotateCcw className="w-4 h-4" aria-hidden="true" /> Evaluate another plan
          </button>
        </div>
      </div>

      {/* Strengths & Gaps */}
      <div className="grid md:grid-cols-2 gap-5">
        <SummaryCard
          icon={CheckCircle2}
          title="Strengths"
          tone="palm"
          items={report.strengths.length ? report.strengths : ['— No clear strengths identified above the threshold.']}
          empty={!report.strengths.length}
        />
        <SummaryCard
          icon={AlertTriangle}
          title="Critical Gaps"
          tone="red"
          items={report.gaps.length ? report.gaps : ['— No critical gaps identified.']}
          empty={!report.gaps.length}
        />
      </div>

      {/* Section-by-Section */}
      <section aria-labelledby="section-findings">
        <h3 id="section-findings" className="font-display text-cb-sea mb-4" style={{ fontSize: '24px', fontWeight: 600 }}>
          Section-by-Section Findings
        </h3>
        <div className="space-y-2">
          {report.sections.map((s, i) => (
            <SectionRow
              key={s.key}
              section={s}
              isOpen={openSection === s.key}
              onToggle={() => setOpenSection(openSection === s.key ? null : s.key)}
            />
          ))}
        </div>
      </section>

      {/* Action Plan */}
      <section aria-labelledby="section-actions">
        <h3 id="section-actions" className="font-display text-cb-sea mb-2" style={{ fontSize: '24px', fontWeight: 600 }}>
          Recommended Action Plan
        </h3>
        <p className="font-body text-cb-mute mb-5">
          Prioritised by the size of the gap between what your plan addresses and what the Blueprint specifies. Treat these as amendment hooks for the next revision cycle.
        </p>
        {report.actions.length === 0 ? (
          <Callout icon={CheckCircle2} title="No major amendments required" tone="teal">
            Your plan scores Strong across all evaluated sections. Refinement and iteration are the next moves, not reconstruction.
          </Callout>
        ) : (
          <div className="space-y-4">
            {report.actions.map((a, i) => (
              <ActionCard key={i} index={i + 1} action={a} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
function ScoreRing({ score, color }) {
  const r = 42;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  return (
    <div className="relative" style={{ width: 110, height: 110 }} role="img" aria-label={`Coverage score ${score} percent`}>
      <svg width="110" height="110" viewBox="0 0 110 110" aria-hidden="true">
        <circle cx="55" cy="55" r={r} fill="none" stroke="var(--cb-line)" strokeWidth="8" />
        <circle
          cx="55"
          cy="55"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          transform="rotate(-90 55 55)"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="font-display font-semibold text-cb-sea" style={{ fontSize: '28px', lineHeight: 1 }}>
            {score}
          </div>
          <div className="font-mono text-[10px] uppercase tracking-wider text-cb-mute mt-0.5">
            Coverage
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ icon: Icon, title, tone, items, empty }) {
  const colors = {
    palm:  { bg: 'rgba(46, 139, 87, 0.08)',  bd: 'var(--cb-palm)' },
    red:   { bg: 'rgba(200, 16, 46, 0.08)',  bd: 'var(--cb-red)' },
    sun:   { bg: 'var(--cb-sand)',           bd: 'var(--cb-sun)' }
  }[tone || 'sun'];
  return (
    <div className="p-5" style={{ background: colors.bg, borderLeft: `3px solid ${colors.bd}` }}>
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-5 h-5" style={{ color: colors.bd }} aria-hidden="true" />
        <h3 className="font-display text-cb-sea" style={{ fontSize: '17px', fontWeight: 600 }}>
          {title}
        </h3>
      </div>
      <ul className={`space-y-2 ${empty ? 'opacity-60' : ''}`}>
        {items.map((it, i) => (
          <li key={i} className="font-body text-sm text-cb-ink leading-relaxed">
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}

function StatusBadge({ status }) {
  const cls =
    status === 'Strong'  ? 'badge-strong'  :
    status === 'Partial' ? 'badge-partial' : 'badge-absent';
  return <span className={`badge ${cls}`}>{status}</span>;
}

function PriorityBadge({ priority }) {
  const cls =
    priority === 'Critical' ? 'badge-critical' :
    priority === 'High'     ? 'badge-high'     :
    priority === 'Medium'   ? 'badge-medium'   : 'badge-low';
  return <span className={`badge ${cls}`}>Priority: {priority}</span>;
}

function SectionRow({ section, isOpen, onToggle }) {
  return (
    <div className="principle-card p-0 overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full text-left p-4 sm:p-5 flex items-center gap-4"
        style={{ background: 'transparent', border: 'none', cursor: 'pointer', minHeight: '48px' }}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="font-display text-cb-sea truncate" style={{ fontSize: '15px', fontWeight: 600 }}>
              {section.name}
            </div>
            <StatusBadge status={section.status} />
          </div>
          <div className="mt-2">
            <div className="score-bar">
              <div className="score-bar-fill" style={{ width: `${section.score}%` }} />
            </div>
            <div className="font-mono text-[11px] text-cb-mute mt-1">{section.score}% coverage</div>
          </div>
        </div>
        {isOpen
          ? <ChevronDown className="w-5 h-5 flex-shrink-0 text-cb-mute" aria-hidden="true" />
          : <ChevronRight className="w-5 h-5 flex-shrink-0 text-cb-mute" aria-hidden="true" />}
      </button>
      {isOpen && (
        <div className="px-4 sm:px-5 pb-5" style={{ borderTop: '1px solid #E5DFC8' }}>
          <p className="font-body text-sm text-cb-ink leading-relaxed mt-4">{section.notes}</p>
          {section.missing && section.missing.length > 0 && (
            <div className="mt-3">
              <div className="font-mono text-xs uppercase tracking-wider text-cb-mute mb-2">
                Concepts not detected
              </div>
              <div className="flex flex-wrap gap-2">
                {section.missing.map((m, i) => (
                  <span key={i} className="gdp-tag" style={{ cursor: 'default' }}>
                    {m}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ActionCard({ index, action }) {
  return (
    <article className="principle-card">
      <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
        <div className="flex items-baseline gap-3">
          <span className="font-display text-cb-sun-deep" style={{ fontSize: '20px', fontWeight: 600 }}>
            {String(index).padStart(2, '0')}
          </span>
          <div>
            <h4 className="font-display text-cb-sea" style={{ fontSize: '17px', fontWeight: 600 }}>
              {action.title}
            </h4>
            {action.principle && (
              <div
                className="font-mono text-[11px] uppercase tracking-wider mt-1"
                style={{ color: 'var(--jm-green-deep)' }}
              >
                {action.principle} &nbsp;·&nbsp; {action.score}% coverage
              </div>
            )}
          </div>
        </div>
        <PriorityBadge priority={action.priority} />
      </div>
      <p className="font-body text-sm text-cb-ink leading-relaxed mb-3">{action.rationale}</p>
      <div className="font-mono text-xs uppercase tracking-wider text-cb-mute mb-2">
        Recommended steps
      </div>
      <ol className="space-y-2 list-none p-0">
        {action.steps.map((s, i) => (
          <li key={i} className="flex items-start gap-2 font-body text-sm text-cb-ink leading-relaxed">
            <span
              className="flex-shrink-0 mt-0.5 font-mono text-[11px] text-cb-sun-deep"
              aria-hidden="true"
            >
              {i + 1}.
            </span>
            <span>{s}</span>
          </li>
        ))}
      </ol>
    </article>
  );
}
