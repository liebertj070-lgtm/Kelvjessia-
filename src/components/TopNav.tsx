"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { TOP_NAV_LINKS } from "@/lib/nav-links";
import { NotificationsIcon } from "@/components/icons";

// Mock signed-in user until Supabase Auth (Phase 2) provides a real session.
const MOCK_USER = { initials: "JD" };

// Flow pages (select-route, book-seat, send-package, fare-summary,
// payment, confirmation) are reached from Home, and the screenshots show
// Home staying highlighted while inside them.
const FLOW_PATH_PREFIXES = [
  "/select-route",
  "/book-seat",
  "/send-package",
  "/fare-summary",
  "/payment",
  "/confirmation",
];

export function TopNav() {
  const pathname = usePathname();
  const isFlowPage = FLOW_PATH_PREFIXES.some((p) => pathname.startsWith(p));

  return (
    <header className="hidden md:flex h-[74px] items-center justify-between border-b border-neutral-200 bg-white px-14">
      <Link href="/home">
        <Logo />
      </Link>
      <nav className="flex items-center gap-8">
        {TOP_NAV_LINKS.map((link) => {
          const active =
            pathname === link.href || (link.href === "/home" && isFlowPage);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium ${
                active
                  ? "text-brand-600"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="flex items-center gap-3">
        <Link
          href="/notifications"
          aria-label="Notifications"
          className="relative grid h-[38px] w-[38px] place-items-center rounded-full hover:bg-neutral-100"
        >
          <span aria-hidden className="text-lg">
            <NotificationsIcon className="h-5 w-5" />
          </span>
          <span className="absolute right-2 top-2 h-[9px] w-[9px] rounded-full bg-brand-600 ring-2 ring-white" />
        </Link>
        <Link
          href="/profile"
          aria-label="Profile"
          className="grid h-[38px] w-[38px] place-items-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700"
        >
          {MOCK_USER.initials}
        </Link>
      </div>
    </header>
  );
}
