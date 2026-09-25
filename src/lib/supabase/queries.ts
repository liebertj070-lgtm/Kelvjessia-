import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, BookingRow, ProfileRow, NotificationRow } from "./database.types";import type { Booking } from "@/lib/booking";
import { getRouteEndpoints, getDestination } from "@/lib/routes-data";

type DB = SupabaseClient<Database>;

// ---------------------------------------------------------------
// bookings
// ---------------------------------------------------------------

export type NewBookingParams = {
  userId: string;
  booking: Booking;
  reference: string;
  amountNaira: number;
  paidStatus: BookingRow["paid_status"];
  paymentMethod: string;
};

export type InsertBookingResult = {
  row: BookingRow | null;
  error: string | null;
  /** True when the insert failed specifically because one or more of the
   * requested seats were taken for that route/day/time in between the
   * person picking them and this insert running (e.g. someone else
   * booked the same seat while this person was on the Paystack page). */
  seatConflict?: boolean;
};

/** Which seats are already reserved for this exact route/day/time slot —
 * what Book a Seat marks "Taken" instead of the old hardcoded mock list. */
export async function getTakenSeats(
  supabase: DB,
  params: { destinationSlug: string; direction: "outbound" | "return"; date: string; time: string }
): Promise<string[]> {
  const { data } = await supabase
    .from("booking_seats")
    .select("seat")
    .eq("destination_slug", params.destinationSlug)
    .eq("direction", params.direction)
    .eq("date", params.date)
    .eq("time", params.time);
  return (data ?? []).map((r) => r.seat);
}

/** Inserts a real bookings row for whichever payment path just
 * succeeded (Paystack card/bank transfer, wallet, or pay-on-pickup).
 * from_city/to_city are stored directly (denormalized) so every page
 * that reads a booking back doesn't need routes-data just to display
 * the route. */
export async function insertBooking(
  supabase: DB,
  { userId, booking, reference, amountNaira, paidStatus, paymentMethod }: NewBookingParams
): Promise<InsertBookingResult> {
  const destination = getDestination(booking.to);
  if (!destination) return { row: null, error: "Unknown destination." };
  const { fromCity, toCity } = getRouteEndpoints(destination, booking.direction);

  const base = {
    user_id: userId,
    reference,
    kind: booking.kind,
    destination_slug: booking.to,
    direction: booking.direction,
    from_city: fromCity,
    to_city: toCity,
    amount_naira: amountNaira,
    paid_status: paidStatus,
    payment_method: paymentMethod,
  };

  // Built as one flat shape (nulling out whichever half doesn't apply)
  // rather than a seat-shaped/package-shaped union — postgrest-js's
  // .insert() types a single row against one Insert shape, and a union
  // here fails to structurally match it even though each half is valid.
  const row: Database["public"]["Tables"]["bookings"]["Insert"] =
    booking.kind === "seat"
      ? {
          ...base,
          seats: booking.seats,
          passengers: booking.passengers,
          day: booking.day,
          date: booking.date,
          time: booking.time,
          description: null,
          category: null,
          size_id: null,
          fragile: null,
          recipient_name: null,
          recipient_phone: null,
          pickup_point: null,
          dropoff_point: null,
        }
      : {
          ...base,
          seats: null,
          passengers: null,
          day: null,
          date: null,
          time: null,
          description: booking.description,
          category: booking.category,
          size_id: booking.size,
          fragile: booking.fragile,
          recipient_name: booking.recipientName,
          recipient_phone: booking.recipientPhone,
          pickup_point: booking.pickup,
          dropoff_point: booking.dropoff,
        };

  const { data, error } = await supabase
    .from("bookings")
    .insert(row)
    .select()
    .single();

  if (error) {
    // A conflict on the booking_seats unique constraint means someone
    // else grabbed one of these exact seats for this exact slot between
    // this person picking them and this insert running — surface that
    // distinctly so the caller can tell the person plainly, rather than
    // a generic "something went wrong".
    if (error.code === "23505" && error.message.includes("booking_seats")) {
      return { row: null, error: "One or more of those seats were just taken. Please pick different seats.", seatConflict: true };
    }
    // Unique-violation on reference (e.g. a retried Paystack redirect)
    // just means the booking already exists — fetch and return it
    // instead of surfacing a duplicate-key error to the user.
    if (error.code === "23505") {
      const existing = await getBookingByReference(supabase, reference);
      return { row: existing, error: existing ? null : error.message };
    }
    return { row: null, error: error.message };
  }
  return { row: data, error: null };
}

export async function getBookingByReference(
  supabase: DB,
  reference: string
): Promise<BookingRow | null> {
  const { data } = await supabase
    .from("bookings")
    .select("*")
    .eq("reference", reference)
    .maybeSingle();
  return data;
}

