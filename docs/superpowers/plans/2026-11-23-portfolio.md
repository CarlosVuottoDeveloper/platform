# Landing page pessoal (portfolio) — plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** criar `apps/web/portfolio`, a landing page do Carlos Vuotto para clientes de freela e recrutadores, publicada no projeto `carlos-vuotto` do Vercel a cada push no `main`.

**Architecture:**

- Quatro peças novas no `@industry/web`: `BrandIcon`, `LinkButton`, `TopNav` e `MediaCard`.
- Um app Vite estático que compõe essas peças com as que já existem.
- Conteúdo tipado em `src/content/`, função pura do WhatsApp em `src/domain/` e uma seção por arquivo em `src/sections/`.
- Sem servidor, sem `services/`.

**Tech Stack:** React 19.2.5, Vite 6, TypeScript 5.9, Jest 30 + Testing Library, `@industry/web`, `@industry/tokens`, Storybook 8, Changesets, GitHub Actions, Vercel CLI 65.16.0.

**Spec:** `docs/superpowers/specs/2026-11-23-portfolio-design.md`

## Global Constraints

- Nomes em inglês (pastas, arquivos, componentes, funções, tipos, ids, imagens, workflow, secrets). Texto visível em português.
- Nome no site: **Carlos Vuotto**. Monograma "CV".
- Sem números de marketing, sem depoimentos, sem formulário, sem analytics, sem cookies. Nenhum dado inventado.
- WhatsApp: `5511964561982`. LinkedIn: `https://www.linkedin.com/in/kaduvuotto`. GitHub: `https://github.com/CarlosVuottoDeveloper`.
- Todo link externo abre em nova aba com `rel="noopener noreferrer"`.
- Cor, espaçamento e raio só de tokens. Hex só em SVG estático e no `theme-color` (`#070b1f`).
- Zero comentários, sem `any`, `--max-warnings 0`, cobertura ≥ 95% nos arquivos alterados.
- Build do app abaixo de 200 arquivos (`manualChunks` dos ícones, como no finance-app).
- Commits em português, sem `Co-Authored-By`. Um code review (skill `code-review`, nível low) ao fim de cada tarefa.
- Um processo por vez: testes com `--runInBand`, nada em paralelo ou em segundo plano.
- PR 1 = Tarefas 1–4, na branch `feat/portfolio-ds`. PR 2 = Tarefas 5–10, na `feat/portfolio`, empilhada sobre a do PR 1. Antes do merge do PR 2, retarget para `main` e `git merge -s ours origin/main` depois do squash do PR 1.

## Review Focus

1. **390px de largura**, com nomes de projeto longos e a barra do topo: nenhuma rolagem horizontal. Teste das colunas por largura (Tarefas 8–9) e captura (Tarefa 10).
2. **Sem foto** (`src` vazio): aparece o monograma, nunca uma imagem quebrada. **Com foto**: `<img>` com `alt` descritivo. Teste na Tarefa 8.
3. **Links externos** (projetos, LinkedIn, GitHub, WhatsApp): todos com `target="_blank"` e `rel="noopener noreferrer"`. Teste por varredura na Tarefa 9.
4. **Mensagem do WhatsApp com acentos, `&`, `?` e espaços:** chega intacta, codificada uma única vez. Teste na Tarefa 6.
5. **Navegação por teclado:** os links do topo e do rodapé levam a seções com `id` existente, a página tem um único `h1` e o acordeão de dúvidas abre com Enter e Espaço. Teste na Tarefa 9.

---

### Task 1: `BrandIcon`

**Files:** Create `packages/design-system/industry/web/src/components/core/BrandIcon.{tsx,test.tsx,stories.tsx}`. Modify `index.ts`. Create `.changeset/industry-web-brand-icon.md` (minor).

**Interfaces:**

- Produces: `BrandIcon({ name: BrandName; size?: IconSize; 'aria-label'?: string; style?: CSSProperties })`, `type BrandName = 'linkedin' | 'github' | 'whatsapp'`.
- `IconSize` é o mesmo tipo do `Icon`: `xs` 14, `sm` 16, `md` 20, `lg` 24 ou número.

