// Cloudflare Pages Function: /v1/models
// Standard OpenAI SDK compatible model registry endpoint with 1M context, cached tokens & special hours fees

import { db } from "../api/lib/db";

interface Env {}

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
};

export const onRequestGet: PagesFunction<Env> = async () => {
  const fallbackModels = [
    {
      id: "qwen3.5-4b-uncensored-32k",
      object: "model",
      created: 1730000000,
      owned_by: "verxl-team-bulbasaur",
      permission: [],
      root: "qwen3.5-4b-uncensored-32k",
      context_window: 32768,
      context_length: 32768,
      max_model_len: 32768,
      context_display: "32,768 tokens (32K)",
      tier: "Inference Terminal Live Host (Bulbasaur Bare-Metal · 32K Context Resident)",
      is_official_bridge: false,
      pricing: {
        prompt_usd_per_1m: 0.05,
        cached_prompt_usd_per_1m: 0.010,
        completion_usd_per_1m: 0.10,
        special_hours_pricing: null,
        protocol_fee_bps: 50,
      },
    },
    {
      id: "deepseek-v4.1-flash",
      object: "model",
      created: 1730000000,
      owned_by: "deepseek-official-bridge",
      permission: [],
      root: "deepseek-v4.1-flash",
      context_window: 1000000,
      context_length: 1000000,
      max_model_len: 1000000,
      context_display: "1,000,000 tokens (1M)",
      tier: "Official Bridge to Public API",
      is_official_bridge: true,
      pricing: {
        prompt_usd_per_1m: 0.30,
        cached_prompt_usd_per_1m: 0.006,
        completion_usd_per_1m: 1.20,
        special_hours_pricing: {
          prompt_usd_per_1m: 0.15,
          completion_usd_per_1m: 0.60,
          cached_prompt_usd_per_1m: 0.003,
          window: "Off-Peak (50% Off outside 01:00-04:00 & 06:00-10:00 UTC Mon-Fri, all weekends)",
        },
        protocol_fee_bps: 50,
      },
    },
    {
      id: "mimo-v2.6-flash",
      object: "model",
      created: 1730000000,
      owned_by: "xiaomi-official-bridge",
      permission: [],
      root: "mimo-v2.6-flash",
      context_window: 1000000,
      context_length: 1000000,
      max_model_len: 1000000,
      context_display: "1,000,000 tokens (1M)",
      tier: "Official Bridge to Public API",
      is_official_bridge: true,
      pricing: {
        prompt_usd_per_1m: 0.14,
        cached_prompt_usd_per_1m: 0.0028,
        completion_usd_per_1m: 0.28,
        special_hours_pricing: null,
        protocol_fee_bps: 50,
      },
    },
  ];

  // The registry is the source of truth. A provider's models_config (edited in
  // the console) supplies the context window and price; the static list above is
  // only a resilience fallback when the database is unavailable.
  let models = fallbackModels;
  try {
    const { results: providerRows } = await db.prepare(
      "SELECT id, name, is_official_bridge, models_config FROM providers WHERE status = 'ACTIVE' ORDER BY is_official_bridge DESC, created_at ASC"
    ).all();

    const dynamic: any[] = [];
    const seen = new Set<string>();
    for (const row of providerRows || []) {
      let configs: any[] = [];
      try {
        configs = typeof (row as any).models_config === "string"
          ? JSON.parse((row as any).models_config)
          : ((row as any).models_config || []);
      } catch {
        continue;
      }
      for (const m of configs) {
        const id = typeof m?.id === "string" && m.id.trim() ? m.id.trim() : "";
        if (!id || seen.has(id)) continue;
        seen.add(id);
        const rawContext = Number(m.context_window ?? m.context_length ?? m.max_model_len ?? 0);
        const context = Number.isFinite(rawContext) && rawContext > 0 ? Math.floor(rawContext) : 128000;
        dynamic.push({
          id,
          object: "model",
          created: 1730000000,
          owned_by: (row as any).name || "verxl-provider",
          permission: [],
          root: id,
          context_window: context,
          context_length: context,
          max_model_len: context,
          context_display: context >= 1000000 ? `${(context / 1000000).toFixed(0)},000,000 tokens (${(context / 1000000).toFixed(0)}M)` : `${context.toLocaleString()} tokens (${Math.round(context / 1024)}K)`,
          tier: (row as any).is_official_bridge ? "Official Bridge" : "Community Provider",
          is_official_bridge: Boolean((row as any).is_official_bridge),
          provider_id: (row as any).id,
          pricing: {
            prompt_usd_per_1m: Number(m.price_prompt_usd ?? m.prompt_rate ?? 0),
            cached_prompt_usd_per_1m: Number(m.price_cached_prompt_usd ?? m.cached_prompt_rate ?? 0),
            completion_usd_per_1m: Number(m.price_completion_usd ?? m.completion_rate ?? 0),
            special_hours_pricing: m.special_hours_discount || null,
            protocol_fee_bps: 50,
          },
        });
      }
    }
    if (dynamic.length > 0) models = dynamic;
  } catch {
    // Keep the static fallback; /v1/models must remain usable if the DB is down.
  }

  return new Response(
    JSON.stringify(
      {
        object: "list",
        data: models,
        verxl_clearing: {
          protocol_fee_bps: 50,
          governance_token: "0x8F590f2098D71A8253ad50450D7A73F3201402F0",
          dao_vault: "0xf0e51fB0FFBD8ef36281b6f643E0f7953BD5111a",
        },
        verxl_docs: {
          docs: "https://verxl.com/docs",
          openapi: "https://verxl.com/openapi.json",
          llms_txt: "https://verxl.com/llms.txt",
          health: "https://verxl.com/api/health",
          mcp: "https://verxl.com/mcp",
          authentication: "All inference requires Authorization: Bearer vrxl_live_... . Documentation, models and health are public.",
          inference_auth_required: true,
        },
      },
      null,
      2
    ),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...CORS_HEADERS,
      },
    }
  );
};


export const onRequestHead: PagesFunction<Env> = async (context) => {
  const res = await onRequestGet(context);
  return new Response(null, { status: res.status, headers: res.headers });
};
