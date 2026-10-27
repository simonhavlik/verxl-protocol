// Cloudflare Pages Function: /api/providers
// Returns active GPU Compute Provider fleet

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
      id: "prague-node-1",
      name: "Prague Tier-3 Cluster 01",
      location: "Prague, Czechia",
      region: "EU-Central",
      endpointUrl: "https://prg-node1.verxl.network/v1",
      modelIdentifier: "meta-llama/llama-3-70b-instruct",
      hardware: "8x NVIDIA H100 SXM5",
      latencyMs: 18,
      ttftMs: 142,
      throughputTps: 84.5,
      pricePromptUsd: 0.65,
      priceCompletionUsd: 0.70,
      stakedAmountVrxl: 35000,
      status: "ACTIVE",
      lastAuditScore: 99.4,
      uptimePercent: 99.98,
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
    },
    {
      id: "warsaw-hpc-1",
      name: "Warsaw Secondary Compute Hub",
      location: "Warsaw, Poland",
      region: "EU-East",
      endpointUrl: "https://waw-node1.verxl.network/v1",
      modelIdentifier: "deepseek-ai/deepseek-v3",
      hardware: "8x NVIDIA H800",
      latencyMs: 29,
      ttftMs: 165,
      throughputTps: 76.1,
      pricePromptUsd: 0.45,
      priceCompletionUsd: 0.55,
      stakedAmountVrxl: 30000,
      status: "ACTIVE",
      lastAuditScore: 99.1,
      uptimePercent: 99.91,
    },
  ];

  return new Response(JSON.stringify({ count: providers.length, providers }, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      ...CORS_HEADERS,
    },
  });
};
