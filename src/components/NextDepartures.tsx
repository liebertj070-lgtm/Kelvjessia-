import { MOCK_NEXT_DEPARTURES } from "@/lib/mock-data";

export function NextDepartures() {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 md:p-6">
      <h3 className="text-h3 text-neutral-900">Next departures</h3>
      <ul className="mt-4 divide-y divide-neutral-100">
        {MOCK_NEXT_DEPARTURES.map((d, i) => (
          <li
            key={d.city}
            className={`flex items-center justify-between py-3 ${
              i === 2 ? "hidden md:flex" : ""
            }`}
          >
            <div>
              <div className="font-medium text-neutral-900">{d.city}</div>
              <div className="text-caption text-neutral-600">
                {d.seatsLeft} seats left
              </div>
            </div>
            <span className="text-sm font-medium text-neutral-700">
              {d.time}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
