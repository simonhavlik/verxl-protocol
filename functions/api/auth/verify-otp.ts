import { CORS_HEADERS, signSessionToken } from "../lib/auth";
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

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const code = typeof body.code === "string" ? body.code.trim() : "";

  if (!email || !code) {
    return new Response(JSON.stringify({ error: "Email and code are required" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  const now = Date.now();

  // 1. Verify code in Charizard PostgreSQL (schema: verxl)
  const codeRow = await db.prepare(
    "SELECT id, expires_at FROM auth_codes WHERE email = ? AND code = ? AND used = 0 ORDER BY created_at DESC LIMIT 1"
  )
    .bind(email, code)
    .first<{ id: string; expires_at: string | number }>();

  if (!codeRow || Number(codeRow.expires_at) < now) {
    return new Response(
      JSON.stringify({ error: "Invalid or expired verification code." }),
      { status: 401, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
    );
  }

  // 2. Mark code as used
  await db.prepare("UPDATE auth_codes SET used = 1 WHERE id = ?").bind(codeRow.id).run();

  // 3. Find or create user
  let user = await db.prepare(
    "SELECT id, email, password_hash, two_factor_enabled, wallet_address, balance_usd, total_deposited_usd, total_spent_usd FROM users WHERE email = ?"
  )
    .bind(email)
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
    const userId = `usr_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
    await db.prepare(
      "INSERT INTO users (id, email, balance_usd, total_deposited_usd, total_spent_usd, created_at, updated_at) VALUES (?, ?, 0.0, 0.0, 0.0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)"
    )
      .bind(userId, email)
      .run();

    user = {
      id: userId,
      email,
      password_hash: null,
      two_factor_enabled: false,
      wallet_address: null,
      balance_usd: 0.0,
      total_deposited_usd: 0.0,
      total_spent_usd: 0.0,
    };
  }

  // 4. Check if user has active API key
  const activeKey = await db.prepare(
    "SELECT id, key_prefix FROM api_keys WHERE user_id = ? AND is_active = 1 LIMIT 1"
  )
    .bind(user.id)
    .first<{ id: string; key_prefix: string }>();

  // 5. Generate session token
  const token = await signSessionToken({
    sub: user.id,
    email: user.email,
  });

  return new Response(
    JSON.stringify({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        wallet_address: user.wallet_address,
        balance_usd: Number(user.balance_usd),
        total_deposited_usd: Number(user.total_deposited_usd),
        total_spent_usd: Number(user.total_spent_usd),
        has_active_key: Boolean(activeKey),
        active_key_prefix: activeKey ? activeKey.key_prefix : null,
        has_password: Boolean(user.password_hash),
        two_factor_enabled: Boolean(user.two_factor_enabled),
      },
    }),
    { status: 200, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
  );
};
