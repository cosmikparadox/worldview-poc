import type { Context } from "@netlify/functions";

// In-memory ship cache — survives warm invocations
let shipCache = new Map<number, ShipPosition>();
let lastCollectionTime = 0;
const COLLECTION_WINDOW = 7000; // collect for 7 seconds per WS connection
const CACHE_TTL = 60 * 1000; // serve cached data for 60s
const MAX_SHIPS = 5000;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Content-Type": "application/json",
  "Cache-Control": "public, max-age=15",
};

interface ShipPosition {
  mmsi: number;
  lat: number;
  lon: number;
  cog: number;
  sog: number;
  name: string;
  shipType: number;
  timestamp: number;
}

interface CollectResult {
  ships: ShipPosition[];
  debug: string;
}

function collectFromAisStream(apiKey: string): Promise<CollectResult> {
  return new Promise((resolve) => {
    const collected: ShipPosition[] = [];
    const log: string[] = [];
    let resolved = false;

    const done = (reason: string) => {
      if (resolved) return;
      resolved = true;
      log.push(`done:${reason}:${collected.length}ships`);
      try { ws.close(); } catch {}
      resolve({ ships: collected, debug: log.join("|") });
    };

    // Safety timeout
    const timeout = setTimeout(() => done("timeout"), COLLECTION_WINDOW + 2000);

    let ws: WebSocket;
    try {
      ws = new WebSocket("wss://stream.aisstream.io/v0/stream");
      log.push("ws-created");
    } catch (e) {
      log.push(`ws-create-error:${e}`);
      resolve({ ships: [], debug: log.join("|") });
      return;
    }

    ws.addEventListener("open", () => {
      log.push("ws-open");
      ws.send(JSON.stringify({
        APIKey: apiKey,
        BoundingBoxes: [[[-90, -180], [90, 180]]],
        FilterMessageTypes: ["PositionReport"],
      }));
      log.push("sub-sent");

      // Stop collecting after COLLECTION_WINDOW
      setTimeout(() => done("collection-complete"), COLLECTION_WINDOW);
    });

    ws.addEventListener("message", (event) => {
      try {
        const msg = JSON.parse(String(event.data));
        if (log.length < 3 || !log.some(l => l.startsWith("msg:"))) {
          log.push(`msg:${msg.MessageType || "unknown"}`);
        }
        if (msg.MessageType !== "PositionReport") return;

        const meta = msg.MetaData || msg.Metadata;
        const pos = msg.Message?.PositionReport;
        if (!meta?.MMSI || !pos) return;

        const lat = pos.Latitude ?? meta.latitude ?? 0;
        const lon = pos.Longitude ?? meta.longitude ?? 0;
        if (lat === 0 && lon === 0) return;

        collected.push({
          mmsi: meta.MMSI,
          lat,
          lon,
          cog: pos.Cog ?? 0,
          sog: pos.Sog ?? 0,
          name: (meta.ShipName || `MMSI ${meta.MMSI}`).trim(),
          shipType: pos.ShipType ?? 0,
          timestamp: Date.now(),
        });
      } catch {}
    });

    ws.addEventListener("error", (e) => {
      log.push(`ws-error:${e.type || "unknown"}`);
      done("error");
    });
    ws.addEventListener("close", (e) => {
      log.push(`ws-close:code=${e.code},reason=${e.reason}`);
      clearTimeout(timeout);
      done("close");
    });
  });
}

export default async (req: Request, _context: Context) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  const apiKey = process.env.VITE_AISSTREAM_API_KEY || "";
  if (!apiKey) {
    return new Response(JSON.stringify({ ships: [], count: 0 }), {
      headers: { ...CORS_HEADERS, "X-Cache": "NO-KEY" },
    });
  }

  const now = Date.now();

  // Serve from cache if fresh enough
  if (shipCache.size > 0 && now - lastCollectionTime < CACHE_TTL) {
    const ships = [...shipCache.values()];
    return new Response(JSON.stringify({ ships, count: ships.length }), {
      headers: { ...CORS_HEADERS, "X-Cache": "HIT" },
    });
  }

  // Collect fresh data from AISStream
  try {
    const result = await collectFromAisStream(apiKey);
    const newShips = result.ships;

    // Merge into cache (update existing, add new)
    for (const ship of newShips) {
      shipCache.set(ship.mmsi, ship);
    }

    // Evict old entries if over limit
    if (shipCache.size > MAX_SHIPS) {
      const sorted = [...shipCache.entries()]
        .sort((a, b) => b[1].timestamp - a[1].timestamp)
        .slice(0, MAX_SHIPS);
      shipCache = new Map(sorted);
    }

    lastCollectionTime = now;
    const ships = [...shipCache.values()];

    return new Response(JSON.stringify({ ships, count: ships.length }), {
      headers: {
        ...CORS_HEADERS,
        "X-Cache": "MISS",
        "X-New-Ships": String(newShips.length),
        "X-Total-Ships": String(ships.length),
        "X-Debug": result.debug.substring(0, 200),
      },
    });
  } catch {
    // Serve stale if available
    if (shipCache.size > 0) {
      const ships = [...shipCache.values()];
      return new Response(JSON.stringify({ ships, count: ships.length }), {
        headers: { ...CORS_HEADERS, "X-Cache": "STALE" },
      });
    }
    return new Response(JSON.stringify({ ships: [], count: 0 }), {
      headers: { ...CORS_HEADERS, "X-Cache": "EMPTY" },
    });
  }
};

export const config = { path: "/api/ships" };
