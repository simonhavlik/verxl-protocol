// Cloudflare Pages Function: /v1/models
// Standard OpenAI SDK compatible model registry endpoint

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
      context_window: 32768,
      tier: "Inference Terminal Live Host (Bulbasaur Bare-Metal · 32k Resident)",
      pricing: {
        prompt_usd_per_1m: 0.06,
        completion_usd_per_1m: 0.09,
        protocol_fee_bps: 50,
      },
    },
    {
      id: "qwen3.5-4b-uncensored-8k",
      object: "model",
      created: 1730000000,
      owned_by: "verxl-team-bulbasaur",
      permission: [],
      root: "qwen3.5-4b-uncensored-32k",
      context_window: 32768,
      tier: "Compatibility Alias (Directs to 32k Resident Model)",
      pricing: {
        prompt_usd_per_1m: 0.05,
        completion_usd_per_1m: 0.07,
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
      context_window: 65536,
      tier: "Official Bridge to Public API",
      pricing: {
        prompt_usd_per_1m: 0.12,
        completion_usd_per_1m: 0.18,
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
      context_window: 131072,
      tier: "Official Bridge to Public API",
      pricing: {
        prompt_usd_per_1m: 0.35,
        completion_usd_per_1m: 0.45,
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
      context_window: 131072,
      tier: "Official Bridge to Public API",
      pricing: {
        prompt_usd_per_1m: 0.14,
        completion_usd_per_1m: 0.28,
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
      context_window: 8192,
      tier: "Decentralized Fleet",
      pricing: {
        prompt_usd_per_1m: 0.65,
        completion_usd_per_1m: 0.70,
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
      context_window: 8192,
      tier: "Decentralized Fleet",
      pricing: {
        prompt_usd_per_1m: 0.08,
        completion_usd_per_1m: 0.10,
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
