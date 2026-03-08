import { useEffect, useRef } from "react";
import { useCesium } from "resium";
import {
  PointPrimitiveCollection,
  Cartesian2,
  Cartesian3,
  Color,
  NearFarScalar,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  defined,
} from "cesium";
import { useShips } from "../hooks/useShips";
import { useSelectionStore } from "../stores/useSelectionStore";

const SHIP_COLOR = Color.fromCssColorString("#22ddaa").withAlpha(0.85);
const SHIP_OUTLINE = Color.fromCssColorString("#0a6644").withAlpha(0.5);

function shipTypeLabel(type: number): string {
  if (type >= 70 && type <= 79) return "Cargo";
  if (type >= 80 && type <= 89) return "Tanker";
  if (type >= 60 && type <= 69) return "Passenger";
  if (type >= 40 && type <= 49) return "High-Speed Craft";
  if (type >= 30 && type <= 39) return "Fishing";
  if (type >= 50 && type <= 59) return "Special Craft";
  return "Vessel";
}

export function ShipLayer() {
  const { viewer } = useCesium();
  const { data } = useShips();
  const select = useSelectionStore((s) => s.select);
  const collectionRef = useRef<PointPrimitiveCollection | null>(null);
  const handlerRef = useRef<ScreenSpaceEventHandler | null>(null);
  const dataRef = useRef(data);
  dataRef.current = data;

  // Create PointPrimitiveCollection once
  useEffect(() => {
    if (!viewer) return;
    const collection = new PointPrimitiveCollection();
    viewer.scene.primitives.add(collection);
    collectionRef.current = collection;

    const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction((movement: { position: Cartesian2 }) => {
      const picked = viewer.scene.pick(movement.position);
      if (defined(picked) && picked.primitive && picked.collection === collection) {
        const idx = picked.primitive._index ?? -1;
        const ships = dataRef.current;
        if (ships && idx >= 0 && idx < ships.length) {
          const s = ships[idx];
          select({
            source: "ship",
            id: String(s.mmsi),
            title: s.name,
            description: `${shipTypeLabel(s.shipType)} · ${s.sog.toFixed(1)} kn · COG ${Math.round(s.cog)}°`,
            lat: s.lat,
            lon: s.lon,
            meta: {
              mmsi: s.mmsi,
              type: shipTypeLabel(s.shipType),
              speed: `${s.sog.toFixed(1)} kn`,
              course: `${Math.round(s.cog)}°`,
            },
          });
        }
      }
    }, ScreenSpaceEventType.LEFT_CLICK);
    handlerRef.current = handler;

    return () => {
      viewer.scene.primitives.remove(collection);
      handler.destroy();
    };
  }, [viewer, select]);

  // Update points when data changes
  useEffect(() => {
    const collection = collectionRef.current;
    if (!collection || !data) return;

    collection.removeAll();
    for (const s of data) {
      collection.add({
        position: Cartesian3.fromDegrees(s.lon, s.lat, 0),
        pixelSize: 3,
        color: SHIP_COLOR,
        outlineColor: SHIP_OUTLINE,
        outlineWidth: 1,
        scaleByDistance: new NearFarScalar(5e4, 2.5, 2e7, 0.3),
      });
    }
  }, [data]);

  return null;
}
