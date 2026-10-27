import { CORS_HEADERS } from "../lib/auth";

interface Env {
  TREASURY_ADDRESS?: string;
}

const TREASURY_WALLET = "0x5AE718197a6A87E103B124b660fd49692C857aE0";

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
      chains: {
        arbitrum: {
          name: "Arbitrum One",
          chain_id: 42161,
          rpc_url: "https://arb1.arbitrum.io/rpc",
          explorer_url: "https://arbiscan.io",
          usdc_address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
          decimals: 6,
        },
        arbitrum_sepolia: {
          name: "Arbitrum Sepolia Testnet",
          chain_id: 421614,
          rpc_url: "https://sepolia-rollup.arbitrum.io/rpc",
          explorer_url: "https://sepolia.arbiscan.io",
          usdc_address: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d",
          decimals: 6,
        },
      },
    }),
    { status: 200, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
  );
};
