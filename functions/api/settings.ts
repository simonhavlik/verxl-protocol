import { CORS_HEADERS, hashSha256, verifySessionToken } from "./lib/auth";
import { db } from "./lib/db";
import { readChatSettings, writeChatSettings, type ChatSettings } from "./lib/chat-settings";

interface Env {}

async function authenticate(request: Request): Promise<{ id: string } | null> {
  const auth = request.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  const token = auth.slice(7).trim();
  if (token.startsWith("vtok_")) {
    const payload = await verifySessionToken(token);
    if (!payload?.sub) return null;
    return db.prepare("SELECT id FROM users WHERE id = ?").bind(payload.sub).first<{ id: string }>();
  }
  if (token.startsWith("vrxl_live_") || token.startsWith("vrxl_grant_")) {
    const keyHash = await hashSha256(token);
    return db
      .prepare("SELECT u.id FROM api_keys k JOIN users u ON k.user_id = u.id WHERE k.key_hash = ? AND k.is_active = 1")
      .bind(keyHash)
      .first<{ id: string }>();
  }
  return null;
}

const validThink = (v: unknown): v is ChatSettings["think"] =>
  typeof v === "string" && ["off", "low", "medium", "high"].includes(v);
const validProvider = (v: unknown): v is ChatSettings["searchProvider"] =>
  typeof v === "string" && ["firecrawl", "exa", "brave", "custom"].includes(v);

export const onRequestOptions: PagesFunction<Env> = async () =>
  new Response(null, { status: 204, headers: CORS_HEADERS });

export const onRequestGet: PagesFunction<Env> = async ({ request }) => {
  const user = await authenticate(request);
  if (!user) {
    return new Response(JSON.stringify({ error: "Authentication required" }), {
      status: 401,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }
  try {
    const settings = await readChatSettings(user.id);
    return new Response(JSON.stringify({ success: true, settings }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || "Could not read settings" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }
};

export const onRequestPut: PagesFunction<Env> = async ({ request }) => {
  const user = await authenticate(request);
  if (!user) {
    return new Response(JSON.stringify({ error: "Authentication required" }), {
      status: 401,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
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
  const settings: ChatSettings = {
    think: validThink(body.think) ? body.think : "medium",
    searchProvider: validProvider(body.searchProvider) ? body.searchProvider : "firecrawl",
    searchKey: typeof body.searchKey === "string" ? body.searchKey.trim().slice(0, 512) : "",
    searchBaseUrl: typeof body.searchBaseUrl === "string" ? body.searchBaseUrl.trim().slice(0, 500) : "",
    searchTool: body.searchTool !== false,
  };
  try {
    await writeChatSettings(user.id, settings);
    return new Response(JSON.stringify({ success: true, settings }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || "Could not save settings" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }
};
