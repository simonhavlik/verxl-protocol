import { CORS_HEADERS, verifySessionToken, hashSha256 } from "../lib/auth";
import { db } from "../lib/db";

interface Env {}

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

  const userId = payload.sub;

  // 1. Verify user deposit threshold >= $1.00
  const user = await db.prepare(
    "SELECT total_deposited_usd, balance_usd FROM users WHERE id = ?"
  )
    .bind(userId)
    .first<{ total_deposited_usd: number; balance_usd: number }>();

  if (!user || Number(user.total_deposited_usd) < 1.0) {
    return new Response(
      JSON.stringify({
        error: "Minimum initial deposit of $1.00 USD (USDC on Arbitrum) required to generate an API key.",
        current_deposited_usd: Number(user?.total_deposited_usd || 0.0),
      }),
      { status: 403, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
    );
  }

  let body: any = {};
  try {
    body = await request.json();
  } catch {}

  const keyName = typeof body.name === "string" && body.name.trim() ? body.name.trim() : "Production Key";

  // 2. Generate raw key and SHA-256 hash
  const rawKeySecret = `vrxl_live_${crypto.randomUUID().replace(/-/g, "")}${crypto.randomUUID().replace(/-/g, "")}`.slice(0, 42);
  const keyHash = await hashSha256(rawKeySecret);
  const keyPrefix = rawKeySecret.slice(0, 14) + "...";
  const keyId = `key_${crypto.randomUUID()}`;

  await db.prepare(
    "INSERT INTO api_keys (id, user_id, key_hash, key_prefix, name, is_active, created_at) VALUES (?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP)"
  )
    .bind(keyId, userId, keyHash, keyPrefix, keyName)
    .run();

  return new Response(
    JSON.stringify({
      success: true,
      key_id: keyId,
      name: keyName,
      key_prefix: keyPrefix,
      api_key: rawKeySecret,
      note: "Save this key immediately. For institutional security, it cannot be revealed again.",
    }),
    { status: 201, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
  );
};
