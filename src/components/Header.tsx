// Brand, the "header" menu from the CMS and the language switcher. The mobile
// menu is a <details>: it opens and closes without JavaScript.
import type { MenuItem, RenderMode } from "@/lib/astral";
import { config } from "@/lib/config";
import { getMenu, type Settings } from "@/lib/cms";
import { localeName, t } from "@/lib/i18n";
import { homeOf } from "@/lib/site";

type Props = { locale: string; settings: Settings; alternates: { locale: string; url: string | null }[]; currentPath: string; mode: RenderMode };

const norm = (url: string | null | undefined) => (url ? url.replace(/^https?:\/\/[^/]+/, "").replace(/\/+$/, "") || "/" : "");

export async function Header({ locale, settings, alternates, currentPath, mode }: Props) {
  const ui = t(locale);
  const menu = await getMenu("header", locale, mode);
  const logo = settings.logo;
  const isCurrent = (item: MenuItem) => {
    const url = norm(item.url);
    if (!url || url === "#") return false;
    if (url === currentPath) return true;
    // An archive owns the pages under it ("/blog" is current on "/blog/post").
    return item.kind === "archive" && currentPath.startsWith(`${url}/`);
  };
  const locales = config.format.locales.map((l) => ({ locale: l, href: alternates.find((a) => a.locale === l)?.url ?? homeOf(l), current: l === locale }));

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <a className="brand" href={homeOf(locale)} aria-label={settings.siteName}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {logo ? <img className="brand__logo" src={logo.url} alt="" width={logo.width ?? undefined} height={logo.height ?? undefined} /> : <span className="brand__mark" aria-hidden="true" />}
          {!logo && <span>{settings.siteName}</span>}
        </a>
        <nav className="nav" aria-label={ui.menu}>
          <ul className="nav__list">
            {menu.items.map((item) => (
              <li key={item.id}>
                <a className="nav__link" href={item.url ?? "#"} target={item.newTab ? "_blank" : undefined} rel={item.newTab ? "noopener" : undefined} aria-current={isCurrent(item) ? "page" : undefined}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          {locales.length > 1 && (
            <ul className="locale-switch" aria-label={ui.language}>
              {locales.map((l) => (
                <li key={l.locale}>
                  <a href={l.href} hrefLang={l.locale} lang={l.locale} aria-current={l.current ? "true" : undefined} title={localeName(l.locale)}>
                    {l.locale.split("-")[0]}
                  </a>
                </li>
              ))}
            </ul>
          )}
          {menu.items.length > 0 && (
            <details className="nav__toggle">
              <summary aria-label={ui.menu}>{ui.menu}</summary>
              <div className="nav__panel">
                <ul className="nav__list">
                  {menu.items.map((item) => (
                    <li key={item.id}>
                      <a className="nav__link" href={item.url ?? "#"} aria-current={isCurrent(item) ? "page" : undefined}>
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </details>
          )}
        </nav>
      </div>
    </header>
  );
}
