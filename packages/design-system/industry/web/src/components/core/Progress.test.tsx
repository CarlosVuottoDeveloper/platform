import { render, screen } from '@testing-library/react';
import { Progress, Spinner } from './Progress';

describe('Progress', () => {
  it('exposes the current value via progressbar attributes', () => {
    render(<Progress value={40} max={80} />);

    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '40');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '80');
  });

  it('renders the rounded percentage by default', () => {
    render(<Progress value={33} max={100} />);

    expect(screen.getByText('33%')).toBeInTheDocument();
  });

  it('hides the percentage when showValue is false', () => {
    render(<Progress value={33} showValue={false} />);

    expect(screen.queryByText('33%')).not.toBeInTheDocument();
  });

  it('renders the label', () => {
    render(<Progress value={10} label="Enviando" />);

    expect(screen.getByText('Enviando')).toBeInTheDocument();
  });

  it('clamps the value between 0 and 100 percent', () => {
    render(<Progress value={999} max={100} />);

    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('draws a pill track on surface-2 filled with the primary gradient', () => {
    render(<Progress value={25} />);
    const track = screen.getByRole('progressbar');
    const fill = track.firstElementChild as HTMLElement;

    expect(track.style.background).toBe('var(--color-surface-2)');
    expect(track.style.borderRadius).toBe('var(--radius-pill)');
    expect(fill.style.background).toBe('var(--gradient-primary)');
    expect(fill.style.borderRadius).toBe('var(--radius-pill)');
    expect(fill.style.width).toBe('25%');
  });

  it('colours the label row neutral', () => {
    render(<Progress value={10} label="Enviando" />);

    expect((screen.getByText('Enviando').parentElement as HTMLElement).style.color).toBe(
      'var(--color-neutral-400)',
    );
  });
});

describe('Spinner', () => {
  it('renders as an accessible status indicator', () => {
    render(<Spinner />);

    expect(screen.getByRole('status', { name: 'Carregando' })).toBeInTheDocument();
  });
});
