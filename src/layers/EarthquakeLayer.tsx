import { Entity, CustomDataSource } from "resium";
import { Cartesian3, Color, NearFarScalar, DistanceDisplayCondition, EntityCluster } from "cesium";
import { useEarthquakes } from "../hooks/useEarthquakes";
import type { Earthquake } from "../hooks/useEarthquakes";
import { useSelectionStore } from "../stores/useSelectionStore";
import { useMemo } from "react";

function magToColor(mag: number): Color {
  if (mag >= 7) return Color.fromCssColorString("#ff2020");
  if (mag >= 5) return Color.fromCssColorString("#ff8844");
  if (mag >= 3) return Color.fromCssColorString("#ffcc22");
  return Color.fromCssColorString("#44dd88");
}

const cluster = new EntityCluster({
  enabled: true,
  pixelRange: 40,
  minimumClusterSize: 3,
});

export function EarthquakeLayer() {
  const { data } = useEarthquakes();
  const select = useSelectionStore((s) => s.select);

  const quakes = useMemo(() => data || [], [data]);

  return (
    <CustomDataSource name="earthquakes" clustering={cluster}>
      {quakes.map((eq: Earthquake) => (
        <Entity
          key={eq.id}
          position={Cartesian3.fromDegrees(eq.lon, eq.lat)}
          point={{
            pixelSize: 6 + eq.mag * 2.5,
            color: magToColor(eq.mag),
            outlineColor: Color.BLACK,
            outlineWidth: 1,
            scaleByDistance: new NearFarScalar(1e3, 1.5, 1e7, 0.4),
            distanceDisplayCondition: new DistanceDisplayCondition(0, 50_000_000),
          }}
          description={`<b>${eq.title}</b><br/>Magnitude: ${eq.mag}<br/>Depth: ${eq.depth.toFixed(1)} km<br/>Time: ${new Date(eq.time).toUTCString()}`}
          onClick={() =>
            select({
              source: "earthquake",
              id: eq.id,
              title: eq.title,
              description: `M${eq.mag} · ${eq.depth.toFixed(0)}km deep`,
              lat: eq.lat,
              lon: eq.lon,
              meta: { magnitude: eq.mag, depth: eq.depth, time: eq.time, url: eq.url },
            })
          }
        />
      ))}
    </CustomDataSource>
  );
}
