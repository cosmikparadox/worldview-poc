import { useEffect, useRef, useCallback, useMemo } from "react";
import { SOURCE_REGISTRY } from "./registry";
import { useDataHubStore } from "./dataHubStore";
import type { DataCategory, CategoryDataMap } from "./types";
import { useLayerStore } from "../stores/useLayerStore";
import type { LayerId } from "../stores/useLayerStore";
import { useDataSourceStore } from "../stores/useDataSourceStore";

// Map DataCategory to LayerId for enable/disable integration
const CATEGORY_TO_LAYER: Partial<Record<DataCategory, LayerId>> = {
  seismic: "earthquakes",
  disaster: "disasters",
  aviation: "flights",
  maritime: "ships",
  news: "news",
  conflict: "conflicts",
  weather: "weather",
  fire: "fires",
  cyber: "cyberThreats",
  spaceWeather: "spaceWeather",
  commodity: "commodities",
};

interface UseDataHubResult<K extends DataCategory> {
  data: CategoryDataMap[K] | null;
  isStale: boolean;
  activeSource: string | null;
  refetch: () => void;
}

export function useDataHub<K extends DataCategory>(
  category: K
): UseDataHubResult<K> {
  const layerId = CATEGORY_TO_LAYER[category];
  const layers = useLayerStore((s) => s.layers);
  const enabled = layerId ? (layers[layerId] ?? true) : true;

  const data = useDataHubStore(
    (s) => s.data[category]
  ) as CategoryDataMap[K] | undefined;
  const isStale = useDataHubStore((s) => s.stale[category] ?? false);
  const activeSource = useDataHubStore(
    (s) => s.activeSource[category] ?? null
  );
  const setData = useDataHubStore((s) => s.setData);
  const setHealth = useDataHubStore((s) => s.setHealth);
  const markStale = useDataHubStore((s) => s.markStale);

  // Bridge: write to old useDataSourceStore so StatusDots and ActivityTicker work
  const updateLegacy = useDataSourceStore((s) => s.update);

  const abortRef = useRef<AbortController | null>(null);
  const cacheRef = useRef<{
    data: CategoryDataMap[K];
    timestamp: number;
  } | null>(null);

  // Get poll-able sources for this category, sorted by priority
  const sources = useMemo(
    () =>
      SOURCE_REGISTRY.filter(
        (s) =>
          s.category === category &&
          s.enabled &&
          s.fetchMode === "poll"
      ).sort((a, b) => a.priority - b.priority),
    [category]
  );

  const fetchWithFailover = useCallback(async () => {
    if (!enabled || sources.length === 0) return;

    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    for (const source of sources) {
      const startMs = Date.now();
      setHealth(source.id, { lastAttemptMs: startMs, status: "ok" });

      try {
        const result = await source.adapter.fetch(ac.signal);
        const latencyMs = Date.now() - startMs;

        setHealth(source.id, {
          status: "ok",
          lastFetchMs: Date.now(),
          consecutiveFailures: 0,
          lastError: null,
          latencyMs,
          isStale: false,
        });

        // Apply maxItems cap
        const capped: CategoryDataMap[K] =
          source.maxItems && Array.isArray(result)
            ? ((result as any[]).slice(0, source.maxItems) as CategoryDataMap[K])
            : (result as CategoryDataMap[K]);

        cacheRef.current = { data: capped, timestamp: Date.now() };
        setData(category, capped, source.id);

        // Bridge: update legacy store for status dots
        if (layerId) {
          const count = Array.isArray(capped) ? capped.length : 0;
          updateLegacy(layerId, { status: "success", count, lastUpdated: new Date(), error: null });
        }

        return; // Success — stop trying fallback sources
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        const errorMsg =
          err instanceof Error ? err.message : "Unknown error";

        setHealth(source.id, {
          status: "down",
          consecutiveFailures:
            (useDataHubStore.getState().health[source.id]
              ?.consecutiveFailures ?? 0) + 1,
          lastError: errorMsg,
          latencyMs: Date.now() - startMs,
        });

        // Bridge: update legacy store on error
        if (layerId) {
          updateLegacy(layerId, { error: `${source.name}: ${errorMsg}` });
        }
        // Continue to next source in priority chain
      }
    }

    // All sources failed — serve stale cache if available
    if (cacheRef.current) {
      markStale(category);
    }
  }, [enabled, sources, category, setData, setHealth, markStale]);

  // Polling effect
  useEffect(() => {
    if (!enabled || sources.length === 0) return;

    const pollInterval = sources[0].pollIntervalMs;
    fetchWithFailover();
    const id = setInterval(fetchWithFailover, pollInterval);
    return () => {
      clearInterval(id);
      abortRef.current?.abort();
    };
  }, [enabled, fetchWithFailover, sources]);

  return {
    data: (data as CategoryDataMap[K]) ?? null,
    isStale,
    activeSource,
    refetch: fetchWithFailover,
  };
}
