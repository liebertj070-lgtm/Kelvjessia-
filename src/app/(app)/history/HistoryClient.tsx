"use client";

import { useState } from "react";
import Link from "next/link";
import type { HistoryEntry, TripStatus } from "@/lib/mock-data";
import { formatNaira } from "@/lib/routes-data";
import { FlowMobileHeader } from "@/components/flow/FlowMobileHeader";
import { ArrowForwardIcon, DirectionsBusIcon, Package2Icon } from "@/components/icons";

export type HistoryEntryWithHref = HistoryEntry & { href: string };

type Filter = "all" | "trip" | "delivery";

const STATUS_STYLE: Record<TripStatus, string> = {
  "In transit": "bg-success/10 text-success",
  Completed: "bg-neutral-100 text-neutral-600",
  Delivered: "bg-neutral-100 text-neutral-600",
  Cancelled: "bg-red-50 text-red-600",
};

export function HistoryClient({ entries }: { entries: HistoryEntryWithHref[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");

  const filtered = entries.filter((e) => {
    if (filter !== "all" && e.kind !== filter) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      e.reference.toLowerCase().includes(q) ||
      e.fromCity.toLowerCase().includes(q) ||
      e.toCity.toLowerCase().includes(q)
    );
  });

  return (
    <>
      <FlowMobileHeader title="Your trips" backHref="/home" />

      <div className="mx-auto max-w-6xl px-5 py-6 md:px-10 md:py-8">
        <div className="hidden md:block">
          <h1 className="text-h1 text-neutral-900">Your trips &amp; deliveries</h1>
          <p className="mt-1 text-neutral-600">
            Everything you have booked with Kelvjessia.
          </p>
        </div>

        <div className="mt-4 flex flex-col gap-3 md:mt-6 md:flex-row md:items-center md:justify-between">
          <div className="inline-flex rounded-full bg-white p-1 text-sm font-semibold">
            <button
              onClick={() => setFilter("all")}
              className={`rounded-full px-4 py-2 ${filter === "all" ? "bg-brand-600 text-white" : "text-neutral-600"}`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("trip")}
              className={`rounded-full px-4 py-2 ${filter === "trip" ? "bg-brand-600 text-white" : "text-neutral-600"}`}
            >
              <span className="md:hidden">Trips</span>
              <span className="hidden md:inline">Passenger trips</span>
            </button>
            <button
              onClick={() => setFilter("delivery")}
              className={`rounded-full px-4 py-2 ${filter === "delivery" ? "bg-brand-600 text-white" : "text-neutral-600"}`}
            >
              <span className="md:hidden">Goods</span>
              <span className="hidden md:inline">Goods deliveries</span>
            </button>
          </div>

          {/* Search — desktop only, per the mobile screenshot */}
          <div className="hidden items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2.5 md:flex md:w-80">
            <span className="h-4 w-4 shrink-0 rounded-full border-2 border-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by reference or city"
              className="w-full bg-transparent text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-4 space-y-3 md:mt-6">
          {filtered.map((entry) => (
            <Link
              key={entry.reference}
              href={entry.href}
              className={`flex items-center gap-4 rounded-2xl bg-white p-4 md:p-5 ${
                entry.status === "In transit"
                  ? "border border-brand-300 ring-1 ring-brand-300"
                  : ""
              }`}
            >
              <span
                className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
                  entry.status === "In transit" ? "bg-brand-600 text-white" : "bg-neutral-100 text-neutral-500"
                }`}
              >
                {entry.kind === "delivery" ? (
                  <Package2Icon className="h-5 w-5" />
                ) : (
                  <DirectionsBusIcon className="h-5 w-5" />
                )}
              </span>

              <div className="min-w-0 flex-1">
                <div className="font-semibold text-neutral-900">
                  {entry.fromCity} → {entry.toCity}
                </div>
                <div className="mt-0.5 text-xs text-neutral-500 md:hidden">
                  {entry.date} · {entry.detail}
                </div>
                <div className="mt-0.5 hidden text-xs text-neutral-500 md:block">
                  {entry.date} · {entry.detail}
                </div>
                <span
                  className={`mt-1.5 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold md:hidden ${STATUS_STYLE[entry.status]}`}
                >
                  {entry.status}
                </span>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <div className="text-right">
                  <div className="font-bold text-neutral-900">
                    {formatNaira(entry.amountNaira)}
                  </div>
                  <span
                    className={`mt-1 hidden rounded-full px-2.5 py-0.5 text-[11px] font-semibold md:inline-block ${STATUS_STYLE[entry.status]}`}
                  >
                    {entry.status}
                  </span>
                </div>
                <ArrowForwardIcon className="hidden h-4 w-4 text-neutral-300 md:block" />
              </div>
            </Link>
          ))}

          {filtered.length === 0 && (
            <p className="rounded-2xl bg-white p-8 text-center text-sm text-neutral-500">
              {entries.length === 0
                ? "No trips or deliveries yet — book a seat or send a package to see it here."
                : "Nothing matches that search."}
            </p>
          )}
        </div>
      </div>
    </>
  );
}
