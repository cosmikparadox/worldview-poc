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

// Alpha Vantage commodity-specific API functions (free tier)
// Docs: https://www.alphavantage.co/documentation/#commodities
const COMMODITIES = [
  { name: "Crude Oil (WTI)", fn: "WTI", unit: "$/barrel" },
  { name: "Crude Oil (Brent)", fn: "BRENT", unit: "$/barrel" },
  { name: "Natural Gas", fn: "NATURAL_GAS", unit: "$/MMBtu" },
  { name: "Copper", fn: "COPPER", unit: "$/lb" },
  { name: "Aluminum", fn: "ALUMINUM", unit: "$/mt" },
];

export function useCommodities() {
  const [data, setData] = useState<CommodityPrice[]>([]);
  const update = useDataSourceStore((s) => s.update);
  const apiKey = API.commodities.apiKey;
  const fetching = useRef(false);

  const fetchAll = useCallback(async () => {
    if (!apiKey || fetching.current) return;
    fetching.current = true;
    update("commodities", { status: "loading" });

    const results: CommodityPrice[] = [];

    // Fetch up to 5 commodities. Free tier = 25 requests/day, so be conservative.
    for (const commodity of COMMODITIES) {
      try {
        const url = `${API.commodities.baseUrl}?function=${commodity.fn}&interval=daily&apikey=${apiKey}`;
        const res = await fetch(url);
        const json = await res.json();

        // Rate limited
        if (json["Note"] || json["Information"]) break;

        const series = json["data"] as { date: string; value: string }[] | undefined;
        if (series && series.length >= 2) {
          // Get latest non-"." values
          const valid = series.filter((d: { value: string }) => d.value !== ".");
          if (valid.length >= 2) {
            const latest = parseFloat(valid[0].value);
            const prev = parseFloat(valid[1].value);
            const change = prev > 0 ? ((latest - prev) / prev) * 100 : 0;

            results.push({
              symbol: commodity.fn,
              name: commodity.name,
              price: latest,
              change,
              unit: commodity.unit,
              lastUpdated: valid[0].date,
            });
          }
        }
        // 1.5s delay between requests (free tier: 5 req/min)
        await new Promise((r) => setTimeout(r, 1500));
      } catch {
        // skip failed commodities
      }
    }

    if (results.length > 0) {
      setData(results);
      update("commodities", { status: "success", count: results.length, lastUpdated: new Date(), error: null });
    } else {
      update("commodities", { status: "error", error: "No data (rate limit?)" });
    }

    fetching.current = false;
  }, [apiKey, update]);

  useEffect(() => {
    if (!apiKey) {
      update("commodities", { status: "idle" });
      return;
    }
    fetchAll();
    const id = setInterval(fetchAll, API.commodities.interval);
    return () => clearInterval(id);
  }, [apiKey, fetchAll, update]);

  return { data };
}
