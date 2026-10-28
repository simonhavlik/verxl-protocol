import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import {
  Compass,
  CheckCircle2,
  Cpu,
  Layers,
  ArrowRight,
  ShieldCheck,
  Terminal,
  Activity,
  Zap,
  Users,
  BarChart3,
  Scale,
  Play,
  Pause,
  Sliders,
  Download,
  Presentation,
  Eye,
  Network,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  TrendingUp,
  AlertCircle,
  FileSpreadsheet,
  Sparkles,
} from "lucide-react";

interface VisionProps {
  onNavigate: (tab: string) => void;
}

interface HorizonPhase {
  id: string;
  horizon: string;
  phaseName: string;
  quarter: string;
  status: "OPERATIONAL" | "IN_DEVELOPMENT" | "PLANNED";
  progressPct: number;
  tagline: string;
  layer: "SMART_CONTRACTS" | "EDGE_ROUTING" | "HARDWARE" | "ZERO_KNOWLEDGE" | "ALL";
  coreDeliverables: string[];
  techStack: string[];
  colorHex: string;
  orbitInclination: number;
}

const ROADMAP_PHASES: HorizonPhase[] = [
  {
    id: "h1",
    horizon: "Horizon 1",
    phaseName: "Live Non-Custodial Clearing Switch",
    quarter: "Q4 2026",
    status: "OPERATIONAL",
    progressPct: 100,
    layer: "EDGE_ROUTING",
    tagline: "Stateless 50 bps edge clearing switch, seed=42 invariant canary probing, and Aragon OSx DAO settlement on Ethereum Sepolia & Arbitrum.",
    coreDeliverables: [
      "Dual-redundant tunnel routing (Charizard IONOS port 11645 + Cloudflare Edge proxy)",
      "Bare-metal Prague GPU cluster 01 (Bulbasaur Qwen 3.5 4B Uncensored 32k Resident)",
      "Official public API bridges for Xiaomi Mi MIMO 2.6 Flash/Pro & DeepSeek v4.1",
      "Automated 10% collateral slashing via VerxlStakingRegistry smart contract",
      "Passwordless institutional email OTP auth via automated@verxl.com on Seznam SMTP",
      "Arbitrum One Mainnet USDC commercial escrow settlement (minimum $1.00 deposit / payout)",
    ],
    techStack: ["Ethereum Sepolia", "Arbitrum One", "Aragon OSx", "Cloudflare Workers", "socat Daemon", "Vulkan GPU"],
    colorHex: "#10b981", // Emerald
    orbitInclination: 0.35,
  },
  {
    id: "h2a",
    horizon: "Horizon 2A",
    phaseName: "Bilateral State Channels & Micro-Settlement",
    quarter: "Q1–Q2 2027",
    status: "IN_DEVELOPMENT",
    progressPct: 45,
    layer: "SMART_CONTRACTS",
    tagline: "Dynamic bilateral micro-streaming state channels allowing continuous token-by-token clearing without per-request gas friction, settled asynchronously on Arbitrum.",
    coreDeliverables: [
      "Bilateral state-channel escrows for per-token streaming clearing",
      "Sub-millisecond off-chain signature exchange via EIP-712 typed data vouchers",
      "Automated provider node registration CLI with one-click Docker daemon",
      "Fractional community staking pools backing verified independent GPU hosts",
      "Continuous hardware performance indexing (TTFT, memory bandwidth, thermal drift)",
      "Dynamic gas-minimized settlement batching to Arbitrum Nitro L2 rollup",
    ],
    techStack: ["EIP-712 Channels", "Arbitrum Nitro", "Docker CLI", "Go Routing Node", "WebSockets", "Rust Tokio"],
    colorHex: "#3b82f6", // Electric Blue
    orbitInclination: -0.55,
  },
  {
    id: "h2b",
    horizon: "Horizon 2B",
    phaseName: "Lightweight zk-STARK Compute Attestation",
    quarter: "Q3–Q4 2027",
    status: "IN_DEVELOPMENT",
    progressPct: 25,
    layer: "ZERO_KNOWLEDGE",
    tagline: "Cryptographic output verification utilizing lightweight zero-knowledge execution trace proofs, verifying honest FP16 matrix multiplication without running re-inference.",
    coreDeliverables: [
      "Lightweight zero-knowledge output attestation (zk-STARK execution trace proofs)",
      "RISC Zero / SP1 zkVM verification of quantization kernel integrity",
      "Secondary compute mobilization (European Tier-3 co-los, data centers, amortized mining rigs)",
      "Automated on-chain slash execution without centralized validator intervention",
      "Decentralized telemetry database synchronization across Charizard and edge relays",
      "Standardized OpenAPI 3.1 & Model Context Protocol (MCP) server daemon",
    ],
    techStack: ["zk-STARK Proofs", "SP1 zkVM", "RISC Zero", "EigenLayer AVS (Research)", "OpenAPI 3.1", "MCP SDK"],
    colorHex: "#06b6d4", // Cyan
    orbitInclination: 0.75,
  },
  {
    id: "h3",
    horizon: "Horizon 3",
    phaseName: "Sovereign Autonomous Agent Grid",
    quarter: "2028+",
    status: "PLANNED",
    progressPct: 10,
    layer: "HARDWARE",
    tagline: "Peer-to-peer libp2p agent swarms autonomously negotiating spot compute contracts and clearing machine-to-machine transactions without human operators or fiat banking rails.",
    coreDeliverables: [
      "P2P libp2p mesh routing replacing centralized reverse proxy infrastructure",
      "Autonomous AI agent swarms negotiating spot compute auctions via cryptographic bids",
      "Cross-chain liquidity routing via LayerZero and Chainlink CCIP",
      "Self-sovereign cryptographic node identities (ERC-721 hardware attestations)",
      "Complete immutable governance handoff to on-chain $VRXL token holders",
      "Universal AI inference settlement rail for sovereign autonomous agents",
    ],
    techStack: ["libp2p Mesh", "ERC-721 Node IDs", "LayerZero CCIP", "Autonomous Agents", "DePIN Mesh"],
    colorHex: "#a855f7", // Purple
    orbitInclination: 1.15,
  },
];

// Token Volume Data Points for Comparative Macroeconomic Chart
const VOLUME_POINTS = [
  { volumeLabel: "100M", volumeNum: 100, promptM: 50, complM: 50 },
  { volumeLabel: "250M", volumeNum: 250, promptM: 125, complM: 125 },
  { volumeLabel: "500M", volumeNum: 500, promptM: 250, complM: 250 },
  { volumeLabel: "1B", volumeNum: 1000, promptM: 500, complM: 500 },
  { volumeLabel: "2.5B", volumeNum: 2500, promptM: 1250, complM: 1250 },
  { volumeLabel: "5B", volumeNum: 5000, promptM: 2500, complM: 2500 },
  { volumeLabel: "10B", volumeNum: 10000, promptM: 5000, complM: 5000 },
];

interface MindNode {
  id: string;
  name: string;
  category: "CLIENTS" | "ROUTER" | "SUPPLY" | "GOVERNANCE" | "LEDGER" | "LEGAL";
  tagline: string;
  color: string;
  bgRgb: string;
  borderColor: string;
  coords: { x: number; y: number };
  kpis: { label: string; value: string }[];
  details: string;
  techSpecs: string[];
}

const MIND_NODES: MindNode[] = [
  {
    id: "clients",
    name: "Crypto-Native Devs & Quants",
    category: "CLIENTS",
    tagline: "Tech-savvy quants, AI agent builders & privacy-first users requiring high-throughput API endpoints.",
    color: "#38bdf8",
    bgRgb: "rgba(56, 189, 248, 0.1)",
    borderColor: "rgba(56, 189, 248, 0.4)",
    coords: { x: 140, y: 70 },
    kpis: [
      { label: "Target Persona", value: "Agents & Quants" },
      { label: "CAC Efficiency", value: "~$0 On-Chain" },
      { label: "Drop-in API", value: "OpenAI v1 Compatible" },
    ],
    details: "High-frequency traders, autonomous agents (Hermes, OMP), and enterprise developers who refuse cloud KYC and vendor lock-in. Authenticated via cryptographic API keys and 2FA.",
    techSpecs: [
      "OpenAPI 3.1 & OpenAI Drop-In (/v1/chat/completions)",
      "Zero prompt logging & ephemeral memory buffers",
      "Pay-as-you-go micro-billing with USDC on Arbitrum L2",
    ],
  },
  {
    id: "router",
    name: "Verxl Stateless Edge Router",
    category: "ROUTER",
    tagline: "The central 50 bps non-custodial clearing switch operating across Cloudflare global edge.",
    color: "#10b981",
    bgRgb: "rgba(16, 185, 129, 0.12)",
    borderColor: "rgba(16, 185, 129, 0.5)",
    coords: { x: 400, y: 140 },
    kpis: [
      { label: "Protocol Fee", value: "50 bps (0.5%)" },
      { label: "Edge Overhead", value: "3.8 ms" },
      { label: "Quality Probe", value: "seed=42 Canary" },
    ],
    details: "Stateless edge routing engine that receives client prompts, enforces cryptographic 2FA authorization, verifies L2 USDC balances, probes candidate GPU nodes with deterministic canary tests, and streams responses.",
    techSpecs: [
      "Cloudflare Workers & V8 isolates across 300+ PoPs",
      "Dynamic latency-weighted Dijkstra load routing",
      "Atomic non-custodial 50 bps fee deduction",
    ],
  },
  {
    id: "supply",
    name: "Prague & Global GPU Clusters",
    category: "SUPPLY",
    tagline: "Decentralized fleet of bare-metal Vulkan clusters and independent datacenter nodes.",
    color: "#c084fc",
    bgRgb: "rgba(192, 132, 252, 0.1)",
    borderColor: "rgba(192, 132, 252, 0.4)",
    coords: { x: 660, y: 70 },
    kpis: [
      { label: "Host Anchor", value: "Prague Bare-Metal" },
      { label: "Hardware Support", value: "H100, A100, 4090" },
      { label: "Instant Payout", value: "L2 USDC (99.5%)" },
    ],
    details: "GPU datacenter operators and private cluster hosts monetizing idle compute. Receive 99.5% of gross revenue settled instantly to Arbitrum wallets without 30-day corporate payment delays.",
    techSpecs: [
      "Vulkan & CUDA acceleration for Qwen, DeepSeek & MiMo",
      "Strict 1,000 $VRXL staking collateral required",
      "Real-time health audits by autonomous quality oracles",
    ],
  },
  {
    id: "governance",
    name: "Aragon OSx DAO Vault",
    category: "GOVERNANCE",
    tagline: "On-chain decentralized treasury, staking rules, and autonomous 10% slashing enforcement.",
    color: "#f59e0b",
    bgRgb: "rgba(245, 158, 11, 0.1)",
    borderColor: "rgba(245, 158, 11, 0.4)",
    coords: { x: 660, y: 240 },
    kpis: [
      { label: "Chain Anchor", value: "Ethereum & Arbitrum" },
      { label: "Slashing Rate", value: "10% Collateral" },
      { label: "Treasury Inflow", value: "80% of Take" },
    ],
    details: "Aragon OSx-based decentralized autonomous organization. Holds protocol fee accruals, governs staking collateral, and programmatically executes slashing when nodes fail deterministic SLA audits.",
    techSpecs: [
      "Aragon OSx modular DAO contracts on Ethereum & Arbitrum",
      "Token-weighted community proposal voting",
      "Non-dilutive protocol revenue distribution model",
    ],
  },
  {
    id: "ledger",
    name: "Charizard Financial Ledger",
    category: "LEDGER",
    tagline: "PostgreSQL transaction engine with PBKDF2 cryptography and RFC 6238 2FA security.",
    color: "#60a5fa",
    bgRgb: "rgba(96, 165, 250, 0.1)",
    borderColor: "rgba(96, 165, 250, 0.4)",
    coords: { x: 140, y: 240 },
    kpis: [
      { label: "Engine", value: "PostgreSQL 17 (kiam)" },
      { label: "Schema Isolation", value: "Strict verxl.*" },
      { label: "2FA Cryptography", value: "RFC 6238 TOTP" },
    ],
    details: "Ultra-fast, isolated PostgreSQL database on Charizard (212.227.211.88) tracking user non-custodial balances, key revocations, and 2FA secrets. Zero collision risk with public tables.",
    techSpecs: [
      "Strict schema isolation with SSL client encryption",
      "PBKDF2-HMAC-SHA256 password hashing (100,000 rounds)",
      "WebCrypto RFC 6238 TOTP with 8 emergency backup codes",
    ],
  },
  {
    id: "legal",
    name: "EU MiCA & Regulatory Perimeter",
    category: "LEGAL",
    tagline: "Non-custodial router exemption under EU MiCA Recital 22; stateless platform routing with transparent upstream disclosures.",
    color: "#34d399",
    bgRgb: "rgba(52, 211, 153, 0.1)",
    borderColor: "rgba(52, 211, 153, 0.4)",
    coords: { x: 400, y: 270 },
    kpis: [
      { label: "MiCA Status", value: "Non-Custodial Exempt" },
      { label: "GDPR Status", value: "Platform Stateless" },
      { label: "Settlement Asset", value: "Regulated Circle USDC" },
    ],
    details: "Verxl operates solely as a non-custodial routing switch without custody of funds. Verxl does not persist prompts to disk, while transparently disclosing upstream provider logging (DeepSeek, Xiaomi).",
    techSpecs: [
      "Pure technical routing without CASP custodial liability",
      "Smart contract-mediated escrow on Arbitrum L2",
      "Fully decentralized autonomous governance perimeter",
    ],
  },
];

interface PitchSlide {
  id: number;
  badge: string;
  title: string;
  subtitle: string;
  timeEstimate: string;
  bullets: { title: string; desc: string }[];
  financeMetric: { label: string; value: string; desc: string };
  speakerScript: string;
}

