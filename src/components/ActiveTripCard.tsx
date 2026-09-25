import Link from "next/link";
import type { TripView } from "@/lib/trip";
import { DirectionsBusIcon } from "@/components/icons";
import { LiveDot } from "@/components/LiveDot";

export function ActiveTripCard({ trip }: { trip: TripView | null }) {
  if (!trip) return <NoActiveTrip />;

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 md:p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-h3 text-neutral-900">Active trip</h3>
        <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
          <LiveDot color="bg-brand-600" />
          {trip.status}
        </span>
      </div>

      <p className="mt-4 text-h3 text-neutral-900">
        {trip.fromCity} <span className="text-neutral-400">———→</span> {trip.toCity}
      </p>

      <div className="mt-5 flex flex-wrap gap-x-8 gap-y-3">
        <Stat label="Departed" value={trip.departedAt} />
        <Stat label="ETA" value={trip.eta} />
        {trip.kind === "seat" ? (
          <Stat label="Seats" value={trip.seats.join(", ") || "—"} />
        ) : (
          <Stat label="Drop-off" value={trip.dropoff ?? "—"} />
        )}
        <Stat label="Bus" value={trip.bus} />
      </div>

      <div className="mt-5 h-2 rounded-full bg-neutral-100">
        <div
          className="h-2 rounded-full bg-brand-600 transition-[width] duration-700 ease-out"
          style={{ width: `${trip.progressPercent}%` }}
        />
      </div>

      <Link
        href={`/track?reference=${encodeURIComponent(trip.reference)}`}
        className="mt-5 inline-block rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700"
      >
        Track this trip
      </Link>
    </div>
  );
}

function NoActiveTrip() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-dashed border-brand-200 bg-gradient-to-br from-brand-50 via-white to-white p-6 text-center md:p-8">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand-600 text-white shadow-lg shadow-brand-600/20">
        <DirectionsBusIcon className="h-6 w-6" />
      </span>
      <h3 className="mt-4 text-h3 text-neutral-900">No active trips right now</h3>
      <p className="mx-auto mt-1.5 max-w-sm text-sm text-neutral-600">
        Book a seat or send a package and it&apos;ll show up right here,
        live, the moment it&apos;s confirmed.
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-caption text-neutral-600">{label}</div>
      <div className="text-[15px] font-semibold text-neutral-900">{value}</div>
    </div>
  );
}
