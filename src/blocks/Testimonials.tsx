import { Img } from "@/components/Img";
import type { Media } from "@/lib/astral";
import { headingOf, type BlockProps } from "./types";

type Testimonial = { quote: string; name: string; role: string | null; photo: Media | null };

export function Testimonials({ block, index }: BlockProps<{ title: string | null; items: Testimonial[] | null }>) {
  const Heading = headingOf(index);
  return (
    <section className="block block-testimonials testimonials" data-block={block.key}>
      <div className="container">
        {block.title && (
          <div className="block__head">
            <Heading>{block.title}</Heading>
          </div>
        )}
        <ul className="testimonials__grid">
          {(block.items ?? []).map((item, i) => (
            <li key={i}>
              <figure className="testimonial">
                <blockquote>{item.quote}</blockquote>
                <figcaption>
                  {item.photo && <Img media={item.photo} sizes="40px" alt="" />}
                  <span>
                    <strong>{item.name}</strong>
                    {item.role}
                  </span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
