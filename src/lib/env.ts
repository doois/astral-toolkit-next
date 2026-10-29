// Configuration comes from the environment, never from the repository. Next
// loads .env into process.env for `next dev`, `next build` and `next start`;
// in a container the values come from the environment at runtime. Reading by a
// computed name keeps them out of the bundles (Next inlines only literal
// `process.env.NAME` references).

const read = (name: string): string => (process.env[name] ?? "").trim();

export const env = {
  get url() {
    return read("ASTRAL_URL").replace(/\/+$/, "");
  },
  get project() {
    return read("ASTRAL_PROJECT");
  },
  get token() {
    return read("ASTRAL_TOKEN");
  },
  get webhookSecret() {
    return read("ASTRAL_WEBHOOK_SECRET");
  },
  get buildWebhookId() {
    return read("ASTRAL_BUILD_WEBHOOK_ID");
  },
  get siteUrl() {
    return (read("SITE_URL") || "http://localhost:3000").replace(/\/+$/, "");
  },
  get rebuildHook() {
    return read("ASTRAL_REBUILD_HOOK");
  },
  get localeUrls() {
    return read("ASTRAL_LOCALE_URLS");
  },
  get buildLocales() {
    return read("ASTRAL_BUILD_LOCALES");
  },
};

/** Fails early with a clear message when the CMS connection is not configured. */
export function requireEnv() {
  const missing = ["ASTRAL_URL", "ASTRAL_PROJECT"].filter((name) => !read(name));
  if (missing.length) throw new Error(`Astral: defina ${missing.join(", ")} no ambiente (.env). Veja .env.example.`);
}
