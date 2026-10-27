import React, { useState } from "react";
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
  const daoAddress = "0xf0e51fB0FFBD8ef36281b6f643E0f7953BD5111a";

  const copyAddress = () => {
    navigator.clipboard.writeText(daoAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const navItems = [
    { id: "overview", label: "Overview" },
    { id: "playground", label: "Inference Terminal" },
    { id: "registry", label: "Compute Registry" },
    { id: "oracle", label: "Quality Oracle" },
    { id: "whitepaper", label: "Whitepaper" },
    { id: "governance", label: "DAO Governance" },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[#05070b]/90 border-b border-blue-500/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div
          className="flex items-center gap-3 cursor-pointer py-2"
          onClick={() => setActiveTab("overview")}
        >
          <img
            src="/logo-square.jpg"
            alt="Verxl Logo"
            className="w-8 h-8 rounded-[3px] border border-blue-500/40 object-cover shadow-sm shadow-blue-500/20"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-wider text-white font-mono">
                VERXL<span className="text-blue-500">.COM</span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded-[2px] text-[9.5px] font-mono font-medium bg-blue-500/10 text-blue-400 border border-blue-500/30">
                <span className="w-1.5 h-1.5 status-dot bg-blue-400 animate-pulse" />
                SEPOLIA
              </span>
            </div>
            <p className="text-[9.5px] text-slate-400 hidden sm:block font-mono tracking-wide">
              Non-Custodial AI Inference Clearing
            </p>
          </div>
        </div>

        {/* Navigation Tabs — Hairline instrument tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-[#090d16] p-1 rounded-[3px] border border-slate-800/90 font-mono text-xs">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-3 py-1.5 rounded-[2px] transition-all text-[11px] uppercase tracking-wider font-medium ${
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
              <span>Connect Wallet</span>
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
      <div className="flex md:hidden overflow-x-auto border-t border-slate-800/80 px-4 py-2 gap-1.5 bg-[#070b13] no-scrollbar font-mono text-[11px]">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`px-2.5 py-1 whitespace-nowrap rounded-[2px] transition ${
              activeTab === item.id
                ? "bg-blue-600 text-white font-medium"
                : "text-slate-400 hover:bg-slate-800"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};
