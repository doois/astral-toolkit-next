// Everything the templates read from the CMS goes through here: one client, one
// getter per thing, cached the way the render mode of the page asks:
//
// - static:     "use cache" with the `static` life (a year) and no CMS tag, so only
//               a new build changes it (the webhook asks for one).
// - revalidate: "use cache" with the `max` life and the CMS cache tags
//               ("type:post", "entry:<id>", "menus", "settings", "taxonomy:<x>");
//               the webhook expires them with revalidateTag.
// - dynamic:    no cache at all, one fetch per request (deduplicated within the
//               request by React `cache`); the page called connection() first.
//
// Every getter takes the mode of the page it renders for. Field shapes follow astral.model.json; narrow them further in your own site.

import { cacheLife, cacheTag } from "next/cache";
import { cache } from "react";
import { AstralHttpError, createClient, isNotFound, type Block, type Entry, type JsonLd, type ListResult, type Media, type Menu, type RenderMode, type Term } from "./astral";
import { env } from "./env";

export const cms = createClient({ url: env.url, project: env.project, token: env.token || undefined, retries: 3 });

export type Link = { label: string; url: string; newTab: boolean | null };
export type Settings = Entry<{ siteName: string; logo: Media | null; description: string | null; social: Link[] | null; footerText: string | null; contactEmail: string | null }>;
export type Author = Entry<{ name: string; photo: Media | null; bio: string | null }>;
export type Post = Entry<{ title: string; excerpt: string | null; cover: Media | null; body: string | null; date: string | null; author: Author | null; category: Term[] | null }>;
export type Page = Entry<{ title: string; blocks: Block[] | null }>;
export type Home = Entry<{ blocks: Block[] | null }>;
export type TermWithMeta = Awaited<ReturnType<typeof cms.term>>;

export const POST_TYPE = "post";
export const CATEGORY = "category";
export const PAGE_SIZE = 9;

/** A 404 from the API becomes the fallback; anything else (a bad key, the CMS down) still fails the build or the request. */
function fallback<T>(value: T) {
  return (error: unknown): T => {
    if (isNotFound(error)) return value;
    throw error;
  };
}

const bareSettings = (locale: string): Settings => ({ id: "single", type: "settings", locale, meta: { url: null, publishedAt: null, updatedAt: new Date(0).toISOString() }, siteName: env.project, logo: null, description: null, social: null, footerText: null, contactEmail: null });
const emptyList = (pageSize: number): ListResult<Post> => ({ data: [], meta: { page: 1, pageSize, offset: 0, total: 0, pageCount: 0 } });

// The loaders: plain CMS calls, each with the tags of what it returns.
const LOADERS = {
  settings: (locale: string) => cms.single<Settings>("settings", { locale }).catch(fallback(bareSettings(locale))),
  menu: (apiId: string, locale: string) => cms.menu(apiId, locale).catch(fallback<Menu>({ apiId, name: apiId, items: [] })),
  jsonLd: () => cms.jsonLd().catch(() => null as JsonLd | null),
  terms: (taxonomy: string, locale: string) => cms.terms(taxonomy, locale).catch(fallback<Term[]>([])),
  term: (taxonomy: string, ref: string, locale: string) => cms.term(taxonomy, ref, locale).catch(fallback<TermWithMeta | null>(null)),
  entry: (type: string, ref: string, locale: string) => cms.get(type, ref, { locale, populate: 2 }).catch(fallback<Entry | null>(null)),
  single: (type: string, locale: string) => cms.single(type, { locale, populate: 2 }).catch(fallback<Entry | null>(null)),
  all: (type: string, locale: string) => cms.listAll(type, { locale, populate: 0 }).then((list) => [...list]),
  posts: (locale: string, page: number, category: string, pageSize: number) =>
    cms.list<Post>(POST_TYPE, { locale, page, pageSize, sort: "date:desc", populate: 1, ...(category ? { filter: { [CATEGORY]: category } } : {}) }).catch(fallback(emptyList(pageSize))),
  // null when the project has no site address yet (the route assembles the XML from /sitemap then).
  sitemapXml: () => cms.sitemapXml().catch((error: unknown) => {
    if (error instanceof AstralHttpError && error.code === "site_url_required") return null;
    throw error;
  }),
  sitemap: () => cms.sitemap(),
};

type Loaders = typeof LOADERS;
type Name = keyof Loaders;
type Result<N extends Name> = Awaited<ReturnType<Loaders[N]>>;

const call = <N extends Name>(name: N, args: Parameters<Loaders[N]>) => (LOADERS[name] as (...a: unknown[]) => Promise<Result<N>>)(...args);

/** The cached read: arguments, mode and tags are the cache key. */
async function cachedRead<N extends Name>(name: N, args: Parameters<Loaders[N]>, mode: "static" | "revalidate", tags: string[]): Promise<Result<N>> {
  "use cache";
  if (mode === "static") {
    cacheLife("static");
  } else {
    cacheLife("max");
    cacheTag(...tags);
  }
  const value = await call(name, args);
  // An entry is also tagged by its document id, known only once it arrives.
  if (mode === "revalidate" && value && typeof value === "object" && "id" in value && "meta" in value && typeof value.id === "string") cacheTag(`entry:${value.id}`);
  return value;
}

/** One uncached read per request and arguments. */
const liveRead = cache((name: Name, key: string) => call(name, JSON.parse(key)));

function read<N extends Name>(name: N, args: Parameters<Loaders[N]>, tags: string[], mode: RenderMode): Promise<Result<N>> {
  if (mode === "dynamic") return liveRead(name, JSON.stringify(args)) as Promise<Result<N>>;
  return cachedRead(name, args, mode, tags);
}

/** Settings, or a bare set with the project slug as name while the single is not published. */
export const getSettings = (locale: string, mode: RenderMode) => read("settings", [locale], ["type:settings", "settings"], mode);

export const getMenu = (apiId: string, locale: string, mode: RenderMode) => read("menu", [apiId, locale], ["menus", `menu:${apiId}`], mode);

export const getSiteJsonLd = (mode: RenderMode) => read("jsonLd", [], ["settings"], mode);

export const getTerms = (taxonomy: string, locale: string, mode: RenderMode) => read("terms", [taxonomy, locale], [`taxonomy:${taxonomy}`], mode);

export const getTerm = (taxonomy: string, ref: string, locale: string, mode: RenderMode) => read("term", [taxonomy, ref, locale], [`taxonomy:${taxonomy}`], mode);

/** One entry by slug or id, or null when it does not exist (a 404), with relations two levels deep. */
export const getEntry = (type: string, ref: string, locale: string, mode: RenderMode) => read("entry", [type, ref, locale], [`type:${type}`], mode);

export const getSingle = (type: string, locale: string, mode: RenderMode) => read("single", [type, locale], [`type:${type}`], mode);

/** Every entry of a collection in a locale (for generateStaticParams). */
export const listAll = (type: string, locale: string) => read("all", [type, locale], [`type:${type}`], "static");

/** One page of posts, newest first, optionally inside a category (slug in any locale or id). */
export const listPosts = (locale: string, page: number, category: string | undefined, pageSize: number, mode: RenderMode) => read("posts", [locale, page, category ?? "", pageSize], [`type:${POST_TYPE}`], mode);

/** The sitemap follows every type that refreshes without a build. */
export const getSitemapXml = (tags: string[]) => read("sitemapXml", [], ["sitemap", ...tags], "revalidate");
export const getSitemap = (tags: string[]) => read("sitemap", [], ["sitemap", ...tags], "revalidate");
