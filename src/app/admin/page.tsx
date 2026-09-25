import Link from "next/link";
import { OPS_TRIPS, OPS_STATS, STATUS_LABEL } from "@/lib/admin-data";
import { getDestination, formatNaira, ORIGIN } from "@/lib/routes-data";
import { FleetMap } from "@/components/admin/FleetMap";
import { ArrowForwardIcon } from "@/components/icons";

const STATUS_DOT: Record<string, string> = {
  in_transit: "bg-brand-500",
  delayed: "bg-amber-500",
  boarding: "bg-[#8B96AC]",
  arrived: "bg-emerald-500",
  scheduled: "bg-[#8B96AC]",
  cancelled: "bg-red-500",
};

export default function AdminOverviewPage() {
  const needsAttention = OPS_TRIPS.filter(
    (t) => t.status === "delayed" || t.status === "boarding"
  );

  return (
    <div className="px-6 py-6 md:px-8 md:py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-[#E7ECF5]">
            Dispatch overview
          </h1>
          <p className="mt-1 text-sm text-[#8B96AC]">
            Live status across every bus on the road right now.
          </p>
        </div>
        <span className="flex items-center gap-2 rounded-full border border-[#1F2A44] bg-[#121A2B] px-3 py-1.5 font-mono text-xs text-[#8B96AC]">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Live
        </span>
      </div>

      {/* Stats strip */}
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Active trips" value={String(OPS_STATS.activeTrips)} />
        <Stat label="Seats booked today" value={String(OPS_STATS.seatsBookedToday)} />
        <Stat label="Revenue today" value={formatNaira(OPS_STATS.revenueTodayNaira)} />
        <Stat label="Open tickets" value={String(OPS_STATS.openTickets)} accent={OPS_STATS.openTickets > 0} />
      </div>

      {/* Map + attention list */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_340px]">
        <div className="h-[420px] overflow-hidden rounded-xl border border-[#1F2A44] bg-[#121A2B] p-2">
          <FleetMap trips={OPS_TRIPS} />
        </div>

        <div className="rounded-xl border border-[#1F2A44] bg-[#121A2B] p-4">
          <h2 className="text-sm font-semibold text-[#E7ECF5]">
            Needs attention
          </h2>
          <div className="mt-3 space-y-2">
            {needsAttention.length === 0 && (
              <p className="text-sm text-[#8B96AC]">
                Nothing needs attention right now.
              </p>
            )}
            {needsAttention.map((t) => {
              const dest = getDestination(t.destinationSlug);
              return (
                <Link
                  key={t.id}
                  href="/admin/trips"
                  className="block rounded-lg border border-[#1F2A44] bg-[#0B1220] p-3 hover:border-brand-500/40"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 font-mono text-xs text-[#8B96AC]">
                      <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[t.status]}`} />
                      {t.reference}
                    </span>
                    <span
                      className={`text-xs font-medium ${
                        t.status === "delayed" ? "text-amber-400" : "text-[#8B96AC]"
                      }`}
                    >
                      {STATUS_LABEL[t.status]}
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-1.5 text-sm text-[#E7ECF5]">
                    {ORIGIN.city}
                    <ArrowForwardIcon className="h-3 w-3 text-[#8B96AC]" />
                    {dest?.city}
                  </div>
                  {t.note && (
                    <p className="mt-1 text-xs text-amber-400/90">{t.note}</p>
                  )}
                </Link>
              );
            })}
          </div>
          <Link
            href="/admin/trips"
            className="mt-4 flex items-center justify-center gap-1.5 rounded-lg border border-[#1F2A44] py-2.5 text-sm font-medium text-[#8B96AC] hover:bg-white/5 hover:text-[#E7ECF5]"
          >
            View all trips <ArrowForwardIcon className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl border border-[#1F2A44] bg-[#121A2B] p-4">
      <div
        className={`font-mono text-2xl font-semibold tabular-nums ${
          accent ? "text-amber-400" : "text-[#E7ECF5]"
        }`}
      >
        {value}
      </div>
      <div className="mt-1 text-xs text-[#8B96AC]">{label}</div>
    </div>
  );
}
