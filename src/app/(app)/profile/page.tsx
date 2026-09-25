import { redirect } from "next/navigation";
import { MOCK_USER, MOCK_WALLET_BALANCE_NAIRA } from "@/lib/mock-data";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { createClient } from "@/lib/supabase/server";
import { getProfile, getBookingCounts } from "@/lib/supabase/queries";
import { ProfileClient, type ProfileInitialData } from "./ProfileClient";

export default async function ProfilePage() {
  if (!isSupabaseConfigured) {
    const data: ProfileInitialData = {
      firstName: MOCK_USER.firstName,
      lastName: MOCK_USER.lastName,
      phone: MOCK_USER.phone,
      email: MOCK_USER.email,
      affiliateId: MOCK_USER.affiliateId,
      defaultPickup: MOCK_USER.defaultPickup,
      tripsCount: MOCK_USER.tripsCount,
      parcelsCount: MOCK_USER.parcelsCount,
      walletBalanceNaira: MOCK_WALLET_BALANCE_NAIRA,
      notifyTripUpdates: true,
      notifyDeliveryUpdates: true,
      notifyPromotional: false,
      notifySms: true,
    };
    return <ProfileClient initial={data} />;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [profile, counts] = await Promise.all([
    getProfile(supabase, user.id),
    getBookingCounts(supabase, user.id),
  ]);

  const fullName = profile?.full_name ?? "";
  const [firstName, ...rest] = fullName.split(" ");

  const data: ProfileInitialData = {
    firstName: firstName || (user.email?.split("@")[0] ?? "there"),
    lastName: rest.join(" "),
    phone: profile?.phone ?? "",
    email: user.email ?? "",
    affiliateId: profile?.affiliate_id ?? "",
    defaultPickup: profile?.default_pickup ?? "AUI Main Gate, Ilara-Epe",
    tripsCount: counts.trips,
    parcelsCount: counts.parcels,
    // No wallet table yet — this is still a mock figure (flagged in the
    // build spec as a later addition alongside real payment history).
    walletBalanceNaira: MOCK_WALLET_BALANCE_NAIRA,
    notifyTripUpdates: profile?.notify_trip_updates ?? true,
    notifyDeliveryUpdates: profile?.notify_delivery_updates ?? true,
    notifyPromotional: profile?.notify_promotional ?? false,
    notifySms: profile?.notify_sms ?? true,
  };

  return <ProfileClient initial={data} />;
}
