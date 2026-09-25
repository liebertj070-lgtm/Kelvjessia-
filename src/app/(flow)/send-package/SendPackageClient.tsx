"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getDestination, formatNaira, getRouteEndpoints, type Direction } from "@/lib/routes-data";
import {
  PACKAGE_SIZES,
  FRAGILE_HANDLING_FEE,
  PACKAGE_CATEGORIES,
} from "@/lib/package-data";
import { Stepper } from "@/components/flow/Stepper";
import { FlowMobileHeader } from "@/components/flow/FlowMobileHeader";
import { RouteChip } from "@/components/flow/RouteChip";
import { encodeBooking } from "@/lib/booking";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-medium uppercase tracking-wide text-neutral-500">
        {label}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

const inputClass =
  "w-full rounded-lg border border-neutral-200 px-4 py-3 text-[15px] text-neutral-900 placeholder:text-neutral-400 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600";

export function SendPackageClient({
  destinationSlug,
  direction,
}: {
  destinationSlug: string;
  direction: Direction;
}) {
  const destination = getDestination(destinationSlug)!;
  const { fromCity, toCity } = getRouteEndpoints(destination, direction);
  const router = useRouter();

  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(PACKAGE_CATEGORIES[0]);
  const [declaredValue, setDeclaredValue] = useState("");
  const [sizeId, setSizeId] = useState<(typeof PACKAGE_SIZES)[number]["id"]>("medium");
  const [fragile, setFragile] = useState(true);
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [pickupPoint, setPickupPoint] = useState(
    direction === "outbound" ? "AUI Main Gate, Ilara-Epe" : `${destination.city} pickup point`
  );
  const [dropoffPoint, setDropoffPoint] = useState("");
  const [note, setNote] = useState("");

  const size = PACKAGE_SIZES.find((s) => s.id === sizeId)!;
  const handlingFee = fragile ? FRAGILE_HANDLING_FEE : 0;
  const total = destination.packageFareNaira + size.feeNaira + handlingFee;

  const canContinue =
    description.trim() !== "" &&
    recipientName.trim() !== "" &&
    recipientPhone.trim() !== "" &&
    dropoffPoint.trim() !== "";

  function handleContinue() {
    if (!canContinue) return;
    const params = encodeBooking({
      kind: "package",
      to: destination.slug,
      direction,
      description,
      category,
      size: sizeId,
      fragile,
      recipientName,
      recipientPhone,
      pickup: pickupPoint,
      dropoff: dropoffPoint,
    });
    router.push(`/fare-summary?${params.toString()}`);
  }

  return (
    <>
      <FlowMobileHeader
        title="Send a package"
        backHref={`/select-route?to=${destination.slug}&mode=package&dir=${direction}`}
      />
      <RouteChip from={fromCity} to={toCity} />

      <div className="mx-auto max-w-6xl px-5 py-6 pb-32 md:px-10 md:py-8 md:pb-8">
        <div className="hidden md:block">
          <h1 className="text-h1 text-neutral-900">
            Send a package · {fromCity} → {toCity}
          </h1>
          <p className="mt-1 text-neutral-600">
            Tell us what you are sending and who is receiving it.
          </p>
        </div>

        <div className="mt-4 md:mt-8">
          <Stepper currentStep={2} />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:mt-8 md:grid-cols-[1fr_360px]">
          {/* Left column */}
          <div className="space-y-4 md:space-y-6">
            <div className="rounded-2xl bg-white p-4 md:p-6">
              <h2 className="text-base font-semibold text-neutral-900">
                Item details
              </h2>

              <div className="mt-4 space-y-4">
                <Field label="What are you sending?">
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. Textbooks and a laptop charger"
                    className={inputClass}
                  />
                </Field>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Field label="Category">
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className={inputClass}
                    >
                      {PACKAGE_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <div className="hidden md:block">
                    <Field label="Declared value">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={declaredValue}
                        onChange={(e) => setDeclaredValue(e.target.value)}
                        placeholder="₦0"
                        className={inputClass}
                      />
                    </Field>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                    Package size
                  </span>
                  <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-4">
                    {PACKAGE_SIZES.map((s) => {
                      const active = s.id === sizeId;
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setSizeId(s.id)}
                          className={`rounded-lg border p-3 text-center ${
                            active
                              ? "border-brand-600 text-brand-600 ring-1 ring-brand-600"
                              : "border-neutral-200 text-neutral-700 hover:border-brand-300"
                          }`}
                        >
                          <div className="text-sm font-semibold">{s.label}</div>
                          <div className="text-[11px] opacity-70">{s.range}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-amber-50 px-4 py-3.5">
                  <div>
                    <div className="text-sm font-semibold text-amber-800">
                      Fragile handling
                      <span className="hidden md:inline"> / special handling</span>
                    </div>
                    <div className="text-xs text-amber-700">
                      Adds {formatNaira(FRAGILE_HANDLING_FEE)}
                      <span className="hidden md:inline"> to the total</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={fragile}
                    onClick={() => setFragile((f) => !f)}
                    className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                      fragile ? "bg-success" : "bg-neutral-300"
                    }`}
                  >
                    <span
                      className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                        fragile ? "translate-x-[20px]" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-4 md:p-6">
              <h2 className="text-base font-semibold text-neutral-900">
                Recipient &amp; drop-off
              </h2>
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Field label="Recipient name">
                    <input
                      type="text"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="Full name"
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Recipient phone">
                    <input
                      type="tel"
                      value={recipientPhone}
                      onChange={(e) => setRecipientPhone(e.target.value)}
                      placeholder="080X XXX XXXX"
                      className={inputClass}
                    />
                  </Field>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Field label="Pickup point">
                    <input
                      type="text"
                      value={pickupPoint}
                      onChange={(e) => setPickupPoint(e.target.value)}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Drop-off point">
                    <input
                      type="text"
                      value={dropoffPoint}
                      onChange={(e) => setDropoffPoint(e.target.value)}
                      placeholder={`Where in ${toCity}?`}
                      className={inputClass}
                    />
                  </Field>
                </div>
                <div className="hidden md:block">
                  <Field label="Note for the dispatcher">
                    <input
                      type="text"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Call on arrival, recipient works nearby"
                      className={inputClass}
                    />
                  </Field>
                </div>
              </div>
            </div>
          </div>

          {/* Right column — desktop only */}
          <div className="hidden space-y-6 md:block">
            <div className="rounded-2xl bg-white p-6">
              <h2 className="text-base font-semibold text-neutral-900">
                Estimated cost
              </h2>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between text-neutral-600">
                  <span>Base fare · {destination.city}</span>
                  <span>{formatNaira(destination.packageFareNaira)}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>
                    {size.label} package ({size.range})
                  </span>
                  <span>{formatNaira(size.feeNaira)}</span>
                </div>
                {fragile && (
                  <div className="flex justify-between text-neutral-600">
                    <span>Special handling</span>
                    <span>{formatNaira(FRAGILE_HANDLING_FEE)}</span>
                  </div>
                )}
                <div className="border-t border-neutral-200 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-neutral-900">Total</span>
                    <span className="text-lg font-bold text-brand-700">
                      {formatNaira(total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6">
              <h3 className="text-sm font-semibold text-brand-700">
                Good to know
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-neutral-600">
                <li className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-600" />
                  Your recipient gets an SMS with the tracking code
                </li>
                <li className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-600" />
                  Parcels move on the same buses as passengers
                </li>
                <li className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-600" />
                  No cash, jewellery or restricted items
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Desktop footer buttons */}
        <div className="mt-6 hidden items-center justify-between md:flex">
          <Link
            href={`/select-route?to=${destination.slug}&mode=package&dir=${direction}`}
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
          <span className="text-neutral-600">Estimated total</span>
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
