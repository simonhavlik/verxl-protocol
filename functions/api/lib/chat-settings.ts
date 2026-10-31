// Per-user chat preferences. Think/search are non-secret; the search API key
// is encrypted at rest with a key derived from the deployment secret.
import { getJwtSecret } from "./auth";
import { db } from "./db";

export interface ChatSettings {
  think: "off" | "low" | "medium" | "high";
  searchProvider: "firecrawl" | "exa" | "brave" | "custom";
  searchKey: string;
  searchBaseUrl: string;
  searchTool: boolean;
}

const textEnc = new TextEncoder();
const textDec = new TextDecoder();
const b64 = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes));
const unb64 = (value: string) => Uint8Array.from(atob(value), (c) => c.charCodeAt(0));

let cachedKey: Promise<CryptoKey> | null = null;

const settingsKey = (): Promise<CryptoKey> => {
  if (!cachedKey) {
    cachedKey = (async () => {
      const digest = await crypto.subtle.digest(
        "SHA-256",
        textEnc.encode(`${getJwtSecret()}::verxl-chat-settings-v1`)
      );
      return crypto.subtle.importKey("raw", digest, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
    })();
  }
  return cachedKey;
};

export async function encryptSearchKey(value: string): Promise<string> {
  if (!value) return "";
  const key = await settingsKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipher = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, textEnc.encode(value));
  return `v1.${b64(iv)}.${b64(new Uint8Array(cipher))}`;
}

export async function decryptSearchKey(value: string | null): Promise<string> {
  if (!value) return "";
  const [version, ivB64, cipherB64] = value.split(".");
  if (version !== "v1" || !ivB64 || !cipherB64) return "";
  try {
    const key = await settingsKey();
    const plain = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: unb64(ivB64) },
      key,
      unb64(cipherB64)
    );
    return textDec.decode(plain);
  } catch {
    return "";
  }
}

let tableReady = false;

export async function ensureChatSettingsTable(): Promise<void> {
  if (tableReady) return;
  await db.prepare(
    `CREATE TABLE IF NOT EXISTS user_chat_settings (
      user_id UUID PRIMARY KEY,
      think VARCHAR(8) NOT NULL DEFAULT 'medium',
      search_provider VARCHAR(16) NOT NULL DEFAULT 'firecrawl',
      search_key_enc TEXT,
      search_base_url TEXT,
      search_tool BOOLEAN NOT NULL DEFAULT TRUE,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`
  ).run();
  tableReady = true;
}

export const DEFAULT_SETTINGS: ChatSettings = {
  think: "medium",
  searchProvider: "firecrawl",
  searchKey: "",
  searchBaseUrl: "",
  searchTool: true,
};

export async function readChatSettings(userId: string): Promise<ChatSettings | null> {
  await ensureChatSettingsTable();
  const row = await db
    .prepare(
      "SELECT think, search_provider, search_key_enc, search_base_url, search_tool FROM user_chat_settings WHERE user_id = ?"
    )
    .bind(userId)
    .first<any>();
  if (!row) return null;
  return {
    think: (["off", "low", "medium", "high"].includes(row.think) ? row.think : "medium") as ChatSettings["think"],
    searchProvider: (["firecrawl", "exa", "brave", "custom"].includes(row.search_provider)
      ? row.search_provider
      : "firecrawl") as ChatSettings["searchProvider"],
    searchKey: await decryptSearchKey(row.search_key_enc),
    searchBaseUrl: String(row.search_base_url || ""),
    searchTool: row.search_tool !== false,
  };
}

export async function writeChatSettings(userId: string, settings: ChatSettings): Promise<void> {
  await ensureChatSettingsTable();
  const encryptedKey = await encryptSearchKey(settings.searchKey.slice(0, 512));
  await db
    .prepare(
      `INSERT INTO user_chat_settings
        (user_id, think, search_provider, search_key_enc, search_base_url, search_tool, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id) DO UPDATE SET
         think = EXCLUDED.think,
         search_provider = EXCLUDED.search_provider,
         search_key_enc = EXCLUDED.search_key_enc,
         search_base_url = EXCLUDED.search_base_url,
         search_tool = EXCLUDED.search_tool,
         updated_at = CURRENT_TIMESTAMP`
    )
    .bind(
      userId,
      settings.think,
      settings.searchProvider,
      encryptedKey,
      settings.searchBaseUrl.slice(0, 500),
      settings.searchTool
    )
    .run();
}
