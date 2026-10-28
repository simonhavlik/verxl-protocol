import React from "react";
import { ArrowRight } from "lucide-react";
// @ts-ignore
import countries110m from "world-atlas/countries-110m.json";
import { feature } from "topojson-client";
import { geoGraticule10, geoMercator, geoPath } from "d3-geo";

interface VisionProps {
  onNavigate: (tab: string) => void;
}

const W = 760;
const H = 500;
const TOPO = countries110m as any;
const LAND = feature(TOPO, TOPO.objects.countries) as any;
const PROJECT = geoMercator().center([15, 52]).scale(560).translate([W / 2, H / 2]);
const PATH = geoPath(PROJECT);
const GRATICULE = geoGraticule10();

const EU = new Set([
  "Czechia", "Germany", "France", "Netherlands", "Austria", "Poland", "Slovakia",
  "Belgium", "Luxembourg", "Denmark", "Italy", "Spain", "Sweden", "Finland",
  "Estonia", "Latvia", "Lithuania", "Ireland", "Portugal", "Slovenia", "Croatia",
  "Hungary", "Romania", "Bulgaria", "Greece", "Cyprus", "Malta",
]);

const NODES = [
  { id: "client", label: "CLIENT", sub: "browser", ll: [2.3522, 48.8566] as [number, number], color: "#87959b" },
  { id: "edge", label: "EU EDGE", sub: "Cloudflare", ll: [8.6821, 50.1109] as [number, number], color: "#b8f6dd" },
  { id: "prague", label: "PRAGUE", sub: "bare metal", ll: [14.4378, 50.0755] as [number, number], color: "#f3f6f5" },
];

const projected = (ll: [number, number]) => PROJECT(ll) as [number, number] | null;
const arc = (a: [number, number], b: [number, number]) => {
  const p1 = projected(a);
  const p2 = projected(b);
  if (!p1 || !p2) return "";
  const [x1, y1] = p1;
  const [x2, y2] = p2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const cx = (x1 + x2) / 2 - (dy / len) * len * 0.18;
  const cy = (y1 + y2) / 2 + (dx / len) * len * 0.18;
  return `M${x1},${y1} Q${cx},${cy} ${x2},${y2}`;
};

