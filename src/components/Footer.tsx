import React from "react";
import { ExternalLink, ShieldCheck, Github } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="mt-20 border-t border-slate-800/80 bg-[#060a10] py-12 text-slate-400 font-mono text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-800/60">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-white tracking-tight">
                VERXL<span className="text-blue-500">.COM</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20">
                v1.0.0-SEPOLIA
              </span>
            </div>
            <p className="text-slate-400 max-w-md text-[11px]">
              Decentralized, non-custodial artificial intelligence inference router and compute clearinghouse.
              Eliminating centralized SaaS rent extraction with a 50 bps protocol fee.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            <a
              href="https://github.com/simonhavlik/verxl-protocol"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-slate-300 hover:text-white transition"
            >
              <Github className="w-4 h-4" />
              <span>GitHub Repository</span>
            </a>

            <a
              href="https://sepolia.etherscan.io/address/0xf0e51fB0FFBD8ef36281b6f643E0f7953BD5111a"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-slate-300 hover:text-blue-400 transition"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Sepolia DAO Contract</span>
            </a>

            <a
              href="https://app.aragon.org/dao/ethereum-sepolia/0xf0e51fB0FFBD8ef36281b6f643E0f7953BD5111a/proposals/VIP-1"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-slate-300 hover:text-blue-400 transition"
            >
              <ExternalLink className="w-4 h-4 text-blue-400" />
              <span>VIP-1 Proposal</span>
            </a>
          </div>
        </div>

        {/* Academic Course Attribution */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-[11px] text-slate-400">
          <div>
            Prague University of Economics and Business (VŠE Praha) • Faculty of International Relations (FIR) •
            Course: <span className="text-slate-300 font-medium">4KE404 / 4KE505 Crypto</span> • Instructor:{" "}
            <span className="text-slate-300 font-medium">Ing. Ondřej Paruch</span> • Pitch Presentation: Nov 4, 2026, xPort VŠE
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Cloudflare Edge Active</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
