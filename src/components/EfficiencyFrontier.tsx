import React, { useEffect, useState } from "react";

const W = 760;
const H = 430;
const X0 = 82;
const X1 = 728;
const Y0 = 28;
const Y1 = 350;
const X = (cost: number) => X0 + ((Math.log10(cost) + 1) / 2) * (X1 - X0);
const Y = (score: number) => Y1 - ((score - 60) / 28) * (Y1 - Y0);

type Point = { name: string; cost: number; score: number; frontier: boolean; verxl: boolean; dx: number; dy: number; anchor?: "start" | "middle" | "end" };

const POINTS: Point[] = [
  { name: "GPT-6 Luna", cost: 0.133, score: 64.6, frontier: true, verxl: false, dx: -4, dy: 16, anchor: "middle" },
  { name: "MiniMax M3.1 Flash", cost: 0.153, score: 66.9, frontier: true, verxl: false, dx: 12, dy: 14 },
  { name: "DeepSeek V4.1 Flash", cost: 0.181, score: 74.0, frontier: true, verxl: true, dx: 12, dy: -14 },
  { name: "MiMo V2.6 Pro", cost: 0.183, score: 68.5, frontier: false, verxl: true, dx: 12, dy: 14 },
  { name: "GPT-6.1 Terra", cost: 0.665, score: 77.8, frontier: true, verxl: false, dx: 12, dy: 14 },
  { name: "GPT-6.1 Sol", cost: 0.761, score: 84.1, frontier: true, verxl: false, dx: 12, dy: -12 },
  { name: "Gemini 4 Argon", cost: 2.073, score: 79.3, frontier: false, verxl: false, dx: 12, dy: -10 },
  { name: "Claude Opus 5.5", cost: 4.291, score: 85.1, frontier: true, verxl: false, dx: -12, dy: -10, anchor: "end" },
  { name: "GPT-6 Astra", cost: 4.548, score: 85.6, frontier: true, verxl: false, dx: 12, dy: 14 },
  { name: "Claude Fable 5.1", cost: 6.904, score: 85.7, frontier: true, verxl: false, dx: -12, dy: -10, anchor: "end" },
];

const FRONTIER = POINTS.filter((point) => point.frontier).sort((a, b) => a.cost - b.cost);

const MODELS = [
  {
    n: "01",
    name: "Qwen 3.5 4B Uncensored",
    role: "Resident / uncensored",
    body: "Uncensored and deliberately small: 4B parameters, under the 20B ceiling. It answers every question within that limit; frontier-scale work routes to DeepSeek and MiMo.",
    data: "4B · 32K · Prague",
  },
  {
    n: "02",
    name: "DeepSeek V4.1 Flash",
    role: "Cost / performance frontier",
    body: "The efficient point for harder work: 74.0 overall at $0.181 per successful task on LiveBench 2.0.",
    data: "74.0 · $0.181",
  },
  {
    n: "03",
    name: "MiMo 2.6 Flash",
    role: "Daily driver / half price",
    body: "Half the listed token price of DeepSeek and built for daily tasks. On LiveBench its verbosity narrows the per-successful-task gap.",
    data: "68.5 · $0.183",
  },
];

type LiveModel = {
  modelId: string;
  name: string;
  provider: string;
  context: string;
  prompt: number;
  completion: number;
};

