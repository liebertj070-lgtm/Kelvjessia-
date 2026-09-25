import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kelvjessia — Ilara-Epe to Lagos",
  description:
    "Book a seat or send a package between Augustine University, Ilara-Epe and eight Lagos destinations. Track it the whole way.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
