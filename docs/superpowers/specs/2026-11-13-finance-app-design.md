# Finance App (quadro AFP) — design

Data: 2026-11-13. Origem: quadro Jira **AFP — Acompanhamento Finanças Pessoais** (7 épicos, 20 tarefas, todas pendentes).

Legenda: **[Decidido]** é o que o Carlos disse ou aprovou na conversa. **[Escolha do autor]** é uma decisão tomada por quem escreveu este documento e pode ser revertida na revisão.

## 1. Intenção

Um app web de finanças pessoais que o Carlos vai usar no dia a dia com os próprios dados reais e que também serve de peça de portfólio: ele vai gravar um vídeo percorrendo todas as funcionalidades, com uma segunda conta Google e dados fictícios, para publicar no LinkedIn.

Consequências diretas:

- Precisa ser confiável com dinheiro de verdade: valores exatos, saldo que nunca diverge do histórico, dados de um usuário inacessíveis a outro.
- Precisa ficar bem em vídeo: todas as funcionalidades do quadro visíveis e navegáveis, com a identidade visual do Industry.
- Não existe modo demonstração no app. **[Decidido]**

## 2. Objetivos, não-objetivos e anti-objetivos

### Objetivos **[Decidido]**

- App web em `apps/web`, dentro do monorepo `platform`.
- Banco no Firebase (Firestore).
- Login **somente pelo Google**.
- Deploy no Vercel.
- UI construída com `@industry/web` e `@industry/tokens`.
- App **aberto**: qualquer conta Google pode entrar e usar. Cada usuário só enxerga e grava os próprios dados.
- Cobrir os sete épicos do quadro, com os recortes da seção 3.

### Não-objetivos

- App mobile (o quadro fala em web + mobile; agora é só web). **[Escolha do autor, não contestada]**
- Cadastro por e-mail/senha e recuperação de senha (AFP-9). **[Decidido]**
- Criptografia ponta a ponta no cliente (AFP-19). **[Decidido]**
- Firebase Storage (AFP-8). **[Decidido]**
- Biometria e 2FA dentro do app (AFP-20): a verificação em duas etapas fica a cargo da conta Google. **[Escolha do autor, não contestada]**
- Cloud Functions ou qualquer servidor próprio: o projeto Firebase fica no plano gratuito (Spark). **[Decidido]**
- Outras moedas além do real; outros idiomas além do português. **[Decidido]**
- Fatura de cartão de crédito (fechamento, vencimento, limite), importação de extrato bancário/OFX, integração com Open Finance, notificações por e-mail ou push. **[Escolha do autor]**

### Anti-objetivos

O app é um fracasso, mesmo funcionando, se:

- um usuário conseguir ler ou alterar dados de outro;
- um saldo exibido não bater com a soma das movimentações;
- valores sofrerem erro de arredondamento;
- conteúdo financeiro for parar em log, analytics ou qualquer terceiro além do Firebase;
- a UI usar cores, espaçamentos ou componentes fora do Industry quando o design system já oferece o equivalente.

## 3. Escopo por épico

Ordem de implementação **[Escolha do autor, aprovada]**: AFP-1 → AFP-22 → AFP-2 → AFP-3 → AFP-4 → AFP-5 → AFP-6. Contas vêm antes de transações porque a AFP-26 torna a conta obrigatória em toda transação.

| Épico                   | Tarefa | O que entra                                                                               | O que sai                    |
| ----------------------- | ------ | ----------------------------------------------------------------------------------------- | ---------------------------- |
| AFP-1 Setup             | AFP-7  | Workspace web novo no monorepo, CI, deploy                                                | Parte mobile                 |
|                         | AFP-8  | Projeto Firebase novo: Auth (Google) + Firestore, regras, índices, emulador               | Storage                      |
|                         | AFP-9  | Tela de login com "Continuar com Google", sair, rotas protegidas                          | Cadastro, senha, recuperação |
| AFP-22 Contas           | AFP-23 | Criar/editar conta: nome, tipo, cor, ícone, saldo inicial                                 |                              |
|                         | AFP-24 | Saldo por conta e saldo consolidado das contas ativas                                     |                              |
|                         | AFP-25 | Transferência entre contas                                                                |                              |
|                         | AFP-26 | Conta obrigatória em toda transação                                                       |                              |
|                         | AFP-27 | Arquivar e desarquivar conta, mantendo o histórico                                        |                              |
| AFP-2 Entradas e Saídas | AFP-10 | Inserção rápida, edição, exclusão e listagem de receitas e despesas                       |                              |
|                         | AFP-11 | Recorrentes mensais e compras parceladas, com projeção                                    |                              |
|                         | AFP-12 | Categorias (lista padrão editável) e tags livres                                          |                              |
| AFP-3 Visão Geral       | AFP-13 | Painel do mês: saldo geral, receitas, despesas, balanço esperado                          |                              |
| AFP-4 Planejamento      | AFP-14 | Teto mensal por categoria, progresso, aviso em 80% e 100%                                 | Aviso fora do app            |
|                         | AFP-15 | Metas com valor alvo, prazo e aportes manuais                                             |                              |
| AFP-5 Análise           | AFP-16 | Pizza (gastos por categoria), barras (receitas × despesas por mês), linha/área (evolução) |                              |
|                         | AFP-17 | Patrimônio líquido mês a mês                                                              |                              |
|                         | AFP-18 | Filtros por período, conta e categoria; exportação CSV, Excel e PDF                       |                              |
| AFP-6 Segurança         | AFP-19 | Regras do Firestore por dono e com lista fechada de campos                                | Criptografia no cliente      |
|                         | AFP-20 | Nada no app                                                                               | Biometria, 2FA               |
|                         | AFP-21 | "Exportar todos os meus dados" em arquivo                                                 | Rotina de backup própria     |

