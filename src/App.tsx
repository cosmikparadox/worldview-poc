import { useState } from "react";
import { WorldviewViewer } from "./components/globe/WorldviewViewer";
import { EntityInfoPanel } from "./components/globe/EntityInfoPanel";
import { EarthquakeLayer } from "./layers/EarthquakeLayer";
import { DisasterLayer } from "./layers/DisasterLayer";
import { HotspotLayer } from "./layers/HotspotLayer";
import { LayerPanel } from "./components/panels/LayerPanel";
import { DataSourcePanel } from "./components/panels/DataSourcePanel";
import { useLayerStore } from "./stores/useLayerStore";
import "./styles/index.css";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const layers = useLayerStore((s) => s.layers);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <WorldviewViewer>
        {layers.earthquakes && <EarthquakeLayer />}
        {layers.disasters && <DisasterLayer />}
        {layers.hotspots && <HotspotLayer />}
      </WorldviewViewer>

      {/* Sidebar toggle */}
      <button className="wv-toggle-btn" onClick={() => setSidebarOpen((o) => !o)} style={{ left: sidebarOpen ? 252 : 12 }}>
        {sidebarOpen ? "◂" : "▸"}
      </button>

      {/* Sidebar */}
      <div className={`wv-sidebar ${sidebarOpen ? "" : "collapsed"}`}>
        <div style={{ padding: "14px 14px 8px", borderBottom: "1px solid #1a2540" }}>
          <div style={{ color: "#00e5b0", fontSize: 14, fontFamily: "monospace", fontWeight: 700, letterSpacing: "0.05em" }}>
            WORLDVIEW
          </div>
          <div style={{ color: "#445566", fontSize: 10, fontFamily: "monospace", marginTop: 2 }}>
            Real-Time Geospatial Intelligence
          </div>
        </div>
        <LayerPanel />
        <DataSourcePanel />
      </div>

      {/* Top bar */}
      <div className="wv-topbar" style={{ left: sidebarOpen ? 252 : 52 }}>
        <div className="wv-title">
          <span style={{ color: "#e0e8f0", fontSize: 13, fontWeight: 600 }}>Supply Chain Intelligence</span>
          <span style={{ color: "#445566", fontSize: 11, marginLeft: 8 }}>Live</span>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22dd88", display: "inline-block", marginLeft: 4, animation: "pulse 2s infinite" }} />
        </div>
      </div>

      {/* Entity info panel */}
      <EntityInfoPanel />

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
      `}</style>
    </div>
  );
}