const SectionIntro = ({
  index,
  kicker,
  title,
  copy,
}: {
  index: string;
  kicker: string;
  title: React.ReactNode;
  copy: string;
}) => (
  <div>
    <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[#87959b]">
      <span className="h-1.5 w-1.5 bg-[#b8f6dd]" />
      <span>{kicker}</span>
      <span className="text-white/20">/ {index}</span>
    </div>
    <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <h2 className="text-[clamp(2rem,4.2vw,3.8rem)] font-medium leading-[0.95] tracking-[-0.045em] text-[#f3f6f5]">
        {title}
      </h2>
      <p className="max-w-sm text-[14px] leading-relaxed text-[#a9b6bd]">{copy}</p>
    </div>
  </div>
);

const MapPanel: React.FC = () => {
  const client = projected(NODES[0].ll);
  const edge = projected(NODES[1].ll);
  const prague = projected(NODES[2].ll);

  return (
    <div className="border border-white/10 bg-[#080c12]">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5 font-mono text-[9px] uppercase tracking-[0.16em] text-[#87959b]">
        <span>Illustrative routing / EU</span>
        <span className="flex items-center gap-1.5 text-[#b8f6dd]">
          <span className="h-1 w-1 bg-[#b8f6dd]" />
          Sepolia
        </span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Illustrative inference routing from a client through an EU edge to the Prague bare-metal host">
        <rect width={W} height={H} fill="#080c12" />
        <path d={PATH(GRATICULE) || ""} fill="none" stroke="rgba(255,255,255,0.045)" strokeWidth={0.6} />
        <defs>
          <radialGradient id="pragueGlow">
            <stop offset="0%" stopColor="rgba(184,246,221,0.10)" />
            <stop offset="100%" stopColor="rgba(184,246,221,0)" />
          </radialGradient>
        </defs>
        {LAND.features.map((f: any, i: number) => (
          <path
            key={`country_${i}`}
            d={PATH(f) || ""}
            fill={EU.has(f.properties?.name) ? "rgba(184,246,221,0.095)" : "rgba(255,255,255,0.028)"}
            stroke="rgba(255,255,255,0.14)"
            strokeWidth={0.6}
          />
        ))}
        {prague && <circle cx={prague[0]} cy={prague[1]} r={110} fill="url(#pragueGlow)" />}

        {client && edge && (
          <path d={arc(NODES[0].ll, NODES[1].ll)} fill="none" stroke="rgba(184,246,221,0.26)" strokeWidth={1} strokeDasharray="3 4" />
        )}
        {edge && prague && (
          <path d={arc(NODES[1].ll, NODES[2].ll)} fill="none" stroke="rgba(184,246,221,0.65)" strokeWidth={1.1} />
        )}

        {client && (
          <g>
            <circle cx={client[0]} cy={client[1]} r={3.2} fill="#080c12" stroke="#87959b" strokeWidth={1.2} />
            <text x={client[0] - 9} y={client[1] + 3} textAnchor="end" fill="#87959b" fontFamily="JetBrains Mono, monospace" fontSize="8.5" letterSpacing="0.12em">CLIENT</text>
            <text x={client[0] - 9} y={client[1] + 14} textAnchor="end" fill="#65737b" fontFamily="JetBrains Mono, monospace" fontSize="7">browser</text>
          </g>
        )}
        {edge && (
          <g>
            <circle cx={edge[0]} cy={edge[1]} r={3.6} fill="#080c12" stroke="#b8f6dd" strokeWidth={1.3} />
            <text x={edge[0]} y={edge[1] - 12} textAnchor="middle" fill="#b8f6dd" fontFamily="JetBrains Mono, monospace" fontSize="8.5" letterSpacing="0.12em">EU EDGE</text>
            <text x={edge[0]} y={edge[1] - 22} textAnchor="middle" fill="#65737b" fontFamily="JetBrains Mono, monospace" fontSize="7">Cloudflare</text>
          </g>
        )}
        {prague && (
          <g>
            <circle cx={prague[0]} cy={prague[1]} r={12} fill="none" stroke="rgba(184,246,221,0.25)" strokeWidth={0.8} />
            <circle cx={prague[0]} cy={prague[1]} r={4.2} fill="#b8f6dd" />
            <text x={prague[0] + 13} y={prague[1] + 3} fill="#f3f6f5" fontFamily="JetBrains Mono, monospace" fontSize="8.5" letterSpacing="0.12em">PRAGUE</text>
            <text x={prague[0] + 13} y={prague[1] + 14} fill="#b8f6dd" fontFamily="JetBrains Mono, monospace" fontSize="7">bare metal</text>
          </g>
        )}

        <text x={W - 18} y={H - 18} textAnchor="end" fill="#3f4a50" fontFamily="JetBrains Mono, monospace" fontSize="7" letterSpacing="0.1em">
          ILLUSTRATIVE — NOT A COVERAGE MAP
        </text>
      </svg>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-white/10 px-4 py-3 font-mono text-[8.5px] text-[#7d8a92]">
        <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 border border-[#87959b]" /> client</span>
        <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full border border-[#b8f6dd]" /> edge</span>
        <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[#b8f6dd]" /> compute</span>
        <span className="flex items-center gap-1.5"><span className="h-px w-4 bg-[#b8f6dd]/50" /> ciphertext path</span>
        <span className="ml-auto">settlement · Arbitrum</span>
      </div>
    </div>
  );
};

export const Vision: React.FC<VisionProps> = ({ onNavigate }) => {
  return (
    <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* Hero */}
      <section className="grid min-h-[calc(100svh-92px)] grid-cols-1 items-center gap-10 py-12 lg:grid-cols-12 lg:gap-8 lg:py-16">
        <div className="space-y-6 lg:col-span-5">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[#87959b]">
            <span className="h-1.5 w-1.5 bg-[#b8f6dd]" />
            <span>Vision</span>
            <span className="text-white/20">/ 05</span>
          </div>

          <h1 className="text-[clamp(2.8rem,5.4vw,4.9rem)] font-medium leading-[0.93] tracking-[-0.055em] text-[#f3f6f5]">
            Private
            <br />
            by default.
            <br />
            <span className="text-[#8fa39b]">Fast by design.</span>
          </h1>

          <p className="max-w-[430px] text-[15px] leading-[1.65] text-[#a9b6bd]">
            A private, fast and affordable API and chat layer for AI. Not a model lab, not a cloud, not a data broker.
            Affordable by architecture: 50 bps on compute, 99.5% to providers.
          </p>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onNavigate("playground")}
              className="inline-flex items-center gap-2 border border-[#b8f6dd]/35 bg-[#b8f6dd]/10 px-4 py-2.5 text-[12px] font-medium text-[#dff8ef] transition-colors hover:border-[#b8f6dd]/70 hover:bg-[#b8f6dd]/15"
            >
              Run a request
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onNavigate("chat")}
              className="inline-flex items-center gap-2 border border-white/12 px-4 py-2.5 text-[12px] font-medium text-[#c9d4d8] transition-colors hover:border-white/25 hover:text-white"
            >
              Open Chat
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[9.5px] text-[#7d8a92]">
            <span>Prague bare metal</span>
            <span>·</span>
            <span>50 bps</span>
            <span>·</span>
            <span>USDC on Arbitrum</span>
            <span>·</span>
            <span className="text-[#b8f6dd]/70">Sepolia</span>
          </div>
        </div>

        <div className="lg:col-span-7">
          <MapPanel />
          <p className="mt-3 max-w-xl font-mono text-[8.5px] leading-relaxed text-[#65737b]">
            Plaintext stays in the browser. The edge sees ciphertext. Prague computes. Settlement is on Arbitrum.
            Routing is illustrative; it is not a coverage map, an SLA or a latency guarantee.
          </p>
        </div>
      </section>

      {/* Commitments */}
      <section className="py-16">
        <SectionIntro
          index="01"
          kicker="What we mean"
          title={<>Three claims.<br /><span className="text-[#8fa39b]">With limits.</span></>}
          copy="Private, fast and affordable are only useful if they can be checked. Each claim below has a mechanism and a boundary."
        />

        <div className="mt-10 grid grid-cols-1 border-t border-white/10 md:grid-cols-3 md:divide-x md:divide-white/10">
          {[
            {
              n: "01 / PRIVATE",
              title: "Encrypted in the browser.",
              body: "Chat messages are encrypted with a wallet-derived key before they leave the tab. Postgres stores ciphertext, a wallet key id and timestamps.",
              data: "AES-256-GCM · wallet key",
              caveat: "The operator still sees account metadata, wallet address and usage records.",
            },
            {
              n: "02 / FAST",
              title: "Bare metal, one hop.",
              body: "The Qwen host is resident in Prague. The edge routes the request; it does not queue it behind a control plane.",
              data: "38 ms P50 TTFT",
              caveat: "Sepolia measurement. An idle model still cold-starts. Not an SLA.",
            },
            {
              n: "03 / AFFORDABLE",
              title: "50 bps, not 950.",
              body: "The protocol takes 50 bps of compute. Providers keep 99.5%, paid in USDC on Arbitrum.",
              data: "99.5% to providers",
              caveat: "Protocol parameters, not a price promise or a market forecast.",
            },
          ].map((item) => (
            <div key={item.n} className="py-7 md:px-6 md:first:pl-0 md:last:pr-0">
              <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#b8f6dd]/70">{item.n}</div>
              <h3 className="mt-3 max-w-[230px] text-[22px] font-medium leading-[1.1] tracking-[-0.02em] text-[#f3f6f5]">
                {item.title}
              </h3>
              <p className="mt-3 max-w-[300px] text-[13px] leading-relaxed text-[#9aa7ad]">{item.body}</p>
              <div className="mt-5 border-t border-white/10 pt-3 font-mono text-[10px] text-[#dff8ef]">{item.data}</div>
              <p className="mt-1.5 max-w-[280px] font-mono text-[8.5px] leading-relaxed text-[#65737b]">{item.caveat}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Scope */}
      <section className="py-16">
        <SectionIntro
          index="02"
          kicker="Scope"
          title={<>A short list.<br /><span className="text-[#8fa39b]">Of what this is not.</span></>}
          copy="The fastest way to lose trust is to be everything to everyone. These are deliberate exclusions, not missing features."
        />

        <div className="mt-10 grid grid-cols-1 border-t border-white/10 sm:grid-cols-2">
          {[
            ["Not a model lab.", "We do not train foundation models. We route and clear access to a small set of them."],
            ["Not a cloud.", "No regions, no GPU rental, no control plane. One host, three models, an OpenAI-compatible API."],
            ["Not a data broker.", "The operator sees usage records, not plaintext. Chats are not a training corpus."],
            ["Not a token.", "The fee is USDC on Arbitrum. No governance token, no points, no emissions."],
          ].map(([title, body], i) => (
            <div key={title} className={`py-7 ${i % 2 === 0 ? "sm:pr-8" : "sm:border-l sm:border-white/10 sm:pl-8"} ${i > 1 ? "border-t border-white/10" : ""}`}>
              <h3 className="text-[24px] font-medium tracking-[-0.025em] text-[#f3f6f5]">{title}</h3>
              <p className="mt-2 max-w-[380px] text-[13px] leading-relaxed text-[#9aa7ad]">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Horizon */}
      <section className="py-16">
        <SectionIntro
          index="03"
          kicker="Horizon"
          title={<>A horizon<br /><span className="text-[#8fa39b]">you can audit.</span></>}
          copy="What is deployed, what is being built and what is explicitly out of scope. Dates are not promises; the left column is live."
        />

        <div className="mt-10 grid grid-cols-1 border-t border-white/10 md:grid-cols-3">
          {[
            {
              label: "Now",
              status: "Deployed",
              tone: "text-[#b8f6dd] border-[#b8f6dd]/30 bg-[#b8f6dd]/10",
              items: ["OpenAI-compatible API", "Encrypted Chat", "Three-model catalogue", "Live Playground", "Sepolia clearing"],
            },
            {
              label: "Next",
              status: "In progress",
              tone: "text-[#dff8ef] border-white/15 bg-white/5",
              items: ["MCP connections", "External contract audit", "More inference providers", "Mobile pass"],
            },
            {
              label: "Not yet",
              status: "Out of scope",
              tone: "text-[#87959b] border-white/10 bg-transparent",
              items: ["Mainnet settlement", "Enterprise SLA", "Global coverage", "A token"],
            },
          ].map((col, idx) => (
            <div key={col.label} className={`py-7 ${idx > 0 ? "border-t border-white/10 md:border-l md:border-t-0 md:pl-8" : "md:pr-8"}`}>
              <div className="flex items-center justify-between">
                <h3 className="text-[22px] font-medium tracking-[-0.02em] text-[#f3f6f5]">{col.label}</h3>
                <span className={`border px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.12em] ${col.tone}`}>
                  {col.status}
                </span>
              </div>
              <ul className="mt-4 space-y-2">
                {col.items.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-[13px] text-[#9aa7ad]">
                    <span className="h-1 w-1 bg-[#b8f6dd]/50" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Principles */}
      <section className="py-16">
        <SectionIntro
          index="04"
          kicker="Principles"
          title={<>Principles.<br /><span className="text-[#8fa39b]">Hold us to them.</span></>}
          copy="Not values on a wall. These are constraints on how the product is allowed to behave."
        />

        <div className="mt-10 border-t border-white/10">
          {[
            ["Default private.", "Ciphertext is the default, not a setting you have to discover."],
            ["No lock-in.", "OpenAI-compatible inputs and outputs. Your client should not need a rewrite."],
            ["Measured, not promised.", "Every number carries its method and its limit. Unmeasured claims do not ship."],
            ["No dark patterns.", "No fake scarcity, no hidden fees, no invented benchmarks."],
          ].map(([title, body], i) => (
            <div key={title} className="grid grid-cols-1 gap-2 border-b border-white/10 py-5 sm:grid-cols-12 sm:items-baseline">
              <div className="font-mono text-[9px] text-[#65737b] sm:col-span-1">0{i + 1}</div>
              <div className="text-[18px] font-medium tracking-[-0.02em] text-[#f3f6f5] sm:col-span-4">{title}</div>
              <div className="max-w-xl text-[13px] leading-relaxed text-[#9aa7ad] sm:col-span-7">{body}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Closing */}
      <section className="py-20">
        <div className="grid grid-cols-1 items-end gap-6 border-t border-white/10 pt-10 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <h2 className="text-[clamp(2rem,4.4vw,4rem)] font-medium leading-[0.95] tracking-[-0.05em] text-[#f3f6f5]">
              Build on what
              <br />
              <span className="text-[#8fa39b]">clears.</span>
            </h2>
          </div>
          <div className="space-y-3 lg:col-span-4">
            <p className="text-[13.5px] leading-relaxed text-[#9aa7ad]">
              Start with one request. Inspect the receipt, the latency and the settlement path before you commit to anything larger.
            </p>
            <div className="flex flex-wrap gap-2.5">
              <button
                onClick={() => onNavigate("playground")}
                className="inline-flex items-center gap-2 border border-[#b8f6dd]/35 bg-[#b8f6dd]/10 px-4 py-2.5 text-[12px] font-medium text-[#dff8ef] hover:border-[#b8f6dd]/70"
              >
                Open Playground
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => onNavigate("console")}
                className="inline-flex items-center gap-2 border border-white/12 px-4 py-2.5 text-[12px] font-medium text-[#c9d4d8] hover:border-white/25 hover:text-white"
              >
                Read the API
              </button>
            </div>
          </div>
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-between gap-2 font-mono text-[9px] text-[#65737b]">
          <span>Sepolia demonstration. Not a mainnet production system.</span>
          <span>Private · Fast · Affordable · One small step at a time.</span>
        </div>
      </section>
    </div>
  );
};
