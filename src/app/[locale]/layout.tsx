// The root layout. Every public URL is rewritten onto /[locale]/... (next.config,
// src/lib/setup.ts), so the document knows its language without reading the
// request. The single stylesheet is inlined (experimental.inlineCss) and only
// the text face is preloaded; the display serif swaps in.
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { preload } from "react-dom";
import { config } from "@/lib/config";
import { env } from "@/lib/env";
import "@/styles/index.css";

export async function generateStaticParams() {
  return config.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  icons: { icon: { url: "/favicon.svg", type: "image/svg+xml" } },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf8f5" },
    { media: "(prefers-color-scheme: dark)", color: "#141316" },
  ],
};

export default async function RootLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  preload("/fonts/inter-variable.woff2", { as: "font", type: "font/woff2", crossOrigin: "" });
  return (
    <html lang={locale}>
      <body>{children}</body>
    </html>
  );
}
