import React, { useState, useEffect, lazy, Suspense, Component, type ErrorInfo } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { AuthProvider } from "./context/AuthContext";
import { Header } from "./components/Header";
const Hero = lazy(() => import("./components/Hero").then((m) => ({ default: m.Hero })));
import { Footer } from "./components/Footer";
import { ShmackBackground } from "./components/ShmackBackground";
import { preloadRoute } from "./lib/routePreload";
import { ProductRail } from "./components/ProductRail";

// Code-split interior tabs for instant mobile initial page loads & sub-200ms TTI
const Chat = lazy(() => import("./components/Chat").then((m) => ({ default: m.Chat })));
const Playground = lazy(() => import("./components/Playground").then((m) => ({ default: m.Playground })));
const Registry = lazy(() => import("./components/Registry").then((m) => ({ default: m.Registry })));
const Oracle = lazy(() => import("./components/Oracle").then((m) => ({ default: m.Oracle })));
const Governance = lazy(() => import("./components/Governance").then((m) => ({ default: m.Governance })));
const Whitepaper = lazy(() => import("./components/Whitepaper").then((m) => ({ default: m.Whitepaper })));
const About = lazy(() => import("./components/Vision").then((m) => ({ default: m.Vision })));
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

interface TabErrorBoundaryProps {
  children: React.ReactNode;
  activeTab: string;
}

interface TabErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class GlobalErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[Verxl Protocol] Top-Level Error Intercepted:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#05070b] text-slate-100 flex flex-col items-center justify-center p-6 text-center font-mono">
          <div className="w-14 h-14 mx-auto rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mb-4">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-white uppercase tracking-wider mb-2">
            Verxl Protocol Telemetry Fault
          </h1>
          <p className="text-xs text-slate-400 max-w-md mx-auto mb-4 font-sans">
            An unexpected error occurred. Your cryptographic keys, on-chain balances, and account data remain secure.
          </p>
          {this.state.error?.message && (
            <div className="text-[11px] text-red-300 bg-red-950/40 border border-red-900/50 p-3 rounded font-mono max-w-lg mb-6 break-all select-all text-left">
              {this.state.error.message}
            </div>
          )}
          <div className="flex gap-3">
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.href = "/";
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-[2px] transition flex items-center gap-2 uppercase tracking-wider"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Return to Overview</span>
            </button>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="px-4 py-2 bg-[#090d16] border border-slate-700 hover:border-slate-500 text-slate-300 text-xs font-bold rounded-[2px] transition uppercase tracking-wider"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

