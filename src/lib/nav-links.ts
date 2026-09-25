// Signed-in navigation, from the prototype's persistent-nav wiring (§3.8).
// Desktop wires Home/Track/History/Support from the top nav; mobile wires
// Home/Track/History/Profile from the bottom tab bar (Support moves under
// Profile → "Help & support" on mobile, per §3.6).

export const TOP_NAV_LINKS = [
  { label: "Home", href: "/home" },
  { label: "Track", href: "/track" },
  { label: "History", href: "/history" },
  { label: "Support", href: "/support" },
] as const;

export const BOTTOM_TAB_LINKS = [
  { label: "Home", href: "/home" },
  { label: "Track", href: "/track" },
  { label: "History", href: "/history" },
  { label: "Profile", href: "/profile" },
] as const;
