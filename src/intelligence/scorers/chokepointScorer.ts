import type { RiskScorer, RiskAssessment, RiskContext } from "../types";
import type { ConflictEvent, NewsItem, FireHotspot } from "../../datahub/types";
import { haversineKm } from "../utils";

interface Chokepoint {
  id: string;
  name: string;
  lat: number;
  lon: number;
  nodeIdPattern: string; // substring match on supply chain node IDs
}

const CHOKEPOINTS: Chokepoint[] = [
  { id: "suez", name: "Suez Canal", lat: 30.46, lon: 32.34, nodeIdPattern: "suez" },
  { id: "hormuz", name: "Strait of Hormuz", lat: 26.56, lon: 56.25, nodeIdPattern: "hormuz" },
  { id: "malacca", name: "Strait of Malacca", lat: 2.5, lon: 101.5, nodeIdPattern: "malacca" },
  { id: "panama", name: "Panama Canal", lat: 9.08, lon: -79.68, nodeIdPattern: "panama" },
];

export const chokepointScorer: RiskScorer = {
  id: "chokepoint-congestion",
  name: "Chokepoint Disruption",
  description: "Monitors critical maritime chokepoints for conflict, news, and fire threats",
  categories: ["chokepoint"],

  score(context: RiskContext): RiskAssessment[] {
    const conflicts = (context.data.conflict ?? []) as ConflictEvent[];
    const news = (context.data.news ?? []) as NewsItem[];
    const fires = (context.data.fire ?? []) as FireHotspot[];
    const results: RiskAssessment[] = [];

    for (const cp of CHOKEPOINTS) {
      // Find which commodity networks use this chokepoint
      const affectedCommodities: string[] = [];
      const affectedNodes: string[] = [];
      for (const network of context.supplyChainNetworks) {
        const hasNode = network.nodes.some((n) =>
          n.id.includes(cp.nodeIdPattern)
        );
        if (hasNode) {
          affectedCommodities.push(network.commoditySymbol);
          const matchingNodes = network.nodes
            .filter((n) => n.id.includes(cp.nodeIdPattern))
            .map((n) => n.id);
          affectedNodes.push(...matchingNodes);
        }
      }

      // Check conflicts within 300km
      for (const c of conflicts) {
        const dist = haversineKm(cp.lat, cp.lon, c.lat, c.lon);
        if (dist <= 300) {
          results.push({
            id: `chokepoint-conflict-${cp.id}-${c.id}`,
            scorerId: "chokepoint-congestion",
            severity: "critical",
            category: "chokepoint",
            title: `Conflict near ${cp.name}`,
            description: `${c.eventType} conflict ${Math.round(dist)}km from ${cp.name}. ${c.fatalities} fatalities. May disrupt ${affectedCommodities.join(", ")} transit.`,
            affectedNodes: [...new Set(affectedNodes)],
            affectedCommodities: [...new Set(affectedCommodities)],
            lat: cp.lat,
            lon: cp.lon,
            timestamp: c.timestamp,
            confidence: 0.85,
            metadata: { chokepoint: cp.name, distanceKm: dist, eventType: c.eventType },
          });
        }
      }

      // Check negative news within 200km
      for (const n of news) {
        if (n.tone >= -3) continue;
        const dist = haversineKm(cp.lat, cp.lon, n.lat, n.lon);
        if (dist <= 200) {
          results.push({
            id: `chokepoint-news-${cp.id}-${n.id}`,
            scorerId: "chokepoint-congestion",
            severity: "high",
            category: "chokepoint",
            title: `Negative news near ${cp.name}`,
            description: `"${n.title.slice(0, 80)}..." — tone ${n.tone.toFixed(1)}, ${Math.round(dist)}km from ${cp.name}.`,
            affectedNodes: [...new Set(affectedNodes)],
            affectedCommodities: [...new Set(affectedCommodities)],
            lat: cp.lat,
            lon: cp.lon,
            timestamp: n.timestamp,
            confidence: 0.6,
            metadata: { chokepoint: cp.name, tone: n.tone, distanceKm: dist },
          });
        }
      }

      // Check fires within 100km
      for (const f of fires) {
        const dist = haversineKm(cp.lat, cp.lon, f.lat, f.lon);
        if (dist <= 100) {
          results.push({
            id: `chokepoint-fire-${cp.id}-${f.id}`,
            scorerId: "chokepoint-congestion",
            severity: "medium",
            category: "chokepoint",
            title: `Fire near ${cp.name}`,
            description: `Active fire ${Math.round(dist)}km from ${cp.name}. Brightness ${f.brightness.toFixed(0)}.`,
            affectedNodes: [...new Set(affectedNodes)],
            affectedCommodities: [...new Set(affectedCommodities)],
            lat: cp.lat,
            lon: cp.lon,
            timestamp: f.timestamp,
            confidence: 0.7,
            metadata: { chokepoint: cp.name, brightness: f.brightness, distanceKm: dist },
          });
        }
      }
    }

    return results;
  },
};
