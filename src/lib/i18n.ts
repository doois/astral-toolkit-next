// The site's own interface strings, per locale. Content comes from the CMS;
// these are the few words the templates need (navigation, pagination, labels).
// Add a locale here when the project gains one; unknown locales fall back to "en".

export type Strings = {
  /** The path segment of paginated listings: /blog/pagina/2. */
  pageSegment: string;
  skipToContent: string;
  menu: string;
  language: string;
  home: string;
  blog: string;
  allPosts: string;
  categories: string;
  allCategories: string;
  readMore: string;
  by: string;
  publishedOn: string;
  updatedOn: string;
  previous: string;
  next: string;
  page: (current: number, total: number) => string;
  notFoundTitle: string;
  notFoundText: string;
  backHome: string;
  draftPreview: string;
  noPosts: string;
  loading: string;
  relatedByCategory: string;
};

const en: Strings = {
  pageSegment: "page",
  skipToContent: "Skip to content",
  menu: "Menu",
  language: "Language",
  home: "Home",
  blog: "Blog",
  allPosts: "All posts",
  categories: "Categories",
  allCategories: "All",
  readMore: "Read more",
  by: "By",
  publishedOn: "Published on",
  updatedOn: "Updated on",
  previous: "Previous",
  next: "Next",
  page: (current, total) => `Page ${current} of ${total}`,
  notFoundTitle: "Page not found",
  notFoundText: "The address may have changed or the page may have been removed.",
  backHome: "Back to the home page",
  draftPreview: "Draft preview: this is not the published version.",
  noPosts: "No posts yet.",
  loading: "Loading",
  relatedByCategory: "More in",
};

const ptBR: Strings = {
  pageSegment: "pagina",
  skipToContent: "Ir para o conteúdo",
  menu: "Menu",
  language: "Idioma",
  home: "Início",
  blog: "Blog",
  allPosts: "Todos os posts",
  categories: "Categorias",
  allCategories: "Todas",
  readMore: "Ler mais",
  by: "Por",
  publishedOn: "Publicado em",
  updatedOn: "Atualizado em",
  previous: "Anterior",
  next: "Próxima",
  page: (current, total) => `Página ${current} de ${total}`,
  notFoundTitle: "Página não encontrada",
  notFoundText: "O endereço pode ter mudado ou a página pode ter sido removida.",
  backHome: "Voltar para o início",
  draftPreview: "Pré-visualização de rascunho: esta não é a versão publicada.",
  noPosts: "Ainda não há posts.",
  loading: "Carregando",
  relatedByCategory: "Mais em",
};

const STRINGS: Record<string, Strings> = { en, "pt-BR": ptBR, pt: ptBR };

export const t = (locale: string): Strings => STRINGS[locale] ?? STRINGS[locale.split("-")[0] ?? ""] ?? en;

/** The names of the locales for the language switcher. */
export const LOCALE_NAMES: Record<string, string> = { "pt-BR": "Português", pt: "Português", en: "English", es: "Español", nl: "Nederlands", fr: "Français", de: "Deutsch", it: "Italiano" };
export const localeName = (locale: string) => LOCALE_NAMES[locale] ?? locale;

/** A date in the locale's long format ("14 de outubro de 2026"). */
export function formatDate(value: string | null | undefined, locale: string) {
  if (!value) return "";
  const date = new Date(value.length === 10 ? `${value}T12:00:00Z` : value);
  return new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(date);
}
