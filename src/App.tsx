import { useState } from "react";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { Playground } from "./components/Playground";
import { Registry } from "./components/Registry";
import { Oracle } from "./components/Oracle";
import { Governance } from "./components/Governance";
import { Footer } from "./components/Footer";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [walletAddress, setWalletAddress] = useState<string | null>(
    "0x14f10A865e277C0B1949e18Dd9856602DB11742b" // Šimon Havlík's lead address pre-connected by default
  );

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
    <div className="min-h-screen bg-[#05070b] text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Sticky Institutional Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        walletAddress={walletAddress}
        onConnectWallet={handleConnectWallet}
      />

      {/* Main Content Area */}
      {activeTab === "overview" ? (
        <div className="flex-1 flex flex-col">
          <Hero onNavigate={setActiveTab} />
        </div>
      ) : (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          {activeTab === "playground" && <Playground />}
          {activeTab === "registry" && (
            <Registry
              walletAddress={walletAddress}
              onConnectWallet={handleConnectWallet}
            />
          )}
          {activeTab === "oracle" && <Oracle />}
          {activeTab === "governance" && <Governance />}
        </main>
      )}

      {/* Institutional Footer */}
      <Footer />
    </div>
  );
}
