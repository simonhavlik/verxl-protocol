import { CORS_HEADERS, hashSha256, verifySessionToken } from "../lib/auth";
import { db } from "../lib/db";

interface Env {}

const MAX_CIPHERTEXT_BYTES = 4_000_000;

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
};

// Authenticate via session token (Bearer vtok_...) or live API key.
async function authenticateUser(request: Request): Promise<{ id: string; email: string } | null> {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7).trim();

  if (token.startsWith("vtok_")) {
    const payload = await verifySessionToken(token);
    if (!payload || !payload.sub) return null;
    const user = await db
      .prepare("SELECT id, email FROM users WHERE id = ?")
      .bind(payload.sub)
      .first<{ id: string; email: string }>();
    return user || null;
  }

  if (token.startsWith("vrxl_live_") || token.startsWith("vrxl_grant_")) {
    const keyHash = await hashSha256(token);
    const keyRecord = await db
      .prepare(
        "SELECT u.id, u.email FROM api_keys k JOIN users u ON k.user_id = u.id WHERE k.key_hash = ? AND k.is_active = 1"
      )
      .bind(keyHash)
      .first<{ id: string; email: string }>();
    return keyRecord || null;
  }

  return null;
}

// GET /api/chat/conversations - Return ciphertext envelopes only.
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const user = await authenticateUser(context.request);
  if (!user) {
    return new Response(JSON.stringify({ error: "Authentication required", conversations: [] }), {
      status: 401,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  const { results: rows } = await db
    .prepare(
      "SELECT id, ciphertext, key_id, created_at, updated_at FROM chat_conversations WHERE user_id = ? ORDER BY updated_at DESC"
    )
    .bind(user.id)
    .all();

  const conversations = (rows || []).map((r: any) => ({
    id: r.id,
    ciphertext: r.ciphertext,
    keyId: r.key_id,
    createdAt: new Date(r.created_at).getTime(),
    updatedAt: new Date(r.updated_at).getTime(),
  }));

  return new Response(JSON.stringify({ success: true, conversations }), {
    status: 200,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
};

// POST /api/chat/conversations - Upsert a client-encrypted conversation.
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const user = await authenticateUser(context.request);
  if (!user) {
    return new Response(JSON.stringify({ error: "Authentication required" }), {
      status: 401,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  let body: any;
  try {
    body = await context.request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON payload" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  const { id, ciphertext, keyId } = body;
  if (typeof id !== "string" || id.length < 4 || id.length > 128) {
    return new Response(JSON.stringify({ error: "Valid conversation id is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }
  if (
    typeof ciphertext !== "string" ||
    ciphertext.length < 24 ||
    ciphertext.length > MAX_CIPHERTEXT_BYTES ||
    !(ciphertext.startsWith("v1.") || ciphertext.startsWith("v2."))
  ) {
    return new Response(JSON.stringify({ error: "Encrypted conversation payload is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }
  if (typeof keyId !== "string" || !/^0x[a-fA-F0-9]{40}$/.test(keyId)) {
    return new Response(JSON.stringify({ error: "Valid wallet key id is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  const normalizedKeyId = keyId.toLowerCase();
  try {
    const existing = await db
      .prepare("SELECT id, user_id FROM chat_conversations WHERE id = ?")
      .bind(id)
      .first<{ id: string; user_id: string }>();

    if (existing) {
      if (existing.user_id !== user.id) {
        return new Response(JSON.stringify({ error: "Not authorized for this conversation" }), {
          status: 403,
          headers: { "Content-Type": "application/json", ...CORS_HEADERS },
        });
      }
      await db
        .prepare(
          `UPDATE chat_conversations
           SET ciphertext = ?, key_id = ?, updated_at = CURRENT_TIMESTAMP
           WHERE id = ? AND user_id = ?`
        )
        .bind(ciphertext, normalizedKeyId, id, user.id)
        .run();
    } else {
      await db
        .prepare(
          `INSERT INTO chat_conversations (id, user_id, ciphertext, key_id, created_at, updated_at)
           VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
        )
        .bind(id, user.id, ciphertext, normalizedKeyId)
        .run();
    }
  } catch (err: any) {
    console.error("chat conversation save failed", err);
    return new Response(
      JSON.stringify({ error: err?.message || "Could not persist encrypted conversation" }),
      { status: 500, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
    );
  }

  return new Response(JSON.stringify({ success: true, id }), {
    status: 200,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
};

// DELETE /api/chat/conversations - Delete conversation or clear all for the user.
export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const user = await authenticateUser(context.request);
  if (!user) {
    return new Response(JSON.stringify({ error: "Authentication required" }), {
      status: 401,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  const url = new URL(context.request.url);
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
    await db
      .prepare("DELETE FROM chat_conversations WHERE id = ? AND user_id = ?")
      .bind(convId, user.id)
      .run();
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
};
