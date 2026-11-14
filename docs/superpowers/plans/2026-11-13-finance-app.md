# Finance App (quadro AFP) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir o app web de finanças pessoais `@app/finance` cobrindo os sete épicos do quadro Jira AFP, com Firestore, login Google, `@industry/web` e deploy no Vercel.

**Architecture:** SPA estática (Vite + React Router) em `apps/web/finance-app`, nas mesmas camadas dos apps mobile: `domain/` puro, `services/` como único ponto de contato com o Firebase, `screens/`/`components/` compondo o `@industry/web`. Todos os dados ficam em `users/{uid}/...`; saldos, totais e patrimônio são sempre calculados no cliente a partir das movimentações, nunca gravados.

**Tech Stack:** Vite, React 19.2.5, React Router, TypeScript estrito, Firebase v11 modular (Auth Google, Firestore com cache persistente, App Check), react-hook-form, `@industry/web` + `@industry/tokens`, Jest 30 + jsdom + Testing Library, `@firebase/rules-unit-testing`, GitHub Actions + Vercel (`--prebuilt`).

**Spec:** `docs/superpowers/specs/2026-11-13-finance-app-design.md` — leia antes de qualquer tarefa. Leia também o `CLAUDE.md` da raiz e a página de arquitetura no Notion que ele aponta.

## Global Constraints

- Yarn v1 sempre. `yarn add` quebra neste repo: edite o `package.json` à mão e rode `yarn install` na raiz.
- `react` e `react-dom` fixos em `19.2.5` (mesma versão do `@industry/web`; versões diferentes entre os dois já causaram bug aqui). Para Vite, React Router, firebase e libs de exportação, confirme a versão estável atual com `npm view <pkg> version` e leia a documentação atual antes de usar a API.
- Comandos de teste sempre da raiz: `yarn workspace @app/finance test --testPathPatterns=<nome>` (plural).
- Zero comentários no código, salvo restrição invisível que quebraria em silêncio. Sem `any`. Sem código morto. Lint com `--max-warnings 0`.
- `src/domain/` não importa React, Firebase nem outras camadas. Só `src/services/` importa `firebase/*`.
- Mock só na fronteira de serviço (`src/services/*`) ou externa; providers e componentes do app rodam de verdade nos testes.
- Valores monetários: inteiro de centavos (`Cents`). Datas de movimentação: `AAAA-MM-DD` (`CalendarDate`). Mês: `AAAA-MM` (`YearMonth`). Exibição `pt-BR`.
- Nunca logar movimentação, conta, meta ou campo derivado; só ids e códigos de erro. Nenhum SDK de analytics/telemetria.
- UI só com componentes e tokens do Industry; primitivo que faltar nasce no `@industry/web`.
- Textos da interface em português.
- Cobertura ≥ 95% nos arquivos alterados (gate do `coverage.yml`).
- Commits em português, Conventional Commits, **sem** `Co-Authored-By`.
- Uma branch e um PR por tarefa (`feat/finance-<slug>`), nunca direto na `main`. Revisão de código ao fim de cada tarefa. Um subagente por vez.
- `firebase deploy` em produção, criação de projeto Firebase/Vercel e gravação de secrets só com confirmação explícita do Carlos, sempre com `--project` explícito.

**Ciclo de cada tarefa:** escrever os testes listados → rodar e ver falhar → implementar as interfaces → rodar e ver passar → `yarn workspace @app/finance lint && yarn workspace @app/finance check-types` → commit → PR.

## Review Focus

1. **Valor digitado em formato inesperado** (`1.234,56`, `1234.56`, `R$ 10`, vazio, negativo, três casas): aceita o que é inequívoco, recusa o resto com mensagem no campo; nunca grava `NaN` nem valor errado. Teste na Tarefa 5.
2. **Dias 29–31 e virada de dia**: parcela ou recorrente no dia 31 cai no último dia dos meses curtos; "hoje" é o dia local do usuário, não UTC. Testes nas Tarefas 5, 10 e 11.
3. **Duas abas abertas na virada do mês**: a recorrente vira uma única movimentação, e uma ocorrência excluída não renasce. Teste na Tarefa 11.
4. **Movimentação antiga apontando para conta ou categoria arquivada**: lista, painel e relatório mostram o nome normalmente, sem quebrar e sem "indefinido". Testes nas Tarefas 9 e 18.
5. **Exportação com texto hostil** (descrição com `;`, aspas, quebra de linha ou começando com `=`): o arquivo abre com as colunas certas e nenhuma fórmula é executada. Teste na Tarefa 18.

---

## Estrutura de arquivos

```
apps/web/finance-app/
  package.json  index.html  vite.config.ts  tsconfig.json  eslint.config.mjs
  jest.config.js  jest.setup.ts
  firebase.json  .firebaserc  firestore.rules  firestore.indexes.json  firestore.rules.test.ts
  .env.example
  src/
    main.tsx  App.tsx  routes.tsx
    domain/     money  calendarDate  account  transaction  balance  category
                installment  recurrence  monthSummary  budget  goal
                charts  netWorth  report  csv            (cada um com .test.ts)
    services/   firebaseConfig  firebase  authService  accountsService
                transactionsService  categoriesService  recurrencesService
                budgetsService  goalsService  exportService  userDataService
    context/    AuthContext/  UserDataContext/
    components/ AppLayout/  MoneyField/  TransactionSheet/  TransferSheet/
                AccountSheet/  TagsField/  PrivacyNotice/  ...
    screens/    Login/  Dashboard/  Transactions/  Accounts/  Budgets/
                Goals/  Reports/  Settings/
    test-utils.tsx
packages/design-system/industry/web/src/components/core/
  PieChart.tsx  BarChart.tsx   (+ .test.tsx, .stories.tsx, export no index.ts)
.github/workflows/web-apps.yml  .github/workflows/deploy-finance-app.yml
```

---

# Épico AFP-1 — Setup

### Task 1: Workspace `@app/finance` e CI (AFP-7)

**Files:**

