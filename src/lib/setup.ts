// Runs once, when next.config loads for `next build` or `next dev`: reads the
// CMS schema and redirects and turns them into what Next needs before it
// compiles anything. The route table and locale format are frozen into the
// build (next.config `env.ASTRAL_CONFIG`, read by src/lib/config.ts); the
// locale URL format becomes rewrites onto the [locale] segment; CMS redirects
// become Next redirects.

import type { NextConfig } from "next";
import { createClient, localeFormat, type LocaleFormat, type Redirect, type Schema } from "./astral";
import { env, requireEnv } from "./env";
import { buildRoutes, type AstralConfig } from "./routes";

type Rewrite = { source: string; destination: string; has?: { type: "host"; value: string }[] };
type NextRedirect = Awaited<ReturnType<NonNullable<NextConfig["redirects"]>>>[number];

export async function loadAstral() {
  requireEnv();
  const client = createClient({ url: env.url, project: env.project, token: env.token || undefined, retries: 3 });
  let schema: Schema;
  let redirects: Redirect[] = [];
  try {
    [schema, redirects] = await Promise.all([client.schema(), client.redirects().catch(() => [] as Redirect[])]);
  } catch (error) {
    throw new Error(`Astral: não foi possível ler ${client.apiUrl}/schema (${error instanceof Error ? error.message : String(error)}). Confira ASTRAL_URL, ASTRAL_PROJECT e ASTRAL_TOKEN.`);
  }
  const format = localeFormat(schema, { mode: env.localeUrls || undefined });
  // "none" gives every locale the same paths: one build per locale (ASTRAL_BUILD_LOCALES, default: the default locale).
  const wanted = env.buildLocales.split(",").map((l) => l.trim()).filter((l) => format.locales.includes(l));
  const locales = format.mode === "none" ? [wanted[0] ?? format.defaultLocale] : wanted.length ? wanted : format.locales;
  const config: AstralConfig = { format, locales, routes: buildRoutes(schema, format, locales), types: schema.types, taxonomies: schema.taxonomies, builtAt: new Date().toISOString() };

  const summary = schema.types.filter((t) => t.urlPattern).map((t) => `${t.apiId}: ${t.render ?? "static"}`).join(", ");
  console.log(`[astral] ${config.routes.length} rotas de ${locales.join(", ")} (${format.mode}); ${summary}; ${redirects.length} redirecionamentos`);
  return { config, rewrites: rewritesOf(format, locales), redirects: [...localeRedirects(format, locales), ...cmsRedirects(redirects)] };
}

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
/** path-to-regexp treats these as syntax in a literal path. */
const escapePath = (value: string) => value.replace(/[:*?+()[\]{}\\!]/g, "\\$&");
const hostOf = (url: string) => url.replace(/^https?:\/\//, "").replace(/[/:].*$/, "");

/**
 * Every public URL is rewritten onto app/[locale]/[[...path]]: the locale comes
 * from the path where the format puts it there, from the host in "domain", and
 * is the default (or the build's) locale otherwise. Files, /api, /preview,
 * sitemap.xml and robots.txt are matched before these rewrites (afterFiles).
 */
function rewritesOf(format: LocaleFormat, locales: string[]): Rewrite[] {
  const fallback = locales.includes(format.defaultLocale) ? format.defaultLocale : locales[0]!;
  switch (format.mode) {
    case "prefix": {
      const others = locales.filter((l) => l !== format.defaultLocale).map(escapeRegex);
      const source = others.length ? `/:path((?!(?:${others.join("|")})(?:/|$)).*)` : "/:path(.*)";
      return locales.includes(format.defaultLocale) ? [{ source: "/", destination: `/${format.defaultLocale}` }, { source, destination: `/${format.defaultLocale}/:path` }] : [];
    }
    case "prefix-all":
      return [];
    case "domain": {
      const byHost = locales
        .filter((l) => format.domains[l])
        .flatMap((l) => [
          { source: "/", has: [{ type: "host" as const, value: hostOf(format.domains[l]!) }], destination: `/${l}` },
          { source: "/:path(.*)", has: [{ type: "host" as const, value: hostOf(format.domains[l]!) }], destination: `/${l}/:path` },
        ]);
      return [...byHost, { source: "/", destination: `/${fallback}` }, { source: "/:path(.*)", destination: `/${fallback}/:path` }];
    }
    case "none":
      return [{ source: "/", destination: `/${fallback}` }, { source: "/:path(.*)", destination: `/${fallback}/:path` }];
  }
}

/** The internal [locale] paths are never public: "/pt-BR/sobre" goes to "/sobre" in "prefix"; "prefix-all" opens at the default locale. */
function localeRedirects(format: LocaleFormat, locales: string[]): NextRedirect[] {
  if (format.mode === "prefix" && locales.includes(format.defaultLocale)) {
    const d = escapePath(format.defaultLocale);
    return [
      { source: `/${d}`, destination: "/", permanent: true },
      { source: `/${d}/:path(.*)`, destination: "/:path", permanent: true },
    ];
  }
  if (format.mode === "prefix-all") return [{ source: "/", destination: `/${format.defaultLocale}`, permanent: false }];
  return [];
}

const STATUSES = [301, 302, 303, 307, 308] as const;

function cmsRedirects(redirects: Redirect[]): NextRedirect[] {
  return redirects
    .filter((r) => r.from.startsWith("/") && r.from !== r.to)
    .map((r) => {
      const statusCode = STATUSES.find((s) => s === r.status) ?? 301;
      return { source: escapePath(r.from.replace(/\/+$/, "") || "/"), destination: r.to, statusCode } as NextRedirect;
    });
}
