'use client';

import { ChevronLeft } from 'lucide-react';

export default function Header({ showBack, onBack }) {
  return (
    <header
      className="border-b"
      style={{ borderColor: 'var(--cb-line)', background: 'var(--cb-surface)' }}
      role="banner"
    >
      <div className="jm-flag-stripe" role="presentation" aria-hidden="true" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-3">
            {showBack && (
              <button
                type="button"
                onClick={onBack}
                aria-label="Return to home screen"
                className="btn btn-secondary"
                style={{ minHeight: '40px', padding: '8px 14px' }}
              >
                <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                Back
              </button>
            )}
            <div>
              <div className="step-pill text-jm-green-deep">
                <span
                  className="w-1.5 h-1.5 rounded-full mr-2"
                  style={{ background: 'var(--jm-green)' }}
                  aria-hidden="true"
                />
                Working Draft Tool · Jamaica · CARICOM
              </div>
              <h1
                className="font-display mt-2 text-cb-sea"
                style={{
                  fontSize: 'clamp(22px, 4vw, 30px)',
                  fontWeight: 600,
                  lineHeight: 1.15
                }}
              >
                Caribbean AI Implementation Planner
              </h1>
              <p className="font-body text-sm mt-1 text-cb-mute">
                Build your country&apos;s working AI policy from the Caribbean AI Deployment Blueprint
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
