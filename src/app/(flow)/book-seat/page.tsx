import { redirect } from "next/navigation";
import { getDestination, isDirection } from "@/lib/routes-data";
import { BookSeatClient } from "./BookSeatClient";

export default async function BookSeatPage({
  searchParams,
}: {
  searchParams: Promise<{ to?: string; dir?: string }>;
}) {
  const params = await searchParams;
  const destination = params.to ? getDestination(params.to) : undefined;

  if (!destination) {
    redirect("/select-route?mode=seat");
  }

  return (
    <BookSeatClient
      destinationSlug={destination.slug}
      direction={isDirection(params.dir) ? params.dir : "outbound"}
    />
  );
}
