"use client";

import { useState } from "react";
import { FAQS_DESKTOP, FAQS_MOBILE } from "@/lib/mock-data";
import { WHATSAPP_URL, EMERGENCY_PHONE } from "@/lib/contact";
import { FlowMobileHeader } from "@/components/flow/FlowMobileHeader";
import {
  ChatIcon,
  PhoneInTalkIcon,
  MarkEmailReadIcon,
  ChevronRightIcon,
  AddIcon,
  RemoveIcon,
} from "@/components/icons";

const SUPPORT_EMAIL = "support@kelvjessia.com";

const CONTACT_CARDS = [
  {
    id: "whatsapp",
    icon: ChatIcon,
    color: "bg-success",
    title: "WhatsApp dispatch",
    subDesktop: "Fastest reply · usually under 5 minutes",
    subMobile: "Usually replies in under 5 minutes",
    cta: "Open chat",
    href: WHATSAPP_URL,
    external: true,
  },
  {
    id: "emergency",
    icon: PhoneInTalkIcon,
    color: "bg-red-500",
    title: "Emergency line",
    subDesktop: "For incidents on an active trip",
    subMobile: "For incidents on an active trip",
    cta: "Call now",
    href: `tel:${EMERGENCY_PHONE}`,
    external: false,
  },
  {
    id: "email",
    icon: MarkEmailReadIcon,
    color: "bg-brand-600",
    title: "Email us",
    subDesktop: "Refunds, lost items, complaints",
    subMobile: "Refunds, lost items, complaints",
    cta: "Send email",
    href: `mailto:${SUPPORT_EMAIL}`,
    external: false,
  },
];

function FaqAccordion({ faqs }: { faqs: { question: string; answer: string }[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  return (
    <div className="divide-y divide-neutral-100">
      {faqs.map((faq, i) => {
        const open = openIndex === i;
        return (
          <div key={faq.question} className="py-4 first:pt-0 last:pb-0">
            <button
              onClick={() => setOpenIndex(open ? null : i)}
              className="flex w-full items-center justify-between text-left"
            >
              <span className="text-sm font-semibold text-neutral-900">
                {faq.question}
              </span>
              {open ? (
                <RemoveIcon className="h-4 w-4 shrink-0 text-neutral-400" />
              ) : (
                <AddIcon className="h-4 w-4 shrink-0 text-neutral-400" />
              )}
            </button>
            {open && (
              <p className="mt-2 text-sm text-neutral-600">{faq.answer}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function SupportClient() {
  const [subject, setSubject] = useState("Lost item on bus KJ-04");
  const [reference, setReference] = useState("KJ-2609-B34");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    // No backend endpoint yet (no support_tickets table) — this just
    // confirms locally. Wire to a real Supabase table + email/WhatsApp
    // notification to dispatch when that exists.
    setSent(true);
  }

  return (
    <>
      <FlowMobileHeader title="Support" backHref="/home" />

      <div className="mx-auto max-w-5xl px-5 py-6 md:px-10 md:py-8">
        <h1 className="text-2xl font-bold text-neutral-900 md:text-h1">
          How can we help?
        </h1>
        <p className="mt-1 text-neutral-600">
          Dispatch answers on WhatsApp between 6:00 AM and 9:00 PM daily.
        </p>

        {/* Contact cards — desktop grid, mobile stacked rows */}
        <div className="mt-6 hidden gap-4 md:grid md:grid-cols-3">
          {CONTACT_CARDS.map((c) => (
            <div key={c.id} className="rounded-2xl bg-white p-6">
              <span className={`grid h-11 w-11 place-items-center rounded-xl ${c.color} text-white`}>
                <c.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-semibold text-neutral-900">{c.title}</h3>
              <p className="mt-1 text-sm text-neutral-500">{c.subDesktop}</p>
              <a
                href={c.href}
                target={c.external ? "_blank" : undefined}
                rel={c.external ? "noopener noreferrer" : undefined}
                className={`mt-3 inline-flex items-center gap-1 text-sm font-semibold ${
                  c.id === "emergency" ? "text-red-600" : "text-brand-600"
                }`}
              >
                {c.cta} <ChevronRightIcon className="h-4 w-4" />
              </a>
            </div>
          ))}
        </div>

        <div className="mt-4 space-y-3 md:hidden">
          {CONTACT_CARDS.map((c) => (
            <a
              key={c.id}
              href={c.href}
              target={c.external ? "_blank" : undefined}
              rel={c.external ? "noopener noreferrer" : undefined}
              className="flex items-center gap-3 rounded-2xl bg-white p-4"
            >
              <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${c.color} text-white`}>
                <c.icon className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-neutral-900">{c.title}</div>
                <div className="text-xs text-neutral-500">{c.subMobile}</div>
              </div>
              <ChevronRightIcon className="h-4 w-4 shrink-0 text-neutral-300" />
            </a>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-2xl bg-white p-4 md:p-6">
            <h2 className="text-base font-semibold text-neutral-900">
              Common questions
            </h2>
            <div className="mt-3 md:hidden">
              <FaqAccordion faqs={FAQS_MOBILE} />
            </div>
            <div className="mt-3 hidden md:block">
              <FaqAccordion faqs={FAQS_DESKTOP} />
            </div>
          </div>

          <div className="rounded-2xl bg-white p-4 md:p-6">
            <h2 className="text-base font-semibold text-neutral-900">
              Send us a message
            </h2>
            {sent ? (
              <p className="mt-4 rounded-lg bg-success/10 px-4 py-3 text-sm text-success">
                Message sent — dispatch usually replies within a few hours.
              </p>
            ) : (
              <form onSubmit={handleSend} className="mt-4 space-y-4">
                <label className="block">
                  <span className="text-[11px] font-medium uppercase tracking-wide text-neutral-500">
                    Subject
                  </span>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-neutral-200 px-4 py-3 text-[15px] focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600"
                  />
                </label>
                <label className="block">
                  <span className="text-[11px] font-medium uppercase tracking-wide text-neutral-500">
                    Booking reference
                  </span>
                  <input
                    type="text"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-neutral-200 px-4 py-3 text-[15px] focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600"
                  />
                </label>
                <label className="block">
                  <span className="text-[11px] font-medium uppercase tracking-wide text-neutral-500">
                    Message
                  </span>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us what happened and we will get back to you..."
                    className="mt-1.5 w-full rounded-lg border border-neutral-200 px-4 py-3 text-[15px] placeholder:text-neutral-400 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600"
                  />
                </label>
                <button
                  type="submit"
                  className="w-full rounded-lg bg-brand-600 py-3.5 text-sm font-semibold text-white hover:bg-brand-700"
                >
                  Send message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
