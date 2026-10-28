import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Server,
  RefreshCw,
  Mail,
  ExternalLink,
  Activity,
  Send,
  MessageSquare,
  CheckCircle2,
  Trash2,
} from "lucide-react";

export const AdminRegistryTab: React.FC = () => {
  const { token } = useAuth();

  const [applications, setApplications] = useState<any[]>([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [monitoredProviders, setMonitoredProviders] = useState<any[]>([]);
  const [recentTrafficLogs, setRecentTrafficLogs] = useState<any[]>([]);
  const [loadingMonitoring, setLoadingMonitoring] = useState(false);
  const [providerMessages, setProviderMessages] = useState<any[]>([]);
  const [mailForm, setMailForm] = useState({
    recipient: "",
    subject: "",
    body: "",
    providerId: "",
  });
  const [sendingMail, setSendingMail] = useState(false);
  const [mailFeedback, setMailFeedback] = useState<string | null>(null);

  const fetchAdminRegistryData = async () => {
    if (!token) return;
    setLoadingApps(true);
    setLoadingMonitoring(true);
    try {
      const [appsRes, monRes, msgsRes] = await Promise.all([
        fetch("/api/admin/providers/applications", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/admin/providers/monitoring", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/admin/providers/messages", { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (appsRes.ok) {
        const data = (await appsRes.json()) as any;
        setApplications(data.applications || []);
      }
      if (monRes.ok) {
        const data = (await monRes.json()) as any;
        setMonitoredProviders(data.providers || []);
        setRecentTrafficLogs(data.recent_logs || []);
      }
      if (msgsRes.ok) {
        const data = (await msgsRes.json()) as any;
        setProviderMessages(data.messages || []);
      }
    } catch (err) {
      console.warn("Failed to load admin registry:", err);
    } finally {
      setLoadingApps(false);
      setLoadingMonitoring(false);
    }
  };

  useEffect(() => {
    fetchAdminRegistryData();
  }, [token]);

  const handleAppAction = async (applicationId: string, action: "approve" | "reject" | "delete") => {
    if (!token) return;
    try {
      const res = await fetch("/api/admin/providers/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ application_id: applicationId, action }),
      });
      if (res.ok) {
        await fetchAdminRegistryData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleProviderStatus = async (providerId: string, status: "ACTIVE" | "SUSPENDED" | "REVOKED") => {
    if (!token) return;
    try {
      const res = await fetch("/api/admin/providers/monitoring", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ provider_id: providerId, status }),
      });
      if (res.ok) {
        await fetchAdminRegistryData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !mailForm.recipient || !mailForm.subject || !mailForm.body) return;
    setSendingMail(true);
    setMailFeedback(null);
    try {
      const res = await fetch("/api/admin/providers/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          recipient: mailForm.recipient,
          subject: mailForm.subject,
          body: mailForm.body,
          provider_id: mailForm.providerId || undefined,
        }),
      });
      const data = (await res.json()) as any;
      if (res.ok) {
        setMailFeedback(`Email delivered successfully to ${mailForm.recipient} via automated@verxl.com.`);
        setMailForm({ recipient: "", subject: "", body: "", providerId: "" });
        await fetchAdminRegistryData();
      } else {
        setMailFeedback(`Delivery failed: ${data.error || "SMTP issue"}`);
      }
    } catch {
      setMailFeedback("Network error sending email");
    } finally {
      setSendingMail(false);
      setTimeout(() => setMailFeedback(null), 7000);
    }
  };

  return (
    <div className="space-y-5 font-mono">
      {/* Header Banner */}
      <div className="bg-[#0a0e17] border border-purple-500/30 rounded-[4px] p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-lg">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-[1px] bg-purple-400 animate-pulse" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Admin Fleet Registry & Inbound Model Applications
            </span>
            <span className="px-1.5 py-0.2 rounded-[2px] bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[9px] font-bold">
              ŠIMON ADMIN CONSOLE
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-sans">
            Review community model submissions, monitor live token traffic throughput, revoke rogue nodes, and communicate via Verxl Agent Mail (<code>automated@verxl.com</code>).
          </p>
        </div>
        <button
          onClick={fetchAdminRegistryData}
          disabled={loadingApps || loadingMonitoring}
          className="hero-btn hero-btn--ghost !py-1.5 !px-3 !text-[11px] flex items-center gap-1.5 self-start md:self-auto"
        >
          <RefreshCw className={`w-3 h-3 ${loadingApps || loadingMonitoring ? "animate-spin text-purple-400" : "text-slate-400"}`} />
          <span>Refresh Fleet Data</span>
        </button>
      </div>

      {/* SECTION 1: MODEL SUBMISSION APPLICATIONS */}
      <div className="bg-[#0a0e17] border border-slate-800 rounded-[4px] p-4 space-y-3 shadow-md">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Model Submission Requests ({applications.length})
            </h3>
          </div>
          <span className="text-[10px] text-slate-400">
            Stored in <code>verxl.provider_applications</code>
          </span>
        </div>

        {loadingApps ? (
          <div className="text-center py-6 text-xs text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-400" />
            <span>Loading model applications...</span>
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-400 bg-[#05070b] border border-slate-800/80 rounded-[3px]">
            No pending model applications right now. Community submissions from the Fleet Registry will appear here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-[#05070b] text-[10px] text-slate-400 uppercase tracking-wider">
                  <th className="py-2 px-3">APPLICANT & NODE</th>
                  <th className="py-2 px-3">MODEL & HARDWARE</th>
                  <th className="py-2 px-3">RATES ($/1M)</th>
                  <th className="py-2 px-3">CONTACT / WEBSITE</th>
                  <th className="py-2 px-3">STATUS</th>
                  <th className="py-2 px-3 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-800/20 transition">
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-white">{app.name}</div>
                      <div className="text-[10px] text-slate-400">{app.location} · {app.region}</div>
                      <div className="text-[9.5px] text-purple-300 font-mono mt-0.5 truncate max-w-[200px]" title={app.operator_address}>
                        {app.operator_address || "No wallet specified"}
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-blue-300">{app.model_identifier}</div>
                      <div className="text-[10px] text-slate-400">{app.hardware}</div>
                      <div className="text-[9.5px] text-slate-400 truncate max-w-[220px]" title={app.endpoint_url}>
                        {app.endpoint_url}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 tabular">
                      <div>${Number(app.price_prompt_usd || 0).toFixed(2)} prompt</div>
                      <div className="text-[10px] text-slate-400">${Number(app.price_completion_usd || 0).toFixed(2)} compl</div>
                    </td>
                    <td className="py-2.5 px-3">
                      {app.contact_email ? (
                        <div className="flex items-center gap-1 text-emerald-400">
                          <Mail className="w-3 h-3 shrink-0" />
                          <a href={`mailto:${app.contact_email}`} className="hover:underline truncate max-w-[150px]">
                            {app.contact_email}
                          </a>
                        </div>
                      ) : (
                        <div className="text-slate-500 text-[10px]">No email</div>
                      )}
                      {app.website && (
                        <div className="text-[10px] text-blue-400 mt-0.5 flex items-center gap-1">
                          <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                          <a href={app.website} target="_blank" rel="noopener noreferrer" className="hover:underline truncate max-w-[150px]">
                            {app.website}
                          </a>
                        </div>
                      )}
                      {app.message && (
                        <div className="text-[9.5px] text-slate-400 mt-1 italic line-clamp-1" title={app.message}>
                          "{app.message}"
                        </div>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-1.5 py-0.5 rounded-[2px] text-[9.5px] font-bold uppercase ${
                        app.status === "APPROVED"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          : app.status === "REJECTED"
                          ? "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                      }`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="inline-flex items-center gap-1.5 flex-wrap justify-end">
                        {app.status === "PENDING_REVIEW" && (
                          <>
                            <button
                              onClick={() => handleAppAction(app.id, "approve")}
                              className="px-2 py-1 rounded-[2px] bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] uppercase tracking-wider transition"
                              title="Approve & automatically provision into verxl.providers"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleAppAction(app.id, "reject")}
                              className="px-2 py-1 rounded-[2px] bg-slate-800 hover:bg-slate-700 text-rose-300 text-[10px] uppercase tracking-wider transition"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {app.contact_email && (
                          <button
                            onClick={() => {
                              setMailForm({
                                recipient: app.contact_email,
                                subject: `Regarding your Verxl Provider Application (${app.name})`,
                                body: `Hello ${app.name} Team,\n\nWe have reviewed your application to register ${app.model_identifier} on the Verxl Protocol.\n\nBest regards,\nŠimon Havlík\nVerxl Protocol Admin`,
                                providerId: app.id,
                              });
                              const el = document.getElementById("verxl-agent-mail-box");
                              if (el) el.scrollIntoView({ behavior: "smooth" });
                            }}
                            className="px-2 py-1 rounded-[2px] bg-[#05070b] border border-blue-500/40 hover:bg-blue-600 hover:text-white text-blue-300 text-[10px] transition flex items-center gap-1"
                            title="Compose email to provider via automated@verxl.com"
                          >
                            <Mail className="w-3 h-3" />
                            <span>Mail</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleAppAction(app.id, "delete")}
                          className="p-1 rounded-[2px] bg-[#05070b] border border-slate-800 hover:border-rose-500 text-slate-400 hover:text-rose-400 transition"
                          title="Delete application record"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SECTION 2: LIVE PROVIDER MONITORING & TRAFFIC ANALYTICS */}
      <div className="bg-[#0a0e17] border border-slate-800 rounded-[4px] p-4 space-y-3 shadow-md">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Compute Fleet Traffic Monitoring ({monitoredProviders.length} Nodes)
            </h3>
          </div>
          <span className="text-[10px] text-slate-400">
            Real-time usage aggregation from <code>verxl.usage_records</code>
          </span>
        </div>

        {loadingMonitoring ? (
          <div className="text-center py-6 text-xs text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
            <span>Loading provider traffic telemetry...</span>
          </div>
        ) : monitoredProviders.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-400 bg-[#05070b] border border-slate-800 rounded-[3px]">
            No providers registered in <code>verxl.providers</code> yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-[#05070b] text-[10px] text-slate-400 uppercase tracking-wider">
                  <th className="py-2 px-3">NODE / CLUSTER</th>
                  <th className="py-2 px-3">REQUESTS SERVED</th>
                  <th className="py-2 px-3">TOKENS (PROMPT / COMPL)</th>
                  <th className="py-2 px-3">VOLUME / EARNINGS</th>
                  <th className="py-2 px-3">LAST REQUEST</th>
                  <th className="py-2 px-3">STATUS</th>
                  <th className="py-2 px-3 text-right">MANAGE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {monitoredProviders.map((node) => (
                  <tr key={node.id} className="hover:bg-slate-800/20 transition">
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span>{node.name}</span>
                        {node.is_official_bridge ? (
                          <span className="px-1 py-0.2 rounded-[2px] bg-purple-500/20 text-purple-300 text-[8.5px] font-bold">
                            BRIDGE
                          </span>
                        ) : (
                          <span className="px-1 py-0.2 rounded-[2px] bg-blue-500/20 text-blue-300 text-[8.5px] font-bold">
                            BARE-METAL
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate max-w-[220px]" title={node.base_url}>
                        {node.base_url || "Local Engine"}
                      </div>
                      {node.contact_email && (
                        <div className="text-[9.5px] text-emerald-400 mt-0.5 flex items-center gap-1">
                          <Mail className="w-2.5 h-2.5" />
                          <span>{node.contact_email}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-2.5 px-3 tabular">
                      <div className="font-bold text-white">{Number(node.request_count || 0).toLocaleString()} reqs</div>
                      <div className="text-[9.5px] text-slate-400">Total processed</div>
                    </td>
                    <td className="py-2.5 px-3 tabular">
                      <div className="text-slate-200">
                        {(Number(node.total_prompt_tokens || 0) + Number(node.total_completion_tokens || 0)).toLocaleString()} total
                      </div>
                      <div className="text-[9.5px] text-slate-400">
                        {Number(node.total_prompt_tokens || 0).toLocaleString()} in / {Number(node.total_completion_tokens || 0).toLocaleString()} out
                      </div>
                    </td>
                    <td className="py-2.5 px-3 tabular">
                      <div className="font-bold text-emerald-400">
                        ${Number(node.total_earned_usd || node.total_revenue_usd || 0).toFixed(4)} USD
                      </div>
                      <div className="text-[9.5px] text-slate-400">
                        Pending: ${Number(node.pending_payout_usd || 0).toFixed(4)}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 tabular">
                      {node.last_request_at ? (
                        <div className="text-slate-300 text-[10.5px]">
                          {new Date(node.last_request_at).toLocaleString([], { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </div>
                      ) : (
                        <div className="text-slate-500 text-[10px]">No recorded traffic</div>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-1.5 py-0.5 rounded-[2px] text-[9.5px] font-bold uppercase ${
                        node.status === "ACTIVE"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          : node.status === "SUSPENDED"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                          : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                      }`}>
                        {node.status || "ACTIVE"}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        {node.status === "ACTIVE" ? (
                          <button
                            onClick={() => handleProviderStatus(node.id, "SUSPENDED")}
                            className="px-2 py-1 rounded-[2px] bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] uppercase font-bold transition"
                            title="Suspend node from live routing queue"
                          >
                            Suspend
                          </button>
                        ) : (
                          <button
                            onClick={() => handleProviderStatus(node.id, "ACTIVE")}
                            className="px-2 py-1 rounded-[2px] bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] uppercase font-bold transition"
                            title="Reactivate node routing"
                          >
                            Activate
                          </button>
                        )}
                        <button
                          onClick={() => handleProviderStatus(node.id, "REVOKED")}
                          className="px-2 py-1 rounded-[2px] bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] uppercase font-bold transition"
                          title="Revoke and permanently decommission node"
                        >
                          Revoke
                        </button>
                        {node.contact_email && (
                          <button
                            onClick={() => {
                              setMailForm({
                                recipient: node.contact_email,
                                subject: `Operational Notice: ${node.name}`,
                                body: `Hello ${node.name} Admin,\n\nNotice regarding your node status on Verxl Protocol.\n\nBest regards,\nŠimon Havlík\nVerxl Protocol`,
                                providerId: node.id,
                              });
                              const el = document.getElementById("verxl-agent-mail-box");
                              if (el) el.scrollIntoView({ behavior: "smooth" });
                            }}
                            className="p-1 rounded-[2px] bg-[#05070b] border border-blue-500/30 hover:border-blue-400 text-blue-300 transition"
                            title="Send email to node operator"
                          >
                            <Mail className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Recent Live Traffic Logs */}
        {recentTrafficLogs.length > 0 && (
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-wider font-bold">
              <span className="flex items-center gap-1.5 text-white">
                <Activity className="w-3 h-3 text-emerald-400" />
                <span>Recent Network Inferences (Live Stream)</span>
              </span>
              <span>{recentTrafficLogs.length} transactions</span>
            </div>
            <div className="bg-[#05070b] border border-slate-800/80 rounded-[3px] p-2 space-y-1 max-h-36 overflow-y-auto text-[10px] font-mono">
              {recentTrafficLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between border-b border-slate-900 pb-1 text-slate-300">
                  <div className="truncate max-w-[280px]">
                    <span className="text-blue-300 font-semibold">{log.model}</span>
                    <span className="text-slate-500 ml-2">via {log.provider_id}</span>
                  </div>
                  <div className="flex items-center gap-2 tabular">
                    <span>{log.prompt_tokens}p + {log.completion_tokens}c</span>
                    <span className="text-emerald-400 font-bold">${Number(log.total_cost_usd || 0).toFixed(4)}</span>
                    <span className="text-slate-500 text-[9px]">{new Date(log.created_at).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* SECTION 3: VERXL AGENT MAIL (automated@verxl.com via Seznam SMTP / IMAP) */}
      <div id="verxl-agent-mail-box" className="bg-[#0a0e17] border border-blue-500/30 rounded-[4px] p-4 space-y-4 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Verxl Agent Mail Gateway (automated@verxl.com)
              </h3>
            </div>
            <p className="text-[10.5px] text-slate-400 font-sans">
              Direct encrypted correspondence with provider applicants and compute hosts through the official protocol mailbox.
            </p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-[2px] bg-blue-500/10 text-blue-400 border border-blue-500/20 self-start sm:self-auto">
            SMTP: smtp.seznam.cz · IMAP: imap.seznam.cz
          </span>
        </div>

        {mailFeedback && (
          <div className="p-2.5 rounded-[2px] bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
            <span>{mailFeedback}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Compose Message Form */}
          <form onSubmit={handleSendMail} className="space-y-3 bg-[#05070b] border border-slate-800 p-3 rounded-[3px]">
            <div className="text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Send className="w-3 h-3 text-blue-400" />
              <span>Compose Dispatch from automated@verxl.com</span>
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 uppercase mb-1">Recipient Provider Email</label>
              <input
                type="email"
                required
                placeholder="host@cluster.network"
                value={mailForm.recipient}
                onChange={(e) => setMailForm({ ...mailForm, recipient: e.target.value })}
                className="w-full bg-[#0a0e17] border border-slate-700 rounded-[2px] px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 uppercase mb-1">Subject</label>
              <input
                type="text"
                required
                placeholder="Notice of Activation / SLA Compliance"
                value={mailForm.subject}
                onChange={(e) => setMailForm({ ...mailForm, subject: e.target.value })}
                className="w-full bg-[#0a0e17] border border-slate-700 rounded-[2px] px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 uppercase mb-1">Message Body</label>
              <textarea
                rows={4}
                required
                placeholder="Write your notice or instruction to the provider..."
                value={mailForm.body}
                onChange={(e) => setMailForm({ ...mailForm, body: e.target.value })}
                className="w-full bg-[#0a0e17] border border-slate-700 rounded-[2px] p-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={sendingMail || !mailForm.recipient || !mailForm.body}
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-[2px] transition flex items-center justify-center gap-1.5"
            >
              <Send className="w-3 h-3" />
              <span>{sendingMail ? "Dispatching via SMTP..." : "Send Message via automated@verxl.com"}</span>
            </button>
          </form>

          {/* Message History & Inbound Emails Feed */}
          <div className="bg-[#05070b] border border-slate-800 p-3 rounded-[3px] space-y-2.5 flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
              <div className="text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="w-3 h-3 text-purple-400" />
                <span>Agent Mail Correspondence Feed</span>
              </div>
              <span className="text-[9.5px] text-slate-400">
                {providerMessages.length} messages
              </span>
            </div>

            <div className="space-y-2 overflow-y-auto max-h-[300px] pr-1">
              {providerMessages.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500">
                  No emails recorded yet. Sent messages and replies from providers will sync here.
                </div>
              ) : (
                providerMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-2.5 rounded-[2px] border text-xs space-y-1 ${
                      msg.direction === "INBOUND"
                        ? "bg-purple-950/20 border-purple-500/30 text-purple-200"
                        : "bg-blue-950/20 border-blue-500/30 text-blue-200"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[9.5px]">
                      <span className={`px-1 py-0.2 rounded font-bold uppercase ${
                        msg.direction === "INBOUND"
                          ? "bg-purple-500/20 text-purple-300"
                          : "bg-blue-500/20 text-blue-300"
                      }`}>
                        {msg.direction === "INBOUND" ? "INBOUND (REPLY)" : "OUTBOUND (SENT)"}
                      </span>
                      <span className="text-slate-400 tabular">
                        {new Date(msg.created_at).toLocaleString([], { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <div className="font-semibold text-white text-[11px]">
                      {msg.subject}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {msg.direction === "INBOUND" ? `From: ${msg.sender}` : `To: ${msg.recipient}`}
                    </div>
                    <p className="text-[10.5px] text-slate-300 whitespace-pre-wrap font-sans bg-[#0a0e17] p-2 rounded-[2px] border border-slate-800/80">
                      {msg.body}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
