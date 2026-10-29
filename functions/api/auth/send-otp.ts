import { CORS_HEADERS, generateOtpCode, verifyPassword, verifySessionToken } from "../lib/auth";
import { db } from "../lib/db";
import { sendEmailDirect } from "../lib/smtp";
import { renderVerxlEmail } from "../lib/email";
import { getRequirePasswordWithEmail } from "../lib/security-settings";

interface Env {
  SMTP_USER?: string;
  SMTP_PASS?: string;
}

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

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
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return new Response(JSON.stringify({ error: "Valid email address is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  // "Require password with email" — on by default. The password is verified
  // when the sign-in code is requested, so an inbox alone cannot mint a session.
  // A valid session means this is the authenticated "link email" flow, not login.
  const password = typeof body.password === "string" ? body.password : "";
  const authHeader = request.headers.get("Authorization");
  const sessionToken = authHeader && authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const linkSession = sessionToken ? await verifySessionToken(sessionToken) : null;

  try {
    const account = await db
      .prepare("SELECT id, password_hash FROM users WHERE LOWER(email) = ?")
      .bind(email)
      .first<{ id: string; password_hash: string | null }>();
    if (account?.password_hash && !linkSession) {
      const requiresPassword = await getRequirePasswordWithEmail(account.id);
      if (requiresPassword) {
        const valid = password ? await verifyPassword(password, account.password_hash) : false;
        if (!valid) {
          return new Response(
            JSON.stringify({
              error: "This account requires its password for email sign-in. Enter your account password and try again.",
              code: "PASSWORD_REQUIRED",
            }),
            { status: 401, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
          );
        }
      }
    }
  } catch (err: any) {
    return new Response(JSON.stringify({ error: "Security setting check failed", details: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  // Deduplicate rapid resend/double-submit requests: one email per 90 seconds.
  const recent = await db
    .prepare(
      "SELECT id FROM auth_codes WHERE email = ? AND used = 0 AND created_at > NOW() - INTERVAL '90 seconds' ORDER BY created_at DESC LIMIT 1"
    )
    .bind(email)
    .first<{ id: string }>();
  if (recent) {
    return new Response(
      JSON.stringify({ success: true, message: `Verification code already sent to ${email}` }),
      { status: 200, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
    );
  }

  const code = generateOtpCode();
  const id = `otp_${crypto.randomUUID()}`;
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  // Insert code into Charizard PostgreSQL (schema: verxl)
  try {
    await db.prepare(
      "INSERT INTO auth_codes (id, email, code, expires_at, used, created_at) VALUES (?, ?, ?, ?, 0, CURRENT_TIMESTAMP)"
    )
      .bind(id, email, code, expiresAt)
      .run();
  } catch (err: any) {
    return new Response(JSON.stringify({ error: "Database error storing auth code", details: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  // Format email HTML
  const emailHtml = renderVerxlEmail({
    preheader: `Your Verxl sign-in code is ${code}. Valid for 10 minutes.`,
    eyebrow: "AUTHENTICATION / 01",
    title1: "Your sign-in",
    title2: "code.",
    intro: "Use this one-time code to sign in to Verxl. It expires in 10 minutes.",
    code,
    footerNote: "If you did not request this code, ignore this email; no change will be made.",
  });

  const emailRes = await sendEmailDirect({
    to: email,
    subject: `Verxl sign-in code: ${code}`,
    html: emailHtml,
    smtpUser: env.SMTP_USER || "automated@verxl.com",
    smtpPass: env.SMTP_PASS,
  });

  if (!emailRes.success) {
    return new Response(
      JSON.stringify({
        error: "Failed to dispatch email",
        details: emailRes.log,
      }),
      { status: 500, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
    );
  }

  return new Response(
    JSON.stringify({
      success: true,
      message: `Verification code sent to ${email}`,
    }),
    { status: 200, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
  );
};
