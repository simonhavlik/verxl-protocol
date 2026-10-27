import React from "react";
import { ShieldCheck, Github, ExternalLink } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="mt-16 border-t border-blue-500/15 bg-[#05070b] py-10 text-slate-400 font-mono text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/60">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-wider text-white">
                VERXL<span className="text-blue-500">.COM</span>
              </span>
              <span className="px-1.5 py-0.5 rounded-[2px] text-[9.5px] bg-amber-500/10 text-amber-400 border border-amber-500/30">
                v1.0.0-SEPOLIA-TEST-RUN
              </span>
            </div>
            <p className="text-slate-400 max-w-md text-[10.5px]">
              Decentralized, non-custodial artificial intelligence inference router and compute clearinghouse.
              Academic proof-of-concept demonstration with 50 bps protocol clearing on Ethereum Sepolia testnet.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <a
              href="https://github.com/simonhavlik/verxl-protocol"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] bg-[#080c14] border border-slate-800 text-slate-300 hover:text-white hover:border-blue-500/40 transition"
            >
              <Github className="w-3.5 h-3.5" />
              <span>GitHub</span>
            </a>

            <a
              href="https://sepolia.etherscan.io/address/0xf0e51fB0FFBD8ef36281b6f643E0f7953BD5111a"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] bg-[#080c14] border border-slate-800 text-slate-300 hover:text-amber-400 hover:border-amber-500/40 transition"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Sepolia DAO Test Run</span>
            </a>

            <a
              href="https://app.aragon.org/dao/ethereum-sepolia/0xf0e51fB0FFBD8ef36281b6f643E0f7953BD5111a/proposals/VIP-1"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] bg-[#080c14] border border-slate-800 text-slate-300 hover:text-blue-400 hover:border-blue-500/40 transition"
            >
              <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
              <span>VIP-1 Proposal</span>
            </a>
          </div>
        </div>

        {/* Academic Course Attribution & Testnet Disclaimer */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-[10.5px] text-slate-400">
          <div>
            Prague University of Economics and Business (VŠE Praha) • Faculty of International Relations (FIR) •
            Course: <span className="text-slate-300 font-medium">4KE404 / 4KE505 Crypto</span> • Instructor:{" "}
            <span className="text-slate-300 font-medium">Ing. Ondřej Paruch</span> • Pitch Presentation: Nov 4, 2026, xPort VŠE
            <div className="text-amber-400/90 mt-1 font-mono">
              [TEST RUN ON SEPOLIA] Academic demonstration on Ethereum Sepolia testnet. Not an official mainnet production deployment.
            </div>
          </div>
          <div className="flex items-center gap-2 font-mono">
            <span className="w-2 h-2 status-dot bg-amber-400 animate-pulse" />
            <span className="text-amber-300">Sepolia Testnet Active</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
