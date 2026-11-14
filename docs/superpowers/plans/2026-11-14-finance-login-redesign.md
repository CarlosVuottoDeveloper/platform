# Login reimaginado do finance-app — plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** trocar o cartão centralizado do login por uma tela de abertura no estilo da referência, com um componente novo `DotGrid` no `@industry/web`.

**Architecture:** `DotGrid` é um componente puro do design system (sem estado, só tokens). A tela de login do app compõe `DotGrid`, `Card`, `Button` e o `PrivacyNotice` existente; os dados da grade são uma ilustração fixa no próprio diretório da tela.

**Tech Stack:** React 19, `@industry/web`, `@industry/tokens`, Jest + Testing Library, Storybook 8.

**Spec:** `docs/superpowers/specs/2026-11-14-finance-login-redesign-design.md`

## Global Constraints

- Sem pessoa, sem números de marketing, sem menu; única ação é o login Google.
- Cores só de tokens existentes; topo do gradiente em `--color-accent-500`, luz radial `--color-accent-400` longe do texto, fim em `--color-bg`. Nenhum hex na tela.
- O `PrivacyNotice` continua com o mesmo texto e e-mail, no rodapé.
- Zero comentários, sem `any`, lint com `--max-warnings 0`, cobertura ≥ 95% nos arquivos alterados.
- Commits em português, sem `Co-Authored-By`.

## Review Focus

1. Tela estreita (390px): título, cartões e grade cabem sem rolagem horizontal. Verificado por captura na Tarefa 2.
2. Clique duplo, ou clique no botão do cabeçalho com o popup já aberto: os dois botões ficam desabilitados enquanto o login está em andamento. Teste na Tarefa 2.
3. Valores da grade fora de 0–1, `NaN` ou `Infinity`: a grade não quebra e não usa cor fora dos quatro níveis. Teste na Tarefa 1.
4. Leitor de tela: a grade da ilustração não é anunciada como dado real (decorativa). Teste na Tarefa 2.
5. Contraste dos textos menores sobre o gradiente: ficam na parte já escura. Verificado na captura da Tarefa 2.

---

### Task 1: `DotGrid` no `@industry/web`

**Files:**

- Create: `packages/design-system/industry/web/src/components/core/DotGrid.tsx`, `DotGrid.test.tsx`, `DotGrid.stories.tsx`
- Modify: `packages/design-system/industry/web/src/components/core/index.ts`
- Create: `.changeset/dot-grid.md` (minor em `@industry/web`)

**Interfaces:**

- Produces: `DotGrid({ values: number[]; columns: number; legend?: { low: string; high: string }; label?: string; style?: CSSProperties; testID?: string })`; `export function dotLevel(value: number): 0 | 1 | 2 | 3`; tipos `DotGridProps`.

- [ ] Testes:

```ts
expect([0, 0.2, 0.34, 0.5, 0.67, 1].map(dotLevel)).toEqual([0, 1, 2, 2, 3, 3]);
expect([-1, 2, Number.NaN, Number.POSITIVE_INFINITY].map(dotLevel)).toEqual([0, 3, 0, 0]);
```

- renderiza uma bolinha por valor, com `data-level` igual a `dotLevel(valor)`, em `columns` colunas;
- com `legend`, mostra "low", quatro bolinhas de nível 0–3 e "high"; sem `legend`, nada abaixo da grade;
- com `label`, a grade tem `role="img"` e esse nome; sem `label`, `aria-hidden="true"`.
- [ ] Níveis de cor: 0 `--color-surface-2`, 1 `--color-accent-800`, 2 `--color-accent-600`, 3 `--color-accent-400`. Limites: `v <= 0` → 0, `< 0.34` → 1, `< 0.67` → 2, senão 3; não finito → 0.
- [ ] Stories: `Default` (com `legend` e `label`), `Decorative` (sem ambos). Export no `index.ts`. Changeset minor.
- [ ] Verificar: `yarn workspace @industry/web test`, `lint`, `check-types`, `build`.
- [ ] Commit: `feat(industry-web): DotGrid`

### Task 2: Tela de login

**Files:**

- Modify: `apps/web/finance-app/src/screens/Login/Login.tsx`, `Login.test.tsx`
- Create: `apps/web/finance-app/src/screens/Login/loginIllustration.ts`

**Interfaces:**

- Consumes: `DotGrid` (Tarefa 1), `loginWithGoogle` e `PrivacyNotice` existentes.
- Produces: `DAILY_SPENDING_ILLUSTRATION: number[]` (84 valores fixos entre 0 e 1, para 14 colunas × 6 linhas).

- [ ] Testes (além dos quatro existentes, que continuam valendo):
  - o cabeçalho tem o nome "Finanças" e o botão "Entrar com Google", que também chama `loginWithGoogle`;
  - título "Suas finanças em ordem" como `heading` de nível 1; selo "Controle financeiro pessoal";
  - os três cartões "Contas e saldos", "Orçamentos com aviso", "Metas com aportes";
  - enquanto o login está em andamento, os dois botões ficam desabilitados (Review Focus 2);
  - a grade da ilustração não aparece como `img` para tecnologia assistiva (Review Focus 4); o cartão tem o título "Gastos dia a dia" e a legenda "menos"/"mais".
- [ ] Layout conforme o desenho do spec: cabeçalho (marca + botão), selo, título em duas linhas deslocadas com `clamp` de tamanho, linha com o cartão da grade à esquerda e, à direita, os três cartões, a frase sobre relatórios e exportação e o botão principal; rodapé com o `PrivacyNotice`. Abaixo de 768px tudo em uma coluna. Fundo: `linear-gradient` de `--color-accent-500` para `--color-bg` com `radial-gradient` de `--color-accent-400` no canto superior direito. Cartões translúcidos com `color-mix` sobre `--color-surface`.
- [ ] Verificar: `yarn workspace @app/finance test`, `lint`, `check-types`, cobertura dos arquivos alterados; captura do bundle de produção em 1280px e 390px no Chrome headless, conferindo que não há rolagem horizontal em 390px (Review Focus 1 e 5).
- [ ] Commit: `feat(finance-app): login reimaginado com a linguagem da tela de abertura`
