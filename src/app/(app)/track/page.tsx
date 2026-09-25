import Link from "next/link";
import { formatNaira } from "@/lib/routes-data";
import { resolveTripView, tripViewFromRow } from "@/lib/trip";
import { WHATSAPP_URL, EMERGENCY_PHONE } from "@/lib/contact";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { createClient } from "@/lib/supabase/server";
import { getLatestActiveBooking } from "@/lib/supabase/queries";
import { FlowMobileHeader } from "@/components/flow/FlowMobileHeader";
import { TripMap } from "@/components/flow/TripMap";
import { TrackLiveUpdater } from "@/components/flow/TrackLiveUpdater";
import { ShareMyLocation } from "@/components/flow/ShareMyLocation";
import { LiveDot } from "@/components/LiveDot";
import { CheckIcon, DirectionsBusIcon } from "@/components/icons";

export default async function TrackPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const supabase = isSupabaseConfigured ? await createClient() : null;
  let trip = await resolveTripView(supabase, params);

  // No reference on the URL at all (the bare nav Track tab, not a link
  // from Confirmation/History/a notification) — rather than always
  // showing the empty state here, fall back to whatever the signed-in
  // user's own latest active booking is, same as Home's Active Trip
  // card. This is the fix for Track staying stuck on "nothing to track
  // yet" after someone actually books something and taps the nav tab
  // instead of following a link that already carries the reference.
  if (!trip && supabase && !params.reference) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const row = await getLatestActiveBooking(supabase, user.id);
      if (row) trip = tripViewFromRow(row);
    }
  }

  if (!trip) {
    return (
      <>
        <FlowMobileHeader title="Track" backHref="/home" />
        <div className="mx-auto flex max-w-md flex-col items-center px-5 py-16 text-center md:py-24">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-brand-50 text-brand-600">
            <DirectionsBusIcon className="h-7 w-7" />
          </span>
          <h1 className="mt-5 text-xl font-bold text-neutral-900 md:text-h1">
            Nothing to track yet
          </h1>
          <p className="mt-2 text-neutral-600">
            You don&apos;t have a trip or delivery in progress right now.
            Book a seat or send a package and you&apos;ll be able to follow
            it live here.
          </p>
          <div className="mt-6 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/select-route?mode=seat"
              className="rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Book a ride
            </Link>
            <Link
              href="/select-route?mode=package"
              className="rounded-lg border border-neutral-200 bg-white px-6 py-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
            >
              Send a package
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {trip.id && <TrackLiveUpdater bookingId={trip.id} />}
      <FlowMobileHeader title={`Tracking ${trip.reference}`} backHref="/home" />

      <div className="mx-auto max-w-6xl px-5 py-6 md:px-10 md:py-8">
        <div className="hidden items-start justify-between md:flex">
          <div>
            <h1 className="text-h1 text-neutral-900">
              Tracking {trip.reference}
            </h1>
            <p className="mt-1 text-neutral-600">
              {trip.fromCity} → {trip.toCity} · {trip.departedAt}
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-success/10 px-3 py-1.5 text-sm font-semibold text-success">
            <LiveDot />
            Live · {trip.status}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-6 md:mt-6 md:grid-cols-[1fr_360px]">
          {/* Left column */}
          <div className="space-y-4 md:space-y-6">
            <div className="relative h-72 overflow-hidden rounded-2xl md:h-96">
              <TripMap
                origin={trip.fromCoords}
                destination={trip.toCoords}
                progressPercent={trip.progressPercent}
                currentPosition={trip.currentPosition}
              />
              <div className="absolute left-3 top-3 rounded-xl bg-white px-4 py-2.5 shadow-md">
                <div className="text-[10px] font-medium uppercase tracking-wide text-neutral-500">
                  Arriving in
                </div>
                <div className="text-base font-bold text-neutral-900">
                  {trip.arrivingInMinutes} minutes
                </div>
              </div>
              <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-success shadow-md md:hidden">
                <LiveDot />
                Live
              </span>
            </div>

            <div className="rounded-2xl bg-white p-4 md:p-6">
              <h2 className="text-base font-semibold text-neutral-900">
                Trip status
              </h2>
              <ol className="mt-4">
                {trip.timeline.map((step, i) => (
                  <li key={step.label} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <span
                        className={`grid h-6 w-6 shrink-0 place-items-center rounded-full ${
                          step.done
                            ? "bg-success text-white"
                            : step.active
                            ? "bg-brand-600 text-white"
                            : "border-2 border-neutral-200 bg-white"
                        }`}
                      >
                        {step.done && <CheckIcon className="h-3.5 w-3.5" />}
                        {step.active && (
                          <span className="h-2 w-2 rounded-full bg-white" />
                        )}
                      </span>
                      {i < trip.timeline.length - 1 && (
                        <span
                          className={`w-0.5 flex-1 ${
                            step.done ? "bg-success" : "bg-neutral-200"
                          }`}
                          style={{ minHeight: 28 }}
                        />
                      )}
                    </div>
                    <div className="pb-5">
                      <div
                        className={`text-sm font-semibold ${
                          step.done || step.active
                            ? "text-neutral-900"
                            : "text-neutral-400"
                        }`}
                      >
                        {step.label}
                      </div>
                      <div
                        className={`text-xs ${
                          step.done || step.active
                            ? "text-neutral-500"
                            : "text-neutral-300"
                        }`}
                      >
                        {step.time}
                        {step.detail ? ` · ${step.detail}` : ""}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-4 md:space-y-6">
            {trip.kind === "seat" && trip.id && <ShareMyLocation bookingId={trip.id} />}

            <div className="rounded-2xl bg-white p-4 md:p-6">
              <h2 className="text-base font-semibold text-neutral-900">
                Your driver
              </h2>
              <div className="mt-3 flex items-center gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
                  {trip.driver.initials}
                </span>
                <div>
                  <div className="font-semibold text-neutral-900">
                    {trip.driver.name}
                  </div>
                  <div className="text-xs text-neutral-500">
                    {trip.driver.vehicle} · {trip.driver.plate}
                  </div>
                </div>
              </div>
              <div className="mt-4 flex gap-3">
                <a
                  href={`tel:${trip.driver.phone}`}
                  className="flex-1 rounded-lg bg-brand-50 py-2.5 text-center text-sm font-semibold text-brand-700 hover:bg-brand-100"
                >
                  Call driver
                </a>
                <a
                  href={`sms:${trip.driver.phone}`}
                  className="flex-1 rounded-lg border border-neutral-200 py-2.5 text-center text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
                >
                  Message
                </a>
              </div>
            </div>

            {/* Booking details — now shown on mobile too, per client decision */}
            <div className="rounded-2xl bg-white p-4 md:p-6">
              <h2 className="text-base font-semibold text-neutral-900">
                Booking details
              </h2>
              <div className="mt-3 space-y-2.5 text-sm">
                <Row label="Reference" value={trip.reference} />
                {trip.kind === "seat" ? (
                  <>
                    <Row label="Seats" value={trip.seats.join(", ")} />
                    <Row
                      label="Passengers"
                      value={`${trip.passengers} adult${trip.passengers > 1 ? "s" : ""}`}
                    />
                  </>
                ) : (
                  trip.dropoff && <Row label="Drop-off" value={trip.dropoff} />
                )}
                <Row label="Pickup" value={trip.pickup} />
                <Row
                  label="Amount paid"
                  value={formatNaira(trip.amountPaidNaira)}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-red-100 bg-red-50 p-4 md:p-6">
              <h2 className="text-base font-semibold text-red-700">
                Emergency
              </h2>
              <p className="mt-1.5 text-sm text-red-700/80">
                If something is wrong on this trip, reach dispatch
                immediately.
              </p>
              <div className="mt-4 space-y-2.5">
                <a
                  href={`tel:${EMERGENCY_PHONE}`}
                  className="block rounded-lg border border-red-200 bg-white py-2.5 text-center text-sm font-semibold text-red-700 hover:bg-red-50"
                >
                  Call emergency line
                </a>
                {/* Desktop only, per the mobile screenshot */}
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden rounded-lg border border-red-200 bg-white py-2.5 text-center text-sm font-semibold text-red-700 hover:bg-red-50 md:block"
                >
                  WhatsApp support
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-neutral-500">{label}</span>
      <span className="font-semibold text-neutral-900">{value}</span>
    </div>
  );
}
