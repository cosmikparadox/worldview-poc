import { Entity, CustomDataSource } from "resium";
import { Cartesian3, Color, DistanceDisplayCondition } from "cesium";
import { useNews } from "../hooks/useNews";
import type { NewsEvent } from "../hooks/useNews";
import { useSelectionStore } from "../stores/useSelectionStore";
import { useMemo } from "react";

function toneColor(tone: number): Color {
  if (tone < -3) return Color.fromCssColorString("#ff4466"); // very negative
  if (tone < 0) return Color.fromCssColorString("#cc7744"); // negative
  if (tone > 3) return Color.fromCssColorString("#44cc88"); // positive
  return Color.fromCssColorString("#a06fff"); // neutral
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
            pixelSize: 7,
            color: toneColor(n.tone),
            outlineColor: Color.fromCssColorString("#ffffff").withAlpha(0.4),
            outlineWidth: 1,
            distanceDisplayCondition: new DistanceDisplayCondition(0, 30_000_000),
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
