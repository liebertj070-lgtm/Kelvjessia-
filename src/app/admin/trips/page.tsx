import { isSupabaseConfigured } from "@/lib/supabase/client";
import { createClient } from "@/lib/supabase/server";
import { listAllBookings } from "@/lib/supabase/queries";
import { TripsClient } from "./TripsClient";

export default async function AdminTripsPage() {
  if (!isSupabaseConfigured) return <TripsClient initial={[]} />;

  const supabase = await createClient();
  const rows = await listAllBookings(supabase);
  return <TripsClient initial={rows} />;
}