export const EfficiencyFrontier: React.FC = () => {
  const [liveModels, setLiveModels] = useState<LiveModel[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/providers")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: any) => {
        if (cancelled || !data || !Array.isArray(data.providers)) return;
        const models: LiveModel[] = [];
        for (const provider of data.providers) {
          const configs = Array.isArray(provider.modelsConfig) && provider.modelsConfig.length
            ? provider.modelsConfig
            : [{
                model_id: provider.modelIdentifier,
                prompt_rate: provider.pricePromptUsd,
                completion_rate: provider.priceCompletionUsd,
                context_display: provider.contextDisplay,
              }];
          for (const config of configs) {
            if (!config?.model_id) continue;
            models.push({
              modelId: String(config.model_id),
              name: String(config.display_name || config.model_id),
              provider: String(provider.name || "Approved provider"),
              context: String(config.context_display || provider.contextDisplay || "Context on request"),
              prompt: Number(config.prompt_rate ?? provider.pricePromptUsd ?? 0),
              completion: Number(config.completion_rate ?? provider.priceCompletionUsd ?? 0),
            });
          }
        }
        if (models.length) setLiveModels(models);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const displayModels = liveModels.length
    ? liveModels.map((model, index) => {
        const haystack = `${model.modelId} ${model.name}`.toLowerCase();
        const curated = MODELS.find((item) => {
          const name = item.name.toLowerCase();
          return (name.includes("qwen") && haystack.includes("qwen")) ||
                 (name.includes("deepseek") && haystack.includes("deepseek")) ||
                 (name.includes("mimo") && haystack.includes("mimo"));
        });
        if (curated) return { ...curated, n: String(index + 1).padStart(2, "0") };
        const price = model.completion > 0 ? `$${model.completion.toFixed(2)} / 1M` : "Price on request";
        return {
          n: String(index + 1).padStart(2, "0"),
          name: model.name.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
          role: haystack.includes("uncensored") ? "Live route / uncensored" : "Live route / approved",
          body: `${model.provider}. ${model.context} context.${model.prompt > 0 ? ` $${model.prompt.toFixed(2)} input.` : ""}`,
          data: `${model.context} · ${price}`,
        };
      })
    : MODELS;

  return (
    <div className="mt-10 grid grid-cols-1 gap-8 border-t border-white/10 pt-8 lg:grid-cols-12">
      <div className="lg:col-span-7">
        <div className="border border-white/10 bg-[#080c12]">
          <div className="flex items-center justify-between border-b border-white/10 px-3 py-2 font-mono text-[8px] uppercase tracking-[0.14em] text-[#65737b]">
            <span>LiveBench snapshot · quality vs cost</span>
            <span className="text-[#b8f6dd]">Value frontier</span>
          </div>
          <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="LiveBench quality versus cost efficiency frontier">
            <rect width={W} height={H} fill="#080c12" />
            {[60, 65, 70, 75, 80, 85].map((score) => (
              <g key={score}>
                <line x1={X0} y1={Y(score)} x2={X1} y2={Y(score)} stroke="rgba(255,255,255,0.07)" strokeWidth={0.6} />
                <text x={X0 - 8} y={Y(score) + 3} textAnchor="end" fill="#65737b" fontFamily="Menlo, monospace" fontSize="8">{score}</text>
              </g>
            ))}
            {[0.1, 0.2, 0.5, 1, 2, 5, 10].map((cost) => (
              <g key={cost}>
                <line x1={X(cost)} y1={Y0} x2={X(cost)} y2={Y1} stroke="rgba(255,255,255,0.07)" strokeWidth={0.6} />
                <text x={X(cost)} y={Y1 + 17} textAnchor="middle" fill="#65737b" fontFamily="Menlo, monospace" fontSize="8">${cost}</text>
              </g>
            ))}
            <text x={X0} y={Y1 + 38} fill="#65737b" fontFamily="Menlo, monospace" fontSize="7" letterSpacing="0.12em">COST PER SUCCESSFUL TASK (LOG)</text>
            <text x={X0} y={Y0 - 10} fill="#65737b" fontFamily="Menlo, monospace" fontSize="7" letterSpacing="0.12em">LIVEBENCH OVERALL</text>

            {FRONTIER.slice(0, -1).map((point, i) => (
              <line key={`f_${point.name}`} x1={X(point.cost)} y1={Y(point.score)} x2={X(FRONTIER[i + 1].cost)} y2={Y(FRONTIER[i + 1].score)} stroke="#b8f6dd" strokeWidth={1.1} strokeDasharray="4 4" opacity={0.75} />
            ))}

            {POINTS.map((point) => (
              <g key={point.name}>
                <circle
                  cx={X(point.cost)}
                  cy={Y(point.score)}
                  r={point.verxl ? 4.6 : 3.8}
                  fill={point.verxl ? (point.frontier ? "#b8f6dd" : "#080c12") : point.frontier ? "#8fa39b" : "#080c12"}
                  stroke={point.verxl || point.frontier ? (point.verxl ? "#b8f6dd" : "#8fa39b") : "#65737b"}
                  strokeWidth={point.verxl ? 1.2 : 1}
                />
                <text
                  x={X(point.cost) + point.dx}
                  y={Y(point.score) + point.dy}
                  textAnchor={point.anchor || "start"}
                  fill={point.verxl ? "#b8f6dd" : point.frontier ? "#8fa39b" : "#65737b"}
                  fontFamily="Menlo, monospace"
                  fontSize="8"
                >
                  {point.name}
                </text>
              </g>
            ))}
            <text x={X(1.65)} y={Y(77.9)} fill="#7fae9d" fontFamily="Menlo, monospace" fontSize="7" letterSpacing="0.12em">VALUE FRONTIER</text>
          </svg>
          <div className="border-t border-white/10 px-3 py-2 font-mono text-[8px] leading-relaxed text-[#65737b]">
            Source: LiveBench 2.0 · 25 Oct 2026 · Abacus.AI. Benchmark snapshot; the live route list is below. Verxl adds 50 bps.
          </div>
        </div>
      </div>

      <div className="space-y-4 lg:col-span-5">
        <div className="flex items-center justify-between border-b border-white/10 pb-2 font-mono text-[8px] uppercase tracking-[0.14em] text-[#65737b]">
          <span>Live catalogue</span>
          <span className="text-[#b8f6dd]/70">
            {liveModels.length ? `${liveModels.length} route${liveModels.length === 1 ? "" : "s"}` : "Registry"}
          </span>
        </div>
        {displayModels.map((model) => (
          <div key={model.n} className="border-l border-[#b8f6dd]/25 pl-4">
            <div className="flex items-baseline justify-between gap-3">
              <div className="font-mono text-[8px] uppercase tracking-[0.16em] text-[#b8f6dd]/70">{model.n} / {model.role}</div>
              <div className="font-mono text-[8px] text-[#65737b]">{model.data}</div>
            </div>
            <h3 className="mt-1.5 text-[17px] font-medium tracking-[-0.02em] text-[#f3f6f5]">{model.name}</h3>
            <p className="mt-1 max-w-[360px] text-[11.5px] leading-relaxed text-[#8b989e]">{model.body}</p>
          </div>
        ))}
        <div className="flex flex-col gap-2 border-t border-white/10 pt-3 font-mono text-[8.5px] leading-relaxed text-[#65737b]">
          <span>The live catalogue is served from the provider registry. Approved providers add routes; the same API and the same 50 bps apply.</span>
          <a href="/registry" className="text-[#b8f6dd] hover:underline">Open the registry →</a>
        </div>
      </div>
    </div>
  );
};
