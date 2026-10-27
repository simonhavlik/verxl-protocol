import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { marked } from "marked";
import {
  Plus,
  MessageSquare,
  Trash2,
  Edit3,
  Download,
  Copy,
  Check,
  Send,
  Square,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Settings,
  Coins,
  Terminal,
  Cpu,
  X,
  LogIn,
  LogOut,
  User,
  Mail,
  KeyRound,
  ShieldCheck,
  Search,
  Wallet,
  Clock,
  Sparkles,
  Server,
} from "lucide-react";

marked.setOptions({
  gfm: true,
  breaks: true,
});

const renderMarkdown = (content: string): string => {
  if (!content) return "";
  try {
    const preprocessed = content.replace(/\*\*([^\s*][^*]*?)\*\*([a-zA-Z0-9])/g, "**$1** $2");
    return marked.parse(preprocessed) as string;
  } catch {
    return content;
  }
};

interface MessageMetrics {
  promptTokens?: number;
  completionTokens?: number;
  costUsd?: number;
  ttftMs?: number;
  tps?: number;
  provider?: string;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  reasoning?: string;
  createdAt: number;
  metrics?: MessageMetrics;
}

interface ChatSession {
  id: string;
  title: string;
  model: string;
  systemPrompt: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

export interface ModelConfig {
  id: string;
  name: string;
  tag: string;
  category: "all" | "1m" | "reasoning" | "bare-metal" | "official-bridge";
  promptRate: number;
  cachedPromptRate: number;
  completionRate: number;
  specialHoursPromptRate: number;
  specialHoursCompletionRate: number;
  specialHoursDesc: string;
  context: string;
  contextTokens: number;
  speed: string;
  provider: string;
  isOfficialBridge: boolean;
  description: string;
}

export const AVAILABLE_MODELS: ModelConfig[] = [
  {
    id: "qwen3.5-4b-uncensored-32k",
    name: "Bulbasaur Qwen 3.5 4B Uncensored (1M)",
    tag: "Bare-Metal Resident Node",
    category: "bare-metal",
    promptRate: 0.05,
    cachedPromptRate: 0.010,
    completionRate: 0.10,
    specialHoursPromptRate: 0.025,
    specialHoursCompletionRate: 0.05,
    specialHoursDesc: "24/7 Dedicated Bare-Metal Flat Host ($0.025 Prompt / $0.05 Completion)",
    context: "1,000,000 tokens (1M)",
    contextTokens: 1000000,
    speed: "~52 TPS",
    provider: "Prague Node 01 (Bulbasaur Bare-Metal)",
    isOfficialBridge: true,
    description: "Resident Bare-Metal cluster in Prague. Zero reload latency, uncensored institutional precision.",
  },
  {
    id: "deepseek-v4.1-flash",
    name: "DeepSeek V4.1 Flash (1M)",
    tag: "Deep Reasoning & Quantitative Code",
    category: "reasoning",
    promptRate: 0.30,
    cachedPromptRate: 0.006,
    completionRate: 1.20,
    specialHoursPromptRate: 0.15,
    specialHoursCompletionRate: 0.60,
    specialHoursDesc: "50% Off-Peak Discount ($0.15 Input / $0.60 Output, $0.003 Cache Hit) outside 01:00-04:00 & 06:00-10:00 UTC",
    context: "1,000,000 tokens (1M)",
    contextTokens: 1000000,
    speed: "~45 TPS",
    provider: "DeepSeek Official Bridge (Tokyo / Hangzhou)",
    isOfficialBridge: true,
    description: "Official DeepSeek V4.1 Flash multi-head latent reasoning engine with 1M resident context.",
  },
  {
    id: "deepseek-v4-pro",
    name: "DeepSeek V4 Pro (1M)",
    tag: "Trillion-Parameter Flagship Reasoning",
    category: "reasoning",
    promptRate: 1.32,
    cachedPromptRate: 0.044,
    completionRate: 3.96,
    specialHoursPromptRate: 0.66,
    specialHoursCompletionRate: 1.98,
    specialHoursDesc: "50% Off-Peak Discount ($0.66 Input / $1.98 Output, $0.022 Cache Hit) outside 01:00-04:00 & 06:00-10:00 UTC",
    context: "1,000,000 tokens (1M)",
    contextTokens: 1000000,
    speed: "~30 TPS",
    provider: "DeepSeek Official Bridge (Tokyo / Hangzhou)",
    isOfficialBridge: true,
    description: "DeepSeek's flagship trillion-parameter reasoning model with 1M context and formal mathematical deduction.",
  },
  {
    id: "mimo-v2.6-flash",
    name: "Xiaomi MiMo v2.6 Flash (1M)",
    tag: "High-Concurrency Systems Engine",
    category: "official-bridge",
    promptRate: 0.14,
    cachedPromptRate: 0.0028,
    completionRate: 0.28,
    specialHoursPromptRate: 0.14,
    specialHoursCompletionRate: 0.28,
    specialHoursDesc: "Official Overseas Flat Rate ($0.14 Prompt / $0.28 Output, $0.0028 Cache Hit)",
    context: "1,000,000 tokens (1M)",
    contextTokens: 1000000,
    speed: "~60 TPS",
    provider: "Xiaomi Official Bridge (Frankfurt)",
    isOfficialBridge: true,
    description: "Official Xiaomi MiMo v2.6 Flash with 1M resident context, sub-85ms TTFT, and 99% prompt cache discount.",
  },
  {
    id: "mimo-v2.6-pro",
    name: "Xiaomi MiMo v2.6 Pro (1M)",
    tag: "Omnimodal Flagship Logic Engine",
    category: "official-bridge",
    promptRate: 0.435,
    cachedPromptRate: 0.0036,
    completionRate: 0.87,
    specialHoursPromptRate: 0.435,
    specialHoursCompletionRate: 0.87,
    specialHoursDesc: "Flagship 1.02T Trillion Parameter Logic Engine ($0.435 Prompt / $0.87 Output, $0.0036 Cache Hit)",
    context: "1,000,000 tokens (1M)",
    contextTokens: 1000000,
    speed: "~40 TPS",
    provider: "Xiaomi Official Bridge (Frankfurt)",
    isOfficialBridge: true,
    description: "Xiaomi's 1.02T parameter omnimodal flagship logic model with 1M context for complex architecture and code.",
  },
];

const DEFAULT_SYSTEM_PROMPT =
  "You are Verxl Protocol's verified institutional AI assistant. Provide mathematically rigorous, technically exact, and non-custodial quantitative intelligence. Respond concisely with clear structure and code examples where appropriate.";

const STARTER_PROMPTS = [
  {
    title: "Protocol Fee Efficiency",
    subtitle: "Financial spread analysis",
    prompt:
      "Calculate the net protocol fee savings for an AI fintech startup processing 500 million tokens monthly through Verxl (50 bps fee) versus centralized SaaS aggregators (950 bps fee). Include runway preservation metrics.",
  },
  {
    title: "Nash Equilibrium & Slashing",
    subtitle: "Game-theoretic verification",
    prompt:
      "Formulate how Verxl's 10% collateral slashing rule and probabilistic oracle auditing enforce Nash equilibrium for independent GPU hosts providing FP16 inference.",
  },
  {
    title: "Rust Tokio Router",
    subtitle: "High-concurrency systems",
    prompt:
      "Draft a high-concurrency Rust Tokio client for Verxl's OpenAI-compatible /v1/chat/completions endpoint with connection pooling, backoff retry, and streaming SSE parsing.",
  },
  {
    title: "Autonomous Quality Oracle",
    subtitle: "Smart contract audit logic",
    prompt:
      "Explain the smart contract mechanism of Verxl's Autonomous Quality Oracle on Ethereum Sepolia, specifically how deterministic seed=42 probes trigger probation or collateral slashing.",
  },
];

const TREASURY_WALLET = "0x14f10A865e277C0B1949e18Dd9856602DB11742b";

interface ChatProps {
  onNavigate?: (tab: string) => void;
}

export const Chat: React.FC<ChatProps> = ({ onNavigate }) => {
  // Shared Auth State across Chat & API
  const {
    token: authToken,
    user,
    logout,
    refreshSession,
    loginWithApiKey,
    loginWithToken,
    loginWithWallet,
    customApiKey,
    setCustomApiKey,
  } = useAuth();

  const balanceUsd = user ? Number(user.balance_usd) : 0.0;

  // Auth Modal State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState<"key" | "email" | "wallet">("key");
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  // Session State - Stored in PostgreSQL, bound to user account, cleared on logout
  const createBlankSession = (): ChatSession => ({
    id: `chat_${Date.now()}`,
    title: "New Chat",
    model: "qwen3.5-4b-uncensored-32k",
    systemPrompt: DEFAULT_SYSTEM_PROMPT,
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  const [sessions, setSessions] = useState<ChatSession[]>([createBlankSession()]);
  const [activeSessionId, setActiveSessionId] = useState<string>(sessions[0].id);
  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];

  // Model Selector Search, Category Filter & Recently Used
  const [modelSearch, setModelSearch] = useState("");
  const [modelCategory, setModelCategory] = useState<
    "all" | "1m" | "bulbasaur" | "deepseek" | "xiaomi" | "reasoning" | "bare-metal" | "official-bridge"
  >("all");
  const [recentModelIds, setRecentModelIds] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("vrxl_recent_model_ids");
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return ["qwen3.5-4b-uncensored-32k", "deepseek-v4.1-flash"];
  });

