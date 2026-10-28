// Cloudflare Pages Function: /v1/models
// Standard OpenAI SDK compatible model registry endpoint with 1M context, cached tokens & special hours fees

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
  const models = [
    {
      id: "qwen3.5-4b-uncensored-32k",
      object: "model",
      created: 1730000000,
      owned_by: "verxl-team-bulbasaur",
      permission: [],
      root: "qwen3.5-4b-uncensored-32k",
      context_window: 1000000,
      context_display: "1,000,000 tokens (1M)",
      tier: "Inference Terminal Live Host (Bulbasaur Bare-Metal · 1M Context Resident)",
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
      id: "deepseek/deepseek-v4.1-flash",
      object: "model",
      created: 1730000000,
      owned_by: "deepseek-official-bridge",
      permission: [],
      root: "deepseek/deepseek-v4.1-flash",
      context_window: 1000000,
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
      id: "xiaomi/mimo-2.6-flash",
      object: "model",
      created: 1730000000,
      owned_by: "xiaomi-official-bridge",
      permission: [],
      root: "xiaomi/mimo-2.6-flash",
      context_window: 1000000,
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
