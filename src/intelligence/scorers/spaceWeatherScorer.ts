import type { RiskScorer, RiskAssessment, RiskContext } from "../types";
import type { SpaceWeatherReading } from "../../datahub/types";
import { getAllNodes } from "../utils";

export const spaceWeatherScorer: RiskScorer = {
  id: "space-weather",
  name: "Space Weather",
  description: "Alerts on geomagnetic storms that disrupt GPS, HF radio, and satellite comms",
  categories: ["space-weather"],

  score(context: RiskContext): RiskAssessment[] {
    const readings = (context.data.spaceWeather ?? []) as SpaceWeatherReading[];
    if (readings.length === 0) return [];

    // Use most recent reading
    const latest = readings[readings.length - 1];
    if (latest.kp < 5) return [];

    let severity: RiskAssessment["severity"];
    let impact: string;
    if (latest.kp >= 8) {
      severity = "critical";
      impact = "Extreme geomagnetic storm. GPS degradation, HF radio blackouts, satellite anomalies expected.";
    } else if (latest.kp >= 6) {
      severity = "high";
      impact = "Severe geomagnetic storm. GPS accuracy reduced, HF radio intermittent, polar route rerouting likely.";
    } else {
      severity = "medium";
      impact = "Moderate geomagnetic storm. Minor GPS fluctuations possible, monitor polar route communications.";
    }

    // Global impact — affects all supply chain nodes
    const allNodes = getAllNodes(context.supplyChainNetworks);
    const allCommodities = [
      ...new Set(
        context.supplyChainNetworks.map((n) => n.commoditySymbol)
      ),
    ];

    return [
      {
        id: `space-weather-kp${latest.kp}`,
        scorerId: "space-weather",
        severity,
        category: "space-weather",
        title: `Geomagnetic storm Kp=${latest.kp}`,
        description: impact,
        affectedNodes: allNodes.map((n) => n.id),
        affectedCommodities: allCommodities,
        lat: 0,
        lon: 0,
        timestamp: Date.now(),
        confidence: 0.95,
        metadata: { kp: latest.kp, stations: latest.stations, time: latest.time },
      },
    ];
  },
};
