import { headingOf, type BlockProps } from "./types";

type Stat = { value: string; label: string };

export function Stats({ block, index }: BlockProps<{ title: string | null; items: Stat[] | null }>) {
  const Heading = headingOf(index);
  return (
    <section className="block block-stats stats" data-block={block.key}>
      <div className="container">
        {block.title && (
          <div className="block__head">
            <Heading>{block.title}</Heading>
          </div>
        )}
        <ul className="stats__grid">
          {(block.items ?? []).map((item, i) => (
            <li className="stat" key={i}>
              <span className="stat__value">{item.value}</span>
              <span className="stat__label">{item.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
