"use client";

import { useState } from "react";
import { NEXT_STATUS, STATUS_LABEL, type TripOpsStatus } from "@/lib/admin-data";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { BookingRow } from "@/lib/supabase/database.types";
import { ArrowForwardIcon } from "@/components/icons";

const STATUS_STYLE: Record<TripOpsStatus, string> = {
  scheduled: "bg-white/5 text-[#8B96AC]",
  boarding: "bg-white/5 text-[#8B96AC]",
  in_transit: "bg-brand-500/15 text-brand-300",
  delayed: "bg-amber-500/15 text-amber-400",
  arrived: "bg-emerald-500/15 text-emerald-400",
  cancelled: "bg-red-500/15 text-red-400",
};

const ACTION_LABEL: Partial<Record<TripOpsStatus, string>> = {
  scheduled: "Start boarding",
  boarding: "Dispatch",
  in_transit: "Mark arrived",
  delayed: "Resume trip",
};

type Filter = "all" | "active" | "done";

export function TripsClient({ initial }: { initial: BookingRow[] }) {
  const [bookings, setBookings] = useState<BookingRow[]>(initial);
  const [filter, setFilter] = useState<Filter>("all");
  const [busy, setBusy] = useState<string | null>(null);

  async function patch(id: string, fields: Partial<BookingRow>) {
    setBusy(id);
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, ...fields } : b)));
    if (isSupabaseConfigured) {
      const supabase = createClient();
      await supabase.from("bookings").update(fields).eq("id", id);
    }
    setBusy(null);
  }

  async function advance(row: BookingRow) {
    const next = NEXT_STATUS[row.trip_status];
    if (!next) return;

    let bus_plate = row.bus_plate;
    let driver_name = row.driver_name;
    let driver_phone = row.driver_phone;

    // First move out of "scheduled" needs a bus assigned — ask once,
    // then it carries forward for the rest of this booking's trip.
    if (row.trip_status === "scheduled" && !bus_plate) {
      bus_plate = window.prompt("Bus plate number?", "LND-284-KJ") || row.bus_plate;
      driver_name = window.prompt("Driver name?", "") || row.driver_name;
      driver_phone = window.prompt("Driver phone?", "") || row.driver_phone;
      if (!bus_plate || !driver_name) return; // cancelled the prompt
    }

    await patch(row.id, {
      trip_status: next,
      progress_percent: next === "arrived" ? 100 : next === "in_transit" ? 10 : row.progress_percent,
      bus_plate,
      driver_name,
      driver_phone,
    });
  }

  function cancel(row: BookingRow) {
    patch(row.id, { trip_status: "cancelled" });
  }

  const filtered = bookings.filter((b) => {
    if (filter === "active")
      return b.trip_status === "in_transit" || b.trip_status === "delayed" || b.trip_status === "boarding";
    if (filter === "done") return b.trip_status === "arrived" || b.trip_status === "cancelled";
    return true;
  });

  return (
    <div className="px-6 py-6 md:px-8 md:py-8">
      <h1 className="text-xl font-semibold text-[#E7ECF5]">Trips</h1>
      <p className="mt-1 text-sm text-[#8B96AC]">
        Advance a booking&apos;s status here — it broadcasts live to that
        booking&apos;s Track page via Supabase Realtime.
      </p>

      {!isSupabaseConfigured && (
        <p className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-3 font-mono text-xs text-amber-400">
          Supabase isn&apos;t configured in this environment — nothing to
          dispatch.
        </p>
      )}

      <div className="mt-5 inline-flex rounded-lg border border-[#1F2A44] bg-[#121A2B] p-1 text-sm">
        {(["all", "active", "done"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-md px-3.5 py-1.5 font-medium capitalize ${
              filter === f ? "bg-brand-600 text-white" : "text-[#8B96AC]"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-[#1F2A44]">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[#1F2A44] bg-[#121A2B] font-mono text-[11px] uppercase tracking-wide text-[#8B96AC]">
              <th className="px-4 py-3 font-medium">Reference</th>
              <th className="px-4 py-3 font-medium">Route</th>
              <th className="px-4 py-3 font-medium">Bus / driver</th>
              <th className="px-4 py-3 font-medium">Seats / parcel</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Progress</th>
              <th className="px-4 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((b) => {
              const actionLabel = ACTION_LABEL[b.trip_status];
              const canProgress = b.trip_status === "in_transit" || b.trip_status === "delayed";
              return (
                <tr key={b.id} className="border-b border-[#1F2A44] bg-[#0B1220] last:border-0">
                  <td className="px-4 py-3.5 font-mono text-xs text-[#E7ECF5]">
                    {b.reference}
                  </td>
                  <td className="px-4 py-3.5 text-[#E7ECF5]">
                    <span className="flex items-center gap-1.5">
                      {b.from_city}
                      <ArrowForwardIcon className="h-3 w-3 text-[#8B96AC]" />
                      {b.to_city}
                    </span>
                    <span className="text-xs text-[#8B96AC]">
                      {new Date(b.created_at).toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-[#E7ECF5]">
                    <div className="font-mono text-xs">{b.bus_plate ?? "—"}</div>
                    <div className="text-xs text-[#8B96AC]">{b.driver_name ?? "Not assigned"}</div>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-xs tabular-nums text-[#E7ECF5]">
                    {b.kind === "seat" ? (b.seats ?? []).join(", ") || "—" : `Parcel · ${b.category ?? ""}`}
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLE[b.trip_status]}`}
                    >
                      {STATUS_LABEL[b.trip_status]}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    {canProgress ? (
                      <input
                        type="range"
                        min={0}
                        max={99}
                        value={b.progress_percent}
                        onChange={(e) => patch(b.id, { progress_percent: Number(e.target.value) })}
                        className="w-24 accent-brand-500"
                      />
                    ) : (
                      <span className="font-mono text-xs text-[#8B96AC]">{b.progress_percent}%</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      {actionLabel && (
                        <button
                          disabled={busy === b.id}
                          onClick={() => advance(b)}
                          className="rounded-md bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
                        >
                          {actionLabel}
                        </button>
                      )}
                      {b.trip_status !== "arrived" && b.trip_status !== "cancelled" && (
                        <button
                          disabled={busy === b.id}
                          onClick={() => cancel(b)}
                          className="rounded-md border border-[#1F2A44] px-3 py-1.5 text-xs font-medium text-[#8B96AC] hover:bg-white/5 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-[#8B96AC]">
                  No bookings yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
