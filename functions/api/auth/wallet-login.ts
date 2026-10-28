import { CORS_HEADERS, signSessionToken, verifySessionToken } from "../lib/auth";
import { db } from "../lib/db";
import { recoverMessageAddress } from "viem";

interface Env {}

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
};

// Recognized Founding Teammate Wallets:
// 1. Šimon Havlík (Admin): 0x9b64203878f24eb0cdf55c8c6fa7d08ba0cf77e5, 0x14f10A865e277C0B1949e18Dd9856602DB11742b
// 2. Daniel Kolárovský (QA Lead): 0x4e5e69dcfe7df0d3e5ba074c7a66ce0597cf05ab
// 3. Miroslava Valová (Compliance Lead): 0xe4a112c573a750b2d3cc418cff45ffef9fd1272f
const TEAMMATE_WALLETS = new Set([
  "0x9b64203878f24eb0cdf55c8c6fa7d08ba0cf77e5",
  "0x14f10a865e277c0b1949e18dd9856602db11742b",
  "0x4e5e69dcfe7df0d3e5ba074c7a66ce0597cf05ab",
  "0xe4a112c573a750b2d3cc418cff45ffef9fd1272f",
]);

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

  const wallet = typeof body.wallet_address === "string" ? body.wallet_address.trim().toLowerCase() : "";
  if (!wallet || !wallet.startsWith("0x") || wallet.length !== 42) {
    return new Response(JSON.stringify({ error: "Valid Ethereum wallet address required" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  // Optional cryptographic signature check if provided
  if (body.signature && typeof body.signature === "string" && body.signature.startsWith("0x")) {
    try {
      const recovered = await recoverMessageAddress({
        message: `Verxl Session Login: ${wallet}`,
        signature: body.signature as `0x${string}`,
      });
      if (recovered.toLowerCase() !== wallet) {
        return new Response(JSON.stringify({ error: "Cryptographic wallet signature verification failed" }), {
          status: 401,
          headers: { "Content-Type": "application/json", ...CORS_HEADERS },
        });
      }
    } catch {
      return new Response(JSON.stringify({ error: "Invalid cryptographic signature" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      });
    }
  }

  // Check if caller is already logged in with email and wants to link their MetaMask wallet
  const authHeader = request.headers.get("Authorization");
  let loggedInUserSub: string | null = null;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const existingToken = authHeader.slice(7).trim();
    const payload = await verifySessionToken(existingToken);
    if (payload && payload.sub) {
      loggedInUserSub = payload.sub;
    }
  }

  // Šimon Havlík's lead wallets: always resolve to usr_simonhavlik (me@simonhavlik.com)
  const isSimonWallet =
    wallet === "0x14f10a865e277c0b1949e18dd9856602db11742b" ||
    wallet === "0x9b64203878f24eb0cdf55c8c6fa7d08ba0cf77e5";

  let user = isSimonWallet
    ? await db.prepare("SELECT id, email, wallet_address, balance_usd, total_deposited_usd FROM users WHERE email = 'me@simonhavlik.com' LIMIT 1")
        .first<{
          id: string;
          email: string;
          wallet_address: string;
          balance_usd: number;
          total_deposited_usd: number;
        }>()
    : await db.prepare(
        "SELECT id, email, wallet_address, balance_usd, total_deposited_usd FROM users WHERE LOWER(wallet_address) = ?"
      )
        .bind(wallet)
        .first<{
          id: string;
          email: string;
          wallet_address: string;
          balance_usd: number;
          total_deposited_usd: number;
        }>();

  if (isSimonWallet && user) {
    // Keep wallet_address synchronized to the active connecting wallet
    if (user.wallet_address?.toLowerCase() !== wallet) {
      await db.prepare("UPDATE users SET wallet_address = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
        .bind(wallet, user.id)
        .run();
      user.wallet_address = wallet;
    }
  }

  // If caller was already logged in with an account, attach the wallet to that account
  if (loggedInUserSub && !user) {
    await db.prepare("UPDATE users SET wallet_address = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
      .bind(wallet, loggedInUserSub)
      .run();

    user = await db.prepare(
      "SELECT id, email, wallet_address, balance_usd, total_deposited_usd FROM users WHERE id = ?"
    )
      .bind(loggedInUserSub)
      .first<{
        id: string;
        email: string;
        wallet_address: string;
        balance_usd: number;
        total_deposited_usd: number;
      }>();
  }

  // If user does not exist in DB:
  if (!user) {
    // Only teammates receive 1.00 USD; other people start at 0 USD and must deposit at least 1 USDC via Arbitrum
    const isTeammate = TEAMMATE_WALLETS.has(wallet);
    const initialBalance = isTeammate ? 1.0 : 0.0;
    const initialDeposited = isTeammate ? 1.0 : 0.0;
    const newUserId = `usr_w_${wallet.slice(2, 10)}`;
    const email = `${wallet.slice(0, 6)}...${wallet.slice(-4)}@web3.verxl.user`;

    await db.prepare(
      "INSERT INTO users (id, email, wallet_address, balance_usd, total_deposited_usd, total_spent_usd, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)"
    )
      .bind(newUserId, email, wallet, initialBalance, initialDeposited)
      .run();

    user = {
      id: newUserId,
      email,
      wallet_address: wallet,
      balance_usd: initialBalance,
      total_deposited_usd: initialDeposited,
    };
  } else {
    // If it is a teammate, ensure they always have at least 1.00 USD
    if (TEAMMATE_WALLETS.has(wallet) && Number(user.balance_usd) < 1.0) {
      await db.prepare(
        "UPDATE users SET balance_usd = 1.000000, total_deposited_usd = GREATEST(total_deposited_usd, 1.000000) WHERE id = ?"
      )
        .bind(user.id)
        .run();
      user.balance_usd = 1.0;
      user.total_deposited_usd = Math.max(Number(user.total_deposited_usd), 1.0);
    }
  }

  const activeKey = await db.prepare(
    "SELECT id, key_prefix FROM api_keys WHERE user_id = ? AND is_active = 1 LIMIT 1"
  )
    .bind(user.id)
    .first<{ id: string; key_prefix: string }>();

  const token = await signSessionToken({
    sub: user.id,
    email: user.email,
    wallet: user.wallet_address,
  });

  return new Response(
    JSON.stringify({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        wallet_address: user.wallet_address,
        balance_usd: Number(user.balance_usd),
        total_deposited_usd: Number(user.total_deposited_usd),
        has_active_key: Boolean(activeKey),
        has_linked_email: Boolean(user.email && !user.email.endsWith("@web3.verxl.user")),
        is_admin:
          user.email?.toLowerCase() === "me@simonhavlik.com" ||
          user.wallet_address?.toLowerCase() === "0x9b64203878f24eb0cdf55c8c6fa7d08ba0cf77e5",
      },
      apiKey: activeKey?.key_prefix || null,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    }
  );
};
