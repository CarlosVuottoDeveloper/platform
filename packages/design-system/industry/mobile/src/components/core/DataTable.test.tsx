import { fireEvent, render } from '@testing-library/react-native';
import { StyleSheet, Text } from 'react-native';
import { accentRamp, color, control, neutral, radii } from '@industry/tokens';
import { DataTable } from './DataTable';

const COLUMNS = [
  { key: 'name', label: 'Nome' },
  { key: 'role', label: 'Cargo' },
];
const ROWS = [
  { id: 1, name: 'Ana', role: 'Engenheira' },
  { id: 2, name: 'Bruno', role: 'Designer' },
];

describe('DataTable', () => {
  it('renders column headers and row cells', () => {
    const { getByText } = render(<DataTable columns={COLUMNS} rows={ROWS} />);

    expect(getByText('Nome')).toBeTruthy();
    expect(getByText('Ana')).toBeTruthy();
    expect(getByText('Bruno')).toBeTruthy();
  });

  it('defaults to no columns and no rows', () => {
    const { queryByText } = render(<DataTable />);

    expect(queryByText('Nome')).toBeNull();
  });

  it('applies a fixed column width instead of flexing', () => {
    const { getByText } = render(
      <DataTable columns={[{ key: 'name', label: 'Nome', width: 120 }]} rows={ROWS} />,
    );

    expect(getByText('Nome')).toBeTruthy();
    expect(getByText('Ana')).toBeTruthy();
  });

  it('falls back to the row index as a key when id is missing', () => {
    const { getByText } = render(
      <DataTable columns={COLUMNS} rows={[{ name: 'Sem id', role: 'Convidado' }]} />,
    );

    expect(getByText('Sem id')).toBeTruthy();
  });

  it('uses a custom cell renderer that returns a plain string', () => {
    const { getByText } = render(
      <DataTable
        columns={[{ key: 'name', label: 'Nome', render: (row) => `→ ${row.name}` }]}
        rows={ROWS}
      />,
    );

    expect(getByText('→ Ana')).toBeTruthy();
  });

  it('uses a custom cell renderer that returns a React element as-is', () => {
    const { getByText } = render(
      <DataTable
        columns={[{ key: 'name', label: 'Nome', render: (row) => <Text>el:{row.name}</Text> }]}
        rows={ROWS}
      />,
    );

    expect(getByText('el:Ana')).toBeTruthy();
  });

  it('renders a non-sortable column as plain text with no button role', () => {
    const { getByText, queryByTestId } = render(
      <DataTable columns={[{ key: 'name', label: 'Nome', sortable: false }]} rows={ROWS} />,
    );

    expect(queryByTestId('sort-header-name')).toBeNull();
    expect(getByText('Nome')).toBeTruthy();
  });

  it('calls onSort with the column key and reflects the selected state', () => {
    const onSort = jest.fn();
    const { getByTestId } = render(
      <DataTable
        columns={COLUMNS}
        rows={ROWS}
        sort={{ key: 'name', dir: 'asc' }}
        onSort={onSort}
      />,
    );

    const header = getByTestId('sort-header-name');
    expect(header.props.accessibilityState).toMatchObject({ selected: true });

    fireEvent.press(header);
    expect(onSort).toHaveBeenCalledWith('name');
  });

  it('shows the descending sort indicator when dir is desc', () => {
    const { getByTestId } = render(
      <DataTable
        columns={COLUMNS}
        rows={ROWS}
        sort={{ key: 'name', dir: 'desc' }}
        onSort={jest.fn()}
      />,
    );

    expect(getByTestId('sort-header-name').props.accessibilityState).toMatchObject({
      selected: true,
    });
  });

  it('renders the toolbar when given', () => {
    const { getByText } = render(
      <DataTable columns={COLUMNS} rows={ROWS} toolbar={<Text>Buscar</Text>} />,
    );

    expect(getByText('Buscar')).toBeTruthy();
  });

  it('omits pagination when there is only one page', () => {
    const { queryByText } = render(<DataTable columns={COLUMNS} rows={ROWS} pageCount={1} />);

    expect(queryByText('Anterior')).toBeNull();
  });

  it('renders pagination, marks the current page and disables the edges', () => {
    const { getByTestId } = render(
      <DataTable columns={COLUMNS} rows={ROWS} page={1} pageCount={3} />,
    );

    expect(getByTestId('pager-btn-Anterior').props.accessibilityState).toMatchObject({
      disabled: true,
    });
    expect(getByTestId('pager-btn-Próxima').props.accessibilityState).toMatchObject({
      disabled: false,
    });
    expect(getByTestId('pager-btn-1').props.accessibilityState).toMatchObject({ selected: true });
  });

  it('shows the total record count when given', () => {
    const { getByText } = render(
      <DataTable columns={COLUMNS} rows={ROWS} pageCount={2} total={48} />,
    );

    expect(getByText('48 registros')).toBeTruthy();
  });

  it('shows the page count when total is not given', () => {
    const { getByText } = render(
      <DataTable columns={COLUMNS} rows={ROWS} page={2} pageCount={5} />,
    );

    expect(getByText('Página 2 de 5')).toBeTruthy();
  });

  it('calls onPage with the requested page', () => {
    const onPage = jest.fn();
    const { getByTestId } = render(
      <DataTable columns={COLUMNS} rows={ROWS} page={2} pageCount={3} onPage={onPage} />,
    );

    fireEvent.press(getByTestId('pager-btn-3'));

    expect(onPage).toHaveBeenCalledWith(3);
  });

  it('calls onPage with the previous page when Anterior is pressed', () => {
    const onPage = jest.fn();
    const { getByTestId } = render(
      <DataTable columns={COLUMNS} rows={ROWS} page={2} pageCount={3} onPage={onPage} />,
    );

    fireEvent.press(getByTestId('pager-btn-Anterior'));

    expect(onPage).toHaveBeenCalledWith(1);
  });

  it('calls onPage with the next page when Próxima is pressed', () => {
    const onPage = jest.fn();
    const { getByTestId } = render(
      <DataTable columns={COLUMNS} rows={ROWS} page={2} pageCount={3} onPage={onPage} />,
    );

    fireEvent.press(getByTestId('pager-btn-Próxima'));

    expect(onPage).toHaveBeenCalledWith(3);
  });
});

