import { CORS_HEADERS, verifySessionToken } from "../lib/auth";
import { db } from "../lib/db";

interface Env {}

const ADMIN_EMAIL = "me@simonhavlik.com";

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
};

export const onRequestGet: PagesFunction<Env> = async (context) => {
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

  // Retrieve all grant keys with aggregate usage statistics
  const keys = await db.prepare(
    `SELECT 
       k.id, 
       k.name, 
       k.key_prefix, 
       k.key_type, 
       k.spend_limit_usd, 
       k.total_spent_usd,
       k.is_active, 
       k.created_at, 
       k.deactivated_at,
       COALESCE(SUM(u.prompt_tokens + u.completion_tokens), 0) as total_tokens,
       COUNT(u.id) as request_count
     FROM api_keys k
     LEFT JOIN usage_records u ON k.id = u.api_key_id
     WHERE k.key_type = 'grant'
     GROUP BY k.id, k.name, k.key_prefix, k.key_type, k.spend_limit_usd, k.total_spent_usd, k.is_active, k.created_at, k.deactivated_at
     ORDER BY k.created_at DESC`
  ).all();

  return new Response(
    JSON.stringify({
      admin_email: user.email,
      grant_keys: keys.results.map((k: any) => ({
        id: k.id,
        name: k.name,
        key_prefix: k.key_prefix,
        is_active: Number(k.is_active) === 1,
        spend_limit_usd: Number(k.spend_limit_usd || 0),
        total_spent_usd: Number(k.total_spent_usd || 0),
        total_tokens: Number(k.total_tokens || 0),
        request_count: Number(k.request_count || 0),
        created_at: k.created_at,
        deactivated_at: k.deactivated_at,
      })),
    }),
    { status: 200, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
  );
};
