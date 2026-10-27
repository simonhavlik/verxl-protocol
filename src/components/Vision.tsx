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
  coreDeliverables: string[];
  techStack: string[];
  colorHex: string;
  orbitInclination: number;
}

const HORIZONS: HorizonPhase[] = [
  {
    id: "h1",
    horizon: "Horizon 1",
    phaseName: "Live Non-Custodial Pilot",
    quarter: "Q4 2026",
    status: "OPERATIONAL",
    progressPct: 100,
    tagline: "Stateless 50 bps edge clearing switch, seed=42 invariant probing, and Aragon OSx DAO settlement on Ethereum Sepolia & Arbitrum.",
    coreDeliverables: [
      "Dual-redundant tunnel routing (Charizard IONOS port 11645 + Cloudflare Edge)",
      "Bare-metal Prague GPU host (Bulbasaur Qwen 3.5 4B Uncensored 8k/32k)",
      "Official public API bridges for Xiaomi Mi MIMO 2.6 Flash/Pro & DeepSeek v4.1",
      "Automated 10% collateral slashing via VerxlStakingRegistry smart contract",
      "Passwordless institutional email OTP auth via automated@verxl.com on Seznam SMTP",
      "Arbitrum USDC deposit clearing and provider payout settlement (min $1.00 USD)",
    ],
    techStack: ["Ethereum Sepolia", "Arbitrum One / Sepolia", "Aragon OSx", "Cloudflare D1 / Workers", "socat Tunnel", "Vulkan GPU"],
    colorHex: "#10b981", // Emerald
    orbitInclination: 0.35,
  },
  {
    id: "h2",
    horizon: "Horizon 2",
    phaseName: "State Channels & zk-Attestation",
    quarter: "Q1–Q3 2027",
    status: "IN_DEVELOPMENT",
    progressPct: 40,
    tagline: "Dynamic bilateral micro-streaming state channels allowing continuous token-by-token settlement without gas friction, coupled with lightweight zk-STARK compute proofs.",
    coreDeliverables: [
      "Bilateral state-channel escrows for per-token streaming clearing",
      "Lightweight zero-knowledge output attestation (zk-STARK execution trace proofs)",
      "Automated provider node registration CLI with one-click Docker daemon",
      "Fractional community staking pools backing verified independent hosts",
      "Continuous hardware performance indexing (TTFT, memory bandwidth, thermal drift)",
      "Dynamic gas-minimized settlement batching to Arbitrum L2 rollup",
    ],
    techStack: ["zk-STARK Proofs", "State Channels", "Docker Daemon CLI", "Arbitrum Nitro", "EigenLayer AVS (Research)", "OpenAPI 3.1"],
    colorHex: "#3b82f6", // Electric Blue
    orbitInclination: -0.55,
  },
  {
    id: "h3",
    horizon: "Horizon 3",
    phaseName: "Sovereign Autonomous Agent Grid",
    quarter: "2027+",
    status: "PLANNED",
    progressPct: 15,
    tagline: "Peer-to-peer libp2p agent swarms clearing machine-to-machine inference transactions without humans, credit cards, or centralized banking rails.",
    coreDeliverables: [
      "P2P libp2p mesh routing replacing centralized reverse proxy infrastructure",
      "Autonomous AI agent swarms autonomously negotiating spot compute contracts",
      "Secondary compute mobilization (enterprise co-los, datacenters, amortized mining rigs)",
      "Cross-chain liquidity routing via LayerZero and Chainlink CCIP",
      "Self-sovereign cryptographic node identities (ERC-721 hardware attestations)",
      "Complete immutable governance handoff to on-chain $VRXL holders",
    ],
    techStack: ["libp2p Mesh", "ERC-721 Node IDs", "LayerZero CCIP", "Autonomous AI Agents", "Decentralized Physical Infra (DePIN)"],
    colorHex: "#a855f7", // Purple
    orbitInclination: 1.15,
  },
];

