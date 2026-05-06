'use client';

/**
 * Reusable form/UI helpers — keep behaviour identical across wizard and evaluator.
 */

export function Field({ label, htmlFor, hint, children }) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="font-mono text-xs uppercase tracking-wider block mb-2 text-cb-mute"
      >
        {label}
      </label>
      {children}
      {hint && (
        <p className="text-xs text-cb-mute mt-1.5 font-body">{hint}</p>
      )}
    </div>
  );
}

export function RangeField({ label, id, value, color, onChange }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label htmlFor={id} className="font-mono text-xs uppercase tracking-wider text-cb-mute">
          {label}
        </label>
        <span
          className="font-display font-semibold"
          style={{ color: color || 'var(--cb-sea)', fontSize: '18px' }}
          aria-hidden="true"
        >
          {value} / 5
        </span>
      </div>
      <input
        id={id}
        type="range"
        min="1"
        max="5"
        value={value}
        aria-valuemin="1"
        aria-valuemax="5"
        aria-valuenow={value}
        onChange={e => onChange(parseInt(e.target.value, 10))}
      />
    </div>
  );
}

export function StepHeader({ n, title, h2, children }) {
  return (
    <>
      <div className="step-pill text-cb-sun-deep mb-3">
        Step {n} · {title}
      </div>
      <h2
        className="font-display mb-2 text-cb-sea"
        style={{
          fontSize: 'clamp(28px, 4.5vw, 38px)',
          fontWeight: 500,
          lineHeight: 1.1,
          letterSpacing: '-0.01em'
        }}
      >
        {h2}
      </h2>
      <p className="font-body mb-8 text-cb-mute" style={{ fontSize: '15px', lineHeight: 1.6 }}>
        {children}
      </p>
    </>
  );
}

export function Callout({ icon: Icon, title, children, tone = 'sun' }) {
  const colors = {
    sun: { bg: 'var(--cb-sand)', border: 'var(--cb-sun)' },
    teal: { bg: 'var(--cb-aqua-soft)', border: 'var(--cb-teal)' },
    coral: { bg: 'rgba(231, 111, 81, 0.08)', border: 'var(--cb-coral)' }
  }[tone];
  return (
    <aside
      className="p-5"
      style={{ background: colors.bg, borderLeft: `3px solid ${colors.border}` }}
    >
      <div className="flex items-start gap-3">
        {Icon && (
          <Icon
            className="w-5 h-5 flex-shrink-0 mt-0.5"
            style={{ color: colors.border }}
            aria-hidden="true"
          />
        )}
        <div>
          {title && (
            <div
              className="font-display font-semibold mb-1 text-cb-sea"
              style={{ fontSize: '15px' }}
            >
              {title}
            </div>
          )}
          <div className="font-body text-sm text-cb-ink leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </aside>
  );
}
