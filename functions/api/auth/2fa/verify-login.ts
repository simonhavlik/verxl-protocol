// Cloudflare Pages Function: /api/auth/2fa/verify-login
// Validates 2FA challenge token + TOTP code (or recovery code) and issues session token

import { CORS_HEADERS, signSessionToken, verifySessionToken } from "../../lib/auth";
import { db } from "../../lib/db";
import { getRequirePasswordWithEmail } from "../../lib/security-settings";
import { verifyTotpToken } from "../../lib/totp";

interface Env {}

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request } = context;

  try {
    const body: any = await request.json();
    const { challenge_token, totp_code, recovery_code } = body;

    if (!challenge_token) {
      return new Response(
        JSON.stringify({ error: "Challenge token is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
      );
    }

    const payload = await verifySessionToken(challenge_token);
    if (!payload || !payload.sub || payload.type !== "2fa_challenge") {
      return new Response(
        JSON.stringify({ error: "Invalid or expired 2FA challenge. Please log in again." }),
        { status: 401, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
      );
    }

    const user = await db.prepare(
      "SELECT id, email, two_factor_secret, recovery_codes, wallet_address, balance_usd, total_deposited_usd, total_spent_usd, password_hash FROM users WHERE id = ?"
    )
      .bind(payload.sub)
      .first<{
        id: string;
        email: string;
        two_factor_secret: string | null;
        recovery_codes: string | null;
        wallet_address: string | null;
        balance_usd: number;
        total_deposited_usd: number;
        total_spent_usd: number;
        password_hash: string | null;
      }>();

    if (!user || !user.two_factor_secret) {
      return new Response(
        JSON.stringify({ error: "User or 2FA credentials not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
      );
    }

    let verified = false;

    // Check emergency recovery code first
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
        verified = true;
        codes.splice(matchIdx, 1);
        await db.prepare("UPDATE users SET recovery_codes = ? WHERE id = ?")
          .bind(JSON.stringify(codes), user.id)
          .run();
      }
    }

    // Check 6-digit TOTP code
    if (!verified && totp_code) {
      verified = await verifyTotpToken(user.two_factor_secret, totp_code);
    }

    if (!verified) {
      return new Response(
        JSON.stringify({ error: "Invalid two-factor authentication code or recovery code." }),
        { status: 401, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
      );
    }

    const requirePasswordWithEmail = await getRequirePasswordWithEmail(user.id);

    // Verification successful. Issue final session token.
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
          two_factor_enabled: true,
          has_password: Boolean(user.password_hash),
          require_password_with_email: requirePasswordWithEmail,
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: `2FA verification failed: ${err.message}` }),
      { status: 500, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
    );
  }
};
