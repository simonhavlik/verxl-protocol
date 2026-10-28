import { CORS_HEADERS } from "../../lib/auth";
import { db } from "../../lib/db";
import { verifyAdminUser } from "../lib";

interface Env {}

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
};

// GET /api/admin/providers/monitoring - Provider fleet traffic monitoring
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request } = context;
  const auth = await verifyAdminUser(request);
  if (!auth.isAdmin || auth.errorResponse) {
    return auth.errorResponse!;
  }

  try {
    const { results: providers } = await db
      .prepare(
        "SELECT id, name, base_url, payout_address, is_official_bridge, status, models_config, contact_email, website, pending_payout_usd, total_earned_usd, created_at FROM providers ORDER BY created_at ASC"
      )
      .all();

    // Query aggregate traffic statistics from usage_records per provider
    const { results: usageStats } = await db
      .prepare(
        `SELECT
          provider_id,
          COUNT(*) as request_count,
          COALESCE(SUM(prompt_tokens), 0) as total_prompt_tokens,
          COALESCE(SUM(completion_tokens), 0) as total_completion_tokens,
          COALESCE(SUM(total_cost_usd), 0) as total_cost_usd,
          COALESCE(SUM(provider_revenue_usd), 0) as total_revenue_usd,
          MAX(created_at) as last_request_at
        FROM usage_records
        GROUP BY provider_id`
      )
      .all();

    const statsMap: Record<string, any> = {};
    for (const stat of usageStats || []) {
      if (stat.provider_id) {
        statsMap[stat.provider_id] = stat;
      }
    }

    // Query recent 20 inference requests
    const { results: recentLogs } = await db
      .prepare(
        `SELECT id, user_id, provider_id, model, prompt_tokens, completion_tokens, total_cost_usd, protocol_fee_usd, created_at
        FROM usage_records
        ORDER BY created_at DESC
        LIMIT 25`
      )
      .all();

    const enrichedProviders = (providers || []).map((p: any) => {
      const stat = statsMap[p.id] || {};
      let parsedModels: any[] = [];
      try {
        parsedModels = typeof p.models_config === "string" ? JSON.parse(p.models_config) : (p.models_config || []);
      } catch {
        parsedModels = [];
      }

      return {
        ...p,
        models_config: parsedModels,
        request_count: Number(stat.request_count || 0),
        total_prompt_tokens: Number(stat.total_prompt_tokens || 0),
        total_completion_tokens: Number(stat.total_completion_tokens || 0),
        total_cost_usd: Number(stat.total_cost_usd || 0),
        total_revenue_usd: Number(stat.total_revenue_usd || 0),
        last_request_at: stat.last_request_at || null,
      };
    });

    return new Response(
      JSON.stringify({
        success: true,
        providers: enrichedProviders,
        recent_logs: recentLogs || [],
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

// POST /api/admin/providers/monitoring - Update provider status (ACTIVE, SUSPENDED, REVOKED)
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

  const { provider_id, status } = body;
  if (!provider_id || !status) {
    return new Response(JSON.stringify({ error: "provider_id and status required" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  const validStatuses = ["ACTIVE", "SUSPENDED", "REVOKED"];
  if (!validStatuses.includes(status)) {
    return new Response(JSON.stringify({ error: "Invalid status value" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  await db
    .prepare("UPDATE providers SET status = ? WHERE id = ?")
    .bind(status, provider_id)
    .run();

  return new Response(
    JSON.stringify({
      success: true,
      provider_id,
      status,
      message: `Provider status updated to ${status}.`,
    }),
    { status: 200, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
  );
};
