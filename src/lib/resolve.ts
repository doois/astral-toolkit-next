// What the catch-all page needs: the paths to prerender (generateStaticParams)
// and the data of the page being rendered, for every route kind of the table
// (entry, listing, term archive). Mirrors the Astro toolkit's src/lib/resolve.ts.

import { fillPattern, listingUrl, pathOf, type Entry, type ListMeta, type RenderMode, type Term } from "./astral";
import { getEntry, getSingle, getTerm, getTerms, listAll, listPosts, PAGE_SIZE, type Post } from "./cms";
import { config, typeOf } from "./config";
import { t } from "./i18n";
import { matchRoute, pagedUrl, publicPath, segmentsOfPublic, type SiteRoute } from "./routes";

export type ListingProps = {
  locale: string;
  title: string;
  description?: string | null;
  posts: Post[];
  meta: ListMeta;
  base: string;
  allUrl: string;
  terms: Term[];
  current: Term | null;
  alternates: { locale: string; url: string | null }[];
};

export type Resolved =
  | { kind: "notFound"; mode: RenderMode }
  | { kind: "redirect"; to: string; mode: RenderMode }
  | { kind: "entry"; mode: RenderMode; route: SiteRoute; path: string; entry: Entry; locale: string }
  | { kind: "listing"; mode: RenderMode; route: SiteRoute; path: string; props: ListingProps };

/** The first taxonomy with an archive URL that classifies a collection. */
const taxonomyOf = (apiId: string) => config.taxonomies.find((x) => x.urlPattern && x.types.includes(apiId))?.apiId ?? "";

/** The route and parameters of a request: the [locale] segment and the catch-all's segments. */
export function routeOf(locale: string, segments: string[] | undefined) {
  if (!config.locales.includes(locale)) return null;
  const path = publicPath(locale, segments, config.format);
  const match = matchRoute(config.routes, locale, path);
  return match ? { ...match, path } : null;
}

// ── generateStaticParams ────────────────────────────────────────────────

/** Every public path of a locale that is built ahead (types with render "static" or "revalidate"). */
export async function prerenderedPaths(locale: string) {
  const paths: string[] = [];
  for (const route of config.routes.filter((r) => r.locale === locale && r.mode !== "dynamic")) {
    if (route.kind === "entry") paths.push(...(await entryPaths(route)));
    else if (route.kind === "listing") paths.push(...(await listingPaths(route)));
    else paths.push(...(await termPaths(route)));
  }
  return [...new Set(paths)].map((path) => segmentsOfPublic(path, locale, config.format));
}

const fill = (pattern: string, params: Record<string, string>) => pattern.replace(/\[(\w+)\]/g, (_, key: string) => encodeURIComponent(params[key] ?? ""));

async function entryPaths(route: SiteRoute) {
  const type = typeOf(route.type)!;
  if (type.kind === "SINGLE") return [route.pattern];
  const entries = await listAll(route.type, route.locale);
  // The CMS decides the URL (the entry with slug "home" is "/"): only entries whose URL is this pattern's.
  return entries
    .filter((entry) => pathOf(entry.meta.url) === pathOf(fillPattern(type.urlPattern!, { slug: entry.slug ?? entry.id, id: entry.id, locale: route.locale }, config.format)))
    .map((entry) => fill(route.pattern, { slug: entry.slug ?? entry.id, id: entry.id }));
}

async function listingPaths(route: SiteRoute) {
  if (!route.paged) return [route.pattern];
  const { meta } = await listPosts(route.locale, 1, undefined, PAGE_SIZE, "static");
  return Array.from({ length: Math.max(meta.pageCount - 1, 0) }, (_, i) => fill(route.pattern, { page: String(i + 2) }));
}

async function termPaths(route: SiteRoute) {
  const terms = await getTerms(route.taxonomy!, route.locale, "static");
  if (!route.paged) return terms.map((term) => fill(route.pattern, { slug: term.slug }));
  const paths: string[] = [];
  for (const term of terms) {
    const { meta } = await listPosts(route.locale, 1, term.id, PAGE_SIZE, "static");
    for (let page = 2; page <= meta.pageCount; page++) paths.push(fill(route.pattern, { slug: term.slug, page: String(page) }));
  }
  return paths;
}