- Create: `apps/web/finance-app/{package.json,index.html,vite.config.ts,tsconfig.json,eslint.config.mjs,jest.config.js,jest.setup.ts}`, `src/{main.tsx,App.tsx,App.test.tsx,test-utils.tsx}`
- Create: `.github/workflows/web-apps.yml`
- Modify: `package.json` (raiz, workspaces), `.changeset/config.json`, `.github/workflows/coverage.yml`, `CLAUDE.md`

**Interfaces:**

- Produces: scripts `dev`, `build` (`tsc --noEmit && vite build`, saída em `dist/`), `lint`, `check-types`, `test`; `renderWithProviders(ui, options?)` em `src/test-utils.tsx`.

- [ ] Adicionar `"apps/web/*"` aos workspaces da raiz e `"@app/finance"` ao `ignore` do Changesets.
- [ ] `package.json` do app: `name: "@app/finance"`, `private: true`, deps `react`/`react-dom` `19.2.5`, `@industry/web: "*"`, `@industry/tokens: "*"`; `yarn install` na raiz.
- [ ] `eslint.config.mjs`: `@repo/eslint-config/react-internal` + `domainServicesBoundaries('src')`, igual ao do appointmate (sem as entradas de Expo), ignorando `dist/**`.
- [ ] `jest.config.js`: copiar o do `@industry/web` (ts-jest, jsdom, transform do `lucide-react`, `moduleNameMapper` de `react`/`react-dom` **com o mesmo comentário**), acrescentar `'\\.css$'` mapeado para um stub e `testPathIgnorePatterns: ['/node_modules/', 'firestore\\.rules\\.test']`.
- [ ] `main.tsx` importa `@industry/tokens/styles.css` e carrega Inter 400/500/600 do mesmo jeito que o preview do Storybook do `@industry/web` faz.
- [ ] Teste `App.test.tsx`: `render(<App />)` e `expect(screen.getByRole('main')).toBeInTheDocument()`.
- [ ] `web-apps.yml`: PR → `main` em `apps/web/**`, `industry/{web,tokens}`, `eslint-config`, `typescript-config`; passos = install, build de `@industry/tokens` e `@industry/web`, lint, check-types, test `--runInBand` do `@app/finance`.
- [ ] `coverage.yml`: novo path `apps/web/finance-app/**` e entrada `finance-app` na matriz (build = tokens + web).
- [ ] `CLAUDE.md`: árvore do monorepo, tabela de workflows e a frase "`@industry/web` has no consuming application".
- [ ] Verificar: `yarn workspace @app/finance build` gera `dist/index.html`; `yarn workspace @app/finance test` PASS; `yarn lint && yarn check-types` limpos.
- [ ] Commit: `chore(finance-app): cria workspace web com Vite, Jest e CI`

### Task 2: Firebase — configuração, regras-base e emulador (AFP-8)

**Depende do Carlos:** criar (ou autorizar a criação de) o projeto Firebase, ativar o provedor Google no Auth, criar o banco Firestore e fornecer a configuração web.

**Files:**

- Create: `firebase.json`, `.firebaserc` (`default: "finance-app-emulator"`), `firestore.rules`, `firestore.indexes.json`, `firestore.rules.test.ts`, `.env.example`, `src/services/firebaseConfig.ts`, `src/services/firebase.ts`
- Modify: `package.json` do app (`firebase ^11`, `@firebase/rules-unit-testing ^4`, script `test:rules`)

**Interfaces:**

- Produces: `auth: Auth`, `db: Firestore` em `services/firebase.ts`; helper de teste `ownerDb(uid)`, `strangerDb()`, `anonymousDb()` no arquivo de teste de regras.

- [ ] `firebaseConfig.ts` é o **único** arquivo que lê `import.meta.env` (`VITE_FIREBASE_API_KEY`, `_AUTH_DOMAIN`, `_PROJECT_ID`, `_APP_ID`, `_MESSAGING_SENDER_ID`). Testes nunca o carregam porque mockam os serviços.
- [ ] `firebase.ts`: `initializeApp`, `getAuth`, `initializeFirestore(app, { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) })`.
- [ ] `test:rules`: `firebase emulators:exec --only firestore "jest --testPathIgnorePatterns=/node_modules/ --testPathPatterns=firestore.rules.test"` (forma do tickets-app; a do appointmate está quebrada).
- [ ] Regras-base:

```
match /users/{uid}/{document=**} {
  allow read, delete: if request.auth != null && request.auth.uid == uid;
}
```

`create`/`update` são liberados coleção a coleção nas tarefas seguintes.

- [ ] Testes de regras: dono lê `users/alice/accounts/a1`; `bob` e anônimo são negados em leitura e exclusão; escrita em coleção não declarada (`users/alice/qualquer/x`) é negada até para o dono.
- [ ] Verificar: `yarn workspace @app/finance test:rules` PASS.
- [ ] Commit: `feat(finance-app): configuração do Firebase e regras-base do Firestore`

### Task 3: Login Google, aviso de privacidade e casca do app (AFP-9)

**Files:**

- Create: `src/services/authService.ts`, `src/context/AuthContext/`, `src/screens/Login/`, `src/components/PrivacyNotice/`, `src/components/AppLayout/`, `src/routes.tsx`, telas vazias (`EmptyState`) para cada rota
- Modify: `src/App.tsx`

**Interfaces:**

- Produces:
  - `interface AuthUser { uid: string; displayName: string | null; email: string | null; photoURL: string | null }`
  - `subscribeToAuthChanges(onChange: (user: AuthUser | null) => void): () => void`
  - `loginWithGoogle(): Promise<AuthUser | null>` (`null` quando o usuário fecha o popup)
  - `logout(): Promise<void>`
  - `useAuth(): { user: AuthUser | null; loading: boolean; logout: () => Promise<void> }`
  - rotas: `/login`, `/`, `/transacoes`, `/contas`, `/orcamentos`, `/metas`, `/relatorios`, `/configuracoes`

- [ ] Testes (`Login.test.tsx`, `App.test.tsx`, mockando só `services/authService`):
  - sem usuário, qualquer rota redireciona para `/login`;
  - `/login` mostra o botão "Continuar com Google" e o aviso de privacidade com o e-mail `kaduvuotto@gmail.com`;
  - clicar chama `loginWithGoogle`; erro mostra `Toast` "Não foi possível entrar. Tente novamente."; popup fechado não mostra erro;
  - com usuário, `/` renderiza a navegação com os sete itens e "Sair" chama `logout`.
