// The fake demo content: an invented studio ("Vértice"), invented people, invented
// clients. Nothing here refers to a real company or person. Rich text is markdown
// (the CMS renders it to sanitized HTML). Every entry has pt-BR and en.

export const LOCALES = ["pt-BR", "en"];

/** Images in scripts/demo-assets, with their alt text per locale. */
export const ASSETS = {
  "hero.jpg": { "pt-BR": "Composição abstrata em azul e dourado", en: "Abstract composition in blue and gold" },
  "cover-1.jpg": { "pt-BR": "Formas sobrepostas em azul", en: "Overlapping shapes in blue" },
  "cover-2.jpg": { "pt-BR": "Formas sobrepostas em verde", en: "Overlapping shapes in green" },
  "cover-3.jpg": { "pt-BR": "Formas sobrepostas em roxo", en: "Overlapping shapes in purple" },
  "cover-4.jpg": { "pt-BR": "Formas sobrepostas em verde-água", en: "Overlapping shapes in teal" },
  "cover-5.jpg": { "pt-BR": "Formas sobrepostas em terracota", en: "Overlapping shapes in terracotta" },
  "cover-6.jpg": { "pt-BR": "Formas sobrepostas em índigo", en: "Overlapping shapes in indigo" },
  "studio-1.jpg": { "pt-BR": "Estudo de formas em cinza", en: "Study of shapes in grey" },
  "studio-2.jpg": { "pt-BR": "Estudo de formas em azul-petróleo", en: "Study of shapes in petrol blue" },
  "studio-3.jpg": { "pt-BR": "Estudo de formas em ocre", en: "Study of shapes in ochre" },
  "team-1.jpg": { "pt-BR": "Retrato abstrato em verde", en: "Abstract portrait in green" },
  "team-2.jpg": { "pt-BR": "Retrato abstrato em rosa", en: "Abstract portrait in pink" },
  "team-3.jpg": { "pt-BR": "Retrato abstrato em verde-água", en: "Abstract portrait in teal" },
  "logo-1.png": { "pt-BR": "Aurora Lab", en: "Aurora Lab" },
  "logo-2.png": { "pt-BR": "Monte Verde", en: "Monte Verde" },
  "logo-3.png": { "pt-BR": "Pico Digital", en: "Pico Digital" },
  "logo-4.png": { "pt-BR": "Casa Nove", en: "Casa Nove" },
  "logo-5.png": { "pt-BR": "Rota 21", en: "Rota 21" },
  "logo-6.png": { "pt-BR": "Lúmen Co.", en: "Lúmen Co." },
  "brand.svg": { "pt-BR": "Vértice", en: "Vértice" },
};

export const TERMS = [
  { key: "design", name: { "pt-BR": "Design", en: "Design" }, slug: { "pt-BR": "design", en: "design" } },
  { key: "tech", name: { "pt-BR": "Tecnologia", en: "Technology" }, slug: { "pt-BR": "tecnologia", en: "technology" } },
  { key: "business", name: { "pt-BR": "Negócios", en: "Business" }, slug: { "pt-BR": "negocios", en: "business" } },
];

export const AUTHORS = [
  {
    key: "helena",
    photo: "team-1.jpg",
    "pt-BR": { name: "Helena Prado", bio: "Diretora de design. Cuida de identidade, tipografia e dos detalhes que ninguém nota até faltarem." },
    en: { name: "Helena Prado", bio: "Design director. Looks after identity, typography and the details nobody notices until they are missing." },
  },
  {
    key: "rafael",
    photo: "team-2.jpg",
    "pt-BR": { name: "Rafael Nunes", bio: "Engenheiro de front-end. Gosta de sites que carregam antes de você perceber." },
    en: { name: "Rafael Nunes", bio: "Front-end engineer. Likes sites that load before you notice." },
  },
];

const link = (label, url, newTab = false) => ({ label, url, newTab });

