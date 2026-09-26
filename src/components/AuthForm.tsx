"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { CheckIcon } from "@/components/icons";

type Tab = "signup" | "login";

export function AuthForm({
  tab: controlledTab,
  onTabChange,
}: {
  tab?: Tab;
  onTabChange?: (tab: Tab) => void;
} = {}) {
  const [internalTab, setInternalTab] = useState<Tab>("signup");
  const tab = controlledTab ?? internalTab;
  const setTab = onTabChange ?? setInternalTab;

  const [agreed, setAgreed] = useState(false);
  const [fullName, setFullName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState<"sent" | "verified" | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo");

  // Supabase's confirmation link redirects the browser back here with
  // ?verified=1 (see emailRedirectTo below) after establishing the
  // session client-side from the link's own token — so by the time this
  // param shows up, they're already signed in; this just shows the
  // pop-up telling them so, once, on that first load.
  const [verifiedNoticeShown, setVerifiedNoticeShown] = useState(false);
  if (!verifiedNoticeShown && searchParams.get("verified") === "1" && notice !== "verified") {
    setVerifiedNoticeShown(true);
    setNotice("verified");
  }

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
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: identifier,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: `${window.location.origin}/login?verified=1`,
          },
        });
        if (signUpError) throw signUpError;

        // No session yet means email confirmation is required before
        // they can actually sign in — show the "check your email"
        // pop-up and stay right here instead of sending them on to a
        // /home they can't actually load yet.
        if (!data.session) {
          setNotice("sent");
          setPending(false);
          return;
        }
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

  return (
    <form onSubmit={handlePasswordSubmit} className="w-full max-w-md">
      {notice && <AuthNotice kind={notice} onClose={() => setNotice(null)} />}

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
      </div>
    </form>
  );
}

function AuthNotice({
  kind,
  onClose,
}: {
  kind: "sent" | "verified";
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-6">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-success/15 text-success">
          <CheckIcon className="h-6 w-6" />
        </span>
        <h3 className="mt-4 text-lg font-bold text-neutral-900">
          {kind === "sent" ? "Check your email" : "You're verified!"}
        </h3>
        <p className="mt-1.5 text-sm text-neutral-600">
          {kind === "sent"
            ? "A verification link has been sent to your email."
            : "Your account has been successfully verified."}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
