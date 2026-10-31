import { db } from "./db";

export const LEGAL_VERSION = "2026-10-31";

let ready = false;

export async function ensureConsentTable(): Promise<void> {
  if (ready) return;
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS user_legal_consents (
        user_id UUID PRIMARY KEY,
        age_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
        terms_accepted BOOLEAN NOT NULL DEFAULT FALSE,
        terms_version VARCHAR(32) NOT NULL,
        accepted_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`
    )
    .run();
  ready = true;
}

export async function readConsent(userId: string): Promise<{ accepted: boolean; termsVersion: string; acceptedAt: string | null }> {
  await ensureConsentTable();
  const row = await db
    .prepare("SELECT age_confirmed, terms_accepted, terms_version, accepted_at FROM user_legal_consents WHERE user_id = ?")
    .bind(userId)
    .first<any>();
  if (!row) return { accepted: false, termsVersion: LEGAL_VERSION, acceptedAt: null };
  return {
    accepted: Boolean(row.age_confirmed && row.terms_accepted && row.terms_version === LEGAL_VERSION),
    termsVersion: row.terms_version || LEGAL_VERSION,
    acceptedAt: row.accepted_at ? new Date(row.accepted_at).toISOString() : null,
  };
}

export async function writeConsent(userId: string, ageConfirmed: boolean, termsAccepted: boolean): Promise<void> {
  await ensureConsentTable();
  await db
    .prepare(
      `INSERT INTO user_legal_consents (user_id, age_confirmed, terms_accepted, terms_version, accepted_at)
       VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id) DO UPDATE SET
         age_confirmed = EXCLUDED.age_confirmed,
         terms_accepted = EXCLUDED.terms_accepted,
         terms_version = EXCLUDED.terms_version,
         accepted_at = CURRENT_TIMESTAMP`
    )
    .bind(userId, ageConfirmed, termsAccepted, LEGAL_VERSION)
    .run();
}
