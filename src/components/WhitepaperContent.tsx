import React, { useState } from "react";
import { Download, Copy, Check, Printer, FileText } from "lucide-react";

export const WhitepaperContent: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleCopyMarkdown = async () => {
    try {
      const res = await fetch("/whitepaper.md");
      const text = await res.text();
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Minimal Utility Bar — Satoshi Cleanliness */}
      <div className="bg-[#0a0e17] border border-blue-500/20 rounded-[3px] px-3.5 py-2 flex items-center justify-between text-xs font-mono shadow-sm">
        <div className="flex items-center gap-2 text-slate-300">
          <FileText className="w-3.5 h-3.5 text-blue-400" />
          <span className="font-semibold text-white">docs/WHITEPAPER.md</span>
          <span className="text-slate-500">·</span>
          <span className="text-slate-400 text-[11px]">Academic Specification (446 lines)</span>
        </div>

        <div className="flex items-center gap-1.5">
          <a
            href="/whitepaper.md"
            download="VERXL_PROTOCOL_WHITEPAPER.md"
            className="hero-btn hero-btn--ghost !py-1 !px-2.5 !text-[10.5px]"
            title="Download pure Markdown document"
          >
            <Download className="w-3 h-3 text-blue-400" />
            <span>Download .MD</span>
          </a>

          <button
            onClick={handleCopyMarkdown}
            className="hero-btn hero-btn--ghost !py-1 !px-2.5 !text-[10.5px]"
            title="Copy raw markdown to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-slate-400" />
                <span>Copy Raw</span>
              </>
            )}
          </button>

          <button
            onClick={handlePrint}
            className="hero-btn hero-btn--ghost !py-1 !px-2.5 !text-[10.5px]"
            title="Print or export as PDF"
          >
            <Printer className="w-3 h-3 text-slate-400" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Main Document Body — Pure Whitepaper Article */}
      <article className="bg-[#0a0e17] border border-blue-500/20 rounded-[3px] p-6 sm:p-12 shadow-2xl space-y-7 text-slate-200 leading-[1.8] font-sans">
        {/* Document Header */}
        <div className="space-y-3 border-b border-slate-800/80 pb-6 text-left">
          <div className="text-[11px] font-mono text-blue-400 tracking-wider uppercase font-semibold">
            Technical Whitepaper — Version 1.0 · Started as an Academic University Project at VŠE Praha
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Verxl Protocol
          </h1>
          <h2 className="text-sm sm:text-lg font-medium text-slate-300">
            Decentralized, Non-Custodial AI Inference Routing & Compute Clearinghouse
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs font-mono text-slate-400 pt-2 border-t border-slate-800/60">
            <div><span className="text-slate-500">Author:</span> Šimon Havlík (Project Lead & Head Developer)</div>
            <div><span className="text-slate-500">Date:</span> October 2026 · Prague, Czech Republic</div>
            <div><span className="text-slate-500">DAO Vault:</span> <code className="text-blue-300">0xf0e51fB0FFBD8ef36281b6f643E0f7953BD5111a</code></div>
            <div><span className="text-slate-500">Governance:</span> $VRXL (Fixed Genesis: 1,000,000)</div>
            <div><span className="text-slate-500">Settlement:</span> Arbitrum USDC <code className="text-blue-300">0x14f10A86...742b</code></div>
            <div><span className="text-slate-500">PostgreSQL:</span> Charizard <code className="text-blue-300">212.227.211.88:5432</code> (verxl)</div>
          </div>

          {/* ASCII Banner */}
          <pre className="font-mono text-[9px] sm:text-[11px] leading-tight text-blue-400/90 py-3 overflow-x-auto inline-block text-left border border-slate-800/90 bg-[#05070b] p-3.5 rounded-[2px] mt-2 w-full">
{`__      ________ _____  __   __ _      
\\ \\    / /  ____|  __ \\ \\ \\ / /| |     
 \\ \\  / /| |__  | |__) | \\ V / | |     
  \\ \\/ / |  __| |  _  /   > <  | |     
   \\  /  | |____| | \\ \\  / . \\ | |____ 
    \/   |______|_|  \\_\\/_/ \\_\\|______|
               D   A   O`}
          </pre>
        </div>

        {/* Abstract */}
        <div className="bg-[#05070b] border-l-2 border-blue-500 p-4 sm:p-6 rounded-[2px] space-y-2">
          <h3 className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider">
            Abstract
          </h3>
          <p className="text-xs sm:text-[13.5px] text-slate-300 leading-relaxed font-serif italic">
            Artificial Intelligence (AI) inference workloads represent the fastest-growing computational demand in modern computing. However, developers and enterprise builders face severe economic friction imposed by centralized API aggregators. Incumbent platforms charge a 5.5% platform take-rate, compounded by credit card processing fees (2.9% + $0.30) and foreign exchange markups, imposing an effective 8% to 10% fee drag on developers while demanding unsegregated custodial fiat pre-funding and offering zero recourse against arbitrary account termination. Concurrently, regional GPU data centers and transitioning cryptocurrency mining facilities across Europe possess significant idle compute capacity but lack a permissionless liquidity rail due to developer distrust and the pervasive risk of Model Spoofing (advertising premium unquantized weights while serving quantized, degraded models).
          </p>
          <p className="text-xs sm:text-[13.5px] text-slate-300 leading-relaxed font-serif italic">
            Verxl Protocol (<code className="text-blue-300 not-italic font-mono">verxl.com</code>) is a decentralized, non-custodial AI inference router and compute marketplace governed by the Verxl Aragon DAO on Ethereum Sepolia. Verxl replaces rent-seeking fiat intermediaries with a fixed 0.5% protocol routing fee (50 bps)—compressing intermediary fee drag by over 94%. By pairing a globally distributed Cloudflare Edge Worker with an Autonomous AI Quality Oracle executing seed-locked deterministic probe queries, Verxl continuously benchmarks Time to First Token (TTFT), tokens-per-second (TPS), and output perplexity. Dishonest providers forfeit their staked $VRXL collateral through automated smart contract slashing, while routing fees accrue non-custodially to the Aragon DAO Vault.
          </p>
        </div>

        {/* Section 1 */}
        <section className="space-y-3 pt-2">
          <h3 className="text-base sm:text-lg font-bold text-white uppercase tracking-wide border-b border-slate-800/60 pb-1.5 font-mono">
            1. Market Inefficiencies & Economic Model
          </h3>
          <h4 className="text-sm font-semibold text-slate-200 font-mono">
            1.1 The Incumbent Take-Rate Breakdown & Web2 Payment Drag
          </h4>
          <p className="text-[13.5px] text-slate-300">
            Modern AI applications consume billions of prompt and completion tokens per month. Because deploying dedicated GPU clusters is capital-intensive, developers predominantly route inference through aggregators. The incumbent aggregation model relies on custodial fiat balances and traditional card payment rails:
          </p>

          <pre className="font-mono text-[10px] sm:text-[11px] leading-tight text-slate-300 bg-[#05070b] border border-slate-800 p-3 rounded-[2px] overflow-x-auto">
{`+------------------------------------------------------------------------------------+
|                         INCUMBENT AGGREGATOR FEE COMPOSITION                       |
|                                                                                    |
|  [ Aggregator Markup: 5.50% ] + [ Card Fees: 2.90% + $0.30 ] + [ FX Markup: 1.5% ]|
|  ───────────────────────────────────────────────────────────────────────────────── |
|                        Total Fee Drag: 8.40% – 10.40%                              |
+------------------------------------------------------------------------------------+`}
          </pre>

          <ul className="list-disc list-inside text-[13px] text-slate-300 space-y-1.5 pl-1">
            <li><strong>Platform Take-Rate (5.50%):</strong> Centralized brokers charge 5.5% directly on credit deposits, exploiting direct compute access barriers.</li>
            <li><strong>Credit Card Interchange Fees (2.90% + $0.30):</strong> Every prepayment incurs gateway processing fees, severely distorting micro-top-ups.</li>
            <li><strong>Foreign Exchange (FX) Spread (1.0%–2.0%):</strong> Non-US developers absorb conversion spreads billing in USD via European banking rails.</li>
            <li><strong>Counterparty & Custodial Risk:</strong> Users prefund unsegregated balances on the broker's balance sheet, subject to unilateral termination.</li>
          </ul>

          <h4 className="text-sm font-semibold text-slate-200 font-mono pt-2">
            1.2 The Akerlof Lemons Equilibrium in Machine Learning Compute
          </h4>
          <p className="text-[13.5px] text-slate-300">
            The market failure is compounded by asymmetric information, characterized by the economic lemons problem first formulated by George Akerlof (1970). Because deep neural networks execute across opaque HTTP boundaries, compute suppliers face an acute moral hazard incentive to engage in quality degradation. An operator can advertise full-precision 16-bit floating-point weights (FP16) at prevailing market prices while secretly serving 4-bit quantized representations (AWQ / GPTQ) or distilled student architectures on depreciated hardware.
          </p>
          <p className="text-[13.5px] text-slate-300">
            The computational cost to the supplier drops by up to 70%, yet the buyer absorbs degraded reasoning, higher perplexity, and severe hallucination variance. Because buyers cannot audit weight matrices ex ante over standard network layers, rational buyers discount their reservation prices to reflect the expected value of adulterated hardware. This discount depresses equilibrium market clearing prices below the marginal operational cost of authentic high-tier GPU clusters, driving institutional compute operators from open networks and leaving an adverse selection equilibrium dominated by degraded endpoints.
          </p>

          <h4 className="text-sm font-semibold text-slate-200 font-mono pt-2">
            1.3 The Verxl Zero-Margin Protocol Economics
          </h4>
          <p className="text-[13.5px] text-slate-300">
            Verxl completely bypasses centralized fiat rails by settling usage non-custodially on-chain via smart contracts:
          </p>

          <div className="bg-[#05070b] border border-slate-800 p-3 rounded-[2px] font-mono text-xs sm:text-sm text-blue-300 text-center space-y-1">
            <div>{"Fee_Total = C_compute × (1 + f_protocol)"}</div>
            <div className="text-slate-400 text-xs">{"Where f_protocol = 0.005 (0.50% / 50 basis points)"}</div>
            <div className="text-emerald-400 font-bold text-xs pt-1">
              {"Δ Savings = (0.085 - 0.005) / 0.085 ≈ 94.1% Cost Compression"}
            </div>
          </div>

          <pre className="font-mono text-[10px] sm:text-[11px] leading-tight text-slate-300 bg-[#05070b] border border-slate-800 p-3 rounded-[2px] overflow-x-auto">
{`+------------------------------------------------------------------------------------+
|                          VERXL PROTOCOL FEE COMPOSITION                            |
|                                                                                    |
|  [ Compute Provider Net Payout: 99.50% ] + [ Verxl DAO Vault Protocol Fee: 0.50% ] |
|  ───────────────────────────────────────────────────────────────────────────────── |
|                         Total Intermediary Cost: 0.50%                             |
+------------------------------------------------------------------------------------+`}
          </pre>
        </section>

        {/* Section 2 */}
        <section className="space-y-3 pt-2">
          <h3 className="text-base sm:text-lg font-bold text-white uppercase tracking-wide border-b border-slate-800/60 pb-1.5 font-mono">
            2. Network Topology & OpenAI Edge Proxy Specifications
          </h3>
          <h4 className="text-sm font-semibold text-slate-200 font-mono">
            2.1 System Architecture Overview
          </h4>
          <p className="text-[13.5px] text-slate-300">
            Verxl implements a hybrid architecture: latency-critical request routing and streaming take place at the global network edge via Cloudflare Workers, while trust, identity, collateral, and governance are anchored immutably on Ethereum Sepolia and Arbitrum One.
          </p>

          <pre className="font-mono text-[9.5px] sm:text-[10.5px] leading-tight text-blue-300 bg-[#05070b] border border-slate-800 p-3 rounded-[2px] overflow-x-auto">
{`[ Developer Client Application ]
       │
       │ (1) HTTPS POST /v1/chat/completions (Bearer vrxl_live_...)
       ▼
+─────────────────────────────────────────────────────────────────+
|               Cloudflare Workers Edge Proxy                     |
|  - Key Hashing: SHA-256(API_KEY) lookup in edge cache (<5ms)    |
|  - Provider Selection: Min(Latency_i, Price_i) from active pool |
|  - SSE Stream Handling: Chunk passthrough & token counting      |
|  - Accounting: Deducts prepaid balance + 0.5% protocol fee      |
+─────────────────────────────────────────────────────────────────+
       │                                           │
       │ (2) Proxied Request                       │ (4) Asynchronous Telemetry
       ▼                                           ▼
+──────────────────────────+             +────────────────────────+
| Verified GPU Provider    |             | PostgreSQL Server      |
| (vLLM / TGI / SGLang)    |             | - Charizard : 5432     |
| Direct SSE Stream Return |             | - verxl.dao_stats      |
+──────────────────────────+             | - verxl.proposals      |
                                         +────────────────────────+
                                                    ▲
                                                    │ Audit Telemetry
+──────────────────────────────────────────────────┴──────────────+
| Autonomous AI Quality Oracle (Scheduled 30-Min Probe Worker)    |
| - Seed-locked deterministic prompts against registered nodes    |
| - Measures TTFT, throughput (TPS), and output perplexity        |
| - Dispatches automated slash triggers on anomaly detection      |
+─────────────────────────────────────────────────────────────────+
                               │
                               │ On-Chain Slashing & Penalty Routing
                               ▼
+─────────────────────────────────────────────────────────────────+
|                 Ethereum Sepolia Blockchain                     |
|  ├── VerxlStakingRegistry.sol (Provider Stakes & Slashing)      |
|  ├── VerxlToken.sol ($VRXL ERC-20 Governance Token)             |
|  └── Aragon OSx DAO Core (Reserve Vault & Proposal Engine)      |
+─────────────────────────────────────────────────────────────────+`}
          </pre>

          <h4 className="text-sm font-semibold text-slate-200 font-mono pt-2">
            2.2 Drop-In OpenAI SDK Compatibility
          </h4>
          <p className="text-[13.5px] text-slate-300">
            Developers integrate Verxl by changing exactly two parameters in their existing OpenAI client configuration (<code className="text-blue-300">baseURL</code> and <code className="text-blue-300">apiKey</code>):
          </p>

          <pre className="font-mono text-[10.5px] sm:text-[11.5px] leading-tight text-emerald-300 bg-[#05070b] border border-slate-800 p-3 rounded-[2px] overflow-x-auto">
{`from openai import OpenAI

client = OpenAI(
    base_url="https://verxl.com/v1",
    api_key="vrxl_live_9a7f82b401c3e..."
)

response = client.chat.completions.create(
    model="qwen-2.5-coder-32b",
    messages=[{"role": "user", "content": "Explain Verxl Protocol staking."}],
    stream=True
)

for chunk in response:
    print(chunk.choices[0].delta.content or "", end="")`}
          </pre>

          <h4 className="text-sm font-semibold text-slate-200 font-mono pt-2">
            2.3 Edge Routing Algorithm & Sub-25ms Overhead
          </h4>
          <p className="text-[13.5px] text-slate-300">
            The Cloudflare Worker executes provider selection using a weighted cost-latency objective:
          </p>
          <div className="bg-[#05070b] border border-slate-800 p-2.5 rounded-[2px] font-mono text-xs sm:text-sm text-blue-300 text-center">
            {"J(i) = w_lat · (TTFT_i / TTFT_max) + w_price · (P_i / P_max)"}
          </div>
          <p className="text-[13px] text-slate-400">
            Where database reads are cached in edge memory with sub-12ms routing resolution, well beneath the 25ms SLA ceiling.
          </p>
        </section>

        {/* Section 3 */}
        <section className="space-y-3 pt-2">
          <h3 className="text-base sm:text-lg font-bold text-white uppercase tracking-wide border-b border-slate-800/60 pb-1.5 font-mono">
            3. Automated Verification & Perplexity Audit Engine
          </h3>
          <h4 className="text-sm font-semibold text-slate-200 font-mono">
            3.1 The Model Spoofing Problem in Decentralized Compute
          </h4>
          <p className="text-[13.5px] text-slate-300">
            In decentralized networks without quality auditing, malicious GPU operators face a lucrative arbitrage opportunity: advertising an unquantized FP16 model (charging $0.70/1M tokens) while secretly routing requests to a 4-bit quantized version or distilled 8B model (cost: $0.08/1M tokens). Verxl eliminates this through seed-locked canary probing.
          </p>

          <pre className="font-mono text-[9.5px] sm:text-[10.5px] leading-tight text-blue-300 bg-[#05070b] border border-slate-800 p-3 rounded-[2px] overflow-x-auto">
{`[ Scheduled Oracle Worker ]
            │
            │ Dispatches Seed-Locked Probe:
            │ { model: "llama-3-70b", temperature: 0.0, seed: 42, prompt: P_canary }
            ▼
[ Target Provider Endpoint ] ─────────────────────────► Returns Output R_probe
                                                               │
                                                               ▼
                                                  [ Oracle Perplexity Evaluator ]
                                                  - Computes Levenshtein Distance
                                                  - Checks TTFT & TPS SLA
                                                  - Compares R_probe with R_ground_truth
                                                               │
                                  ┌────────────────────────────┴──────────────────────────┐
                                  ▼                                                       ▼
                        Fidelity Score >= 95%                                   Fidelity Score < 95%
                             [ PASS ]                                                 [ FAIL ]
                       Status: ACTIVE                                        1st Fail: PROBATION Status
                                                                             2nd Fail: AUTOMATED SLASH (10%)`}
          </pre>

          <h4 className="text-sm font-semibold text-slate-200 font-mono pt-2">
            3.2 Normalized Levenshtein Fidelity Metric
          </h4>
          <div className="bg-[#05070b] border border-slate-800 p-2.5 rounded-[2px] font-mono text-xs sm:text-sm text-blue-300 text-center">
            {"Fidelity(R_probe, R_ref) = 1 - (Levenshtein(R_probe, R_ref) / max(|R_probe|, |R_ref|))"}
          </div>
          <p className="text-[13px] text-slate-400">
            For authentic weights: Fidelity ≥ 0.98. Quantized or spoofed models display architectural divergence with Fidelity ≤ 0.75, immediately failing the audit.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3 pt-2">
          <h3 className="text-base sm:text-lg font-bold text-white uppercase tracking-wide border-b border-slate-800/60 pb-1.5 font-mono">
            4. Staking & Slashing Mechanics
          </h3>
          <p className="text-[13.5px] text-slate-300">
            The staking lifecycle is codified on-chain in <code className="text-blue-300">VerxlStakingRegistry.sol</code>:
          </p>

          <pre className="font-mono text-[10px] sm:text-[11px] leading-tight text-amber-300 bg-[#05070b] border border-slate-800 p-3 rounded-[2px] overflow-x-auto">
{`   [ Provider Deposits Collateral ]
     (Min. 1,000 $VRXL or SepoliaETH)
                  │
                  ▼
         ┌─────────────────┐
         │  STATUS: ACTIVE │ ◄──────────────────┐ Retest Passed
         └─────────────────┘                    │ (Fidelity >= 95%)
                  │                             │
                  │ Audit Probe Fails           │
                  ▼                             │
       ┌────────────────────┐                   │
       │  STATUS: PROBATION │ ──────────────────┘
       └────────────────────┘
                  │
                  │ Second Consecutive Failure / Spoofing
                  ▼
        ┌──────────────────┐
        │  STATUS: SLASHED │
        └──────────────────┘
                  │
                  ├── 50% Slashed Stake ──► Aragon DAO Vault (Treasury)
                  └── 50% Slashed Stake ──► 0x000...dEaD (Burned)`}
          </pre>

          <div className="space-y-2 text-[13px] text-slate-300">
            <div>• <strong>Minimum Collateral:</strong> 1,000 $VRXL required for active routing eligibility.</div>
            <div>• <strong>Slashing Penalty:</strong> 10% collateral slash upon verified consecutive failure.</div>
            <div>• <strong>Penalty Routing:</strong> 50% to Aragon DAO Treasury Vault (<code className="text-blue-300">0xf0e5...111a</code>), 50% permanently burned.</div>
            <div>• <strong>Unbonding Delay:</strong> Mandatory 24-hour unbonding cooldown (<code className="text-blue-300">Δt = 86,400s</code>) preventing exit fraud.</div>
          </div>
        </section>

        {/* Section 5 */}
        <section className="space-y-3 pt-2">
          <h3 className="text-base sm:text-lg font-bold text-white uppercase tracking-wide border-b border-slate-800/60 pb-1.5 font-mono">
            5. Aragon OSx Governance Architecture
          </h3>
          <p className="text-[13.5px] text-slate-300">
            Verxl DAO is structured using the Aragon OSx protocol standard on Ethereum Sepolia, providing non-custodial asset custody, programmatic access controls, and transparent token-weighted voting.
          </p>

          <pre className="font-mono text-[9.5px] sm:text-[10.5px] leading-tight text-blue-300 bg-[#05070b] border border-slate-800 p-3 rounded-[2px] overflow-x-auto">
{`+───────────────────────────────────────────────────────────────────────────+
|                           ARAGON OSx DAO CORE                             |
|                                                                           |
|   +─────────────────────────+              +──────────────────────────+   |
|   |   Token Voting Plugin   |              |    Aragon DAO Vault      |   |
|   |   (Voting Weight: VRXL) |              | (SepoliaETH / ERC-20 /   |   |
|   |                         |              |  0.5% Protocol Fees)     |   |
|   +─────────────────────────+              +──────────────────────────+   |
|                │                                         ▲                |
|                │ Proposal Approved & Executed            │ Protocol Fees  |
|                ▼                                         │                |
|   +──────────────────────────────────────────────────────┴────────────+   |
|   |                     VerxlStakingRegistry.sol                      |   |
|   |   - Protocol Fee Basis Points Switch (Default: 50 bps / 0.5%)     |   |
|   |   - Slashing Penalty Parameters & Quality Oracle Address          |   |
|   +───────────────────────────────────────────────────────────────────+   |
+───────────────────────────────────────────────────────────────────────────+`}
          </pre>

          <div className="space-y-1.5 text-[13px] text-slate-300">
            <div>• <strong>Support Threshold (Majority):</strong> &gt; 50.0% of cast votes.</div>
            <div>• <strong>Multisig Threshold:</strong> 66.7% (2 / 3 Multisig for emergency adjustments).</div>
            <div>• <strong>Quorum:</strong> 20.0% of circulating $VRXL (200,000 tokens).</div>
            <div>• <strong>Active On-Chain Proposals:</strong> VIP-1 (Active), VIP-2 (Passed), VIP-3 (Active), ADMIN-1 (Executed).</div>
          </div>
        </section>

        {/* Section 6 */}
        <section className="space-y-3 pt-2">
          <h3 className="text-base sm:text-lg font-bold text-white uppercase tracking-wide border-b border-slate-800/60 pb-1.5 font-mono">
            6. Tokenomics & Genesis Allocation ($VRXL)
          </h3>
          <p className="text-[13.5px] text-slate-300">
            The native utility and governance asset, <code className="text-blue-300">$VRXL</code>, features a fixed genesis supply of exactly 1,000,000 ERC-20 tokens with 0.0% uncollateralized inflation mechanisms.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono border border-slate-800">
              <thead className="bg-[#05070b] text-slate-400">
                <tr className="border-b border-slate-800 text-left">
                  <th className="p-2">Recipient / Pillar</th>
                  <th className="p-2">Role</th>
                  <th className="p-2">Wallet Address</th>
                  <th className="p-2">Allocation</th>
                  <th className="p-2">Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                <tr>
                  <td className="p-2 font-semibold text-white">Šimon Havlík</td>
                  <td className="p-2">Project Lead & Head Developer</td>
                  <td className="p-2 text-blue-400">0x14f1...742b</td>
                  <td className="p-2">250,000 $VRXL</td>
                  <td className="p-2">25.0%</td>
                </tr>
                <tr>
                  <td className="p-2 font-semibold text-white">Founding Member 2</td>
                  <td className="p-2">Edge & Proxy Lead</td>
                  <td className="p-2 text-blue-400">0x4E5e...05Ab</td>
                  <td className="p-2">250,000 $VRXL</td>
                  <td className="p-2">25.0%</td>
                </tr>
                <tr>
                  <td className="p-2 font-semibold text-white">Founding Member 3</td>
                  <td className="p-2">Clearing & Governance</td>
                  <td className="p-2 text-blue-400">0xE4a1...272F</td>
                  <td className="p-2">250,000 $VRXL</td>
                  <td className="p-2">25.0%</td>
                </tr>
                <tr>
                  <td className="p-2 font-semibold text-white">Aragon DAO Vault</td>
                  <td className="p-2">Treasury & Staking Reserve</td>
                  <td className="p-2 text-blue-400">0xf0e5...111a</td>
                  <td className="p-2">250,000 $VRXL</td>
                  <td className="p-2">25.0%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 7 */}
        <section className="space-y-3 pt-2">
          <h3 className="text-base sm:text-lg font-bold text-white uppercase tracking-wide border-b border-slate-800/60 pb-1.5 font-mono">
            7. Technical Implementation Details
          </h3>
          <h4 className="text-sm font-semibold text-slate-200 font-mono">
            7.1 PostgreSQL Telemetry Schema on Charizard (212.227.211.88:5432 · schema verxl)
          </h4>
          <p className="text-[13.5px] text-slate-300">
            The off-chain routing engine persists balances, audits, proposals, and DAO statistics to PostgreSQL 17 on Charizard:
          </p>

          <pre className="font-mono text-[9.5px] sm:text-[10.5px] leading-tight text-blue-300 bg-[#05070b] border border-slate-800 p-3 rounded-[2px] overflow-x-auto">
{`CREATE SCHEMA IF NOT EXISTS verxl;

CREATE TABLE verxl.dao_stats (
    dao_address VARCHAR(42) PRIMARY KEY,
    treasury_eth NUMERIC(18, 6) DEFAULT 0.040000,
    treasury_usd NUMERIC(12, 2) DEFAULT 106.00,
    voting_token VARCHAR(42),
    token_symbol VARCHAR(10) DEFAULT 'VRXL',
    total_supply NUMERIC(18, 4) DEFAULT 1000000.0000,
    approval_threshold_pct NUMERIC(5, 2) DEFAULT 66.70,
    quorum_pct NUMERIC(5, 2) DEFAULT 20.00,
    active_proposals_count INTEGER DEFAULT 2,
    last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE verxl.proposals (
    id VARCHAR(32) PRIMARY KEY,
    dao_address VARCHAR(42) NOT NULL,
    proposal_index INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    creator VARCHAR(42) NOT NULL,
    status VARCHAR(20) NOT NULL,
    yes_votes NUMERIC(18, 4) DEFAULT 0,
    no_votes NUMERIC(18, 4) DEFAULT 0,
    quorum_reached BOOLEAN DEFAULT TRUE,
    aragon_url TEXT,
    tx_hash TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);`}
          </pre>
        </section>

        {/* Section 8 */}
        <section className="space-y-3 pt-2">
          <h3 className="text-base sm:text-lg font-bold text-white uppercase tracking-wide border-b border-slate-800/60 pb-1.5 font-mono">
            8. Technical Roadmap (Q4 2026 – Q1 2027)
          </h3>

          <pre className="font-mono text-[9.5px] sm:text-[10.5px] leading-tight text-blue-300 bg-[#05070b] border border-slate-800 p-3 rounded-[2px] overflow-x-auto">
{`2026                                                       2027
OCTOBER             NOVEMBER            DECEMBER           JANUARY
  │                    │                    │                 │
  ▼                    ▼                    ▼                 ▼
[ Phase 1 ] ──────► [ Phase 2 ] ───────► [ Phase 3 ] ──────► [ Phase 4 ]
• Aragon DAO On      • 5-Min Pitch at    • Worker Proxy     • Multi-Node Live
  Sepolia Deploy       xPort VŠE (Nov 4)   Engineering        Stress Test Demo
• $VRXL Token        • Peer Feedback     • Slashing Oracle  • Public Beta at
• VIP-1 Proposal       Integration         Integration        verxl.com
• Charter Signed     • Contract Auditing • Testnet Honeypot • Final Defense`}
          </pre>

          <div className="space-y-1.5 text-[13px] text-slate-300">
            <div>• <strong>Phase 1 (Complete):</strong> Aragon OSx DAO deployed on Sepolia, VIP-1 ratified, Charizard PostgreSQL sync operational.</div>
            <div>• <strong>Phase 2 (Nov 2026):</strong> 5-minute academic proposal pitch at xPort VŠE (Nov 4), peer evaluations.</div>
            <div>• <strong>Phase 3 (Nov-Dec 2026):</strong> Automated oracle slashing triggers, Arbitrum USDC commercial clearing.</div>
            <div>• <strong>Phase 4 (Jan 2027):</strong> Multi-node European data center stress tests, public gateway defense.</div>
          </div>
        </section>

        {/* Section 9 */}
        <section className="space-y-3 pt-2">
          <h3 className="text-base sm:text-lg font-bold text-white uppercase tracking-wide border-b border-slate-800/60 pb-1.5 font-mono">
            9. Game Theoretic Proof of Honest Inference
          </h3>
          <p className="text-[13.5px] text-slate-300">
            Consider a compute provider choosing whether to serve authentic FP16 weights (<code className="text-blue-300">a = Honest</code>) or quantized AWQ-4bit weights (<code className="text-blue-300">a = Spoof</code>).
          </p>

          <div className="bg-[#05070b] border border-slate-800 p-3 rounded-[2px] font-mono text-xs sm:text-sm text-blue-300 space-y-1">
            <div>{"E[Π_Honest] = R - C"}</div>
            <div>{"E[Π_Spoof] = R - γ · C - p_audit · (ρ_slash · S + L_reputation)"}</div>
            <div className="text-slate-400 text-xs">{"For honest execution to be a strictly dominant Nash strategy: S > (1 - γ)C / ρ_slash"}</div>
            <div className="text-emerald-400 font-bold text-xs pt-1">
              {"Given ρ_slash = 0.10 and γ = 0.30: S > 7 · C"}
            </div>
          </div>

          <p className="text-[13px] text-slate-400">
            Because the minimum required stake is 1,000 $VRXL and an average hourly batch cost C ≪ 100 USD, the slashing penalty strictly dominates any marginal profit from downsampling weights. Intentional model degradation is strictly economically irrational under Nash equilibrium.
          </p>
        </section>

        {/* Section 10 */}
        <section className="space-y-3 pt-2">
          <h3 className="text-base sm:text-lg font-bold text-white uppercase tracking-wide border-b border-slate-800/60 pb-1.5 font-mono">
            10. Conclusion
          </h3>
          <p className="text-[13.5px] text-slate-300 leading-relaxed">
            Verxl Protocol dismantles the rent-seeking monopoly of centralized AI model aggregators. By combining a fixed 0.5% protocol fee with non-custodial smart contracts, seed-locked deterministic quality auditing, and Aragon OSx decentralized governance, Verxl provides developers with a 94% cheaper inference rail while enabling GPU data centers to monetize idle capacity trustlessly.
          </p>
        </section>

        {/* References */}
        <section className="space-y-2 pt-2 border-t border-slate-800/80">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wide font-mono">
            References
          </h3>
          <ol className="list-decimal list-inside text-xs font-mono text-slate-400 space-y-1">
            <li><strong>Akerlof, G. A.</strong> (1970). <em>The Market for "Lemons": Quality Uncertainty and the Market Mechanism.</em> Quarterly Journal of Economics, 84(3), 488–500.</li>
            <li><strong>Nakamoto, S.</strong> (2008). <em>Bitcoin: A Peer-to-Peer Electronic Cash System.</em> https://bitcoin.org/bitcoin.pdf.</li>
            <li><strong>Buterin, V.</strong> (2014). <em>Ethereum: A Next-Generation Smart Contract and Decentralized Application Platform.</em> https://ethereum.org/whitepaper/.</li>
            <li><strong>Williamson, O. E.</strong> (1981). <em>The Economics of Organization: The Transaction Cost Approach.</em> American Journal of Sociology, 87(3), 548–577.</li>
            <li><strong>Aragon Association.</strong> (2023). <em>Aragon OSx: Modular Smart Contract Framework.</em> https://aragon.org.</li>
          </ol>
        </section>

        {/* Subdued Academic Attribution Footer */}
        <div className="border-t border-slate-800/80 pt-6 text-center text-[11px] font-mono text-slate-400 space-y-1">
          <div>Started as an academic university project at Prague University of Economics and Business (VŠE Praha)</div>
          <div>Project Verxl Protocol • October 2026 • Published to <code className="text-blue-400">verxl.com/whitepaper</code></div>
        </div>
      </article>
    </div>
  );
};
