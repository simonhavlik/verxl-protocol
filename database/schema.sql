-- =====================================================================
-- Verxl Protocol Database Schema (PostgreSQL DDL)
-- Gateway: verxl.com | DAO: Verxl DAO (Aragon OSx Sepolia)
-- =====================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables/types if rebuilding schema
DROP TABLE IF EXISTS usage_logs CASCADE;
DROP TABLE IF EXISTS audit_runs CASCADE;
DROP TABLE IF EXISTS providers CASCADE;
DROP TABLE IF EXISTS api_keys CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TYPE IF EXISTS provider_status CASCADE;

-- 1. Users & Prepaid Balance
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address VARCHAR(42) UNIQUE NOT NULL,
    prepaid_balance_usd NUMERIC(12, 6) DEFAULT 0.000000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_wallet ON users(wallet_address);

-- 2. Developer API Keys (Hashed)
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    key_hash VARCHAR(64) UNIQUE NOT NULL,
    key_prefix VARCHAR(10) NOT NULL,
    revoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX idx_api_keys_user ON api_keys(user_id);

-- 3. Inference Compute Providers
CREATE TYPE provider_status AS ENUM ('ACTIVE', 'PROBATION', 'SLASHED', 'OFFLINE');

CREATE TABLE providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operator_wallet VARCHAR(42) NOT NULL,
    endpoint_url TEXT NOT NULL,
    model_identifier VARCHAR(100) NOT NULL,
    price_per_1m_prompt_tokens NUMERIC(10, 4) NOT NULL,
    price_per_1m_completion_tokens NUMERIC(10, 4) NOT NULL,
    staked_amount_vrxl NUMERIC(18, 4) NOT NULL,
    status provider_status DEFAULT 'PROBATION',
    last_audit_score NUMERIC(5, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_providers_status_model ON providers(status, model_identifier);
CREATE INDEX idx_providers_operator ON providers(operator_wallet);

-- 4. Autonomous AI Quality Audit Runs
CREATE TABLE audit_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
    latency_ms INTEGER NOT NULL,
    ttft_ms INTEGER NOT NULL,
    fidelity_score NUMERIC(5, 2) NOT NULL,
    passed BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_runs_provider ON audit_runs(provider_id, created_at DESC);

-- 5. API Inference Usage Logs & 0.5% Fee Accounting
CREATE TABLE usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    provider_id UUID REFERENCES providers(id) ON DELETE SET NULL,
    prompt_tokens INTEGER NOT NULL,
    completion_tokens INTEGER NOT NULL,
    total_cost_usd NUMERIC(12, 6) NOT NULL,
    protocol_fee_usd NUMERIC(12, 6) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_usage_logs_user ON usage_logs(user_id, created_at DESC);
CREATE INDEX idx_usage_logs_provider ON usage_logs(provider_id, created_at DESC);
