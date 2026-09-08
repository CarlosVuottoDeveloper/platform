# @industry/tokens

**A fonte única de verdade do Industry.** Um conjunto de valores, duas saídas: CSS custom properties para a web, constantes resolvidas para o nativo. Consumido por [`@industry/web`](../web/README.md), [`@industry/mobile`](../mobile/README.md) e diretamente pelo código dos apps.

Industry é um sistema de **blueprint sobre fundo escuro**. Não existe tema claro como produto — `color-scheme: dark` é fixo. Há um conjunto `light*` de espelhos nos tokens, usado apenas por superfícies que precisam inverter pontualmente.

## O problema que este pacote resolve

As cores são authored em OKLCH, com rampas geradas por luminosidade e croma. Isso é ótimo na web: `oklch()` e `color-mix(in srgb, ...)` são resolvidos pelo motor do browser em tempo real.

React Native não resolve nenhum dos dois.

Então `scripts/build-native-tokens.mjs` pega os mesmos valores de origem e os resolve — via [`culori`](https://culorijs.org) — para hex e rgba concretos, gerando `src/native/colors.generated.ts`. É arquivo gerado: **nunca edite à mão**, rode `yarn build` depois de mudar a origem.

O efeito prático é que uma mudança de cor é uma mudança nas duas plataformas ao mesmo tempo, por construção. Não há uma segunda lista de hex para alguém esquecer de atualizar.

## Uso

```ts
// Web — os tokens são globais, via CSS custom properties
import '@industry/tokens/styles.css';

// Mobile — constantes TypeScript
import {
  color,
  neutral,
  accentRamp,
  semanticColor,
  space,
  fontSize,
  alpha,
} from '@industry/tokens';
```

## Como ler as rampas

A leitura inverte em relação a um tema claro. As rampas completas — `neutral`, `accentRamp`, `accent2Ramp`, nove passos cada — seguem:

| Passo       | Papel                                                                                                                           |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **100–200** | Tinta sobre preenchimentos tingidos                                                                                             |
| **300**     | O passo legível — tipo e ícones coloridos sobre o grafite                                                                       |
| **400**     | O preenchimento — botões, barras, pontos, trilhos ativos. É o valor por trás de `color.accent`, `semanticColor.success` e afins |
| **900**     | A superfície tingida — fundo de tag, campo tênue                                                                                |

As rampas semânticas (`success`, `warning`, `danger`) são um subconjunto de cinco passos: `200`, `300`, `400`, `700`, `900`. O `200` cumpre ali o papel do `100`.

Prefira sempre um passo da rampa a montar uma cor translúcida ad-hoc. `alpha(hex, percent)` existe só para o que a rampa não cobre.

Para gráficos, seis séries em `viz['1']`…`viz['6']` — mesma luminosidade e croma, matiz espalhada. Atribua em ordem para manter gráficos comparáveis entre telas; eixos e gridlines usam `viz.grid`.

## A regra da tinta invertida

Nesta base não existe papel para inverter. **Não** use `--color-bg` / `color.bg` como se fosse o branco de um tema claro:

- Um campo cheio é o passo erguido do acento: `accentRamp['800']`.
- A tinta sobre esse campo é `color.text`.
- Hairlines e marcas de registro são mesclas alfa de `color.text` — nunca de `color.bg`.
- `color.bg` como primeiro plano só é correto em um lugar: tipo escuro sobre um preenchimento accent-400, como o botão primário ou um badge sólido.

## O que não traduz 1:1 para o nativo

| Conceito                  | Na web                                                | No nativo                                                                                                                               |
| ------------------------- | ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Fonte mono                | `--font-mono`, uma pilha de sistema                   | `fontFamilyMono.ios` / `.android` — não é uma fonte para linkar                                                                         |
| Safe area                 | `env(safe-area-inset-*)`                              | `useSafeAreaInsets()` do `react-native-safe-area-context`, não um token estático                                                        |
| Anel hairline das sombras | `0 0 0 1px color-mix(...)` junto de cada `--shadow-*` | Não existe nas props `shadow*` do RN — aproxime com `borderWidth: 1` e `color.divider`                                                  |
| Elevação no Android       | —                                                     | `elevation` não aceita cor customizada; os tokens trazem um valor numérico aproximado ao lado dos campos `shadow*`, que só valem no iOS |
| Raios                     | `--radius-sm/md/lg`                                   | Existem (`radii.*`), mas a camada de componentes usa cantos retos. Só recorra a eles saindo deliberadamente do vocabulário blueprint    |

## Build

```sh
yarn workspace @industry/tokens build                   # gera tokens nativos, formata, empacota e emite o CSS
yarn workspace @industry/tokens generate:native-tokens  # só a etapa de geração
```

O build passa o Prettier no arquivo gerado logo após produzi-lo. Sem esse passo, todo build sujava a árvore com um diff cosmético de 122 linhas — o gerador emite JSON com aspas duplas, a cópia versionada é formatada.