/** Blocks of the home, per locale. `$asset:name` and `$term:key` are replaced by the seed. */
export const HOME = {
  "pt-BR": [
    { _component: "hero", _key: "hero", eyebrow: "Estúdio de design e tecnologia", title: "Marcas e sites que envelhecem bem", text: "Trabalhamos com poucas empresas por vez, do posicionamento ao código. Cada projeto sai com um sistema de design, um site rápido e um time que sabe mantê-lo.", image: "$asset:hero.jpg", primary: link("Ver serviços", "/servicos"), secondary: link("Falar com a gente", "/contato"), align: "start" },
    { _component: "logos", _key: "logos", title: "Quem confia no nosso trabalho", logos: ["$asset:logo-1.png", "$asset:logo-2.png", "$asset:logo-3.png", "$asset:logo-4.png", "$asset:logo-5.png", "$asset:logo-6.png"] },
    {
      _component: "features",
      _key: "features",
      title: "O que fazemos",
      text: "Três frentes, um só time. Entramos onde faz diferença e saímos quando o cliente consegue seguir sozinho.",
      columns: "3",
      items: [
        { icon: "compass", title: "Posicionamento", text: "Entrevistas, pesquisa e um documento curto que diz o que a marca é, para quem e por quê.", link: link("Ver posicionamento", "/servicos") },
        { icon: "layers", title: "Identidade e sistema de design", text: "Logo, tipografia, cor e componentes documentados, prontos para o time usar sem depender da gente." },
        { icon: "bolt", title: "Sites e produtos", text: "Front-end estático ou híbrido, CMS headless e métricas de performance acompanhadas depois do lançamento." },
      ],
    },
    { _component: "mediatext", _key: "mediatext", title: "Método simples, sem surpresas", text: "Toda semana tem uma entrega que dá para ver e comentar. O cliente acompanha num quadro compartilhado, aprova por etapa e nunca descobre o resultado só no fim.\n\nO que mais economiza tempo é dizer **não** cedo: cortamos o que não serve ao objetivo antes de desenhar.", image: "$asset:studio-1.jpg", imageSide: "end", link: link("Como trabalhamos", "/sobre") },
    { _component: "stats", _key: "stats", title: "Em números", items: [{ value: "12 anos", label: "de estúdio" }, { value: "140+", label: "projetos entregues" }, { value: "98", label: "de performance no Lighthouse, em média" }, { value: "4", label: "pessoas por projeto" }] },
    { _component: "testimonials", _key: "testimonials", title: "O que dizem os clientes", items: [{ quote: "Pela primeira vez o site ficou mais rápido depois do redesign, e o time interno conseguiu publicar sozinho desde a primeira semana.", name: "Marina Costa", role: "Diretora de marketing, Aurora Lab", photo: "$asset:team-3.jpg" }, { quote: "Eles disseram não para metade das nossas ideias e tinham razão em todas.", name: "Paulo Teixeira", role: "Fundador, Monte Verde" }] },
    { _component: "postlist", _key: "postlist", title: "Do blog", text: "Notas sobre design, tecnologia e o dia a dia do estúdio.", limit: 3, live: false, link: link("Todos os posts", "/blog") },
    { _component: "cta", _key: "cta", title: "Vamos conversar sobre o seu projeto?", text: "Respondemos em até dois dias úteis, com uma proposta curta e um prazo real.", button: link("Entrar em contato", "/contato"), tone: "accent" },
  ],
  en: [
    { _component: "hero", _key: "hero", eyebrow: "Design and technology studio", title: "Brands and websites that age well", text: "We work with a few companies at a time, from positioning to code. Every project ships with a design system, a fast website and a team that knows how to keep it that way.", image: "$asset:hero.jpg", primary: link("See services", "/en/services"), secondary: link("Talk to us", "/en/contact"), align: "start" },
    { _component: "logos", _key: "logos", title: "Trusted by", logos: ["$asset:logo-1.png", "$asset:logo-2.png", "$asset:logo-3.png", "$asset:logo-4.png", "$asset:logo-5.png", "$asset:logo-6.png"] },
    {
      _component: "features",
      _key: "features",
      title: "What we do",
      text: "Three fronts, one team. We step in where it matters and step out once the client can carry on alone.",
      columns: "3",
      items: [
        { icon: "compass", title: "Positioning", text: "Interviews, research and a short document that says what the brand is, for whom and why.", link: link("See positioning", "/en/services") },
        { icon: "layers", title: "Identity and design system", text: "Logo, typography, color and documented components, ready for the team to use without us." },
        { icon: "bolt", title: "Websites and products", text: "Static or hybrid front-ends, a headless CMS and performance metrics followed after launch." },
      ],
    },
    { _component: "mediatext", _key: "mediatext", title: "A simple method, no surprises", text: "Every week there is something to see and comment on. The client follows a shared board, approves stage by stage and never meets the result only at the end.\n\nWhat saves the most time is saying **no** early: we cut what does not serve the goal before drawing anything.", image: "$asset:studio-1.jpg", imageSide: "end", link: link("How we work", "/en/about") },
    { _component: "stats", _key: "stats", title: "In numbers", items: [{ value: "12 years", label: "as a studio" }, { value: "140+", label: "projects delivered" }, { value: "98", label: "average Lighthouse performance" }, { value: "4", label: "people per project" }] },
    { _component: "testimonials", _key: "testimonials", title: "What clients say", items: [{ quote: "For the first time the site got faster after a redesign, and our team could publish on its own from week one.", name: "Marina Costa", role: "Marketing director, Aurora Lab", photo: "$asset:team-3.jpg" }, { quote: "They said no to half of our ideas and were right every time.", name: "Paulo Teixeira", role: "Founder, Monte Verde" }] },
    { _component: "postlist", _key: "postlist", title: "From the blog", text: "Notes on design, technology and daily life at the studio.", limit: 3, live: false, link: link("All posts", "/en/blog") },
    { _component: "cta", _key: "cta", title: "Shall we talk about your project?", text: "We answer within two business days, with a short proposal and a real deadline.", button: link("Get in touch", "/en/contact"), tone: "accent" },
  ],
};

