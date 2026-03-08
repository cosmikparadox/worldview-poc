import type { SourceAdapter, ConflictEvent } from "../types";

export const ucdpAdapter: SourceAdapter<ConflictEvent[]> = {
  id: "gdelt-conflicts",
  async fetch(signal) {
    const res = await fetch("/api/conflicts", { signal });
    if (!res.ok) throw new Error(`Conflicts proxy HTTP ${res.status}`);
    const json = await res.json();
    return (json.Result || []).slice(0, 500).map((e: any) => ({
      id: String(e.id || ""),
      lat: Number(e.latitude),
      lon: Number(e.longitude),
      timestamp: e.date_start
        ? new Date(e.date_start).getTime()
        : Date.now(),
      source: "gdelt",
      title: String(e.title || "Conflict event"),
      eventType: String(e.type_of_violence_text || "Armed conflict"),
      fatalities: 0, // GDELT articles don't report fatality counts
      actors: String(e.country || ""),
      region: String(e.country || ""),
      url: String(e.url || ""),
    }));
  },
};
