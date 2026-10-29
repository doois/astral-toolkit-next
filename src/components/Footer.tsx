import type { RenderMode } from "@/lib/astral";
import { getMenu, type Settings } from "@/lib/cms";
import { t } from "@/lib/i18n";
import { homeOf } from "@/lib/site";

export async function Footer({ locale, settings, mode, year }: { locale: string; settings: Settings; mode: RenderMode; year: number }) {
  const ui = t(locale);
  const menu = await getMenu("footer", locale, mode);
  const social = (settings.social ?? []).filter((s) => s.url && s.label);
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="site-footer__grid">
          <div className="site-footer__about">
            <a className="brand" href={homeOf(locale)}>{settings.siteName}</a>
            {settings.description && <p>{settings.description}</p>}
            {settings.contactEmail && (
              <p>
                <a href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a>
              </p>
            )}
          </div>
          {menu.items.length > 0 && (
            <nav aria-label={menu.name}>
              <h3>{menu.name}</h3>
              <ul>
                {menu.items.map((item) => (
                  <li key={item.id}>
                    <a href={item.url ?? "#"} target={item.newTab ? "_blank" : undefined} rel={item.newTab ? "noopener" : undefined}>
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}
          {social.length > 0 && (
            <div>
              <h3>Social</h3>
              <ul>
                {social.map((s) => (
                  <li key={s.url}>
                    <a href={s.url} target={s.newTab ? "_blank" : undefined} rel={s.newTab ? "noopener" : undefined}>
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="site-footer__bottom">
          <span>{settings.footerText || `${settings.siteName}, ${year}`}</span>
          <a href={homeOf(locale)}>{ui.home}</a>
        </div>
      </div>
    </footer>
  );
}
