# Aragon Sepolia Deployment & Submission Guide
### Task 1: Aragon DAO Deployment (Graded 2 + 1 APs)
**Course:** Crypto Course, Faculty of International Relations (FIR / FMV), VŠE Prague  
**Instructor:** Ondřej Paruch  
**Student Lead:** Šimon Havlík (Team Leader)  
**Project:** Verxl Protocol / Verxl DAO (`verxl.com`)  

---

## Live DAO Deployment Details (Sepolia)
* **DAO Contract Address:** `0xf0e51fB0FFBD8ef36281b6f643E0f7953BD5111a`
* **Etherscan Link:** [https://sepolia.etherscan.io/address/0xf0e51fB0FFBD8ef36281b6f643E0f7953BD5111a](https://sepolia.etherscan.io/address/0xf0e51fB0FFBD8ef36281b6f643E0f7953BD5111a)
* **Aragon App URL:** [https://app.aragon.org/#/daos/sepolia/0xf0e51fB0FFBD8ef36281b6f643E0f7953BD5111a](https://app.aragon.org/#/daos/sepolia/0xf0e51fB0FFBD8ef36281b6f643E0f7953BD5111a)
* **Executed Admin Proposal (ADMIN-1):** [ADMIN-1 on Aragon App](https://app.aragon.org/dao/ethereum-sepolia/0xf0e51fB0FFBD8ef36281b6f643E0f7953BD5111a/proposals)
* **Execution Tx Hash:** [`0x247d5d5b5fca30b1cfadc102322a22001e6c828e41705aafe1bb54e23921b6b6`](https://sepolia.etherscan.io/tx/0x247d5d5b5fca30b1cfadc102322a22001e6c828e41705aafe1bb54e23921b6b6)
* **Live Team Voting Poll (VIP-1):** [VIP-1 on Aragon App](https://app.aragon.org/dao/ethereum-sepolia/0xf0e51fB0FFBD8ef36281b6f643E0f7953BD5111a/proposals/VIP-1)
* **Team Members:**
  * Šimon Havlík (Lead): `0x14f10A865e277C0B1949e18Dd9856602DB11742b`
  * Co-Founder 2: `0x4E5e69DcFE7DF0D3E5bA074C7a66CE0597cF05Ab`
  * Co-Founder 3: `0xE4a112C573a750b2d3Cc418CFF45FFEf9Fd1272F`

---

## Deliverables Checklist for Moodle Submission

To achieve full marks (**2 + 1 APs**), submit the following on Moodle:

- [ ] **1. Live Aragon DAO URL on Sepolia**:
  - Example: `https://app.aragon.org/#/daos/sepolia/verxl-dao.dao.eth` (or direct contract address link).
- [ ] **2. Proof of Token Deposit**:
  - Vault transaction screenshot showing at least one deposit of SepoliaETH or `$VRXL` into the DAO Vault address (`Assets -> Deposit`).
- [ ] **3. Proof of Governance Proposal & Voting**:
  - Screenshot of proposal `VIP-001: Approve Verxl Gateway V1 Routing Specs & Seed Liquidity` created via `Proposals -> + Proposal`.
  - Screenshot showing team members voting (`Yes`) and reaching quorum (>20%).
  - Screenshot of proposal execution (`Execute`).
- [ ] **4. Extra Credit Deliverable A: Founder Agreement**:
  - Written ~1-page charter submitted as PDF or markdown document: [`docs/FOUNDERS_AGREEMENT.md`](./FOUNDERS_AGREEMENT.md).
- [ ] **5. Extra Credit Deliverable B: Programmatic Deployment Script**:
  - Node.js script using Aragon OSx SDK included in the submission: [`contracts/scripts/deploy-dao.js`](../contracts/scripts/deploy-dao.js).

---

## Method 1: Web UI Deployment (Aragon App)

### Step 1: Connect Wallet & Select Sepolia Testnet
1. Open [https://app.aragon.org](https://app.aragon.org).
2. Connect MetaMask or Rabby wallet switched to **Ethereum Sepolia Testnet**.
3. *SepoliaETH Faucets*: If you need Sepolia testnet ETH for gas fees:
   - [Google Cloud Web3 Sepolia Faucet](https://cloud.google.com/application/web3/faucet/ethereum/sepolia)
   - [Alchemy Sepolia Faucet](https://www.alchemy.com/faucets/ethereum-sepolia)
   - [Infura Sepolia Faucet](https://www.infura.io/faucet/sepolia)

### Step 2: Create a DAO
1. Click **"Create a DAO"** -> **"Get Started"**.
2. **Blockchain**: Select `Ethereum Sepolia`.
3. **DAO Name & Branding**:
   - **Name**: `Verxl DAO`
   - **ENS Subdomain**: `verxl-dao` (or `verxl`)
   - **Description**: *"Decentralized, non-custodial AI model routing protocol & compute marketplace (verxl.com)."*
   - **Logo**: Upload [`assets/verxl-dao-logo-square.jpg`](../assets/verxl-dao-logo-square.jpg).
   - **Links**: Website: `https://verxl.com` | Docs: `https://verxl.com/docs`

### Step 3: Governance Mechanism (Token Voting)
1. Select **"Token Voting"** governance plugin.
2. **Token Setup**:
   - Choose **"Create a new token"**.
   - **Token Name**: `Verxl Governance Token`
   - **Symbol**: `VRXL`
   - **Supply**: `1,000,000` tokens.
   - **Token Distribution**: Add the 4 team member wallet addresses:
     - `0x14f10A865e277C0B1949e18Dd9856602DB11742b`: 250,000 VRXL (25%)
     - `[Team Member 2 Address]`: 250,000 VRXL (25%)
     - `[Team Member 3 Address]`: 250,000 VRXL (25%)
     - `[Team Member 4 Address]`: 250,000 VRXL (25%)
3. **Governance Thresholds**:
   - **Support Threshold**: `50%` (Simple majority).
   - **Minimum Participation (Quorum)**: `20%` (At least 200,000 VRXL must participate).
   - **Voting Duration**: `1 hour` or `24 hours` (1 hour is ideal for testing and fast on-chain grading).
   - **Early Execution**: **Enabled** (executes as soon as mathematical majority is reached).

### Step 4: Deploy & Deposit Assets
1. Review settings and click **"Deploy DAO"**.
2. Sign the transaction in MetaMask.
3. Once deployed, note down:
   - **DAO Address**
   - **DAO Vault Address**
   - **Token Address ($VRXL)**
4. **Deposit Testnet Assets**:
   - Navigate to the **Assets** tab in the Aragon DAO dashboard.
   - Click **"Deposit"** or transfer `0.05 SepoliaETH` directly to the DAO Vault address.
   - Take a clear screenshot of the confirmed deposit.

### Step 5: Create and Execute Genesis Proposal (VIP-001)
1. Navigate to the **Proposals** tab -> Click **"+ Proposal"**.
2. **Title**: `VIP-001: Approve Verxl Gateway V1 Routing Specs & Seed Liquidity`
3. **Summary**:
   > *"This proposal ratifies the Verxl Protocol V1 routing architecture, activates the 0.5% protocol routing fee switch, and approves the transfer of 0.01 SepoliaETH to fund oracle probe testing and domain ENS registration."*
4. **Actions**:
   - Add an on-chain action: Transfer `0.01 SepoliaETH` from the DAO Vault to the treasury testing address (`0x14f10A865e277C0B1949e18Dd9856602DB11742b`).
5. **Vote**:
   - Have team members connect their wallets and cast **"Yes"** votes.
   - Verify that the participation exceeds 20% and support exceeds 50%.
6. **Execute**:
   - Click **"Execute"** once the voting period ends (or immediately via Early Execution).
   - Take a clear screenshot showing the "Executed" badge and transaction hash.

---

## Method 2: Programmatic Deployment via Aragon OSx SDK

For automated, reproducible deployment that fulfills the coding extra-credit:

```bash
cd contracts
npm install
export DEPLOYER_PRIVATE_KEY="0x..." # Your Sepolia private key
export SEPOLIA_RPC_URL="https://rpc.sepolia.org"
node scripts/deploy-dao.js
```

The script will automatically:
1. Connect to Sepolia via ethers.js and the Aragon OSx SDK.
2. Initialize the Token Voting plugin with $VRXL genesis distributions (25% each across 4 founders).
3. Set quorum to 20% and majority threshold to 50%.
4. Output the created DAO address, voting plugin address, and transaction hashes.
