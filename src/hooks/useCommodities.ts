import { useEffect, useState, useCallback, useRef } from "react";
import { useDataSourceStore } from "../stores/useDataSourceStore";
import { API } from "../config/api";

export interface CommodityPrice {
  symbol: string;
  name: string;
  price: number;
  change: number;       // percent change
  unit: string;
  lastUpdated: string;
}

const COMMODITY_META: Record<string, { name: string; unit: string }> = {
  WTI: { name: "Crude Oil (WTI)", unit: "$/barrel" },
  BRENT: { name: "Crude Oil (Brent)", unit: "$/barrel" },
  NATURAL_GAS: { name: "Natural Gas", unit: "$/MMBtu" },
  COPPER: { name: "Copper", unit: "$/lb" },
  ALUMINUM: { name: "Aluminum", unit: "$/mt" },
};

function parseAlphaVantageData(symbol: string, json: Record<string, unknown>): CommodityPrice | null {
  const meta = COMMODITY_META[symbol];
  if (!meta) return null;

  const series = json["data"] as { date: string; value: string }[] | undefined;
  if (!series || series.length < 2) return null;

  const valid = series.filter((d: { value: string }) => d.value !== ".");
  if (valid.length < 2) return null;

  const latest = parseFloat(valid[0].value);
  const prev = parseFloat(valid[1].value);
  const change = prev > 0 ? ((latest - prev) / prev) * 100 : 0;

  return {
    symbol,
    name: meta.name,
    price: latest,
    change,
    unit: meta.unit,
    lastUpdated: valid[0].date,
  };
}

export function useCommodities() {
  const [data, setData] = useState<CommodityPrice[]>([]);
  const update = useDataSourceStore((s) => s.update);
  const fetching = useRef(false);

  const fetchAll = useCallback(async () => {
    if (fetching.current) return;
    fetching.current = true;
    update("commodities", { status: "loading" });

    try {
      // Single request to our backend proxy — it handles caching + rate limits
      const res = await fetch(API.commodities.proxyUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const payload = await res.json();

      const results: CommodityPrice[] = [];
      for (const [symbol, json] of Object.entries(payload)) {
        const parsed = parseAlphaVantageData(symbol, json as Record<string, unknown>);
        if (parsed) results.push(parsed);
      }

      if (results.length > 0) {
        setData(results);
        update("commodities", { status: "success", count: results.length, lastUpdated: new Date(), error: null });
      } else {
        update("commodities", { status: "error", error: "No commodity data" });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      update("commodities", { status: "error", error: msg });
    }

    fetching.current = false;
  }, [update]);

  useEffect(() => {
    fetchAll();
    const id = setInterval(fetchAll, API.commodities.interval);
    return () => clearInterval(id);
  }, [fetchAll, update]);

  return { data };
}