- [ ] Testes:
  - um `<svg>` por nome, com `viewBox="0 0 24 24"` e `fill="currentColor"`;
  - `size="md"` dá 20 de largura e altura; `size={32}` dá 32;
  - sem `aria-label`: `aria-hidden="true"`;
  - com `aria-label`: `role="img"` e esse nome.
- [ ] Rodar: `yarn workspace @industry/web test --testPathPatterns=BrandIcon`. Esperado: FAIL (módulo não existe).
- [ ] Implementar com os caminhos SVG do Simple Icons (CC0) de LinkedIn, GitHub e WhatsApp, num mapa `Record<BrandName, string>`. Story `All` com os três, em `sm` e `lg`.
- [ ] Rodar `test`, `lint`, `check-types` do `@industry/web`. Esperado: tudo passa.
- [ ] Commit: `feat(industry-web): BrandIcon`

### Task 2: `LinkButton`

**Files:** Create `LinkButton.{tsx,test.tsx,stories.tsx}`. Modify `Button.tsx`, `index.ts`. Create `.changeset/industry-web-link-button.md` (minor).

**Interfaces:**

- Produces:
  - `LinkButton({ href: string; variant?: ButtonVariant; size?: ButtonSize; external?: boolean; children: ReactNode; style?: CSSProperties; 'aria-label'?: string })`;
  - `buttonSurfaceStyle(...)`, extraído do `Button` e usado pelos dois.

- [ ] Testes:
  - renderiza `<a href>` com o mesmo `background`, `borderRadius`, `height` e `padding` que o `Button` da mesma `variant` e `size` (comparar com um `Button` renderizado no mesmo teste);
  - com `external`: `target="_blank"` e `rel="noopener noreferrer"`; sem `external`: nenhum dos dois;
  - a `variant` padrão é `secondary`, como no `Button`.
- [ ] Rodar o teste. Esperado: FAIL.
- [ ] Extrair o cálculo de estilo do `Button` (cores por `variant` e estado, altura, padding, raio) para uma função compartilhada no mesmo módulo e usá-la nos dois. Os testes atuais do `Button` continuam passando sem mudança. O hover e o pressed vêm do mesmo `usePressState`.
- [ ] Story `Variants` com `primary` e `secondary`, uma delas `external`.
- [ ] Rodar `test`, `lint`, `check-types`. Esperado: tudo passa, incluindo os testes antigos do `Button`.
- [ ] Commit: `feat(industry-web): LinkButton`

### Task 3: `TopNav`

**Files:** Create `TopNav.{tsx,test.tsx,stories.tsx}`. Modify `index.ts`. Create `.changeset/industry-web-top-nav.md` (minor).

**Interfaces:**

- Produces:
  - `TopNav({ brand: ReactNode; links: TopNavLink[]; action?: ReactNode; collapsed?: boolean; style?: CSSProperties })`;
  - `TopNavLink = { label: string; href: string }`.

- [ ] Testes:
  - é um `<nav aria-label="Principal">` com a marca, um link por item (com `href`) e a ação;
  - `collapsed` esconde os links (não renderiza a lista), mas mantém marca e ação;
  - a superfície tem `borderRadius: var(--radius-pill)`, `position: sticky`, `top` com `var(--space-4)` e `backdropFilter` definido.
- [ ] Rodar. Esperado: FAIL.
- [ ] Implementar. O fundo é `color-mix` de `--color-surface` translúcido, com borda `--color-divider`. Os links usam `--color-neutral-200`, e `--color-text` no hover.
- [ ] Stories `Default` e `Collapsed`.
- [ ] Rodar `test`, `lint`, `check-types`. Esperado: tudo passa.
- [ ] Commit: `feat(industry-web): TopNav`

### Task 4: `MediaCard`

**Files:** Create `MediaCard.{tsx,test.tsx,stories.tsx}`. Modify `index.ts`. Create `.changeset/industry-web-media-card.md` (minor).

