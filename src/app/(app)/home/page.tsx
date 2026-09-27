import { BookingWidget } from "@/components/BookingWidget";
import { ActiveTripCard } from "@/components/ActiveTripCard";
import { QuickActions } from "@/components/QuickActions";
import { NextDepartures } from "@/components/NextDepartures";
import { getGreeting } from "@/lib/greeting";
import { MOCK_USER } from "@/lib/mock-data";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { createClient } from "@/lib/supabase/server";
import { getLatestActiveBooking } from "@/lib/supabase/queries";
import { tripViewFromRow, type TripView } from "@/lib/trip";
import { WHATSAPP_URL } from "@/lib/contact";
import Link from "next/link";
import { NotificationsIcon } from "@/components/icons";

async function resolveFirstName(): Promise<string> {
  if (!isSupabaseConfigured) {
    return MOCK_USER.firstName;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const metaName = user?.user_metadata?.full_name as string | undefined;
  return metaName?.split(" ")[0] ?? user?.email?.split("@")[0] ?? "there";
}

async function resolveActiveTrip(): Promise<TripView | null> {
  if (!isSupabaseConfigured) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const row = await getLatestActiveBooking(supabase, user.id);
  return row ? tripViewFromRow(row) : null;
}

export default async function HomePage() {
  const [firstName, activeTrip] = await Promise.all([
    resolveFirstName(),
    resolveActiveTrip(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 md:px-10">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 md:text-h1">
            {getGreeting()}, {firstName}
          </h1>
          <p className="mt-1 text-neutral-600">
            Where are we taking you today?
          </p>
        </div>

        {/* Mobile only — desktop already gets this from TopNav, which
            renders on every (app) page. Home has no other persistent
            header on mobile, so this was the one place notifications
            had no entry point at all. */}
        <Link
          href="/notifications"
          aria-label="Notifications"
          className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full hover:bg-neutral-200/60 md:hidden"
        >
          <NotificationsIcon className="h-5 w-5 text-neutral-700" />
          <span className="absolute right-2 top-2 h-[9px] w-[9px] rounded-full bg-brand-600 ring-2 ring-neutral-100" />
        </Link>
      </div>

      <div className="mt-6">
        <BookingWidget variant="home" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <ActiveTripCard trip={activeTrip} />
          <QuickActions />
        </div>

        <div className="space-y-6">
          <NextDepartures />

          <div className="hidden rounded-2xl border border-neutral-200 bg-white p-6 md:block">
            <h3 className="text-h3 text-neutral-900">Need help fast?</h3>
            <p className="mt-2 text-neutral-600">
              Chat with dispatch on WhatsApp, or call the emergency line.
            </p>
            <a
              href={WHATSAPP_URL}
              className="mt-4 block rounded-lg border border-neutral-200 py-3 text-center text-sm font-semibold text-neutral-900 hover:bg-neutral-50"
            >
              Open WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
