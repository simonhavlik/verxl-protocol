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
  Smartphone,
  Shield,
  Download,
  Eye,
  EyeOff,
  ShieldAlert,
} from "lucide-react";

interface UserProfile {
  id: string;
  email: string;
  wallet_address: string | null;
  balance_usd: number;
  total_deposited_usd: number;
  total_spent_usd: number;
  has_active_key: boolean;
  has_password?: boolean;
  two_factor_enabled?: boolean;
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
  const [authMode, setAuthMode] = useState<"otp" | "password">("otp");
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpSending, setOtpSending] = useState(false);

  // 2FA Challenge during Login
  const [loginRequires2fa, setLoginRequires2fa] = useState(false);
  const [loginChallengeToken, setLoginChallengeToken] = useState<string | null>(null);
  const [loginTotpInput, setLoginTotpInput] = useState("");
  const [loginRecoveryInput, setLoginRecoveryInput] = useState("");
  const [useRecoveryLogin, setUseRecoveryLogin] = useState(false);
  const [loginSubmitting, setLoginSubmitting] = useState(false);

  // Security Management Modal
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [securityTab, setSecurityTab] = useState<"2fa" | "password">("2fa");

  // Password Setup States
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  // 2FA Setup States
  const [totpStep, setTotpStep] = useState<"view" | "setup" | "codes">("view");
  const [totpSecret, setTotpSecret] = useState("");
  const [totpFormattedSecret, setTotpFormattedSecret] = useState("");
  const [totpOtpAuthUrl, setTotpOtpAuthUrl] = useState("");
  const [totpRecoveryCodes, setTotpRecoveryCodes] = useState<string[]>([]);
  const [totpVerifyCode, setTotpVerifyCode] = useState("");
  const [enablingTotp, setEnablingTotp] = useState(false);
  const [totpError, setTotpError] = useState<string | null>(null);
  const [totpSuccess, setTotpSuccess] = useState<string | null>(null);
  const [copiedTotpSecret, setCopiedTotpSecret] = useState(false);
  const [copiedRecoveryCodes, setCopiedRecoveryCodes] = useState(false);
  const [disablingTotp, setDisablingTotp] = useState(false);
  const [disablePasswordConfirm, setDisablePasswordConfirm] = useState("");

  // Key Creation Modal
  const [newKeyName, setNewKeyName] = useState("Production Key");
  const [generatedKeySecret, setGeneratedKeySecret] = useState<string | null>(null);
  const [creatingKey, setCreatingKey] = useState(false);

  // Deposit State
  const [showDepositModal, setShowDepositModal] = useState(false);
  const depositChain = "arbitrum";
  const [copiedContract, setCopiedContract] = useState(false);
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

  // Handlers: Password Login
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !passwordInput) {
      setStatusMsg({ type: "error", text: "Email and password are required." });
      return;
    }
    setLoginSubmitting(true);
    setStatusMsg(null);
    try {
      const res = await fetch("/api/auth/login-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput.trim(), password: passwordInput }),
      });
      const data = (await res.json()) as any;

      if (!res.ok) {
        setStatusMsg({ type: "error", text: data.error || "Login failed." });
        return;
      }

      // Check if 2FA is required
      if (data.require_2fa) {
        setLoginChallengeToken(data.challenge_token);
        setLoginRequires2fa(true);
        setStatusMsg({ type: "info", text: "Password verified. Please enter your 6-digit TOTP code." });
        return;
      }

      // Authenticated directly
      localStorage.setItem("vrxl_auth_token", data.token);
      setToken(data.token);
      setUser(data.user);
      setPasswordInput("");
      setStatusMsg({ type: "success", text: "Authenticated successfully." });
      fetchSessionData(data.token);
    } catch (err: any) {
      setStatusMsg({ type: "error", text: "Login error: " + err.message });
    } finally {
      setLoginSubmitting(false);
    }
  };

  // Handlers: Verify Login 2FA
  const handleVerifyLogin2fa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginChallengeToken) return;
    setLoginSubmitting(true);
    setStatusMsg(null);
    try {
      const payload: any = { challenge_token: loginChallengeToken };
      if (useRecoveryLogin) {
        if (!loginRecoveryInput) {
          setStatusMsg({ type: "error", text: "Please enter your emergency recovery code." });
          setLoginSubmitting(false);
          return;
        }
        payload.recovery_code = loginRecoveryInput.trim();
      } else {
        if (!loginTotpInput || loginTotpInput.trim().length !== 6) {
          setStatusMsg({ type: "error", text: "Please enter the 6-digit code from your authenticator app." });
          setLoginSubmitting(false);
          return;
        }
        payload.totp_code = loginTotpInput.trim();
      }

      const res = await fetch("/api/auth/2fa/verify-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as any;

      if (!res.ok) {
        setStatusMsg({ type: "error", text: data.error || "Invalid 2FA code." });
        return;
      }

      localStorage.setItem("vrxl_auth_token", data.token);
      setToken(data.token);
      setUser(data.user);
      setLoginRequires2fa(false);
      setLoginChallengeToken(null);
      setLoginTotpInput("");
      setLoginRecoveryInput("");
      setPasswordInput("");
      setStatusMsg({ type: "success", text: "Two-Factor Authentication verified. Access granted." });
      fetchSessionData(data.token);
    } catch (err: any) {
      setStatusMsg({ type: "error", text: "2FA error: " + err.message });
    } finally {
      setLoginSubmitting(false);
    }
  };

  // Handlers: Set / Change Password
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    setSavingPassword(true);
    setPasswordError(null);
    setPasswordSuccess(null);
    try {
      const res = await fetch("/api/auth/set-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password: newPassword }),
      });
      const data = (await res.json()) as any;

      if (!res.ok) {
        setPasswordError(data.error || "Failed to set password.");
        return;
      }

      setPasswordSuccess("Password saved and encrypted in Charizard PostgreSQL.");
      setNewPassword("");
      setConfirmPassword("");
      if (user) {
        setUser({ ...user, has_password: true });
      }
    } catch (err: any) {
      setPasswordError("Network error: " + err.message);
    } finally {
      setSavingPassword(false);
    }
  };

  // Handlers: Initiate 2FA Setup
  const handleStart2faSetup = async () => {
    setEnablingTotp(true);
    setTotpError(null);
    setTotpSuccess(null);
    try {
      const res = await fetch("/api/auth/2fa/setup", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = (await res.json()) as any;
      if (!res.ok) {
        setTotpError(data.error || "Failed to start 2FA setup.");
        return;
      }

      setTotpSecret(data.secret);
      setTotpFormattedSecret(data.formatted_secret);
      setTotpOtpAuthUrl(data.otpauth_url);
      setTotpRecoveryCodes(data.recovery_codes || []);
      setTotpStep("setup");
    } catch (err: any) {
      setTotpError("Error initializing 2FA: " + err.message);
    } finally {
      setEnablingTotp(false);
    }
  };

  // Handlers: Confirm & Activate 2FA
  const handleConfirm2fa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!totpVerifyCode || totpVerifyCode.trim().length !== 6) {
      setTotpError("Please enter the 6-digit verification code from your authenticator app.");
      return;
    }
    setEnablingTotp(true);
    setTotpError(null);
    try {
      const res = await fetch("/api/auth/2fa/enable", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code: totpVerifyCode.trim() }),
      });
      const data = (await res.json()) as any;

      if (!res.ok) {
        setTotpError(data.error || "Verification failed.");
        return;
      }

      setTotpStep("codes");
      setTotpSuccess("Two-Factor Authentication is now active and enforced!");
      if (user) {
        setUser({ ...user, two_factor_enabled: true });
      }
    } catch (err: any) {
      setTotpError("Network error: " + err.message);
    } finally {
      setEnablingTotp(false);
    }
  };

  // Handlers: Disable 2FA
  const handleDisable2fa = async (e: React.FormEvent) => {
    e.preventDefault();
    setDisablingTotp(true);
    setTotpError(null);
    try {
      const res = await fetch("/api/auth/2fa/disable", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password: disablePasswordConfirm }),
      });
      const data = (await res.json()) as any;

      if (!res.ok) {
        setTotpError(data.error || "Failed to disable 2FA.");
        return;
      }

      setTotpStep("view");
      setTotpSuccess("Two-Factor Authentication disabled.");
      setDisablePasswordConfirm("");
      if (user) {
        setUser({ ...user, two_factor_enabled: false });
      }
    } catch (err: any) {
      setTotpError("Error: " + err.message);
    } finally {
      setDisablingTotp(false);
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
    "model": "qwen3.5-4b-uncensored-32k",
    "messages": [{"role": "user", "content": "Explain Verxl 50 bps clearing switch"}],
    "temperature": 0.7
  }'`,
    python: `from openai import OpenAI

client = OpenAI(
    base_url="https://verxl.com/v1",
    api_key="${activeKeyDisplay}",
)

response = client.chat.completions.create(
    model="qwen3.5-4b-uncensored-32k",
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
    model: "qwen3.5-4b-uncensored-32k",
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
                <span>Non-Custodial Developer Authentication</span>
              </div>
              <h2 className="text-lg font-bold text-white uppercase tracking-wider">
                Access Developer Console
              </h2>
              <p className="text-xs text-slate-300 font-sans">
                Sign in using passwordless email OTP or cryptographic password with hardware TOTP 2FA.
              </p>
            </div>

            {/* Auth Mode Toggle Tabs */}
            <div className="flex border-b border-slate-800 text-xs font-bold uppercase tracking-wider">
              <button
                type="button"
                onClick={() => { setAuthMode("otp"); setLoginRequires2fa(false); }}
                className={`flex-1 py-2 text-center border-b-2 transition ${
                  authMode === "otp"
                    ? "border-blue-500 text-blue-400 bg-blue-500/5"
                    : "border-transparent text-slate-400 hover:text-white"
                }`}
              >
                Email OTP (Passwordless)
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode("password"); }}
                className={`flex-1 py-2 text-center border-b-2 transition ${
                  authMode === "password"
                    ? "border-blue-500 text-blue-400 bg-blue-500/5"
                    : "border-transparent text-slate-400 hover:text-white"
                }`}
              >
                Password + 2FA
              </button>
            </div>

            {authMode === "otp" ? (
              !otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-3 pt-1">
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
                <form onSubmit={handleVerifyOtp} className="space-y-3 pt-1">
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
              )
            ) : (
              /* Password + 2FA Login Form */
              !loginRequires2fa ? (
                <form onSubmit={handlePasswordLogin} className="space-y-3 pt-1">
                  <div>
                    <label className="block text-[11px] text-slate-400 uppercase tracking-wider mb-1">
                      Email Address
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
                  <div>
                    <label className="block text-[11px] text-slate-400 uppercase tracking-wider mb-1">
                      Cryptographic Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type={showPasswordInput ? "text" : "password"}
                        required
                        placeholder="••••••••••••"
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        className="w-full bg-[#05070b] border border-slate-700 rounded-[2px] pl-9 pr-10 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswordInput(!showPasswordInput)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                      >
                        {showPasswordInput ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loginSubmitting}
                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider py-2.5 rounded-[2px] transition flex items-center justify-center gap-2"
                  >
                    {loginSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
                    <span>Sign In with Password</span>
                  </button>
                  <p className="text-[10px] text-slate-400 text-center">
                    Forgot password or not configured? Use the <strong className="text-blue-400 cursor-pointer" onClick={() => setAuthMode("otp")}>Email OTP</strong> tab to log in passwordlessly.
                  </p>
                </form>
              ) : (
                /* 2FA Challenge Prompt */
                <form onSubmit={handleVerifyLogin2fa} className="space-y-3 pt-1">
                  <div className="bg-[#05070b] border border-blue-500/40 rounded-[2px] p-3 text-center space-y-1">
                    <Smartphone className="w-5 h-5 text-blue-400 mx-auto" />
                    <div className="text-xs font-bold text-white uppercase tracking-wider">
                      Two-Factor Authentication Required
                    </div>
                    <p className="text-[11px] text-slate-300">
                      {useRecoveryLogin
                        ? "Enter one of your 8 emergency recovery codes"
                        : "Enter the 6-digit code from Google Authenticator / 1Password"}
                    </p>
                  </div>

                  {!useRecoveryLogin ? (
                    <div>
                      <input
                        type="text"
                        maxLength={6}
                        autoFocus
                        required
                        placeholder="123456"
                        value={loginTotpInput}
                        onChange={(e) => setLoginTotpInput(e.target.value.replace(/\D/g, ""))}
                        className="w-full bg-[#05070b] border border-blue-500/50 rounded-[2px] px-3 py-2.5 text-center text-lg tracking-[8px] font-mono text-white focus:outline-none focus:border-blue-400"
                      />
                    </div>
                  ) : (
                    <div>
                      <input
                        type="text"
                        autoFocus
                        required
                        placeholder="xxxx-xxxx"
                        value={loginRecoveryInput}
                        onChange={(e) => setLoginRecoveryInput(e.target.value)}
                        className="w-full bg-[#05070b] border border-blue-500/50 rounded-[2px] px-3 py-2 text-center text-sm font-mono text-white focus:outline-none focus:border-blue-400"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loginSubmitting}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider py-2.5 rounded-[2px] transition flex items-center justify-center gap-2"
                  >
                    {loginSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    <span>Verify 2FA & Access Console</span>
                  </button>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                    <button
                      type="button"
                      onClick={() => setUseRecoveryLogin(!useRecoveryLogin)}
                      className="text-blue-400 hover:underline"
                    >
                      {useRecoveryLogin ? "Use 6-digit TOTP code instead" : "Use emergency recovery code"}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setLoginRequires2fa(false); setLoginChallengeToken(null); }}
                      className="text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )
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
              onClick={() => {
                setShowSecurityModal(true);
                setTotpStep(user.two_factor_enabled ? "view" : "setup");
              }}
              className={`px-2.5 py-1.5 rounded-[2px] bg-[#05070b] border ${
                user.two_factor_enabled && user.has_password
                  ? "border-emerald-500/40 hover:border-emerald-400 text-emerald-300"
                  : "border-amber-500/50 hover:border-amber-400 text-amber-300 animate-pulse"
              } text-[11px] font-bold flex items-center gap-1.5 transition`}
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>Security & 2FA</span>
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

      {/* SECURITY RECOMMENDATION CARD */}
      {user && (!user.two_factor_enabled || !user.has_password) && (
        <div className="bg-gradient-to-r from-amber-950/30 via-[#0a0e17] to-amber-950/10 border border-amber-500/50 rounded-[3px] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-[2px] text-amber-400 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span>Security Recommendation: Enhance Account Protection</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-[2px] font-bold">
                  Recommended
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                {!user.two_factor_enabled && !user.has_password
                  ? "Your account currently uses only email OTP. Configure cryptographic password protection and RFC 6238 two-factor authentication (2FA) with emergency recovery codes."
                  : !user.two_factor_enabled
                  ? "Enable RFC 6238 TOTP Two-Factor Authentication (Google Authenticator, 1Password) to secure protocol key generation and withdrawals."
                  : "Add cryptographic password protection to enable dual-login capability alongside email OTP."}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setShowSecurityModal(true);
              setSecurityTab(!user.two_factor_enabled ? "2fa" : "password");
            }}
            className="shrink-0 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider rounded-[2px] transition flex items-center gap-1.5 shadow"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Configure Security</span>
          </button>
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
              {/* Settlement Network & Token Badge */}
              <div className="bg-[#05070b] border border-blue-500/30 rounded-[2px] p-3 space-y-2">
                <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-wider">
                  <span>Settlement Rail</span>
                  <span className="px-1.5 py-0.2 rounded-[2px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold text-[9px]">
                    MAINNET ONLY · NO TESTNET
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="font-bold text-white text-xs">Arbitrum One Mainnet</div>
                  <div className="font-mono text-[10px] text-slate-400">Chain ID: 42161 · Gas: &lt;$0.01</div>
                </div>
                <div className="text-[11px] text-slate-300 font-sans border-t border-slate-800/80 pt-2 space-y-1">
                  <div>Accepted Asset: <strong className="text-white">USDC</strong> (6 Decimals · Arbitrum One)</div>
                  <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between">
                    <span>Native: <code className="text-blue-300">0xaf88d065e77c8cC2239327C5EDb3A432268e5831</code></span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard("0xaf88d065e77c8cC2239327C5EDb3A432268e5831", setCopiedContract)}
                      className="text-blue-400 hover:text-blue-300 uppercase text-[9px] font-bold"
                    >
                      {copiedContract ? "Copied" : "Copy"}
                    </button>
                  </div>
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
                    placeholder="0x3a8f9c1e... (Arbitrum One 66-character tx hash)"
                    value={depositTxHash}
                    onChange={(e) => setDepositTxHash(e.target.value)}
                    className="w-full bg-[#05070b] border border-slate-700 rounded-[2px] px-3 py-2 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Send at least $1.00 USDC on Arbitrum One (Chain ID 42161) to the treasury address, then paste the confirmed tx hash here.
                  </p>
                </div>

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

      {/* MODAL 3: SECURITY MANAGEMENT MODAL (2FA & PASSWORD) */}
      {showSecurityModal && user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-xl bg-[#0a0e17] border border-blue-500/40 rounded-[3px] p-5 sm:p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Security & Account Protection
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowSecurityModal(false);
                  setTotpStep(user.two_factor_enabled ? "view" : "setup");
                  setTotpError(null);
                  setTotpSuccess(null);
                  setPasswordError(null);
                  setPasswordSuccess(null);
                }}
                className="text-slate-400 hover:text-white text-xs uppercase"
              >
                ✕ Close
              </button>
            </div>

            {/* Security Tabs */}
            <div className="flex border-b border-slate-800 gap-1">
              <button
                type="button"
                onClick={() => setSecurityTab("2fa")}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center justify-center gap-2 transition ${
                  securityTab === "2fa"
                    ? "border-blue-400 text-white bg-blue-500/10"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Two-Factor Auth (2FA)</span>
                {user.two_factor_enabled ? (
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-1 rounded-[2px]">
                    ON
                  </span>
                ) : (
                  <span className="text-[9px] bg-amber-500/20 text-amber-400 border border-amber-500/40 px-1 rounded-[2px]">
                    OFF
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setSecurityTab("password")}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center justify-center gap-2 transition ${
                  securityTab === "password"
                    ? "border-blue-400 text-white bg-blue-500/10"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <Key className="w-3.5 h-3.5" />
                <span>Password Protection</span>
                {user.has_password ? (
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-1 rounded-[2px]">
                    SET
                  </span>
                ) : (
                  <span className="text-[9px] bg-amber-500/20 text-amber-400 border border-amber-500/40 px-1 rounded-[2px]">
                    NONE
                  </span>
                )}
              </button>
            </div>

            {/* TAB 1: TWO-FACTOR AUTH (2FA) */}
            {securityTab === "2fa" && (
              <div className="space-y-4 text-xs">
                {totpError && (
                  <div className="p-2.5 rounded-[2px] bg-red-950/40 border border-red-500/40 text-red-300 text-xs">
                    {totpError}
                  </div>
                )}
                {totpSuccess && (
                  <div className="p-2.5 rounded-[2px] bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                    <Check className="w-3.5 h-3.5" />
                    <span>{totpSuccess}</span>
                  </div>
                )}

                {totpStep === "view" && (
                  <div className="space-y-3">
                    {user.two_factor_enabled ? (
                      <div className="bg-[#05070b] border border-emerald-500/30 rounded-[2px] p-4 space-y-3">
                        <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase tracking-wider text-xs">
                          <Check className="w-4 h-4" />
                          <span>2FA Protection Active (RFC 6238 TOTP)</span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          Your account requires a 6-digit TOTP authenticator code or emergency recovery code during password login and security modifications.
                        </p>

                        <div className="border-t border-slate-800 pt-3 space-y-2">
                          <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                            Disable Two-Factor Authentication
                          </div>
                          <p className="text-[10px] text-slate-400">
                            Enter your password to confirm disabling 2FA. We strongly recommend keeping 2FA enabled.
                          </p>
                          <form onSubmit={handleDisable2fa} className="space-y-2">
                            <input
                              type="password"
                              required
                              placeholder="Confirm current account password"
                              value={disablePasswordConfirm}
                              onChange={(e) => setDisablePasswordConfirm(e.target.value)}
                              className="w-full bg-[#0a0e17] border border-slate-700 rounded-[2px] px-3 py-1.5 text-xs text-white focus:outline-none focus:border-red-500"
                            />
                            <button
                              type="submit"
                              disabled={disablingTotp || !disablePasswordConfirm}
                              className="w-full bg-red-950/40 hover:bg-red-900/60 border border-red-500/50 disabled:opacity-50 text-red-200 font-bold text-xs uppercase tracking-wider py-2 rounded-[2px] transition flex items-center justify-center gap-2"
                            >
                              {disablingTotp ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                              <span>Confirm & Disable 2FA</span>
                            </button>
                          </form>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-[#05070b] border border-amber-500/30 rounded-[2px] p-4 space-y-3">
                        <div className="flex items-center gap-2 text-amber-400 font-bold uppercase tracking-wider text-xs">
                          <ShieldAlert className="w-4 h-4" />
                          <span>Two-Factor Authentication Inactive</span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          Add an extra layer of defense with an RFC 6238 compliant authenticator (Google Authenticator, 1Password, Bitwarden). You will receive 8 one-time emergency recovery codes in case you lose access to your authenticator app.
                        </p>
                        <button
                          type="button"
                          onClick={handleStart2faSetup}
                          disabled={enablingTotp}
                          className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider py-2.5 rounded-[2px] transition flex items-center justify-center gap-2"
                        >
                          {enablingTotp ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Smartphone className="w-3.5 h-3.5" />}
                          <span>Set Up 2FA Authenticator</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {totpStep === "setup" && (
                  <div className="space-y-4">
                    <div className="bg-[#05070b] border border-blue-500/30 rounded-[2px] p-3 space-y-2">
                      <div className="text-xs font-bold text-white uppercase tracking-wider">
                        Step 1: Add to Your Authenticator App
                      </div>
                      <p className="text-[11px] text-slate-300">
                        In Google Authenticator, 1Password, or Bitwarden, add a new account manually with this secret key:
                      </p>
                      <div className="flex items-center gap-2 bg-[#0a0e17] border border-slate-700 p-2.5 rounded-[2px]">
                        <span className="font-mono text-xs sm:text-sm text-emerald-400 font-bold tracking-widest break-all select-all flex-1">
                          {totpFormattedSecret || totpSecret}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(totpSecret);
                            setCopiedTotpSecret(true);
                            setTimeout(() => setCopiedTotpSecret(false), 2000);
                          }}
                          className="px-2 py-1 bg-[#05070b] border border-slate-600 hover:border-slate-400 rounded-[2px] text-[10px] text-slate-300 uppercase tracking-wider flex items-center gap-1 shrink-0"
                        >
                          {copiedTotpSecret ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedTotpSecret ? "Copied" : "Copy"}</span>
                        </button>
                      </div>

                      <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
                        <span>Account: {user.email}</span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(totpOtpAuthUrl);
                            setStatusMsg({ type: "success", text: "otpauth:// URI copied." });
                          }}
                          className="text-blue-400 hover:underline"
                        >
                          Copy otpauth URI
                        </button>
                      </div>
                    </div>

                    <form onSubmit={handleConfirm2fa} className="space-y-3">
                      <div className="bg-[#05070b] border border-blue-500/30 rounded-[2px] p-3 space-y-2">
                        <div className="text-xs font-bold text-white uppercase tracking-wider">
                          Step 2: Enter 6-Digit Code to Verify
                        </div>
                        <p className="text-[11px] text-slate-300">
                          Enter the current 6-digit code shown in your authenticator app to confirm setup:
                        </p>
                        <input
                          type="text"
                          maxLength={6}
                          autoFocus
                          required
                          placeholder="123456"
                          value={totpVerifyCode}
                          onChange={(e) => setTotpVerifyCode(e.target.value.replace(/\D/g, ""))}
                          className="w-full bg-[#0a0e17] border border-blue-500/50 rounded-[2px] px-3 py-2 text-center text-lg tracking-[8px] font-mono text-white focus:outline-none focus:border-blue-400"
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setTotpStep("view")}
                          className="flex-1 py-2 bg-[#05070b] border border-slate-700 hover:border-slate-500 text-xs text-slate-300 font-bold uppercase tracking-wider rounded-[2px]"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={enablingTotp || totpVerifyCode.length !== 6}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider py-2 rounded-[2px] transition flex items-center justify-center gap-2"
                        >
                          {enablingTotp ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                          <span>Verify & Enable 2FA</span>
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {totpStep === "codes" && (
                  <div className="space-y-3">
                    <div className="bg-emerald-950/20 border border-emerald-500/50 rounded-[2px] p-4 space-y-3">
                      <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase tracking-wider text-xs">
                        <Check className="w-4 h-4" />
                        <span>2FA Activated Successfully!</span>
                      </div>
                      <div className="bg-amber-950/30 border border-amber-500/30 rounded-[2px] p-2.5 text-[11px] text-amber-200">
                        <strong>IMPORTANT:</strong> Save these 8 emergency recovery codes now. If you lose access to your authenticator app, these codes are the only way to recover your account. Each code can be used once.
                      </div>

                      <div className="grid grid-cols-2 gap-2 bg-[#05070b] p-3 border border-slate-800 rounded-[2px]">
                        {totpRecoveryCodes.map((code, idx) => (
                          <div
                            key={idx}
                            className="font-mono text-xs text-slate-200 bg-[#0a0e17] px-2 py-1 rounded-[2px] border border-slate-800 text-center select-all"
                          >
                            {code}
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(totpRecoveryCodes.join("\n"));
                            setCopiedRecoveryCodes(true);
                            setTimeout(() => setCopiedRecoveryCodes(false), 2000);
                          }}
                          className="flex-1 py-1.5 bg-[#05070b] border border-slate-700 hover:border-slate-500 text-xs text-slate-200 font-bold uppercase tracking-wider rounded-[2px] flex items-center justify-center gap-1.5"
                        >
                          {copiedRecoveryCodes ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedRecoveryCodes ? "Copied" : "Copy Codes"}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const blob = new Blob([
                              `VERXL PROTOCOL EMERGENCY RECOVERY CODES\nAccount: ${user.email}\nGenerated: ${new Date().toISOString()}\n\n` +
                              totpRecoveryCodes.join("\n") +
                              `\n\nKeep these codes in a secure offline location or password manager.`
                            ], { type: "text/plain" });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = url;
                            a.download = `verxl-recovery-codes-${user.email.replace(/[^a-zA-Z0-9]/g, "_")}.txt`;
                            a.click();
                            URL.revokeObjectURL(url);
                          }}
                          className="flex-1 py-1.5 bg-[#05070b] border border-slate-700 hover:border-slate-500 text-xs text-slate-200 font-bold uppercase tracking-wider rounded-[2px] flex items-center justify-center gap-1.5"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download .txt</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setTotpStep("view");
                          setShowSecurityModal(false);
                        }}
                        className="w-full mt-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider py-2 rounded-[2px] transition"
                      >
                        I Have Saved My Recovery Codes
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: PASSWORD PROTECTION */}
            {securityTab === "password" && (
              <div className="space-y-4 text-xs">
                {passwordError && (
                  <div className="p-2.5 rounded-[2px] bg-red-950/40 border border-red-500/40 text-red-300 text-xs">
                    {passwordError}
                  </div>
                )}
                {passwordSuccess && (
                  <div className="p-2.5 rounded-[2px] bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                    <Check className="w-3.5 h-3.5" />
                    <span>{passwordSuccess}</span>
                  </div>
                )}

                <div className="bg-[#05070b] border border-blue-500/30 rounded-[2px] p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Key className="w-4 h-4 text-blue-400" />
                      <span>{user.has_password ? "Update Account Password" : "Create Account Password"}</span>
                    </div>
                    {user.has_password ? (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-[2px] font-bold">
                        Password Active
                      </span>
                    ) : (
                      <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/40 px-2 py-0.5 rounded-[2px] font-bold">
                        No Password Set
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Setting a password enables cryptographic login (PBKDF2-HMAC-SHA256, 100,000 rounds) alongside passwordless email OTP. If 2FA is enabled, password login will require your 6-digit TOTP code.
                  </p>

                  <form onSubmit={handleSavePassword} className="space-y-3 pt-1">
                    <div>
                      <label className="block text-[11px] text-slate-400 uppercase tracking-wider mb-1">
                        New Password (Minimum 8 Characters)
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          required
                          minLength={8}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full bg-[#0a0e17] border border-slate-700 rounded-[2px] px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-blue-400 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-400 uppercase tracking-wider mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type={showNewPassword ? "text" : "password"}
                        required
                        minLength={8}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full bg-[#0a0e17] border border-slate-700 rounded-[2px] px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-blue-400"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={savingPassword || !newPassword || newPassword !== confirmPassword}
                      className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider py-2.5 rounded-[2px] transition flex items-center justify-center gap-2"
                    >
                      {savingPassword ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      <span>{user.has_password ? "Update Password" : "Save & Enable Password Login"}</span>
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
