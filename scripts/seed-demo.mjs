#!/usr/bin/env node
// Applies astral.model.json and the fake demo content to a project of an Astral
// CMS, through the admin API (the same endpoints the admin's "import from code"
// review uses). Safe to run again: what exists is updated, not duplicated.
//
// Environment:
//   ASTRAL_ADMIN_API       the admin API base, like http://localhost:3040/admin-api
//   ASTRAL_ADMIN_EMAIL     a super admin (projects are created by super admins)
//   ASTRAL_ADMIN_PASSWORD
//   ASTRAL_ADMIN_ORIGIN    optional: the admin's origin, for the CSRF check (default: the API's origin)
//   ASTRAL_SEED_PROJECT    optional: the project slug (default astral-demo)
//   ASTRAL_SEED_SITE_URL   optional: the site's public URL (default http://localhost:3000)
//
// Flags:
//   --write-env <file>     writes the site's .env (API key, webhook secret and id) when they are created
//   --prune                also removes types, taxonomies and components the model does not define
//                          (always done for a project this run creates, since a new project starts with the CMS defaults)
//
// Secrets (the API key and the webhook secret) are shown only once, by the CMS,
// when created. The script never prints them: with --write-env they go to that file.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ASSETS, AUTHORS, HOME, LOCALES, MENUS, PAGES, POSTS, SETTINGS, TERMS } from "./demo-content.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const model = JSON.parse(fs.readFileSync(path.join(here, "..", "astral.model.json"), "utf8"));

const env = (name, fallback) => {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    console.error(`Missing ${name}`);
    process.exit(1);
  }
  return value;
};
const API = env("ASTRAL_ADMIN_API").replace(/\/+$/, "");
const ORIGIN = env("ASTRAL_ADMIN_ORIGIN", new URL(API).origin);
const SLUG = env("ASTRAL_SEED_PROJECT", "astral-demo");
const SITE_URL = env("ASTRAL_SEED_SITE_URL", "http://localhost:3000").replace(/\/+$/, "");
const writeEnv = process.argv.includes("--write-env") ? process.argv[process.argv.indexOf("--write-env") + 1] : null;

let cookie = "";

async function call(method, route, body, { form = false, allow = [] } = {}) {
  const headers = { origin: ORIGIN, cookie };
  if (body && !form) headers["content-type"] = "application/json";
  const response = await fetch(`${API}${route}`, { method, headers, body: form ? body : body ? JSON.stringify(body) : undefined });
  const text = await response.text();
  const json = text ? JSON.parse(text) : {};
  if (!response.ok && !allow.includes(json.error)) throw new Error(`${method} ${route}: ${response.status} ${text.slice(0, 300)}`);
  return { status: response.status, ...json };
}
const get = (route) => call("GET", route);
const post = (route, body, opts) => call("POST", route, body, opts);
const put = (route, body) => call("PUT", route, body);
const patch = (route, body) => call("PATCH", route, body);

// ── Session and project ─────────────────────────────────────────────────

async function login() {
  const response = await fetch(`${API}/auth/login`, { method: "POST", headers: { "content-type": "application/json", origin: ORIGIN }, body: JSON.stringify({ email: env("ASTRAL_ADMIN_EMAIL"), password: env("ASTRAL_ADMIN_PASSWORD") }) });
  if (!response.ok) throw new Error(`login failed: ${response.status}`);
  cookie = (response.headers.getSetCookie?.() ?? []).map((c) => c.split(";")[0]).join("; ");
  const { mfa } = await response.json();
  if (mfa) throw new Error("this account needs a second factor: use one without MFA for seeding");
}

async function project() {
  const { projects } = await get("/me");
  const found = projects.find((p) => p.slug === SLUG);
  if (found) {
    console.log(`project ${SLUG}: exists (${found.id})`);
    return { id: found.id, created: false };
  }
  const { project: made } = await post("/projects", { name: "Astral Demo", slug: SLUG, locales: LOCALES, defaultLocale: LOCALES[0] });
  console.log(`project ${SLUG}: created (${made.id})`);
  return { id: made.id, created: true };
}

// ── The model ───────────────────────────────────────────────────────────

const withIds = (owner, fields) => fields.map((f) => ({ id: `${owner}_${f.apiId}`, help: "", required: false, options: {}, ...f }));

