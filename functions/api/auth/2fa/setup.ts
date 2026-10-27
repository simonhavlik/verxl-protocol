// Cloudflare Pages Function: /api/auth/2fa/setup
// Initiate TOTP 2FA setup: generates Base32 secret, otpauth:// URL, and 8 recovery codes

import { CORS_HEADERS, verifySessionToken } from "../../lib/auth";
import { db } from "../../lib/db";
import { formatSecretDisplay, generateOtpAuthUrl, generateRecoveryCodes, generateTotpSecret } from "../../lib/totp";

interface Env {}

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request } = context;

  const authHeader = request.headers.get("Authorization");
  const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) {
    return new Response(JSON.stringify({ error: "Missing authorization token" }), {
      status: 401,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  const payload = await verifySessionToken(token);
  if (!payload || !payload.sub) {
    return new Response(JSON.stringify({ error: "Invalid or expired session token" }), {
      status: 401,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  try {
    const user = await db.prepare("SELECT id, email, two_factor_enabled FROM users WHERE id = ?")
      .bind(payload.sub)
      .first<{ id: string; email: string; two_factor_enabled: boolean }>();

    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      });
    }

    const secret = generateTotpSecret();
    const formattedSecret = formatSecretDisplay(secret);
    const otpauthUrl = generateOtpAuthUrl(user.email, secret);
    const recoveryCodes = generateRecoveryCodes(8);

    // Save temporary secret and recovery codes to user record in Charizard PostgreSQL
    // (Notice: two_factor_enabled remains false until confirmed with a valid 6-digit code)
    await db.prepare(
      "UPDATE users SET two_factor_secret = ?, recovery_codes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
    )
      .bind(secret, JSON.stringify(recoveryCodes), user.id)
      .run();

    return new Response(
      JSON.stringify({
        secret,
        formatted_secret: formattedSecret,
        otpauth_url: otpauthUrl,
        recovery_codes: recoveryCodes,
        already_enabled: Boolean(user.two_factor_enabled),
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: `Failed to initiate 2FA setup: ${err.message}` }),
      { status: 500, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
    );
  }
};
