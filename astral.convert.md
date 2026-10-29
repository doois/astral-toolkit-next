# astral.convert.md

Read by the CMS's code-conversion job: how this toolkit is laid out and what a
conversion may change. Everything outside the writable paths is infrastructure
shared by every Astral toolkit and stays as it is.

## Writable paths

- `src/blocks/`
- `src/components/`
- `src/templates/`
- `src/styles/`
- `public/fonts/`
- `public/favicon.svg`
- `src/lib/i18n.ts`
- `astral.model.json`

## Tokens

`src/styles/tokens.css` holds every design token; a re-brand changes this file first
and new tokens go here, never inline.

- Colors: `--paper`, `--paper-2`, `--paper-3` (surfaces), `--ink`, `--ink-2`, `--ink-3`
  (text), `--accent`, `--accent-ink`, `--accent-soft`, `--line`, `--line-strong`,
  `--focus`. Light values on `:root`; dark values under
  `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) }` and
  `:root[data-theme="dark"]`. Keep `--ink` and `--accent` on `--paper` at 4.5:1 or more.
- Fonts: `--font-text`, `--font-display`, `--font-mono`.
- Type scale: `--text-xs` to `--text-4xl`; line heights `--leading-*`; tracking `--tracking-*`.
- Spacing: `--space-1` to `--space-9`, `--section`, `--gutter`; widths `--container`,
  `--container-narrow`, `--measure`, `--header-height`.
- Radius: `--radius-sm`, `--radius`, `--radius-lg`, `--radius-full`. Motion: `--ease`,
  `--dur`, `--dur-slow` (zero under `prefers-reduced-motion`).

Global styles: `src/styles/base.css` (fonts, reset, headings, `.prose`, `.button`,
`.arrow-link`, utilities) and `src/styles/layout.css` (header, footer, listing,
pagination, post, 404, preview banner). Block styles: `src/styles/blocks.css`, one
commented section per component. `src/styles/index.css` imports them all; the bundle
is inlined in the HTML, so keep it under 32 kB. Plain CSS only: no Tailwind, no
preprocessor, no `!important`.

## Blocks

- Stack: Next 16 App Router, React Server Components, TypeScript strict. Blocks are
  server components; never add `"use client"` (the only client component is
  `src/components/LiveList.tsx`).
- Template: `src/blocks/<Name>.tsx`, one per CMS component (`hero` is `Hero.tsx`,
  `mediatext` is `MediaText.tsx`), exporting a function component that takes
  `BlockProps<Fields>` from `src/blocks/types.ts`: `{ block, locale, index, mode }`.
  `index === 0` renders `h1`, the rest `h2` (`headingOf(index)`).
- Registration: add the import and `apiId: Component` to `REGISTRY` in
  `src/blocks/Blocks.tsx`. Unregistered components are skipped.
- Markup: `<section className="block block-<apiId> <apiId>" data-block={block.key}>`
  with a `.container` inside; optional `.block__head`. Images through
  `<Img media sizes />` (`src/components/Img.tsx`); rich text fields only through
  `dangerouslySetInnerHTML` (the CMS sanitizes them); `text` fields as text.
- Steps to add a block: the template, the registry entry, a `/* Name */` section in
  `src/styles/blocks.css`, and the component in `astral.model.json` (`components[]`,
  plus its apiId in the `blocks` field of `home` and `page`).

Minimal example, `src/blocks/Pricing.tsx`:

```tsx
import { headingOf, type BlockProps } from "./types";

type Fields = { title: string | null; plans: { name: string; price: string }[] | null };

export function Pricing({ block, index }: BlockProps<Fields>) {
  const Heading = headingOf(index);
  return (
    <section className="block block-pricing pricing" data-block={block.key}>
      <div className="container">
        {block.title && <div className="block__head"><Heading>{block.title}</Heading></div>}
        <ul className="pricing__grid">
          {(block.plans ?? []).map((plan, i) => (
            <li className="plan" key={i}><h3>{plan.name}</h3><span className="plan__price">{plan.price}</span></li>
          ))}
        </ul>
      </div>
    </section>
  );
}
```

Then in `src/blocks/Blocks.tsx`: `import { Pricing } from "./Pricing";` and `pricing: Pricing,`.

## Layouts

- `src/components/Shell.tsx`: the page shell inside `<body>` (JSON-LD, skip link,
  header, preview banner, `<main id="content">`, footer).
- `src/components/Header.tsx`: brand (`settings.logo` or `.brand__mark` plus the site
  name), the `header` menu, language switcher, `<details>` mobile menu.
- `src/components/Footer.tsx`: about, the `footer` menu, social links, footer text.
- Page templates: `src/templates/Entry.tsx` (home, page, generic), `Post.tsx`,
  `Listing.tsx`; each exports a head function (title, description, alternates) and a
  view. Shared pieces: `PostCard.tsx`, `Pagination.tsx`, `Icon.tsx`, `Img.tsx`.
- Header and footer read the CMS through `getSettings` and `getMenu` from
  `src/lib/cms.ts`, passing the `mode` they receive.

## Assets

- Fonts: `public/fonts/*.woff2`, declared with `@font-face` at the top of
  `src/styles/base.css` and referenced as `/fonts/<file>`. The text face is preloaded
  by `src/app/[locale]/layout.tsx`, which is not writable: a new text face replaces
  the file under the same name, `inter-variable.woff2`. Display faces use
  `font-display: swap` with a metric-matched fallback.
- Logo: comes from the CMS (`settings.logo`); favicon: `public/favicon.svg`.
- Icons: inline SVG paths in `src/components/Icon.tsx`.

## Pages

Routing, caching and infrastructure the conversion must not touch:

- `src/app/**` (catch-all route, root layout, 404, preview, sitemap, robots,
  `api/astral/revalidate`, `api/astral/posts`)
- `src/lib/astral/**` (shared client, synced from the CMS repository)
- `src/lib/cms.ts`, `src/lib/resolve.ts`, `src/lib/routes.ts`, `src/lib/setup.ts`,
  `src/lib/config.ts`, `src/lib/site.ts`, `src/lib/scope.ts`, `src/lib/env.ts`,
  `src/lib/preview.ts`, `src/lib/img-props.ts`
- `next.config.ts`, `tsconfig.json`, `package.json`, `package-lock.json`,
  `lighthouserc.json`, `.github/`, `scripts/`, `.env`, `.env.example`, `.gitignore`

## Notes

The markup and class names match the Astro toolkit's `DESIGN.md` one to one; a
conversion that keeps the class names keeps all four toolkits interchangeable.
