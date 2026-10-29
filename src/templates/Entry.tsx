// Picks the template of an entry by its type. Types the toolkit does not know
// get the generic one: title, then every richtext and blocks field in order.
// Each template has a head (what generateMetadata and the JSON-LD use) and a view.
import { Blocks } from "@/blocks/Blocks";
import { fillPattern, hasRichText, type Block, type Entry as AnyEntry, type RenderMode } from "@/lib/astral";
import { getSettings, type Home, type Page, type Post as PostEntry } from "@/lib/cms";
import { config, typeOf } from "@/lib/config";
import type { Head } from "@/lib/site";
import { Post, postHead } from "./Post";

const titleOf = (entry: AnyEntry) => {
  const type = typeOf(entry.type);
  const field = type?.fields.find((f) => f.type === "text")?.apiId ?? "title";
  return String(entry[field] ?? type?.name ?? entry.type);
};

export async function entryHead(entry: AnyEntry, locale: string, path: string, mode: RenderMode, preview: boolean): Promise<Head> {
  const seo = entry.seo;
  const noindex = preview || seo?.noindex;
  if (entry.type === "home") {
    const settings = await getSettings(locale, mode);
    const alternates = config.format.locales.map((l) => ({ locale: l, url: fillPattern("/", { slug: "", locale: l }, config.format) }));
    return { locale, mode, path, title: seo?.title ?? settings.siteName, description: seo?.description ?? settings.description, image: seo?.image, canonical: seo?.canonical, alternates, noindex };
  }
  if (entry.type === "post") return postHead(entry as PostEntry, locale, path, mode, preview);
  if (entry.type === "page") return { locale, mode, path, title: seo?.title ?? (entry as Page).title, description: seo?.description, image: seo?.image, canonical: seo?.canonical, alternates: entry.meta.alternates, noindex };
  return { locale, mode, path, title: seo?.title ?? titleOf(entry), description: seo?.description, image: seo?.image, alternates: entry.meta.alternates, noindex };
}

export function Entry({ entry, locale, mode }: { entry: AnyEntry; locale: string; mode: RenderMode }) {
  if (entry.type === "home") return <Blocks blocks={(entry as Home).blocks} locale={locale} mode={mode} />;
  if (entry.type === "post") return <Post entry={entry as PostEntry} locale={locale} />;
  if (entry.type === "page") {
    // A page is its blocks. When the first block is not a hero, the title opens the page.
    const page = entry as Page;
    const blocks = page.blocks ?? [];
    return (
      <>
        {blocks[0]?.component !== "hero" && (
          <header className="container page-header">
            <h1>{page.title}</h1>
          </header>
        )}
        <Blocks blocks={blocks} locale={locale} mode={mode} />
      </>
    );
  }
  const sections = (typeOf(entry.type)?.fields ?? []).filter((f) => f.type === "richtext" || f.type === "blocks");
  return (
    <>
      <header className="container page-header">
        <h1>{titleOf(entry)}</h1>
      </header>
      {sections.map((field) =>
        field.type === "blocks" ? (
          <Blocks key={field.apiId} blocks={entry[field.apiId] as Block[] | null} locale={locale} mode={mode} />
        ) : hasRichText(entry[field.apiId]) ? (
          <section key={field.apiId} className="block container container--narrow">
            <div className="prose" dangerouslySetInnerHTML={{ __html: entry[field.apiId] as string }} />
          </section>
        ) : null,
      )}
    </>
  );
}