async function applyModel(base) {
  const current = await get(base);
  const has = (list, apiId) => list.some((x) => x.apiId === apiId);

  for (const c of model.components) {
    const body = { apiId: c.apiId, name: c.name, category: c.category ?? "geral", description: c.description ?? "", fields: withIds(c.apiId, c.fields) };
    if (has(current.components, c.apiId)) await put(`${base}/components/${c.apiId}`, body);
    else await post(`${base}/components`, body);
  }
  // Relations may point at types created later: types go in without them, then get them.
  for (const t of model.types) {
    const options = { seo: !!t.seo, orderable: !!t.orderable, ...(t.urlPattern ? { urlPattern: t.urlPattern } : {}), ...(t.render ? { render: t.render } : {}), ...(t.jsonLd ? { jsonLd: t.jsonLd } : {}) };
    const fields = withIds(t.apiId, t.fields);
    const exists = has(current.types, t.apiId);
    if (!exists) await post(`${base}/types`, { apiId: t.apiId, name: t.name, kind: t.kind, description: t.description ?? "", fields: fields.filter((f) => f.type !== "relation"), options });
  }
  for (const t of model.types) {
    const options = { seo: !!t.seo, orderable: !!t.orderable, ...(t.urlPattern ? { urlPattern: t.urlPattern } : {}), ...(t.render ? { render: t.render } : {}), ...(t.jsonLd ? { jsonLd: t.jsonLd } : {}) };
    await put(`${base}/types/${t.apiId}`, { name: t.name, description: t.description ?? "", fields: withIds(t.apiId, t.fields), options });
  }
  for (const x of model.taxonomies) {
    const body = { apiId: x.apiId, name: x.name, singularName: x.singularName ?? "", hierarchical: !!x.hierarchical, types: x.types, urlPattern: x.urlPattern ?? null };
    if (has(current.taxonomies, x.apiId)) await put(`${base}/taxonomies/${x.apiId}`, body);
    else await post(`${base}/taxonomies`, body);
  }
  const menus = (await get(`${base}/menus`)).menus ?? [];
  for (const m of model.menus) if (!menus.some((x) => x.apiId === m.apiId)) await post(`${base}/menus`, { apiId: m.apiId, name: m.name, items: [] });
  console.log(`model: ${model.components.length} components, ${model.types.length} types, ${model.taxonomies.length} taxonomies, ${model.menus.length} menus`);

  await patch(base, { siteUrl: SITE_URL, previewUrl: `${SITE_URL}/preview?token={token}`, localeUrls: "prefix" });
}

/** Removes types, taxonomies and components the model does not define (a new project starts with the CMS's default model). */
async function prune(base) {
  const current = await get(base);
  const keep = (list) => new Set(list.map((x) => x.apiId));
  const types = keep(model.types);
  const taxonomies = keep(model.taxonomies);
  const components = keep(model.components);
  let removed = 0;
  for (const t of current.types) if (!types.has(t.apiId)) (await call("DELETE", `${base}/types/${t.apiId}`), removed++);
  for (const x of current.taxonomies) if (!taxonomies.has(x.apiId)) (await call("DELETE", `${base}/taxonomies/${x.apiId}`), removed++);
  for (const c of current.components) if (!components.has(c.apiId)) (await call("DELETE", `${base}/components/${c.apiId}`), removed++);
  console.log(`prune: ${removed} removed`);
}

// ── Media ───────────────────────────────────────────────────────────────

async function uploadAssets(base) {
  const ids = {};
  const { rows } = await get(`${base}/media?pageSize=200`);
  for (const [name, alt] of Object.entries(ASSETS)) {
    let asset = rows.find((a) => a.filename === name);
    if (!asset) {
      const form = new FormData();
      form.append("file", new Blob([fs.readFileSync(path.join(here, "demo-assets", name))], { type: name.endsWith(".svg") ? "image/svg+xml" : name.endsWith(".png") ? "image/png" : "image/jpeg" }), name);
      form.append("folder", "demo");
      asset = (await post(`${base}/media`, form, { form: true })).assets[0];
    }
    await patch(`${base}/media/${asset.id}`, { alt });
    ids[name] = asset.id;
  }
  console.log(`media: ${Object.keys(ids).length} assets`);
  return ids;
}

// ── Terms ───────────────────────────────────────────────────────────────

async function createTerms(base) {
  const ids = {};
  const { terms } = await get(`${base}/taxonomies/category`);
  for (const t of TERMS) {
    const found = terms.find((x) => x.slug?.[LOCALES[0]] === t.slug[LOCALES[0]]);
    ids[t.key] = found ? found.id : (await post(`${base}/taxonomies/category/terms`, { name: t.name, slug: t.slug })).term.id;
  }
  console.log(`terms: ${Object.keys(ids).length}`);
  return ids;
}

// ── Entries ─────────────────────────────────────────────────────────────

/** Replaces "$asset:name" and "$term:key" placeholders anywhere in a value. */
function resolve(value, refs) {
  if (typeof value === "string") {
    if (value.startsWith("$asset:")) return refs.assets[value.slice(7)] ?? null;
    if (value.startsWith("$term:")) return refs.terms[value.slice(6)] ?? null;
    if (value.startsWith("$author:")) return refs.authors[value.slice(8)] ?? null;
    return value;
  }
  if (Array.isArray(value)) return value.map((v) => resolve(v, refs));
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, resolve(v, refs)]));
  return value;
}

