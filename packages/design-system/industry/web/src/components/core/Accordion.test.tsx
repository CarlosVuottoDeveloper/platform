import { fireEvent, render, screen } from '@testing-library/react';
import { Accordion } from './Accordion';

const ITEMS = [
  { key: 'a', title: 'Item A', content: 'Conteúdo A' },
  { key: 'b', title: 'Item B', content: 'Conteúdo B' },
  { key: 'c', title: 'Item C', content: 'Conteúdo C', disabled: true },
];

describe('Accordion', () => {
  it('renders nothing when there are no items', () => {
    render(<Accordion />);
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  it('renders every item title, collapsed by default', async () => {
    render(<Accordion items={ITEMS} />);
    await screen.findByText('Item A');

    expect(screen.getByText('Item A')).toBeInTheDocument();
    expect(screen.getByText('Item B')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Item A' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('opens an item when its header is clicked', async () => {
    render(<Accordion items={ITEMS} />);
    const header = await screen.findByRole('button', { name: 'Item A' });

    fireEvent.click(header);

    expect(header).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Conteúdo A')).not.toHaveAttribute('aria-hidden');
  });

  it('closes an open item when its header is clicked again', async () => {
    render(<Accordion items={ITEMS} defaultOpenKeys={['a']} />);
    const header = await screen.findByRole('button', { name: 'Item A' });
    expect(header).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(header);

    expect(header).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes the previously open item when opening another (single mode)', async () => {
    render(<Accordion items={ITEMS} defaultOpenKeys={['a']} />);
    const headerA = await screen.findByRole('button', { name: 'Item A' });
    const headerB = screen.getByRole('button', { name: 'Item B' });

    fireEvent.click(headerB);

    expect(headerA).toHaveAttribute('aria-expanded', 'false');
    expect(headerB).toHaveAttribute('aria-expanded', 'true');
  });

  it('keeps multiple items open when multiple is set', async () => {
    render(<Accordion items={ITEMS} multiple defaultOpenKeys={['a']} />);
    const headerA = await screen.findByRole('button', { name: 'Item A' });
    const headerB = screen.getByRole('button', { name: 'Item B' });

    fireEvent.click(headerB);

    expect(headerA).toHaveAttribute('aria-expanded', 'true');
    expect(headerB).toHaveAttribute('aria-expanded', 'true');
  });

  it('does not toggle a disabled item', async () => {
    render(<Accordion items={ITEMS} />);
    const headerC = await screen.findByRole('button', { name: 'Item C' });

    expect(headerC).toBeDisabled();
    fireEvent.click(headerC);
    expect(headerC).toHaveAttribute('aria-expanded', 'false');
  });

  it('supports controlled open keys via onOpenKeysChange', async () => {
    const onOpenKeysChange = jest.fn();
    const { rerender } = render(
      <Accordion items={ITEMS} openKeys={[]} onOpenKeysChange={onOpenKeysChange} />,
    );
    const headerA = await screen.findByRole('button', { name: 'Item A' });

    fireEvent.click(headerA);
    expect(onOpenKeysChange).toHaveBeenCalledWith(['a']);
    expect(headerA).toHaveAttribute('aria-expanded', 'false');

    rerender(<Accordion items={ITEMS} openKeys={['a']} onOpenKeysChange={onOpenKeysChange} />);
    expect(headerA).toHaveAttribute('aria-expanded', 'true');
  });

  it('associates the panel with its header via aria-controls/aria-labelledby', async () => {
    render(<Accordion items={ITEMS} />);
    const headerA = await screen.findByRole('button', { name: 'Item A' });
    const panelId = headerA.getAttribute('aria-controls');
    const panel = document.getElementById(panelId as string);

    expect(panel).toHaveAttribute('aria-labelledby', headerA.id);
  });

  it('is a rounded surface without an outer rule or clipping', async () => {
    const { container } = render(<Accordion items={ITEMS} />);
    await screen.findByText('Item A');

    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveStyle({
      background: 'var(--color-surface)',
      borderRadius: 'var(--radius-md)',
    });
    expect(root.style.overflow).toBe('');
    expect(root.style.borderTop).toBe('');
  });

  it('separates sections with dividers but draws none under the last', async () => {
    render(<Accordion items={ITEMS} />);
    const section = async (name: string) =>
      (await screen.findByRole('button', { name })).closest('h3')?.parentElement as HTMLElement;

    expect(await section('Item A')).toHaveStyle({ borderBottom: '1px solid var(--color-divider)' });
    expect((await section('Item C')).style.borderBottom).toBe('');
  });

  it('gives every header at least the tap height', async () => {
    render(<Accordion items={ITEMS} />);

    expect(await screen.findByRole('button', { name: 'Item A' })).toHaveStyle({
      minHeight: 'var(--tap)',
    });
  });
});
