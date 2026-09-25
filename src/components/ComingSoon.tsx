import Link from "next/link";

export function ComingSoon({
  title,
  phase,
}: {
  title: string;
  phase: string;
}) {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center px-6 text-center">
      <h1 className="text-h2 text-neutral-900">{title}</h1>
      <p className="mt-3 text-neutral-600">
        This screen is scheduled for {phase} of the build — see the progress
        tracker in the spec.
      </p>
      <Link
        href="/home"
        className="mt-6 rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700"
      >
        Back to Home
      </Link>
    </div>
  );
}
