import { render, screen } from '@testing-library/react';
import { GradientSurface } from './GradientSurface';

describe('GradientSurface', () => {
  it('clips its content to the default large radius', () => {
    render(<GradientSurface data-testid="s">x</GradientSurface>);

    expect(screen.getByTestId('s')).toHaveStyle({
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
    });
  });

  it('renders its children', () => {
    render(<GradientSurface>conteúdo</GradientSurface>);

    expect(screen.getByText('conteúdo')).toBeInTheDocument();
  });

  it.each(['primary', 'surface', 'backdrop'] as const)(
    'draws the %s gradient from the token',
    (variant) => {
      render(<GradientSurface data-testid="s" variant={variant} />);

      expect(screen.getByTestId('s')).toHaveStyle({ background: `var(--gradient-${variant})` });
    },
  );

  it('defaults to the surface gradient', () => {
    render(<GradientSurface data-testid="s" />);

    expect(screen.getByTestId('s')).toHaveStyle({ background: 'var(--gradient-surface)' });
  });

  it('accepts a numeric radius in pixels', () => {
    render(<GradientSurface data-testid="s" radius={12} />);

    expect(screen.getByTestId('s')).toHaveStyle({ borderRadius: '12px' });
  });

  it('adds the accent glow only when asked', () => {
    render(<GradientSurface data-testid="s" />);

    expect(screen.getByTestId('s').style.boxShadow).toBe('');
  });

  it('draws the glow on the same clipped element', () => {
    render(<GradientSurface data-testid="s" glow />);

    expect(screen.getByTestId('s')).toHaveStyle({
      boxShadow: 'var(--glow-accent)',
      overflow: 'hidden',
    });
  });

  it('lets consumer style override and extend the surface', () => {
    render(<GradientSurface data-testid="s" glow style={{ width: 120, borderRadius: 4 }} />);

    expect(screen.getByTestId('s')).toHaveStyle({ width: '120px', borderRadius: '4px' });
  });

  it('forwards className and the remaining div props', () => {
    render(<GradientSurface data-testid="s" className="extra" aria-label="superfície" />);

    const surface = screen.getByTestId('s');
    expect(surface).toHaveClass('extra');
    expect(surface).toHaveAttribute('aria-label', 'superfície');
  });
});
