import { t } from "@/lib/i18n";
import { pagedUrl } from "@/lib/routes";

export function Pagination({ page, pageCount, base, locale }: { page: number; pageCount: number; base: string; locale: string }) {
  if (pageCount <= 1) return null;
  const ui = t(locale);
  return (
    <nav className="pagination" aria-label={ui.page(page, pageCount)}>
      {page > 1 ? <a href={pagedUrl(base, page - 1, locale)} rel="prev">← {ui.previous}</a> : <span aria-disabled="true">← {ui.previous}</span>}
      <span className="pagination__status">{ui.page(page, pageCount)}</span>
      {page < pageCount ? <a href={pagedUrl(base, page + 1, locale)} rel="next">{ui.next} →</a> : <span aria-disabled="true">{ui.next} →</span>}
    </nav>
  );
}
