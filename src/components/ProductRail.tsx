import React from "react";
import { ArrowLeft, FlaskConical, KeyRound, MessageSquare, Network, Wallet } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { preloadRoute } from "../lib/routePreload";

interface ProductRailProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
  walletAddress?: string | null;
  onConnectWallet?: () => void;
}

const productItems = [
  { id: "chat", label: "Chat", icon: MessageSquare },
  { id: "playground", label: "Playground", icon: FlaskConical },
  { id: "registry", label: "Registry", icon: Network },
];

export const ProductRail: React.FC<ProductRailProps> = ({
  activeTab,
  onNavigate,
  walletAddress,
  onConnectWallet,
}) => {
  const { user } = useAuth();
  const account = user?.wallet_address || walletAddress;

  return (
    <aside className="hidden h-dvh w-[232px] shrink-0 select-none flex-col border-r border-white/[0.07] bg-[#080c10] lg:flex">
      <button
        type="button"
        onClick={() => onNavigate("overview")}
        className="flex h-[52px] shrink-0 items-center gap-2.5 border-b border-white/[0.07] px-4 text-left transition hover:bg-white/[0.025]"
      >
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" aria-hidden="true">
          <path d="M3 4l9 16 9-16" stroke="#b8f6dd" strokeWidth="2" />
          <path d="M7.5 4L12 12l4.5-8" stroke="#ffffff" strokeWidth="1" opacity="0.55" />
        </svg>
        <span className="text-[13.5px] font-semibold tracking-[-0.02em] text-white">Verxl</span>
        <span className="ml-auto font-mono text-[8px] uppercase tracking-[0.16em] text-[#65737b]">app</span>
      </button>

      <nav className="flex flex-col gap-0.5 px-2 py-3">
        <div className="mb-1 px-2 font-mono text-[8px] uppercase tracking-[0.16em] text-[#65737b]">Workspace</div>
        {productItems.map((item) => {
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
              className={`group flex h-9 items-center gap-2.5 border-l-2 px-2.5 text-left transition ${
                active
                  ? "border-[#b8f6dd] bg-white/[0.045] text-white"
                  : "border-transparent text-[#9aa7ad] hover:bg-white/[0.025] hover:text-white"
              }`}
            >
              <Icon className={`h-[15px] w-[15px] ${active ? "text-[#b8f6dd]" : "text-[#65737b] group-hover:text-[#9aa7ad]"}`} />
              <span className="text-[12px]">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-white/[0.07] p-2">
        <button
          type="button"
          onClick={() => onNavigate("console")}
          className="flex h-9 w-full items-center gap-2.5 px-2.5 text-left text-[#9aa7ad] transition hover:bg-white/[0.025] hover:text-white"
        >
          <KeyRound className="h-[15px] w-[15px] text-[#65737b]" />
          <span className="text-[12px]">API console</span>
        </button>
        <button
          type="button"
          onClick={() => onNavigate("overview")}
          className="flex h-9 w-full items-center gap-2.5 px-2.5 text-left text-[#9aa7ad] transition hover:bg-white/[0.025] hover:text-white"
        >
          <ArrowLeft className="h-[15px] w-[15px] text-[#65737b]" />
          <span className="text-[12px]">Back to site</span>
        </button>

        <div className="mt-2 border-t border-white/[0.07] px-2.5 pt-3">
          {account ? (
            <div className="flex items-center gap-2 font-mono text-[9px] text-[#9aa7ad]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#b8f6dd]" />
              <span>{account.slice(0, 6)}…{account.slice(-4)}</span>
            </div>
          ) : onConnectWallet ? (
            <button
              type="button"
              onClick={onConnectWallet}
              className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.12em] text-[#b8f6dd] transition hover:text-white"
            >
              <Wallet className="h-3 w-3" />
              Connect wallet
            </button>
          ) : (
            <span className="font-mono text-[9px] text-[#65737b]">SEPOLIA · TEST RUN</span>
          )}
        </div>
      </div>
    </aside>
  );
};
