import type { RiskScorer, RiskAssessment, RiskContext } from "../types";
import type { CommodityPrice } from "../../datahub/types";
import { getAllNodes, nodeToCommodities } from "../utils";

// Map commodity symbols from price data to supply chain network symbols
const SYMBOL_MAP: Record<string, string> = {
  WTI: "WTI",
  BRENT: "BRENT",
  NATURAL_GAS: "NATURAL_GAS",
  COPPER: "COPPER",
  ALUMINUM: "ALUMINUM",
};

export const commodityScorer: RiskScorer = {
  id: "commodity-volatility",
  name: "Commodity Volatility",
  description: "Flags significant commodity price swings that affect supply chains",
  categories: ["volatility"],

  score(context: RiskContext): RiskAssessment[] {
    const prices = (context.data.commodity ?? []) as CommodityPrice[];
    if (prices.length === 0) return [];

    const allNodes = getAllNodes(context.supplyChainNetworks);
    const results: RiskAssessment[] = [];

    for (const p of prices) {
      const absChange = Math.abs(p.change);
      if (absChange < 1.5) continue;

      let severity: RiskAssessment["severity"];
      if (absChange >= 5) severity = "critical";
      else if (absChange >= 3) severity = "high";
      else severity = "medium";

      const direction = p.change > 0 ? "surged" : "dropped";
      const scSymbol = SYMBOL_MAP[p.symbol] ?? p.symbol;

      // Find nodes belonging to this commodity's network
      const affectedNodeIds = allNodes
        .filter((n) =>
          nodeToCommodities(n.id, context.supplyChainNetworks).includes(scSymbol)
        )
        .map((n) => n.id);

      if (affectedNodeIds.length === 0) continue;

      // Use first node's coordinates for map placement
      const firstNode = allNodes.find((n) => n.id === affectedNodeIds[0]);

      results.push({
        id: `commodity-${p.symbol}`,
        scorerId: "commodity-volatility",
        severity,
        category: "volatility",
        title: `${p.name} ${direction} ${p.change > 0 ? "+" : ""}${p.change.toFixed(1)}%`,
        description: `${p.name} at $${p.price.toFixed(2)}/${p.unit}. Impacts ${affectedNodeIds.length} supply chain nodes.`,
        affectedNodes: affectedNodeIds,
        affectedCommodities: [scSymbol],
        lat: firstNode?.lat ?? 0,
        lon: firstNode?.lon ?? 0,
        timestamp: Date.now(),
        confidence: 1.0,
        metadata: { symbol: p.symbol, price: p.price, change: p.change },
      });
    }

    return results;
  },
};
