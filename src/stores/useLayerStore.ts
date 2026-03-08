import { create } from "zustand";

export type LayerId = "earthquakes" | "disasters" | "flights" | "ships" | "news" | "conflicts" | "hotspots" | "spaceWeather";

interface LayerState {
  layers: Record<LayerId, boolean>;
  toggle: (id: LayerId) => void;
  setEnabled: (id: LayerId, enabled: boolean) => void;
}

export const useLayerStore = create<LayerState>((set) => ({
  layers: {
    earthquakes: true,
    disasters: true,
    flights: false,
    ships: false,
    news: false,
    conflicts: false,
    hotspots: true,
    spaceWeather: true,
  },
  toggle: (id) => set((s) => ({ layers: { ...s.layers, [id]: !s.layers[id] } })),
  setEnabled: (id, enabled) => set((s) => ({ layers: { ...s.layers, [id]: enabled } })),
}));
