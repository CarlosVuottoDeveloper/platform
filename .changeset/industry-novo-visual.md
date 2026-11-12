---
'@industry/tokens': minor
'@industry/mobile': minor
'@industry/web': minor
---

Industry passa a ter uma única aparência, com nova paleta, Inter como fonte, raios maiores, controles de 48dp e tokens de gradiente e brilho.

`@industry/tokens`: novos `gradient`, `glow` (string de `boxShadow`) e `color.controlBorder`; raios, alturas de controle, tipografia e sombras redefinidos; `colors.css` e `gradients.css` passam a ser gerados por `scripts/build-native-tokens.mjs`; conjunto `light*` removido.

`@industry/mobile`: `useTheme` passa a retornar o tema único, `ThemePreference` e os exports do tema claro foram removidos e o peer dependency de `@react-native-async-storage/async-storage` deixou de existir.

`@industry/web`: `useTheme` removido.
