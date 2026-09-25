"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  type Booking,
  encodeBooking,
  computePrice,
  COMMUNITY_DISCOUNT_LABEL,
} from "@/lib/booking";
import { getDestination, formatNaira, getRouteEndpoints } from "@/lib/routes-data";
import { MOCK_WALLET_BALANCE_NAIRA } from "@/lib/mock-data";
import { Stepper } from "@/components/flow/Stepper";
import { FlowMobileHeader } from "@/components/flow/FlowMobileHeader";

type Method = "card" | "bank_transfer" | "wallet" | "pickup";

const METHODS: {
  id: Method;
  label: string;
  sub: string;
}[] = [
  { id: "card", label: "Debit / credit card", sub: "Visa, Mastercard, Verve" },
  { id: "bank_transfer", label: "Bank transfer", sub: "Pay to a one-time account number" },
  { id: "wallet", label: "Kelvjesse wallet", sub: `Balance ${formatNaira(MOCK_WALLET_BALANCE_NAIRA)}` },
  { id: "pickup", label: "Pay on pickup", sub: "Cash to the dispatcher at the gate" },
];

function formatCountdown(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function generateReference(prefix: string): string {
  return `${prefix}-${Date.now()}`;
}

function navigateTo(url: string) {
  window.location.href = url;
}

export function PaymentClient({
  booking,
  promo,
  error: initialError,
  paidReference,
}: {
  booking: Booking;
  promo?: string;
  error?: string;
  paidReference?: string;
}) {
  const destination = getDestination(booking.to)!;
  const { fromCity, toCity } = getRouteEndpoints(destination, booking.direction);
  const router = useRouter();
  const price = computePrice(booking, promo);

  const [method, setMethod] = useState<Method>("card");
  const [secondsLeft, setSecondsLeft] = useState(600);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(
    initialError === "payment_failed"
      ? "That payment didn't go through — please try again."
      : initialError === "not_configured"
      ? "Payments aren't set up yet. Try again shortly."
      : initialError === "seats_taken"
      ? `Your payment went through${paidReference ? ` (ref ${paidReference})` : ""}, but those exact seats were just taken by someone else. Please pick different seats — we'll refund this charge. Contact support with the reference above if you don't hear back.`
      : initialError
      ? "Something went wrong starting your payment."
      : null
  );

  const expired = booking.kind === "seat" && secondsLeft <= 0;

  useEffect(() => {
    if (booking.kind !== "seat") return;
    if (secondsLeft <= 0) return;
    const t = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [booking.kind, secondsLeft]);

  async function handlePay() {
    setError(null);

    if (method === "wallet") {
      if (MOCK_WALLET_BALANCE_NAIRA < price.total) {
        setError(
          `Your wallet balance (${formatNaira(
            MOCK_WALLET_BALANCE_NAIRA
          )}) isn't enough to cover this. Top up or choose another method.`
        );
        return;
      }
      await saveBookingAndGo("wallet", generateReference("WALLET"));
      return;
    }

    if (method === "pickup") {
      await saveBookingAndGo("pickup", generateReference("PICKUP"));
      return;
    }

    // card / bank_transfer — hand off to Paystack's hosted checkout.
    // Real card details are collected there, never by this form. The
    // booking row itself is written server-side in payment/callback
    // once Paystack confirms the charge actually succeeded.
    setSubmitting(true);
    try {
      const bookingParams = Object.fromEntries(encodeBooking(booking));
      if (promo) bookingParams.promo = promo;

      const res = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountNaira: price.total,
          channels: method === "card" ? ["card"] : ["bank_transfer"],
          bookingParams,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not start payment.");
      navigateTo(data.authorizationUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start payment.");
      setSubmitting(false);
    }
  }

  // Wallet and pay-on-pickup skip Paystack entirely, so this route is
  // where their booking row actually gets written — same insertBooking()
  // helper the Paystack callback uses, just triggered from the client
  // instead of after a webhook/redirect verification.
  async function saveBookingAndGo(paidStatus: "wallet" | "pickup", reference: string) {
    setSubmitting(true);
    setError(null);
    try {
      const bookingParams = Object.fromEntries(encodeBooking(booking));
      if (promo) bookingParams.promo = promo;

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingParams,
          reference,
          amountNaira: price.total,
          paidStatus,
          paymentMethod: paidStatus,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not save booking.");

      const params = encodeBooking(booking);
      if (promo) params.set("promo", promo);
      params.set("paid", paidStatus);
      params.set("reference", data.reference);
      params.set("amount", String(price.total));
      router.push(`/confirmation?${params.toString()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save booking.");
      setSubmitting(false);
    }
  }

  const payLabel = submitting
    ? method === "card" || method === "bank_transfer"
      ? "Redirecting to Paystack…"
      : "Saving your booking…"
    : `Pay ${formatNaira(price.total)} now`;

  return (
    <>
      <FlowMobileHeader
        title="Payment"
        backHref={`/fare-summary?${encodeBooking(booking).toString()}`}
      />

      <div className="mx-auto max-w-6xl px-5 py-6 pb-8 md:px-10 md:py-8">
        <div className="hidden md:block">
          <h1 className="text-h1 text-neutral-900">Payment</h1>
          <p className="mt-1 text-neutral-600">
            Choose how you would like to pay. Your seat is held for 10 minutes.
          </p>
        </div>

        <div className="mt-4 hidden md:block md:mt-8">
          <Stepper currentStep={4} />
        </div>

        {/* Mobile-only countdown, shown up top */}
        {booking.kind === "seat" && (
          <div
            className={`mt-4 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium md:hidden ${
              expired
                ? "bg-red-50 text-red-700"
                : "bg-amber-50 text-amber-800"
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-current" />
            {expired
              ? "Your hold expired — seats have been released."
              : `Seats held for ${formatCountdown(secondsLeft)}`}
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-4 grid grid-cols-1 gap-6 md:mt-6 md:grid-cols-[1fr_360px]">
          {/* Left column */}
          <div className="space-y-4 md:space-y-6">
            <div className="rounded-2xl bg-white p-4 md:p-6">
              <h2 className="text-base font-semibold text-neutral-900">
                Payment method
              </h2>
              <div className="mt-4 space-y-3">
                {METHODS.map((m) => {
                  const active = m.id === method;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMethod(m.id)}
                      className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left ${
                        active
                          ? "border-brand-600 bg-brand-50 ring-1 ring-brand-600"
                          : "border-neutral-200 hover:border-brand-300"
                      }`}
                    >
                      <span
                        className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 ${
                          active
                            ? "border-brand-600"
                            : "border-neutral-300"
                        }`}
                      >
                        {active && (
                          <span className="h-2.5 w-2.5 rounded-full bg-brand-600" />
                        )}
                      </span>
                      <span>
                        <span className="block text-sm font-semibold text-neutral-900">
                          {m.label}
                        </span>
                        <span className="block text-xs text-neutral-500">
                          {m.sub}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {method === "card" && (
              <div className="flex items-center gap-3 rounded-2xl bg-white p-4 text-sm text-neutral-600 md:p-6">
                <span className="h-2 w-2 shrink-0 rounded-full bg-success" />
                You&apos;ll securely enter your card details on Paystack&apos;s
                checkout page after tapping Pay — nothing is collected here.
              </div>
            )}
          </div>

          {/* Right column — desktop order summary */}
          <div className="hidden space-y-4 md:block">
            <div className="rounded-2xl bg-white p-6">
              <h2 className="text-base font-semibold text-neutral-900">
                Order summary
              </h2>
              <div className="mt-3 text-sm">
                <div className="font-semibold text-neutral-900">
                  {fromCity} → {toCity}
                </div>
                {booking.kind === "seat" ? (
                  <div className="mt-0.5 text-neutral-500">
                    {booking.day}, {booking.date} Sep · {booking.time} · Seats{" "}
                    {booking.seats.join(", ")}
                  </div>
                ) : (
                  <div className="mt-0.5 text-neutral-500">
                    {booking.recipientName || "Package"} · next departure
                  </div>
                )}
              </div>

              <div className="mt-4 space-y-2 border-t border-neutral-100 pt-4 text-sm">
                {price.lines.map((line) => (
                  <div key={line.label} className="flex justify-between text-neutral-600">
                    <span>{line.label}</span>
                    <span>{formatNaira(line.amountNaira)}</span>
                  </div>
                ))}
                <div className="flex justify-between text-neutral-600">
                  <span>Booking fee</span>
                  <span>{formatNaira(price.bookingFee)}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>{COMMUNITY_DISCOUNT_LABEL}</span>
                  <span className="text-success">
                    − {formatNaira(price.communityDiscount)}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-neutral-200 pt-4">
                <span className="font-semibold text-neutral-900">Total</span>
                <span className="text-xl font-bold text-brand-700">
                  {formatNaira(price.total)}
                </span>
              </div>

              <button
                type="button"
                onClick={handlePay}
                disabled={submitting || expired}
                className="mt-4 w-full rounded-lg bg-brand-600 py-3.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {payLabel}
              </button>
            </div>

            {booking.kind === "seat" && (
              <div
                className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium ${
                  expired
                    ? "bg-red-50 text-red-700"
                    : "bg-amber-50 text-amber-800"
                }`}
              >
                <span className="h-2 w-2 rounded-full bg-current" />
                {expired
                  ? "Your hold expired — seats have been released."
                  : `Seats held for ${formatCountdown(secondsLeft)}`}
              </div>
            )}
          </div>
        </div>

        {/* Mobile total + pay */}
        <div className="mt-6 md:hidden">
          <div className="flex items-center justify-between text-base">
            <span className="text-neutral-600">Total</span>
            <span className="text-xl font-bold text-brand-700">
              {formatNaira(price.total)}
            </span>
          </div>
          <button
            type="button"
            onClick={handlePay}
            disabled={submitting || expired}
            className="mt-3 w-full rounded-lg bg-brand-600 py-3.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {payLabel}
          </button>
        </div>
      </div>
    </>
  );
}
