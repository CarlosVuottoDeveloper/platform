import { render, screen } from '@testing-library/react';
import { PhotoFrame } from './PhotoFrame';

describe('PhotoFrame', () => {
  it('shows the photo with its description', () => {
    render(<PhotoFrame src="/carlos.png" alt="Carlos Vuotto de braços cruzados" size={320} />);

    expect(screen.getByRole('img', { name: 'Carlos Vuotto de braços cruzados' })).toHaveAttribute(
      'src',
      '/carlos.png',
    );
    expect(screen.queryByText('CV')).not.toBeInTheDocument();
  });

  it('shows a decorative monogram instead of a broken image when there is no photo', () => {
    render(<PhotoFrame src="" alt="Carlos Vuotto" size={320} />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByText('CV')).toHaveAttribute('aria-hidden', 'true');
  });

  it.each(['/carlos.png', ''])('sits on a round blue glow (photo: %p)', (src) => {
    render(<PhotoFrame src={src} alt="Carlos Vuotto" size={320} />);
    const glow = screen.getByTestId('photo-glow');

    expect(glow.style.borderRadius).toBe('50%');
    expect(glow.style.background).toContain('radial-gradient');
    expect(glow.style.background).toContain('var(--color-accent-500)');
  });

  it('keeps the frame at the given size but never wider than its column', () => {
    render(<PhotoFrame src="/carlos.png" alt="Carlos Vuotto" size={320} />);
    const frame = screen.getByTestId('photo-frame');

    expect(frame.style.width).toBe('320px');
    expect(frame.style.maxWidth).toBe('100%');
    expect(frame.style.aspectRatio).toBe('1 / 1');
  });
});