  const selectModel = (modelId: string) => {
    const updated = sessions.map((s) => (s.id === activeSession.id ? { ...s, model: modelId, updatedAt: Date.now() } : s));
    setSessions(updated);
    const target = updated.find((s) => s.id === activeSession.id);
    if (target) syncSessionToDb(target);
    setShowModelDropdown(false);
    setRecentModelIds((prev) => {
      const up = [modelId, ...prev.filter((id) => id !== modelId)].slice(0, 3);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("vrxl_recent_model_ids", JSON.stringify(up));
        } catch {}
      }
      return up;
    });
  };

  const filteredModels = AVAILABLE_MODELS.filter((m) => {
    const matchesCategory =
      modelCategory === "all" ||
      (modelCategory === "1m" && m.contextTokens >= 1000000) ||
      (modelCategory === "bulbasaur" && m.provider.toLowerCase().includes("bulbasaur")) ||
      (modelCategory === "deepseek" && m.provider.toLowerCase().includes("deepseek")) ||
      (modelCategory === "xiaomi" && m.provider.toLowerCase().includes("xiaomi")) ||
      (modelCategory === "reasoning" && m.category === "reasoning") ||
      (modelCategory === "bare-metal" && m.category === "bare-metal") ||
      (modelCategory === "official-bridge" && m.isOfficialBridge);

    const matchesSearch =
      !modelSearch.trim() ||
      m.name.toLowerCase().includes(modelSearch.toLowerCase()) ||
      m.provider.toLowerCase().includes(modelSearch.toLowerCase()) ||
      m.tag.toLowerCase().includes(modelSearch.toLowerCase()) ||
      m.description.toLowerCase().includes(modelSearch.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  // Fetch PostgreSQL-backed conversations when authenticated user changes
  useEffect(() => {
    if (!authToken || !user) {
      // With logout, conversations disappear from device and memory!
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem("vrxl_chat_sessions_v2");
        } catch {}
      }
      const blank = createBlankSession();
      setSessions([blank]);
      setActiveSessionId(blank.id);
      return;
    }

    let isMounted = true;
    const fetchDbConversations = async () => {
      try {
        const res = await fetch("/api/chat/conversations", {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        if (res.ok) {
          const data = (await res.json()) as any;
          if (isMounted && data.conversations && data.conversations.length > 0) {
            setSessions(data.conversations);
            setActiveSessionId(data.conversations[0].id);
          }
        }
      } catch (err) {
        console.warn("Error fetching PostgreSQL conversations:", err);
      }
    };

    fetchDbConversations();
    return () => {
      isMounted = false;
    };
  }, [authToken, user?.id]);

  // Sync conversation to PostgreSQL
  const syncSessionToDb = async (sess: ChatSession) => {
    if (!authToken || !user) return;
    try {
      await fetch("/api/chat/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          id: sess.id,
          title: sess.title,
          model: sess.model,
          systemPrompt: sess.systemPrompt,
          messages: sess.messages,
        }),
      });
    } catch (err) {
      console.warn("Failed to sync conversation to PostgreSQL:", err);
    }
  };

  const handleAuthModalLoginWithApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKeyInput.trim() || !apiKeyInput.startsWith("vrxl_live_")) {
      setAuthError("Valid production API key required (vrxl_live_...)");
      return;
    }
    setAuthLoading(true);
    setAuthError(null);
    setAuthSuccess(null);
    const result = await loginWithApiKey(apiKeyInput.trim());
    setAuthLoading(false);
    if (result.success) {
      setAuthSuccess("Authenticated successfully!");
      setApiKeyInput("");
      setTimeout(() => setShowAuthModal(false), 700);
    } else {
      setAuthError(result.error || "Authentication failed. Key may be invalid or inactive.");
    }
  };

  const handleAuthModalSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim() || !emailInput.includes("@")) {
      setAuthError("Please enter a valid email address.");
      return;
    }
    setAuthLoading(true);
    setAuthError(null);
    setAuthSuccess(null);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput.trim() }),
      });
      const data = (await res.json()) as any;
      if (res.ok) {
        setOtpSent(true);
        setAuthSuccess("Verification code sent to " + emailInput.trim());
      } else {
        setAuthError(data.error || "Failed to send verification code.");
      }
    } catch (err: any) {
      setAuthError("Network error: " + err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleAuthModalVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpInput.trim() || otpInput.trim().length !== 6) {
      setAuthError("Enter the 6-digit verification code.");
      return;
    }
    setAuthLoading(true);
    setAuthError(null);
    setAuthSuccess(null);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput.trim(), code: otpInput.trim() }),
      });
      const data = (await res.json()) as any;
      if (res.ok && data.token) {
        await loginWithToken(data.token);
        setAuthSuccess("Logged in successfully!");
        setOtpSent(false);
        setOtpInput("");
        setTimeout(() => setShowAuthModal(false), 700);
      } else {
        setAuthError(data.error || "Invalid or expired verification code.");
      }
    } catch (err: any) {
      setAuthError("Verification failed: " + err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  // Streaming & Message Generation State
  const [inputPrompt, setInputPrompt] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [streamingReasoning, setStreamingReasoning] = useState("");
  const [expandedReasoningIds, setExpandedReasoningIds] = useState<Record<string, boolean>>({});

  // UI States
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [editTitleText, setEditTitleText] = useState("");
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [copiedTreasury, setCopiedTreasury] = useState(false);

  // Deposit verification & 1-Click Web3 state
  const [depositTab, setDepositTab] = useState<"1click" | "manual">("1click");
  const [depositAmountPreset, setDepositAmountPreset] = useState<number>(5);
  const [customDepositAmount, setCustomDepositAmount] = useState<string>("");
  const [isDepositingWeb3, setIsDepositingWeb3] = useState<boolean>(false);
  const [depositTxHash, setDepositTxHash] = useState("");
  const [verifyingDeposit, setVerifyingDeposit] = useState(false);
  const [depositStatus, setDepositStatus] = useState<string | null>(null);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Refresh user profile & balance
  useEffect(() => {
    refreshSession();
  }, []);

  // Auto-resize textarea as user types
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [inputPrompt]);

  // Auto-scroll strictly the internal messages scroll area during streaming (prevents outer window/page jumping)
  useEffect(() => {
    if (scrollContainerRef.current && isStreaming) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [streamingContent, streamingReasoning, isStreaming]);

  // Scroll internal messages area to bottom on session switch or new user message
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [activeSessionId, activeSession?.messages.length]);

  // Create New Chat Session
  const createNewSession = () => {
    const newSession = createBlankSession();
    newSession.model = activeSession?.model || "qwen3.5-4b-uncensored-32k";
    newSession.systemPrompt = activeSession?.systemPrompt || DEFAULT_SYSTEM_PROMPT;
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setInputPrompt("");
    if (window.innerWidth < 768) setSidebarOpen(false);
    syncSessionToDb(newSession);
  };

  // Delete Chat Session
  const deleteSession = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (authToken && user) {
      try {
        await fetch(`/api/chat/conversations?id=${encodeURIComponent(id)}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${authToken}` },
        });
      } catch {}
    }
    setSessions((prev) => {
      const filtered = prev.filter((s) => s.id !== id);
      if (filtered.length === 0) {
        const blank = createBlankSession();
        setActiveSessionId(blank.id);
        return [blank];
      }
      if (activeSessionId === id) {
        setActiveSessionId(filtered[0].id);
      }
      return filtered;
    });
  };

  // Rename Chat Session
  const saveTitleEdit = (id: string) => {
    if (!editTitleText.trim()) {
      setEditingTitleId(null);
      return;
    }
    const updated = sessions.map((s) => (s.id === id ? { ...s, title: editTitleText.trim(), updatedAt: Date.now() } : s));
    setSessions(updated);
    const target = updated.find((s) => s.id === id);
    if (target) syncSessionToDb(target);
    setEditingTitleId(null);
  };

  // 1-Click In-App MetaMask Deposit with Cryptographic Ownership Proof (Anti-Snatching)
  const handle1ClickWeb3Deposit = async () => {
    const amountUsd = customDepositAmount ? parseFloat(customDepositAmount) : depositAmountPreset;
    if (!amountUsd || amountUsd < 0.1) {
      setDepositStatus("Minimum deposit is $0.10 USD.");
      return;
    }
    if (typeof window === "undefined" || !(window as any).ethereum) {
      setDepositStatus("MetaMask or Web3 wallet not detected. Switch to Manual tab or install MetaMask.");
      return;
    }

    setIsDepositingWeb3(true);
    setDepositStatus("Connecting MetaMask...");
    try {
      const eth = (window as any).ethereum;
      const [account] = await eth.request({ method: "eth_requestAccounts" });

      // Verify network is Arbitrum One (Chain ID 42161 = 0xa4b1)
      const chainId = await eth.request({ method: "eth_chainId" });
      if (chainId !== "0xa4b1" && chainId !== "42161") {
        setDepositStatus("Switching to Arbitrum One network in MetaMask...");
        try {
          await eth.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0xa4b1" }],
          });
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            await eth.request({
              method: "wallet_addEthereumChain",
              params: [{
                chainId: "0xa4b1",
                chainName: "Arbitrum One",
                nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
                rpcUrls: ["https://arb1.arbitrum.io/rpc"],
                blockExplorerUrls: ["https://arbiscan.io"],
              }],
            });
          } else {
            throw switchError;
          }
        }
      }

      setDepositStatus(`Confirming $${amountUsd.toFixed(2)} USDC transfer in MetaMask...`);
      // Native Arbitrum USDC contract: 0xaf88d065e77c8cc2239327c5edb3a432268e5831 (6 decimals)
      const usdcContract = "0xaf88d065e77c8cc2239327c5edb3a432268e5831";
      const treasuryPadded = TREASURY_WALLET.slice(2).padStart(64, "0").toLowerCase();
      const rawUnits = Math.round(amountUsd * 1e6);
      const amountPadded = rawUnits.toString(16).padStart(64, "0");
      const transferCalldata = `0xa9059cbb${treasuryPadded}${amountPadded}`;

      const txHash = await eth.request({
        method: "eth_sendTransaction",
        params: [{
          from: account,
          to: usdcContract,
          data: transferCalldata,
        }],
      });

      setDepositStatus(`Transaction sent (${txHash.slice(0, 10)}...)! Signing zero-gas anti-snatching ownership proof...`);
      let signature = "";
      try {
        signature = await eth.request({
          method: "personal_sign",
          params: [`Verxl Deposit Verification: ${txHash.toLowerCase()}`, account],
        });
      } catch (sigErr) {
        console.warn("Signature skipped/cancelled:", sigErr);
      }

      setDepositStatus("Waiting for Arbitrum block confirmation & settlement...");
      // Poll verify endpoint
      let settled = false;
      for (let attempt = 1; attempt <= 12; attempt++) {
        try {
          const res = await fetch("/api/deposit/verify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken || ""}`,
            },
            body: JSON.stringify({
              tx_hash: txHash,
              signature: signature || undefined,
              wallet_address: account,
            }),
          });
          const data = (await res.json()) as any;
          if (res.ok && data.success) {
            const added = Number(data.amount_usd ?? data.deposit?.amount_usd ?? amountUsd);
            setDepositStatus(`🎉 Deposit confirmed on Arbitrum One! +$${added.toFixed(2)} USD added.`);
            if (data.token) {
              await loginWithToken(data.token);
            } else {
              await refreshSession();
            }
            if (data.new_api_key) {
              setCustomApiKey(data.new_api_key);
            }
            settled = true;
            setTimeout(() => setShowDepositModal(false), 2000);
            break;
          }
        } catch {}
        await new Promise((r) => setTimeout(r, 2000));
      }

      if (!settled) {
        setDepositStatus(`Broadcasted: ${txHash.slice(0, 14)}... Blockchain receipt is settling. Your balance will update shortly.`);
      }
    } catch (err: any) {
      setDepositStatus(err.message || "Transaction was rejected or failed.");
    } finally {
      setIsDepositingWeb3(false);
    }
  };

  // Verify Arbitrum USDC Deposit (Manual Hash with Cryptographic Signature Check)
  const handleVerifyDeposit = async () => {
    if (!depositTxHash.trim()) return;
    setVerifyingDeposit(true);
    setDepositStatus(null);
    try {
      let signature = "";
      // If MetaMask is installed, request signature on hash to prove ownership against front-runners
      if (typeof window !== "undefined" && (window as any).ethereum) {
        try {
          const eth = (window as any).ethereum;
          const [account] = await eth.request({ method: "eth_accounts" });
          if (account) {
            setDepositStatus("Prompting wallet signature to verify ownership...");
            signature = await eth.request({
              method: "personal_sign",
              params: [`Verxl Deposit Verification: ${depositTxHash.trim().toLowerCase()}`, account],
            });
          }
        } catch {}
      }

      const res = await fetch("/api/deposit/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken || ""}`,
        },
        body: JSON.stringify({
          tx_hash: depositTxHash.trim(),
          signature: signature || undefined,
        }),
      });

      const data = (await res.json()) as any;
      if (res.ok && data.success) {
        const added = Number(data.amount_usd ?? data.deposit?.amount_usd ?? 0);
        setDepositStatus(`Deposit confirmed! +$${added.toFixed(2)} USD added.`);
        if (data.token) {
          await loginWithToken(data.token);
        } else {
          await refreshSession();
        }
        if (data.new_api_key) {
          setCustomApiKey(data.new_api_key);
        }
        setDepositTxHash("");
      } else {
        setDepositStatus(`Verification note: ${data.error || "Transaction pending confirmation on Arbitrum."}`);
      }
    } catch (err: any) {
      setDepositStatus("Network error verifying transaction: " + err.message);
    } finally {
      setVerifyingDeposit(false);
    }
  };

  // Send Message & Stream Response
  const handleSendMessage = async (promptOverride?: string) => {
    const textToSend = (promptOverride || inputPrompt).trim();
    if (!textToSend || isStreaming) return;

    // Determine authorization header
    let authorizationHeader = "";
    if (customApiKey.trim()) {
      authorizationHeader = `Bearer ${customApiKey.trim()}`;
    } else if (authToken) {
      authorizationHeader = `Bearer ${authToken}`;
    }

    // Check authorization & balance
    if (!customApiKey.trim()) {
      if (!authorizationHeader || balanceUsd <= 0.0) {
        setShowDepositModal(true);
        return;
      }
    }

    const userMessage: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      role: "user",
      content: textToSend,
      createdAt: Date.now(),
    };

    // Update session with user message and generate title if first message
    const updatedMessages = [...activeSession.messages, userMessage];
    let newTitle = activeSession.title;
    if (activeSession.messages.length === 0) {
      newTitle = textToSend.slice(0, 32) + (textToSend.length > 32 ? "..." : "");
    }

    const updatedUserSession: ChatSession = {
      ...activeSession,
      title: newTitle,
      messages: updatedMessages,
      updatedAt: Date.now(),
    };

    setSessions((prev) =>
      prev.map((s) => (s.id === activeSession.id ? updatedUserSession : s))
    );
    syncSessionToDb(updatedUserSession);

    setInputPrompt("");
    setIsStreaming(true);
    setStreamingContent("");
    setStreamingReasoning("");

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const startTime = performance.now();
    let firstTokenTime = 0;
    let accumulatedContent = "";
    let accumulatedReasoning = "";
    let tokenCount = 0;

    // Prepare OpenAI formatted messages payload
    const apiMessages = [
      { role: "system", content: activeSession.systemPrompt || DEFAULT_SYSTEM_PROMPT },
      ...updatedMessages.map((m) => ({ role: m.role, content: m.content })),
    ];

    const currentModel = activeSession.model || "qwen3.5-4b-uncensored-32k";
    const selectedModelConfig = AVAILABLE_MODELS.find((m) => m.id === currentModel) || AVAILABLE_MODELS[0];

    try {
      const response = await fetch("/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authorizationHeader,
        },
        body: JSON.stringify({
          model: currentModel,
          messages: apiMessages,
          stream: true,
          temperature: 0.3,
          max_tokens: 1536,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as any;
        if (response.status === 402) {
          setShowDepositModal(true);
        }
        throw new Error(errorData?.error?.message || `HTTP ${response.status}: Failed to generate response.`);
      }

      if (response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let lineBuffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          lineBuffer += decoder.decode(value, { stream: true });
          const lines = lineBuffer.split("\n");
          lineBuffer = lines.pop() || "";

          for (const rawLine of lines) {
            const line = rawLine.trim();
            if (line.startsWith("data: ") && line !== "data: [DONE]") {
              try {
                const parsed = JSON.parse(line.slice(6));
                const delta = parsed.choices?.[0]?.delta;
                const contentChunk = delta?.content || "";
                const reasoningChunk = delta?.reasoning || delta?.reasoning_content || "";

                if (!firstTokenTime && (contentChunk || reasoningChunk)) {
                  firstTokenTime = Math.round(performance.now() - startTime);
                }

                if (reasoningChunk) {
                  accumulatedReasoning += reasoningChunk;
                  setStreamingReasoning(accumulatedReasoning);
                  tokenCount++;
                }

                if (contentChunk) {
                  accumulatedContent += contentChunk;
                  setStreamingContent(accumulatedContent);
                  tokenCount++;
                }
              } catch {}
            }
          }
        }
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        accumulatedContent += `\n\n> [!WARNING]\n> **Inference Notice:** ${err.message || "Upstream bare-metal node cycling. Please retry."}`;
      }
    } finally {
      const totalLatency = Math.round(performance.now() - startTime);
      const estPromptTokens = Math.max(16, Math.ceil(JSON.stringify(apiMessages).length / 4));
      const estCompletionTokens = Math.max(4, tokenCount);
      const computeCost =
        (estPromptTokens / 1e6) * selectedModelConfig.promptRate +
        (estCompletionTokens / 1e6) * selectedModelConfig.completionRate;
      const totalCost = computeCost * 1.005; // 50 bps protocol fee

      const assistantMessage: ChatMessage = {
        id: `msg_asst_${Date.now()}`,
        role: "assistant",
        content: accumulatedContent || "Response concluded.",
        reasoning: accumulatedReasoning || undefined,
        createdAt: Date.now(),
        metrics: {
          promptTokens: estPromptTokens,
          completionTokens: estCompletionTokens,
          costUsd: totalCost,
          ttftMs: firstTokenTime || 45,
          tps: Math.round((estCompletionTokens / (totalLatency / 1000)) * 10) / 10 || 52.4,
          provider: "Prague Node 01 (Bulbasaur Bare-Metal)",
        },
      };

      const updatedWithAssistant: ChatSession = {
        ...activeSession,
        title: newTitle,
        messages: [...updatedMessages, assistantMessage],
        updatedAt: Date.now(),
      };

      setSessions((prev) =>
        prev.map((s) => (s.id === activeSession.id ? updatedWithAssistant : s))
      );
      syncSessionToDb(updatedWithAssistant);

      // Refresh balance from backend
      setTimeout(() => refreshSession(), 1000);

      setIsStreaming(false);
      setStreamingContent("");
      setStreamingReasoning("");
    }
  };

  // Halt generation
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsStreaming(false);
  };

  // Copy message text
  const copyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  // Copy treasury address
  const copyTreasury = () => {
    navigator.clipboard.writeText(TREASURY_WALLET);
    setCopiedTreasury(true);
    setTimeout(() => setCopiedTreasury(false), 2000);
  };

  // Toggle reasoning accordion
  const toggleReasoning = (msgId: string) => {
    setExpandedReasoningIds((prev) => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  // Export Chat
  const exportChat = (format: "markdown" | "json") => {
    if (!activeSession) return;
    let content = "";
    let filename = `verxl-chat-${activeSession.id}`;

    if (format === "json") {
      content = JSON.stringify(activeSession, null, 2);
      filename += ".json";
    } else {
      content = `# ${activeSession.title}\n*Model:* ${activeSession.model}\n*Exported:* ${new Date().toISOString()}\n\n---\n\n`;
      for (const m of activeSession.messages) {
        content += `### ${m.role === "user" ? "User" : "Verxl Assistant"}\n`;
        if (m.reasoning) {
          content += `> [Thought Process]\n> ${m.reasoning.replace(/\n/g, "\n> ")}\n\n`;
        }
        content += `${m.content}\n\n`;
        if (m.metrics?.costUsd) {
          content += `*Cost: $${Number(m.metrics.costUsd || 0).toFixed(6)} USD • ${m.metrics.completionTokens} tokens*\n\n`;
        }
      }
      filename += ".md";
    }

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-[calc(100vh-105px)] min-h-[580px] flex rounded-[4px] border border-blue-500/20 bg-[#05070b] overflow-hidden text-slate-100 font-sans shadow-2xl relative">
      {/* ============================================================== */}
      {/* 1. LEFT SIDEBAR: CONVERSATION HISTORY & ACCOUNT STATUS         */}
      {/* ============================================================== */}
      <aside
        className={`${
          sidebarOpen ? "w-64 sm:w-72" : "w-0"
        } transition-all duration-200 shrink-0 border-r border-slate-800 bg-[#080c14] flex flex-col overflow-hidden select-none z-30`}
      >
        {/* New Chat Button */}
        <div className="p-3 border-b border-slate-800/80">
          <button
            onClick={createNewSession}
            className="w-full flex items-center justify-between px-3 py-2 rounded-[3px] bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-semibold tracking-wide shadow-sm shadow-blue-500/30 transition active:scale-[0.98]"
          >
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span>New Chat</span>
            </div>
            <span className="text-[10px] text-blue-200 uppercase tracking-widest font-mono">
              50 BPS
            </span>
          </button>
        </div>

        {/* Sessions Scrollable List */}
        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1 font-mono text-xs">
          <div className="px-2 py-1 text-[10px] uppercase tracking-wider text-slate-400 font-semibold flex items-center justify-between">
            <span>Conversations</span>
            <span className="text-slate-400">{sessions.length}</span>
          </div>

          {sessions.map((session) => {
            const isActive = session.id === activeSession.id;
            return (
              <div
                key={session.id}
                onClick={() => {
                  setActiveSessionId(session.id);
                  if (window.innerWidth < 768) setSidebarOpen(false);
                }}
                className={`group relative flex items-center justify-between px-2.5 py-2 rounded-[3px] cursor-pointer transition ${
                  isActive
                    ? "bg-[#0f172a] text-blue-300 border border-blue-500/30 shadow-sm"
                    : "text-slate-400 hover:bg-slate-900/60 hover:text-slate-200"
                }`}
              >
                <div className="flex items-center gap-2 truncate pr-6">
                  <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-blue-400" : "text-slate-400"}`} />
                  {editingTitleId === session.id ? (
                    <input
                      type="text"
                      autoFocus
                      value={editTitleText}
                      onChange={(e) => setEditTitleText(e.target.value)}
                      onBlur={() => saveTitleEdit(session.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveTitleEdit(session.id);
                        if (e.key === "Escape") setEditingTitleId(null);
                      }}
                      className="bg-black border border-blue-500 px-1 py-0.5 text-xs text-white rounded-[2px] outline-none"
                    />
                  ) : (
                    <span className="truncate text-[11.5px] font-medium">{session.title}</span>
                  )}
                </div>

                {/* Session Action Menu */}
                <div className="absolute right-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingTitleId(session.id);
                      setEditTitleText(session.title);
                    }}
                    className="p-1 text-slate-400 hover:text-white rounded-[2px]"
                    title="Rename"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => deleteSession(session.id, e)}
                    className="p-1 text-slate-400 hover:text-rose-400 rounded-[2px]"
                    title="Delete"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* User Account & Real-Time Balance Footer */}
        <div className="p-3 border-t border-slate-800 bg-[#05070b]/90 space-y-2">
          {/* Balance Pill */}
          <div className="flex items-center justify-between px-2.5 py-1.5 rounded-[3px] bg-[#0c1220] border border-blue-500/20">
            <div className="flex items-center gap-2">
              <Coins className="w-3.5 h-3.5 text-emerald-400" />
              <div>
                <div className="text-[9px] uppercase tracking-wider text-slate-400 font-mono">
                  Account Balance
                </div>
                <div className="text-xs font-bold font-mono text-emerald-400">
                  ${balanceUsd.toFixed(4)} <span className="text-[9px] font-normal text-slate-400">USD</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowDepositModal(true)}
              className="px-2 py-1 rounded-[2px] bg-blue-600/80 hover:bg-blue-600 text-white text-[10px] font-mono tracking-wider transition"
            >
              + Deposit
            </button>
          </div>

          {/* User ID / Sign In */}
          {user ? (
            <div className="flex items-center justify-between text-[10.5px] font-mono text-slate-400 px-1 pt-1">
              <div className="truncate max-w-[140px] text-slate-300 font-medium" title={user.email || user.id}>
                {user.email || user.id}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowSettingsModal(true)}
                  className="p-1 hover:text-white transition"
                  title="Settings"
                >
                  <Settings className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={logout}
                  className="p-1 hover:text-rose-400 transition"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-1 pt-1">
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-[3px] bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 text-[11px] font-mono font-medium transition"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In / Key</span>
              </button>
              <button
                onClick={() => setShowSettingsModal(true)}
                className="p-1.5 hover:text-white text-slate-400 border border-slate-800 rounded-[3px] bg-[#0c1220] transition"
                title="Settings"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ============================================================== */}
      {/* 2. MAIN CHAT AREA                                              */}
      {/* ============================================================== */}
      <main className="flex-1 flex flex-col bg-[#05070b] overflow-hidden relative">
        {/* Top Header Bar */}
        <header className="h-12 border-b border-slate-800 bg-[#080c14]/90 px-3 sm:px-4 flex items-center justify-between shrink-0 select-none z-20">
          <div className="flex items-center gap-2">
            {/* Toggle Sidebar Button */}
            <button
              onClick={() => setSidebarOpen((prev) => !prev)}
              className="p-1.5 rounded-[3px] border border-slate-800 bg-[#05070b] text-slate-400 hover:text-white transition"
              title={sidebarOpen ? "Hide Sidebar" : "Show Sidebar"}
            >
              <Terminal className="w-4 h-4 text-blue-400" />
            </button>

            {/* Model Selector Pill */}
            <div className="relative">
              <button
                onClick={() => setShowModelDropdown((prev) => !prev)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] bg-[#0c1220] border border-blue-500/30 text-xs font-mono text-slate-200 hover:border-blue-400 transition"
              >
                <Cpu className="w-3.5 h-3.5 text-blue-400" />
                <span className="font-semibold truncate max-w-[150px] sm:max-w-[260px]">
                  {AVAILABLE_MODELS.find((m) => m.id === activeSession?.model)?.name || "Select Model"}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Model Dropdown Menu with Search, Filter & Last Used */}
              {showModelDropdown && (
                <div className="absolute left-0 mt-1.5 w-80 sm:w-96 rounded-[4px] bg-[#080c14] border border-blue-500/40 shadow-2xl p-2.5 z-50 space-y-2 font-mono text-xs max-h-[85vh] overflow-y-auto">
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search models, 1M context, providers..."
                      value={modelSearch}
                      onChange={(e) => setModelSearch(e.target.value)}
                      className="w-full bg-[#05070b] border border-slate-800 rounded-[3px] pl-7 pr-2 py-1.5 text-xs text-white outline-none focus:border-blue-500 font-mono"
                      autoFocus
                    />
                  </div>

                  {/* Filter Pills */}
                  <div className="flex flex-wrap gap-1 text-[10px] font-mono">
                    {[
                      { id: "all", label: "All" },
                      { id: "1m", label: "1M Context" },
                      { id: "bulbasaur", label: "Prague Bulbasaur" },
                      { id: "deepseek", label: "DeepSeek" },
                      { id: "xiaomi", label: "Xiaomi MiMo" },
                      { id: "reasoning", label: "Reasoning" },
                      { id: "official-bridge", label: "Official Bridge" },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setModelCategory(tab.id as any)}
                        className={`px-2 py-0.5 rounded-[2px] border transition ${
                          modelCategory === tab.id
                            ? "bg-blue-600/30 border-blue-500 text-blue-200 font-bold"
                            : "bg-[#0c1220] border-slate-800 text-slate-400 hover:text-white"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Recently Used Strip */}
                  {recentModelIds.length > 0 && !modelSearch.trim() && (
                    <div className="pt-1 border-t border-slate-800/80">
                      <div className="text-[9.5px] uppercase tracking-wider text-slate-500 font-bold mb-1 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-blue-400" />
                        <span>Recently Used:</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {recentModelIds.map((rid) => {
                          const m = AVAILABLE_MODELS.find((mod) => mod.id === rid);
                          if (!m) return null;
                          return (
                            <button
                              key={rid}
                              onClick={() => selectModel(m.id)}
                              className="px-2 py-1 rounded-[2px] bg-[#0c1220] border border-slate-800 hover:border-blue-500/50 text-[10.5px] text-slate-300 flex items-center gap-1 transition"
                            >
                              <span className="truncate max-w-[120px]">{m.name}</span>
                              <span className="text-[8.5px] text-blue-400 font-bold">1M</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Models List */}
                  <div className="space-y-1.5 pt-1 border-t border-slate-800/80">
                    <div className="px-1 text-[9.5px] uppercase tracking-wider text-slate-400 font-bold flex items-center justify-between">
                      <span>Available Models ({filteredModels.length})</span>
                      <span className="text-emerald-400 text-[9px]">50 BPS PROTOCOL FEE</span>
                    </div>

                    {filteredModels.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => selectModel(m.id)}
                        className={`p-2.5 rounded-[3px] cursor-pointer transition border ${
                          activeSession?.model === m.id
                            ? "bg-blue-600/20 border-blue-500 text-white shadow-md shadow-blue-500/10"
                            : "bg-[#060a12] border-slate-800/90 hover:border-slate-700 text-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 font-bold text-xs">
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="truncate">{m.name}</span>
                            {m.isOfficialBridge && (
                              <span className="px-1 py-0.2 rounded-[2px] bg-blue-500/20 border border-blue-500/40 text-[8.5px] text-blue-300 shrink-0 font-mono">
                                Official Bridge
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-emerald-400 font-semibold shrink-0">{m.speed}</span>
                        </div>

                        <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">{m.description}</div>

                        {/* Specs & Fee Breakdown */}
                        <div className="mt-2 pt-1.5 border-t border-slate-800/80 space-y-1.5 text-[9.5px] font-mono">
                          <div className="flex items-center justify-between text-slate-400">
                            <span className="text-blue-300 font-semibold flex items-center gap-1">
                              <Sparkles className="w-2.5 h-2.5 text-blue-400" />
                              <span>{m.context}</span>
                            </span>
                            <span className="text-slate-200">
                              Prompt: <span className="font-bold text-white">${m.promptRate}</span> • Output: <span className="font-bold text-white">${m.completionRate}</span> / 1M
                            </span>
                          </div>

                          {/* Cached Prompt & Output Prefix Fee */}
                          <div className="flex items-center justify-between text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-[2px] border border-emerald-500/20">
                            <span className="font-semibold flex items-center gap-1">
                              <span>💾 Cached Prompt Prefix:</span>
                            </span>
                            <span className="font-bold">
                              ${m.cachedPromptRate} / 1M ({Math.round((1 - m.cachedPromptRate / m.promptRate) * 100)}% off)
                            </span>
                          </div>

                          {/* Special Hours / Off-Peak Fee */}
                          <div className="text-amber-300 bg-amber-500/10 px-2 py-1 rounded-[2px] border border-amber-500/20 space-y-0.5">
                            <div className="flex items-center justify-between font-bold text-[10px]">
                              <span>🌙 Off-Peak / Special Hours:</span>
                              <span className="text-white">${m.specialHoursPromptRate} Prompt / ${m.specialHoursCompletionRate} Output</span>
                            </div>
                            {m.specialHoursDesc && (
                              <div className="text-[8.5px] text-amber-200/80 leading-snug">
                                {m.specialHoursDesc}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Provider Node Label */}
                        <div className="text-[9.5px] text-slate-400 mt-1.5 pt-1 border-t border-slate-800/50 flex items-center justify-between">
                          <span className="flex items-center gap-1 text-slate-300">
                            <Server className="w-3 h-3 text-purple-400" />
                            <span>Provider: <strong className="text-white">{m.provider}</strong></span>
                          </span>
                          <span className="text-emerald-400 font-bold uppercase tracking-wider text-[8.5px]">Verified SLA</span>
                        </div>
                      </div>
                    ))}

                    {filteredModels.length === 0 && (
                      <div className="text-center py-4 text-xs text-slate-500">
                        No models matching "{modelSearch}".
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2">
            {/* Live Balance Badge */}
            <div
              onClick={() => setShowDepositModal(true)}
              className="cursor-pointer hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] bg-[#0c1220] border border-blue-500/20 font-mono text-xs hover:border-blue-400 transition"
              title="Click to Deposit"
            >
              <span className="w-2 h-2 rounded-[50%] bg-emerald-400 animate-pulse" />
              <span className="text-slate-400 text-[10px] uppercase">Balance:</span>
              <span className="text-emerald-400 font-bold">${balanceUsd.toFixed(4)}</span>
            </div>

            {/* Auth Button or User Badge */}
            {user ? (
              <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300">
                <User className="w-3.5 h-3.5 text-blue-400" />
                <span className="truncate max-w-[130px] font-medium">{user.email || user.id}</span>
                <button
                  onClick={logout}
                  className="ml-1 p-0.5 text-slate-500 hover:text-rose-400 transition"
                  title="Sign Out"
                >
                  <LogOut className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-semibold transition active:scale-95"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

            {/* Export Dropdown */}
            <button
              onClick={() => exportChat("markdown")}
              className="p-1.5 rounded-[3px] bg-[#05070b] border border-slate-800 text-slate-400 hover:text-white transition"
              title="Export Markdown"
            >
              <Download className="w-3.5 h-3.5" />
            </button>

            {/* Persona / Settings Button */}
            <button
              onClick={() => setShowSettingsModal(true)}
              className="p-1.5 rounded-[3px] bg-[#05070b] border border-slate-800 text-slate-400 hover:text-white transition"
              title="Configure System Prompt"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* Messages Scroll Area */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 select-text"
        >
          {/* Empty Conversation Welcome Screen */}
          {activeSession.messages.length === 0 && !isStreaming ? (
            <div className="max-w-2xl mx-auto py-8 sm:py-12 flex flex-col items-center justify-center text-center space-y-6 select-none">
              <div className="relative">
                <img
                  src="/logo-square.jpg"
                  alt="Verxl Logo"
                  className="w-16 h-16 rounded-[4px] border border-blue-500/50 shadow-xl shadow-blue-500/20 object-cover"
                />
                <span className="absolute -bottom-1.5 -right-1.5 px-1.5 py-0.2 rounded-[2px] bg-blue-600 text-[9px] font-mono font-bold text-white uppercase tracking-wider">
                  50 BPS
                </span>
              </div>

              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-mono">
                  Verxl Protocol Chat
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 font-mono max-w-md mx-auto">
                  Non-custodial edge AI inference. Output costs cleared in real time from your balance with 50 bps protocol fee.
                </p>
              </div>

              {/* Starter Prompts Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full text-left pt-2">
                {STARTER_PROMPTS.map((starter, i) => (
                  <div
                    key={i}
                    onClick={() => handleSendMessage(starter.prompt)}
                    className="p-3 rounded-[3px] bg-[#080c14] border border-slate-800/90 hover:border-blue-500/50 cursor-pointer transition group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono font-bold text-blue-400 group-hover:text-blue-300">
                        {starter.title}
                      </span>
                      <span className="text-[9.5px] font-mono text-slate-400">{starter.subtitle}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {starter.prompt}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Message History */}
              {activeSession.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.role === "user" ? "items-end" : "items-start"
                  } space-y-1`}
                >
                  {/* Sender Label & Meta */}
                  <div className="flex items-center gap-2 px-1 text-[10px] font-mono text-slate-400">
                    <span className="font-bold uppercase tracking-wider">
                      {msg.role === "user" ? "You" : "Verxl Assistant"}
                    </span>
                    <span>•</span>
                    <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    {msg.role === "assistant" && msg.metrics?.costUsd && (
                      <>
                        <span>•</span>
                        <span className="text-emerald-400 font-semibold font-mono">
                          -${Number(msg.metrics.costUsd || 0).toFixed(6)} USD
                        </span>
                      </>
                    )}
                  </div>

                  {/* Message Bubble Card */}
                  <div
                    className={`max-w-[92%] sm:max-w-[82%] rounded-[4px] p-3.5 sm:p-4 text-xs font-mono leading-relaxed select-text ${
                      msg.role === "user"
                        ? "bg-[#0c1729] border border-blue-500/30 text-slate-100 shadow-md"
                        : "bg-[#080c14] border border-slate-800/90 text-slate-200 shadow-lg w-full"
                    }`}
                  >
                    {/* Collapsible Reasoning Process Accordion */}
                    {msg.reasoning && (
                      <div className="mb-3 rounded-[3px] bg-[#04060a] border border-slate-800/80 overflow-hidden">
                        <button
                          onClick={() => toggleReasoning(msg.id)}
                          className="w-full px-2.5 py-1.5 flex items-center justify-between text-[10px] font-mono text-slate-400 hover:text-slate-200 bg-slate-900/40 border-b border-slate-800/40 transition"
                        >
                          <div className="flex items-center gap-1.5 text-blue-400">
                            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
                            <span className="font-bold uppercase tracking-wider">
                              Reasoning Trace / Chain-of-Thought
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-[9px] text-slate-400">
                            <span>{expandedReasoningIds[msg.id] ? "Collapse" : "Expand"}</span>
                            {expandedReasoningIds[msg.id] ? (
                              <ChevronDown className="w-3 h-3" />
                            ) : (
                              <ChevronRight className="w-3 h-3" />
                            )}
                          </div>
                        </button>
                        {expandedReasoningIds[msg.id] && (
                          <div className="p-3 text-[11px] font-mono text-slate-400 italic whitespace-pre-wrap leading-relaxed border-t border-slate-800/40">
                            {msg.reasoning}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Formatted Markdown Content */}
                    <div
                      className="terminal-markdown select-text"
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                    />

                    {/* Assistant Telemetry Footer */}
                    {msg.role === "assistant" && msg.metrics && (
                      <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-slate-400 select-none">
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-400 font-semibold">
                            Cost: -${(msg.metrics.costUsd || 0).toFixed(6)}
                          </span>
                          <span>•</span>
                          <span>Prompt: {msg.metrics.promptTokens}</span>
                          <span>•</span>
                          <span>Tokens: {msg.metrics.completionTokens}</span>
                          <span>•</span>
                          <span>{msg.metrics.tps} TPS</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => copyMessage(msg.id, msg.content)}
                            className="flex items-center gap-1 hover:text-white transition"
                            title="Copy message"
                          >
                            {copiedMessageId === msg.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleSendMessage(msg.content)}
                            className="flex items-center gap-1 hover:text-white transition"
                            title="Regenerate from this point"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>Retry</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Real-time Streaming Message */}
              {isStreaming && (
                <div className="flex flex-col items-start space-y-1 w-full">
                  <div className="flex items-center gap-2 px-1 text-[10px] font-mono text-blue-400">
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                    <span className="font-bold uppercase tracking-wider">
                      Streaming from Edge Node...
                    </span>
                  </div>

                  <div className="w-full max-w-[85%] rounded-[4px] p-4 text-xs font-mono leading-relaxed bg-[#080c14] border border-blue-500/30 text-slate-200 shadow-xl">
                    {/* Live Streaming Reasoning */}
                    {streamingReasoning && (
                      <div className="mb-3 rounded-[3px] bg-[#04060a] border border-blue-500/20 p-2.5">
                        <div className="text-[9.5px] uppercase tracking-wider text-blue-400 font-bold mb-1 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                          <span>Generating Reasoning Protocol...</span>
                        </div>
                        <div className="text-slate-400 font-mono italic whitespace-pre-wrap text-[10.5px]">
                          {streamingReasoning}
                        </div>
                      </div>
                    )}

                    {/* Live Streaming Markdown */}
                    {streamingContent ? (
                      <div>
                        <div
                          className="terminal-markdown select-text"
                          dangerouslySetInnerHTML={{ __html: renderMarkdown(streamingContent) }}
                        />
                        <span className="inline-block w-2 h-3.5 bg-blue-400 ml-0.5 mt-1 animate-pulse align-middle" />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-slate-400 text-xs py-1">
                        <div className="w-3.5 h-3.5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                        <span>Awaiting first token chunk from Prague cluster...</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Box Footer Container */}
        <div className="p-3 sm:p-4 border-t border-slate-800 bg-[#080c14]/90 shrink-0">
          <div className="max-w-4xl mx-auto space-y-2">
            {/* Input Form */}
            <div className="relative flex items-end gap-2 bg-[#05070b] border border-slate-700/80 focus-within:border-blue-500 rounded-[4px] p-2 transition shadow-inner">
              <textarea
                ref={textareaRef}
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Ask Verxl compute anything... (Shift+Enter for newline, Enter to send)"
                rows={1}
                disabled={isStreaming}
                className="flex-1 bg-transparent border-none text-xs sm:text-sm text-slate-100 placeholder-slate-400 outline-none resize-none font-mono py-1 px-1.5 leading-relaxed max-h-44"
              />

              {/* Action Button: Send or Stop */}
              {isStreaming ? (
                <button
                  onClick={handleStopGeneration}
                  className="p-2 rounded-[3px] bg-rose-600 hover:bg-rose-500 text-white transition shrink-0 active:scale-95"
                  title="Halt streaming"
                >
                  <Square className="w-4 h-4 fill-current" />
                </button>
              ) : (
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputPrompt.trim()}
                  className={`p-2 rounded-[3px] transition shrink-0 ${
                    inputPrompt.trim()
                      ? "bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/30 active:scale-95 cursor-pointer"
                      : "bg-slate-800 text-slate-400 cursor-not-allowed"
                  }`}
                  title="Send Message"
                >
                  <Send className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Input Status & Cost Preview Bar */}
            <div className="flex flex-wrap items-center justify-between text-[10px] font-mono text-slate-400 px-1">
              <div className="flex items-center gap-2">
                <span>50 bps Protocol Fee</span>
                <span>•</span>
                <span>
                  Est. Cost: ~${((Math.max(1, inputPrompt.length / 4) / 1e6) * 0.15).toFixed(6)} USD
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span>Account: ${balanceUsd.toFixed(4)} USD</span>
                <span>•</span>
                <button
                  onClick={() => setShowDepositModal(true)}
                  className="text-blue-400 hover:text-blue-300 underline transition"
                >
                  Add Funds
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ============================================================== */}
      {/* 3. DEPOSIT MODAL WITH 1-CLICK WEB3 & ANTI-SNATCHING SECURITY   */}
      {/* ============================================================== */}
      {showDepositModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm select-none">
          <div className="bg-[#0a0e17] border border-blue-500/40 rounded-[4px] max-w-md w-full p-5 space-y-4 shadow-2xl relative font-mono text-xs">
            <button
              onClick={() => {
                setShowDepositModal(false);
                setDepositStatus(null);
              }}
              className="absolute top-3 right-3 text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 text-white">
              <Coins className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider">
                  Deposit Arbitrum USDC / Add Balance
                </h3>
                <p className="text-[10px] text-slate-400">
                  Prepaid clearing with 50 bps protocol fee on Arbitrum One
                </p>
              </div>
            </div>

            {/* Deposit Tabs: 1-Click vs Manual */}
            <div className="flex border-b border-slate-800">
              <button
                onClick={() => {
                  setDepositTab("1click");
                  setDepositStatus(null);
                }}
                className={`flex-1 py-1.5 text-center text-xs font-semibold flex items-center justify-center gap-1.5 transition border-b-2 ${
                  depositTab === "1click"
                    ? "border-emerald-400 text-emerald-300 bg-emerald-500/10"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>1-Click MetaMask (Instant)</span>
              </button>
              <button
                onClick={() => {
                  setDepositTab("manual");
                  setDepositStatus(null);
                }}
                className={`flex-1 py-1.5 text-center text-xs font-semibold flex items-center justify-center gap-1.5 transition border-b-2 ${
                  depositTab === "manual"
                    ? "border-blue-500 text-blue-400 bg-blue-500/10"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>Manual Tx Hash</span>
              </button>
            </div>

            {/* Tab 1: 1-Click MetaMask Deposit */}
            {depositTab === "1click" && (
              <div className="space-y-3">
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Fastest & most secure: transfers USDC directly on <span className="text-blue-300 font-semibold">Arbitrum One</span> and signs a zero-gas cryptographic proof so <span className="text-emerald-300 font-semibold">no front-running bot can steal your deposit</span>.
                </p>

                {/* Amount Presets */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                    Select USDC Amount:
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[1, 5, 10, 25].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => {
                          setDepositAmountPreset(amt);
                          setCustomDepositAmount("");
                        }}
                        className={`py-1.5 rounded-[3px] font-mono text-xs font-bold transition border ${
                          depositAmountPreset === amt && !customDepositAmount
                            ? "bg-emerald-600/30 border-emerald-400 text-emerald-300 shadow-sm"
                            : "bg-[#05070b] border-slate-800 text-slate-300 hover:border-slate-600"
                        }`}
                      >
                        ${amt}
                      </button>
                    ))}
                  </div>
                  <div className="pt-1">
                    <input
                      type="number"
                      step="0.5"
                      min="0.1"
                      placeholder="Or enter custom amount in USD..."
                      value={customDepositAmount}
                      onChange={(e) => setCustomDepositAmount(e.target.value)}
                      className="w-full bg-[#05070b] border border-slate-800 rounded-[3px] p-2 text-xs text-white outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>

                {/* 1-Click Button */}
                <button
                  type="button"
                  onClick={handle1ClickWeb3Deposit}
                  disabled={isDepositingWeb3}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white font-bold tracking-wider uppercase text-xs rounded-[3px] transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
                >
                  <Wallet className="w-4 h-4" />
                  <span>
                    {isDepositingWeb3
                      ? "Processing Deposit..."
                      : `Deposit $${(customDepositAmount ? parseFloat(customDepositAmount) || 0 : depositAmountPreset).toFixed(2)} USDC via MetaMask`}
                  </span>
                </button>
              </div>
            )}

            {/* Tab 2: Manual Tx Hash */}
            {depositTab === "manual" && (
              <div className="space-y-3">
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Sent from an external wallet or exchange? Enter the transaction hash. A zero-gas signature from your sending wallet will be requested to guarantee ownership.
                </p>

                {/* Treasury Address */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-slate-400">
                    Verxl Treasury Deposit Address (Arbitrum One USDC):
                  </label>
                  <div className="flex items-center justify-between bg-[#05070b] border border-slate-800 p-2 rounded-[3px]">
                    <span className="font-mono text-[10.5px] text-blue-300 truncate max-w-[270px]">
                      {TREASURY_WALLET}
                    </span>
                    <button
                      onClick={copyTreasury}
                      className="p-1 text-slate-400 hover:text-white transition"
                      title="Copy address"
                    >
                      {copiedTreasury ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-slate-400">
                    Arbitrum Transaction Hash:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="0x..."
                      value={depositTxHash}
                      onChange={(e) => setDepositTxHash(e.target.value)}
                      className="flex-1 bg-[#05070b] border border-slate-800 rounded-[3px] px-2 py-1.5 text-xs text-white outline-none focus:border-blue-500 font-mono"
                    />
                    <button
                      onClick={handleVerifyDeposit}
                      disabled={verifyingDeposit || !depositTxHash.trim()}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white rounded-[3px] font-bold tracking-wider text-[11px] transition"
                    >
                      {verifyingDeposit ? "Verifying..." : "Verify"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Status Message */}
            {depositStatus && (
              <div className="text-[10.5px] text-amber-300 bg-amber-500/10 border border-amber-500/30 p-2.5 rounded-[2px] leading-relaxed">
                {depositStatus}
              </div>
            )}

            {/* Already have an account prompt */}
            <div className="pt-2 border-t border-slate-800/80 text-center">
              <p className="text-[10.5px] text-slate-400">
                Already have an account or API key?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setShowDepositModal(false);
                    setShowAuthModal(true);
                  }}
                  className="text-blue-400 hover:text-blue-300 underline font-semibold transition"
                >
                  Sign In with API Key or Email
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. SETTINGS & PERSONA MODAL                                    */}
      {/* ============================================================== */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
          <div className="bg-[#0a0e17] border border-blue-500/40 rounded-[4px] max-w-lg w-full p-5 space-y-4 shadow-2xl relative font-mono text-xs">
            <button
              onClick={() => setShowSettingsModal(false)}
              className="absolute top-3 right-3 text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 text-white">
              <Settings className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider">
                System Persona & API Configuration
              </h3>
            </div>

            {/* System Prompt Customizer */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider text-slate-400">
                System Prompt (Persona Definition):
              </label>
              <textarea
                value={activeSession?.systemPrompt || DEFAULT_SYSTEM_PROMPT}
                onChange={(e) => {
                  const val = e.target.value;
                  setSessions((prev) =>
                    prev.map((s) => (s.id === activeSession.id ? { ...s, systemPrompt: val } : s))
                  );
                }}
                rows={4}
                className="w-full bg-[#05070b] border border-slate-800 rounded-[3px] p-2 text-xs text-white outline-none focus:border-blue-500 font-mono resize-none"
              />
            </div>

            {/* Custom API Key Override */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <label className="text-[10px] uppercase tracking-wider text-slate-400">
                Optional: Custom Verxl API Key (vrxl_live_...):
              </label>
              <input
                type="password"
                placeholder="vrxl_live_..."
                value={customApiKey}
                onChange={(e) => {
                  setCustomApiKey(e.target.value);
                  localStorage.setItem("vrxl_custom_api_key", e.target.value);
                }}
                className="w-full bg-[#05070b] border border-slate-800 rounded-[3px] px-2.5 py-1.5 text-xs text-white outline-none focus:border-blue-500 font-mono"
              />
              <p className="text-[9.5px] text-slate-400">
                If provided, inferences will be billed against this specific API key.
              </p>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
              {onNavigate ? (
                <button
                  type="button"
                  onClick={() => {
                    setShowSettingsModal(false);
                    onNavigate("api");
                  }}
                  className="text-blue-400 hover:text-blue-300 underline text-[11px] font-semibold"
                >
                  Manage API Keys &rarr;
                </button>
              ) : (
                <div />
              )}
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-[3px] font-bold tracking-wider"
              >
                Save & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. SHARED AUTH & LOGIN MODAL (API KEY & EMAIL OTP)            */}
      {/* ============================================================== */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm select-none">
          <div className="bg-[#0a0e17] border border-blue-500/40 rounded-[4px] max-w-md w-full p-6 space-y-4 shadow-2xl relative font-mono text-xs">
            <button
              onClick={() => {
                setShowAuthModal(false);
                setAuthError(null);
                setAuthSuccess(null);
              }}
              className="absolute top-3 right-3 text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 text-white">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider">
                  Verxl Account Login
                </h3>
                <p className="text-[10px] text-slate-400">
                  Shared across Interactive Chat and Developer API
                </p>
              </div>
            </div>

            {/* Tabs: MetaMask (Primary) vs Email (Optional) vs API Key */}
            <div className="flex border-b border-slate-800">
              <button
                onClick={() => {
                  setAuthTab("wallet");
                  setAuthError(null);
                  setAuthSuccess(null);
                }}
                className={`flex-1 py-2 text-center text-xs font-semibold flex items-center justify-center gap-1.5 transition border-b-2 ${
                  authTab === "wallet"
                    ? "border-emerald-400 text-emerald-300 bg-emerald-500/10"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>MetaMask</span>
              </button>
              <button
                onClick={() => {
                  setAuthTab("email");
                  setAuthError(null);
                  setAuthSuccess(null);
                }}
                className={`flex-1 py-2 text-center text-xs font-semibold flex items-center justify-center gap-1.5 transition border-b-2 ${
                  authTab === "email"
                    ? "border-blue-500 text-blue-400 bg-blue-500/10"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email (Optional)</span>
              </button>
              <button
                onClick={() => {
                  setAuthTab("key");
                  setAuthError(null);
                  setAuthSuccess(null);
                }}
                className={`flex-1 py-2 text-center text-xs font-semibold flex items-center justify-center gap-1.5 transition border-b-2 ${
                  authTab === "key"
                    ? "border-blue-500 text-blue-400 bg-blue-500/10"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>API Key</span>
              </button>
            </div>

            {/* Error / Success Banners */}
            {authError && (
              <div className="text-[11px] text-rose-300 bg-rose-500/10 border border-rose-500/30 p-2.5 rounded-[2px]">
                {authError}
              </div>
            )}
            {authSuccess && (
              <div className="text-[11px] text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 p-2.5 rounded-[2px]">
                {authSuccess}
              </div>
            )}

            {/* Tab: MetaMask Web3 Login */}
            {authTab === "wallet" && (
              <div className="space-y-3 pt-1">
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Connect your Web3 MetaMask wallet directly. Account creation, balance recovery, and PostgreSQL chat persistence are instantaneous and permissionless. Email is optional for notifications or secondary 2FA.
                </p>
                <button
                  type="button"
                  onClick={async () => {
                    if (typeof window !== "undefined" && (window as any).ethereum) {
                      try {
                        setAuthError(null);
                        setAuthSuccess("Connecting MetaMask...");
                        const eth = (window as any).ethereum;
                        const [account] = await eth.request({ method: "eth_requestAccounts" });
                        if (account) {
                          const res = await loginWithWallet(account);
                          if (res.success) {
                            setAuthSuccess(`Welcome! Connected wallet ${account.slice(0, 6)}...${account.slice(-4)}.`);
                            setTimeout(() => setShowAuthModal(false), 1200);
                          } else {
                            setAuthError(res.error || "Wallet authentication failed.");
                            setAuthSuccess(null);
                          }
                        }
                      } catch (err: any) {
                        setAuthError(err.message || "MetaMask connection was cancelled.");
                        setAuthSuccess(null);
                      }
                    } else {
                      setAuthError("MetaMask extension not detected in this browser.");
                    }
                  }}
                  className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold tracking-wider uppercase text-xs rounded-[3px] transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
                >
                  <Wallet className="w-4 h-4" />
                  <span>Connect MetaMask Wallet</span>
                </button>
              </div>
            )}

            {/* Tab 1: API Key Login */}
            {authTab === "key" && (
              <form onSubmit={handleAuthModalLoginWithApiKey} className="space-y-3">
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Log in instantaneously using your private production key (<span className="text-blue-300 font-mono">vrxl_live_...</span>). Your account, USDC balance, and history load instantly without email.
                </p>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                    Production API Key:
                  </label>
                  <input
                    type="password"
                    placeholder="vrxl_live_..."
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    className="w-full bg-[#05070b] border border-slate-800 rounded-[3px] p-2 text-xs text-white outline-none focus:border-blue-500 font-mono"
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  disabled={authLoading || !apiKeyInput.trim()}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white font-bold tracking-wider uppercase text-xs rounded-[3px] transition flex items-center justify-center gap-2"
                >
                  {authLoading ? "Authenticating..." : "Authenticate with Key"}
                </button>
              </form>
            )}

            {/* Tab 2: Email OTP Login */}
            {authTab === "email" && (
              <div className="space-y-3">
                {!otpSent ? (
                  <form onSubmit={handleAuthModalSendOtp} className="space-y-3">
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Enter your email address to receive a 6-digit one-time access code.
                    </p>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                        Email Address:
                      </label>
                      <input
                        type="email"
                        placeholder="you@domain.com"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        className="w-full bg-[#05070b] border border-slate-800 rounded-[3px] p-2 text-xs text-white outline-none focus:border-blue-500 font-mono"
                        autoFocus
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={authLoading || !emailInput.trim()}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white font-bold tracking-wider uppercase text-xs rounded-[3px] transition flex items-center justify-center gap-2"
                    >
                      {authLoading ? "Sending Code..." : "Send Verification Code"}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleAuthModalVerifyOtp} className="space-y-3">
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Enter the 6-digit code sent to <span className="text-white font-semibold">{emailInput}</span>.
                    </p>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                        6-Digit Verification Code:
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="123456"
                        value={otpInput}
                        onChange={(e) => setOtpInput(e.target.value)}
                        className="w-full bg-[#05070b] border border-slate-800 rounded-[3px] p-2 text-center text-lg tracking-[0.3em] text-white outline-none focus:border-blue-500 font-mono font-bold"
                        autoFocus
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setOtpSent(false);
                          setOtpInput("");
                        }}
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-[3px] transition"
                      >
                        Change Email
                      </button>
                      <button
                        type="submit"
                        disabled={authLoading || otpInput.trim().length !== 6}
                        className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white font-bold tracking-wider uppercase text-xs rounded-[3px] transition"
                      >
                        {authLoading ? "Verifying..." : "Verify & Sign In"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
