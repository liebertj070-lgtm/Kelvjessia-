"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

type Tab = "signup" | "login";
type Step = "form" | "otp-request" | "otp-verify";

export function AuthForm() {
  const [tab, setTab] = useState<Tab>("signup");
  const [step, setStep] = useState<Step>("form");
  const [agreed, setAgreed] = useState(false);
  const [fullName, setFullName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo");

  const canContinue = tab === "login" || agreed;

  function goToDestination() {
    router.push(returnTo || "/home");
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!isSupabaseConfigured) {
      // No Supabase project connected yet — proceed as a click-through
      // demo so Phase 3 onward can still be reviewed end to end.
      goToDestination();
      return;
    }

    setPending(true);
    const supabase = createClient();

    try {
      if (tab === "signup") {
        const { error: signUpError } = await supabase.auth.signUp({
          email: identifier,
          password,
          options: { data: { full_name: fullName } },
        });
        if (signUpError) throw signUpError;
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: identifier,
          password,
        });
        if (signInError) throw signInError;
      }
      goToDestination();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setPending(false);
    }
  }

  async function handleOtpRequest(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!isSupabaseConfigured) {
      goToDestination();
      return;
    }

    setPending(true);
    const supabase = createClient();

    try {
      // Email OTP only for launch — SMS needs a paid provider configured
      // in Supabase, deferred until that's worth setting up.
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: identifier,
      });
      if (otpError) throw otpError;
      setStep("otp-verify");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't send a code.");
    } finally {
      setPending(false);
    }
  }

  async function handleOtpVerify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const supabase = createClient();

    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: identifier,
        token: otpCode,
        type: "email",
      });
      if (verifyError) throw verifyError;
      goToDestination();
    } catch (err) {
      setError(err instanceof Error ? err.message : "That code didn't work.");
    } finally {
      setPending(false);
    }
  }

  if (step === "otp-request" || step === "otp-verify") {
    return (
      <div className="w-full max-w-md">
        <h2 className="text-h1 text-neutral-900">
          {step === "otp-request" ? "Get a one-time code" : "Enter the code"}
        </h2>
        <p className="mt-2 text-neutral-600">
          {step === "otp-request"
            ? "We'll email you a 6-digit code."
            : `Sent to ${identifier}.`}
        </p>

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {step === "otp-request" ? (
          <form onSubmit={handleOtpRequest} className="mt-6 space-y-5">
            <label className="block">
              <span className="text-[11px] font-medium uppercase tracking-wide text-neutral-600">
                Email
              </span>
              <input
                type="email"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="you@example.com"
                className="mt-2 w-full rounded-lg border border-neutral-200 px-4 py-3 text-[15px] focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600"
              />
            </label>
            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-lg bg-brand-600 py-3.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
            >
              {pending ? "Sending…" : "Send code"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleOtpVerify} className="mt-6 space-y-5">
            <label className="block">
              <span className="text-[11px] font-medium uppercase tracking-wide text-neutral-600">
                6-digit code
              </span>
              <input
                type="text"
                inputMode="numeric"
                required
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="123456"
                className="mt-2 w-full rounded-lg border border-neutral-200 px-4 py-3 text-center text-lg tracking-[0.3em] focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600"
              />
            </label>
            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-lg bg-brand-600 py-3.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
            >
              {pending ? "Verifying…" : "Verify and continue"}
            </button>
          </form>
        )}

        <button
          type="button"
          onClick={() => setStep("form")}
          className="mt-4 text-sm font-medium text-neutral-600 hover:text-neutral-900"
        >
          ← Back
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handlePasswordSubmit} className="w-full max-w-md">
      <h2 className="hidden text-h1 text-neutral-900 md:block">
        {tab === "signup" ? "Create your account" : "Welcome back"}
      </h2>
      <p className="mt-2 hidden text-neutral-600 md:block">
        It takes less than a minute.
      </p>

      {!isSupabaseConfigured && (
        <p className="mt-4 rounded-lg bg-brand-50 px-4 py-3 text-sm text-brand-800">
          Running without a connected backend — this will move you straight
          through as a click-through demo until Supabase keys are added.
        </p>
      )}

      <div className="mt-6 grid grid-cols-2 rounded-xl bg-neutral-100 p-1 text-sm font-semibold">
        <button
          type="button"
          onClick={() => setTab("signup")}
          className={`rounded-lg py-2.5 ${
            tab === "signup" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-600"
          }`}
        >
          Sign Up
        </button>
        <button
          type="button"
          onClick={() => setTab("login")}
          className={`rounded-lg py-2.5 ${
            tab === "login" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-600"
          }`}
        >
          Log In
        </button>
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="mt-6 space-y-5">
        {tab === "signup" && (
          <label className="block">
            <span className="text-[11px] font-medium uppercase tracking-wide text-neutral-600">
              Full name
            </span>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ogbologu David"
              className="mt-2 w-full rounded-lg border border-neutral-200 px-4 py-3 text-[15px] placeholder:text-neutral-400 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600"
            />
          </label>
        )}

        <label className="block">
          <span className="text-[11px] font-medium uppercase tracking-wide text-neutral-600">
            Email
          </span>
          <input
            type="email"
            required
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="you@example.com"
            className="mt-2 w-full rounded-lg border border-neutral-200 px-4 py-3 text-[15px] placeholder:text-neutral-400 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600"
          />
        </label>

        <label className="block">
          <span className="text-[11px] font-medium uppercase tracking-wide text-neutral-600">
            Password
          </span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••"
            className="mt-2 w-full rounded-lg border border-neutral-200 px-4 py-3 text-[15px] placeholder:text-neutral-400 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600"
          />
        </label>

        {tab === "signup" && (
          <label className="flex items-start gap-3 text-sm text-neutral-700">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 h-[18px] w-[18px] rounded border-neutral-300 text-brand-600 focus:ring-brand-600"
            />
            I agree to the Terms and Privacy Policy
          </label>
        )}

        <button
          type="submit"
          disabled={!canContinue || pending}
          className="w-full rounded-lg bg-brand-600 py-3.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400"
        >
          {pending ? "Please wait…" : "Continue"}
        </button>

        <div className="hidden items-center gap-4 text-sm text-neutral-400 md:flex">
          <span className="h-px flex-1 bg-neutral-200" />
          or
          <span className="h-px flex-1 bg-neutral-200" />
        </div>

        <button
          type="button"
          onClick={() => setStep("otp-request")}
          className="w-full rounded-lg border border-neutral-200 py-3.5 text-sm font-semibold text-neutral-900 hover:bg-neutral-50"
        >
          Continue with a one-time code
        </button>
      </div>
    </form>
  );
}
