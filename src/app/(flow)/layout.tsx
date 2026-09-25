import { TopNav } from "@/components/TopNav";

// Booking-flow screens (Select Route, Book a Seat, Send a Package, Fare
// Summary, Payment): desktop keeps the persistent top nav, but per the
// Figma mobile frames these screens get a back-arrow header instead of
// the bottom tab bar — so, unlike (app)/layout.tsx, no BottomTabBar here.
export default function FlowLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-100">
      <TopNav />
      {children}
    </div>
  );
}
