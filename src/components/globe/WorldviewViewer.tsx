import { Viewer, CameraFlyTo } from "resium";
import { viewerOptions } from "../../config/cesium";
import { Cartesian3, Math as CesiumMath } from "cesium";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export function WorldviewViewer({ children }: Props) {
  return (
    <Viewer
      full
      {...viewerOptions}
      style={{ position: "absolute", inset: 0 }}
    >
      <CameraFlyTo
        destination={Cartesian3.fromDegrees(30, 20, 18_000_000)}
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
