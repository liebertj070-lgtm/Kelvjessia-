const DESKTOP_STEPS = [
  {
    n: "01",
    title: "Pick your route",
    body: "Choose Ilara-Epe to any of our eight stops, or the reverse.",
  },
  {
    n: "02",
    title: "Seat or parcel",
    body: "Select a seat on the bus, or describe the package you are sending.",
  },
  {
    n: "03",
    title: "Pay securely",
    body: "Card, transfer, wallet, or pay on pickup — your call.",
  },
  {
    n: "04",
    title: "Track it live",
    body: "Follow the trip from dispatch to arrival, with alerts along the way.",
  },
];

const MOBILE_STEPS = [
  {
    n: "01",
    title: "Pick your route",
    body: "Ilara-Epe to any of eight stops, or the reverse.",
  },
  {
    n: "02",
    title: "Seat or parcel",
    body: "Choose a seat, or describe what you are sending.",
  },
  {
    n: "03",
    title: "Pay & track",
    body: "Card, transfer or cash — then follow it live.",
  },
];

function StepBadge({ n }: { n: string }) {
  return (
    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-600 text-sm font-bold text-white">
      {n}
    </span>
  );
}

export function HowItWorks() {
  return (
    <section className="bg-white py-14">
      <div className="mx-auto max-w-6xl px-6 md:px-10">
        <h2 className="text-h2 text-neutral-900">How it works</h2>

        {/* Mobile: 3 merged steps, stacked cards */}
        <ol className="mt-6 space-y-3 md:hidden">
          {MOBILE_STEPS.map((s) => (
            <li key={s.n} className="rounded-2xl bg-brand-50 p-4">
              <div className="flex items-center gap-3">
                <StepBadge n={s.n} />
                <h3 className="text-base font-semibold text-neutral-900">
                  {s.title}
                </h3>
              </div>
              <p className="mt-2 text-sm text-neutral-600">{s.body}</p>
            </li>
          ))}
        </ol>

        {/* Desktop: 4 separate cards in a row */}
        <ol className="mt-6 hidden grid-cols-4 gap-5 md:grid">
          {DESKTOP_STEPS.map((s) => (
            <li key={s.n} className="rounded-2xl bg-brand-50 p-6">
              <StepBadge n={s.n} />
              <h3 className="mt-4 text-base font-semibold text-neutral-900">
                {s.title}
              </h3>
              <p className="mt-2 text-sm text-neutral-600">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
