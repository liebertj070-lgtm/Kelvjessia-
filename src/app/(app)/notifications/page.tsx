import { MOCK_NOTIFICATIONS, type NotificationItem } from "@/lib/mock-data";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { createClient } from "@/lib/supabase/server";
import { listNotifications } from "@/lib/supabase/queries";
import { NotificationsClient } from "./NotificationsClient";

function isToday(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function timeLabel(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-NG", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function NotificationsPage() {
  if (!isSupabaseConfigured) {
    return <NotificationsClient initial={MOCK_NOTIFICATIONS} />;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const rows = user ? await listNotifications(supabase, user.id) : [];
  const items: NotificationItem[] = rows.map((r) => ({
    id: r.id,
    category: r.category,
    title: r.title,
    body: r.body,
    href: r.href ?? undefined,
    time: timeLabel(r.created_at),
    group: isToday(r.created_at) ? "Today" : "Earlier this week",
    read: r.read,
  }));

  return <NotificationsClient initial={items} />;
}
