import { WHATSAPP_URL, EMERGENCY_PHONE } from "@/lib/contact";

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 text-sm text-neutral-600 md:flex-row md:justify-between md:px-10">
        <p>© 2026 Kelvjessia Transport · Augustine University, Ilara-Epe</p>
        <nav className="flex items-center gap-6">
          <a href={WHATSAPP_URL} className="hover:text-neutral-900">
            WhatsApp us
          </a>
          <a href={`tel:${EMERGENCY_PHONE}`} className="hover:text-neutral-900">
            Emergency line
          </a>
          <a href="/terms" className="hidden hover:text-neutral-900 md:inline">
            Terms
          </a>
          <a href="/privacy" className="hidden hover:text-neutral-900 md:inline">
            Privacy
          </a>
          <a href="/terms" className="hover:text-neutral-900 md:hidden">
            Terms
          </a>
        </nav>
      </div>
    </footer>
  );
}
