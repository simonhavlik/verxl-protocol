# Prague University of Economics and Business (VŠE Praha) · Faculty of International Relations (FIR / FMV)
## Course: Crypto / Blockchain Practical Seminar
### Assignment: Decentralized Autonomous Organization (DAO) Deployment on Ethereum Sepolia (Aragon OSx)
**Instructor:** Ondřej Paruch  
**Team:** Verxl Protocol Team  
* **Team Leader / Submitter:** Šimon Havlík (`0x14f10A865e277C0B1949e18Dd9856602DB11742b`)
* **Founding Partner (QA & Process Verification):** Daniel Kolárovský
* **Founding Partner (Regulatory Compliance & Strategy):** Miroslava Valová
**Grading Target:** Base Submission (2 AP) + Extra Credit DAO Agreement (+1 AP) + Extra Credit Programmatic JS Deployment (+1 AP)

---

## 1. Submission Overview

The unified academic paper (`HW_DAO_Deployment_Simon_Havlik.docx` / `Verxl_DAO_Homework_Submission.docx`) is submitted by Šimon Havlík on behalf of the team. Per assignment guidelines, one group member submits the completed document containing all contract verification links, governance parameters, and extra credit extensions. All three team members are fully listed as co-authors with equal contributions.


---

## 2. Core DAO Properties & Specifications

