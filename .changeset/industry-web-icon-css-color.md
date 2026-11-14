---
'@industry/web': patch
---

`Icon`: a prop `color` passa a pintar o ícone via `style`. O atributo `stroke` do SVG não resolve variáveis CSS, então cores como `var(--viz-1)` eram ignoradas e o ícone ficava na cor do texto.
