// All external APIs proxied through Netlify _redirects to avoid CORS
export const API = {
  earthquakes: {
    url: "/api/usgs/earthquakes/feed/v1.0/summary/all_day.geojson",
    interval: 5 * 60 * 1000,
  },
  disasters: {
    url: "/api/eonet/v3/events?status=open&limit=50",
    interval: 15 * 60 * 1000,
  },
  flights: {
    url: "/api/opensky/states/all",
    interval: 60 * 1000, // 60s — be gentle on OpenSky rate limits
  },
  ships: {
    wsUrl: "wss://stream.aisstream.io/v0/stream",
    apiKey: import.meta.env.VITE_AISSTREAM_API_KEY || "",
  },
  news: {
    url: "/api/gdelt/v2/geo/geo?query=supply%20chain%20OR%20shipping%20OR%20trade%20disruption&format=GeoJSON&maxrecords=200",
    interval: 10 * 60 * 1000,
  },
  spaceWeather: {
    url: "/api/swpc/products/noaa-planetary-k-index.json",
    interval: 15 * 60 * 1000,
  },
  commodities: {
    baseUrl: "https://www.alphavantage.co/query",
    apiKey: import.meta.env.VITE_ALPHA_VANTAGE_KEY || "",
    interval: 30 * 60 * 1000,
  },
} as const;
