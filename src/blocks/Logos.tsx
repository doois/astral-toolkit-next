// Logos are shown at a fixed height; the alt text (the company name) is the accessible name.
import { Img } from "@/components/Img";
import type { Media } from "@/lib/astral";
import type { BlockProps } from "./types";

export function Logos({ block }: BlockProps<{ title: string | null; logos: Media[] | null }>) {
  const logos = block.logos ?? [];
  if (!logos.length) return null;
  return (
    <section className="block block-logos logos" data-block={block.key}>
      <div className="container">
        {block.title && <p className="logos__title eyebrow">{block.title}</p>}
        <ul className="logos__list">
          {logos.map((logo) => (
            <li key={logo.id}>
              <Img media={logo} sizes="160px" priority={false} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
