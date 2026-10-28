-- Client-side encrypted chat storage.
-- The browser derives an AES-256-GCM key from a wallet signature and encrypts
-- {title, model, messages} before upload. PostgreSQL keeps only the envelope.
CREATE SCHEMA IF NOT EXISTS verxl;

CREATE TABLE IF NOT EXISTS verxl.chat_conversations (
    id varchar(128) PRIMARY KEY,
    user_id varchar(64) NOT NULL,
    ciphertext text NOT NULL,
    key_id varchar(42) NOT NULL,
    created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE verxl.chat_conversations ADD COLUMN IF NOT EXISTS ciphertext text;
ALTER TABLE verxl.chat_conversations ADD COLUMN IF NOT EXISTS key_id varchar(42);

-- Plaintext conversations cannot be sealed without the user's wallet signature.
DELETE FROM verxl.chat_conversations WHERE ciphertext IS NULL;

ALTER TABLE verxl.chat_conversations DROP COLUMN IF EXISTS title;
ALTER TABLE verxl.chat_conversations DROP COLUMN IF EXISTS model;
ALTER TABLE verxl.chat_conversations DROP COLUMN IF EXISTS messages;
ALTER TABLE verxl.chat_conversations DROP COLUMN IF EXISTS system_prompt;

ALTER TABLE verxl.chat_conversations ALTER COLUMN ciphertext SET NOT NULL;
ALTER TABLE verxl.chat_conversations ALTER COLUMN key_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_updated
    ON verxl.chat_conversations(user_id, updated_at DESC);

COMMENT ON TABLE verxl.chat_conversations IS
    'Client-side encrypted chat envelopes. No plaintext message content is stored.';
COMMENT ON COLUMN verxl.chat_conversations.ciphertext IS
    'AES-256-GCM envelope v1.<iv_b64>.<ciphertext_b64>; key derived in the browser.';
COMMENT ON COLUMN verxl.chat_conversations.key_id IS
    'Wallet address bound to the client-side key. Not a private key or signature.';
