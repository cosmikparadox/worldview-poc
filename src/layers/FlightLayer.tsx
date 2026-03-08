import { useEffect, useRef, useCallback } from "react";
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

// Altitude-based coloring: low=cyan, mid=blue, high=purple
function altColor(alt: number): Color {
  if (alt > 12000) return Color.fromCssColorString("#aa77ff"); // cruising
  if (alt > 6000) return Color.fromCssColorString("#55aaff");  // climbing
  if (alt > 2000) return Color.fromCssColorString("#44ddff");  // approach
  return Color.fromCssColorString("#66ffcc");                   // low
}

export function FlightLayer() {
  const { viewer } = useCesium();
  const { data } = useFlights();
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

  // Animate: pulse flight brightness every second
  const animFrameRef = useRef(0);
  const pulseRef = useRef(0);

  const animate = useCallback(() => {
    pulseRef.current = (pulseRef.current + 0.03) % (Math.PI * 2);
    const brightness = 0.7 + Math.sin(pulseRef.current) * 0.15;
    const collection = collectionRef.current;
    if (collection) {
      const len = collection.length;
      for (let i = 0; i < len; i++) {
        const p = collection.get(i);
        if (p) {
          // Subtle size pulsing per point (staggered)
          const phase = pulseRef.current + i * 0.01;
          const s = 0.9 + Math.sin(phase) * 0.1;
          p.pixelSize = 7 * s * brightness;
        }
      }
    }
    animFrameRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    animFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [animate]);

  // Update points when data changes
  useEffect(() => {
    const collection = collectionRef.current;
    if (!collection || !data) return;

    collection.removeAll();
    for (const f of data) {
      const color = altColor(f.altitude);
      collection.add({
        position: Cartesian3.fromDegrees(f.lon, f.lat, Math.max(f.altitude, 500)),
        pixelSize: 7,
        color: color.withAlpha(0.9),
        outlineColor: Color.WHITE.withAlpha(0.3),
        outlineWidth: 1,
        scaleByDistance: new NearFarScalar(1e5, 2.5, 3e7, 0.8),
        disableDepthTestDistance: 5e6,
      });
    }
  }, [data]);

  return null;
}
