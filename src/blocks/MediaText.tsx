import { Img } from "@/components/Img";
import { hasRichText, type Media } from "@/lib/astral";
import type { Link } from "@/lib/cms";
import { cx, headingOf, linkTarget, type BlockProps } from "./types";

type Fields = { title: string; text: string | null; image: Media | null; imageSide: string | null; link: Link | null };

export function MediaText({ block, index }: BlockProps<Fields>) {
  const Heading = headingOf(index);
  const start = block.imageSide === "start";
  return (
    <section className={cx("block", "block-mediatext", "mediatext", start && "mediatext--start")} data-block={block.key}>
      <div className="container">
        <div className="mediatext__grid">
          <div className="mediatext__content">
            <Heading>{block.title}</Heading>
            {hasRichText(block.text) && <div className="prose" dangerouslySetInnerHTML={{ __html: block.text }} />}
            {block.link?.url && (
              <a className="arrow-link" href={block.link.url} {...linkTarget(block.link.newTab)}>
                {block.link.label}
              </a>
            )}
          </div>
          {block.image && (
            <div className="mediatext__media">
              <Img media={block.image} sizes="(min-width: 56em) 36rem, 100vw" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
