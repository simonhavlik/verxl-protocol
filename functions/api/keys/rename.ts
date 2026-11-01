import { CORS_HEADERS, verifySessionToken } from "../lib/auth";
import { db } from "../lib/db";

interface Env {}

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
};

// POST /api/keys/rename - Rename a key the session user owns.
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request } = context;
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;
  if (!token) {
    return new Response(JSON.stringify({ error: "Missing authorization token" }), {
      status: 401,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  const payload = await verifySessionToken(token);
  if (!payload?.sub) {
    return new Response(JSON.stringify({ error: "Invalid or expired session" }), {
      status: 401,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  let body: any = {};
  try {
    body = await request.json();
  } catch {}

  const keyId = typeof body.key_id === "string" ? body.key_id.trim() : "";
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!keyId || !name) {
    return new Response(JSON.stringify({ error: "key_id and name are required" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }
  if (name.length > 80) {
    return new Response(JSON.stringify({ error: "Key name must be 80 characters or fewer" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  const result = await db.prepare(
    "UPDATE api_keys SET name = ? WHERE id = ? AND user_id = ?"
  ).bind(name, keyId, payload.sub).run();

  if (!result || (result as any).changes === 0) {
    return new Response(JSON.stringify({ error: "Key not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store", ...CORS_HEADERS },
    });
  }

  const saved = await db.prepare("SELECT name FROM api_keys WHERE id = ? AND user_id = ?")
    .bind(keyId, payload.sub)
    .first<{ name: string }>();

  return new Response(JSON.stringify({ success: true, key_id: keyId, name: saved?.name || name }), {
    status: 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store", ...CORS_HEADERS },
  });
};
