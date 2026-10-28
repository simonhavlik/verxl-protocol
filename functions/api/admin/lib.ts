import { verifySessionToken, CORS_HEADERS } from "../lib/auth";
import { db } from "../lib/db";

const ADMIN_WALLETS = new Set([
  "0x14f10a865e277c0b1949e18dd9856602db11742b",
  "0x9b64203878f24eb0cdf55c8c6fa7d08ba0cf77e5",
]);

export async function verifyAdminUser(request: Request): Promise<{
  isAdmin: boolean;
  errorResponse?: Response;
  user?: { id: string; email: string; wallet_address: string | null };
}> {
  const authHeader = request.headers.get("Authorization");
  const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;
  if (!token) {
    return {
      isAdmin: false,
      errorResponse: new Response(
        JSON.stringify({ error: "Missing authorization token" }),
        { status: 401, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
      ),
    };
  }

  const payload = await verifySessionToken(token);
  if (!payload || !payload.sub) {
    return {
      isAdmin: false,
      errorResponse: new Response(
        JSON.stringify({ error: "Invalid session token" }),
        { status: 401, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
      ),
    };
  }

  const user = await db
    .prepare("SELECT id, email, wallet_address FROM users WHERE id = ?")
    .bind(payload.sub)
    .first<{ id: string; email: string; wallet_address: string | null }>();

  if (!user) {
    return {
      isAdmin: false,
      errorResponse: new Response(
        JSON.stringify({ error: "User not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
      ),
    };
  }

  const isEmailAdmin = user.email?.toLowerCase() === "me@simonhavlik.com";
  const isWalletAdmin = user.wallet_address
    ? ADMIN_WALLETS.has(user.wallet_address.toLowerCase())
    : false;

  if (!isEmailAdmin && !isWalletAdmin) {
    return {
      isAdmin: false,
      errorResponse: new Response(
        JSON.stringify({ error: "Access denied. Administrator privileges required." }),
        { status: 403, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
      ),
    };
  }

  return { isAdmin: true, user };
}
