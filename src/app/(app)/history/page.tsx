import { redirect } from "next/navigation";
import { encodeBooking } from "@/lib/booking";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { createClient } from "@/lib/supabase/server";
import { listUserBookings, rowToBooking } from "@/lib/supabase/queries";
import type { BookingRow } from "@/lib/supabase/database.types";
import { MOCK_HISTORY, type TripStatus } from "@/lib/mock-data";
import { HistoryClient, type HistoryEntryWithHref } from "./HistoryClient";

function statusFor(row: BookingRow): TripStatus {
  if (row.trip_status === "cancelled") return "Cancelled";
  if (row.trip_status === "arrived") return row.kind === "package" ? "Delivered" : "Completed";
  return "In transit";
}

function detailFor(row: BookingRow): string {
  if (row.kind === "seat") {
    return `Seats ${(row.seats ?? []).join(", ")}`;
  }
  return `Parcel · ${row.category || row.description || "Package"}`;
}

function hrefFor(row: BookingRow): string {
  if (statusFor(row) === "In transit") {
    return `/track?reference=${encodeURIComponent(row.reference)}`;
  }
  const params = encodeBooking(rowToBooking(row));
  params.set("reference", row.reference);
  params.set("amount", String(row.amount_naira));
  params.set("paid", row.paid_status);
  return `/confirmation?${params.toString()}`;
}

function toHistoryEntry(row: BookingRow): HistoryEntryWithHref {
  return {
    reference: row.reference,
    kind: row.kind === "package" ? "delivery" : "trip",
    fromCity: row.from_city,
    toCity: row.to_city,
    date: new Date(row.created_at).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
    }),
    detail: detailFor(row),
    amountNaira: row.amount_naira,
    status: statusFor(row),
    href: hrefFor(row),
  };
}

export default async function HistoryPage() {
  if (!isSupabaseConfigured) {
    // No database configured at all — fall back to the original mock
    // history so the page still has something to show in that state,
    // same as it did before the database work.
    const entries: HistoryEntryWithHref[] = MOCK_HISTORY.map((e) => ({
      ...e,
      href: e.status === "In transit" ? "/track" : "/home",
    }));
    return <HistoryClient entries={entries} />;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const rows = await listUserBookings(supabase, user.id);
  const entries = rows.map(toHistoryEntry);

  return <HistoryClient entries={entries} />;
}
