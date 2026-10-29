// Per-user security settings. Defaults are deliberately safe: a missing row
// means "require password with email OTP" is ON.
import { db } from "./db";

let ensuring: Promise<void> | null = null;

async function ensureTable(): Promise<void> {
  if (!ensuring) {
    ensuring = db
      .prepare(
        `CREATE TABLE IF NOT EXISTS user_security_settings (
          user_id TEXT PRIMARY KEY,
          require_password_with_email BOOLEAN NOT NULL DEFAULT TRUE,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
        )`
      )
      .run()
      .then(() => undefined)
      .catch((err) => {
        ensuring = null;
        throw err;
      });
  }
  await ensuring;
}

export async function getRequirePasswordWithEmail(userId: string): Promise<boolean> {
  await ensureTable();
  const row = await db
    .prepare("SELECT require_password_with_email FROM user_security_settings WHERE user_id = ?")
    .bind(userId)
    .first<{ require_password_with_email: boolean }>();
  return row ? Boolean(row.require_password_with_email) : true;
}

export async function setRequirePasswordWithEmail(userId: string, value: boolean): Promise<void> {
  await ensureTable();
  await db
    .prepare(
      `INSERT INTO user_security_settings (user_id, require_password_with_email, updated_at)
       VALUES (?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id) DO UPDATE SET
         require_password_with_email = EXCLUDED.require_password_with_email,
         updated_at = CURRENT_TIMESTAMP`
    )
    .bind(userId, value)
    .run();
}
