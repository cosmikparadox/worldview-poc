// ── Supply Chain Network Definitions ──
// Static data defining commodity supply chains as networks of nodes and edges.
// Nodes reference existing hotspot coordinates via hotspotRef where applicable.

export type SupplyNodeType =
  | "production"
  | "processing"
  | "port"
  | "pipeline"
  | "manufacturing"
  | "storage"
  | "consumption";

export type TransportMode =
  | "shipping"
  | "pipeline"
  | "rail"
  | "air"
  | "road";

export interface SupplyNode {
  id: string;
  name: string;
  lat: number;
  lon: number;
  type: SupplyNodeType;
  hotspotRef?: string;
  description: string;
}

export interface SupplyEdge {
  id: string;
  from: string;
  to: string;
  mode: TransportMode;
  label?: string;
}

export interface SupplyChainNetwork {
  commoditySymbol: string;
  nodes: SupplyNode[];
  edges: SupplyEdge[];
}

// ── WTI Crude Oil ──
const WTI_NODES: SupplyNode[] = [
  { id: "wti-permian", name: "Permian Basin", lat: 31.95, lon: -102.18, type: "production", description: "Largest US oil-producing region. ~5.9M barrels/day." },
  { id: "wti-bakken", name: "Bakken Formation", lat: 48.1, lon: -103.6, type: "production", description: "North Dakota shale oil field. ~1.2M barrels/day." },
  { id: "wti-eagleford", name: "Eagle Ford Shale", lat: 28.7, lon: -98.5, type: "production", description: "South Texas shale play. ~1.1M barrels/day." },
  { id: "wti-cushing", name: "Cushing Hub", lat: 35.98, lon: -96.77, type: "pipeline", description: "WTI pricing hub. Pipeline crossroads of America. ~90M barrel storage." },
  { id: "wti-houston", name: "Houston Refinery Complex", lat: 29.76, lon: -95.37, type: "processing", description: "World's largest refining concentration. 2.5M+ barrels/day capacity." },
  { id: "wti-usgulf", name: "US Gulf Coast", lat: 29.5, lon: -90.0, type: "port", hotspotRef: "usgulf", description: "45% US refining capacity. Major export terminal." },
  { id: "wti-loop", name: "LOOP Terminal", lat: 28.88, lon: -90.02, type: "port", description: "Louisiana Offshore Oil Port. Only US deepwater oil port." },
  { id: "wti-panama", name: "Panama Canal", lat: 9.08, lon: -79.68, type: "port", hotspotRef: "panama", description: "Transit route for US Gulf exports to Asia-Pacific." },
  { id: "wti-rotterdam", name: "Rotterdam", lat: 51.9, lon: 4.5, type: "port", hotspotRef: "rotterdam", description: "Europe's primary crude import hub and refining center." },
  { id: "wti-newyork", name: "New York Harbor", lat: 40.68, lon: -74.04, type: "consumption", description: "US East Coast demand center. RBOB gasoline pricing point." },
  { id: "wti-chicago", name: "Chicago", lat: 41.88, lon: -87.63, type: "consumption", description: "US Midwest refining and distribution hub." },
  { id: "wti-yokohama", name: "Yokohama", lat: 35.44, lon: 139.64, type: "consumption", description: "Japan's largest oil import terminal." },
  { id: "wti-ulsan", name: "Ulsan Refinery", lat: 35.55, lon: 129.31, type: "processing", description: "South Korea. World's 3rd largest refinery complex." },
];

const WTI_EDGES: SupplyEdge[] = [
  { id: "wti-e1", from: "wti-permian", to: "wti-cushing", mode: "pipeline", label: "Permian-Cushing pipeline corridor" },
  { id: "wti-e2", from: "wti-bakken", to: "wti-cushing", mode: "pipeline", label: "Bakken-Cushing pipeline" },
  { id: "wti-e3", from: "wti-eagleford", to: "wti-houston", mode: "pipeline", label: "Eagle Ford-Houston pipeline" },
  { id: "wti-e4", from: "wti-cushing", to: "wti-houston", mode: "pipeline", label: "Cushing-Houston Seaway pipeline" },
  { id: "wti-e5", from: "wti-cushing", to: "wti-chicago", mode: "pipeline", label: "Cushing-Chicago Capline system" },
  { id: "wti-e6", from: "wti-houston", to: "wti-usgulf", mode: "pipeline", label: "Houston-Gulf Coast corridor" },
  { id: "wti-e7", from: "wti-usgulf", to: "wti-newyork", mode: "shipping", label: "Gulf-East Coast tanker route" },
  { id: "wti-e8", from: "wti-loop", to: "wti-rotterdam", mode: "shipping", label: "Transatlantic VLCC route" },
  { id: "wti-e9", from: "wti-usgulf", to: "wti-panama", mode: "shipping", label: "Gulf-Panama transit" },
  { id: "wti-e10", from: "wti-panama", to: "wti-yokohama", mode: "shipping", label: "Panama-Japan VLCC route" },
  { id: "wti-e11", from: "wti-panama", to: "wti-ulsan", mode: "shipping", label: "Panama-Korea tanker route" },
  { id: "wti-e12", from: "wti-usgulf", to: "wti-loop", mode: "pipeline", label: "Gulf Coast terminal connections" },
];

