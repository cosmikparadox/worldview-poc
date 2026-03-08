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
import { useFlights } from "../hooks/useFlights";
import { useSelectionStore } from "../stores/useSelectionStore";

export function FlightLayer() {
  const { viewer } = useCesium();
  const { data } = useFlights();
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

    // Click handler for flights
    const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction((movement: { position: Cartesian2 }) => {
      const picked = viewer.scene.pick(movement.position);
      if (defined(picked) && picked.primitive && picked.collection === collection) {
        const idx = picked.primitive._index ?? -1;
        const flights = dataRef.current;
        if (flights && idx >= 0 && idx < flights.length) {
          const f = flights[idx];
          select({
            source: "flight",
            id: f.id,
            title: f.callsign || f.id,
            description: `${f.country} · ${Math.round(f.altitude)}m alt · ${Math.round(f.velocity * 3.6)} km/h`,
            lat: f.lat,
            lon: f.lon,
            meta: {
              altitude: f.altitude,
              velocity: Math.round(f.velocity * 3.6),
              heading: Math.round(f.heading),
              country: f.country,
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
    for (const f of data) {
      collection.add({
        position: Cartesian3.fromDegrees(f.lon, f.lat, Math.max(f.altitude, 500)),
        pixelSize: 4,
        color: Color.fromCssColorString("#55bbff").withAlpha(0.85),
        outlineColor: Color.fromCssColorString("#1155aa").withAlpha(0.4),
        outlineWidth: 1,
        scaleByDistance: new NearFarScalar(5e4, 3.0, 2e7, 0.5),
      });
    }
  }, [data]);

  return null; // Rendering is handled directly via Cesium primitives
}
