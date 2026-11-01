// Cloudflare Pages Function: /v1/models
// Standard OpenAI SDK compatible model registry endpoint with 1M context, cached tokens & special hours fees

import { db } from "../api/lib/db";

interface Env {}

const MODEL_PARAMETERS = {
  temperature: { type: "number", minimum: 0, maximum: 2, default: 0.7 },
  think: {
    type: "boolean | string",
    values: ["off", "low", "medium", "high", "max"],
    aliases: ["enable_thinking", "reasoning_effort"],
    description: "Caller-controlled thinking. false/off disables; true/medium enables.",
  },
  reasoning_effort: {
    type: "string",
    values: ["none", "minimal", "low", "medium", "high", "xhigh", "max"],
    description: "Alias for think; passed through to the model.",
  },
};

const MODEL_CAPABILITIES = {
  chat: true,
  streaming: true,
  temperature: true,
  reasoning: true,
  supports_temperature: true,
  supports_reasoning: true,
};

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
      id: "qwen3.5-4b-uncensored-64k",
      object: "model",
      created: 1730000000,
      owned_by: "verxl-team-bulbasaur",
      permission: [],
      root: "qwen3.5-4b-uncensored-64k",
      context_window: 65536,
      context_length: 65536,
      max_model_len: 65536,
      context_display: "65,536 tokens (64K)",
      tier: "Inference Terminal Live Host (Bulbasaur Bare-Metal · 64K Context Resident)",
      is_official_bridge: false,
      capabilities: MODEL_CAPABILITIES,
      parameters: MODEL_PARAMETERS,
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
      capabilities: MODEL_CAPABILITIES,
      parameters: MODEL_PARAMETERS,
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
      capabilities: MODEL_CAPABILITIES,
      parameters: MODEL_PARAMETERS,
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
  let modelsSource = "fallback";
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
        const rawId = typeof m?.model_id === "string" ? m.model_id : m?.id;
        const id = typeof rawId === "string" && rawId.trim() ? rawId.trim() : "";
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
          capabilities: MODEL_CAPABILITIES,
          parameters: MODEL_PARAMETERS,
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
    if (dynamic.length > 0) {
      models = dynamic;
      modelsSource = "provider_registry";
    }
  } catch {
    // Keep the static fallback; /v1/models must remain usable if the DB is down.
  }

  return new Response(
    JSON.stringify(
      {
        object: "list",
        data: models,
        source: modelsSource,
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
        "Cache-Control": "public, max-age=10, s-maxage=10, stale-while-revalidate=30",
        ...CORS_HEADERS,
      },
    }
  );
};


export const onRequestHead: PagesFunction<Env> = async (context) => {
  const res = await onRequestGet(context);
  return new Response(null, { status: res.status, headers: res.headers });
};
