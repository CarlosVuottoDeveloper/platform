import { fireEvent, render, screen } from '@testing-library/react';
import { Toast } from './Toast';

describe('Toast', () => {
  it('renders the title and body', () => {
    render(<Toast title="Salvo">Detalhes da ação.</Toast>);

    expect(screen.getByText('Salvo')).toBeInTheDocument();
    expect(screen.getByText('Detalhes da ação.')).toBeInTheDocument();
  });

  it('is an accessible status region', () => {
    render(<Toast title="Salvo" />);

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('omits the dismiss button when onDismiss is not given', () => {
    render(<Toast title="Salvo" />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('calls onDismiss when the dismiss button is clicked', async () => {
    const onDismiss = jest.fn();
    render(<Toast title="Salvo" onDismiss={onDismiss} />);

    fireEvent.click(await screen.findByRole('button', { name: 'Dispensar' }));

    expect(onDismiss).toHaveBeenCalled();
  });

  it('is a rounded surface-2 card with a uniform divider border', () => {
    render(<Toast title="Salvo" />);

    const toast = screen.getByRole('status');
    expect(toast).toHaveStyle({
      background: 'var(--color-surface-2)',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-md)',
      border: '1px solid var(--color-divider)',
      overflow: 'hidden',
      position: 'relative',
    });
    expect(toast.style.borderLeft).toBe('');
  });

  it.each([
    ['accent', 'var(--color-accent)'],
    ['success', 'var(--color-success)'],
    ['warning', 'var(--color-warning)'],
    ['danger', 'var(--color-danger)'],
  ] as const)('draws the %s tone as an inner bar and colours the title with it', (tone, tint) => {
    render(<Toast tone={tone} title="Salvo" />);

    const bar = screen.getByRole('status').firstElementChild as HTMLElement;
    expect(bar).toHaveStyle({ position: 'absolute', left: '0px', width: '3px', background: tint });
    expect(bar).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByText('Salvo')).toHaveStyle({ color: tint });
  });

  it('keeps the body neutral and only tints the title', () => {
    render(
      <Toast tone="danger" title="Erro">
        Detalhes
      </Toast>,
    );

    expect(screen.getByText('Detalhes')).toHaveStyle({ color: 'var(--color-neutral-300)' });
    expect(screen.getByText('Erro')).toHaveStyle({ color: 'var(--color-danger)' });
  });

  it('keeps the dismiss focus ring inside the clipped toast', () => {
    render(<Toast title="Salvo" onDismiss={() => {}} />);

    expect(screen.getByRole('button', { name: 'Dispensar' }).style.outlineOffset).toBe('-2px');
  });
});
