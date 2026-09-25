"use client";

import { useState } from "react";
import Link from "next/link";
import type { NotificationItem, NotificationCategory } from "@/lib/mock-data";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { LiveDot } from "@/components/LiveDot";
import { NotificationsIcon } from "@/components/icons";

type Filter = "all" | NotificationCategory;

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "trip", label: "Trips" },
  { id: "delivery", label: "Deliveries" },
  { id: "offer", label: "Offers" },
];

const ICON_STYLE: Record<string, string> = {
  unread: "bg-brand-600 text-white",
  read: "bg-neutral-200 text-neutral-500",
};

export function NotificationsClient({ initial }: { initial: NotificationItem[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [readIds, setReadIds] = useState<Set<string>>(
    new Set(initial.filter((n) => n.read).map((n) => n.id))
  );

  const filtered = initial.filter((n) => filter === "all" || n.category === filter);
  const today = filtered.filter((n) => n.group === "Today");
  const earlier = filtered.filter((n) => n.group === "Earlier this week");

  async function markRead(id: string) {
    setReadIds((prev) => new Set(prev).add(id));
    if (!isSupabaseConfigured) return;
    const supabase = createClient();
    await supabase.from("notifications").update({ read: true }).eq("id", id);
  }

  async function markAllRead() {
    setReadIds(new Set(initial.map((n) => n.id)));
    if (!isSupabaseConfigured) return;
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", user.id)
      .eq("read", false);
  }

  function renderGroup(label: string, items: NotificationItem[]) {
    if (items.length === 0) return null;
    return (
      <div key={label}>
        <h2 className="mt-6 text-xs font-semibold uppercase tracking-wide text-neutral-400 first:mt-0">
          {label}
        </h2>
        <div className="mt-3 space-y-2.5">
          {items.map((n) => {
            const isRead = readIds.has(n.id);
            return (
              <Link
                key={n.id}
                href={n.href ?? "#"}
                onClick={() => markRead(n.id)}
                className={`flex items-start gap-3 rounded-2xl p-4 ${
                  isRead ? "bg-white" : "bg-brand-50/60"
                }`}
              >
                <span
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${
                    isRead ? ICON_STYLE.read : ICON_STYLE.unread
                  }`}
                >
                  <NotificationsIcon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-neutral-900">
                      {n.title}
                    </span>
                    {!isRead && (
                      <LiveDot color="bg-brand-600" className="shrink-0" />
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-neutral-600">{n.body}</p>
                </div>
                <span className="shrink-0 text-xs text-neutral-400">
                  {n.time}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-6 md:px-10 md:py-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 md:text-h1">
            Notifications
          </h1>
          <p className="mt-1 hidden text-neutral-600 md:block">
            Trip updates, dispatch alerts and offers.
          </p>
        </div>
        <button
          onClick={markAllRead}
          className="text-sm font-semibold text-brand-600 hover:text-brand-700"
        >
          <span className="md:hidden">Mark all read</span>
          <span className="hidden md:inline">Mark all as read</span>
        </button>
      </div>

      <div className="mt-4 inline-flex rounded-full bg-white p-1 text-sm font-semibold md:mt-6">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`rounded-full px-4 py-2 ${
              filter === f.id ? "bg-brand-600 text-white" : "text-neutral-600"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-2">
        {renderGroup("Today", today)}
        {renderGroup("Earlier this week", earlier)}
        {filtered.length === 0 && (
          <p className="mt-6 rounded-2xl bg-white p-8 text-center text-sm text-neutral-500">
            Nothing here yet.
          </p>
        )}
      </div>
    </div>
  );
}
