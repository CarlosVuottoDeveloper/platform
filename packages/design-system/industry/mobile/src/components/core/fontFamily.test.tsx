import { fireEvent, render } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { StyleSheet, Text } from 'react-native';
import type { ReactTestRendererJSON } from 'react-test-renderer';
import { viz } from '@industry/tokens';
import * as components from './index';
import {
  Accordion,
  AppBar,
  AreaChart,
  Badge,
  Breadcrumbs,
  Button,
  Card,
  Checkbox,
  Chip,
  DataTable,
  DatePicker,
  EmptyState,
  FileDrop,
  ListRow,
  Menu,
  PieChart,
  Progress,
  RadioGroup,
  SearchField,
  SegmentedControl,
  SectionLabel,
  Select,
  Sheet,
  StatTile,
  Stepper,
  Switch,
  TabBar,
  Tabs,
  TextField,
  Toast,
  Tooltip,
} from './index';

const TEXT_HOSTS = new Set(['Text', 'TextInput']);

function collectTextNodesWithoutFontFamily(node: ReactTestRendererJSON): string[] {
  const own =
    TEXT_HOSTS.has(node.type) && !StyleSheet.flatten(node.props.style)?.fontFamily
      ? [`${node.type} "${JSON.stringify(node.children)}"`]
      : [];
  const nested = (node.children ?? []).flatMap((child) =>
    typeof child === 'string' ? [] : collectTextNodesWithoutFontFamily(child),
  );
  return [...own, ...nested];
}

function textNodesWithoutFontFamily(tree: ReturnType<ReturnType<typeof render>['toJSON']>) {
  const roots = Array.isArray(tree) ? tree : tree ? [tree] : [];
  return roots.flatMap(collectTextNodesWithoutFontFamily);
}

function renderedTextCount(tree: ReturnType<ReturnType<typeof render>['toJSON']>): number {
  const count = (node: ReactTestRendererJSON): number =>
    (TEXT_HOSTS.has(node.type) ? 1 : 0) +
    (node.children ?? []).reduce(
      (sum, child) => sum + (typeof child === 'string' ? 0 : count(child)),
      0,
    );
  const roots = Array.isArray(tree) ? tree : tree ? [tree] : [];
  return roots.reduce((sum, node) => sum + count(node), 0);
}

const noop = () => undefined;
const LABEL = 'Rótulo';
const OPTIONS = ['Um', 'Dois'];
const TAB_ITEMS = [
  { id: 'a', label: 'Primeira', count: 3 },
  { id: 'b', label: 'Segunda' },
];

type Interaction = (screen: ReturnType<typeof render>) => void;

