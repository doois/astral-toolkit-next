import { Img } from "./Img";
import type { Post } from "@/lib/cms";
import { formatDate } from "@/lib/i18n";

export const CARD_SIZES = "(min-width: 64em) 24rem, (min-width: 40em) 50vw, 100vw";

export function PostCard({ post, locale, headingLevel: Heading = "h3" }: { post: Post; locale: string; headingLevel?: "h2" | "h3" }) {
  const category = post.category?.[0] ?? null;
  return (
    <article className="post-card">
      {post.cover && (
        <a className="post-card__media" href={post.meta.url ?? "#"} tabIndex={-1} aria-hidden="true">
          <Img media={post.cover} sizes={CARD_SIZES} alt="" />
        </a>
      )}
      <div className="post-card__meta">
        {post.date && <time dateTime={post.date}>{formatDate(post.date, locale)}</time>}
        {category && (category.url ? <a href={category.url}>{category.name}</a> : <span>{category.name}</span>)}
      </div>
      <Heading className="post-card__title">
        <a href={post.meta.url ?? "#"}>{post.title}</a>
      </Heading>
      {post.excerpt && <p className="post-card__excerpt">{post.excerpt}</p>}
    </article>
  );
}
