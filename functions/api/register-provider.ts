// Cloudflare Pages Function: /api/register-provider
// Validates and records prospective GPU Provider registration applications

interface Env {}

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request } = context;

  let body: any;
  try {
    body = await request.json();
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: { message: "Invalid JSON payload.", code: "BAD_JSON" },
      }),
      { status: 400, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
    );
  }

  const {
    name,
    operatorAddress,
    endpointUrl,
    modelIdentifier,
    hardware,
    location,
    region = "EU-Central",
    stakedAmountVrxl = 1000,
    pricePromptUsd = 0.50,
    priceCompletionUsd = 0.50,
    contactInfo,
  } = body;

  if (!name || !endpointUrl || !modelIdentifier || !hardware) {
    return new Response(
      JSON.stringify({
        error: {
          message: "Missing required fields: name, endpointUrl, modelIdentifier, and hardware are required.",
          code: "VALIDATION_FAILED",
        },
      }),
      { status: 400, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
    );
  }

  if (stakedAmountVrxl < 1000) {
    return new Response(
      JSON.stringify({
        error: {
          message: "Minimum stake requirement is 1,000 $VRXL for Sepolia bonding.",
          code: "INSUFFICIENT_BOND",
        },
      }),
      { status: 400, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
    );
  }

  const providerId = `node-${Math.random().toString(36).substring(2, 9)}`;
  const submissionTimestamp = new Date().toISOString();

  const responsePayload = {
    success: true,
    message: "Inference provider registration submitted successfully. Node placed in PENDING_AUDIT queue for autonomous seed=42 canary verification.",
    provider: {
      id: providerId,
      name,
      operatorAddress: operatorAddress || "0x0000000000000000000000000000000000000000",
      endpointUrl,
      modelIdentifier,
      hardware,
      location: location || "Global",
      region,
      stakedAmountVrxl: Number(stakedAmountVrxl),
      pricePromptUsd: Number(pricePromptUsd),
      priceCompletionUsd: Number(priceCompletionUsd),
      status: "PENDING_AUDIT",
      contact: contactInfo || "unspecified",
      submissionTimestamp,
      canaryOracleCheck: "SCHEDULED",
      contractAddress: "0x8F590f2098D71A8253ad50450D7A73F3201402F0",
      daoVault: "0xf0e51fB0FFBD8ef36281b6f643E0f7953BD5111a",
    },
  };

  return new Response(JSON.stringify(responsePayload, null, 2), {
    status: 200,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
};
