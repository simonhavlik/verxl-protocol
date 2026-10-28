export interface GpuProvider {
  id: string;
  name: string;
  location: string;
  region: string;
  endpointUrl: string;
  modelIdentifier: string;
  hardware: string;
  latencyMs: number;
  ttftMs: number;
  throughputTps: number;
  pricePromptUsd: number;     // per 1M tokens
  priceCompletionUsd: number; // per 1M tokens
  priceCachedPromptUsd?: number; // per 1M cached tokens
  specialHoursDiscount?: string;
  stakedAmountVrxl: number;
  status: "ACTIVE" | "PROBATION" | "SLASHED" | "OFFLINE" | "PENDING_AUDIT";
  lastAuditScore: number;     // e.g. 99.4%
  uptimePercent: number;
  providerType?: "SELF_HOSTED" | "OFFICIAL_BRIDGE" | "COMMUNITY_NODE";
  contextWindow?: number;
  operatorAddress?: string;
  fallbacks?: string[];
}

export interface AuditRun {
  id: string;
  providerName: string;
  providerLocation: string;
  modelIdentifier: string;
  timestamp: string;
  latencyMs: number;
  ttftMs: number;
  throughputTps: number;
  fidelityScore: number;
  passed: boolean;
  notes: string;
}

export const INITIAL_PROVIDERS: GpuProvider[] = [
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
    pricePromptUsd: 0.05,
    priceCompletionUsd: 0.10,
    priceCachedPromptUsd: 0.010,
    stakedAmountVrxl: 35000,
    status: "ACTIVE",
    lastAuditScore: 99.8,
    uptimePercent: 99.99,
    providerType: "SELF_HOSTED",
    contextWindow: 1000000,
    operatorAddress: "0x8F590f2098D71A8253ad50450D7A73F3201402F0",
    fallbacks: ["http://212.227.211.88:11645/v1"],
  },
  {
    id: "xiaomi-bridge-1",
    name: "Xiaomi Cloud Official Bridge Gateway",
    location: "Global Edge / Frankfurt & Beijing",
    region: "GLOBAL",
    endpointUrl: "https://api.xiaomimimo.com/v1 (via Verxl Bridge)",
    modelIdentifier: "xiaomi/mimo-2.6-flash",
    hardware: "Xiaomi Mi Distributed Tensor Cluster",
    latencyMs: 22,
    ttftMs: 85,
    throughputTps: 110.0,
    pricePromptUsd: 0.14,
    priceCompletionUsd: 0.28,
    priceCachedPromptUsd: 0.0028,
    stakedAmountVrxl: 45000,
    status: "ACTIVE",
    lastAuditScore: 99.6,
    uptimePercent: 99.95,
    providerType: "OFFICIAL_BRIDGE",
    contextWindow: 1000000,
    operatorAddress: "0x1b7A7e9308F6B62f8D91Ce78D7e47761Af1E72A2",
    fallbacks: ["https://opencode.ai/zen/go/v1"],
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
    pricePromptUsd: 0.30,
    priceCompletionUsd: 1.20,
    priceCachedPromptUsd: 0.006,
    specialHoursDiscount: "50% Off-Peak ($0.15 / $0.60, Cache $0.003) outside 01:00-04:00 & 06:00-10:00 UTC",
    stakedAmountVrxl: 50000,
    status: "ACTIVE",
    lastAuditScore: 99.5,
    uptimePercent: 99.92,
    providerType: "OFFICIAL_BRIDGE",
    contextWindow: 1000000,
    operatorAddress: "0x789C19f85D208b07221C3470F16C6A08534C08D3",
    fallbacks: ["https://opencode.ai/zen/go/v1", "https://api.deepseek.com/v1"],
  },
];

export const INITIAL_AUDITS: AuditRun[] = [
  {
    id: "audit-run-902",
    providerName: "Prague Bare-Metal Cluster 01 (Bulbasaur / Verxl Team)",
    providerLocation: "Prague, Czechia",
    modelIdentifier: "qwen-3.5-4b-uncensored-32k",
    timestamp: "Just now",
    latencyMs: 12,
    ttftMs: 38,
    throughputTps: 52.4,
    fidelityScore: 99.8,
    passed: true,
    notes: "Self-hosted bare-metal node passed seed-42 invariant check with zero token drift.",
  },
  {
    id: "audit-run-901",
    providerName: "Xiaomi Cloud Official Bridge Gateway",
    providerLocation: "Global Edge / Frankfurt & Beijing",
    modelIdentifier: "xiaomi/mimo-2.6-flash",
    timestamp: "2 mins ago",
    latencyMs: 22,
    ttftMs: 85,
    throughputTps: 110.0,
    fidelityScore: 99.6,
    passed: true,
    notes: "Official API bridge SLA verified. Escrow bond of 45,000 $VRXL locked.",
  },
  {
    id: "audit-run-900",
    providerName: "DeepSeek Official Bridge Gateway",
    providerLocation: "Global Edge / Hangzhou & Tokyo",
    modelIdentifier: "deepseek/deepseek-v4.1-flash",
    timestamp: "5 mins ago",
    latencyMs: 28,
    ttftMs: 92,
    throughputTps: 135.0,
    fidelityScore: 99.5,
    passed: true,
    notes: "High-concurrency MoE bridge verified. Invariant precision SLA maintained.",
  },
];

export const INITIAL_AUDIT_LOGS = INITIAL_AUDITS;