Acréscimos à AFP-6:

- "Excluir minha conta e todos os meus dados". **[Escolha do autor]** O app é aberto e guarda dados financeiros de terceiros; a LGPD dá a eles direito de eliminação, e sem servidor isso só é possível se o próprio app oferecer.
- **Aviso de privacidade na tela de login.** **[Decidido]** Um parágrafo curto: o que é guardado, que fica só no Firebase, que nada é compartilhado com terceiros, como exportar e excluir, e um e-mail de contato do Carlos. O autor redige, o Carlos revisa o texto antes de ir ao ar. É um aviso, não um aceite: não há registro de consentimento no banco. Entra junto com o login (AFP-9), porque o app já fica aberto a partir dali. E-mail de contato exibido no aviso: `kaduvuotto@gmail.com`. **[Decidido]**
- **Firebase App Check com reCAPTCHA**, como último item do épico. **[Decidido]** Todos os usuários dividem a cota diária do plano gratuito e as regras não limitam volume; o App Check bloqueia chamadas que não venham do site. Exige que o Carlos crie a chave reCAPTCHA no console. O emulador e os testes rodam sem App Check; a exigência no Firestore só é ligada depois de confirmar na URL de produção que o app continua funcionando.

## 4. Regras de negócio

Todas aprovadas em bloco pelo Carlos ("estou de acordo com tudo"), a partir de uma proposta do autor.

### Dinheiro e datas

- Valores em real, guardados como **inteiro de centavos**. Nenhuma conta com ponto flutuante sobre valores monetários. **[Escolha do autor]**
- Data de uma movimentação é um dia de calendário (`AAAA-MM-DD`), sem hora nem fuso. **[Escolha do autor]**
- Exibição em `pt-BR` (`R$ 1.234,56`, `dd/mm/aaaa`).

### Contas

- Tipos de ativo: banco, carteira digital, dinheiro, investimentos. Tipos de passivo: cartão de crédito, dívida/empréstimo.
- Saldo da conta = saldo inicial + receitas − despesas ± transferências daquela conta **com data até hoje**. **O saldo nunca é gravado; é sempre calculado a partir das movimentações.** **[Escolha do autor]** — é o que garante que saldo e histórico não divergem.
- Movimentação com data futura (parcelas a vencer, lançamentos agendados) é **prevista**: aparece na lista marcada como tal, não entra em saldo nem em patrimônio, e entra no balanço esperado. Em conta de passivo, a tela da conta mostra à parte o total previsto ("a vencer"), para a dívida de parcelas não ficar escondida. **[Escolha do autor]**
- Toda conta tem uma **data de abertura** (padrão: hoje, editável). O saldo inicial passa a contar a partir dela, e a conta não aceita movimentação anterior a ela. **[Escolha do autor]** — permite montar histórico retroativo sem distorcer os meses anteriores.
- Conta de passivo funciona igual: uma compra no cartão é uma despesa nessa conta e deixa o saldo negativo; pagar a fatura é uma transferência da conta corrente para o cartão.
- Saldo consolidado = soma dos saldos das contas **ativas** (ativos e passivos).
- Conta arquivada: some dos seletores e do consolidado; continua nos filtros de relatório e no histórico; pode ser desarquivada. Conta com movimentações não pode ser excluída, só arquivada. **[Escolha do autor]**

### Movimentações

