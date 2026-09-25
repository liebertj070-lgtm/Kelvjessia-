import { ArrowForwardIcon } from "@/components/icons";

export function RouteChip({ from, to }: { from: string; to: string }) {
  return (
    <div className="mx-4 mt-4 flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-neutral-900 md:hidden">
      <span>{from}</span>
      <ArrowForwardIcon className="h-4 w-4 text-brand-600" />
      <span>{to}</span>
    </div>
  );
}
