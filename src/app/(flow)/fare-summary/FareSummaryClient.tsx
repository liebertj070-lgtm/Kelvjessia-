"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type Booking,
  encodeBooking,
  computePrice,
  applyPromoCode,
  COMMUNITY_DISCOUNT_LABEL,
  COMMUNITY_DISCOUNT_SUBLABEL,
} from "@/lib/booking";
import { getDestination, formatNaira, getRouteEndpoints } from "@/lib/routes-data";
import { PACKAGE_SIZES } from "@/lib/package-data";
import { Stepper } from "@/components/flow/Stepper";
import { FlowMobileHeader } from "@/components/flow/FlowMobileHeader";
import { ArrowForwardIcon } from "@/components/icons";

const WEEKDAY: Record<string, string> = {
  Wed: "Wednesday",
  Thu: "Thursday",
  Fri: "Friday",
  Sat: "Saturday",
  Sun: "Sunday",
  Mon: "Monday",
};

export function FareSummaryClient({ booking }: { booking: Booking }) {
  const destination = getDestination(booking.to)!;
  const { fromCity, toCity } = getRouteEndpoints(destination, booking.direction);
  const router = useRouter();
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);

  const price = computePrice(booking, appliedPromo);

  function handleApplyPromo() {
    if (!promoInput.trim()) return;
    const discount = applyPromoCode(promoInput);
    if (discount === null) {
      setPromoError("That code isn't valid.");
      setAppliedPromo(null);
    } else {
      setPromoError(null);
      setAppliedPromo(promoInput.trim().toUpperCase());
    }
  }

  function handleProceed() {
    const params = encodeBooking(booking);
    if (appliedPromo) params.set("promo", appliedPromo);
    router.push(`/payment?${params.toString()}`);
  }

  const editHref =
    booking.kind === "seat"
      ? `/book-seat?to=${booking.to}&dir=${booking.direction}`
      : `/send-package?to=${booking.to}&dir=${booking.direction}`;

  return (
    <>
      <FlowMobileHeader title="Review your trip" backHref={editHref} />

      <div className="mx-auto max-w-3xl px-5 py-6 pb-8 md:px-10 md:py-8">
        <div className="hidden md:block">
          <h1 className="text-h1 text-neutral-900">Review your trip</h1>
          <p className="mt-1 text-neutral-600">
            Check everything looks right before you pay.
          </p>
        </div>

        <div className="mt-4 hidden md:block md:mt-8">
          <Stepper currentStep={3} />
        </div>

        {/* Trip card */}
        <div className="mt-6 rounded-2xl bg-white p-4 md:mt-8 md:p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 text-lg font-bold text-neutral-900 md:text-xl">
                <span>{fromCity}</span>
                <ArrowForwardIcon className="h-4 w-4 text-brand-300" />
                <span>{toCity}</span>
              </div>
              <div className="mt-1 text-sm text-neutral-600">
                {booking.kind === "seat" ? (
                  <>
                    <span className="md:hidden">
                      {booking.day}, {booking.date} Sep · {booking.time} · Bus KJ-04
                    </span>
                    <span className="hidden md:inline">
                      {WEEKDAY[booking.day] ?? booking.day}, {booking.date}{" "}
                      September 2026 · {booking.time} · Bus KJ-04
                    </span>
                  </>
                ) : (
                  <span>Package pickup, next available departure</span>
                )}
              </div>
            </div>
            <span className="hidden shrink-0 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 md:inline-block">
              {booking.kind === "seat" ? "Passenger booking" : "Package booking"}
            </span>
          </div>

          <div className="mt-4 border-t border-neutral-100 pt-4">
            {booking.kind === "seat" ? (
              <div className="grid grid-cols-3 gap-4 md:grid-cols-4">
                <div>
                  <div className="text-xs text-neutral-500">Passengers</div>
                  <div className="mt-0.5 font-semibold text-neutral-900">
                    {booking.passengers} adult{booking.passengers > 1 ? "s" : ""}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-neutral-500">Seats</div>
                  <div className="mt-0.5 font-semibold text-neutral-900">
                    {booking.seats.join(", ")}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-neutral-500">Pickup</div>
                  <div className="mt-0.5 font-semibold text-neutral-900">
                    {booking.direction === "outbound" ? "AUI Gate" : `${fromCity} Phase 1 Roundabout`}
                  </div>
                </div>
                <div className="hidden md:block">
                  <div className="text-xs text-neutral-500">Drop-off</div>
                  <div className="mt-0.5 font-semibold text-neutral-900">
                    {booking.direction === "outbound" ? `${toCity} Phase 1 Roundabout` : "AUI Gate"}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div>
                  <div className="text-xs text-neutral-500">Recipient</div>
                  <div className="mt-0.5 font-semibold text-neutral-900">
                    {booking.recipientName || "—"}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-neutral-500">Size</div>
                  <div className="mt-0.5 font-semibold text-neutral-900">
                    {PACKAGE_SIZES.find((s) => s.id === booking.size)?.label}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-neutral-500">Pickup</div>
                  <div className="mt-0.5 font-semibold text-neutral-900">
                    {booking.pickup || "AUI Gate"}
                  </div>
                </div>
                <div className="hidden md:block">
                  <div className="text-xs text-neutral-500">Drop-off</div>
                  <div className="mt-0.5 font-semibold text-neutral-900">
                    {booking.dropoff || "—"}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Price breakdown */}
        <div className="mt-4 rounded-2xl bg-white p-4 md:mt-6 md:p-6">
          <h2 className="text-base font-semibold text-neutral-900">
            Price breakdown
          </h2>
          <div className="mt-4 space-y-3 text-sm">
            {price.lines.map((line) => (
              <div key={line.label} className="flex items-start justify-between">
                <div>
                  <div className="text-neutral-700">{line.label}</div>
                  {line.sublabel && (
                    <div className="text-xs text-neutral-400">{line.sublabel}</div>
                  )}
                </div>
                <span className="text-neutral-700">
                  {formatNaira(line.amountNaira)}
                </span>
              </div>
            ))}
            <div className="flex items-start justify-between">
              <span className="text-neutral-700">Booking fee</span>
              <span className="text-neutral-700">
                {formatNaira(price.bookingFee)}
              </span>
            </div>
            <div className="flex items-start justify-between">
              <div>
                <div className="text-neutral-700">{COMMUNITY_DISCOUNT_LABEL}</div>
                <div className="hidden text-xs text-neutral-400 md:block">
                  {COMMUNITY_DISCOUNT_SUBLABEL}
                </div>
              </div>
              <span className="text-success">
                − {formatNaira(price.communityDiscount)}
              </span>
            </div>
            {appliedPromo && (
              <div className="flex items-start justify-between">
                <span className="text-neutral-700">Promo ({appliedPromo})</span>
                <span className="text-success">
                  − {formatNaira(price.promoDiscount)}
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 rounded-lg bg-neutral-100 p-1.5">
              <input
                type="text"
                value={promoInput}
                onChange={(e) => {
                  setPromoInput(e.target.value);
                  setPromoError(null);
                }}
                placeholder={
                  appliedPromo ? "Code applied" : "Have a promo code?"
                }
                disabled={!!appliedPromo}
                className="flex-1 bg-transparent px-3 py-1.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none disabled:text-neutral-400"
              />
              <button
                type="button"
                onClick={handleApplyPromo}
                disabled={!!appliedPromo}
                className="rounded-md bg-white px-4 py-1.5 text-sm font-semibold text-brand-700 shadow-sm disabled:opacity-50"
              >
                Apply
              </button>
            </div>
            {promoError && (
              <p className="text-xs text-red-600">{promoError}</p>
            )}

            <div className="border-t border-neutral-200 pt-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-neutral-900">Total due</div>
                  <div className="hidden text-xs text-neutral-400 md:block">
                    Includes all fees
                  </div>
                </div>
                <span className="text-xl font-bold text-brand-700">
                  {formatNaira(price.total)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 md:mt-6 md:flex-row md:items-center md:justify-between">
          <Link
            href={editHref}
            className="order-2 rounded-lg border border-neutral-200 bg-white px-6 py-3 text-center text-sm font-semibold text-neutral-700 hover:bg-neutral-50 md:order-1"
          >
            Edit booking
          </Link>
          <button
            type="button"
            onClick={handleProceed}
            className="order-1 rounded-lg bg-brand-600 px-6 py-3.5 text-sm font-semibold text-white hover:bg-brand-700 md:order-2"
          >
            Proceed to payment
          </button>
        </div>
      </div>
    </>
  );
}