**Interfaces:**

- Produces: `MediaCard({ image: { src: string; alt: string }; kicker?: ReactNode; title: ReactNode; body?: ReactNode; href?: string; style?: CSSProperties; testID?: string })`.

- [ ] Testes:
  - mostra a imagem (`alt`, `loading="lazy"`, `aspectRatio: '16 / 10'`, `objectFit: 'cover'`), o `kicker`, o título e o `body`;
  - com `href`: o cartão inteiro é um `<a>` com `target="_blank"`, `rel="noopener noreferrer"` e o ícone `arrow-up-right` (presença de `svg` depois de carregar). O nome acessível do link contém o título;
  - sem `href`: nenhum `<a>`;
  - um título longo sem espaços quebra dentro do cartão (`overflowWrap: 'anywhere'`).
- [ ] Rodar. Esperado: FAIL.
- [ ] Implementar sobre `GradientSurface` com borda `--color-divider`, como o `Card`.
- [ ] Story `Default` com uma imagem de exemplo (data URL de um gradiente SVG) e `href`.
- [ ] Rodar `test`, `lint`, `check-types` e `build`. Esperado: tudo passa.
- [ ] Commit: `feat(industry-web): MediaCard`
- [ ] Abrir o PR 1 (Tarefas 1–4 mais spec e plano). Esperar a aprovação do Chromatic pelo Carlos antes do merge.

### Task 5: estrutura do app

**Files:**

- Create `apps/web/portfolio/`: `package.json`, `tsconfig.json`, `vite.config.ts`, `jest.config.cjs`, `jest.setup.ts`, `jest.cssStub.cjs`, `eslint.config.mjs`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/App.test.tsx`, `src/hooks/useIsWideScreen.{ts,test.tsx}`, `src/test-utils.ts`.
- Modify root `CLAUDE.md`: a árvore do monorepo ganha a linha do app.

**Interfaces:**

- Produces: `@app/portfolio` com os scripts `dev`, `build` (`tsc --noEmit && vite build`), `preview`, `lint`, `check-types` e `test`; `useIsWideScreen(): boolean` (768px); `mockWideScreen(isWide: boolean)` em `src/test-utils.ts`.

- [ ] Copiar a base do finance-app, sem nada de Firebase:
  - `package.json` com React 19.2.5, `@industry/web`, `@industry/tokens` e as mesmas `devDependencies` de teste e lint;
  - `tsconfig.json`;
  - `vite.config.ts` com o `manualChunks` dos ícones;
  - `jest.config.cjs` com o mapeamento do `react` e do CSS, sem `test-stubs`;
  - `jest.setup.ts` com o `matchMedia`;
  - `eslint.config.mjs` com `domainServicesBoundaries('src')`.

  Adicionar o pacote editando o `package.json` à mão e rodar `yarn install`.

- [ ] Teste do `App`: renderiza um único `heading` de nível 1 e um `<main>`.
- [ ] Rodar `yarn workspace @app/portfolio test`. Esperado: FAIL (o `App` ainda não existe).
- [ ] `App` mínimo: `<main>` com um `h1` provisório que a Tarefa 8 substitui. `useIsWideScreen` igual ao do finance-app, com o teste dele.
- [ ] `index.html`:
  - `lang="pt-BR"`;
  - `<title>Carlos Vuotto — Desenvolvedor Front-end</title>`;
  - `meta description`;
  - `theme-color` `#070b1f`;
  - links do favicon (arquivos na Tarefa 10).
- [ ] Rodar `test`, `lint`, `check-types` e `build` do app. Esperado: tudo passa; o build tem menos de 20 arquivos.
- [ ] Commit: `feat(portfolio): estrutura do app`

### Task 6: domínio, conteúdo e capturas dos projetos

**Files:**

- Create `src/domain/{content.ts,whatsapp.ts,whatsapp.test.ts}`.
- Create `src/content/{projects,services,process,experience,stack,faq,contact,navigation}.ts` e `src/content/content.test.ts`.
- Create `public/projects/{jb-barbershop,kalliamma-music-therapy,wanog-law,fernanda-nakabara-psychiatry,mistura-e-sabores}.webp`.

