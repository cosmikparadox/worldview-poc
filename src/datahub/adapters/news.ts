import type { SourceAdapter, NewsItem } from "../types";

export const gdeltAdapter: SourceAdapter<NewsItem[]> = {
  id: "gdelt-news",
  async fetch(signal) {
    const res = await fetch("/api/news", { signal });
    if (!res.ok) throw new Error(`News proxy HTTP ${res.status}`);
    const geojson = await res.json();
    if (!geojson.features) return [];
    return geojson.features
      .filter((f: any) => f.geometry?.coordinates?.length >= 2)
      .slice(0, 300)
      .map((f: any, i: number) => ({
        id: `news-${i}`,
        lat: f.geometry.coordinates[1],
        lon: f.geometry.coordinates[0],
        timestamp: Date.now(),
        source: "gdelt",
        title: String(f.properties.name || "News event"),
        url: String(f.properties.url || f.properties.urlmobile || ""),
        tone: Number(f.properties.tone || f.properties.tonez || 0),
      }));
  },
};
