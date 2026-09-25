"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MOCK_PAYMENT_METHODS,
  MOCK_SAVED_ROUTES,
} from "@/lib/mock-data";
import { formatNaira } from "@/lib/routes-data";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { ProfileRow } from "@/lib/supabase/database.types";
import {
  ChevronRightIcon,
  LogoutIcon,
  LanguageIcon,
  ArrowForwardIcon,
  ArrowBackIcon,
} from "@/components/icons";

export type ProfileInitialData = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  affiliateId: string;
  defaultPickup: string;
  tripsCount: number;
  parcelsCount: number;
  walletBalanceNaira: number;
  notifyTripUpdates: boolean;
  notifyDeliveryUpdates: boolean;
  notifyPromotional: boolean;
  notifySms: boolean;
};

type Tab = "edit" | "routes" | "payment" | "notifications";
type MenuId = Tab | "history" | "support" | "language";

const MENU: { id: MenuId; label: string; mobileOnly?: boolean; desktopOnly?: boolean }[] = [
  { id: "edit", label: "Edit profile" },
  { id: "routes", label: "Saved routes" },
  { id: "payment", label: "Payment methods" },
  { id: "notifications", label: "Notification settings" },
  { id: "history", label: "Trip history", desktopOnly: true },
  { id: "language", label: "Language", mobileOnly: true },
  { id: "support", label: "Help & support" },
];

