"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl, { Map } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

type EdgeCoords = Record<string, string>;
type Props = {
  farmerId: string;
  onSnapshot?: (payload: { dataUrl: string; coords: EdgeCoords }) => void;
};

export default function FarmerParcelsMap({ farmerId, onSnapshot }: Props) {
  const mapRef = useRef<Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [basemap, setBasemap] = useState<"hybrid" | "road">("hybrid");
  const [coords, setCoords] = useState<EdgeCoords>({});

  function formatLngLat(lng: number, lat: number) {
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  }

  function updateEdgeCoords(map: Map) {
    const b = map.getBounds();
    const nw = b.getNorthWest();
    const ne = b.getNorthEast();
    const se = b.getSouthEast();
    const sw = b.getSouthWest();
    const topCenter = { lng: (nw.lng + ne.lng) / 2, lat: nw.lat };
    const rightCenter = { lng: ne.lng, lat: (ne.lat + se.lat) / 2 };
    const bottomCenter = { lng: (sw.lng + se.lng) / 2, lat: se.lat };
    const leftCenter = { lng: nw.lng, lat: (nw.lat + sw.lat) / 2 };

    setCoords({
      TL: formatLngLat(nw.lng, nw.lat),
      TC: formatLngLat(topCenter.lng, topCenter.lat),
      TR: formatLngLat(ne.lng, ne.lat),
      RC: formatLngLat(rightCenter.lng, rightCenter.lat),
      BR: formatLngLat(se.lng, se.lat),
      BC: formatLngLat(bottomCenter.lng, bottomCenter.lat),
      BL: formatLngLat(sw.lng, sw.lat),
      LC: formatLngLat(leftCenter.lng, leftCenter.lat),
    });
  }

  function getEdgeCoords(map: Map) {
    const b = map.getBounds();
    const nw = b.getNorthWest();
    const ne = b.getNorthEast();
    const se = b.getSouthEast();
    const sw = b.getSouthWest();
    const topCenter = { lng: (nw.lng + ne.lng) / 2, lat: nw.lat };
    const rightCenter = { lng: ne.lng, lat: (ne.lat + se.lat) / 2 };
    const bottomCenter = { lng: (sw.lng + se.lng) / 2, lat: se.lat };
    const leftCenter = { lng: nw.lng, lat: (nw.lat + sw.lat) / 2 };
    return {
      TL: formatLngLat(nw.lng, nw.lat),
      TC: formatLngLat(topCenter.lng, topCenter.lat),
      TR: formatLngLat(ne.lng, ne.lat),
      RC: formatLngLat(rightCenter.lng, rightCenter.lat),
      BR: formatLngLat(se.lng, se.lat),
      BC: formatLngLat(bottomCenter.lng, bottomCenter.lat),
      BL: formatLngLat(sw.lng, sw.lat),
      LC: formatLngLat(leftCenter.lng, leftCenter.lat),
    } as EdgeCoords;
  }

  function applyBasemap(map: Map, which: "hybrid" | "road") {
    const sourceId = "basemap-src";
    const layerId = "basemap-lyr";
    if (map.getLayer(layerId)) map.removeLayer(layerId);
    if (map.getSource(sourceId)) map.removeSource(sourceId);

    const tiles =
      which === "hybrid"
        ? [
            // Google Satellite Hybrid
            // lyrs=s,h => satellite + labels (hybrid)
            "https://mt0.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}",
            "https://mt1.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}",
            "https://mt2.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}",
            "https://mt3.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}",
          ]
        : [
            // Google Road map
            // lyrs=m => roadmap
            "https://mt0.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
            "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
            "https://mt2.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
            "https://mt3.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
          ];

    map.addSource(sourceId, {
      type: "raster",
      tiles,
      tileSize: 256,
      attribution: "© Google",
    } as any);

    // Insert basemap layer at the bottom so vector layers (parcels) stay above
    const layers = map.getStyle().layers || [];
    const firstLayerId = layers.length > 0 ? layers[0].id : undefined;

    map.addLayer(
      {
        id: layerId,
        type: "raster",
        source: sourceId,
      },
      firstLayerId
    );
  }

  function addTemporaryOSMBasemap(map: Map) {
    const sourceId = "osm-temp-src";
    const layerId = "osm-temp-lyr";
    if (map.getLayer(layerId)) map.removeLayer(layerId);
    if (map.getSource(sourceId)) map.removeSource(sourceId);
    const mtKey = process.env.NEXT_PUBLIC_MAPTILER_KEY;
    const useMapTiler = typeof mtKey === "string" && mtKey.length > 0;
    const tiles = useMapTiler
      ? [
          `https://api.maptiler.com/tiles/satellite-v2/{z}/{x}/{y}.jpg?key=${mtKey}`,
        ]
      : ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"]; // fallback
    const tileSize = useMapTiler ? 512 : 256;

    map.addSource(sourceId, {
      type: "raster",
      tiles,
      tileSize,
      attribution: useMapTiler
        ? "© MapTiler © OpenStreetMap contributors"
        : "© OpenStreetMap contributors",
    } as any);
    const layers = map.getStyle().layers || [];
    const firstLayerId = layers.length > 0 ? layers[0].id : undefined;
    map.addLayer(
      {
        id: layerId,
        type: "raster",
        source: sourceId,
      },
      firstLayerId
    );
    return { sourceId, layerId };
  }

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: { version: 8, sources: {}, layers: [] },
      center: [101.05, 0.55],
      zoom: 10,
      preserveDrawingBuffer: true,
    } as any);
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }));
    mapRef.current = map;
    map.on("moveend", () => updateEdgeCoords(map));

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Apply basemap on change or when map ready
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const ensure = () => applyBasemap(map, basemap);
    if (map.isStyleLoaded()) ensure();
    else map.once("load", ensure);
  }, [basemap]);

  useEffect(() => {
    let cancelled = false;
    const loadIntoMap = async () => {
      if (cancelled || !mapRef.current) return;
      try {
        const res = await fetch(`/api/farmers/${farmerId}/parcels`, {
          cache: "no-store",
        });
        if (!res.ok) return;
        const geojson = await res.json();
        if (cancelled || !mapRef.current) return;

        const map = mapRef.current;

        // Remove existing layers/sources if any
        if (map.getLayer("parcels-fill")) map.removeLayer("parcels-fill");
        if (map.getLayer("parcels-outline")) map.removeLayer("parcels-outline");
        if (map.getLayer("parcels-centroid"))
          map.removeLayer("parcels-centroid");
        if (map.getSource("parcels")) map.removeSource("parcels");

        map.addSource("parcels", { type: "geojson", data: geojson });

        map.addLayer({
          id: "parcels-fill",
          type: "fill",
          source: "parcels",
          filter: ["==", ["get", "kind"], "polygon"],
          paint: { "fill-color": "#22c55e", "fill-opacity": 0.25 },
        });

        map.addLayer({
          id: "parcels-outline",
          type: "line",
          source: "parcels",
          filter: ["==", ["get", "kind"], "polygon"],
          paint: { "line-color": "#16a34a", "line-width": 2 },
        });

        map.addLayer({
          id: "parcels-centroid",
          type: "circle",
          source: "parcels",
          filter: ["==", ["get", "kind"], "centroid"],
          paint: { "circle-color": "#2563eb", "circle-radius": 5 },
        });

        const bbox = getGeojsonBbox(geojson);
        if (bbox) {
          map.fitBounds(bbox, { padding: 24, duration: 0 });
        }
        updateEdgeCoords(map);

        // Give the map a tick to render, then snapshot canvas if requested
        setTimeout(() => {
          try {
            if (onSnapshot && mapRef.current) {
              const mapNow = mapRef.current;
              // Hide google base and add temporary OSM with CORS for snapshot
              const baseId = "basemap-lyr";
              const hadBase = !!mapNow.getLayer(baseId);
              let prevVis: any = undefined;
              if (hadBase) {
                // @ts-ignore
                prevVis = mapNow.getLayoutProperty(baseId, "visibility");
                mapNow.setLayoutProperty(baseId, "visibility", "none");
              }
              const { sourceId, layerId } = addTemporaryOSMBasemap(mapNow);
              mapNow.once("idle", () => {
                try {
                  const url = mapNow.getCanvas().toDataURL("image/png");
                  const snapCoords = getEdgeCoords(mapNow);
                  onSnapshot({ dataUrl: url, coords: snapCoords });
                } catch {}
                // cleanup osm temp and restore google base
                if (mapNow.getLayer(layerId)) mapNow.removeLayer(layerId);
                if (mapNow.getSource(sourceId)) mapNow.removeSource(sourceId);
                if (hadBase) {
                  mapNow.setLayoutProperty(
                    baseId,
                    "visibility",
                    prevVis || "visible"
                  );
                }
              });
            }
          } catch {}
        }, 200);
      } catch (_) {}
    };

    const map = mapRef.current;
    if (map) {
      if (map.isStyleLoaded()) loadIntoMap();
      else map.once("load", loadIntoMap);
    }
    return () => {
      cancelled = true;
    };
  }, [farmerId]);

  return (
    <div className="relative h-full w-full">
      <div className="absolute right-2 top-2 z-10 flex items-center gap-1 rounded-md border bg-background p-1 text-xs shadow">
        <button
          onClick={() => setBasemap("hybrid")}
          className={`px-2 py-1 rounded ${
            basemap === "hybrid" ? "bg-muted" : ""
          }`}
        >
          Hybrid
        </button>
        <button
          onClick={() => setBasemap("road")}
          className={`px-2 py-1 rounded ${
            basemap === "road" ? "bg-muted" : ""
          }`}
        >
          Road
        </button>
      </div>
      {/* Edge coordinate labels (corners + mid-edges) */}
      <div className="pointer-events-none absolute inset-0 z-10 text-[10px] leading-tight">
        {/* Top */}
        <div className="absolute left-1 top-1 bg-background/70 px-1 rounded">
          {coords.TL}
        </div>
        <div className="absolute left-1/2 -translate-x-1/2 top-1 bg-background/70 px-1 rounded">
          {coords.TC}
        </div>
        <div className="absolute right-1 top-1 bg-background/70 px-1 rounded">
          {coords.TR}
        </div>
        {/* Right center */}
        <div className="absolute right-1 top-1/2 -translate-y-1/2 bg-background/70 px-1 rounded text-right">
          {coords.RC}
        </div>
        {/* Bottom */}
        <div className="absolute left-1 bottom-1 bg-background/70 px-1 rounded">
          {coords.BL}
        </div>
        <div className="absolute left-1/2 -translate-x-1/2 bottom-1 bg-background/70 px-1 rounded">
          {coords.BC}
        </div>
        <div className="absolute right-1 bottom-1 bg-background/70 px-1 rounded">
          {coords.BR}
        </div>
        {/* Left center */}
        <div className="absolute left-1 top-1/2 -translate-y-1/2 bg-background/70 px-1 rounded">
          {coords.LC}
        </div>
      </div>
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}

function getGeojsonBbox(geojson: any): [number, number, number, number] | null {
  try {
    const coords: number[][] = [];
    const collect = (geom: any) => {
      const type = geom.type;
      const c = geom.coordinates;
      if (type === "Point") coords.push(c as number[]);
      else if (type === "MultiPoint" || type === "LineString")
        coords.push(...(c as number[][]));
      else if (type === "MultiLineString" || type === "Polygon")
        (c as number[][][]).forEach((ring) => coords.push(...ring));
      else if (type === "MultiPolygon")
        (c as number[][][][]).forEach((poly) =>
          poly.forEach((ring) => coords.push(...ring))
        );
      else if (type === "GeometryCollection")
        (geom.geometries || []).forEach((g: any) => collect(g));
    };
    if (geojson.type === "FeatureCollection") {
      for (const f of geojson.features) collect(f.geometry);
    } else if (geojson.type === "Feature") collect(geojson.geometry);
    else collect(geojson);
    if (!coords.length) return null;
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    for (const [x, y] of coords) {
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
    return [minX, minY, maxX, maxY];
  } catch {
    return null;
  }
}