// ── Brent Crude Oil ──
const BRENT_NODES: SupplyNode[] = [
  { id: "brent-northsea", name: "North Sea Fields", lat: 58.5, lon: 1.5, type: "production", description: "UK/Norway offshore fields. Brent, Forties, Oseberg, Ekofisk." },
  { id: "brent-sullom", name: "Sullom Voe Terminal", lat: 60.46, lon: -1.28, type: "port", description: "Shetland Islands. Brent crude loading terminal." },
  { id: "brent-mongstad", name: "Mongstad Refinery", lat: 60.81, lon: 5.03, type: "processing", description: "Norway's largest oil terminal and refinery." },
  { id: "brent-rotterdam", name: "Rotterdam", lat: 51.9, lon: 4.5, type: "port", hotspotRef: "rotterdam", description: "Europe's largest port. Brent crude pricing and refining hub." },
  { id: "brent-hormuz", name: "Strait of Hormuz", lat: 26.56, lon: 56.25, type: "port", hotspotRef: "hormuz", description: "21% of global oil transits. Persian Gulf chokepoint." },
  { id: "brent-raslaffan", name: "Ras Laffan", lat: 25.92, lon: 51.56, type: "port", description: "Qatar. Major crude and LNG export terminal." },
  { id: "brent-jeddah", name: "Yanbu Terminal", lat: 24.09, lon: 38.06, type: "port", description: "Saudi Arabia Red Sea export terminal. Bypasses Hormuz." },
  { id: "brent-suez", name: "Suez Canal", lat: 30.46, lon: 32.34, type: "port", hotspotRef: "suez", description: "15% of global trade. Key crude transit route." },
  { id: "brent-malacca", name: "Strait of Malacca", lat: 2.5, lon: 101.5, type: "port", hotspotRef: "malacca", description: "25% of global shipping. Asia-bound crude transit." },
  { id: "brent-singapore", name: "Singapore Refining Hub", lat: 1.26, lon: 103.74, type: "processing", description: "Asia's oil trading hub. Major refining center." },
  { id: "brent-shanghai", name: "Shanghai / Zhoushan", lat: 30.0, lon: 122.1, type: "consumption", description: "China's largest crude import and refining region." },
  { id: "brent-tokyo", name: "Tokyo Bay Terminals", lat: 35.45, lon: 139.77, type: "consumption", description: "Japan's primary oil import terminals." },
  { id: "brent-london", name: "London / ICE", lat: 51.51, lon: -0.08, type: "consumption", description: "Brent pricing hub. ICE Futures exchange." },
];

const BRENT_EDGES: SupplyEdge[] = [
  { id: "brent-e1", from: "brent-northsea", to: "brent-sullom", mode: "pipeline", label: "Brent pipeline system" },
  { id: "brent-e2", from: "brent-northsea", to: "brent-mongstad", mode: "pipeline", label: "Oseberg-Mongstad pipeline" },
  { id: "brent-e3", from: "brent-sullom", to: "brent-rotterdam", mode: "shipping", label: "North Sea-Rotterdam tanker" },
  { id: "brent-e4", from: "brent-mongstad", to: "brent-rotterdam", mode: "shipping", label: "Norway-Rotterdam tanker" },
  { id: "brent-e5", from: "brent-rotterdam", to: "brent-london", mode: "pipeline", label: "Rhine/Europe distribution" },
  { id: "brent-e6", from: "brent-raslaffan", to: "brent-hormuz", mode: "shipping", label: "Qatar-Hormuz transit" },
  { id: "brent-e7", from: "brent-hormuz", to: "brent-suez", mode: "shipping", label: "Persian Gulf-Suez route" },
  { id: "brent-e8", from: "brent-suez", to: "brent-rotterdam", mode: "shipping", label: "Suez-Europe VLCC route" },
  { id: "brent-e9", from: "brent-hormuz", to: "brent-malacca", mode: "shipping", label: "Middle East-Asia VLCC route" },
  { id: "brent-e10", from: "brent-malacca", to: "brent-singapore", mode: "shipping", label: "Malacca-Singapore transit" },
  { id: "brent-e11", from: "brent-singapore", to: "brent-shanghai", mode: "shipping", label: "Singapore-China tanker" },
  { id: "brent-e12", from: "brent-singapore", to: "brent-tokyo", mode: "shipping", label: "Singapore-Japan tanker" },
  { id: "brent-e13", from: "brent-jeddah", to: "brent-suez", mode: "shipping", label: "Red Sea crude transit" },
];