export const PAGES = [
  {
    key: "about",
    "pt-BR": {
      title: "Sobre",
      slug: "sobre",
      blocks: [
        { _component: "hero", _key: "hero", eyebrow: "Sobre o estúdio", title: "Pequeno de propósito", text: "Somos quatro pessoas em Porto Alegre. Preferimos poucos projetos com tempo a muitos com pressa.", align: "center" },
        { _component: "richtext", _key: "text", width: "narrow", body: "## Como começou\n\nO Vértice nasceu em 2014 como um estúdio de identidade visual. Os clientes pediam o site junto, e a gente percebeu que o site é onde a identidade vive de verdade: foi assim que o código entrou.\n\n## No que acreditamos\n\n- **Clareza antes de estilo.** Uma marca precisa ser entendida antes de ser admirada.\n- **Performance é design.** Um site lento desfaz qualquer cuidado visual.\n- **Entregar o sistema, não só a peça.** O cliente precisa conseguir continuar sem nós.\n\n> Fazer menos, com mais atenção, quase sempre rende mais.\n\nSe quiser conhecer o espaço, [escreva para a gente](/contato) e combine um café." },
        { _component: "gallery", _key: "gallery", title: "O estúdio", columns: "3", images: ["$asset:studio-1.jpg", "$asset:studio-2.jpg", "$asset:studio-3.jpg"] },
        { _component: "cta", _key: "cta", title: "Quer trabalhar com a gente?", text: "Abrimos uma vaga por ano. Mande um portfólio curto e conte o que você gosta de fazer.", button: link("Enviar portfólio", "/contato"), tone: "neutral" },
      ],
    },
    en: {
      title: "About",
      slug: "about",
      blocks: [
        { _component: "hero", _key: "hero", eyebrow: "About the studio", title: "Small on purpose", text: "We are four people in Porto Alegre. We prefer a few projects with time over many in a hurry.", align: "center" },
        { _component: "richtext", _key: "text", width: "narrow", body: "## How it started\n\nVértice was born in 2014 as a visual identity studio. Clients kept asking for the website too, and we realized the website is where an identity truly lives: that is how code came in.\n\n## What we believe\n\n- **Clarity before style.** A brand needs to be understood before it is admired.\n- **Performance is design.** A slow website undoes any visual care.\n- **Deliver the system, not just the piece.** The client must be able to carry on without us.\n\n> Doing less, with more attention, almost always pays more.\n\nIf you would like to visit, [write to us](/en/contact) and we will set up a coffee." },
        { _component: "gallery", _key: "gallery", title: "The studio", columns: "3", images: ["$asset:studio-1.jpg", "$asset:studio-2.jpg", "$asset:studio-3.jpg"] },
        { _component: "cta", _key: "cta", title: "Want to work with us?", text: "We open one position a year. Send a short portfolio and tell us what you like to do.", button: link("Send portfolio", "/en/contact"), tone: "neutral" },
      ],
    },
  },
  {
    key: "services",
    "pt-BR": {
      title: "Serviços",
      slug: "servicos",
      blocks: [
        { _component: "hero", _key: "hero", eyebrow: "Serviços", title: "Do posicionamento ao código", text: "Três serviços que podem ser contratados juntos ou separados. Em todos, o cliente sai com algo que consegue manter.", align: "start" },
        {
          _component: "features",
          _key: "features",
          columns: "2",
          items: [
            { icon: "compass", title: "Posicionamento", text: "Quatro semanas. Entrevistas com clientes e equipe, análise de concorrentes e um documento de uma página com proposta de valor, tom e mensagens-chave." },
            { icon: "layers", title: "Identidade e sistema de design", text: "Seis a oito semanas. Logo, tipografia, cores e um kit de componentes documentado em Figma, com guia de uso." },
            { icon: "bolt", title: "Site e CMS", text: "Seis a doze semanas. Site estático ou híbrido com CMS headless, treinamento da equipe e um mês de acompanhamento." },
            { icon: "chart", title: "Acompanhamento", text: "Mensal. Métricas de performance e conversão, pequenos ajustes e um relatório curto por mês." },
          ],
        },
        {
          _component: "faq",
          _key: "faq",
          title: "Perguntas frequentes",
          items: [
            { question: "Quanto custa um projeto?", answer: "Depende do escopo, mas trabalhamos com faixas fechadas por serviço. A proposta vem com valor total e prazo, sem hora extra escondida." },
            { question: "Vocês trabalham com empresas fora do Brasil?", answer: "Sim. Metade dos projetos recentes foi com empresas na Europa e nos Estados Unidos, em inglês." },
            { question: "O site fica com quem?", answer: "Com o cliente. O código vai para um repositório da empresa, com documentação para qualquer time dar continuidade." },
            { question: "Quanto tempo leva?", answer: "De quatro semanas (posicionamento) a doze (site completo). Contratando tudo junto, cerca de cinco meses." },
          ],
        },
        { _component: "cta", _key: "cta", title: "Peça uma proposta", text: "Conte em poucas linhas o que precisa e respondemos com uma estimativa.", button: link("Entrar em contato", "/contato"), tone: "accent" },
      ],
    },
    en: {
      title: "Services",
      slug: "services",
      blocks: [
        { _component: "hero", _key: "hero", eyebrow: "Services", title: "From positioning to code", text: "Three services that can be hired together or apart. In all of them, the client leaves with something they can maintain.", align: "start" },
        {
          _component: "features",
          _key: "features",
          columns: "2",
          items: [
            { icon: "compass", title: "Positioning", text: "Four weeks. Interviews with clients and team, competitor analysis and a one-page document with value proposition, tone and key messages." },
            { icon: "layers", title: "Identity and design system", text: "Six to eight weeks. Logo, typography, colors and a component kit documented in Figma, with usage guidelines." },
            { icon: "bolt", title: "Website and CMS", text: "Six to twelve weeks. A static or hybrid website with a headless CMS, team training and a month of follow-up." },
            { icon: "chart", title: "Follow-up", text: "Monthly. Performance and conversion metrics, small adjustments and a short report every month." },
          ],
        },
        {
          _component: "faq",
          _key: "faq",
          title: "Frequently asked questions",
          items: [
            { question: "How much does a project cost?", answer: "It depends on the scope, but we work with fixed ranges per service. The proposal comes with a total price and a deadline, no hidden overtime." },
            { question: "Do you work with companies outside Brazil?", answer: "Yes. Half of our recent projects were with companies in Europe and the United States, in English." },
            { question: "Who owns the website?", answer: "The client. The code goes to a company repository, with documentation for any team to carry on." },
            { question: "How long does it take?", answer: "From four weeks (positioning) to twelve (a full website). Hiring everything together, about five months." },
          ],
        },
        { _component: "cta", _key: "cta", title: "Request a proposal", text: "Tell us in a few lines what you need and we will reply with an estimate.", button: link("Get in touch", "/en/contact"), tone: "accent" },
      ],
    },
  },
  {
    key: "contact",
    "pt-BR": {
      title: "Contato",
      slug: "contato",
      blocks: [
        { _component: "hero", _key: "hero", eyebrow: "Contato", title: "Vamos conversar", text: "Escreva para ola@vertice.example ou passe no estúdio, na Rua das Oliveiras, 120, Porto Alegre. Atendemos de segunda a sexta, das 9h às 18h.", align: "center" },
        { _component: "richtext", _key: "text", width: "narrow", body: "### Para novos projetos\n\nConte o que a empresa faz, o que precisa e para quando. Respondemos em até dois dias úteis.\n\n### Para imprensa e palestras\n\nEscreva para imprensa@vertice.example com o tema e a data." },
      ],
    },
    en: {
      title: "Contact",
      slug: "contact",
      blocks: [
        { _component: "hero", _key: "hero", eyebrow: "Contact", title: "Let's talk", text: "Write to ola@vertice.example or visit the studio at Rua das Oliveiras 120, Porto Alegre. We are in Monday to Friday, 9am to 6pm.", align: "center" },
        { _component: "richtext", _key: "text", width: "narrow", body: "### New projects\n\nTell us what the company does, what it needs and by when. We answer within two business days.\n\n### Press and talks\n\nWrite to imprensa@vertice.example with the topic and the date." },
      ],
    },
  },
];

