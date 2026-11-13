import { render, screen } from '@testing-library/react';
import { Duotone } from './Duotone';

describe('Duotone', () => {
  it('renders its children under an accent overlay', () => {
    const { container } = render(
      <Duotone>
        <img alt="foto" src="x.png" />
      </Duotone>,
    );
    const overlay = container.querySelector('[aria-hidden="true"]') as HTMLElement;

    expect(screen.getByAltText('foto')).toBeInTheDocument();
    expect(overlay.style.background).toBe('var(--color-accent)');
    expect(overlay.style.mixBlendMode).toBe('color');
  });

  it('rounds the frame with the large radius', () => {
    const { container } = render(<Duotone className="hero" />);
    const frame = container.firstChild as HTMLElement;

    expect(frame).toHaveClass('hero');
    expect(frame.style.borderRadius).toBe('var(--radius-lg)');
  });

  it('lets the caller override the frame style', () => {
    const { container } = render(<Duotone style={{ borderRadius: 4 }} />);

    expect((container.firstChild as HTMLElement).style.borderRadius).toBe('4px');
  });
});
