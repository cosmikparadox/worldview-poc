import { useEffect, useRef } from "react";
import { useDataHubStore } from "../datahub/dataHubStore";
import { useSupplyChainStore } from "../stores/useSupplyChainStore";
import { useIntelligenceStore } from "../stores/useIntelligenceStore";
import { SUPPLY_CHAIN_NETWORKS } from "../config/supplyChainRoutes";
import type { RiskScorer, RiskContext } from "./types";

// Import all scorers
import { proximityScorer } from "./scorers/proximityScorer";
import { commodityScorer } from "./scorers/commodityScorer";
import { weatherScorer } from "./scorers/weatherScorer";
import { chokepointScorer } from "./scorers/chokepointScorer";
import { spaceWeatherScorer } from "./scorers/spaceWeatherScorer";

const SCORERS: RiskScorer[] = [
  proximityScorer,
  commodityScorer,
  weatherScorer,
  chokepointScorer,
  spaceWeatherScorer,
];

const DEBOUNCE_MS = 2000;

/**
 * Orchestrator hook — mount once in App.tsx.
 * Subscribes to all DataHub data, debounces, runs all scorers,
 * writes merged assessments to IntelligenceStore.
 */
export function useRiskEngine(): void {
  const data = useDataHubStore((s) => s.data);
  const activeCommodity = useSupplyChainStore((s) => s.activeCommodity);
  const setAssessments = useIntelligenceStore((s) => s.setAssessments);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Debounce: wait for data to settle before scoring
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      const context: RiskContext = {
        data,
        supplyChainNetworks: SUPPLY_CHAIN_NETWORKS,
        activeCommodity,
      };

      const allAssessments = SCORERS.flatMap((scorer) => {
        try {
          return scorer.score(context);
        } catch {
          return [];
        }
      });

      // Deduplicate by id (keep first occurrence)
      const seen = new Set<string>();
      const deduped = allAssessments.filter((a) => {
        if (seen.has(a.id)) return false;
        seen.add(a.id);
        return true;
      });

      setAssessments(deduped);
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [data, activeCommodity, setAssessments]);
}
