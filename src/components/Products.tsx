import React, { useState } from "react";
import {
  Apple,
  ArrowRight,
  ArrowUpRight,
  Check,
  Copy,
  Download,
  Github,
  Globe,
  KeyRound,
  Monitor,
  ShieldCheck,
  Smartphone,
  Terminal,
  TerminalSquare,
} from "lucide-react";

interface ProductsProps {
  onNavigate?: (tab: string) => void;
}

const RELEASE = "https://github.com/simonhavlik/verxl-protocol/releases/download/v0.1.0";
const RELEASE_PAGE = "https://github.com/simonhavlik/verxl-protocol/releases/tag/v0.1.0";
const REPO = "https://github.com/simonhavlik/verxl-protocol";

const downloads = [
  {
    id: "macos",
    platform: "macOS",
    detail: "Apple Silicon · macOS 12+",
    format: "DMG",
    size: "98 MB",
    href: `${RELEASE}/Verxl-0.1.0-mac-arm64.dmg`,
    note: "Unsigned: right-click → Open",
    Icon: Apple,
  },
  {
    id: "windows",
    platform: "Windows",
    detail: "Windows 10/11 · x64",
    format: "EXE",
    size: "82 MB",
    href: `${RELEASE}/Verxl-0.1.0-win-x64.exe`,
    note: "Unsigned: SmartScreen may warn",
    Icon: Monitor,
  },
  {
    id: "linux",
    platform: "Linux",
    detail: "x86_64 · AppImage",
    format: "AppImage",
    size: "108 MB",
    href: `${RELEASE}/Verxl-0.1.0-linux-x86_64.AppImage`,
    note: "chmod +x, then run",
    Icon: Terminal,
  },
  {
    id: "android",
    platform: "Android",
    detail: "Android 7+ · debug APK",
    format: "APK",
    size: "3.7 MB",
    href: `${RELEASE}/Verxl-0.1.0-android.apk`,
    note: "Sideload; Play Store build later",
    Icon: Smartphone,
  },
];

const routes = ["Chat", "Playground", "Registry", "API"];

