import type { RiskScorer, RiskAssessment, RiskContext } from "../types";
import type { WeatherPoint } from "../../datahub/types";
import { haversineKm, getAllNodes, nodeToCommodities } from "../utils";

const WEATHER_RADIUS_KM = 200;

export const weatherScorer: RiskScorer = {
  id: "weather-disruption",
  name: "Weather Disruption",
  description: "Flags severe weather near ports and supply chain nodes",
  categories: ["weather"],

  score(context: RiskContext): RiskAssessment[] {
    const weatherPoints = (context.data.weather ?? []) as WeatherPoint[];
    if (weatherPoints.length === 0) return [];

    const allNodes = getAllNodes(context.supplyChainNetworks);
    const portNodes = allNodes.filter(
      (n) => n.type === "port" || n.type === "pipeline" || n.type === "processing"
    );
    const results: RiskAssessment[] = [];

    for (const wp of weatherPoints) {
      let severity: RiskAssessment["severity"] | null = null;
      let reason = "";

      if (wp.windSpeed > 60) {
        severity = "high";
        reason = `High winds ${wp.windSpeed.toFixed(0)} km/h`;
      } else if (wp.windSpeed > 40) {
        severity = "medium";
        reason = `Strong winds ${wp.windSpeed.toFixed(0)} km/h`;
      } else if (wp.temperature < -20) {
        severity = "medium";
        reason = `Extreme cold ${wp.temperature.toFixed(0)}°C`;
      } else if (wp.temperature > 45) {
        severity = "medium";
        reason = `Extreme heat ${wp.temperature.toFixed(0)}°C`;
      }

      if (!severity) continue;

      // Find nearby port/pipeline/processing nodes
      for (const node of portNodes) {
        const dist = haversineKm(wp.lat, wp.lon, node.lat, node.lon);
        if (dist > WEATHER_RADIUS_KM) continue;

        const commodities = nodeToCommodities(
          node.id,
          context.supplyChainNetworks
        );

        results.push({
          id: `weather-${wp.id}-${node.id}`,
          scorerId: "weather-disruption",
          severity,
          category: "weather",
          title: `${reason} near ${node.name}`,
          description: `${wp.condition} conditions ${Math.round(dist)}km from ${node.name}. ${node.type === "port" ? "Port operations may be disrupted." : "Operations may be affected."}`,
          affectedNodes: [node.id],
          affectedCommodities: commodities,
          lat: wp.lat,
          lon: wp.lon,
          timestamp: wp.timestamp,
          confidence: 0.8,
          metadata: {
            windSpeed: wp.windSpeed,
            temperature: wp.temperature,
            condition: wp.condition,
            distanceKm: dist,
          },
        });
      }
    }

    return results;
  },
};