- Três tipos: receita, despesa, transferência.
- Receita e despesa: valor, data, conta, categoria, descrição opcional, tags opcionais.
- Transferência: um único registro com conta de origem, conta de destino, valor e data. Não entra em totais de receita nem de despesa, não tem categoria.
- Parcelada: ao salvar, as N parcelas são criadas de uma vez, uma por mês a partir da data informada, cada uma identificada como "i de N". O valor total é dividido em centavos e a sobra da divisão vai na primeira parcela. **[Escolha do autor]** Editar ou excluir oferece "só esta" ou "esta e as seguintes". **[Escolha do autor]**
- Recorrente: uma regra mensal (dia do mês, valor, conta, categoria, mês de início, mês de fim opcional). Dia inexistente no mês (31 em fevereiro) cai no último dia. **[Escolha do autor]**
  - Meses futuros aparecem como **previsão** (não são movimentações, não alteram saldo).
  - Quando o usuário abre o app, as ocorrências devidas até hoje e ainda não criadas viram movimentações reais. A criação tem de ser idempotente: duas abas abertas ao mesmo tempo não podem duplicar.
  - A movimentação criada é independente da regra: pode ser editada ou excluída sem afetar a regra. Excluir uma ocorrência não a faz renascer. Alterar a regra só afeta ocorrências futuras.

### Categorias e tags

- No primeiro login o usuário recebe uma lista padrão (despesas: Alimentação, Moradia, Transporte, Saúde, Lazer, Educação, Outros; receitas: Salário, Freelance, Rendimentos, Outros). **[Escolha do autor na lista exata]**
- Categoria tem nome, tipo (receita ou despesa), cor e ícone. Pode ser renomeada e arquivada; arquivada some dos seletores e continua no histórico.
- Tags são texto livre na própria movimentação, com sugestão das já usadas.

### Painel do mês

- Saldo geral (consolidado de hoje), total de receitas do mês, total de despesas do mês. Os totais do mês contam só o que tem data até hoje; o que ainda vai cair no mês aparece no balanço esperado. Em mês passado, tudo já é realizado; em mês futuro, tudo é previsão. **[Escolha do autor]**
- Balanço esperado para o fim do mês = saldo consolidado de hoje + movimentações já lançadas com data futura dentro do mês + previsões de recorrentes ainda não criadas dentro do mês.
- Também mostra: últimas movimentações, orçamentos perto do teto, e um seletor para navegar entre meses. **[Escolha do autor]**

### Orçamentos e metas

- Orçamento: um teto mensal por categoria de despesa, que vale para todos os meses até ser alterado. **[Escolha do autor]** Progresso = despesas da categoria no mês ÷ teto. Aviso visual dentro do app a partir de 80% e outro a partir de 100%. O progresso conta **todas** as despesas da categoria no mês, inclusive as previstas, porque o aviso serve para antecipar o estouro. Mudar o teto vale também para a visão de meses passados (não há histórico de tetos). Orçamento de categoria arquivada deixa de aparecer. **[Escolha do autor]**
- Meta: nome, valor alvo, prazo opcional. Aportes são registrados manualmente (valor e data) e **não** são movimentações: não mexem em saldo de conta. **[Escolha do autor]** Progresso = soma dos aportes ÷ alvo.

### Análise e relatórios

- Patrimônio líquido de um mês = soma dos saldos de todas as contas no último dia daquele mês (ativos − passivos), incluindo contas hoje arquivadas. Calculado do histórico, sem guardar fotografias mensais. O gráfico cobre os últimos 12 meses, começando no mês da conta mais antiga quando houver menos que isso. **[Escolha do autor]**
- Os três gráficos da AFP-16: pizza = despesas por categoria no período; barras = receitas × despesas por mês; linha/área = saldo consolidado dia a dia dentro do mês selecionado (uma série só, por isso o `AreaChart` atual basta). **[Escolha do autor]**
- Relatório: lista de movimentações filtrada por período, conta, categoria, tipo e tag, com totais.
- Exportação do relatório filtrado em CSV, Excel (`.xlsx`) e PDF, tudo gerado no navegador como arquivo baixado. Nada é enviado a servidor.
- "Exportar todos os meus dados": um arquivo JSON com tudo que o usuário tem no banco. **[Escolha do autor no formato]**

## 5. Como é construído

### Lugar no monorepo

