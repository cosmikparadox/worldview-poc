import { Entity, CustomDataSource } from "resium";
import { Cartesian3, Color, DistanceDisplayCondition } from "cesium";
import { useMemo } from "react";
import { useIntelligenceStore } from "../stores/useIntelligenceStore";
import { SUPPLY_CHAIN_NETWORKS } from "../config/supplyChainRoutes";
import type { RiskSeverity } from "../intelligence/types";
import { SEVERITY_ORDER } from "../intelligence/types";

const SEVERITY_CESIUM_COLORS: Record<RiskSeverity, Color> = {
  critical: Color.fromCssColorString("#ff2244"),
  high: Color.fromCssColorString("#ff6622"),
  medium: Color.fromCssColorString("#ffbb44"),
  low: Color.fromCssColorString("#44bbff"),
  info: Color.fromCssColorString("#8899bb"),
};

const SEVERITY_RADIUS: Record<RiskSeverity, number> = {
  critical: 200_000,
  high: 150_000,
  medium: 100_000,
  low: 60_000,
  info: 40_000,
};

// Flatten all supply chain nodes for lookup
const ALL_NODES_MAP = new Map(
  SUPPLY_CHAIN_NETWORKS.flatMap((n) => n.nodes).map((n) => [n.id, n])
);

export function RiskOverlayLayer() {
  const assessments = useIntelligenceStore((s) => s.assessments);
  const dismissedIds = useIntelligenceStore((s) => s.dismissedIds);

  // Aggregate: per supply chain node, find highest severity
  const nodeRisks = useMemo(() => {
    const active = assessments.filter((a) => !dismissedIds.has(a.id));
    const map = new Map<string, RiskSeverity>();

    for (const a of active) {
      for (const nodeId of a.affectedNodes) {
        const existing = map.get(nodeId);
        if (!existing || SEVERITY_ORDER[a.severity] < SEVERITY_ORDER[existing]) {
          map.set(nodeId, a.severity);
        }
      }
    }

    return [...map.entries()]
      .map(([nodeId, severity]) => {
        const node = ALL_NODES_MAP.get(nodeId);
        if (!node) return null;
        return { nodeId, severity, lat: node.lat, lon: node.lon, name: node.name };
      })
      .filter(Boolean) as {
      nodeId: string;
      severity: RiskSeverity;
      lat: number;
      lon: number;
      name: string;
    }[];
  }, [assessments, dismissedIds]);

  if (nodeRisks.length === 0) return null;

  return (
    <CustomDataSource name="riskOverlay">
      {nodeRisks.map((nr) => {
        const color = SEVERITY_CESIUM_COLORS[nr.severity];
        const radius = SEVERITY_RADIUS[nr.severity];

        return (
          <Entity
            key={`risk-${nr.nodeId}`}
            position={Cartesian3.fromDegrees(nr.lon, nr.lat)}
            ellipse={{
              semiMajorAxis: radius,
              semiMinorAxis: radius,
              material: color.withAlpha(0.12),
              outline: true,
              outlineColor: color.withAlpha(0.6),
              outlineWidth: 2,
              distanceDisplayCondition: new DistanceDisplayCondition(
                0,
                40_000_000
              ),
            }}
          />
        );
      })}
    </CustomDataSource>
  );
}
