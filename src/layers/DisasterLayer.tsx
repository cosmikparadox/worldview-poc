import { Entity, CustomDataSource } from "resium";
import { Cartesian3, Color, DistanceDisplayCondition, NearFarScalar } from "cesium";
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
  if (c.includes("earthquake")) return Color.fromCssColorString("#ffcc22");
  if (c.includes("drought")) return Color.fromCssColorString("#cc8844");
  return Color.fromCssColorString("#aaaaaa");
}

export function DisasterLayer() {
  const { data } = useDisasters();
  const select = useSelectionStore((s) => s.select);
  const disasters = useMemo(() => data || [], [data]);

  return (
    <CustomDataSource name="disasters">
      {disasters.map((d: Disaster) => (
        <Entity
          key={d.id}
          position={Cartesian3.fromDegrees(d.lon, d.lat)}
          point={{
            pixelSize: 16,
            color: categoryColor(d.category).withAlpha(0.9),
            outlineColor: Color.WHITE.withAlpha(0.7),
            outlineWidth: 2,
            scaleByDistance: new NearFarScalar(5e5, 1.6, 2e7, 0.5),
            distanceDisplayCondition: new DistanceDisplayCondition(0, 50_000_000),
          }}
          label={{
            text: d.category,
            font: "bold 11px monospace",
            fillColor: Color.WHITE,
            outlineColor: Color.BLACK,
            outlineWidth: 3,
            style: 2,
            pixelOffset: { x: 0, y: -20 } as any,
            scaleByDistance: new NearFarScalar(5e5, 1.0, 8e6, 0),
            distanceDisplayCondition: new DistanceDisplayCondition(0, 8_000_000),
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
      ))}
    </CustomDataSource>
  );
}
