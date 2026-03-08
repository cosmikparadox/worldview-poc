import { create } from "zustand";

export interface SelectedEntity {
  source: string;
  id: string;
  title: string;
  description: string;
  lat: number;
  lon: number;
  meta: Record<string, string | number>;
}

interface SelectionState {
  selected: SelectedEntity | null;
  select: (entity: SelectedEntity | null) => void;
}

export const useSelectionStore = create<SelectionState>((set) => ({
  selected: null,
  select: (entity) => set({ selected: entity }),
}));
