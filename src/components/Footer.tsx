import React from "react";
import { Github, ExternalLink, ShieldCheck } from "lucide-react";

interface FooterProps {
  onNavigate?: (tab: string) => void;
}

const VAULT = "0xf0e51fB0FFBD8ef36281b6f643E0f7953BD5111a";

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const go = (tab: string) => (event: React.MouseEvent) => {
    if (!onNavigate) return;
    event.preventDefault();
    onNavigate(tab);
  };

  const columnHead = "text-[9px] uppercase tracking-[0.14em] text-slate-500 mb-1.5";
  const link = "block py-0.5 text-slate-400 hover:text-white transition-colors";

  return (
    <footer className="mt-6 border-t border-blue-500/15 bg-[#05070b]/95 font-mono text-[10px] relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-4">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-x-5 gap-y-4">
          <div className="col-span-2 md:col-span-5 space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-wider text-white">
                VERXL<span className="text-blue-500">.COM</span>
              </span>
              <span className="px-1.5 py-0.2 text-[8.5px] bg-amber-500/10 text-amber-400 border border-amber-500/30">
                v1.0.0 · SEPOLIA
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed max-w-md">
              Non-custodial inference clearing at a fixed 50 bps. Providers keep 99.5% in USDC on Arbitrum,
              the protocol switch routes statelessly through Cloudflare edge workers, and the Aragon OSx DAO
              holds the fee vault on Sepolia.
            </p>
            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[9px] text-emerald-400">
              <span className="w-1.5 h-1.5 bg-emerald-400 animate-pulse" />
              <span className="whitespace-nowrap">Sepolia testnet active</span>
              <span className="hidden sm:inline text-slate-600">·</span>
              <span className="hidden sm:inline text-slate-400">
                3 models · 1 bare-metal host · 2 official bridges
              </span>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className={columnHead}>Protocol</div>
            <a href="/playground" onClick={go("playground")} className={link}>
              Playground
            </a>
            <a href="/chat" onClick={go("chat")} className={link}>
              Chat
            </a>
            <a href="/api" onClick={go("console")} className={link}>
              Developer API
            </a>
            <a href="/registry" onClick={go("registry")} className={link}>
              Node registry
            </a>
          </div>

          <div className="md:col-span-2">
            <div className={columnHead}>Network</div>
            <a href="/oracle" onClick={go("oracle")} className={link}>
              Quality oracle
            </a>
            <a href="/governance" onClick={go("governance")} className={link}>
              Aragon DAO
            </a>
            <a href="/vision" onClick={go("vision")} className={link}>
              Vision & roadmap
            </a>
            <a href="/whitepaper" onClick={go("whitepaper")} className={link}>
              Whitepaper
            </a>
          </div>

          <div className="md:col-span-3">
            <div className={columnHead}>Resources</div>
            <a
              href={`https://sepolia.etherscan.io/address/${VAULT}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`${link} flex items-center gap-1.5`}
            >
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>DAO vault on Etherscan</span>
            </a>
            <a
              href="https://app.aragon.org/dao/ethereum-sepolia/0xf0e51fB0FFBD8ef36281b6f643E0f7953BD5111a/proposals/VIP-1"
              target="_blank"
              rel="noopener noreferrer"
              className={`${link} flex items-center gap-1.5`}
            >
              <ExternalLink className="w-3 h-3 text-blue-400" />
              <span>VIP-1 proposal</span>
            </a>
            <a
              href="https://github.com/simonhavlik/verxl-protocol"
              target="_blank"
              rel="noopener noreferrer"
              className={`${link} flex items-center gap-1.5`}
            >
              <Github className="w-3 h-3 text-slate-400" />
              <span>Source repository</span>
            </a>
            <span className="block py-0.5 text-slate-500 truncate" title={VAULT}>
              {VAULT.slice(0, 10)}...{VAULT.slice(-6)}
            </span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[9.5px]">
            <a href="/privacy" onClick={go("privacy")} className="text-slate-400 hover:text-blue-300 transition">
              Privacy (GDPR)
            </a>
            <span className="text-slate-700">·</span>
            <a href="/terms" onClick={go("terms")} className="text-slate-400 hover:text-blue-300 transition">
              Terms
            </a>
            <span className="text-slate-700">·</span>
            <a href="/legal" onClick={go("mica")} className="text-slate-400 hover:text-blue-300 transition">
              EU MiCA statement
            </a>
            <span className="text-slate-700">·</span>
            <a href="/legal" onClick={go("charter")} className="text-slate-400 hover:text-blue-300 transition">
              Founders charter
            </a>
          </div>
          <div className="text-[9px] text-slate-500">
            VŠE Praha applied blockchain project · © 2026 Verxl Protocol
          </div>
        </div>

        <div className="mt-2 hidden sm:flex flex-row items-center justify-between gap-1 text-[8.5px] text-slate-500">
          <span>Demonstration deployment on Ethereum Sepolia. Not a mainnet production system.</span>
          <span className="text-slate-500">Cloudflare Workers edge · PostgreSQL telemetry · Aragon OSx vault</span>
        </div>
      </div>
    </footer>
  );
};
