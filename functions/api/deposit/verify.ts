import { CORS_HEADERS, verifySessionToken, hashSha256 } from "../lib/auth";
import { db } from "../lib/db";

interface Env {
  TREASURY_ADDRESS?: string;
}

const TREASURY_WALLET = "0x5AE718197a6A87E103B124b660fd49692C857aE0";
const TRANSFER_TOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

// Valid Arbitrum One Mainnet USDC contracts (6 decimals)
const VALID_USDC_CONTRACTS = new Set([
  "0xaf88d065e77c8cc2239327c5edb3a432268e5831", // Native Arbitrum USDC
  "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8", // Bridged Arbitrum USDC.e
]);

const ARBITRUM_RPCS = [
  "https://arb1.arbitrum.io/rpc",
  "https://arbitrum-one-rpc.publicnode.com",
  "https://1rpc.io/arb",
];

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  const authHeader = request.headers.get("Authorization");
  const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) {
    return new Response(JSON.stringify({ error: "Missing authorization token" }), {
      status: 401,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  const payload = await verifySessionToken(token);
  if (!payload || !payload.sub) {
    return new Response(JSON.stringify({ error: "Invalid session token" }), {
      status: 401,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  const userId = payload.sub;

  let body: any;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON payload" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  const txHash = typeof body.tx_hash === "string" ? body.tx_hash.trim().toLowerCase() : "";

  if (!txHash || !txHash.startsWith("0x") || txHash.length !== 66) {
    return new Response(
      JSON.stringify({ error: "Valid 32-byte Arbitrum tx_hash required (0x... 66 hex characters)" }),
      { status: 400, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
    );
  }

  // 1. Replay Attack Prevention
  const existingDeposit = await db.prepare("SELECT id FROM deposits WHERE tx_hash = ?")
    .bind(txHash)
    .first();

  if (existingDeposit) {
    return new Response(
      JSON.stringify({ error: "This transaction has already been credited to an account." }),
      { status: 409, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
    );
  }

  const treasury = (env.TREASURY_ADDRESS || TREASURY_WALLET).toLowerCase();

  let creditedAmountUsd = 0;
  let fromAddress = "0x0000000000000000000000000000000000000000";
  let tokenContractFound = "";
  let rpcSuccess = false;

  // 2. Query On-Chain Receipt directly from Arbitrum One Mainnet RPCs
  for (const rpcUrl of ARBITRUM_RPCS) {
    try {
      const rpcResp = await fetch(rpcUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Verxl/1.0",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "eth_getTransactionReceipt",
          params: [txHash],
        }),
      });

      if (!rpcResp.ok) continue;

      const rpcData = (await rpcResp.json()) as any;
      const receipt = rpcData && rpcData.result;

      if (!receipt) {
        // Transaction pending or not yet mined
        continue;
      }

      rpcSuccess = true;

      // Ensure transaction succeeded on Arbitrum One
      if (receipt.status !== "0x1") {
        return new Response(
          JSON.stringify({ error: "Transaction failed or reverted on Arbitrum One Mainnet." }),
          { status: 400, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
        );
      }

      fromAddress = receipt.from ? receipt.from.toLowerCase() : fromAddress;

      // Scan ERC-20 Transfer event logs strictly for Arbitrum USDC contracts
      if (Array.isArray(receipt.logs)) {
        for (const log of receipt.logs) {
          const contractAddr = (log.address || "").toLowerCase();

          // Strictly verify token contract is Native USDC or Bridged USDC.e on Arbitrum
          if (!VALID_USDC_CONTRACTS.has(contractAddr)) {
            continue;
          }

          if (
            log.topics &&
            log.topics[0] &&
            log.topics[0].toLowerCase() === TRANSFER_TOPIC &&
            log.topics[2]
          ) {
            // topic[2] is recipient padded to 32 bytes (64 hex characters + 0x)
            const recipientInLog = "0x" + log.topics[2].slice(-40).toLowerCase();
            if (recipientInLog === treasury) {
              const hexVal = log.data;
              const valBigInt = BigInt(hexVal);
              creditedAmountUsd = Number(valBigInt) / 1e6; // USDC has 6 decimals on Arbitrum
              tokenContractFound = contractAddr;
              break;
            }
          }
        }
      }

      // If we got a valid receipt and inspected logs, stop trying other RPCs
      break;
    } catch {
      // Try next RPC endpoint
    }
  }

  if (!rpcSuccess) {
    return new Response(
      JSON.stringify({
        error: `Transaction ${txHash} not found on Arbitrum One Mainnet. Please ensure the transaction is submitted on Arbitrum One (Chain ID 42161) and has at least 1 confirmation. No testnet transactions accepted.`,
      }),
      { status: 404, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
    );
  }

  if (creditedAmountUsd === 0) {
    return new Response(
      JSON.stringify({
        error: `No valid transfer to Verxl Treasury (${treasury}) was found in transaction ${txHash}. Only verified Arbitrum One USDC (Native 0xaf88d065... or USDC.e 0xFF970A61...) transfers are accepted. Testnet tokens, ETH, and other assets are rejected.`,
      }),
      { status: 400, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
    );
  }

  if (creditedAmountUsd < 1.0) {
    return new Response(
      JSON.stringify({
        error: `Deposit amount of $${creditedAmountUsd.toFixed(2)} USDC is below the minimum threshold of $1.00 USD (1 USDC).`,
      }),
      { status: 400, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
    );
  }

  // 3. Atomically Record Deposit & Update User Balance in Charizard PostgreSQL
  const depositId = `dep_${crypto.randomUUID()}`;
  await db.prepare(
    "INSERT INTO deposits (id, tx_hash, user_id, amount_usd, chain_id, status, created_at) VALUES (?, ?, ?, ?, 42161, 'SETTLED', CURRENT_TIMESTAMP)"
  )
    .bind(depositId, txHash, userId, creditedAmountUsd)
    .run();

  await db.prepare(
    "UPDATE users SET balance_usd = balance_usd + ?, total_deposited_usd = total_deposited_usd + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
  )
    .bind(creditedAmountUsd, creditedAmountUsd, userId)
    .run();

  const updatedUser = await db.prepare(
    "SELECT balance_usd, total_deposited_usd FROM users WHERE id = ?"
  )
    .bind(userId)
    .first<{ balance_usd: number; total_deposited_usd: number }>();

  // 4. Auto-generate initial API Key if user deposited >= $1.00 and has no active key
  let newGeneratedKey: string | null = null;
  const existingKey = await db.prepare(
    "SELECT id FROM api_keys WHERE user_id = ? AND is_active = 1 LIMIT 1"
  )
    .bind(userId)
    .first();

  if (!existingKey && (updatedUser?.total_deposited_usd || 0) >= 1.0) {
    const rawKeySecret = `vrxl_live_${crypto.randomUUID().replace(/-/g, "")}${crypto.randomUUID().replace(/-/g, "")}`.slice(0, 42);
    const keyHash = await hashSha256(rawKeySecret);
    const keyPrefix = rawKeySecret.slice(0, 14) + "...";
    const keyId = `key_${crypto.randomUUID()}`;

    await db.prepare(
      "INSERT INTO api_keys (id, user_id, key_hash, key_prefix, name, is_active, created_at) VALUES (?, ?, ?, ?, 'Default Production Key', 1, CURRENT_TIMESTAMP)"
    )
      .bind(keyId, userId, keyHash, keyPrefix)
      .run();

    newGeneratedKey = rawKeySecret;
  }

  return new Response(
    JSON.stringify({
      success: true,
      message: `Successfully verified on-chain Arbitrum One transaction! Credited $${creditedAmountUsd.toFixed(2)} USDC to your account.`,
      deposit_id: depositId,
      chain: "Arbitrum One Mainnet (42161)",
      token_contract: tokenContractFound,
      amount_usd: creditedAmountUsd,
      new_balance_usd: updatedUser?.balance_usd || creditedAmountUsd,
      total_deposited_usd: updatedUser?.total_deposited_usd || creditedAmountUsd,
      new_api_key: newGeneratedKey,
    }),
    { status: 200, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
  );
};
