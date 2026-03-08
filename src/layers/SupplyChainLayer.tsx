import { useMemo } from "react";
import { Entity, CustomDataSource } from "resium";
import {
  Cartesian3,
  Color,
  VerticalOrigin,
  DistanceDisplayCondition,
  NearFarScalar,
  ArcType,
  PolylineDashMaterialProperty,
  PolylineGlowMaterialProperty,
  ColorMaterialProperty,
} from "cesium";
import {
  SUPPLY_CHAIN_NETWORKS,
  type SupplyNode,
  type SupplyNodeType,
  type TransportMode,
} from "../config/supplyChainRoutes";
import { HOTSPOTS } from "../config/hotspots";
import { useSupplyChainStore } from "../stores/useSupplyChainStore";
import { useSelectionStore } from "../stores/useSelectionStore";

function nodeColor(type: SupplyNodeType): Color {
  const map: Record<SupplyNodeType, string> = {
    production: "#ff8844",
    processing: "#ffcc22",
    port: "#4488ff",
    pipeline: "#44dd88",
    manufacturing: "#a06fff",
    storage: "#88aacc",
    consumption: "#00e5b0",
  };
  return Color.fromCssColorString(map[type]);
}

function nodeTypeLabel(type: SupplyNodeType): string {
  const map: Record<SupplyNodeType, string> = {
    production: "PROD",
    processing: "PROC",
    port: "PORT",
    pipeline: "PIPE",
    manufacturing: "MFG",
    storage: "STOR",
    consumption: "CONS",
  };
  return map[type];
}

function edgeMaterial(mode: TransportMode) {
  switch (mode) {
    case "shipping":
      return new PolylineGlowMaterialProperty({
        glowPower: 0.15,
        color: Color.fromCssColorString("#4488ff").withAlpha(0.8),
      });
    case "pipeline":
      return new PolylineDashMaterialProperty({
        color: Color.fromCssColorString("#44dd88").withAlpha(0.8),
        dashLength: 16,
      });
    case "rail":
      return new PolylineDashMaterialProperty({
        color: Color.fromCssColorString("#ff8800").withAlpha(0.7),
        dashLength: 8,
        dashPattern: 255,
      });
    case "air":
      return new ColorMaterialProperty(
        Color.fromCssColorString("#ffffff").withAlpha(0.4)
      );
    case "road":
      return new ColorMaterialProperty(
        Color.fromCssColorString("#ffdd44").withAlpha(0.6)
      );
  }
}

function edgeWidth(mode: TransportMode): number {
  switch (mode) {
    case "shipping": return 3;
    case "pipeline": return 2.5;
    case "rail": return 2;
    case "air": return 1.5;
    case "road": return 2;
  }
}

function resolveNodePosition(node: SupplyNode): [number, number] {
  if (node.hotspotRef) {
    const hotspot = HOTSPOTS.find((h) => h.id === node.hotspotRef);
    if (hotspot) return [hotspot.lon, hotspot.lat];
  }
  return [node.lon, node.lat];
}

export function SupplyChainLayer() {
  const activeCommodity = useSupplyChainStore((s) => s.activeCommodity);
  const select = useSelectionStore((s) => s.select);

  const network = useMemo(() => {
    if (!activeCommodity) return null;
    return SUPPLY_CHAIN_NETWORKS.find((n) => n.commoditySymbol === activeCommodity) ?? null;
  }, [activeCommodity]);

  const nodePositions = useMemo(() => {
    if (!network) return new Map<string, [number, number]>();
    const map = new Map<string, [number, number]>();
    for (const node of network.nodes) {
      map.set(node.id, resolveNodePosition(node));
    }
    return map;
  }, [network]);

  if (!network) return null;

  return (
    <CustomDataSource name="supplyChain">
      {/* Edges first (underneath nodes) */}
      {network.edges.map((edge) => {
        const fromPos = nodePositions.get(edge.from);
        const toPos = nodePositions.get(edge.to);
        if (!fromPos || !toPos) return null;

        return (
          <Entity
            key={edge.id}
            polyline={{
              positions: [
                Cartesian3.fromDegrees(fromPos[0], fromPos[1], 1000),
                Cartesian3.fromDegrees(toPos[0], toPos[1], 1000),
              ],
              width: edgeWidth(edge.mode),
              material: edgeMaterial(edge.mode) as any,
              arcType: ArcType.GEODESIC,
              distanceDisplayCondition: new DistanceDisplayCondition(0, 50_000_000),
            }}
          />
        );
      })}

      {/* Nodes on top */}
      {network.nodes.map((node) => {
        const [lon, lat] = resolveNodePosition(node);
        const color = nodeColor(node.type);
        return (
          <Entity
            key={node.id}
            position={Cartesian3.fromDegrees(lon, lat, 2000)}
            point={{
              pixelSize: 18,
              color: color.withAlpha(0.9),
              outlineColor: Color.WHITE.withAlpha(0.8),
              outlineWidth: 2,
              scaleByDistance: new NearFarScalar(5e5, 1.6, 3e7, 0.6),
              distanceDisplayCondition: new DistanceDisplayCondition(0, 50_000_000),
            }}
            label={{
              text: `${node.name}\n[${nodeTypeLabel(node.type)}]`,
              font: "bold 11px sans-serif",
              fillColor: Color.WHITE,
              outlineColor: Color.BLACK,
              outlineWidth: 3,
              style: 2,
              verticalOrigin: VerticalOrigin.BOTTOM,
              pixelOffset: { x: 0, y: -18 } as any,
              scaleByDistance: new NearFarScalar(5e5, 1.0, 2e7, 0.3),
              distanceDisplayCondition: new DistanceDisplayCondition(0, 15_000_000),
            }}
            onClick={() =>
              select({
                source: "supplyChain",
                id: node.id,
                title: node.name,
                description: node.description,
                lat,
                lon,
                meta: {
                  type: node.type,
                  commodity: network.commoditySymbol,
                  ...(node.hotspotRef ? { hotspotRef: node.hotspotRef } : {}),
                },
              })
            }
          />
        );
      })}
    </CustomDataSource>
  );
}
