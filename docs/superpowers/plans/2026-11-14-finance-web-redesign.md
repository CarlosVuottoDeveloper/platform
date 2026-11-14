# Telas web do finance-app reimaginadas — plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** levar as telas logadas do finance-app ao wireframe (PDF, páginas 8–14), com o que falta criado primeiro no `@industry/web`.

**Architecture:** quatro mudanças no `@industry/web` (`IconBubble`, `Card.action`, `Sheet` acessível, `TextField size="lg"`), depois as peças compartilhadas do app (navegação, `MonthSwitcher`, `MovementIcon`/`MovementRow`, formulário) e por fim cada tela compondo essas peças. Regras e dados não mudam.

**Tech Stack:** React 19, `@industry/web`, `@industry/tokens`, React Router 7, react-hook-form, Jest 30 + Testing Library, Storybook 8, Changesets.

**Spec:** `docs/superpowers/specs/2026-11-14-finance-web-redesign-design.md`

## Global Constraints

- Desktop a partir de 768px (`useIsWideScreen`); abaixo disso, mesmos componentes com as grades em uma coluna. `TabBar` e "Mais" continuam.
- Cor, espaçamento e raio só de tokens; nenhum hex nas telas. Título de `Card` em `--color-accent-300`.
- Sem funcionalidade nova, exceto o cartão "Despesas por categoria" no Painel (`expensesByCategory`). Nenhum dado do PDF entra no app.
- Os `aria-label` existentes ("Editar X", "Excluir X", "Mês anterior", "Próximo mês", "Alterar teto de X" etc.) não mudam.
- Zero comentários, sem `any`, `--max-warnings 0`, cobertura ≥ 95% nos arquivos alterados. Testes rodam da raiz, um processo por vez (`--runInBand`), nada em paralelo ou em segundo plano.
- Commits em português, **sem** `Co-Authored-By`. Um code review (skill `code-review`) ao fim de cada tarefa.
- PRs empilhados: PR 1 = Tarefas 1–4 (branch `feat/finance-web-redesign`, que já tem o spec), PR 2 = 5–7, PR 3 = 8–9, PR 4 = 10–12. Antes de enviar um PR filho, mudar o alvo para `main` assim que o pai for mergeado (squash).

## Review Focus

1. **Foco que volta para um elemento que sumiu.** Exemplo: "Excluir" numa linha que deixa de existir depois de confirmar. O `Sheet` não pode quebrar e não pode prender o foco. Teste na Tarefa 3.
2. **Shift+Tab no primeiro elemento e Tab no último dentro do `Sheet`** circulam sem sair da folha. Teste na Tarefa 3.
3. **Nomes longos de descrição, conta ou categoria em 390px:** a `MovementRow` corta com reticências, sem rolagem horizontal. Teste de estilo (`minWidth: 0` + `textOverflow: 'ellipsis'`) na Tarefa 6; captura nas Tarefas 9 e 12.
4. **Mês do Painel sem despesas, ou só com despesas futuras:** a rosca mostra "Sem despesas neste mês" e não conta o que é posterior a hoje. Teste na Tarefa 8.
5. **Valores grandes nos 4 cartões do Painel a 1280px** (até `R$ 999.999.999,99`): o valor quebra linha dentro do cartão, sem estourar. Teste de estilo (`minWidth: 0`, `overflowWrap: 'anywhere'` no `StatTile`) na Tarefa 1; captura na Tarefa 9.

---

### Task 1: `IconBubble` e `StatTile` usando ele

**Files:**

- Create: `packages/design-system/industry/web/src/components/core/IconBubble.tsx`, `IconBubble.test.tsx`, `IconBubble.stories.tsx`
- Modify: `StatTile.tsx`, `StatTile.test.tsx`, `index.ts` (mesmo diretório)
- Create: `.changeset/industry-web-icon-bubble.md` (minor em `@industry/web`)

**Interfaces:**

- Produces: `IconBubble({ children: ReactNode; size?: 'sm' | 'md'; style?: CSSProperties; testID?: string })`; tipo `IconBubbleProps`, `IconBubbleSize`.

- [ ] Testes do `IconBubble`:
  - `sm` → `width/height: 32px`, `md` (padrão) → `40px`;
  - `borderRadius: var(--radius-pill)`, `background: var(--color-accent-800)`, `color: var(--color-accent-300)`;
  - `style` do consumidor sobrepõe;
  - o círculo é `aria-hidden="true"`.
