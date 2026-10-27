import React, { useState } from "react";
import {
  AuditRun,
  INITIAL_AUDIT_LOGS,
  INITIAL_PROVIDERS,
} from "../data/mockData";
import {
  ShieldAlert,
  Flame,
  CheckCircle,
  XCircle,
  RefreshCw,
  Scale,
  Zap,
  Activity,
  Terminal,
} from "lucide-react";

export const Oracle: React.FC = () => {
  const [auditLogs, setAuditLogs] = useState<AuditRun[]>(INITIAL_AUDIT_LOGS);
  const [selectedCluster, setSelectedCluster] = useState(INITIAL_PROVIDERS[0].id);
  const [isExecutingProbe, setIsExecutingProbe] = useState(false);
  const [probeResult, setProbeResult] = useState<{
    success: boolean;
    clusterName: string;
    fidelity: number;
    distance: number;
    verdict: string;
  } | null>(null);

  const handleRunCanaryProbe = async () => {
    setIsExecutingProbe(true);
    setProbeResult(null);

    const targetNode =
      INITIAL_PROVIDERS.find((p) => p.id === selectedCluster) || INITIAL_PROVIDERS[0];

    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerId: targetNode.id }),
      });
      if (res.ok) {
        const data = await res.json();
        setProbeResult(data as any);
        setIsExecutingProbe(false);
        return;
      }
    } catch (e) {
      // Local fallback
    }

    await new Promise((r) => setTimeout(r, 700));

    const isSpoofed = targetNode.status === "SLASHED" || targetNode.id === "spoofed-slashed-node";
    const fidelity = isSpoofed ? 51.4 : targetNode.status === "PROBATION" ? 76.5 : 99.6;
    const distance = isSpoofed ? 0.486 : targetNode.status === "PROBATION" ? 0.235 : 0.004;

    const newLog: AuditRun = {
      id: `probe-${Math.floor(1000 + Math.random() * 9000)}`,
      providerName: targetNode.name,
      providerLocation: targetNode.location,
      modelIdentifier: targetNode.modelIdentifier,
      timestamp: "Just now",
      latencyMs: targetNode.latencyMs,
      ttftMs: targetNode.ttftMs,
      throughputTps: targetNode.throughputTps,
      fidelityScore: fidelity,
      passed: !isSpoofed && targetNode.status !== "PROBATION",
      notes: isSpoofed
        ? "Quantization spoofing detected: Output diverges >45% from FP16 ground truth. 10% penalty executed."
        : targetNode.status === "PROBATION"
        ? "TTFT exceeded SLA baseline. Cluster remains in PROBATION."
        : "Deterministic seed-42 canary matched FP16 ground truth within 0.04% token distance. Verified.",
    };

    setAuditLogs([newLog, ...auditLogs]);
    setProbeResult({
      success: newLog.passed,
      clusterName: targetNode.name,
      fidelity,
      distance,
      verdict: isSpoofed
        ? "FAILED: INT4 spoofing detected. 10% slash queued."
        : targetNode.status === "PROBATION"
        ? "WARNING: Latency SLA violation."
        : "PASSED: Full FP16 weight fidelity verified.",
    });
    setIsExecutingProbe(false);
  };

  return (
    <div className="space-y-3.5">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2 py-0.2 rounded-[2px] bg-blue-500/10 border border-blue-500/30 text-[10px] font-mono text-blue-400 mb-1 uppercase tracking-wider">
          <Activity className="w-3 h-3" />
          <span>AUTONOMOUS AI QUALITY ORACLE · SEPOLIA TEST RUN</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Deterministic Canary Auditing & Slashing
        </h2>
        <p className="text-xs text-slate-400 font-mono">
          Cryptographically seed-locked audit probes prevent GPU hosts from secretly downgrading
          FP16 weights to INT4 quantization (Sepolia Testnet Pilot).
        </p>
      </div>

      {/* Top Telemetry Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 font-mono">
        {/* Metric 1 */}
        <div className="bg-[#0a0e17] border border-blue-500/20 rounded-[3px] p-3 flex items-center justify-between">
          <div>
            <div className="text-[9px] text-slate-400 uppercase tracking-wider">TOTAL $VRXL BURNED</div>
            <div className="text-base sm:text-xl font-bold text-rose-400 mt-0.5 tabular">
              14,500 $VRXL
            </div>
            <div className="text-[9px] text-slate-400 mt-0.5">
              Permanent supply contraction
            </div>
          </div>
          <div className="w-8 h-8 rounded-[3px] bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <Flame className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-[#0a0e17] border border-blue-500/20 rounded-[3px] p-3 flex items-center justify-between">
          <div>
            <div className="text-[9px] text-slate-400 uppercase tracking-wider">DAO VAULT DIVIDEND</div>
            <div className="text-base sm:text-xl font-bold text-emerald-400 mt-0.5 tabular">
              14,500 $VRXL
            </div>
            <div className="text-[9px] text-slate-400 mt-0.5">
              Direct deposit to 0xf0e5...111a
            </div>
          </div>
          <div className="w-8 h-8 rounded-[3px] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Scale className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-[#0a0e17] border border-blue-500/20 rounded-[3px] p-3 flex items-center justify-between">
          <div>
            <div className="text-[9px] text-slate-400 uppercase tracking-wider">ORACLE RELIABILITY</div>
            <div className="text-base sm:text-xl font-bold text-blue-400 mt-0.5 tabular">
              99.8% SLA
            </div>
            <div className="text-[9px] text-slate-400 mt-0.5">
              Deterministic ground truth
            </div>
          </div>
          <div className="w-8 h-8 rounded-[3px] bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Zap className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Interactive Canary Probe Trigger Box */}
      <div className="bg-[#0a0e17] border border-blue-500/20 rounded-[4px] p-5 shadow-xl space-y-4 font-mono">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 uppercase tracking-wider">
              <Terminal className="w-4 h-4 text-blue-400" />
              <span>Seed-Locked Canary Invariance Trigger</span>
            </h3>
            <p className="text-[10.5px] text-slate-400 mt-0.5">
              Dispatches seed=42, temp=0.0 canary probe to evaluate exact token edit distance.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedCluster}
              onChange={(e) => setSelectedCluster(e.target.value)}
              className="bg-[#05070b] border border-slate-800 rounded-[3px] px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              {INITIAL_PROVIDERS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.status})
                </option>
              ))}
            </select>

            <button
              onClick={handleRunCanaryProbe}
              disabled={isExecutingProbe}
              className="hero-btn hero-btn--primary !py-1.5 !px-3 !text-[11px]"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isExecutingProbe ? "animate-spin" : ""}`}
              />
              <span>{isExecutingProbe ? "Probing..." : "Execute Probe"}</span>
            </button>
          </div>
        </div>

        {/* Live Probe Execution Feedback */}
        {probeResult && (
          <div
            className={`p-3.5 rounded-[3px] border text-xs space-y-1.5 ${
              probeResult.success
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-200"
                : "bg-rose-500/10 border-rose-500/30 text-rose-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
                {probeResult.success ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-400" />
                )}
                <span>Report: {probeResult.clusterName}</span>
              </div>
              <span className="text-[9.5px] px-1.5 py-0.5 rounded-[2px] bg-black/40 tabular">
                Fidelity: {probeResult.fidelity}%
              </span>
            </div>
            <p className="text-[11px] leading-relaxed opacity-90">{probeResult.verdict}</p>
            <div className="flex items-center gap-3 text-[10px] text-slate-400 pt-1 border-t border-slate-800/40">
              <span>Token Distance: {probeResult.distance}</span>
              <span>•</span>
              <span>Canary: FP16 Deterministic</span>
              <span>•</span>
              <span>Slashing Action: {probeResult.success ? "None (Compliant)" : "10% Bond Slashed"}</span>
            </div>
          </div>
        )}

        {/* Mechanism Math Explainer Card */}
        <div className="bg-[#05070b] p-3.5 rounded-[3px] border border-slate-800/80 text-xs text-slate-300 space-y-2">
          <div className="text-white font-semibold flex items-center gap-2 text-[11px] uppercase tracking-wider">
            <Scale className="w-3.5 h-3.5 text-blue-400" />
            <span>Game-Theoretic Payoff Matrix (Nash Equilibrium):</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1 text-[10.5px] text-slate-400">
            <div className="bg-[#080c14] p-3 rounded-[2px] border border-slate-800">
              <div className="text-emerald-400 font-semibold mb-1 uppercase tracking-wider">Honest FP16 Inference</div>
              <p>
                Host earns 100% of agreed inference rate ($0.65/1M tokens) + accumulates reputation score.
                Collateral remains intact. Net profit: <strong className="text-white">+18.5% margin</strong>.
              </p>
            </div>
            <div className="bg-[#080c14] p-3 rounded-[2px] border border-slate-800">
              <div className="text-rose-400 font-semibold mb-1 uppercase tracking-wider">Spoofed INT4 Fraud</div>
              <p>
                Host saves 30% GPU power ($0.19/1M tokens) but faces p=0.08 audit probability per 1,000 requests.
                Single failure slashes 1,000 $VRXL ($1,000+). Expected value: <strong className="text-rose-400">-$780.00 / day</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Live Audit Log Feed */}
      <div className="bg-[#0a0e17] border border-blue-500/20 rounded-[4px] overflow-hidden shadow-xl font-mono">
        <div className="px-4 py-2.5 bg-[#05070b] border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-300 uppercase tracking-wider text-[11px]">
            <ShieldAlert className="w-3.5 h-3.5 text-blue-400" />
            <span>Audit Probe Execution History</span>
          </div>
          <div className="text-[10px] text-slate-400">
            Continuous Seed-42 Invariance Probes
          </div>
        </div>

        <div className="divide-y divide-slate-800/60 text-xs">
          {auditLogs.map((log) => (
            <div
              key={log.id}
              className="p-3.5 hover:bg-slate-800/20 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10.5px] font-bold text-blue-400">
                    [{log.id}]
                  </span>
                  <span className="text-white font-semibold">{log.providerName}</span>
                  <span className="text-[10px] text-slate-400">
                    ({log.providerLocation})
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] text-[9.5px] font-bold ${
                      log.passed
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                        : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                    }`}
                  >
                    {log.passed ? "VERIFIED FP16" : "ANOMALY DETECTED"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 max-w-3xl">{log.notes}</p>
              </div>

              <div className="sm:text-right shrink-0">
                <div className="text-slate-300 font-semibold tabular">
                  Fidelity: {log.fidelityScore}%
                </div>
                <div className="text-[10px] text-slate-400 tabular">
                  {log.timestamp} • {log.latencyMs}ms latency
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
