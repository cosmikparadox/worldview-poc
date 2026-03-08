import { useCallback } from "react";
import { useDataFetcher } from "./useDataFetcher";
import { useLayerStore } from "../stores/useLayerStore";
import { API } from "../config/api";

export interface Earthquake {
  id: string;
  title: string;
  mag: number;
  depth: number;
  time: number;
  lon: number;
  lat: number;
  url: string;
}

export function useEarthquakes() {
  const enabled = useLayerStore((s) => s.layers.earthquakes);

  const transform = useCallback((raw: unknown): Earthquake[] => {
    const geojson = raw as { features: Array<{ id: string; properties: Record<string, unknown>; geometry: { coordinates: number[] } }> };
    return (geojson.features || []).map((f) => ({
      id: String(f.id),
      title: String(f.properties.title || ""),
      mag: Number(f.properties.mag || 0),
      depth: f.geometry.coordinates[2] || 0,
      time: Number(f.properties.time || 0),
      lon: f.geometry.coordinates[0],
      lat: f.geometry.coordinates[1],
      url: String(f.properties.url || ""),
    }));
  }, []);

  return useDataFetcher<Earthquake[]>({
    key: "earthquakes",
    url: API.earthquakes.url,
    interval: API.earthquakes.interval,
    transform,
    enabled,
  });
}
