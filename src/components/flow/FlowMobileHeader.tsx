import Link from "next/link";
import { ArrowBackIcon } from "@/components/icons";

export function FlowMobileHeader({
  title,
  backHref,
}: {
  title: string;
  backHref: string;
}) {
  return (
    <div className="flex h-14 items-center gap-3 border-b border-neutral-200 bg-white px-4 md:hidden">
      <Link
        href={backHref}
        aria-label="Back"
        className="grid h-8 w-8 place-items-center rounded-full hover:bg-neutral-100"
      >
        <ArrowBackIcon className="h-5 w-5 text-neutral-900" />
      </Link>
      <h1 className="text-base font-bold text-neutral-900">{title}</h1>
    </div>
  );
}
