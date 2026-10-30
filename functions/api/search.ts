// Cloudflare Pages Function: /api/search
// Server-side proxy for the browser search tool. Exa/Brave/Firecrawl do not
// reliably send CORS headers, so the user's key and query are proxied here.
// The key is used only for the upstream request and is never logged or stored.

interface Env {}

interface SearchRequest {
  provider?: string;
  query?: string;
  key?: string;
  baseUrl?: string;
}

interface SearchResult {
  title: string;
  url: string;
  description: string;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });

const clean = (value: unknown) => String(value ?? "").replace(/\s+/g, " ").trim();

const readJson = async (res: Response) => {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(text.slice(0, 240) || `Upstream returned ${res.status}`);
  }
};

const upstreamError = (data: any, status: number, provider: string) => {
  const message = data?.error?.message || data?.error || data?.message || data?.detail;
  return new Error(String(message || `${provider} returned HTTP ${status}`));
};

const isPrivateHost = (host: string) => {
  const h = host.toLowerCase();
  return (
    h === "localhost" ||
    h === "0.0.0.0" ||
    h === "::1" ||
    h.endsWith(".local") ||
    /^127\./.test(h) ||
    /^10\./.test(h) ||
    /^192\.168\./.test(h) ||
    /^169\.254\./.test(h) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(h)
  );
};

const safeCustomUrl = (raw: string) => {
  const url = new URL(raw);
  if (url.protocol !== "https:" || isPrivateHost(url.hostname)) {
    throw new Error("Custom search URL must be a public HTTPS endpoint.");
  }
  return url.toString();
};

export const onRequestPost: PagesFunction<Env> = async ({ request }) => {
  let body: SearchRequest;
  try {
    body = (await request.json()) as SearchRequest;
  } catch {
    return json({ error: "Invalid JSON body." }, 400);
  }

  const provider = String(body.provider || "firecrawl").toLowerCase();
  const query = clean(body.query).slice(0, 400);
  const key = String(body.key || "").trim();
  if (!query) return json({ error: "Search query is empty." }, 400);
  if (provider !== "firecrawl" && !key) {
    return json({ error: `${provider} API key is missing.` }, 400);
  }

  try {
    let results: SearchResult[] = [];

    if (provider === "exa") {
      const res = await fetch("https://api.exa.ai/search", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": key },
        body: JSON.stringify({
          query,
          numResults: 5,
          contents: { text: { maxCharacters: 1200 } },
        }),
        signal: AbortSignal.timeout(15000),
      });
      const data = await readJson(res);
      if (!res.ok) throw upstreamError(data, res.status, "Exa");
      results = (Array.isArray(data?.results) ? data.results : [])
        .map((x: any) => ({
          title: clean(x?.title || x?.url),
          url: clean(x?.url),
          description: clean(x?.text || x?.summary || ""),
        }))
        .filter((x: SearchResult) => x.url);
    } else if (provider === "brave") {
      const res = await fetch(
        `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=5`,
        {
          headers: { Accept: "application/json", "X-Subscription-Token": key },
          signal: AbortSignal.timeout(15000),
        }
      );
      const data = await readJson(res);
      if (!res.ok) throw upstreamError(data, res.status, "Brave");
      results = (Array.isArray(data?.web?.results) ? data.web.results : [])
        .map((x: any) => ({
          title: clean(x?.title || x?.url),
          url: clean(x?.url),
          description: clean(x?.description || ""),
        }))
        .filter((x: SearchResult) => x.url);
    } else if (provider === "custom") {
      const url = safeCustomUrl(String(body.baseUrl || ""));
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(key ? { Authorization: `Bearer ${key}` } : {}),
        },
        body: JSON.stringify({ query, limit: 5 }),
        signal: AbortSignal.timeout(15000),
      });
      const data = await readJson(res);
      if (!res.ok) throw upstreamError(data, res.status, "Search");
      const arr = data?.data?.web || data?.web?.results || data?.results || data?.web || data?.data || [];
      results = (Array.isArray(arr) ? arr : [])
        .map((x: any) => ({
          title: clean(x?.title || x?.url),
          url: clean(x?.url),
          description: clean(x?.description || x?.text || ""),
        }))
        .filter((x: SearchResult) => x.url);
    } else if (provider === "firecrawl") {
      const res = await fetch("https://api.firecrawl.dev/v2/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, limit: 5 }),
        signal: AbortSignal.timeout(15000),
      });
      const data = await readJson(res);
      if (!res.ok) throw upstreamError(data, res.status, "Firecrawl");
      results = (Array.isArray(data?.data?.web) ? data.data.web : [])
        .slice(0, 5)
        .map((x: any) => ({
          title: clean(x?.title || x?.url),
          url: clean(x?.url),
          description: clean(x?.description || ""),
        }))
        .filter((x: SearchResult) => x.url);
    } else {
      return json({ error: `Unknown search provider: ${provider}` }, 400);
    }

    return json({ provider, results: results.slice(0, 6) });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Search provider failed.";
    return json({ error: message }, 502);
  }
};
