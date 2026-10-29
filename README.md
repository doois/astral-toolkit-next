# Astral toolkit: Next.js

Site inicial em [Next.js](https://nextjs.org) 16 (App Router, React Server Components,
TypeScript estrito) para o Astral, o CMS headless da Doois: cliente tipado, blocos,
menus, idiomas, imagens responsivas, SEO, JSON-LD, sitemap, pré-visualização de
rascunhos, revalidação por webhook e status de build. É o ponto de partida de um site
novo: o instalador do CMS cria o repositório do site a partir deste template, aplica o
`astral.model.json` ao projeto e preenche o `.env`.

É o mesmo site do toolkit Astro: mesmo modelo, mesma marcação, classe por classe, e o
mesmo CSS (o `DESIGN.md` do toolkit Astro descreve tokens e blocos e vale para os quatro).

## O que vem

| Pasta | O quê |
|---|---|
| `astral.model.json` | O modelo do site (componentes, tipos, taxonomia, menus), no formato de proposta do CMS |
| `src/lib/astral/` | O cliente JavaScript do Astral (copiado do repositório do CMS por `npm run toolkits:sync`; não edite aqui) |
| `src/lib/` | `setup.ts` (lê o `/schema` no `next.config`), `config.ts`, `routes.ts`, `resolve.ts`, `cms.ts` (leituras com cache por modo), `site.ts` (metadados e JSON-LD), `i18n.ts`, `env.ts` |
| `src/app/[locale]/` | O layout raiz (`<html lang>`), a rota única `[[...path]]` e o 404 |
| `src/app/` | `preview`, `sitemap.xml`, `robots.ts`, `api/astral/revalidate`, `api/astral/posts` |
| `src/blocks/` | Um componente por componente do CMS, mais o `Blocks.tsx` que os monta |
| `src/templates/` | Página inicial, página, post, listagem (cada um com a função de `head` e a view) |
| `src/components/` | `Shell`, `Header`, `Footer`, `Img`, `PostCard`, `Pagination`, `Icon` e `LiveList` (a ilha) |
| `src/styles/` | Tokens, base, layout e blocos, em CSS puro (os mesmos arquivos do toolkit Astro) |
| `scripts/` | `build.mjs` (build com status para o CMS), `seed-demo.mjs` (modelo e conteúdo de demonstração) |
| `lighthouserc.json`, `.github/workflows/lighthouse.yml` | Lighthouse CI com mínimo 95 em todas as categorias |
| `astral.convert.md` | O mapa do toolkit para a conversão de código do CMS |

## Configuração

Copie `.env.example` para `.env` e preencha (nunca versione o `.env`):

| Variável | O quê |
|---|---|
| `ASTRAL_URL` | Endereço do CMS, como `https://cms.doois.com.br` |
| `ASTRAL_PROJECT` | Slug do projeto |
| `ASTRAL_TOKEN` | Chave de leitura (`cms_xxxxxxxx_...`), com `entries:*:read`, `entries:*:preview` e `media.read` |
| `ASTRAL_WEBHOOK_SECRET` | Segredo do webhook do projeto que aponta para `<site>/api/astral/revalidate` |
| `ASTRAL_BUILD_WEBHOOK_ID` | Opcional: id desse webhook, para o build reportar o status ao CMS |
| `SITE_URL` | Endereço público do site |
| `ASTRAL_REBUILD_HOOK` | Opcional: URL chamada (POST) quando o site precisa ser reconstruído |
| `ASTRAL_LOCALE_URLS` | Opcional: formato das URLs por idioma, se o `/schema` ainda não entregar `localeUrls` (`prefix`, `prefix-all`, `domain`, `none`) |
| `ASTRAL_BUILD_LOCALES` | Opcional: só estes idiomas neste build (no formato `none`, um build por idioma) |

No CMS, em Configurações do projeto: endereço do site (`SITE_URL`) e endereço de
pré-visualização `https://<site>/preview?token={token}`.

```sh
npm install
npm run dev        # http://localhost:3000, lendo o CMS a cada pedido
npm run build      # scripts/build.mjs: next build + status para o CMS
npm start          # next start (porta 3000; -p para outra)
npm run check      # tipos (depois de um build ou dev, que geram os tipos das rotas)
npm run lhci       # Lighthouse CI no build
```

## Rotas e idiomas

O `next.config.ts` chama `src/lib/setup.ts` uma vez por `next build` (ou `next dev`):
lê `GET /api/<projeto>/schema` e `/redirects` e monta a tabela de rotas (tipo, idioma,
listagem, arquivo de taxonomia, paginação em `/blog/pagina/2` e `/en/blog/page/2`).
A tabela vai congelada no build (`env.ASTRAL_CONFIG`, lida por `src/lib/config.ts`).
O `next start` não consulta o CMS para se configurar.