const grant = {
  nativeEvent: { touches: [], changedTouches: [], timestamp: 0 },
  persist: jest.fn(),
};

describe('DataTable look', () => {
  const flat = (node: { props: { style?: unknown } }) =>
    StyleSheet.flatten(node.props.style as never) as Record<string, unknown>;

  it('draws a clipped rounded surface around the header and rows', () => {
    const { getByTestId } = render(<DataTable columns={COLUMNS} rows={ROWS} testID="table" />);

    expect(flat(getByTestId('table-surface'))).toMatchObject({
      backgroundColor: color.surface,
      borderRadius: radii.lg,
      overflow: 'hidden',
    });
  });

  it('puts the header row on surface2 with sentence-case muted labels', () => {
    const { getByTestId, getByText } = render(
      <DataTable
        columns={COLUMNS}
        rows={ROWS}
        sort={{ key: 'name', dir: 'asc' }}
        testID="table"
        onSort={jest.fn()}
      />,
    );

    expect(flat(getByTestId('table-header')).backgroundColor).toBe(color.surface2);
    const label = flat(getByText('Cargo'));
    expect(label.color).toBe(neutral['400']);
    expect(label.textTransform).toBeUndefined();
    expect(label.letterSpacing).toBeUndefined();
    expect(flat(getByText('Nome')).color).toBe(accentRamp['200']);
  });

  it('separates rows with the divider color and leaves the last row without one', () => {
    const { getByTestId } = render(<DataTable columns={COLUMNS} rows={ROWS} testID="table" />);

    expect(flat(getByTestId('table-row-0'))).toMatchObject({
      borderBottomWidth: 1,
      borderBottomColor: color.divider,
    });
    expect(flat(getByTestId('table-row-1')).borderBottomWidth).toBeUndefined();
  });

  it('gives sortable headers a tap-size target and press feedback', () => {
    const { getByTestId } = render(
      <DataTable columns={COLUMNS} rows={ROWS} onSort={jest.fn()} testID="table" />,
    );
    const header = getByTestId('sort-header-name');

    expect(flat(header).minHeight).toBe(control.tap);
    expect(flat(header).opacity).toBe(1);
    fireEvent(header, 'responderGrant', grant);
    expect(flat(getByTestId('sort-header-name')).opacity).toBeLessThan(1);
  });

  it('renders the pager buttons as pills with readable text on the current page', () => {
    const { getByTestId, getByText } = render(
      <DataTable columns={COLUMNS} rows={ROWS} page={1} pageCount={2} testID="table" />,
    );

    expect(flat(getByTestId('pager-btn-1'))).toMatchObject({
      borderRadius: radii.pill,
      backgroundColor: color.accent,
      minHeight: control.tap,
    });
    expect(flat(getByText('1')).color).toBe(color.bg);
    expect(flat(getByTestId('pager-btn-2')).borderColor).toBe(color.controlBorder);
  });

  it('lets the surface shrink so the list scrolls inside a bounded table', () => {
    const { getByTestId } = render(
      <DataTable columns={COLUMNS} rows={ROWS} testID="table" style={{ flex: 1 }} />,
    );

    expect(flat(getByTestId('table-surface')).flexShrink).toBe(1);
  });

  it('gives sortable and plain header labels the same minimum height', () => {
    const { getByTestId, getByText } = render(
      <DataTable
        columns={[
          { key: 'name', label: 'Nome' },
          { key: 'role', label: 'Cargo', sortable: false },
        ]}
        rows={ROWS}
        onSort={jest.fn()}
      />,
    );

    expect(flat(getByTestId('sort-header-name')).minHeight).toBe(control.tap);
    expect(flat(getByText('Cargo').parent!.parent!).minHeight).toBe(control.tap);
  });

  it('lets the pager wrap onto a second line with the count on its own line', () => {
    const { getByTestId, getByText } = render(
      <DataTable columns={COLUMNS} rows={ROWS} page={1} pageCount={5} total={48} testID="table" />,
    );

    expect(flat(getByTestId('table-pager'))).toMatchObject({ flexWrap: 'wrap' });
    expect(flat(getByText('48 registros')).flexBasis).toBe('100%');
  });

  it('derives internal ids from testID and renders none without it', () => {
    const { queryByTestId, rerender, getByTestId } = render(
      <DataTable columns={COLUMNS} rows={ROWS} />,
    );
    expect(queryByTestId('table-surface')).toBeNull();
    expect(queryByTestId('table-header')).toBeNull();
    expect(queryByTestId('table-row-0')).toBeNull();

    rerender(<DataTable columns={COLUMNS} rows={ROWS} testID="table" />);
    expect(getByTestId('table')).toBeTruthy();
    expect(getByTestId('table-surface')).toBeTruthy();
    expect(getByTestId('table-header')).toBeTruthy();
    expect(getByTestId('table-row-1')).toBeTruthy();
  });

  it('renders a plain label, not a button, when there is no onSort', () => {
    const { queryByTestId, getByText } = render(<DataTable columns={COLUMNS} rows={ROWS} />);

    expect(queryByTestId('sort-header-name')).toBeNull();
    expect(getByText('Nome')).toBeTruthy();
  });
});
