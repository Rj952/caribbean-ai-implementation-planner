'use client';

import { useEffect, useState } from 'react';
import { Loader2, Lock, LogOut, AlertTriangle } from 'lucide-react';

// Wraps the app's main content. Renders a sign-in screen until the
// /api/auth/me probe returns authenticated:true. Tokens are stored in
// an httpOnly cookie set by the server, so localStorage isn't involved.

export default function AccessGate({ children }) {
  const [status, setStatus] = useState('loading'); // loading | locked | open
  const [label, setLabel] = useState('');

  useEffect(() => {
    let cancelled = false;
    fetch('/api/auth/me', { credentials: 'same-origin', cache: 'no-store' })
      .then(r => r.json())
      .then(j => {
        if (cancelled) return;
        if (j?.authenticated) { setLabel(j.label || ''); setStatus('open'); }
        else { setStatus('locked'); }
      })
      .catch(() => { if (!cancelled) setStatus('locked'); });
    return () => { cancelled = true; };
  }, []);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-cb-sea" aria-label="Loading" />
      </div>
    );
  }

  if (status === 'locked') {
    return <SignInScreen onSuccess={lbl => { setLabel(lbl); setStatus('open'); }} />;
  }

  return (
    <>
      <SessionBadge label={label} onSignOut={() => setStatus('locked')} />
      {children}
    </>
  );
}

function SignInScreen({ onSuccess }) {
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState('');

  const submit = async e => {
    e.preventDefault();
    setErr('');
    setSubmitting(true);
    try {
      const r = await fetch('/api/auth/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ code: code.trim() }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) {
        setErr(j?.error || `Sign-in failed (HTTP ${r.status}).`);
        return;
      }
      onSuccess(j?.label || '');
    } catch (e) {
      setErr(e.message || 'Network error.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="jm-flag-stripe" role="presentation" aria-hidden="true" />
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <section
          className="w-full max-w-md p-7 sm:p-8"
          style={{
            background: 'var(--cb-paper)',
            border: '1px solid var(--cb-line)',
            borderTop: '4px solid var(--jm-green)',
            borderRadius: '4px',
          }}
          aria-labelledby="signin-title"
        >
          <div
            className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider mb-2"
            style={{ color: 'var(--jm-green-deep)' }}
          >
            <Lock className="w-3.5 h-3.5" aria-hidden="true" />
            Access required
          </div>
          <h1
            id="signin-title"
            className="font-display text-cb-sea"
            style={{ fontSize: '28px', fontWeight: 600, lineHeight: 1.15 }}
          >
            Caribbean AI Implementation Planner
          </h1>
          <p className="font-body text-cb-mute mt-3 mb-5 leading-relaxed" style={{ fontSize: '15px' }}>
            This tool is provided to invited ministries, university councils,
            taskforces, and consulting teams. Enter your access code to continue.
            If you don&apos;t have a code, contact{' '}
            <a
              href="mailto:rohanjowallah@gmail.com?subject=Caribbean%20AI%20Implementation%20Planner%20-%20Access%20request"
              style={{ color: 'var(--jm-green-deep)', textDecoration: 'underline' }}
            >
              Dr. Rohan Jowallah
            </a>.
          </p>

          <form onSubmit={submit} noValidate>
            <label htmlFor="code" className="font-mono text-xs uppercase tracking-wider block mb-2 text-cb-mute">
              Access code
            </label>
            <input
              id="code"
              type="text"
              autoComplete="off"
              autoCapitalize="off"
              spellCheck="false"
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder="caip-..."
              required
              aria-invalid={Boolean(err)}
              aria-describedby={err ? 'code-error' : undefined}
              disabled={submitting}
              style={{ fontFamily: 'IBM Plex Mono, monospace', letterSpacing: '0.01em' }}
            />
            {err && (
              <div
                id="code-error"
                className="mt-3 flex items-start gap-2 font-body"
                style={{ fontSize: '14px', color: 'var(--cb-red)' }}
                role="alert"
              >
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
                <span>{err}</span>
              </div>
            )}
            <button
              type="submit"
              className="btn btn-primary w-full mt-4"
              disabled={submitting || !code.trim()}
              aria-busy={submitting}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {submitting
                ? <><Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> Verifying…</>
                : <>Continue</>}
            </button>
          </form>
        </section>
      </main>
      <footer className="py-6 text-center">
        <span className="font-mono text-xs uppercase tracking-wider text-cb-mute">
          Built on the Caribbean AI Deployment Blueprint · Jowallah, 2026
        </span>
      </footer>
    </div>
  );
}

function SessionBadge({ label, onSignOut }) {
  const [busy, setBusy] = useState(false);
  const signOut = async () => {
    setBusy(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
    } catch { /* ignore */ }
    onSignOut();
  };
  return (
    <div
      className="flex items-center justify-end gap-3 px-4 sm:px-6 py-2"
      style={{
        background: 'var(--jm-green-soft)',
        borderBottom: '1px solid var(--cb-line)',
        fontSize: '12px',
      }}
    >
      <span className="font-mono uppercase tracking-wider" style={{ color: 'var(--jm-green-deep)' }}>
        Signed in{label ? ' · ' + label : ''}
      </span>
      <button
        type="button"
        onClick={signOut}
        disabled={busy}
        className="btn btn-secondary"
        style={{ minHeight: '28px', padding: '4px 10px', fontSize: '12px' }}
        aria-label="Sign out"
      >
        <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
        Sign out
      </button>
    </div>
  );
}
