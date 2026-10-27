import React from "react";
import {
  Compass,
  CheckCircle2,
  Cpu,
  Layers,
  ArrowRight,
  ShieldCheck,
  Terminal,
  Activity,
  Zap,
  Globe,
} from "lucide-react";

interface VisionProps {
  onNavigate: (tab: string) => void;
}

export const Vision: React.FC<VisionProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-6 font-mono text-slate-200">
      {/* Top Breadcrumb & Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-500/15 pb-2.5">
        <div className="flex items-center gap-2 text-xs">
          <Compass className="w-3.5 h-3.5 text-blue-400" />
          <span className="font-semibold text-white uppercase tracking-wider">
            Architecture Vision & Protocol Roadmap
          </span>
          <span className="text-slate-400">·</span>
          <span className="text-blue-400 text-[11px]">2026–2028</span>
        </div>
        <div className="text-[10px] text-slate-400 flex items-center gap-2">
          <span>VŠE Praha · 2SE307 Bitcoin & Blockchain</span>
          <span className="text-slate-700">|</span>
          <span className="text-emerald-400 font-semibold">M. Bok (SB 235)</span>
        </div>
      </div>

      {/* Hero Section: Core Thesis & Founder Portrait */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center bg-[#0a0e17] border border-blue-500/20 rounded-[4px] p-5 sm:p-7 shadow-xl relative overflow-hidden">
        {/* Left Column: Vision Statement */}
        <div className="lg:col-span-7 space-y-3.5">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[2px] bg-blue-500/10 border border-blue-500/30 text-[10px] text-blue-400 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 status-dot bg-blue-400 animate-pulse" />
            <span>Non-Custodial Machine Intelligence Clearing</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Direct Settlement for the <span className="accent-blue">Machine Economy</span>.
          </h1>

          <p className="text-xs sm:text-[13px] text-slate-300 leading-relaxed font-sans">
            Centralized AI aggregators operate like traditional retail broker-dealers: inserting their balance sheets into bilateral computation, locking customer working capital into unsegregated float, and collecting an extractive 840–1,040 bps markup on raw silicon.
          </p>

          <p className="text-xs sm:text-[13px] text-slate-300 leading-relaxed font-sans">
            Verxl replaces the intermediary with an automated 50 bps non-custodial clearing switch and cryptographic performance bonding on Ethereum Sepolia. By establishing verifiable economic collateral and deterministic seed=42 invariant verification, independent GPU clusters and enterprise consumers transact directly at near-zero marginal friction.
          </p>

          {/* Philosophy Chips */}
          <div className="flex flex-wrap gap-1.5 pt-1 text-[10.5px]">
            <span className="px-2 py-0.5 rounded-[2px] bg-[#05070b] border border-slate-800 text-slate-300">
              Agency Over Principal
            </span>
            <span className="px-2 py-0.5 rounded-[2px] bg-[#05070b] border border-slate-800 text-slate-300">
              50 bps Hardcoded Fee
            </span>
            <span className="px-2 py-0.5 rounded-[2px] bg-[#05070b] border border-slate-800 text-slate-300">
              Deterministic Slashing
            </span>
            <span className="px-2 py-0.5 rounded-[2px] bg-[#05070b] border border-slate-800 text-emerald-400">
              Zero Custodial Float
            </span>
          </div>
        </div>

        {/* Right Column: Founder Portrait Frame */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="w-full max-w-sm bg-[#05070b] border border-blue-500/30 rounded-[3px] p-2.5 shadow-2xl space-y-2">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2px] border border-slate-800">
              <img
                src="/simon-pudong.jpg"
                alt="Šimon Havlík in Pudong, Shanghai"
                className="w-full h-full object-cover grayscale contrast-125 hover:grayscale-0 transition duration-500"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#05070b] via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-2.5 left-2.5 right-2.5 space-y-0.5">
                <div className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center justify-between">
                  <span>Šimon Havlík</span>
                  <span className="text-[9px] text-blue-400">Founder & Architect</span>
                </div>
                <div className="text-[9.5px] text-slate-400">
                  Pudong, Shanghai · Asia infrastructure thesis
                </div>
              </div>
            </div>

            <div className="px-1 text-[10px] text-slate-400 flex items-center justify-between pt-0.5">
              <span>VŠE Praha · 2SE307 Seminar</span>
              <span className="text-emerald-400 font-semibold">SB 235 · M. Bok</span>
            </div>
          </div>
        </div>
      </div>

      {/* The Fundamental Premise Quote Banner */}
      <div className="bg-[#05070b] border-l-2 border-blue-500 p-4 rounded-[2px] text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
        <span className="text-blue-400 font-bold font-mono">Core Protocol Premise:</span>{" "}
        Every centralized model aggregator is an unnecessary counterparty credit risk and an institutional margin tax. Verxl strips out the middleman, binds independent compute hosts with on-chain collateral, and settles inference atomically at cost.
      </div>

      {/* Three Horizons Architecture Roadmap */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-400" />
            <span>Three-Horizon Architectural Roadmap</span>
          </h2>
          <span className="text-[10px] text-slate-400">2026–2028 PHASES</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* Horizon 1: Shipped & Operational */}
          <div className="bg-[#0a0e17] border border-blue-500/30 rounded-[3px] p-3.5 space-y-2.5 relative shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Horizon 1 · Live Pilot</span>
              </span>
              <span className="px-1.5 py-0.2 rounded-[2px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold">
                OPERATIONAL
              </span>
            </div>

            <h3 className="text-xs font-bold text-white">Non-Custodial Clearing Switch</h3>
            <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
              Stateless proxy routing at 50 bps protocol take, live deterministic seed=42 invariant probing, and Aragon OSx DAO governance on Ethereum Sepolia.
            </p>

            <ul className="text-[10px] text-slate-400 space-y-1 pt-1 border-t border-slate-800/60">
              <li className="flex items-start gap-1.5">
                <span className="text-blue-400 font-bold">•</span>
                <span>Dual-redundant tunnel routing (Charizard port 11645 + Cloudflare edge)</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-blue-400 font-bold">•</span>
                <span>Bare-metal Prague host (Bulbasaur Qwen 3.5 4B Uncensored 8k/32k)</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-blue-400 font-bold">•</span>
                <span>Official bridges for Xiaomi Mi MIMO 2.6 Flash/Pro & DeepSeek v4.1</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-blue-400 font-bold">•</span>
                <span>Automated 10% collateral slashing via VerxlStakingRegistry contract</span>
              </li>
            </ul>
          </div>

          {/* Horizon 2: Scaled Clearing & Attestation */}
          <div className="bg-[#0a0e17] border border-blue-500/20 rounded-[3px] p-3.5 space-y-2.5 relative shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-blue-400" />
                <span>Horizon 2 · Scaled Attestation</span>
              </span>
              <span className="px-1.5 py-0.2 rounded-[2px] bg-blue-500/10 text-blue-400 border border-blue-500/30 text-[9px] font-bold">
                Q1–Q3 2027
              </span>
            </div>

            <h3 className="text-xs font-bold text-white">State Channels & Cryptographic Proofs</h3>
            <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
              Dynamic bilateral micro-streaming escrow allowing continuous token-by-token settlement without per-chunk gas friction, coupled with lightweight execution proofs.
            </p>

            <ul className="text-[10px] text-slate-400 space-y-1 pt-1 border-t border-slate-800/60">
              <li className="flex items-start gap-1.5">
                <span className="text-blue-400 font-bold">•</span>
                <span>Zero-knowledge output attestation (zk-STARK lightweight verifiable computation)</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-blue-400 font-bold">•</span>
                <span>Fractional community staking pools backing verified independent hosts</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-blue-400 font-bold">•</span>
                <span>Continuous hardware performance indexing (TTFT, memory bandwidth, thermal drift)</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-blue-400 font-bold">•</span>
                <span>Automated provider node registration CLI with one-click Docker daemon</span>
              </li>
            </ul>
          </div>

          {/* Horizon 3: The Autonomous Machine Economy */}
          <div className="bg-[#0a0e17] border border-purple-500/20 rounded-[3px] p-3.5 space-y-2.5 relative shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-purple-400" />
                <span>Horizon 3 · Endgame</span>
              </span>
              <span className="px-1.5 py-0.2 rounded-[2px] bg-purple-500/10 text-purple-400 border border-purple-500/30 text-[9px] font-bold">
                2027+
              </span>
            </div>

            <h3 className="text-xs font-bold text-white">Sovereign Machine-to-Machine Grid</h3>
            <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
              Autonomous AI agent swarms clearing inference transactions peer-to-peer using Verxl smart contracts without human intervention, credit cards, or centralized banking rails.
            </p>

            <ul className="text-[10px] text-slate-400 space-y-1 pt-1 border-t border-slate-800/60">
              <li className="flex items-start gap-1.5">
                <span className="text-purple-400 font-bold">•</span>
                <span>P2P libp2p mesh routing replacing edge reverse proxies</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-purple-400 font-bold">•</span>
                <span>Secondary compute mobilization (enterprise co-los & amortized mining farms)</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-purple-400 font-bold">•</span>
                <span>Cross-chain settlement integration via LayerZero / Chainlink CCIP</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-purple-400 font-bold">•</span>
                <span>Complete immutable governance handoff to on-chain $VRXL holders</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Protocol Design Covenants & Structural Constraints */}
      <div className="bg-[#0a0e17] border border-blue-500/20 rounded-[3px] p-4 space-y-3 shadow-sm">
        <h2 className="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-1.5">
          Design Constraints That Anchor the Architecture
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="bg-[#05070b] p-3 rounded-[2px] border border-slate-800 space-y-1">
            <div className="font-bold text-white flex items-center gap-1.5 text-[11px]">
              <Cpu className="w-3.5 h-3.5 text-blue-400" />
              <span>Agency, Never Principal</span>
            </div>
            <p className="text-[10.5px] text-slate-400 leading-relaxed font-sans">
              Verxl never buys wholesale compute to resell retail. It takes zero inventory risk and assumes zero operational liability.
            </p>
          </div>

          <div className="bg-[#05070b] p-3 rounded-[2px] border border-slate-800 space-y-1">
            <div className="font-bold text-white flex items-center gap-1.5 text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Zero Custodial Float</span>
            </div>
            <p className="text-[10.5px] text-slate-400 leading-relaxed font-sans">
              Buyer funds never sit in unsegregated corporate accounts. Capital moves atomically on-chain only when tokens are delivered.
            </p>
          </div>

          <div className="bg-[#05070b] p-3 rounded-[2px] border border-slate-800 space-y-1">
            <div className="font-bold text-white flex items-center gap-1.5 text-[11px]">
              <Activity className="w-3.5 h-3.5 text-rose-400" />
              <span>Nash Slashing Rules</span>
            </div>
            <p className="text-[10.5px] text-slate-400 leading-relaxed font-sans">
              Quality is governed by economic payoffs. A 10% collateral slash ensures that serving adulterated 4-bit weights is mathematically irrational.
            </p>
          </div>

          <div className="bg-[#05070b] p-3 rounded-[2px] border border-slate-800 space-y-1">
            <div className="font-bold text-white flex items-center gap-1.5 text-[11px]">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Fixed 50 bps Switch</span>
            </div>
            <p className="text-[10.5px] text-slate-400 leading-relaxed font-sans">
              The fee is immutable in the smart contract. Exactly 99.5% passes to the hardware host; 0.5% accumulates in the DAO treasury vault.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation CTA Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0a0e17] border border-blue-500/20 rounded-[3px] p-3 shadow-sm">
        <div className="text-xs text-slate-300">
          <span className="font-semibold text-white">Explore the Operational Implementation:</span>{" "}
          <span className="text-slate-400 text-[11px]">Test our Prague GPU host, view registered providers, or read the whitepaper.</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigate("playground")}
            className="hero-btn hero-btn--ghost !py-1.5 !px-3 !text-[11px]"
          >
            <Terminal className="w-3.5 h-3.5 text-blue-400" />
            <span>Terminal</span>
          </button>
          <button
            onClick={() => onNavigate("registry")}
            className="hero-btn hero-btn--ghost !py-1.5 !px-3 !text-[11px]"
          >
            <span>Registry</span>
          </button>
          <button
            onClick={() => onNavigate("whitepaper")}
            className="hero-btn hero-btn--primary !py-1.5 !px-3 !text-[11px]"
          >
            <span>Whitepaper</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
