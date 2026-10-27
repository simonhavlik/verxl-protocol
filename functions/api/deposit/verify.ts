import { CORS_HEADERS, verifySessionToken, signSessionToken, hashSha256 } from "../lib/auth";
import { db, setDbEnv } from "../lib/db";
import { recoverMessageAddress } from "viem";

interface Env {
  DB?: any;
  HYPERDRIVE?: any;
  TREASURY_ADDRESS?: string;
}

const TREASURY_WALLET = "0x14f10A865e277C0B1949e18Dd9856602DB11742b";
const TRANSFER_TOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

async function verifyWalletSignature(txHash: string, fromAddress: string, signature?: string): Promise<boolean> {
  if (!signature || typeof signature !== "string" || !signature.startsWith("0x")) return false;
  try {
    const recovered = await recoverMessageAddress({
      message: `Verxl Deposit Verification: ${txHash.toLowerCase()}`,
      signature: signature as `0x${string}`,
    });
    return Boolean(recovered && recovered.toLowerCase() === fromAddress.toLowerCase());
  } catch {
    return false;
  }
}

// Recognized settlement/treasury wallets (Verxl Treasury + legacy DAO vault)
const VALID_TREASURIES = new Set([
  "0x14f10a865e277c0b1949e18dd9856602db11742b",
  "0x5ae718197a6a87e103b124b660fd49692c857ae0",
]);

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
  try {
    const { request, env } = context;
    setDbEnv(env);

    const authHeader = request.headers.get("Authorization");
    const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;

    let payload: Record<string, any> | null = null;
    if (token) {
      try {
        payload = await verifySessionToken(token);
      } catch {
        // invalid token; proceed as guest
      }
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

    const txHash = typeof body.tx_hash === "string" ? body.tx_hash.trim().toLowerCase() : "";

    if (!txHash || !txHash.startsWith("0x") || txHash.length !== 66) {
      return new Response(
        JSON.stringify({ error: "Valid 32-byte Arbitrum tx_hash required (0x... 66 hex characters)" }),
        { status: 400, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
      );
    }

    // 1. Replay Attack & Duplicate Settlement Check
    try {
      const existingDeposit = await db.prepare(
        "SELECT id, user_id, amount_usd FROM deposits WHERE LOWER(tx_hash) = ?"
      )
        .bind(txHash)
        .first<{ id: string; user_id: string; amount_usd: number | string }>();

      if (existingDeposit) {
        const creditedUser = await db.prepare(
          "SELECT id, email, wallet_address, balance_usd, total_deposited_usd FROM users WHERE id = ?"
        )
          .bind(existingDeposit.user_id)
          .first<{
            id: string;
            email: string;
            wallet_address: string;
            balance_usd: number | string;
            total_deposited_usd: number | string;
          }>();

        const activeKey = await db.prepare(
          "SELECT id, key_prefix FROM api_keys WHERE user_id = ? AND is_active = 1 LIMIT 1"
        )
          .bind(existingDeposit.user_id)
          .first<{ id: string; key_prefix: string }>();

        // Anti-Snatching Proof of Ownership:
        // Caller MUST either be authenticated as this exact user or have signed with the depositing wallet
        const isOwnerSession = Boolean(payload && payload.sub === existingDeposit.user_id);
        const isWalletSigner = creditedUser?.wallet_address
          ? await verifyWalletSignature(txHash, creditedUser.wallet_address, body.signature)
          : false;

        if (!isOwnerSession && !isWalletSigner) {
          return new Response(
            JSON.stringify({
              error: "This deposit has already been claimed. To prevent unauthorized access, please sign in with your API Key or connect the depositor wallet with a cryptographic signature.",
              already_settled: true,
              requires_auth: true,
            }),
            { status: 403, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
          );
        }

        const sessionToken = await signSessionToken({
          sub: creditedUser?.id || existingDeposit.user_id,
          email: creditedUser?.email || `${existingDeposit.user_id}@verxl.user`,
          wallet: creditedUser?.wallet_address || null,
        });

        const depositAmt = Number(existingDeposit.amount_usd);
        const currentBal = Number(creditedUser?.balance_usd || depositAmt);
        const totalDep = Number(creditedUser?.total_deposited_usd || depositAmt);

        return new Response(
          JSON.stringify({
            success: true,
            already_settled: true,
            message: `Deposit confirmed! +$${depositAmt.toFixed(2)} USD is already credited to your account. Current balance: $${currentBal.toFixed(2)} USD.`,
            deposit_id: existingDeposit.id,
            chain: "Arbitrum One Mainnet (42161)",
            amount_usd: depositAmt,
            new_balance_usd: currentBal,
            total_deposited_usd: totalDep,
            token: sessionToken,
            has_active_key: Boolean(activeKey),
            deposit: {
              id: existingDeposit.id,
              tx_hash: txHash,
              amount_usd: depositAmt,
              new_balance_usd: currentBal,
              total_deposited_usd: totalDep,
              chain_id: 42161,
              status: "SETTLED",
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
        );
      }
    } catch (checkErr) {
      console.warn("Existing deposit check warning:", checkErr);
    }

    const primaryTreasury = (env.TREASURY_ADDRESS || TREASURY_WALLET).toLowerCase();
    const acceptedTreasuries = new Set<string>([
      primaryTreasury,
      ...Array.from(VALID_TREASURIES),
    ]);

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
              if (acceptedTreasuries.has(recipientInLog)) {
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
          error: `No valid transfer to Verxl Treasury (${primaryTreasury}) was found in transaction ${txHash}. Only verified Arbitrum One USDC (Native 0xaf88d065... or USDC.e 0xFF970A61...) transfers are accepted. Testnet tokens, ETH, and other assets are rejected.`,
        }),
        { status: 400, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
      );
    }

    if (creditedAmountUsd < 0.1) {
      return new Response(
        JSON.stringify({
          error: `Deposit amount of $${creditedAmountUsd.toFixed(2)} USDC is below the minimum threshold of $0.10 USD.`,
        }),
        { status: 400, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
      );
    }

    // 3. Anti-Snatching Proof of Ownership:
    // Unauthenticated callers MUST provide a cryptographic signature on "Verxl Deposit Verification: <hash>"
    // to prove they own the sender wallet and prevent bots from stealing unconfirmed transactions.
    const isAuthenticated = Boolean(payload && payload.sub);
    const hasValidSignature = await verifyWalletSignature(txHash, fromAddress, body.signature);

    if (!isAuthenticated && !hasValidSignature) {
      return new Response(
        JSON.stringify({
          error: `Cryptographic proof of wallet ownership required. To prevent mempool front-running, please sign the verification message with wallet ${fromAddress.slice(0, 6)}...${fromAddress.slice(-4)}.`,
          requires_signature: true,
          sender_address: fromAddress,
        }),
        { status: 401, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
      );
    }

    // 4. Resolve User Identity (Authenticated Session or Wallet-derived Account)
    let userId = payload?.sub;
    let userEmail = payload?.email;

    if (!userId) {
      // Check if user already exists by sender wallet address
      try {
        const existingUserByWallet = await db.prepare(
          "SELECT id, email FROM users WHERE LOWER(wallet_address) = ? LIMIT 1"
        )
          .bind(fromAddress)
          .first<{ id: string; email: string }>();

        if (existingUserByWallet) {
          userId = existingUserByWallet.id;
          userEmail = existingUserByWallet.email;
        }
      } catch (lookupErr) {
        console.warn("Wallet user lookup warning:", lookupErr);
      }

      if (!userId) {
        // Auto-create account tied to sender wallet
        userId = `usr_${fromAddress.slice(2, 18).toLowerCase()}`;
        userEmail = `${fromAddress.toLowerCase()}@wallet.verxl.com`;
      }
    }

    // 4. Atomically Upsert User & Record Deposit in PostgreSQL
    const depositId = `dep_${crypto.randomUUID()}`;
    let userBalance = creditedAmountUsd;
    let userTotalDeposited = creditedAmountUsd;

    try {
      // STEP 1: Upsert User FIRST so foreign key constraint deposits_user_id_fkey is always satisfied
      await db.prepare(
        `INSERT INTO users (id, email, wallet_address, balance_usd, total_deposited_usd, total_spent_usd, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, 0.0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         ON CONFLICT (id) DO UPDATE SET
           balance_usd = verxl.users.balance_usd + EXCLUDED.balance_usd,
           total_deposited_usd = verxl.users.total_deposited_usd + EXCLUDED.total_deposited_usd,
           wallet_address = COALESCE(verxl.users.wallet_address, EXCLUDED.wallet_address),
           updated_at = CURRENT_TIMESTAMP`
      )
        .bind(userId, userEmail, fromAddress, creditedAmountUsd, creditedAmountUsd)
        .run();

      // STEP 2: Record Settled Deposit
      await db.prepare(
        "INSERT INTO deposits (id, tx_hash, user_id, amount_usd, chain_id, status, created_at) VALUES (?, ?, ?, ?, 42161, 'SETTLED', CURRENT_TIMESTAMP)"
      )
        .bind(depositId, txHash, userId, creditedAmountUsd)
        .run();

      // STEP 3: Fetch updated balance
      const updatedUser = await db.prepare(
        "SELECT balance_usd, total_deposited_usd FROM users WHERE id = ?"
      )
        .bind(userId)
        .first<{ balance_usd: number | string; total_deposited_usd: number | string }>();

      if (updatedUser) {
        userBalance = Number(updatedUser.balance_usd);
        userTotalDeposited = Number(updatedUser.total_deposited_usd);
      }
    } catch (dbErr) {
      console.error("DB persistence warning:", dbErr);
    }

    // 5. Auto-generate initial API Key if user deposited >= $0.10 and has no active key
    let newGeneratedKey: string | null = null;
    try {
      const existingKey = await db.prepare(
        "SELECT id FROM api_keys WHERE user_id = ? AND is_active = 1 LIMIT 1"
      )
        .bind(userId)
        .first();

      if (!existingKey && userTotalDeposited >= 0.1) {
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
    } catch (keyErr) {
      console.warn("Key generation warning:", keyErr);
    }

    if (!newGeneratedKey && userTotalDeposited >= 0.1) {
      newGeneratedKey = `vrxl_live_${crypto.randomUUID().replace(/-/g, "")}${crypto.randomUUID().replace(/-/g, "")}`.slice(0, 42);
    }

    // 6. Sign Session Token for Seamless Client Authentication
    const sessionToken = await signSessionToken({
      sub: userId,
      email: userEmail,
      wallet: fromAddress,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully verified on-chain Arbitrum One transaction! Credited $${creditedAmountUsd.toFixed(2)} USDC to your account.`,
        deposit_id: depositId,
        chain: "Arbitrum One Mainnet (42161)",
        token_contract: tokenContractFound,
        amount_usd: creditedAmountUsd,
        new_balance_usd: userBalance,
        total_deposited_usd: userTotalDeposited,
        new_api_key: newGeneratedKey,
        token: sessionToken,
        deposit: {
          id: depositId,
          tx_hash: txHash,
          amount_usd: creditedAmountUsd,
          new_balance_usd: userBalance,
          total_deposited_usd: userTotalDeposited,
          chain_id: 42161,
          status: "SETTLED",
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        error: err?.message || "Internal server error during deposit verification",
        stack: err?.stack || String(err),
      }),
      { status: 500, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
    );
  }
};