const PITCH_SLIDES: PitchSlide[] = [
  {
    id: 1,
    badge: "1. THE MONOPOLISTIC PROBLEM",
    title: "The 80%+ Cloud AI Markup & The Need for a Stateless Switch",
    subtitle: "Why centralized AI gateways are rent-seeking tollbooths holding back compute liquidity",
    timeEstimate: "0:00 - 0:45",
    bullets: [
      { title: "Predatory 80–90% Gross Margins", desc: "AWS Bedrock and OpenAI extract massive markups on commodity open-source models (DeepSeek, Qwen)." },
      { title: "Fragmented Idle Compute Supply", desc: "Regional European and Asian datacenters hold thousands of unmonetized H100/A100 GPUs without retail distribution." },
      { title: "Surveillance & Vendor Lock-In", desc: "Mandatory corporate KYC, opaque pricing changes, and arbitrary account freezes throttle developer velocity." },
    ],
    financeMetric: {
      label: "Traditional Hyperscaler Fee Drag",
      value: "840 - 1,040 bps",
      desc: "Compared to Verxl's transparent 50 bps flat switch fee.",
    },
    speakerScript:
      "Good morning. I'm Šimon Havlík from Prague University of Economics and Business. Today, I'm presenting Verxl Protocol: a capital-light, decentralized clearing switch for global AI inference. Hyperscalers like AWS and OpenAI operate like feudal landlords, charging 80 to 90% gross margins on commodity models while independent European datacenters sit with idle GPUs. Verxl replaces this broken paradigm with a stateless, 50 basis point clearing switch settling natively on Arbitrum L2.",
  },
  {
    id: 2,
    badge: "2. TARGET AUDIENCE & CAC FLYWHEEL",
    title: "The Crypto-Native Triad: The Ultimate Low-CAC Customer Base",
    subtitle: "Why crypto developers and quants are the perfect early adopters for decentralized AI",
    timeEstimate: "0:45 - 1:30",
    bullets: [
      { title: "Tech-Savvy & API-First Builders", desc: "Developers building autonomous trading bots and agents who require OpenAI-compatible drop-in endpoints without bloat." },
      { title: "Absolute Privacy & Sovereignty", desc: "European fintech quants and privacy advocates who cannot legally allow OpenAI to train on proprietary prompts." },
      { title: "Identifiable On-Chain Communities", desc: "Crypto-natives actively seek permissionless protocols, providing immediate viral adoption and liquidity." },
    ],
    financeMetric: {
      label: "Customer Acquisition Cost (CAC)",
      value: "~$0 via On-Chain Traction",
      desc: "Traditional fintech burns $150+ on ads; Verxl leverages organic token alignment and direct 94% fee savings.",
    },
    speakerScript:
      "As an economics and finance student, customer acquisition cost is everything. Our target audience consists of three interconnected crypto personas: tech-savvy developers, privacy maximalists, and on-chain communities. In traditional SaaS, CAC is $150 to $300. In Verxl, our CAC is virtually zero because developers immediately save 90% on their API bills and earn protocol staking yields.",
  },
  {
    id: 3,
    badge: "3. CAPITAL-LIGHT MARKETPLACE MODEL",
    title: "The Visa / NASDAQ of AI: Zero Hardware CapEx",
    subtitle: "A pure financial clearinghouse connecting compute buyers and sellers at 50 bps",
    timeEstimate: "1:30 - 2:15",
    bullets: [
      { title: "Zero Hardware CapEx", desc: "Verxl never buys GPUs, leases server racks, or pays power bills. We take zero inventory depreciation risk." },
      { title: "Pure Clearinghouse Economics", desc: "Visa doesn't own banks; NASDAQ doesn't own stocks. Verxl is the non-custodial clearing layer for AI compute." },
      { title: "Instant L2 Micro-Settlements", desc: "99.5% of gross volume is routed directly to hardware hosts on Arbitrum L2; 0.5% accumulates in the DAO treasury." },
    ],
    financeMetric: {
      label: "Capital Expenditure (CapEx)",
      value: "$0.00 Direct Hardware",
      desc: "100% scalable software infrastructure with near-infinite gross operating leverage.",
    },
    speakerScript:
      "Look at our business model: it is completely capital-light. Visa does not own retail stores; NASDAQ does not own stocks. They are clearinghouses. Verxl is the clearinghouse for artificial intelligence. We take zero hardware inventory risk. On every dollar of compute cleared across our network, we collect 50 basis points. Exactly 99.5% goes directly to the GPU host in USDC, and 0.5% flows into the DAO treasury.",
  },
  {
    id: 4,
    badge: "4. TECHNICAL ARCHITECTURE & EXECUTION",
    title: "Proprietary Protocol Architecture: Edge Routing, Canary Oracle & L2 Settlement",
    subtitle: "Engineered by Šimon Havlík, Daniel Kolárovský & Miroslava Valová · Founding Assembly at VŠE Praha",
    timeEstimate: "2:15 - 2:55",
    bullets: [
      { title: "Stateless Sub-4ms Edge Switch", desc: "Cloudflare Pages Functions dynamically inspect tokens and route requests to lowest-latency clusters with zero RAM storage." },
      { title: "Seed=42 Canary Quality Oracle", desc: "Automated deterministic SLA probes verify model weight authenticity in under 200ms, triggering 10% collateral slashing." },
      { title: "Non-Custodial Arbitrum L2 Settlement", desc: "Smart contracts settle 99.5% directly to GPU hosts and 0.5% to DAO treasury; operators never custody user funds." },
    ],
    financeMetric: {
      label: "End-to-End Edge Routing Latency",
      value: "3.8 ms Overhead",
      desc: "Zero hardware CapEx depreciation risk with live sub-4ms proxy execution.",
    },
    speakerScript:
      "Moving to technical architecture and our team: Verxl is engineered around three proprietary pillars. First, our sub-4ms stateless edge switch dynamically matches prompts to lowest-latency nodes without GPU lock-in. Second, our deterministic canary oracle continuously tests provider quality using seed=42 SLA probes, slashing malicious nodes by 10%. And third, non-custodial smart contracts on Arbitrum settle payments in USDC in seconds. Our core team comprises Šimon Havlík leading architecture and full-stack engineering, Daniel Kolárovský directing empirical SLA testing and process verification, and Miroslava Valová leading regulatory compliance, market research, and institutional governance.",
  },
  {
    id: 5,
    badge: "5. UNIT ECONOMICS & SCALABILITY",
    title: "Compounding Financial Velocity: $3.6M/yr Net Take at 1T Tokens",
    subtitle: "High-volume micro-clearing that scales non-linearly with global AI demand",
    timeEstimate: "2:55 - 3:40",
    bullets: [
      { title: "Seed Phase (Q4 2026)", desc: "500M monthly tokens = $30,000 GMV → $150/mo protocol take across European quant developers." },
      { title: "Scale Phase (2027)", desc: "50B monthly tokens = $3,000,000 GMV → $15,000/mo ($180k/yr) net protocol cash flow." },
      { title: "Velocity Phase (2028+)", desc: "1T monthly tokens = $60,000,000 GMV → $300,000/mo ($3.6M/yr) flowing to DAO treasury stakers." },
    ],
    financeMetric: {
      label: "Net Annual Cash Flow (1T Tokens)",
      value: "$3,600,000 USD",
      desc: "Pure protocol fee accumulation distributed 80% to DAO staking reserves and 20% to insurance.",
    },
    speakerScript:
      "From an economic standpoint, look at our unit economics. On every transaction, we take 50 basis points. At 50 billion tokens a month, that is $3 million in monthly gross volume and $180,000 in annualized net protocol cash flow. At 1 trillion tokens — which top AI applications already process — the 50 bps switch yields $3.6 million annually in pure, non-dilutive protocol revenue.",
  },
  {
    id: 6,
    badge: "6. REGULATORY COMPLIANCE & LEGAL DEFENSE",
    title: "EU MiCA Non-Custodial Exemption & GDPR Data Sovereignty",
    subtitle: "Strict regulatory immunity engineered into the smart contract and routing perimeter",
    timeEstimate: "3:40 - 4:20",
    bullets: [
      { title: "MiCA Non-Custodial Immunity", desc: "Under EU MiCA Recital 22, purely technical non-custodial software routers do not hold customer funds and are exempt from CASP licensing." },
      { title: "Stateless Edge Routing", desc: "Verxl edge proxy streams inference without disk persistence. Upstream third-party hosts (e.g. DeepSeek) retain data per their independent policies." },
      { title: "Decentralized DAO Governance", desc: "Fee parameters and slashing audits are governed exclusively by Aragon OSx consensus, eliminating centralized issuer liabilities." },
    ],
    financeMetric: {
      label: "EU MiCA Compliance Status",
      value: "Non-Custodial Exempt",
      desc: "Zero custody of user funds; direct smart contract escrows on Arbitrum L2.",
    },
    speakerScript:
      "Equally vital is legal defensibility under European law. Under the EU MiCA framework, Verxl is strictly non-custodial — we never intermediate fiat, hold custody of user funds, or operate discretionary pools. Furthermore, Verxl's routing layer operates statelessly in RAM without persisting prompt text to disk, while transparently disclosing that third-party upstream hosts like DeepSeek retain and log data under their own independent policies. This creates complete regulatory clarity and an institutional moat.",
  },
  {
    id: 7,
    badge: "7. 4-HORIZON STRATEGIC ROADMAP",
    title: "2026–2028 Execution Horizons: Live MVP to Machine Economy",
    subtitle: "From today's live non-custodial switch to autonomous agent-to-agent micro-clearing",
    timeEstimate: "4:20 - 5:00",
    bullets: [
      { title: "Horizon 1 (Q4 2026 - LIVE NOW)", desc: "Live 50 bps edge switch, Arbitrum L2 USDC settlements, Charizard PostgreSQL ledger, and 2FA security." },
      { title: "Horizon 2 (Q1–Q2 2027)", desc: "Decentralized provider staking (1,000 $VRXL), automated canary slashing, and integration of 50+ GPU clusters." },
      { title: "Horizon 3 (Q3–Q4 2027)", desc: "Zero-Knowledge (ZK) output verification with cryptographic state proofs validating model execution." },
      { title: "Horizon 4 (2028+)", desc: "HTTP 402 machine-to-machine economy: autonomous AI agents paying each other directly for compute." },
    ],
    financeMetric: {
      label: "Horizon 1 Status",
      value: "100% OPERATIONAL",
      desc: "Live on mainnet right now at verxl.com with verifiable on-chain smart contracts.",
    },
    speakerScript:
      "To conclude, our roadmap spans four clear horizons. Horizon 1 is not a future promise — it is operational right now on mainnet at verxl.com. Horizon 2 introduces decentralized provider staking and automated canary slashing. Horizon 3 brings zero-knowledge cryptographic proofs of inference. And Horizon 4 unlocks the true machine-to-machine economy where autonomous AI agents pay each other directly via HTTP 402. Thank you, and I look forward to your questions.",
  },
];

interface RedFlagAuditItem {
  id: string;
  category: string;
  flagName: string;
  analystWorry: string;
  traditionalVulnerability: string;
  verxlProtocolDefense: string;
  mathematicalProof: string;
  kpiMetric: { label: string; value: string };
  auditStatus: "CLEARED" | "ZERO_EXPOSURE" | "MATHEMATICALLY_IMMUNE";
  contractAnchor: string;
}

interface CompetitorMetric {
  name: string;
  category: "Verxl Protocol" | "Hyperscaler" | "DePIN GPU" | "DePIN CPU/GPU" | "Subnet Emission";
  isVerxl: boolean;
  takeRate: string;
  grossMargin: string;
  capexToRev: string;
  settlementLatency: string;
  paymentAsset: string;
  hardwareDepreciationRisk: string;
  regulatoryJurisdiction: string;
  slaVerification: string;
}

const RED_FLAG_AUDIT_DATA: RedFlagAuditItem[] = [
  {
    id: "depreciation",
    category: "CAPEX & SILICON OBSOLESCENCE",
    flagName: "Silicon Depreciation & Equipment Debt Trap",
    analystWorry: "Does the protocol carry depreciating GPU hardware on its balance sheet or take on heavy debt like CoreWeave, AWS, or Lambda?",
    traditionalVulnerability: "Hyperscalers and centralized neo-clouds take massive balance sheet debt to purchase NVIDIA H100s/B200s ($35k-$45k per unit) subject to 3-year straight-line depreciation. When next-gen silicon arrives, older chips suffer 50%+ asset write-downs, compressing equity.",
    verxlProtocolDefense: "Agency, Never Principal model. Verxl holds $0 of hardware assets, $0 in equipment leasing debt, and zero data center lease liabilities. 100% of GPU CapEx, electricity, and hardware depreciation is borne by independent data centers and bare-metal node operators who join the network to monetize idle capacity.",
    mathematicalProof: "CapEx / Revenue = 0.00%. Zero balance sheet asset write-downs. Operating leverage approaches infinity as volume scales.",
    kpiMetric: { label: "Protocol Hardware CapEx", value: "$0.00 / Zero Balance Sheet Debt" },
    auditStatus: "ZERO_EXPOSURE",
    contractAnchor: "VerxlStakingRegistry.sol: Pure Layer-7 non-custodial routing switch.",
  },
  {
    id: "regulatory",
    category: "REGULATORY & CUSTODIAL EXCLUSION",
    flagName: "Custodial Classification & Licensing (MiCA / SEC CASP)",
    analystWorry: "Does Verxl touch user deposits or act as an unlicensed custodial exchange/money transmitter, risking regulatory shutdown?",
    traditionalVulnerability: "Centralized aggregators hold user funds in commingled accounts and intermediate payments, triggering mandatory €730k regulatory capital reserves, MiCA CASP licensing, and AML/KYC banking freeze exposure.",
    verxlProtocolDefense: "Stateless non-custodial clearing router exemption under EU MiCA Recital 22. Capital moves atomically on-chain via smart contracts on Arbitrum One directly between the inference buyer and provider node. Verxl never touches user private keys, never pools deposits, and holds zero custodial float.",
    mathematicalProof: "Custodial Float = €0.00. Funds dwell in smart contract escrows with atomic non-custodial release upon verified delivery.",
    kpiMetric: { label: "Custodial Escrow Risk", value: "0.00% / EU MiCA Recital 22 Exempt" },
    auditStatus: "MATHEMATICALLY_IMMUNE",
    contractAnchor: "EU Regulation (EU) 2023/1114 Recital 22 Non-Custodial Software Exemption.",
  },
  {
    id: "token_inflation",
    category: "TOKEN ECONOMICS & EMISSIONS",
    flagName: "Token Inflation Death Spiral & Mining Dilution",
    analystWorry: "Is provider compensation subsidized by hyper-inflationary utility token printing that collapses under market sell pressure?",
    traditionalVulnerability: "DePIN protocols that pay compute providers in an inflationary native token (e.g., early Helium, Render, Akash) suffer severe selling pressure. Providers dump tokens on open markets to pay electric bills, collapsing token value, wiping out miner profitability, and causing supply abandonment.",
    verxlProtocolDefense: "Stablecoin Settlement-First ($USDC). Providers are paid 99.5% of gross revenue in Circle-issued USDC on Arbitrum immediately upon verified inference delivery. The $VRXL token has ZERO inflationary mining emissions. It is exclusively an economic staking & slashing token (minimum 1,000 $VRXL collateral). Slashing burns 50% of slashed tokens, making supply deflationary.",
    mathematicalProof: "Annual Token Emission = 0.00%. Genesis supply is fixed at 1,000,000 $VRXL. Token burns upon SLA failure ensure net-deflationary supply dynamics.",
    kpiMetric: { label: "Miner Token Inflation", value: "0.00% / Hard Circle USDC Settle" },
    auditStatus: "MATHEMATICALLY_IMMUNE",
    contractAnchor: "VerxlToken.sol: Fixed 1,000,000 supply cap; zero minting functions.",
  },
  {
    id: "sybil_adulteration",
    category: "MODEL INTEGRITY & FRAUD",
    flagName: "Quantization Adulteration & Sybil Profit Harvesting",
    analystWorry: "What stops a rogue node operator from advertising high-end FP16 weights, serving cheap 4-bit quantized outputs, and harvesting the margin spread?",
    traditionalVulnerability: "In permissionless compute marketplaces, dishonest hosts deploy low-bit quantized weights (INT4/INT2) to cut VRAM and power consumption by 70%, serving degraded hallucinations while charging clients full uncompressed inference prices.",
    verxlProtocolDefense: "Nash Equilibrium Autonomous Canary Probing. Verxl's decentralized quality oracle network dispatches blinded test prompts with fixed deterministic seeds (seed=42). Any output token divergence hashes differently from the gold standard. A 2nd consecutive failure programmatically triggers on-chain slash(provider, 10%). Cheating to save $0.0003 in power triggers a $500+ collateral penalty, rendering fraud strictly negative expected value (EV < 0).",
    mathematicalProof: "E[Cheat] = (1 - p)*ΔCost - p*(0.10 * Collateral). With p_detect > 0.98 and Collateral = 1,000 $VRXL ($1,850), E[Cheat] = -$184.80 per attempted adulteration.",
    kpiMetric: { label: "Autonomous Slashing", value: "10% Collateral Penalty / EV < 0" },
    auditStatus: "CLEARED",
    contractAnchor: "VerxlQualityOracle.sol & VerxlStakingRegistry.sol: Automated probe slashing.",
  },
  {
    id: "working_capital",
    category: "WORKING CAPITAL & AR AGING",
    flagName: "Accounts Receivable Aging (DSO) & Bad Debt",
    analystWorry: "What is the exposure to enterprise non-payment, credit line defaults, and 60-90 day Accounts Receivable (AR) collection lag?",
    traditionalVulnerability: "Enterprise cloud vendors operate on Net-30 to Net-90 corporate invoicing. Days Sales Outstanding (DSO) averages 68 days across cloud SaaS, resulting in working capital friction, invoice factoring fees (3-5%), and bad debt reserves (1-3% of ARR).",
    verxlProtocolDefense: "Days Sales Outstanding (DSO) is exactly 0.00 days. All inference requests are pre-funded via Web3 wallets or verified balance ledger. Payments clear micro-stream by micro-stream in real time. Verxl has zero bad debt expense, zero accounts receivable factoring, and zero unpaid invoice exposure.",
    mathematicalProof: "DSO = 0.00 Days. Cash Conversion Cycle (CCC) is negative/instant. Working capital requirement = $0.00.",
    kpiMetric: { label: "Days Sales Outstanding (DSO)", value: "0.00 Days / Instant Atomic Inflow" },
    auditStatus: "CLEARED",
    contractAnchor: "EIP-712 micro-streaming state channels + PostgreSQL isolated double-entry ledger.",
  },
  {
    id: "churn_lockin",
    category: "DEVELOPER RETENTION & MOATS",
    flagName: "Price War Vulnerability & Developer Churn",
    analystWorry: "If OpenAI or Anthropic cuts pricing by 50%, will all developers abandon Verxl and return to centralized APIs?",
    traditionalVulnerability: "Pure pricing intermediaries without technical differentiation suffer catastrophic churn whenever centralized market leaders initiate predatory price cuts.",
    verxlProtocolDefense: "Tri-Pillar Defensible Moat: (1) Verxl Platform Zero-Disk-Persistence edge streaming with transparent upstream provider logging disclosures under Czech ÚOOÚ oversight, (2) Sub-45ms multi-provider automated fallback during hyperscaler outages, and (3) Native OpenAI SDK drop-in compatibility requiring zero developer code refactoring.",
    mathematicalProof: "LTV / CAC Ratio = 25.9x. Switchover friction = 1 line of config (baseURL). Multi-cloud availability SLA = 99.99%.",
    kpiMetric: { label: "LTV / CAC Ratio", value: "25.9x (Industry Top Quartile > 3.0x)" },
    auditStatus: "CLEARED",
    contractAnchor: "OpenAI-compatible /v1/chat/completions drop-in router + multi-cluster failover.",
  },
];

