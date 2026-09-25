import { TopNav } from "@/components/TopNav";
import { BottomTabBar } from "@/components/BottomTabBar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-100">
      <TopNav />
      <main className="flex-1 pb-[78px] md:pb-0">{children}</main>
      <BottomTabBar />
    </div>
  );
}
