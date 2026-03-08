// Direct API URLs — USGS, EONET, NOAA all have CORS headers
// OpenSky works from most origins. GDELT may need fallback.
export const API = {
  earthquakes: {
    url: "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson",
    interval: 5 * 60 * 1000,
  },
  disasters: {
    url: "https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=50",
    interval: 15 * 60 * 1000,
  },
  flights: {
    url: "https://opensky-network.org/api/states/all",
    interval: 120 * 1000, // 2min to avoid 429 rate limiting on free tier
  },
  ships: {
    wsUrl: "wss://stream.aisstream.io/v0/stream",
    apiKey: import.meta.env.VITE_AISSTREAM_API_KEY || "",
  },
  news: {
    // Netlify rewrite proxy to avoid CORS issues with GDELT
    url: "/api/gdelt?query=supply%20chain%20OR%20shipping%20OR%20trade%20disruption&format=GeoJSON&maxrecords=200",
    interval: 10 * 60 * 1000,
  },
  spaceWeather: {
    url: "https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json",
    interval: 15 * 60 * 1000,
  },
  commodities: {
    baseUrl: "https://www.alphavantage.co/query",
    apiKey: import.meta.env.VITE_ALPHA_VANTAGE_KEY || "",
    interval: 30 * 60 * 1000,
  },
} as const;
