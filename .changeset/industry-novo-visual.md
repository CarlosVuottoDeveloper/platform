---
'@industry/tokens': minor
'@industry/mobile': minor
'@industry/web': minor
---

Industry passa a ter uma única aparência e uma nova paleta, que já aparece nos componentes. O tema claro deixa de existir.

`@industry/mobile`: `useTheme` passa a retornar o tema único; `ThemePreference` e os exports do tema claro foram removidos, assim como o peer dependency de `@react-native-async-storage/async-storage`. `@industry/web`: `useTheme` removido.

`@industry/tokens`: novos valores e novos tokens disponíveis — raios (`radii`, incluindo `pill`), alturas de controle (48/40), escala tipográfica, `gradient`, `glow` (string de `boxShadow`) e `color.controlBorder`. `@industry/mobile` e `@industry/web` já os adotam nos componentes.

A família tipográfica dos tokens passa a ser Inter. Os apps precisam carregar a fonte; até lá o texto cai para a fonte do sistema.

`colors.css` e `gradients.css` passam a ser gerados por `scripts/build-tokens.mjs`.

`@industry/mobile` (breaking): `Frame`, `FrameProps` e as marcas de registro (`BlueprintMarks`) foram removidos, assim como a prop `framed` de `Button` e `Card`. `Button` ganha a prop `selected` (estado selecionado exposto a tecnologias assistivas, com borda, fundo e rótulo próprios). Nova primitiva `GradientSurface`, que desenha o gradiente e o brilho dos tokens. O peer dependency `react-native` sobe para `>=0.76`, porque gradiente e brilho dependem da New Architecture.

`@industry/mobile`: todos os componentes foram reestilizados — superfícies preenchidas e arredondadas, ações primárias com gradiente e brilho, novo desenho dos campos, `DataTable`, `Progress`, `Skeleton`, `EmptyState` e `Duotone` com os raios e superfícies dos tokens. Rótulos e `Badge` passam a usar caixa de frase, e os tamanhos de texto que correspondem a um token passam a lê-lo (com deslocamentos de 1 a 2px); os que não têm token ficam como estavam. Os itens do `TabBar` passam a ter o papel `tab`. As props públicas não mudam.

`@industry/web` (breaking): `Frame`, `FrameProps` e as marcas de registro (`BlueprintMarks`) foram removidos, assim como a prop `framed` de `Button` e `Card`. `Button` ganha a prop `selected` (`aria-pressed`, com borda, fundo e rótulo próprios, sobre qualquer `variant`). `Menu` ganha `header` (rótulo de grupo que nomeia o menu) e `selected` nos itens, que passam a ser `menuitemradio` com `aria-checked` quando algum item define a seleção. Nova primitiva `GradientSurface`, que desenha o gradiente e o brilho dos tokens e, ao contrário do mobile, não recorta os filhos.

`@industry/web`: todos os componentes foram reestilizados — superfícies preenchidas e arredondadas, ações primárias com gradiente e brilho, campos com a borda de controle dos tokens, `Tabs` e `SegmentedControl` em pílula, `TabBar`, `Stepper`, `Sidebar`, `AppShell`, `DataTable`, `Progress`, `Skeleton`, `EmptyState` e `Duotone` com os raios e superfícies dos tokens, e estados de hover e pressed em todos os elementos interativos. Rótulos passam a usar caixa de frase, e os tamanhos de texto que correspondem a um token passam a lê-lo. O `TabBar` passa a ter os papéis `tablist` e `tab`, `DataTable` só torna os cabeçalhos interativos quando `onSort` é passado e os alvos de toque do `DatePicker` e da paginação do `DataTable` passam a ter ao menos `--tap`. As demais props públicas não mudam.
