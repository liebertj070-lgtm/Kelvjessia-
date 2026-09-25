const STATS = [
  { value: "8", label: "Destinations served" },
  { value: "4x", label: "Daily departures" },
  { value: "2,400+", label: "Students moved" },
  { value: "100%", label: "Parcels tracked" },
];

export function StatsBar() {
  return (
    <section className="hidden border-y border-neutral-200 bg-white py-10 md:block">
      <div className="mx-auto grid max-w-6xl grid-cols-4 gap-8 px-10">
        {STATS.map((s) => (
          <div key={s.label}>
            <div className="text-h1 text-neutral-900">{s.value}</div>
            <div className="mt-1 text-neutral-600">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
