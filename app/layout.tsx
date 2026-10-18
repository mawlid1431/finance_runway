import type { Metadata } from "next";
import { Bricolage_Grotesque, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

import { Providers } from "@/components/layout/providers";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: {
    default: "Fintech Finance",
    template: "%s — Fintech Finance",
  },
  description:
    "Real-time revenue operations and analytics dashboard for Fintech Finance.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className={`${display.variable} ${mono.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
