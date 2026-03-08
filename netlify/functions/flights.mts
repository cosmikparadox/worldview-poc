import type { Context } from "@netlify/functions";

// In-memory cache — persists across warm invocations
let cache: { data: string; timestamp: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const STALE_TTL = 30 * 60 * 1000; // serve stale for up to 30 min

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Content-Type": "application/json",
  "Cache-Control": "public, max-age=300",
};

export default async (req: Request, _context: Context) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  const now = Date.now();

  // Return cached data if fresh
  if (cache && now - cache.timestamp < CACHE_TTL) {
    return new Response(cache.data, {
      headers: { ...CORS_HEADERS, "X-Cache": "HIT" },
    });
  }

  // Try to fetch fresh data
  try {
    const url = "https://opensky-network.org/api/states/all";
    const headers: Record<string, string> = { "User-Agent": "worldview-poc/1.0" };

    // Optional: registered OpenSky credentials for 4x rate limit (4000/day vs 100)
    const username = process.env.OPENSKY_USERNAME || "";
    const password = process.env.OPENSKY_PASSWORD || "";
    if (username && password) {
      headers["Authorization"] = "Basic " + btoa(`${username}:${password}`);
    }

    const res = await fetch(url, {
      headers,
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      // If rate-limited but we have stale cache, serve stale
      if (cache && now - cache.timestamp < STALE_TTL) {
        return new Response(cache.data, {
          headers: { ...CORS_HEADERS, "X-Cache": "STALE", "X-Cache-Age": String(now - cache.timestamp) },
        });
      }
      return new Response(
        JSON.stringify({ error: `OpenSky returned ${res.status}` }),
        { status: 502, headers: CORS_HEADERS }
      );
    }

    const data = await res.text();
    cache = { data, timestamp: now };

    return new Response(data, {
      headers: { ...CORS_HEADERS, "X-Cache": "MISS" },
    });
  } catch (err) {
    // On timeout/network error, serve stale cache
    if (cache && now - cache.timestamp < STALE_TTL) {
      return new Response(cache.data, {
        headers: { ...CORS_HEADERS, "X-Cache": "STALE-ERROR" },
      });
    }
    return new Response(
      JSON.stringify({ error: "Failed to fetch flight data" }),
      { status: 502, headers: CORS_HEADERS }
    );
  }
};

export const config = {
  path: "/api/flights",
};
