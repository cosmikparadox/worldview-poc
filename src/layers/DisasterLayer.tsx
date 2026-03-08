import { Entity, CustomDataSource } from "resium";
import {
  Cartesian3,
  Color,
  DistanceDisplayCondition,
  NearFarScalar,
  ColorMaterialProperty,
} from "cesium";
import { useDisasters } from "../hooks/useDisasters";
import type { Disaster } from "../hooks/useDisasters";
import { useSelectionStore } from "../stores/useSelectionStore";
import { useMemo } from "react";

function categoryColor(cat: string): Color {
  const c = cat.toLowerCase();
  if (c.includes("wildfire")) return Color.fromCssColorString("#ff6622");
  if (c.includes("volcano")) return Color.fromCssColorString("#ff2222");
  if (c.includes("storm") || c.includes("cyclone")) return Color.fromCssColorString("#6688ff");
  if (c.includes("flood")) return Color.fromCssColorString("#2299ff");
  if (c.includes("ice") || c.includes("snow")) return Color.fromCssColorString("#88ddff");
  if (c.includes("earthquake")) return Color.fromCssColorString("#ffcc22");
  if (c.includes("drought")) return Color.fromCssColorString("#cc8844");
  return Color.fromCssColorString("#cccccc");
}

function categoryIcon(cat: string): string {
  const c = cat.toLowerCase();
  if (c.includes("wildfire")) return "FIRE";
  if (c.includes("volcano")) return "VOLCANO";
  if (c.includes("storm") || c.includes("cyclone")) return "STORM";
  if (c.includes("flood")) return "FLOOD";
  if (c.includes("ice") || c.includes("snow")) return "ICE";
  return cat.toUpperCase().slice(0, 6);
}

export function DisasterLayer() {
  const { data } = useDisasters();
  const select = useSelectionStore((s) => s.select);
  const disasters = useMemo(() => data || [], [data]);

  return (
    <CustomDataSource name="disasters">
      {disasters.map((d: Disaster) => {
        const color = categoryColor(d.category);
        return (
          <Entity
            key={d.id}
            position={Cartesian3.fromDegrees(d.lon, d.lat)}
            point={{
              pixelSize: 22,
              color: color.withAlpha(0.9),
              outlineColor: Color.WHITE.withAlpha(0.8),
              outlineWidth: 2.5,
              scaleByDistance: new NearFarScalar(5e5, 2.0, 3e7, 0.7),
              distanceDisplayCondition: new DistanceDisplayCondition(0, 50_000_000),
              disableDepthTestDistance: Number.POSITIVE_INFINITY,
            }}
            label={{
              text: categoryIcon(d.category),
              font: "bold 11px monospace",
              fillColor: Color.WHITE,
              outlineColor: Color.BLACK,
              outlineWidth: 4,
              style: 2,
              pixelOffset: { x: 0, y: -26 } as any,
              scaleByDistance: new NearFarScalar(5e5, 1.2, 1e7, 0.4),
              distanceDisplayCondition: new DistanceDisplayCondition(0, 15_000_000),
              disableDepthTestDistance: Number.POSITIVE_INFINITY,
            }}
            ellipse={{
              semiMajorAxis: 150000,
              semiMinorAxis: 150000,
              height: 0,
              material: new ColorMaterialProperty(color.withAlpha(0.15)),
            }}
            onClick={() =>
              select({
                source: "disaster",
                id: d.id,
                title: d.title,
                description: `${d.category} · ${new Date(d.date).toLocaleDateString()}`,
                lat: d.lat,
                lon: d.lon,
                meta: { category: d.category, date: d.date, link: d.link },
              })
            }
          />
        );
      })}
    </CustomDataSource>
  );
}
