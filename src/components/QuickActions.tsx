import Link from "next/link";
import { DirectionsBusIcon, Package2Icon } from "@/components/icons";

export function QuickActions() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Link
        href="/select-route?mode=seat"
        className="rounded-2xl border border-neutral-200 bg-white p-6 hover:border-brand-300"
      >
        <span className="grid h-11 w-11 place-items-center rounded-full bg-brand-50 text-brand-600">
          <DirectionsBusIcon className="h-6 w-6" />
        </span>
        <h3 className="mt-5 text-h3 text-neutral-900">Book a Seat</h3>
        <p className="mt-2 text-neutral-600 md:hidden">Next bus in 40m</p>
        <p className="mt-2 hidden text-neutral-600 md:block">
          Reserve your spot on the next bus
        </p>
      </Link>

      <Link
        href="/select-route?mode=package"
        className="rounded-2xl border border-neutral-200 bg-white p-6 hover:border-brand-300"
      >
        <span className="grid h-11 w-11 place-items-center rounded-full bg-brand-50 text-brand-600">
          <Package2Icon className="h-6 w-6" />
        </span>
        <h3 className="mt-5 text-h3 text-neutral-900">Send a Package</h3>
        <p className="mt-2 text-neutral-600 md:hidden">Same-day delivery</p>
        <p className="mt-2 hidden text-neutral-600 md:block">
          Get a parcel across Lagos today
        </p>
      </Link>
    </div>
  );
}
