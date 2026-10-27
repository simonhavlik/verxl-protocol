import { CORS_HEADERS, signSessionToken, verifySessionToken } from "../lib/auth";
import { db } from "../lib/db";

interface Env {}

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request } = context;

  const authHeader = request.headers.get("Authorization");
  const rawToken = authHeader && authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;

  try {
    // 1. If valid session already exists, top up evaluation grant
    if (rawToken && rawToken.startsWith("vtok_")) {
      const payload = await verifySessionToken(rawToken);
      if (payload && payload.sub) {
        const user = await db.prepare(
          "SELECT id, email, balance_usd FROM users WHERE id = ?"
        )
          .bind(payload.sub)
          .first<{ id: string; email: string; balance_usd: number }>();

        if (user) {
          const grantAmount = 1.00;
          await db.prepare(
            "UPDATE users SET balance_usd = balance_usd + ?, total_deposited_usd = total_deposited_usd + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
          )
            .bind(grantAmount, grantAmount, user.id)
            .run();

          const updated = await db.prepare(
            "SELECT id, email, balance_usd FROM users WHERE id = ?"
          )
            .bind(user.id)
            .first<{ id: string; email: string; balance_usd: number }>();

          return new Response(
            JSON.stringify({
              success: true,
              message: "Academic Evaluation Grant ($1.00 USD) credited successfully.",
              token: rawToken,
              user: {
                id: updated?.id,
                email: updated?.email,
                balance_usd: Number(updated?.balance_usd || 1.00),
              },
            }),
            { status: 200, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
          );
        }
      }
    }

    // 2. Otherwise create a new evaluator session with $1.00 grant
    let body: any = {};
    try {
      body = await request.json();
    } catch {}

    const randomSuffix = Math.random().toString(36).substring(2, 7);
    const email = typeof body.email === "string" && body.email.includes("@")
      ? body.email.trim().toLowerCase()
      : `evaluator-${randomSuffix}@vse.cz`;

    const userId = `usr_eval_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
    const initialGrant = 1.00;

    await db.prepare(
      "INSERT INTO users (id, email, balance_usd, total_deposited_usd, total_spent_usd, created_at, updated_at) VALUES (?, ?, ?, ?, 0.0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)"
    )
      .bind(userId, email, initialGrant, initialGrant)
      .run();

    const sessionToken = await signSessionToken({
      sub: userId,
      email,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "New Academic Evaluation Session generated with $1.00 USD initial credit.",
        token: sessionToken,
        user: {
          id: userId,
          email,
          balance_usd: initialGrant,
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        error: "Failed to process grant.",
        details: err?.message || String(err),
      }),
      { status: 500, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
    );
  }
};
