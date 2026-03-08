import { Entity, CustomDataSource } from "resium";
import {
  Cartesian3,
  Color,
  VerticalOrigin,
  NearFarScalar,
  DistanceDisplayCondition,
} from "cesium";
import { useDataHub } from "../datahub/useDataHub";
import { useSelectionStore } from "../stores/useSelectionStore";
import { useMemo } from "react";

function tempColor(temp: number): Color {
  if (temp <= -10) return Color.fromCssColorString("#6666ff"); // freezing
  if (temp <= 0) return Color.fromCssColorString("#66aaff");   // cold
  if (temp <= 15) return Color.fromCssColorString("#66ddaa");  // cool
  if (temp <= 25) return Color.fromCssColorString("#aadd44");  // mild
  if (temp <= 35) return Color.fromCssColorString("#ffaa22");  // warm
  return Color.fromCssColorString("#ff4422");                   // hot
}

export function WeatherLayer() {
  const { data } = useDataHub("weather");
  const select = useSelectionStore((s) => s.select);
  const points = useMemo(() => data || [], [data]);

  return (
    <CustomDataSource name="weather">
      {points.map((w) => {
        const color = tempColor(w.temperature);
        return (
          <Entity
            key={w.id}
            position={Cartesian3.fromDegrees(w.lon, w.lat)}
            point={{
              pixelSize: 12,
              color: color.withAlpha(0.8),
              outlineColor: Color.WHITE.withAlpha(0.4),
              outlineWidth: 1.5,
              scaleByDistance: new NearFarScalar(5e5, 1.5, 3e7, 0.5),
              distanceDisplayCondition: new DistanceDisplayCondition(0, 50_000_000),
            }}
            label={{
              text: `${Math.round(w.temperature)}°`,
              font: "bold 10px sans-serif",
              fillColor: Color.WHITE,
              outlineColor: Color.BLACK,
              outlineWidth: 3,
              style: 2,
              verticalOrigin: VerticalOrigin.BOTTOM,
              pixelOffset: { x: 0, y: -14 } as any,
              scaleByDistance: new NearFarScalar(5e5, 1.0, 1.5e7, 0.3),
              distanceDisplayCondition: new DistanceDisplayCondition(0, 10_000_000),
            }}
            onClick={() =>
              select({
                source: "weather",
                id: w.id,
                title: w.id.replace("weather-", "").replace(/-/g, " "),
                description: `${w.condition} · ${Math.round(w.temperature)}°C`,
                lat: w.lat,
                lon: w.lon,
                meta: {
                  temperature: `${w.temperature.toFixed(1)}°C`,
                  wind: `${w.windSpeed.toFixed(1)} m/s`,
                  humidity: `${w.humidity}%`,
                  condition: w.condition,
                  precipitation: `${w.precipitation} mm`,
                },
              })
            }
          />
        );
      })}
    </CustomDataSource>
  );
}
