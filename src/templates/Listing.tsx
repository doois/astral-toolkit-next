// The blog: a page of posts with the category filter (links, so the filter is
// crawlable and works without JavaScript) and pagination.
import { Pagination } from "@/components/Pagination";
import { PostCard } from "@/components/PostCard";
import type { RenderMode } from "@/lib/astral";
import { t } from "@/lib/i18n";
import type { ListingProps } from "@/lib/resolve";
import type { Head } from "@/lib/site";

export function listingHead(props: ListingProps, path: string, mode: RenderMode): Head {
  const ui = t(props.locale);
  const { meta, title } = props;
  return {
    locale: props.locale,
    mode,
    path,
    title: meta.page > 1 ? `${title} (${ui.page(meta.page, meta.pageCount)})` : title,
    description: props.description,
    alternates: props.alternates,
    canonical: meta.page > 1 ? path : props.base,
    currentPath: props.allUrl.replace(/^https?:\/\/[^/]+/, "") || "/",
  };
}

export function Listing({ locale, title, description, posts, meta, base, allUrl, terms, current }: ListingProps) {
  const ui = t(locale);
  return (
    <div className="container">
      <header className="page-header">
        <p className="eyebrow">{ui.blog}</p>
        <h1>{title}</h1>
        {description && <p className="lede">{description}</p>}
      </header>
      {terms.length > 0 && (
        <nav className="filters" aria-label={ui.categories}>
          <a href={allUrl} aria-current={current ? undefined : "page"}>
            {ui.allCategories}
          </a>
          {terms.map((term) => (
            <a key={term.id} href={term.url ?? allUrl} aria-current={current?.id === term.id ? "page" : undefined}>
              {term.name}
              {typeof term.count === "number" && <span className="visually-hidden"> ({term.count})</span>}
            </a>
          ))}
        </nav>
      )}
      {posts.length ? (
        <ul className="post-grid">
          {posts.map((post) => (
            <li key={post.id}>
              <PostCard post={post} locale={locale} headingLevel="h2" />
            </li>
          ))}
        </ul>
      ) : (
        <p className="empty">{ui.noPosts}</p>
      )}
      <Pagination page={meta.page} pageCount={meta.pageCount} base={base} locale={locale} />
    </div>
  );
}
