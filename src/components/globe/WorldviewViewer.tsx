import { Viewer, CameraFlyTo } from "resium";
import { viewerOptions } from "../../config/cesium";
import { Cartesian3 } from "cesium";
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
        destination={Cartesian3.fromDegrees(40, 25, 20_000_000)}
        duration={0}
        once
      />
      {children}
    </Viewer>
  );
}
