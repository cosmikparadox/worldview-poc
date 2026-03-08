// ── Data Categories ──
export type DataCategory =
  | "seismic"
  | "disaster"
  | "aviation"
  | "maritime"
  | "weather"
  | "news"
  | "conflict"
  | "cyber"
  | "commodity"
  | "fire"
  | "spaceWeather";

// ── Base Geo Entity ──
export interface GeoEntity {
  id: string;
  lat: number;
  lon: number;
  timestamp: number; // Unix ms
  source: string; // which adapter produced this
}

// ── Normalized Schemas per Category ──

export interface SeismicEvent extends GeoEntity {
  magnitude: number;
  depth: number;
  title: string;
  url: string;
}

export interface DisasterEvent extends GeoEntity {
  title: string;
  category: string;
  link: string;
}

export interface AviationTrack extends GeoEntity {
  callsign: string;
  country: string;
  altitude: number;
  velocity: number;
  heading: number;
  onGround: boolean;
}

export interface MaritimeTrack extends GeoEntity {
  mmsi: number;
  name: string;
  shipType: number;
  speed: number;
  course: number;
}

export interface WeatherPoint extends GeoEntity {
  temperature: number;
  windSpeed: number;
  windDirection: number;
  humidity: number;
  condition: string;
  precipitation: number;
}

export interface NewsItem extends GeoEntity {
  title: string;
  url: string;
  tone: number;
}

export interface ConflictEvent extends GeoEntity {
  title: string;
  eventType: string;
  fatalities: number;
  actors: string;
  region: string;
  url: string;
}

export interface CyberThreat extends GeoEntity {
  indicatorType: string;
  indicator: string;
  threatType: string;
  pulseCount: number;
  country: string;
  description: string;
}

export interface CommodityPrice {
  symbol: string;
  name: string;
  price: number;
  change: number;
  unit: string;
  lastUpdated: string;
  source: string;
}

export interface FireHotspot extends GeoEntity {
  brightness: number;
  confidence: string;
  frp: number;
  satellite: string;
  dayNight: string;
}

export interface SpaceWeatherReading {
  time: string;
  kp: number;
  stations: number;
  source: string;
}

// ── Category-to-Schema type map ──
export interface CategoryDataMap {
  seismic: SeismicEvent[];
  disaster: DisasterEvent[];
  aviation: AviationTrack[];
  maritime: MaritimeTrack[];
  weather: WeatherPoint[];
  news: NewsItem[];
  conflict: ConflictEvent[];
  cyber: CyberThreat[];
  commodity: CommodityPrice[];
  fire: FireHotspot[];
  spaceWeather: SpaceWeatherReading[];
}

// ── Source Health ──
export type HealthStatus = "ok" | "degraded" | "down" | "idle";

export interface SourceHealth {
  status: HealthStatus;
  lastFetchMs: number | null;
  lastAttemptMs: number | null;
  consecutiveFailures: number;
  lastError: string | null;
  latencyMs: number | null;
  isStale: boolean;
}

// ── Source Adapter Interface ──
export type FetchMode = "poll" | "websocket" | "static";

export interface SourceAdapter<T> {
  id: string;
  fetch: (signal: AbortSignal) => Promise<T>;
}

// ── Source Registration ──
export interface SourceRegistration<K extends DataCategory = DataCategory> {
  id: string;
  category: K;
  name: string;
  fetchMode: FetchMode;
  priority: number; // lower = higher priority
  adapter: SourceAdapter<CategoryDataMap[K]>;
  cacheTtlMs: number;
  pollIntervalMs: number;
  enabled: boolean;
  requiresAuth: boolean;
  maxItems?: number;
}
