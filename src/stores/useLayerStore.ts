import { create } from "zustand";

export type LayerId = "earthquakes" | "disasters" | "flights" | "ships" | "news" | "conflicts" | "hotspots" | "spaceWeather" | "commodities" | "weather" | "fires" | "cyberThreats" | "riskOverlay";

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
    conflicts: true,
    hotspots: true,
    spaceWeather: true,
    commodities: true,
    weather: false,
    fires: true,
    cyberThreats: false,
    riskOverlay: true,
  },
  toggle: (id) => set((s) => ({ layers: { ...s.layers, [id]: !s.layers[id] } })),
  setEnabled: (id, enabled) => set((s) => ({ layers: { ...s.layers, [id]: enabled } })),
}));
