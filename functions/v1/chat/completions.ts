// Cloudflare Pages Function: /v1/chat/completions
// Non-Custodial OpenAI API Drop-in Proxy with 50 bps Protocol Fee & Real-time Balance Clearing
// Supports Bearer vrxl_live_... (API Keys) and Bearer vtok_... (Console / Chat Session Tokens)
import { hashSha256, verifySessionToken } from "../../api/lib/auth";
import { db } from "../../api/lib/db";

interface Env {}

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, x-opencode-session",
};

// In-memory sliding window rate limiter for free demo queries: 40 requests per 10 minutes per IP
interface RateLimitBucket {
  count: number;
  resetAt: number;
}
const ipRateLimitMap = new Map<string, RateLimitBucket>();
let upstreamGatewayKeyCache: { value: string; expiresAt: number } | null = null;
const DEMO_RATE_LIMIT_MAX = 40;
const DEMO_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

const SUPPORTED_MODELS = [
  "qwen3.5-4b-uncensored-64k",
  "deepseek-v4.1-flash",
  "mimo-v2.6-flash",
];

function keyFingerprint(authHeader: string | null) {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7).trim();
  if (!token) return null;
  return token.length > 16 ? `${token.slice(0, 10)}…${token.slice(-6)}` : "…";
}

const API_HELP = {
  summary: "Verxl inference requires a funded API key. There is no free compute tier.",
  get_key: "https://verxl.com/console",
  docs: "https://verxl.com/docs",
  mcp: "https://verxl.com/mcp",
  public_reads: ["https://verxl.com/v1/models", "https://verxl.com/openapi.json", "https://verxl.com/llms.txt", "https://verxl.com/api/health"],
  steps: [
    "Ask the user to open https://verxl.com/console.",
    "Connect a wallet, deposit USDC on Arbitrum (minimum $1), and create a key.",
    "Send Authorization: Bearer vrxl_live_... on every completion request.",
  ],
  agent_note: "Never invent a key or claim free credits. Public docs and /v1/models need no key; completions always do.",
};

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request } = context;

  // 1. Strict Security & Input Validation (Zero Injection, Strict JSON Schema)
  let body: any;
  try {
    body = await request.json();
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: {
          message: "Invalid JSON request payload.",
          type: "invalid_request_error",
          code: "bad_json",
        },
      }),
      { status: 400, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
    );
  }

  // Strict Model Selection: Only Bulbasaur Qwen 3.5, DeepSeek V4.1 Flash, and Xiaomi MiMo 2.6 Flash
  const inputModel = typeof body.model === "string" ? body.model : "qwen3.5-4b-uncensored-64k";
  // Backwards compatibility for clients that saved the old 32k id. The model
  // served is the 64k build; the legacy id never appears in /v1/models.
  const rawModel = inputModel === "qwen3.5-4b-uncensored-32k"
    ? "qwen3.5-4b-uncensored-64k"
    : inputModel;
  if (body.model !== undefined && !SUPPORTED_MODELS.includes(rawModel)) {
    return new Response(
      JSON.stringify({
        error: {
          message: `Unknown model '${rawModel}'. No substitution was made and nothing was billed.`,
          type: "invalid_request_error",
          param: "model",
          code: "model_not_found",
        },
        available_models: SUPPORTED_MODELS,
        docs: "https://verxl.com/docs",
      }),
      { status: 400, headers: { "Content-Type": "application/json", ...CORS_HEADERS, "X-Verxl-Model-Fallback": "none" } }
    );
  }
  const lowerModel = rawModel.toLowerCase();
  let requestedModel = "qwen3.5-4b-uncensored-64k";
  if (lowerModel.includes("deepseek")) {
    requestedModel = "deepseek-v4.1-flash";
  } else if (lowerModel.includes("mimo") || lowerModel.includes("xiaomi")) {
    requestedModel = "mimo-v2.6-flash";
  } else {
    requestedModel = "qwen3.5-4b-uncensored-64k";
  }

  const messages = Array.isArray(body.messages) ? body.messages : [];
  const stream = Boolean(body.stream);
  const temperature = typeof body.temperature === "number" ? body.temperature : 0.7;
  const requestedMaxTokens = typeof body.max_tokens === "number" ? Math.min(body.max_tokens, 32768) : 8192;
  // Qwen 3.5 4B spends the first ~200 tokens on its thinking pass. Below 256
  // output tokens the caller can get an empty content string with
  // finish_reason=length even though the request "succeeded". Apply a floor
  // before the upstream call so small max_tokens values cannot silently empty.
  const QWEN_MIN_OUTPUT_TOKENS = 256;
  const minTokensApplied = requestedModel === "qwen3.5-4b-uncensored-64k" && requestedMaxTokens < QWEN_MIN_OUTPUT_TOKENS;
  const maxTokens = minTokensApplied ? QWEN_MIN_OUTPUT_TOKENS : requestedMaxTokens;

  if (messages.length === 0) {
    return new Response(
      JSON.stringify({
        error: {
          message: "'messages' array is required and must not be empty.",
          type: "invalid_request_error",
          param: "messages",
        },
      }),
      { status: 400, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
    );
  }

  // 2. Authentication & Balance Verification
  const authHeader = request.headers.get("Authorization");
  let authenticatedUser: {
    id: string;
    balance_usd: number;
    key_id: string | null;
    is_grant?: boolean;
  } | null = null;

  if (authHeader && (authHeader.startsWith("Bearer vrxl_live_") || authHeader.startsWith("Bearer vrxl_grant_"))) {
    // API Key Authentication (Paid live key or Admin Free Grant key)
    const rawApiKey = authHeader.slice(7).trim();
    const keyHash = await hashSha256(rawApiKey);

    const record = await db.prepare(
      "SELECT u.id as user_id, u.balance_usd, k.id as key_id, k.name, k.key_type, k.spend_limit_usd, k.total_spent_usd, k.is_active FROM api_keys k JOIN users u ON k.user_id = u.id WHERE k.key_hash = ?"
    )
      .bind(keyHash)
      .first<{
        user_id: string;
        balance_usd: number;
        key_id: string;
        name: string;
        key_type: string;
        spend_limit_usd: number;
        total_spent_usd: number;
        is_active: number;
      }>();

    if (!record) {
      return new Response(
        JSON.stringify({
          error: {
            message: "Invalid or unrecognized Verxl API key.",
            type: "authentication_error",
            code: "invalid_api_key",
          },
          key_fingerprint: keyFingerprint(authHeader),
          help: API_HELP,
        }),
        { status: 401, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
      );
    }

    if (Number(record.is_active) !== 1) {
      return new Response(
        JSON.stringify({
          error: {
            message: "This Verxl API key has been permanently deactivated by the administrator. Historical records remain preserved.",
            type: "authentication_error",
            code: "api_key_deactivated",
          },
        }),
        { status: 401, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
      );
    }

    const isGrantKey = record.key_type === "grant";

    // Standard live keys require positive account balance.
    // Admin grant keys are FREE (no payment required)!
    if (!isGrantKey && Number(record.balance_usd) <= 0.0) {
      return new Response(
        JSON.stringify({
          error: {
            message: `Insufficient Verxl account balance ($${Number(record.balance_usd).toFixed(4)} USD). Deposit USDC on Arbitrum to continue.`,
            type: "insufficient_quota",
            code: "insufficient_balance",
          },
          help: API_HELP,
        }),
        { status: 402, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
      );
    }

    // Check optional grant budget limit if specified (> 0)
    if (isGrantKey && Number(record.spend_limit_usd) > 0 && Number(record.total_spent_usd) >= Number(record.spend_limit_usd)) {
      return new Response(
        JSON.stringify({
          error: {
            message: `Free grant budget limit ($${Number(record.spend_limit_usd).toFixed(2)} USD) reached for this demo key.`,
            type: "insufficient_quota",
            code: "grant_budget_exhausted",
          },
        }),
        { status: 402, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
      );
    }

    authenticatedUser = {
      id: record.user_id,
      balance_usd: Number(record.balance_usd),
      key_id: record.key_id,
      is_grant: isGrantKey,
    };
  } else if (authHeader && authHeader.startsWith("Bearer vtok_")) {
    // Web Session Token Authentication (from Console or Verxl Chat)
    const rawToken = authHeader.slice(7).trim();
    const payload = await verifySessionToken(rawToken);

    if (!payload || !payload.sub) {
      return new Response(
        JSON.stringify({
          error: {
            message: "Invalid or expired session token. Please re-authenticate at Verxl Console.",
            type: "authentication_error",
            code: "invalid_session",
          },
        }),
        { status: 401, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
      );
    }

    const userRecord = await db.prepare(
      "SELECT id, balance_usd FROM users WHERE id = ?"
    )
      .bind(payload.sub)
      .first<{ id: string; balance_usd: number }>();

    if (!userRecord) {
      return new Response(
        JSON.stringify({
          error: {
            message: "User account not found.",
            type: "authentication_error",
            code: "user_not_found",
          },
        }),
        { status: 404, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
      );
    }

    if (Number(userRecord.balance_usd) <= 0.0) {
      return new Response(
        JSON.stringify({
          error: {
            message: `Insufficient Verxl account balance ($${Number(userRecord.balance_usd).toFixed(4)} USD). Deposit USDC on Arbitrum to continue.`,
            type: "insufficient_quota",
            code: "insufficient_balance",
          },
          help: API_HELP,
        }),
        { status: 402, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
      );
    }

    authenticatedUser = {
      id: userRecord.id,
      balance_usd: Number(userRecord.balance_usd),
      key_id: null,
    };
  } else if (!authHeader) {
    // Missing key: distinct from a supplied-but-wrong key.
    return new Response(
      JSON.stringify({
        error: {
          message: "Missing Authorization header. This endpoint has no anonymous or free inference tier.",
          type: "authentication_error",
          code: "missing_api_key",
        },
        help: API_HELP,
      }),
      { status: 401, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
    );
  } else if (authHeader !== "Bearer vrxl_testnet_demo_key") {
    // A credential was supplied but did not match any active key/session.
    return new Response(
      JSON.stringify({
        error: {
          message: "Invalid or unrecognized Verxl credential. The token was supplied but rejected; this is not a missing-key case.",
          type: "authentication_error",
          code: "invalid_api_key",
        },
        key_fingerprint: keyFingerprint(authHeader),
        help: API_HELP,
      }),
      { status: 401, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
    );
  }

  // Enforcement for free testnet demo tier (Playground)
  const isFreeDemo = !authenticatedUser;
  let demoRateLimitHeaders: Record<string, string> = {};

  if (isFreeDemo) {
    // 1. Model restriction: Playground free demo only allows Qwen. For the rest, one must pay.
    const isQwen =
      rawModel.toLowerCase().includes("qwen") ||
      rawModel.toLowerCase().includes("uncensored") ||
      rawModel === "";

    if (!isQwen) {
      return new Response(
        JSON.stringify({
          error: {
            message: `Model '${rawModel}' requires an authenticated Verxl account with paid USDC balance. The free Playground is reserved strictly for 'qwen3.5-4b-uncensored-64k'. Deposit USDC at https://verxl.com/console or use Verxl Chat at https://verxl.com/chat to access DeepSeek V4.1 Flash and Xiaomi MiMo 2.6 Flash.`,
            type: "insufficient_quota",
            code: "model_payment_required",
          },
          help: API_HELP,
        }),
        { status: 402, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
      );
    }

    // 2. IP Rate Limit: 40 requests per 10 minutes (generous for human testing, blocks automated spam)
    const clientIp =
      request.headers.get("CF-Connecting-IP") ||
      request.headers.get("x-real-ip") ||
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "127.0.0.1";

    const now = Date.now();
    let bucket = ipRateLimitMap.get(clientIp);
    if (!bucket || now > bucket.resetAt) {
      bucket = { count: 1, resetAt: now + DEMO_RATE_LIMIT_WINDOW_MS };
      ipRateLimitMap.set(clientIp, bucket);
    } else {
      bucket.count++;
    }

    // Prune stale entries if map grows large
    if (ipRateLimitMap.size > 5000) {
      for (const [ip, b] of ipRateLimitMap.entries()) {
        if (now > b.resetAt) ipRateLimitMap.delete(ip);
      }
    }

    const remaining = Math.max(0, DEMO_RATE_LIMIT_MAX - bucket.count);
    const resetSec = Math.ceil((bucket.resetAt - now) / 1000);

    demoRateLimitHeaders = {
      "X-RateLimit-Limit": DEMO_RATE_LIMIT_MAX.toString(),
      "X-RateLimit-Remaining": remaining.toString(),
      "X-RateLimit-Reset": resetSec.toString(),
    };

    if (bucket.count > DEMO_RATE_LIMIT_MAX) {
      return new Response(
        JSON.stringify({
          error: {
            message: `Free demo rate limit reached for your IP (${DEMO_RATE_LIMIT_MAX} requests per 10 minutes). Connect your wallet or deposit USDC at https://verxl.com/console to unlock unlimited high-concurrency inference.`,
            type: "rate_limit_error",
            code: "rate_limit_exceeded",
          },
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": resetSec.toString(),
            ...CORS_HEADERS,
            ...demoRateLimitHeaders,
          },
        }
      );
    }
  }

  // 3. Dynamic Real-time Official Model Pricing (UTC Off-Peak aware)
  const nowUtc = new Date();
  const utcDay = nowUtc.getUTCDay(); // 0 = Sunday, 6 = Saturday
  const utcHour = nowUtc.getUTCHours();
  const isWeekend = utcDay === 0 || utcDay === 6;
  // DeepSeek Official Peak: Mon-Fri 01:00-04:00 and 06:00-10:00 UTC (all other times 50% off)
  const isDeepSeekPeak = !isWeekend && ((utcHour >= 1 && utcHour < 4) || (utcHour >= 6 && utcHour < 10));

  let providerId = "bulbasaur-prague-01";
  let promptRatePerM = 0.05;
  let completionRatePerM = 0.10;

  if (requestedModel.includes("mimo")) {
    providerId = "xiao-mimo-bridge-01";
    promptRatePerM = 0.14;
    completionRatePerM = 0.28;
  } else if (requestedModel.includes("deepseek")) {
    providerId = "deepseek-v4-bridge-01";
    promptRatePerM = isDeepSeekPeak ? 0.30 : 0.15;
    completionRatePerM = isDeepSeekPeak ? 1.20 : 0.60;
  } else {
    // Bulbasaur Qwen 3.5 4B Uncensored (Bare-Metal - Flat Rate, No Special Hours)
    providerId = "bulbasaur-prague-01";
    promptRatePerM = 0.05;
    completionRatePerM = 0.10;
  }

  // Institutional Protocol Clearing Headers
  const protocolHeaders: Record<string, string> = {
    ...CORS_HEADERS,
    "X-Verxl-Protocol-Fee-Bps": "50",
    "X-Verxl-Router-Latency-Ms": "4",
    "X-Verxl-Provider-Id": providerId,
    "X-Verxl-Requested-Max-Tokens": String(requestedMaxTokens),
    "X-Verxl-Effective-Max-Tokens": String(maxTokens),
    "X-Verxl-Min-Tokens-Applied": minTokensApplied ? "true" : "false",
    "X-Verxl-Clearing-Status": "SETTLED",
    "X-Verxl-DAO-Vault": "0xf0e51fB0FFBD8ef36281b6f643E0f7953BD5111a",
    ...demoRateLimitHeaders,
  };

  const estimatedPromptTokens = Math.max(16, Math.ceil(JSON.stringify(messages).length / 4));

  // 4. Upstream Endpoints (Dynamically retrieved from secure PostgreSQL providers table)
  let upstreamGatewayKey = (context.env as any)?.UPSTREAM_GATEWAY_KEY || "";
  if (!upstreamGatewayKey) {
    if (upstreamGatewayKeyCache && upstreamGatewayKeyCache.expiresAt > Date.now()) {
      upstreamGatewayKey = upstreamGatewayKeyCache.value;
    } else {
      try {
        const row = await db.prepare("SELECT api_key FROM providers WHERE id = 'deepseek-v4-bridge-01'").first<{ api_key: string }>();
        upstreamGatewayKey = row?.api_key || "";
        if (upstreamGatewayKey) {
          upstreamGatewayKeyCache = { value: upstreamGatewayKey, expiresAt: Date.now() + 300_000 };
        }
      } catch {
        // fallback
      }
    }
  }
  const rawSession = request.headers.get("x-opencode-session");
  const opencodeSessionId = rawSession && rawSession.startsWith("ses_")
    ? rawSession
    : `ses_${crypto.randomUUID().replace(/-/g, "")}`;

  let upstreamEndpoints: Array<{ url: string; headers: Record<string, string>; modelName: string; timeoutMs?: number }> = [];

  if (requestedModel.includes("mimo") || requestedModel.includes("deepseek")) {
    const upstreamModel = requestedModel.includes("mimo")
      ? "mimo-v2.6-flash"
      : "deepseek-v4.1-flash";

    upstreamEndpoints = [
      {
        url: "https://opencode.ai/zen/go/v1/chat/completions",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${upstreamGatewayKey}`,
          "x-opencode-session": opencodeSessionId,
        },
        modelName: upstreamModel,
        timeoutMs: 12000,
      },
      {
        url: "https://opencode.ai/zen/v1/chat/completions",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${upstreamGatewayKey}`,
          "x-opencode-session": opencodeSessionId,
        },
        modelName: upstreamModel,
        timeoutMs: 12000,
      },
    ];
  } else {
    // Bulbasaur / Qwen resident 64k cluster — Dedicated Bare-Metal Bulbasaur Node via direct Edge Tunnel
    upstreamEndpoints = [
      {
        url: "https://node1.verxl.com/v1/chat/completions",
        headers: {
          "Content-Type": "application/json",
        },
        modelName: "qwen3.5-4b-uncensored-64k:latest",
        timeoutMs: 60000,
      },
    ];
  }

  for (const ep of upstreamEndpoints) {
    try {
      const upstreamController = new AbortController();
      const timeoutId = setTimeout(() => upstreamController.abort(), ep.timeoutMs || 10000);

      const upstreamPayload = JSON.stringify({
        model: ep.modelName,
        messages,
        temperature,
        max_tokens: maxTokens,
        stream,
        ...(Array.isArray((body as any).tools) ? { tools: (body as any).tools } : {}),
        ...(typeof (body as any).tool_choice === "string"
          ? { tool_choice: (body as any).tool_choice }
          : {}),
        // Qwen uses none; DeepSeek/MiMo receive the selected think level.
        ...(typeof (body as any).reasoning_effort === "string"
          ? { reasoning_effort: (body as any).reasoning_effort }
          : {}),
      });

      const upstreamResponse = await fetch(ep.url, {
        method: "POST",
        headers: ep.headers,
        body: upstreamPayload,
        signal: upstreamController.signal,
      });

      clearTimeout(timeoutId);

      if (upstreamResponse.ok && upstreamResponse.body) {
        if (stream) {
          let completionTokenCount = 0;
          const textDecoder = new TextDecoder();
          const textEncoder = new TextEncoder();
          let sseBuffer = "";

          const normalizeStreamEvent = (event: string) => {
            const lines = event.split("\n");
            const out = lines.map((line) => {
              if (!line.startsWith("data: ") || line === "data: [DONE]") return line;
              try {
                const obj = JSON.parse(line.slice(6));
                delete obj.system_fingerprint;
                delete obj.opencode;
                if (Array.isArray(obj.choices)) {
                  for (const choice of obj.choices) {
                    for (const target of [choice?.delta, choice?.message]) {
                      if (target && target.reasoning && !target.reasoning_content) {
                        target.reasoning_content = target.reasoning;
                      }
                      if (target) delete target.reasoning;
                    }
                  }
                }
                completionTokenCount++;
                return `data: ${JSON.stringify(obj)}`;
              } catch {
                return line;
              }
            });
            return out.join("\n");
          };

          const transformStream = new TransformStream({
            transform(chunk, controller) {
              sseBuffer += textDecoder.decode(chunk, { stream: true });
              const events = sseBuffer.split("\n\n");
              sseBuffer = events.pop() || "";
              for (const event of events) {
                controller.enqueue(textEncoder.encode(normalizeStreamEvent(event) + "\n\n"));
              }
            },
            flush(controller) {
              if (sseBuffer.trim()) {
                controller.enqueue(textEncoder.encode(normalizeStreamEvent(sseBuffer) + "\n\n"));
                sseBuffer = "";
              }
              if (authenticatedUser) {
                const actualTokens = Math.max(4, completionTokenCount);
                const computeCost =
                  (estimatedPromptTokens / 1e6) * promptRatePerM +
                  (actualTokens / 1e6) * completionRatePerM;
                const fee = computeCost * 0.005; // 50 bps protocol fee
                const totalDeduction = computeCost + fee;
                const providerNet = computeCost;

                if (authenticatedUser.is_grant && authenticatedUser.key_id) {
                  // Admin Free Grant Key: zero user cost deduction, but record usage on key & DB
                  context.waitUntil(
                    Promise.all([
                      db.prepare(
                        "UPDATE api_keys SET total_spent_usd = total_spent_usd + ? WHERE id = ?"
                      )
                        .bind(totalDeduction, authenticatedUser.key_id)
                        .run(),
                      db.prepare(
                        "UPDATE providers SET pending_payout_usd = pending_payout_usd + ?, total_earned_usd = total_earned_usd + ? WHERE id = ?"
                      )
                        .bind(providerNet, providerNet, providerId)
                        .run(),
                      db.prepare(
                        "INSERT INTO usage_records (id, user_id, api_key_id, provider_id, model, prompt_tokens, completion_tokens, total_cost_usd, protocol_fee_usd, provider_revenue_usd, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)"
                      )
                        .bind(
                          `usg_${crypto.randomUUID()}`,
                          authenticatedUser.id,
                          authenticatedUser.key_id,
                          providerId,
                          requestedModel,
                          estimatedPromptTokens,
                          actualTokens,
                          totalDeduction,
                          fee,
                          providerNet
                        )
                        .run(),
                    ])
                  );
                } else {
                  // Standard Key / Session: deduct from user balance
                  context.waitUntil(
                    Promise.all([
                      db.prepare(
                        "UPDATE users SET balance_usd = GREATEST(0, balance_usd - ?), total_spent_usd = total_spent_usd + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
                      )
                        .bind(totalDeduction, totalDeduction, authenticatedUser.id)
                        .run(),
                      db.prepare(
                        "UPDATE providers SET pending_payout_usd = pending_payout_usd + ?, total_earned_usd = total_earned_usd + ? WHERE id = ?"
                      )
                        .bind(providerNet, providerNet, providerId)
                        .run(),
                      db.prepare(
                        "INSERT INTO usage_records (id, user_id, api_key_id, provider_id, model, prompt_tokens, completion_tokens, total_cost_usd, protocol_fee_usd, provider_revenue_usd, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)"
                      )
                        .bind(
                          `usg_${crypto.randomUUID()}`,
                          authenticatedUser.id,
                          authenticatedUser.key_id || null,
                          providerId,
                          requestedModel,
                          estimatedPromptTokens,
                          actualTokens,
                          totalDeduction,
                          fee,
                          providerNet
                        )
                        .run(),
                    ])
                  );
                }
              }
            },
          });

          return new Response(upstreamResponse.body.pipeThrough(transformStream), {
            status: 200,
            headers: {
              "Content-Type": "text/event-stream; charset=utf-8",
              "Cache-Control": "no-cache",
              Connection: "keep-alive",
              ...protocolHeaders,
            },
          });
        } else {
          const json = (await upstreamResponse.json()) as Record<string, any>;
          const completionTokens = json.usage?.completion_tokens || 32;
          const promptTokens = json.usage?.prompt_tokens || estimatedPromptTokens;
          const computeCost =
            (promptTokens / 1e6) * promptRatePerM +
            (completionTokens / 1e6) * completionRatePerM;
          const fee = computeCost * 0.005;
          const totalDeduction = computeCost + fee;
          const providerNet = computeCost;

          if (authenticatedUser) {
            if (authenticatedUser.is_grant && authenticatedUser.key_id) {
              // Admin Free Grant Key: zero user cost deduction, but record usage on key & DB
              context.waitUntil(
                Promise.all([
                  db.prepare(
                    "UPDATE api_keys SET total_spent_usd = total_spent_usd + ? WHERE id = ?"
                  )
                    .bind(totalDeduction, authenticatedUser.key_id)
                    .run(),
                  db.prepare(
                    "UPDATE providers SET pending_payout_usd = pending_payout_usd + ?, total_earned_usd = total_earned_usd + ? WHERE id = ?"
                  )
                    .bind(providerNet, providerNet, providerId)
                    .run(),
                  db.prepare(
                    "INSERT INTO usage_records (id, user_id, api_key_id, provider_id, model, prompt_tokens, completion_tokens, total_cost_usd, protocol_fee_usd, provider_revenue_usd, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)"
                  )
                    .bind(
                      `usg_${crypto.randomUUID()}`,
                      authenticatedUser.id,
                      authenticatedUser.key_id,
                      providerId,
                      requestedModel,
                      promptTokens,
                      completionTokens,
                      totalDeduction,
                      fee,
                      providerNet
                    )
                    .run(),
                ])
              );
            } else {
              // Standard Key / Session: deduct from user balance
              context.waitUntil(
                Promise.all([
                  db.prepare(
                    "UPDATE users SET balance_usd = GREATEST(0, balance_usd - ?), total_spent_usd = total_spent_usd + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
                  )
                    .bind(totalDeduction, totalDeduction, authenticatedUser.id)
                    .run(),
                  db.prepare(
                    "UPDATE providers SET pending_payout_usd = pending_payout_usd + ?, total_earned_usd = total_earned_usd + ? WHERE id = ?"
                  )
                    .bind(providerNet, providerNet, providerId)
                    .run(),
                  db.prepare(
                    "INSERT INTO usage_records (id, user_id, api_key_id, provider_id, model, prompt_tokens, completion_tokens, total_cost_usd, protocol_fee_usd, provider_revenue_usd, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)"
                  )
                    .bind(
                      `usg_${crypto.randomUUID()}`,
                      authenticatedUser.id,
                      authenticatedUser.key_id || null,
                      providerId,
                      requestedModel,
                      promptTokens,
                      completionTokens,
                      totalDeduction,
                      fee,
                      providerNet
                    )
                    .run(),
                ])
              );
            }
          }

          const normalizedChoices = Array.isArray(json.choices)
            ? json.choices.map((choice: any) => {
                const message = choice?.message || {};
                const { reasoning, ...restMessage } = message;
                return {
                  ...choice,
                  message: {
                    ...restMessage,
                    ...(message.reasoning_content ? { reasoning_content: message.reasoning_content } : reasoning ? { reasoning_content: reasoning } : {}),
                  },
                };
              })
            : json.choices;

          const normalized: any = {
            ...json,
            model: requestedModel,
            choices: normalizedChoices,
            usage: {
              ...(json.usage || {}),
              cost: totalDeduction,
              cost_usd: totalDeduction,
              currency: "USD",
            },
            verxl_clearing: {
              protocol_fee_bps: 50,
              clearing_status: "SETTLED",
              selected_node: providerId,
              cost_usd: totalDeduction,
              prompt_tokens: promptTokens,
              completion_tokens: completionTokens,
              requested_max_tokens: requestedMaxTokens,
              effective_max_tokens: maxTokens,
              min_tokens_applied: minTokensApplied,
            },
          };
          delete normalized.system_fingerprint;
          delete normalized.opencode;

          return new Response(JSON.stringify(normalized), {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              ...protocolHeaders,
            },
          });
        }
      }
    } catch (err: any) {
      // Continue to next upstream if available
    }
  }

  // No canned answer. If every upstream fails, say so.
  return new Response(
    JSON.stringify({
      error: {
        message: "All upstream inference nodes failed. No answer was generated.",
        type: "upstream_error",
        code: "upstream_unavailable",
      },
    }),
    { status: 502, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
  );
};
