"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl, { Map } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

type Props = { farmerId: string };

export default function FarmerParcelsMap({ farmerId }: Props) {
  const mapRef = useRef<Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [basemap, setBasemap] = useState<"hybrid" | "road">("hybrid");

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

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: { version: 8, sources: {}, layers: [] },
      center: [101.05, 0.55],
      zoom: 10,
    } as any);
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }));
    mapRef.current = map;

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
