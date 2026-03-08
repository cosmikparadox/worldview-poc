import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { initCesium } from "./config/cesium";
import App from "./App";

// Must run before any Cesium components mount
initCesium();

// CesiumJS requires this global for finding Workers/Assets
(window as any).CESIUM_BASE_URL = "/cesiumStatic";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