- [ ] `AppLayout`: `AppShell` + `Sidebar` a partir de 768px, `TabBar` abaixo disso.
- [ ] Texto do aviso (o Carlos revisa no PR): "Este app guarda as contas, movimentações, orçamentos e metas que você cadastrar, associados à sua conta Google. Os dados ficam no Firebase (Google) e não são compartilhados com mais ninguém. Você pode exportar ou excluir tudo em Configurações. Contato: kaduvuotto@gmail.com."
- [ ] Verificar no navegador contra o emulador de Auth: entrar, navegar, sair.
- [ ] Commit: `feat(finance-app): login com Google, aviso de privacidade e navegação`

### Task 4: Deploy no Vercel (AFP-7)

**Depende do Carlos:** criar o projeto no Vercel, gravar o secret `VERCEL_PROJECT_ID_FINANCE_APP` (use `printf '%s' "$ID" | gh secret set NOME`; `--body -` grava o literal `-`), gravar as variáveis `VITE_FIREBASE_*` no GitHub e adicionar o domínio de produção aos domínios autorizados do Firebase Auth.

**Files:**

- Create: `.github/workflows/deploy-finance-app.yml`

- [ ] Workflow no molde do `storybook-vercel.yml`: push → `main` em `apps/web/finance-app/**`, `industry/{web,tokens}/**` + `workflow_dispatch`; build de tokens, web e do app com as `VITE_FIREBASE_*` no `env`; `vercel pull`; copiar `dist/` para `.vercel/output/static/`; `config.json`:

```json
{ "version": 3, "routes": [{ "handle": "filesystem" }, { "src": "/(.*)", "dest": "/index.html" }] }
```

`vercel deploy --prebuilt --prod`; URL no resumo do job.

- [ ] Verificar após o merge: a URL de produção abre `/login`; recarregar em `/contas` não dá 404; login Google funciona na URL de produção.
- [ ] Atualizar a tabela de workflows do `CLAUDE.md`.
- [ ] Commit: `ci(finance-app): deploy no Vercel via GitHub Actions`

---

# Épico AFP-22 — Contas e Carteiras

### Task 5: Domínio de dinheiro e datas

**Files:**

- Create: `src/domain/money.ts`, `src/domain/calendarDate.ts` (+ testes), `src/components/MoneyField/`

**Interfaces:**

- Produces:
  - `type Cents = number`
  - `parseBRLToCents(input: string): Cents | null`
  - `formatCents(cents: Cents): string`
  - `type CalendarDate = string; type YearMonth = string`
  - `toCalendarDate(now: Date): CalendarDate` (dia local)
  - `yearMonthOf(date: CalendarDate): YearMonth`
  - `addMonths(month: YearMonth, count: number): YearMonth`
  - `dateInMonth(month: YearMonth, day: number): CalendarDate` (limita ao último dia)
  - `lastDayOfMonth(month: YearMonth): CalendarDate`
  - `monthsBetween(first: YearMonth, last: YearMonth): YearMonth[]` (inclusivo)
  - `formatDateBR(date: CalendarDate): string`
  - `<MoneyField label value onChange error />` com `value: Cents | null`

- [ ] Testes:

```ts
expect(parseBRLToCents('1.234,56')).toBe(123456);
expect(parseBRLToCents('1234.56')).toBe(123456);
expect(parseBRLToCents('R$ 10')).toBe(1000);
expect(parseBRLToCents('0,1')).toBe(10);
expect(parseBRLToCents('19,99')).toBe(1999);
expect(parseBRLToCents('1.234')).toBe(123400);
expect(parseBRLToCents('')).toBeNull();
expect(parseBRLToCents('abc')).toBeNull();
expect(parseBRLToCents('-5')).toBeNull();
expect(parseBRLToCents('1,005')).toBeNull();
expect(formatCents(123456).replace(/\s/g, ' ')).toBe('R$ 1.234,56');
expect(formatCents(-500).replace(/\s/g, ' ')).toBe('-R$ 5,00');

expect(toCalendarDate(new Date(2026, 10, 30, 23, 30))).toBe('2026-11-30');
expect(dateInMonth('2026-02', 31)).toBe('2026-02-28');
expect(dateInMonth('2028-02', 31)).toBe('2028-02-29');
expect(addMonths('2026-11', 3)).toBe('2027-02');
expect(monthsBetween('2026-11', '2027-01')).toEqual(['2026-11', '2026-12', '2027-01']);
expect(formatDateBR('2026-03-05')).toBe('05/03/2026');
```

- [ ] `parseBRLToCents` trabalha sobre a string (sem `parseFloat` sobre o valor final): ponto seguido de exatamente três dígitos é milhar; vírgula, ou ponto seguido de um ou dois dígitos, é decimal.
- [ ] `MoneyField`: `TextField` do DS com `inputMode="decimal"`; em blur inválido mostra "Valor inválido".
- [ ] Commit: `feat(finance-app): domínio de dinheiro em centavos e datas de calendário`

### Task 6: Cadastro, edição e arquivamento de contas (AFP-23, AFP-27)

**Files:**

- Create: `src/domain/account.ts`, `src/services/accountsService.ts`, `src/context/UserDataContext/`, `src/components/AccountSheet/`, `src/screens/Accounts/`
- Modify: `firestore.rules`, `firestore.rules.test.ts`

**Interfaces:**

- Produces:
  - `type AccountType = 'bank' | 'digital_wallet' | 'cash' | 'investment' | 'credit_card' | 'loan'`
  - `ACCOUNT_TYPE_LABELS: Record<AccountType, string>` ("Banco", "Carteira digital", "Dinheiro", "Investimentos", "Cartão de crédito", "Dívida/Empréstimo")
  - `isLiability(type: AccountType): boolean`
  - `interface Account { id: string; name: string; type: AccountType; color: string; icon: string; initialBalanceCents: Cents; openingDate: CalendarDate; archived: boolean }`
  - `type AccountInput = Omit<Account, 'id' | 'archived'>`
  - `subscribeToAccounts(uid, onChange: (accounts: Account[]) => void, onError: (code: string) => void): () => void`
  - `createAccount(uid, input: AccountInput): Promise<string>`, `updateAccount(uid, id, input: AccountInput): Promise<void>`, `setAccountArchived(uid, id, archived: boolean): Promise<void>`, `deleteAccount(uid, id): Promise<void>`
  - `useUserData(): { accounts: Account[]; loading: boolean }` — o provider ganha uma coleção por tarefa.

