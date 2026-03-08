import { Entity, CustomDataSource } from "resium";
import {
  Cartesian3,
  Color,
  NearFarScalar,
  DistanceDisplayCondition,
  EntityCluster,
  ColorMaterialProperty,
} from "cesium";
import { useEarthquakes } from "../hooks/useEarthquakes";
import type { Earthquake } from "../hooks/useEarthquakes";
import { useSelectionStore } from "../stores/useSelectionStore";
import { useMemo } from "react";

function magToColor(mag: number): Color {
  if (mag >= 7) return Color.fromCssColorString("#ff2020");
  if (mag >= 5) return Color.fromCssColorString("#ff8844");
  if (mag >= 3) return Color.fromCssColorString("#ffcc22");
  return Color.fromCssColorString("#66cc66");
}

function magToRadius(mag: number): number {
  if (mag >= 7) return 150000;
  if (mag >= 5) return 80000;
  if (mag >= 3) return 40000;
  return 20000;
}

const cluster = new EntityCluster({
  enabled: true,
  pixelRange: 25,
  minimumClusterSize: 8,
});

export function EarthquakeLayer() {
  const { data } = useEarthquakes();
  const select = useSelectionStore((s) => s.select);
  const quakes = useMemo(() => data || [], [data]);
  const significant = useMemo(() => quakes.filter((eq) => eq.mag >= 4), [quakes]);

  return (
    <CustomDataSource name="earthquakes" clustering={cluster}>
      {quakes.map((eq: Earthquake) => (
        <Entity
          key={eq.id}
          position={Cartesian3.fromDegrees(eq.lon, eq.lat)}
          point={{
            pixelSize: 6 + eq.mag * 3,
            color: magToColor(eq.mag).withAlpha(0.85),
            outlineColor: Color.BLACK.withAlpha(0.4),
            outlineWidth: 1,
            scaleByDistance: new NearFarScalar(5e5, 2.0, 2e7, 0.5),
            distanceDisplayCondition: new DistanceDisplayCondition(0, 50_000_000),
          }}
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
      {significant.map((eq) => (
        <Entity
          key={`ring-${eq.id}`}
          position={Cartesian3.fromDegrees(eq.lon, eq.lat)}
          ellipse={{
            semiMajorAxis: magToRadius(eq.mag),
            semiMinorAxis: magToRadius(eq.mag),
            height: 0,
            material: new ColorMaterialProperty(magToColor(eq.mag).withAlpha(0.15)),
          }}
        />
      ))}
    </CustomDataSource>
  );
}
