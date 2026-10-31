CREATE TABLE IF NOT EXISTS verxl.user_chat_settings (
    user_id UUID PRIMARY KEY,
    think VARCHAR(8) NOT NULL DEFAULT 'medium',
    search_provider VARCHAR(16) NOT NULL DEFAULT 'firecrawl',
    search_key_enc TEXT,
    search_base_url TEXT,
    search_tool BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
