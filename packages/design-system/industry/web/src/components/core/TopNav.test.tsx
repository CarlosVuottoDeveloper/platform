import { render, screen, within } from '@testing-library/react';
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

  it('keeps only the brand and the action when collapsed', () => {
    render(
      <TopNav
        brand="Carlos Vuotto"
        links={LINKS}
        action={<button type="button">Ação</button>}
        collapsed
      />,
    );

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
    expect(screen.getByText('Carlos Vuotto')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ação' })).toBeInTheDocument();
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
