import { CORS_HEADERS, verifySessionToken, hashSha256 } from "../../lib/auth";
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
  const user = await db.prepare("SELECT id, email FROM users WHERE id = ?")
    .bind(payload.sub)
    .first<{ id: string; email: string }>();

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

  const keyName = typeof body.name === "string" && body.name.trim()
    ? body.name.trim()
    : "Public Demo Key";

  const spendLimit = typeof body.spend_limit_usd === "number" && body.spend_limit_usd > 0
    ? body.spend_limit_usd
    : 0; // 0 = unlimited

  // Generate Admin Free Grant Key Secret
  const rawKeySecret = `vrxl_grant_${crypto.randomUUID().replace(/-/g, "")}${crypto.randomUUID().replace(/-/g, "")}`.slice(0, 43);
  const keyHash = await hashSha256(rawKeySecret);
  const keyPrefix = rawKeySecret.slice(0, 15) + "...";
  const keyId = `grant_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;

  await db.prepare(
    `INSERT INTO api_keys (
      id, user_id, key_hash, key_prefix, name, is_active, 
      key_type, spend_limit_usd, total_spent_usd, created_at
    ) VALUES (?, ?, ?, ?, ?, 1, 'grant', ?, 0.0, CURRENT_TIMESTAMP)`
  )
    .bind(keyId, user.id, keyHash, keyPrefix, keyName, spendLimit)
    .run();

  return new Response(
    JSON.stringify({
      success: true,
      key_id: keyId,
      name: keyName,
      key_prefix: keyPrefix,
      api_key: rawKeySecret,
      key_type: "grant",
      spend_limit_usd: spendLimit,
      note: "Save this free demo grant key now. For institutional security, it will not be displayed in full again.",
    }),
    { status: 201, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
  );
};
