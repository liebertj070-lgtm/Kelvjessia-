"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BOTTOM_TAB_LINKS } from "@/lib/nav-links";
import {
  HomeIcon,
  NearMeIcon,
  HistoryIcon,
  PersonIcon,
} from "@/components/icons";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Home: HomeIcon,
  Track: NearMeIcon,
  History: HistoryIcon,
  Profile: PersonIcon,
};

export function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 flex h-[78px] items-center justify-around border-t border-neutral-200 bg-white md:hidden">
      {BOTTOM_TAB_LINKS.map((link) => {
        const active = pathname === link.href;
        const Icon = ICONS[link.label];
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex flex-col items-center gap-1 text-[13px] ${
              active ? "text-brand-600" : "text-neutral-600"
            }`}
          >
            <Icon className="h-6 w-6" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
