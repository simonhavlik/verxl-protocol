import { CORS_HEADERS, verifySessionToken } from "../lib/auth";

interface Env {
  DB: D1Database;
}

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
};

export const onRequestGet: PagesFunction<Env> = async (context) => {
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
    return new Response(JSON.stringify({ error: "Invalid or expired session token" }), {
      status: 401,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  const user = await env.DB.prepare(
    "SELECT id, email, wallet_address, balance_usd, total_deposited_usd, total_spent_usd FROM users WHERE id = ?"
  )
    .bind(payload.sub)
    .first<{
      id: string;
      email: string;
      wallet_address: string | null;
      balance_usd: number;
      total_deposited_usd: number;
      total_spent_usd: number;
    }>();

  if (!user) {
    return new Response(JSON.stringify({ error: "User not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  const keys = await env.DB.prepare(
    "SELECT id, key_prefix, name, is_active, created_at FROM api_keys WHERE user_id = ? ORDER BY created_at DESC"
  )
    .bind(user.id)
    .all();

  const recentUsage = await env.DB.prepare(
    "SELECT id, model, prompt_tokens, completion_tokens, total_cost_usd, protocol_fee_usd, created_at FROM usage_records WHERE user_id = ? ORDER BY created_at DESC LIMIT 10"
  )
    .bind(user.id)
    .all();

  return new Response(
    JSON.stringify({
      user: {
        id: user.id,
        email: user.email,
        wallet_address: user.wallet_address,
        balance_usd: user.balance_usd,
        total_deposited_usd: user.total_deposited_usd,
        total_spent_usd: user.total_spent_usd,
        has_active_key: keys.results.some((k: any) => k.is_active === 1),
      },
      keys: keys.results,
      usage: recentUsage.results,
    }),
    { status: 200, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
  );
};
