# Academic Course Context & Evaluation Criteria

## Institution & Course Details
* **University**: Prague University of Economics and Business (Vysoká škola ekonomická v Praze – VŠE)
* **Faculty**: Faculty of International Relations (Fakulta mezinárodních vztahů – FIR / FMV)
* **Course**: Crypto Course
* **Lead Instructor**: Ing. Ondřej Paruch
* **Student & Project Lead**: Šimon Havlík (Team Leader)
* **Domain & Production Name**: `verxl.com` (Verxl Protocol / Verxl Gateway)
* **Core Rule**: The project must be **strictly practical and crypto-native**. Theoretical essays receive an automatic **0 marks**.

---

## Assignment Breakdown & Deliverables

### Task 1: Decentralized Autonomous Organization (DAO) Deployment
* **Grading**: Up to **2 + 1 APs** (Activity Points).
* **Network**: Ethereum Sepolia Testnet (recommended over mainnet due to gas costs).
* **Platform**: Aragon App (Aragon OSx framework).
* **Core Requirements**:
  1. **Live DAO URL**: Shareable link to the organization on the Sepolia Aragon dashboard.
  2. **Proof of Governance Processes**: Custom governance rules configured on-chain.
  3. **Proof of On-Chain Voting**: At least one active proposal (`Proposals -> + Proposal`) voted on and executed by team members.
  4. **Proof of Token Deposit**: At least one asset deposit transaction (`Assets -> send token(s) to the vault address`) sent to the DAO Vault.
  5. **Screenshots**: Screenshots of all activities uploaded to Moodle.
* **Extra Credit (+1 AP)**:
  * **Founder Agreement / DAO Agreement**: ~1-page written charter (Memorandum of Association) detailing rules, shares, token distributions, goals, and vision.
    * *Delivered in*: [`docs/FOUNDERS_AGREEMENT.md`](./FOUNDERS_AGREEMENT.md)
  * **Programmatic Deployment**: JavaScript / Node.js script deploying the DAO using the Aragon OSx SDK.
    * *Delivered in*: [`contracts/scripts/deploy-dao.js`](../contracts/scripts/deploy-dao.js)

---

### Task 2: Term Project Proposal & Innovation Week Pitch
* **Grading**: Up to **8 APs** (Proposal on time, peer reviews on time, live presentation).
* **Key Deadlines**:
  * **Project Proposal Submission**: October 25, 2026 (Submitted by Team Captain via Moodle).
  * **Peer Feedback Submission**: October 28, 2026 (Evaluating other teams' proposals; submitted by Team Captain).
  * **Live Pitch Event**: November 4, 2026.
* **Venue & Schedule**:
  * **Location**: xPort VŠE, Jeseniova 2769/208, 130 00 Praha 3.
  * **Arrival & Tech Check**: 12:15 PM CET.
  * **Pitch Commencement**: 1:00 PM CET.
  * **Order**: Teams 1 through 10 (or volunteer order).
* **Strict Constraints**:
  * **Time Limit**: Capped strictly at **5 minutes maximum** (timed by course staff).
  * **Deck Format**: Fixed 8-slide structure adhering to the FIR VŠE template (`Term_project_proposal_Polis_template(2).pptx`).
  * *Delivered in*:
    * Slide deck content: [`docs/PRESENTATION_PITCH_DECK.md`](./PRESENTATION_PITCH_DECK.md)
    * Word-for-word pitch script: [`docs/PRESENTATION_PITCH_SCRIPT.md`](./PRESENTATION_PITCH_SCRIPT.md)
* **Post-Feedback Phase**: Following peer and instructor feedback during Innovation Week, the full working MVP will be finalized by January 2027.
