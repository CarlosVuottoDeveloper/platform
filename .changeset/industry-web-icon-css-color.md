---
'@industry/web': patch
---

`Icon`: a prop `color` passa a pintar o ícone via CSS `color`, com `stroke="currentColor"`. O atributo `stroke` do SVG não resolve variáveis CSS, então cores como `var(--viz-1)` eram ignoradas e o ícone ficava na cor do texto.

O que muda para quem usa:

- `color` aceita só cores CSS. Pinturas exclusivas de SVG (`url(#gradiente)`, `none`, `context-stroke`) deixam de ter efeito.
- Um `style.color` passado junto prevalece sobre a prop `color`.