/** Creates or updates one document in every locale and publishes it; returns the documentId. */
async function upsert(base, type, match, dataByLocale, refs) {
  const { rows } = await get(`${base}/content/${type}?pageSize=100`);
  let documentId = rows.find(match)?.documentId ?? null;
  for (const locale of LOCALES) {
    const data = resolve(dataByLocale[locale], refs);
    const existing = documentId ? await get(`${base}/content/${type}/${documentId}/${locale}`).catch(() => null) : null;
    if (existing?.entry) {
      await patch(`${base}/content/${type}/${documentId}/${locale}`, { data });
    } else {
      const { entry } = await post(`${base}/content/${type}`, { locale, data, ...(documentId ? { documentId } : {}) });
      documentId = entry.documentId;
    }
    await post(`${base}/content/${type}/${documentId}/${locale}/publish`);
  }
  return documentId;
}

async function createContent(base, assets, terms) {
  const refs = { assets, terms, authors: {} };
  for (const a of AUTHORS) {
    refs.authors[a.key] = await upsert(base, "author", (r) => r.title === a["pt-BR"].name, Object.fromEntries(LOCALES.map((l) => [l, { ...a[l], photo: `$asset:${a.photo}` }])), refs);
  }
  const pages = {};
  for (const p of PAGES) pages[p.key] = await upsert(base, "page", (r) => r.slug === p["pt-BR"].slug, Object.fromEntries(LOCALES.map((l) => [l, p[l]])), refs);
  for (const p of POSTS) {
    await upsert(base, "post", (r) => r.slug === p["pt-BR"].slug, Object.fromEntries(LOCALES.map((l) => [l, { ...p[l], cover: `$asset:${p.cover}`, date: p.date, author: `$author:${p.author}`, category: [`$term:${p.category}`] }])), refs);
  }
  await upsert(base, "home", () => true, Object.fromEntries(LOCALES.map((l) => [l, { blocks: HOME[l] }])), refs);
  await upsert(base, "settings", () => true, SETTINGS, refs);
  console.log(`content: ${AUTHORS.length} authors, ${PAGES.length} pages, ${POSTS.length} posts, home, settings`);
  return pages;
}

async function createMenus(base, pages) {
  for (const [apiId, menu] of Object.entries(MENUS)) {
    const items = menu.items.map((item, i) => {
      const common = { id: `${apiId}-${i + 1}`, label: item.label ?? {}, newTab: false, className: "", children: [] };
      if (item.ref === "$blog") return { ...common, kind: "archive", type: "post" };
      return { ...common, kind: "entry", type: "page", documentId: pages[item.ref.slice(6)] };
    });
    await put(`${base}/menus/${apiId}`, { apiId, name: menu.name, items });
  }
  console.log("menus: header, footer");
}

// ── Site access: API key and webhook ────────────────────────────────────

async function siteAccess(base) {
  const lines = [`ASTRAL_URL=${new URL(API).origin}`, `ASTRAL_PROJECT=${SLUG}`, `SITE_URL=${SITE_URL}`];
  const { keys } = await get(`${base}/api-keys`);
  if (!keys.some((k) => k.name === "Site (leitura)")) {
    const { token } = await post(`${base}/api-keys`, { name: "Site (leitura)", capabilities: ["entries:*:read", "entries:*:preview", "media.read"] });
    lines.push(`ASTRAL_TOKEN=${token}`);
    console.log("api key: created");
  } else console.log("api key: exists (the token was shown when it was created)");

  const { webhooks } = await get(`${base}/webhooks`);
  const url = `${SITE_URL}/api/astral/revalidate`;
  const existing = webhooks.find((w) => w.url === url);
  if (!existing) {
    const { webhook } = await post(`${base}/webhooks`, { name: "Site Next", url, events: ["entry.published", "entry.unpublished", "entry.deleted", "asset.updated", "asset.deleted", "schema.updated", "taxonomy.updated", "menu.updated", "settings.updated"], enabled: true, batchSeconds: 0 });
    lines.push(`ASTRAL_WEBHOOK_SECRET=${webhook.secret}`, `ASTRAL_BUILD_WEBHOOK_ID=${webhook.id}`);
    console.log("webhook: created");
  } else {
    lines.push(`ASTRAL_BUILD_WEBHOOK_ID=${existing.id}`);
    console.log("webhook: exists (the secret was shown when it was created)");
  }

  if (writeEnv) {
    const current = fs.existsSync(writeEnv) ? fs.readFileSync(writeEnv, "utf8") : "";
    // Keeps values already in the file (a secret only the first run knew).
    const kept = Object.fromEntries(current.split(/\r?\n/).filter((l) => /^[A-Z_]+=/.test(l)).map((l) => [l.slice(0, l.indexOf("=")), l]));
    for (const line of lines) kept[line.slice(0, line.indexOf("="))] = line;
    fs.writeFileSync(writeEnv, `${Object.values(kept).join("\n")}\n`);
    console.log(`env: written to ${writeEnv}`);
  }
}

// ── Run ─────────────────────────────────────────────────────────────────

await login();
const { id, created } = await project();
const base = `/projects/${id}`;
await applyModel(base);
if (created || process.argv.includes("--prune")) await prune(base);
const assets = await uploadAssets(base);
const terms = await createTerms(base);
const pages = await createContent(base, assets, terms);
await createMenus(base, pages);
await siteAccess(base);
console.log("done");
