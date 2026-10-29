// The latest posts. With `live`, the server-rendered list is also an island:
// a small client component fetches /api/astral/posts in the browser and replaces
// the cards, so a static page shows new posts before the next build. It is the
// only client component of the toolkit, and only on pages with a live list.
import { LiveList } from "@/components/LiveList";
import { PostCard } from "@/components/PostCard";
import { listPosts, type Link } from "@/lib/cms";
import { t } from "@/lib/i18n";
import { headingOf, type BlockProps } from "./types";

type Fields = { title: string | null; text: string | null; limit: number | null; category: string | null; live: boolean | null; link: Link | null };

export async function PostList({ block, locale, index, mode }: BlockProps<Fields>) {
  const ui = t(locale);
  const limit = Math.min(Math.max(Number(block.limit) || 3, 1), 12);
  const category = block.category?.trim() || undefined;
  const { data: posts } = await listPosts(locale, 1, category, limit, mode);
  const Heading = headingOf(index);
  const list = posts.length ? (
    <ul className="post-grid">
      {posts.map((post) => (
        <li key={post.id}>
          <PostCard post={post} locale={locale} />
        </li>
      ))}
    </ul>
  ) : (
    <p className="empty">{ui.noPosts}</p>
  );
  const liveUrl = block.live === true ? `/api/astral/posts?${new URLSearchParams({ locale, limit: String(limit), ...(category ? { category } : {}) })}` : null;

  return (
    <section className="block block-postlist postlist" data-block={block.key}>
      <div className="container">
        {(block.title || block.text) && (
          <div className="block__head">
            {block.title && <Heading>{block.title}</Heading>}
            {block.text && <p className="lede">{block.text}</p>}
          </div>
        )}
        {liveUrl ? (
          <LiveList url={liveUrl} locale={locale} loading={ui.loading}>
            {list}
          </LiveList>
        ) : (
          <astral-live-list data-locale={locale} data-loading={ui.loading}>
            {list}
          </astral-live-list>
        )}
        {block.link?.url && (
          <p className="postlist__foot">
            <a className="arrow-link" href={block.link.url}>
              {block.link.label}
            </a>
          </p>
        )}
      </div>
    </section>
  );
}