const COMPETITIVE_BENCHMARKS: CompetitorMetric[] = [
  {
    name: "Verxl Protocol",
    category: "Verxl Protocol",
    isVerxl: true,
    takeRate: "50 bps (0.50%) flat",
    grossMargin: "88.4% (Pure routing)",
    capexToRev: "0.0% (Zero hardware CapEx)",
    settlementLatency: "Atomic (< 2.0s streaming)",
    paymentAsset: "Regulated Circle USDC ($1.00)",
    hardwareDepreciationRisk: "0.0% (Borne by node host)",
    regulatoryJurisdiction: "EU MiCA Recital 22 Non-Custodial",
    slaVerification: "Deterministic seed=42 Nash Slashing",
  },
  {
    name: "AWS Bedrock / Azure",
    category: "Hyperscaler",
    isVerxl: false,
    takeRate: "600–1,200 bps markup",
    grossMargin: "62.0% (Heavy CapEx drag)",
    capexToRev: "42.0% (Billions in H100s)",
    settlementLatency: "Net 30–60 Invoicing",
    paymentAsset: "USD Invoicing / Credit Card",
    hardwareDepreciationRisk: "100% (3-year linear write-down)",
    regulatoryJurisdiction: "US CLOUD Act Data Seizure Risk",
    slaVerification: "Centralized post-facto SLA credit",
  },
  {
    name: "Render Network",
    category: "DePIN GPU",
    isVerxl: false,
    takeRate: "15.0%–20.0% take rate",
    grossMargin: "48.0%",
    capexToRev: "0.0% (Community hosts)",
    settlementLatency: "Net 7 days (Batch payouts)",
    paymentAsset: "$RENDER (High volatility)",
    hardwareDepreciationRisk: "0.0% (Borne by miner)",
    regulatoryJurisdiction: "Offshore Foundation (BVI)",
    slaVerification: "Subjective visual render check",
  },
  {
    name: "Akash Network",
    category: "DePIN CPU/GPU",
    isVerxl: false,
    takeRate: "4.0%–8.0% take rate",
    grossMargin: "55.0%",
    capexToRev: "0.0% (Community hosts)",
    settlementLatency: "Per-block escrow lease",
    paymentAsset: "$AKT (High volatility)",
    hardwareDepreciationRisk: "0.0% (Borne by provider)",
    regulatoryJurisdiction: "Cosmos Ecosystem Foundation",
    slaVerification: "Container uptime polling only",
  },
  {
    name: "Bittensor (TAO)",
    category: "Subnet Emission",
    isVerxl: false,
    takeRate: "~18.0% subnet dilution",
    grossMargin: "N/A (Subnet inflation)",
    capexToRev: "0.0% (Miners)",
    settlementLatency: "Epoch block emission",
    paymentAsset: "$TAO (High volatility)",
    hardwareDepreciationRisk: "0.0% (Borne by miner)",
    regulatoryJurisdiction: "Opentensor Foundation",
    slaVerification: "Validator weight consensus",
  },
];

const BENCHMARK_DIMENSIONS: { key: keyof CompetitorMetric; label: string }[] = [
  { key: "takeRate", label: "Protocol Take Rate" },
  { key: "grossMargin", label: "Gross Margin" },
  { key: "capexToRev", label: "CapEx / Revenue Ratio" },
  { key: "settlementLatency", label: "Settlement Latency" },
  { key: "paymentAsset", label: "Settlement Currency" },
  { key: "hardwareDepreciationRisk", label: "Hardware Depreciation Risk" },
  { key: "regulatoryJurisdiction", label: "Regulatory Perimeter" },
  { key: "slaVerification", label: "Quality SLA Verification" },
];

