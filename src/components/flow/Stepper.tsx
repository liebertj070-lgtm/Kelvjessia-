import { CheckIcon } from "@/components/icons";

const STEPS: { n: number; label: string; mobileLabel?: string }[] = [
  { n: 1, label: "Route" },
  { n: 2, label: "Details" },
  { n: 3, label: "Summary" },
  { n: 4, label: "Payment", mobileLabel: "Pay" },
];

function Circle({
  status,
  n,
  size,
}: {
  status: "done" | "active" | "upcoming";
  n: number;
  size: "sm" | "md";
}) {
  const dims = size === "md" ? "h-7 w-7 text-sm" : "h-6 w-6 text-xs";
  if (status === "done") {
    return (
      <span
        className={`grid ${dims} shrink-0 place-items-center rounded-full bg-success font-bold text-white`}
      >
        <CheckIcon className={size === "md" ? "h-4 w-4" : "h-3.5 w-3.5"} />
      </span>
    );
  }
  if (status === "active") {
    return (
      <span
        className={`grid ${dims} shrink-0 place-items-center rounded-full bg-brand-600 font-bold text-white`}
      >
        {n}
      </span>
    );
  }
  return (
    <span
      className={`grid ${dims} shrink-0 place-items-center rounded-full border border-neutral-200 bg-white font-bold text-neutral-400`}
    >
      {n}
    </span>
  );
}

function statusFor(n: number, currentStep: number): "done" | "active" | "upcoming" {
  if (n < currentStep) return "done";
  if (n === currentStep) return "active";
  return "upcoming";
}

export function Stepper({ currentStep }: { currentStep: 1 | 2 | 3 | 4 }) {
  return (
    <>
      {/* Desktop */}
      <ol className="hidden items-center md:flex">
        {STEPS.map((step, i) => {
          const status = statusFor(step.n, currentStep);
          return (
            <li key={step.n} className="flex flex-1 items-center last:flex-none">
              <span className="flex items-center gap-2">
                <Circle status={status} n={step.n} size="md" />
                <span
                  className={`text-sm ${
                    status === "upcoming"
                      ? "text-neutral-400"
                      : "font-semibold text-neutral-900"
                  }`}
                >
                  {step.label}
                </span>
              </span>
              {i < STEPS.length - 1 && (
                <span
                  className={`mx-4 h-0.5 flex-1 ${
                    step.n < currentStep ? "bg-success" : "bg-neutral-200"
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>

      {/* Mobile — compact, "Pay" instead of "Payment" */}
      <ol className="flex items-center md:hidden">
        {STEPS.map((step, i) => {
          const status = statusFor(step.n, currentStep);
          return (
            <li key={step.n} className="flex flex-1 items-center last:flex-none">
              <span className="flex items-center gap-1">
                <Circle status={status} n={step.n} size="sm" />
                <span
                  className={`text-[11px] ${
                    status === "upcoming"
                      ? "text-neutral-400"
                      : "font-semibold text-neutral-900"
                  }`}
                >
                  {step.mobileLabel ?? step.label}
                </span>
              </span>
              {i < STEPS.length - 1 && (
                <span
                  className={`mx-1.5 h-0.5 flex-1 ${
                    step.n < currentStep ? "bg-success" : "bg-neutral-200"
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </>
  );
}
