import { CORS_HEADERS } from "../../lib/auth";
import { db } from "../../lib/db";
import { sendEmailDirect } from "../../lib/smtp";
import { renderVerxlEmail } from "../../lib/email";
import { fetchRecentEmailsFromSeznam } from "../../lib/imap";
import { verifyAdminUser } from "../lib";

interface Env {}

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
};

// GET /api/admin/providers/messages - Retrieve message correspondence for a provider
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request } = context;
  const auth = await verifyAdminUser(request);
  if (!auth.isAdmin || auth.errorResponse) {
    return auth.errorResponse!;
  }

  const url = new URL(request.url);
  const providerId = url.searchParams.get("provider_id");
  const providerEmail = url.searchParams.get("email");

  try {
    // 1. Fetch stored messages from PostgreSQL
    let query =
      "SELECT id, provider_id, provider_email, sender, recipient, subject, body, direction, status, created_at FROM provider_messages";
    const params: any[] = [];

    if (providerEmail) {
      query += " WHERE LOWER(provider_email) = ? OR LOWER(recipient) = ? OR LOWER(sender) = ?";
      params.push(providerEmail.toLowerCase(), providerEmail.toLowerCase(), providerEmail.toLowerCase());
    } else if (providerId) {
      query += " WHERE provider_id = ?";
      params.push(providerId);
    }
    query += " ORDER BY created_at ASC";

    const { results: storedMessages } = await db.prepare(query).bind(...params).all();

    // 2. Try fetching any fresh inbound emails from Seznam IMAP
    let imapEmails: any[] = [];
    try {
      imapEmails = await fetchRecentEmailsFromSeznam(providerEmail || undefined);
      // Ingest any new emails into provider_messages
      for (const im of imapEmails) {
        const exists = storedMessages?.some(
          (m: any) => m.sender === im.from && m.subject === im.subject
        );
        if (!exists) {
          const newId = `msg_in_${crypto.randomUUID()}`;
          await db
            .prepare(
              `INSERT INTO provider_messages (id, provider_id, provider_email, sender, recipient, subject, body, direction, status, created_at)
              VALUES (?, ?, ?, ?, 'automated@verxl.com', ?, ?, 'INBOUND', 'DELIVERED', CURRENT_TIMESTAMP)`
            )
            .bind(newId, providerId || null, im.from, im.from, im.subject, im.body)
            .run();

          storedMessages?.push({
            id: newId,
            provider_id: providerId || null,
            provider_email: im.from,
            sender: im.from,
            recipient: "automated@verxl.com",
            subject: im.subject,
            body: im.body,
            direction: "INBOUND",
            status: "DELIVERED",
            created_at: im.date || new Date().toISOString(),
          });
        }
      }
    } catch (imapErr) {
      console.warn("IMAP sync skipped:", imapErr);
    }

    return new Response(
      JSON.stringify({
        success: true,
        messages: storedMessages || [],
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }
};

// POST /api/admin/providers/messages - Send email message to provider via automated@verxl.com
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request } = context;
  const auth = await verifyAdminUser(request);
  if (!auth.isAdmin || auth.errorResponse) {
    return auth.errorResponse!;
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  const { provider_id, recipient_email, subject, message } = body;
  if (!recipient_email || !message) {
    return new Response(
      JSON.stringify({ error: "recipient_email and message are required" }),
      { status: 400, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
    );
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(recipient_email.trim())) {
    return new Response(
      JSON.stringify({ error: "Invalid recipient email address" }),
      { status: 400, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
    );
  }

  const msgId = `msg_out_${crypto.randomUUID()}`;
  const mailSubject = subject?.trim() || "Message from Verxl Protocol Operator";

  // Build Verxl email shell
  const escapedMessage = message
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  const htmlBody = renderVerxlEmail({
    preheader: mailSubject,
    eyebrow: "PROVIDER OPERATIONS / 01",
    title1: "A message",
    title2: "from Verxl.",
    intro: "The Verxl operator sent you a direct message.",
    bodyHtml: `<div style="white-space:pre-wrap;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:13px;line-height:1.65;color:#8B989E;">${escapedMessage}</div>`,
    footerNote: "Sent by the Verxl Protocol lead operator. Reply to this address.",
  });

  // 1. Send via Seznam SMTP
  const sendRes = await sendEmailDirect({
    to: recipient_email.trim(),
    subject: mailSubject,
    html: htmlBody,
    from: "automated@verxl.com",
  });

  // 2. Record in database
  await db
    .prepare(
      `INSERT INTO provider_messages (id, provider_id, provider_email, sender, recipient, subject, body, direction, status, created_at)
      VALUES (?, ?, ?, 'automated@verxl.com', ?, ?, ?, 'OUTBOUND', ?, CURRENT_TIMESTAMP)`
    )
    .bind(
      msgId,
      provider_id || null,
      recipient_email.trim().toLowerCase(),
      recipient_email.trim().toLowerCase(),
      mailSubject,
      message.trim(),
      sendRes.success ? "SENT" : "FAILED"
    )
    .run();

  if (!sendRes.success) {
    return new Response(
      JSON.stringify({
        error: "Failed to dispatch email over SMTP",
        details: sendRes.log,
      }),
      { status: 502, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
    );
  }

  return new Response(
    JSON.stringify({
      success: true,
      message_id: msgId,
      message: `Email dispatched successfully from automated@verxl.com to ${recipient_email}.`,
    }),
    { status: 200, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
  );
};
