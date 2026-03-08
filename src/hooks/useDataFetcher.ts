import { useEffect, useRef, useState, useCallback } from "react";
import { useDataSourceStore } from "../stores/useDataSourceStore";

interface Options<T> {
  key: string;
  url: string;
  interval: number;
  transform: (raw: unknown) => T;
  enabled: boolean;
}

export function useDataFetcher<T>({ key, url, interval, transform, enabled }: Options<T>) {
  const [data, setData] = useState<T | null>(null);
  const update = useDataSourceStore((s) => s.update);
  const abortRef = useRef<AbortController | null>(null);
  const hasDataRef = useRef(false);

  const fetchData = useCallback(async () => {
    if (!enabled) return;
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    // Only show loading on first fetch, not on refetches
    if (!hasDataRef.current) {
      update(key, { status: "loading" });
    }
    try {
      const res = await fetch(url, { signal: ac.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const raw = await res.json();
      const transformed = transform(raw);
      setData(transformed);
      hasDataRef.current = true;
      const count = Array.isArray(transformed) ? transformed.length : 0;
      update(key, { status: "success", lastUpdated: new Date(), count, error: null });
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      const message = err instanceof Error ? err.message : "Unknown error";
      // If we have cached data, keep showing success with a warning instead of error
      if (hasDataRef.current) {
        update(key, { error: `Refresh failed: ${message}` });
      } else {
        update(key, { status: "error", error: message });
      }
    }
  }, [key, url, enabled, transform, update]);

  useEffect(() => {
    if (!enabled) {
      update(key, { status: "idle" });
      return;
    }
    fetchData();
    const id = setInterval(fetchData, interval);
    return () => {
      clearInterval(id);
      abortRef.current?.abort();
    };
  }, [enabled, fetchData, interval, key, update]);

  return { data, refetch: fetchData };
}
