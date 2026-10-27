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
      notes: "Verxl Foundation self-hosted cluster serving uncensored 32k context model.",
    },
    {
      id: "xiaomi-bridge-1",
      name: "Xiaomi Cloud Official Bridge Gateway",
      location: "Global Edge / Frankfurt & Beijing",
      region: "GLOBAL",
      endpointUrl: "https://api.xiaomimimo.com/v1 (via Verxl Bridge)",
      modelIdentifier: "xiaomi/mimo-2.6-flash / pro",
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
      notes: "Official non-custodial bridge to DeepSeek v4.1 Flash high-concurrency MoE public API.",
    },
    {
      id: "brno-gpu-2",
      name: "Brno Mining Facility Transition Cluster",
      location: "Brno, Czechia",
      region: "EU-Central",
      endpointUrl: "https://brn-cluster2.verxl.network/v1",
      modelIdentifier: "meta-llama/llama-3-70b-instruct",
      hardware: "16x NVIDIA RTX 4090",
      latencyMs: 24,
      ttftMs: 185,
      throughputTps: 68.2,
      pricePromptUsd: 0.62,
      priceCompletionUsd: 0.66,
      stakedAmountVrxl: 28000,
      status: "ACTIVE",
      lastAuditScore: 98.9,
      uptimePercent: 99.85,
      providerType: "COMMUNITY_NODE",
      notes: "Independent Czech GPU mining transition facility.",
    },
    {
      id: "frankfurt-dc-0",
      name: "Frankfurt Equinix Node A",
      location: "Frankfurt, Germany",
      region: "EU-West",
      endpointUrl: "https://fra-gpu0.verxl.network/v1",
      modelIdentifier: "meta-llama/llama-3-8b-instruct",
      hardware: "4x NVIDIA A100 80GB",
      latencyMs: 14,
      ttftMs: 48,
      throughputTps: 124.0,
      pricePromptUsd: 0.08,
      priceCompletionUsd: 0.10,
      stakedAmountVrxl: 15000,
      status: "ACTIVE",
      lastAuditScore: 99.8,
      uptimePercent: 100.0,
      providerType: "COMMUNITY_NODE",
      notes: "Low-latency Frankfurt hosting for fast 8B completion.",
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
