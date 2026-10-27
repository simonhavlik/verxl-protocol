import React from "react";
import { ShieldCheck, Github, ExternalLink, Scale, Lock, FileText } from "lucide-react";

interface FooterProps {
  onNavigate?: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const handleLegalClick = (e: React.MouseEvent, tab: string) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate(tab);
    }
  };

  return (
    <footer className="mt-6 border-t border-blue-500/15 bg-[#05070b]/90 py-4 text-slate-400 font-mono text-xs relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800/60">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-wider text-white">
                VERXL<span className="text-blue-500">.COM</span>
              </span>
              <span className="px-1.5 py-0.2 rounded-[2px] text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/30">
                v1.0.0-SEPOLIA-TEST-RUN
              </span>
            </div>
            <p className="text-slate-400 max-w-md text-[10px]">
              Decentralized, non-custodial artificial intelligence inference router and compute clearinghouse.
              Academic proof-of-concept demonstration with 50 bps protocol clearing on Ethereum Sepolia testnet.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <a
              href="https://github.com/simonhavlik/verxl-protocol"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-[2px] bg-[#080c14] border border-slate-800 text-slate-300 hover:text-white hover:border-blue-500/40 text-[10.5px] transition"
            >
              <Github className="w-3 h-3" />
              <span>GitHub</span>
            </a>

            <a
              href="https://sepolia.etherscan.io/address/0xf0e51fB0FFBD8ef36281b6f643E0f7953BD5111a"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-[2px] bg-[#080c14] border border-slate-800 text-slate-300 hover:text-amber-400 hover:border-amber-500/40 text-[10.5px] transition"
            >
              <ShieldCheck className="w-3 h-3 text-amber-400" />
              <span>Sepolia DAO Test Run</span>
            </a>

            <a
              href="https://app.aragon.org/dao/ethereum-sepolia/0xf0e51fB0FFBD8ef36281b6f643E0f7953BD5111a/proposals/VIP-1"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-[2px] bg-[#080c14] border border-slate-800 text-slate-300 hover:text-blue-400 hover:border-blue-500/40 text-[10.5px] transition"
            >
              <ExternalLink className="w-3 h-3 text-blue-400" />
              <span>VIP-1 Proposal</span>
            </a>
          </div>
        </div>

        {/* Legal & Regulatory Navigation Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10px] text-slate-400 border-b border-slate-800/40 pb-2.5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-slate-500 uppercase tracking-wider font-bold">Legal & Compliance:</span>
            <a
              href="/privacy"
              onClick={(e) => handleLegalClick(e, "privacy")}
              className="hover:text-blue-400 transition flex items-center gap-1"
            >
              <Lock className="w-2.5 h-2.5 text-blue-400" />
              <span>Privacy Policy (GDPR)</span>
            </a>
            <span className="text-slate-700">·</span>
            <a
              href="/terms"
              onClick={(e) => handleLegalClick(e, "terms")}
              className="hover:text-blue-400 transition flex items-center gap-1"
            >
              <FileText className="w-2.5 h-2.5 text-blue-400" />
              <span>Terms of Service & Liability Disclaimer</span>
            </a>
            <span className="text-slate-700">·</span>
            <a
              href="/legal"
              onClick={(e) => handleLegalClick(e, "legal")}
              className="hover:text-blue-400 transition flex items-center gap-1"
            >
              <Scale className="w-2.5 h-2.5 text-emerald-400" />
              <span>EU MiCA Statement</span>
            </a>
          </div>
          <div className="text-slate-500 font-mono text-[9.5px]">
            Stateless Routing · Zero Custodial Liability · Czech Civil Code § 2898
          </div>
        </div>

        {/* Academic Project Attribution & Testnet Disclaimer */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 text-[10px] text-slate-400">
          <div>
            Launched as an applied blockchain and decentralized compute competition project at Prague University of Economics and Business (VŠE Praha).
            <div className="text-amber-400/90 mt-0.5 font-mono text-[9.5px]">
              [TEST RUN ON SEPOLIA] Demonstration on Ethereum Sepolia testnet. Not an official mainnet production deployment.
            </div>
          </div>
          <div className="flex items-center gap-2 font-mono">
            <span className="w-2 h-2 status-dot bg-amber-400 animate-pulse" />
            <span className="text-amber-300 text-[10px]">Sepolia Testnet Active</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
