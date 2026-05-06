'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Sparkles } from 'lucide-react';
import { streamClaude } from '@/lib/claude-client';

// Floating Chat-with-Blueprint panel.
// Mounted globally from app/layout.js so it is available on every page.

export default function ChatPanel() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        "Welcome. I'm Claude, anchored to the Caribbean AI Deployment Blueprint by Dr. Rohan Jowallah. " +
        "Ask me about any of the seven principles, the three-sector pathway, the University Compact, " +
        "or how to interpret an evaluation result.",
    },
  ]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [err, setErr] = useState('');
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll on new content.
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streaming]);

  // Focus input when panel opens.
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = e => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const send = async () => {
    const q = input.trim();
    if (!q || streaming) return;
    setErr('');
    setInput('');

    const next = [...messages, { role: 'user', content: q }, { role: 'assistant', content: '' }];
    setMessages(next);
    setStreaming(true);

    try {
      await streamClaude(
        { mode: 'chat', messages: next.slice(0, -1) },
        (_chunk, full) =>
          setMessages(curr => {
            const cp = [...curr];
            cp[cp.length - 1] = { role: 'assistant', content: full };
            return cp;
          }),
      );
    } catch (e) {
      setErr(e.message || 'Chat failed.');
      setMessages(curr => curr.slice(0, -1)); // remove empty assistant turn
    } finally {
      setStreaming(false);
    }
  };

  const handleKey = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-controls="chat-panel"
        aria-label={open ? 'Close chat with the Blueprint' : 'Open chat with the Blueprint'}
        className="fixed z-50"
        style={{
          right: '20px',
          bottom: '20px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: open ? 'var(--jm-black)' : 'var(--jm-green)',
          color: open ? 'var(--jm-gold)' : '#FFFFFF',
          border: 'none',
          boxShadow: '0 6px 18px rgba(0,0,0,0.18)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'background 0.15s ease, color 0.15s ease, transform 0.05s ease',
        }}
      >
        {open ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
      </button>

      {open && (
        <aside
          id="chat-panel"
          role="dialog"
          aria-modal="false"
          aria-labelledby="chat-panel-title"
          className="fixed z-40 flex flex-col"
          style={{
            right: '20px',
            bottom: '90px',
            width: 'min(420px, calc(100vw - 40px))',
            height: 'min(600px, calc(100vh - 120px))',
            background: 'var(--cb-paper)',
            border: '1px solid var(--cb-line)',
            borderTop: '4px solid var(--jm-green)',
            boxShadow: '0 12px 36px rgba(0,0,0,0.18)',
            borderRadius: '4px',
            overflow: 'hidden',
          }}
        >
          <header
            className="px-4 py-3"
            style={{ borderBottom: '1px solid var(--cb-line)', background: 'var(--cb-surface)' }}
          >
            <div className="flex items-center gap-2">
              <Sparkles
                className="w-4 h-4"
                style={{ color: 'var(--jm-green-deep)' }}
                aria-hidden="true"
              />
              <h2
                id="chat-panel-title"
                className="font-display text-cb-sea"
                style={{ fontSize: '16px', fontWeight: 600 }}
              >
                Chat with the Blueprint
              </h2>
            </div>
            <p className="font-body text-xs text-cb-mute mt-1">
              Anchored to the Caribbean AI Deployment Blueprint (Jowallah, 2026)
            </p>
          </header>

          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 py-3"
            aria-live="polite"
          >
            {messages.map((m, i) => (
              <ChatBubble key={i} role={m.role} content={m.content} streaming={streaming && i === messages.length - 1} />
            ))}
            {err && (
              <div
                className="font-body text-sm text-cb-red mt-2 px-3 py-2"
                style={{ background: 'rgba(200,16,46,0.08)' }}
                role="alert"
              >
                {err}
              </div>
            )}
          </div>

          <form
            onSubmit={e => { e.preventDefault(); send(); }}
            className="p-3"
            style={{ borderTop: '1px solid var(--cb-line)', background: 'var(--cb-surface)' }}
          >
            <label htmlFor="chat-input" className="sr-only">Your question</label>
            <div className="flex gap-2 items-end">
              <textarea
                ref={inputRef}
                id="chat-input"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask about a principle, sector, or evaluation result…"
                rows={2}
                disabled={streaming}
                style={{ minHeight: '44px', flex: 1, fontSize: '14px' }}
              />
              <button
                type="submit"
                disabled={streaming || !input.trim()}
                className="btn btn-primary"
                style={{ minHeight: '44px', padding: '8px 12px' }}
                aria-label="Send"
              >
                {streaming
                  ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  : <Send className="w-4 h-4" aria-hidden="true" />}
              </button>
            </div>
          </form>
        </aside>
      )}
    </>
  );
}

function ChatBubble({ role, content, streaming }) {
  const isUser = role === 'user';
  return (
    <div
      className="mb-3"
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
      }}
    >
      <div
        className="font-body leading-relaxed"
        style={{
          maxWidth: '88%',
          padding: '10px 14px',
          borderRadius: '4px',
          fontSize: '14px',
          background: isUser ? 'var(--jm-black)' : 'var(--jm-green-soft)',
          color: isUser ? '#FFFFFF' : 'var(--cb-ink)',
          borderLeft: isUser ? 'none' : '3px solid var(--jm-green)',
          whiteSpace: 'pre-wrap',
        }}
      >
        {content || (streaming ? '…' : '')}
      </div>
    </div>
  );
}
