import { render } from '@testing-library/react';
import { PRIMARY_ACTION_FILL, PrimaryActionSurface } from './PrimaryActionSurface';

const renderSurface = (props: Partial<Parameters<typeof PrimaryActionSurface>[0]> = {}) => {
  const { container } = render(
    <PrimaryActionSurface pressed={false} disabled={false} {...props} />,
  );
  return container.firstElementChild as HTMLElement;
};

describe('PrimaryActionSurface', () => {
  it('fills the pill with the primary gradient and the accent glow', () => {
    expect(renderSurface()).toHaveStyle({
      backgroundImage: 'var(--gradient-primary)',
      borderRadius: 'var(--radius-pill)',
      boxShadow: 'var(--glow-accent)',
      opacity: '1',
    });
  });

  it('drops the glow when asked to, even when enabled', () => {
    expect(renderSurface({ glow: false }).style.boxShadow).toBe('');
  });

  it('dims while pressed', () => {
    expect(renderSurface({ pressed: true })).toHaveStyle({ opacity: '0.85' });
  });

  it('dims slightly while hovered, less than while pressed', () => {
    expect(renderSurface({ hovered: true })).toHaveStyle({ opacity: '0.92' });
    expect(renderSurface({ hovered: true, pressed: true })).toHaveStyle({ opacity: '0.85' });
  });

  it('drops the glow and ignores stale pressed and hovered flags when disabled', () => {
    const surface = renderSurface({ pressed: true, hovered: true, disabled: true });

    expect(surface.style.boxShadow).toBe('');
    expect(surface).toHaveStyle({ opacity: '1' });
  });

  it('is hidden from assistive tech and from pointer events', () => {
    expect(renderSurface()).toHaveAttribute('aria-hidden', 'true');
    expect(renderSurface()).toHaveStyle({ pointerEvents: 'none' });
  });

  it('exposes the darker gradient stop as the opaque base fill', () => {
    expect(PRIMARY_ACTION_FILL).toBe('var(--color-accent-800)');
  });
});