- [ ] Rodar: `yarn workspace @industry/web test --testPathPatterns=IconBubble`. Esperado: FAIL (módulo não existe).
- [ ] Implementar e exportar no `index.ts`. O `StatTile` troca o círculo próprio por `<IconBubble testID={`${testID}-icon`}>`, sem mudar o visual. O `testID-icon` continua existindo e o valor ganha `minWidth: 0` + `overflowWrap: 'anywhere'` no bloco de texto (Review Focus 5).
- [ ] Atualizar `StatTile.test.tsx`: o teste do círculo passa a conferir o tamanho de 40px do `IconBubble`, e entra um teste novo do `overflowWrap`.
- [ ] Story `Default` (sm e md lado a lado). Changeset: "`IconBubble`; `StatTile` quebra valores longos."
- [ ] Rodar: `yarn workspace @industry/web test`, `lint`, `check-types`. Esperado: tudo passa.
- [ ] Commit: `feat(industry-web): IconBubble`

### Task 2: `Card` com ação no título

**Files:** Modify `Card.tsx`, `Card.test.tsx`, `Card.stories.tsx`; Create `.changeset/industry-web-card-action.md` (minor).

**Interfaces:**

- Produces: `CardProps.action?: ReactNode`.

- [ ] Testes:
  - o título renderiza com `color: var(--color-accent-300)`;
  - com `action`, o título e a ação ficam na mesma linha (`display: flex`, `justifyContent: 'space-between'`) e a ação é renderizada;
  - com `action` e sem `title`, a ação ainda aparece;
  - sem `action`, nada muda na estrutura.
- [ ] Rodar o teste. Esperado: FAIL.
- [ ] Implementar. Story `WithAction` com um link "Ver todas".
- [ ] Rodar `test`, `lint`, `check-types` do `@industry/web`. Esperado: tudo passa.
- [ ] Commit: `feat(industry-web): Card com ação no título`

### Task 3: `Sheet` com fechar, Esc e foco

**Files:** Modify `Sheet.tsx`, `Sheet.test.tsx`, `Sheet.stories.tsx`; Create `.changeset/industry-web-sheet-a11y.md` (minor).

**Interfaces:**

- Consumes: `Icon` (`x`), `Button` (`ghost`, `iconOnly`, `size="sm"`).
- Produces: mesma API de `SheetProps`; comportamento novo descrito abaixo.

- [ ] Testes (os 8 existentes continuam):
  - com `onDismiss`, há `button` "Fechar" que chama `onDismiss`; sem `onDismiss`, não há;
  - `Escape` com a folha aberta chama `onDismiss` uma vez;
  - `getByRole('dialog', { name: 'Título' })` encontra o diálogo pelo título (`aria-labelledby`);
  - ao abrir, o foco vai para o primeiro focável do conteúdo, e não para o "Fechar". Sem focável no conteúdo, o foco vai para o "Fechar";
  - Tab no último focável leva ao primeiro (que é o "Fechar"), e Shift+Tab no primeiro leva ao último (Review Focus 2);
  - ao desmontar, o foco volta ao elemento que tinha foco antes de abrir. Se esse elemento saiu do DOM, nada quebra e o foco não fica preso (Review Focus 1).
- [ ] Rodar: `yarn workspace @industry/web test --testPathPatterns=Sheet`. Esperado: FAIL nos novos.
- [ ] Implementar com `useId` para o título, `useRef` no `GradientSurface` e `useEffect` para o foco inicial, o retorno do foco e o `keydown` (Esc e o ciclo do Tab). Os focáveis são `button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])`, sem os `disabled`. A ordem fica: alça, linha do título com o "Fechar" à direita, depois o conteúdo.
- [ ] Story `Default` atualizada (título + formulário curto).
- [ ] Rodar `test`, `lint`, `check-types` do `@industry/web`. Esperado: tudo passa.
- [ ] Commit: `feat(industry-web): Sheet com fechar, Esc e foco`

### Task 4: `TextField` grande

**Files:** Modify `TextField.tsx`, `TextField.test.tsx`, `TextField.stories.tsx`; Create `.changeset/industry-web-textfield-size.md` (minor).

**Interfaces:**

