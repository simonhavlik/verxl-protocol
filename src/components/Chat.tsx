import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { marked } from "marked";
import {
  deriveChatKey,
  encryptChatPayload,
  decryptChatPayload,
  hasWalletProvider,
  getCachedChatKey,
  clearChatKeyCache,
  type ChatPlaintext,
} from "../lib/chatCrypto";
import { openMetaMaskOnMobile } from "../lib/wallet";
import { Portal } from "./Portal";
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
  Menu,
  Cpu,
  X,
  LogIn,
  LogOut,
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
  PanelLeft,
  User,
  Eye,
  EyeOff,
} from "lucide-react";

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
  return <div ref={ref} className="mt-3 w-full overflow-x-auto bg-[#070a0f] border border-slate-800 p-2" />;
};

const renderMarkdown = (content: string): string => {
  if (!content) return "";
  try {
    const preprocessed = content
      .replace(/\\\[([\s\S]*?)\\\]/g, (_, m) => `\n$$\n${m}\n$$\n`)
      .replace(/\\\(([\s\S]*?)\\\)/g, (_, m) => `$${m}$`)
      .replace(/(^|\n)\[\s*\n([\s\S]*?)\n\]\s*(?=\n|$)/g, (_, lead, m) => `${lead}$$\n${m}\n$$`)
      .replace(/\^=/g, "^*=")
      .replace(/\\left\{/g, "\\left\\{")
      .replace(/\\right\}/g, "\\right\\}")
      .replace(/\*\*([^\s*][^*]*?)\*\*([a-zA-Z0-9])/g, "**$1** $2");
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
  mcpConnections?: { name: string; url: string }[];
  pdfOcrEnabled?: boolean;
  forcePdfOcr?: boolean;
  showForcePdfOcrToggle?: boolean;
  compaction?: { summary: string; throughId: string; at: number };
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

interface ActiveStream {
  controller: AbortController;
  content: string;
  reasoning: string;
  searching: boolean;
  startedAt: number;
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
    title: "Fee math",
    subtitle: "Unit economics",
    prompt:
      "Compare the 50 bps Verxl protocol fee with a 950 bps aggregator on a $1,000 compute bill. Show the arithmetic, the implied provider payout and the caveat that these are protocol parameters.",
  },
  {
    title: "Client-side encryption",
    subtitle: "Privacy architecture",
    prompt:
      "Explain how Verxl encrypts chat messages in the browser, how the wallet-derived key works, what Postgres can store, and what the operator can still see.",
  },
  {
    title: "Model routing",
    subtitle: "Fleet and latency",
    prompt:
      "Compare the three Verxl models, their context windows, measured TTFT and when each one is routed. Distinguish the Prague bare-metal host from the official bridges and state the limits.",
  },
  {
    title: "Settlement receipt",
    subtitle: "USDC on Sepolia",
    prompt:
      "Walk through what a Verxl inference receipt contains, how USDC settlement works on Sepolia, and which parts are deliberately not live on mainnet.",
  },
];

const TREASURY_WALLET = "0x14f10A865e277C0B1949e18Dd9856602DB11742b";

interface ChatProps {
  onNavigate?: (tab: string) => void;
  appMode?: boolean;
}

export const Chat: React.FC<ChatProps> = ({ onNavigate, appMode = false }) => {
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
  const [mcpQuery, setMcpQuery] = useState("");
  const [mcpResults, setMcpResults] = useState<any[]>([]);
  const [mcpLoading, setMcpLoading] = useState(false);
  const [mcpError, setMcpError] = useState<string | null>(null);
  const [mcpConnections, setMcpConnections] = useState<{ name: string; url: string }[]>(() => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem("vrxl_mcp_connections") || "[]"); } catch { return []; }
  });
  const [attachments, setAttachments] = useState<{ name: string; text: string; kind: string }[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchToolEnabled, setSearchToolEnabled] = useState(() => {
    if (typeof window === "undefined") return true;
    const stored = localStorage.getItem("vrxl_search_tool");
    return stored === null ? true : stored === "1";
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
    const res = await fetch("/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        provider: searchProvider,
        query: q,
        key: searchKey,
        baseUrl: searchBaseUrl,
      }),
    });
    const data = (await res.json().catch(() => null)) as any;
    if (!res.ok || !data || data.error) {
      throw new Error(data?.error || `Search provider returned HTTP ${res.status}.`);
    }
    const rows = Array.isArray(data.results) ? data.results : [];
    return rows
      .map((x: any) => ({
        title: String(x?.title || x?.url || ""),
        url: String(x?.url || ""),
        description: String(x?.description || "").replace(/\s+/g, " "),
      }))
      .filter((x: SearchSource) => x.url);
  };
  const [searchError, setSearchError] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [showExportMenu, setShowExportMenu] = useState(false);
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
    const storedSearchTool = localStorage.getItem("vrxl_search_tool");
    setSearchToolEnabled(
      activeSession.searchTool ?? (storedSearchTool === null ? true : storedSearchTool === "1")
    );
    setSearchProvider(
      activeSession.searchProvider ?? localStorage.getItem("vrxl_search_provider") ?? "firecrawl"
    );
    setSearchBaseUrl(activeSession.searchBaseUrl ?? localStorage.getItem("vrxl_search_base") ?? "");
    setSearchKey(activeSession.searchKey ?? localStorage.getItem("vrxl_search_key") ?? "");
    setChartToolEnabled(activeSession.chartTool ?? localStorage.getItem("vrxl_chart_tool") === "1");
    setMcpConnections(activeSession.mcpConnections ?? (() => {
      try { return JSON.parse(localStorage.getItem("vrxl_mcp_connections") || "[]"); } catch { return []; }
    })());
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
  const [activeStreams, setActiveStreams] = useState<Record<string, ActiveStream>>({});
  const [finishedSessionIds, setFinishedSessionIds] = useState<Set<string>>(new Set());
  const activeStream = activeStreams[activeSessionId];
  const activeStreaming = Boolean(activeStream);
  const streamingContent = activeStream?.content || "";
  const streamingReasoning = activeStream?.reasoning || "";
  const isSearching = activeStream?.searching || false;
  const [expandedReasoningIds, setExpandedReasoningIds] = useState<Record<string, boolean>>({});

  const updateStream = (sessionId: string, patch: Partial<ActiveStream>) => {
    setActiveStreams((prev) => {
      const current = prev[sessionId];
      if (!current) return prev;
      return { ...prev, [sessionId]: { ...current, ...patch } };
    });
  };

  const removeStream = (sessionId: string) => {
    setActiveStreams((prev) => {
      if (!prev[sessionId]) return prev;
      const next = { ...prev };
      delete next[sessionId];
      return next;
    });
  };

  // UI States
  const [sidebarOpen, setSidebarOpen] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth >= 1024 : true
  );
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsTab, setSettingsTab] = useState<"general" | "search" | "mcp" | "account">("general");
  const [showSearchKey, setShowSearchKey] = useState(false);
  const [mcpManualName, setMcpManualName] = useState("");
  const [mcpManualUrl, setMcpManualUrl] = useState("");
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
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 24;
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
    if (scrollContainerRef.current && activeStreaming && autoScrollRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [streamingContent, streamingReasoning, activeStreaming]);

  useEffect(() => {
    autoScrollRef.current = true;
    setShowScrollButton(false);
    if (scrollContainerRef.current) {
      // An empty conversation should show its welcome/logo from the top, not
      // auto-scroll the taller welcome state out of view.
      const hasMessages = (activeSession?.messages.length || 0) > 0;
      scrollContainerRef.current.scrollTop = hasMessages
        ? scrollContainerRef.current.scrollHeight
        : 0;
    }
  }, [activeSessionId, activeSession?.messages.length]);

  useEffect(() => {
    if (
      scrollContainerRef.current &&
      autoScrollRef.current &&
      (activeSession?.messages.length || 0) > 0
    ) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [activeSession?.messages.length]);

  // The welcome state is taller than the message viewport at some window sizes.
  // Keep it anchored to the top so the brand mark and heading are not scrolled away.
  useEffect(() => {
    if ((activeSession?.messages.length || 0) !== 0) return;
    let cancelled = false;
    const reset = () => {
      if (!cancelled && scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0;
    };
    reset();
    const t = window.setTimeout(reset, 80);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [activeSessionId, activeSession?.messages.length]);

  // Create New Chat Session
  const createNewSession = () => {
    const newSession = createBlankSession();
    newSession.model = activeSession?.model || "qwen3.5-4b-uncensored-32k";
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setInputPrompt("");
    if (window.innerWidth < 1024) setSidebarOpen(false);
    syncSessionToDb(newSession);
  };

  // Keyboard shortcuts: ⌘/Ctrl+Shift+O new chat, ⌘/Ctrl+K focus composer.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;
      const key = e.key.toLowerCase();
      if (e.shiftKey && key === "o") {
        e.preventDefault();
        createNewSession();
        return;
      }
      if (!e.shiftKey && key === "k") {
        e.preventDefault();
        textareaRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // createNewSession intentionally follows the active model; re-register only when it changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSession?.model]);

  // Delete Chat Session
  const deleteSession = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFinishedSessionIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
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

  const searchMcpRegistry = async () => {
    setMcpLoading(true);
    setMcpError(null);
    try {
      const res = await fetch(
        `https://registry.modelcontextprotocol.io/v0/servers?search=${encodeURIComponent(mcpQuery)}&limit=10`
      );
      const data = (await res.json()) as any;
      setMcpResults(data.servers || []);
    } catch (err: any) {
      setMcpError(err?.message || "Registry request failed");
    } finally {
      setMcpLoading(false);
    }
  };

  const addMcpServer = (name: string, url: string) => {
    const next = [...mcpConnections.filter((c) => c.url !== url), { name, url }];
    setMcpConnections(next);
    localStorage.setItem("vrxl_mcp_connections", JSON.stringify(next));
    saveChatSettings({ mcpConnections: next });
  };

  const removeMcpServer = (url: string) => {
    const next = mcpConnections.filter((c) => c.url !== url);
    setMcpConnections(next);
    localStorage.setItem("vrxl_mcp_connections", JSON.stringify(next));
    saveChatSettings({ mcpConnections: next });
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
    setFinishedSessionIds((prev) => {
      if (!prev.has(targetSession.id)) return prev;
      const next = new Set(prev);
      next.delete(targetSession.id);
      return next;
    });
    const promptText = (promptOverride || inputPrompt).trim();
    if (!promptText || activeStreams[targetSession.id] || isParsing) return;
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
    const controller = new AbortController();
    setActiveStreams((prev) => ({
      ...prev,
      [targetSession.id]: { controller, content: "", reasoning: "", searching: false, startedAt: Date.now() },
    }));

    // Small-context models get an LLM-compacted search digest, never truncated snippets.
    let searchDigest = "";
    let sources: SearchSource[] = [];

    let charts: any[] = [];
    // Model-callable tools; >40K models only, each behind its own setting.
    if (
      currentModelConfig.contextTokens >= 40_000 &&
      (searchToolEnabled || chartToolEnabled)
    ) {
      updateStream(targetSession.id, { searching: true });
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
      updateStream(targetSession.id, { searching: false });
    }

    // Search from the browser IP, so the keyless Firecrawl limit applies per user.
    if (searchEnabled) {
      updateStream(targetSession.id, { searching: true });
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
      } catch (err) {
        const message = err instanceof Error ? err.message : "unknown search error";
        setSearchError(`Web search failed: ${message}. Answering without sources.`);
      } finally {
        updateStream(targetSession.id, { searching: false });
        setSearchEnabled(false);
      }
    }

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
                  updateStream(targetSession.id, { reasoning: accumulatedReasoning });
                  tokenCount++;
                }

                if (contentChunk) {
                  accumulatedContent += contentChunk;
                  updateStream(targetSession.id, { content: accumulatedContent });
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

      const extractedCharts: any[] = [];
      if (chartToolEnabled) {
        const blocks = accumulatedContent.match(/```json\s*([\s\S]*?)```/gi) || [];
        for (const block of blocks) {
          try {
            const raw = block.replace(/```json/i, "").replace(/```$/, "").trim();
            const spec = JSON.parse(raw);
            if (
              spec &&
              typeof spec === "object" &&
              (spec.mark || spec.layer || spec.vconcat || spec.hconcat || spec.facet) &&
              JSON.stringify(spec.$schema || "").includes("vega-lite")
            ) {
              extractedCharts.push(spec);
            }
          } catch {}
        }
      }
      const allCharts = [...charts, ...extractedCharts];

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
        charts: allCharts.length > 0 ? allCharts : undefined,
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

      removeStream(targetSession.id);
      setFinishedSessionIds((prev) => new Set(prev).add(targetSession.id));
    }
  };

  // Halt generation
  const handleStopGeneration = () => {
    activeStream?.controller.abort();
    removeStream(activeSessionId);
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
    if (activeStreams[activeSession.id]) return;
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

  const updateThinkLevel = (level: ThinkLevel) => {
    const updated = { ...activeSession, think: level, updatedAt: Date.now() };
    setSessions((prev) => prev.map((s) => (s.id === activeSession.id ? updated : s)));
    syncSessionToDb(updated);
  };

  return (
    <div
      className={`relative flex min-h-0 w-full min-w-0 overflow-hidden bg-[#070a0f] font-sans text-slate-100 max-lg:mx-0 max-lg:mt-0 max-lg:mb-0 lg:h-dvh lg:min-h-0 ${
        appMode ? "h-[calc(100dvh-56px)]" : "h-[calc(100dvh-121px)]"
      }`}
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
        <div className="absolute inset-0 z-50 bg-[#8fa39b]/10 border-2 border-dashed border-[#b8f6dd] flex items-center justify-center pointer-events-none">
          <div className="text-sm font-mono text-[#d7f8ec]">Drop files to attach</div>
        </div>
      )}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close conversations"
          className="absolute inset-0 z-30 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      {/* ============================================================== */}
      {/* 1. LEFT SIDEBAR: CONVERSATION HISTORY & ACCOUNT STATUS         */}
      {/* ============================================================== */}
      <aside
        className={`${
          sidebarOpen ? "w-[84vw] max-w-[320px] lg:w-[248px]" : "w-0"
        } transition-all duration-200 shrink-0 border-r border-white/[0.07] bg-[#080c10] flex flex-col overflow-hidden select-none z-40 max-lg:absolute max-lg:inset-y-0 max-lg:left-0 max-lg:h-full max-lg:shadow-2xl`}
      >
        {/* The product rail owns global navigation; this panel is the chat context. */}
        <div className="flex h-[52px] shrink-0 items-center justify-between border-b border-white/[0.07] px-3">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#8b989e]">Chats</span>
            <span className="font-mono text-[8px] text-[#65737b]">{sessions.length}</span>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 text-[#65737b] transition hover:text-white"
            title="Hide sidebar"
            aria-label="Hide sidebar"
          >
            <PanelLeft className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* New chat */}
        <div className="border-b border-white/[0.07] p-2">
          <button
            onClick={() => {
              createNewSession();
              if (window.innerWidth < 1024) setSidebarOpen(false);
            }}
            className="flex w-full items-center gap-2 px-2.5 py-2 text-[11px] font-medium text-[#07110d] transition active:scale-[0.99]"
            style={{ background: "#b8f6dd" }}
            title="New chat (⌘⇧O)"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New chat</span>
            <span className="ml-auto font-mono text-[8px] font-normal text-[#07110d]/55">⌘⇧O</span>
          </button>
        </div>

        {/* Sessions Scrollable List */}
        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1 font-mono text-xs">
          <div className="flex items-center justify-between px-2 py-2 font-mono text-[8px] uppercase tracking-[0.14em] text-[#65737b]">
            <span>Recent</span>
            <span>{sessions.length}</span>
          </div>

          {sessions.map((session) => {
            const isActive = session.id === activeSession.id;
            return (
              <div
                key={session.id}
                onClick={() => {
                  setActiveSessionId(session.id);
                  if (window.innerWidth < 1024) setSidebarOpen(false);
                }}
                className={`group relative flex cursor-pointer items-center justify-between border-l-2 px-2.5 py-2 transition ${
                  isActive
                    ? "border-[#b8f6dd] bg-white/[0.045] text-white"
                    : "border-transparent text-[#8b989e] hover:bg-white/[0.025] hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2 truncate pr-6">
                  <MessageSquare className={`h-3.5 w-3.5 shrink-0 ${isActive ? "text-[#b8f6dd]" : "text-[#65737b]"}`} />
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
                      className="min-w-0 flex-1 border border-[#b8f6dd]/30 bg-[#070a0f] px-1 py-0.5 text-[11px] text-white outline-none"
                    />
                  ) : (
                    <span className="truncate text-[11.5px] font-medium">{session.title}</span>
                  )}
                  {activeStreams[session.id] ? (
                    <span
                      className="h-2 w-2 shrink-0 animate-spin rounded-full border-2 border-[#b8f6dd] border-t-transparent"
                      title="Working"
                    />
                  ) : finishedSessionIds.has(session.id) ? (
                    <Check className="w-3 h-3 text-[#b8f6dd] shrink-0" />
                  ) : null}
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
        <div className="space-y-1 border-t border-white/[0.07] bg-[#070a0f]/90 p-2">
          {user && (
            <div className="flex items-center justify-between gap-2 px-1 py-1">
              <div className="flex min-w-0 items-center gap-1.5">
                {cryptoStatus === "ready" ? (
                  <ShieldCheck className="h-3 w-3 shrink-0 text-[#b8f6dd]" />
                ) : (
                  <Lock className="h-3 w-3 shrink-0 text-[#9aa7ad]" />
                )}
                <span
                  className={`truncate font-mono text-[8px] uppercase tracking-[0.1em] ${
                    cryptoStatus === "ready" ? "text-[#b8f6dd]" : "text-[#8b989e]"
                  }`}
                >
                  {cryptoStatus === "ready"
                    ? "E2E encrypted"
                    : cryptoStatus === "unlocking"
                    ? "Confirm in MetaMask"
                    : cryptoStatus === "unavailable"
                    ? "Local only"
                    : "Sync off"}
                </span>
              </div>
              {cryptoStatus === "locked" && (
                <button
                  onClick={unlockChatSync}
                  className="shrink-0 border border-[#b8f6dd]/25 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.1em] text-[#b8f6dd] transition hover:border-[#b8f6dd]/60"
                >
                  Enable
                </button>
              )}
            </div>
          )}
          {cryptoError && <div className="px-1 font-mono text-[8px] leading-snug text-[#d99a9a]">{cryptoError}</div>}
          {syncError && <div className="px-1 font-mono text-[8px] leading-snug text-[#d99a9a]">{syncError}</div>}

          <div className="flex items-center justify-between px-1 py-1">
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-[#65737b]">Balance</span>
              <span className="font-mono text-[11px] text-[#b8f6dd]">${balanceUsd.toFixed(4)}</span>
            </div>
            <button
              onClick={() => setShowDepositModal(true)}
              className="font-mono text-[8px] uppercase tracking-[0.1em] text-[#8b989e] transition hover:text-white"
            >
              Deposit
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
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-[3px] bg-[#5f8a7a]/20 hover:bg-[#5f8a7a]/30 border border-[#b8f6dd]/30 text-[#d7f8ec] text-[11px] font-mono font-medium transition"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
              <button
                onClick={() => setShowSettingsModal(true)}
                className="p-1.5 hover:text-white text-slate-400 border border-slate-800 rounded-[3px] bg-[#0b1117] transition"
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
      <main className="relative flex min-w-0 flex-1 flex-col overflow-hidden bg-[#070a0f]">
        {/* Top Header Bar */}
        <header className="z-20 hidden h-[52px] shrink-0 select-none items-center justify-between gap-2 border-b border-white/[0.07] bg-[#070a0f]/85 px-3 backdrop-blur-xl lg:flex">
          <div className="flex items-center gap-2">
            {/* Toggle Sidebar Button */}
            <button
              onClick={() => setSidebarOpen((prev) => !prev)}
              className="p-1.5 text-[#8b989e] transition hover:text-white"
              title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
              aria-label={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
            >
              <PanelLeft className="h-4 w-4" />
            </button>

            {/* Model Selector Pill */}
            <div className="relative">
              <button
                onClick={() => setShowModelDropdown((prev) => !prev)}
                className="flex items-center gap-2 border border-white/[0.07] px-2.5 py-1.5 text-[11px] text-[#d7e2de] transition hover:border-white/20"
              >
                <Cpu className="h-3.5 w-3.5 text-[#b8f6dd]" />
                <span className="max-w-[150px] truncate font-medium sm:max-w-[240px]">
                  {(AVAILABLE_MODELS.find((m) => m.id === activeSession?.model) || AVAILABLE_MODELS[0]).name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Model Dropdown Menu with Search, Filter & Last Used */}
              {showModelDropdown && (
                <div className="absolute left-0 z-50 mt-2 max-h-[85vh] w-[calc(100vw-1.5rem)] max-w-[24rem] space-y-2 overflow-y-auto border border-white/[0.12] bg-[#0a0f14] p-2.5 font-mono text-xs shadow-2xl sm:w-96">
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search models, 1M context, providers..."
                      value={modelSearch}
                      onChange={(e) => setModelSearch(e.target.value)}
                      className="w-full bg-[#070a0f] border border-slate-800 rounded-[3px] pl-7 pr-2 py-1.5 text-xs text-white outline-none focus:border-[#b8f6dd] font-mono"
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
                            ? "bg-[#5f8a7a]/30 border-[#b8f6dd] text-[#eafff6] font-bold"
                            : "bg-[#0b1117] border-slate-800 text-slate-400 hover:text-white"
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
                        <Clock className="w-3 h-3 text-[#b8f6dd]" />
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
                              className="px-2 py-1 rounded-[2px] bg-[#0b1117] border border-slate-800 hover:border-[#b8f6dd]/50 text-[10.5px] text-slate-300 flex items-center gap-1 transition"
                            >
                              <span className="truncate max-w-[120px]">{m.name}</span>
                              <span className="text-[8.5px] text-[#b8f6dd] font-bold">1M</span>
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
                      <span className="text-[#b8f6dd] text-[9px]">50 BPS PROTOCOL FEE</span>
                    </div>

                    {filteredModels.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => selectModel(m.id)}
                        className={`p-2.5 rounded-[3px] cursor-pointer transition border ${
                          activeSession?.model === m.id
                            ? "bg-[#5f8a7a]/20 border-[#b8f6dd] text-white shadow-md shadow-[#b8f6dd]/10"
                            : "bg-[#060a12] border-slate-800/90 hover:border-slate-700 text-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 font-bold text-xs">
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="truncate">{m.name}</span>
                            {m.isOfficialBridge && (
                              <span className="px-1 py-0.2 rounded-[2px] bg-[#8fa39b]/20 border border-[#b8f6dd]/40 text-[8.5px] text-[#d7f8ec] shrink-0 font-mono">
                                Official Bridge
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-[#b8f6dd] font-semibold shrink-0">{m.speed}</span>
                        </div>

                        <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">{m.description}</div>

                        {/* Specs & Fee Breakdown */}
                        <div className="mt-2 pt-1.5 border-t border-slate-800/80 space-y-1.5 text-[9.5px] font-mono">
                          <div className="flex items-center justify-between text-slate-400">
                            <span className="text-[#d7f8ec] font-semibold flex items-center gap-1">
                              <Sparkles className="w-2.5 h-2.5 text-[#b8f6dd]" />
                              <span>{m.context}</span>
                            </span>
                            <span className="text-slate-200">
                              Prompt: <span className="font-bold text-white">${m.promptRate}</span> • Output: <span className="font-bold text-white">${m.completionRate}</span> / 1M
                            </span>
                          </div>

                          {/* Cached Prompt & Output Prefix Fee */}
                          <div className="flex items-center justify-between text-[#b8f6dd] bg-[#b8f6dd]/10 px-2 py-0.5 rounded-[2px] border border-[#b8f6dd]/15">
                            <span className="font-semibold flex items-center gap-1">
                              <span>💾 Cached Prompt Prefix:</span>
                            </span>
                            <span className="font-bold">
                              ${m.cachedPromptRate} / 1M ({Math.round((1 - m.cachedPromptRate / m.promptRate) * 100)}% off)
                            </span>
                          </div>

                          {/* Special Hours / Off-Peak Fee (Only for models with off-peak rates like DeepSeek) */}
                          {m.specialHoursPromptRate ? (
                            <div className="text-[#e3b8b8] bg-[#d99a9a]/10 px-2 py-1 rounded-[2px] border border-[#d99a9a]/20 space-y-0.5">
                              <div className="flex items-center justify-between font-bold text-[10px]">
                                <span>🌙 Off-Peak / Special Hours:</span>
                                <span className="text-white">${m.specialHoursPromptRate} Prompt / ${m.specialHoursCompletionRate} Output</span>
                              </div>
                              {m.specialHoursDesc && (
                                <div className="text-[8.5px] text-[#e3b8b8]/80 leading-snug">
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
                            <Server className="w-3 h-3 text-[#8fa39b]" />
                            <span>Provider: <strong className="text-white">{m.provider}</strong></span>
                          </span>
                          {m.isOfficialBridge ? (
                            <span
                              className="text-[#d99a9a] font-mono text-[8.5px] bg-[#d99a9a]/10 px-1.5 py-0.5 rounded-[2px] border border-[#d99a9a]/20"
                              title="Inference queries are forwarded to upstream provider servers (DeepSeek / Xiaomi) and are subject to their respective logging & retention policies."
                            >
                              Bridge · Upstream Logged
                            </span>
                          ) : (
                            <span
                              className="text-[#b8f6dd] font-mono text-[8.5px] bg-[#b8f6dd]/10 px-1.5 py-0.5 rounded-[2px] border border-[#b8f6dd]/15 font-bold"
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

          <div className="hidden min-w-0 flex-1 px-5 text-center xl:block">
            <span className="block truncate font-mono text-[9px] uppercase tracking-[0.12em] text-[#65737b]">
              {activeSession.title}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="hidden font-mono text-[7.5px] uppercase tracking-[0.14em] text-[#65737b] xl:inline">Think</span>
            <select
              value={activeSession.think || "medium"}
              onChange={(e) => updateThinkLevel(e.target.value as ThinkLevel)}
              className="h-7 border border-white/[0.07] bg-transparent px-1.5 font-mono text-[9px] uppercase tracking-[0.08em] text-[#9aa7ad] outline-none transition hover:border-white/20 focus:border-[#b8f6dd]/40"
              aria-label="Thinking level"
            >
              {(["off", "low", "medium", "high"] as ThinkLevel[]).map((level) => (
                <option key={level} value={level} className="bg-[#0a0f14] text-white">
                  {level}
                </option>
              ))}
            </select>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2">

            {/* Export Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowExportMenu((v) => !v)}
                className="p-1.5 text-[#8b989e] transition hover:text-white"
                title="Export chat"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              {showExportMenu && (
                <div className="absolute right-0 top-full z-50 mt-2 w-44 border border-white/[0.12] bg-[#0a0f14] font-mono text-[10.5px] shadow-2xl">
                  <button
                    onClick={() => {
                      exportChat("markdown");
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 text-slate-300 hover:bg-[#5f8a7a]/20 hover:text-white"
                  >
                    Markdown (.md)
                  </button>
                  <button
                    onClick={() => {
                      exportChat("json");
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 text-slate-300 hover:bg-[#5f8a7a]/20 hover:text-white"
                  >
                    JSON (.json)
                  </button>
                  <button
                    onClick={() => {
                      copyTranscript();
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 text-slate-300 hover:bg-[#5f8a7a]/20 hover:text-white"
                  >
                    Copy transcript
                  </button>
                </div>
              )}
            </div>

            {/* Settings Button */}
            <button
              onClick={() => setShowSettingsModal(true)}
              className="p-1.5 text-[#8b989e] transition hover:text-white"
              title="Chat settings"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* Mobile Chat Header */}
        <header className="flex h-14 shrink-0 items-center justify-between gap-1 border-b border-white/10 bg-[#070a0f] px-2 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2.5 text-[#d7e2de] active:scale-95"
            aria-label="Open conversations"
          >
            <Menu className="w-5 h-5" />
          </button>
          <select
            value={activeSession.model}
            onChange={(e) => selectModel(e.target.value)}
            className="min-w-0 flex-1 appearance-none bg-transparent px-1 text-center font-mono text-[12px] font-semibold text-white outline-none"
            aria-label="Select model"
          >
            {AVAILABLE_MODELS.map((m) => (
              <option key={m.id} value={m.id} className="bg-[#0a0f14] text-white">
                {m.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowSettingsModal(true)}
            className="p-2.5 text-[#8b989e] active:scale-95"
            aria-label="Chat settings"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={createNewSession}
            className="p-2.5 text-[#b8f6dd] active:scale-95"
            aria-label="New chat"
          >
            <Plus className="w-5 h-5" />
          </button>
        </header>

        {/* Messages Scroll Area */}
        <div
          ref={scrollContainerRef}
          onScroll={handleChatScroll}
          onWheel={(e) => {
            if (e.deltaY < 0) autoScrollRef.current = false;
          }}
          onTouchMove={(e) => {
            const el = e.currentTarget;
            if (el.scrollHeight - el.scrollTop - el.clientHeight > 24) {
              autoScrollRef.current = false;
            }
          }}
          className="min-w-0 flex-1 select-text overflow-y-auto px-4 py-6 sm:px-8"
        >
          <div className="mx-auto flex w-full min-w-0 max-w-3xl flex-col gap-8">
          {/* Empty Conversation Welcome Screen */}
          {activeSession.messages.length === 0 && !activeStreaming ? (
            <div className="flex min-h-[48vh] flex-col items-center justify-center py-8 text-center select-none">
              <div className="mb-5 flex items-center gap-2 font-mono text-[8px] uppercase tracking-[0.18em] text-[#65737b]">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
                  <path d="M3 4l9 16 9-16" stroke="#b8f6dd" strokeWidth="2" />
                  <path d="M7.5 4L12 12l4.5-8" stroke="#ffffff" strokeWidth="1" opacity="0.55" />
                </svg>
                <span>Verxl Chat</span>
              </div>
              <h2 className="text-[28px] font-semibold tracking-[-0.035em] text-white sm:text-[34px]">
                How can I help?
              </h2>
              <p className="mt-2 max-w-md text-[12.5px] leading-relaxed text-[#8b989e]">
                Ask anything. Your chats are encrypted in this browser.
              </p>
              <div className="mt-9 grid w-full max-w-xl grid-cols-1 gap-1.5 text-left sm:grid-cols-2">
                {STARTER_PROMPTS.slice(0, 4).map((starter, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSendMessage(starter.prompt)}
                    className="group flex items-center justify-between gap-2 border border-white/[0.07] px-3 py-2.5 text-left transition hover:border-[#b8f6dd]/25 hover:bg-white/[0.02]"
                  >
                    <span className="truncate text-[11.5px] text-[#c9d4d8]">
                      {starter.title}
                    </span>
                    <span className="shrink-0 text-[10px] text-[#65737b] transition group-hover:text-[#b8f6dd]">↗</span>
                  </button>
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
                  <div className="hidden items-center gap-2 px-1 font-mono text-[10px] text-slate-400">
                    <span className="font-bold uppercase tracking-wider">
                      {msg.role === "user" ? "You" : "Verxl Assistant"}
                    </span>
                    <span>•</span>
                    <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    {msg.role === "assistant" && msg.metrics && Number(msg.metrics.costUsd || 0) > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-[#b8f6dd] font-semibold font-mono">
                          -${Number(msg.metrics.costUsd || 0).toFixed(6)} USD
                        </span>
                      </>
                    )}
                  </div>

                  {/* Message Bubble Card */}
                  <div
                    className={`select-text text-[13.5px] leading-7 ${
                      msg.role === "user"
                        ? "max-w-[85%] rounded-[6px] border border-white/[0.07] bg-[#111a17] px-4 py-3 text-[#e8f0ec]"
                        : "w-full text-[#dfe9e4]"
                    }`}
                  >
                    {/* Collapsible Reasoning Process Accordion */}
                    {msg.reasoning && (
                      <div className="mb-3 rounded-[3px] bg-[#060a0e] border border-slate-800/80 overflow-hidden">
                        <button
                          onClick={() => toggleReasoning(msg.id)}
                          className="w-full px-2.5 py-1.5 flex items-center justify-between text-[10px] font-mono text-slate-400 hover:text-slate-200 bg-slate-900/40 border-b border-slate-800/40 transition"
                        >
                          <div className="flex items-center gap-1.5 text-[#b8f6dd]">
                            <span className="w-1.5 h-1.5 bg-[#b8f6dd] rounded-full animate-pulse" />
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
                          className="w-full bg-[#070a0f] border border-[#b8f6dd]/40 rounded-[3px] p-2 text-xs text-white outline-none focus:border-[#b8f6dd] font-mono resize-none"
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
                            className="px-2 py-1 rounded-[2px] bg-[#5f8a7a] hover:bg-[#8fa39b] disabled:bg-slate-800 text-white font-semibold"
                          >
                            Save & resend
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="chat-prose select-text"
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                      />
                    )}

                    {/* User message actions */}
                    {msg.role === "user" && editingMessageId !== msg.id && (
                      <div className="hidden lg:flex mt-2 pt-2 border-t border-[#b8f6dd]/20 justify-end gap-3 text-[10px] text-slate-400">
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
                              className="text-[10px] text-[#b8f6dd] hover:text-[#d7f8ec] truncate"
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
                          <span className="text-[#b8f6dd] font-semibold">
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
                                <Check className="w-3 h-3 text-[#b8f6dd]" />
                                <span className="text-[#b8f6dd]">Copied</span>
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
                  <div className="flex items-center gap-2 px-1 text-[10px] font-mono text-[#b8f6dd]">
                    <span className="w-2 h-2 rounded-full bg-[#b8f6dd] animate-pulse" />
                    <span className="font-bold uppercase tracking-wider">
                      Streaming from Edge Node...
                    </span>
                  </div>

                  <div className="w-full text-[13.5px] leading-7 text-[#dfe9e4]">
                    {/* Live Streaming Reasoning */}
                    {streamingReasoning && (
                      <div className="mb-3 rounded-[3px] bg-[#060a0e] border border-[#b8f6dd]/20 p-2.5">
                        <div className="text-[9.5px] uppercase tracking-wider text-[#b8f6dd] font-bold mb-1 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#b8f6dd] animate-pulse" />
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
                          className="chat-prose select-text"
                          dangerouslySetInnerHTML={{ __html: renderMarkdown(streamingContent) }}
                        />
                        <span className="inline-block w-2 h-3.5 bg-[#b8f6dd] ml-0.5 mt-1 animate-pulse align-middle" />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-slate-400 text-xs py-1">
                        <div className="w-3.5 h-3.5 border-2 border-[#b8f6dd] border-t-transparent rounded-full animate-spin" />
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
        </div>

        {showScrollButton && (
          <button
            onClick={scrollChatToLatest}
            className="absolute bottom-28 right-4 z-40 p-2 rounded-full bg-[#0b1117] border border-[#b8f6dd]/40 text-[#d7f8ec] shadow-lg hover:text-white"
            title="Jump to latest"
          >
            <ArrowDown className="w-4 h-4" />
          </button>
        )}

        {/* Composer: one input, no status dashboard. */}
        <div className="shrink-0 bg-[#070a0f] px-3 pb-[max(12px,env(safe-area-inset-bottom))] pt-2 sm:px-6 sm:pb-4">
          <div className="mx-auto w-full max-w-3xl">
            {(attachments.length > 0 || isParsing || attachmentError) && (
              <div className="flex flex-wrap items-center gap-1.5 px-1 pb-1.5 font-mono text-[9px]">
                {attachments.map((a, i) => (
                  <span key={`${a.name}_${i}`} className="inline-flex items-center gap-1 border border-white/[0.08] px-1.5 py-0.5 text-[#c9d4d8]">
                    <FileText className="h-3 w-3 text-[#b8f6dd]" />
                    {a.name}
                    <button onClick={() => setAttachments((prev) => prev.filter((_, idx) => idx !== i))} className="text-[#65737b] hover:text-[#d99a9a]" title="Remove attachment">×</button>
                  </span>
                ))}
                {isParsing && <span className="text-[#9aa7ad]">Parsing file…</span>}
                {attachmentError && <span className="text-[#d99a9a]">{attachmentError}</span>}
              </div>
            )}

            {searchError && <div className="px-1 pb-1 font-mono text-[9px] text-[#d99a9a]">{searchError}</div>}

            <div className="relative flex items-end gap-1.5 border border-white/[0.09] bg-[#0d141a] p-1.5 transition focus-within:border-[#b8f6dd]/35 sm:p-2">
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
                className="flex h-8 w-8 shrink-0 items-center justify-center text-[#8b989e] transition hover:bg-white/[0.04] hover:text-white"
                title="Attach files"
                disabled={isParsing}
                aria-label="Attach files"
              >
                <Paperclip className="h-[15px] w-[15px]" />
              </button>

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
                placeholder="Message Verxl…"
                rows={1}
                className="max-h-44 min-h-[24px] flex-1 resize-none bg-transparent px-1.5 py-1.5 text-[13.5px] leading-6 text-[#f3f6f5] placeholder-[#65737b] outline-none"
              />

              {forcePdfOcr && (
                <button
                  onClick={() => {
                    setForcePdfOcr(false);
                    localStorage.setItem("vrxl_force_pdf_ocr", "0");
                    saveChatSettings({ forcePdfOcr: false });
                  }}
                  className="hidden shrink-0 border border-[#d99a9a]/25 px-1.5 py-1 font-mono text-[8px] uppercase tracking-[0.1em] text-[#d99a9a] lg:block"
                  title="Force PDF OCR is on; click to disable"
                >
                  OCR
                </button>
              )}

              <button
                onClick={() => setSearchEnabled((v) => !v)}
                className={`flex h-8 w-8 shrink-0 items-center justify-center transition ${
                  searchEnabled ? "bg-[#b8f6dd]/10 text-[#b8f6dd]" : "text-[#8b989e] hover:bg-white/[0.04] hover:text-white"
                }`}
                title="Search the web"
                aria-pressed={searchEnabled}
              >
                <Globe className="h-[15px] w-[15px]" />
              </button>

              {activeStreaming ? (
                <button
                  onClick={handleStopGeneration}
                  className="flex h-8 w-8 shrink-0 items-center justify-center bg-[#d99a9a] text-[#2a1313] transition hover:bg-[#e3b8b8]"
                  title="Stop generating"
                >
                  <Square className="h-3 w-3 fill-current" />
                </button>
              ) : (
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputPrompt.trim() || activeStreaming}
                  className={`flex h-8 w-8 shrink-0 items-center justify-center transition ${
                    inputPrompt.trim()
                      ? "bg-[#b8f6dd] text-[#07110d] hover:bg-[#d7f8ec]"
                      : "bg-white/[0.04] text-[#65737b]"
                  }`}
                  title="Send message"
                  aria-label="Send message"
                >
                  <Send className="h-[15px] w-[15px]" />
                </button>
              )}
            </div>

            <div className="mt-1.5 flex items-center justify-between px-1 font-mono text-[8px] uppercase tracking-[0.1em] text-[#65737b]">
              <span title={`${fmtTokens(contextStats.left)} tokens left · ${compactAt ? `auto-compact ${fmtTokens(compactAt)}` : "no auto-compact"}`}>
                50 bps · ctx {fmtTokens(contextStats.used)}/{fmtTokens(contextLimit)}
              </span>
              <button onClick={() => setShowDepositModal(true)} className="transition hover:text-[#b8f6dd]">
                ${balanceUsd.toFixed(4)} USD
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* ============================================================== */}
      {/* 3. DEPOSIT MODAL WITH 1-CLICK WEB3 & ANTI-SNATCHING SECURITY   */}
      {/* ============================================================== */}
      {showDepositModal && (
        
        <Portal><div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm select-none">
          <div className="bg-[#0a0f15] border border-[#b8f6dd]/40 rounded-[4px] max-w-md w-full p-5 space-y-4 shadow-2xl relative font-mono text-xs">
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
              <Coins className="w-5 h-5 text-[#b8f6dd]" />
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
                    ? "border-[#b8f6dd] text-[#dff8ef] bg-[#b8f6dd]/10"
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
                    ? "border-[#b8f6dd] text-[#b8f6dd] bg-[#8fa39b]/10"
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
                  Fastest & most secure: transfers USDC directly on <span className="text-[#d7f8ec] font-semibold">Arbitrum One</span> and signs a zero-gas cryptographic proof so <span className="text-[#dff8ef] font-semibold">no front-running bot can steal your deposit</span>.
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
                            ? "bg-[#5f8a7a]/30 border-[#b8f6dd] text-[#dff8ef] shadow-sm"
                            : "bg-[#070a0f] border-slate-800 text-slate-300 hover:border-slate-600"
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
                      className="w-full bg-[#070a0f] border border-slate-800 rounded-[3px] p-2 text-xs text-white outline-none focus:border-[#b8f6dd] font-mono"
                    />
                  </div>
                </div>

                {/* 1-Click Button */}
                <button
                  type="button"
                  onClick={handle1ClickWeb3Deposit}
                  disabled={isDepositingWeb3}
                  className="w-full py-2.5 bg-[#5f8a7a] hover:bg-[#7fae9d] disabled:bg-slate-800 text-white font-bold tracking-wider uppercase text-xs rounded-[3px] transition flex items-center justify-center gap-2 shadow-lg shadow-black/30 active:scale-[0.98]"
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
                  <div className="flex items-center justify-between bg-[#070a0f] border border-slate-800 p-2 rounded-[3px]">
                    <span className="font-mono text-[10.5px] text-[#d7f8ec] truncate max-w-[270px]">
                      {TREASURY_WALLET}
                    </span>
                    <button
                      onClick={copyTreasury}
                      className="p-1 text-slate-400 hover:text-white transition"
                      title="Copy address"
                    >
                      {copiedTreasury ? (
                        <Check className="w-3.5 h-3.5 text-[#b8f6dd]" />
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
                      className="flex-1 bg-[#070a0f] border border-slate-800 rounded-[3px] px-2 py-1.5 text-xs text-white outline-none focus:border-[#b8f6dd] font-mono"
                    />
                    <button
                      onClick={handleVerifyDeposit}
                      disabled={verifyingDeposit || !depositTxHash.trim()}
                      className="px-3 py-1.5 bg-[#5f8a7a] hover:bg-[#8fa39b] disabled:bg-slate-800 text-white rounded-[3px] font-bold tracking-wider text-[11px] transition"
                    >
                      {verifyingDeposit ? "Verifying..." : "Verify"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Status Message */}
            {depositStatus && (
              <div className="text-[10.5px] text-[#e3b8b8] bg-[#d99a9a]/10 border border-[#d99a9a]/20 p-2.5 rounded-[2px] leading-relaxed">
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
                  className="text-[#b8f6dd] hover:text-[#d7f8ec] underline font-semibold transition"
                >
                  Sign In
                </button>
              </p>
            </div>
          </div>
        </div></Portal>
      )}

      {/* ============================================================== */}
      {/* 4. SETTINGS */}
      {showSettingsModal && (
        <Portal>
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-0 backdrop-blur-sm select-none sm:p-6">
            <div className="flex h-[100dvh] w-full flex-col overflow-hidden border border-white/[0.08] bg-[#080c10] shadow-2xl sm:h-[min(760px,88dvh)] sm:w-[min(960px,94vw)] md:flex-row">
              <aside className="flex shrink-0 flex-col border-b border-white/[0.07] bg-[#070a0f] md:w-[208px] md:border-b-0 md:border-r">
                <div className="flex h-[52px] shrink-0 items-center gap-2 border-b border-white/[0.07] px-4">
                  <Settings className="h-3.5 w-3.5 text-[#b8f6dd]" />
                  <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#c9d4d8]">Settings</span>
                </div>
                <nav className="grid grid-cols-4 gap-1 border-b border-white/[0.06] p-2 md:flex md:flex-col md:border-b-0">
                  {([
                    { id: "general", label: "General", Icon: Settings },
                    { id: "search", label: "Web search", Icon: Globe },
                    { id: "mcp", label: "MCP servers", Icon: Server },
                    { id: "account", label: "Account", Icon: User },
                  ] as const).map(({ id, label, Icon }) => {
                    const active = settingsTab === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setSettingsTab(id)}
                        className={`flex flex-col items-center justify-center gap-1 border-l-2 px-1 py-2 text-center transition md:flex-row md:justify-start md:gap-2 md:px-3 md:text-left ${
                          active
                            ? "border-[#b8f6dd] bg-white/[0.045] text-white"
                            : "border-transparent text-[#8b989e] hover:bg-white/[0.025] hover:text-white"
                        }`}
                      >
                        <Icon className={`h-3.5 w-3.5 ${active ? "text-[#b8f6dd]" : "text-[#65737b]"}`} />
                        <span className="font-mono text-[7px] uppercase tracking-[0.06em] md:text-[9px] md:tracking-[0.1em]">{label}</span>
                      </button>
                    );
                  })}
                </nav>
                <div className="mt-auto hidden border-t border-white/[0.07] px-4 py-3 md:block">
                  <div className="font-mono text-[8px] uppercase tracking-[0.14em] text-[#65737b]">Current chat</div>
                  <div className="mt-1 truncate text-[10px] text-[#9aa7ad]">{activeSession.title}</div>
                  <div className="mt-2 font-mono text-[8px] uppercase tracking-[0.12em] text-[#65737b]">50 bps · Sepolia</div>
                </div>
              </aside>

              <section className="flex min-h-0 flex-1 flex-col">
                <div className="flex h-[52px] shrink-0 items-center justify-between border-b border-white/[0.07] px-5">
                  <h2 className="text-[14px] font-medium text-white">
                    {settingsTab === "general" ? "General" : settingsTab === "search" ? "Web search" : settingsTab === "mcp" ? "MCP servers" : "Account"}
                  </h2>
                  <button
                    onClick={() => setShowSettingsModal(false)}
                    className="p-1.5 text-[#8b989e] transition hover:text-white"
                    aria-label="Close settings"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7">
                  <div className="max-w-2xl">
                    {settingsTab === "general" && (
                      <div className="space-y-7">
                        <div>
                          <div className="flex items-baseline justify-between gap-3">
                            <div>
                              <div className="text-[13px] font-medium text-white">Thinking level</div>
                              <p className="mt-0.5 text-[11px] leading-relaxed text-[#8b989e]">How much reasoning the model spends before answering. Higher costs more output tokens.</p>
                            </div>
                            <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#b8f6dd]">{activeSession.think || "medium"}</span>
                          </div>
                          <div className="mt-3 grid grid-cols-4 gap-1">
                            {(["off", "low", "medium", "high"] as ThinkLevel[]).map((level) => (
                              <button
                                key={level}
                                type="button"
                                onClick={() => updateThinkLevel(level)}
                                className={`border py-1.5 font-mono text-[9px] uppercase tracking-[0.1em] transition ${
                                  (activeSession.think || "medium") === level
                                    ? "border-[#b8f6dd]/35 bg-[#b8f6dd]/[0.08] text-[#dff8ef]"
                                    : "border-white/[0.07] text-[#8b989e] hover:border-white/15 hover:text-white"
                                }`}
                              >
                                {level}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="border-t border-white/[0.07] pt-5">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <div className="text-[13px] font-medium text-white">Temperature</div>
                              <p className="mt-0.5 text-[11px] leading-relaxed text-[#8b989e]">Lower is more deterministic; higher is more varied.</p>
                            </div>
                            <span className="font-mono text-[10px] text-[#b8f6dd]">{temperature.toFixed(2)}</span>
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
                            className="mt-3 h-1 w-full cursor-pointer bg-white/10 accent-[#b8f6dd]"
                          />
                        </div>

                        <div className="border-t border-white/[0.07] pt-5">
                          <div className="mb-3 text-[13px] font-medium text-white">Attachments</div>
                          <div className="flex items-start justify-between gap-4 py-2">
                            <div>
                              <div className="text-[11.5px] text-[#c9d4d8]">Show force OCR toggle</div>
                              <p className="mt-0.5 text-[10px] leading-relaxed text-[#65737b]">Reveals the OCR switch for PDF attachments.</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const next = !showForcePdfOcrToggle;
                                setShowForcePdfOcrToggle(next);
                                localStorage.setItem("vrxl_show_force_pdf_ocr", next ? "1" : "0");
                                saveChatSettings({ showForcePdfOcrToggle: next });
                              }}
                              aria-pressed={showForcePdfOcrToggle}
                              className={`shrink-0 border px-2 py-1 font-mono text-[8px] uppercase tracking-[0.1em] ${
                                showForcePdfOcrToggle ? "border-[#b8f6dd]/30 bg-[#b8f6dd]/[0.08] text-[#b8f6dd]" : "border-white/[0.08] text-[#8b989e]"
                              }`}
                            >
                              {showForcePdfOcrToggle ? "On" : "Off"}
                            </button>
                          </div>
                          {showForcePdfOcrToggle && (
                            <div className="flex items-start justify-between gap-4 border-t border-white/[0.06] py-2">
                              <div>
                                <div className="text-[11.5px] text-[#c9d4d8]">Force PDF OCR</div>
                                <p className="mt-0.5 text-[10px] leading-relaxed text-[#65737b]">OCR every page, including pages with a text layer. Slower.</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const next = !forcePdfOcr;
                                  setForcePdfOcr(next);
                                  localStorage.setItem("vrxl_force_pdf_ocr", next ? "1" : "0");
                                  saveChatSettings({ forcePdfOcr: next });
                                }}
                                aria-pressed={forcePdfOcr}
                                className={`shrink-0 border px-2 py-1 font-mono text-[8px] uppercase tracking-[0.1em] ${
                                  forcePdfOcr ? "border-[#d99a9a]/30 bg-[#d99a9a]/[0.08] text-[#e3b8b8]" : "border-white/[0.08] text-[#8b989e]"
                                }`}
                              >
                                {forcePdfOcr ? "On" : "Off"}
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="border-t border-white/[0.07] pt-5">
                          <div className="text-[13px] font-medium text-white">Current session</div>
                          <div className="mt-3 grid grid-cols-2 gap-4">
                            <div>
                              <div className="font-mono text-[8px] uppercase tracking-[0.14em] text-[#65737b]">Model</div>
                              <div className="mt-1 text-[11px] text-[#c9d4d8]">{currentModelConfig.name}</div>
                            </div>
                            <div>
                              <div className="font-mono text-[8px] uppercase tracking-[0.14em] text-[#65737b]">Messages</div>
                              <div className="mt-1 text-[11px] text-[#c9d4d8]">{activeSession.messages.length}</div>
                            </div>
                          </div>
                        </div>

                        <div className="border-t border-white/[0.07] pt-5">
                          <div className="text-[13px] font-medium text-white">Keyboard</div>
                          <div className="mt-3 space-y-2">
                            <div className="flex items-center justify-between gap-3 text-[11px] text-[#8b989e]">
                              <span>New chat</span>
                              <kbd className="border border-white/[0.09] px-1.5 py-0.5 font-mono text-[9px] text-[#c9d4d8]">⌘ / Ctrl ⇧ O</kbd>
                            </div>
                            <div className="flex items-center justify-between gap-3 text-[11px] text-[#8b989e]">
                              <span>Focus composer</span>
                              <kbd className="border border-white/[0.09] px-1.5 py-0.5 font-mono text-[9px] text-[#c9d4d8]">⌘ / Ctrl K</kbd>
                            </div>
                          </div>
                        </div>

                        {currentModelConfig.contextTokens >= 40_000 && (
                          <div className="border-t border-white/[0.07] pt-5">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <div className="text-[13px] font-medium text-white">Vega-Lite charts</div>
                                <p className="mt-0.5 max-w-lg text-[11px] leading-relaxed text-[#8b989e]">Lets the model render charts inline. The tool returns usage info and renders the spec.</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const next = !chartToolEnabled;
                                  setChartToolEnabled(next);
                                  localStorage.setItem("vrxl_chart_tool", next ? "1" : "0");
                                  saveChatSettings({ chartTool: next });
                                }}
                                aria-pressed={chartToolEnabled}
                                className={`shrink-0 border px-2 py-1 font-mono text-[8px] uppercase tracking-[0.1em] ${
                                  chartToolEnabled ? "border-[#b8f6dd]/30 bg-[#b8f6dd]/[0.08] text-[#b8f6dd]" : "border-white/[0.08] text-[#8b989e]"
                                }`}
                              >
                                {chartToolEnabled ? "On" : "Off"}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {settingsTab === "search" && (
                      <div className="space-y-7">
                        <div className="flex items-start justify-between gap-5">
                          <div>
                            <div className="text-[13px] font-medium text-white">Web search tool</div>
                            <p className="mt-1 max-w-lg text-[11px] leading-relaxed text-[#8b989e]">
                              On by default. On 1M-context models the model calls search when it needs current information. The globe in the composer searches this message on any model.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const next = !searchToolEnabled;
                              setSearchToolEnabled(next);
                              localStorage.setItem("vrxl_search_tool", next ? "1" : "0");
                              saveChatSettings({ searchTool: next });
                            }}
                            aria-pressed={searchToolEnabled}
                            className={`mt-0.5 shrink-0 border px-2 py-1 font-mono text-[8px] uppercase tracking-[0.1em] ${
                              searchToolEnabled ? "border-[#b8f6dd]/30 bg-[#b8f6dd]/[0.08] text-[#b8f6dd]" : "border-white/[0.08] text-[#8b989e]"
                            }`}
                          >
                            {searchToolEnabled ? "On" : "Off"}
                          </button>
                        </div>

                        <div className="border-t border-white/[0.07] pt-5">
                          <div className="text-[13px] font-medium text-white">Provider</div>
                          <p className="mt-0.5 text-[11px] leading-relaxed text-[#8b989e]">Requests go through Verxl's server-side proxy, so browser CORS does not block the provider.</p>
                          <select
                            value={searchProvider}
                            onChange={(e) => {
                              setSearchProvider(e.target.value);
                              localStorage.setItem("vrxl_search_provider", e.target.value);
                              saveChatSettings({ searchProvider: e.target.value });
                            }}
                            className="mt-3 w-full border border-white/[0.09] bg-[#0b1117] px-3 py-2 text-[11.5px] text-white outline-none focus:border-[#b8f6dd]/50"
                          >
                            <option value="firecrawl">Firecrawl — keyless via Verxl</option>
                            <option value="exa">Exa — own key</option>
                            <option value="brave">Brave Search — own key</option>
                            <option value="custom">Custom endpoint — own key</option>
                          </select>
                        </div>

                        {searchProvider !== "firecrawl" && (
                          <div className="border-t border-white/[0.07] pt-5">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <div className="text-[13px] font-medium text-white">{searchProvider === "exa" ? "Exa API key" : searchProvider === "brave" ? "Brave API key" : "API key"}</div>
                                <p className="mt-0.5 text-[11px] text-[#8b989e]">Stored in this conversation's settings; sent only to the Verxl search proxy.</p>
                              </div>
                            </div>
                            <div className="relative mt-3">
                              <input
                                type={showSearchKey ? "text" : "password"}
                                placeholder={searchProvider === "exa" ? "Exa API key" : searchProvider === "brave" ? "Brave Search API key" : "Bearer token (optional)"}
                                value={searchKey}
                                onChange={(e) => {
                                  setSearchKey(e.target.value);
                                  localStorage.setItem("vrxl_search_key", e.target.value);
                                  saveChatSettings({ searchKey: e.target.value });
                                }}
                                className="w-full border border-white/[0.09] bg-[#0b1117] px-3 py-2 pr-9 text-[11.5px] text-white placeholder-[#65737b] outline-none focus:border-[#b8f6dd]/50"
                              />
                              <button
                                type="button"
                                onClick={() => setShowSearchKey((v) => !v)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#65737b] transition hover:text-white"
                                title={showSearchKey ? "Hide key" : "Show key"}
                              >
                                {showSearchKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                              </button>
                            </div>
                          </div>
                        )}

                        {searchProvider === "custom" && (
                          <div className="border-t border-white/[0.07] pt-5">
                            <div className="text-[13px] font-medium text-white">Custom endpoint</div>
                            <input
                              type="url"
                              placeholder="https://your-search.example/search"
                              value={searchBaseUrl}
                              onChange={(e) => {
                                setSearchBaseUrl(e.target.value);
                                localStorage.setItem("vrxl_search_base", e.target.value);
                                saveChatSettings({ searchBaseUrl: e.target.value });
                              }}
                              className="mt-3 w-full border border-white/[0.09] bg-[#0b1117] px-3 py-2 text-[11.5px] text-white placeholder-[#65737b] outline-none focus:border-[#b8f6dd]/50"
                            />
                            <p className="mt-2 text-[10px] leading-relaxed text-[#65737b]">POST {"{query, limit}"}; return a JSON array or an object with results/web.</p>
                          </div>
                        )}

                        <div className="flex items-center justify-between gap-4 border-t border-white/[0.07] pt-5">
                          <div>
                            <div className="text-[13px] font-medium text-white">Search context</div>
                            <p className="mt-0.5 text-[11px] leading-relaxed text-[#8b989e]">How much retrieved text is passed to the model.</p>
                          </div>
                          {currentModelConfig.contextTokens < 40_000 ? (
                            <select
                              value={activeSession.searchBudget ?? 512}
                              onChange={(e) => {
                                const budget = Number(e.target.value);
                                const updated = { ...activeSession, searchBudget: budget, updatedAt: Date.now() };
                                setSessions((prev) => prev.map((s) => (s.id === activeSession.id ? updated : s)));
                                syncSessionToDb(updated);
                              }}
                              className="shrink-0 border border-white/[0.09] bg-[#0b1117] px-2 py-1.5 font-mono text-[9px] text-[#c9d4d8] outline-none focus:border-[#b8f6dd]/50"
                            >
                              {[256, 512, 1024, 2048, -1].map((n) => (
                                <option key={n} value={n}>{n === -1 ? "Max" : `${n} tokens`}</option>
                              ))}
                            </select>
                          ) : (
                            <span className="shrink-0 font-mono text-[9px] uppercase tracking-[0.1em] text-[#65737b]">Full context</span>
                          )}
                        </div>

                        <p className="border-l-2 border-[#b8f6dd]/25 pl-3 text-[10px] leading-relaxed text-[#65737b]">
                          The proxy is <span className="text-[#c9d4d8]">/api/search</span>. It supports Exa, Brave, Firecrawl and public HTTPS custom endpoints. Keys are not logged.
                        </p>
                      </div>
                    )}

                    {settingsTab === "mcp" && (
                      <div className="space-y-7">
                        <div>
                          <div className="text-[13px] font-medium text-white">Connected MCP servers</div>
                          <p className="mt-1 max-w-lg text-[11px] leading-relaxed text-[#8b989e]">
                            Remote Streamable HTTP servers available to this conversation. Add one from the official registry or by URL.
                          </p>
                          <div className="mt-3 space-y-1.5">
                            {mcpConnections.length === 0 ? (
                              <div className="border border-dashed border-white/[0.09] px-4 py-5 text-center">
                                <Server className="mx-auto h-4 w-4 text-[#65737b]" />
                                <p className="mt-2 text-[11px] text-[#8b989e]">No MCP servers connected yet.</p>
                              </div>
                            ) : (
                              mcpConnections.map((c) => (
                                <div key={c.url} className="flex items-center justify-between gap-3 border border-white/[0.07] bg-[#0b1117] px-3 py-2.5">
                                  <div className="min-w-0">
                                    <div className="truncate text-[11.5px] text-[#d7e2de]">{c.name}</div>
                                    <div className="truncate font-mono text-[9px] text-[#65737b]">{c.url}</div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => removeMcpServer(c.url)}
                                    className="shrink-0 font-mono text-[8px] uppercase tracking-[0.1em] text-[#8b989e] transition hover:text-[#d99a9a]"
                                  >
                                    Remove
                                  </button>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        <div className="border-t border-white/[0.07] pt-5">
                          <div className="text-[13px] font-medium text-white">Add by URL</div>
                          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1.6fr_auto]">
                            <input
                              value={mcpManualName}
                              onChange={(e) => setMcpManualName(e.target.value)}
                              placeholder="Name (optional)"
                              className="border border-white/[0.09] bg-[#0b1117] px-3 py-2 text-[11px] text-white placeholder-[#65737b] outline-none focus:border-[#b8f6dd]/50"
                            />
                            <input
                              value={mcpManualUrl}
                              onChange={(e) => setMcpManualUrl(e.target.value)}
                              placeholder="https://mcp.example.com/mcp"
                              className="border border-white/[0.09] bg-[#0b1117] px-3 py-2 text-[11px] text-white placeholder-[#65737b] outline-none focus:border-[#b8f6dd]/50"
                            />
                            <button
                              type="button"
                              disabled={!/^https?:\/\//.test(mcpManualUrl.trim())}
                              onClick={() => {
                                const url = mcpManualUrl.trim();
                                if (!/^https?:\/\//.test(url)) return;
                                addMcpServer(mcpManualName.trim() || url, url);
                                setMcpManualName("");
                                setMcpManualUrl("");
                              }}
                              className="border border-[#b8f6dd]/25 px-3 py-2 font-mono text-[9px] uppercase tracking-[0.1em] text-[#b8f6dd] transition hover:border-[#b8f6dd]/60 disabled:cursor-not-allowed disabled:border-white/[0.06] disabled:text-[#65737b]"
                            >
                              Add
                            </button>
                          </div>
                        </div>

                        <div className="border-t border-white/[0.07] pt-5">
                          <div className="flex items-baseline justify-between gap-3">
                            <div>
                              <div className="text-[13px] font-medium text-white">Registry search</div>
                              <p className="mt-0.5 text-[11px] text-[#8b989e]">Search the official MCP registry by name, package or description.</p>
                            </div>
                            <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-[#65737b]">registry.modelcontextprotocol.io</span>
                          </div>
                          <div className="mt-3 flex gap-2">
                            <input
                              value={mcpQuery}
                              onChange={(e) => setMcpQuery(e.target.value)}
                              onKeyDown={(e) => { if (e.key === "Enter") void searchMcpRegistry(); }}
                              placeholder="filesystem, github, postgres…"
                              className="min-w-0 flex-1 border border-white/[0.09] bg-[#0b1117] px-3 py-2 text-[11px] text-white placeholder-[#65737b] outline-none focus:border-[#b8f6dd]/50"
                            />
                            <button
                              type="button"
                              onClick={() => void searchMcpRegistry()}
                              className="border border-[#b8f6dd]/25 px-3 py-2 font-mono text-[9px] uppercase tracking-[0.1em] text-[#b8f6dd] transition hover:border-[#b8f6dd]/60"
                            >
                              Search
                            </button>
                          </div>
                          {mcpLoading && <div className="mt-2 font-mono text-[9px] text-[#8b989e]">Searching registry…</div>}
                          {mcpError && <div className="mt-2 font-mono text-[9px] text-[#d99a9a]">{mcpError}</div>}
                          {mcpResults.length > 0 && (
                            <div className="mt-3 max-h-[320px] space-y-1.5 overflow-y-auto pr-1">
                              {mcpResults.map((entry: any, i: number) => {
                                const srv = entry.server;
                                const remote = srv?.remotes?.find((r: any) => r.type === "streamable-http");
                                return (
                                  <div key={`${srv?.name}_${i}`} className="border border-white/[0.07] bg-[#0b1117] p-2.5">
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="min-w-0">
                                        <div className="truncate text-[11.5px] text-[#d7e2de]">{srv?.name}</div>
                                        {srv?.description && <div className="mt-0.5 line-clamp-2 text-[10px] leading-relaxed text-[#8b989e]">{srv.description}</div>}
                                        {remote?.url && <div className="mt-1 truncate font-mono text-[8px] text-[#65737b]">{remote.url}</div>}
                                      </div>
                                      {remote ? (
                                        <button
                                          type="button"
                                          onClick={() => addMcpServer(srv.name, remote.url)}
                                          className="shrink-0 border border-[#b8f6dd]/25 px-2 py-1 font-mono text-[8px] uppercase tracking-[0.1em] text-[#b8f6dd] transition hover:border-[#b8f6dd]/60"
                                        >
                                          Add
                                        </button>
                                      ) : (
                                        <span className="shrink-0 font-mono text-[8px] text-[#65737b]">No remote</span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                          {!mcpLoading && !mcpError && mcpResults.length === 0 && (
                            <div className="mt-3 text-[10px] text-[#65737b]">Search the registry to see available remote servers.</div>
                          )}
                        </div>

                        <p className="text-[10px] leading-relaxed text-[#65737b]">MCP execution proxy is not wired yet: adding a server stores the connection for the next release.</p>
                      </div>
                    )}

                    {settingsTab === "account" && (
                      <div className="space-y-7">
                        <div>
                          <div className="text-[13px] font-medium text-white">Signed in</div>
                          {user ? (
                            <div className="mt-2 border border-white/[0.07] bg-[#0b1117] p-3">
                              <div className="break-all text-[11.5px] text-[#d7e2de]">{user.email || user.id}</div>
                              {user.wallet_address && <div className="mt-1 break-all font-mono text-[9px] text-[#65737b]">{user.wallet_address}</div>}
                            </div>
                          ) : (
                            <div className="mt-2">
                              <p className="text-[11px] text-[#8b989e]">Not signed in. Sign in to sync conversations and use the API console.</p>
                              <button
                                type="button"
                                onClick={() => { setShowSettingsModal(false); setShowAuthModal(true); }}
                                className="mt-3 border border-[#b8f6dd]/25 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.1em] text-[#b8f6dd]"
                              >
                                Sign in
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="border-t border-white/[0.07] pt-5">
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <div className="text-[13px] font-medium text-white">Chat encryption</div>
                              <p className="mt-0.5 text-[11px] leading-relaxed text-[#8b989e]">
                                {cryptoStatus === "ready" ? "AES-256-GCM with a wallet-derived key." : cryptoStatus === "unavailable" ? "No wallet provider in this browser; messages stay local." : "Sync is off. Messages stay on this device."}
                              </p>
                              {cryptoError && <div className="mt-1 text-[9.5px] text-[#d99a9a]">{cryptoError}</div>}
                            </div>
                            {cryptoStatus === "locked" && (
                              <button
                                type="button"
                                onClick={unlockChatSync}
                                className="shrink-0 border border-[#b8f6dd]/25 px-2 py-1 font-mono text-[8px] uppercase tracking-[0.1em] text-[#b8f6dd]"
                              >
                                Enable
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-4 border-t border-white/[0.07] pt-5">
                          <div>
                            <div className="text-[13px] font-medium text-white">Balance</div>
                            <p className="mt-0.5 text-[11px] text-[#8b989e]">Prepaid inference balance on Arbitrum.</p>
                          </div>
                          <div className="text-right">
                            <div className="font-mono text-[14px] text-[#b8f6dd]">${balanceUsd.toFixed(4)}</div>
                            <button type="button" onClick={() => { setShowSettingsModal(false); setShowDepositModal(true); }} className="mt-1 font-mono text-[8px] uppercase tracking-[0.1em] text-[#8b989e] hover:text-white">Deposit</button>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 border-t border-white/[0.07] pt-5">
                          {onNavigate && (
                            <button
                              type="button"
                              onClick={() => { setShowSettingsModal(false); onNavigate("console"); }}
                              className="border border-white/[0.09] px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.1em] text-[#c9d4d8] transition hover:border-white/20 hover:text-white"
                            >
                              API keys
                            </button>
                          )}
                          {user && (
                            <button
                              type="button"
                              onClick={() => { setShowSettingsModal(false); logout(); }}
                              className="border border-[#d99a9a]/20 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.1em] text-[#d99a9a] transition hover:border-[#d99a9a]/50"
                            >
                              Sign out
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            </div>
          </div>
        </Portal>
      )}

      {/* 5. SHARED AUTH & LOGIN MODAL (API KEY & EMAIL OTP)            */}
      {/* ============================================================== */}
      {showAuthModal && (
        
        <Portal><div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm select-none">
          <div className="bg-[#0a0f15] border border-[#b8f6dd]/40 rounded-[4px] max-w-md w-full p-6 space-y-4 shadow-2xl relative font-mono text-xs">
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
              <ShieldCheck className="w-5 h-5 text-[#b8f6dd]" />
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
                    ? "border-[#b8f6dd] text-[#dff8ef] bg-[#b8f6dd]/10"
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
                    ? "border-[#b8f6dd] text-[#b8f6dd] bg-[#8fa39b]/10"
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
              <div className="text-[11px] text-[#dff8ef] bg-[#b8f6dd]/10 border border-[#b8f6dd]/20 p-2.5 rounded-[2px]">
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
                    if (typeof window !== "undefined" && !(window as any).ethereum) {
                      if (openMetaMaskOnMobile()) {
                        setAuthError(null);
                        setAuthSuccess("Opening MetaMask… finish connecting there.");
                        return;
                      }
                      setAuthError("Open this page inside MetaMask on your phone, or install the extension.");
                      return;
                    }
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
                  className="w-full py-2.5 bg-[#5f8a7a] hover:bg-[#7fae9d] text-white font-bold tracking-wider uppercase text-xs rounded-[3px] transition flex items-center justify-center gap-2 shadow-lg shadow-black/30 active:scale-[0.98]"
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
                        className="w-full bg-[#070a0f] border border-slate-800 rounded-[3px] p-2 text-xs text-white outline-none focus:border-[#b8f6dd] font-mono"
                        autoFocus
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={authLoading || !emailInput.trim()}
                      className="w-full py-2 bg-[#5f8a7a] hover:bg-[#8fa39b] disabled:bg-slate-800 text-white font-bold tracking-wider uppercase text-xs rounded-[3px] transition flex items-center justify-center gap-2"
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
                        className="w-full bg-[#070a0f] border border-slate-800 rounded-[3px] p-2 text-center text-lg tracking-[0.3em] text-white outline-none focus:border-[#b8f6dd] font-mono font-bold"
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
                        className="flex-1 py-2 bg-[#5f8a7a] hover:bg-[#8fa39b] disabled:bg-slate-800 text-white font-bold tracking-wider uppercase text-xs rounded-[3px] transition"
                      >
                        {authLoading ? "Verifying..." : "Verify & Sign In"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div></Portal>
      )}
    </div>
  );
};
