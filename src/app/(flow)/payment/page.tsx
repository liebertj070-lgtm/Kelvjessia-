import { redirect } from "next/navigation";
import { decodeBooking } from "@/lib/booking";
import { PaymentClient } from "./PaymentClient";

export default async function PaymentPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const booking = decodeBooking(params);

  if (!booking) {
    redirect("/select-route");
  }

  return (
    <PaymentClient
      booking={booking}
      promo={params.promo}
      error={params.error}
      paidReference={params.paidReference}
    />
  );
}
