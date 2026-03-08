import type { SourceAdapter, WeatherPoint } from "../types";

// ~50 major supply-chain-relevant cities worldwide
const WEATHER_GRID = [
  { name: "New York", lat: 40.71, lon: -74.01 },
  { name: "Los Angeles", lat: 34.05, lon: -118.24 },
  { name: "Houston", lat: 29.76, lon: -95.37 },
  { name: "Chicago", lat: 41.88, lon: -87.63 },
  { name: "London", lat: 51.51, lon: -0.13 },
  { name: "Rotterdam", lat: 51.92, lon: 4.48 },
  { name: "Hamburg", lat: 53.55, lon: 9.99 },
  { name: "Paris", lat: 48.86, lon: 2.35 },
  { name: "Istanbul", lat: 41.01, lon: 28.98 },
  { name: "Dubai", lat: 25.2, lon: 55.27 },
  { name: "Mumbai", lat: 19.08, lon: 72.88 },
  { name: "Delhi", lat: 28.61, lon: 77.21 },
  { name: "Singapore", lat: 1.35, lon: 103.82 },
  { name: "Shanghai", lat: 31.23, lon: 121.47 },
  { name: "Beijing", lat: 39.9, lon: 116.4 },
  { name: "Shenzhen", lat: 22.54, lon: 114.06 },
  { name: "Tokyo", lat: 35.68, lon: 139.69 },
  { name: "Seoul", lat: 37.57, lon: 126.98 },
  { name: "Busan", lat: 35.18, lon: 129.08 },
  { name: "Sydney", lat: -33.87, lon: 151.21 },
  { name: "Sao Paulo", lat: -23.55, lon: -46.63 },
  { name: "Lagos", lat: 6.45, lon: 3.4 },
  { name: "Cape Town", lat: -33.92, lon: 18.42 },
  { name: "Cairo", lat: 30.04, lon: 31.24 },
  { name: "Moscow", lat: 55.76, lon: 37.62 },
  { name: "Taipei", lat: 25.03, lon: 121.57 },
  { name: "Bangkok", lat: 13.76, lon: 100.5 },
  { name: "Jakarta", lat: -6.21, lon: 106.85 },
  { name: "Ho Chi Minh", lat: 10.82, lon: 106.63 },
  { name: "Colombo", lat: 6.93, lon: 79.85 },
  { name: "Suez", lat: 29.97, lon: 32.55 },
  { name: "Panama City", lat: 8.98, lon: -79.52 },
  { name: "Antwerp", lat: 51.22, lon: 4.4 },
  { name: "Vancouver", lat: 49.28, lon: -123.12 },
  { name: "Jeddah", lat: 21.49, lon: 39.19 },
  { name: "Karachi", lat: 24.86, lon: 67.01 },
  { name: "Lima", lat: -12.05, lon: -77.04 },
  { name: "Santiago", lat: -33.45, lon: -70.67 },
  { name: "Mexico City", lat: 19.43, lon: -99.13 },
  { name: "Johannesburg", lat: -26.2, lon: 28.04 },
  { name: "Durban", lat: -29.86, lon: 31.02 },
  { name: "Algiers", lat: 36.75, lon: 3.06 },
  { name: "Casablanca", lat: 33.57, lon: -7.59 },
  { name: "Nairobi", lat: -1.29, lon: 36.82 },
  { name: "Doha", lat: 25.29, lon: 51.53 },
  { name: "Kuala Lumpur", lat: 3.14, lon: 101.69 },
  { name: "Manila", lat: 14.6, lon: 120.98 },
  { name: "Osaka", lat: 34.69, lon: 135.5 },
  { name: "Hong Kong", lat: 22.32, lon: 114.17 },
];

function wmoCodeToLabel(code: number): string {
  if (code === 0) return "Clear";
  if (code <= 3) return "Partly Cloudy";
  if (code <= 48) return "Fog";
  if (code <= 57) return "Drizzle";
  if (code <= 67) return "Rain";
  if (code <= 77) return "Snow";
  if (code <= 82) return "Rain Showers";
  if (code <= 86) return "Snow Showers";
  if (code >= 95) return "Thunderstorm";
  return "Unknown";
}

export const openMeteoAdapter: SourceAdapter<WeatherPoint[]> = {
  id: "openmeteo-weather",
  async fetch(signal) {
    const lats = WEATHER_GRID.map((p) => p.lat).join(",");
    const lons = WEATHER_GRID.map((p) => p.lon).join(",");
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}&current=temperature_2m,wind_speed_10m,wind_direction_10m,relative_humidity_2m,weather_code,precipitation&timezone=auto`;

    const res = await fetch(url, { signal });
    if (!res.ok) throw new Error(`Open-Meteo HTTP ${res.status}`);
    const json = await res.json();

    const results = Array.isArray(json) ? json : [json];
    return results.map((loc: any, i: number) => {
      const current = loc.current;
      return {
        id: `weather-${WEATHER_GRID[i].name.replace(/\s+/g, "-").toLowerCase()}`,
        lat: WEATHER_GRID[i].lat,
        lon: WEATHER_GRID[i].lon,
        timestamp: current?.time
          ? new Date(current.time).getTime()
          : Date.now(),
        source: "openmeteo",
        temperature: current?.temperature_2m ?? 0,
        windSpeed: current?.wind_speed_10m ?? 0,
        windDirection: current?.wind_direction_10m ?? 0,
        humidity: current?.relative_humidity_2m ?? 0,
        condition: wmoCodeToLabel(current?.weather_code ?? 0),
        precipitation: current?.precipitation ?? 0,
      };
    });
  },
};
