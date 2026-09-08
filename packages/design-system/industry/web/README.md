# @industry/web

**33 componentes React do Industry — implementação própria, sem MUI e sem Emotion.** Tematizados por [`@industry/tokens`](../tokens/README.md) através de CSS custom properties.

📖 **[Storybook publicado](https://industry-web-ds.vercel.app)** — com regressão visual no Chromatic a cada push.

## Por que implementação própria

Envolver uma biblioteca de componentes resolve o começo e cobra o resto. Ou o vocabulário visual do sistema cabe no que a biblioteca expõe, ou você passa a lutar contra ela — sobrescrevendo estilos internos, contornando estrutura de DOM que não controla, carregando um runtime de CSS-in-JS por conta de um punhado de props.

O Industry tem um vocabulário específico: cantos retos, hairlines, marcas de registro nos cantos dos objetos emoldurados. Escrever os componentes direto contra os tokens saiu mais barato do que dobrar uma biblioteca para chegar nisso — e o pacote não carrega dependência de estilo nenhuma.

## Uso

```tsx
import { Frame, Button, TextField } from '@industry/web';
import '@industry/tokens/styles.css'; // os tokens são globais

<Frame>
  <TextField label="Nome" />
  <Button variant="primary">Salvar</Button>
</Frame>;
```

## Componentes

**Objetos de blueprint** — `Frame`, `BlueprintMarks`, `Duotone`, `Icon`

**Formulários** — `Button`, `TextField`, `SearchField`, `Select`, `Switch`, `Checkbox`, `RadioGroup`, `SegmentedControl`, `DatePicker`, `FileDrop`

**Layout e navegação** — `AppShell`, `Sidebar`, `TabBar`, `Tabs`, `Breadcrumbs`, `Menu`, `Popover`, `Sheet`, `Stepper`, `Accordion`

**Dados e feedback** — `DataTable`, `ListRow`, `Card`, `Badge`, `Progress`, `Skeleton`, `EmptyState`, `Toast`, `Tooltip`

Duas convenções que atravessam o conjunto:

- **`Frame` sempre traz as marcas.** A prop `marks` existe, mas o padrão é `true` e removê-las quebra a regra do sistema.
- **`Icon` usa `strokeWidth` 1.5, sempre.** Não há variação por tamanho. Por baixo é `lucide-react/dynamic`: um `import()` por glifo, cada ícone no seu próprio chunk, em vez de um bundle único com o conjunto inteiro.

## Fundações no Storybook

Seis páginas em `Foundations/*` — `Color`, `Typography`, `Semantics`, `Spacing & Elevation`, `Icons`, `Image` — cada uma renderizando os tokens reais de `@industry/tokens`, nunca um valor fixo copiado. Se um token mudar, a documentação muda junto.

Três `Templates/*` mostram os componentes compostos em telas de verdade: `LoginTemplate`, `ListDetailTemplate`, `MultiStepFormTemplate`.

## Desenvolvimento

```sh
yarn workspace @industry/web storybook        # dev em :6010
yarn workspace @industry/web test             # 155 testes
yarn workspace @industry/web build            # tsup → dist/index.{js,mjs,d.ts}
yarn workspace @industry/web build-storybook  # estático, usado pelo Chromatic e pelo Vercel
```

## Nota de status

Este pacote **não tem aplicação consumidora hoje** — o todo-app, que era o único, foi descontinuado. Segue mantido, testado e publicado: é a metade web do design system, e existe para quando a próxima aplicação web aparecer. Não é resíduo.
