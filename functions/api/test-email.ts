import { sendEmailDirect } from "./lib/smtp";

interface Env {
  DB: D1Database;
  SMTP_USER?: string;
  SMTP_PASS?: string;
}

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const result = await sendEmailDirect({
    to: "automated@verxl.com",
    subject: "Verxl Protocol Socket Test",
    html: "<p>Test email from Cloudflare Pages Function via direct SMTPS socket.</p>",
    smtpUser: env.SMTP_USER,
    smtpPass: env.SMTP_PASS,
  });

  return new Response(JSON.stringify(result, null, 2), {
    headers: { "Content-Type": "application/json" },
  });
};