// ── Natural Gas ──
const NATGAS_NODES: SupplyNode[] = [
  { id: "ng-qatar", name: "Qatar North Field", lat: 26.0, lon: 52.0, type: "production", description: "World's largest gas field. 14% of global LNG exports." },
  { id: "ng-raslaffan", name: "Ras Laffan LNG", lat: 25.92, lon: 51.56, type: "processing", description: "World's largest LNG export facility. ~77 MTPA capacity." },
  { id: "ng-yamal", name: "Yamal LNG", lat: 71.2, lon: 72.9, type: "production", description: "Arctic Russia. 16.5 MTPA LNG capacity via Northern Sea Route." },
  { id: "ng-usgulf", name: "US Gulf LNG Terminals", lat: 29.5, lon: -90.0, type: "port", hotspotRef: "usgulf", description: "Sabine Pass, Cameron, Freeport. US LNG export hub." },
  { id: "ng-henry", name: "Henry Hub", lat: 30.2, lon: -93.3, type: "pipeline", description: "US natural gas pricing benchmark. Louisiana pipeline junction." },
  { id: "ng-hormuz", name: "Strait of Hormuz", lat: 26.56, lon: 56.25, type: "port", hotspotRef: "hormuz", description: "Critical LNG transit chokepoint from Qatar/UAE." },
  { id: "ng-suez", name: "Suez Canal", lat: 30.46, lon: 32.34, type: "port", hotspotRef: "suez", description: "LNG transit route between Middle East and Europe." },
  { id: "ng-rotterdam", name: "Gate LNG Terminal", lat: 51.9, lon: 4.5, type: "port", hotspotRef: "rotterdam", description: "Netherlands. Europe's major LNG regasification hub." },
  { id: "ng-tokyo", name: "Tokyo LNG Terminals", lat: 35.45, lon: 139.77, type: "consumption", description: "Japan is world's largest LNG importer." },
  { id: "ng-malacca", name: "Strait of Malacca", lat: 2.5, lon: 101.5, type: "port", hotspotRef: "malacca", description: "LNG transit route to East Asian markets." },
  { id: "ng-gladstone", name: "Gladstone LNG", lat: -23.85, lon: 151.27, type: "processing", description: "Australia. 3 LNG plants, ~25 MTPA combined capacity." },
  { id: "ng-shanghai", name: "Shanghai LNG", lat: 30.63, lon: 121.74, type: "consumption", description: "China's growing LNG import hub." },
];

const NATGAS_EDGES: SupplyEdge[] = [
  { id: "ng-e1", from: "ng-qatar", to: "ng-raslaffan", mode: "pipeline", label: "North Field to Ras Laffan" },
  { id: "ng-e2", from: "ng-raslaffan", to: "ng-hormuz", mode: "shipping", label: "LNG carrier Hormuz transit" },
  { id: "ng-e3", from: "ng-hormuz", to: "ng-suez", mode: "shipping", label: "Persian Gulf-Suez LNG route" },
  { id: "ng-e4", from: "ng-suez", to: "ng-rotterdam", mode: "shipping", label: "Suez-Europe LNG tanker" },
  { id: "ng-e5", from: "ng-hormuz", to: "ng-malacca", mode: "shipping", label: "Middle East-Asia LNG route" },
  { id: "ng-e6", from: "ng-malacca", to: "ng-tokyo", mode: "shipping", label: "Malacca-Japan LNG carrier" },
  { id: "ng-e7", from: "ng-malacca", to: "ng-shanghai", mode: "shipping", label: "Malacca-China LNG route" },
  { id: "ng-e8", from: "ng-henry", to: "ng-usgulf", mode: "pipeline", label: "Henry Hub pipeline system" },
  { id: "ng-e9", from: "ng-usgulf", to: "ng-rotterdam", mode: "shipping", label: "Transatlantic LNG route" },
  { id: "ng-e10", from: "ng-gladstone", to: "ng-tokyo", mode: "shipping", label: "Australia-Japan LNG route" },
  { id: "ng-e11", from: "ng-gladstone", to: "ng-shanghai", mode: "shipping", label: "Australia-China LNG route" },
  { id: "ng-e12", from: "ng-yamal", to: "ng-rotterdam", mode: "shipping", label: "Arctic LNG to Europe" },
];