- [ ] Regras de `accounts` (create/update): dono; `hasAll` + `hasOnly` de `name, type, color, icon, initialBalanceCents, openingDate, archived, createdAt`; `name` string 1–60; `type` no enum; `initialBalanceCents` int entre ±99_999_999_999; `openingDate` casa `^\d{4}-\d{2}-\d{2}$`; `archived` bool; `createdAt == request.time` no create e imutável no update.
- [ ] Testes de regras: conta válida aceita; campo extra, `type: 'x'`, `initialBalanceCents: 1.5`, `name` com 61 caracteres e `createdAt` alterado são negados; `bob` não cria em `users/alice`.
- [ ] Testes de tela (`Accounts.test.tsx`, serviço mockado): lista agrupa "Ativos" e "Passivos"; criar chama `createAccount` com centavos; "Arquivar" chama `setAccountArchived(uid, id, true)` e a conta vai para a seção "Arquivadas" com "Desarquivar"; nome vazio mostra "Informe o nome".
- [ ] Paleta de cores vinda de `viz` dos tokens; ícones do `Icon` do DS.
- [ ] Commit: `feat(finance-app): cadastro e arquivamento de contas`

### Task 7: Movimentações, saldos e transferência (AFP-24, AFP-25, AFP-26)

**Files:**

- Create: `src/domain/transaction.ts`, `src/domain/balance.ts`, `src/services/transactionsService.ts`, `src/components/TransferSheet/`
- Modify: `UserDataContext`, `screens/Accounts`, `firestore.rules`, `firestore.rules.test.ts`

**Interfaces:**

- Produces:
  - `type TransactionKind = 'income' | 'expense' | 'transfer'`
  - `interface Transaction { id: string; kind: TransactionKind; amountCents: Cents; date: CalendarDate; accountId: string; toAccountId: string | null; categoryId: string | null; description: string; tags: string[]; recurrenceId: string | null; installment: { groupId: string; index: number; count: number } | null }`
  - `type TransactionInput = Omit<Transaction, 'id'>`
  - `accountBalanceOn(account: Account, transactions: Transaction[], date: CalendarDate): Cents`
  - `consolidatedBalanceOn(accounts: Account[], transactions: Transaction[], date: CalendarDate): Cents` (ignora arquivadas)
  - `pendingTotalAfter(account: Account, transactions: Transaction[], date: CalendarDate): Cents`
  - `accountHasTransactions(accountId: string, transactions: Transaction[]): boolean`
  - `subscribeToTransactions(uid, onChange, onError)`, `createTransaction(uid, input): Promise<string>`, `createTransactions(uid, inputs: TransactionInput[]): Promise<void>` (batch), `updateTransaction(uid, id, input)`, `deleteTransactions(uid, ids: string[]): Promise<void>`
  - `useUserData()` passa a expor `transactions`.

- [ ] Testes de `balance`:

```ts
const account = {
  id: 'a',
  initialBalanceCents: 100000,
  openingDate: '2026-01-01',
  archived: false,
  type: 'bank',
};
const other = {
  id: 'b',
  initialBalanceCents: 0,
  openingDate: '2026-01-01',
  archived: false,
  type: 'bank',
};
const list = [
  tx({ kind: 'income', amountCents: 50000, date: '2026-01-10', accountId: 'a' }),
  tx({ kind: 'expense', amountCents: 20000, date: '2026-01-15', accountId: 'a' }),
  tx({
    kind: 'transfer',
    amountCents: 30000,
    date: '2026-01-20',
    accountId: 'a',
    toAccountId: 'b',
  }),
  tx({ kind: 'expense', amountCents: 10000, date: '2026-02-05', accountId: 'a' }),
];
expect(accountBalanceOn(account, list, '2025-12-31')).toBe(0);
expect(accountBalanceOn(account, list, '2026-01-31')).toBe(100000);
expect(accountBalanceOn(account, list, '2026-02-05')).toBe(90000);
expect(accountBalanceOn(other, list, '2026-01-31')).toBe(30000);
expect(consolidatedBalanceOn([account, other], list, '2026-01-31')).toBe(130000);
expect(consolidatedBalanceOn([account, { ...other, archived: true }], list, '2026-01-31')).toBe(
  100000,
);
expect(pendingTotalAfter(account, list, '2026-01-31')).toBe(-10000);
```

- [ ] Regras de `transactions`: `hasAll`/`hasOnly` de todos os campos de `TransactionInput` + `createdAt`, `updatedAt`; `amountCents` int entre 1 e 99_999_999_999; `kind` no enum; `transfer` exige `toAccountId` string ≠ `accountId` e `categoryId == null`; `income`/`expense` exigem `categoryId` string e `toAccountId == null`; `description` ≤ 140; `tags` lista ≤ 10. Testes de regras para cada negação.
- [ ] `TransferSheet`: origem, destino (só contas ativas, destino ≠ origem), valor, data ≥ data de abertura das duas contas (erro "Data anterior à abertura da conta").
- [ ] Tela de Contas: saldo de hoje por conta, "Saldo consolidado" no topo com `StatTile`, "A vencer" em contas de passivo quando `pendingTotalAfter` ≠ 0; "Excluir" só aparece quando `accountHasTransactions` é falso.
- [ ] Teste de tela: uma transferência de R$ 300,00 muda os dois saldos e não muda o consolidado.
- [ ] Commit: `feat(finance-app): movimentações, saldos calculados e transferência entre contas`

---

# Épico AFP-2 — Entradas e Saídas

### Task 8: Categorias e tags (AFP-12)

**Files:**

- Create: `src/domain/category.ts`, `src/services/categoriesService.ts`, `src/components/TagsField/`, seção "Categorias" em `screens/Settings`
- Modify: `UserDataContext`, regras e teste de regras

