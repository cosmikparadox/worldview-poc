import { Entity, CustomDataSource } from "resium";
import { Cartesian3, Color, NearFarScalar, DistanceDisplayCondition } from "cesium";
import { useDataHub } from "../datahub/useDataHub";
import { useSelectionStore } from "../stores/useSelectionStore";
import { useMemo } from "react";

function conflictColor(eventType: string): Color {
  const t = eventType.toLowerCase();
  if (t.includes("state-based")) return Color.fromCssColorString("#ff2244");
  if (t.includes("non-state")) return Color.fromCssColorString("#ff6644");
  if (t.includes("one-sided")) return Color.fromCssColorString("#cc4466");
  return Color.fromCssColorString("#ff4444");
}

export function ConflictLayer() {
  const { data } = useDataHub("conflict");
  const select = useSelectionStore((s) => s.select);
  const events = useMemo(() => data || [], [data]);

  return (
    <CustomDataSource name="conflicts">
      {events.map((e) => {
        const color = conflictColor(e.eventType);
        const size = Math.min(8 + Math.sqrt(e.fatalities) * 2, 22);
        return (
          <Entity
            key={e.id}
            position={Cartesian3.fromDegrees(e.lon, e.lat)}
            point={{
              pixelSize: size,
              color: color.withAlpha(0.85),
              outlineColor: Color.WHITE.withAlpha(0.3),
              outlineWidth: 1,
              scaleByDistance: new NearFarScalar(5e5, 1.5, 3e7, 0.5),
              distanceDisplayCondition: new DistanceDisplayCondition(0, 50_000_000),
            }}
            onClick={() =>
              select({
                source: "conflict",
                id: e.id,
                title: e.title,
                description: `${e.eventType} · ${e.fatalities} fatalities`,
                lat: e.lat,
                lon: e.lon,
                meta: {
                  type: e.eventType,
                  fatalities: e.fatalities,
                  actors: e.actors,
                  region: e.region,
                  url: e.url,
                },
              })
            }
          />
        );
      })}
    </CustomDataSource>
  );
}
