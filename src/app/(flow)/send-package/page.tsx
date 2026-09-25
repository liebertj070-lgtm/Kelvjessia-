import { redirect } from "next/navigation";
import { getDestination, isDirection } from "@/lib/routes-data";
import { SendPackageClient } from "./SendPackageClient";

export default async function SendPackagePage({
  searchParams,
}: {
  searchParams: Promise<{ to?: string; dir?: string }>;
}) {
  const params = await searchParams;
  const destination = params.to ? getDestination(params.to) : undefined;

  if (!destination) {
    redirect("/select-route?mode=package");
  }

  return (
    <SendPackageClient
      destinationSlug={destination.slug}
      direction={isDirection(params.dir) ? params.dir : "outbound"}
    />
  );
}
