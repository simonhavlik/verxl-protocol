import { CORS_HEADERS, verifySessionToken } from "../lib/auth";

interface Env {
  DB: D1Database;
}

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

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

  const res = await env.DB.prepare(
    "UPDATE api_keys SET is_active = 0 WHERE id = ? AND user_id = ?"
  )
    .bind(keyId, payload.sub)
    .run();

  if (res.meta.changes === 0) {
    return new Response(JSON.stringify({ error: "API key not found or already revoked." }), {
      status: 404,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  return new Response(
    JSON.stringify({ success: true, message: "API key revoked successfully." }),
    { status: 200, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
  );
};
