"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { LatLng } from "@/lib/routes-data";
import { MAPBOX_TOKEN, isMapboxConfigured, fetchDrivingRoute, pointAlongRoute } from "@/lib/mapbox";

function makeMarkerEl(html: string) {
  const el = document.createElement("div");
  el.innerHTML = html;
  return el.firstElementChild as HTMLElement;
}

export function TripMap({
  origin,
  destination,
  progressPercent,
  currentPosition,
}: {
  origin: LatLng;
  destination: LatLng;
  progressPercent: number;
  /** A real reported position (e.g. the passenger's own GPS — see
   * ShareMyLocation) to place the bus marker at exactly, instead of
   * interpolating it along the route by progressPercent. Can change
   * after the map has already loaded; a separate effect below moves
   * the existing marker rather than rebuilding the whole map. */
  currentPosition?: LatLng | null;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const busMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const lastPositionRef = useRef<LatLng | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isMapboxConfigured || !containerRef.current || mapRef.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [origin.lng, origin.lat],
      zoom: 10,
      attributionControl: false,
    });
    mapRef.current = map;

    map.on("load", async () => {
      const coords = await fetchDrivingRoute(origin, destination);

      map.addSource("route", {
        type: "geojson",
        data: { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: coords } },
      });
      map.addLayer({
        id: "route-line",
        type: "line",
        source: "route",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: { "line-color": "#1557e0", "line-width": 4 },
      });

      new mapboxgl.Marker({ element: makeMarkerEl(
        `<div style="width:26px;height:26px;border-radius:9999px;background:#0e1726;color:white;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,.3)">A</div>`
      )})
        .setLngLat([origin.lng, origin.lat])
        .addTo(map);

      new mapboxgl.Marker({ element: makeMarkerEl(
        `<div style="width:26px;height:26px;border-radius:9999px;background:#5b6b87;color:white;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,.3)">B</div>`
      )})
        .setLngLat([destination.lng, destination.lat])
        .addTo(map);

      const busPoint = currentPosition
        ? ([currentPosition.lng, currentPosition.lat] as [number, number])
        : pointAlongRoute(coords, progressPercent / 100);
      lastPositionRef.current = currentPosition ?? { lat: busPoint[1], lng: busPoint[0] };
      busMarkerRef.current = new mapboxgl.Marker({ element: makeMarkerEl(
        `<div style="width:22px;height:22px;border-radius:9999px;background:#1557e0;border:4px solid white;box-shadow:0 2px 6px rgba(21,87,224,.5)"></div>`
      )})
        .setLngLat(busPoint)
        .addTo(map);

      const bounds = coords.reduce(
        (b, c) => b.extend(c as [number, number]),
        new mapboxgl.LngLatBounds(coords[0], coords[0])
      );
      map.fitBounds(bounds, { padding: 56, duration: 0 });
    });

    return () => {
      map.remove();
      mapRef.current = null;
      busMarkerRef.current = null;
      if (animationFrameRef.current != null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Glides the existing bus marker to a new real position over ~900ms
  // instead of snapping to it — this is the difference between "looks
  // like a live navigation app" and "looks like a page that reloaded".
  // Fires on every fresh GPS report (ShareMyLocation) or Realtime
  // refresh after a dispatcher move; never touches the route itself.
  useEffect(() => {
    if (!currentPosition || !mapRef.current || !busMarkerRef.current) return;

    const from = lastPositionRef.current ?? currentPosition;
    const to = currentPosition;
    if (from.lat === to.lat && from.lng === to.lng) return;

    if (animationFrameRef.current != null) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    const map = mapRef.current;
    const marker = busMarkerRef.current;
    const duration = 900;
    const start = performance.now();
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    function step(now: number) {
      const t = Math.min(1, (now - start) / duration);
      const eased = easeOutCubic(t);
      const lng = from.lng + (to.lng - from.lng) * eased;
      const lat = from.lat + (to.lat - from.lat) * eased;
      marker.setLngLat([lng, lat]);

      if (t < 1) {
        animationFrameRef.current = requestAnimationFrame(step);
      } else {
        lastPositionRef.current = to;
        animationFrameRef.current = null;
      }
    }
    animationFrameRef.current = requestAnimationFrame(step);

    map.easeTo({ center: [to.lng, to.lat], duration });

    return () => {
      if (animationFrameRef.current != null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [currentPosition]);

  if (!isMapboxConfigured) {
    return (
      <div className="grid h-full min-h-[260px] place-items-center rounded-2xl bg-neutral-100 text-sm text-neutral-500">
        Map unavailable — set NEXT_PUBLIC_MAPBOX_TOKEN
      </div>
    );
  }

  return <div ref={containerRef} className="h-full min-h-[260px] w-full rounded-2xl" />;
}