// ── Copper ──
const COPPER_NODES: SupplyNode[] = [
  { id: "cu-escondida", name: "Escondida Mine", lat: -24.27, lon: -69.07, type: "production", description: "Chile. World's largest copper mine. ~1.1M tonnes/year." },
  { id: "cu-antofagasta", name: "Antofagasta Port", lat: -23.65, lon: -70.4, type: "port", description: "Chile's primary copper export port." },
  { id: "cu-copperbelt", name: "Copperbelt", lat: -12.8, lon: 28.2, type: "production", description: "Zambia/DRC. Africa's copper heartland. ~2M tonnes/year combined." },
  { id: "cu-durban", name: "Durban Port", lat: -29.87, lon: 31.03, type: "port", description: "Southern Africa copper export terminal." },
  { id: "cu-grasberg", name: "Grasberg Mine", lat: -4.05, lon: 137.12, type: "production", description: "Indonesia. World's largest gold mine and major copper producer." },
  { id: "cu-panama", name: "Panama Canal", lat: 9.08, lon: -79.68, type: "port", hotspotRef: "panama", description: "Chilean copper transit to Atlantic markets." },
  { id: "cu-cape", name: "Cape of Good Hope", lat: -34.35, lon: 18.47, type: "port", hotspotRef: "cape", description: "African copper route to Asia." },
  { id: "cu-shenzhen", name: "Shenzhen / PRD", lat: 22.55, lon: 114.07, type: "manufacturing", hotspotRef: "shenzhen", description: "China consumes ~55% of global copper. Electronics manufacturing." },
  { id: "cu-shanghai", name: "Shanghai SHFE", lat: 31.23, lon: 121.47, type: "consumption", description: "Shanghai Futures Exchange. China copper pricing and smelting." },
  { id: "cu-hamburg", name: "Hamburg Smelter", lat: 53.55, lon: 9.99, type: "processing", description: "Aurubis. Europe's largest copper smelter." },
  { id: "cu-rotterdam", name: "Rotterdam", lat: 51.9, lon: 4.5, type: "port", hotspotRef: "rotterdam", description: "European copper import terminal." },
  { id: "cu-detroit", name: "Detroit", lat: 42.33, lon: -83.05, type: "consumption", description: "US auto industry. Major copper consumer for wiring/motors." },
];

const COPPER_EDGES: SupplyEdge[] = [
  { id: "cu-e1", from: "cu-escondida", to: "cu-antofagasta", mode: "rail", label: "Mine to port rail" },
  { id: "cu-e2", from: "cu-antofagasta", to: "cu-shanghai", mode: "shipping", label: "Chile-China bulk carrier" },
  { id: "cu-e3", from: "cu-antofagasta", to: "cu-panama", mode: "shipping", label: "Chile-Panama transit" },
  { id: "cu-e4", from: "cu-panama", to: "cu-rotterdam", mode: "shipping", label: "Panama-Europe copper route" },
  { id: "cu-e5", from: "cu-rotterdam", to: "cu-hamburg", mode: "shipping", label: "Rotterdam-Hamburg barge" },
  { id: "cu-e6", from: "cu-panama", to: "cu-detroit", mode: "shipping", label: "Panama-US Gulf-Detroit route" },
  { id: "cu-e7", from: "cu-copperbelt", to: "cu-durban", mode: "rail", label: "Copperbelt-Durban rail corridor" },
  { id: "cu-e8", from: "cu-durban", to: "cu-shanghai", mode: "shipping", label: "Africa-China bulk carrier" },
  { id: "cu-e9", from: "cu-durban", to: "cu-cape", mode: "shipping", label: "Durban-Cape transit" },
  { id: "cu-e10", from: "cu-grasberg", to: "cu-shenzhen", mode: "shipping", label: "Indonesia-China copper route" },
  { id: "cu-e11", from: "cu-shanghai", to: "cu-shenzhen", mode: "rail", label: "Domestic distribution rail" },
];

