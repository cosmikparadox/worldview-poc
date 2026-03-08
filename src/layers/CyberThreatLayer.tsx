import { Entity, CustomDataSource } from "resium";
import { Cartesian3, Color, NearFarScalar, DistanceDisplayCondition } from "cesium";
import { useDataHub } from "../datahub/useDataHub";
import { useSelectionStore } from "../stores/useSelectionStore";
import { useMemo } from "react";

function threatColor(type: string): Color {
  switch (type) {
    case "malware":
      return Color.fromCssColorString("#ff3344");
    case "phishing":
      return Color.fromCssColorString("#ffbb22");
    case "c2":
      return Color.fromCssColorString("#aa44ff");
    case "exploit":
      return Color.fromCssColorString("#ff8822");
    default:
      return Color.fromCssColorString("#44ff88");
  }
}

export function CyberThreatLayer() {
  const { data } = useDataHub("cyber");
  const select = useSelectionStore((s) => s.select);
  const threats = useMemo(() => data || [], [data]);

  return (
    <CustomDataSource name="cyberThreats">
      {threats.map((t) => {
        const color = threatColor(t.threatType);
        const size = Math.min(6 + t.pulseCount * 0.5, 16);
        return (
          <Entity
            key={t.id}
            position={Cartesian3.fromDegrees(t.lon, t.lat)}
            point={{
              pixelSize: size,
              color: color.withAlpha(0.8),
              outlineColor: Color.fromCssColorString("#00ff66").withAlpha(0.3),
              outlineWidth: 1,
              scaleByDistance: new NearFarScalar(5e5, 1.5, 3e7, 0.5),
              distanceDisplayCondition: new DistanceDisplayCondition(0, 50_000_000),
            }}
            onClick={() =>
              select({
                source: "cyber",
                id: t.id,
                title: `${t.threatType.toUpperCase()} — ${t.country || "Unknown"}`,
                description: t.description,
                lat: t.lat,
                lon: t.lon,
                meta: {
                  type: t.threatType,
                  indicator: t.indicator.slice(0, 40),
                  indicatorType: t.indicatorType,
                  country: t.country,
                  pulses: t.pulseCount,
                },
              })
            }
          />
        );
      })}
    </CustomDataSource>
  );
}
