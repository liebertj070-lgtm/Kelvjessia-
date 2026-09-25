import Link from "next/link";
import { Suspense } from "react";
import { Logo } from "@/components/Logo";
import { AuthForm } from "@/components/AuthForm";

const FEATURES = [
  "Live tracking on every trip",
  "Verified drivers and dispatchers",
  "Pay on pickup if you prefer cash",
];

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Brand panel — desktop only */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-brand-900 to-brand-700 md:flex md:w-[43%] md:flex-col md:justify-center md:px-16">
        <div className="max-w-md">
          <Link href="/">
            <Logo variant="light" />
          </Link>
          <h1 className="mt-14 text-h1 text-white">
            Your ride and your parcels, in one place.
          </h1>
          <p className="mt-5 text-white/80">
            Sign in with your email address.
          </p>
          <ul className="mt-14 space-y-5">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-3 text-white">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white/15 text-xs">
                  ✓
                </span>
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Mobile header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-brand-900 to-brand-700 px-6 pb-10 pt-8 md:hidden">
        <Link href="/">
          <Logo variant="light" />
        </Link>
        <h1 className="mt-8 text-3xl font-bold leading-tight text-white">
          Create your account
        </h1>
      </div>

      {/* Form */}
      <div className="flex flex-1 items-start justify-center px-6 py-10 md:items-center md:px-16">
        <Suspense fallback={null}>
          <AuthForm />
        </Suspense>
      </div>
    </div>
  );
}
