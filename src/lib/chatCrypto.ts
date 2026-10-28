/**
 * Client-side chat encryption.
 *
 * The conversation payload is encrypted in the browser with an AES-256-GCM key
 * derived from a deterministic wallet signature. The signing key never leaves
 * MetaMask and the derived CryptoKey is non-extractable, so the edge, the
 * database and the admin console only ever see ciphertext.
 */

const KEY_CACHE = new Map<string, CryptoKey>();
const encoder = new TextEncoder();
const decoder = new TextDecoder();

export interface ChatPlaintext {
  title: string;
  model: string;
  messages: unknown[];
}

const toHexMessage = (message: string): string => {
  let hex = "0x";
  for (const byte of encoder.encode(message)) {
    hex += byte.toString(16).padStart(2, "0");
  }
  return hex;
};

const hexToBytes = (hex: string): Uint8Array<ArrayBuffer> => {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  if (clean.length % 2 !== 0) throw new Error("Invalid wallet signature.");
  const out = new Uint8Array(new ArrayBuffer(clean.length / 2));
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
};

const bytesToBase64 = (bytes: Uint8Array): string => {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
};

const base64ToBytes = (value: string): Uint8Array<ArrayBuffer> => {
  const binary = atob(value);
  const out = new Uint8Array(new ArrayBuffer(binary.length));
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
};

export const hasWalletProvider = (): boolean =>
  typeof window !== "undefined" && Boolean((window as any).ethereum);

export const clearChatKeyCache = (): void => {
  KEY_CACHE.clear();
};

export const getCachedChatKey = (wallet: string, userId: string): CryptoKey | null =>
  KEY_CACHE.get(`${wallet.toLowerCase()}:${userId}`) || null;

export async function deriveChatKey(wallet: string, userId: string): Promise<CryptoKey> {
  const cacheId = `${wallet.toLowerCase()}:${userId}`;
  const cached = KEY_CACHE.get(cacheId);
  if (cached) return cached;

  const provider = (window as any).ethereum;
  if (!provider) {
    throw new Error("MetaMask is not available in this browser.");
  }

  const accounts = await provider.request({ method: "eth_requestAccounts" });
  if (
    Array.isArray(accounts) &&
    accounts.length > 0 &&
    String(accounts[0]).toLowerCase() !== wallet.toLowerCase()
  ) {
    throw new Error(
      `Switch MetaMask to ${wallet.slice(0, 6)}...${wallet.slice(-4)} to unlock these chats.`
    );
  }

  const message =
    `Verxl Protocol encrypted chat key\n` +
    `Wallet: ${wallet.toLowerCase()}\n` +
    `User: ${userId}\n` +
    `Version: 1`;

  const signature = await provider.request({
    method: "personal_sign",
    params: [toHexMessage(message), wallet],
  });

  if (typeof signature !== "string" || !/^0x[0-9a-fA-F]{130}$/.test(signature)) {
    throw new Error("Wallet signature was rejected or malformed.");
  }

  const ikm = await crypto.subtle.importKey(
    "raw",
    hexToBytes(signature),
    "HKDF",
    false,
    ["deriveKey"]
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: encoder.encode("verxl-chat-v1"),
      info: encoder.encode(userId),
    },
    ikm,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );

  KEY_CACHE.set(cacheId, key);
  return key;
}

const gzip = async (bytes: Uint8Array): Promise<Uint8Array> =>
  new Uint8Array(
    await new Response(
      new Blob([bytes.buffer as ArrayBuffer]).stream().pipeThrough(new CompressionStream("gzip"))
    ).arrayBuffer()
  );

const gunzip = async (bytes: Uint8Array): Promise<Uint8Array> =>
  new Uint8Array(
    await new Response(
      new Blob([bytes.buffer as ArrayBuffer]).stream().pipeThrough(new DecompressionStream("gzip"))
    ).arrayBuffer()
  );

export async function encryptChatPayload(payload: ChatPlaintext, key: CryptoKey): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(new ArrayBuffer(12)));
  const compressed = await gzip(encoder.encode(JSON.stringify(payload)));
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, compressed.buffer as ArrayBuffer);
  return `v2.${bytesToBase64(iv)}.${bytesToBase64(new Uint8Array(ciphertext))}`;
}

export async function decryptChatPayload<T = ChatPlaintext>(
  envelope: string,
  key: CryptoKey
): Promise<T> {
  const parts = envelope.split(".");
  if (parts.length !== 3 || (parts[0] !== "v1" && parts[0] !== "v2")) {
    throw new Error("Unsupported chat ciphertext format.");
  }
  const iv = base64ToBytes(parts[1]);
  const ciphertext = base64ToBytes(parts[2]);
  const decrypted = new Uint8Array(
    await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext)
  );
  const plaintext = parts[0] === "v2" ? await gunzip(decrypted) : decrypted;
  return JSON.parse(decoder.decode(plaintext)) as T;
}
