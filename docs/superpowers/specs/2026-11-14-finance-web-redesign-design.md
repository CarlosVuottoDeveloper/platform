# Telas web do finance-app reimaginadas — design

Data: 2026-11-14. Referência: `Wireframe — Finance App (Industry DS).pdf`, páginas 8–14 (desktop): Painel, Transações, Contas, Orçamentos, Metas, Relatórios e o "Nova movimentação" aberto sobre o Painel.

**[Decidido]** é o que o Carlos disse ou aprovou. **[Escolha do autor]** pode ser revertido na leitura.

## Intenção

Aproximar o app logado (`apps/web/finance-app`) do wireframe: telas organizadas em cartões, ícone por tipo nas listas, resumo do Painel com destaque e o formulário de movimentação mais compacto. Não muda o que o app faz, os dados nem as regras.

## Objetivos e limites

- **[Decidido]** Só a parte web: as páginas 8–14 valem a partir de 768px (`useIsWideScreen`). As páginas 1–7 (largura de celular) ficam fora.
- **[Escolha do autor]** As telas usam os mesmos componentes em qualquer largura; abaixo de 768px as grades viram uma coluna e a navegação continua sendo a `TabBar` com "Mais". Manter dois layouts separados por tela duplicaria código sem ganho.
- **[Decidido]** O que for visual novo nasce no `@industry/web`, com teste, story e changeset; as telas só compõem.
- Os dados do PDF ("Compras", "Tesouro Selic", valores) são ilustrativos. Nenhum texto, valor ou categoria do PDF entra no app.
- Sem funcionalidade nova, com uma exceção que está no wireframe e usa um cálculo que já existe: o cartão "Despesas por categoria" no Painel (`expensesByCategory`, já usado em Relatórios).
- Fora do escopo: login (já reimaginado em #233), Configurações e "Mais" (não aparecem no PDF; herdam só o que é compartilhado: ícones, `Sheet`, cartão com título azul).

## Abordagens

1. **[Decidido]** Primeiro um PR no `@industry/web` com o que falta, depois as telas por partes. Segue a regra do repositório e cada PR fica revisável e passa no Chromatic.
2. Tudo nas telas, com estilos locais. Mais rápido, mas espalha cor e espaçamento pelo app e deixa o `Sheet` sem Esc e sem foco.

## Design system (`@industry/web`, changeset minor) **[Escolha do autor]**

O `PieChart` já é rosca com rótulo central e legenda à direita, e o `SearchField`, `Tabs`, `Badge`, `Progress` e `RingProgress` já existem. Faltam quatro coisas:

1. **`Sheet` com fechar, Esc e foco.** O wireframe mostra a folha com alça, título e um X no canto. Mudanças:
   - Botão X (`aria-label="Fechar"`) ao lado do título, que chama `onDismiss`. Só aparece quando há `onDismiss`.
   - `Escape` chama `onDismiss`.
   - Ao abrir, o foco vai para o primeiro elemento focável do conteúdo, pulando o X do cabeçalho. No "Nova movimentação" é o Despesa/Receita, e no PDF o Valor aparece em foco logo em seguida. Se o conteúdo não tiver nada focável, o foco vai para o X. Sem prop nova para isso. Ao fechar, o foco volta para o elemento que tinha foco antes. `Tab` e `Shift+Tab` circulam dentro da folha.
   - O título vira o nome acessível do diálogo (`aria-labelledby`, com `useId`).

   O `Sheet` só é usado pelo finance-app, então a mudança não afeta outro consumidor. Resolve a falha de acessibilidade já anotada.

2. **`Card` com ação no título e título em azul claro.** No PDF, o título dos cartões é `--color-accent-300` e alguns têm um link à direita ("Ver todas", "Ver orçamentos").
   - Nova prop `action?: ReactNode`, alinhada à direita na linha do título.
   - O título passa a usar `--color-accent-300`, que dá cerca de 9:1 sobre `--color-surface`.
   - A mudança vale para todo `Card`, inclusive os do login, e o Chromatic vai mostrar a diferença.
3. **`IconBubble`.** O círculo com ícone que aparece nos cartões de resumo e em todas as listas do PDF. Props: `children` (o ícone), `size?: 'sm' | 'md'` (32/40px), `style?`. O fundo é `--color-accent-800` e a cor do ícone, `--color-accent-300`. O `StatTile` passa a usar o `IconBubble` no lugar do círculo que desenha hoje, sem mudar o visual.

4. **`TextField` com tamanho grande.** O `style` do `TextField` só alcança o invólucro, então o valor em fonte grande da página 14 precisa de uma prop no design system: `size?: 'md' | 'lg'` (padrão `md`, o visual de hoje). `lg` aumenta a altura e a fonte do campo com tokens de texto existentes. O `MoneyField` do app passa a usar `size="lg"` no formulário de movimentação.

Fica de fora: nenhum token novo e nenhuma variante de `StatTile`. O cartão de destaque usa o `GradientSurface variant="primary"` que já existe.

## App **[Escolha do autor, salvo o marcado acima]**

### Estrutura compartilhada

- **Ícones de navegação** (`navigation.ts`), conforme o PDF:

  | Item          | Ícone                |
  | ------------- | -------------------- |
  | Painel        | `layout-dashboard`   |
  | Transações    | `arrow-left-right`   |
  | Contas        | `wallet`             |
  | Orçamentos    | `chart-pie`          |
  | Metas         | `target`             |
  | Relatórios    | `trending-up`        |
  | Configurações | `sliders-horizontal` |

  A `TabBar` estreita herda os mesmos ícones.

- **Sidebar:** "Sair" no rodapé com o ícone `log-out`, em azul claro.
- **Cabeçalho:** "Nova movimentação" ganha o ícone `plus`.
- **`MonthSwitcher`:**
  - Vira uma pílula (`--color-surface`, `--radius-pill`) com as setas dentro.
  - O texto passa a ser "Novembro 2026", sem o "de". Uma função nova no domínio, `formatMonthTitleBR(month): string`, substitui o uso de `formatMonthBR` e a capitalização feita no componente.
  - Os `aria-label` das setas continuam iguais.
- **Ícone por tipo de movimentação**, em `components/MovementIcon`. Uma função pura `movementIconName(transaction, { pending })` devolve o nome do ícone, com a primeira regra que bater:

  | Situação      | Ícone              |
  | ------------- | ------------------ |
  | prevista      | `calendar-check`   |
  | transferência | `arrow-left-right` |
  | parcelada     | `credit-card`      |
  | receita       | `trending-up`      |
  | despesa       | `trending-down`    |

  "Prevista" quer dizer `pending`: a data é depois de hoje, a mesma condição que já mostra o selo "Prevista". Inclui lançamentos reais futuros e ocorrências projetadas de recorrência. O componente desenha o ícone dentro de um `IconBubble`. Nas listas o ícone tem sempre a cor accent padrão; o verde e o vermelho ficam só nos cartões de resumo, como no PDF.

- **Linha de movimentação** (`components/MovementRow`), usada no Painel e em Transações:
  - Bolha, título, linha de detalhe, selos (parcela "3 de 10", "Prevista"), valor e ações opcionais.
  - Valor de receita em `--color-success-300`, como hoje.
  - O `TransactionRow` atual vira essa linha e mantém as regras de hoje:
    - transferência não tem "Editar";
    - a ocorrência projetada de recorrência (`forecast`) não tem botões, como hoje;
    - o lançamento real com data futura (`pending`) continua com "Editar" e "Excluir";
    - os `aria-label` "Editar X" e "Excluir X" continuam iguais.
- **Nova movimentação (e os outros formulários):** o `FormSheet` usa o `Sheet` novo (X, Esc, foco) e mantém a largura máxima de 560px, centralizada. Em largura de desktop, o `TransactionSheet` segue a página 14:
  - Despesa/Receita ocupa a largura toda.
  - O valor fica em fonte grande (`TextField size="lg"`).
  - "Data" e "Parcelar em" lado a lado, depois "Conta" e "Categoria" lado a lado.
  - A descrição ganha o placeholder "Ex.: Mercado da semana".
  - Abaixo de 768px, um campo por linha, como hoje.
  - Validação e campos não mudam.

### Telas

- **Painel (p. 8)**
  - Título "Painel" com o mês à direita.
  - 4 cartões de resumo em uma linha (`repeat(4, 1fr)`, ou uma coluna no estreito). "Saldo geral" fica sobre `GradientSurface variant="primary"`. O ícone de Receitas usa `--color-success-300` e o de Despesas, `--color-danger-300`.
  - Abaixo, duas colunas (`2fr 1fr`):
    - **Esquerda:** `Card` "Últimas movimentações" com `action` "Ver todas" (link para `/transacoes`). As últimas 5 realizadas aparecem em `MovementRow`, sem ações, com detalhe "dd/mm/aaaa · categoria · conta" (transferência: "dd/mm/aaaa · origem → destino").
    - **Direita:** `Card` "Orçamentos em alerta", com `action` "Ver orçamentos" (link para `/orcamentos`), só quando há alerta. Embaixo, `Card` "Despesas por categoria" com `PieChart` (legenda embaixo, só porcentagens, `centerLabel` "Total" + valor) do mês escolhido, até hoje; vazio mostra "Sem despesas neste mês".
  - O estado sem contas continua como está.
- **Transações (p. 9)**
  - Título; abaixo, o mês à esquerda e a busca à direita na mesma linha.
  - Lista dentro de um `Card`, com cabeçalho de data, `MovementRow` e ações em texto.
  - Agrupamento, busca, previstas e estado vazio continuam como hoje.
- **Contas (p. 10)**
  - Título com "Transferir" (secundário) e "Nova conta" (primário) à direita.
  - "Saldo consolidado" num cartão de destaque sobre `GradientSurface variant="primary"`.
  - Duas colunas: Ativos à esquerda; Passivos e Arquivadas empilhados à direita. Cada grupo é um `Card` com título, e o grupo vazio some, como hoje.
  - Cada conta mostra, dentro de um `IconBubble`, o ícone e a cor que o usuário escolheu (`account.icon` e `account.color`, como hoje em `Accounts.tsx`). As cores diferentes por conta no PDF vêm daí. Não existe mapeamento por tipo, e o cadastro e os dados não mudam.
  - "A vencer" e as regras de Excluir/Arquivar não mudam.
- **Orçamentos (p. 11)**
  - Título com o mês à direita.
  - Grade de 2 colunas de cartões: nome, selo de status, "Alterar teto"/"Definir teto" na linha do título, barra e "R$ x de R$ y" (ou "Sem teto definido").
- **Metas (p. 12)**
  - Título com "Nova meta".
  - Grade de 3 colunas de `GoalCard`, cujo conteúdo não muda; só ajustes de espaçamento.
- **Relatórios (p. 13)**
  - O seletor de mês sobe para a linha das abas, à direita, e só aparece na aba Gráficos. O estado do mês passa do `ChartsTab` para o `Reports`.
  - Em Gráficos, no desktop, a rosca usa `legendPlacement="right"` com `centerLabel` "Total"; no estreito, legenda embaixo.
  - Patrimônio e Relatório não mudam.

## Restrições

- Cor, espaçamento e raio só de tokens; nenhum hex nas telas.
- Os testes de comportamento atuais continuam valendo. Onde um teste dependia da estrutura antiga (texto do mês, por exemplo), ele é atualizado, não removido.
- Zero comentários, sem `any`, lint com `--max-warnings 0`, cobertura ≥ 95% nos arquivos alterados.
- Build continua com poucos arquivos: ícones novos do lucide caem no chunk `icons`. Teste de CI com limite de 200 arquivos.

## Entrega

São 4 PRs, empilhados na ordem:

1. `@industry/web`: `Sheet`, `Card`, `IconBubble`, `TextField` grande + changeset.
2. Estrutura compartilhada: navegação, `MonthSwitcher`, `MovementIcon`/`MovementRow`, `FormSheet`/`TransactionSheet`.
3. Painel e Transações.
4. Contas, Orçamentos, Metas e Relatórios.

## Verificação

- Testes, lint, tipos e cobertura de cada workspace tocado.
- Story nova/atualizada no Storybook. Chromatic vai mostrar `Card`, `Sheet` e `StatTile`; aprovação do Carlos.
- Capturas do bundle de produção em 1280px e 390px de cada tela, com os dados de exemplo do emulador, comparadas com as páginas 8–14.
- Esc fecha, X fecha, o foco volta ao botão "Nova movimentação" e o Tab não sai da folha.

## Deixado para quem implementa

Espaçamentos internos exatos, o tamanho da fonte do valor grande (dentro dos tokens de texto) e a ordem de testes e commits dentro de cada PR.
