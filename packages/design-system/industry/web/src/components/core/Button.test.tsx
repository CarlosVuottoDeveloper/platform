import { fireEvent, render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders its children as a button', () => {
    render(<Button>Salvar</Button>);

    expect(screen.getByRole('button', { name: 'Salvar' })).toHaveAttribute('type', 'button');
  });

  it('does not expose a pressed state unless selected is set', () => {
    render(<Button>Admin</Button>);

    expect(screen.getByRole('button')).not.toHaveAttribute('aria-pressed');
  });

  it('exposes the selected state to assistive tech', () => {
    render(<Button selected>Admin</Button>);

    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
  });

  it('highlights the border and fill when selected', () => {
    render(<Button selected>Admin</Button>);

    expect(screen.getByRole('button')).toHaveStyle({
      borderColor: 'var(--color-accent-400)',
      background: 'color-mix(in srgb, var(--color-accent) 16%, transparent)',
      color: 'var(--color-text)',
    });
  });

  it('wins over the variant skin when selected', () => {
    render(
      <Button variant="primary" selected>
        Admin
      </Button>,
    );

    expect(screen.getByRole('button')).toHaveStyle({
      borderColor: 'var(--color-accent-400)',
      color: 'var(--color-text)',
    });
  });

  it('gives the selected skin its own pressed fill', () => {
    render(<Button selected>Admin</Button>);
    const button = screen.getByRole('button');

    fireEvent.mouseDown(button);

    expect(button).toHaveStyle({
      background: 'color-mix(in srgb, var(--color-accent) 28%, transparent)',
    });
  });
});
