import { render, screen } from '@testing-library/react';
import { Card } from './Card';

describe('Card', () => {
  it('renders kicker, title, body and meta', () => {
    render(<Card kicker="Projeto" title="Título" body="Corpo do card" meta="há 2h" />);

    expect(screen.getByText('Projeto')).toBeInTheDocument();
    expect(screen.getByText('Título')).toBeInTheDocument();
    expect(screen.getByText('Corpo do card')).toBeInTheDocument();
    expect(screen.getByText('há 2h')).toBeInTheDocument();
  });

  it('renders children alongside the structured slots', () => {
    render(
      <Card title="Título">
        <span>Conteúdo extra</span>
      </Card>,
    );

    expect(screen.getByText('Conteúdo extra')).toBeInTheDocument();
  });

  it('omits optional slots that are not provided', () => {
    render(<Card title="Só título" />);

    expect(screen.getByText('Só título')).toBeInTheDocument();
  });

  it('is a large rounded gradient surface with a soft border', () => {
    render(<Card title="Título" data-testid="card" />);

    expect(screen.getByTestId('card')).toHaveStyle({
      background: 'var(--gradient-surface) border-box no-repeat',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--color-divider)',
    });
  });

  it('keeps the kicker in sentence case without tracking', () => {
    render(<Card kicker="Projeto" />);

    const kicker = screen.getByText('Projeto');
    expect(kicker.style.textTransform).toBe('');
    expect(kicker.style.letterSpacing).toBe('');
  });

  it('applies the elevation shadow when given', () => {
    render(<Card title="Título" elevation="md" data-testid="card" />);

    expect(screen.getByTestId('card')).toHaveStyle({ boxShadow: 'var(--shadow-md)' });
  });

  it('lets consumer style override the surface', () => {
    render(<Card title="Título" data-testid="card" style={{ width: 320 }} />);

    expect(screen.getByTestId('card')).toHaveStyle({ width: '320px' });
  });

  it('colors the title accent 300', () => {
    render(<Card title="Título" />);

    expect(screen.getByText('Título').style.color).toBe('var(--color-accent-300)');
  });

  it('puts the action on the title row, pushed to the end', () => {
    render(<Card title="Últimas" action={<a href="/todas">Ver todas</a>} />);

    const row = screen.getByText('Últimas').parentElement;
    expect(row).toContainElement(screen.getByRole('link', { name: 'Ver todas' }));
    expect(row?.style.display).toBe('flex');
    expect(row?.style.justifyContent).toBe('space-between');
  });

  it('shows the action even without a title', () => {
    render(<Card action={<button type="button">Ação</button>} />);

    expect(screen.getByRole('button', { name: 'Ação' })).toBeInTheDocument();
  });

  it('pushes a lone action to the end of the row', () => {
    render(<Card action={<button type="button">Ação</button>} />);

    expect(screen.getByRole('button', { name: 'Ação' }).parentElement?.style.marginLeft).toBe(
      'auto',
    );
  });

  it('keeps the title as a direct child of the card without an action', () => {
    render(<Card title="Título" data-testid="card" />);

    expect(screen.getByText('Título').parentElement).toBe(screen.getByTestId('card'));
  });
});
