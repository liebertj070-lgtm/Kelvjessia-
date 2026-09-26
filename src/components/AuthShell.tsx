"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { AuthForm } from "@/components/AuthForm";

type Tab = "signup" | "login";

export function AuthShell() {
  const [tab, setTab] = useState<Tab>("signup");

  return (
    <>
      {/* Mobile header — same dynamic heading as desktop's, just styled
          for the gradient banner instead of the white form panel. */}
      <div className="relative overflow-hidden bg-gradient-to-br from-brand-900 to-brand-700 px-6 pb-10 pt-8 md:hidden">
        <Link href="/">
          <Logo variant="light" />
        </Link>
        <h1 className="mt-8 text-3xl font-bold leading-tight text-white">
          {tab === "signup" ? "Create your account" : "Welcome back"}
        </h1>
      </div>

      <div className="flex flex-1 items-start justify-center px-6 py-10 md:items-center md:px-16">
        <AuthForm tab={tab} onTabChange={setTab} />
      </div>
    </>
  );
}
