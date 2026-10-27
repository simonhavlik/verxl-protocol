import { CORS_HEADERS } from "../lib/auth";

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
};

export const onRequestPost: PagesFunction = async () => {
  return new Response(
    JSON.stringify({
      error: "Academic test grants are no longer available. All compute balances must be funded via Arbitrum One USDC deposit.",
    }),
    { status: 410, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
  );
};
