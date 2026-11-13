# @industry/mobile

**34 componentes React Native do Industry — implementação própria, sem React Native Paper.** Superfícies preenchidas e arredondadas, ações com gradiente e brilho, sobre um fundo azul-marinho profundo. Tematizados por [`@industry/tokens`](../tokens/README.md) via `StyleSheet.create`.

📖 **[Storybook publicado](https://industry-mobile-ds.vercel.app)** — roda via `react-native-web`, com regressão visual no Chromatic.

## Uso

```tsx
import { Button, Card, TextField } from '@industry/mobile';

<Card title="Novo projeto">
  <TextField label="Nome" />
  <Button variant="primary">Salvar</Button>
</Card>;
```

## Requisitos

- **`react-native >= 0.76` com a New Architecture.** O gradiente usa `experimental_backgroundImage` e o brilho usa `boxShadow`. Sem eles, as superfícies caem para um preenchimento sólido e não há brilho.
- **Android é a plataforma verificada.** Sombras e brilho no iOS não foram verificados.
- **Fonte Inter.** Os apps precisam carregá-la (família `Inter`, pesos 400, 500 e 600). Sem isso o texto cai para a fonte do sistema.
- **`react-native-svg`** como peer dependency, usado por `Icon`, `PieChart`, `RingProgress` e `AreaChart`. Num monorepo, provavelmente é preciso uma entrada em `nohoist` — veja a nota sobre resolução no final.

## Componentes

**Superfície base** — `GradientSurface`

**Mídia** — `Duotone`, `Icon`

**Formulários** — `Button`, `TextField`, `SearchField`, `Select`, `Switch`, `Checkbox`, `RadioGroup`, `SegmentedControl`, `DatePicker`, `FileDrop`

**Layout e navegação** — `AppBar`, `TabBar`, `Tabs`, `Breadcrumbs`, `Menu`, `Sheet`, `Stepper`, `Accordion`, `FAB`, `IconButton`

**Dados e feedback** — `DataTable`, `ListRow`, `Card`, `Badge`, `Chip`, `PieChart`, `RingProgress`, `AreaChart`, `StatTile`, `Progress`, `Skeleton`, `EmptyState`, `Toast`, `Tooltip`

No `PieChart` e no `RingProgress`, `centerLabel` precisa ser um elemento (por exemplo um `<Text>`): número ou texto solto dentro de uma `View` não é válido no React Native.

Em relação ao [`@industry/web`](../web/README.md), este conjunto troca `AppShell`, `Popover` e `Sidebar` — conceitos de janela grande — por `AppBar`, `Chip`, `FAB`, `IconButton` e `PieChart`.

### `GradientSurface`

Uma única `View` que desenha o gradiente (`variant`: `primary`, `surface` ou `backdrop`), o raio (`radius`) e, com `glow`, o brilho do acento. Ela **recorta os filhos** no raio (`overflow: 'hidden'`) e repassa as demais props de `View`; `style` vem por último.

O gradiente primário de `Button`, `FAB` e `IconButton` sólido é desenhado pelo próprio componente: um `backgroundColor` ou raio passado pelo consumidor **não** o repinta.

### `Button` e `selected`

`selected` marca o botão como selecionado: o estado é exposto a tecnologias assistivas e o botão ganha fundo, borda e rótulo próprios, sem o gradiente primário.

## Onde a plataforma muda a API

Paridade de nome não significa paridade de implementação. As diferenças são deliberadas e documentadas:

| Componente   | Diferença                                                                                                                                                                                                                                                           |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Icon`       | `name` em PascalCase (`"ArrowRight"`), convenção do `lucide-react-native` — o web usa kebab-case. `color` é **obrigatório**: RN não tem `currentColor`                                                                                                              |
| `Button`     | Só estado padrão e pressionado. `:hover` não existe em toque                                                                                                                                                                                                        |
| `Switch`     | `checked` / `onCheckedChange`, não o `value` / `onValueChange` do `Switch` nativo — evita colisão com o `value` de string do `RadioGroup` e do `SegmentedControl`. Desenhado à mão, porque o `Switch` do RN não dá controle sobre as dimensões quadradas do sistema |
| `RadioGroup` | Sem prop `name` — é amarração de formulário HTML, sem equivalente em RN. O anel "donut" do estado marcado vira um círculo sólido centralizado, já que `View` não tem sombra interna                                                                                 |
| `Duotone`    | **Aproximação documentada.** `mix-blend-mode: color` não existe em RN; aqui é uma sobreposição translúcida do acento. Tinge uniformemente em vez de preservar a luminância da foto por baixo                                                                        |

## Tema

O Industry tem uma única aparência. `useTheme()` devolve sempre `{ colors }` com a paleta dos tokens e não responde ao modo claro do sistema operacional.

## Fundações no Storybook

Seis páginas em `Foundations/*` renderizando os tokens reais (cores, `controlBorder`, os três gradientes, brilho, raios com `pill`, escala tipográfica), e três `Templates/*` com telas compostas — os mesmos do `@industry/web`, o que torna as duas plataformas comparáveis lado a lado.

> **Limitação conhecida — SVG:** não renderiza no preview do Storybook. `Icon`, `PieChart`, `RingProgress` e `AreaChart` montam sem erro e aparecem vazios, e há um banner visível nas stories afetadas. Não afeta o app real — Metro e Fabric renderizam SVG normalmente.

> **Limitação conhecida — gradiente:** o `react-native-web` do preview ignora `experimental_backgroundImage` e mostra a cor sólida de fallback. Stories de componentes que desenham gradiente levam o aviso. O gradiente e o brilho só aparecem no dispositivo.

## Desenvolvimento

```sh
yarn workspace @industry/mobile storybook        # dev em :6011
yarn workspace @industry/mobile test             # 410 testes, 40 suítes
yarn workspace @industry/mobile build            # tsup → dist/index.{js,mjs,d.ts}
yarn workspace @industry/mobile build-storybook  # estático, usado pelo Chromatic e pelo Vercel
```

Rode a partir da **raiz do monorepo**. De dentro do diretório do pacote, o Yarn v1 imprime a ajuda do `yarn workspace` em vez de executar o script.

## Nota sobre resolução de módulos

O Jest deste pacote fixa `react` e `react-native-svg` em uma única cópia via `moduleNameMapper`. O motivo é concreto: `lucide-react-native` traz um `react-native-svg` aninhado próprio. Mesma versão, caminho físico diferente — o suficiente para uma asserção de identidade de componente comparar duas coisas distintas e falhar.

Os apps enfrentam a mesma classe de problema em tempo de execução, e o `metro.config.js` de cada um resolve com o mesmo princípio. Lá o sintoma é pior: ícones e gráficos montam sem erro nenhum e simplesmente não desenham nada.