**Interfaces:**

- Produces:

  ```ts
  type Project = {
    id: string;
    name: string;
    category: string;
    summary: string;
    url: string;
    image: string;
  };
  type ProcessStep = { id: string; number: string; title: string; description: string };
  type Experience = { company: string; period: string; description: string };
  type FaqItem = { id: string; question: string; answer: string };
  type NavLink = { label: string; href: `#${string}` };
  function whatsappLink(phone: string, message: string): string;
  ```

  Exports de conteúdo:
  - `PROJECTS`, `SERVICES`, `PROCESS_STEPS`, `EXPERIENCE`, `STACK: string[]`, `FAQ`, `NAV_LINKS`;
  - `CONTACT = { whatsappPhone, whatsappMessage, linkedin, github }`;
  - `SECTION_IDS = { projects: 'projetos', services: 'servicos', about: 'sobre', faq: 'duvidas' }`, que são as âncoras visíveis na URL.

  O tipo `Service = { id; title; description; icon: IconName }` fica em `src/content/services.ts`, não no domínio, porque depende de um tipo do design system.

- [ ] Testes de `whatsappLink`:

  ```ts
  expect(whatsappLink('5511964561982', 'Olá, Carlos! Projeto & site?')).toBe(
    'https://wa.me/5511964561982?text=Ol%C3%A1%2C%20Carlos!%20Projeto%20%26%20site%3F',
  );
  expect(whatsappLink('+55 (11) 96456-1982', 'Oi')).toBe('https://wa.me/5511964561982?text=Oi');
  ```

- [ ] Testes de conteúdo:
  - 5 projetos com ids únicos, `url` começando com `https://` e `image` existente em `public/` (verificar com `fs.existsSync`);
  - 4 serviços e 4 etapas;
  - experiência em ordem do mais recente: Caju, PicPay, Somei;
  - 5 dúvidas;
  - todo `NAV_LINKS[].href` aponta para um valor de `SECTION_IDS`;
  - nenhum texto contém os padrões de número de marketing `/\d+\s*\+\s*(clientes|horas|projetos)/i`.
- [ ] Rodar. Esperado: FAIL.
- [ ] Escrever o conteúdo:
  - serviços, etapas, stack e experiência com o texto do site atual (spec);
  - as dúvidas e a frase de cada projeto, a partir do `meta description` do site do projeto;
  - mensagem do WhatsApp: "Olá, Carlos! Vi seu portfólio e quero conversar sobre um projeto."
- [ ] Gerar as capturas: Chrome headless em 1280×800, abrindo cada site e esperando a carga. Converter para WebP com qualidade 80, largura 1280. Se não houver conversor WebP na máquina, usar JPEG com qualidade 80 e extensão `.jpg` (registrar como ruling). Conferir cada imagem antes de commitar.
- [ ] Rodar `test`, `lint`, `check-types`. Esperado: tudo passa.
- [ ] Commit: `feat(portfolio): conteúdo e capturas dos projetos`

### Task 7: componentes do app

**Files:** Create `src/components/{Section,PhotoFrame}.{tsx,test.tsx}`.

**Interfaces:**

- Produces:
  - `Section({ id: string; title: string; subtitle?: string; children: ReactNode })`: um `<section id aria-labelledby>` com `h2` e subtítulo centrados;
  - `PhotoFrame({ src: string; alt: string; size: number })`.
- Constante `PHOTO_SRC = ''` em `src/content/contact.ts`. Quando a foto chegar, vira `'/carlos.webp'`.

- [ ] Testes do `Section`: o `id` está na seção, o `h2` tem o título e a seção é nomeada pelo `h2`.
- [ ] Testes do `PhotoFrame` (Review Focus 2):
  - com `src`: `<img>` com o `alt` dado;
  - com `src` vazio: nenhum `<img>`, aparece o monograma "CV" com `aria-hidden="true"`;
  - em ambos os casos, o brilho azul (`radial-gradient` com `--color-accent-500`) e o formato redondo (`borderRadius: '50%'`).
