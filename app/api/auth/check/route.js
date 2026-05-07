// POST /api/auth/check — exchange an access code for a signed session cookie.
// Body: { code: "caip-..." }
// 200 { ok: true, label: "..." } and Set-Cookie on success
// 401 { error: "Invalid access code." } on bad code
// 500 { error: "AUTH_SECRET ..." } if env is misconfigured

import { lookupCode, signToken, buildSessionCookie } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST(req) {
  let body;
  try { body = await req.json(); }
  catch { return json({ error: 'Invalid JSON' }, 400); }

  const code = String(body?.code || '').trim();
  const label = lookupCode(code);
  if (!label) return json({ error: 'Invalid access code.' }, 401);

  let token;
  try { token = signToken({ label, code }); }
  catch (e) { return json({ error: e.message || 'Auth misconfigured.' }, 500); }

  return new Response(JSON.stringify({ ok: true, label }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': buildSessionCookie(token),
      'Cache-Control': 'no-store',
    },
  });
}

function json(payload, status) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}
