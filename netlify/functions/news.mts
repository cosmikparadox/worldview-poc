import type { Context } from "@netlify/functions";

// In-memory cache
let cache: { data: string; timestamp: number } | null = null;
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes
const STALE_TTL = 60 * 60 * 1000; // serve stale 1 hour

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Content-Type": "application/json",
  "Cache-Control": "public, max-age=600",
};

// GDELT GKG GeoJSON API — try multiple query patterns (broader → narrower)
const GDELT_URLS = [
  "https://api.gdeltproject.org/api/v2/geo/geo?query=conflict%20OR%20disaster%20OR%20earthquake%20OR%20flood&format=GeoJSON&maxrecords=200",
  "https://api.gdeltproject.org/api/v2/geo/geo?query=shipping%20OR%20trade%20OR%20supply%20chain&format=GeoJSON&maxrecords=200",
  "https://api.gdeltproject.org/api/v2/geo/geo?query=crisis%20OR%20war%20OR%20sanctions&format=GeoJSON&maxrecords=100",
];

export default async (req: Request, _context: Context) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  const now = Date.now();

  // Return cached if fresh
  if (cache && now - cache.timestamp < CACHE_TTL) {
    return new Response(cache.data, {
      headers: { ...CORS_HEADERS, "X-Cache": "HIT" },
    });
  }

  // Try GDELT endpoints
  for (const url of GDELT_URLS) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "worldview-poc/1.0" },
        signal: AbortSignal.timeout(15000),
      });

      if (res.ok) {
        const text = await res.text();
        // Validate it's actual GeoJSON
        try {
          const parsed = JSON.parse(text);
          if (parsed.type === "FeatureCollection" && Array.isArray(parsed.features)) {
            cache = { data: text, timestamp: now };
            return new Response(text, {
              headers: { ...CORS_HEADERS, "X-Cache": "MISS" },
            });
          }
        } catch {
          // Not valid JSON, try next URL
        }
      }
    } catch {
      // Try next URL
    }
  }

  // GDELT down — return stale or empty GeoJSON
  if (cache && now - cache.timestamp < STALE_TTL) {
    return new Response(cache.data, {
      headers: { ...CORS_HEADERS, "X-Cache": "STALE" },
    });
  }

  // Return empty GeoJSON as graceful fallback
  const empty = JSON.stringify({
    type: "FeatureCollection",
    features: [],
  });
  return new Response(empty, {
    headers: { ...CORS_HEADERS, "X-Cache": "EMPTY" },
  });
};

export const config = {
  path: "/api/news",
};
