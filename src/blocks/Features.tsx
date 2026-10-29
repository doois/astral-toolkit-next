import { Icon } from "@/components/Icon";
import type { Link } from "@/lib/cms";
import { cx, headingOf, linkTarget, type BlockProps } from "./types";

type Feature = { icon: string | null; title: string; text: string | null; link: Link | null };
type Fields = { title: string | null; text: string | null; items: Feature[] | null; columns: string | null };

export function Features({ block, index }: BlockProps<Fields>) {
  const columns = ["2", "3", "4"].includes(block.columns ?? "") ? block.columns : "3";
  const Heading = headingOf(index);
  return (
    <section className="block block-features features" data-block={block.key}>
      <div className="container">
        {(block.title || block.text) && (
          <div className="block__head">
            {block.title && <Heading>{block.title}</Heading>}
            {block.text && <p className="lede">{block.text}</p>}
          </div>
        )}
        <ul className={cx("features__grid", `features__grid--${columns}`)}>
          {(block.items ?? []).map((item, i) => (
            <li className="feature" key={i}>
              <Icon name={item.icon} />
              <h3>{item.title}</h3>
              {item.text && <p>{item.text}</p>}
              {item.link?.url && (
                <a className="arrow-link" href={item.link.url} {...linkTarget(item.link.newTab)}>
                  {item.link.label}
                </a>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
