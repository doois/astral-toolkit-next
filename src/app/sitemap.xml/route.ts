// The sitemap the CMS already builds (hreflang, x-default, images). When the
// project has no site address yet, the same data is assembled here with
// SITE_URL. Prerendered at build; it carries the tags of every type that
// refreshes without a build, so a new post shows up after the webhook.
import { getSitemap, getSitemapXml } from "@/lib/cms";
import { config } from "@/lib/config";
import { env } from "@/lib/env";

const xml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export async function GET() {
  const tags = config.types.filter((t) => t.urlPattern && (t.render ?? "static") !== "static").map((t) => `type:${t.apiId}`);
  let body = await getSitemapXml(tags);
  if (body === null) {
    const { data } = await getSitemap(tags);
    const loc = (url: string) => (/^https?:\/\//.test(url) ? url : `${env.siteUrl}${url}`);
    body = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
      ...data.map((u) =>
        [
          "<url>",
          `<loc>${xml(loc(u.url))}</loc>`,
          `<lastmod>${u.lastmod}</lastmod>`,
          ...u.alternates.map((a) => `<xhtml:link rel="alternate" hreflang="${xml(a.locale)}" href="${xml(loc(a.url))}"/>`),
          ...u.images.map((i) => `<image:image><image:loc>${xml(i.loc)}</image:loc></image:image>`),
          "</url>",
        ].join(""),
      ),
      "</urlset>",
    ].join("\n");
  }
  return new Response(body, { headers: { "content-type": "application/xml; charset=utf-8" } });
}
