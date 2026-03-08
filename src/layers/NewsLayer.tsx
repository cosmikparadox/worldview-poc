import { Entity, CustomDataSource } from "resium";
import { Cartesian3, Color, DistanceDisplayCondition, NearFarScalar } from "cesium";
import { useNews } from "../hooks/useNews";
import type { NewsEvent } from "../hooks/useNews";
import { useSelectionStore } from "../stores/useSelectionStore";
import { useMemo } from "react";

function toneColor(tone: number): Color {
  if (tone < -3) return Color.fromCssColorString("#ff4466");
  if (tone < 0) return Color.fromCssColorString("#cc7744");
  if (tone > 3) return Color.fromCssColorString("#44cc88");
  return Color.fromCssColorString("#bb88ff");
}

export function NewsLayer() {
  const { data } = useNews();
  const select = useSelectionStore((s) => s.select);
  const events = useMemo(() => data || [], [data]);

  return (
    <CustomDataSource name="news">
      {events.map((n: NewsEvent) => (
        <Entity
          key={n.id}
          position={Cartesian3.fromDegrees(n.lon, n.lat)}
          point={{
            pixelSize: 14,
            color: toneColor(n.tone).withAlpha(0.9),
            outlineColor: Color.WHITE.withAlpha(0.4),
            outlineWidth: 1.5,
            scaleByDistance: new NearFarScalar(5e5, 1.8, 3e7, 0.6),
            distanceDisplayCondition: new DistanceDisplayCondition(0, 50_000_000),
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          }}
          onClick={() =>
            select({
              source: "news",
              id: n.id,
              title: n.name.length > 80 ? n.name.slice(0, 80) + "..." : n.name,
              description: `Tone: ${n.tone > 0 ? "+" : ""}${n.tone.toFixed(1)}`,
              lat: n.lat,
              lon: n.lon,
              meta: { tone: n.tone, url: n.url },
            })
          }
        />
      ))}
    </CustomDataSource>
  );
}
