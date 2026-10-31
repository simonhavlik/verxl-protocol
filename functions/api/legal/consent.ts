import { CORS_HEADERS, hashSha256, verifySessionToken } from "../lib/auth";
import { db } from "../lib/db";
import { LEGAL_VERSION, readConsent, writeConsent } from "../lib/legal-consent";

interface Env {}

async function authenticate(request: Request): Promise<{ id: string } | null> {
  const auth = request.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  const token = auth.slice(7).trim();
  if (token.startsWith("vtok_")) {
    const payload = await verifySessionToken(token);
    if (!payload?.sub) return null;
    return db.prepare("SELECT id FROM users WHERE id = ?").bind(payload.sub).first<{ id: string }>();
  }
  if (token.startsWith("vrxl_live_") || token.startsWith("vrxl_grant_")) {
    const keyHash = await hashSha256(token);
    return db
      .prepare("SELECT u.id FROM api_keys k JOIN users u ON k.user_id = u.id WHERE k.key_hash = ? AND k.is_active = 1")
      .bind(keyHash)
      .first<{ id: string }>();
  }
  return null;
}

export const onRequestOptions: PagesFunction<Env> = async () =>
  new Response(null, { status: 204, headers: CORS_HEADERS });

export const onRequestGet: PagesFunction<Env> = async ({ request }) => {
  const user = await authenticate(request);
  if (!user) {
    return new Response(JSON.stringify({ error: "Authentication required" }), {
      status: 401,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }
  const consent = await readConsent(user.id);
  return new Response(JSON.stringify({ success: true, ...consent, currentVersion: LEGAL_VERSION }), {
    status: 200,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
};

export const onRequestPost: PagesFunction<Env> = async ({ request }) => {
  const user = await authenticate(request);
  if (!user) {
    return new Response(JSON.stringify({ error: "Authentication required" }), {
      status: 401,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }
  let body: any;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }
  if (body?.ageConfirmed !== true || body?.termsAccepted !== true || body?.termsVersion !== LEGAL_VERSION) {
    return new Response(JSON.stringify({ error: "Current terms and age confirmation are required." }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }
  await writeConsent(user.id, true, true);
  return new Response(JSON.stringify({ success: true, accepted: true, termsVersion: LEGAL_VERSION }), {
    status: 200,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
};
