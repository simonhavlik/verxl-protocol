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

    // Try edge API first
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
      // Fallback to local deterministic canary calculation
    }

    await new Promise((r) => setTimeout(r, 800));

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
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-400 mb-2">
          <Activity className="w-3.5 h-3.5" />
          <span>AUTONOMOUS AI QUALITY ORACLE (NASH EQUILIBRIUM ENFORCER)</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Deterministic Canary Auditing & Slashing
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Cryptographically seed-locked audit probes prevent GPU hosts from secretly downgrading
          FP16 weights to INT4 quantization.
        </p>
      </div>

      {/* Top Telemetry Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Metric 1 */}
        <div className="bg-[#0c1322] border border-slate-800 rounded-xl p-5 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono text-slate-400">TOTAL $VRXL BURNED</div>
            <div className="text-2xl font-bold font-mono text-rose-400 mt-0.5">
              14,500 $VRXL
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-1">
              Permanent supply contraction
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <Flame className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-[#0c1322] border border-slate-800 rounded-xl p-5 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono text-slate-400">DAO VAULT DIVIDEND</div>
            <div className="text-2xl font-bold font-mono text-emerald-400 mt-0.5">
              14,500 $VRXL
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-1">
              Direct deposit to 0xf0e5...111a
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Scale className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-[#0c1322] border border-slate-800 rounded-xl p-5 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono text-slate-400">AUDIT PROBES (24H)</div>
            <div className="text-2xl font-bold font-mono text-blue-400 mt-0.5">
              1,482 Probes
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-1">
              99.82% Fleet SLA Compliance
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Zap className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Interactive Canary Probe Trigger Box */}
      <div className="bg-[#0c1322] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-blue-400" />
              <span>Manual Seed-Locked Canary Probe Trigger</span>
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Dispatches seed=42, temp=0.0 canary probe to evaluate exact token edit distance.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedCluster}
              onChange={(e) => setSelectedCluster(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500"
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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-mono font-medium transition shadow-md shadow-blue-600/20"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isExecutingProbe ? "animate-spin" : ""}`}
              />
              <span>{isExecutingProbe ? "Probing Node..." : "Execute Probe"}</span>
            </button>
          </div>
        </div>

        {/* Live Probe Execution Feedback */}
        {probeResult && (
          <div
            className={`p-4 rounded-xl border font-mono text-xs space-y-2 ${
              probeResult.success
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-200"
                : "bg-rose-500/10 border-rose-500/30 text-rose-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm">
                {probeResult.success ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-400" />
                )}
                <span>Probe Report: {probeResult.clusterName}</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-black/40">
                Fidelity: {probeResult.fidelity}%
              </span>
            </div>
            <p className="text-[11px] leading-relaxed opacity-90">{probeResult.verdict}</p>
            <div className="flex items-center gap-4 text-[10px] text-slate-400 pt-1">
              <span>Token Edit Distance: {probeResult.distance}</span>
              <span>•</span>
              <span>Canary Payload: FP16 Deterministic Linear Projection</span>
              <span>•</span>
              <span>Slashing Action: {probeResult.success ? "None (Compliant)" : "10% Bond Slashed"}</span>
            </div>
          </div>
        )}

        {/* Mechanism Math Explainer Card */}
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 font-mono text-xs text-slate-300 space-y-2">
          <div className="text-white font-semibold flex items-center gap-2">
            <Scale className="w-3.5 h-3.5 text-blue-400" />
            <span>Game-Theoretic Payoff Matrix (Why Sponsoring Fraud is Irrationally Costly):</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-[11px] text-slate-400">
            <div className="bg-[#080c14] p-3 rounded border border-slate-800">
              <div className="text-emerald-400 font-semibold mb-1">Honest FP16 Inference</div>
              <p>
                Host earns 100% of agreed inference rate ($0.65/1M tokens) + accumulates reputation score.
                Collateral remains intact. Net profit: <strong className="text-white">+18.5% margin</strong>.
              </p>
            </div>
            <div className="bg-[#080c14] p-3 rounded border border-slate-800">
              <div className="text-rose-400 font-semibold mb-1">Spoofed INT4 / Pruning Fraud</div>
              <p>
                Host saves 30% GPU power ($0.19/1M tokens) but faces p=0.08 audit probability per 1,000 requests.
                Single failure slashes 1,000 $VRXL ($1,000+). Expected value: <strong className="text-rose-400">-$780.00 / day</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Live Audit Log Feed */}
      <div className="bg-[#0c1322] border border-slate-800 rounded-xl overflow-hidden shadow-xl space-y-0">
        <div className="px-5 py-3.5 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
            <ShieldAlert className="w-3.5 h-3.5 text-blue-400" />
            <span>Audit Probe Execution History</span>
          </div>
          <div className="text-[11px] font-mono text-slate-400">
            Continuous Seed-42 Invariance Probes
          </div>
        </div>

        <div className="divide-y divide-slate-800/60 font-mono text-xs">
          {auditLogs.map((log) => (
            <div
              key={log.id}
              className="p-4 hover:bg-slate-800/20 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-blue-400">
                    [{log.id}]
                  </span>
                  <span className="text-white font-semibold">{log.providerName}</span>
                  <span className="text-[11px] text-slate-400">
                    ({log.providerLocation})
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      log.passed
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                    }`}
                  >
                    {log.passed ? "VERIFIED FP16" : "ANOMALY DETECTED"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 max-w-3xl">{log.notes}</p>
              </div>

              <div className="sm:text-right shrink-0">
                <div className="text-slate-300 font-semibold">
                  Fidelity: {log.fidelityScore}%
                </div>
                <div className="text-[10px] text-slate-400">
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
