import { useCallback } from "react";
import { useDataFetcher } from "./useDataFetcher";
import { useLayerStore } from "../stores/useLayerStore";
import { API } from "../config/api";

export interface Disaster {
  id: string;
  title: string;
  category: string;
  lon: number;
  lat: number;
  date: string;
  source: string;
  link: string;
}

export function useDisasters() {
  const enabled = useLayerStore((s) => s.layers.disasters);

  const transform = useCallback((raw: unknown): Disaster[] => {
    const data = raw as { events: Array<{ id: string; title: string; categories: Array<{ title: string }>; geometry: Array<{ coordinates: number[]; date: string }>; sources: Array<{ url: string }> }> };
    return (data.events || [])
      .filter((e) => e.geometry?.length > 0)
      .map((e) => {
        const geo = e.geometry[e.geometry.length - 1];
        return {
          id: e.id,
          title: e.title,
          category: e.categories?.[0]?.title || "Unknown",
          lon: geo.coordinates[0],
          lat: geo.coordinates[1],
          date: geo.date,
          source: e.sources?.[0]?.url || "",
          link: e.sources?.[0]?.url || "",
        };
      });
  }, []);

  return useDataFetcher<Disaster[]>({
    key: "disasters",
    url: API.disasters.url,
    interval: API.disasters.interval,
    transform,
    enabled,
  });
}
