---
'@industry/tokens': minor
'@industry/mobile': minor
'@industry/web': minor
---

Industry passa a ter uma única aparência e uma nova paleta, que já aparece nos componentes. O tema claro deixa de existir.

`@industry/mobile`: `useTheme` passa a retornar o tema único; `ThemePreference` e os exports do tema claro foram removidos, assim como o peer dependency de `@react-native-async-storage/async-storage`. `@industry/web`: `useTheme` removido.

`@industry/tokens`: novos valores e novos tokens disponíveis — raios (`radii`, incluindo `pill`), alturas de controle (48/40), escala tipográfica, `gradient`, `glow` (string de `boxShadow`) e `color.controlBorder`. Os componentes passam a adotá-los nas próximas versões; por enquanto o visual dos componentes muda apenas pela paleta.

A família tipográfica dos tokens passa a ser Inter. Os apps precisam carregar a fonte; até lá o texto cai para a fonte do sistema.

`colors.css` e `gradients.css` passam a ser gerados por `scripts/build-tokens.mjs`.
