import { useSelectionStore } from "../../stores/useSelectionStore";

const sourceColors: Record<string, string> = {
  earthquake: "#ffcc22",
  disaster: "#ff6622",
  hotspot: "#ff5b5b",
  flight: "#88ccff",
  ship: "#22ddaa",
  news: "#a06fff",
  conflict: "#ff4444",
};

export function EntityInfoPanel() {
  const { selected, select } = useSelectionStore();
  if (!selected) return null;

  const color = sourceColors[selected.source] || "#00e5b0";

  return (
    <div
      style={{
        position: "absolute",
        bottom: 20,
        left: 20,
        maxWidth: 360,
        background: "rgba(8, 14, 28, 0.95)",
        border: `1px solid ${color}40`,
        borderRadius: 12,
        padding: "16px 18px",
        fontFamily: "'DM Sans', sans-serif",
        backdropFilter: "blur(10px)",
        zIndex: 100,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <span
          style={{
            background: `${color}22`,
            color,
            fontSize: 10,
            fontFamily: "monospace",
            padding: "2px 8px",
            borderRadius: 10,
            textTransform: "uppercase",
          }}
        >
          {selected.source}
        </span>
        <button
          onClick={() => select(null)}
          style={{ background: "none", border: "none", color: "#556688", cursor: "pointer", fontSize: 18, lineHeight: 1, padding: 0 }}
        >
          ×
        </button>
      </div>
      <div style={{ color: "#e0e8f0", fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{selected.title}</div>
      <div style={{ color: "#8899bb", fontSize: 12, lineHeight: 1.6, marginBottom: 10 }}>{selected.description}</div>
      <div style={{ color: "#445566", fontSize: 10, fontFamily: "monospace" }}>
        {selected.lat.toFixed(3)}° N, {selected.lon.toFixed(3)}° E
      </div>
      {Object.entries(selected.meta).map(([k, v]) => (
        <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontFamily: "monospace", padding: "2px 0", color: "#667788" }}>
          <span>{k}</span>
          <span style={{ color: "#aabbcc" }}>{typeof v === "number" ? v.toFixed(2) : String(v)}</span>
        </div>
      ))}
    </div>
  );
}
