"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getDestination, formatNaira, getRouteEndpoints, type Direction } from "@/lib/routes-data";
import { encodeBooking } from "@/lib/booking";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { getTakenSeats } from "@/lib/supabase/queries";
import { Stepper } from "@/components/flow/Stepper";
import { FlowMobileHeader } from "@/components/flow/FlowMobileHeader";
import { RouteChip } from "@/components/flow/RouteChip";
import { SeatMap } from "@/components/flow/SeatMap";

const DATE_OPTIONS = [
  { day: "Wed", date: 16 },
  { day: "Thu", date: 17 },
  { day: "Fri", date: 18 },
  { day: "Sat", date: 19 },
  { day: "Sun", date: 20 },
  { day: "Mon", date: 21 },
];

const TIME_OPTIONS = [
  { time: "7:00 AM", seatsLeft: 12 },
  { time: "10:00 AM", seatsLeft: 6 },
  { time: "2:00 PM", seatsLeft: 11 },
  { time: "5:00 PM", soldOut: true },
];

// Only the demo fallback now (Supabase not configured) — real
// availability for a route/day/time comes from the booking_seats table,
// fetched below whenever the date or time selection changes.
const SEAT_ROWS = ["A", "B", "C", "D", "E", "F"];
const MOCK_TAKEN_SEATS = ["A2", "B1", "C3", "D4", "E1"];

