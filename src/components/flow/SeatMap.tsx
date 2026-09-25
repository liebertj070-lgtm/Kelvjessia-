"use client";

const COLS = [1, 2, 3, 4] as const;

export function SeatMap({
  rows,
  taken,
  selected,
  onToggle,
  legendLabels,
  showDriver,
}: {
  rows: string[];
  taken: string[];
  selected: string[];
  onToggle: (seatId: string) => void;
  legendLabels: { available: string; selected: string; taken: string };
  showDriver: boolean;
}) {
  const takenSet = new Set(taken);
  const selectedSet = new Set(selected);

  return (
    <div>
      <div className="flex items-center gap-4 text-xs text-neutral-600">
        <span className="flex items-center gap-1.5">
          <span className="h-4 w-4 rounded border border-neutral-300 bg-white" />
          {legendLabels.available}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-4 w-4 rounded bg-brand-600" />
          {legendLabels.selected}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-4 w-4 rounded bg-neutral-200" />
          {legendLabels.taken}
        </span>
      </div>

      <div className="mt-4 rounded-2xl bg-neutral-50 p-4">
        {showDriver && (
          <div className="mb-3 flex justify-end">
            <span className="rounded-full bg-neutral-200 px-3 py-1 text-xs font-medium text-neutral-600">
              Driver
            </span>
          </div>
        )}

        <div className="space-y-2">
          {rows.map((row) => (
            <div key={row} className="flex items-center justify-center gap-2">
              {COLS.map((col) => {
                const id = `${row}${col}`;
                const isTaken = takenSet.has(id);
                const isSelected = selectedSet.has(id);
                return (
                  <div key={id} className="flex items-center gap-2">
                    {col === 3 && <div className="w-4" aria-hidden />}
                    <button
                      type="button"
                      disabled={isTaken}
                      onClick={() => onToggle(id)}
                      aria-pressed={isSelected}
                      className={`grid h-9 w-10 place-items-center rounded-md text-xs font-medium transition-transform duration-150 active:scale-90 ${
                        isSelected
                          ? "animate-seat-pop bg-brand-600 text-white"
                          : isTaken
                          ? "cursor-not-allowed bg-neutral-200 text-neutral-400"
                          : "border border-neutral-200 bg-white text-neutral-700 hover:border-brand-300"
                      }`}
                    >
                      {id}
                    </button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
