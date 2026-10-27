import { CORS_HEADERS, verifySessionToken } from "../lib/auth";
import { db } from "../lib/db";

interface Env {}

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
};

// GET /api/provider/manage - Fetch provider node configurations for current user (or all if admin)
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request } = context;

  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Authentication required" }), {
      status: 401,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  const token = authHeader.slice(7).trim();
  const payload = await verifySessionToken(token);
  if (!payload || !payload.sub) {
    return new Response(JSON.stringify({ error: "Invalid or expired session" }), {
      status: 401,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  const user = await db.prepare("SELECT id, email, wallet_address FROM users WHERE id = ?")
    .bind(payload.sub)
    .first<{ id: string; email: string; wallet_address: string | null }>();

  if (!user) {
    return new Response(JSON.stringify({ error: "User not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  const isAdmin =
    user.email?.toLowerCase() === "me@simonhavlik.com" ||
    user.wallet_address?.toLowerCase() === "0x9b64203878f24eb0cdf55c8c6fa7d08ba0cf77e5";

  // Admins can see all provider nodes; normal users see only their own
  const providersQuery = isAdmin
    ? "SELECT id, name, user_id, base_url, api_key, payout_address, is_official_bridge, status, models_config, fallbacks, pending_payout_usd, total_earned_usd, created_at FROM providers ORDER BY created_at ASC"
    : "SELECT id, name, user_id, base_url, api_key, payout_address, is_official_bridge, status, models_config, fallbacks, pending_payout_usd, total_earned_usd, created_at FROM providers WHERE user_id = ? ORDER BY created_at ASC";

  const { results: providers } = isAdmin
    ? await db.prepare(providersQuery).all()
    : await db.prepare(providersQuery).bind(user.id).all();

  return new Response(
    JSON.stringify({
      success: true,
      is_admin: isAdmin,
      providers: providers || [],
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    }
  );
};

// POST /api/provider/manage - Create or update a provider node configuration
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request } = context;

  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Authentication required" }), {
      status: 401,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  const token = authHeader.slice(7).trim();
  const payload = await verifySessionToken(token);
  if (!payload || !payload.sub) {
    return new Response(JSON.stringify({ error: "Invalid or expired session" }), {
      status: 401,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  const user = await db.prepare("SELECT id, email, wallet_address FROM users WHERE id = ?")
    .bind(payload.sub)
    .first<{ id: string; email: string; wallet_address: string | null }>();

  if (!user) {
    return new Response(JSON.stringify({ error: "User not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  const isAdmin =
    user.email?.toLowerCase() === "me@simonhavlik.com" ||
    user.wallet_address?.toLowerCase() === "0x9b64203878f24eb0cdf55c8c6fa7d08ba0cf77e5";

  let body: any;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON payload" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  const {
    id: providerIdInput,
    name,
    base_url,
    api_key,
    payout_address,
    is_official_bridge,
    status,
    models_config,
    fallbacks,
  } = body;

  if (!name || typeof name !== "string" || !name.trim()) {
    return new Response(JSON.stringify({ error: "Provider node name is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  // Admin Privilege Enforcement:
  // ONLY protocol admin (me@simonhavlik.com) can mark a provider node as an Official Bridge
  let officialBridgeFlag = false;
  if (is_official_bridge === true) {
    if (!isAdmin) {
      return new Response(
        JSON.stringify({
          error: "Permission denied: Only protocol administrators (me@simonhavlik.com) can designate an official bridge model.",
        }),
        { status: 403, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
      );
    }
    officialBridgeFlag = true;
  }

  const providerId = providerIdInput && typeof providerIdInput === "string" && providerIdInput.trim()
    ? providerIdInput.trim()
    : `node-${Math.random().toString(36).substring(2, 9)}`;

  const finalPayoutAddress = payout_address || user.wallet_address || "0x14f10A865e277C0B1949e18Dd9856602DB11742b";
  const finalStatus = status || "ACTIVE";
  const finalModelsConfig = Array.isArray(models_config) ? JSON.stringify(models_config) : "[]";
  const finalFallbacks = Array.isArray(fallbacks) ? JSON.stringify(fallbacks) : "[]";

  // Check if provider node already exists
  const existing = await db.prepare("SELECT id, user_id FROM providers WHERE id = ?")
    .bind(providerId)
    .first<{ id: string; user_id: string | null }>();

  if (existing) {
    // If not admin, verify ownership
    if (!isAdmin && existing.user_id !== user.id) {
      return new Response(JSON.stringify({ error: "Not authorized to modify this provider node" }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      });
    }

    await db.prepare(`
      UPDATE providers
      SET name = ?,
          base_url = ?,
          api_key = ?,
          payout_address = ?,
          is_official_bridge = ?,
          status = ?,
          models_config = ?::jsonb,
          fallbacks = ?::jsonb
      WHERE id = ?
    `).bind(
      name.trim(),
      base_url || null,
      api_key || null,
      finalPayoutAddress,
      officialBridgeFlag,
      finalStatus,
      finalModelsConfig,
      finalFallbacks,
      providerId
    ).run();
  } else {
    // Insert new provider node
    await db.prepare(`
      INSERT INTO providers (
        id, name, user_id, base_url, api_key, payout_address,
        is_official_bridge, status, models_config, fallbacks,
        pending_payout_usd, total_earned_usd, created_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?::jsonb, ?::jsonb,
        0, 0, CURRENT_TIMESTAMP
      )
    `).bind(
      providerId,
      name.trim(),
      user.id,
      base_url || null,
      api_key || null,
      finalPayoutAddress,
      officialBridgeFlag,
      finalStatus,
      finalModelsConfig,
      finalFallbacks
    ).run();
  }

  const updated = await db.prepare("SELECT * FROM providers WHERE id = ?")
    .bind(providerId)
    .first();

  return new Response(
    JSON.stringify({
      success: true,
      message: "Provider node saved successfully.",
      provider: updated,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    }
  );
};