- [ ] Rodar. Esperado: FAIL.
- [ ] Implementar.
- [ ] Rodar `test`, `lint`, `check-types`. Esperado: tudo passa.
- [ ] Commit: `feat(portfolio): seção e moldura da foto`

### Task 8: topo, empresas e projetos

**Files:** Create `src/sections/{Header,Hero,Companies,Projects}.{tsx,test.tsx}`. Modify `src/App.tsx`, `src/App.test.tsx`.

**Interfaces:**

- Consumes: `TopNav`, `LinkButton`, `MediaCard`, `BrandIcon` (Tarefas 1–4); conteúdo e `whatsappLink` (Tarefa 6); `PhotoFrame`, `Section` e `useIsWideScreen`.

- [ ] Testes:
  - **Header:**
    - marca "Carlos Vuotto";
    - no desktop, os 4 links do `NAV_LINKS`;
    - no estreito, `collapsed` (sem os links);
    - a ação "Vamos conversar" é um link para `whatsappLink(...)`, externo.
  - **Hero:**
    - `h1` com "Olá! Sou o Carlos Vuotto," e "construindo experiências digitais.";
    - "Vamos conversar" leva ao WhatsApp e "Ver projetos" leva a `#projetos`;
    - o `PhotoFrame` recebe `PHOTO_SRC`;
    - no desktop, a grade tem duas colunas (`gridTemplateColumns: '1.2fr 1fr'`); no estreito, uma (`'1fr'`).
  - **Companies:** o texto "Onde já trabalhei" e "PicPay", "Caju" e "Somei".
  - **Projects:**
    - `Section` com `id="projetos"`;
    - um `MediaCard` por projeto, com `href` igual à `url` e `alt` "Página inicial do site {nome}";
    - grade com `repeat(2, 1fr)` no desktop e `'1fr'` no estreito.
- [ ] Rodar. Esperado: FAIL.
- [ ] Implementar e montar no `App`:
  - título do topo no mesmo `clamp` do login do finance-app;
  - fundo do topo com `radial-gradient` de `--color-accent-600` atrás da foto, longe do texto.
- [ ] Rodar `test`, `lint`, `check-types`. Esperado: tudo passa.
- [ ] Commit: `feat(portfolio): topo, empresas e projetos`

### Task 9: serviços, processo, sobre, dúvidas, chamada final e rodapé

**Files:** Create `src/sections/{Services,Process,About,Faq,ContactCta,Footer}.{tsx,test.tsx}` e `src/externalLinks.test.tsx`. Modify `src/App.tsx`.

- [ ] Testes:
  - **Services:** `id="servicos"`; 4 cartões, cada um com `IconBubble` e o ícone do serviço; grade `repeat(2, 1fr)` no desktop e `1fr` no estreito.
  - **Process:**
    - 4 etapas com número em gradiente (`backgroundClip: 'text'`) e título;
    - faixa "Tem um projeto?" com "Vamos conversar" (WhatsApp);
    - grade `repeat(4, 1fr)` no desktop e `1fr` no estreito.
  - **About:**
    - `id="sobre"`;
    - `PhotoFrame`, selo "Disponível para novos projetos", bio e um `Badge` por item de `STACK`;
    - uma linha por experiência, com empresa, período e descrição;
    - links "LinkedIn" e "GitHub" com `BrandIcon` e externos.
  - **Faq:** `id="duvidas"`; `Accordion` com as 5 perguntas; clicar numa pergunta mostra a resposta.
  - **ContactCta:** título "Tem um produto para tirar do papel?" e "Vamos conversar" (WhatsApp).
  - **Footer:**
    - nome grande "Carlos Vuotto";
    - links das seções;
    - LinkedIn, GitHub e WhatsApp com `BrandIcon` e `aria-label`;
    - "© {ano atual} Carlos Vuotto".
  - **`externalLinks.test.tsx`** (Review Focus 3 e 5), com o `App` inteiro:
    - todo `<a>` cujo `href` começa com `http` tem `target="_blank"` e `rel="noopener noreferrer"`;
    - todo `href` que começa com `#` aponta para um `id` existente na página;
    - existe exatamente um `h1`;
    - Enter e Espaço numa pergunta do acordeão a abrem (com `userEvent.keyboard`).
