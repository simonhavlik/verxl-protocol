import { CORS_HEADERS, verifySessionToken } from "../../lib/auth";
import { db } from "../../lib/db";

interface Env {}

const ADMIN_EMAIL = "me@simonhavlik.com";

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request } = context;

  const authHeader = request.headers.get("Authorization");
  const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) {
    return new Response(JSON.stringify({ error: "Missing authorization token" }), {
      status: 401,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  const payload = await verifySessionToken(token);
  if (!payload || !payload.sub) {
    return new Response(JSON.stringify({ error: "Invalid session token" }), {
      status: 401,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  // Verify Admin Identity
  const user = await db.prepare("SELECT email FROM users WHERE id = ?")
    .bind(payload.sub)
    .first<{ email: string }>();

  if (!user || user.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    return new Response(
      JSON.stringify({ error: "Access denied. Administrator privileges required." }),
      { status: 403, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
    );
  }

  let body: any = {};
  try {
    body = await request.json();
  } catch {}

  const keyId = typeof body.key_id === "string" ? body.key_id.trim() : "";
  if (!keyId) {
    return new Response(JSON.stringify({ error: "key_id is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  // Permanently deactivate grant key and record timestamp
  // "when key is deactivated it stays that way with a record"
  const res = await db.prepare(
    "UPDATE api_keys SET is_active = 0, deactivated_at = CURRENT_TIMESTAMP WHERE id = ? AND key_type = 'grant'"
  )
    .bind(keyId)
    .run();

  if (res.changes === 0) {
    return new Response(
      JSON.stringify({ error: "Grant key not found or already deactivated." }),
      { status: 404, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
    );
  }

  return new Response(
    JSON.stringify({
      success: true,
      message: "Grant key permanently deactivated. Historical token and cost usage records remain preserved.",
    }),
    { status: 200, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
  );
};
