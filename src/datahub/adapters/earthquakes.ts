import type { SourceAdapter, SeismicEvent } from "../types";

export const usgsAdapter: SourceAdapter<SeismicEvent[]> = {
  id: "usgs-earthquakes",
  async fetch(signal) {
    const res = await fetch(
      "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson",
      { signal }
    );
    if (!res.ok) throw new Error(`USGS HTTP ${res.status}`);
    const json = await res.json();
    return (json.features || []).map((f: any) => ({
      id: String(f.id),
      lat: f.geometry.coordinates[1],
      lon: f.geometry.coordinates[0],
      timestamp: Number(f.properties.time || Date.now()),
      source: "usgs",
      magnitude: Number(f.properties.mag || 0),
      depth: f.geometry.coordinates[2] || 0,
      title: String(f.properties.title || ""),
      url: String(f.properties.url || ""),
    }));
  },
};

export const emscAdapter: SourceAdapter<SeismicEvent[]> = {
  id: "emsc-earthquakes",
  async fetch(signal) {
    const res = await fetch(
      "https://www.seismicportal.eu/fdsnws/event/1/query?limit=100&format=json",
      { signal }
    );
    if (!res.ok) throw new Error(`EMSC HTTP ${res.status}`);
    const json = await res.json();
    return (json.features || []).map((f: any) => ({
      id: String(f.id || f.properties?.source_id || ""),
      lat: f.geometry.coordinates[1],
      lon: f.geometry.coordinates[0],
      timestamp: new Date(f.properties.time).getTime(),
      source: "emsc",
      magnitude: Number(f.properties.mag || 0),
      depth: f.geometry.coordinates[2] || 0,
      title: String(f.properties.flynn_region || ""),
      url: `https://www.seismicportal.eu/eventdetail.html?unid=${f.id}`,
    }));
  },
};
