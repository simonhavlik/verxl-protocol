# Verxl Protocol — AI Handover & Architecture Guide

> **Target Audience:** Future AI coding assistants working on the Verxl Protocol codebase.  
> **Last Updated:** October 28, 2026  
> **Author / Project Founder:** Šimon Havlík (`me@simonhavlik.com`)  
> **Production Live URL:** [https://verxl.com](https://verxl.com)  
> **Repository:** `simonhavlik/verxl-protocol` (branch `main`)  
> **Local Workspace Directory:** `/Users/simon/dev/verxl-protocol`

---

## 1. Executive Summary & Core Mission

**Verxl Protocol** (`verxl.com`) is a capital-light, stateless, non-custodial decentralized AI inference clearinghouse and OpenAI SDK-compatible edge router.

- **The Problem:** Centralized hyperscalers (AWS Bedrock, OpenAI, Together) charge 80–90% gross margins (effective 950 basis points) on open-weight models, compound credit card fees, and mandate unsegregated custodial fiat pre-funding.
- **The Verxl Solution:** Verxl operates as an agency clearinghouse (like Visa or NASDAQ), routing inference requests statelessly with a fixed **50 basis point (0.50%)** protocol clearing fee. **99.5%** flows directly to independent GPU hosts in USDC, and **0.5%** flows into the DAO Treasury.
- **Academic Context:** Developed as an applied blockchain and decentralized compute competition project at the Prague University of Economics and Business (VŠE Praha).
- **Governance:** Governed by an Aragon OSx DAO on Ethereum Sepolia:
  - **DAO Vault / Address:** `0xf0e51fB0FFBD8ef36281b6f643E0f7953BD5111a`
  - **Governance Token:** `0x8F590f2098D71A8253ad50450D7A73F3201402F0`
  - **Proposal VIP-1:** Deployed and active on Sepolia Aragon OSx.

---

## 2. Inviolable Constraints & Operational Rules

> [!CAUTION]
> **READ THESE BEFORE WRITING ANY CODE OR RUNNING GIT COMMANDS:**

1. **Strictly 3 Models Only:**
   We provide **strictly 3 models**. DO NOT add, advertise, or simulate any other models (no LLaMA, Mistral, Claude, GPT, etc.):
   - `qwen3.5-4b-uncensored-32k` (Bulbasaur Bare-Metal · Prague Host)
   - `deepseek-v4.1-flash` (Official Bridge · Tokyo/Hangzhou Edge)
   - `mimo-v2.6-flash` (Official Bridge · Frankfurt Edge)
2. **Default Temperature is 0.7:**
   The standard inference temperature across Playground, Chat, and code snippets must default to `0.7`.
3. **No Staking or Bond Concepts:**
   All concepts of "$VRXL staking", "staked collateral", "bond 1,000 $VRXL", and staking modals have been completely removed. Replaced by transparent **Data Policy** badges (*Bare-Metal · Zero-Logging* vs *Bridge · Upstream Stored*). DO NOT reintroduce staking/bonds.
4. **Never Commit Raw API Keys or Secrets:**
   - Upstream provider keys (e.g. `oc_sk_...`) must **NEVER** be committed to GitHub or hardcoded into source files.
   - Upstream keys reside strictly in PostgreSQL (`verxl.providers` / `verxl.secrets`) or Cloudflare Environment Secrets.
   - Any raw key committed to GitHub compromises production. Git history was sanitized via `git filter-branch`.
5. **Charizard Port 11645 Inference Is Permanently Disabled:**
   - Unauthenticated `socat` forwarding on `212.227.211.88:11645` was killed.
   - Bulbasaur inference routes directly through Cloudflare Tunnel: `https://node1.verxl.com/v1/chat/completions`.
6. **Scope Discipline:**
   - Only modify files inside `/Users/simon/dev/verxl-protocol`.
   - Never touch or modify other local directories or external Git repositories on this machine.
7. **Admin Privileges & Unified Account:**
   - Admin Email: `me@simonhavlik.com`
   - Admin MetaMask Addresses: `0x14f10A865e277C0B1949e18Dd9856602DB11742b` and `0x9b64203878f24eb0cdf55c8c6fa7d08ba0cf77e5`
   - Šimon's email and MetaMask wallet are linked to the same unified balance in `verxl.users`.
   - Governance Admin Tabs (Tab 4 "Registry" and Tab 5 "Users") are strictly restricted to `isAdmin`.

---

## 3. Infrastructure & Network Architecture

```
                       [ Client / Frontend (verxl.com) ]
                                      │
                                      ▼
                        [ Cloudflare Pages Edge ]
                      (/v1/chat/completions, /v1/models)
                                      │
            ┌─────────────────────────┴─────────────────────────┐
            │                                                   │
            ▼                                                   ▼
[ Prague Bare-Metal Host ]                             [ Official Bridges ]
(node1.verxl.com via CF Tunnel)                                 │
  - Local Vulkan GPU Host                                       ├──► DeepSeek V4.1 Flash (Tokyo/Hangzhou)
  - Ollama Daemon (32k context)                                 └──► Xiaomi MiMo 2.6 Flash (Frankfurt)
  - Volatile RAM · Zero Disk Logging
                                      │
                                      ▼
                      [ Charizard VPS (PostgreSQL) ]
                          212.227.211.88:5432
                      (users, usage_records, providers)
```

### Server Inventory

| Node Name | Host / IP | Role | Access / Port |
| :--- | :--- | :--- | :--- |
| **Edge Router** | Cloudflare Pages (`verxl.com`) | Stateless edge routing, SSE streaming, authentication | 443 (HTTPS) |
| **Bulbasaur Prague** | `node1.verxl.com` | Dedicated bare-metal Vulkan Ollama host (`qwen3.5-4b-uncensored-32k:latest`) | Cloudflare Tunnel (HTTPS) |
| **Charizard VPS** | `212.227.211.88` | PostgreSQL 16 database, admin backend, provider telemetry | Port 5432 (SSL/Auth) |
| **Aragon OSx** | Ethereum Sepolia | Non-custodial DAO vault, governance token, proposal voting | Web3 RPC / Sepolia Etherscan |
| **Verxl Agent Mail** | `automated@verxl.com` | Automated provider correspondence, application notifications | `smtp.seznam.cz:465` / `imap.seznam.cz:993` |

---

## 4. Database Schema (PostgreSQL on Charizard)

Database connection string:
`postgresql://kiam:...@212.227.211.88:5432/kiam` (schema: `verxl`)

Key tables in `verxl`:
- `users`: User profiles (`id`, `email`, `wallet_address`, `balance_usd`, `total_deposited_usd`, `total_spent_usd`, `status`).
- `api_keys`: Generated API keys (`id`, `user_id`, `key_hash`, `key_prefix`, `key_type`, `is_active`, `spend_limit_usd`).
- `providers`: Active nodes and bridges (`id`, `name`, `base_url`, `api_key`, `payout_address`, `is_official_bridge`, `status`, `models_config`, `pending_payout_usd`, `total_earned_usd`).
- `provider_applications`: Model submission proposals awaiting admin approval (`id`, `name`, `operator_address`, `endpoint_url`, `model_identifier`, `hardware`, `website`, `contact_email`, `message`, `status`).
- `provider_emails`: Agent mail logs between `automated@verxl.com` and prospective model operators (`id`, `application_id`, `direction`, `sender`, `recipient`, `subject`, `body_text`, `status`).
- `usage_records`: Immutable per-request clearing log (`id`, `user_id`, `api_key_id`, `provider_id`, `model`, `prompt_tokens`, `completion_tokens`, `total_cost_usd`, `protocol_fee_usd`, `provider_revenue_usd`).
- `deposits`: On-chain Arbitrum USDC deposits credited to user accounts (`id`, `user_id`, `tx_hash`, `amount_usd`, `status`).
- `chat_conversations`: Cloud-synced chat history for authenticated users.

---

## 5. Frontend Component Architecture (`src/components/`)

```
src/
├── App.tsx                     # Main router, Error Boundaries, tab navigation
├── context/
│   └── AuthContext.tsx         # Unified authentication (Token, Wallet, Custom API Key)
├── components/
│   ├── Header.tsx              # Top bar, balance pill, wallet badge (hides Whitepaper post-login)
│   ├── Footer.tsx              # Institutional footer, legal links, whitepaper link
│   ├── Hero.tsx                # Homepage hero, interactive 4-stage tour, embedded Live Playground
│   ├── Playground.tsx          # Real-time inference tester, unlock-on-login, dynamic code snippets
│   ├── Chat.tsx                # Chat UI, streaming SSE, KaTeX math, 3-model selector
│   ├── Console.tsx             # Developer API keys, Arbitrum USDC billing, usage analytics
│   ├── Governance.tsx          # Aragon OSx, Founders' Charter, tabs 4 & 5 for admin
│   ├── AdminRegistryTab.tsx    # Admin: Model applications, fleet monitoring, Agent Mail
│   ├── AdminUsersTab.tsx       # Admin: User management, balance rewriting, activity inspection
│   ├── Registry.tsx            # Public provider list & application submission form
│   ├── Oracle.tsx              # Seed-locked canary invariance verification (seed=42)
│   ├── Vision.tsx              # Institutional investor pitch & hardware roadmap
│   ├── WhitepaperContent.tsx   # Markdown-rendered academic technical whitepaper
│   └── Legal.tsx               # GDPR Privacy Policy, Terms of Service, EU MiCA Statement
```

### Key UI Behaviors
1. **Homepage Embedded Playground:**
   The live `<Playground onNavigate={onNavigate} />` is embedded directly on the homepage (`Hero.tsx`) under `#live-playground`. The hero CTA button smoothly scrolls down to it.
2. **Post-Login Whitepaper Concealment:**
   In `Header.tsx`, when authenticated (`user || walletAddress`), the Whitepaper button is omitted from the top bar to save space for the `$USD` balance and connected wallet pill. Whitepaper remains permanently accessible in the footer and via `/whitepaper`.
3. **Model Unlocking on Login:**
   - Unauthenticated visitors can execute the free Bulbasaur Qwen 3.5 4B model with zero login.
   - Visitors can select DeepSeek and MiMo to preview parameter settings and auto-updating code integration snippets (`curl`, `python`, `typescript`).
   - Once authenticated (`user` is present), all 3 models are completely unlocked for live streaming execution.

---

## 6. Build & Deployment Procedure

### Building Production Bundle
```bash
cd /Users/simon/dev/verxl-protocol
npm run build
```
Verify output: TypeScript (`tsc`) and Vite must finish with **0 errors**.

### Deploying to Cloudflare Pages
```bash
cd /Users/simon/dev/verxl-protocol
CLOUDFLARE_API_TOKEN=$CLOUDFLARE_API_TOKEN \
CLOUDFLARE_ACCOUNT_ID=92170974e105eccaaeab64ed49d553e2 \
npx wrangler pages deploy dist --project-name=verxl-protocol --branch=main
```

### Pushing to GitHub
```bash
cd /Users/simon/dev/verxl-protocol
git status
git add <modified_files>
git commit -m "feat/fix: concise description"
git push origin main
```

---

## 7. Emergency Runbook & Troubleshooting

### Problem: User Reports Leaked API Key on Public Internet
1. **Isolate:** Check `git log -S "<key_prefix>"` immediately to verify if the key was committed.
2. **Sanitize:** If committed, rewrite history using `git filter-branch` to remove the string across all commits and force-push to `origin main` (ONLY on `verxl-protocol`).
3. **Rotate:** Update the upstream key in PostgreSQL `verxl.providers` or `verxl.secrets`. Never place keys in client-side code.

### Problem: Blank Screen on API or Tab Load
1. Check `TabErrorBoundary` in `App.tsx`.
2. Ensure API key fields don't throw null reference exceptions when `keys` or `user` is hydrating.
3. Check browser console logs for unhandled rejections during Web3 wallet or JWT token hydration.

### Problem: Bulbasaur Inference Times Out
1. Verify Cloudflare Tunnel health: `curl -I https://node1.verxl.com/v1/models`.
2. Ensure Ollama daemon is running on the Prague host with model `qwen3.5-4b-uncensored-32k:latest`.
3. Check `functions/v1/chat/completions.ts` to ensure requests route directly to `https://node1.verxl.com/v1/chat/completions` (NOT to port 11645).
