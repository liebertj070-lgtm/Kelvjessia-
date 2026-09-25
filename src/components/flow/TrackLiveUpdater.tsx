"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

/** Renders nothing — just keeps a Realtime channel open for this one
 * booking row and re-fetches the (server-rendered) page whenever a
 * dispatcher updates it from /admin, so status/progress/position on
 * Track Trip move live instead of only updating on a manual refresh. */
export function TrackLiveUpdater({ bookingId }: { bookingId: string }) {
  const router = useRouter();

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const supabase = createClient();

    const channel = supabase
      .channel(`booking-${bookingId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "bookings",
          filter: `id=eq.${bookingId}`,
        },
        () => router.refresh()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [bookingId, router]);

  return null;
}
