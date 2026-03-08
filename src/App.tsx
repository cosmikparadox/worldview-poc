import { useState } from "react";
import { WorldviewViewer } from "./components/globe/WorldviewViewer";
import { EntityInfoPanel } from "./components/globe/EntityInfoPanel";
import { EarthquakeLayer } from "./layers/EarthquakeLayer";
import { DisasterLayer } from "./layers/DisasterLayer";
import { HotspotLayer } from "./layers/HotspotLayer";
import { FlightLayer } from "./layers/FlightLayer";
import { NewsLayer } from "./layers/NewsLayer";
import { SpaceWeatherOverlay } from "./layers/SpaceWeatherOverlay";
import { LayerPanel } from "./components/panels/LayerPanel";
import { DataSourcePanel } from "./components/panels/DataSourcePanel";
import { DataSourcesPanel } from "./components/panels/DataSourcesPanel";
import { useLayerStore } from "./stores/useLayerStore";
import "./styles/index.css";

type SidebarTab = "layers" | "sources";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [tab, setTab] = useState<SidebarTab>("layers");
  const layers = useLayerStore((s) => s.layers);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <WorldviewViewer>
        {layers.earthquakes && <EarthquakeLayer />}
        {layers.disasters && <DisasterLayer />}
        {layers.hotspots && <HotspotLayer />}
        {layers.flights && <FlightLayer />}
        {layers.news && <NewsLayer />}
      </WorldviewViewer>

      {/* Space weather overlay (top-right) */}
      {layers.spaceWeather && <SpaceWeatherOverlay />}

      {/* Sidebar toggle */}
      <button
        className="wv-toggle-btn"
        onClick={() => setSidebarOpen((o) => !o)}
        style={{ left: sidebarOpen ? 292 : 12 }}
      >
        {sidebarOpen ? "\u25C2" : "\u25B8"}
      </button>

      {/* Sidebar */}
      <div className={`wv-sidebar ${sidebarOpen ? "" : "collapsed"}`}>
        {/* Header */}
        <div className="wv-sidebar-header">
          <div className="wv-logo">WORLDVIEW</div>
          <div className="wv-subtitle">Real-Time Geospatial Intelligence</div>
        </div>

        {/* Tab switcher */}
        <div className="wv-tab-bar">
          <button
            className={`wv-tab ${tab === "layers" ? "wv-tab-active" : ""}`}
            onClick={() => setTab("layers")}
          >
            Layers
          </button>
          <button
            className={`wv-tab ${tab === "sources" ? "wv-tab-active" : ""}`}
            onClick={() => setTab("sources")}
          >
            Data Sources
          </button>
        </div>

        {/* Tab content */}
        <div className="wv-tab-content">
          {tab === "layers" ? (
            <>
              <LayerPanel />
              <DataSourcePanel />
            </>
          ) : (
            <DataSourcesPanel />
          )}
        </div>
      </div>

      {/* Top bar */}
      <div className="wv-topbar" style={{ left: sidebarOpen ? 292 : 52 }}>
        <div className="wv-title">
          <span style={{ color: "#e0e8f0", fontSize: 13, fontWeight: 600 }}>
            Supply Chain Intelligence
          </span>
          <span style={{ color: "#445566", fontSize: 11, marginLeft: 8 }}>Live</span>
          <span className="wv-live-dot" />
        </div>
      </div>

      {/* Entity info panel */}
      <EntityInfoPanel />

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
