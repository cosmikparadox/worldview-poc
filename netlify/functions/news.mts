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

// Country name → approximate centroid for geocoding
const COUNTRY_COORDS: Record<string, [number, number]> = {
  "United States": [39.8, -98.6], "United Kingdom": [54.0, -2.0],
  "China": [35.0, 105.0], "India": [20.6, 79.0], "Russia": [61.5, 105.3],
  "Japan": [36.2, 138.3], "Germany": [51.2, 10.4], "France": [46.2, 2.2],
  "Brazil": [-14.2, -51.9], "Australia": [-25.3, 133.8],
  "Canada": [56.1, -106.3], "South Korea": [35.9, 127.8],
  "Italy": [41.9, 12.6], "Spain": [40.5, -3.7], "Mexico": [23.6, -102.6],
  "Indonesia": [-0.8, 113.9], "Turkey": [38.9, 35.2], "Saudi Arabia": [23.9, 45.1],
  "Iran": [32.4, 53.7], "Iraq": [33.2, 43.7], "Israel": [31.0, 34.9],
  "Egypt": [26.8, 30.8], "Nigeria": [9.1, 8.7], "South Africa": [-30.6, 22.9],
  "Pakistan": [30.4, 69.3], "Afghanistan": [33.9, 67.7], "Ukraine": [48.4, 31.2],
  "Poland": [51.9, 19.1], "Netherlands": [52.1, 5.3], "Belgium": [50.5, 4.5],
  "Sweden": [60.1, 18.6], "Norway": [60.5, 8.5], "Taiwan": [23.7, 120.9],
  "Philippines": [12.9, 121.8], "Thailand": [15.9, 100.9], "Vietnam": [14.1, 108.3],
  "Malaysia": [4.2, 101.9], "Singapore": [1.4, 103.8], "Myanmar": [21.9, 95.9],
  "Colombia": [4.6, -74.3], "Argentina": [-38.4, -63.6], "Chile": [-35.7, -71.5],
  "Peru": [-9.2, -75.0], "Venezuela": [6.4, -66.6], "Syria": [35.0, 38.0],
  "Yemen": [15.6, 48.5], "Libya": [26.3, 17.2], "Sudan": [12.9, 30.2],
  "Ethiopia": [9.1, 40.5], "Kenya": [-0.0, 37.9], "Somalia": [5.2, 46.2],
  "Congo": [-4.0, 21.8], "Tanzania": [-6.4, 34.9], "Morocco": [31.8, -7.1],
  "Algeria": [28.0, 1.7], "Tunisia": [34.0, 9.5], "Ghana": [7.9, -1.0],
  "Senegal": [14.5, -14.5], "Lebanon": [33.9, 35.9], "Jordan": [30.6, 36.2],
  "UAE": [23.4, 53.8], "Qatar": [25.4, 51.2], "Kuwait": [29.3, 47.5],
  "Oman": [21.5, 55.9], "Bahrain": [26.0, 50.6], "Bangladesh": [23.7, 90.4],
  "Sri Lanka": [7.9, 80.8], "Nepal": [28.4, 84.1], "Cambodia": [12.6, 105.0],
  "New Zealand": [-40.9, 174.9], "Ireland": [53.4, -8.2],
  "Portugal": [39.4, -8.2], "Greece": [39.1, 21.8], "Austria": [47.5, 14.6],
  "Switzerland": [46.8, 8.2], "Czech Republic": [49.8, 15.5],
  "Romania": [45.9, 25.0], "Hungary": [47.2, 19.5], "Finland": [61.9, 25.7],
  "Denmark": [56.3, 9.5], "Slovakia": [48.7, 19.7], "Croatia": [45.1, 15.2],
  "Bulgaria": [42.7, 25.5], "Serbia": [44.0, 21.0],
};

// GDELT DOC API queries — parenthesized OR terms, English only
const GDELT_QUERIES = [
  "(earthquake OR tsunami OR hurricane OR typhoon OR wildfire) sourcelang:english",
  "(war OR conflict OR military OR airstrike OR bombing) sourcelang:english",
  "(trade OR sanctions OR supply chain OR shipping disruption) sourcelang:english",
];

interface GdeltArticle {
  url: string;
  title: string;
  seendate: string;
  domain: string;
  language: string;
  sourcecountry: string;
  socialimage?: string;
}

function articleToFeature(article: GdeltArticle, index: number) {
  const country = article.sourcecountry || "";
  const coords = COUNTRY_COORDS[country];
  if (!coords) return null;

  // Add small jitter so dots don't stack
  const jitter = () => (Math.random() - 0.5) * 4;
  const lat = coords[0] + jitter();
  const lon = coords[1] + jitter();

  return {
    type: "Feature" as const,
    geometry: { type: "Point" as const, coordinates: [lon, lat] },
    properties: {
      name: article.title || "",
      url: article.url || "",
      domain: article.domain || "",
      sourcecountry: country,
      seendate: article.seendate || "",
      tone: 0, // DOC artlist doesn't include tone
      urltone: 0,
    },
  };
}

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

  // Try each GDELT DOC query until we get articles
  const allFeatures: ReturnType<typeof articleToFeature>[] = [];

  for (const query of GDELT_QUERIES) {
    try {
      const encoded = encodeURIComponent(query);
      const url = `https://api.gdeltproject.org/api/v2/doc/doc?query=${encoded}&mode=artlist&format=json&maxrecords=75&timespan=1d`;
      const res = await fetch(url, {
        headers: { "User-Agent": "worldview-poc/1.0" },
        signal: AbortSignal.timeout(15000),
      });

      if (!res.ok) continue;

      const text = await res.text();
      // Check for rate limit text response
      if (text.includes("Please limit requests")) {
        // Wait and skip this query
        await new Promise((r) => setTimeout(r, 6000));
        continue;
      }

      const parsed = JSON.parse(text);
      const articles: GdeltArticle[] = parsed.articles || [];

      for (let i = 0; i < articles.length; i++) {
        const feature = articleToFeature(articles[i], i);
        if (feature) allFeatures.push(feature);
      }

      // Rate limit: wait 6s between GDELT requests
      if (GDELT_QUERIES.indexOf(query) < GDELT_QUERIES.length - 1) {
        await new Promise((r) => setTimeout(r, 6000));
      }
    } catch {
      // Continue to next query
    }
  }

  // Build GeoJSON response (same format the client adapter expects)
  const geojson = {
    type: "FeatureCollection",
    features: allFeatures.filter(Boolean),
  };

  const data = JSON.stringify(geojson);

  if (allFeatures.length > 0) {
    cache = { data, timestamp: now };
  }

  return new Response(data, {
    headers: {
      ...CORS_HEADERS,
      "X-Cache": allFeatures.length > 0 ? "MISS" : "EMPTY",
      "X-News-Count": String(allFeatures.length),
    },
  });
};

export const config = {
  path: "/api/news",
};
