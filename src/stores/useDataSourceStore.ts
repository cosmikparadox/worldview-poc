import { create } from "zustand";

export type FeedStatus = "idle" | "loading" | "success" | "error";

export interface FeedInfo {
  status: FeedStatus;
  lastUpdated: Date | null;
  count: number;
  error: string | null;
}

interface DataSourceState {
  feeds: Record<string, FeedInfo>;
  update: (key: string, info: Partial<FeedInfo>) => void;
}

const defaultFeed: FeedInfo = { status: "idle", lastUpdated: null, count: 0, error: null };

export const useDataSourceStore = create<DataSourceState>((set) => ({
  feeds: {},
  update: (key, info) =>
    set((s) => ({
      feeds: { ...s.feeds, [key]: { ...(s.feeds[key] || defaultFeed), ...info } },
    })),
}));