Todas as páginas de conteúdo são uma rota só, `src/app/[locale]/[[...path]]/page.tsx`.
O idioma é o segmento `[locale]` do layout raiz, então o `<html lang>` sai certo sem
ler o pedido. As URLs públicas seguem o formato do projeto e viram esse segmento por
rewrites gerados no `next.config`:

| Formato (`localeUrls` do `/schema`, ou `ASTRAL_LOCALE_URLS`) | URL pública | Rewrite |
|---|---|---|
| `prefix` (padrão) | `/sobre`, `/en/about` | o que não começa por outro idioma vai para `/<padrão>/...`; `/pt-BR/...` redireciona para `/...` |
| `prefix-all` | `/pt-BR/sobre`, `/en/about` | nenhum; `/` redireciona para o idioma padrão |
| `domain` | `site.com.br/sobre`, `site.com/about` | por host (`localeDomains`): um build serve todos os domínios |
| `none` | `/sobre` | tudo para o idioma do build (`ASTRAL_BUILD_LOCALES`, um build por idioma) |

Sem `localeUrls` no `/schema` (servidor antigo), vale `ASTRAL_LOCALE_URLS` e depois
`prefix`, como no toolkit Astro. Os redirecionamentos do CMS viram `redirects()` do
Next (301, 302, 303, 307 ou 308, como cadastrados). Os textos de interface do site
(paginação, "Ler mais", 404) ficam em `src/lib/i18n.ts`.

## Modos de renderização

O `render` de cada tipo (opção do tipo no CMS, entregue pelo `/schema`; ausente vale
`static`) decide como as páginas dele são geradas. Uma rota só serve os três modos,
com Cache Components (`cacheComponents: true`):

| `render` | Como | Quando o conteúdo muda |
|---|---|---|
| `static` | pré-renderada no build (`generateStaticParams`); as leituras do CMS são `"use cache"` com o perfil `static` (um ano) e sem tags do CMS | o webhook pede um rebuild (`ASTRAL_REBUILD_HOOK`) |
| `revalidate` | pré-renderada no build também; as leituras são `"use cache"` com o perfil `max` e as tags do CMS (`type:<apiId>`, `entry:<documentId>`, `menus`, `settings`, `taxonomy:<x>`); uma URL que não existia no build (post novo) é gerada na primeira visita e guardada (ISR) | o webhook chama `revalidateTag(tag, { expire: 0 })` e `revalidatePath` dos caminhos do evento; a próxima visita gera de novo |
| `dynamic` | a página chama `await connection()` antes de qualquer leitura: renderizada a cada pedido, leituras sem cache (só deduplicadas dentro do pedido), `Cache-Control: private, no-store` | nada a fazer |

As listagens e arquivos de categoria seguem o modo da coleção (o mais dinâmico, se uma
taxonomia classificar coleções de modos diferentes). O modo viaja como prop
(`Head.mode`, `BlockProps.mode`) até cada leitura de `src/lib/cms.ts`, inclusive do
cabeçalho, do rodapé e do bloco `postlist`: uma página `static` lê as configurações e
menus na cópia estática, uma `revalidate` na cópia com tags.

Verificado num build de produção contra o CMS local (`next build` + `next start`):

- `.next/server/app/**.meta`: páginas `static` sem nenhuma tag do CMS e `Cache-Control:
  s-maxage=31536000`; páginas `revalidate` com `type:post`, `entry:<id>`, `menus`,
  `settings` e `s-maxage=2592000`; nenhuma com parte adiada (`postponed`).
- Webhook assinado com `entry.published` de um post: o post e `/blog` voltam `MISS` e
  então `HIT`; `/sobre` (static) e a home seguem `HIT`. Um evento só com caminhos
  revalida o caminho interno (`/pt-BR/blog/...`). `menu.updated` regenera as páginas
  `revalidate`, deixa as `static` e pede rebuild.
- Com o tipo `page` trocado para `dynamic` (e de volta): as páginas saem do build,
  respondem com `private, no-store`, sem `x-nextjs-cache`, HTML completo (sem streaming).

Compromissos, ditos com clareza:

- `instant = false` na rota: uma página `dynamic` espera os dados e manda o documento
  inteiro, em vez de exigir uma casca estática com fallbacks de Suspense. O preço é que
  o Next não valida "navegação instantânea" nessa rota; os links são `<a>` comuns (sem
  roteador no cliente), então essa validação não se aplicaria.
