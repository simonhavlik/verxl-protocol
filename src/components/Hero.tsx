import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import {
  ArrowRight,
  ShieldCheck,
  Server,
  Lock,
  ExternalLink,
  Activity,
  Sliders,
} from "lucide-react";
import { INITIAL_PROVIDERS, INITIAL_AUDIT_LOGS } from "../data/mockData";
import { Playground } from "./Playground";
import { MarketRail } from "./MarketRail";

interface HeroProps {
  onNavigate: (tab: string) => void;
}

const HARDWARE_SHORT: Record<string, string> = {
  "bulbasaur-prague-1": "Vulkan GPU",
  "xiaomi-bridge-1": "Mi tensor cluster",
  "deepseek-bridge-1": "MoE engine",
};

export const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Walkthrough demo states
  const [activeStepIdx, setActiveStepIdx] = useState(0);
  const [stepProgress, setStepProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Fast Fee Calculator State (in millions of tokens per month)
  const [calcTokensMillions, setCalcTokensMillions] = useState(500);

  // Live token stream animation state in Stage 3
  const [streamedText, setStreamedText] = useState("");
  const fullSampleText =
    "Stream open. Cloudflare Edge routed the request to the Prague bare-metal Vulkan host. Qwen 3.5 4B, 32k resident context, FP16 linear decode at 52.4 TPS. Seed-42 canary matched at 99.8% fidelity. 50 bps clearing fee booked to the Aragon vault.";

  const handleTryPlayground = () => {
    const el = document.getElementById("live-playground");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      onNavigate("playground");
    }
  };

  const stages = [
    {
      tab: "01 Ingest",
      t: "Client Payload Ingest",
      desc: "OpenAI SDK request accepted on /v1/chat/completions",
    },
    {
      tab: "02 Route",
      t: "Cloudflare Edge Dispatch",
      desc: "Stateless dispatch to the lowest-latency verified host",
    },
    {
      tab: "03 Stream",
      t: "Hardware Stream Execution",
      desc: "FP16 decode streamed to the client at 38ms TTFT",
    },
    {
      tab: "04 Clear",
      t: "Canary Oracle & Clearing",
      desc: "Seed-42 distance checked, 50 bps fee booked to the vault",
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

    const isSmall = typeof window !== "undefined" && window.innerWidth <= 768;
    const nodeCount = isSmall ? 160 : 380;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: !isSmall,
        powerPreference: "low-power",
      });
    } catch (e) {
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isSmall ? 1.5 : 2));
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05070b, 0.08);

    const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 60);
    camera.position.set(0, 0, 5.8);

    const group = new THREE.Group();
    scene.add(group);

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
        g.addColorStop(0, "rgba(214, 244, 234, 1)");
        g.addColorStop(0.35, "rgba(184, 246, 221, 0.65)");
        g.addColorStop(1, "rgba(184, 246, 221, 0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 64, 64);
      }
      const tex = new THREE.CanvasTexture(c);
      tex.needsUpdate = true;
      return tex;
    };

    const pointMat = new THREE.PointsMaterial({
      color: 0xd6f4ea,
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
        color: 0x8fa39b,
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
          color: 0xb8f6dd,
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

    let isVisible = true;
    let rafId: number = 0;
    const animate = (now: number) => {
      if (!isVisible) {
        rafId = 0;
        return;
      }
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

    // Pause WebGL rendering when hero is scrolled out of view (saves massive CPU & battery on phones)
    let observer: IntersectionObserver | null = null;
    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            isVisible = entry.isIntersecting;
            if (isVisible && !rafId) {
              rafId = requestAnimationFrame(animate);
            }
          });
        },
        { threshold: 0.05 }
      );
      observer.observe(container);
    } else {
      rafId = requestAnimationFrame(animate);
    }

    return () => {
      if (observer) observer.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
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
      <div className="relative z-10 mx-auto flex min-h-[calc(100svh-68px)] w-full max-w-7xl items-center px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-7 items-center">
          {/* Left Column: Copy & Actions */}
          <div className="lg:col-span-6 space-y-6">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[#87959b]">
              <span className="w-1.5 h-1.5 bg-[#b8f6dd]" />
              <span>Non-custodial inference clearing</span>
              <span className="text-white/20">/ 01</span>
            </div>

            <h1 className="text-[clamp(3.1rem,6.6vw,5.8rem)] font-medium leading-[0.92] tracking-[-0.055em] text-[#f3f6f5]">
              Inference
              <br />
              <span className="text-[#8fa39b]">that settles.</span>
            </h1>

            <p className="max-w-[440px] text-[15.5px] leading-[1.65] text-[#a9b6bd]">
              Route one OpenAI-compatible request across Qwen, DeepSeek and MiMo.
              Providers keep 99.5% in USDC on Arbitrum; the protocol takes 50 bps.
            </p>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={handleTryPlayground}
                className="inline-flex items-center gap-2 border border-[#b8f6dd]/35 bg-[#b8f6dd]/10 px-4 py-2.5 text-[12px] font-medium text-[#dff8ef] transition-colors hover:border-[#b8f6dd]/70 hover:bg-[#b8f6dd]/15"
              >
                Run a request
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onNavigate("console")}
                className="inline-flex items-center gap-2 border border-white/12 px-4 py-2.5 text-[12px] font-medium text-[#c9d4d8] transition-colors hover:border-white/25 hover:text-white"
              >
                Read the API
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[10px] text-[#7d8a92]">
              <span>50 bps protocol</span>
              <span>99.5% to providers</span>
              <span>3 models</span>
              <span className="text-[#b8f6dd]/70">Sepolia</span>
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
                  <span className="text-[#b8f6dd]">https://</span>verxl.com/v1/chat/completions
                </div>
                <div className="live">
                  <i />
                  <span className="text-[#b8f6dd]/70">SEPOLIA TESTNET</span>
                </div>
              </div>

              {/* Stage rail: single selector, progress fills the active stage */}
              <div className="demo-tabs" role="tablist" aria-label="Inference clearing walkthrough">
                {stages.map((stage, idx) => (
                  <button
                    key={stage.tab}
                    role="tab"
                    aria-selected={activeStepIdx === idx}
                    onClick={() => {
                      setActiveStepIdx(idx);
                      setStepProgress(0);
                    }}
                    className={`d-tab ${activeStepIdx === idx ? "is-active" : ""}`}
                  >
                    {stage.tab}
                    {activeStepIdx === idx && (
                      <span
                        className="d-tab__fill"
                        style={{ width: `${Math.min(100, stepProgress)}%` }}
                        aria-hidden="true"
                      />
                    )}
                  </button>
                ))}
              </div>

              {/* Stage Body Displays */}
              <div className="p-4 sm:p-5 min-h-[252px] flex flex-col justify-between font-mono text-xs">
                {/* Stage 01: Ingest */}
                {activeStepIdx === 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="text-[11px] text-[#b8f6dd] font-bold">
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
                          qwen3.5-4b-uncensored-32k (Bulbasaur)
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
                        <span className="text-slate-300">Cost compression:</span>
                        <span className="text-[#b8f6dd]">-94.7%</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Stage 02: Route */}
                {activeStepIdx === 1 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="text-[11px] text-[#b8f6dd] font-bold">
                        STAGE 02 · STATELESS EDGE DISPATCH
                      </div>
                      <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-[10px] text-emerald-400">
                        ROUTED P50 &lt; 5ms
                      </span>
                    </div>

                    <div className="space-y-1.5 text-[11px]">
                      <div className="p-2 bg-white/[0.03] border border-[#b8f6dd]/25 flex items-center justify-between">
                        <div>
                          <div className="text-white font-semibold">
                            Prague Bare-Metal Cluster 01 [SELECTED]
                          </div>
                          <div className="text-slate-400 text-[10px]">
                            Bulbasaur Vulkan Host · Bare-Metal · Zero-Logging
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-emerald-400 font-bold">38ms TTFT</div>
                          <div className="text-[10px] text-slate-400">52.4 TPS</div>
                        </div>
                      </div>

                      <div className="p-2 bg-[#05070b] border border-slate-800/80 flex items-center justify-between opacity-70">
                        <div>
                          <div className="text-slate-300">DeepSeek Official Bridge</div>
                          <div className="text-slate-400 text-[10px]">
                            Hangzhou & Tokyo Edge · Bridge · Upstream Logged
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-slate-300 font-bold">92ms TTFT</div>
                          <div className="text-[10px] text-slate-400">135 TPS</div>
                        </div>
                      </div>

                      <div className="p-2 bg-[#05070b] border border-slate-800/80 flex items-center justify-between opacity-70">
                        <div>
                          <div className="text-slate-300">Xiaomi MiMo Official Bridge</div>
                          <div className="text-slate-400 text-[10px]">
                            Frankfurt Cloud Edge · Bridge · Upstream Logged
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-slate-300 font-bold">85ms TTFT</div>
                          <div className="text-[10px] text-slate-400">110 TPS</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Stage 03: Stream */}
                {activeStepIdx === 2 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="text-[11px] text-[#b8f6dd] font-bold">
                        STAGE 03 · HARDWARE STREAM EXECUTION
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[10px] text-emerald-400 font-bold">52.4 TPS</span>
                      </div>
                    </div>

                    <div className="bg-[#05070b] p-3 border border-slate-800/80 text-[11px] leading-relaxed text-slate-200 h-32 overflow-y-auto whitespace-pre-wrap select-text">
                      {streamedText}
                      <span className="inline-block w-1.5 h-3.5 bg-[#b8f6dd] ml-1 animate-pulse align-middle" />
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1">
                      <span>TTFT: <strong className="text-white">38ms</strong></span>
                      <span>Output: <strong className="text-white">FP16 Linear</strong></span>
                      <span>Buffer: <strong className="text-emerald-400">Zero Custody</strong></span>
                    </div>
                  </div>
                )}

                {/* Stage 04: Clear */}
                {activeStepIdx === 3 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="text-[11px] text-[#b8f6dd] font-bold">
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
                        <div className="text-[10px] text-[#b8f6dd] mt-0.5">
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
                    <span className="text-[#b8f6dd] font-bold">&rsaquo;</span>
                    <span className="text-slate-300">
                      {stages[activeStepIdx].desc}
                    </span>
                  </div>
                  <button
                    onClick={handleTryPlayground}
                    className="text-[10px] text-[#b8f6dd] hover:text-[#dff8ef] underline shrink-0 ml-2 font-mono flex items-center gap-0.5"
                  >
                    <span>Try in Playground</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          Live Inference Console (embedded, dense variant of the Playground)
          Every control is wired to the real /v1/chat/completions endpoint.
         ========================================================================= */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-5 w-full">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[#87959b]">
          <span className="w-1.5 h-1.5 bg-[#b8f6dd]" />
          <span>Live clearing</span>
          <span className="text-white/20">/ 02</span>
        </div>
        <div className="mt-3 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <h2 className="text-[clamp(2rem,4.2vw,3.8rem)] font-medium leading-[0.95] tracking-[-0.045em] text-[#f3f6f5]">
            Every request
            <br />
            <span className="text-[#8fa39b]">settles.</span>
          </h2>
          <p className="max-w-sm text-[14px] leading-relaxed text-[#a9b6bd]">
            Run a real request against three models. The console routes, meters and settles at 50 bps.
          </p>
        </div>
      </div>

      <section id="live-playground" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 w-full scroll-mt-14">
        <div className="border border-[#b8f6dd]/20 bg-[#080c14]/90 backdrop-blur-md rounded-[4px] shadow-2xl shadow-black/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3 sm:px-4 py-2.5 border-b border-[#b8f6dd]/15 font-mono">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 bg-emerald-400 animate-pulse" />
              <h2 className="text-[11px] sm:text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap">
                Live inference clearing
              </h2>
              <span className="hidden sm:inline px-1.5 py-0.5 border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[9px] uppercase tracking-wider">
                Multi-node
              </span>
            </div>
            <div className="flex items-center gap-3 text-[9.5px] text-slate-400">
              <span className="hidden md:inline">OpenAI SDK drop-in · 3 models · 50 bps clearing</span>
              <button
                onClick={() => onNavigate("playground")}
                className="text-[#b8f6dd] hover:text-[#dff8ef] flex items-center gap-1 font-semibold uppercase tracking-wider transition shrink-0"
              >
                <span>Full playground</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
          <div className="p-3 sm:p-4">
            <Playground variant="compact" onNavigate={onNavigate} />
          </div>
        </div>
      </section>

      {/* =========================================================================
          Institutional Overview Dashboard (Modeled on Portfolio Optimizer)
          Compact tables, zero empty void, live clearinghouse telemetry
         ========================================================================= */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-4 w-full font-mono">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 status-dot bg-emerald-400 animate-pulse" />
            <h2 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
              Verxl Protocol Clearinghouse · Live Clearing Telemetry
            </h2>
            <span className="hidden sm:inline px-1.5 py-0.2 rounded-[2px] bg-[#b8f6dd]/10 border border-[#b8f6dd]/20 text-[9px] text-[#b8f6dd]">
              SEPOLIA PILOT
            </span>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-slate-400">
            <span>Aragon Vault:</span>
            <a
              href="https://sepolia.etherscan.io/address/0xf0e51fB0FFBD8ef36281b6f643E0f7953BD5111a"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#b8f6dd] hover:text-white underline decoration-[#b8f6dd]/30"
            >
              0xf0e5...111a
            </a>
            <span className="text-slate-700">|</span>
            <span className="text-emerald-400 font-semibold">Non-custodial</span>
          </div>
        </div>

        {/* 2-Column High-Density Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
          {/* Left Column (lg:col-span-5): Protocol Key Metrics & Fee Calculator */}
          <div className="lg:col-span-5 space-y-3.5">
            {/* Key Metrics Table (styled like pr-table in Portfolio Optimizer) */}
            <div className="bg-[#0a0e17] border border-[#b8f6dd]/15 rounded-[3px] p-3 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5 mb-2">
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-[#b8f6dd]" />
                  Key Clearing Metrics
                </span>
                <span className="text-[9.5px] text-[#b8f6dd] font-mono">0.50% FIXED SWITCH</span>
              </div>

              <table className="dense-table">
                <tbody>
                  <tr>
                    <th>Protocol switch fee</th>
                    <td className="text-right text-emerald-400 font-bold">50 bps (0.50%)</td>
                  </tr>
                  <tr>
                    <th>Incumbent fee drag</th>
                    <td className="text-right text-rose-400 line-through">840 to 1,040 bps</td>
                  </tr>
                  <tr>
                    <th>Median TTFT</th>
                    <td className="text-right text-white">38 ms</td>
                  </tr>
                  <tr>
                    <th>Sustained throughput</th>
                    <td className="text-right text-white">52.4 TPS</td>
                  </tr>
                  <tr>
                    <th>Model catalogue</th>
                    <td className="text-right text-slate-300">3 fixed endpoints</td>
                  </tr>
                  <tr>
                    <th>Settlement asset</th>
                    <td className="text-right text-slate-300">USDC on Arbitrum</td>
                  </tr>
                  <tr>
                    <th>Host payout</th>
                    <td className="text-right text-[#b8f6dd] font-semibold">99.5% of compute</td>
                  </tr>
                  <tr>
                    <th>Oracle cadence</th>
                    <td className="text-right text-slate-300">30 min deterministic</td>
                  </tr>
                  <tr>
                    <th>Canary vector</th>
                    <td className="text-right text-slate-300">seed=42 · temp=0.0</td>
                  </tr>
                  <tr>
                    <th>Fidelity floor</th>
                    <td className="text-right text-white">95.0%</td>
                  </tr>
                  <tr>
                    <th>Aragon quorum / majority</th>
                    <td className="text-right text-emerald-400">20.0% / 50.0%</td>
                  </tr>
                  <tr>
                    <th>Custodial float</th>
                    <td className="text-right text-emerald-400 font-bold">Zero</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Interactive Fee Compression Calculator */}
            <div className="bg-[#0a0e17] border border-[#b8f6dd]/15 rounded-[3px] p-3 shadow-sm space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-[#b8f6dd]" />
                  Fee Compression Simulator
                </span>
                <span className="text-[9.5px] text-emerald-400 font-bold">-94.7% COMPRESSION</span>
              </div>

              <div>
                <div className="flex justify-between text-[10.5px] text-slate-300 mb-1">
                  <span>Monthly Inference Volume:</span>
                  <span className="text-[#b8f6dd] font-bold">{calcTokensMillions.toLocaleString()}M tokens</span>
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
                <div className="text-[8px] text-slate-500 mt-1 font-mono">
                  Blended compute $0.68 per 1M · incumbent 950 bps · Verxl 50 bps
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
                      <div className="text-[#b8f6dd] font-bold text-sm mt-0.5">
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

          {/* Right Column (lg:col-span-7): Fleet, oracle ladder, routing policy */}
          <div className="lg:col-span-7 space-y-3.5">
            {/* Active compute fleet */}
            <div className="bg-[#0a0e17] border border-[#b8f6dd]/15 rounded-[3px] p-3 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5 mb-2">
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-[#b8f6dd]" />
                  Active Compute Fleet Allocation
                </span>
                <button
                  onClick={() => onNavigate("registry")}
                  className="text-[9.5px] text-[#b8f6dd] hover:text-white flex items-center gap-1 transition"
                >
                  <span>Registry & node onboarding</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="dense-table">
                  <thead>
                    <tr>
                      <th className="text-left">Cluster / model</th>
                      <th className="text-left">Data policy</th>
                      <th className="text-right">TTFT</th>
                      <th className="text-right">$/1M P · C</th>
                      <th className="text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {INITIAL_PROVIDERS.map((p) => {
                      const bridge = p.providerType === "OFFICIAL_BRIDGE";
                      return (
                        <tr key={p.id}>
                          <td>
                            <div className="font-semibold text-white whitespace-nowrap">
                              {p.name.split(" ")[0]} {p.name.split(" ")[1]}
                            </div>
                            <div className="text-[8.5px] text-slate-400 truncate max-w-[210px]">
                              {p.modelIdentifier} · {HARDWARE_SHORT[p.id] ?? p.hardware}
                            </div>
                          </td>
                          <td>
                            <span
                              className={`text-[8.5px] px-1.5 py-0.5 border whitespace-nowrap ${
                                bridge
                                  ? "border-amber-500/25 bg-[#b8f6dd]/5 text-[#b8f6dd]/70"
                                  : "border-emerald-500/25 bg-emerald-500/10 text-emerald-300"
                              }`}
                            >
                              {bridge ? "Upstream" : "Zero-log"}
                            </span>
                          </td>
                          <td className="text-right text-slate-200 text-[10px] tabular whitespace-nowrap">
                            {p.ttftMs} ms
                          </td>
                          <td className="text-right text-slate-300 text-[10px] tabular whitespace-nowrap">
                            {p.pricePromptUsd.toFixed(2)} / {p.priceCompletionUsd.toFixed(2)}
                          </td>
                          <td className="text-right whitespace-nowrap">
                            <span
                              className={`px-1.5 py-0.2 text-[8.5px] font-bold border ${
                                p.status === "ACTIVE"
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                  : p.status === "PROBATION"
                                  ? "bg-[#b8f6dd]/5 text-[#b8f6dd]/70 border-amber-500/20"
                                  : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                              }`}
                            >
                              {p.status} · {p.uptimePercent.toFixed(2)}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mt-2 pt-1.5 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-2 text-[8.5px] text-slate-400">
                <span>50 bps protocol fee · 99.5% host payout · USDC on Arbitrum</span>
                <span className="text-emerald-400">All listed nodes above the 95% fidelity floor</span>
              </div>
            </div>

            {/* Canary probe log */}
            <div className="bg-[#0a0e17] border border-[#b8f6dd]/15 rounded-[3px] p-3 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5 mb-2">
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Deterministic Canary Probes · seed=42
                </span>
                <button
                  onClick={() => onNavigate("oracle")}
                  className="text-[9.5px] text-[#b8f6dd] hover:text-white flex items-center gap-1 transition"
                >
                  <span>Oracle dashboard</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="dense-table">
                  <thead>
                    <tr>
                      <th className="text-left">Probe ID</th>
                      <th className="text-left">Target cluster</th>
                      <th className="text-left">Timestamp</th>
                      <th className="text-right">TTFT</th>
                      <th className="text-right">Fidelity</th>
                      <th className="text-right">Verdict</th>
                    </tr>
                  </thead>
                  <tbody>
                    {INITIAL_AUDIT_LOGS.map((log) => (
                      <tr key={log.id}>
                        <td className="text-[#b8f6dd] font-mono text-[10px]">{log.id}</td>
                        <td className="text-white text-[10px] truncate max-w-[128px]">
                          {log.providerName.split(" ")[0]} {log.providerName.split(" ")[1]}
                        </td>
                        <td className="text-slate-400 text-[9.5px]">{log.timestamp}</td>
                        <td className="text-right text-slate-300 text-[10px] tabular">{log.ttftMs} ms</td>
                        <td className="text-right font-bold tabular text-[10px]">
                          <span
                            className={
                              log.fidelityScore >= 98
                                ? "text-emerald-400"
                                : log.fidelityScore >= 70
                                ? "text-[#b8f6dd]/70"
                                : "text-rose-400"
                            }
                          >
                            {log.fidelityScore}%
                          </span>
                        </td>
                        <td className="text-right">
                          <span
                            className={`px-1.5 py-0.2 text-[8.5px] font-bold border ${
                              log.passed
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : "bg-rose-500/10 text-rose-400 border-rose-500/20"
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

            {/* Routing objective and verification ladder */}
            <div className="bg-[#0a0e17] border border-[#b8f6dd]/15 rounded-[3px] p-3 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5 mb-2">
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-[#b8f6dd]" />
                  Routing objective & oracle ladder
                </span>
                <span className="text-[9px] text-slate-500">evaluated per request</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                <div>
                  <div className="text-[8.5px] text-slate-500 uppercase tracking-wider mb-1">
                    Selection · weighted cost-latency
                  </div>
                  <div className="text-[9.5px] text-slate-200 leading-snug">
                    min J(i) = 0.70 · TTFT<sub>i</sub> / TTFT<sub>max</sub> + 0.30 · P<sub>i</sub> / P<sub>max</sub>
                  </div>
                  <div className="mt-1.5 space-y-1">
                    <div className="flex items-center gap-2 text-[8.5px] text-slate-400">
                      <span className="w-11">Latency</span>
                      <span className="flex-1 h-1 bg-slate-800">
                        <span className="block h-1 bg-blue-500" style={{ width: "70%" }} />
                      </span>
                      <span className="text-[#dff8ef] tabular">0.70</span>
                    </div>
                    <div className="flex items-center gap-2 text-[8.5px] text-slate-400">
                      <span className="w-11">Price</span>
                      <span className="flex-1 h-1 bg-slate-800">
                        <span className="block h-1 bg-cyan-400" style={{ width: "30%" }} />
                      </span>
                      <span className="text-cyan-300 tabular">0.30</span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-[8.5px] text-slate-500 uppercase tracking-wider mb-1">
                    Verification · fidelity ladder
                  </div>
                  <div className="space-y-1 text-[9px]">
                    <div className="flex items-center justify-between border-b border-slate-800/60 pb-0.5">
                      <span className="text-slate-300">Fidelity at or above 95.0%</span>
                      <span className="text-emerald-400 font-semibold">PASS</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-slate-800/60 pb-0.5">
                      <span className="text-slate-300">First miss · traffic cut 50%</span>
                      <span className="text-[#b8f6dd]/70 font-semibold">PROBATION</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Second miss · 10% slash</span>
                      <span className="text-rose-400 font-semibold">SLASH</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Client-side encrypted chat storage: mechanism, stored fields, access boundary */}
      <section
        id="chat-privacy"
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 w-full scroll-mt-14 font-mono"
      >
        <div className="border border-emerald-500/25 bg-[#080c14]/90 rounded-[3px]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3 sm:px-4 py-2.5 border-b border-emerald-500/20">
            <div className="flex items-center gap-2 min-w-0">
              <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <h2 className="text-[11px] sm:text-xs font-bold text-white uppercase tracking-wider">
                Chat privacy boundary
              </h2>
              <span className="px-1.5 py-0.5 border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-[8.5px] uppercase tracking-wider">
                Client-side encryption
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-[9px] text-slate-400">
              <span className="hidden md:inline">Postgres never receives message text</span>
              <a
                href="https://github.com/simonhavlik/verxl-protocol/blob/main/src/lib/chatCrypto.ts"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-300 hover:text-emerald-200 inline-flex items-center gap-1"
              >
                crypto source <ExternalLink className="w-2.5 h-2.5" />
              </a>
              <a
                href="https://github.com/simonhavlik/verxl-protocol/blob/main/functions/api/chat/conversations.ts"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-300 hover:text-emerald-200 inline-flex items-center gap-1"
              >
                API source <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-emerald-500/10">
            <div className="lg:col-span-7 p-3 sm:p-4 space-y-2.5">
              <div className="grid grid-cols-3 gap-2">
                {[
                  { k: "Browser", v: "plaintext in memory", d: "wallet signature to HKDF-SHA256" },
                  { k: "AES-256-GCM", v: "sealed envelope", d: "96-bit IV, fresh per save" },
                  { k: "Postgres", v: "ciphertext only", d: "no title, no messages, no prompt" },
                ].map((step, i) => (
                  <div key={step.k} className="relative bg-[#05070b] border border-slate-800 px-2.5 py-2">
                    <div className="text-[8px] text-slate-500 uppercase tracking-wider">
                      0{i + 1} · {step.k}
                    </div>
                    <div className="text-[10.5px] text-white font-semibold mt-0.5">{step.v}</div>
                    <div className="text-[8.5px] text-slate-500 leading-snug mt-0.5">{step.d}</div>
                    {i < 2 && (
                      <ArrowRight className="hidden sm:block absolute -right-[9px] top-1/2 -translate-y-1/2 w-3 h-3 text-emerald-500/60" />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[8.5px] text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <span className="w-1 h-1 bg-emerald-400" />
                  Non-extractable CryptoKey stays in browser memory
                </span>
                <span className="text-slate-700">·</span>
                <span>Wallet private key never leaves MetaMask</span>
                <span className="text-slate-700">·</span>
                <span>Another wallet cannot decrypt these envelopes</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 pt-2 border-t border-slate-800/80">
                <div>
                  <div className="text-[8px] uppercase tracking-wider text-slate-500 mb-0.5">
                    Operator can still see
                  </div>
                  <div className="text-[9px] text-slate-400 leading-relaxed">
                    account id · wallet address · timestamps · envelope size · usage records
                  </div>
                </div>
                <div>
                  <div className="text-[8px] uppercase tracking-wider text-emerald-500/80 mb-0.5">
                    Operator cannot see
                  </div>
                  <div className="text-[9px] text-emerald-200/80 leading-relaxed">
                    message text · titles · system prompt · key material
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 p-3 sm:p-4">
              <table className="dense-table">
                <tbody>
                  <tr>
                    <th>Key derivation</th>
                    <td className="text-right text-slate-300">personal_sign → HKDF-SHA256</td>
                  </tr>
                  <tr>
                    <th>Cipher</th>
                    <td className="text-right text-slate-300">AES-256-GCM · 96-bit IV</td>
                  </tr>
                  <tr>
                    <th>Stored</th>
                    <td className="text-right text-slate-300">ciphertext · wallet key id · timestamps</td>
                  </tr>
                  <tr>
                    <th>Not stored</th>
                    <td className="text-right text-emerald-300">message text · titles · system prompt</td>
                  </tr>
                  <tr>
                    <th>Admin visibility</th>
                    <td className="text-right text-slate-300">usage records, keys, deposits</td>
                  </tr>
                  <tr>
                    <th>Deletion</th>
                    <td className="text-right text-slate-300">per conversation or all</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Live settlement rail: real spot quotes and Arbitrum chain telemetry */}
      <MarketRail />
    </div>
  );
};
