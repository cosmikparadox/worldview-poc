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
import { useDataHub } from "../datahub/useDataHub";
import { useSelectionStore } from "../stores/useSelectionStore";

function fireColor(confidence: string, frp: number): Color {
  if (frp > 100) return Color.fromCssColorString("#ff2200"); // intense
  if (frp > 30) return Color.fromCssColorString("#ff6600");  // moderate
  if (confidence === "high") return Color.fromCssColorString("#ff8800");
  return Color.fromCssColorString("#ffaa33"); // low
}

export function FireLayer() {
  const { viewer } = useCesium();
  const { data } = useDataHub("fire");
  const select = useSelectionStore((s) => s.select);
  const collectionRef = useRef<PointPrimitiveCollection | null>(null);
  const handlerRef = useRef<ScreenSpaceEventHandler | null>(null);
  const dataRef = useRef(data);
  dataRef.current = data;

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
        const fires = dataRef.current;
        if (fires && idx >= 0 && idx < fires.length) {
          const f = fires[idx];
          select({
            source: "fire",
            id: f.id,
            title: `Fire Hotspot`,
            description: `${f.satellite} · ${f.confidence} confidence · FRP ${f.frp.toFixed(0)} MW`,
            lat: f.lat,
            lon: f.lon,
            meta: {
              brightness: Math.round(f.brightness),
              confidence: f.confidence,
              frp: f.frp.toFixed(1),
              satellite: f.satellite,
              dayNight: f.dayNight === "D" ? "Day" : "Night",
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

  useEffect(() => {
    const collection = collectionRef.current;
    if (!collection || !data) return;

    collection.removeAll();
    for (const f of data) {
      const color = fireColor(f.confidence, f.frp);
      const size = Math.min(4 + f.frp * 0.05, 12);
      collection.add({
        position: Cartesian3.fromDegrees(f.lon, f.lat, 0),
        pixelSize: size,
        color: color.withAlpha(0.85),
        outlineColor: Color.fromCssColorString("#ff4400").withAlpha(0.3),
        outlineWidth: 1,
        scaleByDistance: new NearFarScalar(1e5, 2.0, 3e7, 0.5),
      });
    }
  }, [data]);

  return null;
}
