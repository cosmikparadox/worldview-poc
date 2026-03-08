import { Entity, CustomDataSource } from "resium";
import { Cartesian3, Color, NearFarScalar, DistanceDisplayCondition } from "cesium";
import { useFlights } from "../hooks/useFlights";
import type { Flight } from "../hooks/useFlights";
import { useSelectionStore } from "../stores/useSelectionStore";
import { useMemo } from "react";

export function FlightLayer() {
  const { data } = useFlights();
  const select = useSelectionStore((s) => s.select);
  const flights = useMemo(() => data || [], [data]);

  return (
    <CustomDataSource name="flights">
      {flights.map((f: Flight) => (
        <Entity
          key={f.id}
          position={Cartesian3.fromDegrees(f.lon, f.lat, Math.max(f.altitude, 100))}
          point={{
            pixelSize: 5,
            color: Color.fromCssColorString("#55bbff").withAlpha(0.9),
            outlineColor: Color.fromCssColorString("#2266aa").withAlpha(0.5),
            outlineWidth: 1,
            scaleByDistance: new NearFarScalar(1e4, 2.5, 1.5e7, 0.4),
            distanceDisplayCondition: new DistanceDisplayCondition(0, 40_000_000),
          }}
          label={{
            text: f.callsign || "",
            font: "10px monospace",
            fillColor: Color.fromCssColorString("#88ccff"),
            outlineColor: Color.BLACK,
            outlineWidth: 2,
            style: 2,
            pixelOffset: { x: 0, y: -10 } as any,
            scaleByDistance: new NearFarScalar(1e4, 1.0, 2e6, 0),
            distanceDisplayCondition: new DistanceDisplayCondition(0, 1_500_000),
          }}
          onClick={() =>
            select({
              source: "flight",
              id: f.id,
              title: f.callsign || f.id,
              description: `${f.country} · ${Math.round(f.altitude)}m alt · ${Math.round(f.velocity)} m/s`,
              lat: f.lat,
              lon: f.lon,
              meta: {
                altitude: f.altitude,
                velocity: f.velocity,
                heading: f.heading,
                country: f.country,
              },
            })
          }
        />
      ))}
    </CustomDataSource>
  );
}
