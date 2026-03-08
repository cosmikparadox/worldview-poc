import type { SourceAdapter, ConflictEvent } from "../types";

function classifyViolenceType(type: number): string {
  switch (type) {
    case 1:
      return "State-based conflict";
    case 2:
      return "Non-state conflict";
    case 3:
      return "One-sided violence";
    default:
      return "Armed conflict";
  }
}

export const ucdpAdapter: SourceAdapter<ConflictEvent[]> = {
  id: "ucdp-ged",
  async fetch(signal) {
    const res = await fetch("/api/conflicts", { signal });
    if (!res.ok) throw new Error(`UCDP proxy HTTP ${res.status}`);
    const json = await res.json();
    return (json.Result || []).slice(0, 500).map((e: any) => ({
      id: String(e.id || e.event_id || ""),
      lat: Number(e.latitude),
      lon: Number(e.longitude),
      timestamp: new Date(e.date_start || `${e.year}-01-01`).getTime(),
      source: "ucdp",
      title: String(
        e.dyad_name || e.conflict_name || "Conflict event"
      ),
      eventType: e.type_of_violence_text
        ? String(e.type_of_violence_text)
        : classifyViolenceType(Number(e.type_of_violence)),
      fatalities: Number(e.best || 0),
      actors:
        String(e.side_a || "") + (e.side_b ? ` vs ${e.side_b}` : ""),
      region: String(e.region || e.country || ""),
      url: `https://ucdp.uu.se/event/${e.id}`,
    }));
  },
};
