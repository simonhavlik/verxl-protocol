// Auth & Cryptographic Helpers for Verxl Protocol

export const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Provider-Secret",
};

let _authEnv: Record<string, any> | null = null;

export function setAuthEnv(env: Record<string, any>) {
  if (env) _authEnv = env;
}

function getJwtSecret(): string {
  const secret = _authEnv?.JWT_SECRET || (globalThis as any)?.process?.env?.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }
  return secret;
}

export async function hashSha256(input: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * PBKDF2 Password Hashing (100,000 iterations, SHA-256)
 * Format: pbkdf2$100000$<salt_hex>$<hash_hex>
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);
  const saltHex = Array.from(salt)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    256
  );

  const hashHex = Array.from(new Uint8Array(derivedBits))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return `pbkdf2$100000$${saltHex}$${hashHex}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  if (!storedHash || !storedHash.startsWith("pbkdf2$100000$")) return false;
  const parts = storedHash.split("$");
  if (parts.length !== 4) return false;

  const [, , saltHex, expectedHashHex] = parts;
  const salt = new Uint8Array(
    saltHex.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []
  );

  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    256
  );

  const computedHashHex = Array.from(new Uint8Array(derivedBits))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return computedHashHex === expectedHashHex;
}

export function generateOtpCode(): string {
  // 6-digit numeric code
  const val = Math.floor(100000 + Math.random() * 900000);
  return val.toString();
}

export async function signSessionToken(payload: Record<string, any>): Promise<string> {
  const enc = new TextEncoder();
  const data = JSON.stringify({ ...payload, exp: Date.now() + 30 * 24 * 3600 * 1000 });
  const b64Data = btoa(data).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(getJwtSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const sigBuf = await crypto.subtle.sign("HMAC", key, enc.encode(b64Data));
  const sigArray = Array.from(new Uint8Array(sigBuf));
  const b64Sig = btoa(String.fromCharCode(...sigArray))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  return `vtok_${b64Data}.${b64Sig}`;
}

export async function signChallengeToken(payload: Record<string, any>): Promise<string> {
  const enc = new TextEncoder();
  // 5-minute expiration for 2FA login challenge
  const data = JSON.stringify({ ...payload, exp: Date.now() + 5 * 60 * 1000, type: "2fa_challenge" });
  const b64Data = btoa(data).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(getJwtSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const sigBuf = await crypto.subtle.sign("HMAC", key, enc.encode(b64Data));
  const sigArray = Array.from(new Uint8Array(sigBuf));
  const b64Sig = btoa(String.fromCharCode(...sigArray))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  return `vchl_${b64Data}.${b64Sig}`;
}

export async function verifySessionToken(token: string): Promise<Record<string, any> | null> {
  if (!token || (!token.startsWith("vtok_") && !token.startsWith("vchl_"))) return null;
  const parts = token.slice(5).split(".");
  if (parts.length !== 2) return null;

  const [b64Data, b64Sig] = parts;
  const enc = new TextEncoder();

  try {
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(getJwtSecret()),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    // reconstruct binary signature
    const sigStr = atob(b64Sig.replace(/-/g, "+").replace(/_/g, "/"));
    const sigBytes = new Uint8Array(sigStr.length);
    for (let i = 0; i < sigStr.length; i++) {
      sigBytes[i] = sigStr.charCodeAt(i);
    }

    const isValid = await crypto.subtle.verify("HMAC", key, sigBytes, enc.encode(b64Data));
    if (!isValid) return null;

    const jsonStr = atob(b64Data.replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(jsonStr);
    if (payload.exp && Date.now() > payload.exp) return null;

    return payload;
  } catch {
    return null;
  }
}
