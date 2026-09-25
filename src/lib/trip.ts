import type { SupabaseClient } from "@supabase/supabase-js";
import { decodeBooking, type Booking } from "@/lib/booking";
import {
  getDestination,
  getRouteEndpoints,
  type LatLng,
} from "@/lib/routes-data";
import { MOCK_ACTIVE_TRIP } from "@/lib/mock-data";
import { STATUS_LABEL, type TripOpsStatus } from "@/lib/admin-data";
import { getBookingByReference } from "@/lib/supabase/queries";
import type { Database, BookingRow } from "@/lib/supabase/database.types";

export type TripTimelineStep = {
  label: string;
  time: string;
  detail: string;
  done: boolean;
  active?: boolean;
};

export type TripView = {
  id?: string;
  kind: Booking["kind"];
  reference: string;
  fromCity: string;
  toCity: string;
  fromCoords: LatLng;
  toCoords: LatLng;
  /** The passenger's own last-reported GPS position on this trip (only
   * for seat bookings — see ShareMyLocation). Null until they've shared
   * it at least once; the map falls back to interpolating along the
   * route by progressPercent until then. */
  currentPosition: LatLng | null;
  status: string;
  departedAt: string;
  eta: string;
  arrivingInMinutes: number;
  seats: string[];
  passengers: number;
  pickup: string;
  dropoff?: string;
  amountPaidNaira: number;
  bus: string;
  progressPercent: number;
  driver: typeof MOCK_ACTIVE_TRIP.driver;
  timeline: TripTimelineStep[];
};

function timelineFor(
  status: TripOpsStatus,
  fromCity: string,
  toCity: string,
  bus: string,
  driverName: string,
  arrivingInMinutes: number
): TripTimelineStep[] {
  const dispatched = status !== "scheduled";
  const arrived = status === "arrived";
  const inTransit = status === "in_transit" || status === "delayed";

  return [
    { label: "Booking confirmed", time: "—", detail: "Payment received", done: true },
    {
      label: `Dispatched from ${fromCity}`,
      time: dispatched ? "—" : "Pending",
      detail: dispatched ? `Bus ${bus}, driver ${driverName}` : "Waiting on dispatch",
      done: dispatched,
      active: status === "boarding",
    },
    {
      label: status === "delayed" ? `Delayed en route to ${toCity}` : "In transit",
      time: inTransit ? "Now" : arrived ? "—" : "",
      detail: `En route to ${toCity}`,
      done: arrived,
      active: inTransit,
    },
    {
      label: `Arriving at ${toCity}`,
      time: arrived ? "Arrived" : dispatched ? `Est. ${arrivingInMinutes} min` : "",
      detail: "",
      done: arrived,
    },
  ];
}

/** Real path — a bookings row from the database. Dispatch fields
 * (bus/driver/GPS) are nullable until a dispatcher assigns them from
 * /admin, so this still leans on the same mock driver placeholder for
 * whichever fields haven't been set yet. Exported so the Home screen's
 * Active Trip card can build its summary from the same row shape. */
export function tripViewFromRow(row: BookingRow): TripView {
  const destination = getDestination(row.destination_slug);
  const { fromCoords, toCoords } = destination
    ? getRouteEndpoints(destination, row.direction)
    : { fromCoords: { lat: 0, lng: 0 }, toCoords: { lat: 0, lng: 0 } };

  const durationMinutes = destination?.durationMinutes ?? 60;
  const arrivingInMinutes = Math.max(
    4,
    Math.round(durationMinutes * (1 - row.progress_percent / 100))
  );

  const bus = row.bus_plate ?? MOCK_ACTIVE_TRIP.bus;
  const driver = row.driver_name
    ? {
        name: row.driver_name,
        phone: row.driver_phone ?? MOCK_ACTIVE_TRIP.driver.phone,
        initials: row.driver_name
          .split(" ")
          .map((p) => p[0])
          .join("")
          .slice(0, 2)
          .toUpperCase(),
        vehicle: MOCK_ACTIVE_TRIP.driver.vehicle,
        plate: bus,
      }
    : MOCK_ACTIVE_TRIP.driver;

  return {
    id: row.id,
    kind: row.kind,
    reference: row.reference,
    fromCity: row.from_city,
    toCity: row.to_city,
    fromCoords,
    toCoords,
    currentPosition:
      row.current_lat != null && row.current_lng != null
        ? { lat: row.current_lat, lng: row.current_lng }
        : null,
    status: STATUS_LABEL[row.trip_status],
    departedAt: row.trip_status === "scheduled" ? "Not yet dispatched" : MOCK_ACTIVE_TRIP.departedAt,
    eta: MOCK_ACTIVE_TRIP.eta,
    arrivingInMinutes,
    seats: row.seats ?? [],
    passengers: row.passengers ?? 1,
    pickup: row.kind === "seat" ? "AUI Main Gate" : row.pickup_point ?? "",
    dropoff: row.kind === "package" ? row.dropoff_point ?? undefined : undefined,
    amountPaidNaira: row.amount_naira,
    bus,
    progressPercent: row.progress_percent,
    driver,
    timeline: timelineFor(
      row.trip_status,
      row.from_city,
      row.to_city,
      bus,
      driver.name,
      arrivingInMinutes
    ),
  };
}

