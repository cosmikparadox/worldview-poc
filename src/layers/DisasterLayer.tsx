import { Entity, CustomDataSource } from "resium";
import {
  Cartesian3,
  Color,
  DistanceDisplayCondition,
  NearFarScalar,
  HeightReference,
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
  if (c.includes("wildfire")) return "\u{1F525}"; // fire
  if (c.includes("volcano")) return "\u{1F30B}"; // volcano
  if (c.includes("storm") || c.includes("cyclone")) return "\u{1F300}"; // cyclone
  if (c.includes("flood")) return "\u{1F30A}"; // wave
  if (c.includes("earthquake")) return "\u{1F4A5}"; // boom
  return "\u26A0"; // warning
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
              pixelSize: 18,
              color: color.withAlpha(0.9),
              outlineColor: Color.WHITE.withAlpha(0.7),
              outlineWidth: 2,
              scaleByDistance: new NearFarScalar(5e5, 1.8, 2e7, 0.5),
              distanceDisplayCondition: new DistanceDisplayCondition(0, 50_000_000),
              heightReference: HeightReference.CLAMP_TO_GROUND,
            }}
            label={{
              text: `${categoryIcon(d.category)} ${d.category}`,
              font: "bold 12px sans-serif",
              fillColor: Color.WHITE,
              outlineColor: Color.BLACK,
              outlineWidth: 3,
              style: 2,
              pixelOffset: { x: 0, y: -22 } as any,
              scaleByDistance: new NearFarScalar(5e5, 1.0, 8e6, 0),
              distanceDisplayCondition: new DistanceDisplayCondition(0, 10_000_000),
            }}
            ellipse={{
              semiMajorAxis: 80000,
              semiMinorAxis: 80000,
              material: color.withAlpha(0.1),
              outline: true,
              outlineColor: color.withAlpha(0.4),
              outlineWidth: 2,
              heightReference: HeightReference.CLAMP_TO_GROUND,
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
