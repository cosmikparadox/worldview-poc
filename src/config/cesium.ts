import { Ion, ImageryLayer, OpenStreetMapImageryProvider } from "cesium";

// Cesium Ion token — set VITE_CESIUM_ION_TOKEN in .env for terrain
const CESIUM_TOKEN =
  import.meta.env.VITE_CESIUM_ION_TOKEN ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlYWE1OWUxNy1mMWZiLTQzYjYtYTQ0OS1kMWFjYmFkNjc5YzciLCJpZCI6NTc1ODcsImlhdCI6MTYyMjY0NDE4Mn0.XcKpgANiY19MC4bdFUXMVEBToBmqS8kuYpUlxJHYZxk";

export function initCesium() {
  Ion.defaultAccessToken = CESIUM_TOKEN;
}

// Use OpenStreetMap imagery (free, no token needed) as base layer
const osmProvider = new OpenStreetMapImageryProvider({
  url: "https://tile.openstreetmap.org/",
});

export const viewerOptions = {
  // Don't use Ion terrain (needs valid token) — use default ellipsoid
  // terrain: Terrain.fromWorldTerrain(),
  baseLayer: new ImageryLayer(osmProvider),
  animation: false,
  baseLayerPicker: false,
  fullscreenButton: false,
  vrButton: false,
  geocoder: false,
  homeButton: false,
  infoBox: false,
  sceneModePicker: false,
  selectionIndicator: false,
  timeline: false,
  navigationHelpButton: false,
  requestRenderMode: false, // continuous rendering — needed for Resium entity updates
};
