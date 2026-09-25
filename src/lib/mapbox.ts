import type { LatLng } from "@/lib/routes-data";

export const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";
export const isMapboxConfigured = Boolean(MAPBOX_TOKEN);

/** Real driving-route geometry between two points via Mapbox Directions.
 * Falls back to a straight line if the request fails (e.g. offline, no
 * token) so the map still renders something sensible. */
export async function fetchDrivingRoute(
  from: LatLng,
  to: LatLng
): Promise<[number, number][]> {
  const straightLine: [number, number][] = [
    [from.lng, from.lat],
    [to.lng, to.lat],
  ];
  if (!MAPBOX_TOKEN) return straightLine;

  try {
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${from.lng},${from.lat};${to.lng},${to.lat}?geometries=geojson&access_token=${MAPBOX_TOKEN}`;
    const res = await fetch(url);
    const data = await res.json();
    const coords = data?.routes?.[0]?.geometry?.coordinates;
    return Array.isArray(coords) && coords.length > 1 ? coords : straightLine;
  } catch {
    return straightLine;
  }
}

/** Point at `fraction` (0–1) along a route's coordinate list, walking by
 * segment length rather than just index — keeps the marker's speed visually
 * even across segments of different lengths. */
export function pointAlongRoute(
  coords: [number, number][],
  fraction: number
): [number, number] {
  if (coords.length === 0) return [0, 0];
  if (coords.length === 1 || fraction <= 0) return coords[0];
  if (fraction >= 1) return coords[coords.length - 1];

  const dist = (a: [number, number], b: [number, number]) =>
    Math.hypot(b[0] - a[0], b[1] - a[1]);

  const total = coords.slice(1).reduce((sum, c, i) => sum + dist(coords[i], c), 0);
  const target = total * fraction;

  let covered = 0;
  for (let i = 0; i < coords.length - 1; i++) {
    const segLen = dist(coords[i], coords[i + 1]);
    if (covered + segLen >= target) {
      const t = segLen === 0 ? 0 : (target - covered) / segLen;
      return [
        coords[i][0] + (coords[i + 1][0] - coords[i][0]) * t,
        coords[i][1] + (coords[i + 1][1] - coords[i][1]) * t,
      ];
    }
    covered += segLen;
  }
  return coords[coords.length - 1];
}
