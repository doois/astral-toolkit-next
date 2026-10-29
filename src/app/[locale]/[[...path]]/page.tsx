// The one route of the site's content: every type, listing and term archive, in
// every locale, at the URL the CMS gives it. The route table comes from the
// schema (src/lib/config.ts); the render mode of the matched route decides how
// the page is produced (README, "Modos de renderização"):
//
// - static and revalidate: prerendered from generateStaticParams; the data is
//   "use cache" (src/lib/cms.ts), so a URL that was not built ahead (a post
//   published after the build) renders on its first visit and is kept.
//   revalidate data carries the CMS tags that the webhook expires.
// - dynamic: the page awaits connection() before reading anything, so it is
//   rendered per request with uncached reads and never stored.
//
// `instant = false` lets a dynamic page block on its data instead of requiring
// a static shell with Suspense fallbacks: the document arrives complete.
import type { Metadata } from "next";
import { cookies, draftMode } from "next/headers";
import { notFound, permanentRedirect } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";
import { Shell } from "@/components/Shell";
import { pathOf, type Entry as AnyEntry } from "@/lib/astral";
import { cms, getSettings } from "@/lib/cms";
import { t } from "@/lib/i18n";
import { PREVIEW_COOKIE } from "@/lib/preview";
import { prerenderedPaths, resolve, routeOf, type Resolved } from "@/lib/resolve";
import { toMetadata, type Head } from "@/lib/site";
import { Entry, entryHead } from "@/templates/Entry";
import { Listing, listingHead } from "@/templates/Listing";

export const instant = false;

type Params = { locale: string; path?: string[] };

export async function generateStaticParams({ params }: { params: { locale: string } }) {
  const paths = await prerenderedPaths(params.locale);
  return paths.map((path) => ({ path }));
}

/** The draft behind the preview cookie, when draft mode is on and the draft lives at this path. */
async function draftAt(path: string): Promise<AnyEntry | null> {
  const token = (await cookies()).get(PREVIEW_COOKIE)?.value;
  if (!token) return null;
  const entry = await cms.preview(token).catch(() => null);
  return entry && (pathOf(entry.meta.url) ?? "") === path ? entry : null;
}

type Loaded = { resolved: Resolved; head: Head | null; draft: boolean };

/** One resolution per request, shared by generateMetadata and the page. */
const load = cache(async (locale: string, key: string): Promise<Loaded> => {
  const segments = key ? key.split("/") : [];
  const found = routeOf(locale, segments);
  const mode = found?.route.mode ?? "static";
  // Before any read: from here on the render belongs to this request.
  if (mode === "dynamic") await connection();

  if ((await draftMode()).isEnabled && found) {
    const draft = await draftAt(found.path);
    if (draft) {
      const resolved: Resolved = { kind: "entry", mode, route: found.route, path: found.path, entry: draft, locale: draft.locale };
      return { resolved, head: await entryHead(draft, draft.locale, found.path, "dynamic", true), draft: true };
    }
  }
  const resolved = await resolve(locale, segments);
  const head = resolved.kind === "entry" ? await entryHead(resolved.entry, resolved.locale, resolved.path, resolved.mode, false) : resolved.kind === "listing" ? listingHead(resolved.props, resolved.path, resolved.mode) : null;
  return { resolved, head, draft: false };
});

const keyOf = (path: string[] | undefined) => (path ?? []).join("/");

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale, path } = await params;
  const { head } = await load(locale, keyOf(path));
  if (!head) return {};
  return toMetadata(head, await getSettings(head.locale, head.mode));
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const { locale, path } = await params;
  const { resolved, head, draft } = await load(locale, keyOf(path));
  if (resolved.kind === "redirect") permanentRedirect(resolved.to);
  if (resolved.kind === "notFound" || !head) notFound();

  const banner = draft ? (
    <div className="preview-banner" role="status">
      {t(head.locale).draftPreview}
    </div>
  ) : null;

  return (
    <Shell head={head} banner={banner}>
      {resolved.kind === "entry" ? <Entry entry={resolved.entry} locale={resolved.locale} mode={head.mode} /> : <Listing {...resolved.props} />}
    </Shell>
  );
}
