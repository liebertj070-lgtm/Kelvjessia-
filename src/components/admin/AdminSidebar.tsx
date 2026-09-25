"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { HomeIcon, DirectionsBusIcon, LogoutIcon, ArrowBackIcon } from "@/components/icons";

const NAV = [
  { href: "/admin", label: "Overview", icon: HomeIcon },
  { href: "/admin/trips", label: "Trips", icon: DirectionsBusIcon },
];

export function AdminSidebar({ staffEmail }: { staffEmail: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    if (isSupabaseConfigured) {
      const supabase = createClient();
      await supabase.auth.signOut();
    }
    router.push("/login");
  }

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-[#1F2A44] bg-[#0B1220]">
      <div className="flex items-center gap-2 px-5 py-5">
        <span className="relative h-7 w-8 shrink-0">
          <Image src="/logo.png" alt="" fill sizes="32px" className="object-contain" />
        </span>
        <div>
          <div className="text-sm font-semibold text-[#E7ECF5]">Kelvjessia</div>
          <div className="font-mono text-[10px] uppercase tracking-wider text-[#8B96AC]">
            Dispatch
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 px-3">
        {NAV.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-brand-600/15 text-brand-300"
                  : "text-[#8B96AC] hover:bg-white/5 hover:text-[#E7ECF5]"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-2 border-t border-[#1F2A44] p-3">
        <Link
          href="/home"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#8B96AC] hover:bg-white/5 hover:text-[#E7ECF5]"
        >
          <ArrowBackIcon className="h-4 w-4" />
          Back to app
        </Link>
        <div className="flex items-center justify-between rounded-lg px-3 py-2">
          <span className="truncate font-mono text-xs text-[#8B96AC]">
            {staffEmail}
          </span>
          <button
            onClick={handleLogout}
            aria-label="Log out"
            className="shrink-0 text-[#8B96AC] hover:text-[#E7ECF5]"
          >
            <LogoutIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
