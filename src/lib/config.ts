// The route table and locale format, frozen at build time: next.config reads the
// CMS schema (src/lib/setup.ts) and inlines it as ASTRAL_CONFIG. A new type with
// a URL, a new locale or a different `render` needs a rebuild, which the
// "schema.updated" webhook asks for.

import type { AstralConfig } from "./routes";

const raw = process.env.ASTRAL_CONFIG;
if (!raw) throw new Error("Astral: ASTRAL_CONFIG ausente. O next.config lê o /schema do CMS no build; rode `next build` ou `next dev`.");

export const config: AstralConfig = JSON.parse(raw);

export const typeOf = (apiId: string) => config.types.find((x) => x.apiId === apiId);
