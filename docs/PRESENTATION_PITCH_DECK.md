# Verxl Protocol: 8-Slide Pitch Deck Specification
### Term Project Proposal — Crypto Course, FIR VŠE Prague
**Event:** Innovation Week Pitch Event — November 4, 2026, 1:00 PM CET  
**Venue:** xPort VŠE, Jeseniova 2769/208, 130 00 Praha 3  
**Presentation Time Limit:** Strictly 5 minutes (300 seconds)  
**Template Basis:** FIR VŠE Official Deck Template (`Term_project_proposal_Polis_template(2).pptx`)  
**Domain & Gateway:** `verxl.com`  

---

## Slide 1: Title Slide
* **Slide Header:** VŠE FIR Logo (Top Left) / Brand Graphic (Bottom Right)
* **Title:** **Verxl Protocol** (`verxl.com`)
* **Subtitle:** Decentralized, Zero-Margin AI Model Routing & Compute Marketplace
* **Team Name / Number:** Team Verxl (Team [X])
* **Presenters:** Šimon Havlík (Team Leader & Architect), [Co-Presenter 2], [Co-Presenter 3], [Co-Presenter 4]
* **Visual Elements:**
  * Official Horizontal Logo: `assets/verxl-dao-logo-horizontal.jpg`
  * Clean dark-mode background (#0D1117) with electric blue accents (#1E6BFF)

---

## Slide 2: What problem does your project solve?
* **Slide Title:** **What problem does your project solve?**
* **Key Pain Points:**
  1. **Monopolistic 8%–10% Fee Drag on AI Startups:**
     * Centralized aggregators like OpenRouter charge a **5.5% platform fee** on top of credit card processing (2.9% + $0.30) and foreign exchange markups.
     * High-volume AI startups lose hundreds of thousands of dollars purely to fiat payment friction and centralized routing intermediaries.
  2. **Custodial Risk & Counterparty Arbitrariness:**
     * Developers must deposit large prepaid custodial balances in fiat.
     * Accounts risk arbitrary rate limits, KYC friction, or sudden platform termination with zero recourse.
  3. **The "Model Spoofing" Dilemma for GPU Providers:**
     * Independent GPU data centers (e.g. converted mining facilities in Central Europe) lack a trustless marketplace to monetize idle compute.
     * Developers distrust independent endpoints due to fear of model spoofing (e.g., serving a quantized 8B model while charging for a 70B parameter model).
* **Visual Elements:** Comparison infographic: *Centralized Custodial Aggregator (8-10% fee, black-box routing)* vs. *Verxl Protocol (0.5% fee, non-custodial smart contracts, cryptographic proof)*.

---

## Slide 3: Who is the target audience?
* **Slide Title:** **Who is the target audience?**
* **Three Synergistic Market Participants:**
  1. **AI Developers & SaaS Startups (Demand Side):**
     * Engineers seeking a drop-in replacement for OpenAI API (`api.openai.com` -> `verxl.com/v1`).
     * Direct crypto billing via on-chain balances; zero credit card fees; 90% cheaper routing overhead.
  2. **Independent Compute Providers & GPU Data Centers (Supply Side):**
     * Regional Tier-2/Tier-3 data centers and converted crypto mining facilities with clusters of RTX 4090s, A100s, and H100s.
     * Need immediate, permissionless liquidity for idle compute capacity without signing multi-year enterprise sales agreements.
  3. **$VRXL Token Holders & DAO Arbitrators (Governance / Security):**
     * Crypto-native participants staking `$VRXL` to back verified provider endpoints, earning a fraction of the 0.5% protocol routing fee while arbitrating audit disputes.
* **Visual Elements:** Three-pillar ecosystem diagram illustrating token and data flows between Developers, Providers, and the Aragon DAO.

---

## Slide 4: What is your role in the project?
* **Slide Title:** **What is your role in the project?**
* **Team Responsibilities & Division of Labor (Founding Trio · VŠE Praha):**
  * **Šimon Havlík — Project Lead & Head Developer (Lead Protocol Architect):**
    * End-to-end technical system architecture: Aragon OSx DAO deployment on Sepolia, `VerxlStakingRegistry.sol` smart contract, Cloudflare edge proxy (`verxl.com/v1`), Charizard VPS socat tunnel, Arbitrum USDC escrow settlement, and deterministic consensus probing.
  * **Daniel Kolárovský — Quality Assurance & Process Verification Lead:**
    * Directs protocol quality control frameworks, independent process audit verification, empirical SLA benchmarking across European GPU providers, and deterministic TTFT testing.
  * **Miroslava Valová — Regulatory Compliance & Market Strategy Lead:**
    * Heads competitive market intelligence, macroeconomic cost benchmarking against legacy hyperscaler cloud aggregators, regulatory compliance alignment (EU AI Act & MiCA non-custodial boundaries), and institutional risk governance.
* **Visual Elements:** Executive portraits and leadership credentials aligned with 33.34% / 33.33% / 33.33% governance tranches.

---

## Slide 5: What is the goal of the project?
* **Slide Title:** **What is the goal of the project?**
* **Concrete Project Objectives:**
  1. **Deploy a Live OpenAI-Compatible Edge Proxy (`verxl.com/v1`):**
     * Deliver a working, drop-in replacement endpoint where developers change one line of code in Python/TypeScript to access cheaper inference.
  2. **Establish On-Chain Aragon Governance & Vault on Sepolia:**
     * Deploy the live Aragon OSx DAO with 1,000,000 `$VRXL` genesis supply, executing on-chain proposals and routing protocol fee accrual directly to the DAO Vault.
  3. **Build the Autonomous AI Quality Oracle & Staking Mechanism:**
     * Implement deterministic seed-locked prompt probes running every 30 minutes to verify Time to First Token (TTFT) and perplexity, programmatically slashing dishonest nodes.
  4. **Deliver a Comprehensive, Production-Grade Prototype by January 2027:**
     * Progress from the Sepolia testnet MVP presented today to a live public beta on Arbitrum One L2.
* **Visual Elements:** Architectural flowchart showing Client -> Cloudflare Worker -> PostgreSQL -> GPU Provider -> Sepolia DAO Vault.

---

## Slide 6: How will you evaluate/measure if the project was successful?
* **Slide Title:** **How will you evaluate/measure if the project was successful?**
* **Quantitative & Verifiable Key Performance Indicators (KPIs):**
  1. **Routing Overhead < 25 ms:**
     * Cloudflare edge routing overhead benchmarked at under 25 milliseconds, ensuring zero perceived lag for streaming completions.
  2. **Platform Fee Reduction >= 85%:**
     * Verifiable reduction from the incumbent 5.5% + 3% card fee (8.5% total) down to Verxl's flat **0.5% protocol fee**.
  3. **100% Honeypot Audit Accuracy:**
     * The autonomous audit probe must achieve 100% detection rate during staged testnet attacks (detecting quantized 8B models spoofing as unquantized 70B models).
  4. **Successful On-Chain Governance Execution:**
     * 100% on-chain completion of Task 1 criteria: live Sepolia Aragon DAO URL, deposit proof into the vault, quorum reached (>20%), and proposal VIP-001 executed.
* **Visual Elements:** Metric cards with target numbers, progress bars, and test benchmark charts.

---

## Slide 7: What is the expected timeframe/duration of the project?
* **Slide Title:** **What is the expected timeframe/duration of the project?**
* **Project Roadmap & Milestones:**
  * **Phase 1: Foundation & DAO Deployment (Late October 2026) [COMPLETED]**
    * Aragon DAO deployed on Sepolia; Founders Agreement ratified; `$VRXL` token distributed; Genesis proposal VIP-001 created.
  * **Phase 2: Innovation Week Pitch & Peer Feedback (November 4, 2026)**
    * 5-minute proposal pitch at xPort VŠE; gathering peer evaluations and instructor insights.
  * **Phase 3: Core Engine & Telemetry Build (November – Mid-December 2026)**
    * Implement Cloudflare Worker edge proxy (`/v1`), PostgreSQL schema, API key authorization, and mock provider endpoints.
  * **Phase 4: Autonomous Auditor & Staking System (Late December 2026)**
    * Deploy `VerxlStakingRegistry.sol`; connect scheduled audit probes; test automated stake slashing on Sepolia.
  * **Phase 5: Public Beta & Final Submission (January 2027)**
    * Live public demo on `verxl.com`; end-to-end stress testing with multi-region GPU providers; final term project defense.
* **Visual Elements:** Visual timeline / Gantt chart spanning October 2026 through January 2027.

---

## Slide 8: Outro & Contact
* **Slide Title:** **Thank you for your attention and feedback!**
* **Closing Slogan:** *Verxl Protocol — Permissionless Intelligence at Zero Margins.*
* **Project Resources:**
  * **Gateway & Web:** `https://verxl.com`
  * **Aragon DAO on Sepolia:** `app.aragon.org/#/daos/sepolia/verxl-dao.dao.eth`
  * **GitHub Repository:** `github.com/verxl-protocol/verxl-gateway`
  * **Contact:** Šimon Havlík (Team Leader) | VŠE Student Email: `havs04@vse.cz`
* **Q&A Transition:** *"We are ready for your questions, feedback, and peer evaluations!"*
* **Visual Elements:** VŠE FIR Logo, Verxl DAO Square Logo, and QR code to project repository and live Sepolia DAO.
