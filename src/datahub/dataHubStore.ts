import { create } from "zustand";
import type {
  DataCategory,
  CategoryDataMap,
  SourceHealth,
} from "./types";

interface DataHubState {
  data: { [K in DataCategory]?: CategoryDataMap[K] };
  health: Record<string, SourceHealth>;
  activeSource: Partial<Record<DataCategory, string>>;
  stale: Partial<Record<DataCategory, boolean>>;

  setData: <K extends DataCategory>(
    category: K,
    data: CategoryDataMap[K],
    sourceId: string
  ) => void;
  setHealth: (sourceId: string, update: Partial<SourceHealth>) => void;
  markStale: (category: DataCategory) => void;
}

const defaultHealth: SourceHealth = {
  status: "idle",
  lastFetchMs: null,
  lastAttemptMs: null,
  consecutiveFailures: 0,
  lastError: null,
  latencyMs: null,
  isStale: false,
};

export const useDataHubStore = create<DataHubState>((set) => ({
  data: {},
  health: {},
  activeSource: {},
  stale: {},

  setData: (category, data, sourceId) =>
    set((s) => ({
      data: { ...s.data, [category]: data },
      activeSource: { ...s.activeSource, [category]: sourceId },
      stale: { ...s.stale, [category]: false },
    })),

  setHealth: (sourceId, update) =>
    set((s) => ({
      health: {
        ...s.health,
        [sourceId]: { ...(s.health[sourceId] || defaultHealth), ...update },
      },
    })),

  markStale: (category) =>
    set((s) => ({
      stale: { ...s.stale, [category]: true },
    })),
}));
