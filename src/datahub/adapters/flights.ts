import type { SourceAdapter, AviationTrack } from "../types";

export const openskyAdapter: SourceAdapter<AviationTrack[]> = {
  id: "opensky-flights",
  async fetch(signal) {
    const res = await fetch("/api/flights", { signal });
    if (!res.ok) throw new Error(`Flights proxy HTTP ${res.status}`);
    const data = await res.json();
    if (!data.states) return [];
    return data.states
      .slice(0, 800)
      .filter((s: any[]) => s[5] != null && s[6] != null && !s[8])
      .map((s: any[]) => ({
        id: String(s[0]),
        lat: Number(s[6]),
        lon: Number(s[5]),
        timestamp: Date.now(),
        source: "opensky",
        callsign: String(s[1] || "").trim(),
        country: String(s[2] || ""),
        altitude: Number(s[7] || s[13] || 0),
        velocity: Number(s[9] || 0),
        heading: Number(s[10] || 0),
        onGround: Boolean(s[8]),
      }));
  },
};
