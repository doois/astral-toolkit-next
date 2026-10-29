// Renders a `blocks` field: one component per CMS component apiId. A block of
// a component this site does not know is skipped (and noted in dev), so adding
// a component in the CMS never breaks the build. To add a block: create
// src/blocks/<Name>.tsx and register it here (README, "Como adicionar um bloco").
import type { ComponentType } from "react";
import type { Block, RenderMode } from "@/lib/astral";
import { Cta } from "./Cta";
import { Faq } from "./Faq";
import { Features } from "./Features";
import { Gallery } from "./Gallery";
import { Hero } from "./Hero";
import { Logos } from "./Logos";
import { MediaText } from "./MediaText";
import { PostList } from "./PostList";
import { RichText } from "./RichText";
import { Stats } from "./Stats";
import { Testimonials } from "./Testimonials";
import type { BlockProps } from "./types";

// Each block narrows its own fields; the registry only needs to know they render.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BlockComponent = ComponentType<BlockProps<any>> | ((props: BlockProps<any>) => Promise<React.ReactNode>);

const REGISTRY: Record<string, BlockComponent> = {
  hero: Hero,
  richtext: RichText,
  features: Features,
  mediatext: MediaText,
  gallery: Gallery,
  testimonials: Testimonials,
  faq: Faq,
  logos: Logos,
  stats: Stats,
  cta: Cta,
  postlist: PostList,
};

export function Blocks({ blocks, locale, mode }: { blocks: Block[] | null | undefined; locale: string; mode: RenderMode }) {
  const list = (blocks ?? []).filter((block) => {
    const known = block.component in REGISTRY;
    if (!known && process.env.NODE_ENV === "development") console.warn(`[astral] bloco "${block.component}" sem componente em src/blocks`);
    return known;
  });
  return list.map((block, index) => {
    const Component = REGISTRY[block.component] as ComponentType<BlockProps<Record<string, unknown>>>;
    return <Component key={block.key} block={block} locale={locale} index={index} mode={mode} />;
  });
}