/** Fallback path — no matching DB row (Supabase not configured, the
 * migration hasn't been run yet, or an older link built before this
 * existed). Synthesizes a trip from whatever booking info is on the
 * URL itself, same as this file did before the database was wired up. */
function tripViewFromParams(params: Record<string, string | undefined>): TripView | null {
  const booking = decodeBooking(params);
  if (!booking) return null;

  const destination = getDestination(booking.to)!;
  const { fromCity, toCity, fromCoords, toCoords } = getRouteEndpoints(
    destination,
    booking.direction
  );

  const reference = params.reference ?? MOCK_ACTIVE_TRIP.reference;
  const amountPaidNaira =
    Number(params.amount ?? 0) ||
    (booking.kind === "seat"
      ? destination.fareNaira * booking.seats.length
      : destination.packageFareNaira);

  const progressPercent = MOCK_ACTIVE_TRIP.progressPercent;
  const arrivingInMinutes = Math.max(
    4,
    Math.round(destination.durationMinutes * (1 - progressPercent / 100))
  );

  const driver = MOCK_ACTIVE_TRIP.driver;
  const bus = MOCK_ACTIVE_TRIP.bus;

  return {
    kind: booking.kind,
    reference,
    fromCity,
    toCity,
    fromCoords,
    toCoords,
    currentPosition: null,
    status: "In transit",
    departedAt: MOCK_ACTIVE_TRIP.departedAt,
    eta: MOCK_ACTIVE_TRIP.eta,
    arrivingInMinutes,
    seats: booking.kind === "seat" ? booking.seats : [],
    passengers: booking.kind === "seat" ? booking.passengers : 1,
    pickup: booking.kind === "seat" ? "AUI Main Gate" : booking.pickup,
    dropoff: booking.kind === "package" ? booking.dropoff : undefined,
    amountPaidNaira,
    bus,
    progressPercent,
    driver,
    timeline: [
      { label: "Booking confirmed", time: "—", detail: "Payment received", done: true },
      {
        label: `Dispatched from ${fromCity}`,
        time: MOCK_ACTIVE_TRIP.departedAt,
        detail: `Bus ${bus}, driver ${driver.name}`,
        done: true,
      },
      { label: "In transit", time: "Now", detail: `En route to ${toCity}`, done: false, active: true },
      { label: `Arriving at ${toCity}`, time: `Est. ${arrivingInMinutes} min`, detail: "", done: false },
    ],
  };
}

/** Builds the trip shown on Track Trip. Tries a real bookings row
 * first (by reference, RLS-scoped to the signed-in user), and falls
 * back to synthesizing one from the URL params when there's no DB row
 * yet. Returns null when there's nothing to track at all — no
 * reference and no decodable booking — so the page can show the empty
 * state instead of a trip that was never actually booked. */
export async function resolveTripView(
  supabase: SupabaseClient<Database> | null,
  params: Record<string, string | undefined>
): Promise<TripView | null> {
  if (supabase && params.reference) {
    const row = await getBookingByReference(supabase, params.reference);
    if (row) return tripViewFromRow(row);
  }
  return tripViewFromParams(params);
}
