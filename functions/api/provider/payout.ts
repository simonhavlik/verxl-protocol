import { CORS_HEADERS } from "../lib/auth";
import { db } from "../lib/db";

interface Env {}

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
};

// GET /api/provider/payout?provider_id=...
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request } = context;
  const url = new URL(request.url);
  const providerId = url.searchParams.get("provider_id");

  if (!providerId) {
    // Return all providers summary
    const allProviders = await db.prepare(
      "SELECT id, name, payout_address, total_earned_usd, pending_payout_usd, created_at FROM providers"
    ).all();

    return new Response(
      JSON.stringify({ providers: allProviders.results }),
      { status: 200, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
    );
  }

  const provider = await db.prepare(
    "SELECT id, name, payout_address, total_earned_usd, pending_payout_usd, created_at FROM providers WHERE id = ?"
  )
    .bind(providerId)
    .first();

  if (!provider) {
    return new Response(
      JSON.stringify({ error: `Provider '${providerId}' not found in registry.` }),
      { status: 404, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
    );
  }

  const history = await db.prepare(
    "SELECT id, recipient_address, amount_usd, status, created_at FROM payout_requests WHERE provider_id = ? ORDER BY created_at DESC"
  )
    .bind(providerId)
    .all();

  return new Response(
    JSON.stringify({
      provider,
      min_payout_usd: 1.0,
      protocol_fee_bps: 50,
      payout_history: history.results,
    }),
    { status: 200, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
  );
};

// POST /api/provider/payout
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request } = context;

  let body: any;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON payload" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  const providerId = typeof body.provider_id === "string" ? body.provider_id.trim() : "";
  const requestedAmount = typeof body.amount_usd === "number" ? body.amount_usd : parseFloat(body.amount_usd);
  const payoutAddress = typeof body.payout_address === "string" ? body.payout_address.trim() : "";

  if (!providerId) {
    return new Response(JSON.stringify({ error: "provider_id is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  if (isNaN(requestedAmount) || requestedAmount < 1.0) {
    return new Response(
      JSON.stringify({
        error: "Minimum payout is $1.00 USD (1 USDC).",
        min_payout_usd: 1.0,
      }),
      { status: 400, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
    );
  }

  // 1. Look up provider in Charizard PostgreSQL
  const provider = await db.prepare(
    "SELECT id, name, payout_address, pending_payout_usd, total_earned_usd FROM providers WHERE id = ?"
  )
    .bind(providerId)
    .first<{
      id: string;
      name: string;
      payout_address: string;
      pending_payout_usd: number;
      total_earned_usd: number;
    }>();

  if (!provider) {
    return new Response(
      JSON.stringify({ error: `Provider '${providerId}' not registered.` }),
      { status: 404, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
    );
  }

  if (Number(provider.pending_payout_usd) < requestedAmount) {
    return new Response(
      JSON.stringify({
        error: `Insufficient accrued balance. Available pending payout: $${Number(provider.pending_payout_usd).toFixed(4)} USD. Requested: $${requestedAmount.toFixed(2)} USD.`,
        available_pending_usd: Number(provider.pending_payout_usd),
      }),
      { status: 400, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
    );
  }

  const destinationAddress = payoutAddress || provider.payout_address;
  if (!destinationAddress || !destinationAddress.startsWith("0x") || destinationAddress.length !== 42) {
    return new Response(
      JSON.stringify({ error: "Valid Ethereum/Arbitrum payout address required (0x...)" }),
      { status: 400, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
    );
  }

  // 2. Compute 50 bps protocol fee and net payout
  const protocolFeeUsd = Math.round(requestedAmount * 0.005 * 10000) / 10000;
  const netPayoutUsd = Math.round((requestedAmount - protocolFeeUsd) * 10000) / 10000;

  const payoutId = `pay_${crypto.randomUUID()}`;

  // 3. Atomically update provider pending balance & insert payout record
  await db.prepare(
    "UPDATE providers SET pending_payout_usd = pending_payout_usd - ? WHERE id = ?"
  )
    .bind(requestedAmount, providerId)
    .run();

  await db.prepare(
    "INSERT INTO payout_requests (id, provider_id, recipient_address, amount_usd, status, created_at) VALUES (?, ?, ?, ?, 'QUEUED', CURRENT_TIMESTAMP)"
  )
    .bind(payoutId, providerId, destinationAddress, requestedAmount)
    .run();

  const updatedProvider = await db.prepare(
    "SELECT pending_payout_usd, total_earned_usd FROM providers WHERE id = ?"
  )
    .bind(providerId)
    .first<{ pending_payout_usd: number; total_earned_usd: number }>();

  return new Response(
    JSON.stringify({
      success: true,
      message: `Payout request of $${requestedAmount.toFixed(2)} USD queued for settlement to ${destinationAddress}.`,
      payout_id: payoutId,
      provider_id: providerId,
      payout_address: destinationAddress,
      amount_usd: requestedAmount,
      protocol_fee_bps: 50,
      protocol_fee_usd: protocolFeeUsd,
      net_payout_usd: netPayoutUsd,
      status: "QUEUED",
      remaining_pending_usd: Number(updatedProvider?.pending_payout_usd || 0.0),
      total_earned_usd: Number(updatedProvider?.total_earned_usd || 0.0),
    }),
    { status: 201, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
  );
};