export const Vision: React.FC<VisionProps> = ({ onNavigate }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Active Horizon selection in interactive roadmap
  const [selectedHorizon, setSelectedHorizon] = useState<string>("h1");
  const activePhase = HORIZONS.find((h) => h.id === selectedHorizon) || HORIZONS[0];

  // Mouse interaction state for 3D parallax
  const mousePos = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

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
    scene.fog = new THREE.FogExp2(0x05070b, 0.05);

    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 7.2);

    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // 1. Central Geodesic Settlement Engine Core
    const coreGeo = new THREE.IcosahedronGeometry(1.15, 1);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x3b82f6,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    rootGroup.add(coreMesh);

    // Inner glowing core
    const innerCoreGeo = new THREE.OctahedronGeometry(0.65, 0);
    const innerCoreMat = new THREE.MeshBasicMaterial({
      color: 0x60a5fa,
      wireframe: true,
      transparent: true,
      opacity: 0.65,
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
        grad.addColorStop(0.3, "rgba(59, 130, 246, 0.8)");
        grad.addColorStop(0.7, "rgba(37, 99, 235, 0.2)");
        grad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 64, 64);
      }
      const tex = new THREE.CanvasTexture(c);
      tex.needsUpdate = true;
      return tex;
    };

    // 3. Decentralized Host Constellation Nodes
    const nodeCount = 260;
    const nodePositions = new Float32Array(nodeCount * 3);
    const nodeVectors: THREE.Vector3[] = [];

    for (let i = 0; i < nodeCount; i++) {
      const phi = Math.acos(-1 + (2 * i) / nodeCount);
      const theta = Math.sqrt(nodeCount * Math.PI) * phi;
      const radius = 2.4 + Math.random() * 0.9;

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
      size: 0.18,
      map: createNodeSprite("#93c5fd"),
      transparent: true,
      opacity: 0.9,
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
      opacity: 0.22,
      blending: THREE.AdditiveBlending,
    });
    const lineMesh = new THREE.LineSegments(lineGeo, lineMat);
    rootGroup.add(lineMesh);

    // 5. Three Inclined Architectural Horizon Rings
    const createHorizonRing = (radius: number, color: number, inclination: number, thickness: number) => {
      const ringGroup = new THREE.Group();
      ringGroup.rotation.x = inclination;

      const curve = new THREE.EllipseCurve(0, 0, radius, radius * 0.95, 0, 2 * Math.PI, false, 0);
      const pts = curve.getPoints(96);
      const ringGeo = new THREE.BufferGeometry().setFromPoints(
        pts.map((p) => new THREE.Vector3(p.x, 0, p.y))
      );
      const ringMat = new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity: 0.5,
      });
      const ringLine = new THREE.Line(ringGeo, ringMat);
      ringGroup.add(ringLine);

      // Orbital circulating packet
      const packetGeo = new THREE.SphereGeometry(thickness, 8, 8);
      const packetMat = new THREE.MeshBasicMaterial({ color, wireframe: false });
      const packetMesh = new THREE.Mesh(packetGeo, packetMat);
      ringGroup.add(packetMesh);

      return { ringGroup, packetMesh, radius };
    };

    // Horizon 1: Green Live Pilot Ring
    const h1Orbit = createHorizonRing(3.1, 0x10b981, 0.45, 0.06);
    rootGroup.add(h1Orbit.ringGroup);

    // Horizon 2: Blue State Channels Ring
    const h2Orbit = createHorizonRing(3.6, 0x3b82f6, -0.65, 0.05);
    rootGroup.add(h2Orbit.ringGroup);

    // Horizon 3: Purple Sovereign Agent Grid Ring
    const h3Orbit = createHorizonRing(4.1, 0xa855f7, 1.25, 0.07);
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
      const t = clock.getElapsedTime();

      // Smooth mouse lerp
      mousePos.current.x += (mousePos.current.targetX - mousePos.current.x) * 0.05;
      mousePos.current.y += (mousePos.current.targetY - mousePos.current.y) * 0.05;

      // Group rotation
      rootGroup.rotation.y = t * 0.12 + mousePos.current.x;
      rootGroup.rotation.x = Math.sin(t * 0.08) * 0.1 + mousePos.current.y * 0.5;

      // Core pulsing
      const coreScale = 1 + Math.sin(t * 2) * 0.06;
      coreMesh.scale.set(coreScale, coreScale, coreScale);
      coreMesh.rotation.y = -t * 0.25;
      coreMesh.rotation.z = t * 0.15;

      innerCoreMesh.rotation.x = t * 0.4;
      innerCoreMesh.rotation.y = t * 0.3;

      // Orbit packet motions
      const a1 = t * 0.8;
      h1Orbit.packetMesh.position.set(Math.cos(a1) * h1Orbit.radius, 0, Math.sin(a1) * h1Orbit.radius * 0.95);

      const a2 = -t * 0.65;
      h2Orbit.packetMesh.position.set(Math.cos(a2) * h2Orbit.radius, 0, Math.sin(a2) * h2Orbit.radius * 0.95);

      const a3 = t * 0.5;
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
    };
  }, []);

  return (
    <div className="space-y-8 font-mono text-slate-200">
      {/* Top Academic Breadcrumb & Course Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-500/15 pb-2.5">
        <div className="flex items-center gap-2 text-xs">
          <Compass className="w-3.5 h-3.5 text-blue-400" />
          <span className="font-semibold text-white uppercase tracking-wider">
            Architecture Vision & Protocol Roadmap
          </span>
          <span className="text-slate-400">·</span>
          <span className="text-blue-400 text-[11px]">2026–2028</span>
        </div>
        <div className="text-[10px] text-slate-400 flex items-center gap-2">
          <span>Prague University of Economics and Business (VŠE Praha)</span>
          <span className="text-slate-700">|</span>
          <span>2SE307 Bitcoin & Blockchain</span>
          <span className="text-slate-700">|</span>
          <span className="text-emerald-400 font-semibold">SB 235 · M. Bok</span>
        </div>
      </div>

      {/* HERO SECTION WITH THREE.JS INTERACTIVE 3D MACHINE INTELLIGENCE HYPER-LATTICE */}
      <div
        ref={containerRef}
        className="relative min-h-[520px] lg:min-h-[580px] bg-[#070b13] border border-blue-500/30 rounded-[4px] p-6 sm:p-8 lg:p-10 shadow-2xl overflow-hidden flex flex-col justify-between"
      >
        {/* Three.js 3D WebGL Canvas Background */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-80"
        />

        {/* Cybernetic Ambient Glow Gradient Overlays */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#070b13]/90 via-[#070b13]/70 to-transparent pointer-events-none z-0" />

        {/* Top Badges Row */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[2px] bg-blue-500/10 border border-blue-500/30 text-[11px] text-blue-400 uppercase tracking-wider backdrop-blur-sm shadow-sm">
            <span className="w-2 h-2 status-dot bg-blue-400 animate-pulse" />
            <span>Interactive 3D Machine Intelligence Clearing Lattice</span>
          </div>

          <div className="flex items-center gap-2 text-[10px]">
            <span className="px-2 py-0.5 rounded-[2px] bg-[#05070b]/90 border border-slate-700 text-slate-300 backdrop-blur-sm">
              50 bps Fixed Switch
            </span>
            <span className="px-2 py-0.5 rounded-[2px] bg-[#05070b]/90 border border-emerald-500/40 text-emerald-400 backdrop-blur-sm">
              Zero Custodial Float
            </span>
            <span className="px-2 py-0.5 rounded-[2px] bg-[#05070b]/90 border border-purple-500/40 text-purple-300 backdrop-blur-sm">
              Ethereum Sepolia + Arbitrum L2
            </span>
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
              Verxl replaces the intermediary with an automated 50 bps non-custodial clearing switch and cryptographic performance bonding on Ethereum Sepolia and Arbitrum. Independent GPU clusters and enterprise consumers transact directly at near-zero marginal friction.
            </p>

            {/* Core Covenants Badges */}
            <div className="flex flex-wrap gap-2 pt-2 text-[11px]">
              <div className="px-2.5 py-1 rounded-[2px] bg-[#05070b]/80 border border-slate-800 text-slate-300 backdrop-blur-sm flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-blue-400" />
                <span>Agency Over Principal</span>
              </div>
              <div className="px-2.5 py-1 rounded-[2px] bg-[#05070b]/80 border border-slate-800 text-slate-300 backdrop-blur-sm flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Deterministic Slashing (10%)</span>
              </div>
              <div className="px-2.5 py-1 rounded-[2px] bg-[#05070b]/80 border border-slate-800 text-slate-300 backdrop-blur-sm flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>50 bps Hardcoded Rate</span>
              </div>
            </div>
          </div>

          {/* Right Column: Founder Portrait in FULL VIBRANT COLOR */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-sm bg-[#05070b]/95 border-2 border-blue-500/50 rounded-[4px] p-3 shadow-2xl space-y-3 relative backdrop-blur-md group hover:border-blue-400 transition-all duration-300">
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
                {/* Subtle vignette gradient only at very bottom for label legibility */}
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
                  <div className="text-[10px] text-slate-300 font-sans">
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

        {/* Bottom Three.js Dynamic Status Ticker */}
        <div className="relative z-10 border-t border-slate-800/80 pt-3 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>WebGL Engine Active: <strong className="text-slate-200">260 Distributed Clusters Mapped</strong></span>
          </div>
          <div className="flex items-center gap-4 text-[10.5px]">
            <span>Orbit Green: <strong className="text-emerald-400">Horizon 1 Live</strong></span>
            <span>Orbit Blue: <strong className="text-blue-400">Horizon 2 Channels</strong></span>
            <span>Orbit Purple: <strong className="text-purple-400">Horizon 3 Sovereign</strong></span>
          </div>
        </div>
      </div>

      {/* CORE PROTOCOL PREMISE QUOTE BANNER */}
      <div className="bg-[#05070b] border-l-4 border-blue-500 p-5 rounded-[2px] shadow-lg relative overflow-hidden">
        <div className="relative z-10 space-y-1.5">
          <div className="text-blue-400 font-bold uppercase tracking-wider text-xs flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The Fundamental Protocol Axiom</span>
          </div>
          <p className="text-xs sm:text-[13.5px] text-slate-200 leading-relaxed font-sans">
            Every centralized model aggregator is an unnecessary counterparty credit risk and an institutional margin tax. Verxl strips out the middleman, binds independent compute hosts with on-chain collateral, and settles inference atomically at cost.
          </p>
        </div>
      </div>

      {/* FANCY EXECUTIVE THREE-HORIZON ROADMAP WITH INTERACTIVE CIRCUIT SELECTOR */}
      <div className="space-y-4 bg-[#0a0e17] border border-blue-500/20 rounded-[4px] p-5 sm:p-7 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="space-y-0.5">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" />
              <span>Executive Three-Horizon Architectural Roadmap</span>
            </h2>
            <p className="text-[11px] text-slate-400 font-sans">
              Strategic execution timeline spanning live testnet pilot, state-channel attestation, and the sovereign machine grid.
            </p>
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            <span>Current Stage: </span>
            <span className="text-emerald-400 font-bold">Horizon 1 Shipped</span>
          </div>
        </div>

        {/* Phase Timeline Spine Track */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          {HORIZONS.map((h) => {
            const isSelected = selectedHorizon === h.id;
            return (
              <button
                key={h.id}
                onClick={() => setSelectedHorizon(h.id)}
                className={`p-4 rounded-[3px] border text-left transition-all relative overflow-hidden ${
                  isSelected
                    ? "bg-[#0c1424] border-blue-500 shadow-lg shadow-blue-500/10"
                    : "bg-[#05070b] border-slate-800 hover:border-slate-700"
                }`}
              >
                {/* Top Header of Card */}
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider mb-2">
                  <span
                    style={{ color: h.colorHex }}
                    className="flex items-center gap-1.5"
                  >
                    <span>{h.horizon}</span>
                    <span className="text-slate-400 font-normal">·</span>
                    <span className="text-slate-300">{h.quarter}</span>
                  </span>

                  <span
                    className={`px-1.5 py-0.5 rounded-[2px] text-[8.5px] font-bold border ${
                      h.status === "OPERATIONAL"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : h.status === "IN_DEVELOPMENT"
                        ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                        : "bg-purple-500/10 text-purple-400 border-purple-500/30"
                    }`}
                  >
                    {h.status}
                  </span>
                </div>

                <div className="text-xs font-bold text-white mb-2">
                  {h.phaseName}
                </div>

                {/* Progress Bar */}
                <div className="space-y-1 mb-2">
                  <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                    <span>Progress</span>
                    <span style={{ color: h.colorHex }} className="font-bold">
                      {h.progressPct}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${h.progressPct}%`,
                        backgroundColor: h.colorHex,
                      }}
                    />
                  </div>
                </div>

                <p className="text-[10.5px] text-slate-400 leading-relaxed font-sans line-clamp-2">
                  {h.tagline}
                </p>

                {isSelected && (
                  <div
                    className="absolute bottom-0 left-0 right-0 h-0.5"
                    style={{ backgroundColor: h.colorHex }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Horizon Deep-Dive Architectural Panel */}
        <div className="bg-[#05070b] border border-blue-500/30 rounded-[3px] p-5 space-y-4 mt-2 shadow-inner">
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
              <span className="text-[10px] text-slate-400">Architectural Status:</span>
              <span
                className="px-2 py-0.5 rounded-[2px] text-[9.5px] font-bold border"
                style={{
                  color: activePhase.colorHex,
                  borderColor: `${activePhase.colorHex}55`,
                  backgroundColor: `${activePhase.colorHex}15`,
                }}
              >
                {activePhase.status} ({activePhase.progressPct}%)
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              {activePhase.coreDeliverables.map((item, i) => (
                <div
                  key={i}
                  className="bg-[#080c14] border border-slate-800/80 rounded-[2px] p-2.5 flex items-start gap-2"
                >
                  <CheckCircle2
                    className="w-3.5 h-3.5 mt-0.5 shrink-0"
                    style={{ color: activePhase.colorHex }}
                  />
                  <span className="text-[11px] text-slate-300 font-sans">{item}</span>
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

      {/* PROTOCOL EXECUTIVE ASSEMBLY & PROJECT TEAM */}
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
                Led end-to-end design and coding of the decentralized clearing architecture: Aragon OSx DAO settlement on Ethereum Sepolia, the <code className="text-blue-300">VerxlStakingRegistry.sol</code> smart contract, deterministic <code className="text-blue-300">seed=42</code> invariant verification, and the Arbitrum USDC clearing pipeline.
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

      {/* ARCHITECTURAL DESIGN CONSTRAINTS */}
      <div className="bg-[#0a0e17] border border-blue-500/20 rounded-[3px] p-5 space-y-3 shadow-md">
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

      {/* EXECUTIVE NAVIGATION CTA BAR */}
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