- Produces: `TextFieldProps.size?: 'md' | 'lg'`, tipo `TextFieldSize`. Como `size` já existe em `InputHTMLAttributes` (número), ele é omitido do `extends`.

- [ ] Testes:
  - padrão: `minHeight: var(--control-h)` e `fontSize: var(--text-body)`, como hoje;
  - `lg`: o `input` tem `fontSize: var(--text-h3)` e `minHeight: calc(var(--control-h) * 1.5)`;
  - `multiline` ignora `size`.
- [ ] Rodar o teste. Esperado: FAIL.
- [ ] Implementar e exportar `TextFieldSize` no `index.ts`. Story `Large`.
- [ ] Rodar `test`, `lint`, `check-types` e `build` do `@industry/web`, e depois `yarn workspace @app/finance check-types`. Esperado: tudo passa; nenhum uso de `size` numérico no app.
- [ ] Commit: `feat(industry-web): TextField grande`
- [ ] Abrir o PR 1 (Tarefas 1–4 + spec). Esperar o Chromatic e a aprovação do Carlos.

### Task 5: navegação, cabeçalho e `MonthSwitcher`

**Files:**

- Modify: `apps/web/finance-app/src/components/AppLayout/{AppLayout.tsx,navigation.ts}`
- Modify: `apps/web/finance-app/src/components/MonthSwitcher/{MonthSwitcher.tsx,MonthSwitcher.test.tsx}`
- Modify: `apps/web/finance-app/src/domain/{calendarDate.ts,calendarDate.test.ts}`
- Modify: testes que procuram o texto antigo do mês (`screens/Dashboard/Dashboard.test.tsx` e os que o `grep "de 20"` encontrar)

**Interfaces:**

- Produces: `formatMonthTitleBR(month: YearMonth): string`. `formatMonthBR` é removida, porque não sobra uso.

- [ ] Testes:
  - `formatMonthTitleBR('2026-03')` → `'Março 2026'` e `formatMonthTitleBR('2026-11')` → `'Novembro 2026'`;
  - o `MonthSwitcher` mostra "Novembro 2026" e o contêiner tem `background: var(--color-surface)` e `borderRadius: var(--radius-pill)`;
  - os ícones da navegação, verificados em `navigation.ts` por `SIDEBAR_ENTRIES.map(e => e.icon)`:

    ```ts
    [
      'layout-dashboard',
      'arrow-left-right',
      'wallet',
      'chart-pie',
      'target',
      'trending-up',
      'sliders-horizontal',
    ];
    ```

  - no desktop, "Sair" é um botão com o ícone `log-out` que chama `logout`, e "Nova movimentação" mostra o ícone `plus`. Para conferir os ícones, testar a presença do `svg` dentro do botão.

- [ ] Rodar `yarn workspace @app/finance test --testPathPatterns="calendarDate|MonthSwitcher|AppLayout"`. Esperado: FAIL.
- [ ] Implementar. O texto do "Sair" fica em `--color-accent-300`.
- [ ] Rodar a suíte inteira do app (`yarn workspace @app/finance test --runInBand`) e corrigir os testes que procuravam "novembro de 2026", trocando o texto esperado sem tirar asserções. Esperado: tudo passa.
- [ ] Commit: `feat(finance-app): navegação e seletor de mês do wireframe`

### Task 6: `MovementIcon` e `MovementRow`

**Files:**

- Create: `apps/web/finance-app/src/components/MovementRow/{movementIcon.ts,movementIcon.test.ts,MovementRow.tsx,MovementRow.test.tsx}`
- Modify: `apps/web/finance-app/src/screens/Transactions/Transactions.tsx`; delete `TransactionRow.tsx`

**Interfaces:**

- Produces:
  - `movementIconName(transaction: Transaction, state: { pending: boolean }): IconName`;
  - `MovementRow({ transaction, accounts, categories, pending, forecast, showDate, actions }: { …; showDate: boolean; actions: { onEdit: () => void; onDelete: () => void } | null })`.
  - `actions: null` = sem botões (Painel). No app, `MovementRow` é um `li` com `data-testid={`transaction-${id}`}`.

- [ ] Testes de `movementIconName`, um caso por linha da tabela do spec, com a precedência entre eles:

  ```ts
  expect(movementIconName(expense, { pending: true })).toBe('calendar-check');
  expect(movementIconName(transfer, { pending: false })).toBe('arrow-left-right');
  expect(movementIconName(installmentExpense, { pending: false })).toBe('credit-card');
  expect(movementIconName(income, { pending: false })).toBe('trending-up');
  expect(movementIconName(expense, { pending: false })).toBe('trending-down');
  ```

