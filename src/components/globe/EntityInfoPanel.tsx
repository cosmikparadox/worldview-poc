import { useSelectionStore } from "../../stores/useSelectionStore";

const sourceColors: Record<string, string> = {
  earthquake: "#ffcc22",
  disaster: "#ff6622",
  hotspot: "#ff5b5b",
  flight: "#55bbff",
  ship: "#22ddaa",
  news: "#bb88ff",
  conflict: "#ff4444",
  supplyChain: "#44bbff",
  weather: "#22dd88",
  fire: "#ff6622",
  cyber: "#44ff88",
};

const sourceIcons: Record<string, string> = {
  earthquake: "\u{1F4A5}",
  disaster: "\u26A0\uFE0F",
  hotspot: "\u{1F534}",
  flight: "\u2708\uFE0F",
  ship: "\u{1F6A2}",
  news: "\u{1F4F0}",
  conflict: "\u{1F4A3}",
  supplyChain: "\u{1F517}",
  weather: "\u{1F324}\uFE0F",
  fire: "\u{1F525}",
  cyber: "\u{1F6E1}\uFE0F",
};

export function EntityInfoPanel() {
  const { selected, select } = useSelectionStore();
  if (!selected) return null;

  const color = sourceColors[selected.source] || "#00e5b0";
  const icon = sourceIcons[selected.source] || "";

  // Extract link/url from meta
  const link = selected.meta.url || selected.meta.link || "";

  return (
    <div
      style={{
        position: "absolute",
        bottom: 20,
        left: 20,
        width: 340,
        maxWidth: "calc(100vw - 40px)",
        background: "rgba(8, 14, 28, 0.96)",
        border: `1px solid ${color}50`,
        borderRadius: 14,
        padding: "16px 18px",
        fontFamily: "'DM Sans', sans-serif",
        backdropFilter: "blur(14px)",
        zIndex: 100,
        animation: "fadeIn 0.2s ease",
        boxShadow: `0 4px 24px ${color}15`,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span
          style={{
            background: `${color}20`,
            color,
            fontSize: 10,
            fontFamily: "'DM Mono', monospace",
            padding: "3px 10px",
            borderRadius: 10,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}
        >
          {icon} {selected.source}
        </span>
        <button
          onClick={() => select(null)}
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid #1a2540",
            borderRadius: 6,
            color: "#667788",
            cursor: "pointer",
            fontSize: 14,
            width: 24,
            height: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          &times;
        </button>
      </div>

      {/* Title */}
      <div style={{ color: "#e0e8f0", fontSize: 15, fontWeight: 600, marginBottom: 4, lineHeight: 1.3 }}>
        {selected.title}
      </div>

      {/* Description */}
      <div style={{ color: "#8899bb", fontSize: 12, lineHeight: 1.5, marginBottom: 10 }}>
        {selected.description}
      </div>

      {/* Coordinates */}
      <div style={{ color: "#556677", fontSize: 10, fontFamily: "'DM Mono', monospace", marginBottom: 8 }}>
        {selected.lat.toFixed(4)}&deg; {selected.lat >= 0 ? "N" : "S"}, {selected.lon.toFixed(4)}&deg; {selected.lon >= 0 ? "E" : "W"}
      </div>

      {/* Metadata grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 12px", marginBottom: link ? 10 : 0 }}>
        {Object.entries(selected.meta)
          .filter(([k]) => k !== "url" && k !== "link")
          .map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontFamily: "'DM Mono', monospace", padding: "2px 0" }}>
              <span style={{ color: "#556677" }}>{k}</span>
              <span style={{ color: "#aabbcc" }}>
                {typeof v === "number" ? (Number.isInteger(v) ? v : v.toFixed(1)) : String(v).slice(0, 30)}
              </span>
            </div>
          ))}
      </div>

      {/* Link */}
      {link && typeof link === "string" && link.startsWith("http") && (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-block",
            color: "#00e5b0",
            fontSize: 11,
            fontFamily: "'DM Mono', monospace",
            textDecoration: "none",
            marginTop: 4,
          }}
        >
          View source &#8599;
        </a>
      )}
    </div>
  );
}
