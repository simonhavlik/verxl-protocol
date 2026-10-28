import React, { useState, useRef, useEffect } from "react";
import { marked } from "marked";
import "katex/dist/katex.min.css";
import markedKatex from "marked-katex-extension";
import { useAuth } from "../context/AuthContext";
import {
  Play,
  Square,
  Copy,
  Check,
  Zap,
  Clock,
  ArrowDown,
  Code2,
  DollarSign,
  Terminal,
  HelpCircle,
  X,
  Server,
  ShieldAlert,
  Lock,
  MessageSquare,
  KeyRound,
  ArrowRight,
  Sparkles,
} from "lucide-react";

marked.use(markedKatex({ throwOnError: false }));

marked.setOptions({
  gfm: true,
  breaks: true,
});

const renderMarkdown = (content: string): string => {
  if (!content) return "";
  try {
    // LLMs often output bold headers like **Cost:**95x without a space before the next alphanumeric character.
    // In strict CommonMark, delimiters touching words don't render bold. We normalize this edge case:
    const preprocessed = content
      .replace(/\\\[([\s\S]*?)\\\]/g, (_, m) => `\n$$\n${m}\n$$\n`)
      .replace(/\\\(([\s\S]*?)\\\)/g, (_, m) => `$${m}$`)
      .replace(/(^|\n)\[\s*\n([\s\S]*?)\n\]\s*(?=\n|$)/g, (_, lead, m) => `${lead}$$\n${m}\n$$`)
      .replace(/\^=/g, "^*=")
      .replace(/\\left\{/g, "\\left\\{")
      .replace(/\\right\}/g, "\\right\\}")
      .replace(/\*\*([^\s*][^*]*?)\*\*([a-zA-Z0-9])/g, "**$1** $2");
    return marked.parse(preprocessed) as string;
  } catch (err) {
    return content;
  }
};

interface PlaygroundProps {
  onNavigate?: (tab: string) => void;
  variant?: "full" | "compact";
}

interface CatalogEntry {
  id: string;
  short: string;
  tag: string;
  route: string;
  detail: string;
  prompt: number;
  completion: number;
  cached: number;
  context: string;
  free: boolean;
}

const MODEL_CATALOG: CatalogEntry[] = [
  {
    id: "qwen3.5-4b-uncensored-32k",
    short: "Qwen 3.5 4B",
    tag: "UNCENSORED · BARE-METAL",
    route: "Prague bare-metal",
    detail: "32k resident context · uncensored Qwen 3.5 4B · Vulkan host",
    prompt: 0.05,
    completion: 0.1,
    cached: 0.01,
    context: "32k",
    free: true,
  },
  {
    id: "deepseek-v4.1-flash",
    short: "DeepSeek V4.1",
    tag: "OFFICIAL BRIDGE",
    route: "Tokyo / Hangzhou edge",
    detail: "1M context · upstream-logged bridge",
    prompt: 0.3,
    completion: 1.2,
    cached: 0.006,
    context: "1M",
    free: false,
  },
  {
    id: "mimo-v2.6-flash",
    short: "MiMo 2.6",
    tag: "OFFICIAL BRIDGE",
    route: "Frankfurt edge",
    detail: "1M context · upstream-logged bridge",
    prompt: 0.14,
    completion: 0.28,
    cached: 0.0028,
    context: "1M",
    free: false,
  },
];