- [ ] Rodar. Esperado: FAIL.
- [ ] Implementar e montar no `App` na ordem do spec.
- [ ] Rodar `test`, `lint`, `check-types` e `build`, mais a cobertura dos arquivos do app. Esperado: tudo passa; cobertura ≥ 95%; build com menos de 200 arquivos.
- [ ] Commit: `feat(portfolio): serviços, processo, sobre, dúvidas e rodapé`

### Task 10: favicon, compartilhamento, CI, deploy e documentação

**Files:**

- Create `apps/web/portfolio/public/{favicon.svg,favicon-32.png,apple-touch-icon.png,og-image.png}`.
- Create `.github/workflows/deploy-portfolio.yml`.
- Modify `.github/workflows/web-apps.yml`, `.github/workflows/coverage.yml`, `apps/web/portfolio/index.html`, `CLAUDE.md`.

- [ ] **Favicon "CV":** mesmo gradiente do favicon do finance-app (`accent-500` → `accent-700`) com as letras "CV" em `#f2f5fa`, desenhadas em `<path>` para não depender de fonte. PNGs gerados pelo Chrome headless, como no #241.
- [ ] **`og-image.png`:** 1200×630, captura do topo do próprio site (build local, Chrome headless). Meta `og:title`, `og:description`, `og:image`, `og:type=website`, `og:locale=pt_BR` e `twitter:card=summary_large_image`.
- [ ] **`web-apps.yml`:** job `portfolio` com lint, tipos, testes e build com a trava de 200 arquivos, igual ao do finance-app.
- [ ] **`coverage.yml`:** entrada `portfolio`, com `path: apps/web/portfolio`, o build do `@industry/tokens` e do `@industry/web`, e `exclude_pattern: 'src/main\.tsx$|vite\.config\.ts$|src/test-utils\.ts$|jest\.setup\.ts$'`. O workflow passa a observar `apps/web/portfolio/**`.
- [ ] **`deploy-portfolio.yml`:** cópia do `deploy-finance-app.yml`, sem variáveis do Firebase.
  - Gatilhos: `push` no `main` com `paths` em `apps/web/portfolio/**`, `packages/design-system/industry/web/**` e `packages/design-system/industry/tokens/**`, mais `workflow_dispatch`.
  - `concurrency: deploy-portfolio`.
  - `VERCEL_PROJECT_ID` vem de `secrets.VERCEL_PROJECT_ID_PORTFOLIO`.
- [ ] **Secret:** `gh secret set VERCEL_PROJECT_ID_PORTFOLIO --body "prj_N2B4ElypUPHP0XrvgHpShCAg73n4"`, sempre com o valor literal, nunca `--body -`. Conferir com `gh secret list`.
- [ ] **`CLAUDE.md`:** linha do app na árvore do monorepo e linha do `deploy-portfolio.yml` na tabela de workflows.
- [ ] **Verificar:**
  - `test`, `lint`, `check-types` e `build` do app;
  - capturas do build de produção (`vite preview`) em 1280px e 390px, comparadas com a referência; nenhum elemento passa da borda em 390px (Review Focus 1);
  - links conferidos à mão: WhatsApp com mensagem pronta, LinkedIn, GitHub e os 5 sites.
- [ ] Commit: `feat(portfolio): favicon, compartilhamento, CI e deploy`
- [ ] Abrir o PR 2. Depois do merge, conferir que o `deploy-portfolio.yml` rodou e que carlos-vuotto.vercel.app serve o site novo. Atualizar a página de arquitetura no Notion (nova seção 3.4 e a tabela de CI).
