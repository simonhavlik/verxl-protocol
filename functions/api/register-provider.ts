// Cloudflare Pages Function: /api/register-provider
// Validates and records prospective GPU Provider registration applications into PostgreSQL
import { db } from "./lib/db";

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
    location = "Global",
    region = "EU-Central",
    pricePromptUsd = 0.05,
    priceCompletionUsd = 0.10,
    website = null,
    contactEmail = null,
    message = null,
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

  const applicationId = `app_${crypto.randomUUID()}`;

  try {
    await db.prepare(
      `INSERT INTO provider_applications (
        id, name, operator_address, endpoint_url, model_identifier,
        hardware, location, region, price_prompt_usd, price_completion_usd,
        website, contact_email, message, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING_REVIEW', CURRENT_TIMESTAMP)`
    )
      .bind(
        applicationId,
        name.trim(),
        operatorAddress ? operatorAddress.trim() : null,
        endpointUrl.trim(),
        modelIdentifier.trim(),
        hardware.trim(),
        location.trim(),
        region.trim(),
        Number(pricePromptUsd) || 0.05,
        Number(priceCompletionUsd) || 0.10,
        website ? website.trim() : null,
        contactEmail ? contactEmail.trim().toLowerCase() : null,
        message ? message.trim() : null
      )
      .run();

    return new Response(
      JSON.stringify(
        {
          success: true,
          message: "Provider node application submitted successfully. Placed into admin review queue.",
          application: {
            id: applicationId,
            name,
            operatorAddress,
            endpointUrl,
            modelIdentifier,
            hardware,
            location,
            region,
            pricePromptUsd,
            priceCompletionUsd,
            website,
            contactEmail,
            message,
            status: "PENDING_REVIEW",
            submissionTimestamp: new Date().toISOString(),
          },
        },
        null,
        2
      ),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      }
    );
  } catch (err: any) {
    console.error("Failed to save provider application:", err);
    return new Response(
      JSON.stringify({
        error: {
          message: "Failed to record application into database: " + err.message,
          code: "DB_ERROR",
        },
      }),
      { status: 500, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
    );
  }
};
