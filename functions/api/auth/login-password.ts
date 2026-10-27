// Cloudflare Pages Function: /api/auth/login-password
// Authenticate user with Email + Cryptographic Password (verxl.users on Charizard PostgreSQL)
// If 2FA is active, challenges for TOTP token or recovery code

import { CORS_HEADERS, signChallengeToken, signSessionToken, verifyPassword } from "../lib/auth";
import { db } from "../lib/db";
import { verifyTotpToken } from "../lib/totp";

interface Env {}

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request } = context;

  try {
    const body: any = await request.json();
    const { email, password, totp_code, recovery_code } = body;

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: "Email and password are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    const user = await db.prepare(
      "SELECT id, email, password_hash, two_factor_enabled, two_factor_secret, recovery_codes, wallet_address, balance_usd, total_deposited_usd, total_spent_usd FROM users WHERE LOWER(email) = ?"
    )
      .bind(cleanEmail)
      .first<{
        id: string;
        email: string;
        password_hash: string | null;
        two_factor_enabled: boolean;
        two_factor_secret: string | null;
        recovery_codes: string | null;
        wallet_address: string | null;
        balance_usd: number;
        total_deposited_usd: number;
        total_spent_usd: number;
      }>();

    if (!user || !user.password_hash) {
      return new Response(
        JSON.stringify({
          error: "Invalid email or password. If you haven't set a password yet, please log in via Email OTP and configure a password in Console settings.",
        }),
        { status: 401, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
      );
    }

    const passwordValid = await verifyPassword(password, user.password_hash);
    if (!passwordValid) {
      return new Response(
        JSON.stringify({ error: "Invalid email or password" }),
        { status: 401, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
      );
    }

    // Check if Two-Factor Authentication is enabled
    if (user.two_factor_enabled && user.two_factor_secret) {
      // If code was not provided in this payload, return a challenge
      if (!totp_code && !recovery_code) {
        const challengeToken = await signChallengeToken({ sub: user.id, email: user.email });
        return new Response(
          JSON.stringify({
            require_2fa: true,
            challenge_token: challengeToken,
            message: "Two-factor authentication required. Please provide your 6-digit TOTP code or an emergency recovery code.",
          }),
          { status: 200, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
        );
      }

      // Check recovery code first if provided
      let twoFactorVerified = false;
      if (recovery_code) {
        const cleanRecovery = recovery_code.trim().toLowerCase();
        let codes: string[] = [];
        try {
          codes = JSON.parse(user.recovery_codes || "[]");
        } catch {
          codes = [];
        }

        const matchIdx = codes.indexOf(cleanRecovery);
        if (matchIdx !== -1) {
          twoFactorVerified = true;
          // Mark recovery code as used (remove it)
          codes.splice(matchIdx, 1);
          await db.prepare("UPDATE users SET recovery_codes = ? WHERE id = ?")
            .bind(JSON.stringify(codes), user.id)
            .run();
        }
      }

      // If not verified by recovery code, verify TOTP token
      if (!twoFactorVerified && totp_code) {
        twoFactorVerified = await verifyTotpToken(user.two_factor_secret, totp_code);
      }

      if (!twoFactorVerified) {
        return new Response(
          JSON.stringify({ error: "Invalid two-factor authentication code or recovery code." }),
          { status: 401, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
        );
      }
    }

    // Password + 2FA validated successfully. Issue session JWT.
    const sessionToken = await signSessionToken({ sub: user.id, email: user.email });

    return new Response(
      JSON.stringify({
        token: sessionToken,
        user: {
          id: user.id,
          email: user.email,
          wallet_address: user.wallet_address,
          balance_usd: Number(user.balance_usd),
          total_deposited_usd: Number(user.total_deposited_usd),
          total_spent_usd: Number(user.total_spent_usd),
          two_factor_enabled: Boolean(user.two_factor_enabled),
          has_password: true,
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: `Authentication failed: ${err.message}` }),
      { status: 500, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
    );
  }
};
