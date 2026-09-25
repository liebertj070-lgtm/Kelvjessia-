"use client";

import { useEffect, useRef, useState } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { reportMyLocation } from "@/lib/supabase/queries";
import { NearMeIcon } from "@/components/icons";

const MIN_INTERVAL_MS = 4000;

export function ShareMyLocation({ bookingId }: { bookingId: string }) {
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const lastSentRef = useRef(0);

  useEffect(() => {
    return () => {
      if (watchIdRef.current != null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  function start() {
    setError(null);
    if (!navigator.geolocation) {
      setError("Your browser doesn't support location sharing.");
      return;
    }

    const supabase = createClient();
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const now = Date.now();
        if (now - lastSentRef.current < MIN_INTERVAL_MS) return;
        lastSentRef.current = now;
        reportMyLocation(supabase, bookingId, pos.coords.latitude, pos.coords.longitude);
      },
      (err) => {
        setError(
          err.code === err.PERMISSION_DENIED
            ? "Location permission was denied — allow it in your browser settings to share your position."
            : "Couldn't get your location right now."
        );
        setSharing(false);
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );
    setSharing(true);
  }

  function stop() {
    if (watchIdRef.current != null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setSharing(false);
  }

  if (!isSupabaseConfigured) return null;

  return (
    <div className="rounded-2xl bg-white p-4 md:p-6">
      <div className="flex items-center gap-2">
        <NearMeIcon className="h-4 w-4 text-brand-600" />
        <h2 className="text-base font-semibold text-neutral-900">
          Your live position
        </h2>
      </div>
      <p className="mt-1.5 text-sm text-neutral-500">
        {sharing
          ? "Sharing your position — the map is following you, like Google Maps."
          : "If you're on the bus right now, share your phone's location and the map will move with you."}
      </p>
      {error && <p className="mt-2 text-sm font-medium text-red-600">{error}</p>}
      <button
        type="button"
        onClick={sharing ? stop : start}
        className={`mt-3 w-full rounded-lg py-2.5 text-sm font-semibold ${
          sharing
            ? "border border-neutral-200 text-neutral-700 hover:bg-neutral-50"
            : "bg-brand-600 text-white hover:bg-brand-700"
        }`}
      >
        {sharing ? "Stop sharing" : "Share my live location"}
      </button>
    </div>
  );
}
