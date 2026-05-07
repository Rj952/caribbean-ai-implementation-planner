// Server-side auth helpers for the Caribbean AI Implementation Planner.
//
// Strategy: per-user access codes stored as a JSON map in the
//   ACCESS_CODES env var, e.g.
//     {"caip-jam-moe-2026":"Jamaica Ministry of Education",
//      "caip-tt-mic-2026":"T&T Ministry of Innovation"}
// On successful code entry, the server signs a small token containing the
// label and issued-at timestamp using HMAC-SHA256 against AUTH_SECRET, and
// stores it in an httpOnly Secure cookie. Subsequent requests to /api/claude
// (and the /api/auth/me probe used by the UI) verify the cookie.
//
// Tokens default to 30-day TTL; rotate AUTH_SECRET to invalidate everyone
// at once, or remove a code from ACCESS_CODES to prevent re-issuance.

import crypto from 'crypto';

export const COOKIE_NAME = 'caip_session';
const TOKEN_TTL_DAYS = 30;

function getSecret() {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 16) {
    throw new Error(
      'AUTH_SECRET is missing or too short. Set a 32+ character random string ' +
      'in Vercel → Project Settings → Environment Variables.'
    );
  }
  return s;
}

function b64url(buf) {
  return Buffer.from(buf).toString('base64')
    .replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
}
function fromB64url(s) {
  s = s.replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  return Buffer.from(s, 'base64');
}

export function loadCodes() {
  const raw = process.env.ACCESS_CODES || '';
  if (!raw.trim()) return {};
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed;
    }
  } catch { /* fall through */ }
  return {};
}

// Return the label for the given code, or null.
export function lookupCode(code) {
  if (!code || typeof code !== 'string') return null;
  const codes = loadCodes();
  // Case-insensitive match for a friendlier UX.
  const lower = code.trim().toLowerCase();
  for (const [k, v] of Object.entries(codes)) {
    if (k.toLowerCase() === lower) return v;
  }
  return null;
}

export function signToken(payload) {
  const body = b64url(JSON.stringify({ ...payload, iat: Date.now() }));
  const sig = b64url(
    crypto.createHmac('sha256', getSecret()).update(body).digest()
  );
  return `${body}.${sig}`;
}

export function verifyToken(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  const [body, sig] = token.split('.');
  let expected;
  try {
    expected = b64url(
      crypto.createHmac('sha256', getSecret()).update(body).digest()
    );
  } catch {
    return null;
  }
  // Constant-time compare.
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  let payload;
  try { payload = JSON.parse(fromB64url(body).toString('utf-8')); }
  catch { return null; }
  if (!payload || typeof payload.iat !== 'number') return null;

  const ageDays = (Date.now() - payload.iat) / 86_400_000;
  if (ageDays > TOKEN_TTL_DAYS) return null;
  return payload;
}

// Read the cookie value from a NextRequest / Request.
export function readSessionCookie(req) {
  // Both NextRequest and the standard Web Request expose .headers.get
  const header = req.headers.get?.('cookie') || '';
  if (!header) return null;
  for (const part of header.split(';')) {
    const [k, ...rest] = part.trim().split('=');
    if (k === COOKIE_NAME) return rest.join('=').trim();
  }
  return null;
}

// Build a Set-Cookie header string for the signed session token.
export function buildSessionCookie(token, { secure = true } = {}) {
  const maxAge = TOKEN_TTL_DAYS * 24 * 60 * 60;
  const flags = [
    `${COOKIE_NAME}=${encodeURIComponent(token)}`,
    'Path=/',
    `Max-Age=${maxAge}`,
    'HttpOnly',
    'SameSite=Lax',
  ];
  if (secure) flags.push('Secure');
  return flags.join('; ');
}

export function buildClearCookie() {
  return `${COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax; Secure`;
}

// Convenience for routes: returns the verified payload or null.
export function getSessionFromRequest(req) {
  const raw = readSessionCookie(req);
  if (!raw) return null;
  return verifyToken(decodeURIComponent(raw));
}
