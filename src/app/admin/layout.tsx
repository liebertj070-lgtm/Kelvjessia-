import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/supabase/queries";
import { isStaffEmail, isStaffRole } from "@/lib/admin-auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  let staffEmail = "dispatch@kelvjessia.com";

  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/login?returnTo=/admin");

    const profile = await getProfile(supabase, user.id);
    if (!isStaffRole(profile?.role) && !isStaffEmail(user.email)) {
      redirect("/home");
    }

    staffEmail = user.email ?? staffEmail;
  }

  return (
    <div className="flex min-h-screen bg-[#0B1220] font-sans">
      <AdminSidebar staffEmail={staffEmail} />
      <main className="min-w-0 flex-1 overflow-x-hidden">{children}</main>
    </div>
  );
}
