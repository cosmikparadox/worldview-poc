import { useState, useEffect } from "react";
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
import { useDataSourceStore } from "./stores/useDataSourceStore";
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

      {/* Live activity ticker (bottom-right) */}
      <ActivityTicker />

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes tickerFlash { 0% { background: rgba(0,229,176,0.15); } 100% { background: transparent; } }
      `}</style>
    </div>
  );
}

function ActivityTicker() {
  const feeds = useDataSourceStore((s) => s.feeds);
  const [log, setLog] = useState<{ key: string; count: number; time: number }[]>([]);

  useEffect(() => {
    const entries = Object.entries(feeds);
    const now = Date.now();
    const active = entries
      .filter(([, f]) => f.status === "success" && f.lastUpdated && f.count > 0)
      .map(([key, f]) => ({ key, count: f.count, time: f.lastUpdated!.getTime() }))
      .filter((e) => now - e.time < 120_000) // last 2 min
      .sort((a, b) => b.time - a.time);
    setLog(active);
  }, [feeds]);

  if (log.length === 0) return null;

  const totalItems = Object.values(feeds).reduce((sum, f) => sum + (f.count || 0), 0);

  return (
    <div className="activity-ticker">
      <div className="at-header">
        <span className="at-dot" />
        <span className="at-label">LIVE ACTIVITY</span>
        <span className="at-total">{totalItems.toLocaleString()} items</span>
      </div>
      {log.slice(0, 5).map((entry) => {
        const age = Math.floor((Date.now() - entry.time) / 1000);
        return (
          <div key={entry.key} className="at-row" style={{ animation: age < 5 ? "tickerFlash 1s ease" : "none" }}>
            <span className="at-source">{entry.key}</span>
            <span className="at-count">{entry.count}</span>
            <span className="at-age">{age < 60 ? `${age}s` : `${Math.floor(age / 60)}m`}</span>
          </div>
        );
      })}
    </div>
  );
}
