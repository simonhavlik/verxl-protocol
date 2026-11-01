import { CORS_HEADERS } from "../../lib/auth";
import { db } from "../../lib/db";
import { verifyAdminUser } from "../lib";

interface Env {}

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
};

// GET /api/admin/providers/applications - List all provider applications
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request } = context;
  const auth = await verifyAdminUser(request);
  if (!auth.isAdmin || auth.errorResponse) {
    return auth.errorResponse!;
  }

  try {
    const { results } = await db
      .prepare(
        "SELECT id, name, operator_address, endpoint_url, model_identifier, hardware, location, region, price_prompt_usd, price_completion_usd, cached_prompt_usd, context_window, allow_thinking, allow_temperature, allow_tools, website, contact_email, message, status, created_at FROM provider_applications ORDER BY created_at DESC"
      )
      .all();

    return new Response(JSON.stringify({ success: true, applications: results || [] }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }
};

// POST /api/admin/providers/applications - Approve, reject or delete application
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

  const { application_id, action } = body;
  if (!application_id || !action) {
    return new Response(JSON.stringify({ error: "application_id and action required" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  const app = await db
    .prepare("SELECT * FROM provider_applications WHERE id = ?")
    .bind(application_id)
    .first<any>();

  if (!app) {
    return new Response(JSON.stringify({ error: "Application not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  if (action === "approve") {
    // 1. Update application status
    await db
      .prepare("UPDATE provider_applications SET status = 'APPROVED' WHERE id = ?")
      .bind(application_id)
      .run();

    // 2. Provision new provider in verxl.providers
    const providerId = `node_${app.name.toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 20)}_${Math.random().toString(36).substring(2, 6)}`;
    const modelConfig = [
      {
        name: `${app.name} (${app.model_identifier})`,
        model_id: app.model_identifier,
        prompt_rate: Number(app.price_prompt_usd) || 0.05,
        completion_rate: Number(app.price_completion_usd) || 0.10,
        cached_prompt_rate: Number(app.cached_prompt_usd) || 0.01,
        context_window: Math.max(1, Number(app.context_window) || 32768),
        context_display: Number(app.context_window) >= 1000000
          ? `${(Number(app.context_window) / 1000000).toFixed(0)},000,000 tokens (${(Number(app.context_window) / 1000000).toFixed(0)}M)`
          : `${Number(app.context_window || 32768).toLocaleString()} tokens (${Math.round(Number(app.context_window || 32768) / 1024)}K)`,
        allow_thinking: app.allow_thinking === true,
        allow_temperature: app.allow_temperature !== false,
        allow_tools: app.allow_tools === true,
        special_hours_description: null,
        special_hours_prompt_rate: null,
        special_hours_completion_rate: null,
      },
    ];

    await db
      .prepare(
        `INSERT INTO providers (
          id, name, base_url, payout_address, is_official_bridge, status,
          models_config, contact_email, website, pending_payout_usd, total_earned_usd, created_at
        ) VALUES (?, ?, ?, ?, false, 'ACTIVE', ?, ?, ?, 0, 0, CURRENT_TIMESTAMP)`
      )
      .bind(
        providerId,
        app.name,
        app.endpoint_url,
        app.operator_address || "0x14f10A865e277C0B1949e18Dd9856602DB11742b",
        JSON.stringify(modelConfig),
        app.contact_email,
        app.website
      )
      .run();

    return new Response(
      JSON.stringify({
        success: true,
        action: "approved",
        provider_id: providerId,
        message: `Application approved and provider node '${app.name}' provisioned.`,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
    );
  } else if (action === "reject") {
    await db
      .prepare("UPDATE provider_applications SET status = 'REJECTED' WHERE id = ?")
      .bind(application_id)
      .run();

    return new Response(
      JSON.stringify({ success: true, action: "rejected", message: "Application rejected." }),
      { status: 200, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
    );
  } else if (action === "delete") {
    await db
      .prepare("DELETE FROM provider_applications WHERE id = ?")
      .bind(application_id)
      .run();

    return new Response(
      JSON.stringify({ success: true, action: "deleted", message: "Application deleted." }),
      { status: 200, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
    );
  }

  return new Response(JSON.stringify({ error: "Invalid action" }), {
    status: 400,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
};
