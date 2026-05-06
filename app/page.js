'use client';

import { useState, useEffect } from 'react';
import {
  PenSquare,
  FileSearch,
  ArrowRight,
  MapPin,
  ChevronLeft
} from 'lucide-react';
import Header from './components/Header';
import PlannerWizard from './components/PlannerWizard';
import PlanEvaluator from './components/PlanEvaluator';

const STORAGE_KEY = 'caribbean-ai-planner-mode';

export default function Page() {
  const [mode, setMode] = useState('home'); // 'home' | 'draft' | 'evaluate'
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved === 'draft' || saved === 'evaluate') setMode(saved);
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      if (mode === 'home') sessionStorage.removeItem(STORAGE_KEY);
      else sessionStorage.setItem(STORAGE_KEY, mode);
    } catch {
      /* ignore */
    }
  }, [mode, hydrated]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        showBack={mode !== 'home'}
        onBack={() => setMode('home')}
      />

      <main id="main-content" className="flex-1">
        {mode === 'home' && <Home onPick={setMode} />}
        {mode === 'draft' && <PlannerWizard />}
        {mode === 'evaluate' && <PlanEvaluator />}
      </main>

      <Footer />
    </div>
  );
}

function Home({ onPick }) {
  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16 animate-fade-up">
      <div className="step-pill text-cb-sun-deep mb-3" aria-hidden="true">
        <span
          className="bg-cb-sun w-1.5 h-1.5 rounded-full mr-2"
          aria-hidden="true"
        />
        Caribbean AI · Working Policy Tool
      </div>

      <h1 className="font-display text-cb-sea leading-[1.05] tracking-tight"
          style={{ fontSize: 'clamp(34px, 6vw, 60px)', fontWeight: 500, letterSpacing: '-0.02em' }}>
        From blueprint<br />
        <span className="text-cb-teal italic">to working policy.</span>
      </h1>

      <hr className="rule" />

      <div className="grid lg:grid-cols-2 gap-5 max-w-prose mx-auto-none font-body text-cb-ink"
           style={{ fontSize: '17px', lineHeight: 1.65 }}>
        <p className="lg:col-span-2">
          A working tool for ministries, university councils, taskforces, and consulting
          teams across CARICOM and the wider Caribbean. Built on the{' '}
          <em>Caribbean AI Deployment Blueprint</em> by Dr. Rohan Jowallah (2026).
        </p>
        <p className="lg:col-span-2 text-cb-mute">
          Your work is saved automatically to this device. You can return at any time
          to revise.
        </p>
      </div>

      <div className="mt-10 grid md:grid-cols-2 gap-5">
        <ModeCard
          n="01"
          icon={PenSquare}
          title="Draft a New Plan"
          desc="Eight guided stages produce a country-specific working AI implementation document, downloadable as Word or PDF. Defaults are pre-filled for known Caribbean countries; every field stays editable."
          cta="Begin drafting"
          onClick={() => onPick('draft')}
        />
        <ModeCard
          n="02"
          icon={FileSearch}
          title="Evaluate an Existing Plan"
          desc="Upload your draft policy (.docx, .pdf, .txt). Receive a Blueprint-aligned evaluation across the seven principles, three sectors, and structural elements — with a prioritised action plan covering exactly what to amend."
          cta="Upload and evaluate"
          onClick={() => onPick('evaluate')}
          accent
        />
      </div>

      <aside
        className="mt-10 p-5 sm:p-6 border-l-[3px]"
        style={{ background: 'var(--cb-sand)', borderColor: 'var(--cb-sun)' }}
      >
        <div className="step-pill text-cb-sea mb-2">What This Tool Is Not</div>
        <p className="font-body text-sm text-cb-ink leading-relaxed">
          This is a drafting and evaluation tool, not a substitute for cabinet review,
          public consultation, legal advice, or parliamentary scrutiny. The output is a
          working draft to inform your formal national policy process — not a finished
          policy document.
        </p>
      </aside>
    </section>
  );
}

function ModeCard({ n, icon: Icon, title, desc, cta, onClick, accent }) {
  return (
    <button
      onClick={onClick}
      className="text-left bg-cb-paper border p-7 sm:p-8 transition-all duration-200 hover:shadow-lg group"
      style={{
        borderColor: accent ? 'var(--cb-sun)' : 'var(--cb-line)',
        borderWidth: accent ? '2px' : '1px',
        cursor: 'pointer'
      }}
    >
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="font-display text-cb-sun" style={{ fontSize: '34px', fontWeight: 600 }}>
          {n}
        </div>
        <div
          className="w-11 h-11 flex items-center justify-center"
          style={{ background: 'var(--cb-aqua-soft)' }}
        >
          <Icon className="w-5 h-5 text-cb-teal" aria-hidden="true" />
        </div>
      </div>
      <h2 className="font-display text-cb-sea mb-3"
          style={{ fontSize: '24px', fontWeight: 600, letterSpacing: '-0.01em' }}>
        {title}
      </h2>
      <p className="font-body text-cb-slate text-[15px] leading-relaxed mb-5">{desc}</p>
      <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-cb-teal group-hover:text-cb-sea transition-colors">
        {cta}
        <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
      </span>
    </button>
  );
}

function Footer() {
  return (
    <footer className="border-t mt-12 py-8" style={{ borderColor: 'var(--cb-line)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="font-display font-semibold text-cb-sea text-[15px]">
              Caribbean AI Implementation Planner
            </div>
            <div className="font-body text-sm mt-1 text-cb-mute">
              Based on the <em>Caribbean AI Deployment Blueprint</em> by Dr. Rohan Jowallah (2026)
            </div>
          </div>
          <div className="font-mono text-xs uppercase tracking-wider text-cb-mute flex items-center">
            <MapPin className="w-3 h-3 inline-block mr-1" aria-hidden="true" />
            For the Caribbean and the Global South
          </div>
        </div>
      </div>
    </footer>
  );
}
