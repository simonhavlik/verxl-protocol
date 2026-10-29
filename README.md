# Verxl Protocol

**Private, fast and affordable inference clearing.** One OpenAI-compatible endpoint across independent providers, client-side encrypted chat, and USDC settlement at 50 bps.

[![Website](https://img.shields.io/badge/Website-verxl.com-b8f6dd?style=flat-square&labelColor=070a0f)](https://verxl.com)
[![Network](https://img.shields.io/badge/Ethereum-Sepolia%20test%20run-b8f6dd?style=flat-square&labelColor=070a0f)](https://sepolia.etherscan.io/address/0xf0e51fB0FFBD8ef36281b6f643E0f7953BD5111a)
[![Design](https://img.shields.io/badge/Design-DESIGN.md-8fa39b?style=flat-square&labelColor=070a0f)](DESIGN.md)
[![License](https://img.shields.io/badge/License-MIT-8fa39b?style=flat-square&labelColor=070a0f)](LICENSE)

> **Sepolia test run.** Verxl is an applied blockchain project at VŠE Praha and a demonstration deployment. It is not a mainnet production system, not an enterprise SLA, and not a consumer token.

---

## What Verxl is

Verxl is a clearing layer for AI inference. It does not train models. It does not rent a GPU cloud. It routes one OpenAI-compatible request to an approved provider, meters the compute, and settles the fee in USDC.

- **Access:** `POST /v1/chat/completions`, Bearer auth, SSE streaming, three starting models; the live registry adds more.
- **Privacy:** chat messages are encrypted in the browser with a wallet-derived key before they leave the tab.
- **Settlement:** 50 bps of compute to the protocol; 99.5% to the provider; USDC on Arbitrum, demonstrated on Sepolia.
- **Surfaces:** API, encrypted Chat, Playground, and a provider registry. Search, charts and file attachments sit in Chat.

The clearing path is the product.

---

## Design language

> A report before it is a dashboard.

Verxl is presented as a quiet, evidence-first system. One idea per section, one signature graphic, a claim with a method and a limit. The interface should feel like a well-made ESG report that actually carries its footnotes — not a dashboard skin, and not a pitch deck.

### Materiality

| What matters | How the interface answers |
|---|---|
| **The claim** | One idea per section. A number is shown with its method and boundary, not as decoration. |
| **The provider set** | The catalogue starts with three published routes. The registry is open: anyone can register a provider, and every provider is reviewed and approved before listing. |
| **The boundary** | Sepolia is stated on the page, not buried. No mainnet, SLA or coverage claim survives without a caveat. |
| **The fee** | 50 bps, 99.5% to providers, USDC. No token, points or emissions in the product path. |
| **The private surface** | Ciphertext at rest and a browser-held key. The metadata the operator still sees is disclosed. |
| **The team** | Small, named, credited. No invented headcount, no borrowed logos. |

### The system

| Layer | Decision |
|---|---|
| Ink / surfaces | `#070A0F` ink, `#0A0F14` / `#0B1117` panels, hairline rules, no blue-tinted surfaces. |
| Accent | Mint `#B8F6DD`, sage `#7FAE9D`, steel `#8FA39B`; caution rose `#D99A9A`. No blue, cobalt, cyan, teal, purple, amber or emerald UI. |
| Type | Helvetica Neue / Inter; Menlo / JetBrains Mono for 8–10px labels. Large two-line statements, muted second line, 13–16px body. |
| Geometry | Square edges (0–3px), hairline borders, generous negative space, no pills or rounded cards. |
| Signature graphics | A GeoJSON Europe map (client → EU edge → Prague), a fixed 384px clearing terminal, native evidence tables and bars. |
| Motion | Slow drifting background, spotlight, hover rules. Fixed panes do not move when tabs or streams change. |

### Assurance and boundaries

- Every public number has a source, a method or a limit attached.
- The map is illustrative: it is not a coverage map, an SLA or a latency guarantee.
- The demo is Sepolia. Settlement logic is described separately from mainnet production.
- No fake metrics, invented benchmarks, fake customers or dark patterns.
- No data business: chats are not a training corpus; the operator sees usage records, not plaintext.

### Interface governance

The design rules are public, versioned and reviewable in [DESIGN.md](DESIGN.md). The repository is MIT-licensed. The product has no token, no staking, no bonding and no points.

---

## How a request clears

1. **Browser** — the user composes a request. In Chat, the message is encrypted with a wallet-derived key before it leaves the tab; the API receives ciphertext. The plaintext stays local.
2. **Edge** — Cloudflare Pages Functions route the request. The edge does not queue it behind a control plane.
3. **Compute** — the request is served by an approved provider. The current demo uses a bare-metal Qwen host in Prague and two official bridges.
4. **Settlement** — the protocol meters the compute, takes 50 bps, and records the provider's 99.5% in USDC. The current deployment demonstrates this on Sepolia.

The live site includes the map, the current route and the receipts.

---

## Provider registry

The registry is open by design.

- **Anyone can register** as an inference provider.
- **Every provider is reviewed and approved** before it is listed. Registration is not automatic listing.
- The **current catalogue starts with three** routes. The live registry is the source of truth, so approved providers can add more.
- There is **no staking, bonding or slashing** in the product path. Approval is a review decision, not a purchase of placement.
- There is **no product token**. The fee is USDC; the academic Aragon DAO is a Sepolia governance artefact, not a consumer investment.

---

## Current catalogue

| Model | Host | Context | P50 TTFT |
|---|---|---|---|
| Qwen 3.5 4B Uncensored | Prague bare metal | 32K | 38 ms |
| DeepSeek V4.1 Flash | Official bridge | 1M | 92 ms |
| MiMo 2.6 Flash | Official bridge | 1M | 85 ms |

TTFT is measured on the Sepolia demonstration. It is not an SLA.

The three routes above are the starting catalogue, not a cap. The live catalogue is served from the provider registry (`/api/providers`); approved providers add models and the public catalogue section updates from it.

---

## Accountability

- Every provider is reviewed and approved before listing; approval looks at abuse handling, logging policy and operational accountability.
- Every uncensored route is capped at **20B parameters**. Qwen 3.5 4B is the current starting example; a future uncensored model must fit the same ceiling. Frontier models run 500B to 4T.
- Frontier-grade requests route to safety-aligned models from approved providers. DeepSeek V4.1 Flash and MiMo 2.6 Flash are the current starting examples; the registry is the source of truth.
- Abuse reports lead to provider removal. The policy applies to every model, not a fixed list.

---

## Mobile

- Routes are code-split; the Hero is lazy, WebGL is skipped on phones, and KaTeX is out of the first-load Chat/Playground chunk.
- Route chunks are prefetched on hover/touch and during idle; HTML is no-cache while hashed assets are immutable.
- About and Whitepaper keep the phone page short with full content one tap away; Oracle collapses audit history; Chat uses a standard mobile header, drawer and composer.
- Verified at 390px: no page-level horizontal overflow. MetaMask on iOS uses `metamask://dapp/...` first.

---

## Evidence

| Measure | Value | Boundary |
|---|---|---|
| Protocol take | 50 bps | Parameter, not a price promise |
| Provider payout | 99.5% | USDC on Arbitrum; Sepolia demo |
| P50 TTFT | 38 ms | Prague host, demonstration sample |
| Oracle fidelity | 99.8% | Canary probe, seed=42 |
| Models | 3 | Current demo; registry can grow |

---

## Privacy boundary

- Chats: encrypted in the browser with a wallet-derived key; AES-256-GCM; ciphertext envelope stored.
- No plaintext logs: message text, conversation titles and system prompts are never stored.
- No API-key history: a Verxl API key opens usage and billing; it cannot decrypt chats or read past conversations.
- Anonymous upstream: Verxl holds the model-provider credential; the provider receives the request, not your Verxl account key.
- Stored: ciphertext, wallet key id, timestamps, usage records.
- Still visible to the operator: account, wallet address, usage records and envelope size.
- Bridge providers log according to their own policy; Chat is ciphertext-only.

---

## Stack

React 18 · Vite · TypeScript · Tailwind · Three.js · d3-geo / GeoJSON · Cloudflare Pages & Functions · PostgreSQL via Hyperdrive · Aragon OSx on Sepolia · OpenAI-compatible API.

The `contracts/` directory retains the academic Sepolia DAO artefacts. The web product path does not require staking, bonding or a token.

---

## Academic context

Verxl is an applied blockchain project at the **Prague University of Economics and Business (VŠE Praha)**, Faculty of International Relations (FIR / FMV), Course 2SE307 Bitcoin and blockchain. The on-chain work is a Sepolia demonstration.

Lead architect: **Šimon Havlík**. Team: Daniel Kolárovský (verification / SLA), Miroslava Valová (compliance / research). Contact: [me@simonhavlik.com](mailto:me@simonhavlik.com).

---

## Run locally

```bash
git clone https://github.com/simonhavlik/verxl-protocol.git
cd verxl-protocol
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:5173`. Build with `npm run build`.

Environment variables are documented in `.env.example`; the demo defaults to public Sepolia RPCs where possible. Operator secrets belong in Cloudflare environment bindings, not in the repository.

---

## Security and limits

- No API keys, private keys or credentials are stored in this repository. Operator secrets live in Cloudflare environment bindings.
- This is a Sepolia demonstration. Do not present it as mainnet production.
- The map is illustrative; it is not a coverage map, SLA or latency guarantee.
- The demo has no enterprise SLA and no consumer token.
- The catalogue starts with three routes; the open registry is the path to a broader provider set.

---

## Links

- [Live site](https://verxl.com)
- [Design language](DESIGN.md)
- [Whitepaper](https://verxl.com/whitepaper)
- [Academic DAO on Aragon](https://app.aragon.org/#/daos/sepolia/0xf0e51fB0FFBD8ef36281b6f643E0f7953BD5111a)
- [DAO vault on Sepolia](https://sepolia.etherscan.io/address/0xf0e51fB0FFBD8ef36281b6f643E0f7953BD5111a)

---

## License

MIT — see [LICENSE](LICENSE). Copyright (c) 2026 Šimon Havlík and Verxl Protocol Contributors.
