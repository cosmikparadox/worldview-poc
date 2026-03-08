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
              pixelSize: 20,
              color: color.withAlpha(0.95),
              outlineColor: Color.WHITE.withAlpha(0.9),
              outlineWidth: 2,
              scaleByDistance: new NearFarScalar(5e5, 1.6, 2e7, 0.6),
              distanceDisplayCondition: new DistanceDisplayCondition(0, 50_000_000),
            }}
            label={{
              text: h.name,
              font: "bold 13px sans-serif",
              fillColor: Color.WHITE,
              outlineColor: Color.BLACK,
              outlineWidth: 3,
              style: 2,
              verticalOrigin: VerticalOrigin.BOTTOM,
              pixelOffset: { x: 0, y: -18 } as any,
              scaleByDistance: new NearFarScalar(5e5, 1.0, 1.5e7, 0),
              distanceDisplayCondition: new DistanceDisplayCondition(0, 15_000_000),
            }}
            ellipse={{
              semiMajorAxis: h.radius * 1000 || 200000,
              semiMinorAxis: h.radius * 1000 || 200000,
              height: 0,
              material: new ColorMaterialProperty(color.withAlpha(0.1)),
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
