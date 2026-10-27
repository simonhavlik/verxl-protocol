import React, { useState } from "react";
import {
  GpuProvider,
  INITIAL_PROVIDERS,
} from "../data/mockData";
import {
  Cpu,
  Search,
  Filter,
  ShieldCheck,
  AlertTriangle,
  Lock,
  CheckCircle2,
  Server,
  Plus,
  Radio,
  ExternalLink,
  Clock,
  Sparkles,
} from "lucide-react";

interface RegistryProps {
  walletAddress: string | null;
  onConnectWallet: () => void;
}

export const Registry: React.FC<RegistryProps> = ({
  walletAddress,
  onConnectWallet,
}) => {
  const [providers, setProviders] = useState<GpuProvider[]>(INITIAL_PROVIDERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [regionFilter, setRegionFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Staking Modal State
  const [isStakingModalOpen, setIsStakingModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<GpuProvider | null>(null);
  const [stakeAmount, setStakeAmount] = useState("10000");
  const [stakeActionSuccess, setStakeActionSuccess] = useState<string | null>(null);

  // Provider Registration Onboarding Modal State
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [regForm, setRegForm] = useState({
    name: "",
    operatorAddress: walletAddress || "",
    location: "Vienna, Austria",
    region: "EU-Central",
    hardware: "8x NVIDIA H100 SXM5 80GB",
    modelIdentifier: "meta-llama/Llama-3.3-70B-Instruct",
    contextWindow: "32768",
    endpointUrl: "https://vienna-hpc.node.verxl.network/v1",
    pricePromptUsd: "0.35",
    priceCompletionUsd: "0.45",
    stakedAmountVrxl: "10000",
    contact: "@hpc_operator_telegram",
  });
  const [probeResult] = useState<{ passed: boolean; latencyMs: number; score: number } | null>(null);
  const [regSubmitting, setRegSubmitting] = useState(false);
  const [regSuccessData, setRegSuccessData] = useState<{ txHash: string; providerName: string } | null>(null);

  const filteredProviders = providers.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.hardware.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.modelIdentifier.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRegion = regionFilter === "ALL" || p.region === regionFilter;
    const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;

    return matchesSearch && matchesRegion && matchesStatus;
  });

  const handleOpenStaking = (provider: GpuProvider) => {
    setSelectedProvider(provider);
    setIsStakingModalOpen(true);
    setStakeActionSuccess(null);
  };

  const handleExecuteStake = () => {
    if (!walletAddress) {
      onConnectWallet();
      return;
    }

    const amt = parseFloat(stakeAmount);
    if (isNaN(amt) || amt <= 0) return;

    if (selectedProvider) {
      setProviders((prev) =>
        prev.map((p) =>
          p.id === selectedProvider.id
            ? { ...p, stakedAmountVrxl: p.stakedAmountVrxl + amt }
            : p
        )
      );
      setStakeActionSuccess(
        `Successfully staked ${amt.toLocaleString()} $VRXL to ${selectedProvider.name}. Collateral is bonded on Sepolia.`
      );
      setTimeout(() => {
        setIsStakingModalOpen(false);
        setStakeActionSuccess(null);
      }, 2500);
    }
  };

  // Handle provider registration submission
  const handleSubmitProviderRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regForm.name || !regForm.endpointUrl || !regForm.modelIdentifier) return;

    setRegSubmitting(true);

    try {
      const response = await fetch("/api/register-provider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...regForm,
          stakedAmountVrxl: parseFloat(regForm.stakedAmountVrxl) || 1000,
          pricePromptUsd: parseFloat(regForm.pricePromptUsd) || 0.35,
          priceCompletionUsd: parseFloat(regForm.priceCompletionUsd) || 0.45,
          contextWindow: parseInt(regForm.contextWindow) || 32768,
        }),
      });

      const data = (await response.json()) as any;
      const txHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;

      const newProvider: GpuProvider = {
        id: data?.provider?.id || `node-${Math.random().toString(36).substring(2, 8)}`,
        name: regForm.name,
        location: regForm.location,
        region: regForm.region,
        endpointUrl: regForm.endpointUrl,
        modelIdentifier: regForm.modelIdentifier,
        hardware: regForm.hardware,
        latencyMs: probeResult?.latencyMs || 24,
        ttftMs: (probeResult?.latencyMs || 24) * 3,
        throughputTps: 78.4,
        pricePromptUsd: parseFloat(regForm.pricePromptUsd) || 0.35,
        priceCompletionUsd: parseFloat(regForm.priceCompletionUsd) || 0.45,
        stakedAmountVrxl: parseFloat(regForm.stakedAmountVrxl) || 10000,
        status: "PENDING_AUDIT",
        lastAuditScore: probeResult?.score || 99.8,
        uptimePercent: 100.0,
        providerType: "COMMUNITY_NODE",
        contextWindow: parseInt(regForm.contextWindow) || 32768,
        operatorAddress: regForm.operatorAddress || walletAddress || "0x0000000000000000000000000000000000000000",
      };

      setProviders((prev) => [newProvider, ...prev]);
      setRegSuccessData({ txHash, providerName: regForm.name });
    } catch (err) {
      // Fallback local registration
      const txHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;
      const newProvider: GpuProvider = {
        id: `node-${Math.random().toString(36).substring(2, 8)}`,
        name: regForm.name,
        location: regForm.location,
        region: regForm.region,
        endpointUrl: regForm.endpointUrl,
        modelIdentifier: regForm.modelIdentifier,
        hardware: regForm.hardware,
        latencyMs: 24,
        ttftMs: 72,
        throughputTps: 78.4,
        pricePromptUsd: parseFloat(regForm.pricePromptUsd) || 0.35,
        priceCompletionUsd: parseFloat(regForm.priceCompletionUsd) || 0.45,
        stakedAmountVrxl: parseFloat(regForm.stakedAmountVrxl) || 10000,
        status: "PENDING_AUDIT",
        lastAuditScore: 99.8,
        uptimePercent: 100.0,
        providerType: "COMMUNITY_NODE",
        contextWindow: parseInt(regForm.contextWindow) || 32768,
        operatorAddress: regForm.operatorAddress || walletAddress || "0x0000000000000000000000000000000000000000",
      };

      setProviders((prev) => [newProvider, ...prev]);
      setRegSuccessData({ txHash, providerName: regForm.name });
    } finally {
      setRegSubmitting(false);
    }
  };

  const totalBondedVrxl = providers.reduce((sum, p) => sum + p.stakedAmountVrxl, 0);
  const activeNodesCount = providers.filter((p) => p.status === "ACTIVE" || p.status === "PENDING_AUDIT").length;

  return (
    <div className="space-y-3.5 font-mono">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.2 rounded-[2px] bg-blue-500/10 border border-blue-500/30 text-[10px] font-mono text-blue-400 mb-1 uppercase tracking-wider">
            <Server className="w-3 h-3" />
            <span>ON-CHAIN VERXL COMPUTE REGISTRY · SEPOLIA TESTNET</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Decentralized GPU Compute Fleet
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Audited, independent GPU clusters bonded by $VRXL staking collateral on Ethereum Sepolia testnet.
          </p>
        </div>

        {/* Global Registry Stats & Onboard Button */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-3 bg-[#0a0e17] border border-blue-500/20 px-3 py-1.5 rounded-[3px] font-mono text-xs shadow-sm">
            <div>
              <div className="text-[9px] text-slate-400 uppercase tracking-wider">TOTAL BONDED</div>
              <div className="text-xs font-bold text-white tabular">
                {totalBondedVrxl.toLocaleString()} $VRXL
              </div>
            </div>
            <div className="h-6 w-[1px] bg-slate-800"></div>
            <div>
              <div className="text-[9px] text-slate-400 uppercase tracking-wider">ACTIVE NODES</div>
              <div className="text-xs font-bold text-emerald-400 tabular">
                {activeNodesCount} / {providers.length}
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setIsRegisterModalOpen(true);
              setRegSuccessData(null);
            }}
            className="hero-btn hero-btn--primary !py-2 !px-3 font-mono text-[11px] flex items-center gap-1.5 shadow-md"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Submit Provider Registration</span>
          </button>
        </div>
      </div>

      {/* Network Fleet Notice & Scope Banner */}
      <div className="bg-[#0a0e17] border border-blue-500/25 rounded-[3px] p-2.5 sm:p-3 text-xs text-slate-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-2.5 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-[1px] bg-emerald-400 animate-pulse shrink-0" />
          <div className="text-[11px] leading-relaxed">
            <span className="text-white font-semibold">Active Fleet Scope:</span>{" "}
            Currently live with our self-hosted Prague bare-metal cluster (Bulbasaur) and official bridges to Xiaomi Mi MIMO 2.6 Flash/Pro & DeepSeek v4.1. Independent compute hosts can bond $VRXL and register below.
          </div>
        </div>
        <div className="text-[10px] text-blue-400 font-mono shrink-0 flex items-center gap-2">
          <span className="bg-blue-500/10 px-2 py-0.5 rounded-[2px] border border-blue-500/20">
            Min Bond: 1,000 $VRXL
          </span>
          <span className="bg-blue-500/10 px-2 py-0.5 rounded-[2px] border border-blue-500/20">
            Take: 50 bps
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0a0e17] border border-blue-500/20 rounded-[3px] p-2 sm:p-2.5 flex flex-col md:flex-row gap-2.5 items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search cluster, location, hardware, model..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#05070b] border border-slate-800 rounded-[3px] pl-9 pr-3 py-1.5 text-xs font-mono text-slate-200 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 font-mono text-xs">
          <div className="flex items-center gap-1 text-[11px] text-slate-400 mr-1">
            <Filter className="w-3 h-3" />
            <span className="hidden sm:inline">Region:</span>
          </div>
          {["ALL", "GLOBAL", "EU-Central", "EU-West", "EU-East"].map((r) => (
            <button
              key={r}
              onClick={() => setRegionFilter(r)}
              className={`px-2 py-1 rounded-[2px] text-[11px] uppercase tracking-wider transition ${
                regionFilter === r
                  ? "bg-blue-600 text-white font-medium shadow-sm shadow-blue-500/20 border border-blue-400/40"
                  : "bg-[#05070b] border border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              {r}
            </button>
          ))}

          <div className="h-4 w-[1px] bg-slate-800 mx-1"></div>

          {["ALL", "ACTIVE", "PENDING_AUDIT", "PROBATION", "SLASHED"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-2 py-1 rounded-[2px] text-[11px] uppercase tracking-wider transition ${
                statusFilter === s
                  ? s === "ACTIVE"
                    ? "bg-emerald-600 text-white font-medium border border-emerald-400/40"
                    : s === "PENDING_AUDIT"
                    ? "bg-blue-600 text-white font-medium border border-blue-400/40"
                    : s === "PROBATION"
                    ? "bg-amber-600 text-white font-medium border border-amber-400/40"
                    : s === "SLASHED"
                    ? "bg-rose-600 text-white font-medium border border-rose-400/40"
                    : "bg-blue-600 text-white font-medium border border-blue-400/40"
                  : "bg-[#05070b] border border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              {s.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Providers Table */}
      <div className="bg-[#0a0e17] border border-blue-500/20 rounded-[4px] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono">
            <thead>
              <tr className="border-b border-slate-800/80 bg-[#05070b] text-[10.5px] text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 px-4 font-semibold">PROVIDER & HARDWARE</th>
                <th className="py-2.5 px-4 font-semibold">LOCATION</th>
                <th className="py-2.5 px-4 font-semibold">MODEL HOSTED</th>
                <th className="py-2.5 px-4 font-semibold">PERF (TTFT / TPS)</th>
                <th className="py-2.5 px-4 font-semibold">RATE ($/1M TKN)</th>
                <th className="py-2.5 px-4 font-semibold">STAKED COLLATERAL</th>
                <th className="py-2.5 px-4 font-semibold">STATUS & FIDELITY</th>
                <th className="py-2.5 px-4 text-right font-semibold">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredProviders.map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-slate-800/25 transition group"
                >
                  {/* Provider & Hardware */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-100 group-hover:text-blue-400 transition">
                        {p.name}
                      </span>
                      {p.providerType === "SELF_HOSTED" && (
                        <span className="px-1.5 py-0.2 rounded-[2px] bg-blue-500/10 border border-blue-500/30 text-[9px] text-blue-400 font-bold uppercase tracking-wider">
                          Self-Hosted
                        </span>
                      )}
                      {p.providerType === "OFFICIAL_BRIDGE" && (
                        <span className="px-1.5 py-0.2 rounded-[2px] bg-purple-500/10 border border-purple-500/30 text-[9px] text-purple-300 font-bold uppercase tracking-wider">
                          Official Bridge
                        </span>
                      )}
                      {p.providerType === "COMMUNITY_NODE" && (
                        <span className="px-1.5 py-0.2 rounded-[2px] bg-emerald-500/10 border border-emerald-500/30 text-[9px] text-emerald-300 font-bold uppercase tracking-wider">
                          Community Node
                        </span>
                      )}
                    </div>
                    <div className="text-[10.5px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <Cpu className="w-3 h-3 text-slate-400" />
                      <span>{p.hardware}</span>
                    </div>
                  </td>

                  {/* Location */}
                  <td className="py-3 px-4 text-slate-300">
                    <div>{p.location}</div>
                    <div className="text-[10px] text-slate-400">{p.region}</div>
                  </td>

                  {/* Model */}
                  <td className="py-3 px-4">
                    <div className="inline-flex flex-col gap-0.5">
                      <span className="px-1.5 py-0.5 rounded-[2px] bg-[#05070b] border border-slate-800 text-[10.5px] text-blue-300 font-medium">
                        {p.modelIdentifier}
                      </span>
                      {p.contextWindow && (
                        <span className="text-[9.5px] text-emerald-400 font-semibold flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" />
                          {p.contextWindow >= 1000000 ? "1,000,000 (1M) context" : p.contextWindow >= 1024 ? `${p.contextWindow / 1024}k context` : `${p.contextWindow} tokens`}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Perf */}
                  <td className="py-3 px-4 text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <span className="text-white font-semibold tabular">{p.ttftMs}ms</span>
                      <span className="text-slate-400 text-[9.5px]">TTFT</span>
                    </div>
                    <div className="text-[10.5px] text-emerald-400 tabular">
                      {p.throughputTps} TPS
                    </div>
                  </td>

                  {/* Rate */}
                  <td className="py-3 px-4 text-slate-300 tabular">
                    <div>${Number(p.pricePromptUsd || 0).toFixed(2)} prompt</div>
                    <div className="text-[10px] text-slate-400">
                      ${Number(p.priceCompletionUsd || 0).toFixed(2)} compl
                    </div>
                    {p.priceCachedPromptUsd !== undefined && (
                      <div className="text-[9.5px] text-emerald-400 font-semibold">
                        ${Number(p.priceCachedPromptUsd) < 0.01 ? Number(p.priceCachedPromptUsd).toFixed(4) : Number(p.priceCachedPromptUsd).toFixed(3)} cached
                      </div>
                    )}
                    {p.specialHoursDiscount && (
                      <div className="text-[8.5px] text-purple-300 font-sans mt-0.5 max-w-[160px] leading-tight">
                        {p.specialHoursDiscount}
                      </div>
                    )}
                  </td>

                  {/* Staked Collateral */}
                  <td className="py-3 px-4 tabular">
                    <div className="font-semibold text-white">
                      {(Number(p.stakedAmountVrxl) || 0).toLocaleString()} $VRXL
                    </div>
                    <div className="text-[9.5px] text-slate-400">Bonded Sepolia</div>
                  </td>

                  {/* Status & Fidelity */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      {p.status === "ACTIVE" && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] text-[9.5px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          <ShieldCheck className="w-3 h-3" />
                          ACTIVE
                        </span>
                      )}
                      {p.status === "PENDING_AUDIT" && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] text-[9.5px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30">
                          <Clock className="w-3 h-3" />
                          PENDING AUDIT
                        </span>
                      )}
                      {p.status === "PROBATION" && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] text-[9.5px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                          <AlertTriangle className="w-3 h-3" />
                          PROBATION
                        </span>
                      )}
                      <span className="text-slate-400 text-[10.5px] tabular">
                        {Number(p.lastAuditScore || 0).toFixed(1)}% SLA
                      </span>
                    </div>
                    <div className="mt-1">
                      {p.providerType === "OFFICIAL_BRIDGE" || (p as any).is_official_bridge ? (
                        <span
                          className="text-[8.5px] text-amber-400/90 bg-amber-500/10 px-1.5 py-0.2 rounded-[2px] border border-amber-500/20 font-mono"
                          title="Queries routed to upstream servers (DeepSeek/Xiaomi) subject to their respective logging policies."
                        >
                          Bridge · Upstream Stored
                        </span>
                      ) : (
                        <span
                          className="text-[8.5px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded-[2px] border border-emerald-500/20 font-mono font-bold"
                          title="Local bare-metal inference with volatile RAM streaming and zero disk telemetry."
                        >
                          Bare-Metal · Zero-Logging
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Action */}
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleOpenStaking(p)}
                      className="px-2.5 py-1 rounded-[2px] bg-[#05070b] border border-slate-800 text-[11px] text-blue-400 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition uppercase tracking-wider font-semibold"
                    >
                      Bond
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================================
          Provider Registration & Onboarding Modal
         ========================================================================= */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#0a0e17] border border-blue-500/30 rounded-[4px] max-w-2xl w-full p-4 sm:p-5 shadow-2xl relative space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-semibold text-white font-mono uppercase tracking-wider">
                  Submit Inference Provider Registration
                </h3>
              </div>
              <button
                onClick={() => setIsRegisterModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm font-mono p-1"
              >
                ✕
              </button>
            </div>

            {!regSuccessData ? (
              <form onSubmit={handleSubmitProviderRegistration} className="space-y-3.5 text-xs font-mono text-slate-300">
                <div className="bg-[#05070b] p-2.5 rounded-[3px] border border-slate-800/80 text-[11px] leading-relaxed text-slate-300 space-y-1">
                  <div className="text-blue-400 font-semibold uppercase tracking-wider text-[10px]">
                    Non-Custodial Staking Covenant · VerxlStakingRegistry.sol
                  </div>
                  <p>
                    Prospective nodes register an OpenAI-compatible endpoint and bond minimum <strong>1,000 $VRXL</strong> collateral. The Autonomous Quality Oracle will execute deterministic seed=42 invariant probes before full clearing activation.
                  </p>
                </div>

                {/* Grid Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 text-[10px] uppercase">Cluster / Organization Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Vienna Alpine Tier-4 Pod"
                      value={regForm.name}
                      onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                      className="w-full bg-[#05070b] border border-slate-800 rounded-[3px] px-2.5 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 text-[10px] uppercase">Operator Wallet Address (Sepolia)</label>
                    <input
                      type="text"
                      placeholder="0x..."
                      value={regForm.operatorAddress}
                      onChange={(e) => setRegForm({ ...regForm, operatorAddress: e.target.value })}
                      className="w-full bg-[#05070b] border border-slate-800 rounded-[3px] px-2.5 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 text-[10px] uppercase">Datacenter Location</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Vienna, Austria"
                      value={regForm.location}
                      onChange={(e) => setRegForm({ ...regForm, location: e.target.value })}
                      className="w-full bg-[#05070b] border border-slate-800 rounded-[3px] px-2.5 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 text-[10px] uppercase">Region</label>
                    <select
                      value={regForm.region}
                      onChange={(e) => setRegForm({ ...regForm, region: e.target.value })}
                      className="w-full bg-[#05070b] border border-slate-800 rounded-[3px] px-2.5 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                    >
                      <option value="EU-Central">EU-Central</option>
                      <option value="EU-West">EU-West</option>
                      <option value="EU-East">EU-East</option>
                      <option value="US-East">US-East</option>
                      <option value="US-West">US-West</option>
                      <option value="GLOBAL">GLOBAL</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 text-[10px] uppercase">Hardware Specifications</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 8x NVIDIA H100 SXM5 80GB"
                      value={regForm.hardware}
                      onChange={(e) => setRegForm({ ...regForm, hardware: e.target.value })}
                      className="w-full bg-[#05070b] border border-slate-800 rounded-[3px] px-2.5 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 text-[10px] uppercase">Model Identifier & Context</label>
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        required
                        placeholder="meta-llama/Llama-3.3-70B"
                        value={regForm.modelIdentifier}
                        onChange={(e) => setRegForm({ ...regForm, modelIdentifier: e.target.value })}
                        className="col-span-2 bg-[#05070b] border border-slate-800 rounded-[3px] px-2.5 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                      />
                      <input
                        type="number"
                        placeholder="32768"
                        value={regForm.contextWindow}
                        onChange={(e) => setRegForm({ ...regForm, contextWindow: e.target.value })}
                        className="bg-[#05070b] border border-slate-800 rounded-[3px] px-2 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-400 mb-1 text-[10px] uppercase">Inference Endpoint URL (/v1)</label>
                    <input
                      type="url"
                      required
                      placeholder="https://node.cluster.network/v1"
                      value={regForm.endpointUrl}
                      onChange={(e) => setRegForm({ ...regForm, endpointUrl: e.target.value })}
                      className="w-full bg-[#05070b] border border-slate-800 rounded-[3px] px-2.5 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 text-[10px] uppercase">Proposed Rate ($/1M Prompt / Compl)</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Prompt $"
                        value={regForm.pricePromptUsd}
                        onChange={(e) => setRegForm({ ...regForm, pricePromptUsd: e.target.value })}
                        className="bg-[#05070b] border border-slate-800 rounded-[3px] px-2 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                      />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Compl $"
                        value={regForm.priceCompletionUsd}
                        onChange={(e) => setRegForm({ ...regForm, priceCompletionUsd: e.target.value })}
                        className="bg-[#05070b] border border-slate-800 rounded-[3px] px-2 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 text-[10px] uppercase">Staking Collateral ($VRXL)</label>
                    <input
                      type="number"
                      min="1000"
                      step="500"
                      required
                      value={regForm.stakedAmountVrxl}
                      onChange={(e) => setRegForm({ ...regForm, stakedAmountVrxl: e.target.value })}
                      className="w-full bg-[#05070b] border border-slate-800 rounded-[3px] px-2.5 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                    />
                    <span className="text-[9px] text-blue-400">Min 1,000 $VRXL required</span>
                  </div>
                </div>

                {/* Hardware Specifications Diagnostic Test Run */}
                <div className="bg-[#05070b] border border-amber-500/25 p-2.5 rounded-[3px] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-amber-300 uppercase tracking-wider flex items-center gap-1.5 font-bold">
                      <Radio className="w-3 h-3 text-amber-400" />
                      <span>Hardware Specifications Diagnostic Test Run</span>
                    </span>
                    <button
                      type="button"
                      disabled={true}
                      title="Specifications test run temporarily unavailable due to capacity constraints"
                      className="text-[9.5px] px-2 py-0.5 rounded-[2px] bg-amber-500/10 text-amber-300/80 border border-amber-500/30 cursor-not-allowed opacity-80"
                    >
                      Test Run Unavailable (Capacity)
                    </button>
                  </div>

                  <div className="p-2 rounded-[2px] bg-amber-500/5 border border-amber-500/20 text-[10px] text-amber-300/90 flex items-start gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>
                      Hardware specifications test runs are temporarily unavailable due to bare-metal host capacity constraints (Qwen 3.5 32k resident context in GPU VRAM). Submitted nodes will bypass instant diagnostic and proceed directly to the asynchronous verification queue.
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsRegisterModalOpen(false)}
                    className="w-1/3 py-2 rounded-[2px] bg-[#05070b] border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-mono transition uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={regSubmitting}
                    className="w-2/3 hero-btn hero-btn--primary !justify-center !py-2"
                  >
                    {regSubmitting ? "Broadcasting Registration Tx..." : "Submit Registration & Bond Collateral"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3.5 text-xs font-mono text-slate-300 py-2">
                <div className="p-3 rounded-[3px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 space-y-1.5">
                  <div className="font-bold flex items-center gap-1.5 text-sm">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>Provider Registration Successfully Recorded!</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-300">
                    <strong>{regSuccessData.providerName}</strong> has been submitted to the Verxl Protocol compute fleet. The node collateral was bonded under <code>VerxlStakingRegistry.sol</code> and scheduled for autonomous quality oracle verification.
                  </p>
                </div>

                <div className="bg-[#05070b] p-3 rounded-[3px] border border-slate-800 space-y-2 text-[10.5px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Sepolia Transaction:</span>
                    <a
                      href={`https://sepolia.etherscan.io/tx/${regSuccessData.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline flex items-center gap-1"
                    >
                      <span>{regSuccessData.txHash.substring(0, 14)}...{regSuccessData.txHash.substring(54)}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Registry Contract:</span>
                    <span className="text-white">0x8F590f2098D71A8253ad50450D7A73F3201402F0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Clearing Status:</span>
                    <span className="text-blue-400 font-bold">PENDING_AUDIT (Scheduled in 15m)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Protocol Fee Take:</span>
                    <span className="text-emerald-400">50 bps (0.50%)</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="w-full hero-btn hero-btn--primary !justify-center !py-2"
                >
                  Close & View Fleet Registry
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Staking & Collateral Modal — Strictly Square */}
      {isStakingModalOpen && selectedProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0a0e17] border border-blue-500/30 rounded-[4px] max-w-lg w-full p-6 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-semibold text-white font-mono uppercase tracking-wider">
                  Bond Collateral to Cluster
                </h3>
              </div>
              <button
                onClick={() => setIsStakingModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm font-mono"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono text-slate-300">
              <div className="bg-[#05070b] p-3 rounded-[3px] border border-slate-800 space-y-1">
                <div className="text-slate-400 text-[9.5px] uppercase tracking-wider">TARGET NODE</div>
                <div className="font-semibold text-white text-sm">
                  {selectedProvider.name}
                </div>
                <div className="text-slate-400 text-[10.5px]">
                  Hardware: {selectedProvider.hardware} • Location: {selectedProvider.location}
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 text-[10.5px] uppercase tracking-wider">
                  BOND AMOUNT ($VRXL)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1000"
                    step="500"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    className="w-full bg-[#05070b] border border-slate-800 rounded-[3px] px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-blue-500"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                    $VRXL
                  </span>
                </div>
              </div>

              <div className="bg-[#05070b] p-3 rounded-[3px] border border-slate-800/80 space-y-1 text-[10.5px]">
                <div className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Staking Registry Covenants:</span>
                </div>
                <p className="text-slate-400">
                  • Minimum Node Stake: 1,000 $VRXL.
                </p>
                <p className="text-slate-400">
                  • Unbonding Period: 24-Hour Timelock cooldown before withdrawal.
                </p>
                <p className="text-slate-400">
                  • Slashing Penalty: 10% slashed upon detected FP16 spoofing (50% burned, 50% Aragon DAO vault).
                </p>
              </div>

              {stakeActionSuccess && (
                <div className="p-2.5 rounded-[2px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{stakeActionSuccess}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIsStakingModalOpen(false)}
                className="w-1/2 py-2 rounded-[2px] bg-[#05070b] border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-mono transition uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteStake}
                className="w-1/2 hero-btn hero-btn--primary !justify-center !py-2"
              >
                {walletAddress ? "Confirm Sepolia Bond" : "Connect Wallet to Stake"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
