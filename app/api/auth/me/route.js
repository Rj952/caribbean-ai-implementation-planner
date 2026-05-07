// GET /api/auth/me — non-secret status probe used by the AccessGate UI.
// 200 { authenticated: true, label } if cookie is valid
// 200 { authenticated: false } otherwise (no cookie / expired / tampered)

import { getSessionFromRequest } from '@/lib/auth';

export const runtime = 'nodejs';

export async function GET(req) {
  const session = getSessionFromRequest(req);
  return new Response(JSON.stringify(
    session
      ? { authenticated: true, label: session.label || '' }
      : { authenticated: false }
  ), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}
