"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DESTINATIONS, ORIGIN } from "@/lib/routes-data";

type BookingMode = "seat" | "package";

function Field({
  label,
  value,
  placeholder,
  className = "",
}: {
  label: string;
  value?: string;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={`flex flex-col justify-center gap-1 px-4 py-2 ${className}`}>
      <span className="text-[11px] font-medium uppercase tracking-wide text-neutral-600">
        {label}
      </span>
      <span
        className={`text-[15px] font-medium ${
          value ? "text-neutral-900" : "text-neutral-400"
        }`}
      >
        {value ?? placeholder}
      </span>
    </div>
  );
}

/**
 * variant "landing": PASSENGERS field, "Search trips" button, swap icon on
 * desktop only (mobile has no swap control here — Select Route has its own
 * explicit "Swap direction" row instead).
 * variant "home": SEATS field on desktop, no date/seat row at all on mobile
 * (per §3.7 — Home's mobile widget is FROM / TO / Search only).
 */
export function BookingWidget({
  variant = "landing",
  destinationSlug,
}: {
  variant?: "landing" | "home";
  destinationSlug?: string;
}) {
  const [mode, setMode] = useState<BookingMode>("seat");
  const router = useRouter();
  const destination = destinationSlug
    ? DESTINATIONS.find((d) => d.slug === destinationSlug)
    : undefined;

  const searchLabel = variant === "landing" ? "Search trips" : "Search";
  const countLabel = variant === "landing" ? "PASSENGERS" : "SEATS";
  const countValue = variant === "landing" ? "2 seats" : "2";

  function handleSearch() {
    if (variant === "landing") {
      // No account yet on the landing page — this is the funnel into
      // signing up, not into the booking flow directly.
      router.push("/login");
      return;
    }
    // Home: no destination has actually been chosen in this widget yet
    // (the To field is a static display here, not a real picker), so
    // this lands on book-seat/send-package with none set — which is
    // exactly what already sends someone on to Select Route to choose
    // one, per those pages' own existing redirect.
    const target = mode === "seat" ? "/book-seat" : "/send-package";
    router.push(destination ? `${target}?to=${destination.slug}` : target);
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm md:p-6">
      <div className="mb-4 inline-flex rounded-full bg-neutral-100 p-1 text-sm font-medium">
        <button
          type="button"
          onClick={() => setMode("seat")}
          className={`rounded-full px-4 py-2 ${
            mode === "seat" ? "bg-brand-600 text-white" : "text-neutral-600"
          }`}
        >
          Book a seat
        </button>
        <button
          type="button"
          onClick={() => setMode("package")}
          className={`rounded-full px-4 py-2 ${
            mode === "package" ? "bg-brand-600 text-white" : "text-neutral-600"
          }`}
        >
          Send a package
        </button>
      </div>

      <div className="flex flex-col divide-y divide-neutral-200 rounded-xl border border-neutral-200 md:flex-row md:items-center md:divide-x md:divide-y-0">
        <Field label="From" value={ORIGIN.label} className="md:flex-1" />

        <div className="hidden shrink-0 place-items-center px-2 md:grid">
          <span
            aria-hidden
            className="grid h-10 w-10 place-items-center rounded-full border border-neutral-200 text-neutral-600"
          >
            ⇄
          </span>
        </div>

        <Field
          label="To"
          value={destination?.city}
          placeholder="Select destination"
          className="md:flex-1"
        />

        {/* Landing shows Date + count at both breakpoints; Home shows them
            on desktop only (mobile Home widget is FROM/TO/Search). */}
        <div
          className={`${
            variant === "landing" ? "flex" : "hidden md:flex"
          } divide-x divide-neutral-200 md:contents`}
        >
          <Field label="Date" value="Fri, 18 Sep" className="flex-1 md:flex-none md:w-44" />
          <Field label={countLabel} value={countValue} className="flex-1 md:flex-none md:w-32" />
        </div>

        <div className="p-2 md:pl-0">
          <button
            type="button"
            onClick={handleSearch}
            className="w-full rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700 md:w-auto"
          >
            {searchLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
