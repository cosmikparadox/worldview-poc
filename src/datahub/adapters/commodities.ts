import type { SourceAdapter, CommodityPrice } from "../types";

const COMMODITY_META: Record<string, { name: string; unit: string }> = {
  WTI: { name: "Crude Oil (WTI)", unit: "$/barrel" },
  BRENT: { name: "Crude Oil (Brent)", unit: "$/barrel" },
  NATURAL_GAS: { name: "Natural Gas", unit: "$/MMBtu" },
  COPPER: { name: "Copper", unit: "$/lb" },
  ALUMINUM: { name: "Aluminum", unit: "$/mt" },
};

function parseAlphaVantageData(
  symbol: string,
  json: Record<string, unknown>
): CommodityPrice | null {
  const meta = COMMODITY_META[symbol];
  if (!meta) return null;

  const series = json["data"] as { date: string; value: string }[] | undefined;
  if (!series || series.length < 2) return null;

  const valid = series.filter((d) => d.value !== ".");
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
    source: "alphavantage",
  };
}

export const alphaVantageAdapter: SourceAdapter<CommodityPrice[]> = {
  id: "alpha-vantage",
  async fetch(signal) {
    const res = await fetch("/api/commodities", { signal });
    if (!res.ok) throw new Error(`Commodities proxy HTTP ${res.status}`);
    const payload = await res.json();

    const results: CommodityPrice[] = [];
    for (const [symbol, json] of Object.entries(payload)) {
      const parsed = parseAlphaVantageData(
        symbol,
        json as Record<string, unknown>
      );
      if (parsed) results.push(parsed);
    }
    return results;
  },
};
