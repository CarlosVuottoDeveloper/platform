# @industry/mobile

## 0.0.3

### Patch Changes

- 3748792: `Select`: o painel de opções passa a somar o inset inferior da safe area ao padding, para a última opção não ficar atrás da barra de navegação do Android. Também expõe `testID="<testID>-panel"` no painel.

## 0.0.2

### Patch Changes

- 5cd4ccf: `PieChart`: novas props `legendPlacement` (`'bottom' | 'right'`), `legendValue` (`'valueAndPercent' | 'percent'`), `centerLabel` (conteúdo centralizado sobre o furo do donut) e `testID`. Os padrões preservam o comportamento atual.

## 0.0.1

### Patch Changes

- 0e28578: `Menu`: o item selecionado passa a usar fundo translúcido do accent e texto/check em `accentRamp['300']`, no lugar do fundo `accentRamp['200']` com texto branco, que ficava ilegível.
