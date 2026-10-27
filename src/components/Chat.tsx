import React, { useState, useEffect, useRef } from "react";
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
  ShieldCheck,
  Coins,
  Terminal,
  Cpu,
  X,
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

const AVAILABLE_MODELS = [
  {
    id: "qwen3.5-4b-uncensored-32k",
    name: "Bulbasaur Qwen 3.5 4B Uncensored (32k)",
    tag: "High-Throughput Resident Node",
    promptRate: 0.05,
    completionRate: 0.1,
    context: "32,768 tokens",
    speed: "~52 TPS",
    description: "Resident Bare-Metal cluster in Prague. Zero reload latency, uncensored institutional precision.",
  },
  {
    id: "deepseek-v4.1-flash",
    name: "DeepSeek V4.1 Flash (128k)",
    tag: "Deep Reasoning & Quantitative Code",
    promptRate: 0.14,
    completionRate: 0.28,
    context: "131,072 tokens",
    speed: "~45 TPS",
    description: "Multi-head latent reasoning engine with explicit thought traces and theorem proving.",
  },
  {
    id: "mimo-v2.6-flash",
    name: "Xiaomi MiMo v2.6 Flash (128k)",
    tag: "High-Concurrency Systems Engine",
    promptRate: 0.1,
    completionRate: 0.2,
    context: "131,072 tokens",
    speed: "~60 TPS",
    description: "Ultra-fast distributed inference optimized for high-concurrency smart contract engineering.",
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

export const Chat: React.FC = () => {
  // Session State
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("vrxl_chat_sessions_v2");
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    const initialSession: ChatSession = {
      id: `chat_${Date.now()}`,
      title: "New Chat",
      model: "qwen3.5-4b-uncensored-32k",
      systemPrompt: DEFAULT_SYSTEM_PROMPT,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    return [initialSession];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    return sessions[0]?.id || `chat_${Date.now()}`;
  });

  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];

  // User & Balance State
  const [authToken, setAuthToken] = useState<string | null>(() => {
    return typeof window !== "undefined" ? localStorage.getItem("vrxl_auth_token") : null;
  });
  const [customApiKey, setCustomApiKey] = useState<string>(() => {
    return typeof window !== "undefined" ? localStorage.getItem("vrxl_custom_api_key") || "" : "";
  });
  const [balanceUsd, setBalanceUsd] = useState<number>(0.0);
  const [userEmail, setUserEmail] = useState<string | null>(null);

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
  const [grantLoading, setGrantLoading] = useState(false);
  const [grantMessage, setGrantMessage] = useState<string | null>(null);

  // Deposit verification
  const [depositTxHash, setDepositTxHash] = useState("");
  const [verifyingDeposit, setVerifyingDeposit] = useState(false);
  const [depositStatus, setDepositStatus] = useState<string | null>(null);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Save sessions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("vrxl_chat_sessions_v2", JSON.stringify(sessions));
    } catch {}
  }, [sessions]);

  // Fetch user profile & balance
  const fetchBalance = async (tokenToUse?: string) => {
    const activeToken = tokenToUse || authToken;
    if (!activeToken) return;
    try {
      const res = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${activeToken}` },
      });
      if (res.ok) {
        const data = (await res.json()) as any;
        if (data?.user) {
          setBalanceUsd(Number(data.user.balance_usd || 0.0));
          setUserEmail(data.user.email || null);
        }
      }
    } catch {
      // offline/mock
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [authToken]);

  // Auto-resize textarea as user types
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [inputPrompt]);

  // Auto-scroll messages during streaming
  useEffect(() => {
    if (messagesEndRef.current && isStreaming) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [streamingContent, streamingReasoning, isStreaming]);

  // Create New Chat Session
  const createNewSession = () => {
    const newSession: ChatSession = {
      id: `chat_${Date.now()}`,
      title: "New Chat",
      model: activeSession?.model || "qwen3.5-4b-uncensored-32k",
      systemPrompt: activeSession?.systemPrompt || DEFAULT_SYSTEM_PROMPT,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setInputPrompt("");
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  // Delete Chat Session
  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessions((prev) => {
      const filtered = prev.filter((s) => s.id !== id);
      if (filtered.length === 0) {
        const blank: ChatSession = {
          id: `chat_${Date.now()}`,
          title: "New Chat",
          model: "qwen3.5-4b-uncensored-32k",
          systemPrompt: DEFAULT_SYSTEM_PROMPT,
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
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
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title: editTitleText.trim(), updatedAt: Date.now() } : s))
    );
    setEditingTitleId(null);
  };

  // Claim Academic Evaluation Test Grant ($1.00 USD)
  const handleClaimGrant = async () => {
    setGrantLoading(true);
    setGrantMessage(null);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (authToken) headers["Authorization"] = `Bearer ${authToken}`;

      const res = await fetch("/api/chat/grant", {
        method: "POST",
        headers,
        body: JSON.stringify({}),
      });

      const data = (await res.json()) as any;
      if (res.ok && data.token) {
        localStorage.setItem("vrxl_auth_token", data.token);
        setAuthToken(data.token);
        setBalanceUsd(Number(data.user?.balance_usd || 1.00));
        setUserEmail(data.user?.email || "Academic Evaluator");
        setGrantMessage("Success! $1.00 Academic Test Credit granted.");
        setTimeout(() => setGrantMessage(null), 4000);
      } else {
        setGrantMessage(data.error || "Unable to claim grant.");
      }
    } catch (err: any) {
      setGrantMessage("Error connecting to grant server.");
    } finally {
      setGrantLoading(false);
    }
  };

  // Verify Arbitrum USDC Deposit
  const handleVerifyDeposit = async () => {
    if (!depositTxHash.trim()) return;
    setVerifyingDeposit(true);
    setDepositStatus(null);
    try {
      const res = await fetch("/api/deposit/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken || ""}`,
        },
        body: JSON.stringify({
          tx_hash: depositTxHash.trim(),
        }),
      });

      const data = (await res.json()) as any;
      if (res.ok && data.success) {
        setDepositStatus(`Deposit confirmed! +$${Number(data.deposit?.amount_usd || 0).toFixed(2)} USD added.`);
        setBalanceUsd(Number(data.deposit?.new_balance_usd || balanceUsd));
        fetchBalance();
        setDepositTxHash("");
      } else {
        setDepositStatus(`Verification note: ${data.error || "Transaction pending confirmation on Arbitrum."}`);
      }
    } catch (err) {
      setDepositStatus("Network error verifying transaction.");
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

    // Check balance if authenticated
    if (authorizationHeader && balanceUsd <= 0.0 && !customApiKey) {
      setShowDepositModal(true);
      return;
    }

    // If completely unauthenticated, check if we should prompt grant or login
    if (!authorizationHeader) {
      // Auto-grant evaluation test session for zero-friction demoing
      await handleClaimGrant();
      const storedToken = localStorage.getItem("vrxl_auth_token");
      if (storedToken) {
        authorizationHeader = `Bearer ${storedToken}`;
      } else {
        authorizationHeader = "Bearer vrxl_testnet_demo_key";
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

    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSession.id
          ? {
              ...s,
              title: newTitle,
              messages: updatedMessages,
              updatedAt: Date.now(),
            }
          : s
      )
    );

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

      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSession.id
            ? {
                ...s,
                messages: [...s.messages, assistantMessage],
                updatedAt: Date.now(),
              }
            : s
        )
      );

      // Deduct locally and refresh balance from backend
      setBalanceUsd((prev) => Math.max(0, prev - totalCost));
      setTimeout(() => fetchBalance(), 1000);

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
          content += `*Cost: $${m.metrics.costUsd.toFixed(6)} USD • ${m.metrics.completionTokens} tokens*\n\n`;
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

          {/* Quick Academic Test Grant */}
          <button
            onClick={handleClaimGrant}
            disabled={grantLoading}
            className="w-full flex items-center justify-center gap-1.5 py-1 text-[10px] font-mono text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-[2px] transition"
          >
            <ShieldCheck className="w-3 h-3 text-amber-400" />
            <span>{grantLoading ? "Crediting..." : "Claim $1.00 Academic Test Credit"}</span>
          </button>
          {grantMessage && (
            <div className="text-[10px] font-mono text-center text-amber-300 animate-pulse">
              {grantMessage}
            </div>
          )}

          {/* User ID / Address */}
          <div className="flex items-center justify-between text-[10.5px] font-mono text-slate-400 px-1 pt-1">
            <div className="truncate max-w-[170px]" title={userEmail || "Anonymous Session"}>
              {userEmail || "Testnet Session"}
            </div>
            <button
              onClick={() => setShowSettingsModal(true)}
              className="p-1 hover:text-white transition"
              title="Settings"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>
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

              {/* Model Dropdown Menu */}
              {showModelDropdown && (
                <div className="absolute left-0 mt-1.5 w-72 sm:w-80 rounded-[3px] bg-[#0a0e17] border border-blue-500/40 shadow-2xl p-1.5 z-50 space-y-1 font-mono text-xs">
                  <div className="px-2 py-1 text-[10px] uppercase tracking-wider text-slate-400 font-bold border-b border-slate-800">
                    Verified Edge Models (50 bps protocol fee)
                  </div>
                  {AVAILABLE_MODELS.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => {
                        setSessions((prev) =>
                          prev.map((s) => (s.id === activeSession.id ? { ...s, model: m.id } : s))
                        );
                        setShowModelDropdown(false);
                      }}
                      className={`p-2 rounded-[2px] cursor-pointer transition ${
                        activeSession?.model === m.id
                          ? "bg-blue-600/20 border border-blue-500 text-white"
                          : "hover:bg-slate-900 text-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold text-[11.5px]">
                        <span>{m.name}</span>
                        <span className="text-[10px] text-emerald-400 font-semibold">{m.speed}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{m.description}</div>
                      <div className="flex items-center gap-2 text-[9.5px] text-slate-400 mt-1 font-mono">
                        <span>Context: {m.context}</span>
                        <span>•</span>
                        <span>Prompt: ${m.promptRate}/1M</span>
                        <span>•</span>
                        <span>Output: ${m.completionRate}/1M</span>
                      </div>
                    </div>
                  ))}
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
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 select-text scroll-smooth"
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
                          -${msg.metrics.costUsd.toFixed(6)} USD
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
      {/* 3. DEPOSIT MODAL                                               */}
      {/* ============================================================== */}
      {showDepositModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
          <div className="bg-[#0a0e17] border border-blue-500/40 rounded-[4px] max-w-md w-full p-5 space-y-4 shadow-2xl relative font-mono text-xs">
            <button
              onClick={() => setShowDepositModal(false)}
              className="absolute top-3 right-3 text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 text-white">
              <Coins className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider">
                Deposit Arbitrum USDC / Add Balance
              </h3>
            </div>

            <p className="text-slate-300 text-[11px] leading-relaxed">
              Verxl Protocol operates on a non-custodial prepaid clearing balance. Output tokens are verified on-chain and settled at 50 bps protocol fee.
            </p>

            {/* Arbitrum USDC Treasury Address */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider text-slate-400">
                Arbitrum One USDC Deposit Address (Šimon Lead MetaMask):
              </label>
              <div className="flex items-center justify-between bg-[#05070b] border border-slate-800 p-2 rounded-[3px]">
                <span className="font-mono text-[11px] text-blue-300 truncate max-w-[280px]">
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

            {/* Verification Form */}
            <div className="space-y-2 pt-1 border-t border-slate-800/80">
              <label className="text-[10px] uppercase tracking-wider text-slate-400">
                Verify Arbitrum Transaction Hash:
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
              {depositStatus && (
                <div className="text-[10.5px] text-amber-300 bg-amber-500/10 border border-amber-500/30 p-2 rounded-[2px]">
                  {depositStatus}
                </div>
              )}
            </div>

            {/* Academic Evaluation Grant Section */}
            <div className="p-3 bg-blue-950/20 border border-blue-500/30 rounded-[3px] space-y-2">
              <div className="text-[10px] uppercase tracking-wider font-bold text-blue-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Academic Evaluation / Instructor Test Grant</span>
              </div>
              <p className="text-[10.5px] text-slate-300">
                Testing without an Arbitrum wallet? Click below to claim $1.00 USD in testnet compute balance.
              </p>
              <button
                onClick={handleClaimGrant}
                disabled={grantLoading}
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-[3px] transition text-center"
              >
                {grantLoading ? "Processing Grant..." : "Claim $1.00 USD Instant Test Credit"}
              </button>
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

            <div className="flex justify-end gap-2 pt-2">
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
    </div>
  );
};
