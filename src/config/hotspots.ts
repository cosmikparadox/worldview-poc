export interface Hotspot {
  id: string;
  name: string;
  lat: number;
  lon: number;
  radius: number;
  description: string;
  type: "shipping" | "energy" | "manufacturing" | "regulatory" | "risk";
  color: string;
}

export const HOTSPOTS: Hotspot[] = [
  { id: "suez", name: "Suez Canal", lat: 30.46, lon: 32.34, radius: 200, description: "15% of global trade transits here. Blockage = instant supply chain chaos.", type: "shipping", color: "#ff5b5b" },
  { id: "hormuz", name: "Strait of Hormuz", lat: 26.56, lon: 56.25, radius: 200, description: "21% of global oil passes through. Iran tensions = energy risk.", type: "energy", color: "#ffb444" },
  { id: "malacca", name: "Strait of Malacca", lat: 2.5, lon: 101.5, radius: 300, description: "25% of global shipping. China/ASEAN lifeline.", type: "shipping", color: "#ff5b5b" },
  { id: "taiwan", name: "Taiwan Strait", lat: 24.5, lon: 119.5, radius: 300, description: "TSMC = 90% advanced chips. Conflict = semiconductor apocalypse.", type: "manufacturing", color: "#a06fff" },
  { id: "panama", name: "Panama Canal", lat: 9.08, lon: -79.68, radius: 150, description: "5% of global trade. Drought reduced capacity 36% in 2024.", type: "shipping", color: "#ff5b5b" },
  { id: "redsea", name: "Red Sea / Bab el-Mandeb", lat: 12.6, lon: 43.3, radius: 250, description: "Houthi attacks rerouted 90% of traffic via Cape. +$200B/yr costs.", type: "risk", color: "#ff5b5b" },
  { id: "blacksea", name: "Black Sea / Ukraine", lat: 44.5, lon: 34.0, radius: 400, description: "Ukraine: 10% global wheat, 15% corn exports disrupted since 2022.", type: "risk", color: "#ff5b5b" },
  { id: "cape", name: "Cape of Good Hope", lat: -34.35, lon: 18.47, radius: 300, description: "Red Sea alternative. Adds 10-14 days to Asia-Europe routes.", type: "shipping", color: "#ffb444" },
  { id: "shenzhen", name: "Shenzhen / PRD", lat: 22.55, lon: 114.07, radius: 200, description: "World's factory floor. 30% of global electronics manufacturing.", type: "manufacturing", color: "#a06fff" },
  { id: "rotterdam", name: "Rotterdam / Rhine", lat: 51.9, lon: 4.5, radius: 200, description: "Europe's largest port. Rhine low water = chemical supply crisis.", type: "shipping", color: "#4b8cff" },
  { id: "usgulf", name: "US Gulf Coast", lat: 29.5, lon: -90.0, radius: 300, description: "45% US refining capacity. Hurricane season = fuel price spikes.", type: "energy", color: "#ffb444" },
  { id: "rareearth", name: "Inner Mongolia / Baotou", lat: 40.65, lon: 109.84, radius: 200, description: "China controls 60% rare earth processing. Critical for EV/defense.", type: "manufacturing", color: "#a06fff" },
];
