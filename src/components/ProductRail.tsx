import React from "react";
import { ArrowLeft, KeyRound, MessageSquare, Server, Terminal, Wallet } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { preloadRoute } from "../lib/routePreload";

interface ProductRailProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
  walletAddress?: string | null;
  onConnectWallet?: () => void;
  appMode?: boolean;
}

const items = [
  { id: "chat", label: "Chat", icon: MessageSquare },
  { id: "playground", label: "Playground", icon: Terminal },
  { id: "registry", label: "Registry", icon: Server },
  { id: "console", label: "API", icon: KeyRound },
];

export const ProductRail: React.FC<ProductRailProps> = ({
  activeTab,
  onNavigate,
  walletAddress,
  onConnectWallet,
  appMode = false,
}) => {
  const { user } = useAuth();
  const account = user?.wallet_address || walletAddress;

  return (
    <aside className="relative z-30 hidden h-dvh w-16 shrink-0 flex-col items-center border-r border-white/[0.07] bg-[#080c10] lg:flex">
      {appMode ? (
        <div className="flex h-[52px] w-full items-center justify-center border-b border-white/[0.07] text-[#b8f6dd]" aria-hidden="true">
          <svg viewBox="0 0 24 24" className="h-[19px] w-[19px]" fill="none">
            <path d="M3 4l9 16 9-16" stroke="#b8f6dd" strokeWidth="2" />
            <path d="M7.5 4L12 12l4.5-8" stroke="#ffffff" strokeWidth="1" opacity="0.55" />
          </svg>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => onNavigate("overview")}
          className="group relative flex h-[52px] w-full items-center justify-center border-b border-white/[0.07] text-[#b8f6dd] transition hover:bg-white/[0.025]"
          aria-label="Verxl home"
        >
          <svg viewBox="0 0 24 24" className="h-[19px] w-[19px]" fill="none" aria-hidden="true">
            <path d="M3 4l9 16 9-16" stroke="#b8f6dd" strokeWidth="2" />
            <path d="M7.5 4L12 12l4.5-8" stroke="#ffffff" strokeWidth="1" opacity="0.55" />
          </svg>
          <span className="pointer-events-none absolute left-full z-50 ml-2 whitespace-nowrap border border-white/[0.1] bg-[#0b1117] px-2 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-[#d7e2de] opacity-0 shadow-xl transition group-hover:opacity-100">
            Verxl home
          </span>
        </button>
      )}

      <nav className="flex w-full flex-col items-center gap-1 py-2">
        {items.map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                preloadRoute(item.id);
                onNavigate(item.id);
              }}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
              className={`group relative flex h-11 w-11 items-center justify-center transition ${
                active
                  ? "bg-[#b8f6dd]/[0.08] text-[#b8f6dd]"
                  : "text-[#65737b] hover:bg-white/[0.025] hover:text-[#c9d4d8]"
              }`}
            >
              {active && <span className="absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 bg-[#b8f6dd]" />}
              <Icon className="h-[17px] w-[17px]" />
              <span className="pointer-events-none absolute left-full z-50 ml-2 whitespace-nowrap border border-white/[0.1] bg-[#0b1117] px-2 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-[#d7e2de] opacity-0 shadow-xl transition group-hover:opacity-100">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto flex w-full flex-col items-center gap-1 border-t border-white/[0.07] py-2">
        {account ? (
          <div
            className="group relative flex h-9 w-9 items-center justify-center"
            title={account}
          >
            <span className="h-2 w-2 rounded-full bg-[#b8f6dd]" />
            <span className="pointer-events-none absolute left-full z-50 ml-2 whitespace-nowrap border border-white/[0.1] bg-[#0b1117] px-2 py-1 font-mono text-[8px] text-[#d7e2de] opacity-0 shadow-xl transition group-hover:opacity-100">
              {account.slice(0, 6)}…{account.slice(-4)}
            </span>
          </div>
        ) : onConnectWallet ? (
          <button
            type="button"
            onClick={onConnectWallet}
            className="group relative flex h-9 w-9 items-center justify-center text-[#65737b] transition hover:text-[#b8f6dd]"
            aria-label="Connect wallet"
          >
            <Wallet className="h-4 w-4" />
            <span className="pointer-events-none absolute left-full z-50 ml-2 whitespace-nowrap border border-white/[0.1] bg-[#0b1117] px-2 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-[#d7e2de] opacity-0 shadow-xl transition group-hover:opacity-100">
              Connect wallet
            </span>
          </button>
        ) : null}
        {!appMode && (
          <button
            type="button"
            onClick={() => onNavigate("overview")}
            className="group relative flex h-9 w-9 items-center justify-center text-[#65737b] transition hover:text-white"
            aria-label="Back to site"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="pointer-events-none absolute left-full z-50 ml-2 whitespace-nowrap border border-white/[0.1] bg-[#0b1117] px-2 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-[#d7e2de] opacity-0 shadow-xl transition group-hover:opacity-100">
              Back to site
            </span>
          </button>
        )}
      </div>
    </aside>
  );
};
