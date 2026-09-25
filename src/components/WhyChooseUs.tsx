import { CheckIcon } from "@/components/icons";

const ITEMS = [
  {
    title: "Live tracking",
    body: "Follow your bus or parcel in real time, from dispatch to arrival.",
  },
  {
    title: "Verified drivers",
    body: "Every driver is ID-checked and dispatch monitors the whole trip.",
  },
  {
    title: "Flexible payment",
    body: "Card, transfer, wallet, or pay on pickup — whatever works for you.",
  },
];

export function WhyChooseUs() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-900 via-brand-800 to-brand-600 py-16">
      {/* Soft color blobs behind the glass cards — without something
          colorful back here, a backdrop-blur panel has nothing to
          frost and just looks like a plain translucent box. */}
      <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-brand-300/30 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-1/3 h-80 w-80 rounded-full bg-brand-500/30 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-6 md:px-10">
        <h2 className="text-h2 text-white">Why choose us</h2>
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          {ITEMS.map((item) => (
            <div
              key={item.title}
              className="relative overflow-hidden rounded-3xl border border-white/25 bg-white/10 p-7 shadow-[0_8px_32px_rgba(6,22,59,0.35)] backdrop-blur-xl backdrop-saturate-150"
            >
              {/* Top sheen — the glassy highlight along the upper edge */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/25 to-transparent" />

              <span className="relative grid h-11 w-11 place-items-center rounded-full border border-white/30 bg-white/15 text-white backdrop-blur-md">
                <CheckIcon className="h-5 w-5" />
              </span>
              <h3 className="relative mt-4 text-h3 text-white">{item.title}</h3>
              <p className="relative mt-2 text-white/75">{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
