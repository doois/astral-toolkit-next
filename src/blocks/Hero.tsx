import { Img } from "@/components/Img";
import type { Media } from "@/lib/astral";
import type { Link } from "@/lib/cms";
import { cx, headingOf, linkTarget, type BlockProps } from "./types";

type Fields = { eyebrow: string | null; title: string; text: string | null; image: Media | null; primary: Link | null; secondary: Link | null; align: string | null };

export function Hero({ block, index }: BlockProps<Fields>) {
  const center = block.align === "center";
  const Heading = headingOf(index);
  const primary = block.primary?.url ? block.primary : null;
  const secondary = block.secondary?.url ? block.secondary : null;
  return (
    <section className={cx("block", "block-hero", "hero", center && "hero--center")} data-block={block.key}>
      <div className="container">
        <div className={cx("hero__grid", !!block.image && !center && "hero__grid--image")}>
          <div className="hero__content">
            {block.eyebrow && <p className="eyebrow">{block.eyebrow}</p>}
            <Heading className="display">{block.title}</Heading>
            {block.text && <p className="hero__text">{block.text}</p>}
            {(primary || secondary) && (
              <div className="hero__actions">
                {primary && (
                  <a className="button" href={primary.url} {...linkTarget(primary.newTab)}>
                    {primary.label}
                  </a>
                )}
                {secondary && (
                  <a className="button button--secondary" href={secondary.url} {...linkTarget(secondary.newTab)}>
                    {secondary.label}
                  </a>
                )}
              </div>
            )}
          </div>
          {block.image && (
            <div className="hero__media">
              <Img media={block.image} sizes={center ? "(min-width: 74rem) 74rem, 100vw" : "(min-width: 56em) 40vw, 100vw"} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
