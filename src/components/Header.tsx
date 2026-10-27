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
    { id: "playground", label: "API Playground" },
    { id: "registry", label: "Compute Registry" },
    { id: "oracle", label: "Quality Oracle" },
    { id: "governance", label: "DAO & Whitepaper" },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[#080c14]/85 border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab("overview")}>
          <img
            src="/logo-square.jpg"
            alt="Verxl Logo"
            className="w-9 h-9 rounded-lg border border-blue-500/30 object-cover shadow-sm shadow-blue-500/20"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-white font-mono">
                VERXL<span className="text-blue-500">.COM</span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                SEPOLIA
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block font-mono">
              Non-Custodial AI Inference Clearing
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-lg border border-slate-800">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                activeTab === item.id
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* DAO Address Copy Badge */}
          <button
            onClick={copyAddress}
            title="Copy Aragon DAO Vault Address"
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono rounded-md bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700 transition"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>DAO: 0xf0e5...111a</span>
            {copied ? (
              <Check className="w-3 h-3 text-emerald-400" />
            ) : (
              <Copy className="w-3 h-3 text-slate-500" />
            )}
          </button>

          {/* Web3 Wallet Connect Button */}
          {walletAddress ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-blue-500/40 text-xs font-mono text-blue-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </span>
            </div>
          ) : (
            <button
              onClick={onConnectWallet}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-all active:scale-95"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Connect Wallet</span>
            </button>
          )}

          {/* External Aragon Link */}
          <a
            href="https://app.aragon.org/#/daos/sepolia/0xf0e51fB0FFBD8ef36281b6f643E0f7953BD5111a"
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-md bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition"
            title="View Live DAO on Aragon"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Mobile Nav Bar */}
      <div className="flex md:hidden overflow-x-auto border-t border-slate-800/80 px-4 py-2 gap-2 bg-[#0a0f1c]/90 no-scrollbar">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`px-3 py-1 text-xs whitespace-nowrap rounded-md font-medium transition ${
              activeTab === item.id
                ? "bg-blue-600 text-white"
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
