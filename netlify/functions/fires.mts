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

  const mapKey = process.env.NASA_FIRMS_MAP_KEY || "";
  if (!mapKey) {
    // Return empty array instead of error so the layer degrades gracefully
    return new Response(JSON.stringify([]), {
      headers: { ...CORS_HEADERS, "X-Cache": "NO-KEY" },
    });
  }

  try {
    const url = `https://firms.modaps.eosdis.nasa.gov/api/area/json/${mapKey}/VIIRS_SNPP_NRT/world/1`;
    const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
    if (!res.ok) throw new Error(`FIRMS HTTP ${res.status}`);

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
    return new Response(JSON.stringify([]), {
      headers: { ...CORS_HEADERS, "X-Cache": "EMPTY" },
    });
  }
};

export const config = { path: "/api/fires" };
