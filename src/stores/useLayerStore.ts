import { create } from "zustand";

export type LayerId = "earthquakes" | "disasters" | "flights" | "ships" | "news" | "conflicts" | "hotspots" | "spaceWeather" | "commodities";

interface LayerState {
  layers: Record<LayerId, boolean>;
  toggle: (id: LayerId) => void;
  setEnabled: (id: LayerId, enabled: boolean) => void;
}

export const useLayerStore = create<LayerState>((set) => ({
  layers: {
    earthquakes: true,
    disasters: true,
    flights: true,
    ships: true,
    news: true,
    conflicts: false, // needs API key
    hotspots: true,
    spaceWeather: true,
    commodities: true,
  },
  toggle: (id) => set((s) => ({ layers: { ...s.layers, [id]: !s.layers[id] } })),
  setEnabled: (id, enabled) => set((s) => ({ layers: { ...s.layers, [id]: enabled } })),
}));
