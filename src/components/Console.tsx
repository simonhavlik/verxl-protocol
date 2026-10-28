import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
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
  Sparkles,
  KeyRound,
  Server,
  ArrowRight,
} from "lucide-react";

export interface ProviderModelConfig {
  id: string;
  name: string;
  context_window?: number;
  price_prompt_usd?: number;
  price_completion_usd?: number;
  price_cached_prompt_usd?: number;
  special_hours_discount?: string;
}

export interface ProviderNode {
  id: string;
  name: string;
  user_id?: string;
  base_url: string | null;
  api_key: string | null;
  payout_address: string;
  is_official_bridge: boolean;
  status: string;
  models_config: ProviderModelConfig[] | string;
  fallbacks: string[] | string;
  pending_payout_usd: number;
  total_earned_usd: number;
  created_at: string;
}

interface GrantKeyItem {
  id: string;
  name: string;
  key_prefix: string;
  is_active: boolean;
  spend_limit_usd: number;
  total_spent_usd: number;
  total_tokens: number;
  request_count: number;
  created_at: string;
  deactivated_at: string | null;
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

const TREASURY_WALLET = "0x14f10A865e277C0B1949e18Dd9856602DB11742b";

export const Console: React.FC = () => {
  // Shared Auth State across Chat & API
  const {
    token,
    user,
    keys,
    loginWithToken,
    loginWithWallet,
    linkEmail,
    logout,
    refreshSession,
    setUser,
    setKeys,
  } = useAuth();
  const [loading, setLoading] = useState(false);
  const [usage, setUsage] = useState<UsageItem[]>([]);
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

  // Deposit State with 1-Click MetaMask & Anti-Snatching Proof
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositTab, setDepositTab] = useState<"1click" | "manual">("1click");
  const [depositAmountPreset, setDepositAmountPreset] = useState<number>(5.0);
  const [customDepositAmount, setCustomDepositAmount] = useState<string>("");
  const [isDepositingWeb3, setIsDepositingWeb3] = useState(false);
  const [depositStatus, setDepositStatus] = useState<string | null>(null);
  const depositChain = "arbitrum";
  const [copiedContract, setCopiedContract] = useState(false);
  const [depositTxHash, setDepositTxHash] = useState("");
  const [verifyingDeposit, setVerifyingDeposit] = useState(false);

  // Compute Provider Fleet & Model Routing State
  const [providerNodes, setProviderNodes] = useState<ProviderNode[]>([]);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [loadingProviders, setLoadingProviders] = useState(false);
  const [showNodeModal, setShowNodeModal] = useState(false);
  const [savingNode, setSavingNode] = useState(false);
  const [showNodeKey, setShowNodeKey] = useState<{ [nodeId: string]: boolean }>({});
  const [nodeForm, setNodeForm] = useState({
    id: "",
    name: "",
    base_url: "",
    api_key: "",
    payout_address: "",
    is_official_bridge: false,
    status: "ACTIVE",
    models_config_str: "",
    fallbacks_str: "",
  });

