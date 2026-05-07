// Server-side Claude endpoint for the Caribbean AI Implementation Planner.
//
// Modes (selected via JSON body field "mode"):
//   - evaluate : full plan evaluation (Sonnet, streaming)
//   - draft    : suggest text for a wizard field (Haiku, streaming)
//   - amend    : paragraph-ready amendment for a specific gap (Sonnet)
//   - chat     : Blueprint-anchored chat (Haiku, streaming)
//
// Authentication: ANTHROPIC_API_KEY is read from process.env. Set it once
// in Vercel → Project Settings → Environment Variables. The key never
// reaches the browser.

import Anthropic from '@anthropic-ai/sdk';
import { PROMPTS, MODELS, MAX_TOKENS } from '@/lib/claude-prompts';
import { getSessionFromRequest } from '@/lib/auth';

// Use Node runtime so we can stream and read env reliably.
export const runtime = 'nodejs';
// Allow up to 60 s on Vercel for evaluation responses.
export const maxDuration = 60;

const PLAN_TEXT_LIMIT = 60_000;   // characters — trims pathologically long uploads
const FIELD_TEXT_LIMIT = 8_000;
const MESSAGE_HISTORY_LIMIT = 16; // chat turns

function bad(message, status = 400) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function buildMessages(mode, body) {
  if (mode === 'evaluate') {
    const text = String(body.planText || '').slice(0, PLAN_TEXT_LIMIT);
    if (!text.trim()) throw new Error('planText required');
    return [{
      role: 'user',
      content: `Country / institution: ${body.sourceName || '(not specified)'}\n` +
               `Word count: ${body.wordCount || 'unknown'}\n\n` +
               `--- BEGIN PLAN TEXT ---\n${text}\n--- END PLAN TEXT ---`,
    }];
  }

  if (mode === 'draft') {
    const ctx = body.context || {};
    const fieldName = body.field || 'unspecified field';
    const existing = String(body.existingText || '').slice(0, FIELD_TEXT_LIMIT);
    const country = ctx.country || ctx.countryName || '(unspecified country)';
    const lines = [
      `Field: ${fieldName}`,
      `Country: ${country}`,
      ctx.population ? `Population: ${ctx.population}` : null,
      ctx.languages ? `Languages: ${ctx.languages}` : null,
      ctx.priorities ? `Strategic priorities so far: ${ctx.priorities}` : null,
      ctx.sectors ? `Selected sectors: ${ctx.sectors}` : null,
      existing ? `\nExisting text the user has typed:\n"""${existing}"""` : null,
    ].filter(Boolean);
    return [{ role: 'user', content: lines.join('\n') }];
  }

  if (mode === 'amend') {
    const action = body.action || {};
    const planExcerpt = String(body.planExcerpt || '').slice(0, 6000);
    return [{
      role: 'user',
      content:
        `Section: ${action.principle || action.title || 'unspecified'}\n` +
        `Action title: ${action.title || ''}\n` +
        `Heuristic rationale: ${action.rationale || ''}\n` +
        `Recommended steps:\n${(action.steps || []).map(s => '- ' + s).join('\n')}\n\n` +
        `Excerpt of the user's existing plan (for tone/terminology matching):\n` +
        `"""${planExcerpt}"""`,
    }];
  }

  if (mode === 'chat') {
    const history = Array.isArray(body.messages) ? body.messages.slice(-MESSAGE_HISTORY_LIMIT) : [];
    if (!history.length) throw new Error('messages required');
    return history.map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: String(m.content || '').slice(0, FIELD_TEXT_LIMIT),
    }));
  }

  throw new Error(`Unknown mode: ${mode}`);
}

export async function POST(req) {
  // Require a valid session cookie before forwarding to Claude.
  // This protects the API budget from anonymous traffic.
  const session = getSessionFromRequest(req);
  if (!session) {
    return bad('Access required. Sign in with your access code.', 401);
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return bad(
      'ANTHROPIC_API_KEY is not configured on the server. ' +
      'Add it in Vercel → Project Settings → Environment Variables.',
      500,
    );
  }

  let body;
  try { body = await req.json(); }
  catch { return bad('Invalid JSON'); }

  const mode = String(body.mode || '');
  if (!PROMPTS[mode]) return bad(`Unknown mode: ${mode}`);

  let messages;
  try { messages = buildMessages(mode, body); }
  catch (e) { return bad(e.message); }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  // Streaming text/event-stream response — UI reads it incrementally.
  const stream = await client.messages.stream({
    model: MODELS[mode],
    max_tokens: MAX_TOKENS[mode],
    system: PROMPTS[mode],
    messages,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (event.type === 'content_block_delta' &&
              event.delta?.type === 'text_delta' &&
              event.delta?.text) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
      } catch (err) {
        controller.enqueue(encoder.encode(
          `\n\n[Claude error: ${String(err?.message || err).slice(0, 200)}]`,
        ));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Accel-Buffering': 'no',
    },
  });
}

export async function GET() {
  // Simple health probe — useful when verifying the env var is set.
  return new Response(JSON.stringify({
    ok: true,
    keyPresent: Boolean(process.env.ANTHROPIC_API_KEY),
    modes: Object.keys(PROMPTS),
  }), { headers: { 'Content-Type': 'application/json' } });
}
