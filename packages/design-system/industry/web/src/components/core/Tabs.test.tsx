import { fireEvent, render, screen } from '@testing-library/react';
import { Tabs } from './Tabs';

const ITEMS = [
  { id: 'overview', label: 'Visão geral' },
  { id: 'settings', label: 'Configurações' },
];

describe('Tabs', () => {
  it('renders every tab', () => {
    render(<Tabs items={ITEMS} />);

    expect(screen.getByRole('tab', { name: 'Visão geral' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Configurações' })).toBeInTheDocument();
  });

  it('marks the current tab as selected', () => {
    render(<Tabs items={ITEMS} current="settings" />);

    expect(screen.getByRole('tab', { name: 'Configurações' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByRole('tab', { name: 'Visão geral' })).toHaveAttribute(
      'aria-selected',
      'false',
    );
  });

  it('calls onSelect with the clicked tab id', () => {
    const onSelect = jest.fn();
    render(<Tabs items={ITEMS} onSelect={onSelect} />);

    fireEvent.click(screen.getByRole('tab', { name: 'Configurações' }));

    expect(onSelect).toHaveBeenCalledWith('settings');
  });

  it('renders a count badge when given', () => {
    render(<Tabs items={[{ id: 'activity', label: 'Atividade', count: 3 }]} />);

    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('accepts plain string items', () => {
    render(<Tabs items={['Início']} />);

    expect(screen.getByRole('tab', { name: 'Início' })).toBeInTheDocument();
  });

  it('resolves hover state on mouse enter and leave', () => {
    render(<Tabs items={ITEMS} />);
    const tab = screen.getByRole('tab', { name: 'Visão geral' });

    fireEvent.mouseEnter(tab);
    fireEvent.mouseLeave(tab);

    expect(tab).toBeInTheDocument();
  });

  const surfaceOf = (tab: HTMLElement) =>
    tab.querySelector('[aria-hidden="true"]') as HTMLElement | null;

  it('wraps the tabs in a surface pill tablist', () => {
    render(<Tabs items={ITEMS} />);
    const list = screen.getByRole('tablist');

    expect(list.style.background).toBe('var(--color-surface)');
    expect(list.style.borderRadius).toBe('var(--radius-pill)');
  });

  it('puts the selected tab on the primary surface without a glow', () => {
    render(<Tabs items={ITEMS} current="settings" />);
    const surface = surfaceOf(screen.getByRole('tab', { name: 'Configurações' })) as HTMLElement;

    expect(surface.style.background).toBe('var(--gradient-primary) border-box no-repeat');
    expect(surface.style.boxShadow).toBe('');
    expect(surfaceOf(screen.getByRole('tab', { name: 'Visão geral' }))).toBeNull();
  });

  it('colours the selected label with the text colour and the others neutral', () => {
    render(<Tabs items={ITEMS} current="settings" />);

    expect((screen.getByText('Configurações').parentElement as HTMLElement).style.color).toBe(
      'var(--color-text)',
    );
    expect((screen.getByText('Visão geral').parentElement as HTMLElement).style.color).toBe(
      'var(--color-neutral-400)',
    );
  });

  it('tints an unselected tab on hover and press', () => {
    render(<Tabs items={ITEMS} current="settings" />);
    const tab = screen.getByRole('tab', { name: 'Visão geral' });

    fireEvent.mouseEnter(tab);
    expect(tab.style.background).toBe('color-mix(in srgb, var(--color-text) 8%, transparent)');
    fireEvent.mouseDown(tab);
    expect(tab.style.background).toBe('color-mix(in srgb, var(--color-text) 14%, transparent)');
    fireEvent.mouseUp(tab);
    fireEvent.mouseLeave(tab);
    expect(tab.style.background).toBe('transparent');
  });

  it('draws the count as a small surface-2 pill', () => {
    render(<Tabs items={[{ id: 'a', label: 'Atividade', count: 3 }]} />);
    const count = screen.getByText('3');

    expect(count.style.background).toBe('var(--color-surface-2)');
    expect(count.style.color).toBe('var(--color-neutral-200)');
    expect(count.style.borderRadius).toBe('var(--radius-pill)');
  });

  it('renders icons, raw element labels and skips empty labels', () => {
    render(
      <Tabs
        items={[
          { id: 'a', icon: <i data-testid="icon" />, label: <b data-testid="raw">A</b> },
          { id: 'b', label: '' },
        ]}
      />,
    );
    const [first, second] = screen.getAllByRole('tab') as [HTMLElement, HTMLElement];

    expect(screen.getByTestId('icon').parentElement).toBe(first);
    expect(screen.getByTestId('raw').parentElement).toBe(first);
    expect(second.querySelector('span')).toBeNull();
  });

  it('wraps fragment and numeric labels in the styled text element', () => {
    render(
      <Tabs
        items={[
          { id: 'a', label: <>um</> },
          { id: 'b', label: 7 },
        ]}
      />,
    );

    expect(screen.getByText('um').style.fontSize).toBe('14px');
    expect(screen.getByText('7').style.fontSize).toBe('14px');
  });

  it('keeps every tab at least one control tall', () => {
    render(<Tabs items={ITEMS} />);

    expect(screen.getByRole('tab', { name: 'Visão geral' }).style.minHeight).toBe(
      'var(--control-h)',
    );
  });

  it('colours the tab root so icons and element labels inherit it', () => {
    render(
      <Tabs
        items={[
          { id: 'a', icon: <i data-testid="icon" />, label: <strong data-testid="raw">A</strong> },
          { id: 'b', label: 'B' },
        ]}
        current="a"
      />,
    );
    const [active, inactive] = screen.getAllByRole('tab') as [HTMLElement, HTMLElement];

    expect(active.style.color).toBe('var(--color-text)');
    expect(inactive.style.color).toBe('var(--color-neutral-400)');
  });

  it('keeps segments from shrinking and labels from wrapping so the list scrolls', () => {
    render(<Tabs items={ITEMS} />);
    const tab = screen.getByRole('tab', { name: 'Visão geral' });

    expect(tab.style.flexShrink).toBe('0');
    expect(tab.style.whiteSpace).toBe('nowrap');
  });
});
