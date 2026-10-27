import { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { Playground } from "./components/Playground";
import { Registry } from "./components/Registry";
import { Oracle } from "./components/Oracle";
import { Governance } from "./components/Governance";
import { Whitepaper } from "./components/Whitepaper";
import { Vision } from "./components/Vision";
import { Console } from "./components/Console";
import { Footer } from "./components/Footer";
import { ShmackBackground } from "./components/ShmackBackground";

function getTabFromPath(): string {
  if (typeof window === "undefined") return "overview";
  const path = window.location.pathname.toLowerCase();
  if (path.includes("whitepaper")) return "whitepaper";
  if (path.includes("vision")) return "vision";
  if (path.includes("console") || path.includes("billing") || path.includes("keys")) return "console";
  if (path.includes("playground") || path.includes("terminal")) return "playground";
  if (path.includes("registry") || path.includes("fleet")) return "registry";
  if (path.includes("oracle")) return "oracle";
  if (path.includes("governance") || path.includes("dao")) return "governance";
  return "overview";
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
          setWalletAddress(accounts[0]);
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
          {activeTab === "playground" && <Playground />}
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
        </main>
      )}

      {/* Institutional Footer */}
      <Footer />
    </div>
  );
}