// ── Rendering ───────────────────────────────────────────────────────────

/** The page at a request, read in the route's render mode. */
export async function resolve(locale: string, segments: string[] | undefined): Promise<Resolved> {
  const found = routeOf(locale, segments);
  if (!found) return { kind: "notFound", mode: "static" };
  const { route, params, path } = found;
  const mode = route.mode;
  if (route.kind === "entry") {
    const type = typeOf(route.type)!;
    const ref = params.slug ?? params.id ?? "";
    const entry = type.kind === "SINGLE" ? await getSingle(route.type, route.locale, mode) : ref ? await getEntry(route.type, ref, route.locale, mode) : null;
    // The entry must live at this URL: "/home" is not the home page, a slug of another locale is not this one.
    if (!entry || (entry.meta.url && pathOf(entry.meta.url) !== path)) return { kind: "notFound", mode };
    return { kind: "entry", mode, route, path, entry, locale: route.locale };
  }
  const outcome = route.kind === "listing" ? await resolveListing(route, params, mode) : await resolveTerm(route, params, mode);
  if (outcome.kind === "ok") return { kind: "listing", mode, route, path, props: outcome.props };
  return { ...outcome, mode };
}

type Outcome = { kind: "ok"; props: ListingProps } | { kind: "notFound" } | { kind: "redirect"; to: string };

async function resolveListing(route: SiteRoute, params: Record<string, string>, mode: RenderMode): Promise<Outcome> {
  const type = typeOf(route.type)!;
  const base = listingUrl(type.urlPattern, route.locale, config.format);
  const page = route.paged ? Number(params.page) : 1;
  if (route.paged && (!Number.isInteger(page) || page < 2)) return { kind: "redirect", to: base };
  const [{ data: posts, meta }, terms] = await Promise.all([listPosts(route.locale, page, undefined, PAGE_SIZE, mode), getTerms(taxonomyOf(route.type), route.locale, mode)]);
  if (page > Math.max(meta.pageCount, 1)) return { kind: "notFound" };
  const alternates = config.format.locales.map((locale) => ({ locale, url: pagedUrl(listingUrl(type.urlPattern, locale, config.format), page, locale) }));
  return { kind: "ok", props: { locale: route.locale, title: t(route.locale).blog, posts, meta, base, allUrl: base, terms, current: null, alternates } };
}

async function resolveTerm(route: SiteRoute, params: Record<string, string>, mode: RenderMode): Promise<Outcome> {
  const type = typeOf(route.type)!;
  const slug = params.slug ?? "";
  const term = slug ? await getTerm(route.taxonomy!, slug, route.locale, mode) : null;
  if (!term) return { kind: "notFound" };
  const allUrl = listingUrl(type.urlPattern, route.locale, config.format);
  const base = term.url ?? allUrl;
  const page = route.paged ? Number(params.page) : 1;
  if (route.paged && (!Number.isInteger(page) || page < 2)) return { kind: "redirect", to: base };
  // The term's own slug is the canonical one in this locale: a slug of another locale redirects.
  if (term.slug !== slug) return { kind: "redirect", to: pagedUrl(base, page, route.locale) };
  const [{ data: posts, meta }, terms] = await Promise.all([listPosts(route.locale, page, term.id, PAGE_SIZE, mode), getTerms(route.taxonomy!, route.locale, mode)]);
  if (page > Math.max(meta.pageCount, 1)) return { kind: "notFound" };
  const alternates = term.meta.alternates.map((a) => ({ locale: a.locale, url: a.url ? pagedUrl(a.url, page, a.locale) : null }));
  return { kind: "ok", props: { locale: route.locale, title: term.name, description: term.description, posts, meta, base, allUrl, terms, current: term, alternates } };
}
