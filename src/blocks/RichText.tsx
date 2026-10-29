// `body` is HTML the CMS sanitized (see src/lib/astral/richtext.ts): dangerouslySetInnerHTML is safe here.
import { hasRichText } from "@/lib/astral";
import { cx, type BlockProps } from "./types";

export function RichText({ block }: BlockProps<{ body: string | null; width: string | null }>) {
  if (!hasRichText(block.body)) return null;
  const wide = block.width === "wide";
  return (
    <section className={cx("block", "block-richtext", "richtext", wide && "richtext--wide")} data-block={block.key}>
      <div className={cx("container", !wide && "container--narrow")}>
        <div className="prose" dangerouslySetInnerHTML={{ __html: block.body }} />
      </div>
    </section>
  );
}
