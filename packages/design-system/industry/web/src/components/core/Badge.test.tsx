import { render, screen } from '@testing-library/react';
import { Badge } from './Badge';

describe('Badge', () => {
  it('is a pill', () => {
    render(<Badge data-testid="badge">Publicado</Badge>);

    expect(screen.getByTestId('badge')).toHaveStyle({ borderRadius: 'var(--radius-pill)' });
  });

  it('keeps the label as typed, without capitalising or tracking it', () => {
    render(<Badge data-testid="badge">Publicado</Badge>);

    const badge = screen.getByTestId('badge');
    expect(badge.style.textTransform).toBe('');
    expect(badge.style.letterSpacing).toBe('');
    expect(badge).toHaveTextContent('Publicado');
  });

  it('sizes the label with the h6 token', () => {
    render(<Badge data-testid="badge">Publicado</Badge>);

    expect(screen.getByTestId('badge')).toHaveStyle({ fontSize: 'var(--text-h6)' });
  });

  it('marks the status with a round dot in the tone colour', () => {
    render(<Badge data-testid="badge">Publicado</Badge>);

    const dot = screen.getByTestId('badge').firstElementChild as HTMLElement;
    expect(dot).toHaveAttribute('aria-hidden', 'true');
    expect(dot.style.borderRadius).toBe('var(--radius-pill)');
    expect(dot.style.background).toBe('currentcolor');
  });

  it('renders non-string children as-is', () => {
    render(
      <Badge>
        <em>Custom</em>
      </Badge>,
    );

    expect(screen.getByText('Custom')).toBeInTheDocument();
  });

  it('is outlined in the tone colour and filled with surface-2 by default', () => {
    render(
      <Badge tone="success" data-testid="badge">
        Publicado
      </Badge>,
    );

    const badge = screen.getByTestId('badge');
    expect(badge.style.background).toBe('var(--color-surface-2)');
    expect(badge).toHaveStyle({ color: 'var(--color-success-300)' });
    expect(badge.style.border).toBe('1px solid var(--color-success-300)');
  });

  it.each([
    ['neutral', 'var(--color-neutral-300)'],
    ['accent', 'var(--color-accent)'],
    ['success', 'var(--color-success-300)'],
    ['warning', 'var(--color-warning-300)'],
    ['danger', 'var(--color-danger-300)'],
  ] as const)('colours the %s tone from its ramp', (tone, tint) => {
    render(
      <Badge tone={tone} data-testid="badge">
        x
      </Badge>,
    );

    expect(screen.getByTestId('badge')).toHaveStyle({ color: tint });
  });

  it('fills the background with the tone colour when solid is set', () => {
    render(
      <Badge tone="success" solid data-testid="badge">
        Publicado
      </Badge>,
    );

    const badge = screen.getByTestId('badge');
    expect(badge.style.background).toBe('var(--color-success)');
    expect(badge).toHaveStyle({ color: 'var(--color-bg)' });
    expect(badge.style.border).toBe('1px solid transparent');
  });

  it('fills accent solid badges with the accent colour', () => {
    render(
      <Badge tone="accent" solid data-testid="badge">
        Destaque
      </Badge>,
    );

    expect(screen.getByTestId('badge').style.background).toBe('var(--color-accent)');
  });

  it('lets the consumer style override the badge', () => {
    render(
      <Badge data-testid="badge" style={{ marginLeft: 8 }}>
        x
      </Badge>,
    );

    expect(screen.getByTestId('badge')).toHaveStyle({ marginLeft: '8px' });
  });
});
