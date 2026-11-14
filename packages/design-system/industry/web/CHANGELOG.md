# @industry/web

## 0.3.0

### Minor Changes

- de723d1: `Card`: nova prop `action`, renderizada na linha do título e alinhada à direita. O título passa a usar `--color-accent-300`.
- de723d1: `IconBubble`: o círculo com ícone usado em cartões de resumo e listas. O `StatTile` passa a usá-lo, com o ícone em `--color-accent-300`, e quebra valores longos dentro do cartão.
- de723d1: `SegmentedControl`: prop `block`, que ocupa a largura do contêiner com segmentos iguais.
- de723d1: `Sheet`:
  - Botão "Fechar" ao lado do título, e `Escape` fecha.
  - O título nomeia o diálogo.
  - O foco entra no primeiro campo do conteúdo. Num grupo de rádio, entra na opção marcada.
  - `Tab` circula dentro da folha, mesmo depois de um clique no corpo dela.
  - Ao fechar, o foco volta para quem abriu.
  - Com uma folha aberta dentro de outra, só a de dentro responde ao teclado.

- de723d1: `StatTile`: prop `tone` (`default` | `onPrimary`). Em `onPrimary`, o rótulo e o ícone usam `--color-text` sobre um círculo translúcido, legíveis no `GradientSurface variant="primary"`. O rótulo cinza padrão fica abaixo de 4,5:1 sobre esse gradiente.
- de723d1: `TextField`: prop `size` (`md` | `lg`). `lg` aumenta a fonte para `--text-h3` e a altura do campo; campos de várias linhas ignoram o tamanho.

### Patch Changes

- de723d1: `Icon`: a prop `color` passa a pintar o ícone via CSS `color`, com `stroke="currentColor"`. O atributo `stroke` do SVG não resolve variáveis CSS, então cores como `var(--viz-1)` eram ignoradas e o ícone ficava na cor do texto.

  O que muda para quem usa:
  - `color` aceita só cores CSS. Pinturas exclusivas de SVG (`url(#gradiente)`, `none`, `context-stroke`) deixam de ter efeito.
  - Um `style.color` passado junto prevalece sobre a prop `color`.

## 0.2.0

### Minor Changes

- 9e39d4d: Adiciona `DotGrid`: grade de bolinhas sombreadas por intensidade, no estilo de mapa de calor, com legenda opcional e nome acessível.
- daca8f1: Adiciona `PieChart` (rosca com legenda, mesma API do `@industry/mobile`) e `BarChart` (barras agrupadas por série).

## 0.1.0

### Minor Changes

- 308eb7e: Industry passa a ter uma única aparência e uma nova paleta, que já aparece nos componentes. O tema claro deixa de existir.

  `@industry/mobile`: `useTheme` passa a retornar o tema único; `ThemePreference` e os exports do tema claro foram removidos, assim como o peer dependency de `@react-native-async-storage/async-storage`. `@industry/web`: `useTheme` removido.

  `@industry/tokens`: novos valores e novos tokens disponíveis — raios (`radii`, incluindo `pill`), alturas de controle (48/40), escala tipográfica, `gradient`, `glow` (string de `boxShadow`) e `color.controlBorder`. `@industry/mobile` e `@industry/web` já os adotam nos componentes.

  A família tipográfica dos tokens passa a ser Inter. Os apps precisam carregar a fonte; até lá o texto cai para a fonte do sistema.

  `colors.css` e `gradients.css` passam a ser gerados por `scripts/build-tokens.mjs`.

  `@industry/tokens`: as variáveis de cor do CSS passam a ser valores hex sRGB (antes eram `oklch()`), idênticos às constantes nativas. Em telas de gamut amplo a web deixa de mostrar cores mais saturadas que as do nativo; algumas cores mudam levemente de valor nas duas plataformas.

  `@industry/mobile` (breaking): `Frame`, `FrameProps` e as marcas de registro (`BlueprintMarks`) foram removidos, assim como a prop `framed` de `Button` e `Card`. `Button` ganha a prop `selected` (estado selecionado exposto a tecnologias assistivas, com borda, fundo e rótulo próprios). Nova primitiva `GradientSurface`, que desenha o gradiente e o brilho dos tokens. O peer dependency `react-native` sobe para `>=0.76`, porque gradiente e brilho dependem da New Architecture.

  `@industry/mobile`: todos os componentes foram reestilizados — superfícies preenchidas e arredondadas, ações primárias com gradiente e brilho, novo desenho dos campos, `DataTable`, `Progress`, `Skeleton`, `EmptyState` e `Duotone` com os raios e superfícies dos tokens. Rótulos e `Badge` passam a usar caixa de frase, e os tamanhos de texto que correspondem a um token passam a lê-lo (com deslocamentos de 1 a 2px); os que não têm token ficam como estavam. Os itens do `TabBar` passam a ter o papel `tab`. As props públicas não mudam.

  `@industry/web` (breaking): `Frame`, `FrameProps` e as marcas de registro (`BlueprintMarks`) foram removidos, assim como a prop `framed` de `Button` e `Card`. `Button` ganha a prop `selected` (`aria-pressed`, com borda, fundo e rótulo próprios, sobre qualquer `variant`). `Menu` ganha `header` (rótulo de grupo que nomeia o menu) e `selected` nos itens, que passam a ser `menuitemradio` com `aria-checked` quando algum item define a seleção. Nova primitiva `GradientSurface`, que desenha o gradiente e o brilho dos tokens e, ao contrário do mobile, não recorta os filhos.

  `@industry/web`: todos os componentes foram reestilizados — superfícies preenchidas e arredondadas, ações primárias com gradiente e brilho, campos com a borda de controle dos tokens, `Tabs` e `SegmentedControl` em pílula, `TabBar`, `Stepper`, `Sidebar`, `AppShell`, `DataTable`, `Progress`, `Skeleton`, `EmptyState` e `Duotone` com os raios e superfícies dos tokens, e estados de hover e pressed em todos os elementos interativos. Rótulos passam a usar caixa de frase, e os tamanhos de texto que correspondem a um token passam a lê-lo. O `TabBar` passa a ter os papéis `tablist` e `tab`, `DataTable` só torna os cabeçalhos interativos quando `onSort` é passado e os alvos de toque do `DatePicker` e da paginação do `DataTable` passam a ter ao menos `--tap`. As demais props públicas não mudam.

  `@industry/mobile` e `@industry/web`: novos componentes `RingProgress` (anel de progresso com arco em gradiente e rótulo central), `AreaChart` (gráfico de área com grade, rótulos nos eixos e `valueFormatter`) e `StatTile` (ícone, valor e legenda de uma métrica), com as mesmas props nas duas plataformas.

  `@industry/mobile`: novo componente `SectionLabel` (rótulo de seção com divisória e conteúdo opcional à direita), antes duplicado nos dois apps.

  `@industry/web`: as linhas do `Menu` passam a ficar recuadas e com cantos arredondados, em vez de ir até a borda do painel.

### Patch Changes

- Updated dependencies [308eb7e]
  - @industry/tokens@0.1.0
