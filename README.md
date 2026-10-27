# Verxl Protocol (`verxl.com`)
### Decentralized AI Inference Routing & Compute Clearinghouse

![Verxl DAO](assets/verxl-dao-logo-horizontal.jpg)

**Verxl Protocol** is an open, non-custodial clearinghouse and edge routing layer for artificial intelligence inference. Governed on-chain by **Verxl DAO**, the protocol connects AI developers directly to verified global GPU compute providers, replacing the 8%–10% intermediary take-rate of centralized brokers (e.g., OpenRouter) with an ultra-thin 0.5% (50 bps) protocol fee switch accrued to the DAO vault.

---

## 🏛️ Live On-Chain Deployment (Ethereum Sepolia Testnet)

* **DAO Contract Address:** [`0xf0e51fB0FFBD8ef36281b6f643E0f7953BD5111a`](https://sepolia.etherscan.io/address/0xf0e51fB0FFBD8ef36281b6f643E0f7953BD5111a)
* **Aragon OSx Dashboard:** [https://app.aragon.org/#/daos/sepolia/0xf0e51fB0FFBD8ef36281b6f643E0f7953BD5111a](https://app.aragon.org/#/daos/sepolia/0xf0e51fB0FFBD8ef36281b6f643E0f7953BD5111a)
* **Live Voting Poll (VIP-1):** [https://app.aragon.org/dao/ethereum-sepolia/0xf0e51fB0FFBD8ef36281b6f643E0f7953BD5111a/proposals/VIP-1](https://app.aragon.org/dao/ethereum-sepolia/0xf0e51fB0FFBD8ef36281b6f643E0f7953BD5111a/proposals/VIP-1)
* **Framework:** Aragon OSx (Open Standards for Decentralized Organizations)
* **Governance Token:** `$VRXL` (1,000,000 fixed genesis supply)
* **Primary Domain:** [`https://verxl.com`](https://verxl.com)

---

## 📚 Academic & Course Deliverables (FIR VŠE Prague)

* **Course:** Crypto Course, Faculty of International Relations (FIR / FMV), VŠE Prague
* **Instructor:** Ing. Ondřej Paruch
* **Team Lead:** Šimon Havlík

### Task 1: Aragon DAO Deployment (Graded 2 + 1 APs)
1. **Live DAO Contract:** [`0xf0e51fB0FFBD8ef36281b6f643E0f7953BD5111a`](https://sepolia.etherscan.io/address/0xf0e51fB0FFBD8ef36281b6f643E0f7953BD5111a)
2. **Aragon App URL:** [Open on Aragon App](https://app.aragon.org/#/daos/sepolia/0xf0e51fB0FFBD8ef36281b6f643E0f7953BD5111a)
3. **Submission Guide & Checklist:** [`docs/ARAGON_SEPOLIA_DEPLOYMENT_GUIDE.md`](docs/ARAGON_SEPOLIA_DEPLOYMENT_GUIDE.md)
4. **Extra Credit Deliverable (+1 AP): Founders' Agreement:** [`docs/FOUNDERS_AGREEMENT.md`](docs/FOUNDERS_AGREEMENT.md)
5. **Extra Credit Deliverable (+1 AP): Programmatic Deployment Script:** [`contracts/scripts/deploy-dao.js`](contracts/scripts/deploy-dao.js)

### Task 2: Term Project Proposal & Presentation (Graded 8 APs)
* **Pitch Date:** November 4, 2026 | xPort VŠE (Jeseniova 2769/208, Praha 3)
* **Strict Limit:** Exactly 5 minutes
* **Official Whitepaper:** [`docs/WHITEPAPER.md`](docs/WHITEPAPER.md)
* **8-Slide Presentation Deck:** [`docs/PRESENTATION_PITCH_DECK.md`](docs/PRESENTATION_PITCH_DECK.md)
* **Word-for-Word Pitch Script:** [`docs/PRESENTATION_PITCH_SCRIPT.md`](docs/PRESENTATION_PITCH_SCRIPT.md)

---

## ⚙️ Technical Architecture & Monorepo Structure

```
verxl-protocol/
├── assets/                     # Official brand logos (Horizontal & Square)
├── contracts/                  # Solidity smart contracts & Hardhat suite
│   ├── contracts/
│   │   ├── VerxlToken.sol      # $VRXL ERC-20 governance token
│   │   └── VerxlStakingRegistry.sol # Provider collateral staking & slashing
│   ├── scripts/
│   │   ├── deploy-contracts.js # Hardhat contract deployment
│   │   └── deploy-dao.js       # Aragon OSx SDK programmatic deployment
│   └── test/                   # Automated contract unit tests (100% passing)
├── database/                   # PostgreSQL telemetry & audit engine
│   ├── schema.sql              # DDL schema (users, api_keys, providers, audits, usage)
│   └── seed.sql                # Staging & test data
├── docs/                       # Academic submissions & technical whitepaper
│   ├── WHITEPAPER.md           # Core whitepaper
│   ├── FOUNDERS_AGREEMENT.md   # 1-page charter (+1 AP extra credit)
│   ├── PRESENTATION_PITCH_DECK.md # 8-slide FIR VŠE deck
│   ├── PRESENTATION_PITCH_SCRIPT.md # 5-minute timed script
│   └── ARAGON_SEPOLIA_DEPLOYMENT_GUIDE.md # Submission checklist
└── edge-proxy/                 # Cloudflare Worker edge proxy (verxl.com/v1)
    └── src/index.ts            # OpenAI-compatible streaming router (<25ms)
```

---

## 🧪 Testing Smart Contracts

```bash
cd contracts
npm install
npx hardhat test
```
*All 9 unit tests pass out-of-the-box, verifying staking, automated slashing, 10% penalty splits to the DAO vault, and 24-hour unbonding delays.*
