// API Configuration
// Direct APIs: USGS, EONET, NOAA (CORS-friendly, no auth needed)
// Proxied APIs: Flights, News, Commodities (via Netlify Functions for caching + auth)
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
    url: "/api/flights", // Netlify Function: server-side cached OpenSky proxy
    interval: 5 * 60 * 1000,
  },
  ships: {
    wsUrl: "wss://stream.aisstream.io/v0/stream",
    apiKey: import.meta.env.VITE_AISSTREAM_API_KEY || "",
  },
  news: {
    url: "/api/news", // Netlify Function: server-side cached GDELT proxy
    interval: 10 * 60 * 1000,
  },
  spaceWeather: {
    url: "https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json",
    interval: 15 * 60 * 1000,
  },
  commodities: {
    proxyUrl: "/api/commodities", // Netlify Function: server-side cached Alpha Vantage proxy
    baseUrl: "https://www.alphavantage.co/query",
    apiKey: import.meta.env.VITE_ALPHA_VANTAGE_KEY || "",
    interval: 30 * 60 * 1000,
  },
} as const;
