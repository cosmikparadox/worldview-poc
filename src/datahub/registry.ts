import type { SourceRegistration } from "./types";
import { usgsAdapter, emscAdapter } from "./adapters/earthquakes";
import { eonetAdapter } from "./adapters/disasters";
import { openskyAdapter } from "./adapters/flights";
import { aisAdapter } from "./adapters/ships";
import { gdeltAdapter } from "./adapters/news";
import { alphaVantageAdapter } from "./adapters/commodities";
import { noaaKpAdapter } from "./adapters/spaceWeather";
import { openMeteoAdapter } from "./adapters/weather";
import { nasaFirmsAdapter } from "./adapters/fires";
import { ucdpAdapter } from "./adapters/conflicts";
import { otxAdapter } from "./adapters/cyberThreats";

export const SOURCE_REGISTRY: SourceRegistration[] = [
  // ── Seismic ──
  {
    id: "usgs-earthquakes",
    category: "seismic",
    name: "USGS Earthquakes",
    fetchMode: "poll",
    priority: 0,
    adapter: usgsAdapter,
    cacheTtlMs: 5 * 60 * 1000,
    pollIntervalMs: 5 * 60 * 1000,
    enabled: true,
    requiresAuth: false,
  },
  {
    id: "emsc-earthquakes",
    category: "seismic",
    name: "EMSC Earthquakes",
    fetchMode: "poll",
    priority: 1,
    adapter: emscAdapter,
    cacheTtlMs: 5 * 60 * 1000,
    pollIntervalMs: 5 * 60 * 1000,
    enabled: true,
    requiresAuth: false,
  },

  // ── Disasters ──
  {
    id: "nasa-eonet",
    category: "disaster",
    name: "NASA EONET",
    fetchMode: "poll",
    priority: 0,
    adapter: eonetAdapter,
    cacheTtlMs: 15 * 60 * 1000,
    pollIntervalMs: 15 * 60 * 1000,
    enabled: true,
    requiresAuth: false,
  },

  // ── Aviation ──
  {
    id: "opensky-flights",
    category: "aviation",
    name: "OpenSky Network",
    fetchMode: "poll",
    priority: 0,
    adapter: openskyAdapter,
    cacheTtlMs: 5 * 60 * 1000,
    pollIntervalMs: 5 * 60 * 1000,
    enabled: true,
    requiresAuth: false,
    maxItems: 800,
  },

  // ── Maritime ──
  {
    id: "aisstream-ships",
    category: "maritime",
    name: "AISStream",
    fetchMode: "poll",
    priority: 0,
    adapter: aisAdapter,
    cacheTtlMs: 30 * 1000,
    pollIntervalMs: 30 * 1000,
    enabled: true,
    requiresAuth: true,
    maxItems: 5000,
  },

  // ── News ──
  {
    id: "gdelt-news",
    category: "news",
    name: "GDELT Project",
    fetchMode: "poll",
    priority: 0,
    adapter: gdeltAdapter,
    cacheTtlMs: 10 * 60 * 1000,
    pollIntervalMs: 10 * 60 * 1000,
    enabled: true,
    requiresAuth: false,
    maxItems: 300,
  },

  // ── Commodities ──
  {
    id: "alpha-vantage",
    category: "commodity",
    name: "Alpha Vantage",
    fetchMode: "poll",
    priority: 0,
    adapter: alphaVantageAdapter,
    cacheTtlMs: 30 * 60 * 1000,
    pollIntervalMs: 30 * 60 * 1000,
    enabled: true,
    requiresAuth: true,
  },

  // ── Space Weather ──
  {
    id: "noaa-kp",
    category: "spaceWeather",
    name: "NOAA Space Weather",
    fetchMode: "poll",
    priority: 0,
    adapter: noaaKpAdapter,
    cacheTtlMs: 15 * 60 * 1000,
    pollIntervalMs: 15 * 60 * 1000,
    enabled: true,
    requiresAuth: false,
  },

  // ── Weather (NEW) ──
  {
    id: "openmeteo-weather",
    category: "weather",
    name: "Open-Meteo",
    fetchMode: "poll",
    priority: 0,
    adapter: openMeteoAdapter,
    cacheTtlMs: 15 * 60 * 1000,
    pollIntervalMs: 15 * 60 * 1000,
    enabled: true,
    requiresAuth: false,
  },

  // ── Fires (NEW) ──
  {
    id: "nasa-firms",
    category: "fire",
    name: "NASA FIRMS",
    fetchMode: "poll",
    priority: 0,
    adapter: nasaFirmsAdapter,
    cacheTtlMs: 15 * 60 * 1000,
    pollIntervalMs: 15 * 60 * 1000,
    enabled: true,
    requiresAuth: true,
  },

  // ── Conflicts (NEW — replaces ACLED) ──
  {
    id: "ucdp-ged",
    category: "conflict",
    name: "UCDP GED",
    fetchMode: "poll",
    priority: 0,
    adapter: ucdpAdapter,
    cacheTtlMs: 60 * 60 * 1000,
    pollIntervalMs: 60 * 60 * 1000,
    enabled: true,
    requiresAuth: false,
  },

  // ── Cyber Threats (NEW) ──
  {
    id: "otx-cyber",
    category: "cyber",
    name: "AlienVault OTX",
    fetchMode: "poll",
    priority: 0,
    adapter: otxAdapter,
    cacheTtlMs: 15 * 60 * 1000,
    pollIntervalMs: 15 * 60 * 1000,
    enabled: true,
    requiresAuth: true,
  },
];
