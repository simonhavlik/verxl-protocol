-- =====================================================================
-- Verxl Protocol Seed Data (PostgreSQL)
-- Provides mock developers, registered GPU providers, and audit benchmarks
-- =====================================================================

-- 1. Insert Initial Founding & Test Developers
INSERT INTO users (id, wallet_address, prepaid_balance_usd) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '0x14f10A865e277C0B1949e18Dd9856602DB11742b', 150.000000),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', '0x71C84167F308319566BC22E6464834241680bEeb', 50.000000),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', '0x9965507D1a55bcC2695C58ba16FB37d819B0A4df', 25.000000);

-- 2. Insert Developer API Keys
-- Raw test key for user a0eeb...: "vrxl-test-developer-key-secret-999"
-- SHA-256 of "vrxl-test-developer-key-secret-999":
-- 8c8868c6a086b9fc0c2620a2e76f5b721867dd1146f251eb33dc059c4a8ee1b7
INSERT INTO api_keys (user_id, key_hash, key_prefix, revoked) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '8c8868c6a086b9fc0c2620a2e76f5b721867dd1146f251eb33dc059c4a8ee1b7', 'vrxl-test-', FALSE),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', 'vrxl-prod-', FALSE);

-- 3. Insert Verified Independent GPU Compute Providers
INSERT INTO providers (id, operator_wallet, endpoint_url, model_identifier, price_per_1m_prompt_tokens, price_per_1m_completion_tokens, staked_amount_vrxl, status, last_audit_score) VALUES
('11111111-1111-1111-1111-111111111111', '0x1111111111111111111111111111111111111111', 'https://prague-node1.verxl.internal/v1', 'meta-llama/llama-3-70b-instruct', 0.7000, 0.7500, 25000.0000, 'ACTIVE', 99.40),
('22222222-2222-2222-2222-222222222222', '0x2222222222222222222222222222222222222222', 'https://brno-cluster2.verxl.internal/v1', 'meta-llama/llama-3-70b-instruct', 0.6800, 0.7200, 30000.0000, 'ACTIVE', 98.90),
('33333333-3333-3333-3333-333333333333', '0x3333333333333333333333333333333333333333', 'https://frankfurt-gpu0.verxl.internal/v1', 'meta-llama/llama-3-8b-instruct', 0.0800, 0.1000, 10000.0000, 'ACTIVE', 99.80),
('44444444-4444-4444-4444-444444444444', '0x4444444444444444444444444444444444444444', 'https://unverified-host.verxl.internal/v1', 'meta-llama/llama-3-70b-instruct', 0.4000, 0.4000, 10000.0000, 'PROBATION', 74.20),
('55555555-5555-5555-5555-555555555555', '0x5555555555555555555555555555555555555555', 'https://spoofed-quantized.verxl.internal/v1', 'meta-llama/llama-3-70b-instruct', 0.5000, 0.5000, 9000.0000, 'SLASHED', 51.10);

-- 4. Insert Autonomous Quality Audit Records
INSERT INTO audit_runs (provider_id, latency_ms, ttft_ms, fidelity_score, passed) VALUES
('11111111-1111-1111-1111-111111111111', 280, 140, 99.40, TRUE),
('22222222-2222-2222-2222-222222222222', 310, 160, 98.90, TRUE),
('33333333-3333-3333-3333-333333333333', 120, 45, 99.80, TRUE),
('44444444-4444-4444-4444-444444444444', 980, 620, 74.20, FALSE),
('55555555-5555-5555-5555-555555555555', 450, 190, 51.10, FALSE);

-- 5. Insert Sample Live Inference Usage Logs
INSERT INTO usage_logs (user_id, provider_id, prompt_tokens, completion_tokens, total_cost_usd, protocol_fee_usd) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '11111111-1111-1111-1111-111111111111', 450, 210, 0.000472, 0.000002),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '22222222-2222-2222-2222-222222222222', 1200, 850, 0.001428, 0.000007),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', '33333333-3333-3333-3333-333333333333', 350, 140, 0.000042, 0.000000);
