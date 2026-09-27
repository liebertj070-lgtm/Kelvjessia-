"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DESTINATIONS, ORIGIN, formatDuration, formatNaira } from "@/lib/routes-data";
import { Stepper } from "@/components/flow/Stepper";
import { FlowMobileHeader } from "@/components/flow/FlowMobileHeader";
import { CheckIcon, SwapHorizIcon } from "@/components/icons";

export function SelectRouteClient({
  initialTo,
  initialReversed,
  mode,
}: {
  initialTo?: string;
  initialReversed?: boolean;
  mode: "seat" | "package";
}) {
  const [toSlug, setToSlug] = useState<string | undefined>(initialTo);
  const [reversed, setReversed] = useState(initialReversed ?? false);
  const router = useRouter();

  const selected = DESTINATIONS.find((d) => d.slug === toSlug);
  const nextHref = mode === "seat" ? "/book-seat" : "/send-package";
  const continueLabel =
    mode === "seat" ? "Continue to seats" : "Continue to package details";

  function handleContinue() {
    if (!toSlug) return;
    const dir = reversed ? "return" : "outbound";
    router.push(`${nextHref}?to=${toSlug}&dir=${dir}`);
  }

  return (
    <>
      <FlowMobileHeader title="Select route" backHref="/home" />

      <div className="mx-auto max-w-6xl px-5 py-6 pb-28 md:px-10 md:py-8 md:pb-8">
        <div className="hidden md:block">
          <h1 className="text-h1 text-neutral-900">Select your route</h1>
          <p className="mt-1 text-neutral-600">
            Pick where you are going. Tap the swap arrow to travel back to
            Ilara-Epe.
          </p>
        </div>

        <div className="mt-4 md:mt-8">
          <Stepper currentStep={1} />
        </div>

        <div className="mt-6 rounded-2xl bg-white p-4 md:mt-8 md:p-6">
          {/* Desktop: FROM / swap / TO row */}
          <div className="hidden items-center gap-4 md:flex">
            <div className="flex-1 rounded-xl bg-brand-50 px-5 py-3.5">
              <div className="text-[11px] font-medium uppercase tracking-wide text-brand-700">
                From
              </div>
              <div className="mt-1 text-[15px] font-semibold text-neutral-900">
                {reversed ? selected?.city ?? "Select destination" : ORIGIN.full}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setReversed((r) => !r)}
              aria-label="Swap direction"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-600 text-white hover:bg-brand-700"
            >
              <SwapHorizIcon className="h-5 w-5" />
            </button>
            <div className="flex-1 rounded-xl border border-neutral-200 px-5 py-3.5">
              <div className="text-[11px] font-medium uppercase tracking-wide text-neutral-600">
                To
              </div>
              <div
                className={`mt-1 text-[15px] font-semibold ${
                  selected ? "text-neutral-900" : "text-neutral-400"
                }`}
              >
                {reversed
                  ? ORIGIN.full
                  : selected?.city ?? "Select destination"}
              </div>
            </div>
          </div>

          {/* Mobile: FROM chip / swap button / TO chip — mirrors desktop's
              three-part row, just stacked instead of side-by-side. Used to
              be a single hardcoded "From: Ilara-Epe" chip with no "To"
              chip at all, so tapping swap correctly flipped the internal
              direction but nothing on screen ever showed it. */}
          <div className="md:hidden">
            <div className="rounded-xl bg-brand-50 px-4 py-3.5">
              <div className="text-[11px] font-medium uppercase tracking-wide text-brand-700">
                From
              </div>
              <div className="mt-1 text-[15px] font-semibold text-neutral-900">
                {reversed ? selected?.city ?? "Select destination" : ORIGIN.full}
              </div>
            </div>
            <div className="my-2 flex justify-center">
              <button
                type="button"
                onClick={() => setReversed((r) => !r)}
                aria-label="Swap direction"
                className="grid h-10 w-10 place-items-center rounded-full bg-brand-600 text-white"
              >
                <SwapHorizIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="rounded-xl border border-neutral-200 px-4 py-3.5">
              <div className="text-[11px] font-medium uppercase tracking-wide text-neutral-600">
                To
              </div>
              <div
                className={`mt-1 text-[15px] font-semibold ${
                  selected ? "text-neutral-900" : "text-neutral-400"
                }`}
              >
                {reversed ? ORIGIN.full : selected?.city ?? "Select destination"}
              </div>
            </div>
          </div>

          <div className="mt-6 text-xs font-medium uppercase tracking-wide text-neutral-500 md:mt-8">
            Choose a destination
          </div>

          {/* Desktop: card grid */}
          <div className="mt-3 hidden gap-4 md:grid md:grid-cols-4">
            {DESTINATIONS.map((d) => {
              const isSelected = d.slug === toSlug;
              return (
                <button
                  key={d.slug}
                  type="button"
                  onClick={() => setToSlug(d.slug)}
                  className={`rounded-xl border p-5 text-left ${
                    isSelected
                      ? "border-brand-600 ring-1 ring-brand-600"
                      : "border-neutral-200 hover:border-brand-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-neutral-900">
                      {d.city}
                    </span>
                    {isSelected && (
                      <span className="grid h-5 w-5 place-items-center rounded-full bg-brand-600 text-white">
                        <CheckIcon className="h-3 w-3" />
                      </span>
                    )}
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span
                      className={`font-bold ${
                        isSelected ? "text-brand-600" : "text-neutral-900"
                      }`}
                    >
                      {formatNaira(d.fareNaira)}
                    </span>
                    <span className="text-caption text-neutral-500">
                      {formatDuration(d.durationMinutes)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Mobile: row list */}
          <div className="mt-3 space-y-2.5 md:hidden">
            {DESTINATIONS.map((d) => {
              const isSelected = d.slug === toSlug;
              return (
                <button
                  key={d.slug}
                  type="button"
                  onClick={() => setToSlug(d.slug)}
                  className={`flex w-full items-center justify-between rounded-xl border bg-white p-4 text-left ${
                    isSelected
                      ? "border-brand-600 ring-1 ring-brand-600"
                      : "border-transparent"
                  }`}
                >
                  <div>
                    <div className="font-semibold text-neutral-900">
                      {d.city}
                    </div>
                    <div className="mt-0.5 text-xs text-neutral-500">
                      {formatDuration(d.durationMinutes)} · from Ilara-Epe
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-bold ${
                        isSelected ? "text-brand-600" : "text-neutral-900"
                      }`}
                    >
                      {formatNaira(d.fareNaira)}
                    </span>
                    {isSelected && (
                      <span className="grid h-5 w-5 place-items-center rounded-full bg-brand-600 text-white">
                        <CheckIcon className="h-3 w-3" />
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Desktop footer buttons */}
        <div className="mt-6 hidden items-center justify-between md:flex">
          <Link
            href="/home"
            className="rounded-lg border border-neutral-200 bg-white px-6 py-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
          >
            Back
          </Link>
          <button
            type="button"
            onClick={handleContinue}
            disabled={!toSlug}
            className="rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {continueLabel}
          </button>
        </div>
      </div>

      {/* Mobile sticky CTA */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-neutral-200 bg-white p-4 md:hidden">
        <button
          type="button"
          onClick={handleContinue}
          disabled={!toSlug}
          className="w-full rounded-lg bg-brand-600 py-3.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {continueLabel}
        </button>
      </div>
    </>
  );
}
