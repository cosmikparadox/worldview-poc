import type { RiskScorer, RiskAssessment, RiskContext } from "../types";
import { getAllNodes, nodeToCommodities, findNodesInRadius } from "../utils";
import type { GeoEntity, SeismicEvent, FireHotspot, ConflictEvent, DisasterEvent } from "../../datahub/types";

const MAX_RADIUS_KM = 500;

function buildAssessments(
  events: (GeoEntity & { _label: string; _extra: Record<string, unknown> })[],
  context: RiskContext
): RiskAssessment[] {
  const allNodes = getAllNodes(context.supplyChainNetworks);
  const results: RiskAssessment[] = [];

  for (const ev of events) {
    const nearby = findNodesInRadius(allNodes, ev.lat, ev.lon, MAX_RADIUS_KM);
    if (nearby.length === 0) continue;

    const closest = nearby[0];
    const distKm = closest.distanceKm;

    let severity: RiskAssessment["severity"];
    if (distKm < 100) severity = "critical";
    else if (distKm < 250) severity = "high";
    else if (distKm < 500) severity = "medium";
    else severity = "low";

    const affectedNodeIds = nearby.map((n) => n.node.id);
    const commodities = [
      ...new Set(
        affectedNodeIds.flatMap((nid) =>
          nodeToCommodities(nid, context.supplyChainNetworks)
        )
      ),
    ];

    results.push({
      id: `proximity-${ev.id}`,
      scorerId: "proximity",
      severity,
      category: "proximity",
      title: `${ev._label} near ${closest.node.name}`,
      description: `${Math.round(distKm)}km from ${closest.node.name}. Affects ${commodities.join(", ")} supply chain${commodities.length > 1 ? "s" : ""}.`,
      affectedNodes: affectedNodeIds,
      affectedCommodities: commodities,
      lat: ev.lat,
      lon: ev.lon,
      timestamp: ev.timestamp,
      confidence: 0.9,
      metadata: { distanceKm: distKm, ...ev._extra },
    });
  }

  return results;
}

export const proximityScorer: RiskScorer = {
  id: "proximity",
  name: "Proximity Risk",
  description:
    "Detects earthquakes, fires, conflicts, and disasters near supply chain nodes",
  categories: ["proximity"],

  score(context: RiskContext): RiskAssessment[] {
    const events: (GeoEntity & {
      _label: string;
      _extra: Record<string, unknown>;
    })[] = [];

    // Seismic events
    const quakes = (context.data.seismic ?? []) as SeismicEvent[];
    for (const q of quakes) {
      if (q.magnitude >= 4.0) {
        events.push({
          ...q,
          _label: `M${q.magnitude.toFixed(1)} earthquake`,
          _extra: { magnitude: q.magnitude, depth: q.depth },
        });
      }
    }

    // Fire hotspots (high confidence only)
    const fires = (context.data.fire ?? []) as FireHotspot[];
    for (const f of fires) {
      if (f.confidence === "high" || f.confidence === "nominal") {
        events.push({
          ...f,
          _label: `Fire hotspot (${f.satellite})`,
          _extra: { brightness: f.brightness, frp: f.frp },
        });
      }
    }

    // Conflict events
    const conflicts = (context.data.conflict ?? []) as ConflictEvent[];
    for (const c of conflicts) {
      events.push({
        ...c,
        _label: `${c.eventType} conflict (${c.fatalities} fatalities)`,
        _extra: { fatalities: c.fatalities, actors: c.actors },
      });
    }

    // Disaster events
    const disasters = (context.data.disaster ?? []) as DisasterEvent[];
    for (const d of disasters) {
      events.push({
        ...d,
        _label: `${d.category} disaster`,
        _extra: { category: d.category },
      });
    }

    return buildAssessments(events, context);
  },
};
