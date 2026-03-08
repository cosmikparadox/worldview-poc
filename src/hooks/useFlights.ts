import { useCallback } from "react";
import { useDataFetcher } from "./useDataFetcher";
import { useLayerStore } from "../stores/useLayerStore";
import { API } from "../config/api";

export interface Flight {
  id: string;
  callsign: string;
  country: string;
  lon: number;
  lat: number;
  altitude: number;
  velocity: number;
  heading: number;
  onGround: boolean;
}

export function useFlights() {
  const enabled = useLayerStore((s) => s.layers.flights);

  const transform = useCallback((raw: unknown): Flight[] => {
    const data = raw as { states: unknown[][] | null };
    if (!data.states) return [];
    // Cap at 800 for performance — OpenSky can return 10k+
    return data.states.slice(0, 800)
      .filter((s) => s[5] != null && s[6] != null && !s[8]) // has coords, not on ground
      .map((s) => ({
        id: String(s[0]),
        callsign: String(s[1] || "").trim(),
        country: String(s[2] || ""),
        lon: Number(s[5]),
        lat: Number(s[6]),
        altitude: Number(s[7] || s[13] || 0),
        velocity: Number(s[9] || 0),
        heading: Number(s[10] || 0),
        onGround: Boolean(s[8]),
      }));
  }, []);

  return useDataFetcher<Flight[]>({
    key: "flights",
    url: API.flights.url,
    interval: API.flights.interval,
    transform,
    enabled,
  });
}
