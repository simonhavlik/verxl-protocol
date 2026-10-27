import { CORS_HEADERS, hashSha256, signSessionToken } from "../lib/auth";
import { db } from "../lib/db";

interface Env {}

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request } = context;

  let body: any;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON payload" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  const apiKey = typeof body.api_key === "string" ? body.api_key.trim() : "";
  if (!apiKey || !apiKey.startsWith("vrxl_live_")) {
    return new Response(
      JSON.stringify({ error: "Valid Production API key required (vrxl_live_...)" }),
      { status: 400, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
    );
  }

  const keyHash = await hashSha256(apiKey);

  const keyRecord = await db.prepare(
    "SELECT id, user_id, is_active FROM api_keys WHERE key_hash = ? AND is_active = 1 LIMIT 1"
  )
    .bind(keyHash)
    .first<{ id: string; user_id: string; is_active: number }>();

  if (!keyRecord) {
    return new Response(
      JSON.stringify({ error: "API key not found, inactive, or revoked." }),
      { status: 401, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
    );
  }

  const user = await db.prepare(
    "SELECT id, email, wallet_address, balance_usd, total_deposited_usd FROM users WHERE id = ?"
  )
    .bind(keyRecord.user_id)
    .first<{
      id: string;
      email: string;
      wallet_address: string | null;
      balance_usd: number | string;
      total_deposited_usd: number | string;
    }>();

  if (!user) {
    return new Response(
      JSON.stringify({ error: "Associated user account not found." }),
      { status: 404, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
    );
  }

  const sessionToken = await signSessionToken({
    sub: user.id,
    email: user.email,
    wallet: user.wallet_address || null,
  });

  return new Response(
    JSON.stringify({
      success: true,
      token: sessionToken,
      user: {
        id: user.id,
        email: user.email,
        wallet_address: user.wallet_address,
        balance_usd: Number(user.balance_usd),
        total_deposited_usd: Number(user.total_deposited_usd),
        is_admin: user.email.toLowerCase() === "me@simonhavlik.com",
      },
    }),
    { status: 200, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
  );
};
