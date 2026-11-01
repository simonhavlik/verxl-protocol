// Cloudflare Pages Function: /mcp
// Remote MCP server (Streamable HTTP, JSON responses). Discovery and account
// setup are public. Inference is paid and always requires a Verxl API key.
interface Env {}

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, Mcp-Session-Id, MCP-Protocol-Version",
  "Access-Control-Expose-Headers": "Mcp-Session-Id, MCP-Protocol-Version",
};

const DOCS = "https://verxl.com/docs";
const OPENAPI = "https://verxl.com/openapi.json";
const LLMS = "https://verxl.com/llms.txt";
const CONSOLE = "https://verxl.com/console";
const MODELS = "https://verxl.com/v1/models";
const CHAT = "https://verxl.com/v1/chat/completions";

const INSTRUCTIONS = `Verxl is a paid OpenAI-compatible inference API. There is no free compute tier.

To use inference:
1. Ask the user to open ${CONSOLE} and connect a wallet.
2. Deposit USDC on Arbitrum (minimum $1) and create an API key.
3. Pass the key as Authorization: Bearer vrxl_live_... to ${CHAT}, or to the verxl_chat MCP tool.

Public with no key: ${MODELS}, ${OPENAPI}, ${LLMS}, ${DOCS}, and GET /api/health.
Never invent, guess or reuse another user's key. A missing key returns 401; an unfunded key returns 402.`;

function json(body: unknown, status = 200, extra: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS, ...extra },
  });
}

function rpcResult(id: string | number | null, result: unknown) {
  return json({ jsonrpc: "2.0", id, result });
}

function rpcError(id: string | number | null, code: number, message: string) {
  return json({ jsonrpc: "2.0", id, error: { code, message } });
}

const TOOLS = [
  {
    name: "verxl_get_started",
    description: "Start here. Returns the exact steps to get a funded Verxl API key, public discovery URLs, and the no-free-compute policy. Use this before asking the user for anything.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "verxl_list_models",
    description: "Public. Returns Verxl's OpenAI-compatible model list, context windows, published token prices and docs links. No API key required.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "verxl_get_api_key",
    description: "Returns the one-click console URL and the three user steps to create and fund a Verxl API key. The MCP server cannot create or fund a key by itself; the user must approve the wallet deposit.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "verxl_payment_instructions",
    description: "Returns the current deposit configuration (treasury, chain, token, minimum) and the console link. Use this to explain payment to the user. The MCP server cannot sign or send an on-chain transaction.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "verxl_chat",
    description: "Authenticated inference through Verxl. Requires a funded vrxl_live_... key supplied by the user; there is no free tier. Returns the assistant text and token usage.",
    inputSchema: {
      type: "object",
      properties: {
        api_key: { type: "string", description: "The user's funded Verxl API key (vrxl_live_...). Never invent one." },
        model: { type: "string", enum: ["qwen3.5-4b-uncensored-64k", "deepseek-v4.1-flash", "mimo-v2.6-flash"] },
        messages: {
          type: "array",
          minItems: 1,
          items: {
            type: "object",
            properties: {
              role: { type: "string", enum: ["system", "user", "assistant"] },
              content: { type: "string" },
            },
            required: ["role", "content"],
            additionalProperties: false,
          },
        },
        max_tokens: { type: "integer", minimum: 1, maximum: 32768, default: 512 },
        temperature: { type: "number", minimum: 0, maximum: 2, default: 0.7 },
        think: { oneOf: [{ type: "boolean" }, { type: "string", enum: ["off", "low", "medium", "high", "max"] }], description: "Caller-controlled thinking. false/off disables; true/medium enables." },
        reasoning_effort: { type: "string", enum: ["none", "minimal", "low", "medium", "high", "xhigh", "max"], description: "Alias for think; think takes precedence." },
      },
      required: ["api_key", "model", "messages"],
      additionalProperties: false,
    },
  },
];

function textContent(value: unknown) {
  return { content: [{ type: "text", text: typeof value === "string" ? value : JSON.stringify(value, null, 2) }] };
}

async function publicJson(url: string) {
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  const body = await res.text();
  return { status: res.status, body };
}

