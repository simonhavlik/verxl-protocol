import { useState, useEffect, lazy, Suspense } from "react";
import { AuthProvider } from "./context/AuthContext";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { Footer } from "./components/Footer";
import { ShmackBackground } from "./components/ShmackBackground";

// Code-split interior tabs for instant mobile initial page loads & sub-200ms TTI
const Chat = lazy(() => import("./components/Chat").then((m) => ({ default: m.Chat })));
const Playground = lazy(() => import("./components/Playground").then((m) => ({ default: m.Playground })));
const Registry = lazy(() => import("./components/Registry").then((m) => ({ default: m.Registry })));
const Oracle = lazy(() => import("./components/Oracle").then((m) => ({ default: m.Oracle })));
const Governance = lazy(() => import("./components/Governance").then((m) => ({ default: m.Governance })));
const Whitepaper = lazy(() => import("./components/Whitepaper").then((m) => ({ default: m.Whitepaper })));
const Vision = lazy(() => import("./components/Vision").then((m) => ({ default: m.Vision })));
const Console = lazy(() => import("./components/Console").then((m) => ({ default: m.Console })));
const Legal = lazy(() => import("./components/Legal").then((m) => ({ default: m.Legal })));

const TabLoadingFallback = () => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3 font-mono select-none">
    <div className="relative">
      <div className="w-9 h-9 border-2 border-blue-500/20 border-t-blue-400 rounded-full animate-spin" />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping" />
      </div>
    </div>
    <div className="text-[11px] uppercase tracking-widest text-slate-400 animate-pulse">
      Loading Instrument Rail...
    </div>
  </div>
);

function getTabFromPath(): string {
  if (typeof window === "undefined") return "overview";
  const path = window.location.pathname.toLowerCase();
  if (path.includes("chat")) return "chat";
  if (path.includes("whitepaper")) return "whitepaper";
  if (path.includes("vision")) return "vision";
  if (path.includes("api") || path.includes("console") || path.includes("billing") || path.includes("keys")) return "console";
  if (path.includes("playground") || path.includes("terminal")) return "playground";
  if (path.includes("registry") || path.includes("fleet")) return "registry";
  if (path.includes("oracle")) return "oracle";
  if (path.includes("governance") || path.includes("dao")) return "governance";
  if (path.includes("privacy") || path.includes("terms") || path.includes("legal") || path.includes("mica") || path.includes("charter") || path.includes("ip")) return "legal";
  return "overview";
}

function getLegalSubTab(): "privacy" | "terms" | "mica" | "charter" {
  if (typeof window === "undefined") return "privacy";
  const path = window.location.pathname.toLowerCase();
  if (path.includes("terms")) return "terms";
  if (path.includes("mica")) return "mica";
  if (path.includes("charter") || path.includes("ip") || path.includes("attribution")) return "charter";
  return "privacy";
}

export default function App() {
  const [activeTab, setActiveTab] = useState<string>(getTabFromPath);
  const [walletAddress, setWalletAddress] = useState<string | null>(
    "0x14f10A865e277C0B1949e18Dd9856602DB11742b" // Šimon Havlík's lead address
  );

  // Sync tab changes with browser URL
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      const targetPath = tab === "overview" ? "/" : `/${tab}`;
      if (window.location.pathname !== targetPath) {
        window.history.pushState(null, "", targetPath);
      }
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  };

  // Listen to browser Back / Forward navigation
  useEffect(() => {
    const onPopState = () => {
      setActiveTab(getTabFromPath());
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const handleConnectWallet = async () => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({
          method: "eth_requestAccounts",
        });
        if (accounts && accounts.length > 0) {
          const account = accounts[0];
          setWalletAddress(account);
          try {
            const res = await fetch("/api/auth/wallet-login", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ wallet_address: account }),
            });
            const data = (await res.json()) as any;
            if (data.success && data.token) {
              localStorage.setItem("vrxl_auth_token", data.token);
              window.dispatchEvent(new Event("storage"));
            }
          } catch {}
          return;
        }
      } catch (err) {
        console.warn("User rejected Web3 connection or error occurred:", err);
      }
    }
    // Fallback toggle for demo if no browser extension installed
    if (!walletAddress) {
      setWalletAddress("0x14f10A865e277C0B1949e18Dd9856602DB11742b");
    } else {
      setWalletAddress(null);
    }
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-[#05070b] text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white relative">
        {/* Shmack OS Shifting Dynamic Background for all interior tabs */}
        {activeTab !== "overview" && <ShmackBackground activeTab={activeTab} />}

        {/* Sticky Institutional Header */}
        <Header
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          walletAddress={walletAddress}
          onConnectWallet={handleConnectWallet}
        />

        {/* Main Content Area */}
        {activeTab === "overview" ? (
          <div className="flex-1 flex flex-col relative z-10">
            <Hero onNavigate={handleTabChange} />
          </div>
        ) : (
          <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-5 lg:px-6 py-4 sm:py-5 relative z-10">
            <Suspense fallback={<TabLoadingFallback />}>
              {activeTab === "chat" && <Chat onNavigate={handleTabChange} />}
              {activeTab === "playground" && <Playground onNavigate={handleTabChange} />}
              {activeTab === "registry" && (
                <Registry
                  walletAddress={walletAddress}
                  onConnectWallet={handleConnectWallet}
                />
              )}
              {activeTab === "oracle" && <Oracle />}
              {activeTab === "whitepaper" && <Whitepaper />}
              {activeTab === "governance" && <Governance />}
              {activeTab === "vision" && <Vision onNavigate={handleTabChange} />}
              {activeTab === "console" && <Console />}
              {(activeTab === "legal" || activeTab === "privacy" || activeTab === "terms" || activeTab === "mica" || activeTab === "charter") && (
                <Legal
                  initialTab={
                    activeTab === "privacy" ? "privacy" :
                    activeTab === "terms" ? "terms" :
                    activeTab === "mica" ? "mica" :
                    activeTab === "charter" ? "charter" :
                    getLegalSubTab()
                  }
                />
              )}
            </Suspense>
          </main>
        )}

        {/* Institutional Footer */}
        <Footer onNavigate={handleTabChange} />
      </div>
    </AuthProvider>
  );
}
