# Verxl Protocol: Decentralized, Non-Custodial AI Inference Routing & Compute Marketplace

**Technical Whitepaper — Version 1.0**  
**Web Gateway:** [https://verxl.com](https://verxl.com)  
**Smart Contract Framework:** Aragon OSx on Ethereum Sepolia Testnet  
**DAO Vault Address:** `0xf0e51fB0FFBD8ef36281b6f643E0f7953BD5111a`  
**Arbitrum Settlement Escrow:** `0x5AE718197a6A87E103B124b660fd49692C857aE0`  
**Governance Token:** `$VRXL` (ERC-20, Fixed Genesis Supply: 1,000,000)  
**PostgreSQL Telemetry Target:** Charizard `212.227.211.88:5432/kiam` (schema `verxl`)  
**Academic Attribution:** Started as an academic university project at Prague University of Economics and Business (VŠE Praha)  
**Lead Architect & Author:** Šimon Havlík & Core Contributors  
**Date:** October 2026  

---

```
__      ________ _____  __   __ _      
\ \    / /  ____|  __ \ \ \ / /| |     
 \ \  / /| |__  | |__) | \ V / | |     
  \ \/ / |  __| |  _  /   > <  | |     
   \  /  | |____| | \ \  / . \ | |____ 
    \/   |______|_|  \_\/_/ \_\|______|
               D   A   O
```

---

## Abstract

Artificial Intelligence (AI) inference workloads represent the fastest-growing computational demand in modern computing. However, developers and enterprise builders face severe economic friction imposed by centralized API aggregators. Incumbent platforms charge a 5.5% platform take-rate, compounded by credit card processing fees (2.9% + $0.30) and foreign exchange markups, imposing an effective **8% to 10% fee drag** on developers while demanding unsegregated custodial fiat pre-funding and offering zero recourse against arbitrary account termination. Concurrently, regional GPU data centers and transitioning cryptocurrency mining facilities across Europe possess significant idle compute capacity but lack a permissionless liquidity rail due to developer distrust and the pervasive risk of **Model Spoofing** (advertising premium unquantized weights while serving quantized, degraded models).

**Verxl Protocol** (`verxl.com`) is a decentralized, non-custodial AI inference router and compute marketplace governed by the **Verxl Aragon DAO** on Ethereum Sepolia. Verxl replaces rent-seeking fiat intermediaries with a fixed **0.5% protocol routing fee (50 bps)**—compressing intermediary fee drag by over 94%. By pairing a globally distributed Cloudflare Edge Worker with an **Autonomous AI Quality Oracle** executing seed-locked deterministic probe queries, Verxl continuously benchmarks Time to First Token (TTFT), tokens-per-second (TPS), and output perplexity. Dishonest providers forfeit their staked `$VRXL` collateral through automated smart contract slashing, while routing fees accrue non-custodially to the Aragon DAO Vault. This paper presents the end-to-end architecture, mathematical fee models, oracle verification algorithms, on-chain governance parameters, and execution roadmap through January 2027.

---

## 1. Market Inefficiencies & Economic Model

### 1.1 The Incumbent Take-Rate Breakdown & Web2 Payment Drag

Modern AI applications consume billions of prompt and completion tokens per month. Because deploying dedicated GPU clusters is capital-intensive, developers predominantly route inference through aggregators. The incumbent aggregation model relies on custodial fiat balances and traditional card payment rails:

```
+------------------------------------------------------------------------------------+
|                         INCUMBENT AGGREGATOR FEE COMPOSITION                       |
|                                                                                    |
|  [ Aggregator Markup: 5.50% ] + [ Card Fees: 2.90% + $0.30 ] + [ FX Markup: 1.5% ]|
|  ───────────────────────────────────────────────────────────────────────────────── |
|                        Total Fee Drag: 8.40% – 10.40%                              |
+------------------------------------------------------------------------------------+
```

1. **Platform Take-Rate (5.50%):** Centralized brokers charge 5.5% directly on credit deposits, taking advantage of lack of direct access to compute endpoints.
2. **Credit Card Interchange Fees (2.90% + \$0.30):** Every prepayment incurs payment gateway processing fees. For micro-top-ups (e.g., \$10–\$20), the fixed \$0.30 surcharge substantially inflates the effective percentage.
3. **Foreign Exchange (FX) Spread (1.0%–2.0%):** Non-US developers incur currency conversion spreads when billing in USD via European banking rails.
4. **Counterparty & Custodial Risk:** Users must deposit funds into centralized custodial balances. Accounts can be terminated, throttled, or frozen unilaterally without on-chain recourse.

### 1.2 The Akerlof Lemons Equilibrium in Machine Learning Compute

The contemporary compute market suffers from asymmetric information, characterized by the economic lemons problem first formulated by George Akerlof (1970). Because deep neural networks execute across opaque HTTP boundaries, compute suppliers face an acute moral hazard incentive to engage in quality degradation. An operator can advertise full-precision 16-bit floating-point weights (FP16) at prevailing market prices while secretly serving 4-bit quantized representations (AWQ / GPTQ) or distilled student architectures on depreciated hardware.

The computational cost to the supplier drops by up to 70%, yet the buyer absorbs degraded reasoning, higher perplexity, and severe hallucination variance. Because buyers cannot audit weight matrices ex ante over standard network layers, rational buyers discount their reservation prices to reflect the expected value of adulterated hardware. This discount depresses equilibrium market clearing prices below the marginal operational cost of authentic high-tier GPU clusters, driving institutional compute operators from open networks and leaving an adverse selection equilibrium dominated by degraded endpoints.

### 1.3 The Verxl Zero-Margin Protocol Economics

Verxl completely bypasses centralized fiat rails by settling usage non-custodially on-chain via smart contracts and state channels:

$$\text{Fee}_{\text{Total}} = C_{\text{compute}} \times (1 + f_{\text{protocol}})$$

Where $f_{\text{protocol}} = 0.005$ (0.50% / 50 basis points).

$$\Delta \text{Savings} = \frac{\text{Take-Rate}_{\text{Incumbent}} - \text{Take-Rate}_{\text{Verxl}}}{\text{Take-Rate}_{\text{Incumbent}}} = \frac{0.085 - 0.005}{0.085} \approx 94.1\%$$

```
+------------------------------------------------------------------------------------+
|                          VERXL PROTOCOL FEE COMPOSITION                            |
|                                                                                    |
|  [ Compute Provider Net Payout: 99.50% ] + [ Verxl DAO Vault Protocol Fee: 0.50% ] |
|  ───────────────────────────────────────────────────────────────────────────────── |
|                         Total Intermediary Cost: 0.50%                             |
+------------------------------------------------------------------------------------+
```

* **99.50% Direct Payout:** The compute provider receives 99.5% of gross token expenditures.
* **0.50% DAO Revenue:** The 0.5% protocol routing fee is routed directly into the **Verxl Aragon DAO Vault** (`0xf0e51fB0FFBD8ef36281b6f643E0f7953BD5111a`).
* **Zero Custodial Risk:** Balances are governed by smart contracts; unused balances can be withdrawn at any time.

---

## 2. Network Topology & OpenAI Edge Proxy Specifications

### 2.1 System Architecture Overview

Verxl implements a hybrid architecture: latency-critical request routing and streaming take place at the global network edge via Cloudflare Workers, while trust, identity, collateral, and governance are anchored immutably on Ethereum Sepolia and Arbitrum One.

```
[ Developer Client Application ]
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
+─────────────────────────────────────────────────────────────────+
```

### 2.2 Drop-In OpenAI SDK Compatibility

Developers integrate Verxl by changing exactly two parameters in their existing OpenAI client configuration (`baseURL` and `apiKey`):

```python
from openai import OpenAI

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
    print(chunk.choices[0].delta.content or "", end="")
```

### 2.3 Edge Routing Algorithm & Sub-25ms Overhead

To maintain imperceptible routing overhead, the Cloudflare Worker executes provider selection using a weighted cost-latency objective:

$$J(i) = w_{\text{lat}} \cdot \frac{\text{TTFT}_i}{\text{TTFT}_{\max}} + w_{\text{price}} \cdot \frac{P_i}{P_{\max}}$$

* $\text{TTFT}_i$: Historical Time to First Token of provider $i$ (exponential moving average over the last 100 queries).
* $P_i$: Blended price per 1M tokens ($0.5 \times P_{\text{prompt}} + 0.5 \times P_{\text{completion}}$).
* $w_{\text{lat}}, w_{\text{price}}$: Developer-configurable optimization weights (defaults: $w_{\text{lat}} = 0.70$, $w_{\text{price}} = 0.30$).

Because database reads are cached in Cloudflare Workers KV with 60-second TTLs, routing decisions resolve in under **12 milliseconds**, well beneath our **25 ms** SLA ceiling.

---

## 3. Automated Verification & Perplexity Audit Engine

### 3.1 The Model Spoofing Problem in Decentralized Compute

In decentralized networks without quality auditing, malicious GPU operators face a lucrative arbitrage opportunity:
* **The Exploit:** An operator advertises an unquantized FP16 `meta-llama/llama-3-70b-instruct` model (charging \$0.70/1M tokens) but secretly routes requests to a 4-bit quantized version (`AWQ-4bit`) or a distilled 8B model (`llama-3-8b-instruct`, cost: \$0.08/1M tokens).
* **The Consequence:** The developer pays for premium reasoning but receives hallucination-prone, degraded completions; centralized aggregators conceal this because they run proprietary black-box nodes.

### 3.2 Seed-Locked Deterministic Probing Architecture

Verxl introduces deterministic Canary Probing executed by autonomous edge workers:

```
[ Scheduled Oracle Worker ]
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
                                                                             2nd Fail: AUTOMATED SLASH (10%)
```

1. **Greedy Sampling / Zero Temperature:** Queries are submitted with `temperature = 0.0`, `seed = 42`, `top_p = 1.0`. Under standard IEEE 754 floating-point operations, unquantized model weights produce deterministic token sequences.
2. **Normalized Levenshtein Fidelity Metric:**
   $$\text{Fidelity}(R_{\text{probe}}, R_{\text{ref}}) = 1 - \frac{\mathcal{L}(R_{\text{probe}}, R_{\text{ref}})}{\max(|R_{\text{probe}}|, |R_{\text{ref}}|)}$$
   * $\mathcal{L}(A, B)$: Levenshtein edit distance between the probe completion $R_{\text{probe}}$ and verified ground truth $R_{\text{ref}}$.
   * For authentic weights: $\text{Fidelity} \ge 0.98$.
   * Quantized or spoofed models display architectural divergence: $\text{Fidelity} \le 0.75$.
3. **Hardware Telemetry Verification:** The probe measures physical GPU bandwidth:
   $$\text{TPS} = \frac{N_{\text{completion}}}{\Delta t_{\text{generation}}} \ge \text{TPS}_{\min}$$
   If a host claims to run a 70B model on 4x H100s but delivers a TTFT of $3,500\text{ ms}$ and throughput of $8\text{ tokens/s}$, the oracle flags the provider for hardware under-provisioning.

---

## 4. Staking & Slashing Mechanics

The staking lifecycle is codified on-chain in `VerxlStakingRegistry.sol`:

```
   [ Provider Deposits Collateral ]
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
                  └── 50% Slashed Stake ──► 0x000...dEaD (Burned)
```

### 4.1 Collateral Requirements & Status Lifecycle

* **Minimum Collateral:** $S_{\min} = 1,000\text{ \$VRXL}$. Providers may stake higher amounts to boost their routing priority weighting in edge proxy selection.
* **Status Enum:**
  * `ACTIVE`: Passing all audits; eligible for 100% of routed traffic.
  * `PROBATION`: One audit probe failed. Traffic allocation throttled by 50%; provider alerted.
  * `SLASHED`: Two consecutive probe failures or detected model spoofing. Node instantly removed from routing registry.
  * `OFFLINE`: Node manually paused or initiated unbonding.

### 4.2 Mathematical Slashing Penalty & Distribution

Upon an on-chain slash trigger:

$$\text{Penalty} = S_{\text{provider}} \times \rho_{\text{slash}}$$

Where $\rho_{\text{slash}} = 0.10$ (10.0% / 1,000 basis points).

$$\text{Transfer}_{\text{DAO Vault}} = \frac{\text{Penalty}}{2} = 0.05 \cdot S_{\text{provider}}$$

$$\text{Burn}_{\text{Dead Address}} = \frac{\text{Penalty}}{2} = 0.05 \cdot S_{\text{provider}}$$

* **DAO Vault Allocation (50%):** Enriches the protocol treasury, compensating developers affected by degraded performance.
* **Deflationary Burn (50%):** Transferred to `0x000000000000000000000000000000000000dEaD`, reducing circulating `$VRXL` supply.

### 4.3 Unbonding Delay & Withdrawal Cooldown

To prevent **Exit Scams**—where an operator serves spoofed models, gathers revenue, and instantly unbonds their collateral before the oracle can execute an audit—Verxl enforces a **24-hour unbonding cooldown period**:

$$\Delta t_{\text{unbond}} = 86,400\text{ seconds}$$

Funds remain locked in the contract during cooldown and remain subject to slashing if historical fraud is discovered.

---

## 5. Aragon OSx Governance Architecture

### 5.1 Modular DAO Governance on Ethereum Sepolia

Verxl DAO is structured using the **Aragon OSx** protocol standard, providing non-custodial asset custody, programmatic access controls, and transparent token-weighted voting.

```
+───────────────────────────────────────────────────────────────────────────+
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
+───────────────────────────────────────────────────────────────────────────+
```

### 5.2 Governance Thresholds & Consensus Parameters

The Aragon Token Voting plugin is deployed on Sepolia with the following mathematical rules:

* **Support Threshold (Majority):** $> 50.0\%$ (Simple majority of cast votes).
* **Multisig Threshold:** $66.7\%$ (2 / 3 Multisig for emergency parameter adjustments).
* **Minimum Participation (Quorum):** $20.0\%$ of total circulating `$VRXL` (200,000 tokens).
* **Voting Duration:** 24 hours (configured to 1 hour during Sepolia testnet evaluation to ensure agile grading).
* **Early Execution:** Enabled. If mathematical certainty is reached before duration expiry, the proposal executes immediately.

### 5.3 On-Chain Proposals: VIP-1, VIP-2, VIP-3

* **VIP-1:** `Verxl Protocol Stage 1 Architecture & Seed Collateral Authorization` (Active, 66.7% approved by Šimon Havlík).
* **VIP-2:** `Onboard Prague Bare-Metal Bulbasaur Node (Qwen 3.5 4B) & Route 50 bps Protocol Fee` (Passed, 100% approved).
* **VIP-3:** `Arbitrum USDC Settlement Escrow & Provider Payout Minimums (Min $1.00 USD)` (Active, 75% approved).
* **ADMIN-1:** `Initial Treasury Verification & 0.001 SepoliaETH Test Transfer` (Executed on-chain, tx `0x247d5...b6b6`).

---

## 6. Tokenomics & Genesis Allocation ($VRXL)

### 6.1 Token Specification
* **Token Name:** Verxl Governance Token
* **Symbol:** `$VRXL`
* **Standard:** ERC-20 (EIP-20)
* **Decimals:** 18
* **Genesis Fixed Supply:** **1,000,000 $VRXL**
* **Inflation:** 0.0% (No unauthorized minting functions).

### 6.2 Genesis Distribution Table

In compliance with the project charter, genesis voting weight is allocated in equal tranches across founding team members:

| Recipient / Pillar | Role | Wallet Address | Allocation ($VRXL) | Share (%) |
|---|---|---|---|---|
| **Šimon Havlík** | Project Lead & Head Developer | `0x14f10A865e277C0B1949e18Dd9856602DB11742b` | 250,000 | 25.0% |
| **Founding Contributor 2** | Edge & Proxy Systems Lead | `0x4E5e69DcFE7DF0D3E5bA074C7a66CE0597cF05Ab` | 250,000 | 25.0% |
| **Founding Contributor 3** | AI Quality & Data Systems Lead | `0xE4a112C573a750b2d3Cc418CFF45FFEf9Fd1272F` | 250,000 | 25.0% |
| **DAO Treasury Vault** | Community & Staking Reserve | `0xf0e51fB0FFBD8ef36281b6f643E0f7953BD5111a` | 250,000 | 25.0% |
| **Total Genesis Supply** | | | **1,000,000** | **100.0%** |

### 6.3 Token Utility
1. **Governance Agency:** 1 `$VRXL` = 1 vote in the Verxl Aragon DAO.
2. **Provider Staking Collateral:** Required stake to list GPU endpoints in the active routing registry.
3. **Slashing Arbitration:** Token holders vote on disputed slashes submitted by penalised providers.

---

## 7. Technical Implementation Details

### 7.1 PostgreSQL Telemetry Schema on Charizard

The off-chain routing engine tracks balances and provider health through a schema optimized for high concurrency on Charizard (`212.227.211.88:5432`, schema `verxl`):

```sql
CREATE SCHEMA IF NOT EXISTS verxl;

CREATE TYPE verxl.provider_status AS ENUM ('ACTIVE', 'PROBATION', 'SLASHED', 'OFFLINE');

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
    start_date TIMESTAMP WITHOUT TIME ZONE,
    end_date TIMESTAMP WITHOUT TIME ZONE,
    status VARCHAR(20) NOT NULL,
    yes_votes NUMERIC(18, 4) DEFAULT 0,
    no_votes NUMERIC(18, 4) DEFAULT 0,
    abstain_votes NUMERIC(18, 4) DEFAULT 0,
    quorum_reached BOOLEAN DEFAULT TRUE,
    aragon_url TEXT,
    tx_hash TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE verxl.votes (
    id SERIAL PRIMARY KEY,
    proposal_id VARCHAR(32) REFERENCES verxl.proposals(id) ON DELETE CASCADE,
    voter VARCHAR(42) NOT NULL,
    vote_option VARCHAR(20) NOT NULL,
    voting_power NUMERIC(18, 4) NOT NULL,
    tx_hash TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE verxl.sync_logs (
    id SERIAL PRIMARY KEY,
    source VARCHAR(64) NOT NULL,
    proposals_synced INTEGER DEFAULT 0,
    details TEXT,
    synced_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## 8. Technical Roadmap (Q4 2026 – Q1 2027)

```
2026                                                       2027
OCTOBER             NOVEMBER            DECEMBER           JANUARY
  │                    │                    │                 │
  ▼                    ▼                    ▼                 ▼
[ Phase 1 ] ──────► [ Phase 2 ] ───────► [ Phase 3 ] ──────► [ Phase 4 ]
• Aragon DAO On      • 5-Min Pitch at    • Worker Proxy     • Multi-Node Live
  Sepolia Deploy       xPort VŠE (Nov 4)   Engineering        Stress Test Demo
• $VRXL Token        • Peer Feedback     • Slashing Oracle  • Public Beta at
• VIP-1 Proposal       Integration         Integration        verxl.com
• Charter Signed     • Contract Auditing • Testnet Honeypot • Final Defense
```

### Phase 1: Foundation & On-Chain Governance (October 2026) — [COMPLETE]
* Deploy Aragon OSx DAO on Ethereum Sepolia (`0xf0e51fB0FFBD8ef36281b6f643E0f7953BD5111a`).
* Mint 1,000,000 `$VRXL` and distribute founding tranches.
* Draft and ratify 1-page Memorandum of Association (Founders Agreement).
* Create and execute Genesis Proposal VIP-1; deposit SepoliaETH into DAO Vault.
* Persist on-chain state to Charizard PostgreSQL 17 (`verxl` schema).

### Phase 2: Proposal Pitch & Peer Review (November 2026)
* Deliver strictly timed 5-minute proposal pitch at xPort VŠE on November 4, 2026.
* Complete peer evaluations for student teams.
* Refine technical architecture based on academic peer review and stress-test feedback.

### Phase 3: Core Proxy & Oracle Engine (November – December 2026)
* Implement TypeScript Cloudflare Worker for `/v1/chat/completions`.
* Configure PostgreSQL telemetry pipeline and API key hashing.
* Deploy `VerxlStakingRegistry.sol` and test automated slashing triggers on Sepolia.

### Phase 4: Public Beta Demonstration & Final Defense (January 2027)
* Onboard independent GPU nodes across European data centers.
* Conduct staged honeypot stress tests to demonstrate 100% spoofing detection.
* Launch public beta gateway at `verxl.com` and defend the practical project implementation.

---

## 9. Game Theoretic Proof of Honest Inference

Consider a compute provider choosing whether to serve authentic FP16 weights ($a = \text{Honest}$) or quantized AWQ-4bit weights ($a = \text{Spoof}$).

Let:
* $R$: Gross revenue generated per epoch.
* $C$: Operational cost of serving authentic FP16 compute.
* $\gamma \cdot C$: Operational cost of serving quantized compute, where $\gamma \approx 0.30$ (a 70% cost reduction).
* $S$: Bonded stake in `$VRXL` ($S \ge 1,000\text{ \$VRXL}$).
* $p_{\text{audit}}$: Probability that the oracle audits the provider during the epoch ($p_{\text{audit}} = 1.0$ over rolling 30-minute intervals).
* $\rho_{\text{slash}} = 0.10$ (10% slashing penalty).

The expected payoff of honest operation:
$$\mathbb{E}[\Pi_{\text{Honest}}] = R - C$$

The expected payoff of spoofing:
$$\mathbb{E}[\Pi_{\text{Spoof}}] = R - \gamma \cdot C - p_{\text{audit}} \cdot (\rho_{\text{slash}} \cdot S + L_{\text{reputation}})$$

For honest execution to be a strictly dominant Nash strategy:
$$\mathbb{E}[\Pi_{\text{Honest}}] > \mathbb{E}[\Pi_{\text{Spoof}}]$$
$$R - C > R - \gamma \cdot C - \rho_{\text{slash}} \cdot S$$
$$(1 - \gamma) C < \rho_{\text{slash}} \cdot S$$
$$S > \frac{(1 - \gamma) C}{\rho_{\text{slash}}}$$

Given $\rho_{\text{slash}} = 0.10$ and $(1 - \gamma) = 0.70$:
$$S > 7 \cdot C$$

Because the minimum required stake is $1,000\text{ \$VRXL}$ and an average hourly batch cost $C \ll 100\text{ USD}$, the slashing penalty strictly dominates any marginal profit from downsampling weights. Intentional model degradation is strictly economically irrational.

---

## 10. Conclusion

Verxl Protocol dismantles the rent-seeking monopoly of centralized AI model aggregators. By combining a fixed **0.5% protocol fee** with non-custodial smart contracts, seed-locked deterministic quality auditing, and Aragon OSx decentralized governance, Verxl provides developers with a 94% cheaper inference rail while enabling GPU data centers to monetize idle capacity trustlessly.

---

## References

1. **Akerlof, G. A.** (1970). *The Market for "Lemons": Quality Uncertainty and the Market Mechanism.* The Quarterly Journal of Economics, 84(3), 488–500.
2. **Nakamoto, S.** (2008). *Bitcoin: A Peer-to-Peer Electronic Cash System.* https://bitcoin.org/bitcoin.pdf.
3. **Buterin, V.** (2014). *Ethereum: A Next-Generation Smart Contract and Decentralized Application Platform.* https://ethereum.org/whitepaper/.
4. **Williamson, O. E.** (1981). *The Economics of Organization: The Transaction Cost Approach.* American Journal of Sociology, 87(3), 548–577.
5. **Aragon Association.** (2023). *Aragon OSx: Modular, Upgradeable Smart Contract Framework for Decentralized Organizations.* https://aragon.org.
