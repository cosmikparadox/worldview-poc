import { Entity, CustomDataSource } from "resium";
import {
  Cartesian3,
  Color,
  VerticalOrigin,
  DistanceDisplayCondition,
  NearFarScalar,
  ColorMaterialProperty,
} from "cesium";
import { HOTSPOTS } from "../config/hotspots";
import { useSelectionStore } from "../stores/useSelectionStore";

export function HotspotLayer() {
  const select = useSelectionStore((s) => s.select);

  return (
    <CustomDataSource name="hotspots">
      {HOTSPOTS.map((h) => {
        const color = Color.fromCssColorString(h.color);
        return (
          <Entity
            key={h.id}
            position={Cartesian3.fromDegrees(h.lon, h.lat)}
            point={{
              pixelSize: 24,
              color: color.withAlpha(0.95),
              outlineColor: Color.WHITE.withAlpha(0.9),
              outlineWidth: 3,
              scaleByDistance: new NearFarScalar(5e5, 1.8, 3e7, 0.7),
              distanceDisplayCondition: new DistanceDisplayCondition(0, 50_000_000),
              disableDepthTestDistance: Number.POSITIVE_INFINITY,
            }}
            label={{
              text: h.name,
              font: "bold 13px sans-serif",
              fillColor: Color.WHITE,
              outlineColor: Color.BLACK,
              outlineWidth: 4,
              style: 2,
              verticalOrigin: VerticalOrigin.BOTTOM,
              pixelOffset: { x: 0, y: -22 } as any,
              scaleByDistance: new NearFarScalar(5e5, 1.2, 2e7, 0.3),
              distanceDisplayCondition: new DistanceDisplayCondition(0, 15_000_000),
              disableDepthTestDistance: Number.POSITIVE_INFINITY,
            }}
            ellipse={{
              semiMajorAxis: h.radius * 1000 || 250000,
              semiMinorAxis: h.radius * 1000 || 250000,
              height: 0,
              material: new ColorMaterialProperty(color.withAlpha(0.12)),
            }}
            onClick={() =>
              select({
                source: "hotspot",
                id: h.id,
                title: h.name,
                description: h.description,
                lat: h.lat,
                lon: h.lon,
                meta: { type: h.type, radius: h.radius },
              })
            }
          />
        );
      })}
    </CustomDataSource>
  );
}
