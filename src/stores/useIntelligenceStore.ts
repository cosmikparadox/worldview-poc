import { create } from "zustand";
import type { RiskAssessment } from "../intelligence/types";

interface IntelligenceState {
  assessments: RiskAssessment[];
  dismissedIds: Set<string>;
  lastRunMs: number | null;

  setAssessments: (assessments: RiskAssessment[]) => void;
  dismiss: (id: string) => void;
  clearDismissed: () => void;
}

export const useIntelligenceStore = create<IntelligenceState>((set) => ({
  assessments: [],
  dismissedIds: new Set(),
  lastRunMs: null,

  setAssessments: (assessments) =>
    set({ assessments, lastRunMs: Date.now() }),

  dismiss: (id) =>
    set((s) => {
      const next = new Set(s.dismissedIds);
      next.add(id);
      return { dismissedIds: next };
    }),

  clearDismissed: () => set({ dismissedIds: new Set() }),
}));