**Interfaces:**

- Produces:
  - `type CategoryKind = 'income' | 'expense'`
  - `interface Category { id: string; name: string; kind: CategoryKind; color: string; icon: string; archived: boolean }`
  - `DEFAULT_CATEGORIES: Omit<Category, 'id'>[]` — despesa: Alimentação, Moradia, Transporte, Saúde, Lazer, Educação, Outros; receita: Salário, Freelance, Rendimentos, Outros
  - `knownTags(transactions: Transaction[]): string[]` (únicas, ordem alfabética)
  - `normalizeTag(input: string): string | null` (trim, minúsculas, ≤ 30; vazio → `null`)
  - `subscribeToCategories`, `createCategory`, `updateCategory`, `setCategoryArchived`, `seedDefaultCategories(uid): Promise<void>`
  - `<TagsField value: string[] onChange suggestions: string[] />`

- [ ] `seedDefaultCategories` usa ids determinísticos (`default-expense-alimentacao`…) e roda em transação que grava `users/{uid}` com `{ seededAt }` — só semeia se esse documento não existir, para que uma categoria padrão arquivada ou renomeada não volte. Regras para o documento `users/{uid}`: `hasOnly(['seededAt'])`.
- [ ] Testes: `DEFAULT_CATEGORIES` tem 7 de despesa e 4 de receita; `normalizeTag('  Mercado ')` → `'mercado'`; tela de categorias cria, renomeia e arquiva; primeiro login chama `seedDefaultCategories` uma vez.
- [ ] Commit: `feat(finance-app): categorias padrão editáveis e tags`

### Task 9: Registro e listagem de receitas e despesas (AFP-10)

**Files:**

- Create: `src/components/TransactionSheet/`, `src/screens/Transactions/`, `src/domain/transactionList.ts`
- Modify: `AppLayout` (botão "Nova movimentação" em todas as telas)

**Interfaces:**

- Consumes: `createTransaction`, `updateTransaction`, `deleteTransactions`, `useUserData`, `MoneyField`, `TagsField`.
- Produces:
  - `groupByDate(transactions: Transaction[]): { date: CalendarDate; items: Transaction[] }[]` (mais recente primeiro)
  - `isPending(transaction: Transaction, today: CalendarDate): boolean`
  - `accountName(accounts: Account[], id: string): string` e `categoryName(categories: Category[], id: string | null): string` — devolvem o nome mesmo se arquivada; id desconhecido → "Conta removida" / "Sem categoria"
  - `<TransactionSheet open onClose transaction? />`

- [ ] Testes:
  - o formulário exige valor, data, conta e categoria ("Informe o valor", "Escolha a conta", "Escolha a categoria");
  - data anterior à `openingDate` da conta escolhida mostra "Data anterior à abertura da conta" e não salva;
  - alternar Receita/Despesa troca as categorias oferecidas; seletores só mostram contas e categorias ativas;
  - salvar despesa de `19,99` chama `createTransaction` com `amountCents: 1999`, `kind: 'expense'`, `toAccountId: null`;
  - falha no serviço mostra `Toast` "Não foi possível salvar." e mantém o formulário preenchido;
  - lista mostra movimentação de conta e categoria arquivadas com o nome correto (Review Focus 4);
  - movimentação com data futura aparece com `Badge` "Prevista";
  - excluir pede confirmação e chama `deleteTransactions`.
- [ ] Lista com `SearchField` (descrição) e seletor de mês; estado vazio com `EmptyState`.
- [ ] Commit: `feat(finance-app): registro, edição e listagem de receitas e despesas`

### Task 10: Compras parceladas (AFP-11)

**Files:**

- Create: `src/domain/installment.ts` (+ teste)
- Modify: `TransactionSheet`, `screens/Transactions`

**Interfaces:**

- Produces:
  - `splitInstallments(totalCents: Cents, count: number): Cents[]`
  - `buildInstallments(draft: TransactionInput, count: number, groupId: string): TransactionInput[]`
  - `installmentsFrom(transactions: Transaction[], groupId: string, fromIndex: number): Transaction[]`

- [ ] Testes:

```ts
expect(splitInstallments(10000, 3)).toEqual([3334, 3333, 3333]);
expect(splitInstallments(9999, 1)).toEqual([9999]);
const built = buildInstallments({ ...draft, amountCents: 10000, date: '2026-01-31' }, 3, 'g1');
expect(built.map((t) => t.date)).toEqual(['2026-01-31', '2026-02-28', '2026-03-31']);
expect(built.map((t) => t.installment)).toEqual([
  { groupId: 'g1', index: 1, count: 3 },
  { groupId: 'g1', index: 2, count: 3 },
  { groupId: 'g1', index: 3, count: 3 },
]);
```

- [ ] Formulário de despesa ganha "Parcelar em" (2–48); salvar chama `createTransactions` com o resultado de `buildInstallments`. A lista mostra "2 de 3".
- [ ] Editar ou excluir uma parcela abre a escolha "Só esta" / "Esta e as seguintes"; teste verifica que "Esta e as seguintes" na parcela 2 de 3 chama `deleteTransactions` com dois ids.
- [ ] Regras: `installment` é `null` ou mapa com `groupId` string, `index` e `count` inteiros, `1 ≤ index ≤ count ≤ 48`.
- [ ] Commit: `feat(finance-app): compras parceladas`

### Task 11: Recorrentes mensais (AFP-11)

**Files:**

- Create: `src/domain/recurrence.ts` (+ teste), `src/services/recurrencesService.ts` (+ teste), seção "Recorrentes" em `screens/Settings`
- Modify: `UserDataContext`, regras e teste de regras

**Interfaces:**

