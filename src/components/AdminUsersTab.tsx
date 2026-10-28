import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Users,
  RefreshCw,
  Copy,
  DollarSign,
  Eye,
  Key,
  Activity,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

export const AdminUsersTab: React.FC = () => {
  const { user, token } = useAuth();

  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUserDetail, setSelectedUserDetail] = useState<{
    user: any;
    keys: any[];
    usage: any[];
    deposits: any[];
  } | null>(null);
  const [loadingUserDetail, setLoadingUserDetail] = useState(false);
  const [balanceModalUser, setBalanceModalUser] = useState<any | null>(null);
  const [newBalanceInput, setNewBalanceInput] = useState("");
  const [savingBalance, setSavingBalance] = useState(false);
  const [userAdminFeedback, setUserAdminFeedback] = useState<string | null>(null);

  const fetchAdminUsers = async () => {
    if (!token) return;
    setLoadingUsers(true);
    try {
      const res = await fetch("/api/admin/users", { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = (await res.json()) as any;
        setAdminUsers(data.users || []);
      }
    } catch (err) {
      console.warn("Failed to load admin users:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchAdminUsers();
  }, [token]);

  const handleInspectUser = async (userId: string) => {
    if (!token) return;
    setLoadingUserDetail(true);
    try {
      const res = await fetch(`/api/admin/users?user_id=${encodeURIComponent(userId)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = (await res.json()) as any;
        setSelectedUserDetail(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingUserDetail(false);
    }
  };

  const handleRewriteBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !balanceModalUser) return;
    const amount = parseFloat(newBalanceInput);
    if (isNaN(amount) || amount < 0) return;
    setSavingBalance(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          user_id: balanceModalUser.id,
          action: "rewrite_balance",
          balance_usd: amount,
        }),
      });
      if (res.ok) {
        setUserAdminFeedback(`Account balance for ${balanceModalUser.email} updated to $${amount.toFixed(2)} USD`);
        setBalanceModalUser(null);
        setNewBalanceInput("");
        await fetchAdminUsers();
      }
    } catch {
      setUserAdminFeedback("Failed to update balance");
    } finally {
      setSavingBalance(false);
      setTimeout(() => setUserAdminFeedback(null), 6000);
    }
  };

  const handleToggleUserStatus = async (targetUser: any) => {
    if (!token) return;
    const newStatus = targetUser.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          user_id: targetUser.id,
          action: "set_status",
          status: newStatus,
        }),
      });
      if (res.ok) {
        setUserAdminFeedback(`User status changed to ${newStatus}`);
        await fetchAdminUsers();
      }
    } catch {
      setUserAdminFeedback("Failed to change user status");
    } finally {
      setTimeout(() => setUserAdminFeedback(null), 6000);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-5 font-mono">
      {/* Header Banner */}
      <div className="bg-[#0a0e17] border border-emerald-500/30 rounded-[4px] p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-lg">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-[1px] bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Admin User Management & Sovereign Account Governance
            </span>
            <span className="px-1.5 py-0.2 rounded-[2px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-bold">
              ŠIMON ADMIN CONSOLE
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-sans">
            Inspect registered users, rewrite non-custodial balances, toggle account suspensions, and audit token usage activity across Charizard PostgreSQL.
          </p>
        </div>
        <button
          onClick={fetchAdminUsers}
          disabled={loadingUsers}
          className="hero-btn hero-btn--ghost !py-1.5 !px-3 !text-[11px] flex items-center gap-1.5 self-start md:self-auto"
        >
          <RefreshCw className={`w-3 h-3 ${loadingUsers ? "animate-spin text-emerald-400" : "text-slate-400"}`} />
          <span>Refresh Users</span>
        </button>
      </div>

      {userAdminFeedback && (
        <div className="p-3 rounded-[3px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{userAdminFeedback}</span>
        </div>
      )}

      {/* Quick Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#0a0e17] border border-slate-800 p-3 rounded-[3px]">
          <div className="text-[10px] text-slate-400 uppercase">Registered Users</div>
          <div className="text-base font-bold text-white mt-1 tabular">{adminUsers.length}</div>
        </div>
        <div className="bg-[#0a0e17] border border-slate-800 p-3 rounded-[3px]">
          <div className="text-[10px] text-slate-400 uppercase">Cumulative Custody</div>
          <div className="text-base font-bold text-emerald-400 mt-1 tabular">
            ${adminUsers.reduce((sum, u) => sum + Number(u.balance_usd || 0), 0).toFixed(2)} USD
          </div>
        </div>
        <div className="bg-[#0a0e17] border border-slate-800 p-3 rounded-[3px]">
          <div className="text-[10px] text-slate-400 uppercase">Total Deposited</div>
          <div className="text-base font-bold text-blue-400 mt-1 tabular">
            ${adminUsers.reduce((sum, u) => sum + Number(u.total_deposited_usd || 0), 0).toFixed(2)} USD
          </div>
        </div>
        <div className="bg-[#0a0e17] border border-slate-800 p-3 rounded-[3px]">
          <div className="text-[10px] text-slate-400 uppercase">Total Spent (Usage)</div>
          <div className="text-base font-bold text-purple-400 mt-1 tabular">
            ${adminUsers.reduce((sum, u) => sum + Number(u.total_spent_usd || 0), 0).toFixed(2)} USD
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[#0a0e17] border border-slate-800 rounded-[4px] p-4 space-y-3 shadow-md">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              All Platform Users ({adminUsers.length})
            </h3>
          </div>
          <span className="text-[10px] text-slate-400">
            Source: <code>verxl.users</code>
          </span>
        </div>

        {loadingUsers ? (
          <div className="text-center py-6 text-xs text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
            <span>Loading users from PostgreSQL...</span>
          </div>
        ) : adminUsers.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-400 bg-[#05070b] border border-slate-800 rounded-[3px]">
            No users found in <code>verxl.users</code>.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-[#05070b] text-[10px] text-slate-400 uppercase tracking-wider">
                  <th className="py-2 px-3">USER IDENTIFIER</th>
                  <th className="py-2 px-3">WALLET ADDRESS</th>
                  <th className="py-2 px-3">ACCOUNT BALANCE</th>
                  <th className="py-2 px-3">DEPOSITED / SPENT</th>
                  <th className="py-2 px-3">KEYS / REQS</th>
                  <th className="py-2 px-3">STATUS</th>
                  <th className="py-2 px-3 text-right">ADMIN ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {adminUsers.map((u) => {
                  const isCurrentUser = u.email?.toLowerCase() === user?.email?.toLowerCase();
                  return (
                    <tr key={u.id} className="hover:bg-slate-800/20 transition">
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <span>{u.email}</span>
                          {isCurrentUser && (
                            <span className="px-1 py-0.2 rounded-[2px] bg-purple-500/20 text-purple-300 text-[8.5px] font-bold">
                              YOU (ADMIN)
                            </span>
                          )}
                        </div>
                        <div className="text-[9.5px] text-slate-500 font-mono">{u.id}</div>
                      </td>
                      <td className="py-2.5 px-3 font-mono">
                        {u.wallet_address ? (
                          <div className="flex items-center gap-1 text-blue-300 text-[10.5px]">
                            <span title={u.wallet_address}>
                              {u.wallet_address.slice(0, 6)}...{u.wallet_address.slice(-4)}
                            </span>
                            <button
                              onClick={() => handleCopy(u.wallet_address)}
                              className="text-slate-400 hover:text-white p-0.5"
                              title="Copy Wallet Address"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-[10px]">—</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 tabular">
                        <div className="font-bold text-emerald-400 text-sm">
                          ${Number(u.balance_usd || 0).toFixed(2)} USD
                        </div>
                      </td>
                      <td className="py-2.5 px-3 tabular">
                        <div className="text-slate-200">
                          +${Number(u.total_deposited_usd || 0).toFixed(2)} dep
                        </div>
                        <div className="text-[10px] text-slate-400">
                          -${Number(u.total_spent_usd || 0).toFixed(2)} spent
                        </div>
                      </td>
                      <td className="py-2.5 px-3 tabular">
                        <div className="text-white">{u.key_count || 0} keys</div>
                        <div className="text-[10px] text-slate-400">{u.req_count || 0} requests</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-1.5 py-0.5 rounded-[2px] text-[9.5px] font-bold uppercase ${
                          u.status === "ACTIVE"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                        }`}>
                          {u.status || "ACTIVE"}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          <button
                            onClick={() => {
                              setBalanceModalUser(u);
                              setNewBalanceInput(String(Number(u.balance_usd || 0).toFixed(2)));
                            }}
                            className="px-2 py-1 rounded-[2px] bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold uppercase tracking-wider transition flex items-center gap-1"
                            title="Rewrite balance in database"
                          >
                            <DollarSign className="w-3 h-3" />
                            <span>Balance</span>
                          </button>

                          <button
                            onClick={() => handleToggleUserStatus(u)}
                            className={`px-2 py-1 rounded-[2px] text-[10px] font-bold uppercase tracking-wider transition ${
                              u.status === "ACTIVE"
                                ? "bg-slate-800 hover:bg-rose-900/40 text-rose-300 border border-rose-500/30"
                                : "bg-emerald-600 hover:bg-emerald-500 text-white"
                            }`}
                            title="Suspend or reactivate user account"
                          >
                            {u.status === "ACTIVE" ? "Suspend" : "Activate"}
                          </button>

                          <button
                            onClick={() => handleInspectUser(u.id)}
                            disabled={loadingUserDetail}
                            className="p-1 rounded-[2px] bg-[#05070b] border border-slate-700 hover:border-slate-400 text-slate-300 hover:text-white transition disabled:opacity-50"
                            title="Inspect user activity (keys, usage, deposits)"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* REWRITE BALANCE MODAL */}
      {balanceModalUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-[#0a0e17] border border-blue-500/40 rounded-[4px] max-w-md w-full p-5 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Rewrite User Balance
                </h3>
              </div>
              <button
                onClick={() => setBalanceModalUser(null)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1 text-xs">
              <div className="text-slate-400 text-[10.5px]">Target Account:</div>
              <div className="font-bold text-white">{balanceModalUser.email}</div>
              <div className="text-[10px] text-slate-500 font-mono">{balanceModalUser.id}</div>
            </div>

            <form onSubmit={handleRewriteBalance} className="space-y-3">
              <div>
                <label className="block text-[10px] text-slate-400 uppercase mb-1">
                  New Account Balance ($ USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={newBalanceInput}
                  onChange={(e) => setNewBalanceInput(e.target.value)}
                  className="w-full bg-[#05070b] border border-slate-700 rounded-[2px] px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setBalanceModalUser(null)}
                  className="w-1/2 py-2 rounded-[2px] bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingBalance}
                  className="w-1/2 py-2 rounded-[2px] bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider transition"
                >
                  {savingBalance ? "Saving..." : "Commit Balance"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* USER ACTIVITY INSPECTION MODAL */}
      {selectedUserDetail && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#0a0e17] border border-blue-500/40 rounded-[4px] max-w-2xl w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 shadow-2xl relative space-y-4 my-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  User Telemetry Audit: {selectedUserDetail.user.email}
                </h3>
              </div>
              <button
                onClick={() => setSelectedUserDetail(null)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-[#05070b] p-2.5 rounded-[2px] border border-slate-800">
                <div className="text-[9.5px] text-slate-400">Balance</div>
                <div className="font-bold text-emerald-400 mt-0.5">${selectedUserDetail.user.balance_usd.toFixed(2)}</div>
              </div>
              <div className="bg-[#05070b] p-2.5 rounded-[2px] border border-slate-800">
                <div className="text-[9.5px] text-slate-400">Total Deposited</div>
                <div className="font-bold text-blue-400 mt-0.5">${selectedUserDetail.user.total_deposited_usd.toFixed(2)}</div>
              </div>
              <div className="bg-[#05070b] p-2.5 rounded-[2px] border border-slate-800">
                <div className="text-[9.5px] text-slate-400">Total Spent</div>
                <div className="font-bold text-purple-400 mt-0.5">${selectedUserDetail.user.total_spent_usd.toFixed(2)}</div>
              </div>
              <div className="bg-[#05070b] p-2.5 rounded-[2px] border border-slate-800">
                <div className="text-[9.5px] text-slate-400">Status</div>
                <div className="font-bold text-white mt-0.5">{selectedUserDetail.user.status}</div>
              </div>
            </div>

            {/* API Keys */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-bold text-white uppercase flex items-center gap-1.5">
                <Key className="w-3 h-3 text-amber-400" />
                <span>API Keys ({selectedUserDetail.keys.length})</span>
              </div>
              <div className="bg-[#05070b] p-2 rounded-[2px] border border-slate-800 text-xs space-y-1 max-h-36 overflow-y-auto">
                {selectedUserDetail.keys.length === 0 ? (
                  <div className="text-slate-500 text-[10.5px]">No API keys created.</div>
                ) : (
                  selectedUserDetail.keys.map((k) => (
                    <div key={k.id} className="flex items-center justify-between font-mono text-[10.5px] text-slate-300 border-b border-slate-900 pb-1">
                      <div>
                        <span className="text-blue-300">{k.key_prefix}••••</span>
                        <span className="text-slate-500 ml-2">({k.name})</span>
                      </div>
                      <span className={`px-1 py-0.2 rounded text-[8.5px] ${k.is_active ? "bg-emerald-500/20 text-emerald-300" : "bg-slate-800 text-slate-400"}`}>
                        {k.is_active ? "ACTIVE" : "REVOKED"}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Usage Records */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-bold text-white uppercase flex items-center gap-1.5">
                <Activity className="w-3 h-3 text-blue-400" />
                <span>Recent Inference Activity (Last 50)</span>
              </div>
              <div className="bg-[#05070b] p-2 rounded-[2px] border border-slate-800 text-xs space-y-1 max-h-48 overflow-y-auto">
                {selectedUserDetail.usage.length === 0 ? (
                  <div className="text-slate-500 text-[10.5px]">No usage records logged.</div>
                ) : (
                  selectedUserDetail.usage.map((u) => (
                    <div key={u.id} className="flex items-center justify-between font-mono text-[10px] text-slate-300 border-b border-slate-900 pb-1">
                      <div>
                        <span className="text-blue-300 font-semibold">{u.model}</span>
                        <span className="text-slate-500 ml-2">{u.prompt_tokens}p + {u.completion_tokens}c</span>
                      </div>
                      <div className="text-right">
                        <span className="text-emerald-400 font-bold">${Number(u.total_cost_usd || 0).toFixed(4)}</span>
                        <span className="text-slate-500 ml-2 text-[9px]">{new Date(u.created_at).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Deposits */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-bold text-white uppercase flex items-center gap-1.5">
                <DollarSign className="w-3 h-3 text-emerald-400" />
                <span>On-Chain Arbitrum Deposits ({selectedUserDetail.deposits.length})</span>
              </div>
              <div className="bg-[#05070b] p-2 rounded-[2px] border border-slate-800 text-xs space-y-1 max-h-36 overflow-y-auto">
                {selectedUserDetail.deposits.length === 0 ? (
                  <div className="text-slate-500 text-[10.5px]">No deposits logged yet.</div>
                ) : (
                  selectedUserDetail.deposits.map((d) => (
                    <div key={d.id} className="flex items-center justify-between font-mono text-[10px] text-slate-300 border-b border-slate-900 pb-1">
                      <a
                        href={`https://arbiscan.io/tx/${d.tx_hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline flex items-center gap-1"
                      >
                        <span>{d.tx_hash.slice(0, 14)}...</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400 font-bold">+${Number(d.amount_usd || 0).toFixed(2)} USDC</span>
                        <span className="text-[8.5px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                          {d.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedUserDetail(null)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider rounded-[2px]"
            >
              Close Audit Inspector
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
