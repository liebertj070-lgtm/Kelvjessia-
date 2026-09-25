// Visual stand-in for a scannable QR code — not a real one. Wiring up an
// actual QR encoding the booking reference (e.g. via the `qrcode` package)
// is a small follow-up, not done here since nothing currently scans it.

function cellsForSeed(seed: string): boolean[] {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const cells: boolean[] = [];
  for (let i = 0; i < 49; i++) {
    h = (h * 1103515245 + 12345) >>> 0;
    cells.push((h >> 16) % 2 === 0);
  }
  return cells;
}

export function QrPlaceholder({ seed }: { seed: string }) {
  const cells = cellsForSeed(seed);

  return (
    <div className="grid h-24 w-24 grid-cols-7 gap-0.5 rounded-xl bg-neutral-900 p-2 md:h-28 md:w-28">
      {cells.map((on, i) => (
        <span key={i} className={on ? "bg-white" : "bg-neutral-900"} />
      ))}
    </div>
  );
}
