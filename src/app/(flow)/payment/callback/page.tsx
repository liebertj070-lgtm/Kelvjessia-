import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { insertBooking } from "@/lib/supabase/queries";
import { decodeBooking } from "@/lib/booking";

// Paystack redirects here after the hosted checkout. We verify server-side
// with the secret key (never trust the redirect alone — a client could
// forge a "success" redirect) before treating the booking as paid, then
// write the real bookings row right here — this is the one place a
// card/bank_transfer booking is known to have actually been paid for.
export default async function PaymentCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string; trxref?: string }>;
}) {
  const params = await searchParams;
  const reference = params.reference ?? params.trxref;

  if (!reference) {
    redirect("/payment?error=missing_reference");
  }

  if (!process.env.PAYSTACK_SECRET_KEY) {
    redirect("/payment?error=not_configured");
  }

  const res = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
      cache: "no-store",
    }
  );
  const data = await res.json();

  if (data.status && data.data?.status === "success") {
    const metadata = (data.data.metadata ?? {}) as Record<string, string>;
    const amount = (data.data.amount ?? 0) / 100;
    const confirmParams = new URLSearchParams(metadata);
    confirmParams.set("paid", "card");
    confirmParams.set("reference", reference);
    confirmParams.set("amount", String(amount));

    const booking = decodeBooking(metadata);
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (booking && user) {
      const { error, seatConflict } = await insertBooking(supabase, {
        userId: user.id,
        booking,
        reference,
        amountNaira: amount,
        paidStatus: "paid",
        paymentMethod: metadata.channels ?? "card",
      });

      if (seatConflict) {
        // They were genuinely charged for seats that turned out to be
        // taken in the meantime — send them back to Payment with a
        // message that says so plainly and points at this reference,
        // rather than showing a receipt for a booking that doesn't
        // exist. No auto-refund integration yet, so this is manual on
        // the ops side for now.
        const backParams = new URLSearchParams(metadata);
        backParams.set("error", "seats_taken");
        backParams.set("paidReference", reference);
        redirect(`/payment?${backParams.toString()}`);
      }
      // Best-effort beyond that — if this fails for any other reason,
      // Confirmation still has everything it needs from the URL params
      // to render the receipt; the booking just won't show up in
      // History/Track until it's retried. Logged server-side rather
      // than blocking the receipt the person paid for.
      if (error) console.error("Booking insert failed after payment:", error);
    }

    redirect(`/confirmation?${confirmParams.toString()}`);
  }

  redirect("/payment?error=payment_failed");
}
