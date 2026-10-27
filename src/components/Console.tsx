import React, { useState, useEffect } from "react";
import {
  Key,
  Wallet,
  DollarSign,
  ArrowUpRight,
  ShieldCheck,
  Mail,
  Copy,
  Check,
  RefreshCw,
  AlertTriangle,
  Code2,
  Terminal,
  Lock,
  Activity,
  Send,
  LogOut,
} from "lucide-react";

interface UserProfile {
  id: string;
  email: string;
  wallet_address: string | null;
  balance_usd: number;
  total_deposited_usd: number;
  total_spent_usd: number;
  has_active_key: boolean;
}

interface ApiKeyItem {
  id: string;
  key_prefix: string;
  name: string;
  is_active: number;
  created_at: string;
}

interface UsageItem {
  id: string;
  model: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_cost_usd: number;
  protocol_fee_usd: number;
  created_at: string;
}

const TREASURY_WALLET = "0x5AE718197a6A87E103B124b660fd49692C857aE0";

export const Console: React.FC = () => {
  // Session & Auth State
  const [token, setToken] = useState<string | null>(() => {
    return typeof window !== "undefined" ? localStorage.getItem("vrxl_auth_token") : null;
  });
  const [user, setUser] = useState<UserProfile | null>(null);
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [usage, setUsage] = useState<UsageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  // Auth Inputs
  const [emailInput, setEmailInput] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpSending, setOtpSending] = useState(false);

  // Key Creation Modal
  const [newKeyName, setNewKeyName] = useState("Production Key");
  const [generatedKeySecret, setGeneratedKeySecret] = useState<string | null>(null);
  const [creatingKey, setCreatingKey] = useState(false);

  // Deposit State
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositChain, setDepositChain] = useState<"arbitrum" | "arbitrum_sepolia">("arbitrum");
  const [depositTxHash, setDepositTxHash] = useState("");
  const [depositAmount, setDepositAmount] = useState<number>(5.0);
  const [verifyingDeposit, setVerifyingDeposit] = useState(false);

  // Provider Payout State
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutProviderId, setPayoutProviderId] = useState("bulbasaur-prague-01");
  const [payoutAddress, setPayoutAddress] = useState("0x911C47E439971FE9f8487D43c659C990CE0589d7");
  const [payoutAmount, setPayoutAmount] = useState<number>(2.5);
  const [payoutPendingBalance, setPayoutPendingBalance] = useState<number>(12.45);
  const [submittingPayout, setSubmittingPayout] = useState(false);
  const [payoutReceipt, setPayoutReceipt] = useState<any | null>(null);

  // UI Utilities
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedTreasury, setCopiedTreasury] = useState(false);
  const [codeLang, setCodeLang] = useState<"curl" | "python" | "typescript">("curl");

  // Fetch Session Data
  const fetchSessionData = async (currentToken: string) => {
    try {
      setLoading(true);
      const res = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      if (res.ok) {
        const data = (await res.json()) as any;
        setUser(data.user);
        setKeys(data.keys || []);
        setUsage(data.usage || []);
      } else {
        // Token expired
        localStorage.removeItem("vrxl_auth_token");
        setToken(null);
        setUser(null);
      }
    } catch {
      // offline or mock
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchSessionData(token);
    }
  }, [token]);

  // Fetch Provider Info for Payout Drawer
  const fetchProviderStats = async (id: string) => {
    try {
      const res = await fetch(`/api/provider/payout?provider_id=${encodeURIComponent(id)}`);
      if (res.ok) {
        const data = (await res.json()) as any;
        if (data.provider) {
          setPayoutPendingBalance(data.provider.pending_payout_usd || 0.0);
          setPayoutAddress(data.provider.payout_address || "");
        }
      }
    } catch {}
  };

  useEffect(() => {
    if (showPayoutModal) {
      fetchProviderStats(payoutProviderId);
    }
  }, [showPayoutModal, payoutProviderId]);

  // Handlers: Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !emailInput.includes("@")) {
      setStatusMsg({ type: "error", text: "Please enter a valid institutional email." });
      return;
    }
    setOtpSending(true);
    setStatusMsg(null);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput }),
      });
      const data = (await res.json()) as any;
      if (res.ok) {
        setOtpSent(true);
        setStatusMsg({ type: "success", text: `Verification code sent to ${emailInput}. Check inbox or spam.` });
      } else {
        setStatusMsg({ type: "error", text: data.error || "Failed to send verification code." });
      }
    } catch (err: any) {
      setStatusMsg({ type: "error", text: "Network error sending code: " + err.message });
    } finally {
      setOtpSending(false);
    }
  };

  // Handlers: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpInput || otpInput.trim().length !== 6) {
      setStatusMsg({ type: "error", text: "Please enter the 6-digit code received via email." });
      return;
    }
    setLoading(true);
    setStatusMsg(null);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput, code: otpInput.trim() }),
      });
      const data = (await res.json()) as any;
      if (res.ok) {
        localStorage.setItem("vrxl_auth_token", data.token);
        setToken(data.token);
        setUser(data.user);
        setStatusMsg({ type: "success", text: "Authenticated successfully." });
        setOtpSent(false);
        setOtpInput("");
        fetchSessionData(data.token);
      } else {
        setStatusMsg({ type: "error", text: data.error || "Invalid verification code." });
      }
    } catch (err: any) {
      setStatusMsg({ type: "error", text: "Authentication error: " + err.message });
    } finally {
      setLoading(false);
    }
  };

  // Handlers: Logout
  const handleLogout = () => {
    localStorage.removeItem("vrxl_auth_token");
    setToken(null);
    setUser(null);
    setKeys([]);
    setUsage([]);
    setStatusMsg({ type: "info", text: "Logged out." });
  };

  // Handlers: Create API Key
  const handleCreateKey = async () => {
    if (!token) return;
    setCreatingKey(true);
    setStatusMsg(null);
    try {
      const res = await fetch("/api/keys/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newKeyName }),
      });
      const data = (await res.json()) as any;
      if (res.ok) {
        setGeneratedKeySecret(data.api_key);
        fetchSessionData(token);
      } else {
        setStatusMsg({ type: "error", text: data.error || "Failed to generate key." });
      }
    } catch (err: any) {
      setStatusMsg({ type: "error", text: "Key creation error: " + err.message });
    } finally {
      setCreatingKey(false);
    }
  };

  // Handlers: Revoke Key
  const handleRevokeKey = async (keyId: string) => {
    if (!token) return;
    try {
      const res = await fetch("/api/keys/revoke", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ key_id: keyId }),
      });
      if (res.ok) {
        fetchSessionData(token);
        setStatusMsg({ type: "info", text: "API key revoked." });
      }
    } catch {}
  };

  // Handlers: Verify Deposit
  const handleVerifyDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (!depositTxHash || !depositTxHash.startsWith("0x")) {
      setStatusMsg({ type: "error", text: "Valid 0x transaction hash is required." });
      return;
    }
    setVerifyingDeposit(true);
    setStatusMsg(null);
    try {
      const res = await fetch("/api/deposit/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tx_hash: depositTxHash.trim(),
          chain: depositChain,
          amount_usd: depositAmount,
        }),
      });
      const data = (await res.json()) as any;
      if (res.ok) {
        setStatusMsg({
          type: "success",
          text: `Deposit confirmed! Credited $${data.amount_usd.toFixed(2)} USD. Your balance is now $${data.new_balance_usd.toFixed(2)} USD.`,
        });
        if (data.new_api_key) {
          setGeneratedKeySecret(data.new_api_key);
        }
        setShowDepositModal(false);
        setDepositTxHash("");
        fetchSessionData(token);
      } else {
        setStatusMsg({ type: "error", text: data.error || "Deposit verification failed." });
      }
    } catch (err: any) {
      setStatusMsg({ type: "error", text: "Verification network error: " + err.message });
    } finally {
      setVerifyingDeposit(false);
    }
  };

  // Handlers: Request Provider Payout
  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (payoutAmount < 1.0) {
      setStatusMsg({ type: "error", text: "Minimum payout is $1.00 USD (1 USDC)." });
      return;
    }
    setSubmittingPayout(true);
    setStatusMsg(null);
    try {
      const res = await fetch("/api/provider/payout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider_id: payoutProviderId,
          amount_usd: payoutAmount,
          payout_address: payoutAddress.trim(),
        }),
      });
      const data = (await res.json()) as any;
      if (res.ok) {
        setPayoutReceipt(data);
        setStatusMsg({
          type: "success",
          text: `Payout request of $${data.amount_usd.toFixed(2)} USD queued! Net settlement: $${data.net_payout_usd.toFixed(2)} USD (50 bps fee).`,
        });
        fetchProviderStats(payoutProviderId);
      } else {
        setStatusMsg({ type: "error", text: data.error || "Payout request failed." });
      }
    } catch (err: any) {
      setStatusMsg({ type: "error", text: "Payout network error: " + err.message });
    } finally {
      setSubmittingPayout(false);
    }
  };

  const copyToClipboard = (text: string, setter: (val: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  // Code Snippets Template
  const activeKeyDisplay = keys.length > 0 ? keys[0].key_prefix.replace("...", "_abc123xyz") : "vrxl_live_your_key_here";
  const snippets = {
    curl: `curl -X POST https://verxl.com/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${activeKeyDisplay}" \\
  -d '{
    "model": "qwen3.5-4b-uncensored-8k",
    "messages": [{"role": "user", "content": "Explain Verxl 50 bps clearing switch"}],
    "temperature": 0.7
  }'`,
    python: `from openai import OpenAI

client = OpenAI(
    base_url="https://verxl.com/v1",
    api_key="${activeKeyDisplay}",
)

response = client.chat.completions.create(
    model="qwen3.5-4b-uncensored-8k",
    messages=[{"role": "user", "content": "Compute clearing proof"}],
)
print(response.choices[0].message.content)`,
    typescript: `import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://verxl.com/v1",
  apiKey: "${activeKeyDisplay}",
});

async function main() {
  const completion = await client.chat.completions.create({
    model: "qwen3.5-4b-uncensored-8k",
    messages: [{ role: "user", content: "Deterministic seed=42 verification" }],
  });
  console.log(completion.choices[0].message.content);
}
main();`,
  };

  return (
    <div className="space-y-6 font-mono text-slate-200">
      {/* Top Protocol Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-500/15 pb-2.5">
        <div className="flex items-center gap-2 text-xs">
          <Terminal className="w-3.5 h-3.5 text-blue-400" />
          <span className="font-semibold text-white uppercase tracking-wider">
            Commercial Clearing Console & Settlement
          </span>
          <span className="text-slate-400">·</span>
          <span className="text-blue-400 text-[11px]">Arbitrum USDC</span>
        </div>
        <div className="text-[10px] text-slate-400 flex items-center gap-2">
          <span>Fee: <strong className="text-emerald-400">50 bps (0.5%)</strong></span>
          <span className="text-slate-700">|</span>
          <span>Min Deposit: <strong className="text-white">$1.00 USD</strong></span>
          <span className="text-slate-700">|</span>
          <span>Min Payout: <strong className="text-white">$1.00 USD</strong></span>
        </div>
      </div>

      {/* Global Status Notification Banner */}
      {statusMsg && (
        <div
          className={`p-3 rounded-[2px] text-xs flex items-center justify-between border ${
            statusMsg.type === "success"
              ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-200"
              : statusMsg.type === "error"
              ? "bg-red-950/30 border-red-500/40 text-red-200"
              : "bg-blue-950/30 border-blue-500/40 text-blue-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMsg.type === "success" && <Check className="w-3.5 h-3.5 text-emerald-400" />}
            {statusMsg.type === "error" && <AlertTriangle className="w-3.5 h-3.5 text-red-400" />}
            <span>{statusMsg.text}</span>
          </div>
          <button
            onClick={() => setStatusMsg(null)}
            className="text-[10px] uppercase tracking-wider text-slate-400 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* SECTION 1: AUTHENTICATION / HEADER */}
      {!user ? (
        <div className="bg-[#0a0e17] border border-blue-500/20 rounded-[4px] p-6 shadow-xl relative overflow-hidden">
          <div className="max-w-xl mx-auto space-y-4">
            <div className="space-y-1.5 text-center">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[2px] bg-blue-500/10 border border-blue-500/30 text-[10px] text-blue-400 uppercase tracking-wider">
                <Lock className="w-3 h-3" />
                <span>Passwordless Cryptographic Authentication</span>
              </div>
              <h2 className="text-lg font-bold text-white uppercase tracking-wider">
                Access Developer Console
              </h2>
              <p className="text-xs text-slate-300 font-sans">
                Authenticate via one-time verification code dispatched from our verified mail node{" "}
                <span className="text-blue-400 font-mono">automated@verxl.com</span>. Zero passwords, zero custodial float.
              </p>
            </div>

            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-3 pt-2">
                <div>
                  <label className="block text-[11px] text-slate-400 uppercase tracking-wider mb-1">
                    Institutional Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      placeholder="developer@acme.com"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="w-full bg-[#05070b] border border-slate-700 rounded-[2px] pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={otpSending}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider py-2.5 rounded-[2px] transition flex items-center justify-center gap-2"
                >
                  {otpSending ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>{otpSending ? "Dispatching Code via SMTP..." : "Send Verification Code"}</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-3 pt-2">
                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 uppercase tracking-wider mb-1">
                    <span>Enter 6-Digit Code sent to {emailInput}</span>
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="text-blue-400 hover:underline text-[10px]"
                    >
                      Change Email
                    </button>
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    placeholder="123456"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ""))}
                    className="w-full bg-[#05070b] border border-blue-500/50 rounded-[2px] px-3 py-2.5 text-center text-lg tracking-[8px] font-mono text-white focus:outline-none focus:border-blue-400"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider py-2.5 rounded-[2px] transition flex items-center justify-center gap-2"
                >
                  {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Verify Code & Login</span>
                </button>
              </form>
            )}
          </div>
        </div>
      ) : (
        /* Logged In User Profile Bar */
        <div className="bg-[#0a0e17] border border-blue-500/30 rounded-[3px] p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[2px] bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">{user.email}</span>
                <span className="px-1.5 py-0.2 rounded-[2px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold">
                  AUTHENTICATED
                </span>
                {user.total_deposited_usd >= 1.0 ? (
                  <span className="px-1.5 py-0.2 rounded-[2px] bg-blue-500/10 text-blue-400 border border-blue-500/30 text-[9px] font-bold">
                    PRODUCTION ACTIVE
                  </span>
                ) : (
                  <span className="px-1.5 py-0.2 rounded-[2px] bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[9px] font-bold">
                    DEPOSIT REQUIRED (MIN $1)
                  </span>
                )}
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                Account ID: <span className="text-slate-300">{user.id}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchSessionData(token!)}
              className="px-2.5 py-1.5 rounded-[2px] bg-[#05070b] border border-slate-700 hover:border-slate-500 text-[11px] text-slate-300 flex items-center gap-1.5 transition"
              title="Refresh"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Sync</span>
            </button>
            <button
              onClick={() => setShowPayoutModal(true)}
              className="px-2.5 py-1.5 rounded-[2px] bg-[#05070b] border border-purple-500/40 hover:border-purple-400 text-purple-300 text-[11px] font-bold flex items-center gap-1.5 transition"
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-purple-400" />
              <span>Provider Payouts</span>
            </button>
            <button
              onClick={handleLogout}
              className="px-2.5 py-1.5 rounded-[2px] bg-red-950/20 border border-red-500/30 hover:border-red-500 text-[11px] text-red-300 flex items-center gap-1.5 transition"
            >
              <LogOut className="w-3 h-3" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}

      {/* SECTION 2: BALANCE & DEPOSIT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* Card 1: Available Balance */}
        <div className="bg-[#0a0e17] border border-blue-500/20 rounded-[3px] p-4 space-y-2 relative shadow-sm">
          <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-wider">
            <span>Available Account Balance</span>
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            ${user ? user.balance_usd.toFixed(4) : "0.0000"}{" "}
            <span className="text-xs font-normal text-emerald-400">USDC</span>
          </div>
          <div className="text-[10px] text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2">
            <span>50 bps Clearing Fee Included</span>
            <button
              onClick={() => setShowDepositModal(true)}
              className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 uppercase tracking-wider text-[10px]"
            >
              <span>+ Deposit USDC</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Card 2: Cumulative Deposits */}
        <div className="bg-[#0a0e17] border border-blue-500/20 rounded-[3px] p-4 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-wider">
            <span>Cumulative Deposited</span>
            <Wallet className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-100">
            ${user ? user.total_deposited_usd.toFixed(2) : "0.00"}{" "}
            <span className="text-xs font-normal text-slate-400">USD</span>
          </div>
          <div className="text-[10px] text-slate-400 border-t border-slate-800/80 pt-2 flex items-center justify-between">
            <span>Arbitrum L2 (<span className="text-slate-300">&lt;$0.01 gas</span>)</span>
            <span className={user && user.total_deposited_usd >= 1.0 ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
              {user && user.total_deposited_usd >= 1.0 ? "Min $1 Threshold Met" : "Min $1 Req to Unlock Key"}
            </span>
          </div>
        </div>

        {/* Card 3: Cumulative Compute Cleared */}
        <div className="bg-[#0a0e17] border border-blue-500/20 rounded-[3px] p-4 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-wider">
            <span>Total Compute Spent</span>
            <Activity className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-100">
            ${user ? user.total_spent_usd.toFixed(4) : "0.0000"}{" "}
            <span className="text-xs font-normal text-slate-400">USD</span>
          </div>
          <div className="text-[10px] text-slate-400 border-t border-slate-800/80 pt-2 flex items-center justify-between">
            <span>99.5% Routed to Silicon Host</span>
            <span className="text-purple-400 font-mono">0.5% DAO Vault</span>
          </div>
        </div>
      </div>

      {/* SECTION 3: API KEYS MANAGEMENT */}
      <div className="bg-[#0a0e17] border border-blue-500/20 rounded-[3px] p-4 sm:p-5 space-y-4 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="space-y-0.5">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Key className="w-4 h-4 text-blue-400" />
              <span>Production API Keys</span>
            </h3>
            <p className="text-[11px] text-slate-400 font-sans">
              Drop-in OpenAI compatible API keys. Minimum initial deposit of <strong className="text-white">$1.00 USD (1 USDC)</strong> required to generate.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <input
              type="text"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder="Key Name"
              className="bg-[#05070b] border border-slate-700 rounded-[2px] px-2.5 py-1.5 text-xs text-white w-28 sm:w-36 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={handleCreateKey}
              disabled={!user || user.total_deposited_usd < 1.0 || creatingKey}
              className="px-3 py-1.5 rounded-[2px] bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition"
              title={!user || user.total_deposited_usd < 1.0 ? "Deposit at least $1.00 to unlock key creation" : "Generate new production key"}
            >
              {creatingKey ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Key className="w-3.5 h-3.5" />}
              <span>+ Create Key</span>
            </button>
          </div>
        </div>

        {/* Revealed Secret Banner */}
        {generatedKeySecret && (
          <div className="bg-[#05070b] border-2 border-emerald-500/60 rounded-[3px] p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-400 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4" />
                <span>New Production API Key Generated</span>
              </span>
              <button
                onClick={() => setGeneratedKeySecret(null)}
                className="text-[10px] text-slate-400 hover:text-white uppercase tracking-wider"
              >
                Close
              </button>
            </div>
            <p className="text-[11px] text-slate-300 font-sans">
              Copy and store this secret safely. In compliance with institutional zero-knowledge covenants, it will never be revealed again.
            </p>
            <div className="flex items-center gap-2 bg-[#080c14] border border-slate-700 rounded-[2px] p-2 text-xs font-mono text-emerald-300">
              <span className="truncate select-all">{generatedKeySecret}</span>
              <button
                onClick={() => copyToClipboard(generatedKeySecret, setCopiedKey)}
                className="ml-auto px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-[2px] text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shrink-0"
              >
                {copiedKey ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>
        )}

        {/* Keys Table */}
        {!user ? (
          <div className="text-center py-6 text-xs text-slate-400">
            Authenticate with institutional email above to view and manage API keys.
          </div>
        ) : user.total_deposited_usd < 1.0 ? (
          <div className="bg-[#05070b] border border-amber-500/30 rounded-[2px] p-4 text-center space-y-2">
            <AlertTriangle className="w-5 h-5 text-amber-400 mx-auto" />
            <div className="text-xs font-bold text-white uppercase tracking-wider">
              Deposit Required to Activate API Key
            </div>
            <p className="text-[11px] text-slate-300 max-w-md mx-auto font-sans">
              To prevent bot spam and reserve bare-metal GPU compute, Verxl requires an initial deposit of at least{" "}
              <strong className="text-amber-300">$1.00 USD (USDC on Arbitrum)</strong>. 100% of your deposit is credited directly to your inference balance.
            </p>
            <button
              onClick={() => setShowDepositModal(true)}
              className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider rounded-[2px] transition inline-flex items-center gap-1.5"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Deposit $1.00 USDC to Activate</span>
            </button>
          </div>
        ) : keys.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-400 space-y-2">
            <p>You have met the $1.00 deposit threshold. Click "+ Create New Key" above to generate your first API key.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#05070b] text-[10px] text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-2 px-3">Name</th>
                  <th className="py-2 px-3">Key Prefix</th>
                  <th className="py-2 px-3">Created</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {keys.map((k) => (
                  <tr key={k.id} className="hover:bg-slate-900/40">
                    <td className="py-2.5 px-3 font-semibold text-white">{k.name}</td>
                    <td className="py-2.5 px-3 text-blue-400">{k.key_prefix}</td>
                    <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                      {new Date(k.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-2.5 px-3">
                      {k.is_active === 1 ? (
                        <span className="px-1.5 py-0.2 rounded-[2px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold">
                          ACTIVE
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.2 rounded-[2px] bg-red-500/10 text-red-400 border border-red-500/30 text-[9px] font-bold">
                          REVOKED
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {k.is_active === 1 && (
                        <button
                          onClick={() => handleRevokeKey(k.id)}
                          className="text-[10px] text-red-400 hover:text-red-300 font-bold uppercase tracking-wider hover:underline"
                        >
                          Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SECTION 4: INTEGRATION CODE SNIPPETS */}
      <div className="bg-[#0a0e17] border border-blue-500/20 rounded-[3px] p-4 sm:p-5 space-y-3 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
          <div className="space-y-0.5">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Code2 className="w-4 h-4 text-blue-400" />
              <span>Standard Drop-In OpenAI Integration</span>
            </h3>
            <p className="text-[11px] text-slate-400 font-sans">
              Verxl endpoint is 100% wire-compatible with any existing OpenAI client library. Simply set <span className="text-blue-400 font-mono">base_url="https://verxl.com/v1"</span>.
            </p>
          </div>

          <div className="flex items-center gap-1 bg-[#05070b] p-0.5 rounded-[2px] border border-slate-800 self-start sm:self-auto">
            {(["curl", "python", "typescript"] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setCodeLang(lang)}
                className={`px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold rounded-[2px] transition ${
                  codeLang === lang
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        <div className="relative">
          <pre className="bg-[#05070b] border border-slate-800 rounded-[2px] p-3 text-[11px] leading-relaxed text-blue-300 overflow-x-auto font-mono">
            {snippets[codeLang]}
          </pre>
          <button
            onClick={() => copyToClipboard(snippets[codeLang], setCopiedKey)}
            className="absolute top-2.5 right-2.5 px-2 py-1 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-[2px] text-[10px] uppercase tracking-wider flex items-center gap-1"
          >
            {copiedKey ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copiedKey ? "Copied" : "Copy Code"}</span>
          </button>
        </div>
      </div>

      {/* SECTION 5: RECENT INFERENCE AUDIT LOG */}
      {user && usage.length > 0 && (
        <div className="bg-[#0a0e17] border border-blue-500/20 rounded-[3px] p-4 space-y-3 shadow-md">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Recent Inference Clearing Log</span>
            </h3>
            <span className="text-[10px] text-slate-400">Deterministic Real-Time Settlement</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#05070b] text-[10px] text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-2 px-3">Model</th>
                  <th className="py-2 px-3">Prompt</th>
                  <th className="py-2 px-3">Completion</th>
                  <th className="py-2 px-3">Cost ($)</th>
                  <th className="py-2 px-3">Fee (50 bps)</th>
                  <th className="py-2 px-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {usage.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-900/40 text-[11px]">
                    <td className="py-2 px-3 text-white">{u.model}</td>
                    <td className="py-2 px-3 text-slate-400">{u.prompt_tokens} tok</td>
                    <td className="py-2 px-3 text-slate-400">{u.completion_tokens} tok</td>
                    <td className="py-2 px-3 text-emerald-400 font-bold">${u.total_cost_usd.toFixed(6)}</td>
                    <td className="py-2 px-3 text-blue-400">${u.protocol_fee_usd.toFixed(6)}</td>
                    <td className="py-2 px-3 text-slate-400">{new Date(u.created_at).toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: DEPOSIT USDC ON ARBITRUM */}
      {showDepositModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#0a0e17] border border-blue-500/40 rounded-[3px] p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Deposit USDC on Arbitrum
                </h3>
              </div>
              <button
                onClick={() => setShowDepositModal(false)}
                className="text-slate-400 hover:text-white text-xs uppercase"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Chain Selection */}
              <div>
                <label className="block text-[11px] text-slate-400 uppercase tracking-wider mb-1">
                  Settlement Network
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDepositChain("arbitrum")}
                    className={`p-2 rounded-[2px] border text-left text-xs ${
                      depositChain === "arbitrum"
                        ? "bg-blue-950/40 border-blue-500 text-white font-bold"
                        : "bg-[#05070b] border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <div>Arbitrum One (Live)</div>
                    <div className="text-[10px] text-slate-400 font-normal">Native USDC · Chain 42161</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDepositChain("arbitrum_sepolia")}
                    className={`p-2 rounded-[2px] border text-left text-xs ${
                      depositChain === "arbitrum_sepolia"
                        ? "bg-blue-950/40 border-blue-500 text-white font-bold"
                        : "bg-[#05070b] border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <div>Arbitrum Sepolia (Testnet)</div>
                    <div className="text-[10px] text-slate-400 font-normal">Test USDC · Chain 421614</div>
                  </button>
                </div>
              </div>

              {/* Official Verxl Treasury Address */}
              <div className="bg-[#05070b] border border-blue-500/30 rounded-[2px] p-3 space-y-1.5">
                <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-wider">
                  <span>Verxl Treasury Settlement Address</span>
                  <span className="text-emerald-400 font-bold">Min $1.00 USDC</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-white truncate select-all">{TREASURY_WALLET}</span>
                  <button
                    onClick={() => copyToClipboard(TREASURY_WALLET, setCopiedTreasury)}
                    className="px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-[2px] text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shrink-0"
                  >
                    {copiedTreasury ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedTreasury ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div>
                <label className="block text-[11px] text-slate-400 uppercase tracking-wider mb-1">
                  Preset Amounts (USDC)
                </label>
                <div className="flex gap-2">
                  {[1.0, 5.0, 10.0, 25.0].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setDepositAmount(amt)}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-[2px] border ${
                        depositAmount === amt
                          ? "bg-blue-600 border-blue-400 text-white"
                          : "bg-[#05070b] border-slate-800 text-slate-300 hover:border-slate-600"
                      }`}
                    >
                      ${amt.toFixed(0)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Transaction Hash Input for Verification */}
              <form onSubmit={handleVerifyDeposit} className="space-y-3 pt-1">
                <div>
                  <label className="block text-[11px] text-slate-400 uppercase tracking-wider mb-1">
                    Arbitrum Transaction Hash (TxHash)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="0x3a8f9c1e... or test hash"
                    value={depositTxHash}
                    onChange={(e) => setDepositTxHash(e.target.value)}
                    className="w-full bg-[#05070b] border border-slate-700 rounded-[2px] px-3 py-2 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Send USDC from any wallet (MetaMask, Rabby, Coinbase) to the treasury address, then paste the tx hash here to verify and credit.
                  </p>
                </div>

                {depositChain === "arbitrum_sepolia" && (
                  <button
                    type="button"
                    onClick={() => {
                      const dummyHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;
                      setDepositTxHash(dummyHash);
                    }}
                    className="text-[10px] text-blue-400 hover:underline uppercase tracking-wider block"
                  >
                    ⚡ Generate Arbitrum Sepolia Test Hash
                  </button>
                )}

                <button
                  type="submit"
                  disabled={verifyingDeposit || !depositTxHash}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider py-2.5 rounded-[2px] transition flex items-center justify-center gap-2"
                >
                  {verifyingDeposit ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>{verifyingDeposit ? "Verifying On-Chain..." : "Verify & Credit Deposit"}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: PROVIDER PAYOUT REQUEST DRAWER */}
      {showPayoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#0a0e17] border border-purple-500/40 rounded-[3px] p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Node Provider Payout Settlement
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowPayoutModal(false);
                  setPayoutReceipt(null);
                }}
                className="text-slate-400 hover:text-white text-xs uppercase"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-[#05070b] border border-purple-500/20 rounded-[2px] p-3 space-y-2">
                <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-wider">
                  <span>Select Registered Cluster</span>
                  <span className="text-emerald-400 font-bold">
                    Pending: ${payoutPendingBalance.toFixed(4)} USD
                  </span>
                </div>
                <select
                  value={payoutProviderId}
                  onChange={(e) => setPayoutProviderId(e.target.value)}
                  className="w-full bg-[#0a0e17] border border-slate-700 rounded-[2px] px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="bulbasaur-prague-01">bulbasaur-prague-01 (Prague Bare-Metal Qwen 3.5)</option>
                  <option value="xiao-mimo-bridge-01">xiao-mimo-bridge-01 (Xiaomi Mi MIMO 2.6 Bridge)</option>
                  <option value="deepseek-v4-bridge-01">deepseek-v4-bridge-01 (DeepSeek v4.1 Flash Bridge)</option>
                </select>
                <div className="text-[10px] text-slate-400">
                  Minimum payout: <strong className="text-white">$1.00 USD (1 USDC)</strong> · Protocol take: <strong className="text-purple-400">50 bps (0.5%)</strong>
                </div>
              </div>

              {payoutReceipt ? (
                <div className="bg-emerald-950/20 border border-emerald-500/40 rounded-[2px] p-4 space-y-2">
                  <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase">
                    <Check className="w-4 h-4" />
                    <span>Payout Queued for Settlement</span>
                  </div>
                  <div className="text-[11px] text-slate-300 space-y-1 font-mono">
                    <div>Receipt ID: <span className="text-white">{payoutReceipt.payout_id}</span></div>
                    <div>Gross Requested: <span className="text-white">${payoutReceipt.amount_usd.toFixed(2)} USD</span></div>
                    <div>Protocol Fee (50 bps): <span className="text-purple-400">-${payoutReceipt.protocol_fee_usd.toFixed(4)} USD</span></div>
                    <div>Net Settlement: <span className="text-emerald-400 font-bold">${payoutReceipt.net_payout_usd.toFixed(2)} USD</span></div>
                    <div>Destination: <span className="text-slate-400">{payoutReceipt.payout_address}</span></div>
                    <div>Arbitrum Ref: <span className="text-blue-400">{payoutReceipt.arbitrum_tx_ref.slice(0, 18)}...</span></div>
                  </div>
                  <button
                    onClick={() => setPayoutReceipt(null)}
                    className="w-full mt-2 py-1.5 bg-[#05070b] border border-slate-700 hover:border-slate-500 text-xs text-white font-bold uppercase tracking-wider rounded-[2px]"
                  >
                    Submit Another Request
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRequestPayout} className="space-y-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 uppercase tracking-wider mb-1">
                      Payout Destination Address (Arbitrum L2)
                    </label>
                    <input
                      type="text"
                      required
                      value={payoutAddress}
                      onChange={(e) => setPayoutAddress(e.target.value)}
                      placeholder="0x..."
                      className="w-full bg-[#05070b] border border-slate-700 rounded-[2px] px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 uppercase tracking-wider mb-1">
                      Amount to Settle (USD / USDC)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="1.0"
                      max={payoutPendingBalance}
                      required
                      value={payoutAmount}
                      onChange={(e) => setPayoutAmount(parseFloat(e.target.value) || 0)}
                      className="w-full bg-[#05070b] border border-slate-700 rounded-[2px] px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-purple-500"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                      <span>Min: $1.00 USD</span>
                      <span>Net: ~${Math.max(0, payoutAmount * 0.995).toFixed(4)} USDC after 50 bps</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submittingPayout || payoutAmount < 1.0 || payoutAmount > payoutPendingBalance}
                    className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider py-2.5 rounded-[2px] transition flex items-center justify-center gap-2"
                  >
                    {submittingPayout ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                    <span>Request Payout ({payoutAmount >= 1.0 ? `$${payoutAmount.toFixed(2)} USD` : "Min $1"})</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
