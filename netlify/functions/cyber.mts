import type { Context } from "@netlify/functions";

let cache: { data: string; timestamp: number } | null = null;
const CACHE_TTL = 15 * 60 * 1000;
const STALE_TTL = 2 * 60 * 60 * 1000;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Content-Type": "application/json",
  "Cache-Control": "public, max-age=900",
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

  const apiKey = process.env.OTX_API_KEY || "";
  if (!apiKey) {
    return new Response(JSON.stringify({ results: [] }), {
      headers: { ...CORS_HEADERS, "X-Cache": "NO-KEY" },
    });
  }

  try {
    const url =
      "https://otx.alienvault.com/api/v1/pulses/subscribed?limit=20&modified_since=7d";
    const res = await fetch(url, {
      headers: { "X-OTX-API-KEY": apiKey },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) throw new Error(`OTX HTTP ${res.status}`);

    const data = await res.text();
    cache = { data, timestamp: now };
    return new Response(data, {
      headers: { ...CORS_HEADERS, "X-Cache": "MISS" },
    });
  } catch {
    if (cache && now - cache.timestamp < STALE_TTL) {
      return new Response(cache.data, {
        headers: { ...CORS_HEADERS, "X-Cache": "STALE" },
      });
    }
    return new Response(JSON.stringify({ results: [] }), {
      headers: { ...CORS_HEADERS, "X-Cache": "EMPTY" },
    });
  }
};

export const config = { path: "/api/cyber" };
