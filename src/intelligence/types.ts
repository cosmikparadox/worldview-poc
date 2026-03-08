import type { DataCategory, CategoryDataMap } from "../datahub/types";
import type { SupplyChainNetwork } from "../config/supplyChainRoutes";

// ── Risk Severity & Category ──
export type RiskSeverity = "info" | "low" | "medium" | "high" | "critical";

export type RiskCategory =
  | "proximity"
  | "volatility"
  | "weather"
  | "chokepoint"
  | "space-weather"
  | "cyber"
  | "geopolitical";

// ── Risk Assessment ──
export interface RiskAssessment {
  id: string;
  scorerId: string;
  severity: RiskSeverity;
  category: RiskCategory;
  title: string;
  description: string;
  affectedNodes: string[];
  affectedCommodities: string[];
  lat: number;
  lon: number;
  timestamp: number;
  confidence: number; // 0–1
  metadata: Record<string, unknown>;
}

// ── Risk Context (input to every scorer) ──
export interface RiskContext {
  data: { [K in DataCategory]?: CategoryDataMap[K] };
  supplyChainNetworks: SupplyChainNetwork[];
  activeCommodity: string | null;
}

// ── Risk Scorer Interface (swap heuristic ↔ ML) ──
export interface RiskScorer {
  id: string;
  name: string;
  description: string;
  categories: RiskCategory[];
  score: (context: RiskContext) => RiskAssessment[];
}

// ── Severity ordering for sorting ──
export const SEVERITY_ORDER: Record<RiskSeverity, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
  info: 4,
};
