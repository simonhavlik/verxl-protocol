import React from "react";
import { KeyRound, MessageSquare, Server, Terminal } from "lucide-react";
import { preloadRoute } from "../lib/routePreload";

interface MobileAppNavProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
}

const items = [
  { id: "chat", label: "Chat", icon: MessageSquare },
  { id: "playground", label: "Playground", icon: Terminal },
  { id: "registry", label: "Registry", icon: Server },
  { id: "console", label: "API", icon: KeyRound },
];

export const MobileAppNav: React.FC<MobileAppNavProps> = ({ activeTab, onNavigate }) => {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-white/[0.08] bg-[#080c10]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
      aria-label="Workspace"
    >
      {items.map(({ id, label, icon: Icon }) => {
        const active = activeTab === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => {
              preloadRoute(id);
              onNavigate(id);
            }}
            aria-current={active ? "page" : undefined}
            className={`relative flex h-14 flex-1 flex-col items-center justify-center gap-1 transition ${
              active ? "text-[#b8f6dd]" : "text-[#65737b] active:text-[#c9d4d8]"
            }`}
          >
            <Icon className="h-[17px] w-[17px]" />
            <span className="font-mono text-[7px] uppercase tracking-[0.1em]">{label}</span>
            {active && <span className="absolute top-0 h-[2px] w-6 bg-[#b8f6dd]" />}
          </button>
        );
      })}
    </nav>
  );
};
