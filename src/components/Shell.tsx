// The document around every page, inside the root layout's <body>: the JSON-LD
// graph, skip link, header, the optional preview banner, <main>, footer. The
// <head> comes from generateMetadata (src/lib/site.ts) and the root layout.
import type { ReactNode } from "react";
import { config } from "@/lib/config";
import { getSettings, getSiteJsonLd } from "@/lib/cms";
import { t } from "@/lib/i18n";
import { jsonLdOf, type Head } from "@/lib/site";
import { Footer } from "./Footer";
import { Header } from "./Header";

export async function Shell({ head, banner, children }: { head: Head; banner?: ReactNode; children: ReactNode }) {
  const [settings, siteGraph] = await Promise.all([getSettings(head.locale, head.mode), getSiteJsonLd(head.mode)]);
  const ui = t(head.locale);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdOf(head, settings, siteGraph) }} />
      <a className="skip-link" href="#content">{ui.skipToContent}</a>
      <Header locale={head.locale} settings={settings} alternates={head.alternates ?? []} currentPath={head.currentPath ?? head.path} mode={head.mode} />
      {banner}
      <main id="content" tabIndex={-1}>{children}</main>
      <Footer locale={head.locale} settings={settings} mode={head.mode} year={new Date(config.builtAt).getFullYear()} />
    </>
  );
}
