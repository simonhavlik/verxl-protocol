import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface UserProfile {
  id: string;
  email: string;
  wallet_address: string | null;
  balance_usd: number;
  total_deposited_usd: number;
  total_spent_usd: number;
  has_active_key: boolean;
  has_password?: boolean;
  two_factor_enabled?: boolean;
  has_linked_email?: boolean;
  is_admin?: boolean;
}

export interface ApiKeyItem {
  id: string;
  key_prefix: string;
  name: string;
  is_active: number;
  created_at: string;
}

interface AuthContextType {
  token: string | null;
  user: UserProfile | null;
  keys: ApiKeyItem[];
  loading: boolean;
  loginWithToken: (newToken: string) => Promise<void>;
  loginWithApiKey: (apiKey: string) => Promise<{ success: boolean; error?: string }>;
  loginWithWallet: (walletAddress: string, signature?: string) => Promise<{ success: boolean; user?: any; error?: string }>;
  linkEmail: (email: string, code: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshSession: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  setKeys: React.Dispatch<React.SetStateAction<ApiKeyItem[]>>;
  customApiKey: string;
  setCustomApiKey: (key: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    return typeof window !== "undefined" ? localStorage.getItem("vrxl_auth_token") : null;
  });

  const [customApiKey, setCustomApiKeyState] = useState<string>(() => {
    return typeof window !== "undefined" ? localStorage.getItem("vrxl_custom_api_key") || "" : "";
  });

  const [user, setUser] = useState<UserProfile | null>(null);
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const normalizeUser = (rawUser: any): UserProfile | null => {
    if (!rawUser) return null;
    return {
      ...rawUser,
      balance_usd: Number(rawUser.balance_usd || 0),
      total_deposited_usd: Number(rawUser.total_deposited_usd || 0),
      total_spent_usd: Number(rawUser.total_spent_usd || 0),
      has_linked_email: Boolean(
        rawUser.has_linked_email ??
        (rawUser.email && !rawUser.email.endsWith("@web3.verxl.user"))
      ),
    };
  };

  const normalizeKeys = (rawKeys: any[]): ApiKeyItem[] => {
    if (!Array.isArray(rawKeys)) return [];
    return rawKeys.map((k) => ({
      ...k,
      spend_limit_usd: Number(k.spend_limit_usd || 0),
      total_spent_usd: Number(k.total_spent_usd || 0),
      total_tokens: Number(k.total_tokens || 0),
    }));
  };

  const setSafeUser: React.Dispatch<React.SetStateAction<UserProfile | null>> = (action) => {
    if (typeof action === "function") {
      setUser((prev) => normalizeUser((action as (prev: UserProfile | null) => UserProfile | null)(prev)));
    } else {
      setUser(normalizeUser(action));
    }
  };

  const setSafeKeys: React.Dispatch<React.SetStateAction<ApiKeyItem[]>> = (action) => {
    if (typeof action === "function") {
      setKeys((prev) => normalizeKeys((action as (prev: ApiKeyItem[]) => ApiKeyItem[])(prev)));
    } else {
      setKeys(normalizeKeys(action));
    }
  };

  const setCustomApiKey = (key: string) => {
    setCustomApiKeyState(key);
    if (typeof window !== "undefined") {
      if (key) {
        localStorage.setItem("vrxl_custom_api_key", key);
      } else {
        localStorage.removeItem("vrxl_custom_api_key");
      }
    }
  };

  const fetchSessionData = useCallback(async (currentToken: string) => {
    try {
      setLoading(true);
      const res = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      if (res.ok) {
        const data = (await res.json()) as any;
        setUser(normalizeUser(data.user));
        setKeys(normalizeKeys(data.keys));
      } else {
        // Token expired or invalid
        if (typeof window !== "undefined") {
          localStorage.removeItem("vrxl_auth_token");
        }
        setToken(null);
        setUser(null);
        setKeys([]);
      }
    } catch {
      // offline / transient error; keep existing state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchSessionData(token);
    }
  }, [token, fetchSessionData]);

  const loginWithToken = async (newToken: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("vrxl_auth_token", newToken);
    }
    setToken(newToken);
    await fetchSessionData(newToken);
  };

  const loginWithApiKey = async (apiKey: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      const res = await fetch("/api/auth/login-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ api_key: apiKey.trim() }),
      });
      const data = (await res.json()) as any;
      if (res.ok && data.success && data.token) {
        if (typeof window !== "undefined") {
          localStorage.setItem("vrxl_auth_token", data.token);
          localStorage.setItem("vrxl_custom_api_key", apiKey.trim());
        }
        setToken(data.token);
        setCustomApiKeyState(apiKey.trim());
        setUser(normalizeUser(data.user));
        await fetchSessionData(data.token);
        return { success: true };
      } else {
        return { success: false, error: data.error || "Authentication failed. API key is invalid or inactive." };
      }
    } catch (err: any) {
      return { success: false, error: "Network error: " + err.message };
    } finally {
      setLoading(false);
    }
  };

  const loginWithWallet = async (walletAddress: string, signature?: string) => {
    try {
      setLoading(true);
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const res = await fetch("/api/auth/wallet-login", {
        method: "POST",
        headers,
        body: JSON.stringify({ wallet_address: walletAddress, signature }),
      });
      const data = (await res.json()) as any;
      if (res.ok && data.success && data.token) {
        if (typeof window !== "undefined") {
          localStorage.setItem("vrxl_auth_token", data.token);
        }
        setToken(data.token);
        if (data.apiKey) {
          setCustomApiKey(data.apiKey);
        }
        setUser(normalizeUser(data.user));
        await fetchSessionData(data.token);
        return { success: true, user: normalizeUser(data.user) };
      } else {
        return { success: false, error: data.error || "Wallet authentication failed" };
      }
    } catch (err: any) {
      return { success: false, error: err.message || "Network error during wallet login" };
    } finally {
      setLoading(false);
    }
  };

  const linkEmail = async (email: string, code: string): Promise<{ success: boolean; error?: string }> => {
    if (!token) return { success: false, error: "Authentication required to link email" };
    try {
      setLoading(true);
      const res = await fetch("/api/auth/link-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: email.trim().toLowerCase(), code: code.trim() }),
      });
      const data = (await res.json()) as any;
      if (res.ok && data.success && data.token) {
        if (typeof window !== "undefined") {
          localStorage.setItem("vrxl_auth_token", data.token);
        }
        setToken(data.token);
        setUser(normalizeUser(data.user));
        await fetchSessionData(data.token);
        return { success: true };
      } else {
        return { success: false, error: data.error || "Failed to link email." };
      }
    } catch (err: any) {
      return { success: false, error: err.message || "Network error while linking email" };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("vrxl_auth_token");
      localStorage.removeItem("vrxl_custom_api_key");
    }
    setToken(null);
    setCustomApiKeyState("");
    setUser(null);
    setKeys([]);
  };

  const refreshSession = async () => {
    if (token) {
      await fetchSessionData(token);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        keys,
        loading,
        loginWithToken,
        loginWithApiKey,
        loginWithWallet,
        linkEmail,
        logout,
        refreshSession,
        setUser: setSafeUser,
        setKeys: setSafeKeys,
        customApiKey,
        setCustomApiKey,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
