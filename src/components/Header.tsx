import React, { useState, useRef, useEffect } from "react";
import { ExternalLink, Wallet, ChevronDown } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { openMetaMaskOnMobile } from "../lib/wallet";
import { preloadRoute } from "../lib/routePreload";

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
  const { user, loginWithWallet } = useAuth();
  const [connectingWallet, setConnectingWallet] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const mobileNavRef = useRef<HTMLDivElement | null>(null);

  const handleConnectWalletClick = async () => {
    if (typeof window !== "undefined" && !(window as any).ethereum) {
      if (openMetaMaskOnMobile()) return;
      onConnectWallet();
      return;
    }
    if (typeof window !== "undefined" && (window as any).ethereum) {
      try {
        setConnectingWallet(true);
        const eth = (window as any).ethereum;
        const accounts = await eth.request({ method: "eth_requestAccounts" });
        if (accounts && accounts.length > 0) {
          await loginWithWallet(accounts[0]);
          onConnectWallet();
          return;
        }
      } catch (err) {
        console.warn("Wallet connect error:", err);
      } finally {
        setConnectingWallet(false);
      }
    }
    onConnectWallet();
  };

  useEffect(() => {
    if (mobileNavRef.current) {
      const activeEl = mobileNavRef.current.querySelector('[data-active="true"]') as HTMLElement;
      if (activeEl) activeEl.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [activeTab]);

  const coreItems = [
    { id: "overview", label: "Overview" },
    { id: "playground", label: "Playground" },
    { id: "chat", label: "Chat" },
    { id: "console", label: "API" },
    { id: "governance", label: "Governance" },
    { id: "about", label: "About" },
  ];
  const moreItems = [
    { id: "registry", label: "Registry" },
    { id: "oracle", label: "Oracle" },
    { id: "whitepaper", label: "Whitepaper" },
  ];
  const allItems = [...coreItems, ...moreItems];
  const isActiveMore = moreItems.some((i) => i.id === activeTab);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#070a0f]/85 backdrop-blur-xl max-md:static">
      <div className="flex h-6 items-center justify-center gap-2 border-b border-white/5 bg-[#0b1016] px-3 font-mono text-[8.5px] uppercase tracking-[0.18em] text-[#b8f6dd]/70">
        <span className="h-1 w-1 bg-[#b8f6dd]" />
        <span>Sepolia test run</span>
      </div>

      <div className="mx-auto flex h-[68px] max-md:h-[54px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex shrink-0 cursor-pointer items-center gap-2.5" onClick={() => setActiveTab("overview")}>
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
            <path d="M3 4l9 16 9-16" stroke="#b8f6dd" strokeWidth="2" />
            <path d="M7.5 4L12 12l4.5-8" stroke="#ffffff" strokeWidth="1" opacity="0.55" />
          </svg>
          <span className="text-[15px] font-semibold tracking-[-0.02em] text-white">Verxl</span>
        </div>

        <nav className="hidden items-center gap-6 md:flex">
          {coreItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              onPointerEnter={() => preloadRoute(item.id)}
              onTouchStart={() => preloadRoute(item.id)}
              onFocus={() => preloadRoute(item.id)}
              className={`border-b pb-1 text-[12px] transition-colors ${
                activeTab === item.id
                  ? "border-[#b8f6dd] text-white"
                  : "border-transparent text-[#8b989e] hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
          <div className="relative" onMouseLeave={() => setShowMore(false)}>
            <button
              onClick={() => setShowMore((v) => !v)}
              className={`flex items-center gap-1 border-b pb-1 text-[12px] transition-colors ${
                isActiveMore
                  ? "border-[#b8f6dd] text-white"
                  : "border-transparent text-[#8b989e] hover:text-white"
              }`}
            >
              Protocol
              <ChevronDown className="h-3 w-3" />
            </button>
            {showMore && (
              <div
                className="absolute right-0 top-full w-44 pt-2"
                onMouseEnter={() => setShowMore(true)}
              >
                <div className="border border-white/10 bg-[#0b1016] p-1 shadow-2xl">
                  {moreItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setShowMore(false);
                      }}
                      onPointerEnter={() => preloadRoute(item.id)}
                      onTouchStart={() => preloadRoute(item.id)}
                      onFocus={() => preloadRoute(item.id)}
                      className={`block w-full px-2 py-1.5 text-left text-[11px] transition-colors ${
                        activeTab === item.id ? "text-[#b8f6dd]" : "text-[#9aa7ad] hover:text-white"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </nav>

        <div className="flex items-center gap-2">
          {user && (
            <button
              onClick={() => setActiveTab("console")}
              onPointerEnter={() => preloadRoute("console")}
              onTouchStart={() => preloadRoute("console")}
              className="hidden items-center gap-1.5 border border-white/10 px-2.5 py-1.5 font-mono text-[10px] text-[#c9d4d8] transition-colors hover:border-white/25 sm:flex"
              title="Balance"
            >
              <span className="h-1.5 w-1.5 bg-[#b8f6dd]" />
              <span className="text-white">${Number(user.balance_usd || 0).toFixed(2)}</span>
              <span className="text-[#77858b]">USD</span>
            </button>
          )}
          {walletAddress || user?.wallet_address ? (
            <div className="flex items-center gap-1.5 border border-[#b8f6dd]/25 px-2.5 py-1.5 font-mono text-[10px] text-[#d7f8ec]">
              <span className="h-1.5 w-1.5 bg-[#b8f6dd]" />
              <span>
                {(() => {
                  const raw = user?.wallet_address || walletAddress;
                  return raw && raw.length >= 10 ? `${raw.slice(0, 6)}...${raw.slice(-4)}` : "Connected";
                })()}
              </span>
            </div>
          ) : (
            <button
              onClick={handleConnectWalletClick}
              disabled={connectingWallet}
              className="flex items-center gap-1.5 border border-[#b8f6dd]/30 px-2.5 py-1.5 text-[11px] text-[#dff8ef] transition-colors hover:border-[#b8f6dd]/70 disabled:opacity-50"
            >
              <Wallet className="h-3.5 w-3.5" />
              <span>{connectingWallet ? "Connecting" : "Connect"}</span>
            </button>
          )}
          <a
            href="https://app.aragon.org/dao/ethereum-sepolia/0xf0e51fB0FFBD8ef36281b6f643E0f7953BD5111a"
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 text-[#77858b] transition-colors hover:text-white"
            title="Aragon DAO"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      <div
        ref={mobileNavRef}
        className="no-scrollbar sticky top-0 z-50 flex gap-5 overflow-x-auto border-t border-white/5 bg-[#070a0f]/95 px-4 py-2.5 backdrop-blur-xl md:hidden"
      >
        {allItems.map((item) => (
          <button
            key={item.id}
            data-active={activeTab === item.id ? "true" : "false"}
            onClick={() => setActiveTab(item.id)}
            className={`shrink-0 border-b pb-1 text-[11px] transition-colors ${
              activeTab === item.id
                ? "border-[#b8f6dd] text-white"
                : "border-transparent text-[#8b989e]"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};