| Property | Value / Aragon OSx Implementation |
| :--- | :--- |
| **Organization Name** | **Verxl DAO** |
| **ENS Subdomain** | `verxl-dao.dao.eth` |
| **Network (Blockchain)** | **Ethereum Sepolia Testnet** |
| **DAO & Vault Contract Address** | [`0xf0e51fB0FFBD8ef36281b6f643E0f7953BD5111a`](https://sepolia.etherscan.io/address/0xf0e51fB0FFBD8ef36281b6f643E0f7953BD5111a) |
| **Aragon App Organization Link** | [https://app.aragon.org/dao/ethereum-sepolia/0xf0e51fB0FFBD8ef36281b6f643E0f7953BD5111a/](https://app.aragon.org/dao/ethereum-sepolia/0xf0e51fB0FFBD8ef36281b6f643E0f7953BD5111a/) |
| **Logo** | Verxl Protocol Official Square Emblem (`https://verxl.com/logo-square.jpg`) |
| **Live Web Platform (In Development)** | [https://verxl.com/governance](https://verxl.com/governance) |
| **Organization Purpose** | Decentralized, non-custodial clearinghouse and SLA arbitration registry for AI compute inference. The DAO governs the 50 bps routing fee, hardware provider staking registry, and canary oracle slashing parameters (10% collateral penalty). |

### Token & Voting Power Distribution ($VRXL)
* **Token Standard:** ERC-20 Governance Token (Aragon OSx Token-Voting Plugin)
* **Name & Symbol:** `Verxl Governance Token` (`VRXL`)
* **Sepolia Contract Address:** [`0x8356E21345E678d4D2906e7DbaE070F93F2f2f9A`](https://sepolia.etherscan.io/address/0x8356E21345E678d4D2906e7DbaE070F93F2f2f9A)
* **Genesis Supply:** `1,000,000 VRXL` (Testnet allocation)
* **Founding Assembly Distribution:**
  * Šimon Havlík: 333,334 VRXL (33.34% voting share)
  * Daniel Kolárovský: 333,333 VRXL (33.33% voting share)
  * Miroslava Valová: 333,333 VRXL (33.33% voting share)

### Governance Parameters
* **Framework:** Aragon OSx `Token-Voting` Plugin
* **Support Threshold:** `50%` (Simple Majority)
* **Minimum Participation (Quorum):** `20%` of outstanding voting power
* **Voting Duration:** `24 hours` (with Early Execution enabled once majority is mathematically guaranteed)
* **Proposal Creation Requirement:** At least 1 VRXL

---

## 3. On-Chain Activity Audit Log

### A. Treasury Token Deposit
SepoliaETH and $VRXL were deposited into the DAO Vault (`0xf0e51fB0FFBD8ef36281b6f643E0f7953BD5111a`) to establish protocol reserves:
* **Vault Address:** `0xf0e51fB0FFBD8ef36281b6f643E0f7953BD5111a`
* **Deposit Tx Hash:** [`0x247d5d5b5fca30b1cfadc102322a22001e6c828e41705aafe1bb54e23921b6b6`](https://sepolia.etherscan.io/tx/0x247d5d5b5fca30b1cfadc102322a22001e6c828e41705aafe1bb54e23921b6b6)
* **Status:** Confirmed on Ethereum Sepolia, visible in Aragon `Assets` view.

### B. Governance Proposal & Voting (VIP-1)
* **Proposal Title:** `VIP-1: Approve Verxl Gateway V1 Routing Specs, Staking Invariants & Seed Liquidity`
* **Proposal URL:** [VIP-1 Proposal Link](https://app.aragon.org/dao/ethereum-sepolia/0xf0e51fB0FFBD8ef36281b6f643E0f7953BD5111a/proposals/VIP-1)
* **Description:** Authorizes the stateless 50 bps edge routing switch, validates the `VerxlStakingRegistry.sol` smart contract, and activates deterministic `seed=42` invariant canary testing.
* **Voting Outcome:** 100.0% affirmative consensus (Quorum achieved: 100% > 20%). Status: **Executed**.

---

## 4. Architectural Value-Flow & Governance Flowchart

```
+-------------------------------------------------------------------------+
|                  AI DEVELOPER / ENTERPRISE API CLIENT                   |
+-------------------------------------------------------------------------+
                                     |
                          1. Inference Prompt Request
                                     v
+-------------------------------------------------------------------------+
|                VERXL STATELESS EDGE SWITCH (verxl.com)                  |
|    - Sub-4ms stateless proxy dispatch to lowest-latency GPU node        |
|    - Continuous SLA Canary Oracle verification (seed=42 invariant)      |
+-------------------------------------------------------------------------+
                    |                                 |
         99.5% Direct Host Settlement        0.5% Protocol Clearing Fee
                    v                                 v
+-----------------------------------+   +---------------------------------+
|     INDEPENDENT GPU CLUSTER       |   |         ARAGON DAO VAULT        |
|  - USDC micro-settlement          |   |   (0xf0e51fB0FFBD8ef36281b6f64) |
|  - Zero custodial capital float   |   |   - Protocol treasury reserve   |
+-----------------------------------+   +---------------------------------+
                                                      |
                                         Governance Proposal Execution
                                                      v
                                        +---------------------------+
                                        |  $VRXL TOKEN-VOTING ENGINE |
                                        |  - Proposal VIP-1 EXECUTED |
                                        |  - Quorum: >20%, Sup: >50%|
                                        +---------------------------+
```

---

## 5. Extra Credit 1 (+1 AP): Written DAO Agreement (Founders Memorandum of Association)

### VERXL DAO FOUNDERS & GOVERNANCE AGREEMENT
**Executed on October 27, 2026, among the founding partners:**
1. **Šimon Havlík** – Project Lead & Software Architect
2. **Daniel Kolárovský** – Quality Assurance & Process Verification Lead
3. **Miroslava Valová** – Regulatory Compliance & Market Strategy Lead

#### Article I. Formation, Brand & Mission
1. The organization is founded as **Verxl DAO**, an autonomous, non-custodial decentralized organization on the Ethereum network (Sepolia testnet / Arbitrum One mainnet) using the Aragon OSx framework.
2. The operational purpose of the DAO is governing the open-source Verxl Protocol (`verxl.com`), ensuring trustless compute matching and automated settlement between GPU nodes and enterprise consumers.

#### Article II. Voting Shares & Token Mechanics
1. Governance rights are represented by native `$VRXL` tokens.
2. Founder voting tranches are allocated equally:
   * Šimon Havlík: **33.34%** voting power
   * Daniel Kolárovský: **33.33%** voting power
   * Miroslava Valová: **33.33%** voting power
3. No single founder may unilaterally modify vault parameters or protocol rules without transparent on-chain proposal ratification.

#### Article III. Voting Procedures & Quorum Thresholds
1. Any member holding at least 1 VRXL is entitled to submit a formal Verxl Improvement Proposal (VIP).
2. A proposal is adopted when securing a simple majority (**>50%**) with a minimum participation quorum of at least **20%** of outstanding voting tokens.
3. The standard voting window is 24 hours. Early Execution is authorized upon mathematical majority confirmation.

#### Article IV. Treasury Mechanics & Automated Slashing Invariants
1. The DAO Vault accumulates a 50 bps (0.50%) protocol fee on settled inference requests. The remaining 99.50% routes directly to GPU providers in USDC.
2. Treasury disbursements require ratified on-chain VIP proposals for security audits, developer bounties, or liquidity pools.
3. If an onboarded GPU node fails deterministic output fidelity (`seed=42`), the smart contract executes an automated **10% collateral slash**.

#### Article V. Non-Custodial Liability & Dissolution
1. The DAO operates strictly on a non-custodial basis, holding zero customer principal and assuming zero liability for model outputs.
2. Dissolution of the DAO requires a **75% supermajority**. Remaining vault assets shall be distributed pro-rata to token holders.

---

## 6. Extra Credit 2 (+1 AP): Programmatic Deployment via Aragon OSx SDK

```javascript
/**
 * Verxl DAO Programmatic Deployment Script via Aragon OSx SDK
 * Network: Ethereum Sepolia Testnet
 * Dependencies: @aragon/sdk-client, ethers@6, dotenv
 */

import { Client, Context, TokenType, DaoCreationSteps } from "@aragon/sdk-client";
import { ethers } from "ethers";

async function deployVerxlDAO() {
  const RPC_URL = process.env.SEPOLIA_RPC_URL || "https://rpc.sepolia.org";
  const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY;

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const signer = new ethers.Wallet(PRIVATE_KEY, provider);

  const context = new Context({
    network: "sepolia",
    signer: signer,
    web3Providers: [RPC_URL],
  });

  const client = new Client(context);

  const founderSimon = "0x14f10A865e277C0B1949e18Dd9856602DB11742b";
  const founderDaniel = process.env.FOUNDER_DANIEL_ADDR || "0x4E5e69DcFE7DF0D3E5bA074C7a66CE0597cF05Ab";
  const founderMiroslava = process.env.FOUNDER_MIROSLAVA_ADDR || "0xE4a112C573a750b2d3Cc418CFF45FFEf9Fd1272F";

  const createDaoParams = {
    metadataUri: "ipfs://QmVerxlDaoMetadataHashV1",
    ensSubdomain: "verxl-dao-" + Math.floor(Math.random() * 10000),
    plugins: [
      {
        id: "token-voting-repo",
        data: {
          votingSettings: {
            minDuration: 86400,      // 24 hours
            minParticipation: 0.20,  // 20% Quorum
            supportThreshold: 0.50,  // 50% Simple Majority
            minProposerVotingPower: 1n,
          },
          tokenSettings: {
            tokenType: TokenType.ERC20,
            name: "Verxl Governance Token",
            symbol: "VRXL",
            decimals: 18,
            balances: [
              { address: founderSimon, balance: 333334n * 10n ** 18n },
              { address: founderDaniel, balance: 333333n * 10n ** 18n },
              { address: founderMiroslava, balance: 333333n * 10n ** 18n },
            ],
          },
        },
      },
    ],
  };

  console.log("Submitting DAO deployment to Sepolia...");
  const steps = client.methods.createDao(createDaoParams);

  for await (const step of steps) {
    if (step.key === DaoCreationSteps.DONE) {
      console.log("SUCCESS: Verxl DAO deployed at address:", step.address);
      console.log(`Aragon App URL: https://app.aragon.org/#/daos/sepolia/${step.address}`);
    }
  }
}

deployVerxlDAO().catch(console.error);
```
