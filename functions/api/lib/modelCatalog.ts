import { db } from "./db";

export interface CatalogModel {
  id: string;
  providerId: string;
  providerName: string;
  baseUrl: string | null;
  apiKey: string | null;
  modelId: string;
  contextWindow: number;
  promptRate: number;
  completionRate: number;
  cachedRate: number;
  allowThinking: boolean;
  allowTemperature: boolean;
  allowTools: boolean;
  isOfficialBridge: boolean;
  fallbacks: Array<{ url: string; name?: string; model_name?: string }>;
}

let cache: { models: Map<string, CatalogModel>; expiresAt: number } | null = null;

export function providerChatUrl(baseUrl: string | null): string | null {
  if (!baseUrl) return null;
  const clean = baseUrl.trim().replace(/\/+$/, "");
  if (!clean) return null;
  if (clean.endsWith("/chat/completions")) return clean;
  if (clean.endsWith("/v1")) return `${clean}/chat/completions`;
  return `${clean}/v1/chat/completions`;
}

export async function getCatalog(): Promise<Map<string, CatalogModel>> {
  if (cache && cache.expiresAt > Date.now()) return cache.models;
  const models = new Map<string, CatalogModel>();
  try {
    const { results } = await db.prepare(
      "SELECT id, name, base_url, api_key, is_official_bridge, models_config, fallbacks FROM providers WHERE status = 'ACTIVE' ORDER BY is_official_bridge DESC, created_at ASC"
    ).all();

    for (const row of results || []) {
      let configs: any[] = [];
      let fallbacks: any[] = [];
      try {
        configs = typeof (row as any).models_config === "string"
          ? JSON.parse((row as any).models_config)
          : ((row as any).models_config || []);
      } catch {}
      try {
        fallbacks = typeof (row as any).fallbacks === "string"
          ? JSON.parse((row as any).fallbacks)
          : ((row as any).fallbacks || []);
      } catch {}

      for (const m of configs) {
        const id = typeof m?.model_id === "string" ? m.model_id : m?.id;
        if (typeof id !== "string" || !id.trim() || models.has(id.trim())) continue;
        const contextWindow = Math.max(1, Number(m.context_window || m.context_length || 32768));
        models.set(id.trim(), {
          id: id.trim(),
          providerId: (row as any).id,
          providerName: (row as any).name || "verxl-provider",
          baseUrl: (row as any).base_url || null,
          apiKey: (row as any).api_key || null,
          modelId: id.trim(),
          contextWindow,
          promptRate: Number(m.prompt_rate ?? m.price_prompt_usd ?? 0.05),
          completionRate: Number(m.completion_rate ?? m.price_completion_usd ?? 0.10),
          cachedRate: Number(m.cached_prompt_rate ?? m.price_cached_prompt_usd ?? 0.01),
          allowThinking: m.allow_thinking === true || m.allowThinking === true,
          allowTemperature: m.allow_temperature !== false && m.allowTemperature !== false,
          allowTools: m.allow_tools === true || m.allowTools === true,
          isOfficialBridge: Boolean((row as any).is_official_bridge),
          fallbacks: Array.isArray(fallbacks) ? fallbacks : [],
        });
      }
    }
  } catch {
    // Caller can fall back to the built-in routes.
  }
  cache = { models, expiresAt: Date.now() + 10_000 };
  return models;
}

export async function findCatalogModel(id: string): Promise<CatalogModel | null> {
  const models = await getCatalog();
  return models.get(id) || null;
}
