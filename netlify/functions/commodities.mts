import type { Context } from "@netlify/functions";

// In-memory cache per commodity — survives warm invocations
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 4 * 60 * 60 * 1000; // 4 hours (Alpha Vantage: 25 req/day free tier)
const STALE_TTL = 24 * 60 * 60 * 1000; // serve stale for up to 24 hours

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Content-Type": "application/json",
  "Cache-Control": "public, max-age=3600",
};

const COMMODITIES = ["WTI", "BRENT", "NATURAL_GAS", "COPPER", "ALUMINUM"];

export default async (req: Request, _context: Context) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  const apiKey = process.env.VITE_ALPHA_VANTAGE_KEY || "";
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "VITE_ALPHA_VANTAGE_KEY not configured" }),
      { status: 500, headers: CORS_HEADERS }
    );
  }

  const now = Date.now();
  const results: Record<string, unknown> = {};
  let fetchedAny = false;

  for (const symbol of COMMODITIES) {
    const cached = cache.get(symbol);

    // Use cache if fresh
    if (cached && now - cached.timestamp < CACHE_TTL) {
      results[symbol] = cached.data;
      continue;
    }

    // Try to fetch fresh
    try {
      const url = `https://www.alphavantage.co/query?function=${symbol}&interval=daily&apikey=${apiKey}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
      const json = await res.json();

      // Rate limited
      if (json["Note"] || json["Information"]) {
        // Serve stale if available
        if (cached && now - cached.timestamp < STALE_TTL) {
          results[symbol] = cached.data;
        }
        break; // Stop fetching more — we're rate limited
      }

      cache.set(symbol, { data: json, timestamp: now });
      results[symbol] = json;
      fetchedAny = true;

      // 1.5s delay between requests to respect rate limits
      if (COMMODITIES.indexOf(symbol) < COMMODITIES.length - 1) {
        await new Promise((r) => setTimeout(r, 1500));
      }
    } catch {
      // Serve stale on error
      if (cached && now - cached.timestamp < STALE_TTL) {
        results[symbol] = cached.data;
      }
    }
  }

  // Fill any remaining from stale cache
  for (const symbol of COMMODITIES) {
    if (!results[symbol]) {
      const cached = cache.get(symbol);
      if (cached) results[symbol] = cached.data;
    }
  }

  return new Response(JSON.stringify(results), {
    headers: {
      ...CORS_HEADERS,
      "X-Cache": fetchedAny ? "MISS" : "HIT",
    },
  });
};

export const config = {
  path: "/api/commodities",
};