- Produces:
  - `interface Recurrence { id: string; kind: 'income' | 'expense'; amountCents: Cents; dayOfMonth: number; accountId: string; categoryId: string; description: string; tags: string[]; startMonth: YearMonth; endMonth: YearMonth | null; materializedThrough: YearMonth | null }`
  - `occurrenceId(recurrenceId: string, month: YearMonth): string` → `` `${recurrenceId}_${month}` ``
  - `dueOccurrences(recurrence: Recurrence, today: CalendarDate): { id: string; month: YearMonth; input: TransactionInput }[]`
  - `projectedOccurrences(recurrences: Recurrence[], after: CalendarDate, through: CalendarDate): Transaction[]` (ids de `occurrenceId`, não persistidas)
  - `subscribeToRecurrences`, `createRecurrence`, `updateRecurrence`, `deleteRecurrence`, `materializeDueRecurrences(uid: string, recurrences: Recurrence[], today: CalendarDate): Promise<void>`
  - `useUserData()` expõe `recurrences` e chama `materializeDueRecurrences` quando as recorrentes carregam.

- [ ] Testes de domínio:

```ts
const rent = recurrence({
  id: 'r1',
  dayOfMonth: 31,
  startMonth: '2026-01',
  endMonth: null,
  materializedThrough: null,
});
expect(dueOccurrences(rent, '2026-03-15').map((o) => o.input.date)).toEqual([
  '2026-01-31',
  '2026-02-28',
]);
expect(dueOccurrences({ ...rent, materializedThrough: '2026-02' }, '2026-03-15')).toEqual([]);
expect(
  dueOccurrences({ ...rent, materializedThrough: '2026-02' }, '2026-03-31').map((o) => o.id),
).toEqual(['r1_2026-03']);
expect(dueOccurrences({ ...rent, endMonth: '2026-01' }, '2026-03-31').map((o) => o.month)).toEqual([
  '2026-01',
]);
expect(
  projectedOccurrences(
    [{ ...rent, materializedThrough: '2026-02' }],
    '2026-03-15',
    '2026-03-31',
  ).map((t) => t.date),
).toEqual(['2026-03-31']);
```

- [ ] `materializeDueRecurrences`: para cada recorrente com ocorrências devidas, `runTransaction` que **relê** o documento da recorrente, recalcula `dueOccurrences` com o `materializedThrough` lido, faz `set` de cada ocorrência no id determinístico e grava o novo `materializedThrough`. É isso que impede duplicata entre abas e o renascimento de ocorrência excluída (Review Focus 3).
- [ ] Teste de serviço contra o emulador (no arquivo de regras, como dono): chamar `materializeDueRecurrences` duas vezes em paralelo cria exatamente uma movimentação por mês; excluir a movimentação e chamar de novo não a recria.
- [ ] Regras de `recurrences`: lista fechada de campos; `dayOfMonth` int 1–31; meses casam `^\d{4}-\d{2}$`; `kind` em `income|expense`.
- [ ] Tela: criar/editar/excluir regra; editar avisa "Vale para os próximos lançamentos".
- [ ] Commit: `feat(finance-app): movimentações recorrentes com projeção`

---

# Épico AFP-3 — Visão Geral

### Task 12: Painel do mês (AFP-13)

**Files:**

- Create: `src/domain/monthSummary.ts` (+ teste), `src/screens/Dashboard/`

**Interfaces:**

- Produces: `summarizeMonth(input: { accounts: Account[]; transactions: Transaction[]; recurrences: Recurrence[]; month: YearMonth; today: CalendarDate }): { balanceCents: Cents; incomeCents: Cents; expenseCents: Cents; expectedEndBalanceCents: Cents }`

- [ ] Teste (hoje `2026-03-15`, mês `2026-03`; conta com saldo inicial 0 aberta em `2026-01-01`; receita de 115000 em 05/03; despesa de 15000 em 12/03; transferência de 10000 em 10/03 para uma segunda conta ativa; despesa lançada de 20000 em 20/03; recorrente de despesa de 50000 no dia 25, `materializedThrough: '2026-02'`):

```ts
expect(summary).toEqual({
  balanceCents: 100000,
  incomeCents: 115000,
  expenseCents: 15000,
  expectedEndBalanceCents: 30000,
});
```

Com asserções separadas: transferência não entra em `incomeCents` nem `expenseCents`; em mês passado `expectedEndBalanceCents` é o saldo do último dia do mês; em mês futuro `incomeCents` e `expenseCents` são 0.

- [ ] Tela: quatro `StatTile` (Saldo geral, Receitas, Despesas, Balanço esperado), seletor de mês, cinco últimas movimentações, e — depois da Tarefa 13 — os orçamentos em aviso.
- [ ] Commit: `feat(finance-app): painel do mês`

---

# Épico AFP-4 — Planejamento

### Task 13: Orçamentos por categoria (AFP-14)

**Files:**

- Create: `src/domain/budget.ts` (+ teste), `src/services/budgetsService.ts`, `src/screens/Budgets/`
- Modify: `UserDataContext`, `screens/Dashboard`, regras e teste de regras

**Interfaces:**

- Produces:
  - `interface Budget { id: string; categoryId: string; limitCents: Cents }` (id do documento = `categoryId`, um por categoria)
  - `type BudgetStatus = 'ok' | 'warning' | 'exceeded'`
  - `budgetProgress(budget: Budget, monthExpenses: Transaction[]): { spentCents: Cents; ratio: number; status: BudgetStatus }`
  - `expensesOfMonth(transactions: Transaction[], projected: Transaction[], month: YearMonth): Transaction[]`
  - `subscribeToBudgets`, `setBudget(uid, categoryId, limitCents)`, `deleteBudget(uid, categoryId)`

- [ ] Testes: teto 100000 → gasto 79999 `ok`; 80000 `warning`; 99999 `warning`; 100000 `exceeded`; despesa prevista (data futura no mês) e projeção de recorrente contam; despesa de outra categoria e transferência não contam.
- [ ] Tela: `Progress` por categoria, `Badge` "Perto do limite" / "Limite estourado"; orçamento de categoria arquivada não aparece.
- [ ] Regras: `limitCents` int entre 1 e 99_999_999_999, lista fechada.
- [ ] Commit: `feat(finance-app): orçamentos por categoria com avisos`

### Task 14: Metas financeiras (AFP-15)

**Files:**

- Create: `src/domain/goal.ts` (+ teste), `src/services/goalsService.ts`, `src/screens/Goals/`
- Modify: `UserDataContext`, regras e teste de regras

**Interfaces:**