  // Provider Payout State
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutProviderId, setPayoutProviderId] = useState("bulbasaur-prague-01");
  const [payoutAddress, setPayoutAddress] = useState("0x911C47E439971FE9f8487D43c659C990CE0589d7");
  const [payoutAmount, setPayoutAmount] = useState<number>(2.5);
  const [payoutPendingBalance, setPayoutPendingBalance] = useState<number>(12.45);
  const [submittingPayout, setSubmittingPayout] = useState(false);
  const [payoutReceipt, setPayoutReceipt] = useState<any | null>(null);

  // Link Optional Email State (for Web3 / MetaMask Accounts)
  const [showLinkEmailModal, setShowLinkEmailModal] = useState(false);
  const [linkEmailInput, setLinkEmailInput] = useState("");
  const [linkEmailCode, setLinkEmailCode] = useState("");
  const [linkEmailStep, setLinkEmailStep] = useState<"email" | "code">("email");
  const [linkingEmail, setLinkingEmail] = useState(false);
  const [linkEmailError, setLinkEmailError] = useState<string | null>(null);
  const [linkEmailSuccess, setLinkEmailSuccess] = useState<string | null>(null);

  const handleSendLinkEmailOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLinkEmailError(null);
    setLinkEmailSuccess(null);
    if (!linkEmailInput) return;
    try {
      setLinkingEmail(true);
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: linkEmailInput.trim().toLowerCase() }),
      });
      const data = (await res.json()) as any;
      if (res.ok && data.success) {
        setLinkEmailStep("code");
        setLinkEmailSuccess(`Verification code dispatched to ${linkEmailInput.trim().toLowerCase()}`);
      } else {
        setLinkEmailError(data.error || "Failed to send verification code.");
      }
    } catch (err: any) {
      setLinkEmailError(err.message || "Network error while sending verification code.");
    } finally {
      setLinkingEmail(false);
    }
  };

  const handleConfirmLinkEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLinkEmailError(null);
    setLinkEmailSuccess(null);
    if (!linkEmailCode || !linkEmailInput) return;
    try {
      setLinkingEmail(true);
      const res = await linkEmail(linkEmailInput, linkEmailCode);
      if (res.success) {
        setStatusMsg({
          type: "success",
          text: `Email '${linkEmailInput.trim().toLowerCase()}' linked to your account! You can now also log in with email OTP & configure 2FA.`,
        });
        setShowLinkEmailModal(false);
        setLinkEmailInput("");
        setLinkEmailCode("");
        setLinkEmailStep("email");
      } else {
        setLinkEmailError(res.error || "Failed to link email. Invalid or expired code.");
      }
    } catch (err: any) {
      setLinkEmailError(err.message || "Network error while linking email.");
    } finally {
      setLinkingEmail(false);
    }
  };

  // UI Utilities
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedTreasury, setCopiedTreasury] = useState(false);
  const [codeLang, setCodeLang] = useState<"curl" | "python" | "typescript">("curl");

  // Admin Free Grant Keys State (for me@simonhavlik.com)
  const [grantKeys, setGrantKeys] = useState<GrantKeyItem[]>([]);
  const [loadingGrantKeys, setLoadingGrantKeys] = useState(false);
  const [newGrantName, setNewGrantName] = useState("Public Presentation Demo");
  const [newGrantLimit, setNewGrantLimit] = useState("");
  const [creatingGrantKey, setCreatingGrantKey] = useState(false);
  const [createdGrantSecret, setCreatedGrantSecret] = useState<string | null>(null);
  const [copiedGrantSecret, setCopiedGrantSecret] = useState(false);
  const [deactivatingGrantId, setDeactivatingGrantId] = useState<string | null>(null);

  const fetchGrantKeys = async (authToken?: string) => {
    const t = authToken || token;
    if (!t) return;
    try {
      setLoadingGrantKeys(true);
      const res = await fetch("/api/admin/keys", {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (res.ok) {
        const data = (await res.json()) as any;
        setGrantKeys(
          (data.grant_keys || []).map((k: any) => ({
            ...k,
            spend_limit_usd: Number(k.spend_limit_usd || 0),
            total_spent_usd: Number(k.total_spent_usd || 0),
            total_tokens: Number(k.total_tokens || 0),
            request_count: Number(k.request_count || 0),
          }))
        );
      }
    } catch {
      // ignore
    } finally {
      setLoadingGrantKeys(false);
    }
  };

  const handleCreateGrantKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      setCreatingGrantKey(true);
      const limitVal = parseFloat(newGrantLimit);
      const res = await fetch("/api/admin/keys/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newGrantName.trim() || "Public Demo Key",
          spend_limit_usd: !isNaN(limitVal) && limitVal > 0 ? limitVal : 0,
        }),
      });
      const data = (await res.json()) as any;
      if (res.ok && data.success) {
        setCreatedGrantSecret(data.api_key);
        setNewGrantName("Public Presentation Demo");
        setNewGrantLimit("");
        setStatusMsg({
          type: "success",
          text: `Free demo grant key '${data.name}' generated successfully. Copy secret below.`,
        });
        fetchGrantKeys(token);
      } else {
        setStatusMsg({
          type: "error",
          text: data.error || "Failed to generate free grant key.",
        });
      }
    } catch {
      setStatusMsg({ type: "error", text: "Network error creating grant key." });
    } finally {
      setCreatingGrantKey(false);
    }
  };

  const handleDeactivateGrantKey = async (keyId: string) => {
    if (!token) return;
    if (!window.confirm("Are you sure you want to permanently deactivate this demo grant key? It will stay locked with an immutable audit record.")) {
      return;
    }
    try {
      setDeactivatingGrantId(keyId);
      const res = await fetch("/api/admin/keys/revoke", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ key_id: keyId }),
      });
      const data = (await res.json()) as any;
      if (res.ok && data.success) {
        setStatusMsg({
          type: "info",
          text: "Grant key permanently deactivated. Historical token and cost records remain preserved.",
        });
        fetchGrantKeys(token);
      } else {
        setStatusMsg({
          type: "error",
          text: data.error || "Failed to deactivate grant key.",
        });
      }
    } catch {
      setStatusMsg({ type: "error", text: "Network error deactivating grant key." });
    } finally {
      setDeactivatingGrantId(null);
    }
  };

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
        setUsage(
          (data.usage || []).map((u: any) => ({
            ...u,
            prompt_tokens: Number(u.prompt_tokens || 0),
            completion_tokens: Number(u.completion_tokens || 0),
            total_cost_usd: Number(u.total_cost_usd || 0),
            protocol_fee_usd: Number(u.protocol_fee_usd || 0),
          }))
        );
        if (data.user?.email?.toLowerCase() === "me@simonhavlik.com" || data.user?.is_admin) {
          setIsAdminUser(true);
          fetchGrantKeys(currentToken);
        }
        fetchProviderNodes(currentToken);
      } else {
        logout();
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
          setPayoutPendingBalance(Number(data.provider.pending_payout_usd || 0.0));
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
        await loginWithToken(data.token);
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
      await loginWithToken(data.token);
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

      await loginWithToken(data.token);
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
    logout();
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

  // Provider Fleet Handlers
  const fetchProviderNodes = async (currentToken: string) => {
    try {
      setLoadingProviders(true);
      const res = await fetch("/api/provider/manage", {
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      if (res.ok) {
        const data = (await res.json()) as any;
        setProviderNodes(data.providers || []);
        setIsAdminUser(Boolean(data.is_admin));
      }
    } catch (err) {
      console.warn("Failed to fetch provider nodes:", err);
    } finally {
      setLoadingProviders(false);
    }
  };

  const handleOpenEditNode = (node: ProviderNode) => {
    let models: any[] = [];
    try {
      if (Array.isArray(node.models_config)) models = node.models_config;
      else if (typeof node.models_config === "string") models = JSON.parse(node.models_config);
    } catch {}

    let falls: any[] = [];
    try {
      if (Array.isArray(node.fallbacks)) falls = node.fallbacks;
      else if (typeof node.fallbacks === "string") falls = JSON.parse(node.fallbacks);
    } catch {}

    const fallbackStrings = (Array.isArray(falls) ? falls : []).map((f: any) =>
      typeof f === "string" ? f : (f?.base_url || f?.url || f?.name || JSON.stringify(f))
    );

    setNodeForm({
      id: node.id,
      name: node.name,
      base_url: node.base_url || "",
      api_key: node.api_key || "",
      payout_address: node.payout_address || "",
      is_official_bridge: Boolean(node.is_official_bridge),
      status: node.status || "ACTIVE",
      models_config_str: JSON.stringify(Array.isArray(models) ? models : [], null, 2),
      fallbacks_str: fallbackStrings.join("\n"),
    });
    setShowNodeModal(true);
  };

  const handleSaveNode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nodeForm.name.trim()) {
      setStatusMsg({ type: "error", text: "Provider node name is required." });
      return;
    }
    setSavingNode(true);
    setStatusMsg(null);
    try {
      let parsedModels: any[] = [];
      try {
        parsedModels = nodeForm.models_config_str ? JSON.parse(nodeForm.models_config_str) : [];
      } catch {
        parsedModels = [
          {
            id: nodeForm.name.toLowerCase().includes("deepseek")
              ? "deepseek-v4.1-flash"
              : nodeForm.name.toLowerCase().includes("mimo")
              ? "mimo-v2.6-flash"
              : "qwen3.5-4b-uncensored-32k",
            name: nodeForm.name,
            context_window: 1000000,
            price_prompt_usd: nodeForm.name.toLowerCase().includes("deepseek")
              ? 0.30
              : nodeForm.name.toLowerCase().includes("mimo")
              ? 0.14
              : 0.05,
            price_completion_usd: nodeForm.name.toLowerCase().includes("deepseek")
              ? 1.20
              : nodeForm.name.toLowerCase().includes("mimo")
              ? 0.28
              : 0.10,
            price_cached_prompt_usd: nodeForm.name.toLowerCase().includes("deepseek")
              ? 0.006
              : nodeForm.name.toLowerCase().includes("mimo")
              ? 0.0028
              : 0.010,
          },
        ];
      }

      let parsedFallbacks: string[] = [];
      if (nodeForm.fallbacks_str) {
        parsedFallbacks = nodeForm.fallbacks_str
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean);
      }

      const res = await fetch("/api/provider/manage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token || ""}`,
        },
        body: JSON.stringify({
          id: nodeForm.id || undefined,
          name: nodeForm.name.trim(),
          base_url: nodeForm.base_url.trim() || null,
          api_key: nodeForm.api_key.trim() || null,
          payout_address: nodeForm.payout_address.trim() || undefined,
          is_official_bridge: Boolean(nodeForm.is_official_bridge),
          status: nodeForm.status,
          models_config: parsedModels,
          fallbacks: parsedFallbacks,
        }),
      });

      const data = (await res.json()) as any;
      if (res.ok && data.success) {
        setStatusMsg({ type: "success", text: data.message || "Provider node saved successfully!" });
        setShowNodeModal(false);
        if (token) fetchProviderNodes(token);
      } else {
        setStatusMsg({ type: "error", text: data.error || "Failed to save provider node." });
      }
    } catch (err: any) {
      setStatusMsg({ type: "error", text: "Network error saving provider: " + err.message });
    } finally {
      setSavingNode(false);
    }
  };

  const handleToggleOfficialBridge = async (node: ProviderNode) => {
    if (!isAdminUser && user?.email?.toLowerCase() !== "me@simonhavlik.com") {
      setStatusMsg({
        type: "error",
        text: "Permission denied: Official Bridge designation is exclusive to protocol admin (me@simonhavlik.com).",
      });
      return;
    }
    try {
      let models: any[] = [];
      try {
        if (Array.isArray(node.models_config)) models = node.models_config;
        else if (typeof node.models_config === "string") models = JSON.parse(node.models_config);
      } catch {}

      let falls: any[] = [];
      try {
        if (Array.isArray(node.fallbacks)) falls = node.fallbacks;
        else if (typeof node.fallbacks === "string") falls = JSON.parse(node.fallbacks);
      } catch {}

      const res = await fetch("/api/provider/manage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token || ""}`,
        },
        body: JSON.stringify({
          id: node.id,
          name: node.name,
          base_url: node.base_url,
          api_key: node.api_key,
          payout_address: node.payout_address,
          is_official_bridge: !node.is_official_bridge,
          status: node.status,
          models_config: models,
          fallbacks: falls,
        }),
      });
      const data = (await res.json()) as any;
      if (res.ok && data.success) {
        setStatusMsg({ type: "success", text: `Node ${node.name} bridge status updated.` });
        if (token) fetchProviderNodes(token);
      } else {
        setStatusMsg({ type: "error", text: data.error || "Failed to update bridge status." });
      }
    } catch (err: any) {
      setStatusMsg({ type: "error", text: "Error toggling bridge: " + err.message });
    }
  };

  // 1-Click In-App MetaMask Deposit with Cryptographic Ownership Proof (Anti-Snatching)
  const handle1ClickWeb3Deposit = async () => {
    const amountUsd = customDepositAmount ? parseFloat(customDepositAmount) : depositAmountPreset;
    if (!amountUsd || amountUsd < 0.1) {
      setDepositStatus("Minimum deposit is $0.10 USD.");
      return;
    }
    if (typeof window === "undefined" || !(window as any).ethereum) {
      setDepositStatus("MetaMask or Web3 wallet not detected. Switch to Manual tab or install MetaMask.");
      return;
    }

    setIsDepositingWeb3(true);
    setDepositStatus("Connecting MetaMask...");
    try {
      const eth = (window as any).ethereum;
      const [account] = await eth.request({ method: "eth_requestAccounts" });

      // Verify network is Arbitrum One (Chain ID 42161 = 0xa4b1)
      const chainId = await eth.request({ method: "eth_chainId" });
      if (chainId !== "0xa4b1" && chainId !== "42161") {
        setDepositStatus("Switching to Arbitrum One network in MetaMask...");
        try {
          await eth.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0xa4b1" }],
          });
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            await eth.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: "0xa4b1",
                  chainName: "Arbitrum One",
                  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
                  rpcUrls: ["https://arb1.arbitrum.io/rpc"],
                  blockExplorerUrls: ["https://arbiscan.io"],
                },
              ],
            });
          } else {
            throw switchError;
          }
        }
      }

      setDepositStatus(`Confirming $${Number(amountUsd || 0).toFixed(2)} USDC transfer in MetaMask...`);
      // Native Arbitrum USDC contract: 0xaf88d065e77c8cc2239327c5edb3a432268e5831 (6 decimals)
      const usdcContract = "0xaf88d065e77c8cc2239327c5edb3a432268e5831";
      const treasuryPadded = TREASURY_WALLET.slice(2).padStart(64, "0").toLowerCase();
      const rawUnits = Math.round(amountUsd * 1e6);
      const amountPadded = rawUnits.toString(16).padStart(64, "0");
      const transferCalldata = `0xa9059cbb${treasuryPadded}${amountPadded}`;

      const txHash = await eth.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: account,
            to: usdcContract,
            data: transferCalldata,
          },
        ],
      });

      setDepositStatus(`Transaction sent (${txHash.slice(0, 10)}...)! Signing zero-gas anti-snatching ownership proof...`);
      let signature = "";
      try {
        signature = await eth.request({
          method: "personal_sign",
          params: [`Verxl Deposit Verification: ${txHash.toLowerCase()}`, account],
        });
      } catch (sigErr) {
        console.warn("Signature skipped/cancelled:", sigErr);
      }

      setDepositStatus("Waiting for Arbitrum block confirmation & settlement...");
      // Poll verify endpoint
      let settled = false;
      for (let attempt = 1; attempt <= 12; attempt++) {
        try {
          const res = await fetch("/api/deposit/verify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token || ""}`,
            },
            body: JSON.stringify({
              tx_hash: txHash,
              signature: signature || undefined,
              wallet_address: account,
            }),
          });
          const data = (await res.json()) as any;
          if (res.ok && data.success) {
            const added = Number(data.amount_usd ?? data.deposit?.amount_usd ?? amountUsd);
            setDepositStatus(`🎉 Deposit confirmed on Arbitrum One! +$${Number(added || 0).toFixed(2)} USD added.`);
            if (data.token && !token) {
              await loginWithToken(data.token);
            } else {
              await refreshSession();
            }
            if (data.new_api_key) {
              setGeneratedKeySecret(data.new_api_key);
            }
            settled = true;
            setTimeout(() => {
              setShowDepositModal(false);
              setDepositStatus(null);
            }, 2000);
            if (token || data.token) {
              fetchSessionData(data.token || token);
            }
            break;
          }
        } catch {}
        await new Promise((r) => setTimeout(r, 2000));
      }

      if (!settled) {
        setDepositStatus(`Broadcasted: ${txHash.slice(0, 14)}... Blockchain receipt is settling. Your balance will update shortly.`);
      }
    } catch (err: any) {
      setDepositStatus(err.message || "Transaction was rejected or failed.");
    } finally {
      setIsDepositingWeb3(false);
    }
  };

  // Handlers: Verify Deposit (Manual Tx Hash with Anti-Snatching Cryptographic Signature)
  const handleVerifyDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositTxHash || !depositTxHash.startsWith("0x")) {
      setStatusMsg({ type: "error", text: "Valid 0x transaction hash is required." });
      return;
    }
    setVerifyingDeposit(true);
    setStatusMsg(null);
    setDepositStatus(null);
    try {
      let signature = "";
      if (typeof window !== "undefined" && (window as any).ethereum) {
        try {
          const eth = (window as any).ethereum;
          const [account] = await eth.request({ method: "eth_accounts" });
          if (account) {
            setDepositStatus("Prompting wallet signature to verify ownership...");
            signature = await eth.request({
              method: "personal_sign",
              params: [`Verxl Deposit Verification: ${depositTxHash.trim().toLowerCase()}`, account],
            });
          }
        } catch {}
      }

      const res = await fetch("/api/deposit/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token || ""}`,
        },
        body: JSON.stringify({
          tx_hash: depositTxHash.trim(),
          chain: depositChain,
          amount_usd: customDepositAmount ? parseFloat(customDepositAmount) || depositAmountPreset : depositAmountPreset,
          signature: signature || undefined,
        }),
      });
      const data = (await res.json()) as any;
      if (res.ok && data.success) {
        const added = Number(data.amount_usd ?? data.deposit?.amount_usd ?? 0);
        const newBal = Number(data.new_balance_usd ?? data.deposit?.new_balance_usd ?? ((Number(user?.balance_usd) || 0) + added));
        setStatusMsg({
          type: "success",
          text: `Deposit confirmed! Credited $${Number(added || 0).toFixed(2)} USD. Your balance is now $${Number(newBal || 0).toFixed(2)} USD.`,
        });
        setDepositStatus(`Deposit confirmed! +$${Number(added || 0).toFixed(2)} USD credited.`);
        if (data.token && !token) {
          await loginWithToken(data.token);
        } else {
          await refreshSession();
        }
        if (data.new_api_key) {
          setGeneratedKeySecret(data.new_api_key);
        }
        setShowDepositModal(false);
        setDepositTxHash("");
        fetchSessionData(data.token || token);
      } else {
        setStatusMsg({ type: "error", text: data.error || "Deposit verification failed." });
        setDepositStatus(data.error || "Deposit verification failed.");
      }
    } catch (err: any) {
      setStatusMsg({ type: "error", text: "Verification network error: " + err.message });
      setDepositStatus("Verification network error: " + err.message);
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
          text: `Payout request of $${Number(data.amount_usd || 0).toFixed(2)} USD queued! Net settlement: $${Number(data.net_payout_usd || 0).toFixed(2)} USD (50 bps fee).`,
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
          <span>Min Deposit: <strong className="text-white">$0.10 USD</strong></span>
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
                Sign in with your Web3 wallet, passwordless email OTP, or cryptographic password with hardware TOTP 2FA.
              </p>
            </div>

            {/* Primary Authentication: 1-Click MetaMask Web3 Wallet */}
            <div className="bg-[#05070b] border-2 border-emerald-500/40 rounded-[3px] p-4 space-y-3 shadow-lg shadow-emerald-500/5">
              <div className="flex items-center justify-between text-[11px] text-slate-300">
                <span className="font-bold flex items-center gap-1.5 text-white">
                  <Wallet className="w-4 h-4 text-emerald-400" />
                  <span>Primary Authentication: MetaMask</span>
                </span>
                <span className="px-1.5 py-0.2 rounded-[2px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-[9px] uppercase tracking-wider">
                  Web3 Direct
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                Connect your MetaMask Web3 wallet for instant, non-custodial access to API keys, model routing, and balance clearing. Email is completely optional.
              </p>
              <button
                type="button"
                onClick={async () => {
                  if (typeof window !== "undefined" && (window as any).ethereum) {
                    try {
                      setStatusMsg({ type: "info", text: "Connecting MetaMask..." });
                      const eth = (window as any).ethereum;
                      const [account] = await eth.request({ method: "eth_requestAccounts" });
                      if (account) {
                        const res = await loginWithWallet(account);
                        if (res.success) {
                          setStatusMsg({
                            type: "success",
                            text: `Connected MetaMask wallet ${account.slice(0, 6)}...${account.slice(-4)}. Welcome!`,
                          });
                        } else {
                          setStatusMsg({ type: "error", text: res.error || "Wallet authentication failed." });
                        }
                      }
                    } catch (err: any) {
                      setStatusMsg({ type: "error", text: err.message || "MetaMask connect cancelled." });
                    }
                  } else {
                    setStatusMsg({ type: "error", text: "MetaMask not detected in browser." });
                  }
                }}
                className="w-full py-2.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white rounded-[2px] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition cursor-pointer active:scale-[0.99]"
              >
                <Wallet className="w-4 h-4" />
                <span>Connect MetaMask Wallet</span>
              </button>
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-800"></div>
              <span className="flex-shrink mx-2 text-[10px] text-slate-400 uppercase tracking-wider">
                Or Continue With Email (Optional Login / 2FA)
              </span>
              <div className="flex-grow border-t border-slate-800"></div>
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
              <div className="flex items-center gap-2 flex-wrap">
                {user.wallet_address ? (
                  <div
                    className="flex items-center gap-1.5 font-mono text-xs font-bold text-white bg-blue-500/10 border border-blue-500/30 px-2 py-0.5 rounded-[2px]"
                    title={`MetaMask Connected: ${user.wallet_address}`}
                  >
                    <Wallet className="w-3.5 h-3.5 text-blue-400" />
                    <span>
                      {typeof user.wallet_address === "string" && user.wallet_address.length >= 10
                        ? `${user.wallet_address.slice(0, 6)}...${user.wallet_address.slice(-4)}`
                        : user.wallet_address}
                    </span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={async () => {
                      if (typeof window !== "undefined" && (window as any).ethereum) {
                        try {
                          const eth = (window as any).ethereum;
                          const [account] = await eth.request({ method: "eth_requestAccounts" });
                          if (account) await loginWithWallet(account);
                        } catch {}
                      }
                    }}
                    className="flex items-center gap-1 font-mono text-[10.5px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-[2px] hover:bg-emerald-500/20 transition cursor-pointer"
                    title="Connect MetaMask to link your Web3 wallet to this account"
                  >
                    <Wallet className="w-3 h-3" />
                    <span>Connect MetaMask</span>
                  </button>
                )}

                {/* Email Display or Link Email Button */}
                {user.email && !user.email.endsWith("@web3.verxl.user") ? (
                  <span className="text-xs text-slate-300 font-sans flex items-center gap-1.5 bg-[#05070b] border border-slate-800 px-2 py-0.5 rounded-[2px]">
                    <Mail className="w-3 h-3 text-slate-400" />
                    <span>{user.email}</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setLinkEmailError(null);
                      setLinkEmailSuccess(null);
                      setLinkEmailStep("email");
                      setShowLinkEmailModal(true);
                    }}
                    className="px-2 py-0.5 rounded-[2px] bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 hover:text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition cursor-pointer"
                    title="Add an optional email for OTP login, recovery, or 2FA backups"
                  >
                    <Mail className="w-3 h-3 text-blue-400" />
                    <span>+ Add Email (Optional)</span>
                  </button>
                )}

                <span className="px-1.5 py-0.2 rounded-[2px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold">
                  AUTHENTICATED
                </span>
                {(user.email?.toLowerCase() === "me@simonhavlik.com" ||
                  user.wallet_address?.toLowerCase() === "0x9b64203878f24eb0cdf55c8c6fa7d08ba0cf77e5" ||
                  user.is_admin) && (
                  <span className="px-1.5 py-0.2 rounded-[2px] bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 font-mono">
                    <Sparkles className="w-2.5 h-2.5 text-purple-400" />
                    <span>ADMIN</span>
                  </span>
                )}
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
            ${user ? Number(user.balance_usd || 0).toFixed(4) : "0.0000"}{" "}
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
            ${user ? Number(user.total_deposited_usd || 0).toFixed(2) : "0.00"}{" "}
            <span className="text-xs font-normal text-slate-400">USD</span>
          </div>
          <div className="text-[10px] text-slate-400 border-t border-slate-800/80 pt-2 flex items-center justify-between">
            <span>Arbitrum L2 (<span className="text-slate-300">&lt;$0.01 gas</span>)</span>
            <span className={user && Number(user.total_deposited_usd || 0) >= 1.0 ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
              {user && Number(user.total_deposited_usd || 0) >= 1.0 ? "Deposit Threshold Met" : "Min $1.00 Req to Unlock Key"}
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
            ${user ? Number(user.total_spent_usd || 0).toFixed(4) : "0.0000"}{" "}
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
              disabled={!user || Number(user.total_deposited_usd || 0) < 1.0 || creatingKey}
              className="px-3 py-1.5 rounded-[2px] bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition"
              title={!user || Number(user.total_deposited_usd || 0) < 1.0 ? "Deposit at least $1.00 to unlock key creation" : "Generate new production key"}
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
        ) : Number(user.total_deposited_usd || 0) < 1.0 ? (
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

      {/* SECTION 3.5: ADMIN CONTROL — PUBLIC DEMO & GRANT KEYS */}
      {(user?.email?.toLowerCase() === "me@simonhavlik.com" || user?.is_admin) && (
        <div className="bg-[#0a0e17] border-2 border-purple-500/40 rounded-[3px] p-4 sm:p-5 space-y-4 shadow-xl relative overflow-hidden">
          {/* Subtle Accent Glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-purple-600/10 rounded-full blur-2xl pointer-events-none" />

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-500/30 pb-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.2 rounded-[2px] bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[9px] font-mono font-bold tracking-wider uppercase">
                  Admin Authority · me@simonhavlik.com
                </span>
                <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Grant Hub Active
                </span>
              </div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 pt-0.5">
                <KeyRound className="w-4 h-4 text-purple-400" />
                <span>Public Demo & Presentation Free Keys</span>
              </h3>
              <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                Generate zero-deposit <strong>Free Grant Keys</strong> (<code className="text-purple-300 font-mono">vrxl_grant_...</code>) for live stage presentations, hackathon jury reviews, and investor demos. Usage cost is tracked per key without deducting user balance. When a key is deactivated, it stays locked permanently with an immutable audit record.
              </p>
            </div>

            <button
              onClick={() => fetchGrantKeys()}
              disabled={loadingGrantKeys}
              className="self-start sm:self-auto px-2.5 py-1 rounded-[2px] bg-[#05070b] border border-slate-700 text-slate-300 hover:text-white text-[10px] font-mono flex items-center gap-1.5 transition"
              title="Refresh grant keys audit list"
            >
              <RefreshCw className={`w-3 h-3 ${loadingGrantKeys ? "animate-spin text-purple-400" : ""}`} />
              <span>Sync Ledger</span>
            </button>
          </div>

          {/* Metric Summary Ticker */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs font-mono">
            <div className="bg-[#05070b] p-2.5 rounded-[2px] border border-slate-800 space-y-0.5">
              <div className="text-[9.5px] text-slate-400 uppercase">Active Grant Keys</div>
              <div className="text-base font-bold text-emerald-400">
                {grantKeys.filter((k) => k.is_active).length}{" "}
                <span className="text-[10px] text-slate-400 font-normal">
                  / {grantKeys.length} Total
                </span>
              </div>
            </div>
            <div className="bg-[#05070b] p-2.5 rounded-[2px] border border-slate-800 space-y-0.5">
              <div className="text-[9.5px] text-slate-400 uppercase">Cumulative Demo Compute Used</div>
              <div className="text-base font-bold text-purple-300">
                ${grantKeys.reduce((acc, k) => acc + (Number(k.total_spent_usd) || 0), 0).toFixed(4)}{" "}
                <span className="text-[10px] text-slate-400 font-normal">USD</span>
              </div>
            </div>
            <div className="bg-[#05070b] p-2.5 rounded-[2px] border border-slate-800 space-y-0.5">
              <div className="text-[9.5px] text-slate-400 uppercase">Total Tokens Cleared</div>
              <div className="text-base font-bold text-blue-300">
                {grantKeys.reduce((acc, k) => acc + (Number(k.total_tokens) || 0), 0).toLocaleString()}{" "}
                <span className="text-[10px] text-slate-400 font-normal">Tokens</span>
              </div>
            </div>
          </div>

          {/* Key Creation Form */}
          <form
            onSubmit={handleCreateGrantKey}
            className="bg-[#05070b] border border-purple-500/30 rounded-[2px] p-3 space-y-2.5"
          >
            <div className="text-[10.5px] font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Generate New Free Demo Grant Key</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs font-mono">
              <div className="sm:col-span-6 space-y-1">
                <label className="text-[10px] text-slate-400 block">
                  Key Purpose / Presentation Label
                </label>
                <input
                  type="text"
                  value={newGrantName}
                  onChange={(e) => setNewGrantName(e.target.value)}
                  placeholder="e.g. Prague VŠE Seminar Live Demo"
                  className="w-full bg-[#080c14] border border-slate-700 rounded-[2px] px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                  required
                />
              </div>
              <div className="sm:col-span-3 space-y-1">
                <label className="text-[10px] text-slate-400 block">
                  Spend Cap USD (0 = Unlimited)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={newGrantLimit}
                  onChange={(e) => setNewGrantLimit(e.target.value)}
                  placeholder="0 (Unlimited)"
                  className="w-full bg-[#080c14] border border-slate-700 rounded-[2px] px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>
              <div className="sm:col-span-3 flex items-end">
                <button
                  type="submit"
                  disabled={creatingGrantKey || !newGrantName.trim()}
                  className="w-full px-3 py-1.5 rounded-[2px] bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition"
                >
                  {creatingGrantKey ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <KeyRound className="w-3.5 h-3.5" />}
                  <span>+ Generate Key</span>
                </button>
              </div>
            </div>
          </form>

          {/* Revealed Secret Banner for Created Grant Key */}
          {createdGrantSecret && (
            <div className="bg-[#05070b] border-2 border-purple-500/70 rounded-[3px] p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-purple-300 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>New Free Demo Grant Key Generated</span>
                </span>
                <button
                  onClick={() => setCreatedGrantSecret(null)}
                  className="text-[10px] text-slate-400 hover:text-white uppercase tracking-wider"
                >
                  Dismiss
                </button>
              </div>
              <p className="text-[11px] text-slate-300 font-sans">
                Copy this key now. It bypasses prepaid deposit checks and tracks usage per-key against the compute host.
              </p>
              <div className="flex items-center gap-2 bg-[#080c14] border border-purple-500/40 rounded-[2px] p-2 text-xs font-mono text-purple-200">
                <span className="truncate select-all font-bold">{createdGrantSecret}</span>
                <button
                  onClick={() => copyToClipboard(createdGrantSecret, setCopiedGrantSecret)}
                  className="ml-auto px-2 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-[2px] text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shrink-0"
                >
                  {copiedGrantSecret ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedGrantSecret ? "Copied" : "Copy Secret"}</span>
                </button>
              </div>
            </div>
          )}

          {/* Grant Keys Table */}
          {grantKeys.length === 0 ? (
            <div className="text-center py-5 text-xs text-slate-400 bg-[#05070b] border border-slate-800 rounded-[2px]">
              No free demo grant keys generated yet. Use the form above to create your first presentation key.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#05070b] text-[10px] text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-2 px-3">Purpose / Label</th>
                    <th className="py-2 px-3">Prefix</th>
                    <th className="py-2 px-3">Created</th>
                    <th className="py-2 px-3">Spend Accrued</th>
                    <th className="py-2 px-3">Tokens Cleared</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {grantKeys.map((k) => (
                    <tr key={k.id} className="hover:bg-slate-900/40">
                      <td className="py-2.5 px-3 font-semibold text-white">
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                          <span>{k.name}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-purple-300">{k.key_prefix}</td>
                      <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                        {new Date(k.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-2.5 px-3 text-slate-200">
                        ${Number(k.total_spent_usd || 0).toFixed(4)}{" "}
                        <span className="text-[10px] text-slate-400">
                          {Number(k.spend_limit_usd || 0) > 0 ? `/ $${Number(k.spend_limit_usd || 0).toFixed(2)}` : "(Unlimited)"}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-blue-300">
                        {Number(k.total_tokens || 0).toLocaleString()}{" "}
                        <span className="text-[10px] text-slate-400">({Number(k.request_count || 0)} reqs)</span>
                      </td>
                      <td className="py-2.5 px-3">
                        {k.is_active ? (
                          <span className="px-1.5 py-0.2 rounded-[2px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold uppercase">
                            Active Grant
                          </span>
                        ) : (
                          <div className="space-y-0.5">
                            <span className="px-1.5 py-0.2 rounded-[2px] bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[9px] font-bold uppercase">
                              Deactivated
                            </span>
                            {k.deactivated_at && (
                              <div className="text-[8.5px] text-slate-400">
                                {new Date(k.deactivated_at).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {k.is_active ? (
                          <button
                            onClick={() => handleDeactivateGrantKey(k.id)}
                            disabled={deactivatingGrantId === k.id}
                            className="text-[10px] text-rose-400 hover:text-rose-300 font-bold uppercase tracking-wider hover:underline transition"
                            title="Deactivate this demo key permanently (usage records remain preserved)"
                          >
                            {deactivatingGrantId === k.id ? "Deactivating..." : "Deactivate Key"}
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400 uppercase font-mono">
                            Permanent Record
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SECTION 3.5: COMPUTE PROVIDER FLEET & MODEL ROUTING */}
      {user && (
        <div className="bg-[#0a0e17] border border-blue-500/20 rounded-[3px] p-4 sm:p-5 space-y-4 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Server className="w-4 h-4 text-purple-400" />
                  <span>Compute Provider Fleet & Model Routing</span>
                </h3>
                {isAdminUser && (
                  <span className="px-1.5 py-0.2 rounded-[2px] bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 font-mono">
                    <Sparkles className="w-2.5 h-2.5 text-purple-400" />
                    <span>Bridge Master</span>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 font-sans">
                Manage your resident GPU compute clusters, upstream Base URLs, provider API keys, 1M context limits, and routing fallbacks.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => {
                  setNodeForm({
                    id: "",
                    name: "",
                    base_url: "",
                    api_key: "",
                    payout_address: user.wallet_address || "",
                    is_official_bridge: false,
                    status: "ACTIVE",
                    models_config_str: JSON.stringify([
                      {
                        id: "qwen-3.5-4b-uncensored-32k",
                        name: "Qwen 3.5 4B Uncensored (1M Context)",
                        context_window: 1000000,
                        price_prompt_usd: 0.05,
                        price_completion_usd: 0.10,
                        price_cached_prompt_usd: 0.010,
                        special_hours_discount: "Flat bare-metal $0.025 / $0.05"
                      }
                    ], null, 2),
                    fallbacks_str: "https://node1.verxl.com/v1",
                  });
                  setShowNodeModal(true);
                }}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-[2px] font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition"
              >
                <span>+ Register Provider Node</span>
              </button>
            </div>
          </div>

          {loadingProviders ? (
            <div className="py-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2 font-mono">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-400" />
              <span>Hydrating registered GPU nodes from PostgreSQL cluster...</span>
            </div>
          ) : providerNodes.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-400 bg-[#05070b] border border-slate-800 rounded-[2px]">
              No compute provider nodes registered under this account yet. Click "+ Register Provider Node" above to connect your bare-metal GPU or API bridge.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3.5">
              {providerNodes.map((node) => {
                let models: any[] = [];
                try {
                  if (Array.isArray(node.models_config)) {
                    models = node.models_config;
                  } else if (typeof node.models_config === "string") {
                    const parsed = JSON.parse(node.models_config);
                    models = Array.isArray(parsed) ? parsed : [];
                  }
                } catch {
                  models = [];
                }

                let falls: any[] = [];
                try {
                  if (Array.isArray(node.fallbacks)) {
                    falls = node.fallbacks;
                  } else if (typeof node.fallbacks === "string") {
                    const parsed = JSON.parse(node.fallbacks);
                    falls = Array.isArray(parsed) ? parsed : [];
                  }
                } catch {
                  falls = [];
                }

                const isKeyRevealed = showNodeKey[node.id] || false;

                return (
                  <div
                    key={node.id}
                    className="bg-[#05070b] border border-slate-800 hover:border-purple-500/40 rounded-[3px] p-3.5 sm:p-4 space-y-3 transition"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white text-xs">{node.name}</span>
                        <code className="text-[10px] text-purple-300 bg-purple-500/10 px-1.5 py-0.5 rounded-[2px] font-mono">
                          {node.id}
                        </code>
                        <span className={`px-1.5 py-0.2 rounded-[2px] text-[9px] font-bold uppercase tracking-wider ${
                          node.status === "ACTIVE"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : "bg-slate-800 text-slate-400"
                        }`}>
                          {node.status}
                        </span>

                        {node.is_official_bridge ? (
                          <span className="px-1.5 py-0.2 rounded-[2px] bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 font-mono">
                            <Sparkles className="w-2.5 h-2.5 text-purple-400" />
                            <span>Official Bridge</span>
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.2 rounded-[2px] bg-slate-800 text-slate-400 border border-slate-700 text-[9px] font-bold uppercase tracking-wider">
                            Community Node
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        {/* Admin Official Bridge Interactive Toggle */}
                        {isAdminUser ? (
                          <button
                            type="button"
                            onClick={() => handleToggleOfficialBridge(node)}
                            className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-[2px] transition flex items-center gap-1 border ${
                              node.is_official_bridge
                                ? "bg-purple-600/30 border-purple-400 text-purple-200 hover:bg-purple-600/50"
                                : "bg-[#0a0e17] border-slate-700 text-slate-400 hover:border-purple-400 hover:text-white"
                            }`}
                            title="Admin privilege: designate this node as the official protocol bridge model"
                          >
                            <Sparkles className="w-3 h-3 text-purple-400" />
                            <span>Official Bridge: {node.is_official_bridge ? "ON" : "OFF"}</span>
                          </button>
                        ) : (
                          <span
                            className="text-[9.5px] text-slate-400 font-mono flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded-[2px] border border-slate-800"
                            title="Official Bridge designation requires admin credentials (me@simonhavlik.com)"
                          >
                            <Lock className="w-2.5 h-2.5 text-slate-400" />
                            <span>Bridge: {node.is_official_bridge ? "Official" : "Standard"}</span>
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => handleOpenEditNode(node)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-[2px] text-[10px] font-bold uppercase tracking-wider transition"
                        >
                          Configure
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      {/* Connection Details */}
                      <div className="space-y-1.5">
                        <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                          Inference Connection
                        </div>
                        <div className="bg-[#0a0e17] border border-slate-800 rounded-[2px] p-2 space-y-1 text-[11px] font-mono">
                          <div className="flex items-center justify-between text-slate-400">
                            <span>Base URL:</span>
                            <span className="text-white truncate max-w-[280px]">
                              {node.base_url || "https://node1.verxl.com/v1"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-slate-400">
                            <span>API Key:</span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-purple-300">
                                {node.api_key
                                  ? (isKeyRevealed ? node.api_key : "••••••••••••••••")
                                  : "Verxl Protocol Sovereign Vault"}
                              </span>
                              {node.api_key && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setShowNodeKey((prev) => ({
                                      ...prev,
                                      [node.id]: !prev[node.id],
                                    }))
                                  }
                                  className="text-slate-400 hover:text-white transition"
                                >
                                  {isKeyRevealed ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-slate-400">
                            <span>Payout Wallet:</span>
                            <span className="text-slate-300 truncate max-w-[280px]">
                              {node.payout_address || "Default Treasury"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Routing Fallbacks */}
                      <div className="space-y-1.5">
                        <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                          Routing Fallbacks ({falls.length})
                        </div>
                        <div className="bg-[#0a0e17] border border-slate-800 rounded-[2px] p-2 space-y-1 text-[10.5px] font-mono">
                          {falls.length === 0 ? (
                            <div className="text-slate-400 italic">No secondary failover endpoints configured.</div>
                          ) : (
                            falls.map((f, i) => {
                              const fallbackText =
                                typeof f === "string"
                                  ? f
                                  : f?.base_url || f?.url || f?.name || JSON.stringify(f);
                              return (
                                <div key={i} className="text-blue-300 truncate flex items-center gap-1.5">
                                  <span className="text-slate-400 text-[9px]">{i + 1}.</span>
                                  <span className="truncate" title={fallbackText}>{fallbackText}</span>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Models Configuration & 1M Context Window */}
                    {models.length > 0 && (
                      <div className="pt-2 border-t border-slate-800/60">
                        <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5">
                          Hosted Models & 1M Context Pricing
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {models.map((m, idx) => {
                            const modelName =
                              typeof m === "string"
                                ? m
                                : m?.name || m?.model_id || m?.id || "Configured Model";
                            const ctxWindow =
                              typeof m === "object" && m !== null
                                ? m.context_window || 1000000
                                : 1000000;
                            const promptPrice =
                              typeof m === "object" && m !== null
                                ? m.price_prompt_usd ?? m.prompt_rate ?? 0.05
                                : 0.05;
                            const complPrice =
                              typeof m === "object" && m !== null
                                ? m.price_completion_usd ?? m.completion_rate ?? 0.10
                                : 0.10;
                            const cachedPrice =
                              typeof m === "object" && m !== null
                                ? m.price_cached_prompt_usd ?? m.cached_prompt_rate
                                : undefined;
                            const specialDiscount =
                              typeof m === "object" && m !== null
                                ? m.special_hours_discount || m.special_hours_description
                                : undefined;

                            return (
                              <div
                                key={idx}
                                className="bg-[#0a0e17] border border-slate-800 rounded-[2px] p-2 text-[11px] font-mono space-y-1"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-white font-bold truncate max-w-[200px]" title={modelName}>
                                    {modelName}
                                  </span>
                                  <span className="text-emerald-400 text-[10px] font-semibold flex items-center gap-1 shrink-0">
                                    <Sparkles className="w-2.5 h-2.5" />
                                    {ctxWindow >= 1000000 ? "1M Context" : `${ctxWindow / 1024}k`}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-slate-400 text-[10px]">
                                  <span>Prompt / Compl:</span>
                                  <span className="text-slate-200">
                                    ${promptPrice} / ${complPrice} per 1M
                                  </span>
                                </div>
                                {cachedPrice !== undefined && cachedPrice !== null && (
                                  <div className="flex items-center justify-between text-slate-400 text-[10px]">
                                    <span>Prompt Cache Hit:</span>
                                    <span className="text-emerald-400 font-semibold">
                                      ${cachedPrice} / 1M
                                    </span>
                                  </div>
                                )}
                                {specialDiscount && (
                                  <div className="text-[9.5px] text-purple-300 font-sans border-t border-slate-800/80 pt-1">
                                    {specialDiscount}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

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
                    <td className="py-2 px-3 text-slate-400">{Number(u.prompt_tokens || 0)} tok</td>
                    <td className="py-2 px-3 text-slate-400">{Number(u.completion_tokens || 0)} tok</td>
                    <td className="py-2 px-3 text-emerald-400 font-bold">${Number(u.total_cost_usd || 0).toFixed(6)}</td>
                    <td className="py-2 px-3 text-blue-400">${Number(u.protocol_fee_usd || 0).toFixed(6)}</td>
                    <td className="py-2 px-3 text-slate-400">{new Date(u.created_at).toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: DEPOSIT USDC ON ARBITRUM (1-CLICK METAMASK & ANTI-SNATCHING PROOF) */}
      {showDepositModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg max-h-[92vh] overflow-y-auto bg-[#0a0e17] border border-blue-500/40 rounded-[3px] p-4 sm:p-6 shadow-2xl space-y-4 my-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Deposit USDC on Arbitrum One
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowDepositModal(false);
                  setDepositStatus(null);
                }}
                className="text-slate-400 hover:text-white text-xs uppercase"
              >
                ✕ Close
              </button>
            </div>

            {/* Dual Tabs: 1-Click MetaMask vs Manual Tx Hash */}
            <div className="flex border-b border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setDepositTab("1click");
                  setDepositStatus(null);
                }}
                className={`flex-1 py-2 text-center text-xs font-semibold flex items-center justify-center gap-1.5 transition border-b-2 ${
                  depositTab === "1click"
                    ? "border-emerald-400 text-emerald-300 bg-emerald-500/10"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>1-Click MetaMask (Instant)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setDepositTab("manual");
                  setDepositStatus(null);
                }}
                className={`flex-1 py-2 text-center text-xs font-semibold flex items-center justify-center gap-1.5 transition border-b-2 ${
                  depositTab === "manual"
                    ? "border-blue-500 text-blue-400 bg-blue-500/10"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>Manual Tx Hash</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* TAB 1: 1-CLICK METAMASK */}
              {depositTab === "1click" && (
                <div className="space-y-3.5">
                  <div className="bg-[#05070b] border border-emerald-500/30 rounded-[2px] p-3 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-wider">
                      <span>Anti-Snatching Settlement Rail</span>
                      <span className="px-1.5 py-0.2 rounded-[2px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold text-[9px]">
                        PROTECTED
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                      Transfers native USDC directly on <span className="text-blue-300 font-semibold">Arbitrum One</span> and signs a zero-gas cryptographic proof so <span className="text-emerald-300 font-semibold">no front-running bot can snatch your deposit</span>.
                    </p>
                  </div>

                  {/* Amount Presets */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                      Select Preset Amount (USDC):
                    </label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[1, 5, 10, 25].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => {
                            setDepositAmountPreset(amt);
                            setCustomDepositAmount("");
                          }}
                          className={`py-1.5 rounded-[2px] font-mono text-xs font-bold transition border ${
                            depositAmountPreset === amt && !customDepositAmount
                              ? "bg-emerald-600/30 border-emerald-400 text-emerald-300 shadow-sm"
                              : "bg-[#05070b] border-slate-800 text-slate-300 hover:border-slate-600"
                          }`}
                        >
                          ${amt}
                        </button>
                      ))}
                    </div>
                    <div className="pt-1">
                      <input
                        type="number"
                        step="0.5"
                        min="0.1"
                        placeholder="Or enter custom amount in USD (min $0.10)..."
                        value={customDepositAmount}
                        onChange={(e) => setCustomDepositAmount(e.target.value)}
                        className="w-full bg-[#05070b] border border-slate-800 rounded-[2px] p-2 text-xs text-white outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>
                  </div>

                  {/* 1-Click Action Button */}
                  <button
                    type="button"
                    onClick={handle1ClickWeb3Deposit}
                    disabled={isDepositingWeb3}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold tracking-wider uppercase text-xs rounded-[2px] transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
                  >
                    {isDepositingWeb3 ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Wallet className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {isDepositingWeb3
                        ? "Confirming in MetaMask..."
                        : `Deposit $${(customDepositAmount ? parseFloat(customDepositAmount) || 0 : depositAmountPreset).toFixed(2)} USDC via MetaMask`}
                    </span>
                  </button>
                </div>
              )}

              {/* TAB 2: MANUAL TX HASH */}
              {depositTab === "manual" && (
                <div className="space-y-3">
                  {/* Settlement Network & Token Badge */}
                  <div className="bg-[#05070b] border border-blue-500/30 rounded-[2px] p-3 space-y-2">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-wider">
                      <span>Settlement Rail</span>
                      <span className="px-1.5 py-0.2 rounded-[2px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold text-[9px]">
                        MAINNET ONLY
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
                      <span>Verxl Treasury Settlement Address (Arbitrum One)</span>
                      <span className="text-emerald-400 font-bold">Min $0.10 USDC</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-white truncate select-all">{TREASURY_WALLET}</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(TREASURY_WALLET, setCopiedTreasury)}
                        className="px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-[2px] text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shrink-0"
                      >
                        {copiedTreasury ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedTreasury ? "Copied" : "Copy"}</span>
                      </button>
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
                        Send at least $0.10 USDC to the treasury address, then paste the tx hash. You may be prompted to sign a zero-gas ownership proof to prevent front-running.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={verifyingDeposit || !depositTxHash}
                      className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider py-2.5 rounded-[2px] transition flex items-center justify-center gap-2"
                    >
                      {verifyingDeposit ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      <span>{verifyingDeposit ? "Verifying On-Chain..." : "Verify & Credit Deposit"}</span>
                    </button>
                  </form>
                </div>
              )}

              {/* Status Message */}
              {depositStatus && (
                <div className="text-[10.5px] text-amber-300 bg-amber-500/10 border border-amber-500/30 p-2.5 rounded-[2px] leading-relaxed">
                  {depositStatus}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: PROVIDER PAYOUT REQUEST DRAWER */}
      {showPayoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg max-h-[92vh] overflow-y-auto bg-[#0a0e17] border border-purple-500/40 rounded-[3px] p-4 sm:p-6 shadow-2xl space-y-4 my-auto">
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
                    Pending: ${Number(payoutPendingBalance || 0).toFixed(4)} USD
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
                    <div>Gross Requested: <span className="text-white">${Number(payoutReceipt.amount_usd || 0).toFixed(2)} USD</span></div>
                    <div>Protocol Fee (50 bps): <span className="text-purple-400">-${Number(payoutReceipt.protocol_fee_usd || 0).toFixed(4)} USD</span></div>
                    <div>Net Settlement: <span className="text-emerald-400 font-bold">${Number(payoutReceipt.net_payout_usd || 0).toFixed(2)} USD</span></div>
                    <div>Destination: <span className="text-slate-400">{payoutReceipt.payout_address}</span></div>
                    <div>Arbitrum Ref: <span className="text-blue-400">{typeof payoutReceipt.arbitrum_tx_ref === "string" ? `${payoutReceipt.arbitrum_tx_ref.slice(0, 18)}...` : "Settled"}</span></div>
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
                      <span>Net: ~${Math.max(0, Number(payoutAmount || 0) * 0.995).toFixed(4)} USDC after 50 bps</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submittingPayout || Number(payoutAmount || 0) < 1.0 || Number(payoutAmount || 0) > Number(payoutPendingBalance || 0)}
                    className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider py-2.5 rounded-[2px] transition flex items-center justify-center gap-2"
                  >
                    {submittingPayout ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                    <span>Request Payout ({Number(payoutAmount || 0) >= 1.0 ? `$${Number(payoutAmount || 0).toFixed(2)} USD` : "Min $1"})</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CONFIGURE / REGISTER PROVIDER NODE */}
      {showNodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-xl max-h-[92vh] overflow-y-auto bg-[#0a0e17] border border-purple-500/40 rounded-[3px] p-4 sm:p-6 shadow-2xl space-y-4 my-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  {nodeForm.id ? "Configure Provider Node" : "Register New Provider Node"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNodeModal(false)}
                className="text-slate-400 hover:text-white text-xs uppercase"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleSaveNode} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10.5px] text-slate-400 uppercase tracking-wider mb-1">
                    Node ID / Slug
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. bulbasaur-prague-01"
                    value={nodeForm.id}
                    onChange={(e) => setNodeForm({ ...nodeForm, id: e.target.value })}
                    className="w-full bg-[#05070b] border border-slate-700 rounded-[2px] px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-[10.5px] text-slate-400 uppercase tracking-wider mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Prague Bare-Metal Cluster 01 (Bulbasaur)"
                    value={nodeForm.name}
                    onChange={(e) => setNodeForm({ ...nodeForm, name: e.target.value })}
                    className="w-full bg-[#05070b] border border-slate-700 rounded-[2px] px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10.5px] text-slate-400 uppercase tracking-wider mb-1">
                    Inference Base URL (OpenAI Wire Compatible)
                  </label>
                  <input
                    type="url"
                    placeholder="https://node1.verxl.com/v1"
                    value={nodeForm.base_url}
                    onChange={(e) => setNodeForm({ ...nodeForm, base_url: e.target.value })}
                    className="w-full bg-[#05070b] border border-slate-700 rounded-[2px] px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10.5px] text-slate-400 uppercase tracking-wider mb-1">
                    Provider Upstream API Key (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="sk-... (Leave empty for direct unauthenticated bare-metal engine)"
                    value={nodeForm.api_key}
                    onChange={(e) => setNodeForm({ ...nodeForm, api_key: e.target.value })}
                    className="w-full bg-[#05070b] border border-slate-700 rounded-[2px] px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10.5px] text-slate-400 uppercase tracking-wider mb-1">
                    USDC Settlement Payout Address
                  </label>
                  <input
                    type="text"
                    placeholder="0x... (Arbitrum One address for 50 bps fee disbursements)"
                    value={nodeForm.payout_address}
                    onChange={(e) => setNodeForm({ ...nodeForm, payout_address: e.target.value })}
                    className="w-full bg-[#05070b] border border-slate-700 rounded-[2px] px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* ADMIN OFFICIAL BRIDGE TOGGLE */}
              <div className={`p-3 rounded-[2px] border ${
                isAdminUser 
                  ? "bg-purple-950/20 border-purple-500/40" 
                  : "bg-slate-900/40 border-slate-800 opacity-75"
              }`}>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      <span>Official Protocol Bridge Designation</span>
                    </div>
                    <p className="text-[10.5px] text-slate-400 leading-relaxed">
                      {isAdminUser 
                        ? "Designates this node as an official protocol bridge with verified priority routing across Chat & Playground."
                        : "Admin Exclusive: Only protocol administrators (me@simonhavlik.com) can mark a provider node as an Official Bridge."}
                    </p>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-3">
                    <input
                      type="checkbox"
                      disabled={!isAdminUser}
                      checked={nodeForm.is_official_bridge}
                      onChange={(e) => setNodeForm({ ...nodeForm, is_official_bridge: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600 disabled:opacity-40"></div>
                  </label>
                </div>
              </div>

              {/* Models JSON Configuration */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[10.5px] text-slate-400 uppercase tracking-wider">
                    Models Configuration JSON (1M Context & Rates)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setNodeForm({
                        ...nodeForm,
                        models_config_str: JSON.stringify([
                          {
                            id: "qwen3.5-4b-uncensored-32k",
                            name: "Bulbasaur Qwen 3.5 4B Uncensored (1M)",
                            context_window: 1000000,
                            price_prompt_usd: 0.05,
                            price_completion_usd: 0.10,
                            price_cached_prompt_usd: 0.010,
                          },
                          {
                            id: "deepseek-v4.1-flash",
                            name: "DeepSeek V4.1 Flash (1M)",
                            context_window: 1000000,
                            price_prompt_usd: 0.30,
                            price_completion_usd: 1.20,
                            price_cached_prompt_usd: 0.006,
                            special_hours_discount: "50% Off-Peak ($0.15 / $0.60, Cache $0.003) outside 01:00-04:00 & 06:00-10:00 UTC"
                          },
                          {
                            id: "mimo-v2.6-flash",
                            name: "Xiaomi MiMo v2.6 Flash (1M)",
                            context_window: 1000000,
                            price_prompt_usd: 0.14,
                            price_completion_usd: 0.28,
                            price_cached_prompt_usd: 0.0028,
                          }
                        ], null, 2),
                      });
                    }}
                    className="text-[10px] text-purple-400 hover:text-purple-300 uppercase font-bold"
                  >
                    Load 1M Presets
                  </button>
                </div>
                <textarea
                  rows={6}
                  value={nodeForm.models_config_str}
                  onChange={(e) => setNodeForm({ ...nodeForm, models_config_str: e.target.value })}
                  placeholder='[{"id": "...", "context_window": 1000000, "price_prompt_usd": 0.05, ...}]'
                  className="w-full bg-[#05070b] border border-slate-700 rounded-[2px] p-2 text-xs font-mono text-purple-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Routing Fallbacks */}
              <div>
                <label className="block text-[10.5px] text-slate-400 uppercase tracking-wider mb-1">
                  Failover Fallback Endpoints (One per line)
                </label>
                <textarea
                  rows={2}
                  value={nodeForm.fallbacks_str}
                  onChange={(e) => setNodeForm({ ...nodeForm, fallbacks_str: e.target.value })}
                  placeholder="https://node1.verxl.com/v1"
                  className="w-full bg-[#05070b] border border-slate-700 rounded-[2px] p-2 text-xs font-mono text-blue-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <button
                type="submit"
                disabled={savingNode || !nodeForm.name}
                className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider py-2.5 rounded-[2px] transition flex items-center justify-center gap-2"
              >
                {savingNode ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                <span>{savingNode ? "Saving Node Configuration..." : "Save Provider Node"}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: LINK OPTIONAL EMAIL */}
      {showLinkEmailModal && user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-4 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0a0e17] border border-blue-500/40 rounded-[3px] p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Link Email (Optional Addition)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowLinkEmailModal(false)}
                className="text-slate-400 hover:text-white text-xs uppercase"
              >
                ✕ Close
              </button>
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
              Your account is already authenticated via your MetaMask wallet (
              <span className="font-mono text-blue-300">
                {typeof user?.wallet_address === "string" && user.wallet_address.length >= 10
                  ? `${user.wallet_address.slice(0, 6)}...${user.wallet_address.slice(-4)}`
                  : user?.wallet_address || "Web3"}
              </span>
              ). Adding an email is completely voluntary and enables email OTP login, password recovery, and hardware TOTP 2FA backups.
            </p>

            {linkEmailError && (
              <div className="text-[11px] text-rose-300 bg-rose-500/10 border border-rose-500/30 p-2.5 rounded-[2px]">
                {linkEmailError}
              </div>
            )}
            {linkEmailSuccess && (
              <div className="text-[11px] text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 p-2.5 rounded-[2px]">
                {linkEmailSuccess}
              </div>
            )}

            {linkEmailStep === "email" ? (
              <form onSubmit={handleSendLinkEmailOtp} className="space-y-3">
                <div>
                  <label className="block text-[10.5px] text-slate-400 uppercase tracking-wider mb-1 font-semibold">
                    Email Address to Link
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      placeholder="developer@acme.com"
                      value={linkEmailInput}
                      onChange={(e) => setLinkEmailInput(e.target.value)}
                      className="w-full bg-[#05070b] border border-slate-700 rounded-[2px] pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={linkingEmail || !linkEmailInput}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider py-2.5 rounded-[2px] transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  {linkingEmail ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ArrowRight className="w-3.5 h-3.5" />}
                  <span>Send Verification Code</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleConfirmLinkEmail} className="space-y-3">
                <div>
                  <label className="block text-[10.5px] text-slate-400 uppercase tracking-wider mb-1 font-semibold">
                    Enter 6-Digit Code for {linkEmailInput}
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="e.g. 842109"
                      value={linkEmailCode}
                      onChange={(e) => setLinkEmailCode(e.target.value)}
                      className="w-full bg-[#05070b] border border-slate-700 rounded-[2px] pl-9 pr-3 py-2 text-xs font-mono tracking-widest text-white focus:outline-none focus:border-blue-500"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => { setLinkEmailStep("email"); setLinkEmailCode(""); }}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider py-2.5 rounded-[2px] transition cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={linkingEmail || linkEmailCode.length < 6}
                    className="flex-[2] bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider py-2.5 rounded-[2px] transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {linkingEmail ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    <span>Verify & Link Email</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL 3: SECURITY MANAGEMENT MODAL (2FA & PASSWORD) */}
      {showSecurityModal && user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-xl max-h-[92vh] overflow-y-auto bg-[#0a0e17] border border-blue-500/40 rounded-[3px] p-4 sm:p-6 shadow-2xl space-y-4 my-auto">
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

            {/* Web3 MetaMask Account Notice: Optional Email for Password & 2FA */}
            {(!user.email || user.email.endsWith("@web3.verxl.user")) && (
              <div className="bg-[#05070b] border border-blue-500/40 rounded-[2px] p-3.5 space-y-2.5">
                <div className="flex items-center gap-2 text-blue-400 font-bold uppercase tracking-wider text-xs">
                  <Wallet className="w-4 h-4 text-emerald-400" />
                  <span>Web3 Account Active (MetaMask)</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                  You are authenticated with your Web3 wallet (
                  <span className="font-mono text-emerald-300">
                    {typeof user?.wallet_address === "string" && user.wallet_address.length >= 10
                      ? `${user.wallet_address.slice(0, 6)}...${user.wallet_address.slice(-4)}`
                      : user?.wallet_address || "MetaMask"}
                  </span>
                  ). Linking an email is an optional addition to configure secondary password login and RFC 6238 TOTP 2FA.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowSecurityModal(false);
                    setLinkEmailError(null);
                    setLinkEmailSuccess(null);
                    setLinkEmailStep("email");
                    setShowLinkEmailModal(true);
                  }}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider rounded-[2px] transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>+ Link Email for Password & 2FA</span>
                </button>
              </div>
            )}

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
