import type { SourceAdapter, DisasterEvent } from "../types";

export const eonetAdapter: SourceAdapter<DisasterEvent[]> = {
  id: "nasa-eonet",
  async fetch(signal) {
    const res = await fetch(
      "https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=50",
      { signal }
    );
    if (!res.ok) throw new Error(`EONET HTTP ${res.status}`);
    const data = await res.json();
    return (data.events || [])
      .filter((e: any) => e.geometry?.length > 0)
      .map((e: any) => {
        const geo = e.geometry[e.geometry.length - 1];
        return {
          id: e.id,
          lat: geo.coordinates[1],
          lon: geo.coordinates[0],
          timestamp: new Date(geo.date).getTime(),
          source: "eonet",
          title: e.title,
          category: e.categories?.[0]?.title || "Unknown",
          link: e.sources?.[0]?.url || "",
        };
      });
  },
};
