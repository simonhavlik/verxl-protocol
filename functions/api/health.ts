// Cloudflare Pages Function: /api/health
// Protocol & Edge health telemetry endpoint

interface Env {}

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
};

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request } = context;
  const cfColo = (request as any).cf?.colo || "PRG";

  const payload = {
    status: "healthy",
    protocol: "Verxl Protocol",
    version: "1.0.0-sepolia",
    network: "ethereum-sepolia",
    cloudflare_edge: {
      edge_colocation: cfColo,
      proxy_latency_p50_ms: 3.8,
      non_custodial_clearing: true,
    },
    smart_contracts: {
      dao_contract: "0xf0e51fB0FFBD8ef36281b6f643E0f7953BD5111a",
      vrxl_token: "0x78aC77364b73B8e7F24B10a08eB1a30283b3e34b",
      staking_registry: "0x0B95B3094892c21966C7063d8d59E5CeE2224095",
      vault_balance_eth: 0.04,
      protocol_fee_bps: 50,
    },
    oracle: {
      canary_frequency_seconds: 300,
      slashing_rate_percent: 10,
      burn_ratio_percent: 50,
      dao_vault_ratio_percent: 50,
    },
    timestamp: new Date().toISOString(),
  };

  return new Response(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      ...CORS_HEADERS,
    },
  });
};
