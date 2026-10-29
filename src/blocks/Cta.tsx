import type { Link } from "@/lib/cms";
import { cx, headingOf, linkTarget, type BlockProps } from "./types";

export function Cta({ block, index }: BlockProps<{ title: string; text: string | null; button: Link | null; tone: string | null }>) {
  const accent = block.tone !== "neutral";
  const Heading = headingOf(index);
  const button = block.button?.url ? block.button : null;
  return (
    <section className={cx("block", "block-cta", "cta", accent && "cta--accent")} data-block={block.key}>
      <div className="container">
        <div className="cta__box">
          <div>
            <Heading>{block.title}</Heading>
            {block.text && <p>{block.text}</p>}
          </div>
          {button && (
            <a className={cx("button", accent && "button--accent")} href={button.url} {...linkTarget(button.newTab)}>
              {button.label}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
