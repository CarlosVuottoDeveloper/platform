import { render, screen } from '@testing-library/react';
import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  it('renders title, body, icon and action', () => {
    render(
      <EmptyState
        icon={<span>icon</span>}
        title="Nenhum projeto"
        body="Crie o primeiro projeto."
        action={<button type="button">Criar</button>}
      />,
    );

    expect(screen.getByText('icon')).toBeInTheDocument();
    expect(screen.getByText('Nenhum projeto')).toBeInTheDocument();
    expect(screen.getByText('Crie o primeiro projeto.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Criar' })).toBeInTheDocument();
  });

  it('omits optional slots that are not provided', () => {
    render(<EmptyState title="Só título" />);

    expect(screen.getByText('Só título')).toBeInTheDocument();
  });

  it('draws a large-radius dashed frame', () => {
    const { container } = render(<EmptyState title="Vazio" />);
    const frame = container.firstChild as HTMLElement;

    expect(frame.style.borderRadius).toBe('var(--radius-lg)');
    expect(frame.style.borderStyle).toBe('dashed');
    expect(frame.style.borderColor).toBe('var(--color-divider-strong)');
  });

  it('sets the title at the h4 size and the body quietly', () => {
    render(<EmptyState title="Vazio" body="Sem itens" />);

    expect(screen.getByText('Vazio').style.fontSize).toBe('var(--text-h4)');
    expect(screen.getByText('Sem itens').style.color).toBe('var(--color-neutral-400)');
    expect(screen.getByText('Sem itens').style.fontSize).toBe('var(--text-h6)');
  });
});
