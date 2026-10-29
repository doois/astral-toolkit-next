// Data for the live postlist island: the newest posts as ready-to-render cards.
// The CMS key stays on the server; the browser only ever talks to the site.
// The list is read like a "revalidate" page (tagged "type:post"), so a publish
// shows up on the next call; a CDN may keep the answer for a minute.
import type { NextRequest } from "next/server";
import { imageAttrs } from "@/lib/astral";
import { listPosts } from "@/lib/cms";
import { CARD_SIZES } from "@/components/PostCard";
import { config } from "@/lib/config";
import { formatDate } from "@/lib/i18n";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const locale = config.locales.includes(params.get("locale") ?? "") ? params.get("locale")! : config.format.defaultLocale;
  const limit = Math.min(Math.max(Number(params.get("limit")) || 3, 1), 12);
  const category = params.get("category")?.trim() || undefined;
  const { data } = await listPosts(locale, 1, category, limit, "revalidate");
  const cards = data.map((post) => {
    const term = post.category?.[0] ?? null;
    const cover = post.cover ? imageAttrs(post.cover, { sizes: CARD_SIZES, alt: "" }) : null;
    return {
      url: post.meta.url,
      title: post.title,
      excerpt: post.excerpt,
      date: post.date,
      dateLabel: formatDate(post.date, locale),
      category: term ? { name: term.name, url: term.url } : null,
      cover: cover ? { src: cover.src, ...(cover.srcset ? { srcset: cover.srcset, sizes: cover.sizes } : {}), ...(cover.width ? { width: cover.width, height: cover.height } : {}), ...(cover.style ? { style: cover.style } : {}) } : null,
    };
  });
  return Response.json({ data: cards }, { headers: { "cache-control": "public, max-age=0, s-maxage=60, stale-while-revalidate=600" } });
}
