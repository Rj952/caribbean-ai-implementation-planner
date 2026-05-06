// Tiny browser-side helper that calls /api/claude and exposes the
// streaming text via an async iterator-like callback.
//
//   await streamClaude({ mode, ...body }, chunk => render(chunk));

export async function streamClaude(body, onChunk) {
  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const j = await res.json();
      if (j?.error) msg = j.error;
    } catch { /* ignore */ }
    throw new Error(msg);
  }

  if (!res.body) throw new Error('No response body from /api/claude');

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let full = '';
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    full += chunk;
    onChunk?.(chunk, full);
  }
  return full;
}

export async function checkClaudeConfigured() {
  try {
    const r = await fetch('/api/claude');
    if (!r.ok) return { ok: false, keyPresent: false };
    return await r.json();
  } catch {
    return { ok: false, keyPresent: false };
  }
}
