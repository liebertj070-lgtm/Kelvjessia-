"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { ORIGIN, getDestination } from "@/lib/routes-data";
import { MAPBOX_TOKEN, isMapboxConfigured, fetchDrivingRoute, pointAlongRoute } from "@/lib/mapbox";
import type { OpsTrip } from "@/lib/admin-data";

const STATUS_COLOR: Record<string, string> = {
  in_transit: "#1557e0",
  delayed: "#f59e0b",
  boarding: "#8b96ac",
  arrived: "#22c55e",
};

function markerEl(color: string, label: string) {
  const el = document.createElement("div");
  el.innerHTML = `<div style="display:flex;align-items:center;gap:5px;background:#121A2B;border:1px solid #1F2A44;border-radius:9999px;padding:4px 10px 4px 4px;box-shadow:0 2px 10px rgba(0,0,0,.4)">
    <span style="width:16px;height:16px;border-radius:9999px;background:${color};border:2px solid white;flex-shrink:0"></span>
    <span style="font-family:ui-monospace,monospace;font-size:11px;color:#E7ECF5;white-space:nowrap">${label}</span>
  </div>`;
  return el.firstElementChild as HTMLElement;
}

export function FleetMap({ trips }: { trips: OpsTrip[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!isMapboxConfigured || !containerRef.current || mapRef.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [ORIGIN.coords.lng, ORIGIN.coords.lat],
      zoom: 9.5,
      attributionControl: false,
    });
    mapRef.current = map;

    map.on("load", async () => {
      new mapboxgl.Marker({ element: markerEl("#E7ECF5", "AUI") })
        .setLngLat([ORIGIN.coords.lng, ORIGIN.coords.lat])
        .addTo(map);

      const bounds = new mapboxgl.LngLatBounds(
        [ORIGIN.coords.lng, ORIGIN.coords.lat],
        [ORIGIN.coords.lng, ORIGIN.coords.lat]
      );

      const relevant = trips.filter(
        (t) => t.status === "in_transit" || t.status === "delayed" || t.status === "boarding"
      );

      await Promise.all(
        relevant.map(async (trip) => {
          const dest = getDestination(trip.destinationSlug);
          if (!dest) return;
          const coords = await fetchDrivingRoute(ORIGIN.coords, dest.coords);

          map.addSource(`route-${trip.id}`, {
            type: "geojson",
            data: { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: coords } },
          });
          map.addLayer({
            id: `route-line-${trip.id}`,
            type: "line",
            source: `route-${trip.id}`,
            layout: { "line-join": "round", "line-cap": "round" },
            paint: {
              "line-color": STATUS_COLOR[trip.status] ?? "#8b96ac",
              "line-width": 3,
              "line-opacity": 0.7,
            },
          });

          const point = pointAlongRoute(coords, trip.progressPercent / 100);
          new mapboxgl.Marker({
            element: markerEl(STATUS_COLOR[trip.status] ?? "#8b96ac", trip.busPlate),
          })
            .setLngLat(point)
            .addTo(map);

          coords.forEach((c) => bounds.extend(c as [number, number]));
        })
      );

      map.fitBounds(bounds, { padding: 64, duration: 0, maxZoom: 11 });
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isMapboxConfigured) {
    return (
      <div className="grid h-full min-h-[320px] place-items-center rounded-xl bg-[#121A2B] font-mono text-sm text-[#8B96AC]">
        Map unavailable — set NEXT_PUBLIC_MAPBOX_TOKEN
      </div>
    );
  }

  return <div ref={containerRef} className="h-full min-h-[320px] w-full rounded-xl" />;
}
