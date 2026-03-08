import { useSpaceWeather } from "../hooks/useSpaceWeather";
import { useMemo } from "react";

function kpLevel(kp: number): { label: string; color: string; bg: string } {
  if (kp >= 8) return { label: "EXTREME", color: "#ff2020", bg: "#ff202020" };
  if (kp >= 7) return { label: "SEVERE", color: "#ff4444", bg: "#ff444420" };
  if (kp >= 6) return { label: "STRONG", color: "#ff8844", bg: "#ff884420" };
  if (kp >= 5) return { label: "MODERATE", color: "#ffbb44", bg: "#ffbb4420" };
  if (kp >= 4) return { label: "MINOR", color: "#ffdd66", bg: "#ffdd6620" };
  return { label: "QUIET", color: "#22dd88", bg: "#22dd8820" };
}

export function SpaceWeatherOverlay() {
  const { data } = useSpaceWeather();

  const latest = useMemo(() => {
    if (!data || data.length === 0) return null;
    return data[data.length - 1];
  }, [data]);

  const history = useMemo(() => {
    if (!data) return [];
    return data.slice(-24); // last 24 readings
  }, [data]);

  if (!latest) return null;

  const level = kpLevel(latest.kp);
  const maxKp = Math.max(...history.map((r) => r.kp), 0);

  return (
    <div className="sw-overlay">
      <div className="sw-header">
        <span className="sw-icon" style={{ color: level.color }}>&#9737;</span>
        <span className="sw-label">SPACE WX</span>
      </div>
      <div className="sw-kp">
        <span className="sw-kp-value" style={{ color: level.color }}>Kp {latest.kp.toFixed(1)}</span>
        <span className="sw-kp-level" style={{ color: level.color, background: level.bg }}>{level.label}</span>
      </div>
      <div className="sw-chart">
        {history.map((r, i) => {
          const h = maxKp > 0 ? (r.kp / 9) * 100 : 0;
          const barLevel = kpLevel(r.kp);
          return (
            <div
              key={i}
              className="sw-bar"
              style={{ height: `${Math.max(h, 4)}%`, background: barLevel.color }}
              title={`${r.time}\nKp ${r.kp.toFixed(1)}`}
            />
          );
        })}
      </div>
      <div className="sw-time">
        {latest.time ? new Date(latest.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
      </div>
    </div>
  );
}