- Workspace `apps/web/finance-app`, pacote `@app/finance`. **[Escolha do autor no nome]** Exige recolocar o glob `apps/web/*` nos workspaces do `package.json` raiz (foi removido junto com o todo-app no PR #182).
- Yarn v1, TypeScript estrito, ESLint via `@repo/eslint-config` com `--max-warnings 0`, Jest 30 — tudo como o resto do repo. O `CLAUDE.md` do repo vale integralmente (zero comentários, sem `any`, camadas).

### Stack **[Escolha do autor]**

- **Vite + React 19 + React Router**, SPA estática. Next.js foi descartado: tudo fica atrás de login e fala direto com o Firestore pelo SDK do cliente, então renderização no servidor não traz nada e complicaria a autenticação.
- **Firebase v11 modular** (mesma major dos apps mobile): `firebase/auth` com `GoogleAuthProvider` + `signInWithPopup`; `firebase/firestore` com cache local persistente e listeners em tempo real.
- **react-hook-form** para formulários, com validação nas regras do campo (mesmo padrão do appointmate).
- Estado: um `AuthContext` e hooks que assinam os serviços. Sem Redux nem Zustand.
- Testes: Jest + jsdom + Testing Library, mock só na fronteira de serviço (política do repo desde o PR #175). Regras do Firestore testadas contra o emulador com `@firebase/rules-unit-testing`, em script `test:rules` separado, como nos apps mobile.

### Camadas (as mesmas dos apps mobile)

- `src/domain/` — TypeScript puro, zero mocks nos testes: dinheiro em centavos, cálculo de saldo, divisão de parcelas, ocorrências de recorrência, balanço esperado, progresso de orçamento e meta, patrimônio por mês, filtros de relatório, geração de CSV.
- `src/services/` — único lugar que importa `firebase/*`: `firebase.ts`, `authService`, e um serviço por coleção.
- `src/screens/`, `src/components/` — composição com `@industry/web`. Nenhum hex ou número mágico que já exista como token.

### Dados

Tudo sob o usuário: `users/{uid}/<coleção>/{id}`. Isso torna toda consulta naturalmente filtrada pelo dono e simplifica as regras.

| Coleção        | Campos principais                                                                                                                                                                                                                      |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `accounts`     | `name`, `type`, `color`, `icon`, `initialBalanceCents`, `openingDate`, `archived`, `createdAt`                                                                                                                                         |
| `categories`   | `name`, `kind`, `color`, `icon`, `archived`                                                                                                                                                                                            |
| `transactions` | `kind`, `amountCents`, `date`, `accountId`, `toAccountId` (só transferência), `categoryId` (só receita/despesa), `description`, `tags`, `recurrenceId` e `installment {groupId, index, count}` quando houver, `createdAt`, `updatedAt` |
| `recurrences`  | `kind`, `amountCents`, `dayOfMonth`, `accountId`, `categoryId`, `description`, `tags`, `startMonth`, `endMonth`, `materializedThrough`                                                                                                 |
| `budgets`      | `categoryId`, `limitCents`                                                                                                                                                                                                             |
| `goals`        | `name`, `targetCents`, `deadline`; subcoleção `contributions` com `amountCents`, `date`                                                                                                                                                |

- Ocorrência de recorrente usa id determinístico (`{recurrenceId}_{AAAA-MM}`) e a criação avança `materializedThrough` na mesma escrita atômica — é isso que dá a idempotência entre abas e impede que uma ocorrência excluída renasça.
- O app carrega as movimentações do usuário por listener com cache persistente e calcula saldos, totais e patrimônio no cliente. Volume pessoal (ordem de milhares de documentos em anos) cabe com folga na cota gratuita. **[Escolha do autor]** Se um dia pesar, o caminho é paginar por período e guardar saldos de fechamento — fora deste projeto.
- Qualquer consulta que combine filtro de igualdade com `orderBy` em outro campo precisa de índice composto em `firestore.indexes.json` (o emulador não acusa a falta; produção falha).

### Regras do Firestore

- Leitura e escrita só quando `request.auth.uid == uid` do caminho. Nenhum bypass de admin.
- Em cada coleção, `hasAll` dos obrigatórios e `hasOnly` com a lista fechada de campos; tipos e limites validados (valor inteiro e positivo, `kind` e `type` dentro do enum, tamanho máximo de textos e de `tags`). Como o app é aberto, as regras são a única barreira contra lixo gravado direto pela API.
- `createdAt` imutável em update.
- Teste de regras cobrindo: dono lê/escreve; outro usuário e anônimo são negados; campo extra, tipo errado e enum inválido são negados.

### Privacidade

Dado financeiro é dado pessoal (LGPD), embora não seja da categoria "sensível". Mesma disciplina do appointmate: nenhum SDK de analytics/telemetria/crash; nunca logar movimentação, conta ou qualquer campo derivado (só ids e códigos de erro); exportações são arquivo local, nunca upload.

### Design system

- Navegação com `AppShell` + `Sidebar` no desktop e `TabBar` em telas estreitas; o app deve ser utilizável no navegador do celular, já que não haverá app mobile. **[Escolha do autor]**
- Peças já existentes que cobrem a maior parte: `StatTile`, `Card`, `DataTable`, `ListRow`, `Sheet`, `Select`, `DatePicker`, `SegmentedControl`, `Progress`, `RingProgress`, `AreaChart`, `Badge`, `Toast`, `EmptyState`, `Skeleton`.
- **Componentes novos no `@industry/web`** **[Decidido]**: `PieChart` (espelhando a API do `PieChart` do `@industry/mobile`: `slices`, `valueFormatter`, `legendPlacement`, `legendValue`, `centerLabel`) e `BarChart` (séries agrupadas por rótulo, para receitas × despesas). Implementação própria em SVG, cores de `viz` dos tokens, com teste, story e changeset — passam pelo Chromatic. O gráfico de linha da AFP-16 é atendido pelo `AreaChart` existente.
- Se faltar outro primitivo durante a construção, ele nasce no design system, não no app.

### Telas e rotas **[Escolha do autor]**

`/login` · `/` (painel do mês) · `/transacoes` · `/contas` · `/orcamentos` · `/metas` · `/relatorios` (gráficos, patrimônio, relatório filtrado e exportação) · `/configuracoes` (categorias, recorrentes, exportar meus dados, excluir conta, sair).

Criar e editar acontecem em `Sheet` sobre a tela atual; "nova movimentação" fica acessível de qualquer tela.

### Firebase e Vercel

- **Projeto Firebase novo**, dedicado a este app. **[Escolha do autor, aprovada]** `firebase.json`, `firestore.rules`, `firestore.indexes.json` e `.firebaserc` ficam em `apps/web/finance-app`, com o alias `default` apontando para o emulador, como nos outros apps: deploy em produção sempre com `--project` explícito e **só com confirmação explícita do Carlos**.
- Configuração do Firebase chega ao app por variáveis `VITE_FIREBASE_*` (não são segredo, mas não ficam versionadas).
- **Deploy no Vercel pelo GitHub Actions**, seguindo o padrão do `storybook-vercel.yml`: build no runner e `vercel deploy --prebuilt --prod` em push para `main` nos caminhos do app, do `@industry/web` e do `@industry/tokens`. **[Escolha do autor]** Reescrita de todas as rotas para `index.html`.
- O domínio de produção do Vercel precisa entrar nos "domínios autorizados" do Firebase Auth, senão o popup do Google falha. Previews do Vercel têm domínio variável e não terão login funcionando; não há deploy de preview. **[Escolha do autor]**
- Passos que dependem do Carlos: criar (ou autorizar a criação de) o projeto Firebase e ativar o provedor Google; criar o projeto no Vercel e gravar o secret `VERCEL_PROJECT_ID_FINANCE_APP` (os secrets `VERCEL_ORG_ID` e `VERCEL_TOKEN` já existem); gravar as variáveis `VITE_FIREBASE_*` no GitHub.

### CI

- Lint, check-types e test do `@app/finance` em PR para `main` (workflow novo ou job novo, à escolha do construtor).
- Entrada `finance-app` na matriz do `coverage.yml` (≥ 95% nos arquivos alterados).
- `CLAUDE.md` e o documento de arquitetura no Notion atualizados quando o workspace existir.

## 6. Entrega

Um PR por tarefa do Jira (ou por grupo pequeno e coeso), cada um com testes e revisão de código ao final, na ordem da seção 3. O app vai ao ar no fim do AFP-1, já com login, e cresce a cada épico. Cada épico termina verificado no navegador contra o emulador e, depois do deploy, na URL de produção.

## 7. Deixado para o construtor

- Biblioteca para gerar `.xlsx` e PDF no navegador (preferir pacotes mantidos e sem vulnerabilidade conhecida; o pacote `xlsx` do npm está abandonado).
- Layout detalhado de cada tela, dentro do Industry.
- Forma exata dos hooks de assinatura, nomes de arquivos e divisão de PRs dentro de cada épico.
- Paleta e conjunto de ícones oferecidos para contas e categorias (a partir de `viz` e do `Icon` do design system).
- Ferramenta de transformação do Jest (`ts-jest` ou `babel-jest`), seguindo o que o `@industry/web` usa.

## 8. Pendências fora do código

- As tarefas AFP-19 e AFP-20 e partes de AFP-7, AFP-8 e AFP-9 ficaram fora do escopo; o quadro ainda as mostra como pendentes.