class TabErrorBoundary extends Component<TabErrorBoundaryProps, TabErrorBoundaryState> {
  constructor(props: TabErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): TabErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[Verxl Protocol] Instrument Rail Fault:", error, errorInfo);
  }

  componentDidUpdate(prevProps: TabErrorBoundaryProps) {
    if (prevProps.activeTab !== this.props.activeTab && this.state.hasError) {
      this.setState({ hasError: false, error: null });
    }
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-[#0a0e17] border border-red-500/30 rounded-[3px] p-6 sm:p-8 max-w-2xl mx-auto my-12 text-center font-mono space-y-4 shadow-2xl">
          <div className="w-12 h-12 mx-auto rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">
              Telemetry Rail Exception Intercepted
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto font-sans">
              A temporary render fault occurred while hydrating data. Your non-custodial cryptographic keys, on-chain balances, and account session are 100% secure.
            </p>
          </div>
          {this.state.error?.message && (
            <div className="text-[11px] text-red-300/80 bg-red-950/40 border border-red-900/50 p-3 rounded font-mono text-left break-all select-all">
              {this.state.error.message}
            </div>
          )}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={this.handleReload}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-[2px] transition flex items-center gap-2 uppercase tracking-wider"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reload Rail State</span>
            </button>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.href = "/chat";
              }}
              className="px-4 py-2 bg-[#05070b] border border-slate-700 hover:border-slate-500 text-slate-300 text-xs font-bold rounded-[2px] transition uppercase tracking-wider"
            >
              Switch to Chat
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function getTabFromPath(): string {
  if (typeof window === "undefined") return "overview";
  const path = window.location.pathname.toLowerCase();
  if (path.includes("chat")) return "chat";
  if (path.includes("whitepaper")) return "whitepaper";
  if (path.includes("vision") || path.includes("about")) return "about";
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
  const isProductRoute = ["chat", "playground", "registry"].includes(activeTab);

  // Sync tab changes with browser URL
  const handleTabChange = (tab: string) => {
    preloadRoute(tab);
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      const targetPath = tab === "overview" ? "/" : `/${tab}`;
      if (window.location.pathname !== targetPath) {
        window.history.pushState(null, "", targetPath);
      }
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  };

  // Warm the interactive surface. On Chat/Playground, don't download the other route.
  useEffect(() => {
    if (activeTab === "overview") {
      preloadRoute("playground");
      preloadRoute("chat");
    } else {
      preloadRoute(activeTab);
    }
  }, [activeTab]);

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
    <GlobalErrorBoundary>
      <AuthProvider>
        <div className={`min-h-screen bg-[#05070b] text-slate-100 flex flex-col font-sans selection:bg-[#b8f6dd] selection:text-[#07110d] relative ${isProductRoute ? "lg:h-[100dvh] lg:overflow-hidden" : ""}`}>
          {/* Shmack OS Shifting Dynamic Background for all marketing tabs */}
          {activeTab !== "overview" && !isProductRoute && <ShmackBackground activeTab={activeTab} />}

          {/* Marketing header; product routes use their own app chrome on desktop. */}
          <div className={isProductRoute ? "lg:hidden" : ""}>
            <Header
              activeTab={activeTab}
              setActiveTab={handleTabChange}
              walletAddress={walletAddress}
              onConnectWallet={handleConnectWallet}
            />
          </div>

          {/* Main Content Area */}
          {activeTab === "overview" ? (
            <div className="flex-1 flex flex-col relative z-10">
              <Suspense fallback={<div className="min-h-[60vh]" />}>
                <Hero onNavigate={handleTabChange} />
              </Suspense>
            </div>
          ) : isProductRoute ? (
            <main className="flex-1 min-h-0 w-full relative z-10 flex flex-col">
              {activeTab === "chat" ? (
                <TabErrorBoundary activeTab={activeTab}>
                  <Suspense fallback={<TabLoadingFallback />}>
                    <Chat onNavigate={handleTabChange} />
                  </Suspense>
                </TabErrorBoundary>
              ) : (
                <div className="flex flex-1 min-h-0">
                  <ProductRail
                    activeTab={activeTab}
                    onNavigate={handleTabChange}
                    walletAddress={walletAddress}
                    onConnectWallet={handleConnectWallet}
                  />
                  <div className="min-w-0 flex-1 overflow-y-auto">
                    <div className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-5 lg:px-8 lg:py-6">
                      <TabErrorBoundary activeTab={activeTab}>
                        <Suspense fallback={<TabLoadingFallback />}>
                          {activeTab === "playground" && <Playground onNavigate={handleTabChange} />}
                          {activeTab === "registry" && (
                            <Registry
                              walletAddress={walletAddress}
                              onConnectWallet={handleConnectWallet}
                            />
                          )}
                        </Suspense>
                      </TabErrorBoundary>
                    </div>
                  </div>
                </div>
              )}
            </main>
          ) : (
            <main className="flex-1 max-w-7xl w-full min-w-0 overflow-x-hidden mx-auto px-3 sm:px-5 lg:px-6 py-4 sm:py-5 relative z-10">
              <TabErrorBoundary activeTab={activeTab}>
                <Suspense fallback={<TabLoadingFallback />}>
                  {activeTab === "oracle" && <Oracle />}
                  {activeTab === "whitepaper" && <Whitepaper />}
                  {activeTab === "governance" && <Governance />}
                  {activeTab === "about" && <About onNavigate={handleTabChange} />}
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
              </TabErrorBoundary>
            </main>
          )}

          {/* Institutional footer: marketing only. Product routes reclaim the viewport. */}
          {!isProductRoute && <Footer onNavigate={handleTabChange} />}
        </div>
      </AuthProvider>
    </GlobalErrorBoundary>
  );
}
