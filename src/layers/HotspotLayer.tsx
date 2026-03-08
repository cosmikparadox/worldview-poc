import { Entity, CustomDataSource } from "resium";
import { Cartesian3, Color, VerticalOrigin, DistanceDisplayCondition } from "cesium";
import { HOTSPOTS } from "../config/hotspots";
import { useSelectionStore } from "../stores/useSelectionStore";

export function HotspotLayer() {
  const select = useSelectionStore((s) => s.select);

  return (
    <CustomDataSource name="hotspots">
      {HOTSPOTS.map((h) => (
        <Entity
          key={h.id}
          position={Cartesian3.fromDegrees(h.lon, h.lat)}
          point={{
            pixelSize: 14,
            color: Color.fromCssColorString(h.color).withAlpha(0.9),
            outlineColor: Color.WHITE,
            outlineWidth: 2,
            distanceDisplayCondition: new DistanceDisplayCondition(0, 50_000_000),
          }}
          label={{
            text: h.name,
            font: "bold 12px sans-serif",
            fillColor: Color.WHITE,
            outlineColor: Color.BLACK,
            outlineWidth: 3,
            style: 2,
            verticalOrigin: VerticalOrigin.BOTTOM,
            pixelOffset: { x: 0, y: -14 } as any,
            distanceDisplayCondition: new DistanceDisplayCondition(0, 15_000_000),
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
      ))}
    </CustomDataSource>
  );
}
