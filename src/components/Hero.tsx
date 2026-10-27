import React from "react";
import {
  ArrowRight,
  Shield,
  Cpu,
  Layers,
  Terminal,
  ChevronRight,
} from "lucide-react";

interface HeroProps {
  onNavigate: (tab: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-12">
      {/* Top Banner / Announcement */}
      <div className="flex justify-center">
        <a
          href="https://app.aragon.org/dao/ethereum-sepolia/0xf0e51fB0FFBD8ef36281b6f643E0f7953BD5111a/proposals/VIP-1"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-mono text-blue-400 hover:bg-blue-500/20 transition-all shadow-sm shadow-blue-500/10"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>ARAGON SEPOLIA DAO LIVE: VIP-1 PROPOSAL ACTIVE</span>
          <ChevronRight className="w-3.5 h-3.5 text-blue-400" />
        </a>
      </div>

      {/* Main Pitch */}
      <div className="text-center max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400">
          <Shield className="w-3.5 h-3.5 text-blue-400" />
          <span>DECENTRALIZED AI INFERENCE CLEARING PROTOCOL</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Non-Custodial AI Inference{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-400">
            at 50 bps Protocol Fee
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal max-w-3xl mx-auto">
          Verxl eliminates centralized cloud rent extraction. While centralized aggregators charge{" "}
          <span className="font-semibold text-rose-400 font-mono">840–1,040 bps</span> markups,
          Verxl operates as a zero-custody, deterministic clearinghouse routing inference directly to
          independent GPU clusters with on-chain slashing.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => onNavigate("playground")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-all shadow-lg shadow-blue-600/25 border border-blue-500/40"
          >
            <Terminal className="w-4 h-4" />
            <span>Launch API Playground</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>

          <button
            onClick={() => onNavigate("registry")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800/80 text-slate-200 font-medium text-sm transition-all border border-slate-800"
          >
            <Cpu className="w-4 h-4 text-blue-400" />
            <span>View Compute Registry</span>
          </button>

          <button
            onClick={() => onNavigate("governance")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800/80 text-slate-200 font-medium text-sm transition-all border border-slate-800"
          >
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Read Whitepaper</span>
          </button>
        </div>
      </div>

      {/* Institutional Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
        <div className="bg-[#0c1322] border border-slate-800/90 rounded-xl p-4 sm:p-5 relative overflow-hidden group hover:border-blue-500/40 transition">
          <div className="text-[11px] font-mono text-slate-400 mb-1 flex items-center justify-between">
            <span>TAKE-RATE COMPRESSION</span>
            <span className="text-emerald-400 font-semibold font-mono">-94.1%</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white">50 bps</div>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">
            vs 840–1040 bps centralized SaaS
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-emerald-500 opacity-60"></div>
        </div>

        <div className="bg-[#0c1322] border border-slate-800/90 rounded-xl p-4 sm:p-5 relative overflow-hidden group hover:border-blue-500/40 transition">
          <div className="text-[11px] font-mono text-slate-400 mb-1 flex items-center justify-between">
            <span>TIME TO FIRST TOKEN</span>
            <span className="text-blue-400 font-semibold font-mono">P50</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white">48 ms</div>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">
            Direct Cloudflare edge stream
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-sky-400 opacity-60"></div>
        </div>

        <div className="bg-[#0c1322] border border-slate-800/90 rounded-xl p-4 sm:p-5 relative overflow-hidden group hover:border-blue-500/40 transition">
          <div className="text-[11px] font-mono text-slate-400 mb-1 flex items-center justify-between">
            <span>STAKED COLLATERAL</span>
            <span className="text-amber-400 font-semibold font-mono">9 NODES</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white">142,000</div>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">
            $VRXL locked in smart contract
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500 to-yellow-400 opacity-60"></div>
        </div>

        <div className="bg-[#0c1322] border border-slate-800/90 rounded-xl p-4 sm:p-5 relative overflow-hidden group hover:border-blue-500/40 transition">
          <div className="text-[11px] font-mono text-slate-400 mb-1 flex items-center justify-between">
            <span>ON-CHAIN GOVERNANCE</span>
            <span className="text-emerald-400 font-semibold font-mono">SEPOLIA</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-400 flex items-center gap-1.5">
            <span>100%</span>
            <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
              OSx
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">
            Non-custodial Aragon treasury
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-400 opacity-60"></div>
        </div>
      </div>

      {/* Protocol Architecture Flow Diagram */}
      <div className="bg-[#0c1322]/80 border border-slate-800 rounded-2xl p-6 sm:p-8 max-w-5xl mx-auto shadow-2xl relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-6 border-b border-slate-800/80 mb-6">
          <div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" />
              <span>Protocol Architecture & Non-Custodial Clearing Cycle</span>
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Standard OpenAI SDK compatibility • Seed-locked canary audit • Automated slashing
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
              Vite + React
            </span>
            <span>→</span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
              Cloudflare Edge
            </span>
            <span>→</span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-blue-400">
              Aragon OSx
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          {/* Step 1 */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-mono text-xs font-bold">
                01
              </div>
              <h4 className="text-sm font-semibold text-white">Client Inference Request</h4>
              <p className="text-xs text-slate-400">
                Developers send standard requests via <code className="text-blue-300 font-mono">/v1/chat/completions</code>.
                OpenAI SDK compatible.
              </p>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-800/60 text-[10px] font-mono text-slate-400">
              Fee: 0.5% (50 bps)
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-mono text-xs font-bold">
                02
              </div>
              <h4 className="text-sm font-semibold text-white">Cloudflare Edge Router</h4>
              <p className="text-xs text-slate-400">
                Stateless Edge proxy checks compute registry, selects optimal provider by TTFT, cost, and reliability score.
              </p>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-800/60 text-[10px] font-mono text-slate-400">
              Sub-5ms edge dispatch
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-mono text-xs font-bold">
                03
              </div>
              <h4 className="text-sm font-semibold text-white">Independent GPU Node</h4>
              <p className="text-xs text-slate-400">
                Staked clusters (H100, A100, RTX 4090) stream FP16 weights directly to consumer without intermediate buffering.
              </p>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-800/60 text-[10px] font-mono text-slate-400">
              Collateral: ≥10,000 $VRXL
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-mono text-xs font-bold">
                04
              </div>
              <h4 className="text-sm font-semibold text-white">Quality Oracle & DAO</h4>
              <p className="text-xs text-slate-400">
                Deterministic canary probes detect quantization fraud. Malicious nodes suffer 10% collateral slash on Sepolia.
              </p>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-800/60 text-[10px] font-mono text-emerald-400 font-semibold">
              50% Burn / 50% Aragon Vault
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
