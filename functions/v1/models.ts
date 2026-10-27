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
      is_official_bridge: true,
      pricing: {
        prompt_usd_per_1m: 0.05,
        cached_prompt_usd_per_1m: 0.01,
        completion_usd_per_1m: 0.10,
        special_hours_pricing: {
          prompt_usd_per_1m: 0.025,
          completion_usd_per_1m: 0.05,
          window: "24/7 Dedicated Bare-Metal Flat Host (Off-Peak Priority)",
        },
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
      id: "deepseek/deepseek-v4-pro",
      object: "model",
      created: 1730000000,
      owned_by: "deepseek-official-bridge",
      permission: [],
      root: "deepseek/deepseek-v4-pro",
      context_window: 1000000,
      context_display: "1,000,000 tokens (1M)",
      tier: "Official Bridge to Public API",
      is_official_bridge: true,
      pricing: {
        prompt_usd_per_1m: 1.32,
        cached_prompt_usd_per_1m: 0.044,
        completion_usd_per_1m: 3.96,
        special_hours_pricing: {
          prompt_usd_per_1m: 0.66,
          completion_usd_per_1m: 1.98,
          cached_prompt_usd_per_1m: 0.022,
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
        special_hours_pricing: {
          prompt_usd_per_1m: 0.14,
          completion_usd_per_1m: 0.28,
          window: "Official Overseas Flat Rate ($0.14 Prompt / $0.28 Output)",
        },
        protocol_fee_bps: 50,
      },
    },
    {
      id: "xiaomi/mimo-2.6-pro",
      object: "model",
      created: 1730000000,
      owned_by: "xiaomi-official-bridge",
      permission: [],
      root: "xiaomi/mimo-2.6-pro",
      context_window: 1000000,
      context_display: "1,000,000 tokens (1M)",
      tier: "Official Bridge to Public API",
      is_official_bridge: true,
      pricing: {
        prompt_usd_per_1m: 0.435,
        cached_prompt_usd_per_1m: 0.0036,
        completion_usd_per_1m: 0.87,
        special_hours_pricing: {
          prompt_usd_per_1m: 0.435,
          completion_usd_per_1m: 0.87,
          window: "Flagship 1T Trillion Parameter Logic Engine",
        },
        protocol_fee_bps: 50,
      },
    },
    {
      id: "meta-llama/llama-3-70b-instruct",
      object: "model",
      created: 1713400000,
      owned_by: "verxl-decentralized-fleet",
      permission: [],
      root: "meta-llama/llama-3-70b-instruct",
      context_window: 131072,
      context_display: "131,072 tokens",
      tier: "Decentralized Fleet",
      is_official_bridge: false,
      pricing: {
        prompt_usd_per_1m: 0.65,
        cached_prompt_usd_per_1m: 0.13,
        completion_usd_per_1m: 0.70,
        special_hours_pricing: null,
        protocol_fee_bps: 50,
      },
    },
    {
      id: "meta-llama/llama-3-8b-instruct",
      object: "model",
      created: 1713400000,
      owned_by: "verxl-decentralized-fleet",
      permission: [],
      root: "meta-llama/llama-3-8b-instruct",
      context_window: 131072,
      context_display: "131,072 tokens",
      tier: "Decentralized Fleet",
      is_official_bridge: false,
      pricing: {
        prompt_usd_per_1m: 0.08,
        cached_prompt_usd_per_1m: 0.02,
        completion_usd_per_1m: 0.10,
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
