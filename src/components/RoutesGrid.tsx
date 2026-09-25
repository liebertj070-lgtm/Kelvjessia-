import Link from "next/link";
import { DESTINATIONS, formatDuration, formatNaira } from "@/lib/routes-data";
import { ArrowForwardIcon } from "@/components/icons";

export function RoutesGrid() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-14 md:px-10">
      <h2 className="text-h2 text-neutral-900">Where we go</h2>
      <p className="mt-2 text-neutral-600">
        Eight destinations, both directions, every week.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
        {DESTINATIONS.map((d) => (
          <Link
            key={d.slug}
            href={`/select-route?to=${d.slug}`}
            className="rounded-xl border border-neutral-200 bg-white p-5 hover:border-brand-300"
          >
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-600">
                <ArrowForwardIcon className="h-4 w-4" />
              </span>
              <div>
                <div className="font-semibold text-neutral-900">{d.city}</div>
                <div className="text-caption text-neutral-600">
                  from Ilara-Epe
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-h3 text-neutral-900">
                {formatNaira(d.fareNaira)}
              </span>
              <span className="text-caption text-neutral-600 md:inline hidden">
                {formatDuration(d.durationMinutes)}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