// ── Aluminum ──
const ALUMINUM_NODES: SupplyNode[] = [
  { id: "al-guinea", name: "Guinea Bauxite Mines", lat: 10.9, lon: -12.1, type: "production", description: "World's largest bauxite reserves. ~100M tonnes/year." },
  { id: "al-conakry", name: "Conakry / Kamsar Port", lat: 10.0, lon: -14.3, type: "port", description: "Guinea bauxite export ports." },
  { id: "al-australia", name: "Weipa Bauxite", lat: -12.63, lon: 141.87, type: "production", description: "Australia. World's largest bauxite producer." },
  { id: "al-gladstone", name: "Gladstone Alumina", lat: -23.85, lon: 151.27, type: "processing", description: "Queensland alumina refineries. Major export hub." },
  { id: "al-jamaica", name: "Jamaica Bauxite", lat: 18.18, lon: -77.4, type: "production", description: "Caribbean bauxite producer for US Gulf refineries." },
  { id: "al-iceland", name: "Iceland Smelters", lat: 64.1, lon: -21.9, type: "processing", description: "Cheap geothermal power = cheap aluminum smelting." },
  { id: "al-rareearth", name: "Inner Mongolia Smelters", lat: 40.65, lon: 109.84, type: "processing", hotspotRef: "rareearth", description: "China produces 57% of global aluminum. Coal-powered smelters." },
  { id: "al-usgulf", name: "US Gulf Alumina", lat: 29.5, lon: -90.0, type: "processing", hotspotRef: "usgulf", description: "Louisiana alumina refineries (Gramercy, Burnside)." },
  { id: "al-shenzhen", name: "Shenzhen / PRD", lat: 22.55, lon: 114.07, type: "manufacturing", hotspotRef: "shenzhen", description: "Electronics and packaging aluminum consumption." },
  { id: "al-rotterdam", name: "Rotterdam", lat: 51.9, lon: 4.5, type: "port", hotspotRef: "rotterdam", description: "Europe's aluminum import/distribution hub." },
  { id: "al-detroit", name: "Detroit Auto Industry", lat: 42.33, lon: -83.05, type: "consumption", description: "US automotive aluminum demand center." },
  { id: "al-nagoya", name: "Nagoya", lat: 35.18, lon: 136.91, type: "consumption", description: "Japan auto/electronics aluminum consumption." },
];

const ALUMINUM_EDGES: SupplyEdge[] = [
  { id: "al-e1", from: "al-guinea", to: "al-conakry", mode: "rail", label: "Bauxite mine to port rail" },
  { id: "al-e2", from: "al-conakry", to: "al-rareearth", mode: "shipping", label: "Guinea-China bauxite route" },
  { id: "al-e3", from: "al-conakry", to: "al-usgulf", mode: "shipping", label: "Guinea-US Gulf bauxite route" },
  { id: "al-e4", from: "al-australia", to: "al-gladstone", mode: "rail", label: "Weipa-Gladstone rail" },
  { id: "al-e5", from: "al-gladstone", to: "al-rareearth", mode: "shipping", label: "Australia-China alumina route" },
  { id: "al-e6", from: "al-gladstone", to: "al-nagoya", mode: "shipping", label: "Australia-Japan alumina route" },
  { id: "al-e7", from: "al-jamaica", to: "al-usgulf", mode: "shipping", label: "Jamaica-US Gulf bauxite" },
  { id: "al-e8", from: "al-iceland", to: "al-rotterdam", mode: "shipping", label: "Iceland-Europe aluminum ingots" },
  { id: "al-e9", from: "al-rareearth", to: "al-shenzhen", mode: "rail", label: "Domestic smelter-factory rail" },
  { id: "al-e10", from: "al-usgulf", to: "al-detroit", mode: "rail", label: "Gulf Coast-Detroit rail" },
  { id: "al-e11", from: "al-rotterdam", to: "al-detroit", mode: "shipping", label: "Europe-US aluminum route" },
];

// ── Export all networks ──
export const SUPPLY_CHAIN_NETWORKS: SupplyChainNetwork[] = [
  { commoditySymbol: "WTI", nodes: WTI_NODES, edges: WTI_EDGES },
  { commoditySymbol: "BRENT", nodes: BRENT_NODES, edges: BRENT_EDGES },
  { commoditySymbol: "NATURAL_GAS", nodes: NATGAS_NODES, edges: NATGAS_EDGES },
  { commoditySymbol: "COPPER", nodes: COPPER_NODES, edges: COPPER_EDGES },
  { commoditySymbol: "ALUMINUM", nodes: ALUMINUM_NODES, edges: ALUMINUM_EDGES },
];