const CASES: [string, () => ReactElement, Interaction?][] = [
  [
    'Accordion',
    () => (
      <Accordion
        items={[{ key: 'a', title: 'Título', content: 'Conteúdo' }]}
        defaultOpenKeys={['a']}
      />
    ),
  ],
  ['AppBar', () => <AppBar title="Título" onBackPress={noop} />],
  [
    'AreaChart',
    () => (
      <AreaChart
        points={[
          { label: 'Seg', value: 3 },
          { label: 'Ter', value: 5 },
        ]}
      />
    ),
  ],
  ['Badge', () => <Badge>Novo</Badge>],
  [
    'Breadcrumbs',
    () => <Breadcrumbs items={[{ label: 'Início', onPress: noop }, { label: 'Atual' }]} />,
  ],
  ['Button', () => <Button>Salvar</Button>],
  ['Card', () => <Card kicker="Kicker" title="Título" body="Corpo" meta="Meta" />],
  ['Checkbox', () => <Checkbox label={LABEL} />],
  ['Chip', () => <Chip>Filtro</Chip>],
  [
    'DataTable',
    () => (
      <DataTable
        columns={[{ key: 'name', label: 'Nome' }]}
        rows={[{ name: 'Ana' }]}
        sort={{ key: 'name', dir: 'asc' }}
        onSort={noop}
        page={1}
        pageCount={2}
        onPage={noop}
        total={2}
      />
    ),
  ],
  [
    'DatePicker',
    () => (
      <DatePicker
        testID="picker"
        label={LABEL}
        hint="Dica"
        error="Erro"
        value={new Date(2026, 0, 15)}
      />
    ),
    (screen) => fireEvent.press(screen.getByTestId('picker')),
  ],
  ['EmptyState', () => <EmptyState title="Vazio" body="Nada por aqui" />],
  ['FileDrop', () => <FileDrop label="Arquivo" hint="Dica" error="Erro" />],
  ['ListRow', () => <ListRow title="Título" meta="Meta" />],
  [
    'Menu',
    () => (
      <Menu
        open
        header="Período"
        trigger={<Button>Abrir</Button>}
        items={[{ label: 'Editar', selected: true }, { label: 'Excluir' }]}
      />
    ),
  ],
  [
    'PieChart',
    () => (
      <PieChart
        centerLabel="Total"
        slices={[
          { label: 'A', value: 2, color: viz['1'] },
          { label: 'B', value: 1, color: viz['2'] },
        ]}
      />
    ),
  ],
  ['Progress', () => <Progress value={40} label={LABEL} showValue />],
  ['RadioGroup', () => <RadioGroup label={LABEL} options={OPTIONS} value="Um" />],
  ['SearchField', () => <SearchField value="busca" placeholder="Buscar" />],
  ['SegmentedControl', () => <SegmentedControl options={OPTIONS} value="Um" />],
  [
    'Select',
    () => (
      <Select testID="select" label={LABEL} hint="Dica" error="Erro" options={OPTIONS} value="Um" />
    ),
    (screen) => fireEvent.press(screen.getByTestId('select')),
  ],
  [
    'SectionLabel',
    () => (
      <SectionLabel trailing={<Text style={{ fontFamily: 'Inter' }}>3 itens</Text>}>
        Seção
      </SectionLabel>
    ),
  ],
  [
    'Sheet',
    () => (
      <Sheet open title="Título">
        Conteúdo
      </Sheet>
    ),
  ],
  ['StatTile', () => <StatTile value="12" label="Itens" />],
  ['Stepper', () => <Stepper steps={['Um', 'Dois']} current={1} />],
  ['Switch', () => <Switch label={LABEL} />],
  ['TabBar', () => <TabBar items={TAB_ITEMS} current="a" />],
  ['Tabs', () => <Tabs items={TAB_ITEMS} current="a" />],
  ['TextField', () => <TextField label={LABEL} hint="Dica" error="Erro" value="texto" />],
  ['Toast', () => <Toast title="Título">Descrição</Toast>],
  [
    'Tooltip',
    () => (
      <Tooltip testID="tip" label="Dica">
        <Button>Alvo</Button>
      </Tooltip>
    ),
    (screen) => fireEvent(screen.getByTestId('tip'), 'longPress'),
  ],
];

const WITHOUT_TEXT = [
  'Duotone',
  'FAB',
  'GradientSurface',
  'Icon',
  'IconButton',
  'RingProgress',
  'Skeleton',
  'Spinner',
  'defaultValueFormatter',
];

describe('every text node in the design system sets a fontFamily', () => {
  it.each(CASES.map(([name, element, interact]) => ({ name, element, interact })))(
    '$name',
    ({ element, interact }) => {
      const screen = render(element());
      interact?.(screen);
      const tree = screen.toJSON();
      expect(renderedTextCount(tree)).toBeGreaterThan(0);
      expect(textNodesWithoutFontFamily(tree)).toEqual([]);
    },
  );

  it('accounts for every exported component', () => {
    const covered = [...CASES.map(([name]) => name), ...WITHOUT_TEXT];
    expect(Object.keys(components).sort()).toEqual(covered.sort());
  });
});
