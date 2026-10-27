// RFC 6238 TOTP (Time-Based One-Time Password) & Recovery Codes Implementation
// Pure Web Crypto API (SubtleCrypto) compatible with Cloudflare Workers isolates

const BASE32_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

/**
 * Encodes a Uint8Array into a Base32 string (RFC 4648)
 */
export function base32Encode(buffer: Uint8Array): string {
  let bits = 0;
  let value = 0;
  let output = "";

  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;

    while (bits >= 5) {
      output += BASE32_CHARS[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += BASE32_CHARS[(value << (5 - bits)) & 31];
  }

  return output;
}

/**
 * Decodes a Base32 string into a Uint8Array (RFC 4648)
 */
export function base32Decode(input: string): Uint8Array {
  const cleaned = input.toUpperCase().replace(/[\s=-]/g, "");
  let bits = 0;
  let value = 0;
  const output: number[] = [];

  for (let i = 0; i < cleaned.length; i++) {
    const idx = BASE32_CHARS.indexOf(cleaned[i]);
    if (idx === -1) continue;

    value = (value << 5) | idx;
    bits += 5;

    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return new Uint8Array(output);
}

/**
 * Generates a cryptographically random Base32 secret for TOTP (20 bytes = 160 bits)
 */
export function generateTotpSecret(): string {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  return base32Encode(bytes);
}

/**
 * Formats a Base32 secret into 4-character spaced chunks for readable display
 * e.g. "JBSW Y3DP EHPK 3PXP ..."
 */
export function formatSecretDisplay(secret: string): string {
  return secret.replace(/(.{4})/g, "$1 ").trim();
}

/**
 * Generates standard otpauth:// URL for QR code scanners (Google Authenticator, 1Password, etc.)
 */
export function generateOtpAuthUrl(email: string, secret: string, issuer: string = "Verxl Protocol"): string {
  const encodedIssuer = encodeURIComponent(issuer);
  const encodedAccount = encodeURIComponent(email);
  return `otpauth://totp/${encodedIssuer}:${encodedAccount}?secret=${secret}&issuer=${encodedIssuer}&algorithm=SHA1&digits=6&period=30`;
}

/**
 * Generates 8 random one-time emergency recovery codes in XXXX-XXXX format
 */
export function generateRecoveryCodes(count: number = 8): string[] {
  const codes: string[] = [];
  const chars = "abcdefghjkmnpqrstuvwxyz23456789"; // unambiguous characters
  for (let c = 0; c < count; c++) {
    const bytes = new Uint8Array(8);
    crypto.getRandomValues(bytes);
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars[bytes[i] % chars.length];
      if (i === 3) code += "-";
    }
    codes.push(code);
  }
  return codes;
}

/**
 * Computes the 6-digit TOTP code for a given secret at time step T (RFC 6238)
 */
export async function computeTotpCode(secretBase32: string, step: number): Promise<string> {
  const keyBytes = base32Decode(secretBase32);
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBytes as BufferSource,
    { name: "HMAC", hash: { name: "SHA-1" } },
    false,
    ["sign"]
  );

  // Time step as 8-byte big-endian buffer
  const timeBuffer = new ArrayBuffer(8);
  const view = new DataView(timeBuffer);
  // Big-endian 64-bit integer
  view.setUint32(0, Math.floor(step / 0x100000000));
  view.setUint32(4, step & 0xffffffff);

  const hmacBuffer = await crypto.subtle.sign("HMAC", cryptoKey, timeBuffer);
  const hmac = new Uint8Array(hmacBuffer);

  // Dynamic truncation
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  const otp = binary % 1000000;
  return otp.toString().padStart(6, "0");
}

/**
 * Validates a 6-digit TOTP token against a secret with +/- 1 step clock tolerance (90s window)
 */
export async function verifyTotpToken(secretBase32: string, token: string): Promise<boolean> {
  if (!token || !secretBase32) return false;
  const cleanToken = token.trim().replace(/\s+/g, "");
  if (cleanToken.length !== 6 || !/^\d{6}$/.test(cleanToken)) return false;

  const currentStep = Math.floor(Date.now() / 1000 / 30);

  // Check window [currentStep - 1, currentStep, currentStep + 1]
  for (let delta = -1; delta <= 1; delta++) {
    const expected = await computeTotpCode(secretBase32, currentStep + delta);
    if (expected === cleanToken) {
      return true;
    }
  }

  return false;
}
