import { Viewer, CameraFlyTo } from "resium";
import { viewerOptions } from "../../config/cesium";
import {
  Cartesian3,
  Math as CesiumMath,
  ScreenSpaceEventType,
  Viewer as CesiumViewer,
} from "cesium";
import { useCallback } from "react";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export function WorldviewViewer({ children }: Props) {
  const handleViewerReady = useCallback((viewer: CesiumViewer) => {
    // Disable double-click entity tracking (prevents globe locking to entity)
    viewer.screenSpaceEventHandler.removeInputAction(
      ScreenSpaceEventType.LEFT_DOUBLE_CLICK
    );
    // Never auto-track entities
    viewer.trackedEntity = undefined;
    viewer.selectedEntityChanged.addEventListener(() => {
      viewer.trackedEntity = undefined;
    });
  }, []);

  return (
    <Viewer
      full
      {...viewerOptions}
      style={{ position: "absolute", inset: 0 }}
      ref={(ref) => {
        if (ref?.cesiumElement) {
          handleViewerReady(ref.cesiumElement);
        }
      }}
    >
      <CameraFlyTo
        destination={Cartesian3.fromDegrees(-150, 10, 22_000_000)}
        orientation={{
          heading: CesiumMath.toRadians(0),
          pitch: CesiumMath.toRadians(-90),
          roll: 0,
        }}
        duration={0}
        once
      />
      {children}
    </Viewer>
  );
}
