// Auth & Cryptographic Helpers for Verxl Protocol

export const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Provider-Secret",
};

const JWT_SECRET = "***REMOVED***";

export async function hashSha256(input: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
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
    enc.encode(JWT_SECRET),
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

export async function verifySessionToken(token: string): Promise<Record<string, any> | null> {
  if (!token || !token.startsWith("vtok_")) return null;
  const parts = token.slice(5).split(".");
  if (parts.length !== 2) return null;

  const [b64Data, b64Sig] = parts;
  const enc = new TextEncoder();

  try {
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(JWT_SECRET),
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
