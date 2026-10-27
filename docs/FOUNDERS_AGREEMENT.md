# VERXL DAO FOUNDING AGREEMENT
### (Memorandum of Association & Decentralized Governance Charter)

**Effective Date:** October 26, 2026  
**Governing Ecosystem:** Ethereum Sepolia Testnet (`0xf0e51fB0FFBD8ef36281b6f643E0f7953BD5111a`)  
**Aragon Dashboard:** [`https://app.aragon.org/#/daos/sepolia/0xf0e51fB0FFBD8ef36281b6f643E0f7953BD5111a`](https://app.aragon.org/#/daos/sepolia/0xf0e51fB0FFBD8ef36281b6f643E0f7953BD5111a)  
**Primary Web Gateway:** [`https://verxl.com`](https://verxl.com)  
**Smart Contract Framework:** Aragon OSx (Open Standards for Decentralized Organizations)  

---

### 1. MISSION & PROTOCOL MANDATE
This Founding Agreement (the "Charter") formally establishes the decentralized governance framework, capital structure, and operating principles of **Verxl DAO** (the "Organization"). 

Verxl DAO stewards the development, maintenance, and growth of **Verxl Gateway**: an open, non-custodial AI inference routing protocol and decentralized GPU compute marketplace. The protocol’s explicit mandate is to disintermediate centralized AI aggregators (e.g., OpenRouter) by reducing the standard 5.5% platform take-rate to a minimal, fixed **0.5% protocol routing fee**. All routing operations are non-custodial, censorship-resistant, and programmatically verified via deterministic on-chain and edge oracle probes.

---

### 2. TOKENOMICS & GENESIS ALLOCATION ($VRXL)
The native governance unit of the Organization is the **Verxl Governance Token (`$VRXL`)**, minted under ERC-20 standards with 18 decimal places.
* **Genesis Fixed Supply:** Exactly **1,000,000 $VRXL** tokens. No inflation or uncollateralized minting is permitted without unanimous DAO consensus.
* **Initial Equity Tranches:** 100% of the genesis voting power is allocated equally among the four founding contributors (250,000 $VRXL / 25.0% each):
  1. **Šimon Havlík (Lead Architect & Smart Contracts):** `0x14f10A865e277C0B1949e18Dd9856602DB11742b` — 333,334 $VRXL
  2. **Co-Founder 2:** `0x4E5e69DcFE7DF0D3E5bA074C7a66CE0597cF05Ab` — 333,333 $VRXL
  3. **Co-Founder 3:** `0xE4a112C573a750b2d3Cc418CFF45FFEf9Fd1272F` — 333,333 $VRXL
* **Token Utility & Rights:** `$VRXL` confers direct voting rights over protocol fee parameters, provider registry listings, staking slashing appeals, and treasury allocations. Tokens do not represent securities or debts; they represent direct decentralized voting agency.

---

### 3. GOVERNANCE THRESHOLDS & CONSENSUS RULES
All protocol modifications, smart contract upgrades, and treasury disbursements are executed exclusively via on-chain Aragon OSx voting plugins:
* **Quorum (Minimum Participation):** At least **20.0%** of total circulating `$VRXL` must cast a vote for any proposal to be binding.
* **Approval Threshold:**
  * **Standard Proposals (Treasury / Parameters):** Simple majority (**> 50.0%**).
  * **Constitutional Upgrades (Charter Amendments / Slashing Rates):** Supermajority (**> 66.7%**).
* **Voting Duration:** 24 hours on production networks (accelerated to 10–60 minutes in Sepolia testnet environments to facilitate agile evaluation).
* **Early Execution:** Enabled. As soon as a proposal mathematically guarantees approval, it may be executed immediately by any caller.

---

### 4. PROVIDER REGISTRY, AUDITING & SLASHING CHARTER
To ensure high inference quality and prevent model spoofing (e.g., serving quantized 8B weights under the guise of an unquantized 70B endpoint), GPU compute providers must adhere to the following rules:
1. **Collateral Staking:** Providers must lock a minimum collateral deposit in `$VRXL` or SepoliaETH in the `VerxlStakingRegistry` contract before serving traffic.
2. **Deterministic Probing:** Cloudflare edge oracles ping registered nodes every 30 minutes using seed-locked prompts, measuring Time to First Token (TTFT), tokens-per-second, and perplexity.
3. **Automated Slashing:** Any node experiencing availability drops (<99% uptime) or failing perplexity benchmarks will have **10.0% of its staked collateral slashed**. Slashed funds are burned or rerouted to the DAO Treasury.
4. **Appeals & Arbitration:** Providers may submit an Aragon proposal to petition for slashed fund reimbursement. The token-holding assembly acts as the ultimate court of arbitration.

---

### 5. DAO VAULT & TREASURY CUSTODY
1. **Fee Accrual:** The 0.5% routing fee collected on all inference requests routes directly to the non-custodial **Verxl Aragon Vault**.
2. **Disbursement Control:** No individual founder, officer, or private entity retains unilateral private key control over protocol assets.
3. **Asset Transfers:** Outflows from the DAO Vault require an on-chain proposal detailing the exact recipient address, amount, and academic/operational justification.

---

### 6. RATIFICATION & SIGNATURES
By deploying the Verxl DAO smart contract on Ethereum Sepolia and signing the genesis transaction, the Founding Members formally ratify this Founding Agreement.

| Role | Name | Wallet Address | Signature / Confirmation |
|---|---|---|---|
| **Lead Architect** | Šimon Havlík | `0x14f10A865e277C0B1949e18Dd9856602DB11742b` | *Ratified On-Chain (Sepolia)* |
| **Co-Founder 2** | [Team Member 2] | `0x4E5e69DcFE7DF0D3E5bA074C7a66CE0597cF05Ab` | *Ratified On-Chain (Sepolia)* |
| **Co-Founder 3** | [Team Member 3] | `0xE4a112C573a750b2d3Cc418CFF45FFEf9Fd1272F` | *Ratified On-Chain (Sepolia)* |
