import { fireEvent, render, screen } from '@testing-library/react';
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
    render(<DataTable columns={COLUMNS} rows={ROWS} />);

    expect(screen.getByRole('columnheader', { name: 'Nome' })).toBeInTheDocument();
    expect(screen.getByText('Ana')).toBeInTheDocument();
    expect(screen.getByText('Bruno')).toBeInTheDocument();
  });

  it('uses a custom cell renderer when given', () => {
    render(
      <DataTable
        columns={[{ key: 'name', label: 'Nome', render: (row) => `→ ${row.name}` }]}
        rows={ROWS}
      />,
    );

    expect(screen.getByText('→ Ana')).toBeInTheDocument();
  });

  it('renders a non-sortable column as plain text', () => {
    render(<DataTable columns={[{ key: 'name', label: 'Nome', sortable: false }]} rows={ROWS} />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByText('Nome')).toBeInTheDocument();
  });

  it('calls onSort with the column key and reflects aria-sort', () => {
    const onSort = jest.fn();
    render(
      <DataTable
        columns={COLUMNS}
        rows={ROWS}
        sort={{ key: 'name', dir: 'asc' }}
        onSort={onSort}
      />,
    );

    const button = screen.getByRole('button', { name: 'Nome' });
    expect(button).toHaveAttribute('aria-sort', 'ascending');

    fireEvent.click(button);
    expect(onSort).toHaveBeenCalledWith('name');
  });

  it('renders the toolbar when given', () => {
    render(<DataTable columns={COLUMNS} rows={ROWS} toolbar={<span>Buscar</span>} />);

    expect(screen.getByText('Buscar')).toBeInTheDocument();
  });

  it('omits pagination when there is only one page', () => {
    render(<DataTable columns={COLUMNS} rows={ROWS} pageCount={1} />);

    expect(screen.queryByText('Anterior')).not.toBeInTheDocument();
  });

  it('renders pagination, marks the current page and disables the edges', () => {
    render(<DataTable columns={COLUMNS} rows={ROWS} page={1} pageCount={3} />);

    expect(screen.getByRole('button', { name: 'Anterior' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Próxima' })).not.toBeDisabled();
    expect(screen.getByRole('button', { name: '1' })).toHaveAttribute('aria-current', 'page');
  });

  it('shows the total record count when given', () => {
    render(<DataTable columns={COLUMNS} rows={ROWS} pageCount={2} total={48} />);

    expect(screen.getByText('48 registros')).toBeInTheDocument();
  });

  it('shows the page count when total is not given', () => {
    render(<DataTable columns={COLUMNS} rows={ROWS} page={2} pageCount={5} />);

    expect(screen.getByText('Página 2 de 5')).toBeInTheDocument();
  });

  it('calls onPage with the requested page', () => {
    const onPage = jest.fn();
    render(<DataTable columns={COLUMNS} rows={ROWS} page={2} pageCount={3} onPage={onPage} />);

    fireEvent.click(screen.getByRole('button', { name: '3' }));

    expect(onPage).toHaveBeenCalledWith(3);
  });

  const surfaceOf = (container: HTMLElement) =>
    container.querySelector('table')?.parentElement as HTMLElement;

  it('draws the table inside a rounded surface that scrolls within a bounded parent', () => {
    const { container } = render(<DataTable columns={COLUMNS} rows={ROWS} />);
    const surface = surfaceOf(container);

    expect(surface.style.background).toBe('var(--color-surface)');
    expect(surface.style.borderRadius).toBe('var(--radius-lg)');
    expect(surface.style.overflow).toBe('auto');
    expect(surface.style.minHeight).toBe('0');
    expect((container.firstElementChild as HTMLElement).style.maxHeight).toBe('100%');
  });

  it('draws the header row on surface-2 in a quiet sentence-case label', () => {
    render(<DataTable columns={COLUMNS} rows={ROWS} />);
    const header = screen.getByRole('columnheader', { name: 'Nome' });

    expect(header.style.background).toBe('var(--color-surface-2)');
    expect(header.style.color).toBe('var(--color-neutral-400)');
    expect(header.style.fontSize).toBe('var(--text-h6)');
    expect(header.style.textTransform).toBe('');
    expect(header.style.position).toBe('sticky');
  });

  it('gives sortable and plain headers the same minimum height', () => {
    render(
      <DataTable
        columns={[
          { key: 'name', label: 'Nome' },
          { key: 'role', label: 'Cargo', sortable: false },
        ]}
        rows={ROWS}
        onSort={jest.fn()}
      />,
    );

    expect(screen.getByRole('columnheader', { name: 'Nome' }).style.height).toBe('var(--tap)');
    expect(screen.getByRole('columnheader', { name: 'Cargo' }).style.height).toBe('var(--tap)');
    expect(screen.getByRole('button', { name: 'Nome' }).style.minHeight).toBe('var(--tap)');
  });

  it('renders every header as plain text when no sorting is wired', () => {
    render(<DataTable columns={COLUMNS} rows={ROWS} />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('keeps the active sort header in the accent and tints the others on hover', () => {
    render(
      <DataTable
        columns={COLUMNS}
        rows={ROWS}
        sort={{ key: 'name', dir: 'desc' }}
        onSort={jest.fn()}
      />,
    );
    const active = screen.getByRole('button', { name: 'Nome' });
    const other = screen.getByRole('button', { name: 'Cargo' });

    expect(active.style.color).toBe('var(--color-accent-200)');
    expect(other.style.color).toBe('inherit');

    fireEvent.mouseEnter(other);
    expect(other.style.color).toBe('var(--color-text)');
    fireEvent.mouseLeave(other);
    expect(other.style.color).toBe('inherit');
  });

  it('draws row dividers except after the last row', () => {
    render(<DataTable columns={COLUMNS} rows={ROWS} />);

    expect((screen.getByText('Ana') as HTMLElement).style.borderBottomWidth).toBe('1px');
    expect((screen.getByText('Ana') as HTMLElement).style.borderBottomColor).toBe(
      'var(--color-divider)',
    );
    expect((screen.getByText('Bruno') as HTMLElement).style.borderBottomWidth).toBe('');
  });

  it('tints a row on hover', () => {
    render(<DataTable columns={COLUMNS} rows={ROWS} />);
    const row = screen.getByText('Ana').closest('tr') as HTMLElement;

    fireEvent.mouseEnter(row);
    expect(row.style.background).toBe('color-mix(in srgb, var(--color-text) 8%, transparent)');
    fireEvent.mouseLeave(row);
    expect(row.style.background).toBe('transparent');
  });

  it('wraps the pager and draws pill page buttons', () => {
    render(<DataTable columns={COLUMNS} rows={ROWS} page={2} pageCount={3} />);
    const current = screen.getByRole('button', { name: '2' });
    const other = screen.getByRole('button', { name: '3' });

    expect((current.parentElement as HTMLElement).style.flexWrap).toBe('wrap');
    expect(current.style.borderRadius).toBe('var(--radius-pill)');
    expect(current.style.background).toBe('var(--color-accent)');
    expect(current.style.color).toBe('var(--color-bg)');
    expect(other.style.borderColor).toBe('var(--color-control-border)');
    expect(other.style.minHeight).toBe('var(--tap)');
    expect(other.style.minWidth).toBe('var(--tap)');
  });

  it('tints an idle page button on hover and press', () => {
    render(<DataTable columns={COLUMNS} rows={ROWS} page={2} pageCount={3} />);
    const other = screen.getByRole('button', { name: '3' });

    fireEvent.mouseEnter(other);
    expect(other.style.background).toBe('color-mix(in srgb, var(--color-text) 8%, transparent)');
    fireEvent.mouseDown(other);
    expect(other.style.background).toBe('color-mix(in srgb, var(--color-text) 14%, transparent)');
    fireEvent.mouseUp(other);
    fireEvent.mouseLeave(other);
    expect(other.style.background).toBe('transparent');
  });
});
