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
        setUser(data.user);
        setKeys(data.keys || []);
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
        setUser(data.user);
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
        logout,
        refreshSession,
        setUser,
        setKeys,
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
