import { useCallback } from "react";
import { useDataFetcher } from "./useDataFetcher";
import { useLayerStore } from "../stores/useLayerStore";
import { API } from "../config/api";

export interface NewsEvent {
  id: string;
  name: string;
  url: string;
  lon: number;
  lat: number;
  tone: number;
}

export function useNews() {
  const enabled = useLayerStore((s) => s.layers.news);

  const transform = useCallback((raw: unknown): NewsEvent[] => {
    const geojson = raw as {
      features?: Array<{
        properties: Record<string, unknown>;
        geometry: { coordinates: number[] };
      }>;
    };
    if (!geojson.features) return [];
    return geojson.features
      .filter((f) => f.geometry?.coordinates?.length >= 2)
      .slice(0, 300)
      .map((f, i) => ({
        id: `news-${i}`,
        name: String(f.properties.name || "News event"),
        url: String(f.properties.url || f.properties.urlmobile || ""),
        lon: f.geometry.coordinates[0],
        lat: f.geometry.coordinates[1],
        tone: Number(f.properties.tonez || 0),
      }));
  }, []);

  return useDataFetcher<NewsEvent[]>({
    key: "news",
    url: API.news.url,
    interval: API.news.interval,
    transform,
    enabled,
  });
}
