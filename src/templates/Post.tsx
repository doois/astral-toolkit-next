// A post: header, cover (the page's first image, so eager and high priority),
// body, author. JSON-LD comes from the CMS when the type has structured data
// mapped (meta.jsonLd); otherwise the toolkit builds the BlogPosting itself.
import { Img } from "@/components/Img";
import { hasRichText, type Media, type RenderMode } from "@/lib/astral";
import type { Post as PostEntry } from "@/lib/cms";
import { formatDate, t } from "@/lib/i18n";
import { absolute, type Head } from "@/lib/site";

export function postHead(entry: PostEntry, locale: string, path: string, mode: RenderMode, preview: boolean): Head {
  const cover: Media | null = entry.cover ?? entry.seo?.image ?? null;
  const url = entry.meta.url ? absolute(entry.meta.url) : undefined;
  const jsonLd = entry.meta.jsonLd ?? {
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: entry.title,
    ...(entry.excerpt ? { description: entry.excerpt } : {}),
    ...(cover ? { image: cover.url } : {}),
    ...(entry.date ? { datePublished: entry.date } : {}),
    dateModified: entry.meta.updatedAt,
    ...(entry.author ? { author: { "@type": "Person", name: entry.author.name } } : {}),
    inLanguage: locale,
    mainEntityOfPage: url,
  };
  return { locale, mode, path, title: entry.seo?.title ?? entry.title, description: entry.seo?.description ?? entry.excerpt, image: cover, canonical: entry.seo?.canonical, alternates: entry.meta.alternates, noindex: preview || entry.seo?.noindex, jsonLd: [jsonLd], ogType: "article" };
}

export function Post({ entry, locale }: { entry: PostEntry; locale: string }) {
  const ui = t(locale);
  const category = entry.category?.[0] ?? null;
  const author = entry.author;
  return (
    <article className="post">
      <header className="container post__header">
        {category && <p className="eyebrow">{category.url ? <a href={category.url}>{category.name}</a> : category.name}</p>}
        <h1>{entry.title}</h1>
        {entry.excerpt && <p className="lede post__lede">{entry.excerpt}</p>}
        <div className="post__byline">
          {author?.photo && <Img media={author.photo} sizes="36px" alt="" priority={false} />}
          {author && (
            <span>
              {ui.by} <strong>{author.name}</strong>
            </span>
          )}
          {entry.date && <time dateTime={entry.date}>{formatDate(entry.date, locale)}</time>}
        </div>
      </header>
      {entry.cover && (
        <div className="container post__cover">
          <Img media={entry.cover} sizes="(min-width: 74rem) 74rem, 100vw" priority={true} />
        </div>
      )}
      <div className="container post__body">{hasRichText(entry.body) && <div className="prose" dangerouslySetInnerHTML={{ __html: entry.body }} />}</div>
      {author && (
        <footer className="container post__footer">
          <div className="author-card">
            {author.photo && <Img media={author.photo} sizes="64px" alt="" priority={false} />}
            <div>
              <h3>{author.name}</h3>
              {author.bio && <p>{author.bio}</p>}
            </div>
          </div>
        </footer>
      )}
    </article>
  );
}