- [ ] Testes de `MovementRow` (as regras de hoje do `TransactionRow` passam para cá):
  - título é a descrição ou, sem ela, o nome da categoria ("Transferência" para transferência);
  - detalhe "categoria · conta", ou "origem → destino" na transferência;
  - com `showDate`, o detalhe começa com "dd/mm/aaaa · ";
  - selo "3 de 10" na parcela e "Prevista" quando `pending`;
  - receita com `color: var(--color-success-300)`;
  - transferência sem "Editar";
  - `forecast` sem botões;
  - `pending` real com "Editar" e "Excluir";
  - `actions: null` sem botões;
  - título com `textOverflow: 'ellipsis'` e coluna de texto com `minWidth: 0` (Review Focus 3).
- [ ] Rodar. Esperado: FAIL.
- [ ] Implementar, com o ícone dentro de `IconBubble size="sm"`. `Transactions.tsx` passa a usar `MovementRow` com `showDate={false}`. Apagar `TransactionRow.tsx`.
- [ ] Rodar a suíte do app. Esperado: tudo passa, incluindo `Transactions.test.tsx` sem mudanças de asserção.
- [ ] Commit: `feat(finance-app): linha de movimentação com ícone por tipo`

### Task 7: formulário de movimentação

**Files:**

- Modify: `apps/web/finance-app/src/components/{FormSheet/FormSheet.tsx,MoneyField/MoneyField.tsx,MoneyField/MoneyField.test.tsx,TransactionSheet/TransactionSheet.tsx,TransactionSheet/TransactionSheet.test.tsx}`

**Interfaces:**

- Consumes: `Sheet` (Tarefa 3), `TextField size` (Tarefa 4).
- Produces: `MoneyFieldProps.size?: 'md' | 'lg'`, repassado ao `TextField`.

- [ ] Testes:
  - `MoneyField size="lg"` repassa o tamanho (fonte `var(--text-h3)` no input);
  - no `TransactionSheet` com `mockWideScreen(true)`, "Data" e "Parcelar em" ficam no mesmo contêiner com `gridTemplateColumns: '1fr 1fr'`, e "Conta" e "Categoria" também;
  - com `mockWideScreen(false)`, um campo por linha;
  - a descrição tem o placeholder "Ex.: Mercado da semana";
  - "Fechar" chama `onClose`;
  - `Escape` fecha.
- [ ] Rodar. Esperado: FAIL.
- [ ] Implementar. O `FormSheet` não muda a API: o `onDismiss` agora também alimenta o X e o Esc do `Sheet`.
- [ ] Rodar a suíte do app, `lint` e `check-types`. Esperado: tudo passa.
- [ ] Commit: `feat(finance-app): formulário de movimentação do wireframe`
- [ ] Captura do formulário aberto, em 1280px e 390px, com o bundle de produção e os dados de exemplo do emulador (`e2e-lib.mjs` no scratchpad). Conferir com a página 14.
- [ ] Abrir o PR 2.

### Task 8: Painel

**Files:** Modify `apps/web/finance-app/src/screens/Dashboard/{Dashboard.tsx,Dashboard.test.tsx}`.

**Interfaces:**

- Consumes: `MovementRow` com `showDate` e `actions: null`, `Card.action`, `IconBubble`, `PieChart`, `expensesByCategory(transactions, categories, from, to)`.

- [ ] Testes:
  - `summary-balance` está dentro de uma superfície `variant="primary"` (`data-testid="summary-balance-card"`);
  - o grupo de cartões tem `gridTemplateColumns: 'repeat(4, 1fr)'` no desktop e `'1fr'` no estreito;
  - `region` "Últimas movimentações" tem o link "Ver todas" para `/transacoes`, e as linhas mostram a data;
  - "Orçamentos em alerta" tem o link "Ver orçamentos" para `/orcamentos` e só aparece quando há alerta;
  - `region` "Despesas por categoria" mostra a rosca com "Total" e o valor do mês, contando só até hoje;
  - num mês sem despesas, ou só com despesas futuras, mostra "Sem despesas neste mês" (Review Focus 4);
  - no desktop, as duas colunas usam `gridTemplateColumns: '2fr 1fr'`.