export const POSTS = [
  {
    key: "p1",
    cover: "cover-1.jpg",
    author: "helena",
    category: "design",
    date: "2026-10-14",
    "pt-BR": { title: "Por que um sistema de design vale mais que um logo", slug: "sistema-de-design-vale-mais-que-um-logo", excerpt: "O logo é a parte visível. O sistema é o que faz a marca sobreviver ao time que a criou.", body: "Quando uma empresa pede um logo, quase sempre precisa de outra coisa: um jeito consistente de aparecer. O logo resolve um dia; o sistema resolve os próximos anos.\n\n## O que entra num sistema\n\n- Tipografia com escala definida e regras de uso\n- Cores com nomes, contrastes testados e versões para modo escuro\n- Componentes (botões, cards, formulários) documentados com exemplos\n- Espaçamentos em ritmo, não em números soltos\n\n## Como medir se funciona\n\nUm bom sistema se mede pela ausência de perguntas. Se o time consegue montar uma landing page nova sem chamar o estúdio, ele funciona.\n\n> Um sistema de design é um contrato entre quem cria e quem mantém.\n\nNa prática, entregamos o sistema em Figma e em código, com as mesmas variáveis dos dois lados. Assim o que o designer muda aparece no site sem tradução." },
    en: { title: "Why a design system is worth more than a logo", slug: "design-system-worth-more-than-a-logo", excerpt: "The logo is the visible part. The system is what lets the brand outlive the team that created it.", body: "When a company asks for a logo, it almost always needs something else: a consistent way to show up. The logo solves one day; the system solves the next years.\n\n## What goes into a system\n\n- Typography with a defined scale and usage rules\n- Colors with names, tested contrasts and dark mode versions\n- Components (buttons, cards, forms) documented with examples\n- Spacing in rhythm, not loose numbers\n\n## How to tell it works\n\nA good system is measured by the absence of questions. If the team can build a new landing page without calling the studio, it works.\n\n> A design system is a contract between those who create and those who maintain.\n\nIn practice we deliver the system in Figma and in code, with the same variables on both sides. What the designer changes shows up on the site without translation." },
  },
  {
    key: "p2",
    cover: "cover-2.jpg",
    author: "rafael",
    category: "tech",
    date: "2026-09-30",
    "pt-BR": { title: "Sites estáticos com partes vivas", slug: "sites-estaticos-com-partes-vivas", excerpt: "Nem tudo precisa ser renderizado a cada visita. Quase nada, na verdade.", body: "A pergunta certa não é \"estático ou dinâmico?\", mas \"o que muda, e com que frequência?\". A maior parte de um site institucional muda algumas vezes por mês. Renderizar isso a cada visita é desperdício.\n\n## Três modos\n\n1. **Estático**: gerado na publicação. Páginas institucionais, a home, o sobre.\n2. **Revalidado**: gerado uma vez e refeito só quando o conteúdo muda. Posts, produtos.\n3. **Dinâmico**: gerado a cada visita. Resultados de busca, áreas logadas.\n\n## A parte viva\n\nUma página estática pode ter uma ilha que busca dados no navegador: a lista dos últimos posts, o estoque de um produto. O resto continua sendo HTML puro, servido de um CDN.\n\n```js\nconst posts = await fetch(\"/api/posts\").then((r) => r.json());\n```\n\nO ganho é concreto: tempo de resposta de poucos milissegundos, servidor pequeno e um site que continua no ar mesmo se o CMS cair por uma hora." },
    en: { title: "Static websites with living parts", slug: "static-websites-with-living-parts", excerpt: "Not everything needs to be rendered on every visit. Almost nothing, in fact.", body: "The right question is not \"static or dynamic?\" but \"what changes, and how often?\". Most of a company website changes a few times a month. Rendering it on every visit is waste.\n\n## Three modes\n\n1. **Static**: generated on publish. Institutional pages, the home, the about page.\n2. **Revalidated**: generated once and redone only when the content changes. Posts, products.\n3. **Dynamic**: generated on every visit. Search results, signed-in areas.\n\n## The living part\n\nA static page can hold an island that fetches data in the browser: the latest posts, a product's stock. The rest stays plain HTML, served from a CDN.\n\n```js\nconst posts = await fetch(\"/api/posts\").then((r) => r.json());\n```\n\nThe gain is concrete: response times of a few milliseconds, a small server and a website that stays up even if the CMS goes down for an hour." },
  },
  {
    key: "p3",
    cover: "cover-3.jpg",
    author: "helena",
    category: "business",
    date: "2026-09-12",
    "pt-BR": { title: "Como escrevemos propostas de uma página", slug: "propostas-de-uma-pagina", excerpt: "Uma proposta longa esconde o que importa. A nossa cabe numa folha.", body: "Depois de anos escrevendo propostas de vinte páginas que ninguém lia inteiras, reduzimos para uma. O que ficou:\n\n- **O problema**, nas palavras do cliente\n- **O que vamos entregar**, em itens verificáveis\n- **O que não vamos fazer**, para evitar expectativas erradas\n- **Prazo e valor**, fechados\n\nA conversa que vem depois é sempre mais honesta. Ninguém precisa decifrar uma tabela de horas para entender o que está comprando." },
    en: { title: "How we write one-page proposals", slug: "one-page-proposals", excerpt: "A long proposal hides what matters. Ours fits on a single sheet.", body: "After years of writing twenty-page proposals nobody read to the end, we cut them down to one. What stayed:\n\n- **The problem**, in the client's words\n- **What we will deliver**, as verifiable items\n- **What we will not do**, to avoid wrong expectations\n- **Deadline and price**, fixed\n\nThe conversation that follows is always more honest. Nobody has to decode a table of hours to understand what they are buying." },
  },
  {
    key: "p4",
    cover: "cover-4.jpg",
    author: "rafael",
    category: "tech",
    date: "2026-08-21",
    "pt-BR": { title: "Imagens responsivas sem sofrimento", slug: "imagens-responsivas-sem-sofrimento", excerpt: "srcset, sizes, largura e altura declaradas. O resto é o CMS que resolve.", body: "A maior parte do peso de uma página são imagens. A solução é antiga e funciona: `srcset` com várias larguras, `sizes` descrevendo o layout e `width`/`height` para o navegador reservar o espaço.\n\n## O que o CMS entrega\n\nCada imagem vem com as variantes em WebP já prontas, nas larguras 320, 640, 960, 1280 e 1920, a cor dominante e um placeholder minúsculo.\n\n## O que o site faz\n\n- A primeira imagem da página carrega com prioridade alta\n- As outras carregam quando se aproximam da tela\n- O espaço é reservado pela proporção, então nada pula\n\nSem biblioteca, sem build de imagens, sem surpresas." },
    en: { title: "Responsive images without the pain", slug: "responsive-images-without-the-pain", excerpt: "srcset, sizes, declared width and height. The CMS handles the rest.", body: "Most of a page's weight is images. The solution is old and it works: `srcset` with several widths, `sizes` describing the layout and `width`/`height` so the browser reserves the space.\n\n## What the CMS delivers\n\nEach image comes with ready WebP variants at 320, 640, 960, 1280 and 1920 pixels wide, its dominant color and a tiny placeholder.\n\n## What the site does\n\n- The first image of the page loads with high priority\n- The others load as they approach the screen\n- Space is reserved by the aspect ratio, so nothing jumps\n\nNo library, no image build step, no surprises." },
  },
  {
    key: "p5",
    cover: "cover-5.jpg",
    author: "helena",
    category: "design",
    date: "2026-07-30",
    "pt-BR": { title: "Tipografia: três decisões que resolvem quase tudo", slug: "tipografia-tres-decisoes", excerpt: "Escala, medida e ritmo vertical. Com essas três, o resto é ajuste fino.", body: "Antes de escolher fontes, decidimos três coisas.\n\n1. **A escala.** Uma razão (usamos 1,25) e seis tamanhos. Nada fora dela.\n2. **A medida.** Linhas de 60 a 70 caracteres para texto corrido. Mais que isso cansa; menos quebra demais.\n3. **O ritmo.** Espaçamentos múltiplos de uma unidade (0,25rem), para que tudo se alinhe sem parecer.\n\nSó depois vem a fonte. E quase sempre uma só para o corpo, com uma serifada para títulos quando a marca pede calma." },
    en: { title: "Typography: three decisions that solve almost everything", slug: "typography-three-decisions", excerpt: "Scale, measure and vertical rhythm. With those three, the rest is fine-tuning.", body: "Before choosing fonts, we decide three things.\n\n1. **The scale.** One ratio (we use 1.25) and six sizes. Nothing outside it.\n2. **The measure.** Lines of 60 to 70 characters for running text. More tires; less breaks too often.\n3. **The rhythm.** Spacing in multiples of one unit (0.25rem), so everything aligns without looking like it.\n\nOnly then comes the font. And almost always a single one for body text, with a serif for headings when the brand calls for calm." },
  },
  {
    key: "p6",
    cover: "cover-6.jpg",
    author: "rafael",
    category: "business",
    date: "2026-07-02",
    "pt-BR": { title: "O que medimos depois do lançamento", slug: "o-que-medimos-depois-do-lancamento", excerpt: "Lançar é o meio do projeto. O primeiro mês depois diz se funcionou.", body: "Todo projeto nosso tem um mês de acompanhamento. Nele olhamos quatro coisas:\n\n- **Performance real** (Core Web Vitals de visitantes, não só do laboratório)\n- **Páginas de entrada** e para onde as pessoas vão a partir delas\n- **Formulários**: quantos começam, quantos terminam\n- **Erros** de JavaScript e links quebrados\n\nQuase sempre há um ajuste pequeno que muda muito: um título confuso, um botão abaixo da dobra, uma imagem pesada demais. É barato de corrigir e seria invisível sem medir." },
    en: { title: "What we measure after launch", slug: "what-we-measure-after-launch", excerpt: "Launching is the middle of the project. The first month after tells whether it worked.", body: "Every project of ours has a month of follow-up. In it we look at four things:\n\n- **Real performance** (visitors' Core Web Vitals, not just the lab)\n- **Entry pages** and where people go from them\n- **Forms**: how many start, how many finish\n- **Errors** in JavaScript and broken links\n\nThere is almost always a small fix that changes a lot: a confusing title, a button below the fold, an image that is too heavy. It is cheap to fix and would be invisible without measuring." },
  },
];

