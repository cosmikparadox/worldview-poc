import { useIntelligenceStore } from "../../stores/useIntelligenceStore";
import { SEVERITY_ORDER } from "../../intelligence/types";
import type { RiskAssessment, RiskSeverity } from "../../intelligence/types";

const SEVERITY_COLORS: Record<RiskSeverity, string> = {
  critical: "#ff2244",
  high: "#ff6622",
  medium: "#ffbb44",
  low: "#44bbff",
  info: "#8899bb",
};

const CATEGORY_ICONS: Record<string, string> = {
  proximity: "\u26A0",
  volatility: "\u{1F4C8}",
  weather: "\u{1F32A}",
  chokepoint: "\u2693",
  "space-weather": "\u{1F6F0}",
  cyber: "\u{1F6E1}",
  geopolitical: "\u{1F30D}",
};

function timeAgo(ts: number): string {
  const sec = Math.floor((Date.now() - ts) / 1000);
  if (sec < 60) return `${sec}s ago`;
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
  return `${Math.floor(sec / 86400)}d ago`;
}

function AlertCard({ assessment, onDismiss }: { assessment: RiskAssessment; onDismiss: () => void }) {
  const color = SEVERITY_COLORS[assessment.severity];
  const icon = CATEGORY_ICONS[assessment.category] ?? "\u26A0";

  return (
    <div
      style={{
        background: `${color}08`,
        border: `1px solid ${color}30`,
        borderRadius: 10,
        padding: "10px 12px",
        marginBottom: 8,
        animation: "fadeIn 0.2s ease",
      }}
    >
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
        <span
          style={{
            background: `${color}25`,
            color,
            fontSize: 9,
            fontFamily: "'DM Mono', monospace",
            padding: "2px 8px",
            borderRadius: 8,
            textTransform: "uppercase",
            fontWeight: 700,
            letterSpacing: "0.05em",
          }}
        >
          {assessment.severity}
        </span>
        <span style={{ color: "#667788", fontSize: 9, fontFamily: "monospace" }}>
          {icon} {assessment.category}
        </span>
        <span style={{ marginLeft: "auto", color: "#556677", fontSize: 9, fontFamily: "monospace" }}>
          {timeAgo(assessment.timestamp)}
        </span>
        <button
          onClick={onDismiss}
          style={{
            background: "none",
            border: "none",
            color: "#556677",
            cursor: "pointer",
            fontSize: 14,
            padding: "0 2px",
            lineHeight: 1,
          }}
          title="Dismiss"
        >
          &times;
        </button>
      </div>

      {/* Title */}
      <div style={{ color: "#e0e8f0", fontSize: 12, fontWeight: 600, marginBottom: 4, lineHeight: 1.3 }}>
        {assessment.title}
      </div>

      {/* Description */}
      <div style={{ color: "#8899bb", fontSize: 11, lineHeight: 1.4, marginBottom: 6 }}>
        {assessment.description}
      </div>

      {/* Affected commodities */}
      {assessment.affectedCommodities.length > 0 && (
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {assessment.affectedCommodities.map((c) => (
            <span
              key={c}
              style={{
                background: "rgba(68,187,255,0.1)",
                color: "#44bbff",
                fontSize: 9,
                fontFamily: "monospace",
                padding: "1px 6px",
                borderRadius: 6,
              }}
            >
              {c}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function AlertsPanel() {
  const assessments = useIntelligenceStore((s) => s.assessments);
  const dismissedIds = useIntelligenceStore((s) => s.dismissedIds);
  const dismiss = useIntelligenceStore((s) => s.dismiss);
  const clearDismissed = useIntelligenceStore((s) => s.clearDismissed);

  const active = assessments
    .filter((a) => !dismissedIds.has(a.id))
    .sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity] || b.timestamp - a.timestamp);

  const dismissedCount = dismissedIds.size;

  return (
    <div style={{ padding: "12px 14px", fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ color: "#8899bb", fontSize: 10, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          Risk Alerts ({active.length})
        </div>
        {dismissedCount > 0 && (
          <button
            onClick={clearDismissed}
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid #1a2540",
              borderRadius: 6,
              color: "#667788",
              cursor: "pointer",
              fontSize: 9,
              fontFamily: "monospace",
              padding: "2px 8px",
            }}
          >
            Show {dismissedCount} dismissed
          </button>
        )}
      </div>

      {active.length === 0 ? (
        <div style={{ color: "#445566", fontSize: 11, textAlign: "center", padding: "24px 0" }}>
          No active risk alerts
        </div>
      ) : (
        active.map((a) => (
          <AlertCard key={a.id} assessment={a} onDismiss={() => dismiss(a.id)} />
        ))
      )}
    </div>
  );
}

/** Returns count of high/critical alerts for badge display */
export function useAlertBadgeCount(): number {
  const assessments = useIntelligenceStore((s) => s.assessments);
  const dismissedIds = useIntelligenceStore((s) => s.dismissedIds);
  return assessments.filter(
    (a) =>
      !dismissedIds.has(a.id) &&
      (a.severity === "critical" || a.severity === "high")
  ).length;
}
