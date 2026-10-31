// Records an opt-out from non-transactional email. Login/security messages are
// transactional and remain necessary while an account is active.
import { CORS_HEADERS } from "../lib/auth";
import { db } from "../lib/db";

interface Env {}

let ready = false;
async function ensureTable(): Promise<void> {
  if (ready) return;
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS email_preferences (
        email TEXT PRIMARY KEY,
        marketing_opt_out_at TIMESTAMPTZ,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`
    )
    .run();
  ready = true;
}

export const onRequestOptions: PagesFunction<Env> = async () =>
  new Response(null, { status: 204, headers: CORS_HEADERS });

export const onRequestPost: PagesFunction<Env> = async ({ request }) => {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return new Response(JSON.stringify({ error: "Enter a valid email address." }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }
  await ensureTable();
  await db
    .prepare(
      `INSERT INTO email_preferences (email, marketing_opt_out_at, updated_at)
       VALUES (?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       ON CONFLICT (email) DO UPDATE SET
         marketing_opt_out_at = CURRENT_TIMESTAMP,
         updated_at = CURRENT_TIMESTAMP`
    )
    .bind(email)
    .run();
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
};
