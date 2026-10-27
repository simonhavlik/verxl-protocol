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
    tagline: "Stateless non-custodial router exemption under EU MiCA & GDPR Article 17 compliance.",
    color: "#34d399",
    bgRgb: "rgba(52, 211, 153, 0.1)",
    borderColor: "rgba(52, 211, 153, 0.4)",
    coords: { x: 400, y: 270 },
    kpis: [
      { label: "MiCA Status", value: "Non-Custodial Exempt" },
      { label: "GDPR Compliance", value: "Zero Retention" },
      { label: "Settlement Asset", value: "Regulated Circle USDC" },
    ],
    details: "Verxl operates solely as a technical routing switch without custody of fiat or crypto deposits. In-transit ephemeral payload streaming satisfies GDPR and EU AI Act Article 50 disclosure covenants.",
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
      "Good morning. I'm Simon Havlík from the Faculty of International Relations at VŠE. Today, I'm presenting Verxl Protocol: a capital-light, decentralized clearing switch for global AI inference. Hyperscalers like AWS and OpenAI operate like feudal landlords, charging 80 to 90% gross margins on raw GPU silicon while independent European datacenters sit with idle GPUs. Verxl replaces this broken paradigm with a stateless, 50 basis point clearing switch.",
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
    badge: "4. SYSTEMS ARCHITECTURE & FOUNDER ROLE",
    title: "Full-Stack Protocol Architecture: Contracts, Edge & Cryptography",
    subtitle: "Simon Havlík — Founder, Quantitative Systems Designer & Protocol Engineer",
    timeEstimate: "2:15 - 3:00",
    bullets: [
      { title: "Aragon OSx On-Chain DAO", desc: "Engineered smart contracts on Ethereum & Arbitrum for $VRXL staking, collateral vaults, and 10% slashing." },
      { title: "Stateless Cloudflare Edge Router", desc: "Engineered sub-4ms routing switch with seed=42 deterministic canary probes auditing node output." },
      { title: "Charizard PostgreSQL Financial Ledger", desc: "Designed strict schema-isolated ledger (`verxl.*`), PBKDF2 password hashing, and RFC 6238 TOTP 2FA." },
    ],
    financeMetric: {
      label: "End-to-End Edge Routing Latency",
      value: "3.8 ms Overhead",
      desc: "Measured edge proxy latency with zero-overhead tunnels to bare-metal clusters.",
    },
    speakerScript:
      "My role is that of founder, full-stack quantitative architect, and systems engineer. I personally built all four layers of this protocol: the Aragon OSx governance contracts, the sub-4ms stateless edge router, the PostgreSQL transaction ledger on Charizard with RFC 6238 2FA security, and our bare-metal Vulkan cluster in Prague. This is live, running software tested in production.",
  },
  {
    id: 5,
    badge: "5. UNIT ECONOMICS & SCALABILITY",
    title: "Compounding Financial Velocity: $3.6M/yr Net Take at 1T Tokens",
    subtitle: "High-volume micro-clearing that scales non-linearly with global AI demand",
    timeEstimate: "3:00 - 3:45",
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
    timeEstimate: "3:45 - 4:20",
    bullets: [
      { title: "MiCA Non-Custodial Immunity", desc: "Under EU MiCA, purely technical non-custodial routers do not hold customer funds and are exempt from CASP licensing." },
      { title: "Stateless In-Transit Streaming", desc: "Inference prompts and completions stream through RAM without persistent disk storage, satisfying GDPR and EU AI Act Article 50." },
      { title: "Decentralized DAO Governance", desc: "Fee parameters and slashing audits are governed exclusively by Aragon OSx consensus, eliminating centralized issuer liabilities." },
    ],
    financeMetric: {
      label: "EU MiCA Compliance Status",
      value: "Non-Custodial Exempt",
      desc: "Zero custody of user funds; direct smart contract escrows on Arbitrum L2.",
    },
    speakerScript:
      "Equally vital is legal defensibility under European law. Under the EU MiCA framework, Verxl is strictly non-custodial. We do not intermediate fiat, hold custody of deposits, or execute discretionary trades. Furthermore, because our edge router streams data without storing prompts on disk, we have complete GDPR and EU AI Act compliance. This creates an unassailable institutional moat.",
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
            <span>VŠE Praha (2SE307)</span>
            <span className="text-slate-700">|</span>
            <span className="text-emerald-400 font-semibold">SB 235 · M. Bok</span>
          </div>
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

          {/* Right Column: Founder Portrait in FULL VIBRANT COLOR */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-sm bg-[#05070b]/95 border-2 border-blue-500/50 rounded-[4px] p-3.5 shadow-2xl space-y-3 relative backdrop-blur-md group hover:border-blue-400 transition-all duration-300">
              {/* Top Card Badge */}
              <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">
                <span className="text-blue-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                  Lead Protocol Architect
                </span>
                <span className="text-slate-300">VŠE Praha · 2SE307</span>
              </div>

              {/* Full Color Pudong Photo Frame */}
              <div className="relative aspect-[4/5] overflow-hidden rounded-[2px] border border-slate-700 shadow-inner">
                <img
                  src="/simon-pudong.jpg"
                  alt="Šimon Havlík in Pudong, Shanghai"
                  className="w-full h-full object-cover transition duration-700 transform group-hover:scale-105"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#05070b] via-transparent to-transparent opacity-75" />

                <div className="absolute bottom-3 left-3 right-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-extrabold text-white uppercase tracking-wider">
                      Šimon Havlík
                    </span>
                    <span className="px-1.5 py-0.5 rounded-[2px] bg-blue-600 text-white font-bold text-[9px] uppercase tracking-wider shadow">
                      Head Developer
                    </span>
                  </div>
                  <div className="text-[10.5px] text-slate-300 font-sans">
                    Project Lead · Smart Contract & Clearinghouse Architect
                  </div>
                  <div className="text-[9px] text-blue-300 font-mono flex items-center justify-between pt-0.5">
                    <span>Pudong, Shanghai</span>
                    <span>33.34% Genesis Voting Tranche</span>
                  </div>
                </div>
              </div>

              {/* Bottom Card Footer */}
              <div className="px-1 text-[10.5px] text-slate-300 flex items-center justify-between font-mono">
                <span className="text-slate-400">Bitcoin & Blockchain Practical Seminar</span>
                <span className="text-emerald-400 font-bold">Room SB 235</span>
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
              Founded at Prague University of Economics and Business (VŠE Praha) · Course 2SE307 Bitcoin and Blockchain.
            </p>
          </div>
          <span className="text-[10px] text-emerald-400 font-bold font-mono">
            Instructor: M. Bok · Room SB 235
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Šimon Havlík (Project Lead & Head Developer) in FULL COLOR */}
          <div className="bg-[#0a0e17] border-2 border-blue-500/50 rounded-[4px] p-4 space-y-3.5 shadow-xl flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-[3px] overflow-hidden border-2 border-blue-500/60 shadow-lg shrink-0">
                  <img
                    src="/simon-pudong.jpg"
                    alt="Šimon Havlík"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-extrabold text-white uppercase tracking-wider">
                      Šimon Havlík
                    </span>
                  </div>
                  <div className="text-[10.5px] text-blue-400 font-bold">
                    Project Lead & Head Developer
                  </div>
                  <div className="text-[9.5px] text-slate-400 font-mono">
                    Lead Protocol Architect
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                Led end-to-end design and coding of the decentralized clearing architecture: Aragon OSx DAO settlement on Ethereum Sepolia, the <code className="text-blue-300">VerxlStakingRegistry.sol</code> smart contract, deterministic <code className="text-blue-300">seed=42</code> invariant verification, and the Arbitrum One USDC clearing pipeline.
              </p>
            </div>

            <div className="border-t border-slate-800/80 pt-2.5 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Team Captain · 33.34% Tranche</span>
              </span>
              <span className="text-slate-300">VŠE Lead</span>
            </div>
          </div>

          {/* Card 2: Quality Assurance & Process Verification Lead */}
          <div className="bg-[#0a0e17] border border-blue-500/25 rounded-[4px] p-4 space-y-3.5 shadow-md flex flex-col justify-between relative overflow-hidden">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-[3px] bg-[#05070b] border border-blue-500/30 flex flex-col items-center justify-center text-slate-400 shrink-0 relative overflow-hidden shadow-inner">
                  <ShieldCheck className="w-6 h-6 text-blue-400 mb-0.5" />
                  <span className="text-[6.5px] text-blue-300 font-mono tracking-tight font-bold uppercase">PORTRAIT PENDING</span>
                  <span className="text-[6px] text-slate-400 font-mono tracking-tighter">VŠE 2SE307</span>
                </div>
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <span>Quality Control Lead</span>
                    <span className="px-1 py-0.1 text-[8px] bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded-[2px]">2SE307</span>
                  </div>
                  <div className="text-[10.5px] text-blue-400 font-bold">
                    Quality Assurance & Process Verification
                  </div>
                  <div className="text-[9.5px] text-slate-400 font-mono">
                    Founding Partner · VŠE Praha
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                Directs protocol quality control frameworks, independent process audit verification, and empirical SLA benchmarking across European compute hosting providers. Establishes verification methodologies ensuring deterministic output fidelity, Time-to-First-Token (TTFT) compliance, and academic evaluation rigor.
              </p>
            </div>

            <div className="border-t border-slate-800/80 pt-2.5 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Founding Partner · 33.33% Tranche</span>
              </span>
              <span className="text-slate-400">Quality & Audit Lead</span>
            </div>
          </div>

          {/* Card 3: Regulatory Compliance & Market Research Officer */}
          <div className="bg-[#0a0e17] border border-purple-500/25 rounded-[4px] p-4 space-y-3.5 shadow-md flex flex-col justify-between relative overflow-hidden">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-[3px] bg-[#05070b] border border-purple-500/30 flex flex-col items-center justify-center text-slate-400 shrink-0 relative overflow-hidden shadow-inner">
                  <Compass className="w-6 h-6 text-purple-400 mb-0.5" />
                  <span className="text-[6.5px] text-purple-300 font-mono tracking-tight font-bold uppercase">PORTRAIT PENDING</span>
                  <span className="text-[6px] text-slate-400 font-mono tracking-tighter">VŠE 2SE307</span>
                </div>
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <span>Compliance & Vision Lead</span>
                    <span className="px-1 py-0.1 text-[8px] bg-purple-500/10 text-purple-400 border border-purple-500/30 rounded-[2px]">2SE307</span>
                  </div>
                  <div className="text-[10.5px] text-purple-400 font-bold">
                    Regulatory Compliance & Market Research
                  </div>
                  <div className="text-[9.5px] text-slate-400 font-mono">
                    Founding Partner · VŠE Praha
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                Heads competitive market intelligence, macroeconomic cost benchmarking against legacy centralized cloud aggregators, and regulatory compliance alignment (EU AI Act &amp; MiCA non-custodial boundaries). Oversees institutional risk governance, charter alignment, and stakeholder relations for enterprise compute buyers.
              </p>
            </div>

            <div className="border-t border-slate-800/80 pt-2.5 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Founding Partner · 33.33% Tranche</span>
              </span>
              <span className="text-slate-400">Compliance & Strategy Lead</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-3 sm:p-6 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-4xl bg-[#0a0e17] border border-blue-500/50 rounded-[4px] p-5 sm:p-7 shadow-2xl space-y-4 my-6">
            {/* Modal Header & Timer Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-blue-500/20 text-blue-400 border border-blue-500/40 rounded-[2px]">
                  <Presentation className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <span>Verxl Protocol 5-Minute Investor & Committee Pitch</span>
                    <span className="text-[10px] text-emerald-400 font-mono">
                      Slide {currentPitchSlide + 1} / {PITCH_SLIDES.length}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Simon Havlík · VŠE Prague (2SE307 Bitcoin & Blockchain · M. Bok)
                  </div>
                </div>
              </div>

              {/* Timer & Presenter Action Buttons */}
              <div className="flex items-center gap-2">
                {/* 5-Min Timer */}
                <div className="flex items-center gap-1.5 bg-[#05070b] border border-slate-700 px-2.5 py-1 rounded-[2px] font-mono text-xs">
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
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] uppercase tracking-wider rounded-[2px] flex items-center gap-1 transition"
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
            <div className="grid grid-cols-7 gap-1.5">
              {PITCH_SLIDES.map((slide, idx) => (
                <button
                  key={slide.id}
                  onClick={() => setCurrentPitchSlide(idx)}
                  className={`py-1.5 px-2 text-[9px] font-mono rounded-[2px] border text-center transition ${
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
                        <span>Speaker Script (Simon Havlík · 5-Minute Delivery)</span>
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
    </div>
  );
};
