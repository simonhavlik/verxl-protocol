import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import {
  ArrowRight,
  Terminal,
  Cpu,
  ShieldCheck,
  Server,
  Activity,
  Sliders,
} from "lucide-react";
import { INITIAL_PROVIDERS, INITIAL_AUDIT_LOGS } from "../data/mockData";

interface HeroProps {
  onNavigate: (tab: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Walkthrough demo states
  const [activeTabIdx, setActiveTabIdx] = useState(0);
  const [activeStepIdx, setActiveStepIdx] = useState(0);
  const [stepProgress, setStepProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Fast Fee Calculator State (in millions of tokens per month)
  const [calcTokensMillions, setCalcTokensMillions] = useState(500);

  // Live token stream animation state in Stage 3
  const [streamedText, setStreamedText] = useState("");
  const fullSampleText =
    "Inference stream routed via Cloudflare Edge to Prague Tier-3 Cluster (8x NVIDIA H100 SXM5). Token fidelity verified against FP16 ground truth with 99.8% precision SLA. Protocol fee settled: 50 bps.";

  const stages = [
    {
      k: "Step 01 · Ingest",
      t: "Client Payload Ingest",
      desc: "OpenAI SDK drop-in request received via /v1/chat/completions",
    },
    {
      k: "Step 02 · Route",
      t: "Cloudflare Edge Dispatch",
      desc: "Stateless P50 latency routing to optimal independent GPU host",
    },
    {
      k: "Step 03 · Stream",
      t: "Hardware Stream Execution",
      desc: "FP16 weight streaming directly to client with 48ms TTFT",
    },
    {
      k: "Step 04 · Clear",
      t: "Canary Oracle & Clearing",
      desc: "Seed-42 token distance verified & 50 bps fee deposited to Aragon vault",
    },
  ];

  // Auto-progress demo walkthrough
  useEffect(() => {
    if (isPaused) return;

    const stepDuration = 4500; // ms per step
    const intervalMs = 50;
    const progressIncrement = (intervalMs / stepDuration) * 100;

    const timer = setInterval(() => {
      setStepProgress((prev) => {
        if (prev >= 100) {
          setActiveStepIdx((s) => (s + 1) % stages.length);
          return 0;
        }
        return prev + progressIncrement;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPaused, stages.length]);

  // Handle stage 3 typing animation
  useEffect(() => {
    if (activeStepIdx === 2) {
      setStreamedText("");
      let curr = "";
      let i = 0;
      const typer = setInterval(() => {
        if (i < fullSampleText.length) {
          curr += fullSampleText[i];
          setStreamedText(curr);
          i++;
        } else {
          clearInterval(typer);
        }
      }, 18);
      return () => clearInterval(typer);
    }
  }, [activeStepIdx]);

  // Three.js WebGL Constellation and Orbital Rings (from Simon's Portfolio Optimizer)
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: window.innerWidth > 900,
      });
    } catch (e) {
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05070b, 0.08);

    const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 60);
    camera.position.set(0, 0, 5.8);

    const group = new THREE.Group();
    scene.add(group);

    const isSmall = window.innerWidth <= 720;
    const nodeCount = isSmall ? 180 : 380;

    // Golden angle nodes on sphere shell
    const vecs: THREE.Vector3[] = [];
    for (let i = 0; i < nodeCount; i++) {
      const y = 1 - (i / (nodeCount - 1)) * 2;
      const radius = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = i * 2.399963229728653; // golden angle
      const shell = 2.1 + Math.random() * 0.5;
      vecs.push(
        new THREE.Vector3(
          Math.cos(theta) * radius * shell,
          y * shell * 0.88,
          Math.sin(theta) * radius * shell
        )
      );
    }

    const positions = new Float32Array(vecs.length * 3);
    vecs.forEach((v, k) => {
      positions[k * 3] = v.x;
      positions[k * 3 + 1] = v.y;
      positions[k * 3 + 2] = v.z;
    });

    const pointsGeo = new THREE.BufferGeometry();
    pointsGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    // Radial gradient glow texture for nodes
    const makeSprite = () => {
      const c = document.createElement("canvas");
      c.width = c.height = 64;
      const ctx = c.getContext("2d");
      if (ctx) {
        const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        g.addColorStop(0, "rgba(96, 165, 250, 1)");
        g.addColorStop(0.35, "rgba(59, 130, 246, 0.75)");
        g.addColorStop(1, "rgba(59, 130, 246, 0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 64, 64);
      }
      const tex = new THREE.CanvasTexture(c);
      tex.needsUpdate = true;
      return tex;
    };

    const pointMat = new THREE.PointsMaterial({
      color: 0x60a5fa,
      size: 0.14,
      map: makeSprite(),
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });

    const points = new THREE.Points(pointsGeo, pointMat);
    group.add(points);

    // Constellation edges between near neighbours
    const linkPositions: number[] = [];
    const maxDist = isSmall ? 0.48 : 0.42;
    for (let a = 0; a < vecs.length; a++) {
      for (let b = a + 1; b < vecs.length; b++) {
        if (vecs[a].distanceToSquared(vecs[b]) < maxDist * maxDist) {
          linkPositions.push(vecs[a].x, vecs[a].y, vecs[a].z, vecs[b].x, vecs[b].y, vecs[b].z);
        }
      }
      if (linkPositions.length > 7500) break;
    }

    const linkGeo = new THREE.BufferGeometry();
    linkGeo.setAttribute("position", new THREE.Float32BufferAttribute(linkPositions, 3));
    const links = new THREE.LineSegments(
      linkGeo,
      new THREE.LineBasicMaterial({
        color: 0x2563eb,
        transparent: true,
        opacity: 0.22,
        depthWrite: false,
      })
    );
    group.add(links);

    // Orbital rings in electric cobalt
    const rings: THREE.LineLoop[] = [];
    for (let r = 0; r < 3; r++) {
      const ringPts: THREE.Vector3[] = [];
      for (let s = 0; s <= 200; s++) {
        const t = (s / 200) * Math.PI * 2;
        ringPts.push(
          new THREE.Vector3(
            Math.cos(t) * (2.65 + r * 0.16),
            0,
            Math.sin(t) * (2.65 + r * 0.16)
          )
        );
      }
      const ring = new THREE.LineLoop(
        new THREE.BufferGeometry().setFromPoints(ringPts),
        new THREE.LineBasicMaterial({
          color: 0x3b82f6,
          transparent: true,
          opacity: 0.24 - r * 0.05,
          depthWrite: false,
        })
      );
      ring.rotation.x = Math.PI / 2.3 + r * 0.18;
      ring.rotation.z = r * 0.45;
      rings.push(ring);
      group.add(ring);
    }

    // Interactive pointer parallax
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      pointer.tx = (e.clientX - rect.left) / Math.max(rect.width, 1) - 0.5;
      pointer.ty = (e.clientY - rect.top) / Math.max(rect.height, 1) - 0.5;
    };
    container.addEventListener("pointermove", onPointerMove, { passive: true });

    const resize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener("resize", resize);

    let rafId: number;
    const animate = (now: number) => {
      const t = now * 0.0001;
      pointer.x += (pointer.tx - pointer.x) * 0.05;
      pointer.y += (pointer.ty - pointer.y) * 0.05;

      group.rotation.y = t * 1.25 + pointer.x * 0.3;
      group.rotation.x = Math.sin(t * 0.5) * 0.08 - pointer.y * 0.16;

      rings.forEach((ring, k) => {
        ring.rotation.y = -t * (0.45 + k * 0.2);
        ring.rotation.z = k * 0.4 + Math.sin(t * 0.7 + k) * 0.05;
      });

      camera.position.x = pointer.x * 0.45;
      camera.position.y = -pointer.y * 0.35;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      container.removeEventListener("pointermove", onPointerMove);
      renderer.dispose();
    };
  }, []);

