import type { SupplyChainNetwork, SupplyNode } from "../config/supplyChainRoutes";
import type { RiskSeverity } from "./types";

const DEG_TO_RAD = Math.PI / 180;
const EARTH_RADIUS_KM = 6371;

/** Haversine distance between two lat/lon points in km */
export function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dLat = (lat2 - lat1) * DEG_TO_RAD;
  const dLon = (lon2 - lon1) * DEG_TO_RAD;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * DEG_TO_RAD) *
      Math.cos(lat2 * DEG_TO_RAD) *
      Math.sin(dLon / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Find all supply chain nodes within radiusKm of a point */
export function findNodesInRadius(
  nodes: SupplyNode[],
  lat: number,
  lon: number,
  radiusKm: number
): { node: SupplyNode; distanceKm: number }[] {
  const results: { node: SupplyNode; distanceKm: number }[] = [];
  for (const node of nodes) {
    const d = haversineKm(lat, lon, node.lat, node.lon);
    if (d <= radiusKm) {
      results.push({ node, distanceKm: d });
    }
  }
  return results.sort((a, b) => a.distanceKm - b.distanceKm);
}

/** Flatten all nodes from all supply chain networks */
export function getAllNodes(networks: SupplyChainNetwork[]): SupplyNode[] {
  return networks.flatMap((n) => n.nodes);
}

/** Which commodity symbols does a node belong to? */
export function nodeToCommodities(
  nodeId: string,
  networks: SupplyChainNetwork[]
): string[] {
  return networks
    .filter((n) => n.nodes.some((node) => node.id === nodeId))
    .map((n) => n.commoditySymbol);
}

/** Map distance to severity based on thresholds */
export function severityFromDistance(
  distanceKm: number,
  thresholds: { critical: number; high: number; medium: number; low: number }
): RiskSeverity {
  if (distanceKm <= thresholds.critical) return "critical";
  if (distanceKm <= thresholds.high) return "high";
  if (distanceKm <= thresholds.medium) return "medium";
  if (distanceKm <= thresholds.low) return "low";
  return "info";
}
