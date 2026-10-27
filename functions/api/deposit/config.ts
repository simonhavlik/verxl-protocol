import { CORS_HEADERS } from "../lib/auth";

interface Env {
  TREASURY_ADDRESS?: string;
}

const TREASURY_WALLET = "0x14f10A865e277C0B1949e18Dd9856602DB11742b";

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
};

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const treasury = context.env.TREASURY_ADDRESS || TREASURY_WALLET;

  return new Response(
    JSON.stringify({
      treasury_address: treasury,
      min_deposit_usd: 1.0,
      protocol_fee_bps: 50,
      network: "Arbitrum One Mainnet (Chain ID 42161)",
      settlement_token: "USDC (Arbitrum Native & Bridged USDC.e)",
      accepted_tokens: [
        {
          symbol: "USDC",
          type: "Native Arbitrum USDC",
          address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
          decimals: 6,
        },
        {
          symbol: "USDC.e",
          type: "Bridged Arbitrum USDC",
          address: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
          decimals: 6,
        },
      ],
      rpc_endpoints: [
        "https://arb1.arbitrum.io/rpc",
        "https://arbitrum-one-rpc.publicnode.com",
        "https://1rpc.io/arb",
      ],
      explorer_url: "https://arbiscan.io",
      testnet_accepted: false,
    }),
    { status: 200, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
  );
};