  return (
    <div ref={containerRef} className="hero-wrap relative">
      {/* Three.js Interactive Background Canvas */}
      <canvas ref={canvasRef} className="hero-webgl" aria-hidden="true" />

      {/* Atmospheric Shaders & Corner Brackets */}
      <div className="hero-veil" aria-hidden="true" />
      <div className="hero-grid" aria-hidden="true" />
      <div className="hero-light" aria-hidden="true">
        <b />
        <i />
      </div>
      <div className="hero-scan" aria-hidden="true" />
      <div className="hero-corners" aria-hidden="true">
        <i className="tl" />
        <i className="tr" />
        <i className="bl" />
        <i className="br" />
      </div>

      {/* Main Hero Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 sm:pt-6 pb-4 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-7 items-center">
          {/* Left Column: Copy & Actions */}
          <div className="lg:col-span-6 space-y-3">
            {/* Eyebrow with Radar Pulse Dot */}
            <div className="inline-flex items-center gap-1.5 font-mono text-[10.5px] tracking-wider uppercase text-slate-300 flex-wrap">
              <span className="radar-dot" aria-hidden="true" />
              <span className="font-semibold text-white">Verxl Protocol</span>
              <span className="text-slate-400">/</span>
              <span className="px-1.5 py-0.2 rounded-[2px] bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[9.5px] font-semibold tracking-wider">
                TEST RUN ON SEPOLIA
              </span>
              <span className="text-slate-400">/</span>
              <a
                href="https://app.aragon.org/dao/ethereum-sepolia/0xf0e51fB0FFBD8ef36281b6f643E0f7953BD5111a/proposals/VIP-1"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:text-emerald-300 transition"
              >
                VIP-1 Active
              </a>
            </div>

            {/* Main Headline */}
            <h1 className="text-2xl sm:text-3xl lg:text-[2.45rem] font-bold text-white tracking-tight leading-[1.08]">
              Non-Custodial{" "}
              <span className="accent-blue">AI Inference</span>{" "}
              at 50 bps Clearing
            </h1>

            {/* Subtitle */}
            <p className="text-xs sm:text-[13px] text-slate-300 leading-relaxed font-normal max-w-xl">
              Eliminate centralized SaaS rent extraction. While commercial aggregators mark up raw compute by{" "}
              <strong className="text-rose-400 font-mono">840–1,040 bps</strong>, Verxl routes inference
              statelessly to independent GPU clusters bonded by $VRXL staking collateral on Ethereum Sepolia testnet.
            </p>

            {/* Sharp Action Buttons — Strictly Square (rounded-[3px]), zero pills */}
            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              <button
                onClick={() => onNavigate("playground")}
                className="hero-btn hero-btn--primary"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Launch Inference Terminal</span>
                <ArrowRight className="w-3 h-3 ml-0.5" />
              </button>

              <button
                onClick={() => onNavigate("registry")}
                className="hero-btn hero-btn--ghost"
              >
                <Cpu className="w-3.5 h-3.5 text-blue-400" />
                <span>Compute Fleet</span>
              </button>

              <button
                onClick={() => onNavigate("whitepaper")}
                className="hero-btn hero-btn--ghost"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Whitepaper</span>
              </button>
            </div>

            {/* Institutional Stat Metrics Row */}
            <div className="grid grid-cols-4 gap-0 pt-2.5 border-t border-slate-800/80 font-mono">
              <div className="pr-2">
                <div className="text-base sm:text-xl font-bold text-white tracking-tight">
                  50 <span className="text-[10px] text-blue-400 font-normal">bps</span>
                </div>
                <div className="text-[9px] text-slate-400 uppercase tracking-wider mt-0.5">
                  Protocol Take
                </div>
              </div>

              <div className="px-2 border-l border-slate-800">
                <div className="text-base sm:text-xl font-bold text-white tracking-tight">
                  48 <span className="text-[10px] text-blue-400 font-normal">ms</span>
                </div>
                <div className="text-[9px] text-slate-400 uppercase tracking-wider mt-0.5">
                  P50 Latency
                </div>
              </div>

              <div className="px-2 border-l border-slate-800">
                <div className="text-base sm:text-xl font-bold text-white tracking-tight">
                  142<span className="text-[10px] text-slate-400 font-normal">k</span>
                </div>
                <div className="text-[9px] text-slate-400 uppercase tracking-wider mt-0.5">
                  $VRXL Bonded
                </div>
              </div>

              <div className="pl-2 border-l border-slate-800">
                <div className="text-base sm:text-xl font-bold text-emerald-400 tracking-tight">
                  100%
                </div>
                <div className="text-[9px] text-slate-400 uppercase tracking-wider mt-0.5">
                  Aragon OSx (Sepolia)
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Scripted Walkthrough Demo Window */}
          <div
            className="lg:col-span-6 relative"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div className="demo-glow" aria-hidden="true" />

