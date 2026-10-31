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

  const columnHead = "mb-2 font-mono text-[9px] uppercase tracking-[0.16em] text-[#7d8a92]";
  const link = "block py-1 text-[12px] text-[#9aa7ad] transition-colors hover:text-white";

  return (
    <footer className="relative z-10 mt-8 border-t border-white/10 bg-[#070a0f]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-12">
          <div className="col-span-2 space-y-3 md:col-span-5">
            <div className="flex items-center gap-2.5">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                <path d="M3 4l9 16 9-16" stroke="#b8f6dd" strokeWidth="2" />
                <path d="M7.5 4L12 12l4.5-8" stroke="#ffffff" strokeWidth="1" opacity="0.55" />
              </svg>
              <span className="text-[17px] font-semibold tracking-[-0.02em] text-white">Verxl</span>
              <span className="border border-white/10 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.14em] text-[#87959b]">
                v1.0.0 · Sepolia
              </span>
            </div>
            <p className="max-w-sm text-[12.5px] leading-relaxed text-[#9aa7ad]">
              Non-custodial inference clearing at a fixed 50 bps. Providers keep 99.5% in USDC on Arbitrum.
            </p>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[9px] text-[#7d8a92]">
              <span className="h-1 w-1 bg-[#b8f6dd]" />
              <span>Sepolia testnet</span>
              <span>·</span>
              <span>3 models</span>
              <span>·</span>
              <span>1 bare-metal host</span>
              <span>·</span>
              <span>2 bridges</span>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className={columnHead}>Protocol</div>
            <a href="/products" className={link}>Products</a>
            <a href="/playground" onClick={go("playground")} className={link}>Playground</a>
            <a href="/chat" onClick={go("chat")} className={link}>Chat</a>
            <a href="/api" onClick={go("console")} className={link}>Developer API</a>
            <a href="/registry" onClick={go("registry")} className={link}>Node registry</a>
            <a href="/about" onClick={go("about")} className={link}>About</a>
          </div>

          <div className="md:col-span-2">
            <div className={columnHead}>Network</div>
            <a href="/oracle" onClick={go("oracle")} className={link}>Quality oracle</a>
            <a href="/governance" onClick={go("governance")} className={link}>Aragon DAO</a>
            <a href="/about" onClick={go("about")} className={link}>Vision & roadmap</a>
            <a href="/whitepaper" onClick={go("whitepaper")} className={link}>Whitepaper</a>
          </div>

          <div className="md:col-span-3">
            <div className={columnHead}>Resources</div>
            <a href={`https://sepolia.etherscan.io/address/${VAULT}`} target="_blank" rel="noopener noreferrer" className={`${link} flex items-center gap-1.5`}>
              <ShieldCheck className="h-3.5 w-3.5 text-[#b8f6dd]" />
              <span>DAO vault on Etherscan</span>
            </a>
            <a href="https://app.aragon.org/dao/ethereum-sepolia/0xf0e51fB0FFBD8ef36281b6f643E0f7953BD5111a/proposals/VIP-1" target="_blank" rel="noopener noreferrer" className={`${link} flex items-center gap-1.5`}>
              <ExternalLink className="h-3.5 w-3.5 text-[#87959b]" />
              <span>VIP-1 proposal</span>
            </a>
            <a href="https://github.com/simonhavlik/verxl-protocol" target="_blank" rel="noopener noreferrer" className={`${link} flex items-center gap-1.5`}>
              <Github className="h-3.5 w-3.5 text-[#87959b]" />
              <span>Source repository</span>
            </a>
            <span className="mt-1 block font-mono text-[9.5px] text-[#65737b]" title={VAULT}>
              {VAULT.slice(0, 10)}...{VAULT.slice(-6)}
            </span>
          </div>
        </div>

        <div className="mt-10 flex flex-col justify-between gap-3 border-t border-white/10 pt-5 lg:flex-row lg:items-center">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px]">
            <a href="/privacy" onClick={go("privacy")} className="text-[#87959b] hover:text-white">Privacy (GDPR)</a>
            <a href="/terms" onClick={go("terms")} className="text-[#87959b] hover:text-white">Terms</a>
            <a href="/legal" onClick={go("mica")} className="text-[#87959b] hover:text-white">EU MiCA statement</a>
            <a href="/legal" onClick={go("charter")} className="text-[#87959b] hover:text-white">Founders charter</a>
          </div>
          <div className="text-[10px] text-[#65737b]">
            VŠE Praha applied blockchain project · © 2026 Verxl Protocol
          </div>
        </div>

        <div className="mt-2 flex flex-col justify-between gap-1 text-[9.5px] text-[#65737b] sm:flex-row">
          <span>Sepolia demonstration deployment. Mainnet production is out of scope.</span>
          <span>Cloudflare Workers edge · PostgreSQL telemetry · Aragon OSx vault</span>
        </div>
      </div>
    </footer>
  );
};
