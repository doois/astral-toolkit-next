"use client";

// The live postlist island, the toolkit's only client component: it starts with
// the server-rendered cards (children), fetches the site's own JSON endpoint
// (src/app/api/astral/posts/route.ts, which keeps the CMS key on the server) and
// swaps in the current cards. When the fetch fails the server list stays.

import { useEffect, useState, type ReactNode } from "react";
import { reactImageProps } from "@/lib/img-props";

export type LiveCard = {
  url: string | null;
  title: string;
  excerpt: string | null;
  date: string | null;
  dateLabel: string;
  category: { name: string; url: string | null } | null;
  cover: Record<string, string | number> | null;
};

declare module "react" {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      "astral-live-list": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { "data-url"?: string; "data-locale"?: string; "data-loading"?: string; "data-state"?: string };
    }
  }
}

export function LiveList({ url, locale, loading, children }: { url: string; locale: string; loading: string; children: ReactNode }) {
  const [cards, setCards] = useState<LiveCard[] | null>(null);
  const [state, setState] = useState<"loading" | "ready">("loading");

  useEffect(() => {
    const controller = new AbortController();
    fetch(url, { headers: { accept: "application/json" }, signal: controller.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((body: { data: LiveCard[] }) => {
        if (body.data.length) setCards(body.data);
      })
      .catch(() => undefined)
      .finally(() => {
        if (!controller.signal.aborted) setState("ready");
      });
    return () => controller.abort();
  }, [url]);

  return (
    <astral-live-list data-url={url} data-locale={locale} data-loading={loading} data-state={state} aria-busy={state === "loading" ? true : undefined}>
      {cards ? (
        <ul className="post-grid">
          {cards.map((post) => (
            <li key={post.url ?? post.title}>
              <article className="post-card">
                {post.cover && (
                  <a className="post-card__media" href={post.url ?? "#"} tabIndex={-1} aria-hidden="true">
                    {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
                    <img {...reactImageProps(post.cover)} loading="lazy" decoding="async" alt="" />
                  </a>
                )}
                <div className="post-card__meta">
                  {post.date && <time dateTime={post.date}>{post.dateLabel}</time>}
                  {post.category && (post.category.url ? <a href={post.category.url}>{post.category.name}</a> : <span>{post.category.name}</span>)}
                </div>
                <h3 className="post-card__title">
                  <a href={post.url ?? "#"}>{post.title}</a>
                </h3>
                {post.excerpt && <p className="post-card__excerpt">{post.excerpt}</p>}
              </article>
            </li>
          ))}
        </ul>
      ) : (
        children
      )}
    </astral-live-list>
  );
}
