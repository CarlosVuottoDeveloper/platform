# @industry/tokens

**A fonte única de verdade do Industry.** Um conjunto de valores, duas saídas: CSS custom properties para a web, constantes resolvidas para o nativo. Consumido por [`@industry/web`](../web/README.md), [`@industry/mobile`](../mobile/README.md) e diretamente pelo código dos apps.

Industry tem uma única aparência: escura, em tons de azul, com gradientes e brilho no acento. Não existe tema claro nem alternância de tema — `color-scheme: dark` é fixo e não há conjunto `light*` nos tokens.

## O problema que este pacote resolve

As cores são authored em OKLCH, com rampas geradas por luminosidade e croma. Isso é ótimo na web: `oklch()` e `color-mix(in srgb, ...)` são resolvidos pelo motor do browser em tempo real. React Native não resolve nenhum dos dois.

Por isso a origem não é nem o CSS nem o TypeScript: é `scripts/build-native-tokens.mjs`. Ele define os valores uma vez e escreve as duas saídas:

| Saída                             | Conteúdo                                                            |
| --------------------------------- | ------------------------------------------------------------------- |
| `src/native/colors.generated.ts`  | Cores resolvidas para hex/rgba via [`culori`](https://culorijs.org) |
| `src/native/effects.generated.ts` | `gradient` e `glow`                                                 |
| `src/tokens/colors.css`           | Cores, em OKLCH e `color-mix`, como custom properties               |
| `src/tokens/gradients.css`        | `--gradient-*` e `--glow-accent`                                    |

Os quatro arquivos são gerados e levam o aviso no topo: **nunca edite à mão**. Mudar uma cor é editar o gerador e rodar `yarn build`; as duas plataformas mudam juntas, por construção. Não há uma segunda lista de valores para alguém esquecer de atualizar.

Sombras (`src/tokens/effects.css` e `src/native/shadows.ts`), espaçamento, raios e tipografia não passam pelo gerador e são editados direto.

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
  gradient,
  glow,
  space,
  fontSize,
  alpha,
} from '@industry/tokens';
```

## Como ler as rampas

As rampas completas — `neutral`, `accentRamp`, `accent2Ramp`, nove passos cada — seguem:

| Passo       | Papel                                                                                                                           |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **100–200** | Tinta sobre preenchimentos tingidos                                                                                             |
| **300**     | O passo legível — tipo e ícones coloridos sobre o fundo escuro                                                                  |
| **400**     | O preenchimento — botões, barras, pontos, trilhos ativos. É o valor por trás de `color.accent`, `semanticColor.success` e afins |
| **500–800** | Passos mais escuros, usados nos gradientes e em superfícies tingidas                                                            |
| **900**     | A superfície tingida — fundo de tag, campo tênue                                                                                |

As rampas semânticas (`success`, `warning`, `danger`) são um subconjunto de cinco passos: `200`, `300`, `400`, `700`, `900`. O `200` cumpre ali o papel do `100`.

Prefira sempre um passo da rampa a montar uma cor translúcida ad-hoc. `alpha(hex, percent)` existe só para o que a rampa não cobre.

Para gráficos, seis séries em `viz['1']`…`viz['6']` — mesma luminosidade e croma, matiz espalhada. Atribua em ordem para manter gráficos comparáveis entre telas; eixos e gridlines usam `viz.grid`.

## Contraste

O gerador falha o build se um par de cores cair abaixo do mínimo. Os pares verificados:

| Par                                                                      | Mínimo |
| ------------------------------------------------------------------------ | ------ |
| `text` sobre `bg`, `surface` e `surface2`                                | 4.5    |
| `neutral[400]` sobre `bg` e `surface`                                    | 4.5    |
| `accentRamp[300]` sobre `bg` e `surface`                                 | 4.5    |
| `success[300]`, `warning[300]` e `danger[300]` sobre `surface`           | 4.5    |
| `text` sobre os dois extremos de `gradient.primary` e `gradient.surface` | 4.5    |
| `accentRamp[400]` sobre `bg`                                             | 3      |
| `controlBorder` sobre `bg`, `surface` e `surface2`                       | 3      |

Ao mudar uma cor, o build diz qual par quebrou e com qual razão.

### `controlBorder` e `divider`

`divider` e `dividerStrong` são mesclas alfa de `text` (8% e 16%) e servem apenas como separadores decorativos — linhas entre itens, divisórias de card. Sobre `bg` eles dão cerca de 1.2:1 de contraste, o que não basta para delimitar um controle.

O contorno de campos e controles interativos é `color.controlBorder` (`--color-control-border`), um passo opaco da rampa neutra (`neutral[600]`) com pelo menos 3:1 sobre `bg`, `surface` e `surface2`.

## Gradientes e brilho

`gradient` tem três entradas, cada uma com duas cores e um ângulo (todos 180°, de cima para baixo). Na web são `--gradient-primary`, `--gradient-surface` e `--gradient-backdrop`.

| Nome       | De                                 | Para              | Uso                             |
| ---------- | ---------------------------------- | ----------------- | ------------------------------- |
| `primary`  | `accentRamp[600]`                  | `accentRamp[800]` | Preenchimento de ação principal |
| `surface`  | `surface2`                         | `surface`         | Cards e painéis elevados        |
| `backdrop` | `accentRamp[800]` a 60% sobre `bg` | `bg`              | Fundo de tela                   |

`primary` começaria em `accentRamp[500]` e `accentRamp[700]`, mas `text` sobre o `500` dá 3.11:1, abaixo dos 4.5 exigidos; por isso os passos foram escurecidos para 600 e 800.

`glow.accent` é uma string de `box-shadow` — `0 8px 20px 0` com `accentRamp[500]` a 45% — usada tanto como `boxShadow` no React Native quanto como `--glow-accent` na web. Ela é uma string e não um `DropShadow` porque, no Android, `shadowColor`/`elevation` não desenham brilho colorido; a prop `boxShadow` do React Native desenha.

## O que não traduz 1:1 para o nativo

| Conceito                  | Na web                                                | No nativo                                                                                                                               |
| ------------------------- | ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Fonte mono                | `--font-mono`, uma pilha de sistema                   | `fontFamilyMono.ios` / `.android` — não é uma fonte para linkar                                                                         |
| Inter                     | `fonts.css` importa `Inter:wght@400;500;600`          | O app precisa carregar a fonte; `fontWeight` escolhe o peso                                                                             |
| Safe area                 | `env(safe-area-inset-*)`                              | `useSafeAreaInsets()` do `react-native-safe-area-context`, não um token estático                                                        |
| Anel hairline das sombras | `0 0 0 1px color-mix(...)` junto de cada `--shadow-*` | Não existe nas props `shadow*` do RN — aproxime com `borderWidth: 1` e `color.divider`                                                  |
| Elevação no Android       | —                                                     | `elevation` não aceita cor customizada; os tokens trazem um valor numérico aproximado ao lado dos campos `shadow*`, que só valem no iOS |
| Gradiente                 | `linear-gradient(...)`                                | `gradient.*.colors` e `angle` alimentam o componente de gradiente do app                                                                |

## Build

```sh
yarn workspace @industry/tokens build                   # gera tokens nativos e CSS, formata, empacota e emite dist/styles.css
yarn workspace @industry/tokens generate:native-tokens  # só a etapa de geração
```

O build passa o Prettier nos arquivos gerados logo após produzi-los; sem isso, rodar o gerador duas vezes deixaria diff cosmético na árvore.
