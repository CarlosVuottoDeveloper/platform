import { fireEvent, render, screen } from '@testing-library/react';
import { Sheet } from './Sheet';

describe('Sheet', () => {
  it('renders nothing when closed', () => {
    const { container } = render(<Sheet open={false}>Conteúdo</Sheet>);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders the title, children and actions when open', () => {
    render(
      <Sheet title="Título" actions={<button type="button">Ação</button>}>
        <p>Conteúdo</p>
      </Sheet>,
    );

    expect(screen.getByText('Título')).toBeInTheDocument();
    expect(screen.getByText('Conteúdo')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ação' })).toBeInTheDocument();
  });

  it('is an accessible dialog', () => {
    render(<Sheet title="Título">Conteúdo</Sheet>);

    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
  });

  it('calls onDismiss when the backdrop is clicked', () => {
    const onDismiss = jest.fn();
    render(
      <Sheet title="Título" onDismiss={onDismiss}>
        Conteúdo
      </Sheet>,
    );

    fireEvent.click(screen.getByRole('dialog').parentElement as HTMLElement);

    expect(onDismiss).toHaveBeenCalled();
  });

  it('does not call onDismiss when the sheet body is clicked', () => {
    const onDismiss = jest.fn();
    render(
      <Sheet title="Título" onDismiss={onDismiss}>
        Conteúdo
      </Sheet>,
    );

    fireEvent.click(screen.getByRole('dialog'));

    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('rounds only its top corners on a gradient surface with a soft border', () => {
    render(<Sheet title="Título">Conteúdo</Sheet>);

    expect(screen.getByRole('dialog')).toHaveStyle({
      background: 'var(--gradient-surface) border-box no-repeat',
      borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
      border: '1px solid var(--color-divider)',
    });
  });

  it('sizes the title with the h4 token', () => {
    render(<Sheet title="Título">Conteúdo</Sheet>);

    expect(screen.getByText('Título')).toHaveStyle({ fontSize: 'var(--text-h4)' });
  });

  it('applies the consumer style to the dialog', () => {
    render(
      <Sheet title="Título" style={{ maxWidth: 480 }}>
        Conteúdo
      </Sheet>,
    );

    expect(screen.getByRole('dialog')).toHaveStyle({ maxWidth: '480px' });
  });
});
