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
  stakedAmountVrxl: number;
  status: "ACTIVE" | "PROBATION" | "SLASHED" | "OFFLINE";
  lastAuditScore: number;     // e.g. 99.4%
  uptimePercent: number;
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
  {
    id: "zurich-node-5",
    name: "Zurich Swiss Alpine Data Pod",
    location: "Zurich, Switzerland",
    region: "EU-Central",
    endpointUrl: "https://zrh-pod5.verxl.network/v1",
    modelIdentifier: "mistralai/mixtral-8x7b-instruct",
    hardware: "8x NVIDIA A100 80GB",
    latencyMs: 21,
    ttftMs: 110,
    throughputTps: 92.4,
    pricePromptUsd: 0.22,
    priceCompletionUsd: 0.26,
    stakedAmountVrxl: 20000,
    status: "ACTIVE",
    lastAuditScore: 99.5,
    uptimePercent: 99.95,
  },
  {
    id: "unverified-probation-host",
    name: "Unverified Secondary Co-Lo",
    location: "Bratislava, Slovakia",
    region: "EU-Central",
    endpointUrl: "https://bts-unverified.verxl.network/v1",
    modelIdentifier: "meta-llama/llama-3-70b-instruct",
    hardware: "Consumer RTX 3090 Cluster",
    latencyMs: 88,
    ttftMs: 620,
    throughputTps: 34.0,
    pricePromptUsd: 0.38,
    priceCompletionUsd: 0.42,
    stakedAmountVrxl: 10000,
    status: "PROBATION",
    lastAuditScore: 74.2,
    uptimePercent: 94.20,
  },
  {
    id: "spoofed-slashed-node",
    name: "Malicious Quantization Honeypot",
    location: "Unknown",
    region: "Unknown",
    endpointUrl: "https://honeypot-spoof.verxl.network/v1",
    modelIdentifier: "meta-llama/llama-3-70b-instruct",
    hardware: "Emulated 4-bit Container",
    latencyMs: 145,
    ttftMs: 890,
    throughputTps: 22.0,
    pricePromptUsd: 0.30,
    priceCompletionUsd: 0.30,
    stakedAmountVrxl: 9000,
    status: "SLASHED",
    lastAuditScore: 51.1,
    uptimePercent: 62.10,
  },
];

export const INITIAL_AUDIT_LOGS: AuditRun[] = [
  {
    id: "probe-9021",
    providerName: "Prague Tier-3 Cluster 01",
    providerLocation: "Prague, Czechia",
    modelIdentifier: "meta-llama/llama-3-70b-instruct",
    timestamp: "12 mins ago",
    latencyMs: 18,
    ttftMs: 142,
    throughputTps: 84.5,
    fidelityScore: 99.4,
    passed: true,
    notes: "Deterministic seed-42 canary matched FP16 ground truth within 0.06% token edit distance.",
  },
  {
    id: "probe-9020",
    providerName: "Frankfurt Equinix Node A",
    providerLocation: "Frankfurt, Germany",
    modelIdentifier: "meta-llama/llama-3-8b-instruct",
    timestamp: "24 mins ago",
    latencyMs: 14,
    ttftMs: 48,
    throughputTps: 124.0,
    fidelityScore: 99.8,
    passed: true,
    notes: "High throughput baseline verified. Memory bandwidth > 1.8 TB/s confirmed.",
  },
  {
    id: "probe-9019",
    providerName: "Unverified Secondary Co-Lo",
    providerLocation: "Bratislava, Slovakia",
    modelIdentifier: "meta-llama/llama-3-70b-instruct",
    timestamp: "42 mins ago",
    latencyMs: 88,
    ttftMs: 620,
    throughputTps: 34.0,
    fidelityScore: 74.2,
    passed: false,
    notes: "TTFT exceeded 500ms threshold. Status shifted to PROBATION. Order flow throttled by 50%.",
  },
  {
    id: "probe-9018",
    providerName: "Malicious Quantization Honeypot",
    providerLocation: "Unknown",
    modelIdentifier: "meta-llama/llama-3-70b-instruct",
    timestamp: "1 hour ago",
    latencyMs: 145,
    ttftMs: 890,
    throughputTps: 22.0,
    fidelityScore: 51.1,
    passed: false,
    notes: "Confirmed model spoofing: node served INT4 quantized weights under FP16 billing. 1,000 $VRXL slashed (50% burn / 50% to DAO Vault).",
  },
];
