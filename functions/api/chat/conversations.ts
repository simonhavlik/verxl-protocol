import { CORS_HEADERS, hashSha256, verifySessionToken } from "../lib/auth";
import { db } from "../lib/db";

interface Env {}

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
};

// Helper: Authenticate user via session token (Bearer vtok_...) or live key (Bearer vrxl_live_...)
async function authenticateUser(request: Request): Promise<{ id: string; email: string } | null> {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.slice(7).trim();

  if (token.startsWith("vtok_")) {
    const payload = await verifySessionToken(token);
    if (!payload || !payload.sub) return null;
    const user = await db.prepare("SELECT id, email FROM users WHERE id = ?")
      .bind(payload.sub)
      .first<{ id: string; email: string }>();
    return user || null;
  }

  if (token.startsWith("vrxl_live_") || token.startsWith("vrxl_grant_")) {
    const keyHash = await hashSha256(token);
    const keyRecord = await db.prepare(
      "SELECT u.id, u.email FROM api_keys k JOIN users u ON k.user_id = u.id WHERE k.key_hash = ? AND k.is_active = 1"
    )
      .bind(keyHash)
      .first<{ id: string; email: string }>();
    return keyRecord || null;
  }

  return null;
}

// GET /api/chat/conversations - Load all conversations for authenticated user from PostgreSQL
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request } = context;
  const user = await authenticateUser(request);

  if (!user) {
    return new Response(JSON.stringify({ error: "Authentication required", conversations: [] }), {
      status: 401,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  const { results: rows } = await db.prepare(
    "SELECT id, title, model, system_prompt, messages, created_at, updated_at FROM chat_conversations WHERE user_id = ? ORDER BY updated_at DESC"
  )
    .bind(user.id)
    .all();

  const conversations = (rows || []).map((r: any) => ({
    id: r.id,
    title: r.title,
    model: r.model,
    systemPrompt: r.system_prompt,
    messages: typeof r.messages === "string" ? JSON.parse(r.messages) : r.messages,
    createdAt: new Date(r.created_at).getTime(),
    updatedAt: new Date(r.updated_at).getTime(),
  }));

  return new Response(JSON.stringify({ success: true, conversations }), {
    status: 200,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
};

// POST /api/chat/conversations - Upsert/save conversation to PostgreSQL bound to user account
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request } = context;
  const user = await authenticateUser(request);

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
    return new Response(JSON.stringify({ error: "Invalid JSON payload" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  const { id, title, model, systemPrompt, messages } = body;
  if (!id || typeof id !== "string") {
    return new Response(JSON.stringify({ error: "Valid conversation id is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  const conversationTitle = (title && typeof title === "string" ? title.trim() : "New Chat").slice(0, 255);
  const conversationModel = model && typeof model === "string" ? model.trim() : "qwen3.5-4b-uncensored-32k";
  const conversationSystemPrompt = typeof systemPrompt === "string" ? systemPrompt : null;
  const messagesJson = JSON.stringify(Array.isArray(messages) ? messages : []);

  // Check if conversation exists
  const existing = await db.prepare("SELECT id, user_id FROM chat_conversations WHERE id = ?")
    .bind(id)
    .first<{ id: string; user_id: string }>();

  if (existing) {
    if (existing.user_id !== user.id) {
      return new Response(JSON.stringify({ error: "Not authorized for this conversation" }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      });
    }

    await db.prepare(`
      UPDATE chat_conversations
      SET title = ?,
          model = ?,
          system_prompt = ?,
          messages = ?::jsonb,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `).bind(
      conversationTitle,
      conversationModel,
      conversationSystemPrompt,
      messagesJson,
      id,
      user.id
    ).run();
  } else {
    await db.prepare(`
      INSERT INTO chat_conversations (
        id, user_id, title, model, system_prompt, messages, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?::jsonb, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
    `).bind(
      id,
      user.id,
      conversationTitle,
      conversationModel,
      conversationSystemPrompt,
      messagesJson
    ).run();
  }

  return new Response(JSON.stringify({ success: true, id }), {
    status: 200,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
};

// DELETE /api/chat/conversations - Delete conversation or clear all for user
export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const { request } = context;
  const user = await authenticateUser(request);

  if (!user) {
    return new Response(JSON.stringify({ error: "Authentication required" }), {
      status: 401,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  const url = new URL(request.url);
  const convId = url.searchParams.get("id");

  if (!convId) {
    return new Response(JSON.stringify({ error: "Missing conversation id" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  if (convId === "all") {
    await db.prepare("DELETE FROM chat_conversations WHERE user_id = ?").bind(user.id).run();
  } else {
    await db.prepare("DELETE FROM chat_conversations WHERE id = ? AND user_id = ?").bind(convId, user.id).run();
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
};
