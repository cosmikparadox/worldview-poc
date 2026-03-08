import type { SourceAdapter, CyberThreat } from "../types";

function classifyThreatType(tags: string[]): string {
  const t = tags.join(" ").toLowerCase();
  if (t.includes("malware") || t.includes("trojan") || t.includes("ransomware"))
    return "malware";
  if (t.includes("phish")) return "phishing";
  if (t.includes("c2") || t.includes("command")) return "c2";
  if (t.includes("exploit") || t.includes("vuln")) return "exploit";
  return "threat";
}

export const otxAdapter: SourceAdapter<CyberThreat[]> = {
  id: "otx-cyber",
  async fetch(signal) {
    const res = await fetch("/api/cyber", { signal });
    if (!res.ok) throw new Error(`OTX proxy HTTP ${res.status}`);
    const json = await res.json();
    return (json.results || [])
      .flatMap((pulse: any) =>
        (pulse.indicators || [])
          .filter((ind: any) => ind.geo?.latitude && ind.geo?.longitude)
          .map((ind: any) => ({
            id: `otx-${ind.id || ind.indicator}`,
            lat: Number(ind.geo.latitude),
            lon: Number(ind.geo.longitude),
            timestamp: new Date(
              ind.created || pulse.created || Date.now()
            ).getTime(),
            source: "otx",
            indicatorType: String(ind.type || "unknown"),
            indicator: String(ind.indicator || ""),
            threatType: classifyThreatType(pulse.tags || []),
            pulseCount: Number(pulse.pulse_count || 1),
            country: String(ind.geo.country_name || ""),
            description: String(pulse.name || "").slice(0, 200),
          }))
      )
      .slice(0, 500);
  },
};
