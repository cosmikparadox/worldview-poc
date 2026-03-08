import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteStaticCopy } from "vite-plugin-static-copy";

const cesiumBase = "cesiumStatic";

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        { src: "node_modules/cesium/Build/Cesium/Workers", dest: cesiumBase },
        { src: "node_modules/cesium/Build/Cesium/ThirdParty", dest: cesiumBase },
        { src: "node_modules/cesium/Build/Cesium/Assets", dest: cesiumBase },
        { src: "node_modules/cesium/Build/Cesium/Widgets", dest: cesiumBase },
      ],
    }),
  ],
  // CESIUM_BASE_URL is set via <script> in index.html before modules load
  build: {
    target: "esnext",
    chunkSizeWarningLimit: 5000,
  },
});