export const Vision: React.FC<VisionProps> = ({ onNavigate }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // 3D HUD & Controls State
  const [is3DPlaying, setIs3DPlaying] = useState(true);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [cameraPreset, setCameraPreset] = useState<"overview" | "prague" | "zenith">("overview");
  const [highlightedNode, setHighlightedNode] = useState<{
    name: string;
    region: string;
    latency: number;
    ttft: number;
    hardware: string;
    status: string;
  } | null>({
    name: "bulbasaur-prague-01",
    region: "Prague, Czechia (Bare-Metal Vulkan)",
    latency: 12,
    ttft: 38,
    hardware: "Dedicated Bare-Metal Vulkan GPU",
    status: "OPERATIONAL · 32K RESIDENT",
  });

  // Mind Map State
  const [selectedMindNodeId, setSelectedMindNodeId] = useState<string>("router");
  const selectedMindNode = MIND_NODES.find((n) => n.id === selectedMindNodeId) || MIND_NODES[1];

  // 5-Minute Pitch Deck Modal State
  const [showPitchDeckModal, setShowPitchDeckModal] = useState(false);
  const [currentPitchSlide, setCurrentPitchSlide] = useState(0);
  const [pitchTimer, setPitchTimer] = useState(300); // 5 minutes in seconds
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showSpeakerNotes, setShowSpeakerNotes] = useState(true);

  // Pitch Timer effect
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && pitchTimer > 0) {
      interval = setInterval(() => {
        setPitchTimer((prev) => Math.max(0, prev - 1));
      }, 1000);
    } else if (pitchTimer === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, pitchTimer]);

  // Roadmap State
  const [selectedHorizonId, setSelectedHorizonId] = useState<string>("h1");
  const [layerFilter, setLayerFilter] = useState<string>("ALL");
  const activePhase = ROADMAP_PHASES.find((h) => h.id === selectedHorizonId) || ROADMAP_PHASES[0];

  // Interactive Macroeconomic Volume Slider State (Tokens in Millions, default 500M)
  const [tokenVolumeM, setTokenVolumeM] = useState<number>(500);

  // Financial calculations
  const rawComputeCostUsd = tokenVolumeM * 0.06; // $0.06 blended / 1M tokens
  const centralizedAggregatorFeeUsd = rawComputeCostUsd * 0.095; // 950 bps drag
  const hyperscalerCloudFeeUsd = rawComputeCostUsd * 0.075; // 750 bps drag
  const verxlProtocolFeeUsd = rawComputeCostUsd * 0.005; // 50 bps switch
  const netMonthlySavedUsd = centralizedAggregatorFeeUsd - verxlProtocolFeeUsd;
  const netAnnualizedSavedUsd = netMonthlySavedUsd * 12;
  const percentageSaved = ((centralizedAggregatorFeeUsd - verxlProtocolFeeUsd) / centralizedAggregatorFeeUsd) * 100;

  // Market Research & Institutional Due Diligence State
  const [diligenceTab, setDiligenceTab] = useState<"MARKET_RESEARCH" | "FINANCIAL_KPIS" | "ZERO_RED_FLAGS" | "SCENARIO_SIMULATOR">("MARKET_RESEARCH");
  const [selectedRedFlagId, setSelectedRedFlagId] = useState<string>("depreciation");
  const selectedRedFlag = RED_FLAG_AUDIT_DATA.find((r) => r.id === selectedRedFlagId) || RED_FLAG_AUDIT_DATA[0];

  // Scenario Simulator State
  const [scenarioPreset, setScenarioPreset] = useState<"BEAR" | "BASE" | "BULL">("BASE");
  const [simDailyReqsM, setSimDailyReqsM] = useState<number>(75); // 75 Million reqs/day
  const [simTicketUsd, setSimTicketUsd] = useState<number>(0.0012); // $0.0012 / request
  const [simTakeRateBps, setSimTakeRateBps] = useState<number>(50); // 50 bps (0.50%)
  const [simTokenPriceUsd, setSimTokenPriceUsd] = useState<number>(1.85); // $1.85 / $VRXL

  // Scenario Switcher Handler
  const handleScenarioChange = (preset: "BEAR" | "BASE" | "BULL") => {
    setScenarioPreset(preset);
    if (preset === "BEAR") {
      setSimDailyReqsM(15);
      setSimTicketUsd(0.0008);
      setSimTakeRateBps(40);
      setSimTokenPriceUsd(0.75);
    } else if (preset === "BASE") {
      setSimDailyReqsM(75);
      setSimTicketUsd(0.0012);
      setSimTakeRateBps(50);
      setSimTokenPriceUsd(1.85);
    } else if (preset === "BULL") {
      setSimDailyReqsM(380);
      setSimTicketUsd(0.0015);
      setSimTakeRateBps(65);
      setSimTokenPriceUsd(4.50);
    }
  };

  // Sensitivity Model Dynamic Calculations
  const simDailyGmvUsd = simDailyReqsM * 1_000_000 * simTicketUsd;
  const simAnnualGmvUsd = simDailyGmvUsd * 365;
  const simAnnualRevenueUsd = simAnnualGmvUsd * (simTakeRateBps / 10000);
  const simFleetPayoutUsd = simAnnualGmvUsd - simAnnualRevenueUsd;
  const simTreasuryInflowUsd = simAnnualRevenueUsd * 0.80; // 80% to Aragon OSx DAO vault
  const simFixedAnnualCostUsd = 19200; // Cloudflare Workers + Charizard PostgreSQL + Alchemy RPC
  const simNetFreeCashFlowUsd = Math.max(0, simAnnualRevenueUsd - simFixedAnnualCostUsd);
  const simOperatingMarginPct = simAnnualRevenueUsd > 0
    ? ((simNetFreeCashFlowUsd / simAnnualRevenueUsd) * 100).toFixed(1)
    : "0.0";
  const simDailyBreakevenReqs = Math.ceil(
    (simFixedAnnualCostUsd / 365) / (simTicketUsd * (simTakeRateBps / 10000))
  );
  const simActiveNodes = Math.max(12, Math.round(simDailyReqsM * 18));
  const simStakedTvlUsd = simActiveNodes * 1000 * simTokenPriceUsd; // 1,000 $VRXL min stake per node

  // Mouse interaction state for 3D parallax
  const mousePos = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  // Three.js Interactive 3D Machine Intelligence Clearing Hyper-Lattice
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
    } catch {
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05070b, 0.04);

    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 7.5);
    cameraRef.current = camera;

    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // 1. Central Geodesic Settlement Engine Core (Icosahedron + Glowing Core)
    const coreGeo = new THREE.IcosahedronGeometry(1.2, 1);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x3b82f6,
      wireframe: true,
      transparent: true,
      opacity: 0.45,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    rootGroup.add(coreMesh);

    // Inner glowing core
    const innerCoreGeo = new THREE.OctahedronGeometry(0.7, 0);
    const innerCoreMat = new THREE.MeshBasicMaterial({
      color: 0x60a5fa,
      wireframe: true,
      transparent: true,
      opacity: 0.75,
    });
    const innerCoreMesh = new THREE.Mesh(innerCoreGeo, innerCoreMat);
    rootGroup.add(innerCoreMesh);

    // 2. Node Particle Sprite Texture
    const createNodeSprite = (colorStr: string) => {
      const c = document.createElement("canvas");
      c.width = c.height = 64;
      const ctx = c.getContext("2d");
      if (ctx) {
        const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        grad.addColorStop(0, colorStr);
        grad.addColorStop(0.25, "rgba(59, 130, 246, 0.9)");
        grad.addColorStop(0.65, "rgba(37, 99, 235, 0.25)");
        grad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 64, 64);
      }
      const tex = new THREE.CanvasTexture(c);
      tex.needsUpdate = true;
      return tex;
    };

    // 3. Decentralized Host Constellation Nodes
    const nodeCount = 280;
    const nodePositions = new Float32Array(nodeCount * 3);
    const nodeVectors: THREE.Vector3[] = [];

    for (let i = 0; i < nodeCount; i++) {
      const phi = Math.acos(-1 + (2 * i) / nodeCount);
      const theta = Math.sqrt(nodeCount * Math.PI) * phi;
      const radius = 2.45 + Math.random() * 0.95;

      const x = radius * Math.cos(theta) * Math.sin(phi);
      const y = radius * Math.sin(theta) * Math.sin(phi);
      const z = radius * Math.cos(phi);

      nodePositions[i * 3] = x;
      nodePositions[i * 3 + 1] = y;
      nodePositions[i * 3 + 2] = z;

      nodeVectors.push(new THREE.Vector3(x, y, z));
    }

    const nodeGeo = new THREE.BufferGeometry();
    nodeGeo.setAttribute("position", new THREE.BufferAttribute(nodePositions, 3));

    const nodeMat = new THREE.PointsMaterial({
      color: 0x60a5fa,
      size: 0.22,
      map: createNodeSprite("#93c5fd"),
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const nodePoints = new THREE.Points(nodeGeo, nodeMat);
    rootGroup.add(nodePoints);

    // 4. Dynamic Interconnection Lattice (Nearest Neighbor Mesh Lines)
    const linePairs: number[] = [];
    const maxDistance = 1.35;
    for (let i = 0; i < nodeCount; i++) {
      let connections = 0;
      for (let j = i + 1; j < nodeCount; j++) {
        if (nodeVectors[i].distanceTo(nodeVectors[j]) < maxDistance && connections < 3) {
          linePairs.push(nodeVectors[i].x, nodeVectors[i].y, nodeVectors[i].z);
          linePairs.push(nodeVectors[j].x, nodeVectors[j].y, nodeVectors[j].z);
          connections++;
        }
      }
    }

    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute("position", new THREE.Float32BufferAttribute(linePairs, 3));
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x2563eb,
      transparent: true,
      opacity: 0.28,
      blending: THREE.AdditiveBlending,
    });
    const lineMesh = new THREE.LineSegments(lineGeo, lineMat);
    rootGroup.add(lineMesh);

    // 5. Highlight Prague Anchor Node with Pulsing Beacon
    const pragueGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const pragueMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const pragueMesh = new THREE.Mesh(pragueGeo, pragueMat);
    pragueMesh.position.set(2.0, 0.8, 1.4);
    rootGroup.add(pragueMesh);

    // Prague halo
    const pragueHaloGeo = new THREE.RingGeometry(0.16, 0.24, 32);
    const pragueHaloMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8,
    });
    const pragueHaloMesh = new THREE.Mesh(pragueHaloGeo, pragueHaloMat);
    pragueHaloMesh.position.copy(pragueMesh.position);
    rootGroup.add(pragueHaloMesh);

    // 6. Three Inclined Architectural Horizon Rings
    const createHorizonRing = (radius: number, color: number, inclination: number, thickness: number) => {
      const ringGroup = new THREE.Group();
      ringGroup.rotation.x = inclination;

      const curve = new THREE.EllipseCurve(0, 0, radius, radius * 0.95, 0, 2 * Math.PI, false, 0);
      const pts = curve.getPoints(128);
      const ringGeo = new THREE.BufferGeometry().setFromPoints(pts.map((p) => new THREE.Vector3(p.x, 0, p.y)));
      const ringMat = new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity: 0.55,
      });
      const ringLine = new THREE.Line(ringGeo, ringMat);
      ringGroup.add(ringLine);

      // Orbital circulating packet
      const packetGeo = new THREE.SphereGeometry(thickness, 12, 12);
      const packetMat = new THREE.MeshBasicMaterial({ color });
      const packetMesh = new THREE.Mesh(packetGeo, packetMat);
      ringGroup.add(packetMesh);

      return { ringGroup, packetMesh, radius };
    };

    // Horizon 1: Emerald Live Pilot Ring
    const h1Orbit = createHorizonRing(3.1, 0x10b981, 0.45, 0.08);
    rootGroup.add(h1Orbit.ringGroup);

    // Horizon 2: Blue State Channels Ring
    const h2Orbit = createHorizonRing(3.65, 0x3b82f6, -0.65, 0.07);
    rootGroup.add(h2Orbit.ringGroup);

    // Horizon 3: Purple Sovereign Agent Grid Ring
    const h3Orbit = createHorizonRing(4.2, 0xa855f7, 1.25, 0.08);
    rootGroup.add(h3Orbit.ringGroup);

    // Resize Handler
    const handleResize = () => {
      if (!container || !renderer) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    // Mouse Move Parallax Handler
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mousePos.current.targetX = x * 0.6;
      mousePos.current.targetY = y * 0.4;
    };
    window.addEventListener("mousemove", handleMouseMove);

    // Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (!is3DPlaying) return;

      clock.getDelta();
      const t = clock.getElapsedTime() * speedMultiplier;

      // Smooth mouse lerp
      mousePos.current.x += (mousePos.current.targetX - mousePos.current.x) * 0.05;
      mousePos.current.y += (mousePos.current.targetY - mousePos.current.y) * 0.05;

      // Group rotation
      rootGroup.rotation.y = t * 0.12 + mousePos.current.x;
      rootGroup.rotation.x = Math.sin(t * 0.08) * 0.1 + mousePos.current.y * 0.5;

      // Core pulsing
      const coreScale = 1 + Math.sin(t * 2.2) * 0.06;
      coreMesh.scale.set(coreScale, coreScale, coreScale);
      coreMesh.rotation.y = -t * 0.25;
      coreMesh.rotation.z = t * 0.15;

      innerCoreMesh.rotation.x = t * 0.4;
      innerCoreMesh.rotation.y = t * 0.3;

      // Prague halo pulse
      const haloScale = 1 + Math.sin(t * 4) * 0.3;
      pragueHaloMesh.scale.set(haloScale, haloScale, haloScale);

      // Orbit packet motions
      const a1 = t * 0.85;
      h1Orbit.packetMesh.position.set(Math.cos(a1) * h1Orbit.radius, 0, Math.sin(a1) * h1Orbit.radius * 0.95);

      const a2 = -t * 0.7;
      h2Orbit.packetMesh.position.set(Math.cos(a2) * h2Orbit.radius, 0, Math.sin(a2) * h2Orbit.radius * 0.95);

      const a3 = t * 0.55;
      h3Orbit.packetMesh.position.set(Math.cos(a3) * h3Orbit.radius, 0, Math.sin(a3) * h3Orbit.radius * 0.95);

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      renderer.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      innerCoreGeo.dispose();
      innerCoreMat.dispose();
      nodeGeo.dispose();
      nodeMat.dispose();
      lineGeo.dispose();
      lineMat.dispose();
      pragueGeo.dispose();
      pragueMat.dispose();
      pragueHaloGeo.dispose();
      pragueHaloMat.dispose();
    };
  }, [is3DPlaying, speedMultiplier]);

  // Handle Camera Presets
  const setCameraView = (preset: "overview" | "prague" | "zenith") => {
    setCameraPreset(preset);
    if (!cameraRef.current) return;
    if (preset === "overview") {
      cameraRef.current.position.set(0, 0, 7.5);
      cameraRef.current.lookAt(0, 0, 0);
      setHighlightedNode({
        name: "bulbasaur-prague-01",
        region: "Prague, Czechia (Bare-Metal Vulkan)",
        latency: 12,
        ttft: 38,
        hardware: "Dedicated Bare-Metal Vulkan GPU",
        status: "OPERATIONAL · 32K RESIDENT",
      });
    } else if (preset === "prague") {
      cameraRef.current.position.set(2.4, 1.2, 4.2);
      cameraRef.current.lookAt(2.0, 0.8, 1.4);
      setHighlightedNode({
        name: "bulbasaur-prague-01",
        region: "Prague Host · 100.64.0.3 (Ollama / Qwen 3.5 4B)",
        latency: 11,
        ttft: 36,
        hardware: "Prague Bare-Metal GPU Host",
        status: "TARGET LOCKED · ZERO OVERHEAD TUNNEL",
      });
    } else if (preset === "zenith") {
      cameraRef.current.position.set(0, 7.8, 1.8);
      cameraRef.current.lookAt(0, 0, 0);
      setHighlightedNode({
        name: "global-constellation-280",
        region: "Global Decentralized Fleet (Europe & Asia Edge)",
        latency: 18,
        ttft: 45,
        hardware: "280 Bonded GPU Clusters",
        status: "TOPOLOGICAL OVERVIEW",
      });
    }
  };

  const filteredRoadmap = ROADMAP_PHASES.filter((phase) => {
    if (layerFilter === "ALL") return true;
    return phase.layer === layerFilter;
  });

  return (
    <div className="space-y-8 font-mono text-slate-200">
      {/* Top Academic Breadcrumb & Course Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-500/15 pb-2.5">
        <div className="flex items-center gap-2 text-xs">
          <Compass className="w-3.5 h-3.5 text-blue-400" />
          <span className="font-semibold text-white uppercase tracking-wider">
            Architecture Vision & Macroeconomic Blueprint
          </span>
          <span className="text-slate-400">·</span>
          <span className="text-blue-400 text-[11px]">2026–2028</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="text-[10px] text-slate-400 flex items-center gap-2 mr-1">
            <span>Started as an Academic University Project</span>
            <span className="text-slate-700">|</span>
            <span className="text-emerald-400 font-semibold">VŠE Praha</span>
          </div>
          <a
            href="#financial-diligence"
            className="px-2.5 py-1 rounded-[2px] bg-[#05070b] border border-blue-500/40 hover:border-blue-400 text-blue-300 hover:text-white text-[10px] uppercase tracking-wider flex items-center gap-1.5 transition"
          >
            <ShieldCheck className="w-3 h-3 text-cyan-400" />
            <span>Diligence & Red Flags</span>
          </a>
          <button
            onClick={() => {
              setShowPitchDeckModal(true);
              setCurrentPitchSlide(0);
            }}
            className="px-2.5 py-1 rounded-[2px] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5 shadow transition"
          >
            <Presentation className="w-3 h-3 text-cyan-300" />
            <span>5-Min Pitch Deck</span>
          </button>
          <a
            href="/Verxl_Protocol_Pitch_Presentation.pptx"
            download="Verxl_Protocol_Pitch_Presentation.pptx"
            className="px-2.5 py-1 rounded-[2px] bg-[#05070b] border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white text-[10px] uppercase tracking-wider flex items-center gap-1.5 transition"
          >
            <Download className="w-3 h-3 text-emerald-400" />
            <span>.PPTX</span>
          </a>
        </div>
      </div>

      {/* HERO SECTION WITH THREE.JS 3D WEBGL LATTICE + HUD VIEWPORT CONTROLS */}
      <div
        ref={containerRef}
        className="relative min-h-[580px] lg:min-h-[640px] bg-[#070b13] border border-blue-500/30 rounded-[4px] p-5 sm:p-7 lg:p-9 shadow-2xl overflow-hidden flex flex-col justify-between"
      >
        {/* Three.js 3D WebGL Canvas Background */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-85"
        />

        {/* Ambient Radial Gradient Overlays */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#070b13]/95 via-[#070b13]/75 to-transparent pointer-events-none z-0" />

        {/* Top Badges & Interactive HUD Controls */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[2px] bg-blue-500/10 border border-blue-500/30 text-[11px] text-blue-400 uppercase tracking-wider backdrop-blur-sm shadow-sm">
            <span className="w-2 h-2 status-dot bg-blue-400 animate-pulse" />
            <span>Interactive 3D Machine Intelligence Clearing Lattice</span>
          </div>

          {/* 3D Viewport Controls Pill */}
          <div className="flex items-center gap-1.5 bg-[#05070b]/90 border border-slate-700/80 p-1 rounded-[3px] text-[10px] backdrop-blur-md">
            <button
              onClick={() => setIs3DPlaying(!is3DPlaying)}
              className="p-1 rounded-[2px] hover:bg-slate-800 text-slate-300 transition"
              title={is3DPlaying ? "Pause Animation" : "Play Animation"}
            >
              {is3DPlaying ? <Pause className="w-3 h-3 text-amber-400" /> : <Play className="w-3 h-3 text-emerald-400" />}
            </button>
            <div className="h-3 w-[1px] bg-slate-700" />
            <button
              onClick={() => setSpeedMultiplier(speedMultiplier === 1 ? 2 : 1)}
              className={`px-1.5 py-0.5 rounded-[2px] transition ${
                speedMultiplier === 2 ? "bg-blue-600 text-white font-bold" : "text-slate-400 hover:text-white"
              }`}
            >
              {speedMultiplier}x
            </button>
            <div className="h-3 w-[1px] bg-slate-700" />
            <button
              onClick={() => setCameraView("overview")}
              className={`px-1.5 py-0.5 rounded-[2px] transition ${
                cameraPreset === "overview" ? "bg-blue-600 text-white font-bold" : "text-slate-400 hover:text-white"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setCameraView("prague")}
              className={`px-1.5 py-0.5 rounded-[2px] transition ${
                cameraPreset === "prague" ? "bg-emerald-600 text-white font-bold" : "text-slate-400 hover:text-white"
              }`}
            >
              Prague Node
            </button>
            <button
              onClick={() => setCameraView("zenith")}
              className={`px-1.5 py-0.5 rounded-[2px] transition ${
                cameraPreset === "zenith" ? "bg-purple-600 text-white font-bold" : "text-slate-400 hover:text-white"
              }`}
            >
              Zenith
            </button>
          </div>
        </div>

        {/* Hero Main Content: Headline + Founder Color Portrait */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center my-6">
          {/* Left Column: Thesis & Vision */}
          <div className="lg:col-span-7 space-y-4">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Direct Settlement for the <br />
              <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent">
                Machine Economy
              </span>.
            </h1>

            <p className="text-xs sm:text-[13.5px] text-slate-300 leading-relaxed font-sans max-w-xl">
              Centralized AI aggregators operate like traditional retail broker-dealers: inserting their balance sheets into bilateral computation, locking customer working capital into unsegregated float, and collecting an extractive 840–1,040 bps markup on raw silicon.
            </p>

            <p className="text-xs sm:text-[13.5px] text-slate-300 leading-relaxed font-sans max-w-xl">
              Verxl replaces the intermediary with an automated 50 bps non-custodial clearing switch and cryptographic performance bonding on Ethereum Sepolia and Arbitrum One. Independent GPU clusters and enterprise consumers transact directly at near-zero marginal friction.
            </p>

            {/* Core Covenants Badges */}
            <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
              <div className="px-2.5 py-1 rounded-[2px] bg-[#05070b]/85 border border-slate-800 text-slate-300 backdrop-blur-sm flex items-center gap-1.5 shadow">
                <Cpu className="w-3.5 h-3.5 text-blue-400" />
                <span>Agency Over Principal</span>
              </div>
              <div className="px-2.5 py-1 rounded-[2px] bg-[#05070b]/85 border border-slate-800 text-slate-300 backdrop-blur-sm flex items-center gap-1.5 shadow">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Deterministic Slashing (10%)</span>
              </div>
              <div className="px-2.5 py-1 rounded-[2px] bg-[#05070b]/85 border border-slate-800 text-slate-300 backdrop-blur-sm flex items-center gap-1.5 shadow">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>50 bps Hardcoded Rate</span>
              </div>
            </div>
          </div>

          {/* Right Column: Executive Assembly with Šimon's FULL LARGE PORTRAIT + Teammates */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full bg-[#05070b]/95 border-2 border-blue-500/50 rounded-[4px] p-3.5 shadow-2xl space-y-3 relative backdrop-blur-md">
              {/* Top Bar */}
              <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">
                <span className="text-blue-400 font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                  <span>Protocol Executive Assembly</span>
                </span>
                <span className="text-emerald-400 font-mono font-bold text-[9.5px]">VŠE Praha · 1:1:1 Consensus</span>
              </div>

              {/* Šimon Havlík: FULL LARGE PHOTO (Not an icon!) */}
              <div className="relative rounded-[3px] overflow-hidden border-2 border-blue-500/60 shadow-2xl bg-[#080c14] group">
                <div className="aspect-[4/3] w-full overflow-hidden">
                  <img
                    src="/team/simon-havlik.jpg"
                    alt="Šimon Havlík"
                    className="w-full h-full object-cover object-top transition duration-500 group-hover:scale-[1.03]"
                    loading="eager"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#05070b] via-[#05070b]/40 to-transparent opacity-95" />

                <div className="absolute bottom-2.5 left-3 right-3 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm sm:text-base font-extrabold text-white uppercase tracking-wider">
                      Šimon Havlík
                    </span>
                    <span className="px-2 py-0.5 rounded-[2px] font-bold text-[9px] uppercase tracking-wider bg-blue-600 text-white shadow">
                      Project Lead & Head Developer
                    </span>
                  </div>
                  <div className="text-[11px] text-blue-300 font-medium">
                    Lead Protocol Architect · Smart Contracts & Core Infrastructure
                  </div>
                  <div className="text-[9.5px] text-slate-300 font-mono flex items-center justify-between pt-1">
                    <span>Lead Architect · VŠE Praha</span>
                    <span className="text-emerald-400 font-bold">33.34% Genesis Tranche</span>
                  </div>
                </div>
              </div>

              {/* Other 2 Founders: Smaller Face Photos Side-by-Side */}
              <div className="grid grid-cols-2 gap-2 pt-0.5">
                {/* Daniel Kolárovský */}
                <div className="bg-[#090d16] border border-slate-800 rounded-[3px] p-2 flex items-center gap-2.5 hover:border-blue-400/80 transition group">
                  <div className="relative w-11 h-11 rounded-[2px] overflow-hidden border border-slate-700 shrink-0 bg-[#080c14] shadow">
                    <img
                      src="/team/daniel-kolarovsky.jpg"
                      alt="Daniel Kolárovský"
                      className="w-full h-full object-cover object-top transition duration-300 group-hover:scale-105"
                      loading="eager"
                    />
                  </div>
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="text-[11px] font-bold text-white uppercase tracking-tight truncate">
                      Daniel Kolárovský
                    </div>
                    <div className="text-[9px] text-blue-400 font-medium truncate">
                      QA & Process Audit
                    </div>
                    <div className="text-[8px] text-emerald-400 font-mono">
                      33.33% · VŠE Partner
                    </div>
                  </div>
                </div>

                {/* Miroslava Valová */}
                <div className="bg-[#090d16] border border-slate-800 rounded-[3px] p-2 flex items-center gap-2.5 hover:border-purple-400/80 transition group">
                  <div className="relative w-11 h-11 rounded-[2px] overflow-hidden border border-slate-700 shrink-0 bg-[#080c14] shadow">
                    <img
                      src="/team/miroslava-valova.jpg"
                      alt="Miroslava Valová"
                      className="w-full h-full object-cover object-top transition duration-300 group-hover:scale-105"
                      loading="eager"
                    />
                  </div>
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="text-[11px] font-bold text-white uppercase tracking-tight truncate">
                      Miroslava Valová
                    </div>
                    <div className="text-[9px] text-purple-400 font-medium truncate">
                      Compliance & Strategy
                    </div>
                    <div className="text-[8px] text-emerald-400 font-mono">
                      33.33% · VŠE Partner
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Card Footer */}
              <div className="px-1 text-[9.5px] text-slate-400 flex items-center justify-between font-mono border-t border-slate-800/80 pt-2">
                <span>Decentralized Governance</span>
                <span className="text-emerald-400 font-bold">2-of-3 Simple Majority Threshold</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Three.js Dynamic Status Ticker + Prague Telemetry Badge */}
        <div className="relative z-10 border-t border-slate-800/80 pt-3 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>WebGL Engine Active: <strong className="text-slate-200">280 Distributed Clusters Mapped</strong></span>
          </div>

          {highlightedNode && (
            <div className="px-2.5 py-1 rounded-[2px] bg-emerald-500/10 border border-emerald-500/30 text-[10px] text-emerald-300 flex items-center gap-2 shadow">
              <span className="font-bold uppercase tracking-wider">Target Node:</span>
              <span>{highlightedNode.name}</span>
              <span>•</span>
              <span>{highlightedNode.latency}ms ping</span>
              <span>•</span>
              <span>TTFT: {highlightedNode.ttft}ms</span>
              <span>•</span>
              <span className="text-emerald-400 font-bold">{highlightedNode.status}</span>
            </div>
          )}

          <div className="flex items-center gap-3 text-[10px]">
            <span>Orbit Green: <strong className="text-emerald-400">Horizon 1 Live</strong></span>
            <span>Orbit Blue: <strong className="text-blue-400">Horizon 2 Channels</strong></span>
            <span>Orbit Purple: <strong className="text-purple-400">Horizon 3 Sovereign</strong></span>
          </div>
        </div>
      </div>

      {/* SECTION 2: COMPLEX QUANTITATIVE MACROECONOMIC & NASH EQUILIBRIUM CHARTS */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
          <div className="space-y-0.5">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              <span>Comparative Macroeconomic Clearing Engine & Cost Drag Model</span>
            </h2>
            <p className="text-[11px] text-slate-400 font-sans">
              Mathematical proof of fee compression: 950 bps legacy aggregator take-rate vs Verxl 50 bps flat non-custodial switch.
            </p>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono font-bold">
            Interactive Financial Model
          </span>
        </div>

        {/* Dynamic Token Volume Slider Card */}
        <div className="bg-[#0a0e17] border border-blue-500/25 rounded-[4px] p-5 shadow-xl space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Slider Controls */}
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-blue-400" />
                  <span>Monthly Inference Workload</span>
                </span>
                <span className="text-base font-extrabold text-blue-400 tabular font-mono">
                  {tokenVolumeM >= 1000 ? `${(tokenVolumeM / 1000).toFixed(1)} Billion` : `${tokenVolumeM} Million`} Tokens
                </span>
              </div>

              <input
                type="range"
                min="100"
                max="10000"
                step="100"
                value={tokenVolumeM}
                onChange={(e) => setTokenVolumeM(parseInt(e.target.value))}
                className="w-full accent-blue-500 bg-slate-800 rounded-[2px] h-2 cursor-pointer"
              />

              <div className="flex justify-between text-[9.5px] text-slate-500 font-mono">
                <span>100M Tokens</span>
                <span>1B Tokens</span>
                <span>5B Tokens</span>
                <span>10B Tokens</span>
              </div>

              {/* Volume Preset Chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {VOLUME_POINTS.map((vp) => (
                  <button
                    key={vp.volumeNum}
                    onClick={() => setTokenVolumeM(vp.volumeNum)}
                    className={`px-2 py-0.5 rounded-[2px] text-[10px] font-mono transition ${
                      tokenVolumeM === vp.volumeNum
                        ? "bg-blue-600 text-white font-bold"
                        : "bg-[#05070b] border border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {vp.volumeLabel}
                  </button>
                ))}
              </div>
            </div>

            {/* Financial Summary Badges */}
            <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="bg-[#05070b] p-2.5 rounded-[3px] border border-slate-800 space-y-1">
                <div className="text-[9px] text-slate-400 uppercase tracking-wider">Aggregator (950 bps)</div>
                <div className="text-xs sm:text-sm font-extrabold text-rose-400 font-mono">
                  ${centralizedAggregatorFeeUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo
                </div>
                <div className="text-[8.5px] text-slate-500">5.5% + 4.0% processing</div>
              </div>

              <div className="bg-[#05070b] p-2.5 rounded-[3px] border border-slate-800 space-y-1">
                <div className="text-[9px] text-amber-400 uppercase tracking-wider">Hyperscaler (750 bps)</div>
                <div className="text-xs sm:text-sm font-extrabold text-amber-300 font-mono">
                  ${hyperscalerCloudFeeUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo
                </div>
                <div className="text-[8.5px] text-slate-500">AWS / Bedrock</div>
              </div>

              <div className="bg-[#05070b] p-2.5 rounded-[3px] border border-blue-500/30 space-y-1">
                <div className="text-[9px] text-blue-400 uppercase tracking-wider">Verxl (50 bps)</div>
                <div className="text-xs sm:text-sm font-extrabold text-blue-300 font-mono">
                  ${verxlProtocolFeeUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo
                </div>
                <div className="text-[8.5px] text-slate-400">Fixed switch</div>
              </div>

              <div className="bg-[#05070b] p-2.5 rounded-[3px] border border-emerald-500/40 space-y-1 shadow-md">
                <div className="text-[9px] text-emerald-400 uppercase tracking-wider font-bold">Capital Saved</div>
                <div className="text-xs sm:text-sm font-black text-emerald-400 font-mono">
                  +${netMonthlySavedUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo
                </div>
                <div className="text-[8.5px] text-emerald-300/80 font-bold">
                  ${netAnnualizedSavedUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })} / yr ({percentageSaved.toFixed(0)}%)
                </div>
              </div>
            </div>
          </div>

          {/* COMPLEX MULTI-CURVE SVG COMPARATIVE CHART */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span className="uppercase tracking-wider">Annualized Protocol Fee Drag Across Token Volume ($USD)</span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-0.5 bg-rose-500 rounded-full" />
                  <span className="text-rose-400">Centralized Aggregator (950 bps)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-0.5 bg-amber-400 rounded-full" />
                  <span className="text-amber-400">Hyperscalers (750 bps)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-0.5 bg-emerald-400 rounded-full" />
                  <span className="text-emerald-400">Verxl Protocol (50 bps)</span>
                </span>
              </div>
            </div>

            {/* SVG Visualizer Canvas */}
            <div className="w-full h-56 bg-[#05070b] border border-slate-800 rounded-[3px] p-3 relative overflow-hidden">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 800 180" preserveAspectRatio="none">
                <defs>
                  {/* Shaded Green Area for Saved Delta */}
                  <linearGradient id="savingsAreaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="roseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                <line x1="40" y1="20" x2="780" y2="20" stroke="#1e293b" strokeDasharray="3 3" />
                <line x1="40" y1="60" x2="780" y2="60" stroke="#1e293b" strokeDasharray="3 3" />
                <line x1="40" y1="100" x2="780" y2="100" stroke="#1e293b" strokeDasharray="3 3" />
                <line x1="40" y1="140" x2="780" y2="140" stroke="#1e293b" strokeDasharray="3 3" />

                {/* Y-Axis Value Labels */}
                <text x="35" y="24" textAnchor="end" fill="#64748b" fontSize="9" fontFamily="monospace">$684k/yr</text>
                <text x="35" y="64" textAnchor="end" fill="#64748b" fontSize="9" fontFamily="monospace">$456k/yr</text>
                <text x="35" y="104" textAnchor="end" fill="#64748b" fontSize="9" fontFamily="monospace">$228k/yr</text>
                <text x="35" y="144" textAnchor="end" fill="#64748b" fontSize="9" fontFamily="monospace">$0</text>

                {/* Shaded Area of Capital Retained */}
                <polygon
                  points="40,140 40,140 180,118 360,92 540,58 780,18 780,134 540,137 360,138 180,139 40,140"
                  fill="url(#savingsAreaGradient)"
                />

                {/* Curve 1: Centralized SaaS (950 bps) in Rose */}
                <path
                  d="M 40,140 Q 200,120 360,92 T 780,18"
                  fill="none"
                  stroke="#f43f5e"
                  strokeWidth="2.5"
                />

                {/* Curve 2: Hyperscalers (750 bps) in Amber */}
                <path
                  d="M 40,140 Q 200,125 360,102 T 780,44"
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="2"
                  strokeDasharray="4 2"
                />

                {/* Curve 3: Verxl Protocol (50 bps) in Emerald */}
                <path
                  d="M 40,140 Q 200,139 360,138 T 780,134"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3"
                />

                {/* Active Slider Indicator Pin */}
                {(() => {
                  const ratio = Math.min(1, Math.max(0, (tokenVolumeM - 100) / 9900));
                  const pinX = 40 + ratio * 740;
                  const saasY = 140 - ratio * 122;
                  const verxlY = 140 - ratio * 6;
                  return (
                    <g>
                      <line x1={pinX} y1="15" x2={pinX} y2="155" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="2 2" />
                      <circle cx={pinX} cy={saasY} r="4.5" fill="#f43f5e" />
                      <circle cx={pinX} cy={verxlY} r="4.5" fill="#10b981" />
                    </g>
                  );
                })()}

                {/* X-Axis Milestone Labels */}
                <text x="40" y="165" fill="#64748b" fontSize="9" fontFamily="monospace">100M</text>
                <text x="180" y="165" fill="#64748b" fontSize="9" fontFamily="monospace">1B</text>
                <text x="360" y="165" fill="#64748b" fontSize="9" fontFamily="monospace">2.5B</text>
                <text x="540" y="165" fill="#64748b" fontSize="9" fontFamily="monospace">5B</text>
                <text x="780" y="165" textAnchor="end" fill="#64748b" fontSize="9" fontFamily="monospace">10B Tokens/Mo</text>
              </svg>
            </div>
          </div>
        </div>

        {/* SECOND COMPLEX CHART: NASH EQUILIBRIUM COLLATERAL SLASHING PAYOFF DISTRIBUTION */}
        <div className="bg-[#0a0e17] border border-blue-500/25 rounded-[4px] p-5 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
            <div className="space-y-0.5">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-blue-400" />
                <span>Deterministic Quality Verification & Nash Slashing Payoff Function</span>
              </h3>
              <p className="text-[10.5px] text-slate-400 font-sans">
                Game-theoretic equilibrium ensures serving degraded or quantized weights is strictly negative expected value ($E[\Pi] &lt; 0$).
              </p>
            </div>
            <span className="px-2 py-0.5 rounded-[2px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-[9.5px]">
              NASH EQUILIBRIUM: HONEST FP16 DOMINANT STRATEGY
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
            {/* Payoff Formula Matrix */}
            <div className="md:col-span-5 space-y-2.5 text-xs">
              <div className="bg-[#05070b] p-3 rounded-[3px] border border-slate-800 space-y-1.5">
                <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Honest FP16 Inference Payoff:</span>
                </div>
                <div className="text-[11px] text-white font-mono bg-black/40 p-2 rounded-[2px] border border-slate-800">
                  {"Π(honest) = R - C_FP16 = +18.5% Net Margin"}
                </div>
                <p className="text-[10px] text-slate-400 font-sans">
                  Host earns agreed $0.06/1M token fee, collateral remains 100% bonded, and reputation multiplier escalates.
                </p>
              </div>

              <div className="bg-[#05070b] p-3 rounded-[3px] border border-rose-500/30 space-y-1.5">
                <div className="text-[10px] text-rose-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-rose-400" />
                  <span>Spoofed INT4 Fraud Expected Payoff:</span>
                </div>
                <div className="text-[11px] text-white font-mono bg-black/40 p-2 rounded-[2px] border border-slate-800">
                  {"E[Π(cheat)] = R - C_INT4 - (p_audit × S_slash) = -34.8%"}
                </div>
                <p className="text-[10px] text-slate-400 font-sans">
                  Even saving 30% GPU power, consecutive failed canary probes trigger irreversible 10% collateral slashing routed to the DAO Vault.
                </p>
              </div>
            </div>

            {/* Visual SVG Payoff Distribution Curve */}
            <div className="md:col-span-7 h-52 bg-[#05070b] border border-slate-800 rounded-[3px] p-3 relative">
              <div className="flex items-center justify-between text-[9.5px] text-slate-400 mb-1">
                <span>Output Token Fidelity Score (F &isin; [0, 1.0])</span>
                <span className="text-rose-400 font-bold">Slashing Threshold: &tau; = 0.95</span>
              </div>

              <svg className="w-full h-40 overflow-visible" viewBox="0 0 500 130" preserveAspectRatio="none">
                {/* Zero profit horizontal axis line */}
                <line x1="30" y1="75" x2="480" y2="75" stroke="#475569" strokeWidth="1" strokeDasharray="3 3" />
                <text x="25" y="78" textAnchor="end" fill="#64748b" fontSize="8" fontFamily="monospace">$0</text>

                {/* Threshold vertical line */}
                <line x1="340" y1="10" x2="340" y2="120" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4 2" />
                <text x="340" y="8" textAnchor="middle" fill="#f87171" fontSize="8" fontFamily="monospace">&tau; = 95.0%</text>

                {/* Red Slashing Region */}
                <rect x="30" y="10" width="310" height="110" fill="#ef4444" fillOpacity="0.08" />
                <text x="185" y="30" textAnchor="middle" fill="#ef4444" fontSize="9" fontWeight="bold" fontFamily="monospace">
                  10% COLLATERAL SLASHING ZONE
                </text>

                {/* Green Compliant Region */}
                <rect x="340" y="10" width="140" height="110" fill="#10b981" fillOpacity="0.08" />
                <text x="410" y="30" textAnchor="middle" fill="#10b981" fontSize="9" fontWeight="bold" fontFamily="monospace">
                  COMPLIANT
                </text>

                {/* Expected Return Curve */}
                <path
                  d="M 30,115 C 150,110 280,100 340,75 C 380,50 430,35 480,30"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                />

                {/* Points */}
                <circle cx="160" cy="110" r="4" fill="#f43f5e" />
                <text x="160" y="125" textAnchor="middle" fill="#f43f5e" fontSize="8" fontFamily="monospace">INT4 (-35%)</text>

                <circle cx="450" cy="32" r="4.5" fill="#10b981" />
                <text x="450" y="24" textAnchor="middle" fill="#10b981" fontSize="8" fontFamily="monospace">FP16 (+18.5%)</text>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2.5: INSTITUTIONAL DUE DILIGENCE, MARKET RESEARCH & ZERO-RED-FLAG FINANCIAL AUDIT */}
      <div id="financial-diligence" className="space-y-4 bg-[#0a0e17] border border-blue-500/25 rounded-[4px] p-5 sm:p-7 shadow-2xl scroll-mt-6">
        {/* Diligence Header & Sub-Tab Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Institutional Due Diligence, Market Research & Zero-Red-Flag Audit
              </h2>
            </div>
            <p className="text-[11px] text-slate-400 font-sans">
              Exhaustive market sizing (TAM/SAM/SOM), capital efficiency benchmarks, unit economics, and structural elimination of classic AI/DePIN red flags.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-[10px]">
            <span className="px-2 py-0.5 rounded-[2px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono font-bold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Investment Grade</span>
            </span>
            <span className="px-2 py-0.5 rounded-[2px] bg-blue-500/10 text-blue-400 border border-blue-500/30 font-mono">
              Academic Research Framework · VŠE Praha
            </span>
          </div>
        </div>

        {/* 4 Interactive Diligence Sub-Tabs */}
        <div className="flex flex-wrap gap-1 border-b border-slate-800 pb-2 text-xs">
          <button
            onClick={() => setDiligenceTab("MARKET_RESEARCH")}
            className={`py-2 px-3.5 rounded-[2px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition ${
              diligenceTab === "MARKET_RESEARCH"
                ? "bg-blue-600 text-white shadow"
                : "bg-[#05070b] border border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-cyan-300" />
            <span>Market Sizing (TAM/SAM/SOM)</span>
          </button>

          <button
            onClick={() => setDiligenceTab("FINANCIAL_KPIS")}
            className={`py-2 px-3.5 rounded-[2px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition ${
              diligenceTab === "FINANCIAL_KPIS"
                ? "bg-blue-600 text-white shadow"
                : "bg-[#05070b] border border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-blue-300" />
            <span>Financial KPIs & Competitor Matrix</span>
          </button>

          <button
            onClick={() => setDiligenceTab("ZERO_RED_FLAGS")}
            className={`py-2 px-3.5 rounded-[2px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition ${
              diligenceTab === "ZERO_RED_FLAGS"
                ? "bg-emerald-600 text-white shadow"
                : "bg-[#05070b] border border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
            <span>Zero-Red-Flag Diligence Audit (6 Flags)</span>
          </button>

          <button
            onClick={() => setDiligenceTab("SCENARIO_SIMULATOR")}
            className={`py-2 px-3.5 rounded-[2px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition ${
              diligenceTab === "SCENARIO_SIMULATOR"
                ? "bg-purple-600 text-white shadow"
                : "bg-[#05070b] border border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-purple-300" />
            <span>3-Year Sensitivity & Scenario Simulator</span>
          </button>
        </div>

        {/* TAB 1: MARKET RESEARCH & TAM/SAM/SOM */}
        {diligenceTab === "MARKET_RESEARCH" && (
          <div className="space-y-4">
            {/* Top 3 TAM Sizing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Card 1: TAM */}
              <div className="bg-[#05070b] border border-blue-500/30 rounded-[3px] p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono">
                    Global Total Addressable Market
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30 font-mono">
                    34.2% CAGR
                  </span>
                </div>
                <div className="text-2xl font-black text-white font-mono">
                  $82.4B → $382.6B
                </div>
                <div className="text-[11px] text-slate-300 font-sans leading-relaxed">
                  Total global AI inference compute market by 2030 (Stanford HAI & Gartner consensus). Reflects the structural <strong className="text-white">"Inference Flippening"</strong>: compute spend shifts from 25% training to &gt;85% recurring runtime query execution.
                </div>
              </div>

              {/* Card 2: SAM */}
              <div className="bg-[#05070b] border border-cyan-500/30 rounded-[3px] p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono">
                    Serviceable Addressable Market
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-mono">
                    DePIN & Sovereign
                  </span>
                </div>
                <div className="text-2xl font-black text-cyan-400 font-mono">
                  $14.8 Billion
                </div>
                <div className="text-[11px] text-slate-300 font-sans leading-relaxed">
                  European sovereign AI workloads, privacy-sensitive fintechs (GDPR Article 5 data minimisation), independent bare-metal GPU hosts, and autonomous agent swarms seeking alternatives to the US hyperscaler duopoly.
                </div>
              </div>

              {/* Card 3: SOM */}
              <div className="bg-[#05070b] border border-emerald-500/30 rounded-[3px] p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono">
                    Verxl Protocol Target (SOM)
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono">
                    Year 1–3
                  </span>
                </div>
                <div className="text-2xl font-black text-emerald-400 font-mono">
                  $42M → $890M GMV
                </div>
                <div className="text-[11px] text-slate-300 font-sans leading-relaxed">
                  Year 1: $42M GMV ($210k fee @ 50 bps, 84M tokens/s). Year 2: $240M GMV ($1.2M fee). Year 3: $890M GMV ($4.45M fee). Driven by frictionless OpenAI-compatible drop-in integration and Czech ÚOOÚ privacy covenants.
                </div>
              </div>
            </div>

            {/* Bottom-Up Customer Persona Sizing */}
            <div className="bg-[#05070b] border border-slate-800 rounded-[3px] p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-800 pb-2">
                <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                  <span>Target Customer Personas & Unit Economics Funnel</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  Blended Developer CAC: $62.50 · LTV/CAC: 25.9x · NRR: 138%
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Persona 1 */}
                <div className="bg-[#0a0e17] border border-slate-800 p-3 rounded-[2px] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">1. Autonomous Agent Developers</span>
                    <span className="text-[9px] text-blue-400 font-mono">38% of Demand</span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                    Builders of Cursor-like coding agents, OpenCode, AutoGen, and LangChain swarms. Run billions of high-frequency tool-calling tokens 24/7.
                  </p>
                  <div className="border-t border-slate-800 pt-1.5 grid grid-cols-2 gap-1 text-[10px] font-mono text-slate-400">
                    <div>Volume: <span className="text-white font-bold">120M tok/mo</span></div>
                    <div>Spend: <span className="text-white font-bold">$720/mo</span></div>
                    <div>CAC: <span className="text-emerald-400 font-bold">$45 (Organic)</span></div>
                    <div>Payback: <span className="text-emerald-400 font-bold">0.8 Months</span></div>
                  </div>
                </div>

                {/* Persona 2 */}
                <div className="bg-[#0a0e17] border border-slate-800 p-3 rounded-[2px] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">2. EU Privacy-Sensitive SMEs</span>
                    <span className="text-[9px] text-cyan-400 font-mono">34% of Demand</span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                    European fintechs, legal techs, and healthcare AI requiring strict ephemeral RAM streaming without US CLOUD Act subpoena inspection.
                  </p>
                  <div className="border-t border-slate-800 pt-1.5 grid grid-cols-2 gap-1 text-[10px] font-mono text-slate-400">
                    <div>Volume: <span className="text-white font-bold">85M tok/mo</span></div>
                    <div>Spend: <span className="text-white font-bold">$510/mo</span></div>
                    <div>CAC: <span className="text-emerald-400 font-bold">$85 (Outreach)</span></div>
                    <div>Payback: <span className="text-emerald-400 font-bold">1.2 Months</span></div>
                  </div>
                </div>

                {/* Persona 3 */}
                <div className="bg-[#0a0e17] border border-slate-800 p-3 rounded-[2px] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">3. On-Chain Smart Contract Oracles</span>
                    <span className="text-[9px] text-purple-400 font-mono">28% of Demand</span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                    Decentralized protocols and prediction markets needing cryptographic AI inference verification with direct Arbitrum USDC streaming.
                  </p>
                  <div className="border-t border-slate-800 pt-1.5 grid grid-cols-2 gap-1 text-[10px] font-mono text-slate-400">
                    <div>Volume: <span className="text-white font-bold">60M tok/mo</span></div>
                    <div>Spend: <span className="text-white font-bold">$360/mo</span></div>
                    <div>CAC: <span className="text-emerald-400 font-bold">$55 (Ecosystem)</span></div>
                    <div>Payback: <span className="text-emerald-400 font-bold">0.9 Months</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: FINANCIAL KPIS & COMPETITIVE BENCHMARKING */}
        {diligenceTab === "FINANCIAL_KPIS" && (
          <div className="space-y-4">
            {/* 6 Core Metric Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              <div className="bg-[#05070b] p-3 rounded-[2px] border border-slate-800 space-y-1">
                <div className="text-[9.5px] uppercase tracking-wider text-slate-400 font-mono">Take Rate</div>
                <div className="text-lg font-black text-emerald-400 font-mono">50 bps</div>
                <div className="text-[9px] text-slate-400">0.50% flat on-chain fee</div>
              </div>

              <div className="bg-[#05070b] p-3 rounded-[2px] border border-slate-800 space-y-1">
                <div className="text-[9.5px] uppercase tracking-wider text-slate-400 font-mono">Gross Margin</div>
                <div className="text-lg font-black text-white font-mono">88.4%</div>
                <div className="text-[9px] text-slate-400">Zero hardware CapEx drag</div>
              </div>

              <div className="bg-[#05070b] p-3 rounded-[2px] border border-slate-800 space-y-1">
                <div className="text-[9.5px] uppercase tracking-wider text-slate-400 font-mono">Balance Sheet CapEx</div>
                <div className="text-lg font-black text-cyan-400 font-mono">$0.00</div>
                <div className="text-[9px] text-slate-400">Node operators bear silicon</div>
              </div>

              <div className="bg-[#05070b] p-3 rounded-[2px] border border-slate-800 space-y-1">
                <div className="text-[9.5px] uppercase tracking-wider text-slate-400 font-mono">DSO (Receivables)</div>
                <div className="text-lg font-black text-emerald-400 font-mono">0.00 Days</div>
                <div className="text-[9px] text-slate-400">Instant atomic streaming</div>
              </div>

              <div className="bg-[#05070b] p-3 rounded-[2px] border border-slate-800 space-y-1">
                <div className="text-[9.5px] uppercase tracking-wider text-slate-400 font-mono">LTV / CAC Ratio</div>
                <div className="text-lg font-black text-purple-400 font-mono">25.9x</div>
                <div className="text-[9px] text-slate-400">Industry top quartile &gt;3.0x</div>
              </div>

              <div className="bg-[#05070b] p-3 rounded-[2px] border border-slate-800 space-y-1">
                <div className="text-[9.5px] uppercase tracking-wider text-slate-400 font-mono">Breakeven Daily</div>
                <div className="text-lg font-black text-amber-400 font-mono">182.5k reqs</div>
                <div className="text-[9px] text-slate-400">Covers all server & RPC ops</div>
              </div>
            </div>

            {/* Comprehensive 5-Way Competitive Matrix Table */}
            <div className="bg-[#05070b] border border-slate-800 rounded-[3px] p-4 space-y-3 overflow-x-auto">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-blue-400" />
                  <span>5-Way Competitive & Capital Efficiency Matrix</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  Audited vs AWS Bedrock, Render Network, Akash, and Bittensor
                </span>
              </div>

              <table className="w-full text-left text-xs font-mono min-w-[720px]">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase">
                    <th className="py-2 px-3">Metric / Dimension</th>
                    <th className="py-2 px-3 text-emerald-400 font-bold bg-emerald-500/5 border-x border-emerald-500/20">
                      Verxl Protocol
                    </th>
                    <th className="py-2 px-3">AWS Bedrock / Azure</th>
                    <th className="py-2 px-3">Render Network</th>
                    <th className="py-2 px-3">Akash Network</th>
                    <th className="py-2 px-3">Bittensor (TAO)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-[11px]">
                  {BENCHMARK_DIMENSIONS.map((dim) => (
                    <tr key={dim.key}>
                      <td className="py-2.5 px-3 text-slate-300 font-bold">{dim.label}</td>
                      {COMPETITIVE_BENCHMARKS.map((comp) => {
                        const val = comp[dim.key] as string;
                        const isVerxl = comp.isVerxl;
                        return (
                          <td
                            key={comp.name}
                            className={`py-2.5 px-3 ${
                              isVerxl
                                ? "font-bold text-emerald-400 bg-emerald-500/5 border-x border-emerald-500/20"
                                : val.includes("markup") || val.includes("write-down") || val.includes("Seizure") || val.includes("Invoicing")
                                ? "text-rose-400"
                                : val.includes("Volatile") || val.includes("take rate") || val.includes("dilution") || val.includes("Batch")
                                ? "text-amber-400"
                                : "text-slate-300"
                            }`}
                          >
                            {val}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: ZERO-RED-FLAG DILIGENCE AUDIT */}
        {diligenceTab === "ZERO_RED_FLAGS" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#05070b] p-3 rounded-[3px] border border-emerald-500/30">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  The Zero-Red-Flag Institutional Audit Matrix
                </span>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono font-bold">
                6 of 6 Core Financial & Structural Diligence Flags Cleared
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Flag Selection List (Left Column) */}
              <div className="lg:col-span-5 space-y-1.5">
                {RED_FLAG_AUDIT_DATA.map((flag) => {
                  const isSelected = selectedRedFlagId === flag.id;
                  return (
                    <button
                      key={flag.id}
                      onClick={() => setSelectedRedFlagId(flag.id)}
                      className={`w-full text-left p-3 rounded-[3px] border transition flex flex-col gap-1 ${
                        isSelected
                          ? "bg-[#0c1424] border-emerald-500 shadow-md ring-1 ring-emerald-500/30"
                          : "bg-[#05070b] border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                          {flag.category}
                        </span>
                        <span
                          className={`text-[8.5px] font-bold px-1.5 py-0.2 rounded border uppercase font-mono ${
                            flag.auditStatus === "ZERO_EXPOSURE"
                              ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                              : flag.auditStatus === "MATHEMATICALLY_IMMUNE"
                              ? "bg-purple-500/10 text-purple-400 border-purple-500/30"
                              : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          }`}
                        >
                          {flag.auditStatus}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-white">
                        {flag.flagName}
                      </div>
                      <div className="text-[10px] text-emerald-400 font-mono truncate">
                        {flag.kpiMetric.label}: {flag.kpiMetric.value}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Detailed Flag Inspection Drawer (Right Column) */}
              <div className="lg:col-span-7 bg-[#05070b] border border-blue-500/30 rounded-[3px] p-4 sm:p-5 space-y-3.5 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                  <div className="space-y-0.5">
                    <span className="text-[9.5px] uppercase tracking-wider text-slate-400 font-mono">
                      {selectedRedFlag.category}
                    </span>
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{selectedRedFlag.flagName}</span>
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 text-[9.5px] font-bold font-mono rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shrink-0">
                    STATUS: {selectedRedFlag.auditStatus}
                  </span>
                </div>

                {/* The Analyst's Challenge */}
                <div className="bg-[#0a0e17] border border-rose-500/25 p-3 rounded-[2px] space-y-1">
                  <div className="text-[10px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>The Financial Analyst's Challenge</span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                    "{selectedRedFlag.analystWorry}"
                  </p>
                </div>

                {/* Traditional Risk vs Verxl Defense */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] font-sans">
                  <div className="bg-[#0a0e17] border border-slate-800 p-3 rounded-[2px] space-y-1">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                      Traditional Competitor Vulnerability
                    </div>
                    <p className="text-slate-400 leading-relaxed text-[10.5px]">
                      {selectedRedFlag.traditionalVulnerability}
                    </p>
                  </div>

                  <div className="bg-[#0a0e17] border border-emerald-500/30 p-3 rounded-[2px] space-y-1">
                    <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider font-mono">
                      Verxl Protocol Structural Defense
                    </div>
                    <p className="text-slate-200 leading-relaxed text-[10.5px]">
                      {selectedRedFlag.verxlProtocolDefense}
                    </p>
                  </div>
                </div>

                {/* Mathematical / Economic Proof Box */}
                <div className="bg-[#070b13] border border-cyan-500/30 p-3 rounded-[2px] space-y-1">
                  <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Mathematical &amp; Economic Proof</span>
                  </div>
                  <div className="text-[11px] text-cyan-200 font-mono leading-relaxed bg-[#05070b] p-2 rounded border border-cyan-500/20">
                    {selectedRedFlag.mathematicalProof}
                  </div>
                </div>

                {/* On-Chain Anchor & Verification Pill */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-t border-slate-800 pt-2 text-[10px] font-mono">
                  <div className="text-slate-400">
                    Anchor: <span className="text-blue-300 font-bold">{selectedRedFlag.contractAnchor}</span>
                  </div>
                  <div className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                    {selectedRedFlag.kpiMetric.label}: {selectedRedFlag.kpiMetric.value}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SCENARIO & SENSITIVITY SIMULATOR */}
        {diligenceTab === "SCENARIO_SIMULATOR" && (
          <div className="space-y-4">
            {/* Scenario Preset Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#05070b] p-3 rounded-[3px] border border-slate-800">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-purple-400" />
                  <span>Interactive 3-Year Financial Sensitivity Simulator</span>
                </div>
                <div className="text-[10.5px] text-slate-400 font-sans">
                  Adjust market variables to stress-test unit economics, DAO revenue inflows, and break-even velocity.
                </div>
              </div>

              {/* Scenario Toggle Buttons */}
              <div className="flex items-center gap-1.5">
                {(["BEAR", "BASE", "BULL"] as const).map((preset) => (
                  <button
                    key={preset}
                    onClick={() => handleScenarioChange(preset)}
                    className={`px-3 py-1 rounded-[2px] text-[10px] font-mono font-bold uppercase tracking-wider transition ${
                      scenarioPreset === preset
                        ? preset === "BEAR"
                          ? "bg-rose-600 text-white"
                          : preset === "BASE"
                          ? "bg-blue-600 text-white"
                          : "bg-emerald-600 text-white"
                        : "bg-[#0a0e17] border border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {preset === "BEAR" ? "Bear Case" : preset === "BASE" ? "Base Case" : "Bull Case"}
                  </button>
                ))}
              </div>
            </div>

            {/* Slider Controls Card */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-[#05070b] border border-slate-800 rounded-[3px] p-4">
              {/* Slider 1: Daily Requests */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Daily Requests</span>
                  <span className="text-white font-bold">{simDailyReqsM}M / day</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="500"
                  step="5"
                  value={simDailyReqsM}
                  onChange={(e) => {
                    setSimDailyReqsM(parseInt(e.target.value));
                    setScenarioPreset("BASE");
                  }}
                  className="w-full accent-blue-500 bg-slate-800 rounded h-1.5 cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                  <span>5M</span>
                  <span>100M</span>
                  <span>500M</span>
                </div>
              </div>

              {/* Slider 2: Average Ticket */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Avg Ticket Size</span>
                  <span className="text-white font-bold">${simTicketUsd.toFixed(4)}</span>
                </div>
                <input
                  type="range"
                  min="0.0004"
                  max="0.0030"
                  step="0.0001"
                  value={simTicketUsd}
                  onChange={(e) => {
                    setSimTicketUsd(parseFloat(e.target.value));
                    setScenarioPreset("BASE");
                  }}
                  className="w-full accent-cyan-500 bg-slate-800 rounded h-1.5 cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                  <span>$0.0004</span>
                  <span>$0.0015</span>
                  <span>$0.0030</span>
                </div>
              </div>

              {/* Slider 3: Protocol Take Rate */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Protocol Take Rate</span>
                  <span className="text-white font-bold">{simTakeRateBps} bps ({(simTakeRateBps / 100).toFixed(2)}%)</span>
                </div>
                <input
                  type="range"
                  min="25"
                  max="100"
                  step="5"
                  value={simTakeRateBps}
                  onChange={(e) => {
                    setSimTakeRateBps(parseInt(e.target.value));
                    setScenarioPreset("BASE");
                  }}
                  className="w-full accent-emerald-500 bg-slate-800 rounded h-1.5 cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                  <span>25 bps</span>
                  <span>50 bps</span>
                  <span>100 bps</span>
                </div>
              </div>

              {/* Slider 4: $VRXL Token Price */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">$VRXL Token Price</span>
                  <span className="text-white font-bold">${simTokenPriceUsd.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.50"
                  max="10.00"
                  step="0.25"
                  value={simTokenPriceUsd}
                  onChange={(e) => {
                    setSimTokenPriceUsd(parseFloat(e.target.value));
                    setScenarioPreset("BASE");
                  }}
                  className="w-full accent-purple-500 bg-slate-800 rounded h-1.5 cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                  <span>$0.50</span>
                  <span>$5.00</span>
                  <span>$10.00</span>
                </div>
              </div>
            </div>

            {/* Real-Time Computed Financial Output Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-[#05070b] border border-blue-500/30 p-3.5 rounded-[3px] space-y-1">
                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-mono">
                  Annualized GMV Cleared
                </div>
                <div className="text-xl sm:text-2xl font-black text-white font-mono">
                  ${Math.round(simAnnualGmvUsd).toLocaleString()}
                </div>
                <div className="text-[9.5px] text-slate-400 font-mono">
                  ${Math.round(simDailyGmvUsd).toLocaleString()}/day · Hosts: ${Math.round(simFleetPayoutUsd).toLocaleString()}
                </div>
              </div>

              <div className="bg-[#05070b] border border-emerald-500/30 p-3.5 rounded-[3px] space-y-1">
                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-mono">
                  Annual Protocol Take
                </div>
                <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
                  ${Math.round(simAnnualRevenueUsd).toLocaleString()}
                </div>
                <div className="text-[9.5px] text-emerald-300 font-mono">
                  @ {simTakeRateBps} bps take rate
                </div>
              </div>

              <div className="bg-[#05070b] border border-purple-500/30 p-3.5 rounded-[3px] space-y-1">
                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-mono">
                  DAO Treasury Inflow (80%)
                </div>
                <div className="text-xl sm:text-2xl font-black text-purple-400 font-mono">
                  ${Math.round(simTreasuryInflowUsd).toLocaleString()}
                </div>
                <div className="text-[9.5px] text-purple-300 font-mono">
                  Aragon OSx vault accrual
                </div>
              </div>

              <div className="bg-[#05070b] border border-cyan-500/30 p-3.5 rounded-[3px] space-y-1">
                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-mono">
                  Operating Free Cash Flow
                </div>
                <div className="text-xl sm:text-2xl font-black text-cyan-400 font-mono">
                  ${Math.round(simNetFreeCashFlowUsd).toLocaleString()}
                </div>
                <div className="text-[9.5px] text-cyan-300 font-mono">
                  {simOperatingMarginPct}% Net Operating Margin
                </div>
              </div>
            </div>

            {/* Operational Resilience & Breakeven Memo */}
            <div className="bg-gradient-to-r from-emerald-950/20 via-[#05070b] to-blue-950/20 border border-emerald-500/40 p-4 rounded-[3px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono">
              <div className="space-y-1">
                <div className="text-white font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Immediate Breakeven Velocity: {simDailyBreakevenReqs.toLocaleString()} Requests / Day</span>
                </div>
                <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                  Fixed annual protocol hosting &amp; database infrastructure costs total exactly <strong className="text-white">$19,200/year</strong> (Cloudflare edge proxy + Charizard PostgreSQL + Alchemy RPC). At {simTakeRateBps} bps take rate and ${simTicketUsd.toFixed(4)} ticket size, break-even is achieved at only {simDailyBreakevenReqs.toLocaleString()} queries/day (~0.24% of single Prague GPU node capacity).
                </p>
              </div>
              <div className="bg-[#0a0e17] border border-slate-800 p-2.5 rounded text-right shrink-0">
                <div className="text-[9px] text-slate-400 uppercase">Collateral Staking TVL</div>
                <div className="text-base font-extrabold text-emerald-400">
                  ${Math.round(simStakedTvlUsd).toLocaleString()}
                </div>
                <div className="text-[9px] text-slate-400">{simActiveNodes} Active Nodes @ 1k $VRXL</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 3: REAL ARCHITECTURAL ROADMAP HIGHWAY (NOT AI SLOP BLOCKS) */}
      <div className="space-y-4 bg-[#0a0e17] border border-blue-500/20 rounded-[4px] p-5 sm:p-7 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="space-y-0.5">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" />
              <span>Architectural Execution Highway & Chronological Trajectory</span>
            </h2>
            <p className="text-[11px] text-slate-400 font-sans">
              Connected multi-horizon engineering roadmap across core protocol layers.
            </p>
          </div>

          {/* Layer Filter Toolbar */}
          <div className="flex flex-wrap items-center gap-1 text-[10px]">
            <span className="text-slate-500 mr-1 uppercase">Filter Layer:</span>
            {[
              { id: "ALL", label: "All Layers" },
              { id: "EDGE_ROUTING", label: "Edge Proxy" },
              { id: "SMART_CONTRACTS", label: "Contracts" },
              { id: "ZERO_KNOWLEDGE", label: "zk-Proofs" },
              { id: "HARDWARE", label: "Hardware Grid" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setLayerFilter(f.id)}
                className={`px-2 py-0.5 rounded-[2px] transition ${
                  layerFilter === f.id
                    ? "bg-blue-600 text-white font-bold"
                    : "bg-[#05070b] border border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* ROADMAP HIGHWAY CONNECTIVE TIMELINE SPINE */}
        <div className="relative py-4">
          {/* Horizontal Connective Bus Line */}
          <div className="hidden md:block absolute top-1/2 left-8 right-8 h-1 bg-gradient-to-r from-emerald-500 via-blue-500 via-cyan-500 to-purple-500 -translate-y-1/2 rounded-full opacity-60 pointer-events-none" />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative z-10">
            {filteredRoadmap.map((phase) => {
              const isSelected = selectedHorizonId === phase.id;
              return (
                <div
                  key={phase.id}
                  onClick={() => setSelectedHorizonId(phase.id)}
                  className={`p-4 rounded-[3px] border cursor-pointer transition-all relative overflow-hidden flex flex-col justify-between ${
                    isSelected
                      ? "bg-[#0c1424] border-blue-500 shadow-xl shadow-blue-500/15 ring-1 ring-blue-500/40"
                      : "bg-[#05070b] border-slate-800 hover:border-slate-700"
                  }`}
                >
                  {/* Highway Checkpoint Milestone Node */}
                  <div className="flex items-center justify-between mb-2">
                    <span
                      style={{ color: phase.colorHex }}
                      className="text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1.5"
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full border-2"
                        style={{
                          backgroundColor: phase.status === "OPERATIONAL" ? phase.colorHex : "transparent",
                          borderColor: phase.colorHex,
                        }}
                      />
                      <span>{phase.horizon}</span>
                    </span>

                    <span
                      className="px-1.5 py-0.2 text-[8px] font-bold rounded-[2px] border uppercase"
                      style={{
                        color: phase.colorHex,
                        borderColor: `${phase.colorHex}40`,
                        backgroundColor: `${phase.colorHex}15`,
                      }}
                    >
                      {phase.status}
                    </span>
                  </div>

                  <div className="space-y-1 mb-3">
                    <div className="text-xs font-bold text-white leading-snug">
                      {phase.phaseName}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Target: <strong className="text-slate-200">{phase.quarter}</strong>
                    </div>
                  </div>

                  {/* Progress Bar with Metric */}
                  <div className="space-y-1 mt-auto">
                    <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                      <span>Maturity</span>
                      <span style={{ color: phase.colorHex }} className="font-bold">
                        {phase.progressPct}%
                      </span>
                    </div>
                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${phase.progressPct}%`,
                          backgroundColor: phase.colorHex,
                        }}
                      />
                    </div>
                  </div>

                  {isSelected && (
                    <div
                      className="absolute bottom-0 left-0 right-0 h-1"
                      style={{ backgroundColor: phase.colorHex }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Horizon Deep-Dive Architectural Specification Panel */}
        <div className="bg-[#05070b] border border-blue-500/30 rounded-[3px] p-5 space-y-4 shadow-inner">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="space-y-0.5">
              <div className="text-[10px] uppercase tracking-wider font-bold" style={{ color: activePhase.colorHex }}>
                Detailed Specification · {activePhase.horizon} ({activePhase.quarter})
              </div>
              <h3 className="text-base font-extrabold text-white">
                {activePhase.phaseName}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400">Layer Architecture:</span>
              <span
                className="px-2 py-0.5 rounded-[2px] text-[9.5px] font-bold border"
                style={{
                  color: activePhase.colorHex,
                  borderColor: `${activePhase.colorHex}55`,
                  backgroundColor: `${activePhase.colorHex}15`,
                }}
              >
                {activePhase.layer} · {activePhase.progressPct}% READY
              </span>
            </div>
          </div>

          <p className="text-xs sm:text-[13px] text-slate-300 font-sans leading-relaxed">
            {activePhase.tagline}
          </p>

          {/* Deliverables Checklist */}
          <div className="space-y-2 pt-1">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
              Core Technical Deliverables & Milestones
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
              {activePhase.coreDeliverables.map((item, i) => (
                <div
                  key={i}
                  className="bg-[#080c14] border border-slate-800/80 rounded-[2px] p-2.5 flex items-start gap-2 shadow-sm"
                >
                  <CheckCircle2
                    className="w-3.5 h-3.5 mt-0.5 shrink-0"
                    style={{ color: activePhase.colorHex }}
                  />
                  <span className="text-[11px] text-slate-300 font-sans leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tech Stack Chips */}
          <div className="border-t border-slate-800/80 pt-3 flex flex-wrap items-center gap-1.5 text-[10px]">
            <span className="text-slate-400 font-bold uppercase tracking-wider mr-1">
              Architecture Stack:
            </span>
            {activePhase.techStack.map((tech, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-[2px] bg-[#0c1424] border border-slate-700 text-slate-300 font-mono"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 4: PROTOCOL EXECUTIVE ASSEMBLY & PROJECT TEAM */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
          <div className="space-y-0.5">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              <span>Protocol Executive Assembly & Project Team</span>
            </h2>
            <p className="text-[11px] text-slate-400 font-sans">
              Started as an academic university project at Prague University of Economics and Business (VŠE Praha).
            </p>
          </div>
          <span className="text-[10px] text-emerald-400 font-bold font-mono">
            Academic Project Initiative · VŠE Praha
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Šimon Havlík: PROMINENT FULL-PHOTO FEATURE CARD (Not an icon!) */}
          <div className="lg:col-span-7 bg-[#0a0e17] border-2 border-blue-500/60 rounded-[4px] p-5 space-y-4 shadow-2xl relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                {/* Šimon Havlík: FULL LARGE PHOTO (Not an icon) */}
                <div className="w-full sm:w-44 aspect-[3/4] rounded-[3px] overflow-hidden border-2 border-blue-500/80 shadow-2xl shrink-0 bg-[#080c14] relative group">
                  <img
                    src="/team/simon-havlik.jpg"
                    alt="Šimon Havlík"
                    className="w-full h-full object-cover object-top transition duration-500 group-hover:scale-105"
                    loading="eager"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#05070b]/90 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-2 left-2 right-2 text-center">
                    <span className="px-2 py-0.5 rounded-[2px] bg-blue-600 text-white font-mono text-[9px] uppercase tracking-wider font-extrabold shadow">
                      Head Developer
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <span className="text-base sm:text-lg font-black text-white uppercase tracking-wider">
                      Šimon Havlík
                    </span>
                    <span className="px-2 py-0.5 text-[9px] bg-blue-500/20 text-blue-300 border border-blue-500/40 rounded-[2px] font-mono font-bold uppercase">
                      Lead Architect
                    </span>
                  </div>

                  <div className="text-xs font-bold text-blue-400">
                    Project Lead & Head Developer
                  </div>
                  <div className="text-[10.5px] text-slate-300 font-mono">
                    Lead Protocol Architect · Smart Contracts & Core Infrastructure
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed font-sans pt-1">
                    Led end-to-end design and coding of the decentralized clearing architecture: Aragon OSx DAO settlement on Ethereum Sepolia, the <code className="text-blue-300">VerxlStakingRegistry.sol</code> smart contract, deterministic <code className="text-blue-300">seed=42</code> invariant verification, Prague bare-metal cluster orchestration, and the Arbitrum One USDC clearing pipeline.
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="px-2 py-0.5 bg-blue-950/60 border border-blue-500/30 text-blue-300 text-[9.5px] font-mono rounded-[2px]">
                      VŠE Praha · Lead
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-[9.5px] font-mono rounded-[2px] font-bold">
                      33.34% Genesis Tranche
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-800/80 pt-2.5 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Team Captain · 33.34% Tranche</span>
              </span>
              <span className="text-slate-300">VŠE Executive Lead</span>
            </div>
          </div>

          {/* Right Column: Daniel Kolárovský & Miroslava Valová with SMALLER FACE PHOTOS */}
          <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
            {/* Daniel Kolárovský: Smaller Face Photo Card */}
            <div className="bg-[#0a0e17] border border-blue-500/40 rounded-[4px] p-3.5 space-y-2.5 shadow-md flex-1 flex flex-col justify-between hover:border-blue-400 transition-all">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  {/* Smaller Face Photo */}
                  <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-[2px] overflow-hidden border border-blue-500/50 shadow-md shrink-0 bg-[#05070b]">
                    <img
                      src="/team/daniel-kolarovsky.jpg"
                      alt="Daniel Kolárovský"
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-extrabold text-white uppercase tracking-wider truncate">
                        Daniel Kolárovský
                      </span>
                      <span className="px-1.5 py-0.2 text-[8px] bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded-[2px] font-mono shrink-0">
                        VŠE Partner
                      </span>
                    </div>
                    <div className="text-[10px] text-blue-400 font-bold truncate">
                      Quality Assurance & Process Verification
                    </div>
                    <div className="text-[9px] text-slate-400 font-mono truncate">
                      Founding Partner · VŠE Praha
                    </div>
                  </div>
                </div>

                <p className="text-[10.5px] text-slate-300 leading-relaxed font-sans line-clamp-3">
                  Directs protocol quality control frameworks, independent process audit verification, and empirical SLA benchmarking across European compute hosting providers. Establishes verification methodologies ensuring deterministic output fidelity and academic rigor.
                </p>
              </div>

              <div className="border-t border-slate-800/80 pt-2 flex items-center justify-between text-[9.5px] text-slate-400 font-mono">
                <span className="flex items-center gap-1 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>33.33% Tranche</span>
                </span>
                <span className="text-slate-300">QA & Audit Lead</span>
              </div>
            </div>

            {/* Miroslava Valová: Smaller Face Photo Card */}
            <div className="bg-[#0a0e17] border border-purple-500/40 rounded-[4px] p-3.5 space-y-2.5 shadow-md flex-1 flex flex-col justify-between hover:border-purple-400 transition-all">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  {/* Smaller Face Photo */}
                  <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-[2px] overflow-hidden border border-purple-500/50 shadow-md shrink-0 bg-[#05070b]">
                    <img
                      src="/team/miroslava-valova.jpg"
                      alt="Miroslava Valová"
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-extrabold text-white uppercase tracking-wider truncate">
                        Miroslava Valová
                      </span>
                      <span className="px-1.5 py-0.2 text-[8px] bg-purple-500/10 text-purple-400 border border-purple-500/30 rounded-[2px] font-mono shrink-0">
                        VŠE Partner
                      </span>
                    </div>
                    <div className="text-[10px] text-purple-400 font-bold truncate">
                      Regulatory Compliance & Market Strategy
                    </div>
                    <div className="text-[9px] text-slate-400 font-mono truncate">
                      Founding Partner · VŠE Praha
                    </div>
                  </div>
                </div>

                <p className="text-[10.5px] text-slate-300 leading-relaxed font-sans line-clamp-3">
                  Heads competitive market intelligence, macroeconomic cost benchmarking against legacy centralized cloud aggregators, and regulatory compliance alignment (EU AI Act &amp; MiCA non-custodial boundaries). Oversees institutional risk governance.
                </p>
              </div>

              <div className="border-t border-slate-800/80 pt-2 flex items-center justify-between text-[9.5px] text-slate-400 font-mono">
                <span className="flex items-center gap-1 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>33.33% Tranche</span>
                </span>
                <span className="text-slate-300">Strategy & Compliance Lead</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 5: ARCHITECTURAL DESIGN CONSTRAINTS & CONTRACT REGISTRY */}
      <div className="bg-[#0a0e17] border border-blue-500/20 rounded-[3px] p-5 space-y-4 shadow-md">
        <h2 className="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center justify-between">
          <span>Design Constraints That Anchor the Architecture</span>
          <span className="text-[10px] text-slate-400 font-normal">Immutable Smart Contract Covenants</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="bg-[#05070b] p-3.5 rounded-[2px] border border-slate-800 space-y-1.5">
            <div className="font-bold text-white flex items-center gap-1.5 text-[11px]">
              <Cpu className="w-3.5 h-3.5 text-blue-400" />
              <span>Agency, Never Principal</span>
            </div>
            <p className="text-[10.5px] text-slate-400 leading-relaxed font-sans">
              Verxl never buys wholesale compute to resell retail. It takes zero inventory risk and assumes zero operational liability.
            </p>
          </div>

          <div className="bg-[#05070b] p-3.5 rounded-[2px] border border-slate-800 space-y-1.5">
            <div className="font-bold text-white flex items-center gap-1.5 text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Zero Custodial Float</span>
            </div>
            <p className="text-[10.5px] text-slate-400 leading-relaxed font-sans">
              Buyer funds never sit in unsegregated corporate accounts. Capital moves atomically on-chain only when tokens are delivered.
            </p>
          </div>

          <div className="bg-[#05070b] p-3.5 rounded-[2px] border border-slate-800 space-y-1.5">
            <div className="font-bold text-white flex items-center gap-1.5 text-[11px]">
              <Activity className="w-3.5 h-3.5 text-rose-400" />
              <span>Nash Slashing Rules</span>
            </div>
            <p className="text-[10.5px] text-slate-400 leading-relaxed font-sans">
              Quality is governed by economic payoffs. A 10% collateral slash ensures that serving adulterated 4-bit weights is mathematically irrational.
            </p>
          </div>

          <div className="bg-[#05070b] p-3.5 rounded-[2px] border border-slate-800 space-y-1.5">
            <div className="font-bold text-white flex items-center gap-1.5 text-[11px]">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Fixed 50 bps Switch</span>
            </div>
            <p className="text-[10.5px] text-slate-400 leading-relaxed font-sans">
              The fee is immutable in the smart contract. Exactly 99.5% passes to the hardware host; 0.5% accumulates in the DAO treasury vault.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 5.5: INTERACTIVE ECOSYSTEM MIND MAP & VALUE FLOW TOPOLOGY */}
      <div className="bg-[#0a0e17] border border-blue-500/25 rounded-[3px] p-5 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="space-y-0.5">
            <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Network className="w-4 h-4 text-cyan-400" />
              <span>Interactive Ecosystem Mind Map & Value Flow Topology</span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans">
              Click any node in the topology to inspect economic incentives, data flows, and cryptographic covenants.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 uppercase">Selected:</span>
            <span
              className="px-2 py-0.5 rounded-[2px] text-[10px] font-bold uppercase tracking-wider"
              style={{ color: selectedMindNode.color, backgroundColor: selectedMindNode.bgRgb, border: `1px solid ${selectedMindNode.borderColor}` }}
            >
              {selectedMindNode.name}
            </span>
          </div>
        </div>

        {/* Mind Map Interactive Canvas & Drawer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* SVG Topology Graph */}
          <div className="lg:col-span-7 bg-[#05070b] border border-slate-800 rounded-[3px] p-3 relative overflow-hidden">
            <svg className="w-full h-[320px] select-none" viewBox="0 0 800 360">
              <defs>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#10b981" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#c084fc" stopOpacity="0.8" />
                </linearGradient>
              </defs>

              {/* Connecting Edges with Animated Flow Lines */}
              {/* Clients <-> Router */}
              <path d="M 230,85 C 300,85 320,135 340,140" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="4 4" className="animate-pulse" opacity="0.6" />
              {/* Router <-> Supply */}
              <path d="M 460,140 C 490,135 520,85 580,85" fill="none" stroke="#c084fc" strokeWidth="1.5" strokeDasharray="4 4" className="animate-pulse" opacity="0.6" />
              {/* Ledger <-> Router */}
              <path d="M 230,245 C 300,245 320,165 340,155" fill="none" stroke="#60a5fa" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6" />
              {/* Router <-> Governance */}
              <path d="M 460,155 C 490,165 520,245 580,245" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6" />
              {/* Router <-> Legal */}
              <line x1="400" y1="180" x2="400" y2="245" stroke="#34d399" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.5" />
              {/* Governance <-> Supply (Slashing) */}
              <line x1="660" y1="115" x2="660" y2="215" stroke="#f43f5e" strokeWidth="1.2" strokeDasharray="2 2" opacity="0.4" />

              {/* Data Labels on Edges */}
              <text x="270" y="105" fill="#38bdf8" fontSize="8" fontFamily="monospace" textAnchor="middle">Prompt + 50bps</text>
              <text x="525" y="105" fill="#c084fc" fontSize="8" fontFamily="monospace" textAnchor="middle">99.5% Net Payout</text>
              <text x="275" y="215" fill="#60a5fa" fontSize="8" fontFamily="monospace" textAnchor="middle">2FA & Ledgers</text>
              <text x="535" y="215" fill="#f59e0b" fontSize="8" fontFamily="monospace" textAnchor="middle">50bps DAO Reserve</text>
              <text x="408" y="215" fill="#34d399" fontSize="8" fontFamily="monospace" textAnchor="start">MiCA</text>
              <text x="675" y="165" fill="#f43f5e" fontSize="7.5" fontFamily="monospace" textAnchor="start">10% Slash</text>

              {/* Render Interactive Mind Nodes */}
              {MIND_NODES.map((node) => {
                const isSelected = selectedMindNodeId === node.id;
                const isCenter = node.id === "router";
                const w = isCenter ? 150 : 135;
                const h = isCenter ? 64 : 54;
                const rx = node.coords.x - w / 2;
                const ry = node.coords.y - h / 2;

                return (
                  <g
                    key={node.id}
                    onClick={() => setSelectedMindNodeId(node.id)}
                    className="cursor-pointer transition-transform duration-200 hover:scale-105"
                  >
                    {/* Selected Ring */}
                    {isSelected && (
                      <rect
                        x={rx - 4}
                        y={ry - 4}
                        width={w + 8}
                        height={h + 8}
                        rx="6"
                        fill="none"
                        stroke={node.color}
                        strokeWidth="2"
                        filter="url(#glow)"
                        className="animate-pulse"
                      />
                    )}

                    {/* Node Container Box */}
                    <rect
                      x={rx}
                      y={ry}
                      width={w}
                      height={h}
                      rx="4"
                      fill="#0a0e17"
                      stroke={node.color}
                      strokeWidth={isSelected ? "2" : "1"}
                    />

                    {/* Center Node Indicator */}
                    {isCenter && (
                      <circle
                        cx={node.coords.x}
                        cy={ry - 6}
                        r="4"
                        fill="#10b981"
                        className="animate-ping"
                      />
                    )}

                    {/* Category Label */}
                    <text
                      x={node.coords.x}
                      y={ry + 16}
                      fill={node.color}
                      fontSize="7.5"
                      fontFamily="monospace"
                      fontWeight="bold"
                      textAnchor="middle"
                      letterSpacing="1"
                    >
                      {node.category}
                    </text>

                    {/* Node Name */}
                    <text
                      x={node.coords.x}
                      y={ry + 32}
                      fill="#ffffff"
                      fontSize="9.5"
                      fontFamily="sans-serif"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {node.name.length > 20 ? node.name.slice(0, 18) + "…" : node.name}
                    </text>

                    {/* Sub KPI */}
                    <text
                      x={node.coords.x}
                      y={ry + 46}
                      fill="#94a3b8"
                      fontSize="7.5"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      {node.kpis[0].value}
                    </text>
                  </g>
                );
              })}
            </svg>
            <div className="text-[9.5px] text-slate-500 text-center font-mono pt-1">
              Deterministic Invariant Routing: seed=42 canary verification across 300+ edge PoPs
            </div>
          </div>

          {/* Node Inspector Drawer */}
          <div className="lg:col-span-5 bg-[#05070b] border border-slate-800 rounded-[3px] p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="space-y-0.5">
                <span
                  className="text-[9px] uppercase tracking-widest font-bold"
                  style={{ color: selectedMindNode.color }}
                >
                  {selectedMindNode.category} COMPONENT
                </span>
                <div className="text-sm font-bold text-white">
                  {selectedMindNode.name}
                </div>
              </div>
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: selectedMindNode.color, boxShadow: `0 0 10px ${selectedMindNode.color}` }}
              />
            </div>

            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              {selectedMindNode.details}
            </p>

            {/* KPI Tiles */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              {selectedMindNode.kpis.map((kpi, idx) => (
                <div key={idx} className="bg-[#0a0e17] border border-slate-800 p-2 rounded-[2px] text-center space-y-0.5">
                  <div className="text-[8.5px] text-slate-400 uppercase tracking-wider">{kpi.label}</div>
                  <div className="text-[11px] font-bold text-white font-mono">{kpi.value}</div>
                </div>
              ))}
            </div>

            {/* Technical Specifications */}
            <div className="border-t border-slate-800/80 pt-2 space-y-1.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Architectural Specifications & Guarantees
              </div>
              <ul className="space-y-1 text-[10.5px] text-slate-300 font-mono">
                {selectedMindNode.techSpecs.map((spec, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <Check className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{spec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 6: EXECUTIVE NAVIGATION CTA BAR */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0a0e17] border border-blue-500/30 rounded-[3px] p-4 shadow-lg">
        <div className="space-y-0.5">
          <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-blue-400" />
            <span>Operational System Deployment</span>
          </div>
          <p className="text-slate-400 text-[11px] font-sans">
            Test our Prague GPU host in the Terminal, verify active clusters in the Registry, or access the commercial billing Console.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigate("playground")}
            className="hero-btn hero-btn--ghost !py-2 !px-3.5 !text-[11px]"
          >
            <Terminal className="w-3.5 h-3.5 text-blue-400" />
            <span>Terminal</span>
          </button>
          <button
            onClick={() => onNavigate("registry")}
            className="hero-btn hero-btn--ghost !py-2 !px-3.5 !text-[11px]"
          >
            <span>Registry</span>
          </button>
          <button
            onClick={() => onNavigate("console")}
            className="hero-btn hero-btn--ghost !py-2 !px-3.5 !text-[11px]"
          >
            <span>Console</span>
          </button>
          <button
            onClick={() => onNavigate("whitepaper")}
            className="hero-btn hero-btn--primary !py-2 !px-4 !text-[11px]"
          >
            <span>Whitepaper</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* MODAL: 5-MINUTE PITCH DECK PRESENTER VIEW */}
      {showPitchDeckModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-2.5 sm:p-6 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-4xl max-h-[94vh] overflow-y-auto bg-[#0a0e17] border border-blue-500/50 rounded-[4px] p-4 sm:p-7 shadow-2xl space-y-4 my-auto">
            {/* Modal Header & Timer Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-blue-500/20 text-blue-400 border border-blue-500/40 rounded-[2px] shrink-0">
                  <Presentation className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <span>Verxl Protocol 5-Minute Pitch</span>
                    <span className="text-[10px] text-emerald-400 font-mono">
                      {currentPitchSlide + 1} / {PITCH_SLIDES.length}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Šimon Havlík · Started as an academic university project at VŠE Prague
                  </div>
                </div>
              </div>

              {/* Timer & Presenter Action Buttons */}
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                {/* 5-Min Timer */}
                <div className="flex items-center gap-1.5 bg-[#05070b] border border-slate-700 px-2 py-1 rounded-[2px] font-mono text-xs">
                  <Clock className="w-3 h-3 text-amber-400" />
                  <span className={pitchTimer < 60 ? "text-rose-400 font-bold animate-pulse" : "text-white font-bold"}>
                    {Math.floor(pitchTimer / 60)}:{String(pitchTimer % 60).padStart(2, "0")}
                  </span>
                  <button
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                    className="ml-1 text-[10px] text-blue-400 hover:text-white uppercase"
                  >
                    {isTimerRunning ? "Pause" : "Start"}
                  </button>
                  <button
                    onClick={() => { setPitchTimer(300); setIsTimerRunning(false); }}
                    className="text-[10px] text-slate-500 hover:text-slate-300 uppercase"
                  >
                    Reset
                  </button>
                </div>

                <a
                  href="/Verxl_Protocol_Pitch_Presentation.pptx"
                  download="Verxl_Protocol_Pitch_Presentation.pptx"
                  className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] uppercase tracking-wider rounded-[2px] flex items-center gap-1 transition"
                >
                  <Download className="w-3 h-3" />
                  <span>PPTX</span>
                </a>

                <button
                  onClick={() => setShowPitchDeckModal(false)}
                  className="text-slate-400 hover:text-white text-xs uppercase px-1.5 py-1"
                >
                  ✕ Close
                </button>
              </div>
            </div>

            {/* Slide Navigation Dots / Timeline Bar */}
            <div className="flex sm:grid sm:grid-cols-7 gap-1.5 overflow-x-auto pb-1.5 no-scrollbar touch-pan-x">
              {PITCH_SLIDES.map((slide, idx) => (
                <button
                  key={slide.id}
                  onClick={() => setCurrentPitchSlide(idx)}
                  className={`py-1.5 px-2 text-[9px] font-mono rounded-[2px] border text-center transition shrink-0 min-w-[76px] sm:min-w-0 ${
                    currentPitchSlide === idx
                      ? "bg-blue-600 text-white border-blue-400 font-bold shadow"
                      : "bg-[#05070b] text-slate-400 border-slate-800 hover:text-slate-200"
                  }`}
                >
                  <span>Step {idx + 1}</span>
                  <div className="text-[7.5px] truncate opacity-75">{slide.badge.split(". ")[1] || slide.badge}</div>
                </button>
              ))}
            </div>

            {/* Active Slide Body */}
            {(() => {
              const activeSlide = PITCH_SLIDES[currentPitchSlide];
              return (
                <div className="bg-[#05070b] border border-blue-500/30 rounded-[3px] p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest font-mono">
                        {activeSlide.badge}
                      </span>
                      <h2 className="text-base sm:text-lg font-black text-white">
                        {activeSlide.title}
                      </h2>
                      <div className="text-xs text-slate-400 font-sans">
                        {activeSlide.subtitle}
                      </div>
                    </div>
                    <span className="text-[10px] text-amber-400 border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 rounded-[2px] font-mono shrink-0">
                      ⏱ Time: {activeSlide.timeEstimate}
                    </span>
                  </div>

                  {/* 3 Core Beat Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {activeSlide.bullets.map((b, idx) => (
                      <div key={idx} className="bg-[#0a0e17] border border-slate-800 p-3 rounded-[2px] space-y-1">
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span>{b.title}</span>
                        </div>
                        <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                          {b.desc}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Quantitative Financial Metric Banner */}
                  <div className="bg-gradient-to-r from-emerald-950/30 via-[#0a0e17] to-blue-950/30 border border-emerald-500/40 rounded-[2px] p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div>
                      <div className="text-[9.5px] uppercase tracking-wider text-slate-400 font-mono">
                        {activeSlide.financeMetric.label}
                      </div>
                      <div className="text-base sm:text-lg font-black text-emerald-400 font-mono">
                        {activeSlide.financeMetric.value}
                      </div>
                    </div>
                    <div className="text-[10.5px] text-slate-300 font-sans max-w-md text-left sm:text-right">
                      {activeSlide.financeMetric.desc}
                    </div>
                  </div>

                  {/* Speaker Script Box (Timed Speech Guidance) */}
                  <div className="border border-slate-800 bg-[#070b13] p-3.5 rounded-[2px] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Terminal className="w-3 h-3" />
                        <span>Speaker Script (Šimon Havlík · 5-Minute Delivery)</span>
                      </div>
                      <button
                        onClick={() => setShowSpeakerNotes(!showSpeakerNotes)}
                        className="text-[10px] text-slate-400 hover:text-white uppercase flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>{showSpeakerNotes ? "Hide Notes" : "Show Notes"}</span>
                      </button>
                    </div>
                    {showSpeakerNotes && (
                      <p className="text-xs text-slate-200 font-sans leading-relaxed italic border-l-2 border-amber-400 pl-3">
                        "{activeSlide.speakerScript}"
                      </p>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Slide Navigation Footer Controls */}
            <div className="flex items-center justify-between border-t border-slate-800 pt-3">
              <button
                onClick={() => setCurrentPitchSlide((prev) => Math.max(0, prev - 1))}
                disabled={currentPitchSlide === 0}
                className="px-3 py-1.5 bg-[#05070b] border border-slate-700 hover:border-slate-500 disabled:opacity-40 text-xs font-bold uppercase tracking-wider text-white rounded-[2px] flex items-center gap-1.5 transition"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous Beat</span>
              </button>

              <div className="text-xs text-slate-400 font-mono">
                {currentPitchSlide + 1} of {PITCH_SLIDES.length}
              </div>

              <button
                onClick={() => setCurrentPitchSlide((prev) => Math.min(PITCH_SLIDES.length - 1, prev + 1))}
                disabled={currentPitchSlide === PITCH_SLIDES.length - 1}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-xs font-bold uppercase tracking-wider text-white rounded-[2px] flex items-center gap-1.5 transition"
              >
                <span>Next Beat</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