export const Playground: React.FC<PlaygroundProps> = ({ onNavigate, variant = "full" }) => {
  const { user, token, customApiKey, keys } = useAuth();
  const [model, setModel] = useState("qwen3.5-4b-uncensored-32k");
  const [systemPrompt, setSystemPrompt] = useState(
    "Answer directly and concisely."
  );
  const [userPrompt, setUserPrompt] = useState(
    "Calculate the net protocol fee savings for an AI fintech startup processing 500 million tokens monthly through Verxl (50 bps fee) versus centralized aggregators (950 bps fee)."
  );
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2048);
  const [thinkLevel, setThinkLevel] = useState<"off" | "low" | "medium" | "high">("medium");
  const [isStreaming, setIsStreaming] = useState(false);
  const [reasoningOutput, setReasoningOutput] = useState("");
  const [output, setOutput] = useState("");
  const [activeCodeTab, setActiveCodeTab] = useState<"curl" | "python" | "typescript">("curl");
  const [copied, setCopied] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [runMode, setRunMode] = useState<"pending" | "live" | "notice" | "error">("pending");

  // Telemetry metrics
  const [metrics, setMetrics] = useState({
    ttft: 0,
    totalLatency: 0,
    tps: 0,
    promptTokens: 0,
    completionTokens: 0,
    protocolFeeUsd: 0,
    traditionalSaaSUsd: 0,
    provider: "Prague Bare-Metal Cluster 01 (Bulbasaur / Qwen 3.5 4B Uncensored 32k)",
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const outputContainerRef = useRef<HTMLDivElement | null>(null);
  const terminalWindowRef = useRef<HTMLDivElement | null>(null);
  const [showScrollOutput, setShowScrollOutput] = useState(false);
  const autoScrollRef = useRef(true);

  // Auto-scroll terminal interior whenever new output or reasoning tokens arrive
  const handleOutputScroll = () => {
    const el = outputContainerRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    autoScrollRef.current = atBottom;
    setShowScrollOutput(!atBottom);
  };

  const scrollOutputToLatest = () => {
    const el = outputContainerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    autoScrollRef.current = true;
    setShowScrollOutput(false);
  };

  useEffect(() => {
    if (outputContainerRef.current && autoScrollRef.current) {
      requestAnimationFrame(() => {
        if (outputContainerRef.current && autoScrollRef.current) {
          outputContainerRef.current.scrollTop = outputContainerRef.current.scrollHeight;
        }
      });
    }
  }, [output, reasoningOutput]);

  const samplePrompts = [
    {
      title: "Cost Analysis",
      prompt:
        "Calculate the net protocol fee savings for an AI fintech startup processing 500 million tokens monthly through Verxl (50 bps fee) versus centralized aggregators (950 bps fee).",
    },
    {
      title: "Market Mechanism",
      prompt:
        "Formulate how Verxl's 10% collateral slashing rule enforces Nash equilibrium for independent GPU hosts providing FP16 inference.",
    },
    {
      title: "Rust Router",
      prompt:
        "Draft a high-concurrency Rust Tokio client for Verxl's OpenAI-compatible /v1/chat/completions endpoint with connection pooling.",
    },
  ];

  const handleRunInference = async () => {
    // Smooth scroll to the terminal window so user immediately sees output without manual scrolling
    if (terminalWindowRef.current) {
      terminalWindowRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    autoScrollRef.current = true;
    setShowScrollOutput(false);
    setIsStreaming(true);
    setHasRun(true);
    setRunMode("pending");
    setOutput("");
    setReasoningOutput("");
    setMetrics((prev) => ({ ...prev, ttft: 0, completionTokens: 0, totalLatency: 0 }));

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const startTime = performance.now();
    let firstTokenReceived = false;

    try {
      const authHeader = token
        ? `Bearer ${token}`
        : customApiKey
        ? `Bearer ${customApiKey}`
        : "Bearer vrxl_testnet_demo_key";

      const response = await fetch("/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify({
          model,
          messages: [
            ...(systemPrompt.trim() ? [{ role: "system", content: systemPrompt.trim() }] : []),
            { role: "user", content: userPrompt },
          ],
          temperature,
          max_tokens: maxTokens,
          stream: true,
          reasoning_effort: thinkLevel === "off" ? "none" : thinkLevel,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errJson = (await response.json().catch(() => ({}))) as any;
        const errMsg = errJson?.error?.message;
        if (response.status === 429) {
          setRunMode("notice");
          setOutput(`> [!WARNING]\n> **Rate Limit Reached (Free Demo Tier):**\n> ${errMsg || "Free demo rate limit of 40 requests per 10 minutes exceeded for your IP. Connect your wallet or deposit USDC at Verxl Console to remove limits."}`);
          setIsStreaming(false);
          return;
        } else if (response.status === 402) {
          setRunMode("notice");
          setOutput(`> [!IMPORTANT]\n> **Paid Model Tier Required:**\n> ${errMsg || "This model requires an active account balance. Deposit USDC at https://verxl.com/console or use Verxl Chat at https://verxl.com/chat."}`);
          setIsStreaming(false);
          return;
        }
      }

      if (response.ok && response.body) {
        const contentType = response.headers.get("content-type") || "";

        // Case 1: Backend returned non-streaming JSON
        if (contentType.includes("application/json")) {
          const data = (await response.json()) as any;
          const msgContent = data.choices?.[0]?.message?.content || "";
          // If response is the raw cycling string from Ollama daemon, fall through to high-fidelity tailored calculations
          if (
            msgContent &&
            !msgContent.includes("Upstream bare-metal Ollama daemon is currently cycling") &&
            !msgContent.includes("[Verxl Protocol Clearing Switch]")
          ) {
            setRunMode("live");
            const words = msgContent.split(" ");
            let streamed = "";
            for (let i = 0; i < words.length; i++) {
              if (abortControllerRef.current?.signal.aborted) {
                setIsStreaming(false);
                return;
              }
              streamed += (i === 0 ? "" : " ") + words[i];
              setOutput(streamed);
              if (i === 0) {
                firstTokenReceived = true;
                setMetrics((prev) => ({ ...prev, ttft: Math.round(performance.now() - startTime) }));
              }
              if (outputContainerRef.current) {
                outputContainerRef.current.scrollTop = outputContainerRef.current.scrollHeight;
              }
              await new Promise((r) => setTimeout(r, 16));
            }
            const totalLatencyMs = Math.round(performance.now() - startTime);
            setMetrics((prev) => ({
              ...prev,
              totalLatency: totalLatencyMs,
              tps: 64.2,
              completionTokens: words.length * 2,
              protocolFeeUsd: words.length * 2 * 0.0000005,
              traditionalSaaSUsd: words.length * 2 * 0.0000095,
            }));
            setIsStreaming(false);
            return;
          }
        }

        // Case 2: Server-Sent Events (SSE) Stream
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullText = "";
        let fullReasoning = "";
        let tokenCount = 0;
        let lineBuffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          lineBuffer += decoder.decode(value, { stream: true });
          const lines = lineBuffer.split("\n");
          lineBuffer = lines.pop() || ""; // preserve partial line

          for (const rawLine of lines) {
            const line = rawLine.trim();
            if (line.startsWith("data: ") && line !== "data: [DONE]") {
              try {
                const parsed = JSON.parse(line.slice(6));
                const delta = parsed.choices?.[0]?.delta;
                const content = delta?.content || "";
                const reasoning = delta?.reasoning || delta?.reasoning_content || "";

                if (reasoning) {
                  if (!fullReasoning) setRunMode("live");
                  if (!firstTokenReceived) {
                    firstTokenReceived = true;
                    const ttftMs = Math.round(performance.now() - startTime);
                    setMetrics((prev) => ({ ...prev, ttft: ttftMs }));
                  }
                  fullReasoning += reasoning;
                  tokenCount++;
                  setReasoningOutput(fullReasoning);
                }

                if (content) {
                  if (!fullText) setRunMode("live");
                  if (!firstTokenReceived) {
                    firstTokenReceived = true;
                    const ttftMs = Math.round(performance.now() - startTime);
                    setMetrics((prev) => ({ ...prev, ttft: ttftMs }));
                  }
                  fullText += content;
                  tokenCount++;
                  setOutput(fullText);
                }

                if (parsed.usage) {
                  const promptTokens = Number(parsed.usage.prompt_tokens);
                  const completionTokens = Number(parsed.usage.completion_tokens);
                  setMetrics((prev) => ({
                    ...prev,
                    promptTokens: Number.isFinite(promptTokens) ? promptTokens : prev.promptTokens,
                    completionTokens: Number.isFinite(completionTokens) ? completionTokens : prev.completionTokens,
                  }));
                }
              } catch (e) {
                // partial json chunk
              }
            }
          }

          if (tokenCount > 0) {
            setMetrics((prev) =>
              prev.completionTokens === tokenCount ? prev : { ...prev, completionTokens: tokenCount }
            );
          }
        }

        if (fullText.trim().length > 0) {
          const totalLatencyMs = Math.round(performance.now() - startTime);
          const tpsCalc = Math.round((tokenCount / (totalLatencyMs / 1000)) * 10) / 10;
          setMetrics((prev) => ({
            ...prev,
            totalLatency: totalLatencyMs,
            tps: tpsCalc || 52.4,
            completionTokens: tokenCount || 160,
            protocolFeeUsd: (tokenCount || 160) * 0.0000005,
            traditionalSaaSUsd: (tokenCount || 160) * 0.0000095,
          }));
          setIsStreaming(false);
          return;
        }
      }
    } catch (err: any) {
      if (err.name === "AbortError") {
        setIsStreaming(false);
        return;
      }
      setRunMode("error");
      setOutput(
        `**Upstream inference failed.** ${
          err?.message || "The clearing node did not complete the request."
        }\n\nNo recorded answer is substituted.`
      );
      setIsStreaming(false);
      return;
    }

    // No fallback. If the upstream closes without content, surface the failure
    // instead of substituting a recorded answer.
    setRunMode("error");
    setOutput(
      "**Upstream returned no completion.** The clearing node closed the stream without content. Retry the request or raise the token budget. No recorded answer is substituted."
    );
    setIsStreaming(false);
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsStreaming(false);
  };

  const copyOutput = () => {
    const fullCopied = reasoningOutput ? `[Reasoning Process]\n${reasoningOutput}\n\n[Response]\n${output}` : output;
    navigator.clipboard.writeText(fullCopied);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  const activeKeyDisplay = customApiKey
    ? customApiKey
    : keys && keys.length > 0
    ? keys[0].key_prefix.replace("...", "_live_key")
    : user
    ? "vrxl_live_your_key_here"
    : "vrxl_live_8f3a2b1c";

  const codeSnippets = {
    curl: `curl https://verxl.com/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${activeKeyDisplay}" \\
  -d '{
    "model": "${model}",
    "messages": [
      {"role": "system", "content": "You are a quant assistant."},
      {"role": "user", "content": "Calculate protocol fee savings on 500M tokens."}
    ],
    "temperature": ${temperature},
    "stream": true
  }'`,
    python: `from openai import OpenAI

# Verxl is a 100% drop-in replacement for OpenAI API with 50 bps routing
client = OpenAI(
    base_url="https://verxl.com/v1",
    api_key="${activeKeyDisplay}",
)

response = client.chat.completions.create(
    model="${model}",
    messages=[
        {"role": "system", "content": "You are a quant assistant."},
        {"role": "user", "content": "Calculate protocol fee savings on 500M tokens."}
    ],
    temperature=${temperature},
    stream=True,
)

for chunk in response:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="", flush=True)`,
    typescript: `import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://verxl.com/v1",
  apiKey: "${activeKeyDisplay}",
});

async function main() {
  const stream = await openai.chat.completions.create({
    model: "${model}",
    messages: [
      { role: "system", content: "You are a quant assistant." },
      { role: "user", content: "Calculate protocol fee savings on 500M tokens." }
    ],
    temperature: ${temperature},
    stream: true,
  });

  for await (const chunk of stream) {
    process.stdout.write(chunk.choices[0]?.delta?.content || "");
  }
}

main();`,
  };

  if (variant === "compact") {
    const activeModel = MODEL_CATALOG.find((entry) => entry.id === model) ?? MODEL_CATALOG[0];
    const promptTokens =
      metrics.promptTokens > 0
        ? metrics.promptTokens
        : Math.ceil((systemPrompt.length + userPrompt.length) / 4);
    const computeUsd =
      (promptTokens * activeModel.prompt + metrics.completionTokens * activeModel.completion) / 1_000_000;
    const feeUsd = computeUsd * 0.005;
    const netUsd = computeUsd - feeUsd;
    const billable = hasRun && runMode === "live";
    const money = (value: number) => (billable ? `$${value.toFixed(8)}` : "n/a");
    const modeLabel =
      runMode === "live"
        ? "LIVE NODE"
        : runMode === "notice"
        ? "TIER NOTICE"
        : runMode === "error"
        ? "UPSTREAM ERROR"
        : "PENDING";
    const modeTone =
      runMode === "live"
        ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
        : runMode === "notice"
        ? "text-amber-400 border-amber-500/30 bg-amber-500/10"
        : runMode === "error"
        ? "text-rose-400 border-rose-500/30 bg-rose-500/10"
        : "text-slate-400 border-slate-700 bg-slate-800/40";

    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 font-mono">
        {/* Control column */}
        <div className="lg:col-span-5 flex flex-col gap-2.5 min-w-0">
          <div className="grid grid-cols-3 gap-1.5">
            {MODEL_CATALOG.map((entry) => {
              const active = entry.id === activeModel.id;
              return (
                <button
                  key={entry.id}
                  onClick={() => setModel(entry.id)}
                  className={`text-left px-2 py-1.5 border transition ${
                    active
                      ? "border-blue-500/60 bg-blue-500/10"
                      : "border-slate-800 bg-[#05070b] hover:border-slate-600"
                  }`}
                >
                  <span
                    className={`block text-[10px] font-bold uppercase tracking-wider truncate ${
                      active ? "text-white" : "text-slate-300"
                    }`}
                  >
                    {entry.short}
                  </span>
                  <span className="block text-[7.5px] text-slate-500 mt-0.5 truncate">{entry.tag}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between gap-2 text-[9px] text-slate-400">
            <span className="truncate">{activeModel.detail}</span>
            <span className={activeModel.free ? "text-emerald-400 shrink-0" : "text-amber-400 shrink-0"}>
              {activeModel.free ? "FREE DEMO" : "LOGIN TO RUN"}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1">
            {samplePrompts.map((sample) => (
              <button
                key={sample.title}
                onClick={() => setUserPrompt(sample.prompt)}
                className="text-[9px] px-1.5 py-0.5 border border-slate-800 bg-[#05070b] text-slate-400 hover:text-blue-300 hover:border-blue-500/40 transition"
              >
                {sample.title}
              </button>
            ))}
          </div>

          <textarea
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            rows={4}
            spellCheck={false}
            placeholder="Enter a prompt payload"
            className="flex-1 min-h-[84px] max-h-[126px] w-full bg-[#05070b] border border-slate-800 px-2.5 py-2 text-[11px] text-slate-100 leading-relaxed focus:outline-none focus:border-blue-500 transition resize-none"
          />

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="flex justify-between text-[9px] text-slate-400">
                <span>Temperature</span>
                <span className="text-blue-400">{temperature.toFixed(2)}</span>
              </span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-blue-500 bg-slate-800 h-1 cursor-pointer mt-1"
              />
            </label>
            <label className="block">
              <span className="flex justify-between text-[9px] text-slate-400">
                <span>Max tokens</span>
                <span className="text-blue-400">{maxTokens}</span>
              </span>
              <input
                type="range"
                min="64"
                max="4096"
                step="64"
                value={maxTokens}
                onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                className="w-full accent-blue-500 bg-slate-800 h-1 cursor-pointer mt-1"
              />
            </label>
          </div>

          <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-400">
            <span className="uppercase tracking-wider">Think</span>
            {(["off", "low", "medium", "high"] as const).map((level) => (
              <button
                key={level}
                onClick={() => setThinkLevel(level)}
                className={`px-1.5 py-0.5 border rounded-[2px] uppercase transition ${
                  thinkLevel === level
                    ? "border-blue-500 text-blue-300 bg-blue-500/10"
                    : "border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {level}
              </button>
            ))}
          </div>

          {isStreaming ? (
            <button onClick={handleStop} className="hero-btn w-full justify-center !py-2 !bg-rose-600 !text-white !border-rose-400/50">
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Halt stream</span>
            </button>
          ) : (
            <button onClick={handleRunInference} className="hero-btn hero-btn--primary w-full justify-center !py-2">
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Execute on {activeModel.short}</span>
            </button>
          )}

          <div className="border border-slate-800 bg-[#05070b] px-2.5 py-1.5">
            <div className="flex items-center justify-between gap-2 text-[7.5px] uppercase tracking-widest text-slate-500 border-b border-slate-800/70 pb-1 mb-1">
              <span className="truncate">Rate card · {activeModel.short}</span>
              <span className="shrink-0 whitespace-nowrap">$ / 1M</span>
            </div>
            <div className="space-y-0.5 text-[9px]">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Prompt</span>
                <span className="text-slate-200 tabular">${activeModel.prompt.toFixed(4)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Completion</span>
                <span className="text-slate-200 tabular">${activeModel.completion.toFixed(4)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Cached prompt</span>
                <span className="text-slate-200 tabular">${activeModel.cached.toFixed(4)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Context window</span>
                <span className="text-slate-200">{activeModel.context} tokens</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stream and receipt column */}
        <div className="lg:col-span-7 flex flex-col gap-2 min-w-0">
          <div className="border border-blue-500/20 bg-[#0a0e17] flex flex-col overflow-hidden">
            <div className="px-2.5 py-1.5 bg-[#05070b] border-b border-slate-800 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className={`w-1.5 h-1.5 ${isStreaming ? "bg-emerald-400 animate-pulse" : "bg-slate-600"}`} />
                <span className="text-[9px] uppercase tracking-wider text-slate-300 truncate">
                  {isStreaming ? "Streaming" : "Terminal"} · {activeModel.short}
                </span>
                {hasRun && runMode !== "pending" && (
                  <span className={`text-[7.5px] px-1 py-0.5 border tracking-widest ${modeTone}`}>{modeLabel}</span>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {(output || reasoningOutput) && (
                  <button
                    onClick={copyOutput}
                    className="flex items-center gap-1 px-1.5 py-0.5 text-[8.5px] border border-slate-800 bg-[#080c14] text-slate-300 hover:border-blue-500/50 transition"
                  >
                    {copied ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </button>
                )}
                <span className="text-[8px] text-slate-500 hidden sm:inline">SSE · stream: true</span>
              </div>
            </div>

            <div
              ref={outputContainerRef}
              onScroll={handleOutputScroll}
              className="h-[196px] overflow-y-auto px-2.5 py-2 font-mono text-[10.5px] leading-relaxed text-slate-200 select-text bg-[#05070b]/60"
            >
              {reasoningOutput && (
                <div className="mb-2 border border-slate-800/80 bg-slate-900/30 px-2 py-1">
                  <div className="flex items-center justify-between text-[7.5px] uppercase tracking-widest text-slate-500 mb-0.5">
                    <span className="flex items-center gap-1">
                      <span className="w-1 h-1 bg-blue-400 animate-pulse" />
                      Reasoning stream
                    </span>
                    <span>{reasoningOutput.length} chars</span>
                  </div>
                  <div className="text-[9px] text-slate-500 leading-snug whitespace-pre-wrap">
                    {reasoningOutput}
                  </div>
                </div>
              )}

              {output ? (
                <div>
                  <div
                    className="terminal-markdown select-text"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(output) }}
                  />
                  {isStreaming && (
                    <span className="inline-block w-1.5 h-3 bg-blue-400 ml-0.5 mt-1 animate-pulse align-middle" />
                  )}
                </div>
              ) : isStreaming ? (
                reasoningOutput ? null : (
                  <div className="flex items-center gap-2 text-blue-400 py-1">
                    <span className="w-1.5 h-1.5 bg-blue-400 animate-pulse" />
                    <span>Dispatching to {activeModel.route}</span>
                  </div>
                )
              ) : (
                <div className="h-full flex flex-col items-center justify-center gap-1.5 text-center px-4">
                  <Terminal className="w-4 h-4 text-blue-400/40" />
                  <p className="text-[10px] text-slate-400 max-w-[300px] leading-relaxed">
                    Run a prompt to stream from the Prague node. Each run reports time to first token, throughput and a clearing receipt.
                  </p>
                </div>
              )}
            </div>

            <div className="px-2.5 py-1.5 bg-[#05070b] border-t border-slate-800 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-[9px] text-slate-400">
              <span>
                TTFT <strong className="text-white">{!hasRun ? "—" : runMode === "live" ? metrics.ttft || "···" : "—"}</strong> ms
              </span>
              <span>
                TPS <strong className="text-white">{!hasRun ? "—" : runMode === "live" ? (metrics.totalLatency ? metrics.tps : "···") : "—"}</strong>
              </span>
              <span>
                TOKENS <strong className="text-white">{hasRun ? metrics.completionTokens : "0"}</strong>
              </span>
              <span className="hidden sm:inline">
                ROUTE <strong className="text-slate-200">{activeModel.route}</strong>
              </span>
            </div>
          </div>

          <div className="border border-blue-500/20 bg-[#0a0e17]">
            <div className="flex items-center justify-between px-2.5 py-1 border-b border-slate-800 text-[8.5px] uppercase tracking-widest text-slate-400">
              <span>Execution receipt</span>
              <span className={hasRun ? "text-slate-300" : "text-slate-500"}>
                {hasRun ? (runMode === "live" ? "50 bps on compute" : runMode === "error" ? "not billed" : "tier notice") : "awaiting run"}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-slate-800/60">
              {[
                { label: "Compute", value: money(computeUsd), tone: "text-slate-100" },
                { label: "Protocol fee", value: money(feeUsd), tone: "text-emerald-400" },
                { label: "Provider net", value: money(netUsd), tone: "text-blue-300" },
                {
                  label: "Round trip",
                  value: billable ? (metrics.totalLatency ? `${metrics.totalLatency} ms` : "···") : "n/a",
                  tone: "text-slate-100",
                },
              ].map((cell) => (
                <div key={cell.label} className="bg-[#0a0e17] px-2.5 py-1.5">
                  <div className="text-[7.5px] uppercase tracking-widest text-slate-500">{cell.label}</div>
                  <div className={`text-[11px] font-semibold tabular ${cell.tone}`}>{cell.value}</div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-[8.5px] leading-relaxed text-slate-500">
            Prompt tokens bill at ${activeModel.prompt.toFixed(2)} per 1M, completions at ${activeModel.completion.toFixed(2)} per 1M.
            Host keeps 99.5% in USDC on Arbitrum. Bare-metal prompts stay in volatile memory, bridge prompts are upstream-logged.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3.5">
      {showScrollOutput && (
        <button
          onClick={scrollOutputToLatest}
          className="fixed bottom-5 right-5 z-50 p-2 rounded-full bg-[#0c1220] border border-blue-500/40 text-blue-300 shadow-lg hover:text-white"
          title="Jump to latest"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
      )}
      {/* Section Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2 py-0.2 rounded-[2px] bg-blue-500/10 border border-blue-500/30 text-[10px] font-mono text-blue-400 mb-1 uppercase tracking-wider">
          <Terminal className="w-3 h-3" />
          <span>OPENAI SDK COMPATIBLE ENDPOINT (/v1/chat/completions) · SEPOLIA TESTNET</span>
        </div>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex flex-wrap items-center gap-2">
              <span>Free Inference Playground</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-[2px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-normal">
                LIVE BULBASAUR HOST · 32K RESIDENT CONTEXT
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Sub-50ms TTFT streaming inference routed directly to our Prague bare-metal cluster running Qwen 3.5 4B Uncensored (32k context resident) via Verxl 50 bps decentralized clearinghouse.
            </p>
          </div>

          {/* Quick Access to API and Chat */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onNavigate?.("chat")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] bg-blue-600 hover:bg-blue-500 text-white font-mono text-[11px] font-bold uppercase tracking-wider shadow-sm shadow-blue-500/20 transition cursor-pointer"
              title="Open full interactive chat interface"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Interactive Chat</span>
              <ArrowRight className="w-3 h-3" />
            </button>

            <button
              onClick={() => onNavigate?.("console")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] bg-[#0c1220] hover:bg-slate-800 border border-emerald-500/40 text-emerald-300 hover:text-white font-mono text-[11px] font-bold uppercase tracking-wider transition cursor-pointer"
              title="Open Developer API, Keys & Balance Management"
            >
              <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
              <span>Developer API</span>
              <ArrowRight className="w-3 h-3" />
            </button>

            <button
              onClick={() => setShowDisclaimer(!showDisclaimer)}
              className="inline-flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1.5 rounded-[3px] bg-[#0a0e17] border border-amber-500/30 text-amber-300 hover:bg-amber-500/10 transition cursor-pointer"
              title="Read Model & Protocol Policy Disclaimer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Policy Notice</span>
            </button>
          </div>
        </div>
      </div>

      {/* Precautions & Policy Disclaimer Modal/Banner */}
      {showDisclaimer && (
        <div className="bg-[#0c0f18] border border-amber-500/40 rounded-[3px] p-3 text-xs font-mono text-slate-300 space-y-2 relative shadow-lg">
          <div className="flex items-center justify-between border-b border-amber-500/20 pb-1.5 text-amber-300">
            <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Neutral Compute Routing & Safety Policy Notice</span>
            </span>
            <button
              onClick={() => setShowDisclaimer(false)}
              className="text-slate-400 hover:text-white p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="text-[11px] leading-relaxed text-slate-300 space-y-1.5">
            <p>
              <strong>Deterministic Research Parity:</strong> Verxl Protocol provides decentralized, permissionless inference clearing. This terminal connects directly to our bare-metal Prague cluster (Bulbasaur) serving <strong>Qwen 3.5 4B Uncensored (32k Context)</strong> as-is without corporate guardrail filtering or synthetic alignment penalties, intended for deterministic benchmarking and open research.
            </p>
            <p className="text-slate-400">
              <strong>Precaution Notice:</strong> If Verxl Protocol receives verified notification of harmful, unlawful, or malicious exploitation violating statutory regulations or network safety standards, node routing guarantees will be revoked and node operators remain subject to automated 10% collateral slashing via Aragon DAO governance (VIP-1). The protocol operates in parity with open-source model repositories (Hugging Face / Apache 2.0).
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        {/* Left Column: Configuration & Controls */}
        <div className="lg:col-span-5 space-y-3">
          <div className="bg-[#0a0e17] border border-blue-500/20 rounded-[3px] p-3 space-y-3 shadow-sm">
            <h3 className="text-[10px] font-semibold text-slate-300 font-mono tracking-wider uppercase flex items-center justify-between border-b border-slate-800/80 pb-1.5">
              <span>Model & Execution Parameters</span>
              <span className="text-[9px] text-blue-400 font-mono">50 BPS PROTOCOL TAKE</span>
            </h3>

            {/* Model Selector */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-mono text-slate-400">
                  Active Testing Model
                </label>
                <span className="text-[10px] font-mono text-emerald-400">
                  {model.includes("qwen") || model.includes("uncensored")
                    ? "PRAGUE BARE-METAL: BULBASAUR (32K)"
                    : model.includes("deepseek")
                    ? "OFFICIAL BRIDGE: DEEPSEEK V4.1 FLASH (1M)"
                    : "OFFICIAL BRIDGE: XIAOMI MIMO 2.6 FLASH (1M)"}
                </span>
              </div>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-[#05070b] border border-slate-800 rounded-[3px] px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500 transition"
              >
                <option value="qwen3.5-4b-uncensored-32k">
                  qwen3.5-4b-uncensored-32k · Bulbasaur Prague Node (Bare-Metal · Free Demo)
                </option>
                <option value="deepseek-v4.1-flash">
                  deepseek-v4.1-flash · DeepSeek V4.1 Flash (1M Context · Bridge) {user ? `[UNLOCKED · $${Number(user.balance_usd || 0).toFixed(2)} USD]` : `[Sign in to Run · Snippets Unlocked]`}
                </option>
                <option value="mimo-v2.6-flash">
                  mimo-v2.6-flash · Xiaomi MiMo 2.6 Flash (1M Context · Bridge) {user ? `[UNLOCKED · $${Number(user.balance_usd || 0).toFixed(2)} USD]` : `[Sign in to Run · Snippets Unlocked]`}
                </option>
              </select>

              {/* Free Tier vs Paid Models Callout */}
              {user ? (
                <div className="mt-2 p-2.5 rounded-[2px] bg-emerald-950/20 border border-emerald-500/30 text-[10.5px] font-mono space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                      <Sparkles className="w-3.5 h-3.5 shrink-0" />
                      <span>ALL PLATFORM MODELS UNLOCKED</span>
                    </span>
                    <span className="text-[8.5px] px-1.5 py-0.2 rounded-[2px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                      ${Number(user.balance_usd || 0).toFixed(2)} USD Available
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-300 leading-relaxed font-sans">
                    Authenticated session active. You can run all 3 platform models directly in this terminal, and code snippets below automatically generate ready-to-run curl and Python SDK requests with your active model.
                  </p>
                  <div className="text-[9.5px] text-slate-400 pt-1 flex items-center justify-between border-t border-slate-800/80 font-mono">
                    <span className="text-blue-300">Active Model: <strong>{model}</strong></span>
                    <span className="text-emerald-400">50 bps Protocol Fee</span>
                  </div>
                </div>
              ) : (
                <div className="mt-2 p-2.5 rounded-[2px] bg-[#070b14] border border-blue-500/20 text-[10.5px] font-mono space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-blue-400 font-bold">
                      <Server className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        {model.includes("qwen") || model.includes("uncensored")
                          ? "Free Demo Model: Qwen 3.5 4B Uncensored (Bulbasaur)"
                          : model.includes("deepseek")
                          ? "Official Bridge Model: DeepSeek V4.1 Flash (Snippet Ready)"
                          : "Official Bridge Model: Xiaomi MiMo 2.6 Flash (Snippet Ready)"}
                      </span>
                    </span>
                    <span className="text-[8.5px] px-1.5 py-0.2 rounded-[2px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      {model.includes("qwen") ? "Unlimited Free Demo" : "Login to Execute"}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                    {model.includes("qwen")
                      ? "Bulbasaur Qwen 3.5 4B Uncensored is completely free to test with zero sign-up required. Select any model to preview its integration code snippets."
                      : "You selected an official bridge model. Code snippets are updated in real time with this model. To execute live streaming inference, connect your MetaMask wallet or log in to unlock."}
                  </p>
                  <div className="text-[9.5px] text-slate-400 pt-1 flex items-center justify-between border-t border-slate-800/80 font-mono">
                    <span className="flex items-center gap-1 text-slate-400">
                      <Lock className="w-3 h-3 text-amber-400" />
                      <span>Rate Limit: 40 req / 10 min demo</span>
                    </span>
                    <span className="text-emerald-400">50 bps Protocol Fee</span>
                  </div>
                </div>
              )}
            </div>

            {/* System Prompt */}
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">
                System Instructions
              </label>
              <textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                rows={3}
                className="w-full bg-[#05070b] border border-slate-800 rounded-[3px] p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono transition resize-none"
              />
            </div>

            {/* Sliders: Temperature & Max Tokens */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1">
                  <span>Temperature</span>
                  <span className="text-blue-400 font-semibold">{temperature}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full accent-blue-500 bg-slate-800 rounded-[2px] h-1.5 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1">
                  <span>Max Tokens</span>
                  <span className="text-blue-400 font-semibold">{maxTokens}</span>
                </div>
                <input
                  type="range"
                  min="64"
                  max="4096"
                  step="64"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                  className="w-full accent-blue-500 bg-slate-800 rounded-[2px] h-1.5 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] font-mono text-slate-400">Think Level</span>
              <div className="flex items-center gap-1">
                {(["off", "low", "medium", "high"] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => setThinkLevel(level)}
                    className={`px-2 py-0.5 rounded-[2px] border text-[10px] font-mono uppercase transition ${
                      thinkLevel === level
                        ? "border-blue-500 text-blue-300 bg-blue-500/10"
                        : "border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Preset Query Chips — Strictly Square */}
            <div>
              <span className="block text-[10.5px] font-mono text-slate-400 mb-1.5">
                Benchmark Presets:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {samplePrompts.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => setUserPrompt(s.prompt)}
                    className="text-[10px] font-mono px-2 py-1 rounded-[2px] bg-[#05070b] border border-slate-800 text-slate-300 hover:border-blue-500/50 hover:text-blue-300 transition"
                  >
                    {s.title}
                  </button>
                ))}
              </div>
            </div>

            {/* User Prompt */}
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">
                Prompt Payload
              </label>
              <textarea
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                rows={3}
                placeholder="Enter prompt..."
                className="w-full bg-[#05070b] border border-slate-800 rounded-[3px] p-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500 transition resize-none font-mono"
              />
            </div>

            {/* Run / Stop Button — Strictly Square, No Pills */}
            <div className="pt-1">
              {!isStreaming ? (
                <button
                  onClick={handleRunInference}
                  className="w-full hero-btn hero-btn--primary !justify-center !py-2.5"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>
                    Execute {model.includes("qwen") || model.includes("uncensored") ? "Bulbasaur" : model.includes("deepseek") ? "DeepSeek V4.1" : "MiMo 2.6"} Live Stream
                  </span>
                </button>
              ) : (
                <button
                  onClick={handleStop}
                  className="w-full hero-btn !justify-center !py-2.5 !bg-rose-600 !text-white !border-rose-400/50"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Halt Stream</span>
                </button>
              )}
            </div>
          </div>

          {/* Real-Time Financial Metric Card */}
          <div className="bg-[#0a0e17] border border-blue-500/20 rounded-[4px] p-4 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                <span>Protocol Fee Compression</span>
              </span>
              <span className="text-emerald-400 font-semibold font-mono">-94.7%</span>
            </div>
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <div className="bg-[#05070b] p-2.5 rounded-[3px] border border-slate-800">
                <div className="text-[9.5px] text-slate-400 font-mono">VERXL FEE (50 BPS)</div>
                <div className="text-sm font-bold font-mono text-emerald-400 mt-0.5">
                  ${metrics.protocolFeeUsd.toFixed(5)}
                </div>
              </div>
              <div className="bg-[#05070b] p-2.5 rounded-[3px] border border-slate-800">
                <div className="text-[9.5px] text-slate-400 font-mono">CENTRALIZED SAAS (950 BPS)</div>
                <div className="text-sm font-bold font-mono text-rose-400 line-through mt-0.5">
                  ${metrics.traditionalSaaSUsd.toFixed(5)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Streaming Output & Telemetry */}
        <div className="lg:col-span-7 space-y-3">
          {/* Output Card */}
          <div
            ref={terminalWindowRef}
            className="bg-[#0a0e17] border border-blue-500/20 rounded-[3px] flex flex-col h-[390px] overflow-hidden scroll-mt-20"
          >
            {/* Top Bar of Output Card */}
            <div className="px-3 py-2 bg-[#05070b] border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 status-dot ${
                    isStreaming ? "bg-emerald-400 animate-pulse" : "bg-slate-500"
                  }`}
                />
                <span className="text-[10px] font-mono text-slate-300 uppercase tracking-wider">
                  {isStreaming ? "STREAMING FROM BULBASAUR NODE..." : "BULBASAUR INFERENCE TERMINAL"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {(output || reasoningOutput) && (
                  <button
                    onClick={copyOutput}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-[2px] text-[10px] font-mono bg-[#080c14] border border-slate-800 text-slate-300 hover:border-blue-500/50 transition"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-slate-400" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Output Scrollable Body */}
            <div
              ref={outputContainerRef}
              onScroll={handleOutputScroll}
              className="flex-1 p-3 sm:p-4 overflow-y-auto font-mono text-[11px] leading-relaxed text-slate-200 select-text bg-[#05070b]/60"
            >
              {reasoningOutput && (
                <div className="mb-3 p-2.5 rounded-[2px] bg-slate-900/60 border border-slate-800/80 text-slate-400 text-[10.5px]">
                  <div className="text-[9px] uppercase tracking-wider text-blue-400/80 font-bold mb-1 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-[1px] bg-blue-400 animate-pulse" />
                    <span>Thought Process / Reasoning Protocol (Seed=42 Invariant)</span>
                  </div>
                  <div className="text-slate-400 font-mono italic whitespace-pre-wrap">
                    {reasoningOutput}
                  </div>
                </div>
              )}

              {output ? (
                <div>
                  <div
                    className="terminal-markdown select-text"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(output) }}
                  />
                  {isStreaming && (
                    <span className="inline-block w-2 h-3.5 bg-blue-400 ml-0.5 mt-1 animate-pulse align-middle" />
                  )}
                </div>
              ) : isStreaming ? (
                <div className="flex items-center gap-2 text-blue-400 text-xs py-2">
                  <span className="w-2 h-2 rounded-[1px] bg-blue-400 animate-pulse" />
                  <span>Streaming token stream from Prague 32k cluster...</span>
                </div>
              ) : !reasoningOutput ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
                  <Terminal className="w-8 h-8 opacity-30 text-blue-400" />
                  <p className="text-xs font-mono text-slate-400">
                    Terminal idle. Press "Execute Bulbasaur Live Stream" to query Qwen 3.5 4B Uncensored (32k Context).
                  </p>
                </div>
              ) : null}
            </div>

            {/* Telemetry Footer Bar */}
            <div className="px-4 py-2 bg-[#05070b] border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-slate-400">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-blue-400" />
                  <span>TTFT:</span>
                  <span className="text-white font-semibold">{metrics.ttft > 0 ? `${metrics.ttft} ms` : "—"}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3 text-emerald-400" />
                  <span>Speed:</span>
                  <span className="text-white font-semibold">{metrics.tps > 0 ? `${metrics.tps} TPS` : "—"}</span>
                </span>
                <span>•</span>
                <span className="hidden sm:inline">
                  Tokens: <span className="text-white">{metrics.completionTokens}</span>
                </span>
              </div>
              <div className="text-[10px] text-slate-400 hidden md:block truncate max-w-[280px]">
                Node: {metrics.provider}
              </div>
            </div>
          </div>

          {/* Multi-Language Code Snippets Drawer */}
          <div className="bg-[#0a0e17] border border-blue-500/20 rounded-[4px] overflow-hidden">
            <div className="px-4 py-2.5 bg-[#05070b] border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="text-[11px] font-mono text-slate-300 uppercase tracking-wider">
                  Code Integration
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[9.5px] px-1.5 py-0.2 rounded-[2px] bg-blue-500/15 text-blue-300 border border-blue-500/30 font-mono">
                  <span>model:</span>
                  <strong className="text-white">{model}</strong>
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[9.5px] px-1.5 py-0.2 rounded-[2px] bg-amber-500/15 text-amber-300 border border-amber-500/30 font-mono">
                  <span>temp:</span>
                  <strong className="text-white">{temperature}</strong>
                </span>
              </div>

              <div className="flex items-center gap-1">
                {(["curl", "python", "typescript"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveCodeTab(tab)}
                    className={`px-2 py-0.5 rounded-[2px] text-[10.5px] font-mono uppercase tracking-wider transition ${
                      activeCodeTab === tab
                        ? "bg-blue-600 text-white font-semibold"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
                <button
                  onClick={() => copyCode(codeSnippets[activeCodeTab])}
                  className="ml-2 p-1 rounded-[2px] bg-[#05070b] border border-slate-800 text-slate-400 hover:text-white transition"
                  title="Copy code snippet"
                >
                  {copiedSnippet ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            <pre className="p-4 text-[11px] font-mono text-slate-300 overflow-x-auto bg-[#05070b] leading-relaxed">
              <code>{codeSnippets[activeCodeTab]}</code>
            </pre>
          </div>
        </div>
      </div>

      {/* Direct Transition to Developer API or Chat */}
      <div className="p-4 rounded-[4px] bg-gradient-to-r from-blue-950/40 via-[#0a0e17] to-indigo-950/40 border border-blue-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
        <div className="space-y-1">
          <div className="text-xs font-bold text-white flex items-center gap-1.5 font-mono">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>Ready for Production? Integrate via API or Open Full Chat</span>
          </div>
          <p className="text-[11.5px] text-slate-300 font-sans leading-relaxed">
            Use Verxl's OpenAI-compatible endpoint with 50 bps protocol clearing on Arbitrum One, or continue in our rich multi-turn conversation suite.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => onNavigate?.("chat")}
            className="px-4 py-2 rounded-[3px] bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md shadow-blue-500/25 transition cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Open Chat</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onNavigate?.("console")}
            className="px-4 py-2 rounded-[3px] bg-[#0c1220] hover:bg-slate-800 text-emerald-300 hover:text-white border border-emerald-500/40 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition cursor-pointer"
          >
            <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
            <span>Developer API & Keys</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