- [ ] Rodar. Esperado: FAIL.
- [ ] Implementar. O `SummaryTile` ganha `highlighted: boolean` (verdadeiro só para "Saldo geral"). O ícone de Receitas usa `--color-success-300` e o de Despesas, `--color-danger-300`.
- [ ] Rodar a suíte do app. Esperado: tudo passa.
- [ ] Commit: `feat(finance-app): Painel do wireframe`

### Task 9: Transações

**Files:** Modify `apps/web/finance-app/src/screens/Transactions/{Transactions.tsx,Transactions.test.tsx}`.

- [ ] Testes:
  - no desktop, o mês e a busca ficam na mesma linha (`justifyContent: 'space-between'`);
  - os grupos de data ficam dentro de um único `Card` (`data-testid="transactions-card"`);
  - o estado vazio continua fora do cartão.
- [ ] Rodar. Esperado: FAIL.
- [ ] Implementar.
- [ ] Rodar a suíte do app, `lint` e `check-types`. Esperado: tudo passa.
- [ ] Commit: `feat(finance-app): Transações do wireframe`
- [ ] Capturas do Painel e de Transações em 1280px e 390px (Review Focus 3 e 5): sem rolagem horizontal em 390px; conferir com as páginas 8 e 9.
- [ ] Abrir o PR 3.

### Task 10: Contas

**Files:** Modify `apps/web/finance-app/src/screens/Accounts/{Accounts.tsx,Accounts.test.tsx}`.

- [ ] Testes:
  - "Saldo consolidado" está numa superfície `variant="primary"`;
  - cada grupo é um `Card` com o título do grupo, e os grupos vazios não aparecem;
  - no desktop, Ativos fica numa coluna e Passivos e Arquivadas empilhados na outra (`gridTemplateColumns: '1fr 1fr'`); no estreito, uma coluna;
  - o ícone da conta fica dentro de um `IconBubble` com a cor escolhida (`colorVariable(account.color)`).
- [ ] Rodar. Esperado: FAIL.
- [ ] Implementar. Os botões "Transferir" e "Nova conta" ficam na linha do título.
- [ ] Rodar a suíte do app. Esperado: tudo passa.
- [ ] Commit: `feat(finance-app): Contas do wireframe`

### Task 11: Orçamentos e Metas

**Files:** Modify `apps/web/finance-app/src/screens/Budgets/{Budgets.tsx,Budgets.test.tsx}`, `screens/Goals/{Goals.tsx,Goals.test.tsx,GoalCard.tsx}`.

- [ ] Testes:
  - cada `budget-${id}` é um `Card`;
  - a grade de orçamentos usa `repeat(2, 1fr)` no desktop e `1fr` no estreito;
  - a grade de metas usa `repeat(3, 1fr)` no desktop e `1fr` no estreito.
- [ ] Rodar. Esperado: FAIL.
- [ ] Implementar. O `BudgetRow` vira cartão: nome, selo e botão na linha do título, depois a barra e o texto. O conteúdo do `GoalCard` não muda.
- [ ] Rodar a suíte do app. Esperado: tudo passa.
- [ ] Commit: `feat(finance-app): Orçamentos e Metas do wireframe`

### Task 12: Relatórios

**Files:** Modify `apps/web/finance-app/src/screens/Reports/{Reports.tsx,ChartsTab.tsx,Reports.test.tsx}`.

**Interfaces:**

- Produces: `ChartsTab({ month }: { month: YearMonth })`. O estado do mês vive em `Reports`.

- [ ] Testes:
  - o `MonthSwitcher` aparece na linha das abas só na aba Gráficos;
  - trocar de mês e ir e voltar entre as abas mantém o mês;
  - no desktop, a rosca tem legenda à direita e "Total" no centro.
- [ ] Rodar. Esperado: FAIL.
- [ ] Implementar.
- [ ] Rodar a suíte do app, `lint`, `check-types`, a cobertura dos arquivos alterados e `yarn workspace @app/finance build`. O build deve ter no máximo 200 arquivos. Esperado: tudo passa.
- [ ] Commit: `feat(finance-app): Relatórios do wireframe`
- [ ] Capturas de Contas, Orçamentos, Metas e Relatórios em 1280px e 390px; conferir com as páginas 10–13.
- [ ] Abrir o PR 4.
