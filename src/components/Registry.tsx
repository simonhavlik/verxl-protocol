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
  XCircle,
  Lock,
  CheckCircle2,
  Server,
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

  const totalBondedVrxl = providers.reduce((sum, p) => sum + p.stakedAmountVrxl, 0);
  const activeNodesCount = providers.filter((p) => p.status === "ACTIVE").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-[2px] bg-blue-500/10 border border-blue-500/30 text-[10.5px] font-mono text-blue-400 mb-2 uppercase tracking-wider">
            <Server className="w-3.5 h-3.5" />
            <span>ON-CHAIN VERXL COMPUTE REGISTRY</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Decentralized GPU Compute Fleet
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-mono">
            Audited, independent GPU clusters bonded by $VRXL staking collateral on Ethereum Sepolia.
          </p>
        </div>

        {/* Global Registry Stats */}
        <div className="flex items-center gap-4 bg-[#0a0e17] border border-blue-500/20 p-3 rounded-[3px] font-mono text-xs shadow-sm">
          <div>
            <div className="text-[9.5px] text-slate-400 uppercase tracking-wider">TOTAL BONDED</div>
            <div className="text-sm font-bold text-white tabular">
              {totalBondedVrxl.toLocaleString()} $VRXL
            </div>
          </div>
          <div className="h-7 w-[1px] bg-slate-800"></div>
          <div>
            <div className="text-[9.5px] text-slate-400 uppercase tracking-wider">ACTIVE CLUSTERS</div>
            <div className="text-sm font-bold text-emerald-400 tabular">
              {activeNodesCount} / {providers.length}
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0a0e17] border border-blue-500/20 rounded-[4px] p-3 sm:p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
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
          {["ALL", "EU-Central", "EU-West", "EU-East"].map((r) => (
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

          {["ALL", "ACTIVE", "PROBATION", "SLASHED"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-2 py-1 rounded-[2px] text-[11px] uppercase tracking-wider transition ${
                statusFilter === s
                  ? s === "ACTIVE"
                    ? "bg-emerald-600 text-white font-medium border border-emerald-400/40"
                    : s === "PROBATION"
                    ? "bg-amber-600 text-white font-medium border border-amber-400/40"
                    : s === "SLASHED"
                    ? "bg-rose-600 text-white font-medium border border-rose-400/40"
                    : "bg-blue-600 text-white font-medium border border-blue-400/40"
                  : "bg-[#05070b] border border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              {s}
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
                    <div className="font-semibold text-slate-100 group-hover:text-blue-400 transition">
                      {p.name}
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
                    <span className="px-1.5 py-0.5 rounded-[2px] bg-[#05070b] border border-slate-800 text-[10.5px] text-blue-300">
                      {p.modelIdentifier.split("/")[1] || p.modelIdentifier}
                    </span>
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
                    <div>${p.pricePromptUsd.toFixed(2)} prompt</div>
                    <div className="text-[10px] text-slate-400">
                      ${p.priceCompletionUsd.toFixed(2)} compl
                    </div>
                  </td>

                  {/* Staked Collateral */}
                  <td className="py-3 px-4 tabular">
                    <div className="font-semibold text-white">
                      {p.stakedAmountVrxl.toLocaleString()} $VRXL
                    </div>
                    <div className="text-[9.5px] text-slate-400">Bonded Sepolia</div>
                  </td>

                  {/* Status & Fidelity — Square badges */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      {p.status === "ACTIVE" && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] text-[9.5px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          <ShieldCheck className="w-3 h-3" />
                          ACTIVE
                        </span>
                      )}
                      {p.status === "PROBATION" && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] text-[9.5px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                          <AlertTriangle className="w-3 h-3" />
                          PROBATION
                        </span>
                      )}
                      {p.status === "SLASHED" && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] text-[9.5px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                          <XCircle className="w-3 h-3" />
                          SLASHED
                        </span>
                      )}
                    </div>
                    <div className="text-[9.5px] text-slate-400 mt-0.5 tabular">
                      Fidelity: {p.lastAuditScore}%
                    </div>
                  </td>

                  {/* Action — Strictly Square */}
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
                  • Minimum Node Stake: 10,000 $VRXL.
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
