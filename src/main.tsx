import "cesium/Build/Cesium/Widgets/widgets.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { initCesium } from "./config/cesium";
import App from "./App";

// Must run before any Cesium components mount
initCesium();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