            <div className="demo-window">
              {/* Window Titlebar */}
              <div className="demo-chrome">
                <div className="dots" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </div>
                <div className="addr">
                  <span className="text-blue-400">https://</span>verxl.com/v1/chat/completions
                </div>
                <div className="live">
                  <i />
                  <span className="text-amber-400">SEPOLIA TEST RUN</span>
                </div>
              </div>

              {/* Product Navigation Tabs */}
              <div className="demo-tabs" role="tablist">
                {["Inference Router", "Compute Fleet", "Quality Oracle", "DAO Clearing"].map(
                  (label, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setActiveTabIdx(idx);
                        setActiveStepIdx(idx);
                        setStepProgress(0);
                      }}
                      className={`d-tab ${activeTabIdx === idx ? "is-active" : ""}`}
                    >
                      {label}
                    </button>
                  )
                )}
              </div>

              {/* 4-Step Progress Bar */}
              <div className="demo-steps">
                {stages.map((st, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setActiveStepIdx(i);
                      setActiveTabIdx(i);
                      setStepProgress(0);
                    }}
                    className={`step-item ${activeStepIdx === i ? "is-active" : ""}`}
                  >
                    <span className="n">0{i + 1}</span>
                    <span className="t">{st.t.split(" ")[0]}</span>
                    {activeStepIdx === i && (
                      <div
                        className="fill-bar"
                        style={{ width: `${stepProgress}%` }}
                      />
                    )}
                  </button>
                ))}
              </div>

              {/* Stage Body Displays */}
              <div className="p-4 sm:p-5 min-h-[280px] flex flex-col justify-between font-mono text-xs">
                {/* Stage 01: Ingest */}
                {activeStepIdx === 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="text-[11px] text-blue-400 font-bold">
                        STAGE 01 · CLIENT INFERENCE INGEST
                      </div>
                      <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-[10px] text-slate-300">
                        POST /v1/chat/completions
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="bg-[#05070b] p-2.5 border border-slate-800/80">
                        <div className="text-slate-400 text-[10px]">SELECTED MODEL</div>
                        <div className="text-white font-semibold mt-0.5">
                          meta-llama/llama-3-70b-instruct
                        </div>
                      </div>
                      <div className="bg-[#05070b] p-2.5 border border-slate-800/80">
                        <div className="text-slate-400 text-[10px]">PAYLOAD AUTH</div>
                        <div className="text-emerald-400 font-semibold mt-0.5">
                          Bearer vrxl_sec_8f3a...
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#05070b] p-3 border border-slate-800/80 space-y-1.5 text-[11px]">
                      <div className="flex justify-between text-slate-400">
                        <span>Protocol Clearing Fee (50 bps):</span>
                        <span className="text-emerald-400 font-bold">$0.00067 USD</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Centralized SaaS Extracted Rent (950 bps):</span>
                        <span className="text-rose-400 line-through">$0.01273 USD</span>
                      </div>
                      <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-800/60 font-semibold">
                        <span className="text-slate-300">Cost Savings to Consumer:</span>
                        <span className="text-blue-400">-94.7% Compressed</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Stage 02: Route */}
                {activeStepIdx === 1 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="text-[11px] text-blue-400 font-bold">
                        STAGE 02 · STATELESS EDGE DISPATCH
                      </div>
                      <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-[10px] text-emerald-400">
                        ROUTED P50 &lt; 5ms
                      </span>
                    </div>

                    <div className="space-y-1.5 text-[11px]">
                      <div className="p-2 bg-blue-950/20 border border-blue-500/40 flex items-center justify-between">
                        <div>
                          <div className="text-white font-semibold">
                            Prague Tier-3 Cluster 01 [SELECTED]
                          </div>
                          <div className="text-slate-400 text-[10px]">
                            8x NVIDIA H100 SXM5 • 35,000 $VRXL Bonded
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-emerald-400 font-bold">18ms TTFT</div>
                          <div className="text-[10px] text-slate-400">84.5 TPS</div>
                        </div>
                      </div>

                      <div className="p-2 bg-[#05070b] border border-slate-800/80 flex items-center justify-between opacity-70">
                        <div>
                          <div className="text-slate-300">Frankfurt Equinix Node A</div>
                          <div className="text-slate-400 text-[10px]">
                            4x NVIDIA A100 80GB • 15,000 $VRXL Bonded
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-slate-300 font-bold">14ms TTFT</div>
                          <div className="text-[10px] text-slate-400">124 TPS</div>
                        </div>
                      </div>

                      <div className="p-2 bg-[#05070b] border border-slate-800/80 flex items-center justify-between opacity-70">
                        <div>
                          <div className="text-slate-300">Brno Transition Cluster</div>
                          <div className="text-slate-400 text-[10px]">
                            16x RTX 4090 • 28,000 $VRXL Bonded
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-slate-300 font-bold">24ms TTFT</div>
                          <div className="text-[10px] text-slate-400">68.2 TPS</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Stage 03: Stream */}
                {activeStepIdx === 2 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="text-[11px] text-blue-400 font-bold">
                        STAGE 03 · HARDWARE STREAM EXECUTION
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[10px] text-emerald-400 font-bold">84.5 TPS</span>
                      </div>
                    </div>

                    <div className="bg-[#05070b] p-3 border border-slate-800/80 text-[11px] leading-relaxed text-slate-200 h-32 overflow-y-auto whitespace-pre-wrap select-text">
                      {streamedText}
                      <span className="inline-block w-1.5 h-3.5 bg-blue-400 ml-1 animate-pulse align-middle" />
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1">
                      <span>TTFT: <strong className="text-white">46ms</strong></span>
                      <span>Output: <strong className="text-white">FP16 Linear</strong></span>
                      <span>Buffer: <strong className="text-emerald-400">Zero Custody</strong></span>
                    </div>
                  </div>
                )}

                {/* Stage 04: Clear */}
                {activeStepIdx === 3 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="text-[11px] text-blue-400 font-bold">
                        STAGE 04 · QUALITY ORACLE & CLEARING
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 font-bold">
                        FIDELITY: 99.8%
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="bg-[#05070b] p-2.5 border border-slate-800/80">
                        <div className="text-slate-400 text-[10px]">CANARY TEST VECTOR</div>
                        <div className="text-white font-semibold mt-0.5">
                          seed=42 · temp=0.0
                        </div>
                        <div className="text-[10px] text-emerald-400 mt-0.5">
                          ✓ Token distance: 0.002
                        </div>
                      </div>

                      <div className="bg-[#05070b] p-2.5 border border-slate-800/80">
                        <div className="text-slate-400 text-[10px]">ARAGON OSx TREASURY</div>
                        <div className="text-white font-semibold mt-0.5">
                          0xf0e5...111a
                        </div>
                        <div className="text-[10px] text-blue-400 mt-0.5">
                          ✓ 50 bps fee settled
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#05070b] p-2.5 border border-slate-800/80 text-[10px] text-slate-300 leading-relaxed">
                      Nash Equilibrium Enforced: 10% collateral slash penalty on quantized weight spoofing.
                      50% permanently burned, 50% routed to DAO Vault.
                    </div>
                  </div>
                )}

                {/* Bottom Console Prompt */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="text-blue-400 font-bold">&rsaquo;</span>
                    <span className="text-slate-300">
                      {stages[activeStepIdx].desc}
                    </span>
                  </div>
                  <span className="text-[9px] text-slate-400 shrink-0 ml-2">
                    Click stage to freeze
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Financial/Protocol Ticker Tape along the bottom */}
      <div className="hero-tape">
        <div className="tape-track">
          <span className="tape-item is-blue">
            <b>META-LLAMA-3-70B</b> 84.5 TPS
          </span>
          <span className="tape-item is-up">
            <b>P50 TTFT</b> 48ms
          </span>
          <span className="tape-item is-blue">
            <b>PROTOCOL FEE</b> 50 BPS (-94.1%)
          </span>
          <span className="tape-item">
            <b>PRAGUE-01</b> 8x H100 SXM5 (18ms)
          </span>
          <span className="tape-item is-up">
            <b>ARAGON OSx DAO</b> 0xf0e51fB0...111a
          </span>
          <span className="tape-item">
            <b>COLLATERAL POOL</b> 130,000 $VRXL
          </span>
          <span className="tape-item is-up">
            <b>CANARY ORACLE</b> 99.8% FIDELITY
          </span>
          <span className="tape-item is-down">
            <b>SLASH PENALTY</b> 10% (50% BURN / 50% VAULT)
          </span>
          <span className="tape-item is-blue">
            <b>ETHEREUM SEPOLIA</b> VIP-1 ACTIVE
          </span>

          {/* Repeat for seamless infinite marquee loop */}
          <span className="tape-item is-blue">
            <b>META-LLAMA-3-70B</b> 84.5 TPS
          </span>
          <span className="tape-item is-up">
            <b>P50 TTFT</b> 48ms
          </span>
          <span className="tape-item is-blue">
            <b>PROTOCOL FEE</b> 50 BPS (-94.1%)
          </span>
          <span className="tape-item">
            <b>PRAGUE-01</b> 8x H100 SXM5 (18ms)
          </span>
          <span className="tape-item is-up">
            <b>ARAGON OSx DAO</b> 0xf0e51fB0...111a
          </span>
          <span className="tape-item">
            <b>COLLATERAL POOL</b> 130,000 $VRXL
          </span>
          <span className="tape-item is-up">
            <b>CANARY ORACLE</b> 99.8% FIDELITY
          </span>
          <span className="tape-item is-down">
            <b>SLASH PENALTY</b> 10% (50% BURN / 50% VAULT)
          </span>
          <span className="tape-item is-blue">
            <b>ETHEREUM SEPOLIA</b> VIP-1 ACTIVE
          </span>
        </div>
      </div>

      {/* =========================================================================
          Institutional Overview Dashboard (Modeled on Portfolio Optimizer)
          Compact tables, zero empty void, live clearinghouse telemetry
         ========================================================================= */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-4 w-full font-mono">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-500/15 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 status-dot bg-emerald-400 animate-pulse" />
            <h2 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
              Verxl Protocol Clearinghouse · Live Telemetry & Ledger
            </h2>
            <span className="hidden sm:inline px-1.5 py-0.2 rounded-[2px] bg-blue-500/10 border border-blue-500/30 text-[9px] text-blue-400">
              SEPOLIA PILOT
            </span>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-slate-400">
            <span>Aragon Vault:</span>
            <a
              href="https://sepolia.etherscan.io/address/0xf0e51fB0FFBD8ef36281b6f643E0f7953BD5111a"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-white underline decoration-blue-500/40"
            >
              0xf0e5...111a
            </a>
            <span className="text-slate-700">|</span>
            <span className="text-emerald-400 font-semibold">100% Agency</span>
          </div>
        </div>

        {/* 2-Column High-Density Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
          {/* Left Column (lg:col-span-5): Protocol Key Metrics & Fee Calculator */}
          <div className="lg:col-span-5 space-y-3.5">
            {/* Key Metrics Table (styled like pr-table in Portfolio Optimizer) */}
            <div className="bg-[#0a0e17] border border-blue-500/20 rounded-[3px] p-3 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5 mb-2">
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-blue-400" />
                  Key Clearing Metrics
                </span>
                <span className="text-[9.5px] text-blue-400 font-mono">0.50% FIXED SWITCH</span>
              </div>

              <table className="dense-table">
                <tbody>
                  <tr>
                    <th>Protocol Agency Fee</th>
                    <td className="text-right text-emerald-400 font-bold">50 bps (0.50%)</td>
                  </tr>
                  <tr>
                    <th>Centralized SaaS Rent</th>
                    <td className="text-right text-rose-400 line-through">840 – 1,040 bps</td>
                  </tr>
                  <tr>
                    <th>Median TTFT Latency</th>
                    <td className="text-right text-white">46 ms</td>
                  </tr>
                  <tr>
                    <th>Live Token Throughput</th>
                    <td className="text-right text-white">84.5 TPS</td>
                  </tr>
                  <tr>
                    <th>Bonding Minimum</th>
                    <td className="text-right text-slate-300">1,000 $VRXL</td>
                  </tr>
                  <tr>
                    <th>Total Collateral Bonded</th>
                    <td className="text-right text-blue-400 font-semibold">130,000 $VRXL</td>
                  </tr>
                  <tr>
                    <th>Supply Slashed & Burned</th>
                    <td className="text-right text-rose-400 font-semibold">14,500 $VRXL</td>
                  </tr>
                  <tr>
                    <th>Canary Audit Vector</th>
                    <td className="text-right text-slate-300">seed=42 · temp=0.0</td>
                  </tr>
                  <tr>
                    <th>Audit Cadence</th>
                    <td className="text-right text-slate-300">30 min deterministic</td>
                  </tr>
                  <tr>
                    <th>Aragon Quorum / Majority</th>
                    <td className="text-right text-emerald-400">20.0% / 50.0%</td>
                  </tr>
                  <tr>
                    <th>Genesis Token Cap</th>
                    <td className="text-right text-slate-300">1,000,000 $VRXL</td>
                  </tr>
                  <tr>
                    <th>Custodial Risk</th>
                    <td className="text-right text-emerald-400 font-bold">Zero (Agency Float)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Interactive Fee Compression Calculator */}
            <div className="bg-[#0a0e17] border border-blue-500/20 rounded-[3px] p-3 shadow-sm space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-blue-400" />
                  Fee Compression Simulator
                </span>
                <span className="text-[9.5px] text-emerald-400 font-bold">-94.7% COMPRESSION</span>
              </div>

              <div>
                <div className="flex justify-between text-[10.5px] text-slate-300 mb-1">
                  <span>Monthly Inference Volume:</span>
                  <span className="text-blue-400 font-bold">{calcTokensMillions.toLocaleString()}M tokens</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="2000"
                  step="50"
                  value={calcTokensMillions}
                  onChange={(e) => setCalcTokensMillions(Number(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between text-[8.5px] text-slate-400 font-mono mt-0.5">
                  <span>50M tokens</span>
                  <span>500M</span>
                  <span>1,000M</span>
                  <span>2,000M</span>
                </div>
              </div>

              {/* Instant USD Savings Math */}
              {(() => {
                const baseCompute = calcTokensMillions * 1000 * 0.68;
                const centralizedFee = baseCompute * 0.0950;
                const verxlFee = baseCompute * 0.0050;
                const netSavedMonthly = centralizedFee - verxlFee;
                const netSavedAnnual = netSavedMonthly * 12;

                return (
                  <div className="grid grid-cols-2 gap-2 text-[10.5px] pt-1 border-t border-slate-800/60">
                    <div className="bg-[#05070b] p-2 border border-slate-800/80">
                      <div className="text-[9px] text-slate-400 uppercase">Verxl Protocol Fee</div>
                      <div className="text-emerald-400 font-bold text-sm mt-0.5">
                        ${Math.round(verxlFee).toLocaleString()} <span className="text-[9px] font-normal text-slate-400">/mo</span>
                      </div>
                      <div className="text-[8.5px] text-slate-400 mt-0.5">50 bps take rate</div>
                    </div>

                    <div className="bg-[#05070b] p-2 border border-slate-800/80">
                      <div className="text-[9px] text-slate-400 uppercase">Capital Preserved</div>
                      <div className="text-blue-400 font-bold text-sm mt-0.5">
                        ${Math.round(netSavedMonthly).toLocaleString()} <span className="text-[9px] font-normal text-slate-400">/mo</span>
                      </div>
                      <div className="text-[8.5px] text-emerald-400 mt-0.5">
                        +${Math.round(netSavedAnnual).toLocaleString()}/yr runway
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Right Column (lg:col-span-7): Compute Fleet Holdings & Canary Oracle Log */}
          <div className="lg:col-span-7 space-y-3.5">
            {/* Compute Fleet Holdings Table (Holdings style from Portfolio Optimizer) */}
            <div className="bg-[#0a0e17] border border-blue-500/20 rounded-[3px] p-3 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5 mb-2">
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-blue-400" />
                  Active Compute Fleet Allocation
                </span>
                <button
                  onClick={() => onNavigate("registry")}
                  className="text-[9.5px] text-blue-400 hover:text-white flex items-center gap-1 transition"
                >
                  <span>View Registry & Register Node</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="dense-table">
                  <thead>
                    <tr>
                      <th className="text-left">Cluster Node</th>
                      <th className="text-left">Hardware</th>
                      <th className="text-left">Bonded $VRXL</th>
                      <th className="text-right">1M P/C</th>
                      <th className="text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {INITIAL_PROVIDERS.slice(0, 5).map((p) => {
                      const stakePct = Math.min(100, Math.round((p.stakedAmountVrxl / 35000) * 100));
                      return (
                        <tr key={p.id}>
                          <td>
                            <div className="font-semibold text-white truncate max-w-[140px]">
                              {p.name.split(" ")[0]} {p.name.split(" ")[1]}
                            </div>
                            <div className="text-[9px] text-slate-400">{p.location}</div>
                          </td>
                          <td className="text-slate-300 text-[10px] whitespace-nowrap">
                            {p.hardware}
                          </td>
                          <td>
                            <div className="flex items-center gap-1.5">
                              <span className="text-slate-200 text-[10px]">
                                {p.stakedAmountVrxl.toLocaleString()}
                              </span>
                              <div className="w-12 h-1 bg-slate-800 rounded-full overflow-hidden hidden sm:block">
                                <div
                                  className="h-full bg-blue-500"
                                  style={{ width: `${stakePct}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="text-right text-[10px] text-slate-300 tabular">
                            ${p.pricePromptUsd} / ${p.priceCompletionUsd}
                          </td>
                          <td className="text-right whitespace-nowrap">
                            <span
                              className={`px-1.5 py-0.2 rounded-[2px] text-[8.5px] font-bold ${
                                p.status === "ACTIVE"
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                  : p.status === "PROBATION"
                                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                  : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                              }`}
                            >
                              {p.status} ({p.latencyMs}ms)
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Autonomous Quality Oracle Canary Log */}
            <div className="bg-[#0a0e17] border border-blue-500/20 rounded-[3px] p-3 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5 mb-2">
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Deterministic Canary Probes (Seed=42 Nash Enforcement)
                </span>
                <button
                  onClick={() => onNavigate("oracle")}
                  className="text-[9.5px] text-blue-400 hover:text-white flex items-center gap-1 transition"
                >
                  <span>Oracle Dashboard</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="dense-table">
                  <thead>
                    <tr>
                      <th className="text-left">Probe ID</th>
                      <th className="text-left">Target Cluster</th>
                      <th className="text-left">Timestamp</th>
                      <th className="text-right">Fidelity</th>
                      <th className="text-right">Verdict</th>
                    </tr>
                  </thead>
                  <tbody>
                    {INITIAL_AUDIT_LOGS.map((log) => (
                      <tr key={log.id}>
                        <td className="text-blue-400 font-mono text-[10px]">{log.id}</td>
                        <td className="text-white text-[10px] truncate max-w-[130px]">
                          {log.providerName.split(" ")[0]} {log.providerName.split(" ")[1]}
                        </td>
                        <td className="text-slate-400 text-[9.5px]">{log.timestamp}</td>
                        <td className="text-right font-bold tabular text-[10px]">
                          <span
                            className={
                              log.fidelityScore >= 98
                                ? "text-emerald-400"
                                : log.fidelityScore >= 70
                                ? "text-amber-400"
                                : "text-rose-400"
                            }
                          >
                            {log.fidelityScore}%
                          </span>
                        </td>
                        <td className="text-right">
                          <span
                            className={`px-1.5 py-0.2 rounded-[2px] text-[8.5px] font-bold ${
                              log.passed
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            }`}
                          >
                            {log.passed ? "PASSED" : "FAILED / SLASH"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
