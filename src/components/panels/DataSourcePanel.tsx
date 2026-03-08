import { useDataSourceStore } from "../../stores/useDataSourceStore";

function timeSince(date: Date | null): string {
  if (!date) return "—";
  const sec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (sec < 60) return `${sec}s ago`;
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  return `${Math.floor(sec / 3600)}h ago`;
}

export function DataSourcePanel() {
  const feeds = useDataSourceStore((s) => s.feeds);
  const entries = Object.entries(feeds);

  if (entries.length === 0) return null;

  return (
    <div style={{ padding: "12px 14px", borderTop: "1px solid #1a2540" }}>
      <div style={{ color: "#8899bb", fontSize: 10, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>
        Live Feeds
      </div>
      {entries.map(([key, info]) => (
        <div key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "3px 0", fontSize: 11, fontFamily: "monospace" }}>
          <span style={{ color: info.status === "success" ? "#88ccaa" : info.status === "error" ? "#ff6666" : "#667788" }}>
            {key}
          </span>
          <span style={{ color: "#445566" }}>
            {info.count > 0 && `${info.count} · `}{timeSince(info.lastUpdated)}
          </span>
        </div>
      ))}
    </div>
  );
}
