import { CORS_HEADERS, verifySessionToken } from "../lib/auth";
import { db } from "../lib/db";

interface Env {}

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
    return new Response(JSON.stringify({ error: "Invalid or expired session token" }), {
      status: 401,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  const user = await db.prepare(
    "SELECT id, email, password_hash, two_factor_enabled, wallet_address, balance_usd, total_deposited_usd, total_spent_usd FROM users WHERE id = ?"
  )
    .bind(payload.sub)
    .first<{
      id: string;
      email: string;
      password_hash: string | null;
      two_factor_enabled: boolean;
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

  const keys = await db.prepare(
    "SELECT id, key_prefix, name, is_active, created_at FROM api_keys WHERE user_id = ? ORDER BY created_at DESC"
  )
    .bind(user.id)
    .all();

  const recentUsage = await db.prepare(
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
        balance_usd: Number(user.balance_usd),
        total_deposited_usd: Number(user.total_deposited_usd),
        total_spent_usd: Number(user.total_spent_usd),
        has_active_key: keys.results.some((k: any) => k.is_active === 1),
        has_password: Boolean(user.password_hash),
        two_factor_enabled: Boolean(user.two_factor_enabled),
        is_admin:
          user.email?.toLowerCase() === "me@simonhavlik.com" ||
          user.wallet_address?.toLowerCase() === "0x9b64203878f24eb0cdf55c8c6fa7d08ba0cf77e5",
      },
      keys: keys.results,
      usage: recentUsage.results,
    }),
    { status: 200, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
  );
};
