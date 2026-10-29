import type { Block, RenderMode } from "@/lib/astral";

/** What every block component receives, like the Astro toolkit: the block, the page locale and its position (0 renders an h1), plus the page's render mode for blocks that read the CMS. */
export type BlockProps<F extends Record<string, unknown>> = { block: Block<F>; locale: string; index: number; mode: RenderMode };

export const headingOf = (index: number) => (index === 0 ? "h1" : "h2");

/** Astro's class:list: truthy names, in order, joined by a space. */
export const cx = (...names: (string | false | null | undefined)[]) => names.filter(Boolean).join(" ");

/** target/rel of a link that may open in a new tab. */
export const linkTarget = (newTab: boolean | null | undefined) => (newTab ? { target: "_blank", rel: "noopener" } : {});
