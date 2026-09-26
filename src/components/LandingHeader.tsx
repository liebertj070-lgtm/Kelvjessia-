import Link from "next/link";
import { Logo } from "./Logo";

// "How it works" / "Routes" / "Send a parcel" scroll to in-page sections;
// none of these are wired in the Figma prototype (§3.8), so they're left
// as anchors to the corresponding section on this page.
const LINKS = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Routes", href: "#routes" },
  { label: "Send a parcel", href: "/select-route?mode=package" },
  { label: "Support", href: "/support" },
];

export function LandingHeader() {
  return (
    <header className="flex h-12 items-center justify-between px-5 md:h-[97px] md:px-20">
      <Link href="/">
        <Logo variant="light" />
      </Link>

      <nav className="hidden items-center gap-8 md:flex">
        {LINKS.map((l) => (
          <a
            key={l.label}
            href={l.href}
            className="text-sm font-medium text-white/90 hover:text-white"
          >
            {l.label}
          </a>
        ))}
      </nav>

      <div className="hidden items-center gap-6 md:flex">
        <Link href="/login" className="text-sm font-medium text-white">
          Log in
        </Link>
        <Link
          href="/login"
          className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-brand-700"
        >
          Sign up
        </Link>
      </div>

      {/* Mobile — same Log in / Sign up actions as desktop, just sized for
          the shorter mobile header instead of a hamburger menu. */}
      <div className="flex items-center gap-3 md:hidden">
        <Link href="/login" className="text-sm font-medium text-white">
          Log in
        </Link>
        <Link
          href="/login"
          className="rounded-lg bg-white px-3.5 py-1.5 text-sm font-semibold text-brand-700"
        >
          Sign up
        </Link>
      </div>
    </header>
  );
}
