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
      id: "meta-llama/llama-3-70b-instruct",
      object: "model",
      created: 1713400000,
      owned_by: "verxl-decentralized-fleet",
      permission: [],
      root: "meta-llama/llama-3-70b-instruct",
      parent: null,
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
      pricing: {
        prompt_usd_per_1m: 0.08,
        completion_usd_per_1m: 0.10,
        protocol_fee_bps: 50,
      },
    },
    {
      id: "deepseek-ai/deepseek-v3",
      object: "model",
      created: 1735000000,
      owned_by: "verxl-decentralized-fleet",
      permission: [],
      root: "deepseek-ai/deepseek-v3",
      pricing: {
        prompt_usd_per_1m: 0.45,
        completion_usd_per_1m: 0.55,
        protocol_fee_bps: 50,
      },
    },
    {
      id: "mistralai/mixtral-8x7b-instruct",
      object: "model",
      created: 1702000000,
      owned_by: "verxl-decentralized-fleet",
      permission: [],
      root: "mistralai/mixtral-8x7b-instruct",
      pricing: {
        prompt_usd_per_1m: 0.22,
        completion_usd_per_1m: 0.26,
        protocol_fee_bps: 50,
      },
    },
  ];

  return new Response(
    JSON.stringify(
      {
        object: "list",
        data: models,
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
