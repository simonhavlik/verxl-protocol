import { CORS_HEADERS, verifySessionToken, signSessionToken } from "../lib/auth";
import { db } from "../lib/db";

interface Env {}

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
};

// POST /api/auth/link-email
// Links an optional email address to an existing MetaMask Web3 account
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request } = context;

  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Authentication required to link email" }), {
      status: 401,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  const token = authHeader.slice(7).trim();
  const payload = await verifySessionToken(token);
  if (!payload || !payload.sub) {
    return new Response(JSON.stringify({ error: "Invalid or expired session" }), {
      status: 401,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON payload" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const code = typeof body.code === "string" ? body.code.trim() : "";

  if (!email || !code) {
    return new Response(JSON.stringify({ error: "Email and verification code are required" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return new Response(JSON.stringify({ error: "Invalid email address format" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  // 1. Verify code in auth_codes
  const now = Date.now();
  const codeRow = await db.prepare(
    "SELECT id, expires_at FROM auth_codes WHERE email = ? AND code = ? AND used = 0 ORDER BY created_at DESC LIMIT 1"
  )
    .bind(email, code)
    .first<{ id: string; expires_at: string | number }>();

  if (!codeRow || Number(codeRow.expires_at) < now) {
    return new Response(
      JSON.stringify({ error: "Invalid or expired verification code. Please request a new code." }),
      { status: 401, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
    );
  }

  // 2. Mark code as used
  await db.prepare("UPDATE auth_codes SET used = 1 WHERE id = ?").bind(codeRow.id).run();

  // 3. Check if email is already taken by another account
  const existingUserWithEmail = await db.prepare(
    "SELECT id, wallet_address, balance_usd, total_deposited_usd FROM users WHERE email = ? AND id != ?"
  )
    .bind(email, payload.sub)
    .first<{ id: string; wallet_address: string | null; balance_usd: number; total_deposited_usd: number }>();

  if (existingUserWithEmail) {
    // If the other account has no wallet and 0 balance, allow reassigning the email cleanly
    if (!existingUserWithEmail.wallet_address && Number(existingUserWithEmail.total_deposited_usd) <= 0) {
      await db.prepare("UPDATE users SET email = ? WHERE id = ?")
        .bind(`archived_${existingUserWithEmail.id.slice(0, 8)}@inactive.verxl.user`, existingUserWithEmail.id)
        .run();
    } else {
      return new Response(
        JSON.stringify({
          error: "This email is already associated with another active Verxl account. Please use a different email.",
        }),
        { status: 409, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
      );
    }
  }

  // 4. Update the current user's email
  await db.prepare("UPDATE users SET email = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
    .bind(email, payload.sub)
    .run();

  // 5. Fetch updated user
  const updatedUser = await db.prepare(
    "SELECT id, email, wallet_address, balance_usd, total_deposited_usd, total_spent_usd, password_hash, two_factor_enabled FROM users WHERE id = ?"
  )
    .bind(payload.sub)
    .first<{
      id: string;
      email: string;
      wallet_address: string | null;
      balance_usd: number;
      total_deposited_usd: number;
      total_spent_usd: number;
      password_hash: string | null;
      two_factor_enabled: boolean;
    }>();

  if (!updatedUser) {
    return new Response(JSON.stringify({ error: "User not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  // Generate updated session token with the new email
  const newToken = await signSessionToken({
    sub: updatedUser.id,
    email: updatedUser.email,
    wallet: updatedUser.wallet_address,
  });

  return new Response(
    JSON.stringify({
      success: true,
      token: newToken,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        wallet_address: updatedUser.wallet_address,
        balance_usd: Number(updatedUser.balance_usd),
        total_deposited_usd: Number(updatedUser.total_deposited_usd),
        total_spent_usd: Number(updatedUser.total_spent_usd),
        has_password: Boolean(updatedUser.password_hash),
        two_factor_enabled: Boolean(updatedUser.two_factor_enabled),
        is_admin:
          updatedUser.email?.toLowerCase() === "me@simonhavlik.com" ||
          updatedUser.wallet_address?.toLowerCase() === "0x9b64203878f24eb0cdf55c8c6fa7d08ba0cf77e5",
      },
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    }
  );
};
