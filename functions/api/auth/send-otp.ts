import { CORS_HEADERS, generateOtpCode } from "../lib/auth";
import { sendEmailDirect } from "../lib/smtp";

interface Env {
  DB: D1Database;
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

  const code = generateOtpCode();
  const id = `otp_${crypto.randomUUID()}`;
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  // Insert code into D1
  try {
    await env.DB.prepare(
      "INSERT INTO auth_codes (id, email, code, expires_at, used, created_at) VALUES (?, ?, ?, ?, 0, datetime('now'))"
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
  const emailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #080c14; color: #e2e8f0; padding: 24px; margin: 0; }
          .container { max-width: 520px; margin: 0 auto; background-color: #0e1526; border: 1px solid #1e293b; border-radius: 4px; padding: 32px; }
          .logo { font-size: 16px; font-weight: 800; color: #3b82f6; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 24px; }
          .title { font-size: 20px; font-weight: 700; color: #ffffff; margin-bottom: 12px; }
          .desc { font-size: 13px; color: #94a3b8; line-height: 1.6; margin-bottom: 24px; }
          .code-box { background-color: #05070b; border: 1px solid #3b82f6; border-radius: 3px; padding: 18px; text-align: center; margin-bottom: 24px; }
          .otp-code { font-family: 'Courier New', monospace; font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #60a5fa; }
          .footer { font-size: 11px; color: #64748b; border-top: 1px solid #1e293b; padding-top: 16px; margin-top: 24px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">VERXL PROTOCOL</div>
          <div class="title">Verification Code</div>
          <div class="desc">Use the one-time code below to authenticate into the Verxl Protocol Console and access decentralized inference clearing.</div>
          <div class="code-box">
            <div class="otp-code">${code}</div>
          </div>
          <div class="desc">This code expires in <strong>10 minutes</strong>. If you did not request this verification, you can safely ignore this email.</div>
          <div class="footer">
            Verxl Protocol · Non-Custodial Machine Intelligence Clearing · automated@verxl.com
          </div>
        </div>
      </body>
    </html>
  `;

  const emailRes = await sendEmailDirect({
    to: email,
    subject: `Your Verxl Authentication Code: ${code}`,
    html: emailHtml,
    smtpUser: env.SMTP_USER || "automated@verxl.com",
    smtpPass: env.SMTP_PASS || "***REMOVED***",
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