export const SETTINGS = {
  "pt-BR": { siteName: "Vértice", logo: "$asset:brand.svg", description: "Estúdio de design e tecnologia em Porto Alegre. Marcas, sistemas de design e sites rápidos.", social: [link("Instagram", "https://instagram.com/", true), link("LinkedIn", "https://linkedin.com/", true)], footerText: "Vértice Estúdio Ltda. Rua das Oliveiras, 120, Porto Alegre. Empresa fictícia criada para demonstração.", contactEmail: "ola@vertice.example" },
  en: { siteName: "Vértice", logo: "$asset:brand.svg", description: "A design and technology studio in Porto Alegre. Brands, design systems and fast websites.", social: [link("Instagram", "https://instagram.com/", true), link("LinkedIn", "https://linkedin.com/", true)], footerText: "Vértice Estúdio Ltda. Rua das Oliveiras 120, Porto Alegre. A fictional company made for this demo.", contactEmail: "ola@vertice.example" },
};

/** Menu items: `$page:key` is an entry link to that page, `$blog` the post archive. */
export const MENUS = {
  header: { name: "Menu principal", items: [{ ref: "$page:services" }, { ref: "$page:about" }, { ref: "$blog", label: { "pt-BR": "Blog", en: "Blog" } }, { ref: "$page:contact" }] },
  footer: { name: "Menu do rodapé", items: [{ ref: "$page:about" }, { ref: "$page:services" }, { ref: "$blog", label: { "pt-BR": "Blog", en: "Blog" } }, { ref: "$page:contact" }] },
};
