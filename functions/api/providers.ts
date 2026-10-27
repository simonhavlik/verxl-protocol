// Cloudflare Pages Function: /api/providers
// Returns active GPU Compute Provider fleet & Official Bridges

interface Env {}

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
};

export const onRequestGet: PagesFunction<Env> = async () => {
  const providers = [
    {
      id: "bulbasaur-prague-1",
      name: "Prague Bare-Metal Cluster 01 (Bulbasaur / Verxl Team)",
      location: "Prague, Czechia",
      region: "EU-Central",
      endpointUrl: "https://node1.verxl.com/v1",
      modelIdentifier: "qwen-3.5-4b-uncensored-32k",
      hardware: "Dedicated Bare-Metal Vulkan GPU",
      latencyMs: 12,
      ttftMs: 38,
      throughputTps: 52.4,
      pricePromptUsd: 0.06,
      priceCompletionUsd: 0.09,
      stakedAmountVrxl: 35000,
      status: "ACTIVE",
      lastAuditScore: 99.8,
      uptimePercent: 99.99,
      providerType: "SELF_HOSTED",
      contextWindow: 32768,
      operatorAddress: "0x8F590f2098D71A8253ad50450D7A73F3201402F0",
      notes: "Verxl Foundation self-hosted cluster serving uncensored 32k context model.",
    },
    {
      id: "xiaomi-bridge-1",
      name: "Xiaomi Cloud Official Bridge Gateway",
      location: "Global Edge / Frankfurt & Beijing",
      region: "GLOBAL",
      endpointUrl: "https://api.xiaomimimo.com/v1 (via Verxl Bridge)",
      modelIdentifier: "xiaomi/mimo-2.6-flash & pro",
      hardware: "Xiaomi Mi Distributed Tensor Cluster",
      latencyMs: 22,
      ttftMs: 85,
      throughputTps: 110.0,
      pricePromptUsd: 0.12,
      priceCompletionUsd: 0.18,
      stakedAmountVrxl: 45000,
      status: "ACTIVE",
      lastAuditScore: 99.6,
      uptimePercent: 99.95,
      providerType: "OFFICIAL_BRIDGE",
      contextWindow: 131072,
      operatorAddress: "0x1b7A7e9308F6B62f8D91Ce78D7e47761Af1E72A2",
      notes: "Official non-custodial bridge to Xiaomi Mi MIMO 2.6 Flash (64k) & Pro (128k) public APIs.",
    },
    {
      id: "deepseek-bridge-1",
      name: "DeepSeek Official Bridge Gateway",
      location: "Global Edge / Hangzhou & Tokyo",
      region: "GLOBAL",
      endpointUrl: "https://api.deepseek.com/v1 (via Verxl Bridge)",
      modelIdentifier: "deepseek/deepseek-v4.1-flash",
      hardware: "DeepSeek MoE Inference Engine",
      latencyMs: 28,
      ttftMs: 92,
      throughputTps: 135.0,
      pricePromptUsd: 0.14,
      priceCompletionUsd: 0.28,
      stakedAmountVrxl: 50000,
      status: "ACTIVE",
      lastAuditScore: 99.5,
      uptimePercent: 99.92,
      providerType: "OFFICIAL_BRIDGE",
      contextWindow: 131072,
      operatorAddress: "0x789C19f85D208b07221C3470F16C6A08534C08D3",
      notes: "Official non-custodial bridge to DeepSeek v4.1 Flash high-concurrency MoE public API.",
    },
  ];

  return new Response(
    JSON.stringify(
      {
        totalNodes: providers.length,
        totalStakedVrxl: providers.reduce((acc, p) => acc + p.stakedAmountVrxl, 0),
        providers,
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
