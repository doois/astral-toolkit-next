import { Img } from "@/components/Img";
import type { Media } from "@/lib/astral";
import { cx, headingOf, type BlockProps } from "./types";

export function Gallery({ block, index }: BlockProps<{ title: string | null; images: Media[] | null; columns: string | null }>) {
  const columns = block.columns === "2" ? "2" : "3";
  const Heading = headingOf(index);
  const images = block.images ?? [];
  if (!images.length) return null;
  return (
    <section className="block block-gallery gallery" data-block={block.key}>
      <div className="container">
        {block.title && (
          <div className="block__head">
            <Heading>{block.title}</Heading>
          </div>
        )}
        <ul className={cx("gallery__grid", `gallery__grid--${columns}`)}>
          {images.map((image) => (
            <li key={image.id}>
              <figure className="gallery__item">
                <Img media={image} sizes={columns === "2" ? "(min-width: 74rem) 36rem, 50vw" : "(min-width: 74rem) 24rem, (min-width: 48em) 33vw, 50vw"} />
                {image.caption && <figcaption>{image.caption}</figcaption>}
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