- Produces:
  - `interface Goal { id: string; name: string; targetCents: Cents; deadline: CalendarDate | null }`
  - `interface Contribution { id: string; amountCents: Cents; date: CalendarDate }`
  - `goalProgress(goal: Goal, contributions: Contribution[]): { savedCents: Cents; remainingCents: Cents; ratio: number }` (`ratio` limitado a 1, `remainingCents` nunca negativo)
  - `subscribeToGoals`, `subscribeToContributions(uid, goalId, ...)`, `createGoal`, `updateGoal`, `deleteGoal` (apaga os aportes junto), `addContribution`, `deleteContribution`

- [ ] Testes: alvo 1000000 com aportes 250000 + 250000 → `{ savedCents: 500000, remainingCents: 500000, ratio: 0.5 }`; aportes acima do alvo → `ratio: 1`, `remainingCents: 0`; registrar aporte **não** chama nenhum serviço de movimentações.
- [ ] Tela: `RingProgress` por meta, lista de aportes, prazo quando houver.
- [ ] Regras para `goals` e `goals/{id}/contributions`, listas fechadas.
- [ ] Commit: `feat(finance-app): metas financeiras com aportes`

---

# Épico AFP-5 — Análise e Relatórios

### Task 15: `PieChart` e `BarChart` no `@industry/web`

**Files:**

- Create: `packages/design-system/industry/web/src/components/core/{PieChart,BarChart}.{tsx,test.tsx,stories.tsx}`, `.changeset/<nome>.md` (minor em `@industry/web`)
- Modify: `packages/design-system/industry/web/src/components/core/index.ts`

**Interfaces:**

- Produces:
  - `PieChartProps { slices: { label: string; value: number; color: string }[]; size?: number; valueFormatter?: (value: number) => string; legendPlacement?: 'bottom' | 'right'; legendValue?: 'valueAndPercent' | 'percent'; centerLabel?: ReactNode; style?: CSSProperties; testID?: string }` — mesma API do `PieChart` do `@industry/mobile`
  - `BarChartProps { series: { label: string; color: string }[]; groups: { label: string; values: number[] }[]; height?: number; valueFormatter?: (value: number) => string; style?: CSSProperties; testID?: string }`

- [ ] Seguir o `AreaChart.tsx` web como referência de estilo (SVG próprio, tokens, `testID`) e portar a geometria do `PieChart` mobile.
- [ ] Testes: uma fatia por `slice` e legenda com percentuais que somam 100; `slices` vazio ou total 0 não quebra; `BarChart` desenha `groups.length × series.length` barras, a maior com a altura total da área; valores negativos e não finitos são tratados como 0; gráficos têm `role="img"` com `aria-label` e legenda textual.
- [ ] Verificar: `yarn workspace @industry/web test`, `lint`, `check-types`, e as stories no Storybook (`:6010`).
- [ ] Commit: `feat(industry-web): PieChart e BarChart`

### Task 16: Gráficos de fluxo de caixa e gastos (AFP-16)

**Files:**

- Create: `src/domain/charts.ts` (+ teste), aba "Gráficos" em `src/screens/Reports/`

**Interfaces:**

- Produces:
  - `expensesByCategory(transactions: Transaction[], categories: Category[], from: CalendarDate, to: CalendarDate): { categoryId: string; label: string; color: string; totalCents: Cents }[]` (maior primeiro)
  - `monthlyCashFlow(transactions: Transaction[], months: YearMonth[], today: CalendarDate): { month: YearMonth; incomeCents: Cents; expenseCents: Cents }[]`
  - `dailyConsolidatedBalance(accounts: Account[], transactions: Transaction[], month: YearMonth, today: CalendarDate): { date: CalendarDate; balanceCents: Cents }[]` (para no dia de hoje no mês corrente)

- [ ] Testes: transferência fora das três funções; categoria arquivada aparece com seu nome; mês sem movimento devolve zeros; `dailyConsolidatedBalance('2026-02')` tem 28 pontos.
- [ ] Tela: `PieChart` (despesas por categoria no período), `BarChart` (receitas × despesas, últimos 6 meses), `AreaChart` (saldo dia a dia), cada um com `EmptyState` quando não há dados. Formatação com `formatCents`.
- [ ] Commit: `feat(finance-app): gráficos de fluxo de caixa e distribuição de gastos`

### Task 17: Evolução patrimonial (AFP-17)

**Files:**

- Create: `src/domain/netWorth.ts` (+ teste), aba "Patrimônio" em `screens/Reports`

**Interfaces:**

- Produces: `netWorthByMonth(accounts: Account[], transactions: Transaction[], today: CalendarDate): { month: YearMonth; assetsCents: Cents; liabilitiesCents: Cents; netCents: Cents }[]`

- [ ] Testes: no máximo 12 meses terminando no mês corrente; começa no mês da `openingDate` mais antiga quando há menos de 12; mês corrente usa o saldo de hoje; conta arquivada entra; cartão com saldo −50000 dá `liabilitiesCents: 50000` e reduz `netCents`; sem contas devolve `[]`.
- [ ] Tela: `AreaChart` de `netCents`, três `StatTile` (Ativos, Passivos, Patrimônio líquido) do mês corrente.
- [ ] Commit: `feat(finance-app): evolução do patrimônio líquido`

### Task 18: Relatórios com filtros e exportação (AFP-18)

**Files:**

- Create: `src/domain/report.ts`, `src/domain/csv.ts` (+ testes), `src/services/exportService.ts`, aba "Relatório" em `screens/Reports`

**Interfaces:**

- Produces:
  - `interface ReportFilter { from: CalendarDate; to: CalendarDate; accountIds: string[]; categoryIds: string[]; kinds: TransactionKind[]; tags: string[] }` (lista vazia = sem filtro)
  - `filterTransactions(transactions: Transaction[], filter: ReportFilter): Transaction[]`
  - `reportTotals(transactions: Transaction[]): { incomeCents: Cents; expenseCents: Cents; netCents: Cents }`
  - `reportRows(transactions: Transaction[], accounts: Account[], categories: Category[]): string[][]` — cabeçalho `Data, Tipo, Descrição, Categoria, Conta, Conta destino, Valor, Tags`
  - `toCsv(rows: string[][]): string`
  - `downloadCsv(rows, filename)`, `downloadXlsx(rows, filename)`, `downloadPdf(title, rows, totals, filename)` em `exportService`

