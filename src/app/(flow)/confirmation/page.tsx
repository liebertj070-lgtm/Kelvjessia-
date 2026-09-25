import { redirect } from "next/navigation";
import Link from "next/link";
import { decodeBooking, encodeBooking } from "@/lib/booking";
import { getDestination, formatNaira, getRouteEndpoints } from "@/lib/routes-data";
import { PACKAGE_SIZES } from "@/lib/package-data";
import { MOCK_USER } from "@/lib/mock-data";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { createClient } from "@/lib/supabase/server";
import { CheckIcon } from "@/components/icons";
import { QrPlaceholder } from "@/components/flow/QrPlaceholder";

async function resolveIdentity() {
  if (!isSupabaseConfigured) {
    return { name: MOCK_USER.fullName, email: MOCK_USER.email };
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const name = (user?.user_metadata?.full_name as string | undefined) ?? MOCK_USER.fullName;
  const email = user?.email ?? MOCK_USER.email;
  return { name, email };
}

function fallbackReference(booking: { to: string }): string {
  const s = JSON.stringify(booking);
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return `KJ-${h.toString(36).toUpperCase().slice(0, 7)}`;
}

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const booking = decodeBooking(params);
  if (!booking) redirect("/home");

  const destination = getDestination(booking.to)!;
  const { fromCity, toCity } = getRouteEndpoints(destination, booking.direction);
  const { name, email } = await resolveIdentity();
  const reference = params.reference ?? fallbackReference(booking);
  const amount = Number(params.amount ?? 0);
  const paidLabel =
    params.paid === "pickup" ? "Due at pickup" : "Paid";

  // Carries the full booking (including direction) plus this trip's
  // reference/amount/paid status into Track Trip, so it can resolve the
  // same trip instead of always showing the one demo trip.
  const trackParams = encodeBooking(booking);
  trackParams.set("reference", reference);
  trackParams.set("amount", String(amount));
  if (params.paid) trackParams.set("paid", params.paid);
  const trackHref = `/track?${trackParams.toString()}`;

  return (
    <div className="mx-auto max-w-2xl px-5 py-10 text-center md:py-14">
      <span className="animate-success-ring mx-auto grid h-16 w-16 place-items-center rounded-full bg-success/15 text-success">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-success text-white">
          <CheckIcon className="animate-success-check h-7 w-7" />
        </span>
      </span>

      <h1 className="mt-5 text-2xl font-bold text-neutral-900 md:text-h1">
        {booking.kind === "seat" ? "Your seats are booked" : "Your package is booked"}
      </h1>
      <p className="mx-auto mt-2 max-w-md text-neutral-600">
        <span className="hidden md:inline">
          We sent a copy to {email} and your phone.{" "}
        </span>
        <span className="md:hidden">We sent a copy to your email and phone. </span>
        Show this {booking.kind === "seat" ? "ticket" : "code"} at the AUI main
        gate.
      </p>

      <div className="mt-6 overflow-hidden rounded-2xl border border-neutral-200 text-left">
        <div className="bg-gradient-to-r from-brand-700 to-brand-500 px-5 py-4 text-white md:px-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-white/80">
              {booking.kind === "seat" ? "Boarding ticket" : "Parcel receipt"}
            </span>
            <span className="text-xs font-semibold">{reference}</span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-lg font-bold md:text-xl">
            <span>{fromCity}</span>
            <span className="text-white/60">→</span>
            <span>{toCity}</span>
          </div>
        </div>

        <div className="bg-white p-5 md:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <QrPlaceholder seed={reference} />
            {booking.kind === "seat" ? (
              <div className="grid flex-1 grid-cols-2 gap-4 sm:grid-cols-4">
                <div>
                  <div className="text-xs text-neutral-500">Date</div>
                  <div className="mt-0.5 font-semibold text-neutral-900">
                    {booking.day}, {booking.date} Sep
                  </div>
                </div>
                <div>
                  <div className="text-xs text-neutral-500">Time</div>
                  <div className="mt-0.5 font-semibold text-neutral-900">
                    {booking.time}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-neutral-500">Seats</div>
                  <div className="mt-0.5 font-semibold text-neutral-900">
                    {booking.seats.join(", ")}
                  </div>
                </div>
                <div className="hidden sm:block">
                  <div className="text-xs text-neutral-500">Bus</div>
                  <div className="mt-0.5 font-semibold text-neutral-900">KJ-04</div>
                </div>
                <div>
                  <div className="text-xs text-neutral-500">Passenger</div>
                  <div className="mt-0.5 font-semibold text-neutral-900">{name}</div>
                </div>
                <div className="hidden sm:block">
                  <div className="text-xs text-neutral-500">Pickup</div>
                  <div className="mt-0.5 font-semibold text-neutral-900">
                    AUI Main Gate
                  </div>
                </div>
                <div>
                  <div className="text-xs text-neutral-500">{paidLabel}</div>
                  <div className="mt-0.5 font-semibold text-neutral-900">
                    {formatNaira(amount)}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid flex-1 grid-cols-2 gap-4 sm:grid-cols-4">
                <div>
                  <div className="text-xs text-neutral-500">Recipient</div>
                  <div className="mt-0.5 font-semibold text-neutral-900">
                    {booking.recipientName}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-neutral-500">Size</div>
                  <div className="mt-0.5 font-semibold text-neutral-900">
                    {PACKAGE_SIZES.find((s) => s.id === booking.size)?.label}
                  </div>
                </div>
                <div className="hidden sm:block">
                  <div className="text-xs text-neutral-500">Drop-off</div>
                  <div className="mt-0.5 font-semibold text-neutral-900">
                    {booking.dropoff}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-neutral-500">Sender</div>
                  <div className="mt-0.5 font-semibold text-neutral-900">{name}</div>
                </div>
                <div>
                  <div className="text-xs text-neutral-500">{paidLabel}</div>
                  <div className="mt-0.5 font-semibold text-neutral-900">
                    {formatNaira(amount)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile: Track full-width, Download + Share split below */}
      <div className="mt-5 space-y-3 md:hidden">
        <Link
          href={trackHref}
          className="block rounded-lg bg-brand-600 py-3.5 text-center text-sm font-semibold text-white hover:bg-brand-700"
        >
          Track this trip
        </Link>
        <div className="flex gap-3">
          <button className="flex-1 rounded-lg border border-neutral-200 bg-white py-3.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50">
            Download
          </button>
          <button className="flex-1 rounded-lg border border-neutral-200 bg-white py-3.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50">
            Share
          </button>
        </div>
      </div>

      {/* Desktop: 4 equal-width buttons in one row */}
      <div className="mt-5 hidden gap-3 md:flex">
        <Link
          href={trackHref}
          className="flex-1 rounded-lg bg-brand-600 py-3.5 text-center text-sm font-semibold text-white hover:bg-brand-700"
        >
          Track this trip
        </Link>
        <button className="flex-1 rounded-lg border border-neutral-200 bg-white py-3.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50">
          Download ticket
        </button>
        <button className="flex-1 rounded-lg border border-neutral-200 bg-white py-3.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50">
          Share
        </button>
        <Link
          href="/home"
          className="flex-1 rounded-lg border border-neutral-200 bg-white py-3.5 text-center text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
        >
          Go to home
        </Link>
      </div>

      <p className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-800">
        <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />
        <span className="hidden md:inline">
          Arrive 15 minutes before departure. Dispatch will call you if the
          bus is running late.
        </span>
        <span className="md:hidden">Arrive 15 minutes before departure.</span>
      </p>
    </div>
  );
}
