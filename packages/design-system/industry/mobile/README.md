# @industry/mobile

**35 componentes React Native do Industry — implementação própria, sem React Native Paper.** Tematizados por [`@industry/tokens`](../tokens/README.md) via `StyleSheet.create`.

📖 **[Storybook publicado](https://industry-mobile-ds.vercel.app)** — roda via `react-native-web`, com regressão visual no Chromatic.

## Uso

```tsx
import { Frame, Button, TextField } from '@industry/mobile';

<Frame>
  <TextField label="Nome" />
  <Button variant="primary">Salvar</Button>
</Frame>;
```

`Icon` e `PieChart` dependem de `react-native-svg` como peer dependency. Apps que consomem este pacote precisam declará-lo e, num monorepo, provavelmente adicionar uma entrada em `nohoist` — veja a nota sobre resolução no final.

## Componentes

**Objetos de blueprint** — `Frame`, `BlueprintMarks`, `Duotone`, `Icon`

**Formulários** — `Button`, `TextField`, `SearchField`, `Select`, `Switch`, `Checkbox`, `RadioGroup`, `SegmentedControl`, `DatePicker`, `FileDrop`

**Layout e navegação** — `AppBar`, `TabBar`, `Tabs`, `Breadcrumbs`, `Menu`, `Sheet`, `Stepper`, `Accordion`, `FAB`, `IconButton`

**Dados e feedback** — `DataTable`, `ListRow`, `Card`, `Badge`, `Chip`, `PieChart`, `Progress`, `Skeleton`, `EmptyState`, `Toast`, `Tooltip`

Em relação ao [`@industry/web`](../web/README.md), este conjunto troca `AppShell`, `Popover` e `Sidebar` — conceitos de janela grande — por `AppBar`, `Chip`, `FAB`, `IconButton` e `PieChart`.

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

`useTheme()` segue a aparência do sistema operacional por padrão e, num aparelho em modo claro, cai para a paleta clara — mesmo o Industry não tendo tema claro como produto. **Os dois apps deste monorepo fixam a preferência em escuro no `App.tsx`, e qualquer novo consumidor precisa fazer o mesmo.**

## Fundações no Storybook

Seis páginas em `Foundations/*` renderizando os tokens reais, e três `Templates/*` com telas compostas — os mesmos do `@industry/web`, o que torna as duas plataformas comparáveis lado a lado.

> **Limitação conhecida:** SVG não renderiza no preview do Storybook. `Icon` e `PieChart` montam sem erro e aparecem vazios, e há um banner visível nas stories afetadas. Não afeta o app real — Metro e Fabric renderizam SVG normalmente. `Frame` não usa SVG e não é afetado.

## Desenvolvimento

```sh
yarn workspace @industry/mobile storybook        # dev em :6011
yarn workspace @industry/mobile test             # 289 testes, 37 suítes
yarn workspace @industry/mobile build            # tsup → dist/index.{js,mjs,d.ts}
yarn workspace @industry/mobile build-storybook  # estático, usado pelo Chromatic e pelo Vercel
```

Rode a partir da **raiz do monorepo**. De dentro do diretório do pacote, o Yarn v1 imprime a ajuda do `yarn workspace` em vez de executar o script.

## Nota sobre resolução de módulos

O Jest deste pacote fixa `react` e `react-native-svg` em uma única cópia via `moduleNameMapper`. O motivo é concreto: `lucide-react-native` traz um `react-native-svg` aninhado próprio. Mesma versão, caminho físico diferente — o suficiente para uma asserção de identidade de componente comparar duas coisas distintas e falhar.

Os apps enfrentam a mesma classe de problema em tempo de execução, e o `metro.config.js` de cada um resolve com o mesmo princípio. Lá o sintoma é pior: ícones e gráficos montam sem erro nenhum e simplesmente não desenham nada.
