import { useLayerStore } from "../../stores/useLayerStore";
import type { LayerId } from "../../stores/useLayerStore";
import { useDataSourceStore } from "../../stores/useDataSourceStore";
import type { FeedInfo } from "../../stores/useDataSourceStore";

const LAYER_META: { id: LayerId; label: string; color: string; group: string }[] = [
  { id: "earthquakes", label: "Earthquakes", color: "#ffcc22", group: "Natural" },
  { id: "disasters", label: "Disasters", color: "#ff6622", group: "Natural" },
  { id: "hotspots", label: "SC Hotspots", color: "#ff5b5b", group: "Supply Chain" },
  { id: "flights", label: "Flights", color: "#88ccff", group: "Transport" },
  { id: "ships", label: "Ships (AIS)", color: "#22ddaa", group: "Transport" },
  { id: "news", label: "News Events", color: "#a06fff", group: "Intelligence" },
  { id: "conflicts", label: "Conflicts", color: "#ff4444", group: "Intelligence" },
  { id: "spaceWeather", label: "Space Weather", color: "#ffbb44", group: "Environment" },
];

function StatusDot({ status }: { status?: FeedInfo["status"] }) {
  const color = status === "success" ? "#22dd88" : status === "error" ? "#ff4444" : status === "loading" ? "#ffbb44" : "#555";
  return <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, display: "inline-block", flexShrink: 0 }} />;
}

export function LayerPanel() {
  const { layers, toggle } = useLayerStore();
  const feeds = useDataSourceStore((s) => s.feeds);

  const groups = LAYER_META.reduce<Record<string, typeof LAYER_META>>((acc, l) => {
    (acc[l.group] = acc[l.group] || []).push(l);
    return acc;
  }, {});

  return (
    <div style={{ padding: "12px 14px", fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ color: "#8899bb", fontSize: 10, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>
        Data Layers
      </div>
      {Object.entries(groups).map(([group, items]) => (
        <div key={group} style={{ marginBottom: 14 }}>
          <div style={{ color: "#556688", fontSize: 10, fontFamily: "monospace", marginBottom: 6, textTransform: "uppercase" }}>{group}</div>
          {items.map((l) => (
            <label
              key={l.id}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", cursor: "pointer", color: layers[l.id] ? "#e0e8f0" : "#556688" }}
            >
              <input
                type="checkbox"
                checked={layers[l.id]}
                onChange={() => toggle(l.id)}
                style={{ accentColor: l.color, width: 16, height: 16 }}
              />
              <span style={{ flex: 1 }}>{l.label}</span>
              <StatusDot status={feeds[l.id]?.status} />
            </label>
          ))}
        </div>
      ))}
    </div>
  );
}
