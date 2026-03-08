import { useState, useCallback, useRef, useMemo } from "react";
import { useWebSocket } from "./useWebSocket";
import { useDataSourceStore } from "../stores/useDataSourceStore";
import { API } from "../config/api";
import { useLayerStore } from "../stores/useLayerStore";

export interface Ship {
  mmsi: number;
  lat: number;
  lon: number;
  cog: number;    // course over ground
  sog: number;    // speed over ground (knots)
  name: string;
  shipType: number;
  timestamp: number;
}

const MAX_SHIPS = 5000;

export function useShips() {
  const [ships, setShips] = useState<Map<number, Ship>>(new Map());
  const shipsRef = useRef(ships);
  const countRef = useRef(0);
  const updateStore = useDataSourceStore((s) => s.update);
  const enabled = useLayerStore((s) => s.layers.ships);

  // Batch updates — accumulate messages and flush at ~2fps
  const pendingRef = useRef<Ship[]>([]);
  const flushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flush = useCallback(() => {
    const pending = pendingRef.current;
    if (pending.length === 0) return;
    pendingRef.current = [];

    setShips((prev) => {
      const next = new Map(prev);
      for (const ship of pending) {
        next.set(ship.mmsi, ship);
      }
      // Evict oldest if over limit
      if (next.size > MAX_SHIPS) {
        const sorted = [...next.entries()].sort((a, b) => b[1].timestamp - a[1].timestamp);
        const trimmed = new Map(sorted.slice(0, MAX_SHIPS));
        shipsRef.current = trimmed;
        countRef.current = trimmed.size;
        updateStore("ships", { count: trimmed.size, lastUpdated: new Date() });
        return trimmed;
      }
      shipsRef.current = next;
      countRef.current = next.size;
      updateStore("ships", { count: next.size, lastUpdated: new Date() });
      return next;
    });
  }, [updateStore]);

  const onMessage = useCallback((data: unknown) => {
    const msg = data as { MessageType?: string; MetaData?: { MMSI?: number; ShipName?: string; latitude?: number; longitude?: number; time_utc?: string }; Message?: { PositionReport?: { Cog?: number; Sog?: number; ShipType?: number; Latitude?: number; Longitude?: number } } };

    if (msg.MessageType !== "PositionReport") return;

    const meta = msg.MetaData;
    const pos = msg.Message?.PositionReport;
    if (!meta?.MMSI || !pos) return;

    const lat = pos.Latitude ?? meta.latitude ?? 0;
    const lon = pos.Longitude ?? meta.longitude ?? 0;
    if (lat === 0 && lon === 0) return; // skip null island

    const ship: Ship = {
      mmsi: meta.MMSI,
      lat,
      lon,
      cog: pos.Cog ?? 0,
      sog: pos.Sog ?? 0,
      name: meta.ShipName?.trim() || `MMSI ${meta.MMSI}`,
      shipType: pos.ShipType ?? 0,
      timestamp: Date.now(),
    };

    pendingRef.current.push(ship);

    // Flush every 500ms
    if (!flushTimerRef.current) {
      flushTimerRef.current = setTimeout(() => {
        flushTimerRef.current = null;
        flush();
      }, 500);
    }
  }, [flush]);

  // Subscribe to global ship positions
  const subscribeMessage = useMemo(() => ({
    APIKey: API.ships.apiKey,
    BoundingBoxes: [[[-90, -180], [90, 180]]],  // worldwide
    FilterMessageTypes: ["PositionReport"],
  }), []);

  useWebSocket({
    key: "ships",
    url: API.ships.wsUrl,
    apiKey: API.ships.apiKey,
    enabled,
    onMessage,
    subscribeMessage,
  });

  const shipsArray = useMemo(() => [...ships.values()], [ships]);

  return { data: shipsArray };
}
