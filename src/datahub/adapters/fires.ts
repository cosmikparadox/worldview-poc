import type { SourceAdapter, FireHotspot } from "../types";

export const nasaFirmsAdapter: SourceAdapter<FireHotspot[]> = {
  id: "nasa-firms",
  async fetch(signal) {
    const res = await fetch("/api/fires", { signal });
    if (!res.ok) throw new Error(`FIRMS proxy HTTP ${res.status}`);
    const json = await res.json();
    return (json || []).slice(0, 2000).map((f: any) => ({
      id: `fire-${f.latitude}-${f.longitude}-${f.acq_date}`,
      lat: Number(f.latitude),
      lon: Number(f.longitude),
      timestamp: new Date(
        `${f.acq_date}T${(f.acq_time || "0000").replace(/(\d{2})(\d{2})/, "$1:$2")}`
      ).getTime() || Date.now(),
      source: "firms",
      brightness: Number(f.bright_ti4 || f.brightness || 0),
      confidence: String(f.confidence || "nominal").toLowerCase(),
      frp: Number(f.frp || 0),
      satellite: String(f.satellite || "VIIRS"),
      dayNight: String(f.daynight || "D"),
    }));
  },
};
