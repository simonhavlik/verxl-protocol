import { CORS_HEADERS } from "../lib/auth";
import { db } from "../lib/db";
import { verifyAdminUser } from "./lib";

interface Env {}

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
};

// GET /api/admin/users - List all users or inspect user activity
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request } = context;
  const auth = await verifyAdminUser(request);
  if (!auth.isAdmin || auth.errorResponse) {
    return auth.errorResponse!;
  }

  const url = new URL(request.url);
  const userId = url.searchParams.get("user_id");

  try {
    if (userId) {
      // Inspect detailed activity for a single user
      const user = await db
        .prepare(
          "SELECT id, email, wallet_address, balance_usd, total_deposited_usd, total_spent_usd, status, created_at, updated_at FROM users WHERE id = ?"
        )
        .bind(userId)
        .first<any>();

      if (!user) {
        return new Response(JSON.stringify({ error: "User not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json", ...CORS_HEADERS },
        });
      }

      const { results: keys } = await db
        .prepare("SELECT id, name, key_prefix, is_active, total_spent_usd, created_at FROM api_keys WHERE user_id = ? ORDER BY created_at DESC")
        .bind(userId)
        .all();

      const { results: usage } = await db
        .prepare("SELECT id, provider_id, model, prompt_tokens, completion_tokens, total_cost_usd, protocol_fee_usd, created_at FROM usage_records WHERE user_id = ? ORDER BY created_at DESC LIMIT 50")
        .bind(userId)
        .all();

      const { results: deposits } = await db
        .prepare("SELECT id, tx_hash, amount_usd, status, created_at FROM deposits WHERE user_id = ? ORDER BY created_at DESC")
        .bind(userId)
        .all();

      return new Response(
        JSON.stringify({
          success: true,
          user: {
            ...user,
            balance_usd: Number(user.balance_usd || 0),
            total_deposited_usd: Number(user.total_deposited_usd || 0),
            total_spent_usd: Number(user.total_spent_usd || 0),
            status: user.status || "ACTIVE",
          },
          keys: keys || [],
          usage: usage || [],
          deposits: deposits || [],
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
      );
    }

    // List all users with key count and request count
    const { results: users } = await db
      .prepare(
        "SELECT id, email, wallet_address, balance_usd, total_deposited_usd, total_spent_usd, status, created_at, updated_at FROM users ORDER BY created_at DESC"
      )
      .all();

    const { results: keyCounts } = await db
      .prepare("SELECT user_id, COUNT(*) as key_count FROM api_keys GROUP BY user_id")
      .all();
    const keyMap: Record<string, number> = {};
    for (const kc of keyCounts || []) {
      if (kc.user_id) keyMap[kc.user_id] = Number(kc.key_count || 0);
    }

    const { results: usageCounts } = await db
      .prepare("SELECT user_id, COUNT(*) as req_count FROM usage_records WHERE user_id IS NOT NULL GROUP BY user_id")
      .all();
    const reqMap: Record<string, number> = {};
    for (const uc of usageCounts || []) {
      if (uc.user_id) reqMap[uc.user_id] = Number(uc.req_count || 0);
    }

    const formattedUsers = (users || []).map((u: any) => ({
      ...u,
      balance_usd: Number(u.balance_usd || 0),
      total_deposited_usd: Number(u.total_deposited_usd || 0),
      total_spent_usd: Number(u.total_spent_usd || 0),
      status: u.status || "ACTIVE",
      key_count: keyMap[u.id] || 0,
      request_count: reqMap[u.id] || 0,
    }));

    return new Response(
      JSON.stringify({
        success: true,
        users: formattedUsers,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }
};

// POST /api/admin/users - Adjust balance or toggle suspension
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request } = context;
  const auth = await verifyAdminUser(request);
  if (!auth.isAdmin || auth.errorResponse) {
    return auth.errorResponse!;
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  const { user_id, action, new_balance_usd, status } = body;
  if (!user_id || !action) {
    return new Response(JSON.stringify({ error: "user_id and action required" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  const user = await db.prepare("SELECT id, email, balance_usd FROM users WHERE id = ?")
    .bind(user_id)
    .first<any>();

  if (!user) {
    return new Response(JSON.stringify({ error: "User not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  if (action === "set_balance") {
    const val = parseFloat(new_balance_usd);
    if (isNaN(val) || val < 0) {
      return new Response(JSON.stringify({ error: "Invalid balance value" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      });
    }

    await db
      .prepare("UPDATE users SET balance_usd = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
      .bind(val, user_id)
      .run();

    return new Response(
      JSON.stringify({
        success: true,
        user_id,
        new_balance_usd: val,
        message: `Account balance for ${user.email} updated to $${val.toFixed(2)} USD.`,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
    );
  } else if (action === "set_status") {
    const newStatus = status === "SUSPENDED" ? "SUSPENDED" : "ACTIVE";
    await db
      .prepare("UPDATE users SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
      .bind(newStatus, user_id)
      .run();

    return new Response(
      JSON.stringify({
        success: true,
        user_id,
        status: newStatus,
        message: `User ${user.email} status set to ${newStatus}.`,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
    );
  }

  return new Response(JSON.stringify({ error: "Unknown action" }), {
    status: 400,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
};