/** Inverse of insertBooking's row-shaping — rebuilds the Booking shape
 * booking.ts's encodeBooking() expects, from a real DB row. Used to link
 * a History entry back to Confirmation with accurate params instead of
 * the old regex-guessed reconstruction from the mock display strings. */
export function rowToBooking(row: BookingRow): Booking {
  const base = { to: row.destination_slug, direction: row.direction };
  if (row.kind === "seat") {
    return {
      kind: "seat",
      ...base,
      seats: row.seats ?? [],
      passengers: row.passengers ?? (row.seats?.length ?? 1),
      day: row.day ?? "",
      date: row.date ?? "",
      time: row.time ?? "",
    };
  }
  return {
    kind: "package",
    ...base,
    description: row.description ?? "",
    category: row.category ?? "",
    size: row.size_id ?? "medium",
    fragile: row.fragile ?? false,
    recipientName: row.recipient_name ?? "",
    recipientPhone: row.recipient_phone ?? "",
    pickup: row.pickup_point ?? "",
    dropoff: row.dropoff_point ?? "",
  };
}

export async function listUserBookings(
  supabase: DB,
  userId: string
): Promise<BookingRow[]> {
  const { data } = await supabase
    .from("bookings")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getBookingCounts(
  supabase: DB,
  userId: string
): Promise<{ trips: number; parcels: number }> {
  const [trips, parcels] = await Promise.all([
    supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("kind", "seat"),
    supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("kind", "package"),
  ]);
  return { trips: trips.count ?? 0, parcels: parcels.count ?? 0 };
}

/** Most recent booking that's still on its way (not yet arrived or
 * cancelled) — what Home's Active Trip card shows, if anything. */
export async function getLatestActiveBooking(
  supabase: DB,
  userId: string
): Promise<BookingRow | null> {
  const { data } = await supabase
    .from("bookings")
    .select("*")
    .eq("user_id", userId)
    .not("trip_status", "in", "(arrived,cancelled)")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data;
}

/** Staff-only (RLS enforces this server-side too — this just avoids a
 * doomed request from a non-staff session). */
export async function listAllBookings(supabase: DB): Promise<BookingRow[]> {
  const { data } = await supabase
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  return data ?? [];
}

export type DispatchUpdate = Partial<
  Pick<
    BookingRow,
    | "bus_plate"
    | "driver_name"
    | "driver_phone"
    | "trip_status"
    | "progress_percent"
    | "current_lat"
    | "current_lng"
    | "note"
  >
>;

export async function updateBookingDispatch(
  supabase: DB,
  id: string,
  patch: DispatchUpdate
): Promise<{ error: string | null }> {
  const { error } = await supabase.from("bookings").update(patch).eq("id", id);
  return { error: error?.message ?? null };
}

// ---------------------------------------------------------------
// profiles
// ---------------------------------------------------------------

export async function getProfile(
  supabase: DB,
  userId: string
): Promise<ProfileRow | null> {
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  return data;
}

export type ProfilePatch = Partial<
  Pick<ProfileRow, "full_name" | "phone" | "affiliate_id" | "default_pickup">
>;

export async function updateProfile(
  supabase: DB,
  userId: string,
  patch: ProfilePatch
): Promise<{ error: string | null }> {
  const { error } = await supabase.from("profiles").update(patch).eq("id", userId);
  return { error: error?.message ?? null };
}

export type NotificationPrefsPatch = Partial<
  Pick<
    ProfileRow,
    "notify_trip_updates" | "notify_delivery_updates" | "notify_promotional" | "notify_sms"
  >
>;

export async function updateNotificationPrefs(
  supabase: DB,
  userId: string,
  patch: NotificationPrefsPatch
): Promise<{ error: string | null }> {
  const { error } = await supabase.from("profiles").update(patch).eq("id", userId);
  return { error: error?.message ?? null };
}

// ---------------------------------------------------------------
// notifications
// ---------------------------------------------------------------

export async function listNotifications(
  supabase: DB,
  userId: string
): Promise<NotificationRow[]> {
  const { data } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);
  return data ?? [];
}

export async function markNotificationRead(supabase: DB, id: string): Promise<void> {
  await supabase.from("notifications").update({ read: true }).eq("id", id);
}

export async function markAllNotificationsRead(
  supabase: DB,
  userId: string
): Promise<void> {
  await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", userId)
    .eq("read", false);
}

// ---------------------------------------------------------------
// live location (passenger's own GPS on a seat trip they're on)
// ---------------------------------------------------------------

export async function reportMyLocation(
  supabase: DB,
  bookingId: string,
  lat: number,
  lng: number
): Promise<void> {
  await supabase.rpc("update_my_location", {
    p_booking_id: bookingId,
    p_lat: lat,
    p_lng: lng,
  });
}
