// Route fares/durations from Ilara-Epe (Augustine University).
// Per the build spec §3.5, this changes less often than booking data but
// should still live in a DB/config table rather than JSX — this file is
// that table's placeholder until Supabase is wired up.

export type LatLng = { lat: number; lng: number };

export type RouteDestination = {
  slug: string;
  city: string;
  fareNaira: number;
  /** Package base fare — confirmed different from the passenger seat fare
   * by the Send a Package screenshot (Surulere: ₦2,800 package vs ₦3,400
   * seat). Only Surulere's figure is confirmed; the rest are estimated at
   * the same ~82% ratio pending real numbers — flag before launch. */
  packageFareNaira: number;
  durationMinutes: number;
  /** Approximate real-world coordinates for the Mapbox route on Track Trip
   * (Phase 5) — good enough to place a marker in the right neighbourhood,
   * not surveyed/exact. Swap for real depot/drop-off coordinates later. */
  coords: LatLng;
};

export const ORIGIN = {
  city: "Ilara-Epe",
  label: "Ilara-Epe (AUI)",
  full: "Ilara-Epe · Augustine University",
  coords: { lat: 6.5820, lng: 3.9430 } as LatLng,
} as const;

export const DESTINATIONS: RouteDestination[] = [
  { slug: "festac", city: "Festac", fareNaira: 3500, packageFareNaira: 2900, durationMinutes: 100, coords: { lat: 6.4649, lng: 3.2836 } },
  { slug: "maryland", city: "Maryland", fareNaira: 3200, packageFareNaira: 2600, durationMinutes: 80, coords: { lat: 6.5698, lng: 3.3670 } },
  { slug: "ago", city: "Ago", fareNaira: 3500, packageFareNaira: 2900, durationMinutes: 95, coords: { lat: 6.4726, lng: 3.2996 } },
  { slug: "surulere", city: "Surulere", fareNaira: 3400, packageFareNaira: 2800, durationMinutes: 90, coords: { lat: 6.4991, lng: 3.3548 } },
  { slug: "falomo", city: "Falomo", fareNaira: 3000, packageFareNaira: 2500, durationMinutes: 70, coords: { lat: 6.4522, lng: 3.4341 } },
  { slug: "lekki", city: "Lekki", fareNaira: 2600, packageFareNaira: 2100, durationMinutes: 55, coords: { lat: 6.4698, lng: 3.5852 } },
  { slug: "ajah", city: "Ajah", fareNaira: 2200, packageFareNaira: 1800, durationMinutes: 40, coords: { lat: 6.4667, lng: 3.5833 } },
  { slug: "sangotedo", city: "Sangotedo", fareNaira: 2000, packageFareNaira: 1600, durationMinutes: 30, coords: { lat: 6.4560, lng: 3.6270 } },
];

export function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString("en-NG")}`;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

export function getDestination(slug: string): RouteDestination | undefined {
  return DESTINATIONS.find((d) => d.slug === slug);
}

/** Every route only ever runs between Ilara-Epe and one destination city —
 * "outbound" is Ilara-Epe → destination, "return" is destination →
 * Ilara-Epe. This is the one flag that needs to travel with a booking
 * everywhere the from/to cities or their Mapbox coords are shown, so the
 * swap-direction control on Select Route actually sticks through the rest
 * of the flow instead of only affecting that screen's own display. */
export type Direction = "outbound" | "return";

export function isDirection(value: string | undefined): value is Direction {
  return value === "outbound" || value === "return";
}

export type RouteEndpoints = {
  direction: Direction;
  fromCity: string;
  toCity: string;
  fromFull: string;
  toFull: string;
  fromCoords: LatLng;
  toCoords: LatLng;
};

export function getRouteEndpoints(
  destination: RouteDestination,
  direction: Direction = "outbound"
): RouteEndpoints {
  const outbound = direction === "outbound";
  return {
    direction,
    fromCity: outbound ? ORIGIN.city : destination.city,
    toCity: outbound ? destination.city : ORIGIN.city,
    fromFull: outbound ? ORIGIN.full : destination.city,
    toFull: outbound ? destination.city : ORIGIN.full,
    fromCoords: outbound ? ORIGIN.coords : destination.coords,
    toCoords: outbound ? destination.coords : ORIGIN.coords,
  };
}
