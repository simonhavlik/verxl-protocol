import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { marked } from "marked";
import "katex/dist/katex.min.css";
import markedKatex from "marked-katex-extension";
import {
  deriveChatKey,
  encryptChatPayload,
  decryptChatPayload,
  hasWalletProvider,
  getCachedChatKey,
  clearChatKeyCache,
  type ChatPlaintext,
} from "../lib/chatCrypto";
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
  ShieldCheck,
  Search,
  Wallet,
  Clock,
  Sparkles,
  Server,
  Lock,
  Globe,
  ArrowDown,
  Paperclip,
  FileText,
  Pencil,
} from "lucide-react";

marked.use(markedKatex({ throwOnError: false }));

marked.setOptions({
  gfm: true,
  breaks: true,
});

const VegaChart = ({ spec }: { spec: any }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const mod = await import("vega-embed");
        if (!cancelled && ref.current) {
          await mod.default(ref.current, spec, { actions: false, renderer: "svg" });
        }
      } catch {}
    })();
    return () => {
      cancelled = true;
      if (ref.current) ref.current.innerHTML = "";
    };
  }, [spec]);
  return <div ref={ref} className="mt-3 w-full overflow-x-auto bg-[#05070b] border border-slate-800 p-2" />;
};

const renderMarkdown = (content: string): string => {
  if (!content) return "";
  try {
    const preprocessed = content.replace(/\*\*([^\s*][^*]*?)\*\*([a-zA-Z0-9])/g, "**$1** $2");
    return marked.parse(preprocessed) as string;
  } catch {
    return content;
  }
};

interface ContextStats {
  limit: number;
  system: number;
  tools: number;
  history: number;
  prompt: number;
  format: number;
  response: number;
  used: number;
  left: number;
  compactionSaved: number;
}

interface MessageMetrics {
  promptTokens?: number;
  completionTokens?: number;
  costUsd?: number;
  ttftMs?: number;
  tps?: number;
  provider?: string;
  failed?: boolean;
  context?: ContextStats;
}

interface SearchSource {
  title: string;
  url: string;
  description?: string;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  reasoning?: string;
  sources?: SearchSource[];
  charts?: any[];
  createdAt: number;
  metrics?: MessageMetrics;
}

type ThinkLevel = "off" | "low" | "medium" | "high";

interface ChatSession {
  id: string;
  title: string;
  model: string;
  think?: ThinkLevel;
  searchBudget?: number;
  temperature?: number;
  searchTool?: boolean;
  searchProvider?: string;
  searchBaseUrl?: string;
  searchKey?: string;
  chartTool?: boolean;
  pdfOcrEnabled?: boolean;
  forcePdfOcr?: boolean;
  showForcePdfOcrToggle?: boolean;
  compaction?: { summary: string; throughId: string; at: number };
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

const CHAT_STORAGE_KEY = "vrxl_chat_sessions_v2";

const readLocalChatSessions = (): ChatSession[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((s: any) => s && typeof s.id === "string" && Array.isArray(s.messages))
      .map((s: any) => ({
        id: s.id,
        title: typeof s.title === "string" ? s.title : "New Chat",
        model: typeof s.model === "string" ? s.model : "qwen3.5-4b-uncensored-32k",
        messages: s.messages,
        createdAt: Number(s.createdAt) || Date.now(),
        updatedAt: Number(s.updatedAt) || Date.now(),
      }));
  } catch {
    return [];
  }
};

