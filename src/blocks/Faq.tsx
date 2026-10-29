// Each question is a <details>: expandable without JavaScript, and the answers
// are in the HTML for search engines. FAQPage structured data goes along.
import { hasRichText, plainText } from "@/lib/astral";
import { headingOf, type BlockProps } from "./types";

type Item = { question: string; answer: string | null };

export function Faq({ block, index }: BlockProps<{ title: string | null; text: string | null; items: Item[] | null }>) {
  const Heading = headingOf(index);
  const items = (block.items ?? []).filter((item) => item.question);
  if (!items.length) return null;
  const jsonLd = JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: items.map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: plainText(item.answer ?? "") } })) }).replace(/</g, "\\u003c");
  return (
    <section className="block block-faq faq" data-block={block.key}>
      <div className="container">
        {(block.title || block.text) && (
          <div className="block__head">
            {block.title && <Heading>{block.title}</Heading>}
            {block.text && <p className="lede">{block.text}</p>}
          </div>
        )}
        <div className="faq__list">
          {items.map((item, i) => (
            <details className="faq__item" key={i}>
              <summary>{item.question}</summary>
              {hasRichText(item.answer) && <div className="faq__answer prose" dangerouslySetInnerHTML={{ __html: item.answer }} />}
            </details>
          ))}
        </div>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
    </section>
  );
}