export function ProfileClient({ initial }: { initial: ProfileInitialData }) {
  const [tab, setTab] = useState<Tab>("edit");
  const [mobileView, setMobileView] = useState<Tab | null>(null);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const router = useRouter();

  const [firstName, setFirstName] = useState(initial.firstName);
  const [lastName, setLastName] = useState(initial.lastName);
  const [phone, setPhone] = useState(initial.phone);
  const [affiliateId, setAffiliateId] = useState(initial.affiliateId);
  const [pickup, setPickup] = useState(initial.defaultPickup);

  const fullName = `${firstName} ${lastName}`.trim() || "there";
  const initials =
    (firstName[0] ?? "") + (lastName[0] ?? "") || firstName.slice(0, 2).toUpperCase();

  async function handleSave() {
    setSaveError(null);
    if (!isSupabaseConfigured) {
      setSaved(true);
      return;
    }
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        phone,
        affiliate_id: affiliateId,
        default_pickup: pickup,
      })
      .eq("id", user.id);

    if (error) {
      setSaveError("Couldn't save your changes — try again.");
      return;
    }
    setSaved(true);
    router.refresh();
  }

  async function handleLogout() {
    if (isSupabaseConfigured) {
      const supabase = createClient();
      await supabase.auth.signOut();
    }
    router.push("/login");
  }

  function handleMenuClick(id: string) {
    if (id === "history") {
      router.push("/history");
      return;
    }
    if (id === "support" || id === "language") {
      router.push("/support");
      return;
    }
    setTab(id as Tab);
    setMobileView(id as Tab);
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-6 md:px-10 md:py-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[320px_1fr]">
        {/* Left column — profile card + menu (desktop always visible;
            mobile only when no sub-view is open) */}
        <div className={`space-y-4 ${mobileView ? "hidden md:block" : ""}`}>
          {/* Mobile-only header card with stats row */}
          <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-brand-700 to-brand-500 p-6 text-center text-white md:hidden">
            <span className="mx-auto grid h-20 w-20 place-items-center rounded-full border-2 border-white/40 bg-white/10 text-2xl font-bold">
              {initials}
            </span>
            <h1 className="mt-3 text-lg font-bold">{fullName}</h1>
            <p className="text-sm text-white/80">{initial.email}</p>
            <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              Verified AUI affiliate
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3 md:hidden">
            <StatCard value={String(initial.tripsCount)} label="Trips" />
            <StatCard value={String(initial.parcelsCount)} label="Parcels" />
            <StatCard value={formatNaira(initial.walletBalanceNaira)} label="Wallet" />
          </div>

          {/* Desktop profile card */}
          <div className="hidden rounded-2xl bg-white p-6 text-center md:block">
            <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-brand-600 text-2xl font-bold text-white">
              {initials}
            </span>
            <h1 className="mt-3 font-bold text-neutral-900">{fullName}</h1>
            <p className="text-sm text-neutral-500">{initial.email}</p>
            <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              Verified AUI affiliate
            </span>
          </div>

          <div className="rounded-2xl bg-white p-2 md:p-2">
            {MENU.map((m) => {
              const isTabItem =
                m.id === "edit" ||
                m.id === "routes" ||
                m.id === "payment" ||
                m.id === "notifications";
              const isActive = isTabItem && !mobileView && tab === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => handleMenuClick(m.id)}
                  className={`flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-left text-sm font-medium ${
                    m.desktopOnly ? "hidden md:flex" : m.mobileOnly ? "flex md:hidden" : "flex"
                  } ${
                    isActive
                      ? "bg-brand-50 text-brand-700"
                      : "text-neutral-700 hover:bg-neutral-50"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    {m.id === "language" && <LanguageIcon className="h-4 w-4 text-brand-600" />}
                    {m.id !== "language" && (
                      <span className="h-2.5 w-2.5 rounded-sm bg-brand-600" />
                    )}
                    {m.label}
                  </span>
                  <ChevronRightIcon className="h-4 w-4 text-neutral-300 md:hidden" />
                </button>
              );
            })}
          </div>

          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-100 bg-red-50 py-3.5 text-sm font-semibold text-red-600 hover:bg-red-100"
          >
            <LogoutIcon className="h-4 w-4" />
            Log out
          </button>
        </div>

        {/* Right column — desktop always; mobile only when a sub-view is open */}
        <div className={`space-y-6 ${mobileView ? "" : "hidden md:block"}`}>
          {mobileView && (
            <button
              onClick={() => setMobileView(null)}
              className="mb-2 flex items-center gap-2 text-sm font-semibold text-neutral-700 md:hidden"
            >
              <ArrowBackIcon className="h-4 w-4" />
              Back
            </button>
          )}

          {(mobileView === "edit" || (!mobileView && tab === "edit")) && (
            <>
              <div className="rounded-2xl bg-white p-4 md:p-6">
                <h2 className="text-base font-semibold text-neutral-900 md:text-lg">
                  Edit profile
                </h2>
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Field label="First name" value={firstName} onChange={setFirstName} />
                  <Field label="Last name" value={lastName} onChange={setLastName} />
                  <Field label="Phone number" value={phone} onChange={setPhone} />
                  <label className="block">
                    <span className="text-[11px] font-medium uppercase tracking-wide text-neutral-500">
                      Email
                    </span>
                    <input
                      type="email"
                      value={initial.email}
                      disabled
                      className="mt-1.5 w-full cursor-not-allowed rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 text-[15px] text-neutral-500"
                    />
                  </label>
                  <Field
                    label="AUI ID (optional)"
                    value={affiliateId}
                    onChange={setAffiliateId}
                    placeholder="e.g. AUI/2023/0451 or staff ID"
                  />
                  <Field label="Default pickup" value={pickup} onChange={setPickup} />
                </div>
                <div className="mt-5 flex items-center justify-end gap-3">
                  {saveError && (
                    <span className="mr-auto text-sm font-medium text-red-600">
                      {saveError}
                    </span>
                  )}
                  {!saveError && saved && (
                    <span className="mr-auto text-sm font-medium text-success">
                      Saved
                    </span>
                  )}
                  <button
                    onClick={() => {
                      setFirstName(initial.firstName);
                      setLastName(initial.lastName);
                      setPhone(initial.phone);
                      setAffiliateId(initial.affiliateId);
                      setPickup(initial.defaultPickup);
                      setSaved(false);
                      setSaveError(null);
                    }}
                    className="rounded-lg border border-neutral-200 px-5 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
                  >
                    Discard
                  </button>
                  <button
                    onClick={handleSave}
                    className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
                  >
                    Save changes
                  </button>
                </div>
              </div>

              <div className="rounded-2xl bg-white p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-neutral-900">
                    Saved payment methods
                  </h2>
                  <button className="text-sm font-semibold text-brand-600">
                    + Add new
                  </button>
                </div>
                <div className="mt-4 space-y-3">
                  {MOCK_PAYMENT_METHODS.map((pm) => (
                    <div
                      key={pm.id}
                      className="flex items-center justify-between rounded-xl bg-neutral-50 px-4 py-3.5"
                    >
                      <div className="flex items-center gap-3">
                        <span className="h-6 w-9 rounded bg-brand-600" />
                        <div>
                          <div className="text-sm font-semibold text-neutral-900">
                            {pm.label}
                          </div>
                          <div className="text-xs text-neutral-500">{pm.sublabel}</div>
                        </div>
                      </div>
                      {pm.isDefault && (
                        <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">
                          Default
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {mobileView === "payment" && (
            <div className="rounded-2xl bg-white p-4">
              <h2 className="text-base font-semibold text-neutral-900">
                Payment methods
              </h2>
              <div className="mt-4 space-y-3">
                {MOCK_PAYMENT_METHODS.map((pm) => (
                  <div key={pm.id} className="flex items-center justify-between rounded-xl bg-neutral-50 px-4 py-3.5">
                    <div>
                      <div className="text-sm font-semibold text-neutral-900">{pm.label}</div>
                      <div className="text-xs text-neutral-500">{pm.sublabel}</div>
                    </div>
                    {pm.isDefault && (
                      <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">
                        Default
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {(mobileView === "routes" || (!mobileView && tab === "routes")) && (
            <div className="rounded-2xl bg-white p-4 md:p-6">
              <h2 className="text-base font-semibold text-neutral-900">
                Saved routes
              </h2>
              <div className="mt-4 space-y-3">
                {MOCK_SAVED_ROUTES.map((r) => (
                  <Link
                    key={`${r.fromCity}-${r.toCity}`}
                    href={`/select-route?to=${r.toCity.toLowerCase()}`}
                    className="flex items-center gap-2 rounded-xl bg-neutral-50 px-4 py-3.5 text-sm font-semibold text-neutral-900 hover:bg-neutral-100"
                  >
                    {r.fromCity}
                    <ArrowForwardIcon className="h-3.5 w-3.5 text-brand-600" />
                    {r.toCity}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {(mobileView === "notifications" || (!mobileView && tab === "notifications")) && (
            <div className="rounded-2xl bg-white p-4 md:p-6">
              <h2 className="text-base font-semibold text-neutral-900">
                Notification settings
              </h2>
              <div className="mt-4 space-y-1">
                <ToggleRow
                  label="Trip updates"
                  field="notify_trip_updates"
                  defaultOn={initial.notifyTripUpdates}
                />
                <ToggleRow
                  label="Delivery updates"
                  field="notify_delivery_updates"
                  defaultOn={initial.notifyDeliveryUpdates}
                />
                <ToggleRow
                  label="Promotional offers"
                  field="notify_promotional"
                  defaultOn={initial.notifyPromotional}
                />
                <ToggleRow
                  label="SMS notifications"
                  field="notify_sms"
                  defaultOn={initial.notifySms}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl bg-white p-3 text-center">
      <div className="text-base font-bold text-brand-700">{value}</div>
      <div className="text-[11px] text-neutral-500">{label}</div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-medium uppercase tracking-wide text-neutral-500">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1.5 w-full rounded-lg border border-neutral-200 px-4 py-3 text-[15px] text-neutral-900 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600"
      />
    </label>
  );
}

type NotifyField =
  | "notify_trip_updates"
  | "notify_delivery_updates"
  | "notify_promotional"
  | "notify_sms";

function ToggleRow({
  label,
  field,
  defaultOn = false,
}: {
  label: string;
  field: NotifyField;
  defaultOn?: boolean;
}) {
  const [on, setOn] = useState(defaultOn);

  async function toggle() {
    const next = !on;
    setOn(next); // optimistic — this is a settings toggle, not a payment
    if (!isSupabaseConfigured) return;

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({ [field]: next } as Partial<ProfileRow>)
      .eq("id", user.id);
    if (error) setOn(!next); // revert on failure
  }

  return (
    <div className="flex items-center justify-between border-b border-neutral-100 py-3.5 last:border-0">
      <span className="text-sm text-neutral-700">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={toggle}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${on ? "bg-success" : "bg-neutral-300"}`}
      >
        <span
          className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${on ? "translate-x-[20px]" : "translate-x-0"}`}
        />
      </button>
    </div>
  );
}
