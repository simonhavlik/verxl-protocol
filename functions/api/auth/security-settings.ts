// Cloudflare Pages Function: /api/auth/security-settings
// Toggle "require password with email OTP". Default is ON.
import { CORS_HEADERS, verifySessionToken } from "../lib/auth";
import { setRequirePasswordWithEmail } from "../lib/security-settings";

interface Env {}

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
};

export const onRequestPost: PagesFunction<Env> = async ({ request }) => {
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

  let body: any;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON payload" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  if (typeof body.require_password_with_email !== "boolean") {
    return new Response(JSON.stringify({ error: "require_password_with_email must be a boolean" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  try {
    await setRequirePasswordWithEmail(payload.sub, body.require_password_with_email);
    return new Response(
      JSON.stringify({
        success: true,
        require_password_with_email: body.require_password_with_email,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: `Failed to save security setting: ${err.message}` }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }
};
