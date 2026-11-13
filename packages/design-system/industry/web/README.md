# @industry/web

**33 componentes React do Industry — implementação própria, sem MUI e sem Emotion.** Superfícies preenchidas e arredondadas, ações com gradiente e brilho, sobre um fundo azul-marinho profundo. Tematizados por [`@industry/tokens`](../tokens/README.md) através de CSS custom properties.

📖 **[Storybook publicado](https://industry-web-ds.vercel.app)** — com regressão visual no Chromatic a cada push.

## Por que implementação própria

Envolver uma biblioteca de componentes resolve o começo e cobra o resto. Ou o vocabulário visual do sistema cabe no que a biblioteca expõe, ou você passa a lutar contra ela — sobrescrevendo estilos internos, contornando estrutura de DOM que não controla, carregando um runtime de CSS-in-JS por conta de um punhado de props.

O Industry tem um vocabulário específico: gradiente primário com brilho nas ações, campos e superfícies com raios do sistema, bordas de controle em repouso. Escrever os componentes direto contra os tokens saiu mais barato do que dobrar uma biblioteca para chegar nisso — e o pacote não carrega dependência de estilo nenhuma.

## Uso

```tsx
import { Button, Card, TextField } from '@industry/web';
import '@industry/tokens/styles.css'; // os tokens são globais

<Card title="Novo projeto">
  <TextField label="Nome" />
  <Button variant="primary">Salvar</Button>
</Card>;
```

## Requisitos

- **`@industry/tokens/styles.css` carregado uma vez.** Ele define as custom properties (`--color-*`, `--radius-*`, `--gradient-*`, `--glow-accent`, `--text-*`) e importa a fonte **Inter** (pesos 400, 500 e 600). Sem o CSS os componentes ficam sem estilo; sem a fonte o texto cai para a fonte do sistema.
- **Navegador com `color-mix()`**, usado nos tons de hover, pressed e seleção.

## Componentes

**Superfície base** — `GradientSurface`

**Mídia** — `Duotone`, `Icon`

**Formulários** — `Button`, `TextField`, `SearchField`, `Select`, `Switch`, `Checkbox`, `RadioGroup`, `SegmentedControl`, `DatePicker`, `FileDrop`

**Layout e navegação** — `AppShell`, `Sidebar`, `TabBar`, `Tabs`, `Breadcrumbs`, `Menu`, `Popover`, `Sheet`, `Stepper`, `Accordion`

**Dados e feedback** — `DataTable`, `ListRow`, `Card`, `Badge`, `RingProgress`, `AreaChart`, `StatTile`, `Progress`, `Spinner`, `Skeleton`, `EmptyState`, `Toast`, `Tooltip`

Em relação ao [`@industry/mobile`](../mobile/README.md), este conjunto troca `AppBar`, `Chip`, `FAB`, `IconButton` e `PieChart` por `AppShell`, `Popover` e `Sidebar` — conceitos de janela grande. Não há `AppBar`: o `header` do `AppShell` faz esse papel, transparente e sem divisor, com o título em `--text-h4` e peso 600.

### `GradientSurface`

Um único `<div>` que desenha o gradiente (`variant`: `primary`, `surface` ou `backdrop`), o raio (`radius`) e, com `glow`, o brilho do acento. Diferente do mobile, **na web ela não recorta os filhos**: não há `overflow: hidden`, então menus, popovers e anéis de foco que saem da caixa continuam visíveis. Repassa as demais props de `div`; `style` vem por último.

O gradiente primário de `Button` e dos segmentos ativos de `Tabs` e `SegmentedControl` é desenhado por uma superfície interna única (a mesma definição para todos), com tons próprios de hover e pressed. Um `background` passado pelo consumidor **não** o repinta.

### `Button` e `selected`

`selected` marca o botão como selecionado: o estado é exposto a tecnologias assistivas (`aria-pressed`) e o botão ganha fundo, borda e rótulo próprios, sem o gradiente primário. Ele vale sobre qualquer `variant`.

### Aparência única

O Industry tem uma única aparência, escura. Não há tema claro nem hook de tema.

### `Menu`

`header` coloca um rótulo de grupo acima dos itens e nomeia o menu (`aria-labelledby`). Se algum item define `selected`, o menu passa a ser de seleção: os itens viram `menuitemradio` com `aria-checked`, o item selecionado ganha fundo de acento e um ícone de check, e os demais reservam o mesmo espaço para o alinhamento. Sem `selected` em nenhum item, são `menuitem` comuns, de ação.

## Onde a plataforma muda a API

Paridade de nome não significa paridade de implementação. As diferenças são deliberadas:

| Componente   | Diferença                                                                                                                                                                                                                                                 |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Button`     | Tem estados de hover, pressed e foco visível — `:hover` existe com mouse; o mobile só tem pressed                                                                                                                                                         |
| `Select`     | Usa o `<select>` nativo do navegador: a lista de opções é desenhada pelo navegador e só o fundo das opções segue o sistema. O mobile abre um painel próprio com a opção selecionada em acento                                                             |
| `TabBar`     | É uma navegação (`<nav>`) com botões que marcam o item ativo com `aria-current="page"`, não um `tablist`: na web a barra inferior navega entre páginas, sem painéis nem o modelo de teclado de abas. O mobile expõe `tablist` / `tab` com `aria-selected` |
| `Switch`     | `checked` / `onChange`, como um `<input type="checkbox">`; o mobile usa `checked` / `onCheckedChange`                                                                                                                                                     |
| `RadioGroup` | Exige `name`, amarração de formulário HTML                                                                                                                                                                                                                |
| `DataTable`  | O corpo rola dentro de um pai com altura limitada, com o cabeçalho fixo (`overflow: auto`). Menus ancorados dentro de uma célula ficam recortados pela área de rolagem                                                                                    |
| `DatePicker` | O painel é um `Popover`, e cada dia e botão de mês tem pelo menos `--tap` de lado                                                                                                                                                                         |
| `Duotone`    | Usa `mix-blend-mode: color`, que preserva a luminância da foto; o mobile só consegue uma sobreposição translúcida                                                                                                                                         |
| `Icon`       | `name` em kebab-case (`"arrow-right"`), convenção do `lucide-react`; `color` padrão é `currentColor`                                                                                                                                                      |

## Fundações no Storybook

Seis páginas em `Foundations/*` — `Color`, `Typography`, `Semantics`, `Spacing & Elevation`, `Icons`, `Image` — cada uma renderizando os tokens reais de `@industry/tokens` (cores, `--color-control-border`, os três gradientes, `--glow-accent`, raios com `pill`, escala tipográfica), nunca um valor fixo copiado. Se um token mudar, a documentação muda junto.

Três `Templates/*` mostram os componentes compostos em telas de verdade: `LoginTemplate`, `ListDetailTemplate`, `MultiStepFormTemplate`.

A fonte Inter é carregada no preview por `@industry/tokens/styles.css` e na interface do Storybook por `.storybook/manager-head.html`.

## Desenvolvimento

```sh
yarn workspace @industry/web storybook        # dev em :6010
yarn workspace @industry/web test             # 357 testes, 36 suítes
yarn workspace @industry/web build            # tsup → dist/index.{js,mjs,d.ts}
yarn workspace @industry/web build-storybook  # estático, usado pelo Chromatic e pelo Vercel
```

Rode a partir da **raiz do monorepo**. De dentro do diretório do pacote, o Yarn v1 imprime a ajuda do `yarn workspace` em vez de executar o script.

## Nota de status

Este pacote **não tem aplicação consumidora hoje** — o todo-app, que era o único, foi descontinuado. Segue mantido, testado e publicado: é a metade web do design system, e existe para quando a próxima aplicação web aparecer. Não é resíduo.