export function BookSeatClient({
  destinationSlug,
  direction,
}: {
  destinationSlug: string;
  direction: Direction;
}) {
  const destination = getDestination(destinationSlug)!;
  const { fromCity, toCity } = getRouteEndpoints(destination, direction);
  const router = useRouter();

  const [dateIndex, setDateIndex] = useState(2); // Fri 18
  const [timeIndex, setTimeIndex] = useState(1); // 10:00 AM
  const [selectedSeats, setSelectedSeats] = useState<string[]>(["B3", "B4"]);
  const [takenSeats, setTakenSeats] = useState<string[]>(MOCK_TAKEN_SEATS);
  const [loadingSeats, setLoadingSeats] = useState(isSupabaseConfigured);

  const date = String(DATE_OPTIONS[dateIndex].date);
  const time = TIME_OPTIONS[timeIndex].time;

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;

    getTakenSeats(createClient(), {
      destinationSlug: destination.slug,
      direction,
      date,
      time,
    }).then((taken) => {
      if (cancelled) return;
      setTakenSeats(taken);
      // Someone else may have just taken a seat this person had selected
      // before switching date/time — drop it from their selection rather
      // than letting them submit a seat that's no longer available.
      setSelectedSeats((prev) => prev.filter((s) => !taken.includes(s)));
      setLoadingSeats(false);
    });

    return () => {
      cancelled = true;
    };
  }, [destination.slug, direction, date, time]);

  // Setting loadingSeats lives in these handlers (the effect above only
  // ever clears it once the fetch resolves) rather than at the top of
  // the effect itself, since setState synchronously inside an effect
  // body triggers an avoidable extra render.
  function selectDate(i: number) {
    setDateIndex(i);
    if (isSupabaseConfigured) setLoadingSeats(true);
  }
  function selectTime(i: number) {
    setTimeIndex(i);
    if (isSupabaseConfigured) setLoadingSeats(true);
  }

  function toggleSeat(id: string) {
    if (takenSeats.includes(id)) return;
    setSelectedSeats((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  const total = destination.fareNaira * selectedSeats.length;
  const canContinue = selectedSeats.length > 0 && !loadingSeats;

  function handleContinue() {
    if (!canContinue) return;
    const params = encodeBooking({
      kind: "seat",
      to: destination.slug,
      direction,
      seats: selectedSeats,
      passengers: selectedSeats.length,
      day: DATE_OPTIONS[dateIndex].day,
      date,
      time,
    });
    router.push(`/fare-summary?${params.toString()}`);
  }

  return (
    <>
      <FlowMobileHeader
        title="Book a seat"
        backHref={`/select-route?to=${destination.slug}&mode=seat&dir=${direction}`}
      />
      <RouteChip from={fromCity} to={toCity} />

      <div className="mx-auto max-w-6xl px-5 py-6 pb-40 md:px-10 md:py-8 md:pb-8">
        <div className="hidden md:block">
          <h1 className="text-h1 text-neutral-900">
            Book a seat · {fromCity} → {toCity}
          </h1>
          <p className="mt-1 text-neutral-600">
            Choose your departure, how many are travelling, and where you
            want to sit.
          </p>
        </div>

        <div className="mt-4 md:mt-8">
          <Stepper currentStep={2} />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:mt-8 md:grid-cols-[1fr_420px]">
          {/* Left column */}
          <div className="space-y-4 md:space-y-6">
            <div className="rounded-2xl bg-white p-4 md:p-6">
              <h2 className="text-sm font-semibold text-neutral-900 md:text-base">
                Departure date
              </h2>
              <div className="mt-3 grid grid-cols-5 gap-2 md:grid-cols-6">
                {DATE_OPTIONS.map((d, i) => {
                  const isMobileHidden = i === 5;
                  const active = i === dateIndex;
                  return (
                    <button
                      key={d.date}
                      type="button"
                      onClick={() => selectDate(i)}
                      className={`rounded-lg border p-2.5 text-center ${
                        isMobileHidden ? "hidden md:block" : ""
                      } ${
                        active
                          ? "border-brand-600 bg-brand-600 text-white"
                          : "border-neutral-200 bg-white text-neutral-700 hover:border-brand-300"
                      }`}
                    >
                      <div className="text-[11px] opacity-80">{d.day}</div>
                      <div className="text-sm font-bold">{d.date}</div>
                    </button>
                  );
                })}
              </div>

              <h2 className="mt-6 text-sm font-semibold text-neutral-900 md:text-base">
                Departure time
              </h2>
              <div className="mt-3 grid grid-cols-3 gap-2 md:grid-cols-4">
                {TIME_OPTIONS.map((t, i) => {
                  const isMobileHidden = i === 3;
                  const active = i === timeIndex;
                  const disabled = "soldOut" in t && t.soldOut;
                  return (
                    <button
                      key={t.time}
                      type="button"
                      disabled={disabled}
                      onClick={() => selectTime(i)}
                      className={`rounded-lg border p-2.5 text-center ${
                        isMobileHidden ? "hidden md:block" : ""
                      } ${
                        disabled
                          ? "cursor-not-allowed border-neutral-100 bg-neutral-50 text-neutral-300"
                          : active
                          ? "border-brand-600 text-brand-600 ring-1 ring-brand-600"
                          : "border-neutral-200 text-neutral-700 hover:border-brand-300"
                      }`}
                    >
                      <div className="text-sm font-semibold">{t.time}</div>
                      <div className="text-[11px] opacity-70">
                        {disabled ? "Sold out" : `${t.seatsLeft} seats`}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl bg-white p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-neutral-900 md:text-base">
                    Passengers
                  </h2>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    Each passenger needs their own seat — select seats above
                  </p>
                </div>
                <span className="text-base font-bold text-neutral-900">
                  {selectedSeats.length || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Right column: seat map */}
          <div className="rounded-2xl bg-white p-4 md:p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-neutral-900 md:text-base">
                Choose your seats
              </h2>
              <span className="text-xs text-neutral-500">
                {loadingSeats ? "Checking availability…" : "Bus KJ-04"}
              </span>
            </div>

            {/* Unified A–F / Available-Selected-Taken on both breakpoints —
                client decided against per-breakpoint seat maps. Taken
                seats now come from real bookings for this exact
                route/day/time, not a static mock list. */}
            <div className="mt-3">
              <SeatMap
                rows={SEAT_ROWS}
                taken={takenSeats}
                selected={selectedSeats}
                onToggle={toggleSeat}
                legendLabels={{
                  available: "Available",
                  selected: "Selected",
                  taken: "Taken",
                }}
                showDriver
              />
            </div>

            <div className="mt-4 flex items-center justify-between rounded-xl bg-brand-50 px-4 py-3">
              <span className="text-sm font-medium text-neutral-700">
                {selectedSeats.length > 0
                  ? `Selected: ${selectedSeats.join(", ")}`
                  : "No seats selected"}
              </span>
              <span className="text-base font-bold text-brand-700">
                {formatNaira(total)}
              </span>
            </div>
          </div>
        </div>

        {/* Desktop footer buttons */}
        <div className="mt-6 hidden items-center justify-between md:flex">
          <Link
            href={`/select-route?to=${destination.slug}&mode=seat&dir=${direction}`}
            className="rounded-lg border border-neutral-200 bg-white px-6 py-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
          >
            Back to routes
          </Link>
          <button
            type="button"
            onClick={handleContinue}
            disabled={!canContinue}
            className="rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Continue to summary
          </button>
        </div>
      </div>

      {/* Mobile sticky CTA */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-neutral-200 bg-white p-4 md:hidden">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-neutral-600">
            {selectedSeats.length > 0
              ? `Seats ${selectedSeats.join(", ")}`
              : "No seats selected"}
          </span>
          <span className="font-bold text-brand-700">{formatNaira(total)}</span>
        </div>
        <button
          type="button"
          onClick={handleContinue}
          disabled={!canContinue}
          className="w-full rounded-lg bg-brand-600 py-3.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          Continue to summary
        </button>
      </div>
    </>
  );
}
