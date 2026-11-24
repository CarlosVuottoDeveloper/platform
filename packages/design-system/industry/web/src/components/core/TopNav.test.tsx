import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { TopNav } from './TopNav';

const LINKS = [
  { label: 'Projetos', href: '#projetos' },
  { label: 'Sobre', href: '#sobre' },
];

describe('TopNav', () => {
  it('is the main navigation with the brand, a link per item and the action', () => {
    render(
      <TopNav brand="Carlos Vuotto" links={LINKS} action={<button type="button">Ação</button>} />,
    );
    const nav = screen.getByRole('navigation', { name: 'Principal' });

    expect(within(nav).getByText('Carlos Vuotto')).toBeInTheDocument();
    expect(within(nav).getByRole('link', { name: 'Projetos' })).toHaveAttribute(
      'href',
      '#projetos',
    );
    expect(within(nav).getByRole('link', { name: 'Sobre' })).toHaveAttribute('href', '#sobre');
    expect(within(nav).getByRole('button', { name: 'Ação' })).toBeInTheDocument();
  });

  function renderCollapsed() {
    render(
      <TopNav
        brand="Carlos Vuotto"
        links={LINKS}
        action={<button type="button">Ação</button>}
        collapsed
      />,
    );
    return screen.getByRole('button', { name: 'Abrir menu' });
  }

  it('hides the links behind a closed menu button when collapsed', () => {
    const toggle = renderCollapsed();

    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(toggle).not.toHaveAttribute('aria-controls');
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByText('Carlos Vuotto')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ação' })).toBeInTheDocument();
  });

  it('opens the links in a panel the menu button controls', () => {
    const toggle = renderCollapsed();
    fireEvent.click(toggle);

    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(toggle).toHaveAccessibleName('Fechar menu');
    const panel = document.getElementById(toggle.getAttribute('aria-controls') ?? '');
    expect(panel).not.toBeNull();
    expect(within(panel as HTMLElement).getByRole('link', { name: 'Projetos' })).toHaveAttribute(
      'href',
      '#projetos',
    );
    expect(within(panel as HTMLElement).getByRole('link', { name: 'Sobre' }).style.minHeight).toBe(
      'var(--tap)',
    );
  });

  it('gives the menu button a full touch target', () => {
    const toggle = renderCollapsed();

    expect(toggle.style.width).toBe('var(--tap)');
    expect(toggle.style.minHeight).toBe('var(--tap)');
  });

  it('tightens its spacing and lets a long brand shrink so the menu button always fits', () => {
    renderCollapsed();
    const nav = screen.getByRole('navigation');
    const brand = screen.getByText('Carlos Vuotto');

    expect(nav.style.gap).toBe('var(--space-2)');
    expect(nav.style.padding).toBe('var(--space-2) var(--space-2) var(--space-2) var(--space-4)');
    expect(brand.style.minWidth).toBe('0');
    expect(brand.style.overflow).toBe('hidden');
    expect(brand.style.textOverflow).toBe('ellipsis');
  });

  it('closes the panel when the menu button is pressed again', () => {
    const toggle = renderCollapsed();
    fireEvent.click(toggle);
    fireEvent.click(toggle);

    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('closes the panel once a section is chosen', () => {
    const toggle = renderCollapsed();
    fireEvent.click(toggle);
    fireEvent.click(screen.getByRole('link', { name: 'Sobre' }));

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes the panel on Escape and returns focus to the menu button', () => {
    const toggle = renderCollapsed();
    fireEvent.click(toggle);
    screen.getByRole('link', { name: 'Projetos' }).focus();
    fireEvent.keyDown(document, { key: 'Escape' });

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(toggle).toHaveFocus();
  });

  it('leaves focus where it is when Escape is pressed outside the navigation', () => {
    render(
      <>
        <TopNav brand="Carlos Vuotto" links={LINKS} collapsed />
        <button type="button">Fora</button>
      </>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Abrir menu' }));
    const outside = screen.getByRole('button', { name: 'Fora' });
    outside.focus();
    fireEvent.keyDown(document, { key: 'Escape' });

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(outside).toHaveFocus();
  });

  it('leaves the panel alone when another widget already handled Escape', () => {
    renderCollapsed();
    fireEvent.click(screen.getByRole('button', { name: 'Abrir menu' }));
    const escape = new KeyboardEvent('keydown', { key: 'Escape', cancelable: true });
    escape.preventDefault();
    act(() => {
      document.dispatchEvent(escape);
    });

    expect(screen.getAllByRole('link')).toHaveLength(2);
  });

  it('ignores other keys while the panel is open', () => {
    const toggle = renderCollapsed();
    fireEvent.click(toggle);
    fireEvent.keyDown(document, { key: 'Tab' });

    expect(screen.getAllByRole('link')).toHaveLength(2);
  });

  it('closes the panel when someone presses outside the navigation', () => {
    const toggle = renderCollapsed();
    fireEvent.click(toggle);
    fireEvent.pointerDown(screen.getByRole('navigation'));
    expect(screen.getAllByRole('link')).toHaveLength(2);

    fireEvent.pointerDown(document.body);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('drops the open panel when the navigation widens again', () => {
    const { rerender } = render(<TopNav brand="Carlos Vuotto" links={LINKS} collapsed />);
    fireEvent.click(screen.getByRole('button', { name: 'Abrir menu' }));
    rerender(<TopNav brand="Carlos Vuotto" links={LINKS} />);

    expect(screen.queryByRole('button', { name: /menu/ })).not.toBeInTheDocument();
    expect(screen.getAllByRole('link')).toHaveLength(2);

    rerender(<TopNav brand="Carlos Vuotto" links={LINKS} collapsed />);
    expect(screen.getByRole('button', { name: 'Abrir menu' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('is a translucent pill that sticks to the top while scrolling', () => {
    render(<TopNav brand="Carlos Vuotto" links={LINKS} />);
    const nav = screen.getByRole('navigation');

    expect(nav.style.borderRadius).toBe('var(--radius-pill)');
    expect(nav.style.position).toBe('sticky');
    expect(nav.style.top).toBe('var(--space-4)');
    expect(nav.style.backdropFilter).not.toBe('');
  });

  it('gives each link a touch target of at least the small control height', () => {
    render(<TopNav brand="Carlos Vuotto" links={LINKS} />);

    expect(screen.getByRole('link', { name: 'Projetos' }).style.minHeight).toBe(
      'var(--control-h-sm)',
    );
  });
});
