import { sendEmailDirect } from "./lib/smtp";
import { renderVerxlEmail } from "./lib/email";

interface Env {
  DB: D1Database;
  SMTP_USER?: string;
  SMTP_PASS?: string;
}

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const result = await sendEmailDirect({
    to: "automated@verxl.com",
    subject: "Verxl email render check",
    html: renderVerxlEmail({
      preheader: "Verxl transactional email shell render check.",
      eyebrow: "RENDER CHECK / 01",
      title1: "A quiet",
      title2: "receipt.",
      intro: "The transactional email shell now uses the same ink, mint and hairline system as the site.",
      code: "123456",
      footerNote: "This is a render check. No action is required.",
    }),
    smtpUser: env.SMTP_USER,
    smtpPass: env.SMTP_PASS,
  });

  return new Response(JSON.stringify(result, null, 2), {
    headers: { "Content-Type": "application/json" },
  });
};
