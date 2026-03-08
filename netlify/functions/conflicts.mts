import type { Context } from "@netlify/functions";

let cache: { data: string; timestamp: number } | null = null;
const CACHE_TTL = 60 * 60 * 1000;
const STALE_TTL = 24 * 60 * 60 * 1000;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Content-Type": "application/json",
  "Cache-Control": "public, max-age=3600",
};

export default async (req: Request, _context: Context) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  const now = Date.now();

  if (cache && now - cache.timestamp < CACHE_TTL) {
    return new Response(cache.data, {
      headers: { ...CORS_HEADERS, "X-Cache": "HIT" },
    });
  }

  const ucdpToken = Netlify.env.get("UCDP_API_TOKEN") || "";

  try {
    // UCDP data has ~1-2 year publication lag, so try recent years
    const currentYear = new Date().getFullYear();
    const yearsToTry = [currentYear, currentYear - 1, currentYear - 2];
    const headers: Record<string, string> = { Accept: "application/json" };
    if (ucdpToken) {
      headers["x-ucdp-access-token"] = ucdpToken;
    }

    for (const year of yearsToTry) {
      const url = `https://ucdpapi.pcr.uu.se/api/gedevents/${year}?pagesize=500&page=1`;
      const res = await fetch(url, {
        headers,
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) continue;

      const text = await res.text();
      const parsed = JSON.parse(text);
      if (parsed.Result && parsed.Result.length > 0) {
        cache = { data: text, timestamp: now };
        return new Response(text, {
          headers: { ...CORS_HEADERS, "X-Cache": "MISS", "X-UCDP-Year": String(year) },
        });
      }
    }
    throw new Error("UCDP: no data for recent years");
  } catch {
    if (cache && now - cache.timestamp < STALE_TTL) {
      return new Response(cache.data, {
        headers: { ...CORS_HEADERS, "X-Cache": "STALE" },
      });
    }
    return new Response(JSON.stringify({ Result: [] }), {
      headers: { ...CORS_HEADERS, "X-Cache": "EMPTY" },
    });
  }
};

export const config = { path: "/api/conflicts" };
