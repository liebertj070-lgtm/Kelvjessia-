import { redirect } from "next/navigation";
import { decodeBooking } from "@/lib/booking";
import { FareSummaryClient } from "./FareSummaryClient";

export default async function FareSummaryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const booking = decodeBooking(params);

  if (!booking) {
    redirect("/select-route");
  }

  return <FareSummaryClient booking={booking} />;
}
