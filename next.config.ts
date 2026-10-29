import type { NextConfig } from "next";
import { PHASE_PRODUCTION_SERVER } from "next/constants";
import { loadAstral } from "./src/lib/setup";

// Cache Components: every page is prerendered from cached data ("use cache"),
// one catch-all route serves the three render modes per type (README, "Modos de
// renderização"). The CMS schema is read here, once per build, and decides the
// routes, the locale rewrites and the redirects. `next start` serves what the
// build produced and does not call the CMS for its configuration.
const YEAR = 60 * 60 * 24 * 365;

const base: NextConfig = {
  cacheComponents: true,
  // Links are plain <a> (no client router, no prefetch): Partial Prefetching changes nothing
  // for navigation, and without it a URL that was not built ahead waits for its full render
  // instead of getting an empty App Shell first (README).
  partialPrefetching: false,
  cacheLife: {
    // "static" pages change only with a new build: a year, then a background refresh at most.
    static: { stale: 300, revalidate: YEAR, expire: 2 * YEAR },
  },
  experimental: {
    // The single stylesheet (about 26 kB) goes inside the HTML: no render-blocking request.
    inlineCss: true,
  },
  poweredByHeader: false,
  // No generated AGENTS.md in the site repository.
  agentRules: false,
  reactStrictMode: true,
  async headers() {
    return [
      { source: "/preview", headers: [{ key: "x-robots-tag", value: "noindex, nofollow" }] },
      { source: "/api/:path*", headers: [{ key: "x-robots-tag", value: "noindex, nofollow" }] },
      { source: "/fonts/:file*", headers: [{ key: "cache-control", value: "public, max-age=2592000, stale-while-revalidate=86400" }] },
    ];
  },
};

export default async function config(phase: string): Promise<NextConfig> {
  if (phase === PHASE_PRODUCTION_SERVER) return base;
  const astral = await loadAstral();
  return {
    ...base,
    env: { ASTRAL_CONFIG: JSON.stringify(astral.config) },
    async rewrites() {
      return { beforeFiles: [], afterFiles: astral.rewrites, fallback: [] };
    },
    async redirects() {
      return astral.redirects;
    },
  };
}