- `partialPrefetching: false`: sem roteador no cliente não há prefetch para otimizar, e
  com ele uma URL nova poderia receber primeiro uma casca vazia. Assim a primeira visita
  de um post novo espera a renderização completa (como `fallback: "blocking"`).
- A tabela de rotas é decidida no build. Um tipo novo com URL, um idioma novo ou um
  `render` diferente pedem um rebuild (o evento `schema.updated` pede um).
- Uma página `static` que embute conteúdo de um tipo `revalidate` (a home com a lista
  de posts) só muda no próximo build. Para mostrar o conteúdo novo antes disso, o bloco
  `postlist` tem a opção `live`: a lista vem do servidor no HTML e o componente cliente
  `LiveList` busca a versão atual em `/api/astral/posts` (que guarda a chave do CMS no
  servidor). É o único componente cliente do toolkit.
- JavaScript: o Next sempre manda o seu runtime (React e o roteador), cerca de 136 kB
  gzip numa página estática do demo, mais o payload RSC embutido no HTML. É acima do
  orçamento de 30 kB do contrato e o toolkit não tem como baixar isso; quem precisa de
  zero JS deve usar o toolkit Astro ou PHP. O Lighthouse continua em 98 a 99 de
  performance no desktop.
- 404: no Next 16, um `notFound()` lançado pela página volta com status 404 e `noindex`,
  mas o HTML é um documento mínimo e o navegador desenha o `not-found.tsx` a partir do
  payload RSC (o mesmo acontece num app Next vazio). Sem JavaScript, a página de 404 fica
  em branco; buscadores recebem o 404 certo.
- O cache de dados e o ISR moram no processo do `next start` (memória e `.next/`). Com
  mais de um container, cada um tem a sua cópia: configure um `cacheHandler` comum
  (Redis, por exemplo) ou deixe o CDN na frente decidir, alimentado pelos cabeçalhos.

## Revalidação, purga e rebuild

O CMS chama `POST /api/astral/revalidate` em cada mudança. O endpoint confere
`x-cms-timestamp` e `x-cms-signature` com o `verifyWebhook` do cliente (HMAC-SHA256 de
`timestamp.corpo` com `ASTRAL_WEBHOOK_SECRET`, janela de 5 minutos) e então:

1. chama `revalidateTag(tag, { expire: 0 })` para cada tag de `data.tags` (só leituras
   de rotas `revalidate` têm essas tags, então páginas `static` não mudam);
2. chama `revalidatePath` para os caminhos de `data.paths` que pertencem a uma rota
   `revalidate` ou `dynamic`, no caminho interno com o idioma (`/blog/x` vira `/pt-BR/blog/x`);
3. se mudou um tipo `static`, ou algo que toda página usa (menus, configurações, schema,
   taxonomias), chama `ASTRAL_REBUILD_HOOK` (POST com `{ event_type, reason, at }`);
4. no evento `site.rebuild` (botão "Reconstruir site"), expira tudo e chama o hook.

A resposta diz o que foi feito: `{ ok, purged, paths, revalidated, tags, rebuild: "requested" | "no_hook" | "not_needed" | "failed" }`.

Com um CDN na frente (Cloudflare, Bunny), as páginas `revalidate` já saem com
`s-maxage` longo: chame a API de purga dele no mesmo ponto em que `requestRebuild` é
chamado em `src/app/api/astral/revalidate/route.ts`, com os mesmos `paths` ou `tags`.

## Pré-visualização

O botão "Pré-visualizar" do CMS abre `/preview?token=...`. A rota troca o token pelo
rascunho no CMS (sem chave), liga o draft mode do Next, guarda o token num cookie
`httpOnly` e leva o editor à URL real da entrada. Lá a rota única renderiza o rascunho
a cada pedido (`private, no-store`), com `noindex` e a faixa de aviso; o resto do site
continua navegável com o conteúdo publicado. O draft mode acaba com a sessão do
navegador ou em `/preview?exit=1`. Tipos sem URL (autor, configurações) não têm página
para pré-visualizar. Num site com formato `domain`, a pré-visualização só funciona no
domínio em que o editor abriu o link (o cookie é por domínio).

## Status de build

`npm run build` roda `scripts/build.mjs`: com `ASTRAL_BUILD_WEBHOOK_ID` e
`ASTRAL_WEBHOOK_SECRET` definidos, envia `building` antes do `next build` e `success`
(com `SITE_URL`) ou `failed` (com o motivo) depois, assinados como um webhook, para
`POST /api/<projeto>/webhooks/<id>/status`. Sem as variáveis, é só um `next build`.

## Deploy

### Container Node (Dokploy)

