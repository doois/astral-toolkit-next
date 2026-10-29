// What every page's <head> carries, computed once per page and used twice: by
// generateMetadata (title, description, canonical, hreflang, Open Graph,
// robots) and by the page itself (the JSON-LD graph). Mirrors the Astro
// toolkit's layouts/Base.astro.

import type { Metadata } from "next";
import { fillPattern, type JsonLd, type Media, type RenderMode } from "./astral";
import { config } from "./config";
import type { Settings } from "./cms";
import { env } from "./env";

export type Head = {
  locale: string;
  /** The render mode of the route: every CMS read of the page uses it (src/lib/cms.ts). */
  mode: RenderMode;
  /** The public path being rendered ("/en/blog/x"). */
  path: string;
  title: string;
  description?: string | null;
  /** Share image (og:image). */
  image?: Media | null;
  /** The page's own canonical path or URL; default: the current path. */
  canonical?: string | null;
  /** The same page in other locales (hreflang and the language switcher). */
  alternates?: { locale: string; url: string | null }[];
  noindex?: boolean;
  /** schema.org items added to the site's graph (Organization, WebSite). */
  jsonLd?: Record<string, unknown>[];
  ogType?: "website" | "article";
  /** The header's current item: the path the menu should mark (default: the current path). */
  currentPath?: string;
};

/** The home of a locale ("/" or "/en"). */
export const homeOf = (locale: string) => fillPattern("/", { slug: "", locale }, config.format);

export const absolute = (path: string) => (/^https?:\/\//.test(path) ? path : new URL(path, env.siteUrl).href);

function computed(head: Head, settings: Settings) {
  const siteName = settings.siteName || env.project;
  const fullTitle = head.title && head.title !== siteName ? `${head.title} · ${siteName}` : siteName;
  const description = head.description || settings.description || "";
  const canonical = absolute(head.canonical || head.path);
  const ogImage = head.image?.url ?? settings.logo?.url ?? null;
  // hreflang: every locale the page exists in, plus x-default on the default locale.
  const languages = (head.alternates ?? []).filter((a) => a.url).map((a) => ({ locale: a.locale, href: absolute(a.url!) }));
  const xDefault = languages.find((a) => a.locale === config.format.defaultLocale) ?? languages[0];
  return { siteName, fullTitle, description, canonical, ogImage, languages, xDefault };
}

export function toMetadata(head: Head, settings: Settings): Metadata {
  const c = computed(head, settings);
  const image = head.image;
  return {
    title: { absolute: c.fullTitle },
    ...(c.description ? { description: c.description } : {}),
    alternates: {
      canonical: c.canonical,
      ...(c.languages.length > 1 ? { languages: { ...Object.fromEntries(c.languages.map((a) => [a.locale, a.href])), ...(c.xDefault ? { "x-default": c.xDefault.href } : {}) } } : {}),
    },
    ...(head.noindex ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      type: head.ogType ?? "website",
      siteName: c.siteName,
      title: c.fullTitle,
      ...(c.description ? { description: c.description } : {}),
      url: c.canonical,
      locale: head.locale.replace("-", "_"),
      ...(c.ogImage ? { images: [{ url: c.ogImage, ...(image?.width && image?.height ? { width: image.width, height: image.height } : {}) }] } : {}),
    },
    twitter: { card: c.ogImage ? "summary_large_image" : "summary" },
  };
}

/** The page's JSON-LD: the site graph from the CMS (Organization, WebSite), the WebPage, then the page's own items. */
export function jsonLdOf(head: Head, settings: Settings, siteGraph: JsonLd | null) {
  const c = computed(head, settings);
  const graph = [
    ...(siteGraph?.["@graph"] ?? []),
    { "@type": "WebPage", "@id": `${c.canonical}#webpage`, url: c.canonical, name: c.fullTitle, ...(c.description ? { description: c.description } : {}), inLanguage: head.locale, ...(c.ogImage ? { image: c.ogImage } : {}) },
    ...(head.jsonLd ?? []),
  ];
  return JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c");
}
