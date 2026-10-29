// The 404 of every locale: the root parameter gives the language of the URL
// that was not found, so the page, header and footer speak it.
//
// Next 16 sends a notFound() thrown by a page as a minimal HTML document with
// status 404 and noindex, and the browser renders this component from the RSC
// payload (README, "404"). generateMetadata is not applied on that path, so
// the <title> goes in the component (React hoists it into <head>).
import { Fragment } from "react";
import { locale as rootLocale } from "next/root-params";
import { Shell } from "@/components/Shell";
import { getSettings } from "@/lib/cms";
import { config } from "@/lib/config";
import { localeName, t } from "@/lib/i18n";
import { homeOf, type Head } from "@/lib/site";

export default async function NotFound() {
  const raw = await rootLocale();
  const locale = config.locales.includes(raw) ? raw : config.format.defaultLocale;
  const ui = t(locale);
  const head: Head = { locale, mode: "static", path: homeOf(locale), title: ui.notFoundTitle, noindex: true };
  const settings = await getSettings(locale, "static");
  const homes = config.format.locales.map((l) => ({ locale: l, url: homeOf(l) }));
  return (
    <Shell head={head}>
      <title>{`${ui.notFoundTitle} · ${settings.siteName}`}</title>
      <div className="container not-found">
        <p className="eyebrow">404</p>
        <h1>{ui.notFoundTitle}</h1>
        <p className="lede">{ui.notFoundText}</p>
        <p>
          {homes.map((home, i) => (
            <Fragment key={home.locale}>
              {i > 0 && " · "}
              <a href={home.url} hrefLang={home.locale} lang={home.locale}>
                {home.locale === locale ? ui.backHome : localeName(home.locale)}
              </a>
            </Fragment>
          ))}
        </p>
      </div>
    </Shell>
  );
}
