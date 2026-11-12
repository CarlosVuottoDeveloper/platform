import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Menu } from './Menu';

const ITEMS = [
  { key: 'edit', label: 'Editar', onSelect: jest.fn() },
  { key: 'delete', label: 'Excluir', onSelect: jest.fn(), disabled: true },
];

describe('Menu', () => {
  it('is closed by default', () => {
    render(<Menu trigger="Ações" items={ITEMS} />);

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('opens and lists every item when the trigger is clicked', () => {
    render(<Menu trigger="Ações" items={ITEMS} />);

    fireEvent.click(screen.getByText('Ações'));

    expect(screen.getByRole('menuitem', { name: 'Editar' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Excluir' })).toBeInTheDocument();
  });

  it('calls onSelect and closes when an item is clicked', () => {
    const onSelect = jest.fn();
    render(<Menu trigger="Ações" items={[{ label: 'Editar', onSelect }]} />);

    fireEvent.click(screen.getByText('Ações'));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Editar' }));

    expect(onSelect).toHaveBeenCalled();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('does not call onSelect for a disabled item', () => {
    const onSelect = jest.fn();
    render(<Menu trigger="Ações" items={[{ label: 'Excluir', onSelect, disabled: true }]} />);

    fireEvent.click(screen.getByText('Ações'));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Excluir' }));

    expect(onSelect).not.toHaveBeenCalled();
  });

  it('closes when clicking outside without selecting anything', () => {
    render(
      <div>
        <Menu trigger="Ações" items={ITEMS} />
        <button type="button">Fora</button>
      </div>,
    );

    fireEvent.click(screen.getByText('Ações'));
    fireEvent.mouseDown(screen.getByText('Fora'));

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('supports controlled open state', () => {
    const onOpenChange = jest.fn();
    const { rerender } = render(
      <Menu trigger="Ações" items={ITEMS} open={false} onOpenChange={onOpenChange} />,
    );

    fireEvent.click(screen.getByText('Ações'));
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();

    rerender(<Menu trigger="Ações" items={ITEMS} open={true} onOpenChange={onOpenChange} />);
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('renders with no items', () => {
    render(<Menu trigger="Ações" />);

    fireEvent.click(screen.getByText('Ações'));

    expect(screen.getByRole('menu')).toBeEmptyDOMElement();
  });

  it('renders the panel as a rounded surface-2 card', () => {
    render(<Menu trigger="Ações" items={ITEMS} />);
    fireEvent.click(screen.getByText('Ações'));

    expect(screen.getByRole('dialog')).toHaveStyle({
      background: 'var(--color-surface-2)',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-md)',
      overflow: 'hidden',
    });
  });

  it('shows a hovered row on a background distinct from the panel', () => {
    render(<Menu trigger="Ações" items={ITEMS} />);
    fireEvent.click(screen.getByText('Ações'));
    const row = screen.getByRole('menuitem', { name: 'Editar' });
    expect(row.style.background).toBe('transparent');

    fireEvent.mouseEnter(row);

    expect(row.style.background).toBe('color-mix(in srgb, var(--color-text) 8%, transparent)');
    expect(row.style.background).not.toBe(screen.getByRole('dialog').style.background);
  });

  it('gives every row at least the tap height', () => {
    render(<Menu trigger="Ações" items={ITEMS} />);
    fireEvent.click(screen.getByText('Ações'));

    expect(screen.getByRole('menuitem', { name: 'Editar' })).toHaveStyle({
      minHeight: 'var(--tap)',
    });
  });

  it('renders the header above the items without caps or tracking', () => {
    render(<Menu trigger="Ações" header="Período" items={ITEMS} />);
    fireEvent.click(screen.getByText('Ações'));

    const header = screen.getByText('Período');
    expect(header.style.textTransform).toBe('');
    expect(header.style.letterSpacing).toBe('');
  });

  it('does not render a header by default', () => {
    render(<Menu trigger="Ações" items={ITEMS} />);
    fireEvent.click(screen.getByText('Ações'));

    expect(screen.getByRole('menu').children).toHaveLength(ITEMS.length);
  });

  it('marks the selected item with a checkmark and a translucent accent fill', async () => {
    render(
      <Menu
        trigger="Ações"
        items={[
          { key: 'a', label: 'A', selected: true },
          { key: 'b', label: 'B' },
        ]}
      />,
    );
    fireEvent.click(screen.getByText('Ações'));
    const selected = screen.getByRole('menuitem', { name: 'A' });
    const other = screen.getByRole('menuitem', { name: 'B' });

    expect(selected).toHaveAttribute('aria-current', 'true');
    expect(other).not.toHaveAttribute('aria-current');
    expect(selected.style.background).toBe(
      'color-mix(in srgb, var(--color-accent) 22%, transparent)',
    );
    expect(selected).toHaveStyle({ color: 'var(--color-accent-300)' });
    await waitFor(() => expect(selected.querySelector('svg')).not.toBeNull());
    expect(other.querySelector('svg')).toBeNull();
  });
});
