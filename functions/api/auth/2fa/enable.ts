// Cloudflare Pages Function: /api/auth/2fa/enable
// Confirm 6-digit TOTP code and permanently activate 2FA in verxl.users (Charizard PostgreSQL)

import { CORS_HEADERS, verifySessionToken } from "../../lib/auth";
import { db } from "../../lib/db";
import { verifyTotpToken } from "../../lib/totp";

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
    const body: any = await request.json();
    const { code } = body;

    if (!code || typeof code !== "string" || code.trim().length !== 6) {
      return new Response(
        JSON.stringify({ error: "A valid 6-digit verification code is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
      );
    }

    const user = await db.prepare(
      "SELECT id, two_factor_secret, recovery_codes FROM users WHERE id = ?"
    )
      .bind(payload.sub)
      .first<{ id: string; two_factor_secret: string | null; recovery_codes: string | null }>();

    if (!user || !user.two_factor_secret) {
      return new Response(
        JSON.stringify({ error: "No pending 2FA setup found. Please initiate 2FA setup first." }),
        { status: 400, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
      );
    }

    const isValid = await verifyTotpToken(user.two_factor_secret, code);
    if (!isValid) {
      return new Response(
        JSON.stringify({ error: "Invalid 6-digit code. Please verify the time on your authenticator device and try again." }),
        { status: 400, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
      );
    }

    // Mark 2FA enabled in Charizard PostgreSQL
    await db.prepare(
      "UPDATE users SET two_factor_enabled = true, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
    )
      .bind(user.id)
      .run();

    let recoveryCodes: string[] = [];
    try {
      recoveryCodes = JSON.parse(user.recovery_codes || "[]");
    } catch {
      recoveryCodes = [];
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Two-Factor Authentication (2FA) successfully enabled and secured with Charizard PostgreSQL.",
        two_factor_enabled: true,
        recovery_codes: recoveryCodes,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: `Failed to activate 2FA: ${err.message}` }),
      { status: 500, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
    );
  }
};
