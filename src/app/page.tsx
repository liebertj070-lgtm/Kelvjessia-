import Link from "next/link";
import Image from "next/image";
import { LandingHeader } from "@/components/LandingHeader";
import { BookingWidget } from "@/components/BookingWidget";
import { StatsBar } from "@/components/StatsBar";
import { RoutesGrid } from "@/components/RoutesGrid";
import { WhyChooseUs } from "@/components/WhyChooseUs";
import { HowItWorks } from "@/components/HowItWorks";
import { Footer } from "@/components/Footer";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero */}
      <div className="relative overflow-hidden bg-brand-900">
        <Image
          src="/hero-desktop.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="hidden object-cover md:block"
        />
        <Image
          src="/hero-mobile.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover md:hidden"
        />
        {/* Legibility overlay — the source photos already carry a dark
            gradient on the left, this reinforces it under the brand nav
            and hero copy at both breakpoints. */}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-900/85 via-brand-900/55 to-brand-900/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-900/70 via-transparent to-transparent md:hidden" />

        <div className="relative">
          <LandingHeader />

          <div className="px-5 pb-16 pt-8 md:px-20 md:pb-28 md:pt-16">
            <div className="mx-auto flex max-w-3xl flex-col items-start gap-2 text-white/80 md:max-w-none">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-medium text-white">
                <span className="h-2 w-2 rounded-full bg-brand-300" />
                Daily trips from Augustine University, Ilara-Epe
              </span>
            </div>

            <h1 className="mt-6 max-w-3xl text-4xl font-bold leading-[1.1] text-white md:text-display">
              Ilara-Epe to Lagos.{" "}
              <span className="md:inline hidden">Seats and parcels, sorted.</span>
            </h1>

            <p className="mt-5 max-w-xl text-white/80 md:hidden">
              Book a seat or send a parcel to eight destinations — and track it
              the whole way.
            </p>
            <p className="mt-5 hidden max-w-xl text-white/80 md:block">
              Book a seat or send a package to Festac, Maryland, Ago, Surulere,
              Falomo, Lekki, Ajah and Sangotedo — and track it the whole way.
            </p>

            <div className="mt-10">
              <BookingWidget variant="landing" />
            </div>
          </div>
        </div>
      </div>

      <StatsBar />

      <div id="routes">
        <RoutesGrid />
      </div>

      <WhyChooseUs />

      <div id="how-it-works">
        <HowItWorks />
      </div>

      {/* CTA */}
      <section className="mx-auto w-full max-w-6xl px-6 py-14 md:px-10">
        <div className="rounded-3xl bg-gradient-to-br from-brand-500 to-brand-800 px-6 py-14 text-center md:px-10">
          <h2 className="text-h2 text-white">Ready to move?</h2>
          <p className="mx-auto mt-3 max-w-md text-white/85">
            Create an account and book in under a minute.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-block rounded-lg bg-white px-8 py-3.5 text-sm font-semibold text-brand-700 hover:bg-white/90"
          >
            Get started
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
