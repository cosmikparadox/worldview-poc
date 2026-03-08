import { useCallback } from "react";
import { useDataFetcher } from "./useDataFetcher";
import { useLayerStore } from "../stores/useLayerStore";
import { API } from "../config/api";

export interface KpReading {
  time: string;
  kp: number;
  stations: number;
}

export function useSpaceWeather() {
  const enabled = useLayerStore((s) => s.layers.spaceWeather);

  const transform = useCallback((raw: unknown): KpReading[] => {
    const rows = raw as string[][];
    // First row is header, rest are data
    return rows.slice(1).map((r) => ({
      time: r[0],
      kp: parseFloat(r[1]) || 0,
      stations: parseInt(r[3]) || 0,
    }));
  }, []);

  return useDataFetcher<KpReading[]>({
    key: "spaceWeather",
    url: API.spaceWeather.url,
    interval: API.spaceWeather.interval,
    transform,
    enabled,
  });
}
