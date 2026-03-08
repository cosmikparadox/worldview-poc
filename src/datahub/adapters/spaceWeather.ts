import type { SourceAdapter, SpaceWeatherReading } from "../types";

export const noaaKpAdapter: SourceAdapter<SpaceWeatherReading[]> = {
  id: "noaa-kp",
  async fetch(signal) {
    const res = await fetch(
      "https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json",
      { signal }
    );
    if (!res.ok) throw new Error(`NOAA HTTP ${res.status}`);
    const rows: string[][] = await res.json();
    // First row is header
    return rows.slice(1).map((r) => ({
      time: r[0],
      kp: parseFloat(r[1]) || 0,
      stations: parseInt(r[3]) || 0,
      source: "noaa",
    }));
  },
};