- [ ] Testes de `csv` (Review Focus 5):

```ts
expect(toCsv([['a', 'b']])).toBe('﻿a;b\r\n');
expect(toCsv([['x;y', 'diz "oi"', 'linha1\nlinha2']])).toBe(
  '﻿"x;y";"diz ""oi""";"linha1\nlinha2"\r\n',
);
expect(toCsv([['=SOMA(A1)', '+1', '-2', '@x']])).toBe("﻿'=SOMA(A1);'+1;'-2;'@x\r\n");
```

- [ ] Testes de `report`: filtro por conta inclui transferência em que a conta é origem **ou** destino; conta arquivada continua filtrável e sai com o nome em `reportRows` (Review Focus 4); `reportTotals` ignora transferência; valor sai como `1234,56` (sem `R$`).
- [ ] `exportService` é fronteira externa: escolher bibliotecas mantidas para `.xlsx` e PDF (não usar o pacote `xlsx` do npm), carregadas com `import()` dinâmico para não pesar o bundle inicial. A mesma proteção contra fórmula vale para o `.xlsx` (células sempre como texto ou número, nunca fórmula).
- [ ] Tela: filtros com `DatePicker`/`Select`, `DataTable`, totais, botões "CSV", "Excel", "PDF". Teste: clicar "CSV" chama `downloadCsv` com as linhas filtradas.
- [ ] Verificar no navegador: abrir os três arquivos gerados no Excel/Numbers e num leitor de PDF.
- [ ] Commit: `feat(finance-app): relatórios filtrados com exportação CSV, Excel e PDF`

---

# Épico AFP-6 — Segurança e Privacidade

### Task 19: Auditoria das regras do Firestore (recorte da AFP-19)

**Files:**

- Modify: `firestore.rules`, `firestore.rules.test.ts`, `firestore.indexes.json`

- [ ] Completar a matriz de testes: para **cada** coleção (`accounts`, `categories`, `transactions`, `recurrences`, `budgets`, `goals`, `contributions`, documento `users/{uid}`): dono cria/lê/atualiza/exclui; outro usuário e anônimo negados nas quatro operações; campo extra negado; campo obrigatório ausente negado; tipo errado negado; texto acima do limite negado.
- [ ] Conferir que não existe nenhum `allow` sem checagem de `uid` e nenhuma consulta no app fora de `users/{uid}`: `grep -rn "collection(" apps/web/finance-app/src/services`.
- [ ] Conferir índices: toda consulta com igualdade + `orderBy` em outro campo tem entrada em `firestore.indexes.json`.
- [ ] **Com confirmação do Carlos:** `firebase deploy --only firestore:rules,firestore:indexes --project <id-de-produção>`.
- [ ] Commit: `test(finance-app): matriz completa de regras do Firestore`

### Task 20: Exportar todos os dados e excluir a conta (AFP-21)

**Files:**

- Create: `src/services/userDataService.ts` (+ teste), `src/domain/dataExport.ts` (+ teste), seção "Seus dados" em `screens/Settings`
- Modify: `authService` (`deleteCurrentUser`)

**Interfaces:**

- Produces:
  - `buildDataExport(data: { accounts; categories; transactions; recurrences; budgets; goals: (Goal & { contributions: Contribution[] })[] }, exportedAt: CalendarDate): string` (JSON com `version: 1`)
  - `downloadAllData(uid): Promise<void>` → `financas-AAAA-MM-DD.json`
  - `deleteAllUserData(uid): Promise<void>` (todas as subcoleções em lotes de até 500, depois `users/{uid}`)
  - `deleteCurrentUser(): Promise<void>` em `authService` (reautentica com popup quando o Firebase devolve `auth/requires-recent-login`)

- [ ] Testes: `buildDataExport` contém todas as coleções e nenhum `uid`; excluir exige digitar "EXCLUIR" e então chama `deleteAllUserData` e depois `deleteCurrentUser`, nessa ordem; falha em `deleteAllUserData` não chama `deleteCurrentUser` e mostra `Toast`.
- [ ] Teste contra o emulador: depois de `deleteAllUserData`, nenhuma subcoleção do usuário tem documentos, inclusive `contributions`.
- [ ] Commit: `feat(finance-app): exportar todos os dados e excluir conta`

### Task 21: App Check com reCAPTCHA

**Depende do Carlos:** criar a chave reCAPTCHA v3, registrar o app web no App Check, gravar `VITE_RECAPTCHA_SITE_KEY` no GitHub e, no fim, ligar a exigência para o Firestore no console.

**Files:**

- Modify: `src/services/firebaseConfig.ts`, `src/services/firebase.ts`, `.env.example`, `deploy-finance-app.yml`

- [ ] `initializeAppCheck(app, { provider: new ReCaptchaV3Provider(siteKey), isTokenAutoRefreshEnabled: true })`, só quando a chave existe (emulador e desenvolvimento local rodam sem).
- [ ] Deploy; conferir no console do App Check que as requisições da URL de produção aparecem como verificadas **antes** de o Carlos ligar a exigência.
- [ ] Depois de ligada: o app em produção continua lendo e gravando; uma chamada REST direta ao Firestore com um ID token válido, sem token de App Check, é recusada.
- [ ] Acrescentar ao aviso de privacidade: "O app usa o reCAPTCHA do Google para se proteger de abuso."
- [ ] Commit: `feat(finance-app): App Check com reCAPTCHA`

### Task 22: Fechamento

- [ ] Atualizar a página de arquitetura no Notion (nova seção do app, workflows, contagem de testes) e o `CLAUDE.md` (LGPD: dado financeiro do `finance-app`; árvore; comandos).
- [ ] Percorrer em produção, com uma conta de teste, todas as funcionalidades dos sete épicos — é o roteiro do vídeo.
- [ ] Com o aval do Carlos, ajustar o quadro Jira: tarefas concluídas, e AFP-19/AFP-20 e as partes cortadas de AFP-7/8/9 marcadas conforme o escopo do spec.
