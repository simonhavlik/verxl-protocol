// Cloudflare Pages Function: /api/auth/2fa/disable
// Disables 2FA in verxl.users (requires password or token verification)

import { CORS_HEADERS, verifyPassword, verifySessionToken } from "../../lib/auth";
import { db } from "../../lib/db";

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
    const body: any = await request.json().catch(() => ({}));
    const { password } = body;

    const user = await db.prepare(
      "SELECT id, password_hash, two_factor_enabled FROM users WHERE id = ?"
    )
      .bind(payload.sub)
      .first<{ id: string; password_hash: string | null; two_factor_enabled: boolean }>();

    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      });
    }

    if (user.password_hash) {
      if (!password || !(await verifyPassword(password, user.password_hash))) {
        return new Response(
          JSON.stringify({ error: "Password confirmation required to disable 2FA." }),
          { status: 401, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
        );
      }
    }

    await db.prepare(
      "UPDATE users SET two_factor_enabled = false, two_factor_secret = NULL, recovery_codes = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
    )
      .bind(user.id)
      .run();

    return new Response(
      JSON.stringify({
        success: true,
        message: "Two-Factor Authentication disabled.",
        two_factor_enabled: false,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: `Failed to disable 2FA: ${err.message}` }),
      { status: 500, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
    );
  }
};