export const Products: React.FC<ProductsProps> = ({ onNavigate }) => {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      window.setTimeout(() => setCopied(null), 1800);
    } catch {}
  };

  return (
    <div className="relative z-10 pb-16">
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 pb-12 pt-10 sm:px-6 sm:pt-14 lg:px-8 lg:pt-16">
        <div className="grid gap-10 lg:grid-cols-[1.25fr_0.75fr] lg:items-start lg:gap-14">
          <div>
            <div className="mb-5 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.18em] text-[#b8f6dd]">
              <span className="h-1 w-1 bg-[#b8f6dd]" />
              <span>Products / release 0.1.0</span>
            </div>
            <h1 className="max-w-3xl text-[42px] font-medium leading-[0.98] tracking-[-0.045em] text-white sm:text-[56px] lg:text-[64px]">
              Verxl on your
              <br />
              desktop.
            </h1>
            <p className="mt-6 max-w-xl text-[14px] leading-relaxed text-[#9aa7ad] sm:text-[15px]">
              Chat, Playground, Registry and API as one installed workspace. The same code, the same
              account, the same clearing path — on macOS, Windows, Linux and Android.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-2.5">
              <a
                href={`${RELEASE}/Verxl-0.1.0-mac-arm64.dmg`}
                className="group inline-flex items-center gap-2 border border-[#b8f6dd]/35 bg-[#b8f6dd] px-4 py-2.5 text-[11px] font-medium text-[#07110d] transition hover:bg-[#d7f8ec]"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download for macOS</span>
                <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
              </a>
              <a
                href="/chat?app=1"
                className="inline-flex items-center gap-2 border border-white/15 px-4 py-2.5 text-[11px] text-[#c9d4d8] transition hover:border-white/30 hover:text-white"
              >
                <Globe className="h-3.5 w-3.5 text-[#b8f6dd]" />
                <span>Open the web app</span>
              </a>
              <button
                type="button"
                onClick={() => onNavigate?.("console")}
                className="inline-flex items-center gap-2 px-2 py-2.5 font-mono text-[9px] uppercase tracking-[0.12em] text-[#8b989e] transition hover:text-white"
              >
                <KeyRound className="h-3 w-3" />
                <span>API keys</span>
              </button>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1.5 font-mono text-[9px] uppercase tracking-[0.1em] text-[#65737b]">
              <span className="flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-[#b8f6dd]" />
                4 platforms
              </span>
              <span>·</span>
              <span>1 codebase</span>
              <span>·</span>
              <span>Live workspace · updates with the web</span>
            </div>
          </div>

          {/* App preview / route panel */}
          <div className="border border-white/[0.09] bg-[#0b1117]">
            <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-3">
              <div className="flex items-center gap-2">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
                  <path d="M3 4l9 16 9-16" stroke="#b8f6dd" strokeWidth="2" />
                  <path d="M7.5 4L12 12l4.5-8" stroke="#ffffff" strokeWidth="1" opacity="0.55" />
                </svg>
                <span className="text-[12px] font-medium text-white">Verxl</span>
              </div>
              <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-[#65737b]">Installed</span>
            </div>
            <div className="grid grid-cols-[42px_1fr]">
              <div className="flex flex-col items-center gap-2 border-r border-white/[0.07] py-3">
                <span className="flex h-7 w-7 items-center justify-center bg-[#b8f6dd]/[0.08] text-[#b8f6dd]">
                  <TerminalSquare className="h-3.5 w-3.5" />
                </span>
                {[0, 1, 2].map((i) => (
                  <span key={i} className="flex h-7 w-7 items-center justify-center text-[#3d4a45]">
                    <span className="h-2.5 w-2.5 border border-current" />
                  </span>
                ))}
              </div>
              <div className="min-w-0 p-4">
                <div className="font-mono text-[8px] uppercase tracking-[0.14em] text-[#65737b]">Workspace</div>
                <div className="mt-3 space-y-1">
                  {routes.map((route, i) => (
                    <div
                      key={route}
                      className={`flex items-center justify-between border-l px-2.5 py-2 ${
                        i === 0
                          ? "border-[#b8f6dd] bg-white/[0.045] text-white"
                          : "border-transparent text-[#8b989e]"
                      }`}
                    >
                      <span className="text-[11px]">{route}</span>
                      <span className="font-mono text-[8px] text-[#65737b]">
                        {i === 0 ? "active" : i === 3 ? "keys" : "live"}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 border border-white/[0.08] px-2.5 py-2">
                  <div className="flex items-center gap-2 font-mono text-[8px] uppercase tracking-[0.1em] text-[#65737b]">
                    <span className="h-1 w-1 rounded-full bg-[#b8f6dd]" />
                    <span>Same code</span>
                  </div>
                  <div className="mt-1 text-[10px] text-[#9aa7ad]">The shell loads the live app.</div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 border-t border-white/[0.07]">
              <div className="border-r border-white/[0.07] px-4 py-3">
                <div className="font-mono text-[8px] uppercase tracking-[0.12em] text-[#65737b]">Routes</div>
                <div className="mt-1 font-mono text-[13px] text-[#b8f6dd]">4</div>
              </div>
              <div className="px-4 py-3">
                <div className="font-mono text-[8px] uppercase tracking-[0.12em] text-[#65737b]">Platforms</div>
                <div className="mt-1 font-mono text-[13px] text-[#b8f6dd]">4 + PWA</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Downloads */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-3 border-b border-white/[0.09] pb-4 sm:flex-row sm:items-end">
          <div>
            <div className="font-mono text-[8px] uppercase tracking-[0.16em] text-[#b8f6dd]">01 / Native</div>
            <h2 className="mt-1 text-[26px] font-medium tracking-[-0.03em] text-white sm:text-[30px]">Download the workspace.</h2>
          </div>
          <div className="flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.1em] text-[#65737b]">
            <span>v0.1.0</span>
            <span className="h-3 w-px bg-white/10" />
            <a href={RELEASE_PAGE} target="_blank" rel="noopener noreferrer" className="transition hover:text-white">
              Release notes
            </a>
            <span className="h-3 w-px bg-white/10" />
            <a href={`${RELEASE}/SHA256SUMS`} target="_blank" rel="noopener noreferrer" className="transition hover:text-white">
              Checksums
            </a>
          </div>
        </div>

        <div className="divide-y divide-white/[0.07] border-b border-white/[0.07]">
          {downloads.map(({ id, platform, detail, format, size, href, note, Icon }) => (
            <div
              key={id}
              className="group grid grid-cols-1 items-center gap-4 py-4 transition hover:bg-white/[0.02] sm:grid-cols-12 sm:gap-3"
            >
              <div className="sm:col-span-5 flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-white/[0.08] text-[#b8f6dd]">
                  <Icon className="h-4 w-4" />
                </span>
                <div>
                  <div className="text-[13px] font-medium text-white">{platform}</div>
                  <div className="mt-0.5 font-mono text-[9px] text-[#65737b]">{detail}</div>
                </div>
              </div>
              <div className="sm:col-span-2">
                <div className="font-mono text-[9px] uppercase tracking-[0.1em] text-[#8b989e]">{format}</div>
                <div className="mt-0.5 font-mono text-[9px] text-[#65737b]">{size}</div>
              </div>
              <div className="hidden sm:block sm:col-span-2 font-mono text-[9px] text-[#65737b]">{note}</div>
              <div className="sm:col-span-3 flex justify-start sm:justify-end">
                <a
                  href={href}
                  className="inline-flex items-center gap-2 border border-white/[0.09] px-3 py-2 font-mono text-[9px] uppercase tracking-[0.1em] text-[#c9d4d8] transition group-hover:border-[#b8f6dd]/30 group-hover:text-[#b8f6dd]"
                >
                  <Download className="h-3 w-3" />
                  <span>Download</span>
                  <ArrowUpRight className="h-3 w-3" />
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-col justify-between gap-3 border border-white/[0.07] bg-[#0b1117] p-4 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <Globe className="mt-0.5 h-4 w-4 shrink-0 text-[#b8f6dd]" />
            <div>
              <div className="text-[12px] text-[#d7e2de]">iOS and any other platform</div>
              <div className="mt-0.5 text-[11px] leading-relaxed text-[#8b989e]">
                Install the same workspace from the browser. Safari: Share → Add to Home Screen.
              </div>
            </div>
          </div>
          <a href="/chat?app=1" className="inline-flex shrink-0 items-center gap-2 border border-[#b8f6dd]/25 px-3 py-2 font-mono text-[9px] uppercase tracking-[0.1em] text-[#b8f6dd] transition hover:border-[#b8f6dd]/60">
            Open web app <ArrowRight className="h-3 w-3" />
          </a>
        </div>

        <p className="mt-3 text-[10px] leading-relaxed text-[#65737b]">
          Desktop builds are unsigned. macOS: right-click → Open. Windows: SmartScreen may warn. Android is a
          debug APK until Play Store signing. All shells load the live workspace, so updates ship with the web.
        </p>
      </section>

      {/* API */}
      <section className="mt-16 border-y border-white/[0.08] bg-[#080c10]">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14 lg:px-8 lg:py-14">
          <div>
            <div className="font-mono text-[8px] uppercase tracking-[0.16em] text-[#b8f6dd]">02 / API</div>
            <h2 className="mt-1 max-w-md text-[26px] font-medium tracking-[-0.03em] text-white sm:text-[30px]">
              Build against the clearing layer.
            </h2>
            <p className="mt-3 max-w-md text-[12.5px] leading-relaxed text-[#9aa7ad]">
              One OpenAI-compatible endpoint. 50 bps on compute. 99.5% to the provider. USDC settlement on
              Arbitrum. Start with a key, test in the playground, ship the same route.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onNavigate?.("console")}
                className="inline-flex items-center gap-2 bg-[#b8f6dd] px-3.5 py-2 text-[10px] font-medium text-[#07110d] transition hover:bg-[#d7f8ec]"
              >
                <KeyRound className="h-3.5 w-3.5" />
                Create API key
              </button>
              <button
                type="button"
                onClick={() => onNavigate?.("playground")}
                className="inline-flex items-center gap-2 border border-white/15 px-3.5 py-2 text-[10px] text-[#c9d4d8] transition hover:border-white/30 hover:text-white"
              >
                Open playground
                <ArrowUpRight className="h-3 w-3" />
              </button>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-3 border-t border-white/[0.07] pt-4">
              {[
                ["50 bps", "clearing fee"],
                ["99.5%", "to provider"],
                ["USDC", "Arbitrum"],
              ].map(([value, label]) => (
                <div key={label}>
                  <div className="font-mono text-[13px] text-[#b8f6dd]">{value}</div>
                  <div className="mt-0.5 font-mono text-[8px] uppercase tracking-[0.1em] text-[#65737b]">{label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="min-w-0 border border-white/[0.09] bg-[#05070b]">
            <div className="flex items-center justify-between border-b border-white/[0.07] px-3.5 py-2.5">
              <div className="flex items-center gap-2 font-mono text-[9px] text-[#8b989e]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#b8f6dd]" />
                POST /v1/chat/completions
              </div>
              <button
                type="button"
                onClick={() =>
                  copy(
                    "curl",
                    `curl https://verxl.com/v1/chat/completions \\\n  -H "Authorization: Bearer $VERXL_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{"model":"deepseek-v4.1-flash","messages":[{"role":"user","content":"Hello"}],"stream":true}'`
                  )
                }
                className="flex items-center gap-1 font-mono text-[8px] uppercase tracking-[0.1em] text-[#65737b] transition hover:text-[#b8f6dd]"
              >
                {copied === "curl" ? <Check className="h-3 w-3 text-[#b8f6dd]" /> : <Copy className="h-3 w-3" />}
                {copied === "curl" ? "Copied" : "Copy"}
              </button>
            </div>
            <pre className="overflow-x-auto p-4 font-mono text-[10px] leading-[1.75] text-[#c9d4d8]">
              <code>{`curl https://verxl.com/v1/chat/completions \\
  -H "Authorization: Bearer $VERXL_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "deepseek-v4.1-flash",
    "messages": [{ "role": "user", "content": "Hello" }],
    "stream": true
  }'`}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* Bring your own harness */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
          <div>
            <div className="font-mono text-[8px] uppercase tracking-[0.16em] text-[#b8f6dd]">03 / Harness</div>
            <h2 className="mt-1 max-w-md text-[26px] font-medium tracking-[-0.03em] text-white sm:text-[30px]">
              Bring your own harness.
            </h2>
            <p className="mt-3 max-w-md text-[12.5px] leading-relaxed text-[#9aa7ad]">
              Keep the editor, CLI or coding agent you already use. Point it at Verxl through the
              OpenAI-compatible base URL and select a routed model. Your harness stays yours; the clearing
              path handles access, metering and settlement.
            </p>
            <div className="mt-6 space-y-2.5">
              {[
                ["No SDK required", "Use the standard OpenAI Chat Completions API."],
                ["Streaming", "Token streaming with usage and clearing receipt."],
                ["Model choice", "Qwen 3.5 4B, DeepSeek V4.1 Flash, MiMo 2.6 Flash."],
                ["Tool calling", "Where the routed model supports it."],
              ].map(([title, text]) => (
                <div key={title} className="flex gap-3 border-t border-white/[0.07] pt-2.5">
                  <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-[#b8f6dd]" />
                  <div>
                    <div className="text-[11px] text-[#d7e2de]">{title}</div>
                    <div className="mt-0.5 text-[10px] leading-relaxed text-[#65737b]">{text}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onNavigate?.("console")}
                className="inline-flex items-center gap-2 border border-[#b8f6dd]/25 px-3.5 py-2 font-mono text-[9px] uppercase tracking-[0.1em] text-[#b8f6dd] transition hover:border-[#b8f6dd]/60"
              >
                Create a key <ArrowRight className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate?.("playground")}
                className="inline-flex items-center gap-2 px-2 py-2 font-mono text-[9px] uppercase tracking-[0.1em] text-[#8b989e] transition hover:text-white"
              >
                Test a request
              </button>
            </div>
          </div>

          <div className="min-w-0 border border-white/[0.09] bg-[#0b1117]">
            <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-3">
              <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.1em] text-[#8b989e]">
                <Terminal className="h-3.5 w-3.5 text-[#b8f6dd]" />
                Your shell
              </div>
              <button
                type="button"
                onClick={() => copy("env", 'export OPENAI_BASE_URL="https://verxl.com/v1"\nexport OPENAI_API_KEY="vrxl_..."')}
                className="flex items-center gap-1 font-mono text-[8px] uppercase tracking-[0.1em] text-[#65737b] transition hover:text-[#b8f6dd]"
              >
                {copied === "env" ? <Check className="h-3 w-3 text-[#b8f6dd]" /> : <Copy className="h-3 w-3" />}
                {copied === "env" ? "Copied" : "Copy"}
              </button>
            </div>
            <div className="p-4">
              <div className="font-mono text-[9px] text-[#65737b]">Terminal</div>
              <pre className="mt-2 overflow-x-auto font-mono text-[10px] leading-[1.85] text-[#d7e2de]">
                <code><span className="text-[#65737b]">$</span> export OPENAI_BASE_URL=<span className="text-[#b8f6dd]">"https://verxl.com/v1"</span>
{"\n"}<span className="text-[#65737b]">$</span> export OPENAI_API_KEY=<span className="text-[#b8f6dd]">"vrxl_..."</span>
{"\n"}<span className="text-[#65737b]">$</span> your-harness --model deepseek-v4.1-flash</code>
              </pre>
              <div className="mt-5 border-t border-white/[0.07] pt-4">
                <div className="flex items-center justify-between">
                  <div className="font-mono text-[8px] uppercase tracking-[0.12em] text-[#65737b]">Base URL</div>
                  <span className="font-mono text-[8px] text-[#b8f6dd]">OpenAI-compatible</span>
                </div>
                <button
                  type="button"
                  onClick={() => copy("base", "https://verxl.com/v1")}
                  className="mt-2 flex w-full items-center justify-between border border-white/[0.08] px-3 py-2 text-left font-mono text-[10px] text-[#c9d4d8] transition hover:border-[#b8f6dd]/25"
                >
                  <span>https://verxl.com/v1</span>
                  {copied === "base" ? <Check className="h-3 w-3 text-[#b8f6dd]" /> : <Copy className="h-3 w-3 text-[#65737b]" />}
                </button>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-1.5 border-t border-white/[0.07] pt-4 sm:grid-cols-3">
                {["qwen3.5-4b-uncensored-32k", "deepseek-v4.1-flash", "mimo-v2.6-flash"].map((model) => (
                  <button
                    key={model}
                    type="button"
                    onClick={() => copy(model, model)}
                    className="truncate border border-white/[0.07] px-2 py-1.5 text-left font-mono text-[8.5px] text-[#8b989e] transition hover:border-[#b8f6dd]/25 hover:text-[#b8f6dd]"
                    title={`Copy ${model}`}
                  >
                    {copied === model ? "Copied" : model}
                  </button>
                ))}
              </div>
            </div>
            <div className="border-t border-white/[0.07] px-4 py-3">
              <div className="font-mono text-[8px] uppercase tracking-[0.12em] text-[#65737b]">Endpoints</div>
              <div className="mt-2 space-y-1.5 font-mono text-[8.5px] text-[#8b989e]">
                <div className="flex items-center justify-between gap-3">
                  <span>Chat</span>
                  <span className="text-[#c9d4d8]">POST /v1/chat/completions</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Streaming</span>
                  <span className="text-[#c9d4d8]">SSE · data: [DONE]</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Auth</span>
                  <span className="text-[#c9d4d8]">Authorization: Bearer</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-white/[0.07] px-4 py-3">
              <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-[#65737b]">Bring your own tools</span>
              <a href={REPO} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 font-mono text-[8px] uppercase tracking-[0.1em] text-[#8b989e] transition hover:text-white">
                <Github className="h-3 w-3" /> Source
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Release notes / trust strip */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-4 border-t border-white/[0.08] pt-6 md:grid-cols-3">
          <div className="flex gap-3">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#b8f6dd]" />
            <div>
              <div className="text-[11px] text-[#d7e2de]">Unsigned, checksummed</div>
              <a href={`${RELEASE}/SHA256SUMS`} target="_blank" rel="noopener noreferrer" className="mt-1 block font-mono text-[9px] text-[#65737b] underline decoration-white/20 underline-offset-2 transition hover:text-white">
                SHA-256 checksums
              </a>
            </div>
          </div>
          <div className="flex gap-3">
            <Github className="mt-0.5 h-4 w-4 shrink-0 text-[#b8f6dd]" />
            <div>
              <div className="text-[11px] text-[#d7e2de]">Built by Actions</div>
              <a href={`${REPO}/actions/workflows/native.yml`} target="_blank" rel="noopener noreferrer" className="mt-1 block font-mono text-[9px] text-[#65737b] underline decoration-white/20 underline-offset-2 transition hover:text-white">
                Native build pipeline
              </a>
            </div>
          </div>
          <div className="flex gap-3">
            <TerminalSquare className="mt-0.5 h-4 w-4 shrink-0 text-[#b8f6dd]" />
            <div>
              <div className="text-[11px] text-[#d7e2de]">Same workspace</div>
              <a href="/chat?app=1" className="mt-1 block font-mono text-[9px] text-[#65737b] underline decoration-white/20 underline-offset-2 transition hover:text-white">
                Open the four-page app
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