1. Crie a aplicação a partir do repositório (Dockerfile abaixo); porta `3000`.
2. Variáveis de ambiente: as do `.env.example`, no build (o `/schema` é lido no build)
   e no runtime (o webhook e a pré-visualização usam a chave e o segredo).
3. `ASTRAL_REBUILD_HOOK` = o webhook de deploy da aplicação no Dokploy. Assim uma
   publicação de conteúdo estático dispara o redeploy, e o build reporta o status ao CMS.
4. No CMS: webhook do projeto para `https://<site>/api/astral/revalidate` com todos os
   eventos de conteúdo; copie o segredo para `ASTRAL_WEBHOOK_SECRET` e o id para
   `ASTRAL_BUILD_WEBHOOK_ID`.
5. Para guardar o ISR entre deploys e reinícios, monte um volume em `/app/.next/cache`.

```Dockerfile
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG ASTRAL_URL ASTRAL_PROJECT ASTRAL_TOKEN ASTRAL_WEBHOOK_SECRET ASTRAL_BUILD_WEBHOOK_ID SITE_URL
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/node_modules ./node_modules
COPY package.json next.config.ts ./
COPY src/lib ./src/lib
EXPOSE 3000
CMD ["npx", "next", "start"]
```

(O `next.config.ts` e o `src/lib` vão para a imagem porque o `next start` carrega a
configuração, que importa `src/lib/setup.ts`; na fase de servidor ela não chama o CMS.)

### Vercel

1. Importe o repositório; framework Next.js, comando de build `npm run build`.
2. Variáveis de ambiente do `.env.example` em Production (e Preview, se quiser).
3. `ASTRAL_REBUILD_HOOK` = um Deploy Hook do projeto na Vercel.
4. No CMS, o webhook do projeto aponta para `https://<site>/api/astral/revalidate`.
   Na Vercel, `revalidateTag` e `revalidatePath` purgam também o cache da borda, e o
   ISR é compartilhado entre as instâncias.

## Imagens e fontes

Toda imagem do CMS sai de `imageAttrs()` do cliente, por `src/components/Img.tsx`: `<img>`
com o `srcset` WebP do CMS, `sizes`, `width` e `height`; a primeira imagem da página sai
`eager` com `fetchpriority="high"`, as demais `lazy`. O `next/image` não é usado: o CMS já
entrega as variantes. As fontes ficam em `public/fonts`; só a de texto
(`inter-variable.woff2`) é pré-carregada, pelo layout raiz. O CSS (cerca de 26 kB) vai
embutido no HTML (`experimental.inlineCss`).

## Como adicionar um bloco

1. No CMS, crie o componente (por exemplo `pricing`) e acrescente-o à lista de blocos
   dos tipos `home` e `page` (ou edite `astral.model.json` e rode o seed numa instalação nova).
2. Crie `src/blocks/Pricing.tsx`, um componente de servidor que recebe
   `BlockProps<Campos>` (`{ block, locale, index, mode }`, de `src/blocks/types.ts`); use
   `headingOf(index)` para decidir entre `h1` e `h2`, `<Img>` para imagens e
   `dangerouslySetInnerHTML` só em campos `richtext` (já sanitizados pelo CMS; veja
   `src/lib/astral/richtext.ts`). Se o bloco ler o CMS, passe `mode` para o getter.
3. Registre em `src/blocks/Blocks.tsx` (`pricing: Pricing`) e escreva o CSS em
   `src/styles/blocks.css` seguindo a marcação do `DESIGN.md`, para os outros toolkits
   poderem copiar.

Um bloco que o site não conhece é ignorado na renderização (com aviso no dev), então
criar o componente no CMS antes do código nunca quebra o build.

## Demonstração

`scripts/seed-demo.mjs` aplica o modelo e um conteúdo fictício (o estúdio "Vértice",
pessoas e clientes inventados, imagens geradas) a um projeto, pelo admin API. É o mesmo
script do toolkit Astro; veja o README de lá para as variáveis.

## Cliente

`src/lib/astral/` é copiado do repositório do CMS (`toolkits/client`, testado lá com
100% de cobertura). `createClient({ url, project, token })` expõe `list`, `listAll`,
`get`, `single`, `menu`, `menus`, `terms`, `term`, `schema`, `sitemap`, `sitemapXml`,
`jsonLd`, `redirects`, `analytics`, `preview`, com erros tipados e nova tentativa em
erros de rede e 5xx. Ajudantes: `renderMode`, `pathOf`, `localeFormat`, `routePattern`,
`localeOfPath`, `imageAttrs`, `verifyWebhook`, `signBody`, `tagsOf`, `pathsOf`.
