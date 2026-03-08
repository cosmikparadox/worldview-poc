import type { SourceAdapter, MaritimeTrack } from "../types";

export const aisAdapter: SourceAdapter<MaritimeTrack[]> = {
  id: "aisstream-ships",
  async fetch(signal) {
    const res = await fetch("/api/ships", { signal });
    if (!res.ok) throw new Error(`Ships proxy HTTP ${res.status}`);
    const json = await res.json();
    return (json.ships || []).slice(0, 5000).map((s: any) => ({
      id: `ship-${s.mmsi}`,
      lat: Number(s.lat),
      lon: Number(s.lon),
      timestamp: Number(s.timestamp) || Date.now(),
      source: "aisstream",
      mmsi: Number(s.mmsi),
      name: String(s.name || ""),
      shipType: Number(s.shipType || 0),
      speed: Number(s.sog || 0),
      course: Number(s.cog || 0),
    }));
  },
};