async function callTool(name: string, args: any) {
  if (name === "verxl_get_started") {
    return textContent({
      product: "Verxl Protocol",
      api: CHAT,
      models: MODELS,
      docs: DOCS,
      openapi: OPENAPI,
      llms: LLMS,
      console: CONSOLE,
      mcp: "https://verxl.com/mcp",
      no_free_compute: true,
      steps: [
        `Ask the user to open ${CONSOLE}.`,
        "Connect a wallet, deposit USDC on Arbitrum (minimum $1), and create an API key.",
        "Use that key as Authorization: Bearer vrxl_live_... against POST /v1/chat/completions, or pass it to verxl_chat.",
      ],
      public_reads: ["GET /v1/models", "GET /openapi.json", "GET /llms.txt", "GET /api/health", "GET /docs"],
      warning: "Do not claim free credits or invent a key. Inference without a funded key returns 401/402.",
    });
  }

  if (name === "verxl_list_models") {
    const r = await publicJson(MODELS);
    return { content: [{ type: "text", text: r.body }], isError: r.status >= 400 };
  }

  if (name === "verxl_get_api_key") {
    return textContent({
      console: CONSOLE,
      steps: [
        "Open the console in a browser.",
        "Connect a wallet and deposit USDC on Arbitrum (minimum $1).",
        "Create the API key and copy it once into the agent's secret store.",
      ],
      docs: DOCS,
      note: "The user must complete the wallet approval. The MCP server cannot create or fund keys.",
    });
  }

  if (name === "verxl_payment_instructions") {
    const r = await publicJson("https://verxl.com/api/deposit/config");
    return textContent({
      deposit_config: (() => { try { return JSON.parse(r.body); } catch { return r.body; } })(),
      console: CONSOLE,
      note: "The user signs and sends the deposit from their own wallet. The MCP server never holds funds or private keys.",
    });
  }

  if (name === "verxl_chat") {
    if (!args || typeof args.api_key !== "string" || !args.api_key.startsWith("vrxl_live_")) {
      return textContent({
        error: "A funded vrxl_live_... key is required.",
        get_key: CONSOLE,
        docs: DOCS,
        note: "Do not invent a key. Ask the user to create and fund one at the console.",
      });
    }
    if (!Array.isArray(args.messages) || args.messages.length === 0) {
      return textContent({ error: "messages must be a non-empty array.", docs: DOCS });
    }
    const res = await fetch(CHAT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${args.api_key}` },
      body: JSON.stringify({
        model: args.model,
        messages: args.messages,
        max_tokens: args.max_tokens ?? 512,
        temperature: args.temperature ?? 0.7,
        ...(args.think !== undefined ? { think: args.think } : {}),
        ...(typeof args.reasoning_effort === "string" ? { reasoning_effort: args.reasoning_effort } : {}),
        stream: false,
      }),
    });
    const body = await res.text();
    if (!res.ok) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            status: res.status,
            upstream: (() => { try { return JSON.parse(body); } catch { return body; } })(),
            get_key: CONSOLE,
            docs: DOCS,
            note: res.status === 401 ? "Missing or invalid key; ask the user for a funded key." :
                  res.status === 402 ? "The key has no funded balance; ask the user to top up at the console." :
                  "Inference failed; return the upstream error to the user.",
          }, null, 2),
        }],
        isError: true,
      };
    }
    const parsed = (() => { try { return JSON.parse(body); } catch { return null; } })();
    const content = parsed?.choices?.[0]?.message?.content ?? body;
    return textContent({ content, usage: parsed?.usage ?? null, model: parsed?.model ?? args.model });
  }

  return textContent({ error: `Unknown tool: ${name}`, docs: DOCS });
}

export const onRequestOptions: PagesFunction<Env> = async () => new Response(null, { status: 204, headers: CORS_HEADERS });

export const onRequestGet: PagesFunction<Env> = async () => json({
  name: "verxl",
  description: "Verxl Protocol remote MCP server",
  transport: "streamable-http",
  endpoint: "https://verxl.com/mcp",
  docs: DOCS,
  no_free_compute: true,
  tools: TOOLS.map((t) => t.name),
});

export const onRequestPost: PagesFunction<Env> = async (context) => {
  let msg: any;
  try {
    msg = await context.request.json();
  } catch {
    return rpcError(null, -32700, "Parse error");
  }

  const id = msg?.id ?? null;
  const method = msg?.method;
  const params = msg?.params ?? {};

  if (typeof method !== "string") return rpcError(id, -32600, "Invalid Request");

  if (method === "notifications/initialized" || method === "notifications/cancelled") {
    return new Response(null, { status: 202, headers: CORS_HEADERS });
  }

  if (method === "initialize") {
    return rpcResult(id, {
      protocolVersion: params?.protocolVersion || "2025-03-26",
      capabilities: { tools: { listChanged: false } },
      serverInfo: { name: "verxl", version: "1.0.0" },
      instructions: INSTRUCTIONS,
    });
  }

  if (method === "ping") return rpcResult(id, {});

  if (method === "tools/list") return rpcResult(id, { tools: TOOLS });

  if (method === "tools/call") {
    const name = params?.name;
    if (typeof name !== "string") return rpcError(id, -32602, "Tool name required");
    try {
      return rpcResult(id, await callTool(name, params?.arguments ?? {}));
    } catch (err: any) {
      return rpcResult(id, textContent({ error: err?.message || "Tool failed", docs: DOCS }));
    }
  }

  return rpcError(id, -32601, `Method not found: ${method}`);
};
