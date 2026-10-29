// The CMS calls this on every change (the project's webhook). After checking the
// signature, the site:
// 1. expires every cache tag of the event (`data.tags`: "type:post", "entry:<id>",
//    "menus", "settings", "taxonomy:<x>"...) with revalidateTag. Only data read by
//    "revalidate" routes carries those tags, so static pages are left alone;
// 2. revalidates the paths of the event (`data.paths`) that belong to a
//    "revalidate" or "dynamic" route, at the internal [locale] path Next renders;
// 3. when a static type, or something every page uses (menus, settings, schema,
//    taxonomies), changed, asks for a rebuild through ASTRAL_REBUILD_HOOK;
// 4. on "site.rebuild" (the admin's button), expires everything and asks for the rebuild.
//
// On a CDN, the same paths and tags are what to purge: add the CDN's purge call
// next to `requestRebuild`, with the same `paths` and `tags`.
import { revalidatePath, revalidateTag } from "next/cache";
import { localeOfPath, pathOf, pathsOf, tagsOf, typesOf, verifyWebhook } from "@/lib/astral";
import { config, typeOf } from "@/lib/config";
import { env } from "@/lib/env";
import { internalPath, matchRoute } from "@/lib/routes";

const GLOBAL_TAGS = ["menus", "settings", "schema"];
const NOW = { expire: 0 };

export async function POST(request: Request) {
  const raw = await request.text();
  const result = await verifyWebhook(raw, request.headers, env.webhookSecret);
  if (!result.ok) return Response.json({ ok: false, error: result.reason }, { status: result.reason === "missing_secret" ? 503 : 401 });

  const { payload } = result;
  const paths = pathsOf(payload);
  const tags = tagsOf(payload);
  const staticTypes = typesOf(payload).filter((apiId) => (typeOf(apiId)?.render ?? "static") === "static");
  const touchesGlobal = tags.some((tag) => GLOBAL_TAGS.includes(tag) || tag.startsWith("taxonomy:"));
  const needsRebuild = payload.event === "site.rebuild" || staticTypes.length > 0 || touchesGlobal;

  const revalidated: string[] = [];
  if (payload.event === "site.rebuild") {
    revalidatePath("/", "layout");
    revalidated.push("/");
  } else {
    for (const tag of tags) revalidateTag(tag, NOW);
    for (const url of paths) {
      const host = /^https?:\/\//.test(url) ? new URL(url).host : undefined;
      const { locale } = localeOfPath(pathOf(url) ?? "/", config.format, host);
      const match = matchRoute(config.routes, locale, pathOf(url) ?? "/");
      if (!match || match.route.mode === "static") continue;
      const internal = internalPath(url, locale, config.format);
      revalidatePath(internal);
      revalidated.push(internal);
    }
  }

  const rebuild = needsRebuild ? await requestRebuild(payload.event) : "not_needed";
  return Response.json({ ok: true, event: result.event, purged: tags.length + revalidated.length, paths, revalidated, tags, rebuild });
}

export function GET() {
  return Response.json({ ok: false, error: "method_not_allowed" }, { status: 405 });
}

/** POSTs to the deploy hook (Dokploy, GitHub, any CI). Without one, the answer says so and the admin's build status stays as it was. */
async function requestRebuild(reason: string): Promise<"requested" | "no_hook" | "failed"> {
  if (!env.rebuildHook) return "no_hook";
  try {
    const response = await fetch(env.rebuildHook, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ event_type: "astral-rebuild", reason, at: new Date().toISOString() }) });
    return response.ok ? "requested" : "failed";
  } catch {
    return "failed";
  }
}
