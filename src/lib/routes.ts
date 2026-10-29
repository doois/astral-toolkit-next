// The site's route table, built from the CMS schema when next.config loads
// (src/lib/setup.ts) and frozen into the build (src/lib/config.ts). One route
// per type, locale and kind; the catch-all page matches a request against it.

import { listingPath, listingUrl, localizePath, pathOf, renderMode, routePattern, type LocaleFormat, type RenderMode, type Schema, type SchemaTaxonomy, type SchemaType } from "./astral";
import { t } from "./i18n";

export type RouteKind = "entry" | "listing" | "term";

export type SiteRoute = {
  /** The public path pattern, locale included where the format puts it ("/en/blog/[slug]"). */
  pattern: string;
  kind: RouteKind;
  /** The content type (for "term" routes: the collection the taxonomy lists). */
  type: string;
  locale: string;
  mode: RenderMode;
  /** "term" routes: the taxonomy apiId. */
  taxonomy?: string;
  /** Listing and term routes with a [page] parameter. */
  paged?: boolean;
};

export type AstralConfig = {
  format: LocaleFormat;
  /** The locales this build serves (all of them, except in the "none" format: one build per locale). */
  locales: string[];
  routes: SiteRoute[];
  types: SchemaType[];
  taxonomies: SchemaTaxonomy[];
  builtAt: string;
};

const RANK: Record<RenderMode, number> = { static: 0, revalidate: 1, dynamic: 2 };
/** The most demanding of several modes (a listing of static and dynamic types is dynamic). */
export const mostDynamic = (modes: RenderMode[]): RenderMode => modes.reduce((top, m) => (RANK[m] > RANK[top] ? m : top), "static");

const join = (base: string, segment: string) => (base === "/" ? `/${segment}` : `${base}/${segment}`);
const stripOrigin = (url: string) => url.replace(/^https?:\/\/[^/]+/, "") || "/";

/**
 * Every route the site serves for a schema and locale format. Unlike Astro, a
 * route is keyed by locale and pattern: the [locale] segment keeps the "domain"
 * format's identical paths apart, so one build serves every domain.
 */
export function buildRoutes(schema: Schema, format: LocaleFormat, locales = format.locales): SiteRoute[] {
  const routes: SiteRoute[] = [];
  const routed = schema.types.filter((type) => type.urlPattern);
  for (const locale of locales) {
    const segment = t(locale).pageSegment;
    for (const type of routed) {
      const mode = renderMode(schema, type);
      routes.push({ pattern: routePattern(type.urlPattern!, locale, format), kind: "entry", type: type.apiId, locale, mode });
      if (type.kind === "COLLECTION" && listingPath(type.urlPattern) !== "/") {
        const base = stripOrigin(listingUrl(type.urlPattern, locale, format));
        routes.push({ pattern: base, kind: "listing", type: type.apiId, locale, mode });
        routes.push({ pattern: join(base, `${segment}/[page]`), kind: "listing", type: type.apiId, locale, mode, paged: true });
      }
    }
    for (const taxonomy of schema.taxonomies.filter((x) => x.urlPattern)) {
      const types = routed.filter((type) => taxonomy.types.includes(type.apiId) && type.kind === "COLLECTION");
      const type = types[0];
      if (!type) continue;
      const mode = mostDynamic(types.map((x) => renderMode(schema, x)));
      const pattern = routePattern(taxonomy.urlPattern!, locale, format);
      routes.push({ pattern, kind: "term", type: type.apiId, locale, mode, taxonomy: taxonomy.apiId });
      routes.push({ pattern: join(pattern, `${segment}/[page]`), kind: "term", type: type.apiId, locale, mode, taxonomy: taxonomy.apiId, paged: true });
    }
  }
  return routes;
}

const segmentsOf = (path: string) => path.split("/").filter(Boolean);
const isParam = (segment: string) => /^\[\w+\]$/.test(segment);

/** Static segments beat parameters, left to right ("/blog" wins over "/[slug]"). */
function specificity(a: SiteRoute, b: SiteRoute) {
  const x = segmentsOf(a.pattern);
  const y = segmentsOf(b.pattern);
  for (let i = 0; i < Math.min(x.length, y.length); i++) {
    const d = Number(isParam(x[i]!)) - Number(isParam(y[i]!));
    if (d) return d;
  }
  return 0;
}

/** The route a public path belongs to in a locale, with its parameters ("/blog/x" is { slug: "x" }). */
export function matchRoute(routes: SiteRoute[], locale: string, path: string): { route: SiteRoute; params: Record<string, string> } | null {
  const parts = segmentsOf(path);
  const candidates = routes.filter((r) => r.locale === locale && segmentsOf(r.pattern).length === parts.length).sort(specificity);
  for (const route of candidates) {
    const params: Record<string, string> = {};
    const ok = segmentsOf(route.pattern).every((segment, i) => {
      const part = parts[i]!;
      if (isParam(segment)) return (params[segment.slice(1, -1)] = part), true;
      return segment === part;
    });
    if (ok) return { route, params };
  }
  return null;
}

/** Whether the format puts this locale in the path ("/en/..."). */
export const prefixed = (locale: string, format: LocaleFormat) => format.mode === "prefix-all" || (format.mode === "prefix" && locale !== format.defaultLocale);

/** The public path of the catch-all's segments in a locale: ["blog", "x"] in "en" is "/en/blog/x". */
export function publicPath(locale: string, segments: string[] | undefined, format: LocaleFormat) {
  const path = `/${(segments ?? []).map(decodeURIComponent).join("/")}`;
  return pathOf(localizePath(path, locale, format)) ?? "/";
}

/** The catch-all's segments of a public path in a locale ("/en/blog/x" is ["blog", "x"]): what generateStaticParams returns. */
export function segmentsOfPublic(url: string, locale: string, format: LocaleFormat) {
  const parts = segmentsOf(stripOrigin(url));
  return prefixed(locale, format) && parts[0] === locale ? parts.slice(1) : parts;
}

/** The internal path Next renders a public path at ("/blog/x" is "/pt-BR/blog/x"): what revalidatePath needs. */
export function internalPath(url: string, locale: string, format: LocaleFormat) {
  const rest = segmentsOfPublic(url, locale, format);
  return `/${[locale, ...rest].join("/")}`;
}

/** The URL of page N of a listing or term route ("/blog" for page 1, "/blog/pagina/2" after). */
export function pagedUrl(base: string, page: number, locale: string) {
  return page <= 1 ? base : join(base, `${t(locale).pageSegment}/${page}`);
}
