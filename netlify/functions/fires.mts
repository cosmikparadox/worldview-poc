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

// Parse FIRMS CSV into JSON array
function parseFirmsCsv(csv: string): Record<string, string>[] {
  const lines = csv.trim().split("\n");
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim());
  const results: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",");
    if (values.length !== headers.length) continue;
    const row: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = values[j]?.trim() || "";
    }
    // Skip rows without valid coordinates
    if (!row.latitude || !row.longitude) continue;
    results.push(row);
  }

  return results;
}

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
    return new Response(JSON.stringify([]), {
      headers: { ...CORS_HEADERS, "X-Cache": "NO-KEY" },
    });
  }

  try {
    // FIRMS only supports CSV format (not JSON)
    const url = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${mapKey}/VIIRS_SNPP_NRT/world/1`;
    const res = await fetch(url, {
      signal: AbortSignal.timeout(30000),
      redirect: "error", // Don't follow redirects to login pages
    });
    if (!res.ok) throw new Error(`FIRMS HTTP ${res.status}`);

    const csvText = await res.text();

    // Check if we got HTML instead of CSV (redirect to login page)
    if (csvText.trimStart().startsWith("<!DOCTYPE") || csvText.trimStart().startsWith("<html")) {
      throw new Error("FIRMS returned HTML instead of CSV — key may be invalid");
    }

    const parsed = parseFirmsCsv(csvText);
    const data = JSON.stringify(parsed);

    if (parsed.length > 0) {
      cache = { data, timestamp: now };
    }

    return new Response(data, {
      headers: {
        ...CORS_HEADERS,
        "X-Cache": "MISS",
        "X-Fire-Count": String(parsed.length),
      },
    });
  } catch (err) {
    if (cache && now - cache.timestamp < STALE_TTL) {
      return new Response(cache.data, {
        headers: { ...CORS_HEADERS, "X-Cache": "STALE" },
      });
    }
    return new Response(JSON.stringify([]), {
      headers: {
        ...CORS_HEADERS,
        "X-Cache": "EMPTY",
        "X-Error": String(err instanceof Error ? err.message : "unknown"),
      },
    });
  }
};

export const config = { path: "/api/fires" };
