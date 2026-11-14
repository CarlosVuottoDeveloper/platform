import { render, screen } from '@testing-library/react';
import { IconBubble } from './IconBubble';

describe('IconBubble', () => {
  it('draws the icon inside an accent 800 pill tinted accent 300', () => {
    render(
      <IconBubble testID="bubble">
        <span>icone</span>
      </IconBubble>,
    );
    const bubble = screen.getByTestId('bubble');

    expect(bubble).toContainElement(screen.getByText('icone'));
    expect(bubble.style.borderRadius).toBe('var(--radius-pill)');
    expect(bubble.style.background).toBe('var(--color-accent-800)');
    expect(bubble.style.color).toBe('var(--color-accent-300)');
  });

  it.each([
    ['md', 'var(--control-h-sm)'],
    ['sm', '32px'],
  ] as const)('sizes the %s bubble at %s', (size, length) => {
    render(
      <IconBubble size={size} testID="bubble">
        <span />
      </IconBubble>,
    );
    const bubble = screen.getByTestId('bubble');

    expect(bubble.style.width).toBe(length);
    expect(bubble.style.height).toBe(length);
  });

  it('defaults to the md size', () => {
    render(
      <IconBubble testID="bubble">
        <span />
      </IconBubble>,
    );

    expect(screen.getByTestId('bubble').style.width).toBe('var(--control-h-sm)');
  });

  it('lets the consumer style override the defaults', () => {
    render(
      <IconBubble testID="bubble" style={{ color: 'var(--color-success-300)' }}>
        <span />
      </IconBubble>,
    );

    expect(screen.getByTestId('bubble').style.color).toBe('var(--color-success-300)');
  });

  it('hides the decorative circle from assistive technology', () => {
    render(
      <IconBubble testID="bubble">
        <span />
      </IconBubble>,
    );

    expect(screen.getByTestId('bubble')).toHaveAttribute('aria-hidden', 'true');
  });
});
