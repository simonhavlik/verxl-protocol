import React, { useState, useRef, useEffect } from "react";
import { ExternalLink, ShieldCheck, Wallet, Check, Copy } from "lucide-react";

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  walletAddress: string | null;
  onConnectWallet: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  walletAddress,
  onConnectWallet,
}) => {
  const [copied, setCopied] = useState(false);
  const mobileNavRef = useRef<HTMLDivElement | null>(null);
  const daoAddress = "0xf0e51fB0FFBD8ef36281b6f643E0f7953BD5111a";

  // Center active mobile tab button smoothly when switched
  useEffect(() => {
    if (mobileNavRef.current) {
      const activeEl = mobileNavRef.current.querySelector('[data-active="true"]') as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
    }
  }, [activeTab]);

  const copyAddress = () => {
    navigator.clipboard.writeText(daoAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const navItems = [
    { id: "overview", label: "Overview" },
    { id: "playground", label: "Playground" },
    { id: "chat", label: "Chat" },
    { id: "console", label: "API" },
    { id: "registry", label: "Registry" },
    { id: "oracle", label: "Oracle" },
    { id: "whitepaper", label: "Whitepaper" },
    { id: "governance", label: "Governance" },
    { id: "vision", label: "Vision" },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[#05070b]/90 border-b border-blue-500/15">
      {/* Sepolia Testnet Notice Top Bar */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-3 py-1 font-mono text-[9.5px] sm:text-[10px] text-amber-300/90 tracking-wide flex items-center justify-center gap-2 overflow-x-auto whitespace-nowrap">
        <span className="px-1.5 py-0.2 rounded-[2px] bg-amber-500/20 border border-amber-500/40 text-[8.5px] font-bold text-amber-300 tracking-wider shrink-0">
          SEPOLIA TESTNET
        </span>
        <span className="text-amber-500/40">/</span>
        <span className="text-slate-300 truncate">
          VŠE Praha Academic Project
        </span>
        <span className="hidden md:inline text-amber-500/40">/</span>
        <a
          href="https://sepolia.etherscan.io/address/0xf0e51fB0FFBD8ef36281b6f643E0f7953BD5111a"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:inline text-amber-300/80 hover:text-amber-200 underline decoration-amber-500/40 transition"
        >
          DAO: 0xf0e5...111a
        </a>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div
          className="flex items-center gap-2.5 cursor-pointer py-1"
          onClick={() => setActiveTab("overview")}
        >
          <img
            src="/logo-square.jpg"
            alt="Verxl Logo"
            className="w-7 h-7 rounded-[3px] border border-blue-500/40 object-cover shadow-sm shadow-blue-500/20"
          />
          <span className="font-bold text-sm tracking-wider text-white font-mono">
            VERXL<span className="text-blue-500">.COM</span>
          </span>
        </div>

        {/* Navigation Tabs — Hairline instrument tabs */}
        <nav className="hidden md:flex items-center gap-0.5 bg-[#090d16] p-0.5 rounded-[3px] border border-slate-800/90 font-mono text-xs">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-2.5 py-1 rounded-[2px] transition-all text-[10.5px] uppercase tracking-wider font-medium ${
                activeTab === item.id
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-500/25 border border-blue-400/40"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* DAO Address Copy Badge */}
          <button
            onClick={copyAddress}
            title="Copy Aragon DAO Vault Address"
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono rounded-[3px] bg-[#090d16] border border-slate-800 text-slate-300 hover:border-blue-500/50 transition"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>DAO: 0xf0e5...111a</span>
            {copied ? (
              <Check className="w-3 h-3 text-emerald-400" />
            ) : (
              <Copy className="w-3 h-3 text-slate-400" />
            )}
          </button>

          {/* Web3 Wallet Connect Button — Strictly Square */}
          {walletAddress ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-[3px] bg-[#090d16] border border-blue-500/40 text-xs font-mono text-blue-300">
              <span className="w-2 h-2 status-dot bg-emerald-400 animate-pulse" />
              <span>
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </span>
            </div>
          ) : (
            <button
              onClick={onConnectWallet}
              className="hero-btn hero-btn--primary !py-1.5 !px-3 !text-[11px]"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Connect</span>
            </button>
          )}

          {/* External Aragon Link */}
          <a
            href="https://app.aragon.org/dao/ethereum-sepolia/0xf0e51fB0FFBD8ef36281b6f643E0f7953BD5111a"
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-[3px] bg-[#090d16] border border-slate-800 text-slate-400 hover:text-white hover:border-blue-500/40 transition"
            title="View Live DAO on Aragon OSx"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Mobile Nav Bar */}
      <div
        ref={mobileNavRef}
        className="flex md:hidden overflow-x-auto border-t border-slate-800/80 px-3 py-2 gap-2 bg-[#060911] no-scrollbar font-mono text-xs touch-pan-x scroll-smooth select-none"
      >
        {navItems.map((item) => (
          <button
            key={item.id}
            data-active={activeTab === item.id ? "true" : "false"}
            onClick={() => setActiveTab(item.id)}
            className={`min-h-[36px] px-3.5 py-1.5 whitespace-nowrap rounded-[2px] transition-all flex items-center justify-center tracking-wider text-[11px] font-bold uppercase active:scale-95 ${
              activeTab === item.id
                ? "bg-blue-600 text-white shadow-sm shadow-blue-500/30 border border-blue-400/50"
                : "bg-[#0a0e17] text-slate-400 border border-slate-800/90 hover:text-white"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};