export interface ModelConfig {
  id: string;
  name: string;
  tag: string;
  category: "all" | "1m" | "reasoning" | "bare-metal" | "official-bridge";
  promptRate: number;
  cachedPromptRate: number;
  completionRate: number;
  specialHoursPromptRate?: number | null;
  specialHoursCompletionRate?: number | null;
  specialHoursDesc?: string | null;
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
    name: "Bulbasaur Qwen 3.5 4B Uncensored (32K)",
    tag: "Bare-Metal Resident Node",
    category: "bare-metal",
    promptRate: 0.05,
    cachedPromptRate: 0.010,
    completionRate: 0.10,
    specialHoursPromptRate: null,
    specialHoursCompletionRate: null,
    specialHoursDesc: null,
    context: "32,768 tokens (32K)",
    contextTokens: 32768,
    speed: "~52 TPS",
    provider: "Prague Node 01 (Bulbasaur Bare-Metal)",
    isOfficialBridge: false,
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
    id: "mimo-v2.6-flash",
    name: "Xiaomi MiMo v2.6 Flash (1M)",
    tag: "High-Concurrency Systems Engine",
    category: "official-bridge",
    promptRate: 0.14,
    cachedPromptRate: 0.0028,
    completionRate: 0.28,
    specialHoursPromptRate: null,
    specialHoursCompletionRate: null,
    specialHoursDesc: null,
    context: "1,000,000 tokens (1M)",
    contextTokens: 1000000,
    speed: "~60 TPS",
    provider: "Xiaomi Official Bridge (Frankfurt)",
    isOfficialBridge: true,
    description: "Official Xiaomi MiMo v2.6 Flash with 1M resident context, sub-85ms TTFT, and 99% prompt cache discount.",
  },
];

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
    loginWithToken,
    loginWithWallet,
  } = useAuth();

  const balanceUsd = user ? Number(user.balance_usd) : 0.0;

  // Auth Modal State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState<"email" | "wallet">("wallet");
  const [emailInput, setEmailInput] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [chatKey, setChatKey] = useState<CryptoKey | null>(null);
  const [cryptoStatus, setCryptoStatus] = useState<"locked" | "unlocking" | "ready" | "unavailable">("locked");
  const [cryptoError, setCryptoError] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [searchEnabled, setSearchEnabled] = useState(false);
  const [chartToolEnabled, setChartToolEnabled] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("vrxl_chart_tool") === "1";
  });
  const [attachments, setAttachments] = useState<{ name: string; text: string; kind: string }[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchToolEnabled, setSearchToolEnabled] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("vrxl_search_tool") === "1";
  });
  const [temperature, setTemperature] = useState(0.7);
  const [searchProvider, setSearchProvider] = useState(() => {
    if (typeof window === "undefined") return "firecrawl";
    return localStorage.getItem("vrxl_search_provider") || "firecrawl";
  });
  const [searchKey, setSearchKey] = useState(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("vrxl_search_key") || "";
  });
  const [forcePdfOcr, setForcePdfOcr] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("vrxl_force_pdf_ocr") === "1";
  });
  const [showForcePdfOcrToggle, setShowForcePdfOcrToggle] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("vrxl_show_force_pdf_ocr") === "1";
  });
  const [searchBaseUrl, setSearchBaseUrl] = useState(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("vrxl_search_base") || "";
  });

  const runSearch = async (query: string): Promise<SearchSource[]> => {
    const q = query.slice(0, 400);
    if (searchProvider === "brave") {
      if (!searchKey) throw new Error("Brave Search API key is missing.");
      const r = await fetch(
        `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(q)}&count=5`,
        { headers: { Accept: "application/json", "X-Subscription-Token": searchKey } }
      );
      const d = (await r.json()) as any;
      return (d.web?.results || [])
        .map((x: any) => ({ title: String(x.title || x.url || ""), url: String(x.url || ""), description: String(x.description || "").replace(/\s+/g, " ") }))
        .filter((x: SearchSource) => x.url);
    }
    if (searchProvider === "exa") {
      if (!searchKey) throw new Error("Exa API key is missing.");
      const r = await fetch("https://api.exa.ai/search", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": searchKey },
        body: JSON.stringify({ query: q, numResults: 5, contents: { text: { maxCharacters: 1000 } } }),
      });
      const d = (await r.json()) as any;
      return (d.results || [])
        .map((x: any) => ({ title: String(x.title || x.url || ""), url: String(x.url || ""), description: String(x.text || "").replace(/\s+/g, " ") }))
        .filter((x: SearchSource) => x.url);
    }
    if (searchProvider === "custom") {
      if (!searchBaseUrl) throw new Error("Custom search base URL is missing.");
      const r = await fetch(searchBaseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(searchKey ? { Authorization: `Bearer ${searchKey}` } : {}),
        },
        body: JSON.stringify({ query: q, limit: 5 }),
      });
      const d = (await r.json()) as any;
      const arr = d.data?.web || d.web?.results || d.results || d.web || d.data || [];
      return (Array.isArray(arr) ? arr : [])
        .map((x: any) => ({ title: String(x.title || x.url || ""), url: String(x.url || ""), description: String(x.description || x.text || "").replace(/\s+/g, " ") }))
        .filter((x: SearchSource) => x.url);
    }
    const r = await fetch("https://api.firecrawl.dev/v2/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: q, limit: 5 }),
    });
    const d = (await r.json()) as any;
    return (d.data?.web || [])
      .slice(0, 5)
      .map((x: any) => ({ title: String(x.title || x.url || ""), url: String(x.url || ""), description: String(x.description || "").replace(/\s+/g, " ") }))
      .filter((x: SearchSource) => x.url);
  };
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showContextDetails, setShowContextDetails] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const autoScrollRef = useRef(true);

  // Session State - Stored in PostgreSQL, bound to user account, cleared on logout
  const createBlankSession = (): ChatSession => ({
    id: `chat_${Date.now()}`,
    title: "New Chat",
    model: "qwen3.5-4b-uncensored-32k",
    temperature:
      typeof window !== "undefined" && localStorage.getItem("vrxl_chat_temperature") !== null
        ? Number(localStorage.getItem("vrxl_chat_temperature"))
        : 0.7,
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const local = readLocalChatSessions();
    return local.length > 0 ? local : [createBlankSession()];
  });
  const [activeSessionId, setActiveSessionId] = useState<string>(sessions[0].id);
  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];
  const currentModelConfig =
    AVAILABLE_MODELS.find((m) => m.id === activeSession.model) || AVAILABLE_MODELS[0];
  const fmtTokens = (n: number) =>
    n >= 1000 ? `${(n / 1000).toFixed(1)}K` : `${Math.max(0, Math.round(n))}`;
  const lastAssistantContext = [...activeSession.messages]
    .reverse()
    .find((m) => m.role === "assistant" && m.metrics?.context)?.metrics?.context;
  const contextLimit = currentModelConfig.contextTokens;
  const estimateContext = (): ContextStats => {
    const compaction = activeSession.compaction;
    const boundaryIdx = compaction
      ? activeSession.messages.findIndex((m) => m.id === compaction.throughId)
      : -1;
    const recent =
      boundaryIdx >= 0 ? activeSession.messages.slice(boundaryIdx + 1) : activeSession.messages;
    const system = compaction ? Math.ceil(compaction.summary.length / 4) : 0;
    const history = Math.ceil(recent.reduce((n, m) => n + m.content.length + 8, 0) / 4);
    const used = system + history;
    return {
      limit: contextLimit,
      system,
      tools: 0,
      history,
      prompt: 0,
      format: 0,
      response: 0,
      used,
      left: Math.max(0, contextLimit - used),
      compactionSaved: 0,
    };
  };
  const contextStats: ContextStats = lastAssistantContext
    ? {
        ...lastAssistantContext,
        limit: contextLimit,
        left: Math.max(0, contextLimit - lastAssistantContext.used),
      }
    : estimateContext();
  const compactSafety = Math.max(2048, (activeSession.searchBudget || 512) + 512);
  const compactAt = currentModelConfig.isOfficialBridge
    ? null
    : currentModelConfig.contextTokens - 4096 - compactSafety;
  const sessionsRef = useRef(sessions);
  sessionsRef.current = sessions;

  useEffect(() => {
    const savedTemp = Number(localStorage.getItem("vrxl_chat_temperature"));
    setTemperature(
      activeSession.temperature ?? (Number.isFinite(savedTemp) ? savedTemp : 0.7)
    );
    setSearchToolEnabled(
      activeSession.searchTool ?? localStorage.getItem("vrxl_search_tool") === "1"
    );
    setSearchProvider(
      activeSession.searchProvider ?? localStorage.getItem("vrxl_search_provider") ?? "firecrawl"
    );
    setSearchBaseUrl(activeSession.searchBaseUrl ?? localStorage.getItem("vrxl_search_base") ?? "");
    setSearchKey(activeSession.searchKey ?? localStorage.getItem("vrxl_search_key") ?? "");
    setChartToolEnabled(activeSession.chartTool ?? localStorage.getItem("vrxl_chart_tool") === "1");
    setForcePdfOcr(activeSession.forcePdfOcr ?? localStorage.getItem("vrxl_force_pdf_ocr") === "1");
    setShowForcePdfOcrToggle(
      activeSession.showForcePdfOcrToggle ?? localStorage.getItem("vrxl_show_force_pdf_ocr") === "1"
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSessionId]);

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

  const loadEncryptedConversations = async (key: CryptoKey) => {
    if (!authToken || !user) return;
    try {
      const res = await fetch("/api/chat/conversations", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (!res.ok) return;
      const data = (await res.json()) as any;
      const wallet = String((user as any)?.wallet_address || "").toLowerCase();
      const decrypted: ChatSession[] = [];

      for (const row of data.conversations || []) {
        if (!row.ciphertext || !row.keyId || String(row.keyId).toLowerCase() !== wallet) continue;
        try {
          const payload = await decryptChatPayload<ChatPlaintext>(row.ciphertext, key);
          decrypted.push({
            id: row.id,
            title: payload.title || "Encrypted chat",
            model: payload.model || "qwen3.5-4b-uncensored-32k",
            messages: Array.isArray(payload.messages) ? (payload.messages as ChatMessage[]) : [],
            createdAt: row.createdAt || Date.now(),
            updatedAt: row.updatedAt || Date.now(),
          });
        } catch {
          console.warn("Unable to decrypt conversation", row.id);
        }
      }

      if (decrypted.length > 0) {
        const local = sessionsRef.current;
        const byId = new Map(local.map((s) => [s.id, s]));
        for (const server of decrypted) {
          const cur = byId.get(server.id);
          if (!cur) {
            byId.set(server.id, server);
            continue;
          }
          if (cur.messages.length > 0 && server.messages.length === 0) continue;
          if (server.updatedAt >= cur.updatedAt) byId.set(server.id, server);
        }
        const merged = [...byId.values()].sort((a, b) => b.updatedAt - a.updatedAt);
        setSessions(merged);
        setActiveSessionId((prev) => (merged.some((s) => s.id === prev) ? prev : merged[0].id));
      }
    } catch (err) {
      console.warn("Failed to load encrypted conversations:", err);
    }
  };

  useEffect(() => {
    if (!authToken || !user) return;
    try {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(sessions));
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessions, authToken, user?.id]);

  const syncSessionToDb = async (sess: ChatSession, keyOverride?: CryptoKey) => {
    const key = keyOverride || chatKey;
    if (!authToken || !user || !key) return;
    const wallet = String((user as any)?.wallet_address || "");
    if (!wallet) return;
    try {
      const ciphertext = await encryptChatPayload(
        { title: sess.title, model: sess.model, messages: sess.messages },
        key
      );
      const send = () =>
        fetch("/api/chat/conversations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ id: sess.id, ciphertext, keyId: wallet.toLowerCase() }),
        });
      let res = await send();
      if (!res.ok && res.status >= 500) {
        await new Promise((r) => setTimeout(r, 700));
        res = await send();
      }
      if (!res.ok) {
        const detail = (await res.json().catch(() => ({}))) as any;
        setSyncError(
          `Cloud save failed (HTTP ${res.status})${detail?.error ? `: ${detail.error}` : ""}. Messages stay on this device.`
        );
      } else {
        setSyncError(null);
      }
    } catch (err) {
      setSyncError("Cloud save failed. Messages stay on this device.");
      console.warn("Failed to sync encrypted conversation:", err);
    }
  };

  const syncLocalSessions = async (key: CryptoKey) => {
    const localBefore = sessionsRef.current;
    await loadEncryptedConversations(key);
    for (const sess of localBefore) {
      if (sess.messages.length > 0 || sess.title !== "New Chat") {
        await syncSessionToDb(sess, key);
      }
    }
  };



  const unlockChatSync = async () => {
    const wallet = String((user as any)?.wallet_address || "");
    if (!authToken || !user || !wallet) {
      setCryptoStatus("unavailable");
      setCryptoError("Link a wallet to enable encrypted cloud sync.");
      return;
    }
    if (!hasWalletProvider()) {
      setCryptoStatus("locked");
      setCryptoError("MetaMask is not available. Enable it in this browser, then press Enable.");
      return;
    }

    setCryptoStatus("unlocking");
    setCryptoError(null);
    try {
      const key = await deriveChatKey(wallet, user.id);
      setChatKey(key);
      setCryptoStatus("ready");
      await syncLocalSessions(key);
    } catch (err: any) {
      setChatKey(null);
      setCryptoStatus("locked");
      setCryptoError(err?.message || "Could not unlock encrypted chat sync.");
    }
  };

  useEffect(() => {
    if (!authToken) {
      clearChatKeyCache();
      setChatKey(null);
      setCryptoStatus("locked");
      setCryptoError(null);
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem(CHAT_STORAGE_KEY);
        } catch {}
      }
      const blank = createBlankSession();
      setSessions([blank]);
      setActiveSessionId(blank.id);
      return;
    }
    if (!user) return;

    const wallet = String((user as any)?.wallet_address || "");
    if (!wallet) {
      setChatKey(null);
      setCryptoStatus("unavailable");
      setCryptoError("Link a wallet to enable encrypted cloud sync.");
      return;
    }
    if (!hasWalletProvider()) {
      setChatKey(null);
      setCryptoStatus("locked");
      setCryptoError("MetaMask is not available. Enable it in this browser, then press Enable.");
      return;
    }

    const cached = getCachedChatKey(wallet, user.id);
    if (cached) {
      setChatKey(cached);
      setCryptoStatus("ready");
      setCryptoError(null);
      void syncLocalSessions(cached);
    } else {
      // Login authenticates the account; the chat key is a separate wallet
      // signature. Request it immediately instead of presenting a dead lock.
      void unlockChatSync();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authToken, user?.id, (user as any)?.wallet_address]);

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
  const [streamingSessionId, setStreamingSessionId] = useState<string | null>(null);
  const activeStreaming = isStreaming && streamingSessionId === activeSessionId;
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
  const handleChatScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    autoScrollRef.current = atBottom;
    setShowScrollButton(!atBottom);
  };

  const scrollChatToLatest = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    autoScrollRef.current = true;
    setShowScrollButton(false);
  };

  useEffect(() => {
    if (scrollContainerRef.current && isStreaming && autoScrollRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [streamingContent, streamingReasoning, isStreaming]);

  useEffect(() => {
    autoScrollRef.current = true;
    setShowScrollButton(false);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [activeSessionId]);

  useEffect(() => {
    if (scrollContainerRef.current && autoScrollRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [activeSession?.messages.length]);

  // Create New Chat Session
  const createNewSession = () => {
    const newSession = createBlankSession();
    newSession.model = activeSession?.model || "qwen3.5-4b-uncensored-32k";
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
  const maybeCompactSession = (
    session: ChatSession,
    messages: ChatMessage[],
    model: ModelConfig
  ): ChatSession => {
    // Large-context bridges (1M) keep full history; compaction is for the 32K Qwen.
    if (model.contextTokens >= 40_000) return session;
    const outputReserve = model.isOfficialBridge ? 32768 : 4096;
    const safety = Math.max(2048, (session.searchBudget || 512) + 512);
    const normalThreshold = model.contextTokens - outputReserve - safety;
    // Max splits the window: conversation gets half, search fills the rest.
    const threshold = normalThreshold;
    const prior = session.compaction;
    const priorIdx = prior ? messages.findIndex((m) => m.id === prior.throughId) : -1;
    const recent = priorIdx >= 0 ? messages.slice(priorIdx + 1) : messages;
    const estimate = (summary: string, msgs: ChatMessage[]) =>
      Math.ceil((summary.length + msgs.reduce((n, m) => n + m.content.length + 8, 0)) / 4);

    if (estimate(prior?.summary || "", recent) <= threshold || messages.length <= 4) {
      return session;
    }

    let keep = 8;
    let summary = prior?.summary || "";
    let throughId = prior?.throughId || "";
    while (keep >= 2) {
      const cutoffIdx = messages.length - keep - 1;
      if (cutoffIdx < 0) break;
      const olderStart = priorIdx >= 0 ? priorIdx + 1 : 0;
      const older = messages.slice(olderStart, cutoffIdx + 1);
      const digest = older
        .map(
          (m) =>
            `${m.role === "user" ? "User" : "Assistant"}: ${m.content
              .replace(/\s+/g, " ")
              .slice(0, 600)}`
        )
        .join("\n");
      summary = [prior?.summary || "", digest].filter(Boolean).join("\n").slice(-7000);
      throughId = messages[cutoffIdx].id;
      if (estimate(summary, messages.slice(cutoffIdx + 1)) <= threshold) break;
      keep -= 2;
    }

    return {
      ...session,
      compaction: { summary, throughId, at: Date.now() },
      updatedAt: Date.now(),
    };
  };

  const handleFiles = async (files: File[]) => {
    if (!files.length) return;
    setIsParsing(true);
    setAttachmentError(null);
    for (const file of files) {
      try {
        if (file.size > 10 * 1024 * 1024) throw new Error(`${file.name} is over 10 MB`);
        let text = "";
        if (file.type.startsWith("image/")) {
          const { createWorker } = await import("tesseract.js");
          const worker = await createWorker("eng");
          const { data } = await worker.recognize(file);
          text = data.text;
          await worker.terminate();
        } else if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
          const pdfjs = await import("pdfjs-dist");
          // @ts-ignore Vite asset URL import
          const worker = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
          pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
          const doc = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
          let pdfTessWorker: any = null;
          const pageErrors: string[] = [];
          try {
            for (let i = 1; i <= Math.min(doc.numPages, 25); i++) {
              const page = await doc.getPage(i);
              const content = await page.getTextContent();
              const pageText = content.items.map((x: any) => x.str).join(" ").trim();
              if (!forcePdfOcr && pageText.length >= 80) {
                text += pageText + "\n";
                continue;
              }
              try {
                const viewport = page.getViewport({ scale: 2 });
                const canvas = document.createElement("canvas");
                canvas.width = Math.floor(viewport.width);
                canvas.height = Math.floor(viewport.height);
                const ctx = canvas.getContext("2d");
                if (!ctx) throw new Error("Canvas 2D unavailable");
                await (page as any).render({ canvasContext: ctx, viewport, canvas }).promise;
                const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
                if (!blob) throw new Error("Page render produced no image");
                if (!pdfTessWorker) {
                  const { createWorker } = await import("tesseract.js");
                  pdfTessWorker = await createWorker("eng");
                }
                const { data } = await pdfTessWorker.recognize(blob);
                text += data.text + "\n";
              } catch (ocrErr: any) {
                pageErrors.push(`page ${i}: ${ocrErr?.message || "OCR failed"}`);
                if (pageText) text += pageText + "\n";
              }
            }
            if (!text.trim() && pageErrors.length > 0) throw new Error(pageErrors[0]);
          } finally {
            if (pdfTessWorker) await pdfTessWorker.terminate();
          }
        } else if (file.name.toLowerCase().endsWith(".docx")) {
          const mammoth = await import("mammoth");
          const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
          text = result.value;
        } else {
          text = await file.text();
        }
        text = text.replace(/\s+/g, " ").trim().slice(0, 40000);
        if (!text) throw new Error(`${file.name}: no extractable text (scanned PDFs need OCR)`);
        setAttachments((prev) => [...prev, { name: file.name, text, kind: file.type }]);
      } catch (err: any) {
        setAttachmentError(err?.message || `Could not parse ${file.name}`);
      }
    }
    setIsParsing(false);
  };

  const handleSendMessage = async (
    promptOverride?: string,
    options?: { skipUserAppend?: boolean; session?: ChatSession }
  ) => {
    const targetSession = options?.session || activeSession;
    const promptText = (promptOverride || inputPrompt).trim();
    if (!promptText || isStreaming || isParsing) return;
    const attachmentText = attachments.map((a) => `[File: ${a.name}]\n${a.text}`).join("\n\n");
    const textToSend = attachmentText ? `${promptText}\n\nAttachments:\n${attachmentText}` : promptText;

    // Chat uses the signed-in session only. API keys are for external endpoints.
    const authorizationHeader = authToken ? `Bearer ${authToken}` : "";
    if (!authorizationHeader) {
      setShowAuthModal(true);
      return;
    }
    if (balanceUsd <= 0.0) {
      setShowDepositModal(true);
      return;
    }

    const userMessage: ChatMessage | null = options?.skipUserAppend
      ? null
      : {
          id: `msg_user_${Date.now()}`,
          role: "user",
          content: textToSend,
          createdAt: Date.now(),
        };

    // Regenerate and edit resend the existing truncated history, not a new turn.
    const updatedMessages = options?.skipUserAppend
      ? targetSession.messages
      : [...targetSession.messages, userMessage as ChatMessage];
    let newTitle = targetSession.title;
    if (targetSession.messages.length === 0) {
      newTitle = promptText.slice(0, 32) + (promptText.length > 32 ? "..." : "");
    }

    const currentModel = targetSession.model || "qwen3.5-4b-uncensored-32k";
    const selectedModelConfig =
      AVAILABLE_MODELS.find((m) => m.id === currentModel) || AVAILABLE_MODELS[0];
    const maxOutputTokens = selectedModelConfig.isOfficialBridge ? 32768 : 4096;
    const isSmallContext = selectedModelConfig.contextTokens < 40_000;
    // Compact only near the model's input limit; the full history stays visible.
    const compactedSession = maybeCompactSession(
      targetSession,
      updatedMessages,
      selectedModelConfig
    );
    const updatedUserSession: ChatSession = {
      ...compactedSession,
      title: newTitle,
      messages: updatedMessages,
      updatedAt: Date.now(),
    };

    setSessions((prev) =>
      prev.map((s) => (s.id === targetSession.id ? updatedUserSession : s))
    );
    syncSessionToDb(updatedUserSession);

    setInputPrompt("");
    setAttachments([]);
    setStreamingSessionId(targetSession.id);
    setIsStreaming(true);
    setStreamingContent("");
    setStreamingReasoning("");

    // Small-context models get an LLM-compacted search digest, never truncated snippets.
    let searchDigest = "";
    let sources: SearchSource[] = [];

    let charts: any[] = [];
    // Model-callable tools; >40K models only, each behind its own setting.
    if (
      currentModelConfig.contextTokens >= 40_000 &&
      (searchToolEnabled || chartToolEnabled)
    ) {
      setIsSearching(true);
      try {
        const tools: any[] = [];
        if (searchToolEnabled) {
          tools.push({
            type: "function",
            function: {
              name: "web_search",
              description: "Search the web for current information. Use only when the answer depends on recent events or facts that need live sources.",
              parameters: { type: "object", properties: { query: { type: "string" } }, required: ["query"] },
            },
          });
        }
        if (chartToolEnabled) {
          tools.push({
            type: "function",
            function: {
              name: "render_chart",
              description:
                "Render a Vega-Lite v5 chart inline in the chat. Provide a complete spec object with inline data. The tool returns usage information and also renders the chart for the user.",
              parameters: {
                type: "object",
                properties: {
                  spec: {
                    type: "object",
                    description:
                      "Complete Vega-Lite v5 JSON spec, including $schema, mark, encoding and inline data.values.",
                  },
                },
                required: ["spec"],
              },
            },
          });
        }
        const planRes = await fetch("/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: authorizationHeader },
          body: JSON.stringify({
            model: currentModel,
            messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
            stream: false,
            max_tokens: 1024,
            tools,
            tool_choice: "auto",
          }),
        });
        const planData = (await planRes.json()) as any;
        const calls = planData?.choices?.[0]?.message?.tool_calls || [];
        for (const call of calls) {
          if (call?.function?.name === "web_search") {
            let query = textToSend;
            try {
              query = JSON.parse(call.function.arguments || "{}").query || textToSend;
            } catch {}
            sources = await runSearch(String(query));
          }
          if (call?.function?.name === "render_chart") {
            try {
              const args = JSON.parse(call.function.arguments || "{}");
              if (args?.spec && typeof args.spec === "object") charts.push(args.spec);
            } catch {}
          }
        }
      } catch {}
      setIsSearching(false);
    }

    // Search from the browser IP, so the keyless Firecrawl limit applies per user.
    if (searchEnabled) {
      setIsSearching(true);
      setSearchError(null);
      try {
        sources = await runSearch(textToSend);
        if (isSmallContext && sources.length > 0) {
          const sourceText = sources
            .map((r, i) => `[${i + 1}] ${r.title}\n${r.url}\n${r.description}`)
            .join("\n\n");
          const mid = Math.ceil(sourceText.length / 2);
          const chunks = [sourceText.slice(0, mid), sourceText.slice(mid)].filter((c) => c.trim());
          const parts: string[] = [];
          for (const chunk of chunks) {
            try {
              const compactRes = await fetch("/v1/chat/completions", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: authorizationHeader },
                body: JSON.stringify({
                  model: currentModel,
                  messages: [
                    {
                      role: "user",
                      content: `Compact this web search excerpt for the question. Preserve facts, names, dates, numbers, and source numbers. Remove navigation and boilerplate. Be dense.\n\nQuestion: ${textToSend}\n\nExcerpt:\n${chunk}`,
                    },
                  ],
                  stream: false,
                  max_tokens: 1024,
                  temperature: 0.1,
                }),
              });
              const compactData = (await compactRes.json()) as any;
              const part = compactData?.choices?.[0]?.message?.content;
              if (part) parts.push(part);
            } catch {}
          }
          searchDigest = parts.join("\n\n");
        }
        if (sources.length === 0) setSearchError("No web results returned; answering without sources.");
      } catch {
        setSearchError("Web search unavailable; answering without sources.");
      } finally {
        setIsSearching(false);
        setSearchEnabled(false);
      }
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const startTime = performance.now();
    let firstTokenTime = 0;
    let accumulatedContent = "";
    let accumulatedReasoning = "";
    let tokenCount = 0;

    // Use the compaction boundary when present; the full history stays in the UI.
    const compaction = compactedSession.compaction;
    const boundaryIdx = compaction
      ? updatedMessages.findIndex((m) => m.id === compaction.throughId)
      : -1;
    const contextMessages =
      boundaryIdx >= 0 ? updatedMessages.slice(boundaryIdx + 1) : updatedMessages;
    const lastUserIndex = [...contextMessages].reverse().findIndex((m) => m.role === "user");
    const lastUserPos = lastUserIndex >= 0 ? contextMessages.length - 1 - lastUserIndex : -1;
    const searchContext = searchDigest
      ? `Web search digest compacted from ${sources.length} sources. Use it and cite [n]:\n${searchDigest}`
      : sources.length > 0
      ? `Web search results. Use them and cite [n] where relevant:\n${sources
          .map(
            (r, i) =>
              `[${i + 1}] ${r.title}\n${r.url}${r.description ? `\n${r.description}` : ""}`
          )
          .join("\n\n")}`
      : "";
    // No system turn. Compaction context is a user-level summary, never a system prompt.
    const apiMessages = [
      ...(compaction && boundaryIdx >= 0
        ? [{ role: "user", content: `Earlier conversation summary:\n${compaction.summary}` }]
        : []),
      ...contextMessages.map((m, i) => ({
        role: m.role,
        content:
          i === lastUserPos && searchContext
            ? `${searchContext}\n\nAnswer the question below using these results.\nQuestion: ${m.content}`
            : m.content,
      })),
      ...(charts.length > 0
        ? [
            {
              role: "user",
              content: `render_chart tool result: ${charts.length} Vega-Lite chart(s) rendered successfully in the chat. Refer to the rendered chart in your answer; do not paste the raw spec.`,
            },
          ]
        : []),
    ];
    const thinkLevel = targetSession.think || "medium";
    let requestFailed = false;

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
          temperature: targetSession.temperature ?? 0.7,
          max_tokens: maxOutputTokens,
          reasoning_effort: thinkLevel === "off" ? "none" : thinkLevel,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as any;
        const serverMessage = errorData?.error?.message || "";
        if (response.status === 402) {
          requestFailed = true;
          setShowDepositModal(true);
        }
        if (response.status === 401) {
          requestFailed = true;
          setShowAuthModal(true);
          throw new Error("Session expired. Sign in again with your wallet or email.");
        }
        throw new Error(serverMessage || `HTTP ${response.status}: Failed to generate response.`);
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
        requestFailed = true;
        accumulatedContent += `\n\n> [!WARNING]\n> **Inference Notice:** ${err.message || "Upstream bare-metal node cycling. Please retry."}`;
      }
    } finally {
      const totalLatency = Math.round(performance.now() - startTime);
      const estPromptTokens = Math.max(16, Math.ceil(JSON.stringify(apiMessages).length / 4));
      const estCompletionTokens = requestFailed ? 0 : Math.max(4, tokenCount);
      const computeCost =
        (estPromptTokens / 1e6) * selectedModelConfig.promptRate +
        (estCompletionTokens / 1e6) * selectedModelConfig.completionRate;
      const totalCost = requestFailed ? 0 : computeCost * 1.005; // 50 bps protocol fee

      const protocolTemplate =
        isSmallContext &&
        /\[Verxl Protocol Clearing Switch\]|Deterministic Probe:\s*Seed=42/i.test(
          accumulatedContent
        );
      const feeTemplate = /Verxl Fee|Aggregator Fee|Net Protocol Fee Savings|Fee Differential/i.test(
        accumulatedContent
      );
      const hasContent =
        accumulatedContent.trim().length > 0 &&
        !(protocolTemplate && sources.length > 0) &&
        !(isSmallContext && sources.length > 0 && feeTemplate && !/fee|verxl|protocol/i.test(textToSend));
      if (!hasContent) requestFailed = true;

      const tokenEst = (text: string) => Math.ceil(text.length / 4);
      const summaryText =
        compaction && boundaryIdx >= 0 ? `Summary: ${compaction.summary}\n` : "";
      const historyText =
        summaryText +
        contextMessages
          .filter((_, i) => i !== lastUserPos)
          .map((m) => `${m.role}: ${m.content}`)
          .join("\n");
      const promptText = contextMessages[lastUserPos]?.content || "";
      const contextStats: ContextStats = {
        limit: selectedModelConfig.contextTokens,
        system: 0,
        tools: tokenEst(searchContext),
        history: tokenEst(historyText),
        prompt: tokenEst(promptText),
        format: Math.max(
          0,
          estPromptTokens -
            0 -
            tokenEst(searchContext) -
            tokenEst(historyText) -
            tokenEst(promptText)
        ),
        response: estCompletionTokens,
        used: estPromptTokens + estCompletionTokens,
        left: Math.max(0, selectedModelConfig.contextTokens - estPromptTokens - estCompletionTokens),
        compactionSaved: compaction
          ? Math.max(0, tokenEst(JSON.stringify(updatedMessages)) - estPromptTokens)
          : 0,
      };

      const assistantMessage: ChatMessage = {
        id: `msg_asst_${Date.now()}`,
        role: "assistant",
        content: hasContent
          ? accumulatedContent
          : accumulatedReasoning
          ? "**No final answer was returned.** The model produced reasoning but the stream ended before the answer. Retry, or lower the think level."
          : "**No response was returned.** The upstream stream ended without content. Retry.",
        reasoning: accumulatedReasoning || undefined,
        sources: sources.length > 0 ? sources : undefined,
        charts: charts.length > 0 ? charts : undefined,
        createdAt: Date.now(),
        metrics: {
          promptTokens: estPromptTokens,
          completionTokens: estCompletionTokens,
          costUsd: totalCost,
          ttftMs: firstTokenTime || undefined,
          tps: Math.round((estCompletionTokens / (totalLatency / 1000)) * 10) / 10,
          provider: "Prague Node 01 (Bulbasaur Bare-Metal)",
          failed: requestFailed || undefined,
          context: contextStats,
        },
      };

      const updatedWithAssistant: ChatSession = {
        ...updatedUserSession,
        title: newTitle,
        messages: [...updatedMessages, assistantMessage],
        updatedAt: Date.now(),
      };

      setSessions((prev) =>
        prev.map((s) => (s.id === targetSession.id ? updatedWithAssistant : s))
      );
      syncSessionToDb(updatedWithAssistant);

      // Refresh balance from backend
      setTimeout(() => refreshSession(), 1000);

      setIsStreaming(false);
      setStreamingSessionId(null);
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

  const saveChatSettings = (patch: Partial<ChatSession>) => {
    const updated = { ...activeSession, ...patch, updatedAt: Date.now() };
    setSessions((prev) => prev.map((s) => (s.id === activeSession.id ? updated : s)));
    syncSessionToDb(updated);
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

  const copyTranscript = () => {
    const body = activeSession.messages
      .map((m) => `## ${m.role === "user" ? "User" : "Verxl Assistant"}\n\n${m.content}`)
      .join("\n\n---\n\n");
    navigator.clipboard.writeText(`# ${activeSession.title}\n\n${body}`);
    setCopiedMessageId("transcript");
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const regenerateFrom = (assistantId: string) => {
    if (isStreaming) return;
    const idx = activeSession.messages.findIndex((m) => m.id === assistantId);
    if (idx < 1) return;
    const kept = activeSession.messages.slice(0, idx);
    const lastUser = [...kept].reverse().find((m) => m.role === "user");
    if (!lastUser) return;
    const updated = { ...activeSession, messages: kept, updatedAt: Date.now() };
    setSessions((prev) => prev.map((s) => (s.id === activeSession.id ? updated : s)));
    syncSessionToDb(updated);
    handleSendMessage(lastUser.content, { skipUserAppend: true, session: updated });
  };

  const startEditMessage = (msg: ChatMessage) => {
    setEditingMessageId(msg.id);
    setEditingText(msg.content);
  };

  const saveEditedMessage = () => {
    const text = editingText.trim();
    if (!text || !editingMessageId) return;
    const idx = activeSession.messages.findIndex((m) => m.id === editingMessageId);
    if (idx < 0) return;
    const kept = activeSession.messages
      .slice(0, idx + 1)
      .map((m) => (m.id === editingMessageId ? { ...m, content: text } : m));
    const updated = { ...activeSession, messages: kept, updatedAt: Date.now() };
    setSessions((prev) => prev.map((s) => (s.id === activeSession.id ? updated : s)));
    setEditingMessageId(null);
    setEditingText("");
    syncSessionToDb(updated);
    handleSendMessage(text, { skipUserAppend: true, session: updated });
  };

  const updateSearchBudget = (budget: number) => {
    const updated = { ...activeSession, searchBudget: budget, updatedAt: Date.now() };
    setSessions((prev) => prev.map((s) => (s.id === activeSession.id ? updated : s)));
    syncSessionToDb(updated);
  };

  const updateThinkLevel = (level: ThinkLevel) => {
    const updated = { ...activeSession, think: level, updatedAt: Date.now() };
    setSessions((prev) => prev.map((s) => (s.id === activeSession.id ? updated : s)));
    syncSessionToDb(updated);
  };

  return (
    <div
      className="h-[calc(100vh-105px)] min-h-[580px] flex rounded-[4px] border border-blue-500/20 bg-[#05070b] overflow-hidden text-slate-100 font-sans shadow-2xl relative"
      onDragOver={(e) => {
        e.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={(e) => {
        if (e.currentTarget === e.target) setDragActive(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setDragActive(false);
        void handleFiles(Array.from(e.dataTransfer.files));
      }}
    >
      {dragActive && (
        <div className="absolute inset-0 z-50 bg-blue-500/10 border-2 border-dashed border-blue-400 flex items-center justify-center pointer-events-none">
          <div className="text-sm font-mono text-blue-300">Drop files to attach</div>
        </div>
      )}
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
          {user && (
            <div className="px-2.5 py-1.5 rounded-[3px] bg-[#080c14] border border-slate-800">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  {cryptoStatus === "ready" ? (
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <div className="text-[8.5px] uppercase tracking-wider text-slate-500 font-mono">
                      Chat storage
                    </div>
                    <div
                      className={`text-[9.5px] font-mono truncate ${
                        cryptoStatus === "ready"
                          ? "text-emerald-300"
                          : cryptoStatus === "unavailable"
                          ? "text-slate-400"
                          : "text-amber-300"
                      }`}
                    >
                      {cryptoStatus === "ready"
                        ? "E2E encrypted · wallet key"
                        : cryptoStatus === "unlocking"
                        ? "Confirm in MetaMask"
                        : cryptoStatus === "unavailable"
                        ? "Local only · no wallet"
                        : "Encrypted sync off"}
                    </div>
                  </div>
                </div>
                {cryptoStatus === "locked" && (
                  <button
                    onClick={unlockChatSync}
                    className="px-2 py-1 rounded-[2px] bg-emerald-600/80 hover:bg-emerald-500 text-white text-[9px] font-mono font-bold uppercase tracking-wider shrink-0"
                  >
                    Enable
                  </button>
                )}
              </div>
              {cryptoError && (
                <div className="text-[8.5px] text-rose-300 mt-1 leading-snug">{cryptoError}</div>
              )}
              {cryptoStatus === "locked" && !cryptoError && (
                <div className="text-[8px] text-slate-500 mt-1 leading-snug">
                  Login authorizes the account. Messages stay on this device until a wallet signature
                  enables encrypted sync.
                </div>
              )}
              {syncError && (
                <div className="text-[8.5px] text-rose-300 mt-1 leading-snug">{syncError}</div>
              )}
            </div>
          )}

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
                <span>Sign In</span>
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
                  {(AVAILABLE_MODELS.find((m) => m.id === activeSession?.model) || AVAILABLE_MODELS[0]).name}
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
                      { id: "all", label: "All Models (3)" },
                      { id: "bulbasaur", label: "Prague Bulbasaur" },
                      { id: "deepseek", label: "DeepSeek Flash" },
                      { id: "xiaomi", label: "Xiaomi MiMo Flash" },
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

                          {/* Special Hours / Off-Peak Fee (Only for models with off-peak rates like DeepSeek) */}
                          {m.specialHoursPromptRate ? (
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
                          ) : (
                            <div className="flex items-center justify-between text-slate-400 bg-slate-800/40 px-2 py-0.5 rounded-[2px] border border-slate-700/50 text-[9.5px]">
                              <span>⏰ 24/7 Pricing Schedule:</span>
                              <span className="text-slate-300 font-bold">Flat Rate (Zero Peak Surcharges)</span>
                            </div>
                          )}
                        </div>

                        {/* Provider Node Label & Data Policy */}
                        <div className="text-[9.5px] text-slate-400 mt-1.5 pt-1 border-t border-slate-800/50 flex items-center justify-between">
                          <span className="flex items-center gap-1 text-slate-300">
                            <Server className="w-3 h-3 text-purple-400" />
                            <span>Provider: <strong className="text-white">{m.provider}</strong></span>
                          </span>
                          {m.isOfficialBridge ? (
                            <span
                              className="text-amber-400 font-mono text-[8.5px] bg-amber-500/10 px-1.5 py-0.5 rounded-[2px] border border-amber-500/20"
                              title="Inference queries are forwarded to upstream provider servers (DeepSeek / Xiaomi) and are subject to their respective logging & retention policies."
                            >
                              Bridge · Upstream Logged
                            </span>
                          ) : (
                            <span
                              className="text-emerald-400 font-mono text-[8.5px] bg-emerald-500/10 px-1.5 py-0.5 rounded-[2px] border border-emerald-500/20 font-bold"
                              title="Inference executes on dedicated local bare-metal hardware with volatile RAM streaming and zero disk persistence."
                            >
                              Bare-Metal · Zero-Logging
                            </span>
                          )}
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

          {(
            <div className="hidden lg:flex items-center gap-1 px-1.5 py-1 rounded-[3px] bg-[#05070b] border border-slate-800 font-mono text-[9px]">
              <span className="text-slate-500 uppercase tracking-wider mr-0.5">Think</span>
              {(["off", "low", "medium", "high"] as ThinkLevel[]).map((level) => (
                <button
                  key={level}
                  onClick={() => updateThinkLevel(level)}
                  className={`px-1 py-0.5 rounded-[2px] uppercase transition ${
                    (activeSession.think || "medium") === level
                      ? "bg-blue-600 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          )}

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
            <div className="relative">
              <button
                onClick={() => setShowExportMenu((v) => !v)}
                className="p-1.5 rounded-[3px] bg-[#05070b] border border-slate-800 text-slate-400 hover:text-white transition"
                title="Export chat"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              {showExportMenu && (
                <div className="absolute right-0 top-full mt-1 w-44 z-50 rounded-[3px] border border-slate-700 bg-[#080c14] shadow-2xl font-mono text-[10.5px]">
                  <button
                    onClick={() => {
                      exportChat("markdown");
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 text-slate-300 hover:bg-blue-600/20 hover:text-white"
                  >
                    Markdown (.md)
                  </button>
                  <button
                    onClick={() => {
                      exportChat("json");
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 text-slate-300 hover:bg-blue-600/20 hover:text-white"
                  >
                    JSON (.json)
                  </button>
                  <button
                    onClick={() => {
                      copyTranscript();
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 text-slate-300 hover:bg-blue-600/20 hover:text-white"
                  >
                    Copy transcript
                  </button>
                </div>
              )}
            </div>

            {/* Settings Button */}
            <button
              onClick={() => setShowSettingsModal(true)}
              className="p-1.5 rounded-[3px] bg-[#05070b] border border-slate-800 text-slate-400 hover:text-white transition"
              title="Chat Settings"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* Messages Scroll Area */}
        <div
          ref={scrollContainerRef}
          onScroll={handleChatScroll}
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 select-text"
        >
          {/* Empty Conversation Welcome Screen */}
          {activeSession.messages.length === 0 && !activeStreaming ? (
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
                    {msg.role === "assistant" && msg.metrics && Number(msg.metrics.costUsd || 0) > 0 && (
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

                    {/* Formatted Markdown Content, or inline prompt editor */}
                    {editingMessageId === msg.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          rows={3}
                          autoFocus
                          className="w-full bg-[#05070b] border border-blue-500/40 rounded-[3px] p-2 text-xs text-white outline-none focus:border-blue-400 font-mono resize-none"
                        />
                        <div className="flex justify-end gap-2 text-[10px]">
                          <button
                            onClick={() => {
                              setEditingMessageId(null);
                              setEditingText("");
                            }}
                            className="px-2 py-1 text-slate-400 hover:text-white"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={saveEditedMessage}
                            disabled={!editingText.trim()}
                            className="px-2 py-1 rounded-[2px] bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white font-semibold"
                          >
                            Save & resend
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="terminal-markdown select-text"
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                      />
                    )}

                    {/* User message actions */}
                    {msg.role === "user" && editingMessageId !== msg.id && (
                      <div className="mt-2 pt-2 border-t border-blue-500/20 flex justify-end gap-3 text-[10px] text-slate-400">
                        <button
                          onClick={() => startEditMessage(msg)}
                          className="flex items-center gap-1 hover:text-white transition"
                          title="Edit and resend"
                        >
                          <Pencil className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => copyMessage(msg.id, msg.content)}
                          className="flex items-center gap-1 hover:text-white transition"
                          title="Copy message"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </button>
                      </div>
                    )}

                    {msg.role === "assistant" && msg.charts && msg.charts.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {msg.charts.map((spec, i) => (
                          <VegaChart key={`${msg.id}_chart_${i}`} spec={spec} />
                        ))}
                      </div>
                    )}

                    {/* Web search sources stored with the assistant turn */}
                    {msg.role === "assistant" && msg.sources && msg.sources.length > 0 && (
                      <div className="mt-3 pt-2 border-t border-slate-800/80">
                        <div className="text-[9px] uppercase tracking-wider text-slate-500 mb-1">
                          Sources
                        </div>
                        <div className="flex flex-col gap-0.5">
                          {msg.sources.map((source, i) => (
                            <a
                              key={`${msg.id}_src_${i}`}
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-blue-400 hover:text-blue-300 truncate"
                              title={source.url}
                            >
                              [{i + 1}] {source.title}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

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
                            onClick={() => regenerateFrom(msg.id)}
                            className="flex items-center gap-1 hover:text-white transition"
                            title="Regenerate from this point"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>Regenerate</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {msg.id === activeSession.compaction?.throughId && (
                      <div className="mt-3 pt-2 border-t border-slate-800/80 text-[8.5px] text-slate-500 font-mono">
                        Earlier turns compacted for context · ~
                        {Math.ceil(activeSession.compaction.summary.length / 4)} token summary
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Real-time Streaming Message */}
              {activeStreaming && (
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
                        <span>
                          {isSearching
                            ? "Searching the web for sources..."
                            : currentModelConfig.id === "qwen3.5-4b-uncensored-32k"
                            ? "Waiting for Qwen. A cold start can take ~20-30s before the first token."
                            : `Waiting for ${currentModelConfig.name} to return the first token...`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {showScrollButton && (
          <button
            onClick={scrollChatToLatest}
            className="absolute bottom-28 right-4 z-40 p-2 rounded-full bg-[#0c1220] border border-blue-500/40 text-blue-300 shadow-lg hover:text-white"
            title="Jump to latest"
          >
            <ArrowDown className="w-4 h-4" />
          </button>
        )}

        {/* Input Box Footer Container */}
        <div className="p-3 sm:p-4 border-t border-slate-800 bg-[#080c14]/90 shrink-0">
          <div className="max-w-4xl mx-auto space-y-2">
            {isStreaming && !activeStreaming && (
              <div className="text-[9px] font-mono text-slate-500 px-1">
                Another chat is still finishing in the background. This chat can send when it completes.
              </div>
            )}

            {(attachments.length > 0 || isParsing || attachmentError) && (
              <div className="flex flex-wrap items-center gap-1.5 px-1 text-[9px] font-mono">
                {attachments.map((a, i) => (
                  <span key={`${a.name}_${i}`} className="inline-flex items-center gap-1 px-1.5 py-0.5 border border-slate-700 bg-[#05070b] text-slate-300">
                    <FileText className="w-3 h-3 text-blue-400" />
                    {a.name}
                    <button
                      onClick={() => setAttachments((prev) => prev.filter((_, idx) => idx !== i))}
                      className="text-slate-500 hover:text-rose-400"
                      title="Remove attachment"
                    >
                      ×
                    </button>
                  </span>
                ))}
                {isParsing && <span className="text-amber-400">Parsing file...</span>}
                {attachmentError && <span className="text-rose-400">{attachmentError}</span>}
              </div>
            )}

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

              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => {
                  void handleFiles(Array.from(e.target.files || []));
                  e.target.value = "";
                }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-[3px] border border-slate-800 bg-[#05070b] text-slate-400 hover:text-white transition shrink-0"
                title="Attach files"
                disabled={isParsing}
              >
                <Paperclip className="w-4 h-4" />
              </button>

              {forcePdfOcr && (
                <button
                  onClick={() => {
                    setForcePdfOcr(false);
                    localStorage.setItem("vrxl_force_pdf_ocr", "0");
                    saveChatSettings({ forcePdfOcr: false });
                  }}
                  className="px-1.5 py-1 rounded-[2px] border text-[9px] font-mono shrink-0 transition bg-amber-600/20 border-amber-500/50 text-amber-300"
                  title="Force PDF OCR is on; click to disable"
                >
                  Force PDF OCR
                </button>
              )}

              <button
                onClick={() => setSearchEnabled((v) => !v)}
                className={`p-2 rounded-[3px] border transition shrink-0 ${
                  searchEnabled
                    ? "bg-emerald-600/20 border-emerald-500/50 text-emerald-300"
                    : "bg-[#05070b] border-slate-800 text-slate-400 hover:text-white"
                }`}
                title="Search the web (Firecrawl)"
              >
                <Globe className="w-4 h-4" />
              </button>

              {currentModelConfig.contextTokens < 40_000 && (
                <select
                  value={activeSession.searchBudget ?? 512}
                  onChange={(e) => updateSearchBudget(Number(e.target.value))}
                  title="Search context budget"
                  className="bg-[#05070b] border border-slate-800 text-slate-400 text-[9px] font-mono px-1 py-1 rounded-[2px] outline-none shrink-0"
                >
                  <option value={256}>256 ctx</option>
                  <option value={512}>512 ctx</option>
                  <option value={1024}>1K ctx</option>
                  <option value={2048}>2K ctx</option>
                  <option value={-1}>Max</option>
                </select>
              )}

              <div className="relative group shrink-0 font-mono text-[9px] text-slate-400">
                <span className="cursor-help whitespace-nowrap" title="Context used by the last request">
                  ctx {fmtTokens(contextStats.used)}/{fmtTokens(contextLimit)}
                </span>
                <div className="hidden group-hover:block absolute bottom-full right-0 mb-2 w-64 z-50 border border-slate-700 bg-[#080c14] p-2 shadow-2xl">
                  <div className="text-[8px] uppercase tracking-wider text-slate-500 mb-1">
                    Context · {lastAssistantContext ? "last request" : "current"}
                  </div>
                  {[
                    ["System", contextStats.system],
                    ["Tools · search", contextStats.tools],
                    ["History", contextStats.history],
                    ["Prompt", contextStats.prompt],
                    ["Format", contextStats.format],
                    ["Response", contextStats.response],
                  ].map(([label, value]) => (
                    <div key={String(label)} className="flex justify-between gap-2">
                      <span className="text-slate-500">{label}</span>
                      <span className="text-slate-300">{fmtTokens(Number(value))}</span>
                    </div>
                  ))}
                  <div className="mt-1 pt-1 border-t border-slate-800 flex justify-between text-[8.5px]">
                    <span className="text-slate-500">Left</span>
                    <span className="text-emerald-400">{fmtTokens(contextStats.left)}</span>
                  </div>
                  {contextStats.compactionSaved > 0 && (
                    <div className="flex justify-between text-[8.5px]">
                      <span className="text-slate-500">Compacted</span>
                      <span className="text-emerald-400">{fmtTokens(contextStats.compactionSaved)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button: Send or Stop */}
              {activeStreaming ? (
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
                  disabled={!inputPrompt.trim() || isStreaming}
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
              <div className="flex items-center gap-2 relative">
                <button
                  onClick={() => setShowContextDetails((v) => !v)}
                  className="flex items-center gap-1 hover:text-white transition"
                  title="Context usage"
                >
                  <span className="relative w-10 h-1 bg-slate-800 overflow-hidden">
                    <span
                      className="absolute top-0 bottom-0 left-0 bg-emerald-500"
                      style={{
                        width: `${Math.min(100, ((contextStats.system + contextStats.history + contextStats.prompt) / contextLimit) * 100)}%`,
                      }}
                    />
                    <span
                      className="absolute top-0 bottom-0 bg-blue-500"
                      style={{
                        left: `${Math.min(100, ((contextStats.system + contextStats.history + contextStats.prompt) / contextLimit) * 100)}%`,
                        width: `${Math.min(100, (contextStats.tools / contextLimit) * 100)}%`,
                      }}
                    />
                    <span
                      className="absolute top-0 bottom-0 bg-amber-400"
                      style={{
                        left: `${Math.min(100, ((contextStats.system + contextStats.history + contextStats.prompt + contextStats.tools) / contextLimit) * 100)}%`,
                        width: `${Math.min(100, (contextStats.response / contextLimit) * 100)}%`,
                      }}
                    />
                  </span>
                  <span>
                    ctx {fmtTokens(contextStats.used)}/{fmtTokens(contextLimit)}
                  </span>
                  <span className="text-slate-500">· {fmtTokens(contextStats.left)} left</span>
                  <ChevronDown className="w-2.5 h-2.5" />
                </button>
                {showContextDetails && (
                  <div className="absolute bottom-full left-0 mb-2 w-[300px] border border-slate-700 bg-[#080c14] shadow-2xl z-50 p-2 font-mono text-[9px]">
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                      {[
                        ["System", contextStats.system],
                        ["Tools · search", contextStats.tools],
                        ["History", contextStats.history],
                        ["Prompt", contextStats.prompt],
                        ["Format", contextStats.format],
                        ["Response", contextStats.response],
                      ].map(([label, value]) => (
                        <div key={String(label)} className="flex justify-between">
                          <span className="text-slate-500">{label}</span>
                          <span className="text-slate-300">{fmtTokens(Number(value))}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-1.5 pt-1.5 border-t border-slate-800">
                      <span className="text-slate-500">Search context</span>
                      {currentModelConfig.contextTokens < 40_000 ? (
                        <select
                          value={activeSession.searchBudget || 512}
                          onChange={(e) => updateSearchBudget(Number(e.target.value))}
                          className="bg-[#05070b] border border-slate-700 text-slate-300 text-[9px] px-1 py-0.5 outline-none"
                        >
                          {[256, 512, 1024, 2048, -1].map((n) => (
                            <option key={n} value={n}>
                              {n === -1 ? "Max" : `${fmtTokens(n)} tokens`}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-slate-300">full</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-3 mt-1 pt-1 border-t border-slate-800 text-[8px] text-slate-500">
                      <span>{compactAt ? `Auto-compact ${fmtTokens(compactAt)}` : "No auto-compact"}</span>
                      {contextStats.compactionSaved > 0 && (
                        <span className="text-emerald-400">
                          {fmtTokens(contextStats.compactionSaved)} compacted
                        </span>
                      )}
                      <span>{lastAssistantContext ? "Last request" : "Current"}</span>
                    </div>
                  </div>
                )}
                <span>50 bps Protocol Fee</span>
                <span>•</span>
                <span>
                  Est. Cost: ~${((Math.max(1, inputPrompt.length / 4) / 1e6) * 0.15).toFixed(6)} USD
                </span>
                {isSearching && activeStreaming && (
                  <span className="text-emerald-400">Searching the web...</span>
                )}
                {searchError && activeStreaming && (
                  <span className="text-amber-400">{searchError}</span>
                )}
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
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setShowDepositModal(false);
                    setShowAuthModal(true);
                  }}
                  className="text-blue-400 hover:text-blue-300 underline font-semibold transition"
                >
                  Sign In
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
                Chat account
              </h3>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="text-[10px] uppercase tracking-wider text-slate-400">Signed in</div>
              <div className="text-xs text-white break-all">
                {user?.email || (user as any)?.wallet_address || "Not signed in"}
              </div>
              {(user as any)?.wallet_address && (
                <div className="text-[9px] text-slate-500 font-mono break-all">
                  {(user as any).wallet_address}
                </div>
              )}
              <div className="flex items-center justify-between text-[9.5px] text-slate-400">
                <span>Chat encryption</span>
                <span className={cryptoStatus === "ready" ? "text-emerald-300" : "text-amber-300"}>
                  {cryptoStatus === "ready"
                    ? "AES-256-GCM · wallet key"
                    : cryptoStatus === "unavailable"
                    ? "local only"
                    : "sync off"}
                </span>
              </div>
              {currentModelConfig.contextTokens >= 40_000 && (
                <div className="flex items-start justify-between gap-3 pt-2 border-t border-slate-800">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-400">
                      Web search tool
                    </div>
                    <p className="text-[9px] text-slate-500 leading-relaxed mt-0.5">
                      Let the model call web search when it needs current information. 1M-context models only.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const next = !searchToolEnabled;
                      setSearchToolEnabled(next);
                      localStorage.setItem("vrxl_search_tool", next ? "1" : "0");
                      saveChatSettings({ searchTool: next });
                    }}
                    aria-pressed={searchToolEnabled}
                    className={`px-1.5 py-0.5 rounded-[2px] text-[9px] font-mono font-bold border ${
                      searchToolEnabled
                        ? "bg-emerald-600/20 border-emerald-500/50 text-emerald-300"
                        : "bg-[#05070b] border-slate-700 text-slate-500"
                    }`}
                  >
                    {searchToolEnabled ? "ON" : "OFF"}
                  </button>
                </div>
              )}
              <div className="space-y-1 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>Temperature</span>
                  <span className="font-mono text-blue-400">{temperature.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={temperature}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    setTemperature(v);
                    localStorage.setItem("vrxl_chat_temperature", String(v));
                    saveChatSettings({ temperature: v });
                  }}
                  className="w-full accent-blue-500 bg-slate-800 h-1 cursor-pointer"
                />
              </div>
              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <div className="text-[10px] uppercase tracking-wider text-slate-400">Search provider</div>
                <select
                  value={searchProvider}
                  onChange={(e) => {
                    setSearchProvider(e.target.value);
                    localStorage.setItem("vrxl_search_provider", e.target.value);
                    saveChatSettings({ searchProvider: e.target.value });
                  }}
                  className="w-full bg-[#05070b] border border-slate-800 rounded-[3px] px-2 py-1 text-[10px] text-white outline-none focus:border-blue-500 font-mono"
                >
                  <option value="firecrawl">Firecrawl (keyless, browser IP)</option>
                  <option value="brave">Brave Search (own key)</option>
                  <option value="exa">Exa (own key)</option>
                  <option value="custom">Custom base URL + key</option>
                </select>
                {searchProvider !== "firecrawl" && (
                  <input
                    type="password"
                    placeholder={searchProvider === "brave" ? "Brave API key" : searchProvider === "exa" ? "Exa API key" : "API key (optional)"}
                    value={searchKey}
                    onChange={(e) => {
                      setSearchKey(e.target.value);
                      localStorage.setItem("vrxl_search_key", e.target.value);
                      saveChatSettings({ searchKey: e.target.value });
                    }}
                    className="w-full bg-[#05070b] border border-slate-800 rounded-[3px] px-2 py-1 text-[10px] text-white outline-none focus:border-blue-500 font-mono"
                  />
                )}
                {searchProvider === "custom" && (
                  <input
                    type="url"
                    placeholder="https://your-search.example/search"
                    value={searchBaseUrl}
                    onChange={(e) => {
                      setSearchBaseUrl(e.target.value);
                      localStorage.setItem("vrxl_search_base", e.target.value);
                      saveChatSettings({ searchBaseUrl: e.target.value });
                    }}
                    className="w-full bg-[#05070b] border border-slate-800 rounded-[3px] px-2 py-1 text-[10px] text-white outline-none focus:border-blue-500 font-mono"
                  />
                )}
                <p className="text-[8.5px] text-slate-500 leading-relaxed">
                  Keys stay in this browser. Custom expects POST {"{query, limit}"} and returns data.web or results.
                </p>
              </div>
              <div className="flex items-start justify-between gap-3 pt-2 border-t border-slate-800">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-400">
                    Show force PDF OCR toggle
                  </div>
                  <p className="text-[9px] text-slate-500 leading-relaxed mt-0.5">
                    Reveals the force OCR switch for PDF attachments.
                  </p>
                </div>
                <button
                  onClick={() => {
                    const next = !showForcePdfOcrToggle;
                    setShowForcePdfOcrToggle(next);
                    localStorage.setItem("vrxl_show_force_pdf_ocr", next ? "1" : "0");
                    saveChatSettings({ showForcePdfOcrToggle: next });
                  }}
                  aria-pressed={showForcePdfOcrToggle}
                  className={`px-1.5 py-0.5 rounded-[2px] text-[9px] font-mono font-bold border ${
                    showForcePdfOcrToggle
                      ? "bg-emerald-600/20 border-emerald-500/50 text-emerald-300"
                      : "bg-[#05070b] border-slate-700 text-slate-500"
                  }`}
                >
                  {showForcePdfOcrToggle ? "ON" : "OFF"}
                </button>
              </div>
              {showForcePdfOcrToggle && (
                <div className="flex items-start justify-between gap-3 pt-2 border-t border-slate-800">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-400">
                      Force PDF OCR
                    </div>
                    <p className="text-[9px] text-slate-500 leading-relaxed mt-0.5">
                      OCR every PDF page, including pages with a text layer. Slower.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const next = !forcePdfOcr;
                      setForcePdfOcr(next);
                      localStorage.setItem("vrxl_force_pdf_ocr", next ? "1" : "0");
                      saveChatSettings({ forcePdfOcr: next });
                    }}
                    aria-pressed={forcePdfOcr}
                    className={`px-1.5 py-0.5 rounded-[2px] text-[9px] font-mono font-bold border ${
                      forcePdfOcr
                        ? "bg-amber-600/20 border-amber-500/50 text-amber-300"
                        : "bg-[#05070b] border-slate-700 text-slate-500"
                    }`}
                  >
                    {forcePdfOcr ? "ON" : "OFF"}
                  </button>
                </div>
              )}
              {currentModelConfig.contextTokens >= 40_000 && (
                <div className="flex items-start justify-between gap-3 pt-2 border-t border-slate-800">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-400">
                      Vega-Lite charts
                    </div>
                    <p className="text-[9px] text-slate-500 leading-relaxed mt-0.5">
                      Lets the model render charts inline. Tool returns usage info and renders the spec. Off by default.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const next = !chartToolEnabled;
                      setChartToolEnabled(next);
                      localStorage.setItem("vrxl_chart_tool", next ? "1" : "0");
                      saveChatSettings({ chartTool: next });
                    }}
                    aria-pressed={chartToolEnabled}
                    className={`px-1.5 py-0.5 rounded-[2px] text-[9px] font-mono font-bold border ${
                      chartToolEnabled
                        ? "bg-emerald-600/20 border-emerald-500/50 text-emerald-300"
                        : "bg-[#05070b] border-slate-700 text-slate-500"
                    }`}
                  >
                    {chartToolEnabled ? "ON" : "OFF"}
                  </button>
                </div>
              )}
              <p className="text-[9px] text-slate-500 leading-relaxed">
                API keys are for external endpoints. Chat uses the signed-in session only.
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
                Close
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

            {/* Tabs: MetaMask vs Email */}
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
                  Connect your Web3 MetaMask wallet directly. Account creation, balance recovery, and encrypted chat persistence are instantaneous and permissionless. Email is optional for notifications or secondary 2FA.
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

            {/* Email OTP Login */}
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
